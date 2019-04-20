package com.mooe.grad.redis;

public class BridgeAddrKey extends BasePrefix  {
    public BridgeAddrKey(String prefix){
        super(prefix);
    }
    public static BridgeAddrKey bridgeAddr = new BridgeAddrKey("bridgeAddr");
}
