package com.mooe.grad.config;

import com.mooe.grad.domain.User;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@Service
public class UserArgumentResolver implements HandlerMethodArgumentResolver {

    @Autowired
    private RedisService redisService;

    @Autowired
    private UserService userService;

    public boolean supportsParameter(MethodParameter parameter){
        Class<?> clazz = parameter.getParameterType();
        return clazz == User.class;
    }

    //supportsParameter返回为true时，才会执行下面方法进行参数解析
    //在这里通过token来验证是否登录，若已登录则从redis中将用户对象取出（getByToken）
    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
                           NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception{
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        HttpServletResponse response = webRequest.getNativeResponse(HttpServletResponse.class);
        //现在可能还用不到
        String paramToken = request.getParameter(UserService.COOKI_NAME_TOKEN);
        String cookieToken = getCookieValue(request,UserService.COOKI_NAME_TOKEN);
        if(StringUtils.isEmpty(cookieToken) && StringUtils.isEmpty(paramToken)) {
            return null;
        }
        String token = StringUtils.isEmpty(paramToken)?cookieToken:paramToken;
        return userService.getByToken(response, token);
    }

    private String getCookieValue(HttpServletRequest request,String cookiNameToken) {
        Cookie[] cookies = request.getCookies();
        if(cookies == null || cookies.length <= 0){
            return null;
        }
        for(Cookie cookie : cookies){
            if(cookie.getName().equals(cookiNameToken)){
                return cookie.getValue();
            }
        }
        return null;
    }
}
