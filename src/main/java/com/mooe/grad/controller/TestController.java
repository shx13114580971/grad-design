package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.Fctf;
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
        List<ExperimentVo> expNameList = testService.getRecommExp(experimentVo, user.getUser_id());
        return Result.success(expNameList);
    }

    //将测试通过的实验添加到数据库，并选取下一个实验进行测试，返回实验id
    @ResponseBody
    @RequestMapping("/next_exp/{exp_id}")
    public Result<String> insertThisAndGetNext(@PathVariable("exp_id")int exp_id,
                                               @RequestParam("class1")String class1, User user){
        if (user == null)return Result.error(CodeMsg.SESSION_ERROR);
        String testId = testService.insertThisAndGetNextExp(exp_id, user.getUser_id(), class1);
        return Result.success(testId);
    }

    @ResponseBody
    @RequestMapping("/test_exp/")
    public Result<String> getTestExpId(@RequestParam("testClass") String class1, User user){
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
    @RequestMapping("/test_fctf/")
    public Result<String> getTestFctfId(@RequestParam("testArea") String area, User user){
        if (user == null)return Result.error(CodeMsg.SESSION_ERROR);
        String testId = testService.getStartTestFctfId(area, user.getUser_id());
        return Result.success(testId);
    }

    @RequestMapping("/test_fctf")
    public String getTestFctf(@RequestParam("testArea") String area,
                             @RequestParam("testId") String testId, User user, Model model){
        model.addAttribute("user", user);
        Fctf fctf = testService.startTestFctf(testId);
        model.addAttribute("fctf", fctf);
        return "test_fctf";
    }

    @ResponseBody
    @RequestMapping("/test_exp/{envir_name}")
    public Result<String> getExp(@PathVariable("envir_name") String envir_name, User user, Model model) throws Exception {
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        //String url = experimentService.getExp(envir_name);
        return Result.success("");
    }

}
