package com.mooe.grad.controller;

import com.mooe.grad.result.EditorResult;
import com.mooe.grad.util.ServerInfoUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Controller
@RequestMapping("/upload")
public class FileUploadController {

    @ResponseBody
    @RequestMapping("/images")
    public EditorResult images(@RequestParam("img1") MultipartFile multipartFile,
                               HttpServletResponse response, HttpServletRequest request) throws IOException {
        String path = "http://"+ ServerInfoUtil.fileServerIp+":"+ServerInfoUtil.fileServer_port+"/image/";
        System.out.println(path);
        String realName = "";

        if (multipartFile != null) {
            String fileName = multipartFile.getOriginalFilename();
            String fileNameExtension = fileName.substring(fileName.indexOf("."), fileName.length() - 1);
            realName = UUID.randomUUID().toString() + fileNameExtension;
            File uploadFile = new File(path, realName);
            multipartFile.transferTo(uploadFile);
        }
        String[] imgUrl = {path + realName};
        System.out.println("imgUrl"+imgUrl);
        response.setContentType("text/text;charset=utf-8");
        System.out.println(EditorResult.success(imgUrl));
        return EditorResult.success(imgUrl);
    }
}
