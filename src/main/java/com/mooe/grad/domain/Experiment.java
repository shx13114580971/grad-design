package com.mooe.grad.domain;


import java.util.Date;

public class Experiment {

    private int exp_id;
    private String exp_name;
    private String envir_name;
    private String class1;
    private String class2;
    private String degree;
    private String brief_intro;
    private String host_ip;
    private String kvm_ip;
    private Date date;
    private int user_count;
    private String image;
    private String question;
    private String document;
    private String summary;
    private String remark;

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

    public void setEnvir_name(String envri_name) {
        this.envir_name = envri_name;
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

    public String getBrief_intro() {
        return brief_intro;
    }

    public void setBrief_intro(String brief_intro) {
        this.brief_intro = brief_intro;
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

    public int getUser_count() {
        return user_count;
    }

    public void setUser_count(int user_count) {
        this.user_count = user_count;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
