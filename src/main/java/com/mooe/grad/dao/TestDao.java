package com.mooe.grad.dao;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.UserExpTest;
import com.mooe.grad.vo.ExperimentVo;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TestDao {

    @Select("select * from experiment_info where class1 = #{class1}")
    public List<ExperimentVo> getExpByClass1(@Param("class1") String class1);

    @Select("select exp_id from user_exp_test where user_id = #{user_id} and exp_id in (select exp_id from experiment_info where class1 = #{class1})")
    public List<Integer> listAllPassedExpId(@Param("user_id") int user_id, @Param("class1")String class1);

    @Select("select * from experiment_info where exp_id = #{testId}")
    public Experiment getExpById(@Param("testId")String testId);

    @Select("select exp_id from user_exp where user_id = #{user_id}")
    public List<Integer> getExpIdByUserId(@Param("user_id") int user_id);

    @Select("select exp_id from user_exp where user_id = #{user_id} and exp_id in (select exp_id from experiment_info where class1 = #{class1})")
    public List<Integer> getExpIdByUserIdAndClass1(@Param("user_id")int user_id, @Param("class1")String class1);

    @Insert("insert into user_exp_test(exp_id,user_id) value(#{exp_id}, #{user_id})")
    public void insertPassedExp(@Param("exp_id")int exp_id, @Param("user_id")int user_id);

    @Select("select expTest_id from user_exp_test where exp_id = #{exp_id} and user_id = #{user_id}")
    public List<Integer> getExpByExpIdAndUserId(@Param("exp_id")int exp_id, @Param("user_id")int user_id);
}
