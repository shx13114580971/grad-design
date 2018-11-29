package com.mooe.grad.redis;

public class VncPortKey extends BasePrefix  {
    public VncPortKey(String prefix){
        super(prefix);
    }
    public static VncPortKey vncPort = new VncPortKey("vncPort");
}
