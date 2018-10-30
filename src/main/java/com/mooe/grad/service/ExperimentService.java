package com.mooe.grad.service;

import com.mooe.grad.dao.ExperimentDao;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExperimentService {

    @Autowired
    private ExperimentDao experimentDao;

    public Experiment findById(int id){
        return experimentDao.findById(id);
    }

    public String updateExp(Experiment experiment){
        experimentDao.updateExp(experiment);
        return "success";
    }

    public String addExp(Experiment experiment){
        experimentDao.addExp(experiment);
        return "success";
    }

    public List<ExperimentVo> listAll(){
        return experimentDao.listAll();
    }
}
