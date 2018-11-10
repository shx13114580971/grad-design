package com.mooe.grad.vo;

import java.util.Date;

public class CommemtVo {
    private int expfctf_id;
    private int com_id;
    private String userName;
    private int score;
    private String content;
    private String createtime;

    public int getExpfctf_id() {
        return expfctf_id;
    }

    public void setExpfctf_id(int expfctf_id) {
        this.expfctf_id = expfctf_id;
    }

    public int getCom_id() {
        return com_id;
    }

    public void setCom_id(int com_id) {
        this.com_id = com_id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreatetime() {
        return createtime;
    }

    public void setCreatetime(String createtime) {
        this.createtime = createtime;
    }


}
