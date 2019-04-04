package com.mooe.grad.migrate;

import com.mooe.grad.vo.HostMigrateInVo;
import com.mooe.grad.vo.VmMigrateVo;

import java.util.Map;


public class Solution {
	private double fitness;
	private Map<VmMigrateVo, HostMigrateInVo> vmTohost;
	
	public Solution( double fitness, Map<VmMigrateVo, HostMigrateInVo> vmTohost) {
		this.fitness = fitness;
		this.vmTohost = vmTohost;
		
	}
	public double getfitness() {
		return fitness;
	}
	public void setBanlanceDegree(double banlanceDegree) {
		this.fitness = banlanceDegree;
	}
	public Map<VmMigrateVo, HostMigrateInVo> getVmTohost() {
		return vmTohost;
	}
	public void setVmTohost(Map<VmMigrateVo, HostMigrateInVo> vmTohost) {
		this.vmTohost = vmTohost;
	}
}
