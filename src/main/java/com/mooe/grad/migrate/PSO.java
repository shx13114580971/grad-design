package com.mooe.grad.migrate;

import com.mooe.grad.domain.HostInfo;
import com.mooe.grad.domain.VmMigrate;

import java.util.List;


/**
 * 粒子群类
 *
 * @author seven
 *
 */
public class PSO {
	private Particle[] pars;
	double global_best;// 全局最优适应度值
	double global_worst;
	int pcount;// 粒子数目
	private static int dim;// 维度
	private static int Imax;// 最差纪录次数阈值
	private int runtime; //迭代次数
	private List<VmMigrate> vmlist;
	private List<HostInfo> hostlist;
	private Solution solution;

	// private static int ms;//主机的数量，这里是为了限制迭代过程中的位置
	public PSO(int num, int runtimes, List<VmMigrate> vmList, List<HostInfo> hostList) {
		this.vmlist = vmList;
		dim = vmList.size();
		this.hostlist = hostList;
		this.pcount = num;
		this.runtime = runtimes;
		Particle.runtimes = runtimes;
		global_best = 1;
		// int index = -1;// 拥有最好位置的粒子编号
		Imax = 3;
		pars = new Particle[pcount + 1];// 初始化多一个粒子，不参与位置速度的更新，只用作暂存中间数据
		// 类的静态成员的初始化
		init();
	}

	/**
	 * 粒子群初始化
	 *
	 * //@param n
	 *            粒子的数量
	 */
	public void init() {
		// Particle.m=ms;
		System.out.println("======init start=====");
		for (int i = 0; i < pcount; i++) {
			pars[i] = new Particle(vmlist, hostlist);
			pars[i].init();
		}
		pars[pcount] = new Particle(vmlist, hostlist);
		pars[pcount].init();
		System.out.println("======init end=====");
	}

	/**
	 * 粒子群的运行
	 */
	public void run() {
		System.out.println("=========run start========");
		for (int i = 0; i < runtime; i++) {
			Particle tempbest = null; // 当前迭代中最优粒子
			Particle tempworst = null;// 当前迭代中最差粒子
			global_worst = 0;
			// Particle.w=0.9-0.5/runtimes*cnt;
			/**
			 * 每个粒子更新位置和适应值
			 * 下面的一次循环以及一次判断用来更新全局最优解
			 * 每次迭代得到一套迁移方案
			*/
			for (int j = 0; j < pcount; j++) {
				if (global_best > pars[j].getFitness()) {
					global_best = pars[j].getFitness();
					tempbest = pars[j];
					solution = new Solution(global_best, pars[j].getVmTohost());
					System.out.println(i + " -> " + global_best + "    ");
					//System.out.println();
				}
				if (global_worst < pars[j].getFitness()) {
					global_worst = pars[j].getFitness();
					tempworst = pars[j];
				}// 寻找每次迭代中适应度最差的粒子
			}

			// 发现更好的解，实际上就是给全局最优解赋值的过程
			if (tempbest != null) {
				for (VmMigrate vm : vmlist) {
					Particle.gbest[vm.getId()] = tempbest.getPos()[vm.getId()];
				}
			}

			/**
			 *  计算粒子群位置的平均值存在在附加的粒子中；
			 *  用于纠错，也就是当一个粒子的适应度值总是最差的时候，就将粒子群位置的平均值赋给这个最差粒子
			*/
			for (VmMigrate vm : vmlist) {
				for (int j = 0; j < pcount; j++) {
					pars[pcount].getPos()[vm.getId()] += pars[j].getPos()[vm.getId()];
				}
				pars[pcount].getPos()[vm.getId()] = pars[pcount].getPos()[vm.getId()]
						/ pcount;
			}
			if (tempworst != null)
				tempworst.count++;
			for (int j = 0; j < pcount; j++) {
				if (pars[j].count == Imax) {// 如果粒子最差纪录次数达到预设的次数，则对粒子进行进化
					// pars[i].updateParticle(pars[pcount]);
					for (VmMigrate vm : vmlist) {
						pars[j].getPos()[vm.getId()] = pars[pcount].getPos()[vm.getId()];
					}
				}
				pars[j].count = 0;
			}

			//这里才是在本次迭代中用来更新位置与速度
			for(int k = 0; k < pcount; k++){
				this.getPars()[k].run();
			}
//			ForkJoinPool forkJoinPool = new ForkJoinPool();
//			try {
//				forkJoinPool.submit(new ParallelParticle(0, pcount, this));
//				forkJoinPool.shutdown();
//				forkJoinPool.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);
//			} catch (Exception e) {
//				e.printStackTrace();
//			}
		}
	}

	/**
	 * 显示程序求解结果
	 */
	public void showresult() {
		System.out.println("PSO算法求得的最优解为：" + solution.getfitness());
		System.out.println("虚拟机放置的主机编号依次是");
	}

	public Particle[] getPars() {
		return pars;
	}

	public void setPars(Particle[] pars) {
		this.pars = pars;
	}

	public Solution getSolution() {
		return solution;
	}

	public void setSolution(Solution solution) {
		this.solution = solution;
	}

}
