package com.mooe.grad.admin;


import com.mooe.grad.domain.Experiment;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

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
    @RequestMapping("/exp_update")
    public Result<String> exp_info(@RequestParam(name="file",required=false) MultipartFile file, Experiment experiment){

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
