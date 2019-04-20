package com.mooe.grad.domain;

import java.util.ArrayList;
import java.util.List;


public class HostInfo {
	/** The id. */
	private int id;

	/** The ip address  */
	private String ipaddr;

	/** The bw. */
	private long bw;

	/** The ram. */
	private long ram;

	/** The number of PEs . */
	private int pesNum;

	/** The available bw. */
	private double availableBw;

	/** The available ram. */
	private double availableRam;

	private double availablePes;

	private double load;

	//使用率
	private double uCPU;
	private double uNet;
	private double uMem;
//	private double thmin=0.7;
//	private double thmax=0.8;

	/** The vm list. */
	private List<? extends VmMigrate> vmList = new ArrayList<VmMigrate>();
	public List<VmMigrate> vmlist = new ArrayList<VmMigrate>();

	public HostInfo(int id, String ipaddr, int pesNum, long ram, long bw) {
		setId(id);
		setIpaddr(ipaddr);
		setRam(ram);
		setBw(bw);
		setPesNum(pesNum);
	}

	public void addVm(VmMigrate vm) {
		vmlist.add(vm);
		this.vmList = vmlist;
	}

	/**
	 * 输出物理主机上搭载的vm编号
	 */
	public void display() {
		System.out.print(this.getId() + "号主机上的虚拟机有：");
		for(int i=0;i<this.vmList.size();i++) {
			System.out.print(vmList.get(i).getId() + " ");
		}
		System.out.println();
	}

	/**
	 * 获取资源利用率
	 * @return
	 */
	public double getLoad(){
		double uCPUTmp = 100 - this.availablePes;
		double uMemTmp = 100 - this.availableRam;
		double uNetTmp = 100 - this.availableBw;
		load=(1/(1-uCPUTmp/100))*((1/(1-uMemTmp/100)))*(1/(1-uNetTmp/100));
		return load;
	}

	public void setLoad(double uCPU, double uMEM, double uNet){
		this.uCPU = uCPU;
		this.uMem = uMEM;
		this.uNet = uNet;
		this.availablePes = 100 - this.uCPU;
		this.availableRam = 100 - this.uMem;
		this.availableBw = 100 - this.uNet;
		load=(1/(1-uCPU/100))*((1/(1-uNet/100)))*(1/(1-uMem/100));
		//通过cpu使用率、内存使用率及带宽使用率计算负载情况
		//this.load=Math.sqrt(uCPU*uCPU+uNet*uNet+uMem*uMem);
	}

	public void resetAvailableResource(){
		this.availablePes = 100 - this.uCPU;
		this.availableRam = 100 - this.uMem;
		this.availableBw = 100 - this.uNet;
	}

	protected void setId(int id) {
		this.id = id;
	}

	public int getId() {
		return id;
	}

	public VmMigrate getVm(int vmId, int userId) {
		for (VmMigrate vm : getVmList()) {
			if (vm.getId() == vmId) {
				return vm;
			}
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	public <T extends VmMigrate> List<T> getVmList() {
		return (List<T>) vmList;
	}

	public String getIpaddr() {
		return ipaddr;
	}

	public void setIpaddr(String ipaddr) {
		this.ipaddr = ipaddr;
	}

	public long getRam() {
		return ram;
	}

	protected void setRam(long ram) {
		this.ram = ram;
	}

	public double getUsedRam() {
		return uNet;
	}

	public double getAvailableRam() {
		return availableRam;
	}

	public void setAvailableRam(double availableRam) {
		this.availableRam = availableRam;
	}

	public long getBw() {
		return bw;
	}

	protected void setBw(long bw) {
		this.bw = bw;
	}

	public double getAvailableBw() {
		return availableBw;
	}

	public double getUsedBw() {
		return uMem;
	}

	public void setAvailableBw(double availableBw) {
		this.availableBw = availableBw;
	}

	public int getPesNum() {
		return pesNum;
	}

	protected void setPesNum(int pesNum) {
		this.pesNum = pesNum;
	}

	public double getUsedPes(){
		return uCPU;
	}

	public double getAvailblePes() {
		return availablePes;
	}

	public void setAvailblePes(double availablePes) {
		this.availablePes = availablePes;
	}

	public List<VmMigrate> getVmlist() {
		return vmlist;
	}

	public void setVmlist(List<VmMigrate> vmlist) {
		this.vmlist = vmlist;
	}

	// public void setUcpu(double U){
	// this.uCPU=load;
	// }
	//
	// public double getLoad(){
	// return load;
	// }
}
