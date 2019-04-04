package com.mooe.grad.migrate;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import com.mooe.grad.vo.HostMigrateInVo;
import com.mooe.grad.vo.VmMigrateVo;
import org.libvirt.Connect;
import org.libvirt.Domain;
import org.libvirt.LibvirtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;
import java.util.*;

@Configuration
@Component // 此注解必加
@EnableScheduling // 此注解必加
public class MigrateTask {
    @Autowired
    private ExperimentDao experimentDao;

    @Autowired
    private RedisService redisService;

    @Autowired
    private QemuConnection qemuConnection;
    //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
//    private RemoteShellExeUtil remoteShellExecutorSlave =
//            new RemoteShellExeUtil(ServerInfoUtil.VmServerIp38, ServerInfoUtil.VmServerUserName,
//                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    private RemoteShellExeUtil remoteShellExecutorMaster =
            new RemoteShellExeUtil(ServerInfoUtil.fileServerIp, ServerInfoUtil.VmServerUserName,
                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    private static final Logger LOGGER = LoggerFactory.getLogger(MigrateTask.class);

    private Map<VmMigrateVo, HostMigrateInVo> vmTohost; //虚拟机与主机的映射方案
    private List<VmMigrateVo> sourceVMList;//待迁移虚拟机列表
    private List<HostMigrateInVo> hostList;//主机列表
    private String sourceHostIpAddr;

    public void migrationTask() throws Exception {
        System.setProperty("jna.library.path","C:\\Program Files (x86)\\Libvirt\\bin");
        String[] loadStr = collectMonitorData();
        String ser_ip_current = "";
        boolean isMigrate = false;
        //判断是否有空值
        for(int i = 0; i < loadStr.length; i++){
            while(loadStr[i].equals("") || loadStr[i].split(":")[1].split(" ")[1].equals("-nan")){
                loadStr = collectMonitorData();
            }
        }
        for(int i = 0; i < loadStr.length; i++){
            System.out.println(loadStr[i]);
            //判断是否需要进行迁移
            isMigrate = determineMigrateTime(loadStr[i]);
            if(isMigrate == true){
                //获取待迁虚拟机列表 sourceVMList
                genMigrVmList();
                //获取主机列表 hostList
                getHostList();
                if(sourceVMList.size() > 0){
                    //确定目标服务器,得到主机虚拟机映射方案
                    selectSer();
                    Iterator<Map.Entry<VmMigrateVo, HostMigrateInVo>> entries = vmTohost.entrySet().iterator();
                    //开始迁移，目前进行逐个循环迁移
                    while (entries.hasNext()){
                        Map.Entry<VmMigrateVo, HostMigrateInVo> entry = entries.next();
                        HostMigrateInVo host=entry.getValue();
                        VmMigrateVo vm=entry.getKey();
                        Connect destConn = qemuConnection.getConn(host.getIpaddr());
                        //直接用1代替MIGRATE_FLAG_LIVE了
                        System.out.println("###############################################################");
                        System.out.println(vm.getDomain().getName());
                        System.out.println("###############################################################");
                        Domain targetVm = vm.getDomain().migrate(destConn, 1|2|4|512,null, null, 0);
                        //更新此实验机token内容
                        if(targetVm != null){
                            String tokenFileName = "/home/sheeta/kvm/token/" + vm.getDomain().getName();
                            String updateSer_cmd = "sed -i 's/"+ sourceHostIpAddr +"/"+ host.getIpaddr() +"/g' " + tokenFileName;
                            RemoteResult result = remoteShellExecutorMaster.exec(updateSer_cmd);
                            if(result.getRet() != -1){
                                String key = vm.getDomain().getName();
                                String sourseValue = redisService.get(ExpKey.existARunningVm, key, String.class);
                                String targetValue = sourseValue.replace(sourceHostIpAddr, host.getIpaddr());
                                redisService.set(ExpKey.existARunningVm, key,targetValue);
                            }
                        }
                        destConn.close();
                    }

                }
            }
        }
        System.out.println("这是38任务");
        vmTohost.clear();
    }
    //收集监控数据
    private String[] collectMonitorData() {
        String cmd_ser_mem = "sh /home/sheeta/kvm/migrate/rrd_file/get_all_load.sh";
        RemoteResult result = null;
        try {
            result = remoteShellExecutorMaster.exec(cmd_ser_mem);
            if(result.getRet() == -1){
                System.out.println(result.getOutErr());
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result.getOutStr().trim().split("/");
    }

    //迁移时机
    private boolean determineMigrateTime(String loadItem) {
        float ser_mem_top = experimentDao.getSerMemTop();
        float ser_cpu_top = experimentDao.getSerCpuTop();
        float ser_net_top = experimentDao.getSerNetTop();
        //解析获取到的监控数据
        float ser_mem_current = 0;
        float ser_cpu_current = 0;
        float ser_net_current = 0;
        //loadString：cpu_usage mem_usage net_usage
        String loadString = loadItem.split(":")[1];
        ser_cpu_current = Double.valueOf(loadString.split(" ")[1]).floatValue();
        ser_mem_current = Double.valueOf(loadString.split(" ")[2]).floatValue();
        ser_net_current = Double.valueOf(loadString.split(" ")[3]).floatValue();
        if(ser_mem_current >= ser_mem_top || ser_cpu_current >= ser_cpu_top){

        }
        return false;
    }

    //确定待迁虚拟机
    private void genMigrVmList() throws Exception {
        Domain selectedVM = null;
//        List<Domain> selectedVmList = new ArrayList<>();
        Connect conn = qemuConnection.getConn(ServerInfoUtil.VmServerIp38);
        try{
            int[] vmIdList =  conn.listDomains();
            int vmid = 0;
            selectedVM = conn.domainLookupByID(vmIdList[0]);
            for(int vmId : vmIdList){
                System.out.println(conn.domainLookupByID(vmId).getName());
                //??????????????????????????
                VmMigrateVo vm = new VmMigrateVo(vmid, conn.domainLookupByID(vmId));
                sourceVMList.add(vm);
                vmid++;
            }
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        }
    }

    //获取主机列表
    public void getHostList(){
        String targetNodeIp = null;
        String get_nodes_load_cmd = "sh /home/sheeta/kvm/migrate/java_call/get_nodes_load.sh";
        RemoteResult result = null;
        try {
            result = remoteShellExecutorMaster.exec(get_nodes_load_cmd);
            if(result.getRet() == -1){
                System.out.println(result.getOutErr());
                return;
            }
            //   返回值格式：172.26.2.38/8:1:0 172.26.2.39/8:1:0 172.26.2.40/10:3:0
            //这里内存和cpu反了
            String[] loads = result.getOutStr().trim().split(" ");
            //填充主机列表
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    //选择目标服务器
    private void selectSer() {
        //获取每台服务器剩余负载

        //粒子群算法获取迁移策略集（主机与虚拟机的Map）
        //?要确定资源计算模式？
        PSO pso = new PSO(100, 100, sourceVMList, hostList);
        pso.run();
        // 此时运行结束之后只是获得了一个放置方案，但是实际上虚拟机并没有部署到主机上，此时主机和虚拟机的一切状态仍是初始状态
        // 所以需要根据该方案部署虚拟机
        pso.showresult();
        vmTohost = pso.getSolution().getVmTohost();
        //VMPlacement.showMigrateProcess(vmTohost);
    }
//
//    private String calTargetIp(String[] loads) {
//        Map<PerformanceCharacter, String> loadsMap = new HashMap<>();
//        for(int i = 0; i < loads.length; i++){
//            //key = 38, value = <cpu_usage:mem_usage>
//            PerformanceCharacter pc = new PerformanceCharacter();
//            //格式剧举例：38/14:23 39/43:23 40/13:09
//            String value = loads[i].split("/")[0];
//            String[] load = loads[i].split("/")[1].split(":");
//            pc.setCpu_usage(Integer.valueOf(load[1]));
//            pc.setMem_usage(Integer.valueOf(load[0]));
//            loadsMap.put(pc, value);
//        }
//        //此处需要进行算法设计，目前先找内存使用率最低的服务器节点
//        List<Integer> memList = new ArrayList<>();
//        //临时存储mem与ip的对应关系，方便查找
//        Map<Integer, String> memMap = new HashMap<>();
//        for(Map.Entry entry : loadsMap.entrySet()){
//            PerformanceCharacter pc = (PerformanceCharacter)entry.getKey();
//            memMap.put(pc.getMem_usage(), (String)entry.getValue());
//            memList.add(pc.getMem_usage());
//        }
//        Object[] targetIp = memList.toArray();
//        Arrays.sort(targetIp);
//        return "172.26.2." + memMap.get(targetIp[0]);
//    }
}
