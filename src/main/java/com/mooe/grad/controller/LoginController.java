package com.mooe.grad.controller;

import com.mooe.grad.domain.User;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.UserService;
import com.mooe.grad.vo.LoginVo;
import com.mooe.grad.vo.RegisterVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@Controller
public class LoginController {

    @Autowired
    private UserService userService;

    @RequestMapping("/login")
    public String login(){
        return "login";
    }

    @RequestMapping("/register")
    public String register(){
        return "register";
    }

    @ResponseBody
    @RequestMapping("/register/do_register")
    public Result<String> doRegister(HttpServletResponse response, @Valid RegisterVo registerVo){
        System.out.println(registerVo.toString());
        String result = userService.register(registerVo);
        return Result.success(result);
    }

    @ResponseBody
    @RequestMapping("/login/do_login")
    public Result<String> doLogin(HttpServletResponse response, @Valid LoginVo loginVo){
        String result = userService.login(loginVo);
        return Result.success(result);
    }
}
