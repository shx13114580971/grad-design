package com.mooe.grad.resource;


import com.mooe.grad.domain.Environment;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.VmHost;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.vo.ExperimentVo;
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
public class ResController {

    @RequestMapping(value={"/",""})
    public String file(){
        return "resource/index";
    }


}
