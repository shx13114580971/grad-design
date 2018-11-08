/**
 * 这是一个通用工具类集合
 * 
 * @author xie_pkuan
 * @date 2013-04-01
 */
 
 /**
  * 验证数据对象
  */
var Validate = new Object();
//报名链接id
var xpCourseId_z = "C172.19.104.182014120315514800001_test";
var num_z01 = 2;

/**
 * 判断元素是否合法
 * @returns {Boolean}
 */
Validate.isValid = function(obj){
	if(typeof(obj) == "undefined" || obj == null){
		return false;
	}
	return true;
};

/**
 * 判断是否字符串
 * @returns {Boolean}
 */
Validate.isString = function(str){
	if(typeof str != "string"){
		return false;
	}
	return true;
};

/**
 * 判断是否是数字
 * @param num {Object}
 * @return {Boolean}
 */
Validate.isNumber = function(num){
	return /^\d+$/.test(num);
};
/**
 * 判断是否为正负数
 */
Validate.isReal=function(num)
{
	return /^(-)?[1-9][0-9]*$/.test(num);
};
Validate.isReal1=function(num)
{
	return /^(-)?[0-9][0-9]*$/.test(num);
};
Validate.isReal2=function(num)
{
	return /^[1-9][0-9]*$/.test(num);
};
/**
 * 判断是否是方法
 * @returns {Boolean}
 */
Validate.isFunction = function(fn){
	if(typeof fn != "function"){
		return false;
	}
	return true;
};

/**
 * 判断是否JSON格式字符串
 * @param jsonstr {String} 字符串参数
 * @return {Boolean} 验证结果
 */
Validate.isJsonString = function(jsonstr){
	var flag = false;
	if(Validate.isValid(jsonstr)){
		try{
			eval("(" + jsonstr + ")");
			flag = true;
		}catch(e){
			flag = false;
		}
	}
	return flag;
};

/**
 * 是否空对象
 * @param obj {Object}
 * @return {Boolean}
 */
Validate.isEmptyObject = function(obj){
	for ( var name in obj ) {
		return false;
	}
	return true;
};

/**
 * 判断是不是IE浏览器
 */
Validate.isIE = function(){
	return navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf(".NET") > -1;
};

/**
 * 判断是不是Chrome浏览器
 */
Validate.isChrome = function(){
	return navigator.userAgent.indexOf("Chrome") > 0;
};

/**
 * 判断是不是Opera浏览器
 */
Validate.isOpera = function(){
	return navigator.userAgent.indexOf("OPR") > 0;
};

/**
 * 判断是不是手机
 */
Validate.isPhone = function(phone){
	var flag = false;
	if(Validate.isValid(phone)){
		var re =/^[1][3456789]\d{9}$/;
		flag = re.test(phone);
	}
	return flag;
};

/**
 * 判断是不是身份证
 * 
 * 1.身份证15位编码规则：dddddd yymmdd xx p
 *   dddddd：6位地区编码
 *   yymmdd: 出生年(两位年)月日，如：910215
 *   xx: 顺序编码，系统产生，无法确定
 *   p: 性别，奇数为男，偶数为女
 *   
 * 2.身份证18位编码规则：dddddd yyyymmdd xxx y
 *   dddddd：6位地区编码
 *   yyyymmdd: 出生年(四位年)月日，如：19910215
 *   xxx：顺序编码，系统产生，无法确定，奇数为男，偶数为女
 *   y: 校验码，该位数值可通过前17位计算获得
 *   前17位号码加权因子为 Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ]
 *   验证位 Y = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ]
 *   如果验证码恰好是10，为了保证身份证是十八位，那么第十八位将用X来代替
 *   校验位计算公式：Y_P = mod( ∑(Ai×Wi),11 )
 *   i为身份证号码1...17 位; Y_P为校验码Y所在校验码数组位置    
 */
Validate.isIdCard = function(idCard){
	var flag = false;
	//15位和18位身份证号码的正则表达式
	var regIdCard=/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
	//如果通过该验证，说明身份证格式正确，但准确性还需计算
	if(regIdCard.test(idCard)){
		if(idCard.length==18){
		    var idCardWi=new Array( 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ); //将前17位加权因子保存在数组里
		    var idCardY=new Array( 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ); //这是除以11后，可能产生的11位余数、验证码，也保存成数组
		    var idCardWiSum=0; //用来保存前17位各自乖以加权因子后的总和
		    for(var i=0;i<17;i++){
		    	idCardWiSum+=idCard.substring(i,i+1)*idCardWi[i];
		    }
		    var idCardMod=idCardWiSum%11;//计算出校验码所在数组的位置
		    var idCardLast=idCard.substring(17);//得到最后一位身份证号码
		    //如果等于2，则说明校验码是10，身份证号码最后一位应该是X
		    if(idCardMod==2){
		    	if(idCardLast=="X"||idCardLast=="x"){
		    		flag = true;
		    	}else{
		    		flag = false;
		    	}
		    }else{
		    	//用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
			    if(idCardLast==idCardY[idCardMod]){
			    	flag = true;
			    }else{
			    	flag = false;
			    }
		   }
		} 
	}else{
		flag = false;
	}
	return flag;
};

/**
 * 判断所有的字符是汉字
 */
Validate.isChineseCharacters = function(chinesecharacters){
	var flag = false;
	var regChinChara = /^[\._\u4e00-\u9fa5]*$/;
	if(regChinChara.test(chinesecharacters)){
		flag = true;
	}
	return flag;
};
/**
 * 判断所有的字符是拼音
 */
Validate.isPinyin = function(pinyin){
	var flag = false;
	var regPinyin = /^[A-Za-z ]*$/;
	if(regPinyin.test(pinyin)){
		flag = true;
	}
	return flag;
};

/**
 * 通用的转换类
 */
var ConvertUtil = new Object();

/**
 * 转换Url，添加时间戳
 * @param url {String }需要转换的Url
 * @returns {String} 转换后的Url
 */
ConvertUtil.convertURL = function(url){  
	  var timstamp = (new date).valueOf();  
	  if (url.indexOf("?")>=0){  
	     url = url + "&t=" + timstamp;   
	  }else {  
	     url = url + "?t=" + timstamp;  
	  };  
	  return url;  
};

/**
 * 转换成数字
 * @param strNum {Object} 需要转换的对象
 * @return {Number} 转换后的数字
 */
ConvertUtil.convert2Number = function(strNum){
	if(Validate.isValid(strNum)){
		if(isNaN(Number(strNum.toString()))){
			return -1;
		}else{
			return Number(strNum.toString());
		}
	}
};

/**
 * 转换JSON格式时间为yyyy-MM-dd HH:mm:ss格式字符串
 * @param strDate {JSON}
 * @return {String}
 */
ConvertUtil.convertDate = function(strDate){
	if(Validate.isValid(strDate)){
		var year=$(strDate).attr("year")+1900;
		var monte=$(strDate).attr("month")+1;
		var days=$(strDate).attr("date");
		var hours=$(strDate).attr("hours");
		var minutes=$(strDate).attr("minutes");
		var seconds=$(strDate).attr("seconds");
		var time = year + "-" + monte + "-" + days + " " + hours + ":" + minutes + ":" + seconds;
		return time;
	}return "";
};

var chineseNum = new Array("零","一","二","三","四","五","六","七","八","九");
var chineseTen = "十";
var chineseHundred = "百";
var chineseThousand = "千";
var chineseTenThousand = "万";
var chineseHundredMillion = "亿";
var waitMillSecond = 10000;

/**
 * 转换数字成汉字模式，暂时只支持一千以下数字
 * @param number {Number} 数字
 * @return {String} 转换后的
 */
ConvertUtil.number2Chinese = function(number){
	if(!Validate.isNumber(number)){
		return "";
	}
	number = ConvertUtil.convert2Number(number);
	var rtnStr = "";
	var hundreds = (number / 100);
	hundreds = parseInt(hundreds);
	rtnStr += (hundreds == 0) ? "" : (chineseNum[hundreds] + chineseHundred);
	number = (number % 100);
	if(number != 0){
		if(hundreds > 0 && number < 10){
			rtnStr += chineseNum[0];
		}
		var tens = (number / 10);
		tens = parseInt(tens);
		rtnStr += (tens == 0) ? "" : ((tens == 1 ) ? chineseTen : chineseNum[tens] + chineseTen);
		number = (number % 10);
		if(number != 0){
			rtnStr += chineseNum[number];
		}
	}
	return rtnStr;
} ;
/**
 * 数字转换成英文
 * @param number {Number} 数字
 * @return {String} 转换后的
 */
ConvertUtil.Englishnumber = function(number){
	if(!Validate.isNumber(number)){
		return null;
	}
	var rtnStr ="";
	var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	if(Validate.isNumber(number)){ //先判断是否是数字然后判断是否在1-12之间
		if(number >= 1 && number <= 12){
			rtnStr =  month[number-1];
			return rtnStr;
		}else{
			return null;
		}
	}else{
		return null;
	}
}
/**
 * 数字字符转换数字
 * 支持九十九一下
 */
ConvertUtil.Chinese2number = function(str){
	//jAlert(str+"1212121");
	if(str == null || str == ""){
		return 0;
	}else{
		if(str.length == 1 ){
			if(chineseTen == str){
				return 10;
			}else{
				return chineseNum.getIndex(str);
			}
		}
		if(str.length == 2){
			if(str[0] == chineseTen){
				return 1 + chineseNum.getIndex(str[1]);
			}
			if(str[1] == chineseTen){
				return  chineseNum.getIndex(str[1])+0 ;
			}
		}
		if(str.length == 3){
			if(str[1] == chineseTen){
				return  chineseNum.getIndex(str[0])+ chineseNum.getIndex(str[1]);
			}
		}
	}
};

/**
 * 对ID进行编码
 * @param {String} id
 * @return {String}
 */
ConvertUtil.encodeID = function(id){
	if(Validate.isValid(id)){
		return id.replace(/\./g,"-");
	}
	return null;
};

/**
 * 对ID进行解码
 * @param {String} id
 * @return {String}
 */
ConvertUtil.decodeID = function(id){
	if(Validate.isValid(id)){
		return id.replace(/\-/g,".");
	}
	return null;
};

/**
 * 截断字符串
 */
ConvertUtil.truncate = function(str,len){
	var ss = html2Text(replaceHtml2Text(str));
	var realName = ss;
	var strName = ss.replace(/[^\x00-\xff]/g, 'xx');
	var strLength = strName.length;
	if(strLength > len){// 加…
		if(isAllChn(ss)){// 全中文
			realName = ss.substring(0,len/2);
			realName = realName+"…";
		}else if(isHasChn(ss)){// 部分中文
			realName = ss.substring(0,len-2);
			realName = realName+"…";
		}else{
			realName = ss.substring(0,len);
			realName = realName+"…";
		}
	}
	return replaceText2Html(realName, str);
};

/**
 * shen_hang
 * 截断字符串
 */
ConvertUtil.truncate1 = function(str,len){
	var ss = html2Text(replaceHtml2Text(str));
	var realName = ss;
	var strName = ss.replace(/[^\x00-\xff]/g, 'xx');
	var strLength = strName.length;
	if(strLength > 14){// 加…
		if(isAllChn(ss)){// 全中文
			realName = ss.substring(0,len/2);
			realName = realName+"…";
		}else if(isHasChn(ss)){// 部分中文
			realName = ss.substring(0,len-2);
			realName = realName+"…";
		}else{
			realName = ss.substring(0,len);
			realName = realName+"…";
		}
	}
	return replaceText2Html(realName, str);
};

/**
 * 截断字符串 version 2
 */
ConvertUtil.truncateVersion2 = function(str,len){
	var ss = html2Text(replaceHtml2Text(str));
	var realName = ss;
	var strName = ss.replace(/[^\x00-\xff]/g, 'xx');
	var strLength = strName.length;
	if(strLength > len){// 加…
		if(isAllChn(ss)){// 全中文
			realName = ss.substring(0,(len/2)-1);
			realName = realName+"…";
		}else if(isHasChn(ss)){// 部分中文
			realName = ss.substring(0,len-6);
			realName = realName+"…";
		}else{
			realName = ss.substring(0,len-4);
			realName = realName+"…";
		}
	}
	return realName;
};

/**
 * 获取html字符串中的text文本
 * @returns
 */
function getHtmlText(htmlstr){
	$(document).append("<div id=\"asdfghjkl_zxcvbnm\" style=\"display:none;\"></div>");
	$("#asdfghjkl_zxcvbnm").html(htmlstr);
	var text = $("#asdfghjkl_zxcvbnm").text();
	$("#asdfghjkl_zxcvbnm").remove();
	return text;
}

/**
 * 
 * @param htm
 * @returns
 */
function replaceHtml2Text(htm){
	var reg = /(<a[^>]*href=['"][^"]*['"][^>]*>(.*?)<\/a>)/g;
	var finalText = htm;
	while(reg.exec(htm) != null)
	{
		finalText = finalText.replace(RegExp.$1,RegExp.$2);
		//arr.push(RegExp.$2);//如果是RegExp.$1那么匹配的就是href里的属性了!
	}
	return finalText;
}

/**
 * 
 * @param txt
 * @param htm
 * @returns
 */
function replaceText2Html(txt,htm){
	var reg = /(<a[^>]*href=['"][^"]*['"][^>]*>(.*?)<\/a>)/g;
	var finalHtml = txt;
	while(reg.exec(htm) != null)
	{
		finalHtml = finalHtml.replace(RegExp.$2,RegExp.$1);
		//arr.push(RegExp.$2);//如果是RegExp.$1那么匹配的就是href里的属性了!
	}
	return finalHtml;
}

/**
 * 将html转成test
 * @param html
 * @returns
 */
function html2Text(html){
	var str = "<span id=\"html2Text_zh\" style=\"display:none;\">"+html+"</span>";
	$("body").append(str);
	html = $("#html2Text_zh").text();
	$("#html2Text_zh").remove();
	return html;
}

/**
 * 获取数组中该元素的下标
 * @param obj
 * @returns {Number}
 */
Array.prototype.getIndex = function(obj){
	for ( var idx = 0; idx < this.length; idx++) {
		if(this[idx] == obj){
			return idx;
		}
	}
	return -1;
};

/**
 * 判断数组中是否存在该元素
 * @param obj
 * @returns {Boolean}
 */
Array.prototype.contains = function(obj){
	if(Validate.isValid(obj)){
		for ( var idx = 0; idx < this.length; idx++) {
			if(this[idx] == obj){
				return true;
			}
		}
	}
	return false;
};

/**
 * 移除数组中的某个元素
 * @param obj
 */
Array.prototype.remove = function(obj) {
	if(Validate.isValid(obj)){
		for (var i = 0; i < this.length; i++) {
			if (obj == this[i])
				this.splice(i, 1);
		}
	}
};

/**
 * 清空数组
 */
Array.prototype.clear = function() {
	this.length = 0;
};

/**
 * 
 * @return {}
 */
Array.prototype.clone = function(){
	return this.slice(0);
};

//Array.prototype.remove = function(from, to) {  
//    var rest = this.slice((to || from) + 1 || this.length);  
//    this.length = from < 0 ? this.length + from : from;  
//    return this.push.apply(this, rest);  
//};  

/**
 * 弹出字符串并返回
 * @returns {String}
 */
String.prototype.show = function(){
	//jAlert(this.toString());
	return this;
};

/**
 * 去掉字符串前后空格
 * @return {String}
 */
String.prototype.trim = function()
{
     //用正则表达式将前后空格
     //用空字符串替代。
     return this.replace(/(^\s*)|(\s*$)/g, "");
};

/**
 * 替换字符串中所有的指定字符
 * @param regexp {String} 正则表达式或字母
 * @param replacement {String}
 * @return {String}
 */
String.prototype.replaceAll = function(regexp, replacement){
	regexp = new RegExp(regexp,"gm");
	return this.replace(regexp, replacement);
};

/**
 * 判断字符串是否相等
 * @param str {String}
 * @returns {Boolean}
 */
String.prototype.equals = function(str){
	if(Validate.isValid(str)){
		if(!Validate.isString(str)){
			str = str.toString();
		}
		if(this == str){
			return true;
		}
	}
	return false;
};

/**
 * 判断字符串是否包含另一个字符串
 * 不去分大小写
 * @param str {String}
 * @returns {Boolean}
 */
String.prototype.contains = function(str) {
	if(this.toLowerCase().indexOf(str.toLowerCase()) >= 0) {
		return true;
	}else {
		return false;
	}
};

/**
 * 判断字符串是否为空
 * @returns {Boolean}
 */
String.prototype.isEmpty = function(){
	if(Validate.isValid(this)){
		if(this.length > 0){
			return false;
		}
	}
	return true;
};

/**
 * 
 * @param {} len
 * @return {}
 */
String.prototype.cut = function(len) {
    var position = 0;
    var result = [];
    var tale = '';
    for (var i = 0; i < this.length; i++) {
        if (position >= len) {
            tale = '...';
            break;
        }
        if (this.charCodeAt(i) > 255) {
            position += 2;
            result.push(this.substr(i, 1));
        }
        else {
            position++;
            result.push(this.substr(i, 1));
        }
    }
    return result.join("") + tale;
};
/**
 * 
 * @param {} dstDate
 * @return {}
 */
Date.prototype.after = function(dstDate){
	if(Validate.isValid(dstDate)){
		var time = this.getTime();
		var dstTime = dstDate.getTime();
		return dstTime < time;
	}
};

/**
 * 
 * @param {} dstDate
 * @return {}
 */
Date.prototype.before = function(dstDate){
	if(Validate.isValid(dstDate)){
		var time = this.getTime();
		var dstTime = dstDate.getTime();
		return dstTime > time;
	}
};

/**
 * 
 * @param {} dstDate
 * @return {}
 */
Date.prototype.equals = function(dstDate){
	if(Validate.isValid(dstDate)){
		var time = this.getTime();
		var dstTime = dstDate.getTime();
		return dstTime == time;
	}
};

/**
 * 
 * @param {} format
 * @return {}
 */
Date.prototype.format = function(format)
{
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
	 	"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
	 	"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
	 	"S" : this.getMilliseconds() //millisecond
	};

	if(/(y+)/.test(format)) 
	{
		format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}
	
 	for(var k in o)
	{
		if(new RegExp("("+ k +")").test(format))
		{
 			format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
};

/**
 * 字符串缓冲类
 * @returns {StringBuffer}
 */
function StringBuffer(){
    this._strings = new Array();
}

/**
 * 字符串拼接方法
 * @param str 要拼接的字符串
 * @returns {StringBuffer}
 */
StringBuffer.prototype.append = function(str) {
    this._strings.push(str);
    return this;
};

/**
 * 转换成字符串类
 * @returns
 */
StringBuffer.prototype.toString = function(){
    var str = arguments.length == 0 ? "" : arguments[0];
    return this._strings.join(str);
};

/**
 * 清空当前缓冲字符串
 */
StringBuffer.prototype.clear = function() { // 清空数组
    this._strings.length = 0;
};

/**
 * 页面跳转的工具类
 */
var SkipUtil = new Object();

/**
 * 以post方式提交请求
 * @param url {String} 请求url
 * @param params {JSON/String} 参数JSON格式或者"key1=value1&key2=value2"格式
 */
SkipUtil.post = function(url, params){
	if(Validate.isValid(url)){
		var uuid = UUID.create(4).toString();
		$("body").append("<div id=\"" + uuid + "\" style=\"display:none;\"></div>");
		var formDiv = $("#" + uuid);
		var form = $(formDiv).append("<form action=\"" + url + "\" method=\"post\"></form>").find("form");
		if(Validate.isValid(params)){//字符串
			var isJson = true;
			var jsonParam = params;
			if(Validate.isString(params)){
				if(Validate.isJsonString(params)){//JSON格式的字符串
					jsonParam = eval("(" + params + ")");
				}else{//普通格式字符串
					isJson = false;
					params = params.toString().replace(/[?'"]/g,"");
					var ps = params.split("&");
					for(var k in ps){
						if(Validate.isValid(ps[k]) && !Validate.isFunction(ps[k])){
							var kv = ps[k];
							var pp = kv.toString().split("=");
							$(form).append("<input type=hidden name=\"" + pp[0] + "\" value=\"" + pp[1] + "\" />");
						}
					}
				}
			}
			if(isJson){
				for(var k in jsonParam){
					if(Validate.isValid(jsonParam[k]) && !Validate.isFunction(jsonParam[k])){
						$(form).append("<input type=hidden name=\"" + k.toString() + "\" value=\"" + jsonParam[k] + "\" />");
					}
				}
			}
		}
		$(form).submit();
	}
};

/**
 * 下载文件使用
 * @param url {String} 访问路径
 */
SkipUtil.download = function(url){
	if(Validate.isValid(url)){
		var uuid = UUID.create(4).toString();
		$("body").append("<iframe id=\"" + uuid + "\" frameborder=\"0\" align=\"bottom\" style=\"display:none;\" src=\"" + url + "\"></iframe>");
		
//		jAlert($(document.getElementById(uuid).contentWindow.document.body).html());
//		jAlert($("body",window.frames(uuid).document).html());
//		var doc;
//        if (document.all){//IE
//                doc = document.frames[uuid].document;
//        }else{//Firefox    
//                doc = document.getElementById(uuid).contentDocument;
//        }

//      doc.getElementById("s").style.color="blue";
//		jAlert($(document.getElementById(uuid).contentWindow.document).html());
//		jAlert(doc.getElementById("message").innerText);
	}
};

var ImportUtil = new Object();

/**
 * 导入JS文件库,已经使用js/跟目录和.js后缀了
 * @param {Array} libs
 */
ImportUtil.importJsLibs = function(libs){
	if(Validate.isValid(libs)){
		for ( var idx = 0; idx < libs.length; idx++ ) {
			document.write("<script type=\"text/javascript\" src=\"js/" + libs[idx] + ".js\"></script>");
		}
	}
};
/**
 * 动态导入js
 */
ImportUtil.importDynJs = function(libs){
	if(Validate.isValid(libs)){
		for ( var idx = 0; idx < libs.length; idx++ ) {
			document.write("<script type=\"text/javascript\" src=\"js/" + libs[idx] + ".js?rnd=" + Math.random()+ "\"></script>");
		}
	}
};
/**
 * 导入CSS文件库,已经使用css/跟目录和.css后缀了
 * @param {Array} libs
 */
ImportUtil.linkCssLibs = function(libs){
	if(Validate.isValid(libs)){
		for ( var idx = 0; idx < libs.length; idx++ ) {
			document.write(" <link type=\"text/css\" href=\"css/"+ libs[idx] + ".css\" rel=\"stylesheet\">");
		}
	}
};
/**
 * 动态导入css
 */
ImportUtil.linkDynCss = function(libs){
	if(Validate.isValid(libs)){
		for ( var idx = 0; idx < libs.length; idx++ ) {
			document.write(" <link type=\"text/css\" href=\"css/"+ libs[idx] + ".css?rnd=" + Math.random()+ "\" rel=\"stylesheet\">");
		}
	}
};
/**
 * 返回动态路径
 */
ImportUtil.DynfileUrl = function(url){
	return url+"?rnd="+Math.random();
};
var LocationUtil = new Object();

/**
 * 从Location获取参数
 * @param {String} name
 * @return {String}
 */
LocationUtil.getParameter = function(name) {
	// 获取参数
    var url = window.location.search;
    // 正则筛选地址栏
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    // 匹配目标参数
    var result = url.substr(1).match(reg);
    //返回参数值
    return result ? decodeURIComponent(result[2]) : null;
};

/**
 * 从Location获取服务器的域名
 * @return {String}
 */
LocationUtil.getServerUrl = function() {
	var host = document.location.host;//服务器，包括端口
	var pathname = document.location.pathname;//当前 URL 的路径部分
	var base = "/";
	if(pathname.toString().indexOf("erange/") == 1){
		base += "erange/";
	}
    return ("http://" + host + base);
};

/**
 * 
 * @param {String} url
 * @return {String}
 */
LocationUtil.encodeUrl = function(url) {
	if(Validate.isValid(url) && Validate.isString(url)){
		var surl = new StringBuffer();
		if(url.toString().contains("?")){
			var u = url.split("?");
			surl.append(u[0]);
			surl.append(";");
			surl.append("sid=");
			surl.append($("#sessionuuid").val());
			surl.append("?");
			surl.append(u[1]);
		}else{
			surl.append(url);
			surl.append(";");
			surl.append("sid=");
			surl.append($("#sessionuuid").val());
		}
		return surl.toString();
	}
	return null;
};

/**
 * 从Location获取应用的跟地址
 * @return {String}
 */
LocationUtil.getContextPath = function() {
	var host = document.location.host;//服务器，包括端口
	var pathname = document.location.pathname;//当前 URL 的路径部分
	var base = "/";
	if(pathname.toString().indexOf("erange/") == 1){
		base += "erange/";
	}
	if(pathname.toString().indexOf("beta/") == 1){
		base += "beta/";
	}
	return ("http://" + host + base);
};

function gotoPage(pageNo, pageSize, url, callback){
		
}

function previousPage(pageNo, pageSize, url, callback){
	
}

function nextPage(pageNo, pageSize, url, callback){
	
}



/**
 * 创建教师，学生获得实验环境操作系统类型的tr标签
 * 暂不用
 */
function createTrforResource(vmid,os,uName,pw,ip) {
	var p_tr = "<tr id='" + vmid + "'><td width='10%' class='hit-borderR hit-borderB'><img src='";//"
	if(os.contains("win") || os.contains("windows")) {
		p_tr = p_tr + "img/common/windows.png'/></td>";
	}else if(os.contains("linux")) {
		p_tr = p_tr + "img/common/linux.png'/></td>";
	}else if(os.contains("CentOS")) {//added by lhy begin
		p_tr = p_tr + "img/common/centos.png'/></td>";
	}else if(os.contains("FreeBSD")) {
		p_tr = p_tr + "img/common/freebsd.png'/></td>";
	}else if(os.contains("Fedora")) {
		p_tr = p_tr + "img/common/fedora.png'/></td>";
	}else if(os.contains("Ubuntu")) {
		p_tr = p_tr + "img/common/ubuntu.png'/></td>";
	}else if(os.contains("Solaris")) {
		p_tr = p_tr + "img/common/solaris.png'/></td>";
	}else if(os.contains("Debian")) {
		p_tr = p_tr + "img/common/debian.png'/></td>";//added by lhy end
	}else {
		p_tr = p_tr + "img/exp/freein.jpg'/></td>";
	}
	p_tr = p_tr + "<td width='10%' class='hit-borderR hit-borderB'>" + uName + "/" + pw + "</td>";
	p_tr = p_tr + "<td width='10%' class='hit-editInput hit-borderR hit-borderB'>" + ip + "</td>";
	p_tr = p_tr + "<td width='10%' class='hit-editInput hit-borderB'><a class='hit-vmLogin' href='javascript:void(0)'>登录</a></td>";
	p_tr = p_tr + "</tr>";
	return p_tr;
}
/*
function getConsole(uName, expName, vmId, vmName, ip, port){
	SAJAX.send("teacher/courseExp!getConsole.action",{"vmId" : vmId},
		function(data){
			if($(data).attr("result") == "success") {
				var childWin;
				if($.browser.mozilla) {
					var optimal_width = window.screen.availWidth-40;//window.innerWidth;
           			var optimal_height = window.screen.availHeight-90;//window.innerHeight;

           			// Scale width/height to be at least 800x600
           			if (optimal_width < 800 || optimal_height < 600) {
		               var scale = Math.max(800 / optimal_width, 600 / optimal_height);
		               optimal_width = Math.floor(optimal_width * scale);
		               optimal_height = Math.floor(optimal_height * scale);
		           	}
					
					childWin = window.open($(data).attr("console") + "&title=" + encodeURI(uName+"-"+expName+"-"+ vmName), vmId, "fullscreen,scrollbars=yes,menubar=no,resizable=no,status=no,help=no,toolbar=no");
//					setTimeout(function(){alert(childWin==null); alert("yes")}, 5000);
				}else {
					childWin = window.showModelessDialog($(data).attr("console") + "&title=" + encodeURI(uName+"-"+expName+"-"+ vmName), vmId, "toolbar:no;menubar:no;scroll:no;resizable:no;location:no;status:no;help:no;dialogWidth:" + optimal_width + "px;dialogHeight:" + optimal_height + "px;dialogTop:0px;dialogLeft:0px;resizable:no;");
//					setTimeout((childWin.document.title = vmName + "-" + ip + ":" + port), 5000);
				}
				//window.open($(data).attr("console"),"",null, false);
			}
		});
}
*/
function getConsole(cId,eId,uId,vmId){
	var url = "/queryExpStudy.do?ceid="+eId+"&uid="+uId;
	var ischrome  = window.navigator.userAgent.indexOf("Chrome") > -1 ;
	if($.browser.mozilla || ischrome) {
		window.open(url,"","fullscreen,scrollbars=yes,menubar=no,resizable=no,status=no,help=no,toolbar=no,location=no,directories=no");
	}else {
		window.showModelessDialog(url,"flash","toolbar:no;menubar:no;scroll:no;resizable:no;location:no;status:no;help:no;dialogWidth:"+screen.availWidth+"px;dialogHeight:"+screen.availHeight+"px;dialogTop:0px;dialogLeft:0px;resizable:no;");
	}
}

function getStuConsole(cId,eId,uId,vmId){
	var url = "/queryExpStudy.do?ceid="+eId+"&cid="+cId;
	var ischrome  = window.navigator.userAgent.indexOf("Chrome") > -1 ;
	if($.browser.mozilla || ischrome) {
//		window.open(url,"","fullscreen,scrollbars=yes,menubar=no,resizable=no,status=no,help=no,toolbar=no,location=no,directories=no");
		var str = "<a id=\"enter\" href=\""+url+"\" target=\"_blank\"><span id=\"enterc\">进入</span></a>";
		$("body").append(str);
		$("#enterc").trigger("click");
		$("#enterc").remove();
	}else {
//		window.showModelessDialog(url,"flash","toolbar:no;menubar:no;scroll:no;resizable:no;location:no;status:no;help:no;dialogWidth:"+screen.availWidth+"px;dialogHeight:"+screen.availHeight+"px;dialogTop:0px;dialogLeft:0px;resizable:no;");
		var str = "<a id=\"enter\" href=\""+url+"\" target=\"_blank\"><span id=\"enterc\">进入</span></a>";
		$("body").append(str);
		$("#enterc").trigger("click");
		$("#enterc").remove();
	}
}
/**
 * 登录展示div的生成，ip,端口,系统,登录名,密码,登录方式,只有一种系统
 */
function createDivforResource(courId,expId,ip,method,port,os,uName,pw,type,vmName,vmId,status) {
	var p_div = "<div class=\"info-wrap infowrap-ew\">";
	if(typeof status != "undefined" && status != null && (status == "10100004" || status == "10100007")){
		p_div = p_div + "<div id=\"vm_pro_" + vmId + "\" class=\"fl\" style=\"font-size:18px;color:#555555;padding-left:35px;\">";
		p_div = p_div + "<img src=\"img/loadImg.gif\"/><div style=\"margin-top: 52px; width: 400px;\">同学，我在努力启动中...约30秒，稍候</div>";
		p_div = p_div + "</div>";
		p_div = p_div + "<div id=\"vm_" + vmId + "\" class=\"fl\" style=\"font-size:13px;color:#555555;display:none;\">";
	}else{
		p_div = p_div + "<div id=\"vm_" + vmId + "\" class=\"fl\" style=\"font-size:13px;color:#555555;\">";
	}
	if(os.contains("win") || os.contains("windows")) {
		p_div = p_div + "<img style=\"margin-top:71px;\" src='img/common/icon-win.png' />";	
	}else if(os.contains("linux") || os.contains("CentOS") || os.contains("FreeBSD") || os.contains("Fedora") || os.contains("Ubuntu") || os.contains("Solaris") || os.contains("Debian")) {
		p_div = p_div + "<img style=\"margin-top:71px;\" src='img/common/icon-lin.png' />";
	}else {
		p_div = p_div + "<img style=\"margin-top:71px;\" src='img/common/icon-other.png' />";
	}
	p_div = p_div + "<div style=\"float:right;\">";
	if(method == "10020001" ) {
		p_div = p_div + "<em>登录方式：VNC</em>";
	}else if(method == "10020002" ) {
		p_div = p_div + "<em>登录方式：远程桌面连接</em>";
	}else if(method == "10020003" ) {
		p_div = p_div + "<em>登录方式：Putty</em>";
	}else if(method == "10020004" ) {
		p_div = p_div + "<em>登录方式：Telnet</em>";
	}
	p_div = p_div + "<br />";
	p_div = p_div + "<em>机器名称："+vmName+"</em><br />";
	p_div = p_div + "<em>远程IP/端口：" + ip + ":" + port + " " + createSwf(ip+":"+port,0,"复制IP/端口号")+"</em><br />";
	p_div = p_div + "<em>用户名："+ uName + "" + createSwf(uName,0,"复制用户名")+"</em><br/>";
	p_div = p_div + "<em>密码：" + pw + " " + createSwf(pw,0,"复制密码")+"</em>";
	p_div = p_div + "</div></div><button style=\"display:none;\" onclick=\"getConsole('"+ courId + "','" + expId + "','" + $("#sessionuuid").val() + "','" + vmId + "')\">web登录</button></div>";
	return p_div;
	
}
function createSwf(copyStr,ptop,ti) {
	return "";
	var objswf = "<div title='"+ti+"' class='fl' style='position:absolute;margin-top:"+ptop+"px'> <object type=\"application/x-shockwave-flash\" data=\"img/copyToClipboard.swf\" width=\"70\" height=\"50\">" +
	"<param name=\"movie\" value=\"img/copyToClipboard.swf\" />" +
	"<param name=\"flashvars\" value=\"cstr=" + copyStr + "\" />" +
	"<param name=\"quality\" value=\"high\" />" +
	"<param name=\"bgcolor\" value=\"${bgcolor}\" />" +
	"<param name='wmode' value='transparent'>" +
	"<embed src=\"img/copyToClipboard.swf\" flashvars=\"cstr=" + copyStr + "\" quality=\"high\">" +
	"</object></div>";
	return objswf;
}

function copyRight() {
	//jAlert("复制成功！", null, function(){}, waitMillSecond);
}

/**
 * //获得Cookie解码后的值
 * @param offset
 * @returns
 */
function  GetCookieVal(name)
{
	try{
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        if(arr != null) {
            return unescape(arr[2]); 
        }
        return null;
    }
    catch(e){
         throw new Error("GetCookies: " + e.message);
        return false;
    }
}
/**
 * //设定Cookie值
 * @param name
 * @param value
 */
function  SetCookie(name,  value)
{
	 try{
         if(arguments.length == 2) return arguments.callee(name,value,30*24*60*60*1000);                        
         var exp= new Date();
         exp.setTime(exp.getTime() +  30*24*60*60*1000);
         document.cookie = name + "="+ escape(value) +";expires="+ exp.toGMTString()+";path=/";
     }
     catch(e){
        throw new Error("SetCookies: " + e.message);
         return false;
     }
}
function  SetCookieTime(name,  value,timer)
{
	 try{
         if(arguments.length == 2) return arguments.callee(name,value,30*24*60*60*1000);                        
         var exp= new Date();
         exp.setTime(exp.getTime() +  timer);
         document.cookie = name + "="+ escape(value) +";expires="+ exp.toGMTString()+";path=/";
     }
     catch(e){
        throw new Error("SetCookies: " + e.message);
         return false;
     }
}
function delCookie(name)//删除cookie
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 10000);
    var cval=GetCookieVal(name);
    if(cval!=null) {document.cookie= name + "="+escape('')+";expires="+exp.toGMTString()+";path=/"};
    
}
function infoMesg(jQobj,mesg){
	var divdemo = $("<div class=\"infoMesgDiv\" />")
	.css("background-image","url('img/common/noPic_50.png')")
	.css("background-repeat","no-repeat")
	.height(55)
	.html("<div class='resultInfoDiv' style='margin-left:60px;float:left;margin-top:14px;font-size:14px;'>" +mesg + "</div>");
	jQobj.html(divdemo);
	var parwWid = jQobj.width();
	var infowidth = parwWid - $(".resultInfoDiv").width()-60 ;
	divdemo.css("margin-left",infowidth*.5); 
	
}
function getPageScroll(){ //获取滚动条高度
	var yScroll; 
	if (self.pageYOffset) { 
		yScroll = self.pageYOffset; 
	        //xScroll = self.pageXOffset; 
	} else if (document.documentElement && document.documentElement.scrollTop){ 
		yScroll = document.documentElement.scrollTop; 
	} else if (document.body) { 
		yScroll = document.body.scrollTop; 
	} 
		return yScroll; 
	}
function getClientHeight()
{
    var clientHeight=0;
    if(document.body.clientHeight&&document.documentElement.clientHeight)
    {
        var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;        
    }
    else
    {
        var clientHeight = (document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;    
    }
    return clientHeight;
}
function AnalyzePasswordSecurityLevel(password) {//密码强度
    var pwdArray = new Array();
    var securityLevelFlag = 0;
    if (password.length < 6 || password.length > 16) {
        return 0;
    }
    else {
        var securityLevelFlagArray = new Array(0, 0, 0, 0);
        for (var i = 0; i < password.length; i++) {
            var asciiNumber = password.substr(i, 1).charCodeAt();
            if (asciiNumber >= 48 && asciiNumber <= 57) {
                securityLevelFlagArray[0] = 1;  //digital
            }
            else if (asciiNumber >= 97 && asciiNumber <= 122) {
                securityLevelFlagArray[1] = 1;  //lowercase
            }
            else if (asciiNumber >= 65 && asciiNumber <= 90) {
                securityLevelFlagArray[2] = 1;  //uppercase
            }
            else {
                securityLevelFlagArray[3] = 1;  //specialcase
            }
        }

        for (var i = 0; i < securityLevelFlagArray.length; i++) {
            if (securityLevelFlagArray[i] == 1) {
                securityLevelFlag++;
            }
        }
        return securityLevelFlag;
    }
}
/**
 * 检查输入框的字数
 * @param tarId
 */
function checkText(tarId) {
	var str = $(tarId).val();
	var ctimer;
	clearInterval(ctimer);
	ctimer = setInterval(checkLen, 500);
	function checkLen() {
		str = $(tarId).val();
		$(tarId).prev().find("span").text(140-str.length);
	}
}

function closeLogin(){
	$(".modal-backdrop").remove();
	$(".loginContent").remove();
	$("#infodiv").css("display","none");
	$(".emaillist").html("");
}


function loginKeyDown(e){
	var keycode;//记录键值
	if($.browser.msie) {//ie浏览器
		keycode = event.keyCode;
	}else {
		keycode = e.which;
	}
	if(keycode == 13){//回车
		$(".loginContent").find("button").trigger('click');
	}
}
/**
 * 接受json传过来的日期
 * @param strDate
 * @returns
 */
function sqlDate2Str(strDate){
	if(Validate.isValid(strDate)){
		var year=$(strDate).attr("year")+1900;
		var month=$(strDate).attr("month")+1;
		var days=$(strDate).attr("date");
		var hours=$(strDate).attr("hours");
		var minutes=$(strDate).attr("minutes");
		var seconds=$(strDate).attr("seconds");
		var now = new Date();
		var reStr;
		if(parseInt(month) < 10) {
			month = "0" + month;
		}
		if(parseInt(days) < 10) {
			days = "0" + days;
		}
		reStr = year + "-" + month + "-" + days + " ";
		if(parseInt(hours) < 10) {
			hours = "0" + hours;
		}
		if(parseInt(minutes) < 10) {
			minutes = "0" + minutes;
		}
		if(parseInt(seconds) < 10) {
			seconds = "0" + seconds;
		}
		reStr = reStr + hours + ":" + minutes + ":" + seconds;
		return reStr;
	}else {
		return "";
	}
}

/**
 * SQL中的日期转换成中文中的口语表达，比如一分钟内、几分钟前、几小时前等
 * @param strDate
 * @param diffTime
 * @returns
 */
function sqlDate2myDate(strDate,diffTime){
	if(diffTime != null && diffTime >= 0) {
		var dStr = parseInt(diffTime/60) + "分钟前";
		if(diffTime < 60) {
			dStr = "刚刚";
		}
		return dStr;
	}else if(Validate.isValid(strDate)){
		var year=$(strDate).attr("year")+1900;
		var month=$(strDate).attr("month")+1;
		var days=$(strDate).attr("date");
		var hours=$(strDate).attr("hours");
		var minutes=$(strDate).attr("minutes");
		var seconds=$(strDate).attr("seconds");
		var now = new Date();
		var reStr;
		if(now.getFullYear() == year && (now.getMonth()+1) == month && now.getDate() == days) {
			reStr = "今天";
		}else {
			if(parseInt(month) < 10) {
				month = "0" + month;
			}
			if(parseInt(days) < 10) {
				days = "0" + days;
			}
			reStr = year + "-" + month + "-" + days + " ";
		}
		if(parseInt(hours) < 10) {
			hours = "0" + hours;
		}
		if(parseInt(minutes) < 10) {
			minutes = "0" + minutes;
		}
		reStr = reStr + hours + ":" + minutes;
		return reStr;
	}else {
		return "";
	}
}
function cutEmail(str){
	var reStr = "";
	var vstr1 = str;
	var index = 0;
	while(vstr1.indexOf("@") > -1 && vstr1.length > 0){
		if(vstr1.indexOf("@") > 0) {
			reStr = reStr + vstr1.substr(0,vstr1.indexOf("@"));
			vstr1 = vstr1.substr(vstr1.indexOf("@"),str.length);
		}
		var leftB = vstr1.indexOf("(");
		var rightB = vstr1.indexOf(")");
		if (vstr1.indexOf("@合天小秘书 ") == 0) {
			reStr = reStr + "@合天小秘书 ";
			vstr1 = vstr1.substr(7,str.length);
			continue;
		}
		if(leftB != -1 && rightB != -1) {
			var pName = vstr1.substr(1,leftB-1);
			var pTel = vstr1.substring(leftB+1,rightB);
			var reg = /[\s|\~|\`|\@|\!|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\~|\·|\！|\#|\￥|\%|\……|\&|\*|\（|\）|\-|\——|\+|\=|\||\、|\【|\】|\{|\}|\；|\：|\“|\”|\‘|\’|\，|\《|\》|\。|\、|\？]/;
			if(reg.test(pName)) {
				reStr = reStr + "@";
				vstr1 = vstr1.substr(1,str.length);
				continue;
			}else {
				$.ajax({
					url: "outUserInfo!getUsersByMail.action",
					dataType: "json",
					type: "post",
					async : false,
					data: {mail:pTel},
					success: function(e){
						if($(e).attr("result") == "success"){
							if($(e).attr("message") != "") {
								reStr = reStr + "@" + pName;
								vstr1 = vstr1.substr(rightB+1,str.length);
							}else {
								reStr = reStr + "@";
								vstr1 = vstr1.substr(1,str.length);
							}				
						}else{
							reStr = reStr + "@";
							vstr1 = vstr1.substr(1,str.length);	
						}
					},error:function(q,w,e){
						reStr = reStr + "@";
						vstr1 = vstr1.substr(1,str.length);
					}
				});
				
			}
			
		}else {
			reStr = reStr + "@";
			vstr1 = vstr1.substr(1,str.length);
			
		}
	}
	reStr = reStr + vstr1;
	return reStr;
}

function addStr2Html(obj,str) {
	//return;
	//if($("#actionnamespace").val() == "registerUser"){
//	if($("#sessionuuid").val().toString().indexOf("REG") == 0){
//		$(obj).text(str);
//	}else{}

	var vstr1 = str;
	var index = 0;
	var flagNoAt = true;
	while(vstr1.indexOf("@") > -1 && vstr1.length > 0){
		if(vstr1.indexOf("@") > 0) {
			$(obj).append("<span id=\"at"+index+"\"></span>");
			var adStr = vstr1.substr(0,vstr1.indexOf("@"));
			$(obj).find("#at"+index).html(adStr);
			if(adStr.replaceAll(" ","").length > 0 && adStr.replaceAll("	","").length > 0){
				flagNoAt = false;
			}
			index++;
			vstr1 = vstr1.substr(vstr1.indexOf("@"),str.length);	
		}
		var leftB = vstr1.indexOf("(");
		var rightB = vstr1.indexOf(")");
		if (vstr1.indexOf("@合天小秘书 ") == 0) {
			$(obj).append("<a href=\""+LocationUtil.getContextPath() + "profile.do?w="+"dyns"+"&u=erange\" target=\"_blank\" style=\"color:#0088CE\">@合天小秘书 </a>");
			vstr1 = vstr1.substr(7,str.length);
			continue;
		}
		if(leftB != -1 && rightB != -1) {
			var pName = vstr1.substr(1,leftB-1);
			var pTel = vstr1.substring(leftB+1,rightB);
			var reg = /[\s|\~|\`|\@|\!|\#|\$|\%|\^|\&|\*|\(|\)|\-|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\~|\·|\！|\#|\￥|\%|\……|\&|\*|\（|\）|\-|\——|\+|\=|\||\、|\【|\】|\{|\}|\；|\：|\“|\”|\‘|\’|\，|\《|\》|\。|\、|\？]/;
			if(reg.test(pName)) {
				$(obj).append("<span id=\"at"+index+"\"></span>");
				$(obj).find("#at"+index).html("@");
				index++;
				vstr1 = vstr1.substr(1,str.length);
				flagNoAt = false;
				continue;
			}else {
				$.ajax({
					url: "outUserInfo!getUsersByMail.action",
					dataType: "json",
					type: "post",
					async : false,
					data: {mail:pTel},
					success: function(e){
						if($(e).attr("result") == "success"){
							if($(e).attr("message") != "") {
								$(obj).append("<a href=\""+LocationUtil.getContextPath() + "profile.do?w="+"dyns"+"&u=" + $(e).attr("message") + "\" target=\"_blank\" style=\"color:#0088CE\">@" + pName + "</a>");
								vstr1 = vstr1.substr(rightB+1,str.length);
							}else {
								$(obj).append("<span id=\"at"+index+"\"></span>");
								$(obj).find("#at"+index).html("@");
								index++;
								vstr1 = vstr1.substr(1,str.length);
								flagNoAt = false;;
							}				
						}else{
							$(obj).append("<span id=\"at"+index+"\"></span>");
							$(obj).find("#at"+index).html("@");
							index++;
							vstr1 = vstr1.substr(1,str.length);	
							flagNoAt = false;
						}
					},error:function(q,w,e){
						$(obj).append("<span id=\"at"+index+"\"></span>");
						$(obj).find("#at"+index).html("@");
						index++;
						vstr1 = vstr1.substr(1,str.length);
						flagNoAt = false;
					}
				});
				
			}
			
		}else {
			$(obj).append("<span id=\"at"+index+"\"></span>");
			$(obj).find("#at"+index).html("@");
			index++;
			vstr1 = vstr1.substr(1,str.length);
		}
	}
	if((vstr1.length == 0 || vstr1.replaceAll(" ","").length == 0)&& flagNoAt){
		vstr1 = "。";
	}
	$(obj).append("<span id=\"at"+index+"\"></span>");
	$(obj).find("#at"+index).html(vstr1);

}

var checkAtFlag = "";
function checkAt(obj) {
	//$("#textarea-tip").append("<div style=\"width:95%;margin-top:5px;height:60px;margin-left:2%\"><a style=\"float:left;margin-top:2px;\" href=\""+LocationUtil.getContextPath() + "profile.do?w=1&u=bdb88331-637b-4d23-b39e-17774fba1c77\" target=\"_blank\" ><img width=\"50\" height=\"50\" border=\"0\" src=\"img/head/bdb88331-637b-4d23-b39e-17774fba1c77/20130924155547.jpg\" class=\"fl pictuie\" onError=\"noHeadImg(this)\"/></a><lable style=\"float:left;margin-left:-15px\">邮箱：dong_zyue@bjhit.com<br/>教师号：00008</lable></div><div style=\"border-top:1px solid #dcdcdc;width:100%;\"></div>");
	var cStr = $(obj).val();
	var curp = 0;
	if (obj.setSelectionRange) { // W3C	
		curp = obj.selectionEnd;
		cStr = (0 != curp) ? cStr.substring(0, curp): "";
	}
	var reg = /[\s|\~|\`|\@|\!|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\~|\·|\！|\#|\￥|\%|\……|\&|\*|\（|\）|\-|\——|\+|\=|\||\、|\【|\】|\{|\}|\；|\：|\“|\”|\‘|\’|\，|\《|\》|\。|\、|\？]/;
	var atStr = cStr.substr(cStr.lastIndexOf("@")+1,cStr.length);
	if(cStr.lastIndexOf("@") < 0 ){
		return;
	}
	var snDiv = $(obj).next();
	var pstr = reg.exec(atStr);
	if(atStr.length > 0 && atStr != "" && pstr == null) {
		if(checkAtFlag == atStr){
			return;
		}else {
			checkAtFlag = atStr;
			$.ajax({
				url: "outUserInfo!getUsersByName.action",
				dataType: "json",
				type: "post",
				async : false,
				data: {userName:atStr,userId:$("#sessionuuid").val()},
				success: function(e){
					if($(e).attr("result") == "success"){
						if($(e).attr("size") > 0) {
							$(snDiv).html("<table style=\"min-width:200px;width:100%\"></table>");
							$($(e).attr("message")).each(function(){
								var sStr = "<tr style=\"height:35px\" id=\"" + $(this).attr("phone") + "\">";
								sStr = sStr + "<td style=\"vertical-align:middle;padding-left:3px;\"><img style=\"width:30px;height:30px;\" src=\""+$(this).attr("headImage")+"\" onError=\"noHeadImg(this)\"/></td>";
								sStr = sStr + "<td style=\"vertical-align:middle;padding-right:3px;\">" + $(this).attr("name");
								if($(this).attr("sclasslName") != "") {
									sStr = sStr +" ("+ $(this).attr("sclasslName") +")";
								}
								sStr = sStr + "<br/>" + $(this).attr("mail") + "</td></tr>";
								$(snDiv).find("table").append(sStr);
								$(snDiv).find("table").find("#"+$(this).attr("phone")).data("name",$(this).attr("name"));
								$(snDiv).find("table").find("#"+$(this).attr("phone")).data("mail",$(this).attr("mail"));
							});
							$(snDiv).css("display","block");
							$(snDiv).find("tr").die().click(function(){
								var at2Str = cStr.substr(0,cStr.lastIndexOf("@")+1);
								cStr = $(obj).val();
								var cStr2 = (cStr.length != curp) ? cStr.substring(curp,cStr.length): "";
								var addStr = at2Str + $(this).data("name")+"("+$(this).data("mail")+") " + cStr2;
								
								if(addStr.length < 140) {
									$(obj).val(addStr);
								} 
								$(snDiv).css("display","none");
								$(obj).focus();
							});
						}else {
							//alert("该用户不存在！");
							$(snDiv).css("display","none");
						}
					}else{
						//alert("该用户不存在！");
						$(snDiv).css("display","none");
					}
				},error:function(q,w,e){
					//alert("该用户不存在！");
					$(snDiv).css("display","none");
				}
			});
		}
	}else {
		checkAtFlag = atStr;
		$(snDiv).css("display","none");
	}
}

var checkAtFlag2 = "";
function checkAt2(obj) {
	//$("#textarea-tip").append("<div style=\"width:95%;margin-top:5px;height:60px;margin-left:2%\"><a style=\"float:left;margin-top:2px;\" href=\""+LocationUtil.getContextPath() + "profile.do?w=1&u=bdb88331-637b-4d23-b39e-17774fba1c77\" target=\"_blank\" ><img width=\"50\" height=\"50\" border=\"0\" src=\"img/head/bdb88331-637b-4d23-b39e-17774fba1c77/20130924155547.jpg\" class=\"fl pictuie\" onError=\"noHeadImg(this)\"/></a><lable style=\"float:left;margin-left:-15px\">邮箱：dong_zyue@bjhit.com<br/>教师号：00008</lable></div><div style=\"border-top:1px solid #dcdcdc;width:100%;\"></div>");
	var cStr = $(obj).val();
	var curp = 0;
	if (obj.setSelectionRange) { // W3C	
		curp = obj.selectionEnd;
		cStr = (0 != curp) ? cStr.substring(0, curp): "";
	}
	var reg = /[\s|\~|\`|\@|\!|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\~|\·|\！|\#|\￥|\%|\……|\&|\*|\（|\）|\-|\——|\+|\=|\||\、|\【|\】|\{|\}|\；|\：|\“|\”|\‘|\’|\，|\《|\》|\。|\、|\？]/;
	if(cStr.lastIndexOf("@") < 0 ){
		return;
	}
	var snDiv = $(obj).next();
	var atStr = cStr.substr(cStr.lastIndexOf("@")+1,cStr.length);
	var pstr = reg.exec(atStr);
	if(atStr.length > 0 && atStr != "" && pstr == null) {
		if(checkAtFlag2 == atStr){
			return;
		}else {
			checkAtFlag2 = atStr;
			$.ajax({
				url: "outUserInfo!atSomeBody.action",
				dataType: "json",
				type: "post",
				async : false,
				data: {userName:atStr},
				success: function(e){
					if($(e).attr("result") == "success"){
						if($(e).attr("size") > 0) {
							$(snDiv).html("<table style=\"min-width:100px;width:100%\"><tbody></tbody></table>");
							var loop = 0;
							$($(e).attr("message")).each(function(){
								var clStr = "";
								if(loop%2 == 0){
									clStr = "class='Dark'";
								}
								var sStr = "<tr " + clStr + "style=\"height:24px;\">";
								sStr = sStr + "<td style=\"vertical-align:middle;padding-left:20px;font-size:12px;padding-right:10px\">" + this;
								sStr = sStr + "</td></tr>";
								$(snDiv).find("tbody").append(sStr);
								loop++;
							});
							$(snDiv).css("display","block");
							$(snDiv).find("tr").die().click(function(){
								var at2Str = cStr.substr(0,cStr.lastIndexOf("@")+1);
								cStr = $(obj).val();
								var cStr2 = (cStr.length != curp) ? cStr.substring(curp,cStr.length): "";
								var addStr = at2Str + $(this).find("td").text() + " " + cStr2;
								if(addStr.length < 140) {
									$(obj).val(addStr);
								} 
								$(snDiv).css("display","none");
								$(obj).focus();
							});
						}else {
							$(snDiv).css("display","none");
							//alert("该用户不存在！");
						}
					}else{
						$(snDiv).css("display","none");
						//alert("该用户不存在！");
					}
				},error:function(q,w,e){
					$(snDiv).css("display","none");
					//alert("该用户不存在！");
				}
			});
		}
	}else {
		checkAtFlag2 = atStr;
		$(snDiv).css("display","none");
	}
}
function checkText2(tarId,len) {
	if($("#actionnamespace").val() == "registerUser"){
		var str = $(tarId).val();
		var ctimer2
		clearInterval(ctimer2);
		ctimer2 = setInterval(function(){
			checkAt2(tarId);
			str = $(tarId).val();
			$(tarId).prev().find("span").text(len-str.length);
		}, 300);
	}else{
		var str = $(tarId).val();
		var ctimer
		clearInterval(ctimer);
		ctimer = setInterval(function(){
			checkAt(tarId);
			str = $(tarId).val();
			$(tarId).prev().find("span").text(len-str.length);
		}, 300);
	}
	
}
function encodeHtml(html,c1,c2){
	
	var retStr = html;
	retStr = retStr.replaceAll(c1, c2);
	return retStr;
}

function decodeHtml(html,str,str1){
	var retStr = html;
	retStr = retStr.replaceAll(str,str1);
	return retStr;
}

//生成随机数
function RandomNum(Min,Max){
	var Range = Max - Min;
	var Rand = Math.random();   
	var num = Min + Math.round(Rand * Range);
	return num;
}

//查找元素是否在数组中
function judgePosition1(con,arr){
	var p = -1;
	for(var i = 0;i<arr.length;i++){
		if(arr[i] == con){
			p = i;
			break;
		}
	}
	return p;
}
var letterArr = new Array("a","b","c","d","e","f","g","h","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z");
function random(con){
	var carr = con.split("&");
	carr.shift();
	carr.pop();
	var str = "";
	for(var i = 0;i < 5;i++){
		var j = RandomNum(0,25);
		str += letterArr[j];
	}
	var p = judgePosition1(str,carr);
	if(p == -1){
		return str;
	}else{
		var str1= random(con);
		return str1;
	}
}

function addShare(title,url,summary){
	var str1 = "";
	var str2 = "";
	var str3 = "";
	if(summary != ""){
		//先转换( 之后转换' 先找到转换字符
		str1 = "&"+random(summary)+"&";
		summary = encodeHtml(summary,"\\(",str1);
		str2 = "&"+random(summary)+"&";
		summary = encodeHtml(summary,"\'",str2);
		str3 = "&"+random(summary)+"&";
		summary = encodeHtml(summary,"\\)",str3);
	}
	var sStr = "<div style=\"float:right;\" onmouseover=\"setShare('"+title+"', '"+url+"','"+summary+"','"+str1+"','"+str2+"','"+str3+"');\">";
	sStr = sStr + "<div class=\"jiathis_style\">";
	sStr = sStr + "<a class=\"jiathis_button_qzone\"></a>";
	sStr = sStr + "<a class=\"jiathis_button_tsina\"></a>";
	sStr = sStr + "<a class=\"jiathis_button_tqq\"></a>";
	sStr = sStr + "<a class=\"jiathis_button_renren\"></a>";
	sStr = sStr + "<a class=\"jiathis_button_weixin\"></a>";
	sStr = sStr + "</div></div>";
	sStr = sStr + "<script type=\"text/javascript\" src=\"http://v3.jiathis.com/code/jia.js\" charset=\"utf-8\"></script>";
	return sStr;
}

/*function addShareStep2(){
	var ii = "'";
	var sStr = "<script type=\"text/javascript\">";
	sStr = sStr + "function setShare(title, url, summary,str1,str2,str3) {";
	sStr = sStr + "if(str1 != undefined && str1 != \"\"){";
	sStr = sStr + " summary =  decodeHtml(summary,str1,'('); summary =  decodeHtml(summary,str2,\""+ii+"\"); summary =  decodeHtml(summary,str3,')'); }";
	sStr = sStr + "jiathis_config.title = title;";
	sStr = sStr + "jiathis_config.url = url;";
	sStr = sStr + "jiathis_config.summary = summary;";
	sStr = sStr + "}";
	sStr = sStr + "var jiathis_config = {};</script>";
	sStr = sStr + "<script type=\"text/javascript\" src=\"http://v3.jiathis.com/code/jia.js\" charset=\"utf-8\"></script>";
	return sStr;
}*/
function addShareStep2(){
	var sStr = "<script type=\"text/javascript\" src=\"/js/jquery/jquery.share.min.js\" charset=\"utf-8\"></script>";
	sStr += "<div id=\"share-1\" data-sites=\"qzone,weibo,tencent,renren,wechat\" class=\"share-component social-share\"></div>";
	sStr += "<script type=\"text/javascript\">";
	sStr += "$('.pro-wrapper #share_new').css({'top':'5px'});";
	sStr += "var urls = document.location;urls= urls.toString(); var $head = $(document.head);";
	sStr += "if(urls.indexOf('/html/news/Geek') != -1){$('#share-1').share({description: $head.find('[name=keywords], [name=Keywords]').attr('content'),image: $('table img:first').prop('src') || $('.pro-wrapper1').find('img').prop('src')});";
	sStr += "$('.pro-wrapper2').css({'margin-top':'0'});$('.pro-wrapper').css({'overflow':'visible','padding-top':'40px'});}else if(";
	sStr += "urls.indexOf('/html/news/news') != -1 || urls.indexOf('/html/other') != -1){$head.append('<link rel=\"stylesheet\" href=\"/css/jquery/share.min.css\" type=\"text/css\"></link>');$('#share-1').share({description: $head.find('[name=keywords], [name=Keywords]').attr('content'),image: $('.indentation img:first').prop('src') || ''});";
	sStr += "$('.fxImgss').css({'width':'auto','margin-right':'0'}); $('#share_new').css({'width':'auto'});$('#share').css({'display':'inline-block'});}";
	sStr += "</script>";
	return sStr;
}
function scroll2Id(pId) {
	$("#"+pId).trigger('click');
	/*if($("#"+pId).find(".accordion-body").css("height") == "0px"){
		//$("#"+pId).find(".point").trigger('click');
		setTimeout(function(){
			o = document.getElementById(pId);
			oTop = o.offsetTop;
			while(o.offsetParent!=null)
			{  
			oParent = o.offsetParent; 
			oTop += oParent.offsetTop;  // Add parent top position
			o = oParent;
			}
			top.scrollTo(800,oTop);
		}, 500);
	}else {
		o = document.getElementById(pId);
		oTop = o.offsetTop;
		while(o.offsetParent!=null)
		{  
		oParent = o.offsetParent; 
		oTop += oParent.offsetTop;  // Add parent top position
		o = oParent;
		}
		top.scrollTo(800,oTop);
	}*/
}

/**
 * 深度拷贝
 * @param {} obj
 * @return {}
 */
function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}

/**
 * 对URL进行编码
 * @param {} str
 * @return {}
 */
function UrlEncode(str){
	var ret="";
	if(null != str && "" != str){
		for(i=0;i<str.length;i++){
			ret+=str.charCodeAt(i)+" ";//将字符转换成相应的ASCII码并用空格隔开;	
		}
	}
    return ret; 
} 

/**
 * 对URL进行解码
 * @param {} str
 * @return {}
 */
function UrlDecode(str){
	if(str != null && str != ""){
		var vStr = str.split(" ");
	    var ret="";
	    for(i=0;i<vStr.length;i++){
			ret+=String.fromCharCode(vStr[i]);
		}
	    return ret;
	}else {
		return null;
	}
}

/**
 * 用来处理Cookie的工具类
 */
var CookieUtil = new Object();

/**
 * 增加Cookie项
 * @param {String} name 
 * @param {String} value 
 * @param {Int} expiresHours 过期时间，如果小于等于0，表示忽略此数据
 * @param {String} path	可访问路径
 */
CookieUtil.addCookie = function(name, value, expiresHours, path){
	try{
		var cookieStr = name + "=" + escape(value);
     	if(Validate.isValid(expiresHours) && expiresHours > 0){
     		var date = new Date();
     		date.setTime(date.getTime() +  expiresHours * 3600 * 1000);
     		cookieStr += ("; expires="+ date.toGMTString());
     	} else if(Validate.isValid(path)){
     		cookieStr += ("; path="+ escape(path));
     	}
        document.cookie = cookieStr;
     }
     catch(e){
         throw new Error("SetCookies: " + e.message);
     }
};

/**
 * 删除Cookie项
 * @param {String} name
 */
CookieUtil.delCookie = function(name){
    var value = CookieUtil.getCookie(name);
    if(value){
    	document.cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT;";
    }
};

/**
 * 获取Cookie项
 * @param {String} name
 * @return cookieValue cookie值
 */
CookieUtil.getCookie = function(name){
	var strCookie = document.cookie; 
	var arrCookie = strCookie.split("; "); 
	for(var i = 0;i < arrCookie.length; i++){ 
		var arr = arrCookie[i].split("="); 
		if(arr[0] == name) return unescape(arr[1]); 
	} 
	return null;
};

/**
 * 清空所有Cookie项
 */
CookieUtil.clearCookie = function(){
	var strCookie = document.cookie; 
	var arrCookie = strCookie.split("; ");
	var names = new Array();
	for(var i = 0;i < arrCookie.length; i++){ 
		var arr = arrCookie[i].split("="); 
		names.push(arr[0]);
	}
	for ( var i = 0; i < names.length; i++) {
		CookieUtil.delCookie(names[i]);
	}
};

//html5 本地存储 在没有手动清楚数据或者清除历史记录  则会一直存储在本地 （zhang_jxin）
var StorageUtil = new Object();

StorageUtil.addItem = function(key, value){
	window.localStorage.setItem(key, value)
};

StorageUtil.getItem = function(key){
	return window.localStorage.getItem(key)
};

StorageUtil.delItem = function(key){
	window.localStorage.removeItem(key)
};

StorageUtil.clearItem = function(){
	window.localStorage.clear()
};

//heml5 session存储 会话级别的存储
var SessionStorageUtil = new Object();

SessionStorageUtil.addItem = function(key, value){
	window.sessionStorage.setItem(key, value)
};

SessionStorageUtil.getItem = function(key){
	return window.sessionStorage.getItem(key)
};

SessionStorageUtil.delItem = function(key){
	window.sessionStorage.removeItem(key)
};

SessionStorageUtil.clearItem = function(){
	window.sessionStorage.clear()
};
function checkFlash(){
	var isIE = !-[1,1];
	if(isIE){
	     try{
	         var swf1 = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	         return true;
	     }
	     catch(e){
	         return false;
	     }
	 }
	 else {
	     try{
	         var swf2 = navigator.plugins['Shockwave Flash'];
	         if(swf2 == undefined){
	             return false;
	         }
	         else {
	             return true;
	         }
	     }
	     catch(e){
	    	 return false;
	     }
	 }
}
function teaApplayCour(cName){
	
	$.ajax({
		url: "qnotes!applyCour.action",
		dataType: "json",
		type: "post",
		data: {courseId:cName.replaceAll("_",".")},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success") {
			}else {	
			}
		},error:function(q,w,e){
		}
	});
}
function teaApplyVms(courseId,expId,courName,expName,appNum,myNum){
	var noteStr = "我的XXX套餐的资源不够了，我想升级！";
	SAJAX.send("qnotes!applyMoreVms.action",
			{exptId:expId,
			courseId:courseId,
			courName:courName,
			expName:expName,
			appNum:appNum,
			myNum:myNum
			},
			function(data){
				if($(data).attr("result") == "success") {
				}else {
				}
			}
		);
}

/**
 * 
 * @returns
 */
function disagreeD(){
	$("#backBtn").trigger('click');
	$(".hit-expTabs").find("li:eq(0)").trigger('click');
}

/**
 * 
 * @param courseID
 * @param p_userId
 * @param p_expId
 * @returns
 */
function getExpVMofUser(courseID,p_userId,p_expId){
	var url = "student";
	if(arguments[3]=="teacher"){
		url = "teacher";
	}
	$.ajax({
		url: url+"/sutExp!getBisExpVM.action",
		dataType: "json",
		type: "post",
		data: {cexpID:p_expId},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success") {
				$("#no_success").css("display","none");
				$("#win-div2").css("display","block");
				$("#win-div2").css("margin-top","-30px");
				$("#win-div2").html("<h3 id=\"win-h3\" >登录信息：</h3>");
				$("#win-div2").append("<div class=\"info-wrap infowrap-ew\" style=\"background-color:#f7f7f7;\">" +
						"<span style=\"color:#F00; font-size:12px; margin-left:30px;\">为确保实验顺利进行，</span><br/>" +
						"<span style=\"color:#555555; font-size:12px; margin-left:30px;margin-top:20px\">请您务必遵守<a href=\"protocol.html\" target=\"_blank\" style=\"text-decoration:underline;font-weight:bolder;\">合天网安实验室法律声明</a></span><br/>" +
						"<button onclick=\"getExpVMofUser1('"+courseID+"','"+p_userId+"','"+p_expId+"','"+url+"')\" class=\"btn btn-success\" style=\"margin-left:30px; margin-top:20px;float:left;\">我同意并遵守法律声明</button>&nbsp;<a href=\"javascript:void(0)\" onclick=\"disagreeD()\" style=\"float:left;margin-left:20px;font-size:12px;line-height:80px\">我不同意</a></div>");
				$("#win-div2").css("display","block");
				$("#lin-div2").css("margin-top","-30px");
			}else{
				if($(data).attr("result") == "error")
				{
					//$("#expVm-table").parent().html("<div class='stu-none' style='margin-top:50px;''>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
					$("#vm-div").html("<div class='stu-none' style='margin-top:50px;'>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
					$("#vm-div").css("display","block");
				}else {
				}
			}
		},error:function(data){
			if($(data).attr("result") == "error" && $(data).attr("message") == "")
			{
				//$("#expVm-table").parent().html("<div class='stu-none' style='margin-top:50px;''>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
				$("#vm-div").html("<div class='stu-none' style='margin-top:50px;'>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
				$("#vm-div").css("display","block");
			}else {
				jAlert("error:" + $(data).attr("message"), null, function(){}, waitMillSecond);
			}
		}
	});
}

/**
 * 
 * @param courseID
 * @param p_userId
 * @param p_expId
 * @returns
 */
function getExpVMofUser1(courseID,p_userId,p_expId){
	$("#no_success").css("display","none");
	$("#win-div2").css("display","none");
	$("#linL-div2").css("display","none");
	$("#collapseThree").css("display","none");
	$("#recoverExperiment").css("display","none");
	$("#linL-div1").css("display","block");
	$("#loginvminter1").css("display","block");
	$("#loginvminter").css("display","block");
	$("#vmOperate-div").css("display","block");
	$("#hfsy-div").css("display","block");
	if(true){
		$("#hfsy-div").css("display","none");
	}
	var url = "student";
	if(arguments[3]=="teacher"){
		url = "teacher";
	}
	$.ajax({
		url: url+"/sutExp!getExpVM.action",
		dataType: "json",
		type: "post",
		data: {stuID:p_userId,cexpID:p_expId},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success") {
				var index = 0;
				var osNum = 0;//系统序号
				var osOnly = true;//只有一种系统
				$("#win-div").css("display","none");
				$("#win-div").html("<h4 id=\"win-h3\" >Windows 登录信息：<a  href=\"javascript:void(0)\" onclick=\"scroll2Id('collapseSix')\" style=\"font-size:12px;margin-left:250px ;width:80px;margin-top:-15px ;color:#0088ce\">"
								+"<img src=\"img/common/help.jpg\" style=\"margin-top:0px;\" />登录指南</a></h4>");
				$("#lin-div").html("<h4>Linux 登录信息：<a  href=\"javascript:void(0)\" onclick=\"scroll2Id('collapseFive')\" style=\"font-size:12px;margin-left:390px ;margin-top:-15px ;width:80px;  display:block;color:#0088ce\">"
								+"<img src=\"img/common/help.jpg\" style=\"margin-top:0px;\" />登录指南</a></h4>");
				var otherFlag = false;
				$($(data).attr("message")).each(function(){
					vmMap.put(index, $(this));
					index++;
					var vmid = $(this.id).attr("vmid");
					os = $(this).attr("devOs");
					var met = $(this).attr("method");
					var status = $(this).attr("devStatus");
					var ip = $(this).attr("realIpaddrs");
					if(met == "10020002") {
						$("#win-div").css("display","block");
						var p_div = createDivforResource(courseID,p_expId,$(this).attr("ipaddress"),$(this).attr("method"),$(this).attr("port"),$(this).attr("devOs"),$(this).attr("username"),$(this).attr("password"),$(this).attr("method"),$(this).attr("devName"),$(this.id).attr("vmid"),status);
						$("#win-div").append(p_div);
						$("#winL-div").css("display","block");
					}else if(met == "10020003"){
						$("#lin-div").css("display","block");
						var p_div = createDivforResource(courseID,p_expId,$(this).attr("ipaddress"),$(this).attr("method"),$(this).attr("port"),$(this).attr("devOs"),$(this).attr("username"),$(this).attr("password"),$(this).attr("method"),$(this).attr("devName"),$(this.id).attr("vmid"),status);
						$("#lin-div").append(p_div);
						$("#linL-div").css("display","block");
					}else{
						if(!otherFlag) {
							$("#win-div").find("#win-h3").html("<p>系统登录信息：</p>");
							otherFlag = true;
						}
						$("#win-div").css("display","block");
						var p_div = createDivforResource(courseID,p_expId,$(this).attr("ipaddress"),$(this).attr("method"),$(this).attr("port"),$(this).attr("devOs"),$(this).attr("username"),$(this).attr("password"),$(this).attr("method"),$(this).attr("devName"),$(this.id).attr("vmid"),status);
						$("#win-div").append(p_div);
					}
					if(status == "10100003"){//重启中
						processVmStatus(vmid,url);
					}else if(status == "10100004"){//开机中
						processVmStatus(vmid,url);
					}else if(status == "10100005"){//关机中
						processVmStatus(vmid,url);
					}else if(status == "10100007"){//处理过程中
						processVmStatus(vmid,url);
					}
				});
//				buttonGrp = ("<button id=\"start-" + ConvertUtil.encodeID(vmId) + "\" class=\"btn disabled\" disabled=\"disabled\" onclick=\"startVM('" + vmId + "');\" id=\"\"><i class=\"my-icon icon-play\"></i>启动</button>" + 
//						 "<button id=\"stop-" + ConvertUtil.encodeID(vmId) + "\" class=\"btn disabled\" disabled=\"disabled\" onclick=\"stopVM('" + vmId + "');\"><i class=\"my-icon icon-stop\"></i>停止</button>" + 
//						 "<button id=\"restart-" + ConvertUtil.encodeID(vmId) + "\" class=\"btn disabled\" disabled=\"disabled\" onclick=\"restartVM('" + vmId + "');\"><i class=\"my-icon icon-repeat\"></i>重启</button>");
			}else {
				if($(data).attr("result") == "error" && $(data).attr("message") == "")
				{
					//$("#expVm-table").parent().html("<div class='stu-none' style='margin-top:50px;''>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
					$("#vm-div").html("<div class='stu-none' style='margin-top:50px;'>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
					$("#vm-div").css("display","block");
				}else {
					jAlert("error:" + $(data).attr("message"), null, function(){}, waitMillSecond);
				}		
			}
		},error:function(data){
		}
	});
	//console.info($("#ceidinput").val());
	getMyVms(p_expId,url);
	loginVim($("#sessionuuid").val(),$("#ceidinput").val(),"");
	
}


function getMyVms(exptId,role){
	$.ajax({
		url: role+"/sutExp!getMyVms.action",
		dataType: "json",
		type: "post",
		data: {cexpID:exptId},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success") {
				$("#collapseThree").empty();
				$($(data).attr("message")).each(function(){
					var vmid = $(this.id).attr("vmid");
					var status = $(this).attr("devStatus");
					var ip = $(this).attr("realIpaddrs");
					var name = $(this).attr("devName");
					var vmOp = '<ul><li class="vmOperateLi"><div><img src="';
					if(status == "10100001"){
						vmOp += 'img/vm/vm-live.png"/></div>';
					}else{
						vmOp += 'img/vm/vm-die.png"/></div>';
					}
					vmOp += ('<div>' + name + '</div>');
					var grpHtml = '';
					if(status == "10100001"){//开机
						grpHtml += '<button id="start-' + ConvertUtil.encodeID(vmid) + '" class="btn disabled" disabled="disabled" onclick="vmStart(\'' + vmid + '\');"><i class="my-icon icon-play"></i>启动</button>';
						grpHtml += '<button id="stop-' + ConvertUtil.encodeID(vmid) + '" class="btn" onclick="vmStop(\'' + vmid + '\');"><i class="my-icon icon-stop"></i>停止</button>';
						grpHtml += '<button id="restart-' + ConvertUtil.encodeID(vmid) + '" class="btn" onclick="vmRestart(\'' + vmid + '\');"><i class="my-icon icon-repeat"></i>重启</button>';
					}else if(status == "10100002"){//关机
						grpHtml += '<button id="start-' + ConvertUtil.encodeID(vmid) + '" class="btn" onclick="vmStart(\'' + vmid + '\');"><i class="my-icon icon-play"></i>启动</button>';
						grpHtml += '<button id="stop-' + ConvertUtil.encodeID(vmid) + '" class="btn disabled" disabled="disabled" onclick="vmStop(\'' + vmid + '\');"><i class="my-icon icon-stop"></i>停止</button>';
						grpHtml += '<button id="restart-' + ConvertUtil.encodeID(vmid) + '" class="btn disabled" disabled="disabled" onclick="vmRestart(\'' + vmid + '\');"><i class="my-icon icon-repeat"></i>重启</button>';
					}else if(status == "10100003"){//重启中
						grpHtml += '<img src="img/loading4.gif"/>虚拟机重启中……';
					}else if(status == "10100004"){//开机中
						grpHtml += '<img src="img/loading4.gif"/>虚拟机启动中……';
					}else if(status == "10100005"){//关机中
						grpHtml += '<img src="img/loading4.gif"/>虚拟机关机中……';
					}else if(status == "10100007"){//处理过程中，就做启动中
						grpHtml += '<img src="img/loading4.gif"/>虚拟机启动中……';
					}
					vmOp += ('<div id="group-'+ConvertUtil.encodeID(vmid)+'">'+grpHtml+'</div></li></ul>');
					$("#collapseThree").append(vmOp);
					if(status == "10100003"){//重启中
						queryVmRestartProgress(vmid,role,vmRestarting);
					}else if(status == "10100004"){//开机中
						queryVmStartProgress(vmid,role,vmStarting);
					}else if(status == "10100005"){//关机中
						queryVmStopProgress(vmid,role,vmStopping);
					}else if(status == "10100007"){//处理过程中，就做启动中
						queryVmStartProgress(vmid,role,vmStarting);
					}
				});
			}else {
				if($(data).attr("result") == "error" && $(data).attr("message") == "")
				{
					//$("#expVm-table").parent().html("<div class='stu-none' style='margin-top:50px;''>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
					$("#vm-div").html("<div class='stu-none' style='margin-top:50px;'>未分配实验资源,请待老师确认资源分配完成后重试！</div>");
					$("#vm-div").css("display","block");
				}else {
					jAlert("error:" + $(data).attr("message"), null, function(){}, waitMillSecond);
				}		
			}
		},error:function(data){
		}
	});
}

/**
 * 处理虚拟机状态变化
 * @param vmId
 * @param role
 */
function processVmStatus(vmId,role){
	var status = getVmstatus(vmId, role);
	if(status == "10100001"){
		$("#vm_pro_" + vmId).css("display","none");
		$("#vm_" + vmId).css("display","block");
	}else if(status == "10100002"){
		$("#vm_pro_" + vmId).css("display","none");
		$("#vm_" + vmId).css("display","block");
	}else{
		setTimeout("processVmStatus('" + vmId + "','" + role + "')", 5000);
	}
}

/**
 * 获取虚拟机状态
 * @param vmId
 * @returns {String}
 */
function getVmstatus(vmId,role){
	var status = "";
	$.ajax({
		url: role+"/sutExp!getVmRunStatus.action",
		dataType: "json",
		type: "post",
		data: {"vmId":vmId,"rtnJson":true},
		async : false,
		success: function(data){
			if(data.result == "success"){
				status = $(data).attr("status");
			}
		},error:function(){
		}
	});
	return status;
}

/**
 * 检查虚拟机状态
 * @param userId
 * @param exptId
 * @param role
 * @returns
 */
function checkVmsStatus(userId,exptId,role){
	var status = "";
	$.ajax({
		url: role+"/sutExp!checkVmStatus.action",
		dataType: "json",
		type: "post",
		data: {"userId":userId,"cexpID":exptId,"rtnJson":true},
		async : false,
		success: function(data){
			if(data.result == "success"){
				//status = $(data).attr("statuses");
				$(data.statuses).each(function(){
					
				});
			}
		},error:function(){
		}
	});
	return status;
}

function checlogin(){
	var voll = false;
	var user
	return voll;
}
function checkLoginDetail(){
	var rdata = null;
	$.ajax({
		url: "publicLogin!checklogin.action",
		dataType: "json",
		type: "post",
		data: {rtnJson:true},
		async : false,
		success: function(data){
			rdata = data;
		},error:function(){
			
		}
	});
	return rdata;
}
/**
 * 判断是否全部是中文
 * @param str
 * @returns {Boolean}
 */
function isAllChn(str){ 
	var reg = /^[\u4E00-\u9FA5]+$/; 
	if(!reg.test(str)){ 
		return false; 
	} 
	return true; 
}

/**
 * 判断字符是否有中文字符
 * @param s
 * @returns {Boolean}
 */
function isHasChn(s)  { 
	var patrn= /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi; 
	if (!patrn.exec(s)){ 
		return false; 
	}else{ 
		return true; 
	} 
} 

/**
 * 找不到头像的默认处理方法
 * @param obj
 */
function noHeadImg(obj){
	$(obj).attr("src","img/head/default.jpg")
}

/**
 * 找不到课程图片的默认处理方法
 * @param obj
 */
function noCourseImg(obj){
	$(obj).attr("src",LocationUtil.getContextPath()+"/img/course/default.jpg");
}

/**
 * 找不到实验图片的默认处理方法
 * @param obj
 */
function noExpImg(obj){
	$(obj).attr("src","/img/exp/default.png");
}

/**
 * 找不到视频图片的默认处理方法
 * @param obj
 */
function noWaresImg(obj,type){
	var filePath = "";
	if(type == 1){
		filePath = "img/file/video.jpg";
	}else if(type == 2){
		filePath = "img/file/txt.jpg";
	}else if(type == 3){
		filePath = "img/file/jpg.jpg";
	}
	$(obj).attr("src","img/file/video.jpg");
}
//截取字符串
function stringToString(str,len) {
	str = html2Text(replaceHtml2Text(str));
	if(null == str || "" == str){
		return str;
	}else{
		var str1 = "";
		if(str.length < len){
			return str ; 
		}else{
			for(var i = 0 ; len > 2 ; i++){
				str1 = str.substring(0,i);
				if(/^[a-z]/.test(str.substring(i,i+1))){
					len = len - 0.5;
				}else{
					len = len - 1;
				}
			}
			str1 = str1 + "...";
			return str1;
		}
	}
	
}


/**
 * 截取html字符串，保留html格式  支持html代码  
 * @param param 要截取的参数
 * @param length 要截取的长度
 * @param endWith 结束的字符串  zhang_jxin
 */
ConvertUtil.truncateTemp = function cutHTML(param, length, endWith) {  
	//html文件长度小于1
	 if(length<1){
		 return null;
	 }  
	 //html文件长度小于要截取的文件长度         
	 if(param.length<length){
	  return param;
	 }    
	 var result = "";  
	 var str = "";  
	 var n = 0;   
	 var temp;   
	 var isCode = false; //是不是HTML代码  
	 var isHTML = false; //是不是HTML特殊字符,如  &nbsp;&amp; 
	 for (var i = 0; i < param.length; i++) {  
	  temp = param.charAt(i);  
	  if (temp == '<') {  
	   isCode = true;  
	  }else if (temp == '&') {  
	   isHTML = true;  
	  }else if (temp == '>' && isCode) {  
	   n = n - 1;  
	   isCode = false;  
	  }else if (temp == ';' && isHTML) {  
	   isHTML = false;  
	  }  
	  if (!isCode && !isHTML) {  
	   n = n + 1;   
	   str = str + temp;  
	  }  
	  result = result + temp;  
	  if (n >= length) {  
	   break;  
	  }  
	 }   
	 result = result + endWith;  
	 //取出截取字符串中的HTML标记 ,过滤掉html中的字符，保留html标记
	 var temp_result = result.toString().replaceAll("(>)[^<>]*(<?)","$1$2");  
	 //过滤掉不需要结束标记的html标记
	 temp_result = temp_result  
	  .replaceAll("<(AREA|BASE|BASEFONT|BODY|BR|COL|COLGROUP|DD|DT|FRAME|HEAD|HR|HTML|IMG|INPUT|ISINDEX" +
	  		"|LI|LINK|META|OPTION|P|PARAM|TBODY|TD|TFOOT|TH|THEAD|TR|area|base|basefont|body|br|col|colgroup" +
	  		"|dd|dt|frame|head|hr|html|img|input|isindex|li|link|meta|option|p|param|tbody|td|tfoot|th|thead|tr)[^<>]*/>","");   
	 //过滤掉成对的HTML标记  
	 temp_result = temp_result.replaceAll("<([a-zA-Z]+)[^<>]*>(.*?)</\\1>","$2");    
	 //用正则表达式取出标记   
	 var pattern = /<([a-zA-Z]+)[^<>]*>/g;
	 var val = temp_result.match(pattern); 
	 if(val==""){
	  var endHTML = [val.length];  
	  for(var k=0; k<val.length; k++){
	    endHTML[k] =  val[k].replaceAll("<([a-zA-Z]+)[^<>]*>","$1");
	  }
	  //补全不成对的HTML标记  
	  for(var i = endHTML.length - 1; i >= 0; i--) {  
	   result = result + "</";  
	   result = result + endHTML[i];  
	   result = result + ">";  
	  } 
	 }
	 return result.toString()+"...";    
}
function noVedioImg(obj){
	$(obj).attr("src","img/file/video.jpg");
}

/**
 * 判断昵称中是否存在违法字符
 * @param regexp {String} 正则表达式或字母
 * @param replacement {String}
 * @return {String}
 */
String.prototype.nameIsSuc = function(userName){
	reg = /管理员|管理人员|管理人|管理专员|运营员|运营人员|运营人|运营专员|运维员|运维人员|运维人|运维专员|市场员|市场人员|市场人|市场专员|销售员|销售人员|销售人|销售专员|管理中心|运维中心|运维经理|市场经理|销售经理/;
	return reg.test(userName);
};

function getLanguage(language){
	//var lan = "Chinese";
	var lan = language;
	$.ajax({
    	url:"publicLogin!checkLanguage.action",
    	data:{language: language},
    	dataType:"json",
    	type:"post",
    	async:false,
    	success:function(e){	
    		if($(e).attr("result")=="success"){
    			lan = $(e).attr("message");  		}
    	},
    	error:function(){}
    });
	//alert($("#pageLanguage").val());
	return lan;
}

function queryCoinRule(){
	var redata;
	$.ajax({
		url : "userInfo!queryCoinRule.action",
		data : {taskId:"invite"},
		dataType : "json",
		type : "post",
		async : false,
		success : function(e) {
			redata = e;
		},
		error : function(q, w, e) {
			redata = e;
		}
	});
	return redata;
}

//计算弹出框位置
function positionSuc(){
	
	var ctop = window.screen.height;
	ctop = ctop/3;
	var ph = top.pageYOffset;
	var top1 = ((window.screen.height - $("#popup_container")
				.outerHeight()) / 2)+ $.alerts.verticalOffset;
	ph = -ph-(top1-ctop)+30;
	return ph;
}

function vpremail(str){
	var flag = false;
	str = str.replaceAll("@","");
	var reg =  /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]/
	if(str.trim() != "" && str.trim() != null){
		if(reg.test(str)){
			flag = true; 
		}
		if(str.indexOf("<") > 0 || str.indexOf("<") > 0 ||str.indexOf("\"") > 0 ||str.indexOf("\'") > 0 ){
			flag = false;
		}
	}
	return flag;
}

function querySysDate(){
	var str = "";
	$.ajax({
		url:"outUserInfo!querySysTime.action",
		data:{},
		type:"post",
		dataType:"json",
		async : false,
		success:function(data){
			if($(data).attr("result") == "success"){
				str = $(data).attr("message");
			}
		}
	});
	return str;
}

/**
 * 为a便签动态添加域名
 */
function replaceRealm(){
	$(".realm_z").attr("href",LocationUtil.getContextPath());
	$(".realm_z").html(LocationUtil.getContextPath());
}

//给特定的<A>标签补全地址 
function finishUrl(classname){
	var locationurl = LocationUtil.getContextPath();
	var path = "";
	for(var i = 1;i<=num_z01;i++){
		path = path + "../";
	}
	if(curr_href.indexOf("erange.heetian") >= 0 || curr_href.indexOf("hetianlab") >= 0 ){
		
	}else{
		/*path = "http://erange.heetian.com/";*/
		path ="/";
	}
	var alist = $("."+classname);
	
	for(var i = 0;i<alist.length;i++){
		var a = alist.eq(i);
		var url = a.attr("href");
		url = path + url;
		a.attr("href",url);
	}
}

/*
 * 判断是pc端还是app端
 * pc端返回true
 * 否则返回false
 */
function pcOrPhone(){
	var userAgentInfo = navigator.userAgent;//获取是什么设备浏览
	var Agents = new Array("Android", "iPhone", "SymbianOS",
			"Windows Phone", "iPad", "iPod");
	var flag = true;
	for ( var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}
/* 播放优酷视频
 * styleid 炫彩播放器样式 0-9
 * client_id 优酷视频云创建应用的client_id (在线885b8f45936db803  test 903b95b597005947)
 * vid  视频ID
 * autoPlay 是否自动播放视频
 * show_related 播放完成是否显示相关视频
 * IfVerify 是否需要验证标识
 * PassVerify 验证是否通过方法
 * FreeTime 免费观看时间 
 * onPlayerReady 播放器准备就绪调用
 * onPlayStart  播放器开始播放时调用
 * onPlayEnd  播放器结束播放时调用
 */
function ykuPlay(vid,autoPlay,IfVerify,PassVerify,FreeTime,noEnvTemp,noEnvTempCallBack){
	player = new YKU.Player('youkuplayer',{
		styleid: '0',
		client_id: '885b8f45936db803',
		vid: vid ,
		show_related: false,
		autoplay: autoPlay,
		flashext: '<param name="wmode" value="transparent">',
		newPlayer:true,
		events:{
			onPlayerReady: function (){
			},
			onPlayStart: function(){
				if(!noEnvTemp){
					noEnvTempCallBack(0);
				}
				if(IfVerify){ //需要验证
					
					if(PassVerify){	//验证信息通过
						playVideo();
					}else{ //验证没有通过 试看
						controlVideo(FreeTime);
					}
					
				}else{
					playVideo();
				}				
			},
			onPlayEnd: function(){
				if(!noEnvTemp){
					noEnvTempCallBack(1);
				}
			}	
		}
	})
}

/* 控制优酷视频播放
 * playTime 设置的时间 
 * checkTime 控制方法多长时间走一次 ： 例：1000=每隔1秒触发一次 直到当前时间大于定义时间
 * pauseVideo()  暂停
 * currentTime() 当前播放时间
 * 
 */
function controlVideo(FreeTime){
	var ykTimer = null;
	ykTimer = setInterval(function(){
		var timeNow = currentTime();
		if(timeNow >= FreeTime){
			clearInterval(ykTimer);
			$("#youkuplayer").remove();
			$("#crySee").show();
		}
	},1000);
}
/*
 * 优酷播放器控制接口
 * playVideo 开始
 * pauseVideo 暂停
 * seekTo 定位至指定时间
 * currentTime 当前播放时间
 */
function playVideo(){
	
	player.playVideo();
}
function pauseVideo(){
	
	player.pauseVideo();
}

function seekTo(s){
	
	player.seekTo(s);
}

function currentTime(){
	
	return player.currentTime();
}


/*
 * 判断是pc端还是app端
 * pc端返回true
 * 否则返回false
 */
function pcOrPhone(){
	var userAgentInfo = navigator.userAgent;//获取是什么设备浏览
	var Agents = new Array("Android", "iPhone", "SymbianOS",
			"Windows Phone", "iPad", "iPod");
	var flag = true;
	for ( var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}

/**
 * 统一的点击事件
 */
function addInde(evType){
	addEventRecord(evType);
}

/**
 * 添加各种点击事件记录
 * @param obj //事件类型
 */
function addEventRecord(eventType){
	var data = "";
	$.ajax({
		url : "eventAction!addEventRecord.action",
		data:{
			"eventType":eventType
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(e) {
			if ($(e).attr("result") == "success") {
				data = $(e).attr("message");
			}
		}
	});
	return data;
}

function addFriendLinkCount(linkId){
	var data = "";
	$.ajax({
		url : "friendlyk!addFriendLinkCount.action",
		data:{
			"linkId":linkId
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(e) {
			if ($(e).attr("result") == "success") {
				data = $(e).attr("message");
			}
		}
	});
	return data;
}

function judgeUnied(){
	var flag = false;
	return flag;
}

//是否含有关键字的提示的公共方法
function sensitiveWords(data,callBack){
	var flag = false;
	if($(data).attr("result") == "error" && $(data).attr("message") == "isContentSensitiveWords"){
		callBack();
		flag = true;
	}
	return flag;
}

function autoRefesh(){
	var timeout = 20;
	$.ajax({
		url : "autoRefesh.action",
		data:{
		},
		dataType : "json",
		type : "post",
		async : true,
		success : function(e) {
			if($(e).attr("result") == "success"){
				timeout = $(e).attr("modulus");
			}
			setTimeout(function(){
				autoRefesh()
			},1000*60*timeout);
		}
	});
}

/**
 * 在需要检测请求的action渲染数据前执行 可判断是否登录  如果未登录则刷新当前页面并弹出框
 */
function judgeNeedLogin(data){
	if($(data).attr("result") == "error" && $(data).attr("message") == "needlogin"){
		SessionStorageUtil.addItem("needlogin","true");
		document.location = document.location;
		return;
	}
}

/**
*创建总订单状态 flag是否是使用优惠劵 cid为优惠劵id
*/
function buildOrder(money,flag,cid){
	var dataStr = {};
	if(flag){
		dataStr.cid = cid;
	}else{
		dataStr.money = money;
	}
	dataStr.token = getToken();
	$.ajax({
		url:"/orderInfo!buildCoinOrder.action",
		data:dataStr,
		type:"post",
		dataType:"json",
		async : false,
		success: function(data){
			if($(data).attr("result") == "success"){
				if(flag){
					window.open("pay.do?orderId="+$(data).attr("message")+"&cid="+cid,"_self");
				}else{
					window.open("pay.do?orderId="+$(data).attr("message"),"_self");
				}
			}
		},error:function(q,w,e){
			
		}
	});
}

function saveToken(token){
	SessionStorageUtil.clearItem();
	CookieUtil.addCookie("token",token,24,"/");
	SessionStorageUtil.addItem("token",token);
	StorageUtil.addItem("token",token);
}

function getToken(){
	var token = $("#sessiontoken").val();
	if(token == null || token == "" || token == undefined){
		token = SessionStorageUtil.getItem("token");
		if(token == null || token == "" || token == undefined){
			token = SessionStorageUtil.getItem("token");
			if(token == null || token == "" || token == undefined){
				token = StorageUtil.getItem("token");
			}
		}
	}
	return token;
}

//获取用户角色
function queryRoleForUser(){
var role = SessionStorageUtil.getItem("userRole");
if(role == null || role == undefined || role == ""){
	$.ajax({
    	url:"noneRegisterUser.action",    
    	data:{},
    	dataType:"json",
    	type:"post",
    	async : false,
    	success: function(data){
    		if($(data).attr("result") == "success"){
    			role=$(data).attr("role");
    			SessionStorageUtil.addItem("userRole",role);
    		}
		},error:function(){
			
		}
	});
}
return role;
}


/**
 * 根据时间戳显示 刚刚，几分钟，几天前（），大于三天显示日期
 * （年月日不能是汉字）
 * addTime: 2017-11-21
 * @param date
 * @returns {String}
 */
function dateStrTime(str){
	var date = Date.parse(str);//转换为时间戳
    //获取js 时间戳
    var time=new Date().getTime();
    //去掉 js 时间戳后三位，与php 时间戳保持一致
    time=parseInt((time-date)/1000);

    //存储转换值 
    var s;
    if(time<60*10){//十分钟内
        return '刚刚';
    }else if((time<60*60)&&(time>=60*10)){
        //超过十分钟少于1小时
        s = Math.floor(time/60);
        return  s+"分钟前";
    }else if((time<60*60*24)&&(time>=60*60)){ 
        //超过1小时少于24小时
        s = Math.floor(time/60/60);
        return  s+"小时前";
    }else if((time<60*60*24*3)&&(time>=60*60*24)){ 
        //超过1天少于3天内
        s = Math.floor(time/60/60/24);
        return s+"天前";
    }else{ 
        //超过3天
        //var date= new Date(parseInt(date) * 1000);
        //return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    	return str;
    }
}
/**
 * 判断中英文
 * @ enflag = true;是英文
 */
function isEnglish(){
	var enflag = false;
	$.ajax({
    	url:"firstPage!getSessionLan.action",    
    	data:{},
    	dataType:"json",
    	type:"post",
    	async : false,
    	success: function(data){
    		if($(data).attr("result") == "success"){
    			enflag = false;
    		}else{
    			enflag = true;
    		}
		},error:function(){
			
		}
	});
	return enflag;
}
/**
 * 判断中英文
 * @ enflag = true;是英文
 */
var languageFirst = firstPutSession();
function firstPutSession(){
	var date;
	$.ajax({
    	url:"firstPage!firstPutSession.action",
    	data:{},
    	dataType:"json",
    	type:"post",
    	async:false,
    	success:function(e){
    		if($(e).attr("result")=="success"){
    			date = $(e).attr("message");
    		}
    	},
    	error:function(){
    		
    	}
    });
	return date;
}

//HTML转义  
function HTMLEncode(html){   
    var temp = document.createElement ("div");   
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);   
    var output = temp.innerHTML;   
    temp = null;   
    return output;   
}   
  
//HTML反转义  
function HTMLDecode(text){
    var temp = document.createElement("div");   
    temp.innerHTML = text;   
    var output = temp.innerText || temp.textContent;   
    temp = null;   
    return output;   
}

/*用正则表达式实现html转码*/
function htmlEncodeByRegExp(str){  
     var s = "";
     if(str.length == 0) return "";
     s = str.replace(/&/g,"&amp;");
     s = s.replace(/</g,"&lt;");
     s = s.replace(/>/g,"&gt;");
     s = s.replace(/ /g,"&nbsp;");
     s = s.replace(/\'/g,"&#39;");
     s = s.replace(/\"/g,"&quot;");
     return s;  
}
/*用正则表达式实现html解码*/
function htmlDecodeByRegExp(str){  
     var s = "";
     if(str.length == 0) return "";
     s = str.replace(/&amp;/g,"&");
     s = s.replace(/&lt;/g,"<");
     s = s.replace(/&gt;/g,">");
     s = s.replace(/&nbsp;/g," ");
     s = s.replace(/&#39;/g,"\'");
     s = s.replace(/&quot;/g,"\"");
     return s;  
}