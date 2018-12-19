package com.mooe.grad.vo;

import java.util.Date;

public class UserFctfVo {
    private int user_id;
    private int fctf_id;
    private Date create_time;

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    public int getFctf_id() {
        return fctf_id;
    }

    public void setFctf_id(int fctf_id) {
        this.fctf_id = fctf_id;
    }

    public Date getCreate_time() {
        return create_time;
    }

    public void setCreate_time(Date create_time) {
        this.create_time = create_time;
    }
}
