package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ExperimentController {

    @Autowired
    private ExperimentService experimentService;


    @RequestMapping("/exp_profile")
    public String listAll(User user, Model model){
        List<ExperimentVo> list = experimentService.listAll();
        model.addAttribute("experimentsList",list);
        model.addAttribute("user", user);
        return "exp_profile";
    }

    @RequestMapping("/experiment/{exp_id}")
    public String expPage(@PathVariable("exp_id") int exp_id,User user, Model model){
        model.addAttribute("experiment", experimentService.findById(exp_id));
        //临时这么处理
        model.addAttribute("user", user);
        return "experiment";
    }

    @RequestMapping("/experiment/comment")
    @ResponseBody
    public Result<String> comment(User user, CommemtVo commemtVo){
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        experimentService.addComment(user,commemtVo);
        return Result.success("");
    }

    @RequestMapping("/experiment/commentList")
    @ResponseBody
    public Result<List<CommemtVo>> commentList(Model model){
        List<CommemtVo> list = experimentService.listComments();
        return Result.success(list);
    }
}
