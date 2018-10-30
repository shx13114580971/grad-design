package com.mooe.grad.controller;

import com.mooe.grad.domain.Fctf;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.FctfService;
import com.mooe.grad.vo.FctfVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
public class FctfController {

    @Autowired
    private FctfService fctfService;

    @RequestMapping("/fctf_profile")
    public String listAll(Model model){
        List<FctfVo> list = fctfService.listAll();
        model.addAttribute("fctfList",list);
        return "fctf_profile";
    }

    @RequestMapping("/fctf/{fctf_id}")
    public String fctfPage(@PathVariable("fctf_id") int fctf_id, Model model){
        Fctf fctf = fctfService.findById(fctf_id);
        model.addAttribute("fctf",fctf);
        return "fctf";
    }
}
