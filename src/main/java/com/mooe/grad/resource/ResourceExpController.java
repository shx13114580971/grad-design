package com.mooe.grad.resource;


import com.mooe.grad.domain.Environment;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.VmHost;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.VmHostVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/resource")
public class ResourceExpController {

    @Autowired
    private ExperimentService experimentSeivice;

    @RequestMapping(value={"/",""})
    public String file(){
        return "resource/index";
    }

    //跳转页面
    @RequestMapping("/exp_deploy")
    public String expDeploy(Model model){
        List<Environment> environmentList = experimentSeivice.listEnvir();
        model.addAttribute("envirList",environmentList);
        return "resource/exp_deploy";
    }

    @RequestMapping("/host_list/{envir_id}")
    public String envirView(@PathVariable("envir_id")int envir_id, Model model){
        List<VmHostVo> vmHostList = experimentSeivice.listVmHost(envir_id);
        model.addAttribute("vmHostList",vmHostList);
        return "resource/host_list";
    }

    //查看主机信息
    @RequestMapping("/host_view/{host_id}")
    public String viewHost(@PathVariable("host_id")int host_id, Model model){
        VmHost vmHost = experimentSeivice.getVmHost(host_id);
        model.addAttribute("vmHost", vmHost);
        return "resource/host_view";
    }

}
