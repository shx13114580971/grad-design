package com.mooe.grad.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminUserController {
    @RequestMapping("/")
    public String user(){
        return "admin/index";
    }
}
