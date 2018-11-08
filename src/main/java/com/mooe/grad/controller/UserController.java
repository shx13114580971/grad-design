package com.mooe.grad.controller;

import com.mooe.grad.domain.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class UserController {

    @RequestMapping("/myhome")
    public String list(User user, Model model){
        model.addAttribute("user", user);
        return "myhome";
    }

}
