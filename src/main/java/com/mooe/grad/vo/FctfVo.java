package com.mooe.grad.vo;

import java.util.Date;

public class FctfVo {

    private int fctf_id;
    private String fctf_name;
    private String envir_name;
    private String host_ip;
    private String kvm_ip;
    private String type;
    private String degree;
    private Date date;

    public int getFctf_id() {
        return fctf_id;
    }

    public void setFctf_id(int fctf_id) {
        this.fctf_id = fctf_id;
    }

    public String getFctf_name() {
        return fctf_name;
    }

    public void setFctf_name(String fctf_name) {
        this.fctf_name = fctf_name;
    }

    public String getEnvir_name() {
        return envir_name;
    }

    public void setEnvir_name(String envir_name) {
        this.envir_name = envir_name;
    }

    public String getHost_ip() {
        return host_ip;
    }

    public void setHost_ip(String host_ip) {
        this.host_ip = host_ip;
    }

    public String getKvm_ip() {
        return kvm_ip;
    }

    public void setKvm_ip(String kvm_ip) {
        this.kvm_ip = kvm_ip;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
