package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.ExperimentService;
import com.mooe.grad.service.UserService;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ExperimentController {

    @Autowired
    private ExperimentService experimentService;

    @Autowired
    private UserService userService;

    @RequestMapping("/vnc")
    public String vnc_html(User user,Model model,@RequestParam("path") String path ){
        if(user == null)return "/login";
        String firstToken = path.split("token=")[1];
        List<String> tokenList = experimentService.listToken(firstToken);
        model.addAttribute("token_list", tokenList);
        model.addAttribute("token_current", tokenList.get(0));
        return "vnc";
    }

    @RequestMapping("/exp_profile")
    public String listAll(User user, Model model){
        List<ExperimentVo> list = experimentService.listAll();
        model.addAttribute("experimentsList",list);
        model.addAttribute("user", user);
        return "exp_profile";
    }

    @RequestMapping("/experiment/{exp_id}")
    public String expPage(@PathVariable("exp_id") int exp_id,User user, Model model){
        model.addAttribute("experiment", experimentService.findById(exp_id));
        //临时这么处理
        model.addAttribute("user", user);
        return "experiment";
    }

    @ResponseBody
    @RequestMapping("/experiment/createExp/{envir_name}")
    public Result<String> createExp(@PathVariable("envir_name") String envir_name, @RequestParam("exp_id") int exp_id, User user, Model model) throws Exception {
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        //添加到用户的记录
        userService.addExp(user.getUser_id(), exp_id);
        String token = experimentService.getExp(user.getUser_id(),envir_name, exp_id);
        if (token == null || "".equals(token))return Result.error(CodeMsg.VM_CREATE_ERROR);
        return Result.success(token);
    }

    @ResponseBody
    @RequestMapping("/experiment/vm_isRunning")
    public Result<String> vm_isRunning(User user, Model model) throws Exception {
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        String flag = experimentService.isRunning(user.getUser_id());
        return Result.success(flag);
    }

    @ResponseBody
    @RequestMapping("/experiment/endExp/{envir_name}")
    public Result<String> endExp(@PathVariable("envir_name") String envir_name, User user) throws Exception {
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        String result = experimentService.endExp(user.getUser_id(),envir_name);
        if ("".equals(result) || result == null)return Result.error(CodeMsg.VM_DESTROY_ERROR);
        return Result.success(result);
    }

    @ResponseBody
    @RequestMapping("/experiment/enterExp")
    public Result<String> enterExp(User user){
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        String firstToken = experimentService.getFirstToken(user.getUser_id());
        if("".equals(firstToken) || firstToken == null)return Result.error(CodeMsg.VM_RUNNING_ERROR);
        return Result.success(firstToken);
    }

    @RequestMapping("/experiment/comment")
    @ResponseBody
    public Result<String> comment(User user, CommemtVo commemtVo){
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        experimentService.addComment(user,commemtVo);
        return Result.success("");
    }

    @RequestMapping("/experiment/commentList/{exp_id}")
    @ResponseBody
    public Result<List<CommemtVo>> commentList(@PathVariable("exp_id") int exp_id, int pageNum){
        List<CommemtVo> list = experimentService.listComments(exp_id);
        int commentCount = list.size();
        Result<List<CommemtVo>> result;
        if(pageNum < Math.ceil(commentCount/10)){
            result = Result.success(list.subList((pageNum-1)*10,(pageNum-1)*10+10));
        }else{
            result = Result.success(list.subList((pageNum-1)*10,commentCount));
        }

        //借用了一下msg来存储评论数量，反正这里也用不到msg ，。，
        result.setMsg(String.valueOf(commentCount));
        return result;
    }
}
