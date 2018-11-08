package com.mooe.grad.dao;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.ExperimentComment;
import com.mooe.grad.vo.CommemtVo;
import com.mooe.grad.vo.ExperimentVo;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ExperimentDao {

    @Insert("insert into fctf_info(envir_name, host_ip, kvm_ip, exp_name, class1, class2, degree, date image, brief_intro, question, document, summary, remark) " +
            "value(#{envir_name},#{host_ip},#{kvm_ip},#{exp_name},#{class1},#{class2},#{degree},#{date},#{image},#{brief_intro},#{question},#{document},#{summary},#{remark})")
    public int addExp(Experiment experiment);

    @Select("select * from experiment_info")
    public List<ExperimentVo> listAll();

    @Select("select * from experiment_info where exp_id = #{exp_id}")
    public Experiment findById(@Param("exp_id") int id);

    @Update("update experiment_info set envir_name = #{envir_name},host_ip = #{host_ip},kvm_ip = #{kvm_ip}, image =#{image}, " +
            "exp_name = #{exp_name},class1 = #{class1},class2 = #{class2},degree = #{degree}, brief_intro = #{brief_intro}, date = #{date}, " +
            " question = #{question}, document = #{document}, summary = #{summary}, remark = #{remark} where exp_id = #{exp_id}")
    public int updateExp(Experiment experiment);

    @Insert("insert into experiment_comment(exp_id, user_id, content, createtime) value(#{exp_id}, #{user_id}, #{content},#{createtime})")
    public void addComment(ExperimentComment experimentComment);

    @Select("select user.username,com.com_id,com.content,com.createtime from experiment_comment com ,user ,experiment_info exp " +
            "where com.user_id = user.user_id and com.exp_id = exp.exp_id;")
    public List<CommemtVo> listComments();
}
