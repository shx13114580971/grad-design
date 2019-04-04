package live_migrate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class Greedy {
	private static List<Vm> vmlist;
	private static List<Host> hostlist;
	public Greedy(List<Vm> vmList, List<Host> hostList) {
		Greedy.vmlist = vmList;
		Greedy.hostlist = hostList;
	}

	public void GreedySel() {
		Comparator<Host> comparator = new Comparator<Host>() {
			public int compare(Host host1, Host host2) {
				//���ո��ش�С��������
				return host1.getLoad()<host2.getLoad()?-1:1;
			}
		};
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
				Collections.sort(fithostlist, comparator);
				//ѡ��ǰ������С���������ø������
//				for(Host host:fithostlist)
//					System.out.print(host.getId()+" ");
				fithostlist.get(0).addVm(vm);
				vm.setHost(fithostlist.get(0));//�������������������Ӧ��ϵ
				VMPlacement.updateHost(fithostlist.get(0));//����������Դ
			}
			//System.out.println();
		}
	}
	
	public  void showResult(){
		VMPlacement.calcuLoadDgree(vmlist, hostlist);
	}
}
