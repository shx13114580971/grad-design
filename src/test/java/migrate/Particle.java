package live_migrate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;


/**
 * ������
 * 
 * @author seven
 * 
 */
public class Particle {

	private int[] pos;// ���ӵ�λ�ã������ά�ȱ�ʾ������ĸ���
	private int[] v;
	private double fitness;
	private int[] pbest; // ���ӵ���ʷ��õ�λ��
	public static int[] gbest; // ���������ҵ������λ��
	private double pbest_fitness;// ���ӵ���ʷ������Ӧֵ
	private int dims;
	private  double w;
	private  double c1;
	private  double c2;
	private static Random rnd;
	private Map<Vm, Host> vmTohost;// ÿ������ÿ�ε��������ķ��÷���

	int size;// ������������Է��õ���������
	private List<Host> fitList;//
	private static List<Host> hostlist;
	private List<Vm> vmlist;
	public int count;// �����Ӧ��ֵ����
	private double utilAvg[];// ���������ƽ������������
	public static int runtimes;
	private int cnt;

	@SuppressWarnings("static-access")
	public Particle(List<Vm> vmList, List<Host> hostList) {
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
		vmTohost = new HashMap<Vm,Host>();
		utilAvg = new double[hostList.size()];
	}

	public void init() {
		fitList = hostlist;
		rnd = new Random();
		for (Vm vm : vmlist) {
			updateVmList(vm);
			int size = fitList.size();
			if (size != 0) {
				int idx = rnd.nextInt(size);
				Host host = fitList.get(idx);
				pos[vm.getId()] = idx;
				// ����ÿ�����ӣ��ڼ���λ�ú��ٶȹ����У�ֻ��vm����host�������б��У���������������Դ
				// �ڶ����ӽ�����Ӧ��ֵ����ʱ�ڸ�����Դ
				fitList.get(idx).addVm(vm);
				vmTohost.put(vm, host);
				pbest[vm.getId()] = pos[vm.getId()];
				v[vm.getId()] = rnd.nextInt(fitList.size()) - pos[vm.getId()];
			}
		}
		evaluate();
	}

	/**
	 * ����low��uper֮�����
	 * 
	 * @param low
	 *            ����
	 * @param uper
	 *            ����
	 * @return ����low��uper֮�����
	 */
	int rand(int low, int uper) {
		rnd = new Random();
		return rnd.nextInt() * (uper - low + 1) + low;
	}

	public void run() {
		// System.out.println("run");
//		resetHost();
		updatev();
		evaluate();
		
	}

	/**
	 * �жϸ��ؾ���ȣ�����¼��ʷ���Ž� ���ﶨ�帺�ؾ����Ϊ������������Դ�����ʵı�׼��
	 */
	private void evaluate() {
		// �ڶ���������о���ȼ���ʱ�Ÿ���ÿ�����������Դ״̬
		for (Host host : hostlist) {
			VMPlacement.updateHost(host);// ����������vmlist��Ÿ���������Դ
			utilAvg[host.getId()] = host.getLoad();
		}
		fitness = VMPlacement.StandardDiviation(utilAvg);
		if (fitness < pbest_fitness) {
			for (Vm vm : vmlist) {
				pbest[vm.getId()] = pos[vm.getId()];
			}
			pbest_fitness = fitness;
		}
		resetHost();// ÿ��������������֮��ԭ������Դ����ȷ����һ����������ȷ���㸺��
	}

	/**
	 * ��ԭ�������������ʼ״̬
	 */
	private void resetHost() {
		for (Host host : hostlist) {
			host.getVmList().clear();
			host.setAvailableBw(host.getBw());
			host.setAvailableRam(host.getRam());
			host.setAvailblePes(host.getPesNum());
		}
		
	}

	/**
	 * �����ٶȺ�λ��
	 */
	private void updatev() {
//		double k;
		vmTohost.clear();
		int �� = 2;	
		// ���Լ���w����̬������̬����c1��c2
		w = 0.9 - 0.5 / 100 * cnt;
		c1 = 0.5 + (4.5 - 0.5) / (Math.sqrt(2 * Math.PI) * ��)
				* Math.exp(-(cnt / runtimes) * (cnt / runtimes) / (2 * �� * ��));
		c2 = 2.5 + (0.5 - 2.5) / (Math.sqrt(2 * Math.PI) * ��)
				* Math.exp(-(cnt / runtimes) * (cnt / runtimes) / (2 * �� * ��));
//		k = (0.1 - 1) * (runtimes - cnt) / runtimes + 1;
		for (Vm vm : vmlist) {
			updateVmList(vm);
			size = fitList.size();
			v[vm.getId()] = (int) (w * v[vm.getId()] + c1 * rnd.nextDouble()
					* (pbest[vm.getId()] - pos[vm.getId()]) + c2
					* rnd.nextDouble() * (gbest[vm.getId()] - pos[vm.getId()]));
			// �����ٶȺ�λ��
			if (v[vm.getId()] > size - pos[vm.getId()] - 1) {
				v[vm.getId()] = size - pos[vm.getId()] - 1;
			}
			if (v[vm.getId()] < -pos[vm.getId()]) {
				v[vm.getId()] = -pos[vm.getId()];
			}
			pos[vm.getId()] = pos[vm.getId()] + v[vm.getId()];
			fitList.get(pos[vm.getId()]).vmlist.add(vm);// ��i��vm�����pos[i]��host
			vmTohost.put(vm, fitList.get(pos[vm.getId()]));
		}
		cnt++;
	}

	/**
	 * ����ÿ�����������ƥ��������б�
	 */
	private void updateVmList(Vm vm) {
		fitList = new ArrayList<Host>();
		for (Host host : hostlist) {
			if (VMPlacement.selFitHost(vm, host)) {
				fitList.add(host);// ������������������������������
			}
		}
	}

	/**
	 * �����ӽ��н�����λ�ó�ʼ��Ϊȫ�����ӵ�����
	 */
	private void updateParticle(Particle a) {
		fitness = 1;
		pbest_fitness = 1;
		count = 0;
		fitList = hostlist;
		for (int i = 0; i < dims; i++) {
			int size = fitList.size();
			pos[i] = a.pos[i];
			// ����ÿ�����ӣ��ڼ���λ�ú��ٶȹ����У�ֻ��vm����host�������б��У���������������Դ
			// �ڶ����ӽ�����Ӧ��ֵ����ʱ�ڸ�����Դ
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

	public Map<Vm, Host> getVmTohost() {
		return vmTohost;
	}

	public void setVmTohost(Map<Vm, Host> vmTohost) {
		this.vmTohost = vmTohost;
	}
}
