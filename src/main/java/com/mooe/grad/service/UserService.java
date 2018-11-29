package com.mooe.grad.service;

import com.mooe.grad.dao.UserDao;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.exception.GlobalException;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.UserKey;
import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.util.UUIDUtil;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.LoginVo;
import com.mooe.grad.vo.RegisterVo;
import com.mooe.grad.vo.UserExpVo;
import com.sun.deploy.net.HttpResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class UserService implements Serializable{

    public static final String COOKI_NAME_TOKEN = "token";

    @Autowired
    private UserDao userDao;

    @Autowired
    RedisService redisService;

    @Transactional
    public String login(HttpServletResponse response, LoginVo loginVo){

        if(loginVo == null) {
            throw new GlobalException(CodeMsg.SERVER_ERROR);
        }
        if(!isExist(loginVo.getMobile()))
            throw new GlobalException(CodeMsg.MOBILE_NOT_EXIST);
        User user = userDao.getByMobile(loginVo.getMobile());
        if(!user.getPassword().equals(loginVo.getPassword()))
            throw new GlobalException(CodeMsg.PASSWORD_ERROR);
        //应该返回token的，留白
        String token = UUIDUtil.uuid();
        addCookie(response,token,user);
        return token;
    }

    public void logout(HttpServletResponse response, String token, User user) {
        redisService.delete(UserKey.token, token);
        Cookie cookie = new Cookie(COOKI_NAME_TOKEN, "");
        cookie.setMaxAge(0);
        //避免跨域的问题
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    //将用户token放入cookie，并注入response中
    private void addCookie(HttpServletResponse response, String token, User user){
        redisService.set(UserKey.token, token, user);
        Cookie cookie = new Cookie(COOKI_NAME_TOKEN, token);
        cookie.setMaxAge(UserKey.token.expireSeconds());
        //避免跨域的问题
        cookie.setPath("/");
        response.addCookie(cookie);
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

    public Object getByToken(HttpServletResponse response, String token) {
        if(StringUtils.isEmpty(token)) {
            return null;
        }
        User user = redisService.get(UserKey.token,token,User.class);
        //延长有效期
        if(user != null){
            addCookie(response, token, user);
        }
        return user;
    }

    public void addExp(int user_id, int exp_id) {
        List<UserExpVo> userExpVoList=userDao.getByUserIdAndExpId(user_id,exp_id);
        if(userExpVoList.size() == 0){
            Date createTime = new Date();
            UserExpVo userExpVo = new UserExpVo();
            userExpVo.setUser_id(user_id);
            userExpVo.setExp_id(exp_id);
            userExpVo.setCreate_time(createTime);
            userDao.insertExp(userExpVo);
        }

    }

    public List<ExperimentVo> listExp(int user_id) {
        return userDao.listExperiment(user_id);
    }
}
