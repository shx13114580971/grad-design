package com.mooe.grad.dao;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.UserExpTest;
import com.mooe.grad.vo.ExperimentVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TestDao {

    @Select("select * from experiment_info where class1 = #{class1}")
    public List<ExperimentVo> getExpByClass1(@Param("class1") String class1);

    @Select("select * from user_expTest where user_id = #{user_id}")
    public List<UserExpTest> listAll(@Param("user_id") int user_id);

    @Select("select * from experiment_info where exp_id = #{testId}")
    public Experiment getExpById(@Param("testId")String testId);

    @Select("select exp_id from user_exp where user_id = #{user_id}")
    public List<Integer> getExpIdByUserId(@Param("user_id") int user_id);
}
