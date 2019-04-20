package com.mooe.grad.admin;


import com.mooe.grad.domain.*;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.util.FileUtil;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.RunningExpVo;
import com.mooe.grad.vo.VmHostVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.ParseException;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminExperimentController {

    @Autowired
    private ExperimentService experimentSeivice;

    @RequestMapping("/exp_list")
    public String listAll(Model model){
        List<ExperimentVo> list = experimentSeivice.listAll();
        List<DeliverInfo> deliverInfoList = experimentSeivice.listDeliver();
        model.addAttribute("experimentsList",list);
        model.addAttribute("deliverInfoList", deliverInfoList);
        return "admin/exp_list";
    }

    //下载实验文档
    @RequestMapping("/downloadFile/{deliver_id}")
    public void downloadFile(@PathVariable("deliver_id")String deliver_id, HttpServletResponse response) throws FileNotFoundException {
        // 读到流中
        String path = experimentSeivice.getDocumentPath(deliver_id);
        String fileName = path.split("\\\\")[path.split("\\\\").length-1];
        InputStream inStream = new FileInputStream(path);// 文件的存放路径
        // 设置输出的格式
        response.reset();
        response.setContentType("bin");
        response.addHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        // 循环取出流中的数据
        byte[] b = new byte[100];
        int len;
        try {
            while ((len = inStream.read(b)) > 0)
                response.getOutputStream().write(b, 0, len);
            inStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    //添加环境页面
    @RequestMapping("/add_envir/{exp_id}")
    public String addEnvir(@PathVariable("exp_id")int exp_id,Model model){
        String exp_name = experimentSeivice.getExpNameByid(exp_id);
        model.addAttribute("exp_id", exp_id);
        model.addAttribute("exp_name", exp_name);
        return "admin/envir_add";
    }

    //查看环境页面
    @RequestMapping("/view_envir/{exp_id}")
    public String viewEnvir(@PathVariable("exp_id")int exp_id,Model model){
        String exp_name = experimentSeivice.getExpNameByid(exp_id);
        Environment environment = experimentSeivice.findEnvirById(exp_id);
        List<VmHostVo> vmHostList = experimentSeivice.listVmHost(environment.getEnvir_id());
        model.addAttribute("exp_id", exp_id);
        model.addAttribute("exp_name", exp_name);
        model.addAttribute("environment", environment);
        model.addAttribute("vmHostList",vmHostList);
        return "admin/envir_view";
    }

    //提交部署环境
    @ResponseBody
    @RequestMapping("/commit_envir/{exp_id}")
    public Result<String> commitEnvir(@PathVariable("exp_id")int exp_id){
        experimentSeivice.updateToDeploying(exp_id);
        return Result.success("");
    }

    //查看主机信息
    @RequestMapping("/view_host/{host_id}")
    public String viewHost(@PathVariable("host_id")int host_id, Model model){
        VmHost vmHost = experimentSeivice.getVmHost(host_id);
        model.addAttribute("vmHost", vmHost);
        return "admin/host_view";
    }

    @ResponseBody
    @RequestMapping("/do_envirAdd")
    public Result<String> doAdd(Environment environment){
        //添加环境信息之前先创建环境存储路径
        String envirPath = FileUtil.basic_path+"backingFile\\"+environment.getEnvir_name()+"\\";
        File envirFilePath = new File(envirPath);
        if (!envirFilePath.exists()){
            envirFilePath.mkdirs();
        }
        environment.setPath(envirFilePath.getPath());
        experimentSeivice.addEnvir(environment);
        return Result.success("");
    }

    //添加主机
    @ResponseBody
    @RequestMapping("/do_hostAdd")
    public Result<String> doHostAdd(VmHost vmHost){
        //在环境存储路径下创建主机存储路径
        String hostPath = experimentSeivice.getEnvirPath(vmHost.getEnvir_id()) + "\\" + vmHost.getHost_name();
        File hostFilePath = new File(hostPath);
        if (!hostFilePath.exists()){
            hostFilePath.mkdirs();
        }
        experimentSeivice.addVmHost(vmHost);
        return Result.success("");
    }

    //页面跳转
    @RequestMapping("/exp_info")
    public String exp_info(){
        return "admin/exp_info";
    }

    @RequestMapping("/exp_update/{exp_id}")
    public String exp_info(Model model, @PathVariable("exp_id")int id){
        model.addAttribute("experiment",experimentSeivice.findById(id));
        return "admin/exp_update";
    }

    @ResponseBody
    @RequestMapping(value="/exp_update", method = RequestMethod.POST)
    public Result<String> exp_info(@RequestParam(name="file",required=false) MultipartFile multipartFile,
                                   Experiment experiment, HttpServletRequest request) throws IOException {

        String path = request.getServletContext().getRealPath("/uploads");
        //创建文件
        File file = new File(path);
        //判断是否存在
        if (!file.exists()){
            file.mkdirs();
        }
        //获得要上传的文件名
        String filename = multipartFile.getOriginalFilename();
        //生成随机数

        //把文件名称设置成唯一值
        filename = filename + "_" + new Date().getTime();
        //开始上传文件
        multipartFile.transferTo(new File(path,filename ));
        //把文件名存在javaBean中
        experiment.setImage(path+"\\"+filename);
        String result = experimentSeivice.updateExp(experiment);
        return Result.success(result);
    }

    @ResponseBody
    @RequestMapping("/exp_add")
    public Result<String> addExp(Experiment experiment){
        String result = experimentSeivice.addExp(experiment);
        return Result.success(result);
    }

    @RequestMapping("/exp_monitor")
    public String expMonitor(Model model){
        List<RunningExpVo> expRunningList = experimentSeivice.listRunningExp();
        model.addAttribute("expRunningList",expRunningList);
        return "admin/exp_monitor";
    }


    @RequestMapping("/exp_order")
    public String expOrder(Model model) throws ParseException {
        List<ExperimentVo> experimentsOrderList = experimentSeivice.expOrder();
        model.addAttribute("experimentsOrderList",experimentsOrderList);
        return "admin/exp_order";
    }


    /**
     * 雅群
     * */
    @ResponseBody
    @RequestMapping("/do_deployAdd")
    public Result<String> dodeployAdd(InstanceDeploy instancedeploy){
        //实验名--主机名--与实验同名环境模板
        String deployPath = experimentSeivice.getEnvirPath((experimentSeivice.getVmHost(instancedeploy.getHost_id())).getEnvir_id()) + "\\" + ((experimentSeivice.getVmHost(instancedeploy.getHost_id())).getHost_name());
        File deployfilePath = new File(deployPath);
        experimentSeivice.addInstanceDeploy(instancedeploy);
        return Result.success("");
    }

}
