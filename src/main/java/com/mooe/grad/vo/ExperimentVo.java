package com.mooe.grad.vo;

import java.util.Date;

public class ExperimentVo {

    private int exp_id;
    private String exp_name;
    private String envir_name;
    private Date date;
    private String host_ip;
    private String kvm_ip;
    private String image;
    private String class1;
    private String class2;
    private String degree;
    private String summary;

    public int getExp_id() {
        return exp_id;
    }

    public void setExp_id(int exp_id) {
        this.exp_id = exp_id;
    }

    public String getExp_name() {
        return exp_name;
    }

    public void setExp_name(String exp_name) {
        this.exp_name = exp_name;
    }

    public String getEnvir_name() {
        return envir_name;
    }

    public void setEnvir_name(String envir_name) {
        this.envir_name = envir_name;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getClass1() {
        return class1;
    }

    public void setClass1(String class1) {
        this.class1 = class1;
    }

    public String getClass2() {
        return class2;
    }

    public void setClass2(String class2) {
        this.class2 = class2;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
