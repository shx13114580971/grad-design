package com.mooe.grad.controller;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;
import com.mooe.grad.service.UserService;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.FctfVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.UUID;

@Controller
public class UserController {


    @Autowired
    private UserService userService;

    @RequestMapping("/myhome_info")
    public String info(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_info";
    }

    @RequestMapping("/myhome_exp")
    public String exp(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        List<ExperimentVo> experimentsList = userService.listExp(user.getUser_id());
        model.addAttribute("experimentsList",experimentsList);
        return "myhome_exp";
    }

    @RequestMapping("/myhome_fctf")
    public String fctf(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        List<FctfVo> fctfList = userService.listFctf(user.getUser_id());
        model.addAttribute("fctfList",fctfList);
        return "myhome_fctf";
    }

    @RequestMapping("/myhome_test")
    public String list(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_test";
    }


    @RequestMapping("/myhome_design")
    public String designList(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_design";
    }

    @RequestMapping("/myhome_deliver")
    public String deliver(User user, Model model){
        if(user == null)return "login";
        model.addAttribute("user", user);
        return "myhome_deliver";
    }

    @ResponseBody
    @RequestMapping("/myhome_deliver/do_deliver")
    public Result<String> doDeliver(@RequestParam(name = "document", required=false) MultipartFile document,
                                    @RequestParam(name = "deploy", required=false) MultipartFile deploy,
                                    @RequestParam(name = "vmImg", required=false) MultipartFile vmImg,
                                    String isProvideVm, String createTime , User user) throws IOException {
        if(user == null)return Result.error(CodeMsg.SESSION_ERROR);
        DateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
        MultipartFile file1 = document;
        MultipartFile file2 = vmImg;
        if(isProvideVm.equals("0"))file2 = deploy;
        /**
         * filePath1 is exp document
         * filePath2 is deploy document or vm image zip/tar/.. file
         * */
        String filePath1 = "", filePath2 = "";
        Calendar calendar = Calendar.getInstance();
        /**
         * fileName1 is exp document
         * fileName2 is deploy document or vm image zip/tar/.. file
         * */
        String fileName1 = df.format(calendar.getTime())+file1.getOriginalFilename();
        String fileName2 = df.format(calendar.getTime())+file2.getOriginalFilename();
        System.out.println(fileName1+"-------"+fileName2);
        filePath1 = "D:\\研\\毕设\\tempFileServer\\expDocuments\\";
        if(isProvideVm.equals("0"))filePath2 = "D:\\研\\毕设\\tempFileServer\\deployDocuments\\";
        if(isProvideVm.equals("1"))filePath2 = "D:\\研\\毕设\\tempFileServer\\vmImgs\\";
        //String filePath = request.getSession().getServletContext().getRealPath("upload/");
        System.out.println(filePath1+"----------"+filePath2);
        File uploadFile1 = new File(filePath1, fileName1);
        File uploadFile2 = new File(filePath2, fileName2);
        createFile(uploadFile1);
        createFile(uploadFile2);
        String documentPath = uploadFile1.getPath();
        String imgPath = uploadFile2.getAbsolutePath();
        file1.transferTo(uploadFile1);
        file2.transferTo(uploadFile2);
        userService.addDeliver(uploadFile1.getPath(), uploadFile2.getPath(), isProvideVm, user.getUsername(), createTime);
        return Result.success("");
    }

    public void createFile(File file) throws IOException {
        File parentFile = file.getParentFile();
        if (!parentFile.exists()){
            parentFile.mkdirs();
        }
        file.createNewFile();
    }

    @RequestMapping("/user/update")
    public String  updateUserInfo(){
        return "";
    }

}
