package com.mooe.grad.migrate;

import com.mooe.grad.vo.HostMigrateInVo;
import com.mooe.grad.vo.VmMigrateVo;

import java.util.*;


/**
 * 粒子类
 *
 * @author seven
 *
 */
public class Particle {
	// 粒子的位置，数组的维度表示虚拟机的个数
	//注意，粒子位置数组每个值得取值范围为候补物理主机数组的大小
	private int[] pos;
	private int[] v;
	private double fitness;
	private int[] pbest; // 粒子的历史最好的位置
	public static int[] gbest; // 所有粒子找到的最好位置
	private double pbest_fitness;// 粒子的历史最优适应值
	private int dims;
	private  double w;
	private  double c1;
	private  double c2;
	private static Random rnd;
	private Map<VmMigrateVo, HostMigrateInVo> vmTohost;// 每个粒子每次迭代产生的放置方案

	int size;// 单个虚拟机可以放置的主机数量
	private List<HostMigrateInVo> fitList;//每台虚拟机的候选主机列表
	private static List<HostMigrateInVo> hostlist;
	private List<VmMigrateVo> vmlist;
	public int count;// 最差适应度值次数
	private double utilAvg[];// 单个物理机平均利用率向量
	public static int runtimes;
	private int cnt;

	@SuppressWarnings("static-access")
	public Particle(List<VmMigrateVo> vmList, List<HostMigrateInVo> hostList) {
		this.vmlist = vmList;
		this.hostlist = hostList;
		this.dims = vmList.size();
		cnt = 0;
		pos = new int[dims];
		v = new int[dims];
		pbest = new int[dims];
		gbest = new int[dims];
		fitness = 1;
		pbest_fitness = Double.MAX_VALUE;
		vmTohost = new HashMap<VmMigrateVo,HostMigrateInVo>();
		utilAvg = new double[hostList.size()];
	}

	public void init() {
		fitList = hostlist;
		rnd = new Random();
		for (VmMigrateVo vm : vmlist) {
			updateVmList(vm);
			int size = fitList.size();
			if (size != 0) {
				int idx = rnd.nextInt(size);
				HostMigrateInVo host = fitList.get(idx);
				//位置实际上就是根据应该放到哪台主机上
				pos[vm.getId()] = idx;
				// 对于每个粒子，在计算位置和速度过程中，只把vm加入host的属性列表中，而不更新主机资源
				// 在对粒子进行适应度值计算时在更新资源
				fitList.get(idx).addVm(vm);
				vmTohost.put(vm, host);
				//初始化的局部最优就是当前位置
				pbest[vm.getId()] = pos[vm.getId()];
				//初始化速度可以为负
				v[vm.getId()] = rnd.nextInt(fitList.size()) - pos[vm.getId()];
			}
		}
		evaluate();
	}

	/**
	 * 返回low—uper之间的数
	 *
	 * @param low
	 *            下限
	 * @param uper
	 *            上限
	 * @return 返回low—uper之间的数
	 */
	int rand(int low, int uper) {
		rnd = new Random();
		return rnd.nextInt() * (uper - low + 1) + low;
	}

	public void run() {
		// System.out.println("run");
//		resetHost();
		//更新速度与位置更新
		updatev();
		evaluate();

	}

	/**
	 * 计算适应度与局部最优解
	 *
	 * 判断负载均衡度，并记录历史最优解 这里定义负载均衡度为物理主机的资源利用率的标准差
	 * 所以这个粒子群算法的目的就是为了让待迁移的虚拟机均匀的分布在目标主机之上
	 * 迁移结束之后每台物理机的负载情况处于比较均衡的状态
	 */
	private void evaluate() {
		// 在对物理机进行均衡度计算时 才更新每个物理机的资源状态
		for (HostMigrateInVo host : hostlist) {
			// 根据主机中vmlist编号更新主机资源（计算剩余资源）
			VMPlacement.updateHost(host);
			//这里用平均负载代替了欧式距离
			utilAvg[host.getId()] = host.getLoad();//计算每台主机的平均负载
		}
		//适应度函数这里是计算主机列表的标准差，相对于求欧式距离还多了一步求方差
		//注意，这里是求
		fitness = VMPlacement.StandardDiviation(utilAvg);
		//与之前的适应度做对比，更好的话就将当前位置标记为局部最优位置
		//适应度越小越好
		if (fitness < pbest_fitness) {
			for (VmMigrateVo vm : vmlist) {
				pbest[vm.getId()] = pos[vm.getId()];
			}
			pbest_fitness = fitness;
		}
		//也就是每次都重新计算所有主机的负载情况
		resetHost();// 每个粒子评估结束之后还原主机资源，以确保下一个粒子能正确计算负载
	}

	/**
	 * 还原所有物理机至初始状态
	 */
	private void resetHost() {
		for (HostMigrateInVo host : hostlist) {
			host.getVmList().clear();
			host.setAvailableBw(host.getBw());
			host.setAvailableRam(host.getRam());
			host.setAvailblePes(host.getPesNum());
		}

	}

	/**
	 * 更新速度与位置，更新完成后获得一套解决方案
	 */
	private void updatev() {
//		double k;
		vmTohost.clear();
		int δ = 2;
		// 线性减少w，正态函数动态调整c1，c2
		w = 0.9 - 0.5 / 100 * cnt;
		c1 = 0.5 + (4.5 - 0.5) / (Math.sqrt(2 * Math.PI) * δ)
				* Math.exp(-(cnt / runtimes) * (cnt / runtimes) / (2 * δ * δ));
		c2 = 2.5 + (0.5 - 2.5) / (Math.sqrt(2 * Math.PI) * δ)
				* Math.exp(-(cnt / runtimes) * (cnt / runtimes) / (2 * δ * δ));
//		k = (0.1 - 1) * (runtimes - cnt) / runtimes + 1;
		for (VmMigrateVo vm : vmlist) {
			updateVmList(vm);
			size = fitList.size();
			v[vm.getId()] = (int) (w * v[vm.getId()] + c1 * rnd.nextDouble()
					* (pbest[vm.getId()] - pos[vm.getId()]) + c2
					* rnd.nextDouble() * (gbest[vm.getId()] - pos[vm.getId()]));
			// 限制速度和位置
			if (v[vm.getId()] > size - pos[vm.getId()] - 1) {
				v[vm.getId()] = size - pos[vm.getId()] - 1;
			}
			if (v[vm.getId()] < -pos[vm.getId()]) {
				v[vm.getId()] = -pos[vm.getId()];
			}
			//更新位置
			pos[vm.getId()] = pos[vm.getId()] + v[vm.getId()];
			/** 第i个vm放入第pos[i]个host
			 * 这里不知道是不是真的有必要，vmToHost是候选主机与待迁vm的一对一关系，
			 * host.vmlist是候选主机与待迁虚拟机d一对多关系*/
			fitList.get(pos[vm.getId()]).vmlist.add(vm);
			//将每台虚拟机和适合它的物理机进行配对
			vmTohost.put(vm, fitList.get(pos[vm.getId()]));
		}
		cnt++;
	}

	/**
	 * 更新每个虚拟机可以匹配的主机列表，每次迭代都要退回初始状态
	 */
	private void updateVmList(VmMigrateVo vm) {
		fitList = new ArrayList<HostMigrateInVo>();
		for (HostMigrateInVo host : hostlist) {
			//将满足虚拟机资源使用需求的主机筛选出来
			if (VMPlacement.selFitHost(vm, host)) {
				fitList.add(host);// 将符合条件的物理主机放入数组中
			}
		}
	}

	/**
	 * 对粒子进行进化，位置初始化为全部粒子的重心
	 */
	private void updateParticle(Particle a) {
		fitness = 1;
		pbest_fitness = 1;
		count = 0;
		fitList = hostlist;
		for (int i = 0; i < dims; i++) {
			int size = fitList.size();
			pos[i] = a.pos[i];
			// 对于每个粒子，在计算位置和速度过程中，只把vm加入host的属性列表中，而不更新主机资源
			// 在对粒子进行适应度值计算时在更新资源
			pbest[i] = a.pos[i];
			v[i] = rand(-pos[i], size - pos[i] - 1);
		}
	}

	public double getFitness() {
		return fitness;
	}

	public void setFitness(double fitness) {
		this.fitness = fitness;
	}

	public int[] getPos() {
		return pos;
	}

	public void setPos(int[] pos) {
		this.pos = pos;
	}

	public Map<VmMigrateVo, HostMigrateInVo> getVmTohost() {
		return vmTohost;
	}

	public void setVmTohost(Map<VmMigrateVo, HostMigrateInVo> vmTohost) {
		this.vmTohost = vmTohost;
	}
}
