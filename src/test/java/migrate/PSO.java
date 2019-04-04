package live_migrate;

import java.util.List;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.TimeUnit;


/**
 * ����Ⱥ��
 * 
 * @author seven
 * 
 */
public class PSO {
	private Particle[] pars;
	double global_best;// ȫ��������Ӧ��ֵ
	double global_worst;
	int pcount;// ������Ŀ
	private static int dim;// ά��
	private static int Imax;// ����¼������ֵ
	private int runtime; //��������
	private List<Vm> vmlist;
	private List<Host> hostlist;
	private Solution solution;

	// private static int ms;//������������������Ϊ�����Ƶ��������е�λ��

	public PSO(int num, int runtimes, List<Vm> vmList, List<Host> hostList) {
		this.vmlist = vmList;
		dim = vmList.size();
		this.hostlist = hostList;
		this.pcount = num;
		this.runtime = runtimes;
		Particle.runtimes = runtimes;
		global_best = 1;
		// int index = -1;// ӵ�����λ�õ����ӱ��
		Imax = 3;
		pars = new Particle[pcount + 1];// ��ʼ����һ�����ӣ�������λ���ٶȵĸ��£�ֻ�����ݴ��м�����
		// ��ľ�̬��Ա�ĳ�ʼ��
		init();
	}

	/**
	 * ����Ⱥ��ʼ��
	 * 
	 * @param n
	 *            ���ӵ�����
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
	 * ����Ⱥ������
	 */
	public void run() {
		System.out.println("=========run start========");
		for (int i = 0; i < runtime; i++) {
			Particle tempbest = null; // ��ǰ��������������
			Particle tempworst = null;// ��ǰ�������������
			global_worst = 0;
			// Particle.w=0.9-0.5/runtimes*cnt;
			// ÿ�����Ӹ���λ�ú���Ӧֵ
			for (int j = 0; j < pcount; j++) {
				if (global_best > pars[j].getFitness()) {
					global_best = pars[j].getFitness();
					tempbest = pars[j];
					solution=new Solution(global_best,pars[j].getVmTohost());
					System.out.println(i + " -> " + global_best + "    ");
					//System.out.println();
				}
				if (global_worst < pars[j].getFitness()) {
					global_worst = pars[j].getFitness();
					tempworst = pars[j];
				}// Ѱ��ÿ�ε�������Ӧ����������
			}
			
			// ���ָ��õĽ�
			if (tempbest != null) {
				for (Vm vm : vmlist) {
					Particle.gbest[vm.getId()] = tempbest.getPos()[vm.getId()];
				}
			}
			

			for (Vm vm : vmlist) {
				for (int j = 0; j < pcount; j++) {
					pars[pcount].getPos()[vm.getId()] += pars[j].getPos()[vm.getId()];
				}
				pars[pcount].getPos()[vm.getId()] = pars[pcount].getPos()[vm.getId()]
						/ pcount;
			}// ��������Ⱥλ�õ�ƽ��ֵ�����ڸ��ӵ�������
			if (tempworst != null)
				tempworst.count++;
			for (int j = 0; j < pcount; j++) {
				if (pars[j].count == Imax) {// �����������¼�����ﵽԤ��Ĵ�����������ӽ��н���
					// pars[i].updateParticle(pars[pcount]);
					for (Vm vm : vmlist) {
						pars[j].getPos()[vm.getId()] = pars[pcount].getPos()[vm.getId()];
					}
				}
				pars[j].count = 0;
			}
			ForkJoinPool forkJoinPool = new ForkJoinPool();
			try {
				forkJoinPool.submit(new ParallelParticle(0, pcount, this));
				forkJoinPool.shutdown();
				forkJoinPool.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	/**
	 * ��ʾ���������
	 */
	public void showresult() {
		System.out.println("PSO�㷨��õ����Ž�Ϊ��" + solution.getfitness());
		System.out.println("��������õ��������������");
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
