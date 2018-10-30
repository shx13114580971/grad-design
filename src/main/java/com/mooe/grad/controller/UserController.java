package com.mooe.grad.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class UserController {

    @RequestMapping("/myhome")
    public String list(){
        return "myhome";
    }

}
