package com.mooe.grad.monitor;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import org.apache.catalina.LifecycleState;
import org.libvirt.Connect;
import org.libvirt.Domain;
import org.libvirt.LibvirtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

import java.util.List;

@Configuration
@Component // 此注解必加
@EnableScheduling // 此注解必加
public class MonitorTask {
    @Autowired
    private ExperimentDao experimentDao;

    //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
    private RemoteShellExeUtil remoteShellExecutor =
            new RemoteShellExeUtil(ServerInfoUtil.VmServerIp, ServerInfoUtil.VmServerUserName,
                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
    private static final Logger LOGGER = LoggerFactory.getLogger(MonitorTask.class);
    public void collectMonitorData() throws Exception {

        System.setProperty("jna.library.path","C:\\Program Files (x86)\\Libvirt\\bin");
        String cmd_ser_mem = "sh /home/sheeta/kvm/monitor/check_mem_usage.sh -w 30 -c 40";
        RemoteResult result = remoteShellExecutor.exec(cmd_ser_mem);
        if(result.getRet() == -1){
            System.out.println(result.getOutErr());
            return;
        }
        int ser_mem_top = experimentDao.getSerMemTop();
        int ser_mem_current = Integer.valueOf(result.getOutStr().split("%")[0]);
        //迁移时机
        if(ser_mem_current >= ser_mem_top){
            //确定待迁移虚拟机
            String vmName = selectVM();
            System.out.println(result.getOutErr());
            //确定目标服务器
            String serverIP = selectSer();
        }
        System.out.println(result.getOutStr());
    }

    private String selectSer() {
        return "";
    }

    private String selectVM() throws Exception {
        Connect conn = null;
        String[] vmlist = null;
        try{
            conn = new Connect("qemu+tcp://172.26.2.38/system", true);
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        }
        try{
            vmlist = conn.listDefinedDomains();
            System.out.println(vmlist[0]);
//            Domain testDomain=conn.domainLookupByName("test");
//            System.out.println("Domain:" + testDomain.getName() + " id " +
//                    testDomain.getID() + " running " +
//                    testDomain.getOSType());
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        }
        return vmlist[0];
    }
//    public void sayHello(){
//        LOGGER.info("Hello world, i'm the king of the world!!!");
//    }
}
