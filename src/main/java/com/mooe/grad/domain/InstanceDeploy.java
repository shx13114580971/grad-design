package com.mooe.grad.domain;

public class InstanceDeploy {
    private int instance_deploy_id;
    private int host_id;
    private int vcpus;
    private String memory;
    private String disk;
    private String network;
    private String ip_addr;

    public int getInstance_deploy_id() {
        return instance_deploy_id;
    }

    public void setInstance_deploy_id(int instance_deploy_id) {
        this.instance_deploy_id = instance_deploy_id;
    }

    public int getHost_id() {
        return host_id;
    }

    public void setHost_id(int host_id) {
        this.host_id = host_id;
    }

    public int getVcpus() {
        return vcpus;
    }

    public void setVcpus(int vcpus) {
        this.vcpus = vcpus;
    }

    public String getMemory() {
        return memory;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public String getDisk() {
        return disk;
    }

    public void setDisk(String disk) {
        this.disk = disk;
    }

    public String getNetwork() {
        return network;
    }

    public void setNetwork(String network) {
        this.network = network;
    }

    public String getIp_addr() {
        return ip_addr;
    }

    public void setIp_addr(String ip_addr) {
        this.ip_addr = ip_addr;
    }
}
