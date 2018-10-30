package com.mooe.grad.vo;

import javax.validation.constraints.NotNull;

public class RegisterVo {

    @NotNull
    private String username;
    @NotNull
    private String password;
    @NotNull
    private String mobile;

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

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    @Override
    public String toString(){
        return "username:"+username+",password:"+password+",mobile:"+mobile;
    }
}
