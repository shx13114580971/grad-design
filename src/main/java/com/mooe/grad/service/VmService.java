package com.mooe.grad.service;

import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VmService {

    @Autowired
    private RedisService redisService;

    //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
    private RemoteShellExeUtil remoteShellExecutor;
    public String createVM(String cmd_createVm) throws Exception {
        String targetIpAddr = loadAverage();
        remoteShellExecutor = new RemoteShellExeUtil(targetIpAddr,
                ServerInfoUtil.VmServerUserName, ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        RemoteResult result = remoteShellExecutor.exec(cmd_createVm);
        if(result.getRet() == -1)return "";

        return targetIpAddr;
    }

    private String loadAverage() {
        return "172.26.2.38";
    }

    public String destroyVM(String envir_name, int user_id, String host_name) throws Exception {
        //先获取虚拟机所在IP地址
        String tokenOrKey = envir_name + "_" + String.valueOf(user_id)+ "_" + host_name;
        String value = redisService.get(ExpKey.existARunningVm, tokenOrKey,String.class);
        String ipAddr = value.split(":")[0];
        String vncPort = value.split(":")[1];
        //仨个参数，环境名，用户id与主机名
        String cmd_destroyVm = "bash /home/sheeta/nfs-client/kvm/backing_file/"+envir_name+"/"
                +host_name+"/undefine-remove.bash "+envir_name+" "+user_id+" "+host_name;
        remoteShellExecutor = new RemoteShellExeUtil(ipAddr, ServerInfoUtil.VmServerUserName,
                ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        RemoteResult result = remoteShellExecutor.exec(cmd_destroyVm);
        if (result.getRet() == -1)return "";
        return vncPort;
    }
}
