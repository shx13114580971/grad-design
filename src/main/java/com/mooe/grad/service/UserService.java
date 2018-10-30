package com.mooe.grad.service;

import com.mooe.grad.dao.UserDao;
import com.mooe.grad.domain.User;
import com.mooe.grad.exception.GlobalException;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.vo.LoginVo;
import com.mooe.grad.vo.RegisterVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;

@Service
public class UserService implements Serializable{


    @Autowired
    private UserDao userDao;


    @Transactional
    public String login(LoginVo loginVo){
        /**
         * token问题留白
         * */
        if(!isExist(loginVo.getMobile()))
            throw new GlobalException(CodeMsg.MOBILE_NOT_EXIST);
        User user = userDao.getByMobile(loginVo.getMobile());
        if(!user.getPassword().equals(loginVo.getPassword()))
            throw new GlobalException(CodeMsg.PASSWORD_ERROR);
        //应该返回token的，留白
        return "success";
    }

    @Transactional
    public String register(RegisterVo registerVo){
        /**
         * token问题留白
         * */
        if(isExist(registerVo.getMobile()))
            throw new GlobalException(CodeMsg.MOBILE_EXIST);
        User user = new User();
        user.setUsername(registerVo.getUsername());
        user.setPassword(registerVo.getPassword());
        user.setMobile(registerVo.getMobile());
        userDao.insert(user);
        return registerVo.toString();
    }

    private boolean isExist(String mobile){
        User user = userDao.getByMobile(mobile);
        if(user != null)return true;
        else return false;
    }
}
