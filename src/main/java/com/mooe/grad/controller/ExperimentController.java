package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
public class ExperimentController {

    @Autowired
    private ExperimentService experimentService;


    @RequestMapping("/exp_profile")
    public String listAll(Model model){
        List<ExperimentVo> list = experimentService.listAll();
        model.addAttribute("experimentsList",list);
        return "exp_profile";
    }

    @RequestMapping("/experiment/{exp_id}")
    public String expPage(@PathVariable("exp_id") int exp_id,Model model){
        model.addAttribute("experiment", experimentService.findById(exp_id));
        return "experiment";
    }

}
