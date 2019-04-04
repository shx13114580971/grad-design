package com.mooe.grad.migrate;

import com.mooe.grad.vo.HostMigrateInVo;
import com.mooe.grad.vo.VmMigrateVo;

import java.util.*;
import java.util.Map.Entry;

public class VMPlacement {
	private static List<VmMigrateVo> vmlist;
	private static List<HostMigrateInVo> hostlist;
	private static int hostid;
	private static int vmid;
	private static double fitness;
	//private static Map<VmMigrateVo, HostMigrateInVo> vmTohost; //虚拟机与主机的映射方案
	private static Map<HostMigrateInVo, ArrayList<VmMigrateVo>> vmInhost; //主机与搭载在其上的虚拟机映射

//	public static void main(String[] args) {
//		hostid = vmid = 0;
//		hostlist = new ArrayList<HostMigrateInVo>();
//		vmlist = new ArrayList<VmMigrateVo>();
//		specHost1(20);
//		specHost2(30);
//		specVm1(20);
//		specVm2(20);
//		PSOSel();
////		RandomSel();
////		Particle.resetHost();
////		Greedy();
//	}

	/**
	 * 8G+4M+4核
	 *
	 * @param n
	 */
//	private static void specHost1(int n) {
//		long storage = 102400;
//		int hostram = 8192;
//		long hostbw = 4000;
//		int pesNumOfhost = 4;
//		for (int i = 0; i < n; i++) {
//			HostMigrateInVo host = new HostMigrateInVo(hostid, storage, hostram, hostbw, pesNumOfhost);
//			hostlist.add(host);
//			hostid++;
//		}
//	}

	/**
	 * 4G+4M+4核
	 *
	 * @param n
	 */

	/**
	 * 4G+1M+2核
	 *
	 * @param n
	 */
//	private static void specVm1(int n) {
//		int userid = 1;
//		int ram = 4096; // 内存
//		long bw = 1000;// 带宽
//		int pesNumber = 2;
//		long size = 10000;
//		String vmm = "Xen";
//		for (int i = 0; i < n; i++) {
//			VmMigrateVo vm = new VmMigrateVo(vmid, userid, pesNumber, ram, bw, size, vmm);
//			vmlist.add(vm);
//			vmid++;
//		}
//	}

	/**
	 * 2G+1M+1核
	 *
	 * @param n
	 */


	/**
	 * 判断物理机能否满足条件放置虚拟机
	 *
	 * @param vm
	 * @param host
	 * @return
	 */
	public static boolean selFitHost(VmMigrateVo vm, HostMigrateInVo host) {
		int usedCpu = 0;
		double usedMem = 0;
		double usedNet = 0;
		for (int i = 0; i < host.vmlist.size(); i++) {
			usedCpu += host.vmlist.get(i).getNumberOfPes();
			usedMem += host.vmlist.get(i).getRam();
			usedNet += host.vmlist.get(i).getBw();
		}
		if (vm.getBw() > host.getAvailableBw() - usedNet) {
			return false;
		}
		if (vm.getNumberOfPes() > host.getAvailblePes() - usedCpu) {
			return false;
		}
		if (vm.getRam() > host.getAvailableRam() - usedMem) {
			return false;
		}
		return true;
	}

	/**
	 * 更新主机资源
	 *
	 * @param host
	 //* @param vm
	 */
	public static void updateHost(HostMigrateInVo host) {
		//计算当前主机剩余资源
		for (int i = 0; i < host.vmlist.size(); i++) {
			host.setAvailableBw(host.getAvailableBw()
					- host.vmlist.get(i).getBw());
			host.setAvailableRam(host.getAvailableRam()
					- host.vmlist.get(i).getRam());
			host.setAvailblePes(host.getAvailblePes()
					- host.vmlist.get(i).getNumberOfPes());
		}
	}


	//用于随机算法和贪心算法
	public static  double calcuLoadDgree(List<VmMigrateVo> vmList, List<HostMigrateInVo> hostList){
		double[] x = new double[hostList.size()];
		// 在对物理机进行均衡度计算时才更新每个物理机的资源状态
		for (int i = 0; i < hostList.size(); i++) {
			x[i] = hostList.get(i).getLoad();
		}
		fitness = StandardDiviation(x);
		return fitness;
	}

	/**
	 * 求标准差
	 *
	 * @param x
	 * @return
	 */
	public static double StandardDiviation(double[] x) {
		int m = x.length;
		double sum = 0;
		for (int i = 0; i < m; i++) {// 求和
			sum += x[i];
		}
		double dAve = sum / m;// 求平均值
		double dVar = 0;
		for (int i = 0; i < m; i++) {// 求方差
			dVar += (x[i] - dAve) * (x[i] - dAve);
		}
		return Math.sqrt(dVar / m);
	}
	/**
	 * 标准PSO算法
	 */
	public static void showMigrateProcess(Map<VmMigrateVo, HostMigrateInVo> vmTohost) {
		vmInhost = new HashMap<HostMigrateInVo, ArrayList<VmMigrateVo>>();
		Iterator<Entry<VmMigrateVo, HostMigrateInVo>> entries = vmTohost.entrySet().iterator();
		//下面是模拟迁入的过程
		while (entries.hasNext()) {
			Entry<VmMigrateVo, HostMigrateInVo> entry = entries.next();
			HostMigrateInVo host=entry.getValue();
			VmMigrateVo vm=entry.getKey();
			if (!vmInhost.containsKey(host.getId())) {
				ArrayList<VmMigrateVo> list = new ArrayList<VmMigrateVo>();
				list.add(vm);
				vmInhost.put(host, list);
			} else {
				vmInhost.get(host).add(vm);
			}
//			System.out.print(host.getId()+" 号主机 ：");
//			System.out.print(vm.getId()+" ");
//			System.out.println();
			host.addVm(vm);
		}
		for(HostMigrateInVo host:hostlist){
			System.out.print(host.getId()+" 号主机 ：");
			for(VmMigrateVo vm:host.getVmList()){
				//System.out.println(vm==null);
				System.out.print(vm.getId()+" ");
			}
			System.out.println();
		}

	}

}
