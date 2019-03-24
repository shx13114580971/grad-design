package com.mooe.grad.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.*;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.VncPortKey;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.VmHostVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.InetAddress;
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

    @Autowired
    private VmService vmService;

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
        experimentComment .setCreatetime(commemtVo.getCreatetime());
        experimentComment.setScore(commemtVo.getScore());
        experimentDao.addComment(experimentComment);
    }

    public List<CommemtVo> listComments(int exp_id) {
        List<CommemtVo> list = experimentDao.listComments(exp_id);
        int pageCount = list.size();
        return list;
    }

    //获取实验环境，创建实验机
    public String getExp(int user_id, String envir_name, int exp_id) throws Exception {

        //根据实验环境名命名模板，根据实验环境名加上用户id命名实例
        List<String> exps = new ArrayList<>();
        //先从数据库中取得主机列表
        //这里有个bug，环境id与主机id是对应关系，但此处只有实验id，因此需要先用它获取环境id
        int envir_id  = experimentDao.getEnvirIdByExpId(exp_id);
        List<String> hostNameList = experimentDao.listHostName(envir_id);
        if(redisService.exists(ExpKey.existARunningVm, String.valueOf(user_id)))return null;
        for(int host_num = 0; host_num < hostNameList.size(); host_num++){
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
            //格式：bash ...../实验名.bash 实验名 用户id vnc端口号 主机名
            //例：bash ...../ssrf111.bash ssrf111_2 5901
            String cmd_createVm = "bash /home/sheeta/nfs-client/kvm/backing_file/"+envir_name+"/"+ hostNameList.get(host_num)
                    +"/"+envir_name+".bash "+envir_name+" "+user_id+" "+vncPort+" "+hostNameList.get(host_num);
            //createVM进行负载均衡选择目标服务器创建虚拟机，成功创建后返回IP地址
            String targetIpAddr = vmService.createVM(cmd_createVm);
            if("".equals(targetIpAddr) || targetIpAddr == null)return null;
            //key即vnc的token
            String key = envir_name+"_"+String.valueOf(user_id)+"_"+hostNameList.get(host_num);
            //value是以本地ip地址与分配到的端口号组合成，为了方便之后销毁
            String value = targetIpAddr+":"+vncPort;
            //用户状态标识,将记录端口与ip的缓存项的key作为用户状态标识的value，即first_token
            redisService.set(ExpKey.existARunningVm, String.valueOf(user_id), key);
            redisService.set(ExpKey.existARunningVm, key,value);
            //最后token是环境名+用户id+主机名
           // exps.add(host_num, envir_name+""+user_id+""+hostNameList.get(host_num));
        }
        //只返回第一个主机的token即可，点击“进入实验”之后再重新获取token列表
        return envir_name+"_"+user_id+"_"+hostNameList.get(0);
    }


    public String getFirstToken(int user_id) {
        //获取主机列表
        String firstToken = redisService.get(ExpKey.existARunningVm, String.valueOf(user_id), String.class);
        if("".equals(firstToken) || firstToken == null)return "";
        return firstToken;
    }

    public String endExp(int user_id, String envir_name) throws Exception {
                //格式：bash ...../实验名.bash 实验名 用户ID
        //例：bash ...../undefine-remove.bash ssrf111_2
        int envir_id = experimentDao.getEnvirIdByEnvirName(envir_name);
        List<String> hostNameList = experimentDao.listHostName(envir_id);
        for(String host_name : hostNameList){
            String vncPort = vmService.destroyVM(envir_name, user_id, host_name);
//            RemoteResult result = remoteShellExecutor.exec(cmd_destroyVm);
//            System.out.println(remoteShellExecutor.exec(String.valueOf(result)));
            if(vncPort == "")return "";
            //将端口状态置为空闲
            JSONObject vncPortJson = redisService.get(VncPortKey.vncPort, "", JSONObject.class);
            vncPortJson.put(vncPort,0);
            String tokenOrKey = envir_name + "_" + String.valueOf(user_id)+ "_" + host_name;
            redisService.set(VncPortKey.vncPort, "", vncPortJson);
            redisService.delete(ExpKey.existARunningVm, tokenOrKey);
        }
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

    public String getDocumentPath(String deliver_id) {
        return experimentDao.getDocumentPath(deliver_id);
    }

    public void updateHost(VmHost vmHost) {
        experimentDao.updateHost(vmHost);
    }

    public void addInstanceDeploy(InstanceDeploy instanceDeploy) {
        experimentDao.addInstanceDeploy(instanceDeploy);
    }

    public int getHostNum(int exp_id) {
        return experimentDao.getHostNum(exp_id);
    }

    public List<String> listToken(String token) {
        //token格式<环境名_用户id_主机名>
        String[] tokenArray = token.split("_");
        String envir_name = tokenArray[0];
        String user_id = tokenArray[1];
        //还是那个bug，这次需要通过envir_name获取envir_id
        int envir_id = experimentDao.getEnvirIdByEnvirName(envir_name);
        List<String> hostNameList = experimentDao.listHostName(envir_id);
        //重新组装成token
        List<String> tokenList = new ArrayList<>();
        for(String hostName : hostNameList){
            tokenList.add(envir_name+"_"+user_id+"_"+hostName);
        }
        return tokenList;
    }

}
