package com.mooe.grad.dao;

import com.mooe.grad.domain.DeliverInfo;
import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.User;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.FctfVo;
import com.mooe.grad.vo.UserExpVo;
import com.mooe.grad.vo.UserFctfVo;
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

    @Select("select * from fctf_info fctf, user_fctf uf where fctf.fctf_id = uf.fctf_id and uf.user_id = #{user_id}")
    public List<FctfVo> listFctf(@Param("user_id")int user_id);

    @Select("select * from user_fctf where user_id = #{user_id} and fctf_id = #{fctf_id}")
    public List<UserFctfVo> getByUserIdAndFctfId(@Param("user_id")int user_id, @Param("fctf_id")int fctf_id);

    @Insert("insert into user_fctf(user_id,fctf_id,create_time) value(#{user_id},#{fctf_id},#{create_time})")
    public void insertFctf(UserFctfVo userFctfVo);

    @Insert("insert into deliver_info(designer, document, is_provide_vm, vmzip, deploy_RD, create_time) " +
            "value(#{designer}, #{document}, #{is_provide_vm}, #{vmzip}, #{deploy_RD}, #{create_time})")
    public void addDeliver(DeliverInfo deliverInfo);
}
