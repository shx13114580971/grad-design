package com.mooe.grad.vo;

import javax.validation.constraints.NotNull;

public class LoginVo {
    @NotNull
    private String password;
    @NotNull
    private String mobile;

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
}
