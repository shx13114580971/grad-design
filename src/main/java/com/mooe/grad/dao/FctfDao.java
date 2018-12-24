package com.mooe.grad.dao;

import com.mooe.grad.domain.Experiment;
import com.mooe.grad.domain.Fctf;
import com.mooe.grad.domain.FctfWriteup;
import com.mooe.grad.vo.ExperimentVo;
import com.mooe.grad.vo.FctfVo;
import org.apache.ibatis.annotations.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Mapper
public interface FctfDao {

    @Insert("insert into fctf_info(fctf_name, host_ip, kvm_ip, envir_name, type area, degree, date, point, tip, brief_intro,  writeup, remark) " +
            "value(#{fctf_name},#{host_ip},#{kvm_ip},#{envir_name},#{type},#{area},#{degree},#{date},#{point},#{tip},#{brief_intro},#{writeup},#{remark})")
    public int addFctf(Fctf fctf);

    @Transactional
    @Update("update fctf_info set fctf_name = #{fctf_name},host_ip = #{host_ip},kvm_ip = #{kvm_ip}, " +
            "envir_name = #{envir_name},area = #{area},type = #{type},tip = #{tip},degree = #{degree}, brief_intro = #{brief_intro}, " +
            " point = #{point}, writeup = #{writeup},  remark = #{remark} where fctf_id = #{fctf_id}")
    public int updateFctf(Fctf fctf);

    @Select("select * from fctf_info")
    public List<FctfVo> listAll();

    @Select("select * from fctf_info where fctf_id = #{fctf_id}")
    public Fctf findById(@Param("fctf_id") int id);

    @Select("select flag from fctf_info where fctf_id = #{fctf_id}")
    public String getFlag(@Param("fctf_id")int fctf_id);

    @Select("select fctf_name from fctf_info where fctf_id = #{fctf_id}")
    public String findNameById(@Param("fctf_id")int fctf_id);

    @Insert("insert into fctf_writeup(user_id, fctf_id, content, title, createtime) value(#{user_id}, #{fctf_id}, #{content}, #{title}, #{createtime})")
    public void addWriteup(FctfWriteup fctfWriteup);

    @Select("select * from fctf_writeup where user_id = #{user_id} and fctf_id = #{fctf_id}")
    public FctfWriteup findByUserIdAndFctfId(@Param("user_id")int user_id, @Param("fctf_id")int fctf_id);

    @Update("update fctf_writeup set content = #{content}, title = #{title} where user_id = #{user_id} and fctf_id = #{fctf_id}")
    public void updateWriteup(FctfWriteup fctfWriteup);
}
