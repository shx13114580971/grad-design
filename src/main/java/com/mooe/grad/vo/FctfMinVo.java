package com.mooe.grad.vo;

public class FctfMinVo {
    private int fctf_id;
    private String fctf_name;

    public FctfMinVo(int fctf_id, String fctf_name){
        this.fctf_id = fctf_id;
        this.fctf_name = fctf_name;
    }

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
}
