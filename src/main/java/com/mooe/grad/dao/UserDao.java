package com.mooe.grad.dao;

import com.mooe.grad.domain.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserDao {

    @Insert("insert into user(username,password,mobile) value(#{username},#{password},#{mobile})")
    public int insert(User user);

    @Select("select * from user where mobile = #{mobile}")
    public User getByMobile(@Param("mobile")String mobile);
}
