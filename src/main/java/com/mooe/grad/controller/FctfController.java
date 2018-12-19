package com.mooe.grad.controller;

import com.mooe.grad.domain.Fctf;
import com.mooe.grad.domain.User;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.FctfService;
import com.mooe.grad.service.UserService;
import com.mooe.grad.vo.FctfVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class FctfController {

    @Autowired
    private FctfService fctfService;

    @Autowired
    private UserService userService;

    @RequestMapping("/fctf_profile")
    public String listAll(User user, Model model){
        List<FctfVo> list = fctfService.listAll();
        model.addAttribute("fctfList",list);
        model.addAttribute("user", user);
        return "fctf_profile";
    }

    @RequestMapping("/fctf/{fctf_id}")
    public String fctfPage(@PathVariable("fctf_id") int fctf_id, User user, Model model){
        Fctf fctf = fctfService.findById(fctf_id);
        model.addAttribute("fctf",fctf);
        model.addAttribute("user", user);
        return "fctf";
    }

    @ResponseBody
    @RequestMapping("/fctf/isflag/{flag}")
    public Result<String> isFlag(@PathVariable("flag")String flag, @RequestParam("fctf_id")int fctf_id, User user){
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        if(flag == null || "".equals(flag))Result.error(CodeMsg.EMPTY);
        //添加到用户记录
        userService.addFctf(user.getUser_id(), fctf_id);
        String realFlag = fctfService.getFlag(fctf_id);
        if(flag.equals(realFlag)){
            return Result.success("true");
        }else {
            return Result.success("false");
        }
    }
}
