package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.domain.UserExp;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.service.TestService;
import com.mooe.grad.vo.ExperimentVo;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/test")
public class TestController {

    @Autowired
    private TestService testService;

    @Autowired
    private ExperimentService experimentService;

    @RequestMapping("")
    public String list(User user, Model model){
        model.addAttribute("user", user);
        return "test";
    }


    @ResponseBody
    @RequestMapping("/recommExp")
    public Result<List> recommExp(ExperimentVo experimentVo, User user){

        List<String> expNameList = testService.getRecommExp(experimentVo, user.getUser_id());
        return Result.success(expNameList);
    }

    @ResponseBody
    @RequestMapping("/test_exp/")
    public Result<String> getTestExpId(@RequestParam("testClass") String class1, User user, Model model){
        if (user == null)return Result.error(CodeMsg.SESSION_ERROR);
        String testId = testService.getStartTestExpId(class1, user.getUser_id());
        return Result.success(testId);
    }
    @RequestMapping("/test_exp")
    public String getTestExp(@RequestParam("testClass") String class1,
                                     @RequestParam("testId") String testId, User user, Model model){
        model.addAttribute("user", user);
        Experiment experiment = testService.startTestExp(testId);
        model.addAttribute("experiment", experiment);
        return "test_exp";
    }

    @ResponseBody
    @RequestMapping("/test_exp/{envir_name}")
    public Result<String> getExp(@PathVariable("envir_name") String envir_name, User user, Model model) throws Exception {
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        //String url = experimentService.getExp(envir_name);
        return Result.success("");
    }

}
