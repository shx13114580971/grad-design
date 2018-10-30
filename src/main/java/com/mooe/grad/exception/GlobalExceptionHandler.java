package com.mooe.grad.exception;


import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import com.mooe.grad.result.CodeMsg;
import com.mooe.grad.result.Result;

@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {

	//截取所有请求异常
	@ExceptionHandler(value=Exception.class)
	public Result<String> exceptionHandler(HttpServletRequest request,Exception exception) {
		
		if(exception instanceof GlobalException){
			GlobalException gException = (GlobalException)exception;
			return Result.error(gException.getcMsg());
		}else if(exception instanceof BindException){
			BindException ex = (BindException)exception;
			List<ObjectError> errors = ex.getAllErrors();
			//这个error来自@IsMobile
			ObjectError error = errors.get(0);
			String msg = error.getDefaultMessage();
			return Result.error(CodeMsg.BIND_ERROR.fillArgs(msg));
		}else {
			return Result.error(CodeMsg.SERVER_ERROR);
		}
	}
	
}
