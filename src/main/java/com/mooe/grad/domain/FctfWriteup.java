package com.mooe.grad.domain;

import java.util.Date;

public class FctfWriteup {
    private int user_id;
    private int fctf_id;
    private String content;
    private String title;
    private String createtime;

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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCreatetime() {
        return createtime;
    }

    public void setCreatetime(String createtime) {
        this.createtime = createtime;
    }
}
