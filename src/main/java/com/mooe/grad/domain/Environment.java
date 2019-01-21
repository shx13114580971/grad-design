package com.mooe.grad.domain;

public class Environment {
    private int envir_id;
    private int exp_id;
    private String envir_name;
    private String update_time;
    private int host_num;
    private boolean is_provide_vm;
    private String status;

    public int getEnvir_id() {
        return envir_id;
    }

    public void setEnvir_id(int envir_id) {
        this.envir_id = envir_id;
    }

    public int getExp_id() {
        return exp_id;
    }

    public void setExp_id(int exp_id) {
        this.exp_id = exp_id;
    }

    public String getEnvir_name() {
        return envir_name;
    }

    public void setEnvir_name(String envir_name) {
        this.envir_name = envir_name;
    }

    public String getUpdate_time() {
        return update_time;
    }

    public void setUpdate_time(String update_time) {
        this.update_time = update_time;
    }

    public int getHost_num() {
        return host_num;
    }

    public void setHost_num(int host_num) {
        this.host_num = host_num;
    }

    public boolean isIs_provide_vm() {
        return is_provide_vm;
    }

    public void setIs_provide_vm(boolean is_provide_vm) {
        this.is_provide_vm = is_provide_vm;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
