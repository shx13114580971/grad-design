package com.mooe.grad.admin;

import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.VncPortKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class test {
    @Autowired
    private static RedisService redisService;
    public static void main(String[] args){
        Map<Integer, Integer> vncPortMap = new HashMap<>();
        vncPortMap.put(3000,1);
        vncPortMap.put(3001,1);
        vncPortMap.put(3002,1);
        System.out.println(vncPortMap);
    }
}
