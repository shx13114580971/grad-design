package com.mooe.grad.migrate;

import org.libvirt.Connect;
import org.libvirt.LibvirtException;
import org.springframework.stereotype.Service;

@Service
public class QemuConnection {
    // 私有构造
    public QemuConnection() {}

    private Connect conn = null;

    public Connect getConn(String VmServerIp){
        try{
            conn = new Connect("qemu+tcp://"+ VmServerIp+":16509/system", false);
        } catch (LibvirtException e) {
            System.out.println("exception caught:"+e);
            System.out.println(e.getError());
        }
        return conn;
    }
    // 双重检查
//    public static Connect getConn() {
//        if (conn == null) {
//            synchronized (Connect.class) {
//                if (conn == null) {
//                    try{
//                        conn = new Connect("qemu+tcp://172.26.2.38:16509/system", false);
//                    } catch (LibvirtException e) {
//                        System.out.println("exception caught:"+e);
//                        System.out.println(e.getError());
//                    }
//                }
//            }
//        }
//        return conn;
//    }
}
