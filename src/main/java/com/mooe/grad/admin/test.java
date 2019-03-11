package com.mooe.grad.admin;

import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.VncPortKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class test {
    public static void main(String[] args) {
        long t = System.currentTimeMillis();//获得当前时间的毫秒数
        Random rd = new Random(t);//作为种子数传入到Random的构造器中
        System.out.println(rd.nextInt(40));//生成随即整数
    }


}
