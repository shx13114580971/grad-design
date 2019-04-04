package com.mooe.grad.service;

import com.alibaba.fastjson.JSONObject;
import com.mooe.grad.migrate.QemuConnection;
import com.mooe.grad.redis.ExpKey;
import com.mooe.grad.redis.RedisService;
import com.mooe.grad.redis.VncPortKey;
import com.mooe.grad.util.RemoteResult;
import com.mooe.grad.util.RemoteShellExeUtil;
import com.mooe.grad.util.ServerInfoUtil;
import org.libvirt.Connect;
import org.libvirt.LibvirtException;
import org.libvirt.Network;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

@Service
public class VmService {

    @Autowired
    private RedisService redisService;

    private QemuConnection sourceConn = new QemuConnection();
    //在本地执行命令是用这句：Process ps = Runtime.getRuntime().exec(command);
    private RemoteShellExeUtil remoteShellExecutor;
    public int createVM(String envir_name, int user_id, String targetIpAddr, String host_name) throws Exception {
        //分配远程桌面端口
        int vncPort = getVncPort();
        remoteShellExecutor = new RemoteShellExeUtil(targetIpAddr,
                ServerInfoUtil.VmServerUserName, ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        //格式：bash ...../实验名.bash vnc端口号 用户id
        //例：bash ...../ssrf111.bash ssrf111_2 5901
        String cmd_createVm = "bash /home/sheeta/nfs-client/kvm/backing_file/"+envir_name+"/"+ host_name
                +"/"+envir_name+".bash "+vncPort+" "+user_id;

        RemoteResult result = remoteShellExecutor.exec(cmd_createVm);
        if(result.getRet() == -1)return  -1;

        return vncPort;
    }

    public String loadAverage() {

        return "172.26.2.38";
    }

    public int destroyVM(String envir_name, int user_id, String host_name) throws Exception {
        //先获取虚拟机所在IP地址
        String tokenOrKey = envir_name + "_" + String.valueOf(user_id)+ "_" + host_name;
        String value = redisService.get(ExpKey.existARunningVm, tokenOrKey,String.class);
        String ipAddr = value.split(":")[0];
        String vncPort = value.split(":")[1];
        //仨个参数，环境名，用户id与主机名
        String cmd_destroyVm = "bash /home/sheeta/nfs-client/kvm/backing_file/"+envir_name+"/"
                +host_name+"/undefine-remove.bash "+envir_name+" "+user_id+" "+host_name;
        remoteShellExecutor = new RemoteShellExeUtil(ipAddr, ServerInfoUtil.VmServerUserName,
                ServerInfoUtil.VmServerPassword, ServerInfoUtil.port);
        RemoteResult result = remoteShellExecutor.exec(cmd_destroyVm);
        if (result.getRet() == -1)return -1;
        recycleVncPort(vncPort, tokenOrKey);
        return result.getRet();
    }

    public int getVncPort(){
        int vncPort = 0;
        if(!redisService.exists(VncPortKey.vncPort, "")){
            //vnc端口范围9001--9500
            Map<String, Integer> vncPortMap = new HashMap();
            for(int i = 9001; i < 9500; i++){
                vncPortMap.put(String.valueOf(i), 0);
            }
            redisService.set(VncPortKey.vncPort, "", vncPortMap);
        }
        //确定端口号,value是0表示端口空闲，端口是1表示正在使用
        JSONObject vncPortJson = redisService.get(VncPortKey.vncPort, "",  JSONObject.class);
        for(int i = 9001; i < 9500; i++){
            if((int)vncPortJson.get(i) == 0){
                vncPort = i;
                System.out.println(vncPortJson);
                vncPortJson.put(String.valueOf(i),1);
                redisService.set(VncPortKey.vncPort, "", vncPortJson);
                break;
            }
        }
        return vncPort;
    }

    public void recycleVncPort(String vncPort, String tokenOrKey){
        //tokenOrKey = envir_name + "_" + String.valueOf(user_id)+ "_" + host_name;
        JSONObject vncPortJson = redisService.get(VncPortKey.vncPort, "", JSONObject.class);
        //将端口状态置为空闲
        vncPortJson.put(vncPort,0);
        redisService.set(VncPortKey.vncPort, "", vncPortJson);
        redisService.delete(ExpKey.existARunningVm, tokenOrKey);
    }

    public String getVBridge(String targetIp, String envir_name){
        /**
         * <network>
         *     <name>br-vx</name>
         *     <bridge name="br-vx" />
         *     <forward/>
         *     <ip address='192.168.110.1' netmask='255.255.255.0'>
         *         <dhcp>
         *             <range start='192.168.110.3' end='192.168.110.3'/>
         *         </dhcp>
         *     </ip>
         * </networ k>
         * */
        Connect conn = sourceConn.getConn(targetIp);
        String networkXML = "";
        Network network = null;
        //192.168.38.  作为前缀，后面单独根据需求添加
        String bridgeAddrPrefix = "192.168."+targetIp.split("\\.")[3]+".";
        String result = null;
        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        try {
            //制作创建网桥的XML对象
            builder = documentBuilderFactory.newDocumentBuilder();
            Document document = builder.newDocument();
            Element networkRoot = document.createElement("network");
            Element name = document.createElement("name");
            name.setTextContent("br_" + envir_name);
            Element bridge = document.createElement("bridge");
            bridge.setAttribute("name", "br_" + envir_name);
            Element forward = document.createElement("forward");
            Element ip = document.createElement("ip");
            ip.setAttribute("address", bridgeAddrPrefix+"1");
            ip.setAttribute("netmask", "255.255.255.0");
            Element dhcp = document.createElement("dhcp");
            Element range = document.createElement("range");
            range.setAttribute("start", bridgeAddrPrefix+"2");
            range.setAttribute("end", bridgeAddrPrefix+"6");
            dhcp.appendChild(range);
            ip.appendChild(dhcp);
            networkRoot.appendChild(name);
            networkRoot.appendChild(bridge);
            networkRoot.appendChild(forward);
            networkRoot.appendChild(ip);
            //将XML对象转换为字符串
            StringWriter stringWriter = new StringWriter();
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.transform(new DOMSource(document), new StreamResult(stringWriter));
            networkXML = stringWriter.toString();
            System.out.println(networkXML);
            //根据XML生成网桥
            network = conn.networkDefineXML(networkXML);
            result = network.getName();
            conn.close();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (TransformerConfigurationException e) {
            e.printStackTrace();
        } catch (TransformerException e) {
            e.printStackTrace();
        } catch (LibvirtException e) {
            e.printStackTrace();
            return "";
        }
        if(!("br_"+envir_name).equals(result))return "";
        return result;
    }

    public String recycleVBridge(String targetIpAddr, String envir_name) throws LibvirtException {
        Connect conn = sourceConn.getConn(targetIpAddr);
        Network network = conn.networkLookupByName("br_"+envir_name);
        network.destroy();
        network.undefine();
        return  "";
    }
}
