package com.mooe.grad.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.*;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.VncPortKey;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.VmHostVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExperimentService {

    @Autowired
    private ExperimentDao experimentDao;

    @Autowired
    private RedisService redisService;

    public Experiment findById(int id){
        return experimentDao.findById(id);
    }

    public String updateExp(Experiment experiment){
        //String contentType = file.getContentType();   //文件类型
        //String fileName = file.getOriginalFilename();  //文件名字
        String path = "C:\\\\Users\\\\Administrator\\\\Desktop\\\\vue-manage-system-master\\\\static\\\\uploadimg\\\\";
        experimentDao.updateExp(experiment);
        return "success";
    }

    public String addExp(Experiment experiment){
//        String question = experiment.getQuestion();
//        JSONObject jsonQues = JSONObject.parseObject(question);
//        experiment.setQuestion(jsonQues.toString());
        experimentDao.addExp(experiment);
        return "success";
    }

    public List<ExperimentVo> listAll(){
        return experimentDao.listAll();
    }

    public void addComment(User user, CommemtVo commemtVo) {
        ExperimentComment experimentComment = new ExperimentComment();
        experimentComment.setExp_id(commemtVo.getExpfctf_id());
        experimentComment.setUser_id(user.getUser_id());
        experimentComment.setContent(commemtVo.getContent());
        experimentComment.setCreatetime(commemtVo.getCreatetime());
        experimentComment.setScore(commemtVo.getScore());
        experimentDao.addComment(experimentComment);
    }

    public List<CommemtVo> listComments(int exp_id) {
        List<CommemtVo> list = experimentDao.listComments(exp_id);
        int pageCount = list.size();
        return list;
    }

    //获取实验环境，打开实验机
    public String getExp(int user_id, String envir_name) throws Exception {
        //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
        RemoteShellExeUtil remoteShellExecutor =
                new RemoteShellExeUtil(ServerInfoUtil.VmServerIp, ServerInfoUtil.VmServerUserName,
                        ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        //根据实验环境名命名模板，根据实验环境名加上用户id命名实例
        int vncPort = 0;
        //redis中是否有实验机个数的缓存
        if(!redisService.exists(VncPortKey.vncPort, "")){
            //vnc端口范围9001--9500
            Map<String, Integer> vncPortMap = new HashMap();
            for(int i = 9001; i < 9500; i++){
                vncPortMap.put(String.valueOf(i), 0);
            }
            redisService.set(VncPortKey.vncPort, "", vncPortMap);
        }
        //确定端口号,value是0表示端口空闲，端口是1表示正在使用
        JSONObject vncPortJson = redisService.get(VncPortKey.vncPort, "",  JSONObject.class);
        for(int i = 9001; i < 9500; i++){
            if((int)vncPortJson.get(i) == 0){
                vncPort = i;
                System.out.println(vncPortJson);
                vncPortJson.put(String.valueOf(i),1);
                redisService.set(VncPortKey.vncPort, "", vncPortJson);
                break;
            }
        }
        //格式：bash ...../实验名.bash 实验名 虚拟机个数 vnc端口号
        //例：bash ...../ssrf111.bash ssrf111_2 5901
        String cmd_createVm = "bash /home/sheeta/kvm/backing_file/"+envir_name+"/"+envir_name+".bash "+envir_name+" "+user_id+" "+vncPort;
        int result = remoteShellExecutor.exec(cmd_createVm);
        System.out.println(String.valueOf(result));
        if(result == -1)return "";
        if(redisService.exists(ExpKey.existARunningVm, String.valueOf(user_id)))return "";
        //这里的value设置为vnc端口号，辅助记录，销毁实验机d时候使用
        redisService.set(ExpKey.existARunningVm, String.valueOf(user_id),vncPort);
        return "http://"+ServerInfoUtil.VmServerIp+":"+ServerInfoUtil.novnc_port+"/vnc.html?path=?token="+envir_name+""+user_id;
    }

    public String endExp(int user_id, String envir_name) throws Exception {
        RemoteShellExeUtil remoteShellExecutor =
                new RemoteShellExeUtil(ServerInfoUtil.VmServerIp, ServerInfoUtil.VmServerUserName,
                        ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        //格式：bash ...../实验名.bash 实验名 用户ID
        //例：bash ...../undefine-remove.bash ssrf111_2
        String cmd_destroyVm = "bash /home/sheeta/kvm/backing_file/"+envir_name+"/undefine-remove.bash "+envir_name+" "+user_id;
        int result = remoteShellExecutor.exec(cmd_destroyVm);
        System.out.println(remoteShellExecutor.exec(String.valueOf(result)));
        if(result == -1)return "";
        //获取当前端口号
        int vncPort = redisService.get(ExpKey.existARunningVm, String.valueOf(user_id),Integer.class);
        //将端口状态置为空闲
        JSONObject vncPortJson = redisService.get(VncPortKey.vncPort, "", JSONObject.class);
        vncPortJson.put(String.valueOf(vncPort),0);
        redisService.set(VncPortKey.vncPort, "", vncPortJson);
        redisService.delete(ExpKey.existARunningVm, String.valueOf(user_id));
        return "成功销毁实验机";
    }

    public String isRunning(int user_id) {
        //该用户有正在运行的实验机，则返回true
        if(redisService.exists(ExpKey.existARunningVm, String.valueOf(user_id)))return "true";
        else return "false";
    }

    public String getExpNameByid(int exp_id) {
        return experimentDao.getExpNameById(exp_id);
    }

    public void addEnvir(Environment environment) {
        experimentDao.addEnvir(environment);
        //experiment_info status字段的初始值都是0，当有环境名的时候，显示制作中
        experimentDao.addEnvirToExp(environment.getEnvir_name(), environment.getExp_id());
    }

    public Environment findEnvirById(int exp_id) {
        return experimentDao.findEnvirById(exp_id);
    }

    public List<VmHostVo> listVmHost(int envir_id) {
        return experimentDao.listVmHost(envir_id);
    }

    public void addVmHost(VmHost vmHost) {
        experimentDao.addVmHost(vmHost);
    }

    public VmHost getVmHost(int host_id) {
        return experimentDao.getVmHost(host_id);
    }

    public void updateToDeploying(int exp_id) {
        experimentDao.updateToDeploying(exp_id);
    }

    public List<Environment> listEnvir() {
        return experimentDao.listEnvir();
    }

    public List<DeliverInfo> listDeliver() {
        return experimentDao.listDeliver();
    }

    public String getEnvirPath(int envir_id) {
        return experimentDao.getEnvirPath(envir_id);
    }
}
