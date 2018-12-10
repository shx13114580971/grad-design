package com.mooe.grad.service;

import com.mooe.grad.dao.TestDao;
import com.mooe.grad.domain.Experiment;

import org.apache.commons.collections15.IteratorUtils;
import com.mooe.grad.domain.UserExpTest;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class TestService {

    @Autowired
    private TestDao testDao;

    //在这里选取测题
    public Experiment startTestExp(String testId) {
        return testDao.getExpById(testId);
    }

    public String getStartTestExpId(String class1, int user_id) {
        List<ExperimentVo> listExpClass1 = testDao.getExpByClass1(class1);
        List<UserExpTest> listAll = testDao.listAll(user_id);
        //排除掉已经学过的实验，学过的实验就不再测试了
        for(ExperimentVo experiment : listExpClass1){
            for(UserExpTest userExpTest : listAll){
                if(experiment.getExp_id() == userExpTest.getExp_id()){
                    listExpClass1.remove(experiment);
                    listAll.remove(userExpTest);
                }
            }
        }
//        for(ExperimentVo experiment : listExpClass1){
//        }
        if(listExpClass1.size() > 0){
            int index = (int)(Math.random()*listExpClass1.size());
            return String.valueOf(listExpClass1.get(index).getExp_id());
        }
        return null;
    }

    public List<String> getRecommExp(ExperimentVo experimentVo, int user_id) {
        //推荐这个实验，以及随机选取一道相同类型的实验，在此之前要先排除掉已经学过的实验
        //已经学过的实验
        List<Integer> userExpIdList = testDao.getExpIdByUserId(user_id);
        Iterator<Integer> userExpIdIter = userExpIdList.iterator();
                //同类型的实验
        List<ExperimentVo> experimentList = testDao.getExpByClass1(experimentVo.getClass1());
        Iterator<ExperimentVo> experimentIter = experimentList.iterator();
        //排除已经学过的实验
        while (experimentIter.hasNext()){
            while(userExpIdIter.hasNext()){
                ExperimentVo exp  = experimentIter.next();
                Integer userExpId = userExpIdIter.next();
                if(exp.getExp_id() == userExpId){
                    experimentIter.remove();
                    userExpIdIter.remove();
                }
            }
        }
        experimentList = IteratorUtils.toList(experimentIter);
        if(experimentList.size() > 0){
            int index = (int)(Math.random()*experimentList.size());
            List<String> expNameList = new ArrayList<>();
            expNameList.add(experimentList.get(index).getExp_name());
            return expNameList;
        }
        return null;
    }
}
