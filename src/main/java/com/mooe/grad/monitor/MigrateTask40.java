package com.mooe.grad.monitor;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.PerformanceCharacter;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
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
public class MigrateTask40 {
    @Autowired
    private ExperimentDao experimentDao;

    //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
    private RemoteShellExeUtil remoteShellExecutorSlave =
            new RemoteShellExeUtil(ServerInfoUtil.VmServerIp40, ServerInfoUtil.VmServerUserName,
                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    private RemoteShellExeUtil remoteShellExecutorMaster =
            new RemoteShellExeUtil(ServerInfoUtil.fileServerIp, ServerInfoUtil.VmServerUserName,
                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    private static final Logger LOGGER = LoggerFactory.getLogger(MigrateTask40.class);
    private QemuConnection sourceConn = new QemuConnection();


    public void collectMonitorData() throws Exception {
        System.setProperty("jna.library.path","C:\\Program Files (x86)\\Libvirt\\bin");
        String cmd_ser_mem = "sh /home/sheeta/kvm/monitor/check_load.sh";

        RemoteResult result = remoteShellExecutorSlave.exec(cmd_ser_mem);

        if(result.getRet() == -1){
            System.out.println(result.getOutErr());
            return;
        }
        int ser_mem_top = experimentDao.getSerMemTop();
        int ser_cpu_top = experimentDao.getSerCpuTop();
        String[] loadStr = result.getOutStr().trim().split(":");
        int ser_mem_current = Integer.valueOf(loadStr[0]);
        int ser_cpu_current = Integer.valueOf(loadStr[1]);

        //迁移时机
        if(ser_mem_current >= ser_mem_top || ser_cpu_current >= ser_cpu_top){
            //确定待迁移虚拟机
            Domain sourceVM = selectVM();
            //确定目标服务器
            String targetNodeIp = selectSer();
            String sourceIp = sourceVM.getConnect().getURI().split("/")[2].split(":")[0];
            Connect destConn = new Connect("qemu+tcp://"+targetNodeIp+":16509/system", false);
            if("".equals(targetNodeIp) || targetNodeIp == null){
                System.out.println("fail to obtain target server!");
            }
            //直接用1代替MIGRATE_FLAG_LIVE了
            System.out.println("###############################################################");
            System.out.println(sourceVM.getName());
            System.out.println("###############################################################");
            if(!sourceIp.equals(targetNodeIp)){
                Domain targetVm = sourceVM.migrate(destConn, 1|2|4|512,null, null, 0);
                //更新此实验机token内容
                if(targetVm != null){
                    String tokenFileName = "/home/sheeta/kvm/token/" + sourceVM.getName();
                    String updateSer_cmd = "sed -i 's/"+ sourceIp +"/"+ targetNodeIp +"/g' " + tokenFileName;
                    remoteShellExecutorMaster.exec(updateSer_cmd);
                }
            }

        }
        System.out.println("这是40任务");
    }

    private String selectSer() {
        //需要在这个方法中从rrd获取三台从节点的负载情况，然后计算得出目标节点
        String targetNodeIp = null;
        String get_nodes_load_cmd = "sh /home/sheeta/kvm/monitor/java_call/get_nodes_load.sh";
        try {
            RemoteResult result = remoteShellExecutorMaster.exec(get_nodes_load_cmd);
            if(result.getRet() == -1){
                System.out.println(result.getOutErr());
                return "";
            }
            String[] loads = result.getOutStr().trim().split(" ");
            targetNodeIp = calTargetIp(loads);

        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return targetNodeIp;
    }

    private Domain selectVM() throws Exception {
        Domain selectedVM = null;
        Connect conn = sourceConn.getConn(ServerInfoUtil.VmServerIp40);
        try{
            int[] vmIdList =  conn.listDomains();
            selectedVM = conn.domainLookupByID(vmIdList[0]);
            for(int vmId : vmIdList){
                System.out.println(conn.domainLookupByID(vmId).getName());
            }
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        }
        return selectedVM;
    }

    private String calTargetIp(String[] loads) {
        Map<PerformanceCharacter, String> loadsMap = new HashMap<>();
        for(int i = 0; i < loads.length; i++){
            //key = 38, value = <cpu_usage:mem_usage>
            PerformanceCharacter pc = new PerformanceCharacter();
            //格式剧举例：38/14:23 39/43:23 40/13:09
            String value = loads[i].split("/")[0];
            String[] load = loads[i].split("/")[1].split(":");
            pc.setCpu_usage(Integer.valueOf(load[1]));
            pc.setMem_usage(Integer.valueOf(load[0]));
            loadsMap.put(pc, value);
        }
        //此处需要进行算法设计，目前先找内存使用率最低的服务器节点
        List<Integer> memList = new ArrayList<>();
        //临时存储mem与ipd对应关系，方便查找
        Map<Integer, String> memMap = new HashMap<>();
        for(Map.Entry entry : loadsMap.entrySet()){
            PerformanceCharacter pc = (PerformanceCharacter)entry.getKey();
            memMap.put(pc.getMem_usage(), (String)entry.getValue());
            memList.add(pc.getMem_usage());
        }
        Object[] targetIp = memList.toArray();
        Arrays.sort(targetIp);
        return "172.26.2." + memMap.get(targetIp[0]);
    }
}
