package com.mooe.grad.service;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.*;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.RunningExpVo;
import com.mooe.grad.vo.VmHostVo;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

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
        double sum = 0;
        double scoreAver = 0;
        experimentComment.setExp_id(commemtVo.getExpfctf_id());
        experimentComment.setUser_id(user.getUser_id());
        experimentComment.setContent(commemtVo.getContent());
        experimentComment .setCreatetime(commemtVo.getCreatetime());
        experimentComment.setScore(commemtVo.getScore());
        experimentDao.addComment(experimentComment);
        //重新计算当前实验的平均评分
        List<Integer> scoreList = experimentDao.listScoreOfExp(commemtVo.getExpfctf_id());
        for(int i = 0; i < scoreList.size(); i++){
            sum += scoreList.get(i);
        }
        scoreAver = sum / scoreList.size();
        DecimalFormat df = new DecimalFormat("0.0000");
        scoreAver = Double.valueOf(df.format(scoreAver));
        experimentDao.updateExpScore(scoreAver, commemtVo.getExpfctf_id());
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
        if(redisService.exists(ExpKey.existARunningVm,
                envir_name+"_"+user_id))return null;
        //根据负载情况选择服务器节点，同一实验中的实验机始终在同一物理服务器节点上
        //确定请求转发策略
        String targetIpAddr = vmService.loadAverage();
        //创建虚拟网桥，一个实验中的实验机连接在同一网桥下
        String result = vmService.getVBridge(targetIpAddr, user_id);
        if(result == "")return "";
        String value = "";
        for(int host_num = 0; host_num < hostNameList.size(); host_num++){

            //createVM进行负载均衡选择目标服务器创建虚拟机，成功创建后返回IP地址
            int vncPort = vmService.createVM(envir_name, user_id, targetIpAddr, hostNameList.get(host_num));
            if("".equals(targetIpAddr) || targetIpAddr == null)return null;
            //key即vnc的token

            //value是以本地ip地址与分配到的端口号组合成，为了方便之后销毁
            value = value + "/" + hostNameList.get(host_num)+":"+targetIpAddr+":"+vncPort;
            //用户状态标识,将记录端口与ip的缓存项的key作为用户状态标识的value，即first_token
            //最后token是环境名+用户id+主机名
           // exps.add(host_num, envir_name+""+user_id+""+hostNameList.get(host_num));
        }
        //ExpKey.existARunningVm的key由环境名和用户组成
        String key = envir_name+"_"+String.valueOf(user_id);
        redisService.set(ExpKey.existARunningVm, key,value);
        //只返回第一个主机的token即可，点击“进入实验”之后再重新获取token列表
        return envir_name+"_"+user_id+"_"+hostNameList.get(0);
    }


    public String getFirstToken(int user_id, String envir_name) {
        int envir_id = experimentDao.getEnvirIdByEnvirName(envir_name);
        List<String> hostNameList = experimentDao.listHostName(envir_id);
        String firstToken = envir_name+"_"+String.valueOf(user_id)+"_"+hostNameList.get(0);
        return firstToken;
    }

    public String endExp(int user_id, String envir_name) throws Exception {
                //格式：bash ...../实验名.bash 实验名 用户ID
        //例：bash ...../undefine-remove.bash ssrf111_2
        int envir_id = experimentDao.getEnvirIdByEnvirName(envir_name);
        //List<String> hostNameList = experimentDao.listHostName(envir_id);
        String key = envir_name + "_" + String.valueOf(user_id);
        String value = redisService.get(ExpKey.existARunningVm, key,String.class);
        String[] valueArray = value.split("/");
        int result = vmService.destroyVM(envir_name, user_id, valueArray);
        if(result == -1)return "";
        //existARunningVm存的是虚拟主机名_物理机ip_vnc端口号
        redisService.delete(ExpKey.existARunningVm, key);
        //expCreateTime只存储创建实验机的终止时间
        redisService.delete(ExpKey.expEndTime, key);
        return "成功销毁实验机";
    }

    public String isRunning(int user_id, String envir_name) {
        int envir_id = experimentDao.getEnvirIdByEnvirName(envir_name);
        List<String> hostNameList = experimentDao.listHostName(envir_id);
        String key = envir_name+"_"+String.valueOf(user_id);
        if(redisService.exists(ExpKey.existARunningVm, key)){
            return "true";
        }
        return "false";
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

    public List<ExperimentVo> expOrder() throws ParseException {
        List<ExperimentVo> experimentsOrderList = experimentDao.listAll();
        calQualityValue(experimentsOrderList);
        return experimentsOrderList;
    }
    private void calQualityValue(List<ExperimentVo> experimentsOrderList) throws ParseException {
        //简化计算：学习人数*平均评分/平均负载值/上线时长
        int userCount = 0;//学习人数可以直接取
        double scoreAver = 0;//平均评分可以直接取
        double loadAver = 0;//平均负载值可以从rrd中取
        int days = 0;//上线时长通过当前日期减去上线日期，最小单位是天数
        double qualifyValue = 0;
        Date nowDate = new Date();
        String onlineDate = "";
        for(ExperimentVo experiment : experimentsOrderList){
            userCount = experiment.getUser_count();
            scoreAver = experiment.getScore();
            loadAver = Math.random()*100+1;
            onlineDate = experiment.getDate();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            days = (int)((nowDate.getTime()-sdf.parse(onlineDate).getTime())/(1000*3600*24));
            qualifyValue = (userCount*scoreAver)/(loadAver*days);
            DecimalFormat df = new DecimalFormat("######0.0000");
            experiment.setQualityValue(Double.valueOf(df.format(qualifyValue)));
        }
        Collections.sort(experimentsOrderList, new Comparator<ExperimentVo>() {
            @Override
            public int compare(ExperimentVo exp1, ExperimentVo exp2) {
                if(exp1.getQualityValue() < exp2.getQualityValue()) return 1;
                else if(exp1.getQualityValue() == exp2.getQualityValue()) return 0;
                else return -1;
            }
        });
    }

    public List<RunningExpVo> listRunningExp() {
        //existARunningVm中有环境名和用户id
        Set<String> runningExpSet = redisService.keys(ExpKey.existARunningVm);
        List<RunningExpVo> runningExpList = new ArrayList<>();
        String envirName = "";
        String userName = "";
        String expName = "";
        String endTime = "";
        int userId = 0;
        for(String runningExpStr : runningExpSet){
            RunningExpVo runningExp = new RunningExpVo();
            envirName = runningExpStr.split("-")[1].split("_")[0];
            userId = Integer.valueOf(runningExpStr.split("-")[1].split("_")[1]);
            userName = experimentDao.getUserNameById(userId);
            expName = experimentDao.getExpNameByEnvirName(envirName);
            endTime = redisService.get(ExpKey.expEndTime, envirName + "_" + userId, String.class);
            runningExp.setEnvirName(envirName);
            runningExp.setExpName(expName);
            runningExp.setUserName(userName);
            runningExp.setEndTime(endTime);
            runningExpList.add(runningExp);
        }
        return runningExpList;
    }

    /**
     * 雅群
     * */

    public void updatexml() throws DocumentException, IOException {

        // 创建SAXReader对象
        SAXReader sr = new SAXReader(); // 需要导入jar包:dom4j
        // 关联xml
        Document document = sr.read("d:/wangergou/peizhiwenjian/ssrf071125112018.xml");

        Element nameElem=document.getRootElement().element("memory");
        nameElem.setText("12334567");

        saveDocument(document, new File("d:/wangergou/peizhiwenjian/www111.xml"));

    }
    public static void saveDocument(Document document, File xmlFile) throws IOException {
        Writer osWrite = new OutputStreamWriter(new FileOutputStream(xmlFile));// 创建输出流
        OutputFormat format = OutputFormat.createPrettyPrint(); // 获取输出的指定格式
        format.setEncoding("UTF-8");// 设置编码，确保解析的xml为UTF-8格式
        XMLWriter writer = new XMLWriter(osWrite, format);// XMLWriter
        // 指定输出文件以及格式
        writer.write(document);// 把document写入xmlFile指定的文件(可以为被解析的文件或者新创建的文件)
        writer.flush();
        writer.close();
    }
}
