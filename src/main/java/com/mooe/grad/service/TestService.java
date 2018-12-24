package com.mooe.grad.service;

import com.mooe.grad.dao.TestDao;
import com.mooe.grad.domain.Experiment;

import com.mooe.grad.domain.Fctf;
import com.mooe.grad.vo.FctfVo;
import org.apache.commons.collections15.IteratorUtils;
import com.mooe.grad.domain.UserExpTest;
import com.mooe.grad.vo.ExperimentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

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
        Iterator<ExperimentVo> experimentVoIter = listExpClass1.iterator();
        List<Integer> allPassedExpId = testDao.listAllPassedExpId(user_id, class1);
        //排除掉已经测试通过的实验，通过的实验就不再测试了
        removePassedOrLearnedExp(experimentVoIter, allPassedExpId);

//        for(ExperimentVo experiment : listExpClass1){
//        }
        if(listExpClass1.size() > 0){
            int index = (int)(Math.random()*listExpClass1.size());
            return String.valueOf(listExpClass1.get(index).getExp_id());
        }
        return null;
    }



    public List<ExperimentVo> getRecommExp(ExperimentVo experimentVo, int user_id) {
        //推荐这个实验，以及随机选取一道相同类型的实验，在此之前要先排除掉已经学过的实验
        //已经学过的实验
        List<Integer> userExpIdList = testDao.getExpIdByUserIdAndClass1(user_id,experimentVo.getClass1());
        //现在做的这道实验测试一定是用户没学习过的，所以一定会被推荐，需要将这个实验排除掉
        userExpIdList.add(experimentVo.getExp_id());
        List<ExperimentVo> experimentList = testDao.getExpByClass1(experimentVo.getClass1());

        Iterator<ExperimentVo> experimentVoIter = experimentList.iterator();
        //排除已经学过的实验
        removePassedOrLearnedExp(experimentVoIter, userExpIdList);

        if(experimentList.size() > 0){
            //随机选一个实验
            int index = (int)(Math.random()*experimentList.size());
            List<ExperimentVo> expNameList = new ArrayList<>();
            expNameList.add(experimentList.get(index));
            return expNameList;
        }
        return null;
    }

    public String insertThisAndGetNextExp(int exp_id, int user_id, String class1) {
        List<Integer> userExpTestList = testDao.getExpByExpIdAndUserId(exp_id, user_id);
        if(userExpTestList.size() == 0){
            testDao.insertPassedExp(exp_id, user_id);
        }
        String testId = getStartTestExpId(class1, user_id);
        return testId;
    }
    private void removePassedOrLearnedExp(Iterator<ExperimentVo> experimentVoIter,
                                          List<Integer> allUnusedExpId) {
        while (experimentVoIter.hasNext()){
            ExperimentVo experimentVo = experimentVoIter.next();
            for(Integer unusedExpId : allUnusedExpId){
                if(experimentVo.getExp_id() == unusedExpId){
                    experimentVoIter.remove();
                }
            }
            experimentVoIter.remove();
        }
    }

    private void removePassedOrLearnedFctf(Iterator<FctfVo> fctfVoIter,
                                          List<Integer> allUnusedFctfId) {
        while (fctfVoIter.hasNext()){
            FctfVo experimentVo = fctfVoIter.next();
            for(Integer unusedFctfId : allUnusedFctfId){
                if(experimentVo.getFctf_id() == unusedFctfId){
                    fctfVoIter.remove();
                }
            }
            fctfVoIter.remove();
        }
    }

    public String getStartTestFctfId(String area, int user_id) {
        List<FctfVo> listFctfClass1 = testDao.getExpByArea(area);
        Iterator<FctfVo> fctfVoIter = listFctfClass1.iterator();
        List<Integer> allPassedExpId = testDao.listAllPassedExpId(user_id, area);
        //排除掉已经测试通过的实验，通过的实验就不再测试了
        removePassedOrLearnedFctf(fctfVoIter, allPassedExpId);

//        for(ExperimentVo experiment : listExpClass1){
//        }
        if(listFctfClass1.size() > 0){
            int index = (int)(Math.random()*listFctfClass1.size());
            return String.valueOf(listFctfClass1.get(index).getFctf_id());
        }
        return null;
    }

    public Fctf startTestFctf(String testId) {
        return testDao.getFctfById(testId);
    }
}
