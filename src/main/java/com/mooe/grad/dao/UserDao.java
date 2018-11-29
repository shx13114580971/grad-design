package com.mooe.grad.dao;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.UserExpVo;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserDao {

    @Insert("insert into user(username,password,mobile) value(#{username},#{password},#{mobile})")
    public int insert(User user);

    @Select("select * from user where mobile = #{mobile}")
    public User getByMobile(@Param("mobile")String mobile);

    @Insert("insert into user_exp(user_id,exp_id,create_time) value(#{user_id},#{exp_id},#{create_time})")
    public void insertExp(UserExpVo userExpVo);

    @Select("select * from experiment_info exp, user_exp ue where exp.exp_id = ue.exp_id and ue.user_id = #{user_id}")
    public List<ExperimentVo> listExperiment(@Param("user_id")int user_id);

    @Select("select * from user_exp where user_id = #{user_id} and exp_id = #{exp_id}")
    public List<UserExpVo> getByUserIdAndExpId(@Param("user_id")int user_id, @Param("exp_id")int exp_id);
}
