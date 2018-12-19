package com.mooe.grad.redis;

public class ExpKey extends BasePrefix {
    public ExpKey(String prefix){
        super(prefix);
    }
    public ExpKey(int expireSeconds,String prefix){
        super(expireSeconds, prefix);
    }
    public static ExpKey expVmNum = new ExpKey("exp");
    public static ExpKey existARunningVm = new ExpKey("user_exp_");
}
