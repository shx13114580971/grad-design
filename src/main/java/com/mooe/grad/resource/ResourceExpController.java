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
    private ExperimentService experimentService;

    @RequestMapping(value={"/",""})
    public String file(){
        return "resource/index";
    }

    //跳转页面
    @RequestMapping("/exp_deploy")
    public String expDeploy(Model model){
        List<Environment> environmentList = experimentService.listEnvir();
        model.addAttribute("envirList",environmentList);
        return "resource/exp_deploy";
    }

    @RequestMapping("/host_list/{envir_id}")
    public String envirView(@PathVariable("envir_id")int envir_id, Model model){
        List<VmHostVo> vmHostList = experimentService.listVmHost(envir_id);
        //判断三个文件是否在路径下,临时解决方案
        int i = 0;
        for(VmHostVo vmHostVo : vmHostList){
            String hostPath = experimentService.getEnvirPath(vmHostVo.getEnvir_id()) + "\\" + vmHostVo.getHost_name() + "\\";
            //文件存在返回路径，不存在返回null
            String qcow2Path = isExist(hostPath, vmHostVo.getHost_name()+".qcow2");
            String createBash = isExist(hostPath, vmHostVo.getHost_name()+".bash");
            String destroyBash = isExist(hostPath, "undefine-remove.bash");
            vmHostVo.setQcow2_path(qcow2Path);
            vmHostVo.setCreate_bash(createBash);
            vmHostVo.setDestroy_bash(destroyBash);
            vmHostList.set(i, vmHostVo);
            i++;
        }
        model.addAttribute("vmHostList",vmHostList);
        return "resource/host_list";
    }

    public String isExist(String path, String filename){
        File file = new File(path, filename);
        File parentFile = file.getParentFile();
        if (!parentFile.exists()){
            parentFile.mkdirs();
        }
        //文件存在返回路径，不存在返回null
        if(file.exists())return file.getPath();
        else return null;
    }

    //查看主机信息
    @RequestMapping("/host_view/{host_id}")
    public String viewHost(@PathVariable("host_id")int host_id, Model model){
        VmHost vmHost = experimentService.getVmHost(host_id);
        model.addAttribute("vmHost", vmHost);
        return "resource/host_view";
    }

}
