package com.mooe.grad.domain;

import com.mooe.grad.domain.HostInfo;
import org.libvirt.Domain;
import org.libvirt.LibvirtException;


public class VmMigrate {
	/** The id. */
	private int id;

	//已用
	/** The number of PEs. */
	private int numberOfPes;

	/** The ram. */
	private long ram;

	/** The bw. */
	private long bw;

	private Domain domain;

	/** The host. */
	private HostInfo host;

	/** In migration flag. */
	private boolean inMigration;
	//使用率
	private double uVCPU;
	private double uVNet;
	private double uVMem;
	private double load;
	private double migrEfficiency;
	/** The VM is being instantiated. */
	private boolean beingInstantiated;
	//对宿主机的占用率
	private double uVCPUofHost;
	private double uVMemofHost;
	private double uVNetofHost;

	public VmMigrate(){}

	//确定待迁虚拟机之后再设置id
	public VmMigrate(Domain domain, HostInfo hostRunningVm) throws LibvirtException {
		this.domain = domain;
		this.host = hostRunningVm;
		try {
			this.numberOfPes = domain.getMaxVcpus();
 			this.ram = domain.getMaxMemory();
            //带宽是能获取到的
			this.bw = 10240 / 8;

		} catch (LibvirtException e) {
			e.printStackTrace();
		}
		setInMigration(false);
		setBeingInstantiated(true);
	}

	/**
	 * 获取实验资源利用率
	 * @return
	 */
	public double getLoad(){
		return load;
	}

	//计算实验/VM的负载值，应该是使用其各项指标对宿主机的资源占用率，而不是VM自身的占用率
	public void setLoad(double uVCPU, double uVMem, double uVNet){
		this.uVCPU = uVCPU;
		this.uVMem = uVMem;
		this.uVNet = uVNet;
		this.uVCPUofHost = uVCPU * ((double) this.numberOfPes / (double) this.host.getPesNum());
		this.uVMemofHost = uVMem * ((double)this.ram / (double)this.host.getRam());
		this.uVNetofHost = uVNet * ((double)this.bw / (double)this.host.getBw());
		load=(1/(1-uVCPU/100))*((1/(1-uVMem/100)))*(1/(1-uVNet/100));
		//通过cpu使用率、内存使用率及带宽使用率计算负载情况
		//load = Math.sqrt(uVCPUofHost*uVCPUofHost+uVMemofHost*uVMemofHost+uVNetofHost*uVNetofHost);
		//load = Math.sqrt(uVCPU*uVCPU+uVMem*uVMem+uVNet*uVNet);
	}

	/**
	 * 获取实验迁移效率评价值
	 * */
	public double getMigrEfficiency(){
		migrEfficiency = this.load /(this.uVMem * this.ram /100 / 1000);
		return migrEfficiency;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getNumberOfPes() {
		return numberOfPes;
	}

	public void setNumberOfPes(int numberOfPes) {
		this.numberOfPes = numberOfPes;
	}

	public long getRam() {
		return ram;
	}

	public void setRam(int ram) {
		this.ram = ram;
	}

	public long getBw() {
		return bw;
	}

	public void setBw(long bw) {
		this.bw = bw;
	}

	public Domain getDomain() {
		return domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
	}

	public void setHost(HostInfo host) {
		this.host = host;
	}

	public HostInfo getHost() {
		return host;
	}

	public boolean isInMigration() {
		return inMigration;
	}

	public void setInMigration(boolean inMigration) {
		this.inMigration = inMigration;
	}

	public boolean isBeingInstantiated() {
		return beingInstantiated;
	}

	public void setBeingInstantiated(boolean beingInstantiated) {
		this.beingInstantiated = beingInstantiated;
	}

	public double getuVCPU() {
		return uVCPU;
	}

	public void setuVCPU(double uVCPU) {
		this.uVCPU = uVCPU;
	}

	public double getuVNet() {
		return uVNet;
	}

	public void setuVNet(double uVNet) {
		this.uVNet = uVNet;
	}

	public double getuVMem() {
		return uVMem;
	}

	public void setuVMem(double uVMem) {
		this.uVMem = uVMem;
	}

	public double getuVCPUofHost() {
		return uVCPUofHost;
	}

	public void setuVCPUofHost(double uVCPUofHost) {
		this.uVCPUofHost = uVCPUofHost;
	}

	public double getuVMemofHost() {
		return uVMemofHost;
	}

	public void setuVMemofHost(double uVMemofHost) {
		this.uVMemofHost = uVMemofHost;
	}

	public double getuVNetofHost() {
		return uVNetofHost;
	}

	public void setuVNetofHost(double uVNetofHost) {
		this.uVNetofHost = uVNetofHost;
	}


}
