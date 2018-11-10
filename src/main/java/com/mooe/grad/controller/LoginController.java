package com.mooe.grad.controller;

import com.mooe.grad.domain.User;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.UserService;
import com.mooe.grad.vo.LoginVo;
import com.mooe.grad.vo.RegisterVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.NativeWebRequest;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
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
        String token = userService.login(response,loginVo);
        return Result.success(token);
    }

    @ResponseBody
    @RequestMapping("/login/do_logout")
    public Result<String> doLogout(NativeWebRequest webRequest, HttpServletResponse response, User user){
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        Cookie[] cookies = request.getCookies();
        for(Cookie cookie : cookies){
            if(cookie.getName().equals(UserService.COOKI_NAME_TOKEN)){
                userService.logout(response,cookie.getValue(),user);
            }
        }
        return Result.success("logout");
    }
}
