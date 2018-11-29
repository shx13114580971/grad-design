package com.mooe.grad.redis;

public class ExpKey extends BasePrefix {
    public ExpKey(String prefix){
        super(prefix);
    }
    public static ExpKey expVmNum = new ExpKey("exp");
}
