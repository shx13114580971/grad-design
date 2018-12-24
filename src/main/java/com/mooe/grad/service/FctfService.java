package com.mooe.grad.service;

import com.mooe.grad.dao.FctfDao;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.Fctf;
import com.mooe.grad.domain.FctfWriteup;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.FctfVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FctfService {

    @Autowired
    private FctfDao fctfDao;

    public String updateFctf(Fctf fctf){
        fctfDao.updateFctf(fctf);
        return "success";
    }

    public List<FctfVo> listAll(){
        return fctfDao.listAll();
    }

    public Fctf findById(int id){
        return fctfDao.findById(id);
    }

    public String addFctf(Fctf fctf){
        fctfDao.addFctf(fctf);
        return "success";
    }

    public String getFlag(int fctf_id) {
        return fctfDao.getFlag(fctf_id);
    }

    public String findNameById(int fctf_id) {
        return fctfDao.findNameById(fctf_id);
    }

    public void addWriteup(FctfWriteup fctfWriteup) {
        FctfWriteup writeup = fctfDao.findByUserIdAndFctfId(fctfWriteup.getUser_id(), fctfWriteup.getFctf_id());
        if(writeup != null){
            fctfDao.updateWriteup(fctfWriteup);
        }else{
            fctfDao.addWriteup(fctfWriteup);

        }

    }

    public FctfWriteup isUploaded(int fctf_id, int user_id) {
        FctfWriteup writeup = fctfDao.findByUserIdAndFctfId(user_id, fctf_id);
        return writeup;
    }
}
