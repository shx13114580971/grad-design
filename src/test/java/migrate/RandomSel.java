package live_migrate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class RandomSel {
	private static HashMap<Vm, ArrayList<Host>> hashmap = new HashMap<Vm, ArrayList<Host>>();
	private static List<Vm> vmlist;
	private static List<Host> hostlist;
	private static Map<Vm, Host> vmTohost;
	private Solution solution;
	public RandomSel(List<Vm> vmList, List<Host> hostList) {
		RandomSel.vmlist = vmList;
		RandomSel.hostlist = hostList;
		vmTohost=new HashMap<Vm,Host>();
	}

	/**
	 * ����������б����ѡ��һ����������
	 * 
	 * @param vm
	 */
	public void vmToHost() {
		// ƥ����Է��ø�vm�������
		for (int i = 0; i < vmlist.size(); i++) {
			Vm vm = vmlist.get(i);
			ArrayList<Host> fithostlist = new ArrayList<Host>();
			for (int j = 0; j < hostlist.size(); j++) {
				if (VMPlacement.selFitHost(vm, hostlist.get(j))) {
					fithostlist.add(hostlist.get(j));// ������������������������������
				}
			}
			if (fithostlist.size() == 0)
				System.out.println(vm.getId() + "��������޺�����������Է���");
			else {
				hashmap.put(vm, fithostlist); // ���������������������������ӳ��
				// ���vm��host��ӳ���ϵ
//				Set<Entry<Vm, ArrayList<Host>>> sets = hashmap.entrySet();
//				for (Entry<Vm, ArrayList<Host>> entry : sets) {
//					System.out.print(entry.getKey().getId() + "\t");
//					for (Host j : entry.getValue()) {
//						System.out.print(j.getId() + " ");
//					}
//					System.out.println();
//				}
				randomSet(vm);
			}
		}
	}

	/**
	 * �Ӻ�ѡ������б������ѡ��һ��
	 * 
	 * @param vm
	 * @return ��ѡ�е�����
	 */
	private static void randomSet(Vm vm) {
		Host value = null;
		// �����������������������ȡһ����������
		int index = (int) (Math.random() * hashmap.get(vm).size());
		value = hashmap.get(vm).get(index);
		value.addVm(vm);
		vm.setHost(value);
		vmTohost.put(vm, value);
		VMPlacement.updateHost(value);
	}
	
	public  void showResult(){
		solution=new Solution(VMPlacement.calcuLoadDgree(vmlist, hostlist),vmTohost);
	}
}
