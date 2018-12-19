package com.mooe.grad.domain;

import java.util.Date;

public class Fctf {
    private int fctf_id;
    private String fctf_name;
    private String type;
    private String content_addr;
    private String degree;
    private String area;
    private String flag;
    private String envir_name;
    private String host_ip;
    private String kvm_ip;
    private Date date;
    private int usr_count;
    private String brief_intro;
    private String point;
    private String writeup;
    private String tip;
    private String remark;

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

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public String getEnvir_name() {
        return envir_name;
    }

    public void setEnvir_name(String envir_name) {
        this.envir_name = envir_name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent_addr() {
        return content_addr;
    }

    public void setContent_addr(String content_addr) {
        this.content_addr = content_addr;
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

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getUsr_count() {
        return usr_count;
    }

    public void setUsr_count(int usr_count) {
        this.usr_count = usr_count;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getBrief_intro() {
        return brief_intro;
    }

    public void setBrief_intro(String brief_intro) {
        this.brief_intro = brief_intro;
    }

    public String getPoint() {
        return point;
    }

    public void setPoint(String point) {
        this.point = point;
    }

    public String getWriteup() {
        return writeup;
    }

    public void setWriteup(String writeup) {
        this.writeup = writeup;
    }

    public String getTip() {
        return tip;
    }

    public void setTip(String tip) {
        this.tip = tip;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
