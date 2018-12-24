package com.mooe.grad.result;

public class EditorResult {
    private int errno;
    private String[] data;

    public static EditorResult success(String[] data){return new EditorResult(data);}

    public EditorResult(String[] data){
        this.errno = 0;
        this.data = data;
    }
    public int getErrno() {
        return errno;
    }

    public void setErrno(int errno) {
        this.errno = errno;
    }

    public String[] getData() {
        return data;
    }

    public void setData(String[] data) {
        this.data = data;
    }
}
