package com.mooe.grad.migrate;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.service.MonitorService;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import com.mooe.grad.domain.HostInfo;
import com.mooe.grad.domain.VmMigrate;
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

    @Autowired
    private MonitorService monitorService;
    //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
//    private RemoteShellExeUtil remoteShellExecutorSlave =
//            new RemoteShellExeUtil(ServerInfoUtil.VmServerIp38, ServerInfoUtil.VmServerUserName,
//                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    private RemoteShellExeUtil remoteShellExecutorMaster =
            new RemoteShellExeUtil(ServerInfoUtil.fileServerIp, ServerInfoUtil.VmServerUserName,
                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    private static final Logger LOGGER = LoggerFactory.getLogger(MigrateTask.class);

    private Map<VmMigrate, HostInfo> vmTohost; //虚拟机与主机的映射方案
    private List<VmMigrate> migrateVMList;//待迁移虚拟机列表
    private List<HostInfo> hostList;//主机列表
    private String sourceHostIpAddr;
    private double cpuNeedRelease, memNeedRelease,netNeedRelease;

    public void migrationTask() throws Exception {
        System.setProperty("jna.library.path","C:\\Program Files (x86)\\Libvirt\\bin");
//        String[] loadStrArray = monitorService.collectMonitorData();
//
//        migrateVMList = new ArrayList<>();
//        //判断是否有空值
//        for(int i = 0; i < loadStrArray.length; i++){
//            while(loadStrArray[i].equals("") || loadStrArray[i].split(":")[1].split(" ")[1].equals("-nan")){
//                loadStrArray = monitorService.collectMonitorData();
//            }
//        }
//        for(int i = 0; i < loadStrArray.length; i++){
//            System.out.println(loadStrArray[i]);
//            //判断当前主机是否需要进行实验迁移
//            sourceHostIpAddr = determineMigrateTime(loadStrArray[i]);
//            if(sourceHostIpAddr != null){
//                //生成主机列表 hostList
//                genHostList(loadStrArray);
//                //生成待迁虚拟机列表 migrateVMList
//                genMigrVmList();
//                if(hostList.size() > 0){
//                    //确定目标服务器,得到主机虚拟机映射方案
//                    selectSer();
//                    Iterator<Map.Entry<VmMigrate, HostInfo>> entries = vmTohost.entrySet().iterator();
//                    //开始迁移，目前进行逐个循环迁移
//                    while (entries.hasNext()){
//                        Map.Entry<VmMigrate, HostInfo> entry = entries.next();
//                        HostInfo host=entry.getValue();
//                        if (host.getIpaddr().equals(sourceHostIpAddr))continue;
//                        VmMigrate vm=entry.getKey();
//                        Connect destConn = qemuConnection.getConn(host.getIpaddr());
//                        //直接用1代替MIGRATE_FLAG_LIVE了
//                        System.out.println("###############################################################");
//                        System.out.println(vm.getDomain().getName());
//                        System.out.println("###############################################################");
////                        Domain targetVm = vm.getDomain().migrate(destConn, 1|2|4|512,null, null, 0);
////                        //更新此实验机token内容
////                        if(targetVm != null){
////                            String tokenFileName = "/home/sheeta/kvm/token/" + vm.getDomain().getName();
////                            String updateSer_cmd = "sed -i 's/"+ sourceHostIpAddr +"/"+ host.getIpaddr() +"/g' " + tokenFileName;
////                            RemoteResult result = remoteShellExecutorMaster.exec(updateSer_cmd);
////                            if(result.getRet() != -1){
////                                String key = vm.getDomain().getName();
////                                String sourseValue = redisService.get(ExpKey.existARunningVm, key, String.class);
////                                String targetValue = sourseValue.replace(sourceHostIpAddr, host.getIpaddr());
////                                redisService.set(ExpKey.existARunningVm, key,targetValue);
////                            }
////                        }
//                        destConn.close();
//                    }
//
//                }
//            }
//        }
//        System.out.println("这是38任务");
//        vmTohost.clear();
    }
    private void genHostList(String[] loadStrArray) {
        hostList = new ArrayList<>();
        for(int i = 0; i < loadStrArray.length; i++){
            HostInfo hostMigrateIn = monitorService.genHost(loadStrArray[i]);
            hostList.add(hostMigrateIn);
        }
    }

    //迁移时机
    //loadItem格式： 172.26.2.38：cpuUsage memUsage netUsage
    private String determineMigrateTime(String loadItem) {
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
        if(ser_mem_current > ser_mem_top || ser_cpu_current > ser_cpu_top || ser_net_current > ser_net_top){
            cpuNeedRelease = ser_cpu_current - ser_cpu_top;
            memNeedRelease = ser_mem_current - ser_mem_top;
            netNeedRelease = ser_net_current - ser_net_top;
            return loadItem.split(":")[0];
        }
        return null;
    }
    //确定待迁虚拟机
    private void genMigrVmList() throws Exception {
        int hostIndex = 0;
        int vmsMigrateIndex = 0;//记录根据评价值排序后的实验需要迁移到哪个位置
        Connect conn = qemuConnection.getConn(sourceHostIpAddr);
        //先生成所有虚拟机列表，再选出待迁虚拟机
        try{
            int[] vmIdList =  conn.listDomains();
            //selectedVM = conn.domainLookupByID(vmIdList[0]);
            /**
             * 先生成所有实验的对象列表，再从中选出待迁移的部分，然后赋id
             * 获取所有实验的负载值，计算是否在负载上限以内
             * 计算源物理机需要释放的资源
             * 计算实验的评价值，从大到小排序，每次选择评价值最大的实验加入待迁移列表
             * */
            for(int i = 0; i < hostList.size(); i++){
                if (hostList.get(i).getIpaddr().equals(sourceHostIpAddr)){
                    hostIndex = i;
                    break;
                }

            }
            for(int i = 0; i < vmIdList.length; i++){
                //String thisHostIp = conn.getURI().split("/")[2].split(":")[0];
                VmMigrate vm = monitorService.genVmMigrate(hostList.get(hostIndex),conn.domainLookupByID(vmIdList[i]));
                if(vm != null) migrateVMList.add(vm);
            }
            //给评价值排序
            Collections.sort(migrateVMList, new Comparator<VmMigrate>() {
                @Override
                public int compare(VmMigrate vm1, VmMigrate vm2) {
                    if(vm2.getMigrEfficiency() > vm1.getMigrEfficiency()) return 1;
                    else if(vm2.getMigrEfficiency() == vm1.getMigrEfficiency()) return 0;
                    else return -1;
                }
            });
            //计算需要释放的资源
            while ((cpuNeedRelease > 0 || memNeedRelease > 0 || netNeedRelease > 0) && vmsMigrateIndex < migrateVMList.size()){
                cpuNeedRelease -= migrateVMList.get(vmsMigrateIndex).getuVCPUofHost();
                memNeedRelease -= migrateVMList.get(vmsMigrateIndex).getuVMemofHost();
                netNeedRelease -= migrateVMList.get(vmsMigrateIndex).getuVNetofHost();
                vmsMigrateIndex++;
            }
            //删除掉不需要迁移的实验
            for(int i = vmsMigrateIndex; i < migrateVMList.size(); i++){
                migrateVMList.remove(i);
            }
            //为每个实验设定id，方便PSO计算
            for(int i = 0; i < migrateVMList.size(); i++){
                migrateVMList.get(i).setId(i);
            }
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        }
    }

    //选择目标服务器
    private void selectSer() {
        //获取每台服务器剩余负载
        //粒子群算法获取迁移策略集（主机与虚拟机的Map）
        //?要确定资源计算模式？
        PSO pso = new PSO(100, 100, migrateVMList, hostList);
        pso.run();
        // 此时运行结束之后只是获得了一个放置方案，但是实际上虚拟机并没有部署到主机上，此时主机和虚拟机的一切状态仍是初始状态
        // 所以需要根据该方案部署虚拟机
        //pso.showresult();
        vmTohost = pso.getSolution().getVmTohost();
        VMPlacement.showMigrateProcess(vmTohost, hostList);
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
