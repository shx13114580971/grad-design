package com.mooe.grad.domain;

public class VmHost {
    private int host_id;
    private String host_name;
    private int envir_id;
    private String host_ip;
    private String tools;
    private String os;
    private String username;
    private String password;
    private String update_time;
    private String qcow2_path;
    private String create_bash;
    private String destroy_bash;
    private String remark;

    public int getHost_id() {
        return host_id;
    }

    public void setHost_id(int host_id) {
        this.host_id = host_id;
    }

    public String getHost_name() {
        return host_name;
    }

    public void setHost_name(String host_name) {
        this.host_name = host_name;
    }

    public int getEnvir_id() {
        return envir_id;
    }

    public void setEnvir_id(int envir_id) {
        this.envir_id = envir_id;
    }

    public String getHost_ip() {
        return host_ip;
    }

    public void setHost_ip(String host_ip) {
        this.host_ip = host_ip;
    }

    public String getTools() {
        return tools;
    }

    public void setTools(String tools) {
        this.tools = tools;
    }

    public String getOs() {
        return os;
    }

    public void setOs(String os) {
        this.os = os;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUpdate_time() {
        return update_time;
    }

    public void setUpdate_time(String update_time) {
        this.update_time = update_time;
    }

    public String getQcow2_path() {
        return qcow2_path;
    }

    public void setQcow2_path(String qcow2_path) {
        this.qcow2_path = qcow2_path;
    }

    public String getCreate_bash() {
        return create_bash;
    }

    public void setCreate_bash(String create_bash) {
        this.create_bash = create_bash;
    }

    public String getDestroy_bash() {
        return destroy_bash;
    }

    public void setDestroy_bash(String destroy_bash) {
        this.destroy_bash = destroy_bash;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
