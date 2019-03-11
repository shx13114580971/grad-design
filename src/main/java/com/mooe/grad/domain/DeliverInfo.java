package com.mooe.grad.domain;

public class DeliverInfo {
    private int deliver_id;
    private String exp_name;
    private String designer;
    private String document;
    private String is_provide_vm;
    private String vmzip;
    private String deploy_RD;
    private String create_time;

    public int getDeliver_id() {
        return deliver_id;
    }

    public void setDeliver_id(int deliver_id) {
        this.deliver_id = deliver_id;
    }

    public String getExp_name() {
        return exp_name;
    }

    public void setExp_name(String exp_name) {
        this.exp_name = exp_name;
    }

    public String getDesigner() {
        return designer;
    }

    public void setDesigner(String designer) {
        this.designer = designer;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public String getIs_provide_vm() {
        return is_provide_vm;
    }

    public void setIs_provide_vm(String is_provide_vm) {
        this.is_provide_vm = is_provide_vm;
    }

    public String getVmzip() {
        return vmzip;
    }

    public void setVmzip(String vmzip) {
        this.vmzip = vmzip;
    }

    public String getDeploy_RD() {
        return deploy_RD;
    }

    public void setDeploy_RD(String deploy_RD) {
        this.deploy_RD = deploy_RD;
    }

    public String getCreate_time() {
        return create_time;
    }

    public void setCreate_time(String create_time) {
        this.create_time = create_time;
    }
}
