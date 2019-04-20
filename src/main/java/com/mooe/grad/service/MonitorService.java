package com.mooe.grad.service;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.HostInfo;
import com.mooe.grad.domain.VmMigrate;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import org.apache.catalina.Host;
import org.libvirt.Connect;
import org.libvirt.Domain;
import org.libvirt.LibvirtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MonitorService {

    @Autowired
    private ExperimentDao experimentDao;

    private RemoteShellExeUtil remoteShellExecutorMaster =
            new RemoteShellExeUtil(ServerInfoUtil.fileServerIp, ServerInfoUtil.VmServerUserName,
                    ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

    //收集所有节点监控数据
    public String[] collectMonitorData() {
        String cmd_ser_mem = "sh /home/sheeta/kvm/monitor/java_call/get_all_load.sh";
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

    //收集指定节点监控数据
    public String collectMonitorData(String ipAddr) {
        String cmd_ser_mem = "sh /home/sheeta/kvm/migrate/java_call/get_all_load.sh";
        RemoteResult result = null;
        String[] loadStrArray = null;
        String loadStr =null;
        try {
            result = remoteShellExecutorMaster.exec(cmd_ser_mem);
            if(result.getRet() == -1){
                System.out.println(result.getOutErr());
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        loadStrArray = result.getOutStr().trim().split("/");
        for(String loadStrTmp : loadStrArray){
            if(ipAddr.equals(loadStr.split(":")[0].trim())){
                loadStr = loadStrTmp;
            }
        }
        return loadStr;
    }

    //生成主机对象
    public HostInfo genHost(String loadStr){
        String ipAddr = loadStr.split(":")[0].trim();
        double uCPU = Double.valueOf(loadStr.split(":")[1].trim().split(" ")[0].trim());
        double uMEM = Double.valueOf(loadStr.split(":")[1].trim().split(" ")[1].trim());
        double uNET = Double.valueOf(loadStr.split(":")[1].trim().split(" ")[2].trim());
        HostInfo host = experimentDao.getHostInfo(ipAddr);
        host.setLoad(uCPU, uMEM, uNET);
        return host;
    }



    //生成待迁移实验对象
    public VmMigrate genVmMigrate(HostInfo sourceHost , Domain domain) throws Exception {
        double expLoadTop = experimentDao.getExpLoadTop();
        VmMigrate vmMigrate = new VmMigrate(domain, sourceHost);
        String cmd_vm_load = "sh /home/sheeta/kvm/monitor/java_call/get_vms_load.sh " + sourceHost.getIpaddr() + " " + domain.getName();
        RemoteResult result = remoteShellExecutorMaster.exec(cmd_vm_load);
        String vm_load = result.getOutStr().trim();
        while("-nan".equals(vm_load.split(" ")[0]) || "-nan".equals(vm_load.split(" ")[1]) || "-nan".equals(vm_load.split(" ")[2])){
            result = remoteShellExecutorMaster.exec(cmd_vm_load);
            vm_load = result.getOutStr().trim();
        }
        double uVCPU = Double.valueOf(vm_load.split(" ")[0]);
        double uVMem = Double.valueOf(vm_load.split(" ")[1]);
        double uVNet = Double.valueOf(vm_load.split(" ")[2]);
        vmMigrate.setLoad(uVCPU, uVMem, uVNet);
        if(vmMigrate.getLoad() > expLoadTop)return null;
        return vmMigrate;
    }
}
