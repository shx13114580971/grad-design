package com.mooe.grad.vo;

import java.util.ArrayList;
import java.util.List;

public class VncPortVo {
    private List<Integer> vncPortList = new ArrayList<>();
    public VncPortVo(){
        for(int i = 9001; i < 10000; i++){
            vncPortList.add(i);
        }
    }
}
