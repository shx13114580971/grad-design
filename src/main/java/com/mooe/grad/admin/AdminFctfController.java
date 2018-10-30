package com.mooe.grad.admin;


import com.mooe.grad.domain.Fctf;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.FctfService;
import com.mooe.grad.vo.FctfVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminFctfController {

    @Autowired
    private FctfService fctfService;

    @RequestMapping("/fctf_list")
    public String listAll(Model model){
        List<FctfVo> list = fctfService.listAll();
        model.addAttribute("fctfList",list);
        return "admin/fctf_list";
    }

    //跳转到新增页面
    @RequestMapping("/fctf_info")
    public String fctf_info(){
        return "admin/fctf_info";
    }

    @RequestMapping("/fctf_update/{fctf_id}")
    public String fctf_info(Model model, @PathVariable("fctf_id")int id){
        model.addAttribute("fctf",fctfService.findById(id));
        return "admin/fctf_update";
    }

    @ResponseBody
    @RequestMapping("/fctf_update")
    public Result<String> fctf_info(Fctf fctf){
        String result = fctfService.updateFctf(fctf);
        return Result.success(result);
    }

    @ResponseBody
    @RequestMapping("/fctf_add")
    public Result<String> addFctf(Fctf fctf){
        String result = fctfService.addFctf(fctf);
        return Result.success(result);
    }

}
