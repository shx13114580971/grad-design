package com.mooe.grad.migrate;

import com.mooe.grad.domain.HostInfo;
import com.mooe.grad.domain.VmMigrate;

import java.util.Map;


public class Solution {
	private double fitness;
	private Map<VmMigrate, HostInfo> vmTohost;
	
	public Solution( double fitness, Map<VmMigrate, HostInfo> vmTohost) {
		this.fitness = fitness;
		this.vmTohost = vmTohost;
		
	}
	public double getfitness() {
		return fitness;
	}
	public void setBanlanceDegree(double banlanceDegree) {
		this.fitness = banlanceDegree;
	}
	public Map<VmMigrate, HostInfo> getVmTohost() {
		return vmTohost;
	}
	public void setVmTohost(Map<VmMigrate, HostInfo> vmTohost) {
		this.vmTohost = vmTohost;
	}
}
