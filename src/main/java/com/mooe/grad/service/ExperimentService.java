package com.mooe.grad.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.ExperimentComment;
import com.mooe.grad.domain.User;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.VncPortKey;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
        RemoteShellExeUtil remoteShellExecutor =
                new RemoteShellExeUtil(ServerInfoUtil.VmServerIp, ServerInfoUtil.VmServerUserName,
                        ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        //根据实验环境名命名模板，根据实验环境名加上用户id命名实例
        if(redisService.exists(ExpKey.existARunningVm, String.valueOf(user_id)))return "";
        //这里的value是随便设置的，因为主要就是想判断当前用户是不是有在进行的实验
        redisService.set(ExpKey.existARunningVm, String.valueOf(user_id),1);
        //redis中是否有实验机个数的缓存
//        if(!redisService.exists(ExpKey.expVmNum, envir_name)){
//            redisService.set(ExpKey.expVmNum, envir_name, 0);
//        }
        if(!redisService.exists(VncPortKey.vncPort, "")){
            //vnc默认端口为5900
            redisService.set(VncPortKey.vncPort, "", 5900);
        }
//        //虚拟机个数先加一
//        redisService.incr(ExpKey.expVmNum, envir_name);
        //端口号加一
        redisService.incr(VncPortKey.vncPort, "");
//        //获取当前虚拟机个数
//        int vmNum = redisService.get(ExpKey.expVmNum, envir_name, Integer.class);
        //获取当前点口号
        int vncPortNum = redisService.get(VncPortKey.vncPort, "", Integer.class);
        //格式：bash ...../实验名.bash 实验名 虚拟机个数 vnc端口号
        //例：bash ...../ssrf111.bash ssrf111_2 5901
        String cmd_createVm = "bash /home/sheeta/kvm/backing_file/"+envir_name+"/"+envir_name+".bash "+envir_name+" "+user_id+" "+vncPortNum;
        System.out.println(remoteShellExecutor.exec(cmd_createVm));
        return "http://172.26.2.38:"+(vncPortNum+3000)+"/vnc.html?path=?token="+envir_name+""+user_id;
    }

    public String endExp(int user_id, String envir_name) throws Exception {
        RemoteShellExeUtil remoteShellExecutor =
                new RemoteShellExeUtil(ServerInfoUtil.VmServerIp, ServerInfoUtil.VmServerUserName,
                        ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);

//        //端口号加一
//        redisService.incr(VncPortKey.vncPort, "");
//        //获取当前点口号
//        int vncPortNum = redisService.get(VncPortKey.vncPort, "", Integer.class);
//        //格式：bash ...../实验名.bash 实验名 用户ID
//        //例：bash ...../undefine-remove.bash ssrf111_2
        String cmd_destroyVm = "bash /home/sheeta/kvm/backing_file/"+envir_name+"/undefine-remove.bash "+envir_name+" "+user_id;
        System.out.println(remoteShellExecutor.exec(cmd_destroyVm));
        return "";
    }

    public String isRunning(int user_id) {
        //该用户有正在运行的实验机，则返回true
        if(redisService.exists(ExpKey.existARunningVm, String.valueOf(user_id)))return "true";
        else return "false";
    }
}
