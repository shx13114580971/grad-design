package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.service.UserService;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
public class UserController {


    @Autowired
    private UserService userService;

    @RequestMapping("/myhome_info")
    public String info(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_info";
    }

    @RequestMapping("/myhome_exp")
    public String exp(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        List<ExperimentVo> experimentsList = userService.listExp(user.getUser_id());
        model.addAttribute("experimentsList",experimentsList);
        return "myhome_exp";
    }

    @RequestMapping("/myhome_fctf")
    public String fctf(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_fctf";
    }

    @RequestMapping("/myhome_test")
    public String list(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_test";
    }



    @RequestMapping("/user/update")
    public String  updateUserInfo(){
        return "";
    }

}
