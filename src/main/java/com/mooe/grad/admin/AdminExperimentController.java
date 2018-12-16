package com.mooe.grad.admin;


import com.mooe.grad.domain.Experiment;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
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
        model.addAttribute("experimentsList",list);
        return "admin/exp_list";
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





}
