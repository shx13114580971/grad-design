var ccid;
$(document).ready(function(){
	handleClick();
	if($(".exp_menu").hasClass("labasiDIv")){
		if($(".labasiDIv")[0].offsetWidth < $(".labasiDIv")[0].scrollWidth) {
	    	$(".labasiDIv").addClass("hoverLabDIv");
	    }
	}
});
function handleClick(){
	var userRole = $("#actionnamespace").val();
	if(userRole == ""){
		//暂时购买实验口放开
		var fullbuy = $("#fullBuy").val();
		$("#addexp-button").css("display","block");
		$("#addexp-button").die().live("click",function(){
			window.open("/loginRegistration.html","_self");
		});
	}else if(userRole == "registerUser" || userRole == "teacher" || userRole == "student"){
		showExptBtn();
	}
	
	$("#applyTheCourse").click(function(){
		if(!checkPurchaseAauthority(ecid)){
			jAlert("对不起，该实验为内测实验，您不是内测人员，不能购买。", null, 
					null, 5000, null,"error",null,getPh());
			return;
		}else{
			addCou(ccid,1);
		}
	});
	
	//切换支付方式
	$(".payDiv").live("click",function(){
		$(".payDiv").removeClass("yesIns");
		$(this).addClass("yesIns");
	})
	
	//购买实验
	$("#payMoney").live("click",function(){ 	
		var payWay = 2;
		$(".payDiv").each(function(){
			if($(this).hasClass("yesIns")){
				payWay = $(this).attr("data-type");
			}
		})
		buildMoneyOrder(ecid,$(".money_num").html(),payWay);
	})
	
	//支付成功
	$(".btn-succ").live("click",function(){
		window.location.reload();
	})
	
	//支付失败
	$(".btn-error").live("click",function(){
		$(".pay-select").remove();
		$(".bg").hide();
	})
	
	//关闭支付页面
	$("#closePayPage").live("click",function(){
		$(".pay-select").remove();
		$(".bg").hide();
	})
	//分配资源必须遵守的协议：点击事件
	$("#legalcheck").click(function(){
		if($(this).attr("checked")=="checked"||$(this).attr("checked")==true){
			$("#addexp-button").removeAttr("disabled");
			$("#addexp-button").css("cursor","pointer");
		}else{
			$("#addexp-button").attr('disabled',"true");
			$("#addexp-button").css("cursor","not-allowed");
		}
	});
}
function showExptBtn(){
	var eccid = $("#ecid").val();
	var ceid = $("#ceid").val();
	if(ceid != ""){
		eccid = "";
	}
	$.ajax({
		url: "publiccourse!showExpPageBtn.action",
		dataType: "json",
		type: "post",
		data: {ecid:eccid,ceid:ceid},
		async : true,
		success: function(data){
			if($(data).attr("result") == "success"){
				if($(data).attr("message") == "haved"){
					$("#addexp-button").css("display","block");
					$(".showLearn").show();
					//已经购买过
					var role = $(data).attr("role");
					if(role == "RU"){
						var video = $(data).attr("video");
						if(video){
							//展示开始播放
							if(languageFirst == "English"){
								$("#addexp-button").html("Play video");
							}else{
								$("#addexp-button").html("开始播放");
							}
							$("#addexp-button").die().live("click",function(){
								$(".exp_video").trigger("click");
							});
						}else{
							//现在判断环境信息
							if($(data).attr("isSucEnv") && undefined == $(data).attr("progress")){
								//已经有环境
								createSuccess();
							}else if($(data).attr("isSucEnv") && undefined != $(data).attr("progress")){
								if(languageFirst == "English"){
									var sstr = "Being created.."+$(data).attr("progress") + "%";
								}else{
									var sstr = "正在创建.."+$(data).attr("progress") + "%";
								}
								creatingEnv(sstr);
								proxyAllot(ceid, $(".SD-des"), null);
							}else if($(data).attr("nosubmit") == "nosubmit"){
								startCreateEnv();
								proxyAllot(ceid, $(".SD-des"), null);
							}else if($(data).attr("pool") == "pool"){
								showQueue($(data).attr("position"));
								proxyAllot(ceid, $(".SD-des"), null);
							}else{
								resetExp();									
							}
						}
					}else if(role == "T"){
						$("#addexp-button").die().live("click",function(){
							document.location = LocationUtil.getServerUrl()+"/pages/teacher/teach-main.jsp?couid="+$(data).attr("couid")+"&ceid="+$(data).attr("expid");
						});
					}else if(role == "S"){
						$("#addexp-button").die().live("click",function(){
							document.location =LocationUtil.getServerUrl()+"/pages/student/stuMain.jsp?couid="+$(data).attr("couid")+"&ceid="+$(data).attr("expid");
						});
					}
					
				}else if($(data).attr("message") == "can"){
					var role = $(data).attr("role");
					var charge = $(data).attr("charge");
					$(".showLearn").hide();
					if(role == "RU"){
						//注册用户 
						if(languageFirst == "English"){
							$("#addexp-button").html("Buy");
						}else{
							$("#addexp-button").html("添加实验");
						}
						$("#addexp-button").css("display","block");
						if($("#betaStatus").val()=="2"){
							if(languageFirst == "English"){
								$("#addexp-button").html("Test");
							}else{
								$("#addexp-button").html("开始内测");
							}
							$("#addexp-button").css("display","block");
						}
						if($("#betaStatus").val()=="3"){
							if(languageFirst == "English"){
								$("#addexp-button").html("Test");
							}else{
								$("#addexp-button").html("开始教测");
							}
							$("#addexp-button").css("display","block");
						}
						if(charge == 1){ // 1为现金支付实验
							$("#addexp-button").die().live("click",function(){
								getExptInfoById(ecid);
							})
						}else{
							$("#addexp-button").die().live("click",function(){
								queryUserInfoForExp();
							});
						}
					}else if(role == "T"){
						//教师
						var info = $(data).attr("info");
						if(info != null && info.length > 1){
							//多个课程
							$(info).each(function(){
								var htmlObj="<div class=\"cc_01\" onclick=\"setApplycouID('"+$(this).attr("ccid")+"',this)\">" +
								" <div class=\"cc1\"> <img style=\"width:54;height:29;\"  src=\""+$(this).attr("picture")+" \" onError=\"noHeadImg(this)\">&nbsp;&nbsp;<span>"+$(this).attr("ccname")+"</span></div></div>";
								$("#showtea").append(htmlObj);
							});
							
							$("#addexp-button").html("添加实验");
							$("#addexp-button").css("display","block");
							$("#addexp-button").die().live("click",function(){
								addcourse("choose-teacher");
							});
						}else if(info != null && info.length == 1){
							//一个课程 直接添加
							$("#addexp-button").html("添加实验");
							if($("#betaStatus").val()=="2"){
								$("#addexp-button").html("开始内测");
							}
							if($("#betaStatus").val() =="3"){
								$("#addexp-button").html("开始教测");
							}
							$("#addexp-button").css("display","block");
							$("#addexp-button").die().live("click",function(){
								if(!checkPurchaseAauthority(ecid)){
									jAlert("对不起，该实验为内测实验，您不是内测人员，不能购买。", null, 
											null, 5000, null,"error",null,getPh());
									return;
								}else{
									addCou($(info)[0].ccid,1);
								}
							});
						}
					}else if(role == "S"){
						//学生
						var info = $(data).attr("info");
						if(info != null && info.length > 1){
							//多个课程
							createDivForStu(info);
							$("#addexp-button").html(addExp);
							if($("#betaStatus").val()=="2"){
								$("#addexp-button").html("开始内测");
							}
							if($("#betaStatus").val()=="3"){
								$("#addexp-button").html("开始教测");
							}
							$("#addexp-button").css("display","block");
							$("#addexp-button").die().live("click",function(){
								addcourse("choose-course");
							});
						}else if(info != null && info.length == 1){
							//一个课程  判断是否是一个教室
							var tea = $(info).attr("list");
							if(tea != null && tea.length > 1){
								//多个老师
								createDivForStu(info);
								$("#addexp-button").html(addExp);
								if($("#betaStatus").attr("data-beta")=="2"){
									$("#addexp-button").html("开始内测");
								}
								if($("#betaStatus").attr("data-beta")=="3"){
									$("#addexp-button").html("开始教测");
								}
								$("#addexp-button").css("display","block");
								$("#addexp-button").die().live("click",function(){
									addcourse("choose-course");
								});
							}else if(tea != null && tea.length == 1){
								//一个老师
								createDivForStu(info);
								$("#addexp-button").html(addExp);
								if($("#betaStatus").attr("data-beta")=="2"){
									$("#addexp-button").html("开始内测");
								}
								if($("#betaStatus").attr("data-beta")=="3"){
									$("#addexp-button").html("开始教测");
								}
								$("#addexp-button").css("display","block");
								$("#addexp-button").die().live("click",function(){
									addcourse("choose-course");
								});
							}
						}else{
							$("#addexp-button").css("display","none");
						}
					}
				}
			}
		}
	});
}

//刚刚创建试验机执行方法
function startCreateEnv(){
	$("#addexp-button").die("click");
	$("#addexp-button").css("display","block");
	if(languageFirst == "English"){
		$("#addexp-button").html("Sending request");
	}else{
		$("#addexp-button").html("正在发送请求...");
	}
	$("#addexp-button").css("background-color","#bfcacd");
	$(".exp_price").css("display","none");
	$("#create-mac").css("display","none");
	$("#end-mac").css("display","none");
	$("#creating-mac").css("display","none");
	$("#ending-mac").css("display","none");
	$("#addexp-button").addClass("ec_enter");
	//$("#exp_countDown").css("display","none");
}
//展示排队信息
function showQueue(position){
	//重置实验按钮
	//deleteTimer();
	$("#addexp-button").css("display","none");
	$(".exp_price").css("display","none");
	$("#create-mac").css("display","none").css("left","0px");
	$("#end-mac").css("display","none");
	$("#ending-mac").css("display","none");
	$("#creating-mac").css("display","none");
	$("#blackBg").css("display","none");
	$("#exp_countDown").css("display","none");
	$("#queue").find("font").html(position);
	$("#queue").css("display","block");
}
//重置实验按钮方法
function resetExp(){
	//重置实验按钮
	//deleteTimer();
	$("#addexp-button").css("display","block");
	$(".exp_price").css("display","none");
	$("#create-mac").css("display","block").css("left","0px");
	$("#end-mac").css("display","none");
	$("#ending-mac").css("display","none");
	$("#creating-mac").css("display","none");
	if(languageFirst == "English"){
		$("#addexp-button").html("Creat VM");
	}else{
		$("#addexp-button").html("创建实验机");
	}
	$("#addexp-button").addClass("ec_enter");
	$("#addexp-button").css("background-color","#5bb75b");
	$("#blackBg").css("display","none");
	$("#exp_countDown").css("display","none");
	$("#queue").css("display","none");
	$("#addexp-button").die().live("click",function(){
		createEnvAndDop(false,false);
	});
}

//创建中的展示
function creatingEnv(str){
	$("#queue").css("display","none");
	$("#addexp-button").css("display","block");
	$("#addexp-button").html(str);
	$("#create-mac").css("display","none");
	$("#addexp-button").css("background-color","#bfcacd");
	$("#end-mac").css("display","none");
	$("#creating-mac").css("display","block");
	$("#ending-mac").css("display","none");
	$("#addexp-button").addClass("ec_enter");
}

//实验机创建成功后
function createSuccess(){
	if(languageFirst == "English"){
		$("#addexp-button").html("Access VM");
	}else{
		$("#addexp-button").html("进入实验机");
	}
	$("#end-mac").css("display","inline-block");
	$(".exp_price").css("display","none");
	$("#create-mac").css("display","none");
	$("#creating-mac").css("display","none");
	$("#ending-mac").css("display","none");
	$("#queue").css("display","none");
	$("#addexp-button").addClass("ec_enter");
	$("#addexp-button").css("background-color","#5bb75b");
	$("#addexp-button").die().live("click",function(){
		getRegistConsole('',ceid,$("#sessionuuid").val(),'');
	});
	$("#end-mac").die().live("click",function(){
		stopExpMac($(this),ceid);
	});
	//倒计时
	getcontDown(ceid);
}


/**
 * 发送申请资源请求
 * @param ceid
 * @param obj
 * @param par
 */
function proxyAllot(ceid, obj, par) {
	$.ajax({
		url : "registerUser/courseExp!getProgress.action",
		data : {
			ceid : ceid,
			rtnJson : true
		},
		dataType : "json",
		type : "post",
		async : true,
		success : function(e) {
			if ($(e).attr("result") == "success") {
				exptDoing();
				//判断资源是否创建超时
				var message = $(e).attr("message");
				if(message == "queue"){
					showQueue($(e).attr("position"));
					setTimeout(function(){
						proxyAllot(ceid, $(".SD-des"),null);
					},5000);
				}else{
					if($(e).attr("isDe")){
						jAlert("OMG!网络太慢，再来一次",null,function(){
							resetExp(null);
						},5000, null, "warn", null, getPh());
					}else{
						var pro = $(e).attr("progress");
						var sta = $(e).attr("status");
						var mesid = $(e).attr("mesid");
						var mesg = $(e).attr("mesg");
						var resstr = "";
						if(languageFirst == "English"){
							var sstr = "<img style=\"vertical-align: middle;\" src=\"img/waiting.gif\"/>Being created.."+pro + "%";
						}else{
							var sstr = "<img style=\"vertical-align: middle;\" src=\"img/waiting.gif\"/>正在创建.."+pro + "%";
						}
						creatingEnv(sstr);
						if (pro == 100 && sta == "1") {
							if(stateCode == "10030001" && testNum > 0){
								loadanswers(testNum);
							}
							createSuccess();
						} else if (sta == "2") {
							resetExp(null);
							jAlert("准备环境失败！",null,null,5000, null, "error", null, getPh());
							exptDoing();
						} else if (sta == "3") {
							resetExp(null);
							jAlert("准备环境失败！",null,null,5000, null, "error", null, getPh());
							exptDoing();
						} else if(sta == "0" || sta == "9"){
							setTimeout(function(){
								proxyAllot(ceid, $(".SD-des"),null);
							},5000);
						}
					}
				
				}
			} else if ($(e).attr("result") == "failure") {
				// 加载进度失败 重新创建
				if($(e).attr("message") == "nosubmit"){
					setTimeout(function(){
						proxyAllot(ceid, $(".SD-des"),null);
					},5000);
				}else{
					resetExp(null);
				}
			} else if ($(e).attr("result") == "error") {
				// 异常
			}
		},
		error : function(q, w, e) {

		}
	});
}

function loadanswers(testNum){
	var strbox = "<div id=\"answer_list\" class=\"exp\" data-name=\"答题列表\">";
	strbox += "<div id=\"questionsContent\" class=\"questionsbegin\" style=\"display:none;\" data-name=\"开始答题\">";
	strbox += "<div class=\"questionsbegin-div\">";
	strbox += "<p class=\"exp_name\">课后习题</p>";
	strbox += "<p class=\"topicNumber\">总计<span>"+testNum+"</span>道题，有机会获得大量合氏币！</p>";
	strbox += "<div class=\"questionsbeginBtn\">开始答题</div>";
	strbox += "</div>";
	strbox += "</div>";
	strbox += "<div id=\"questionsContent\" class=\"questionscontinue\" style=\"display:none;\" data-name=\"继续答题\">";
	strbox += "<div class=\"questionscontinue-div\">";
	strbox += "<p class=\"exp_name\">课后习题</p>";
	strbox += "<p class=\"topichint\"></p>";
	strbox += "<div class=\"questionscontinueBtn\">继续答题</div>";
	strbox += "</div>";
	strbox += "</div>";
	strbox += "<div id=\"questionsContent\" class=\"questionsList\" style=\"display:none;\" data-name=\"答题进行中\"></div>";
	strbox += "</div>";
	$(".main_list").append(strbox);
	
	var str = "<li id=\"answer\">答题<span>（<span>"+testNum+"</span>）</span></li>";
	$("#guidancebook").after(str);
	var left = parseInt($(".expLeftList").find(".hr").find("span").css("left"));
	if(left >= 135){
		$(".expLeftList").find(".hr").find("span").css("left",left+135+"px");
	}
	$("#stateCode").val("10030002");//这里把考试试题状态写死
}

function createEnv(){
	var evmData = queryAllco();
	if(languageFirst == "English"){
		var str = "The experimental environment was already in place and the current experimental environment was destroyed？";
	}else{
		var str = "已经有了实验环境，是否销毁它并准备当前实验环境？";
	}
	if($(evmData).attr("result") == "success"){
			if($(evmData).attr("message")){
				//可以分配资源
				//确定分配资源
				startCreateEnv();
				if (Validate.isValid(ceid)) {
					createEnvAndDop();
				}
			}else{
				if($(evmData).attr("ising")){
					var courseName = $(evmData).attr("infos")[0].courseName;
					var exptName = $(evmData).attr("infos")[0].exptName;
					var str1 = "";
					if(courseName == "虚拟课程"){
						str1 = exptName + "”正在准备实验环境，您暂时不能准备环境！请稍侯再试！";
					}else{
						str1 = "“" + courseName + "”的“" + exptName
						+ "”正在准备实验环境，您暂时不能准备环境！请稍侯再试！";
					}
					jAlert(str1, "资源警告", null, waitMillSecond, null, "warn", null,getPh());
					}else if (!$(evmData).attr("ising")) {
					var courseName = $(evmData).attr("infos")[0].courseName;
					var exptName = $(evmData).attr("infos")[0].exptName;
					var str1 = "";
					if(courseName == "虚拟课程"){
						str1 = exptName;
					}else{
						str1 = "“"+courseName + "”的“" + exptName+"”";
					}
					jConfirm(str1+"  "+str, "确认提示",
						function(result) {
							if (result) {//确定分配资源
								startCreateEnv();
								if (Validate.isValid(ceid)) {
									createEnvAndDop();
								}
							}
						}, waitMillSecond, null,getPh());
					} 
				}
		}
	
}

function queryAllco(){
	if(!checkPurchaseAauthority(ecid)){
		jAlert("对不起，该实验为内测实验，您不是内测人员，不能创建试验机。", null, 
				null, 5000, null,"error",null,getPh());
		return;
	}
	if(checkExpOpen(ecid)){
		jAlert("对不起，该实验为未开放实验，不能创建试验机。", null, 
				null, 5000, null,"error",null,getPh());
		return;
	}
	
	
	var evmData;
	$.ajax({
		url : "registerUser/courseExp!queryEvmInfo.action",
		dataType : "json",
		type : "post",
		data : {
			"ceid":ceid
		},
		async : false,
		success : function(data) {
			evmData = data;
		},
		error : function(q, w, e) {
			alert("系统异常");
		}
	});
	return evmData;
}

function createEnvAndDop(destroyEnv,removeQueue){
	if (Validate.isValid(ceid)) {
		$.ajaxSettings.traditional = true;
		//资源池代码 registerUser/courseExp!allcate4ru.action
		//$.post("registerUser/resourcesAction!allocateResourse4RU.action", 
		startCreateEnv();
		$.post("registerUser/courseExp!allcate4ru.action",
				$.param({"ceid":ceid,"destroyEnv":destroyEnv,"removeQueue":removeQueue}), 
				function(resp) {
					if ($(resp).attr("result") == "success") {
						exptDoing();
						var orign = $(resp).data("orign");
						$("#allTips").css("line-height","18px");
						proxyAllot(ceid, $(".SD-des"), null);
					} else if ($(resp).attr("result") == "failure") {
						resetExp(null);
						var message = $(resp).attr("message");
						if(message == "allocating"){
							//有分配中的
							var exptName = $(resp).attr("infos")[0].exptName;
							jAlert(exptName+"正在准备实验环境，您暂时不能准备环境！请稍侯再试！", "资源警告", null, waitMillSecond, null, "warn", null,getPh());
						}else if(message == "allocated"){
							//有分配好的
							var exptName = $(resp).attr("infos")[0].exptName;
							jConfirm(exptName+"已经有了实验环境，是否销毁它并准备当前实验环境？", "确认提示",
								function(result) {
									if (result) {//确定分配资源
										if (Validate.isValid(ceid)) {
											createEnvAndDop(true,false);
											exptDoing();
										}
									}
							}, waitMillSecond, null,getPh());
						}else if(message == "pool"){
							//队列中存在
							var exptName = $(resp).attr("infos")[0].exptName;
							jConfirm(exptName+"已经存在于队列中，是否移除它并准备当前实验环境？", "确认提示",
								function(result) {
									if (result) {//确定分配资源
										if (Validate.isValid(ceid)) {
											createEnvAndDop(false,true);
										}
									}
							}, waitMillSecond, null,getPh());
						}
						
					} else if ($(resp).attr("result") == "error") {
						jAlert("准备环境失败，"+$(resp).attr("message") + "！",null,null,waitMillSecond, null, "error", null, getPh());
						resetExp(null);
					}
				},
				"json"
			);
	}
}

function queryUserInfoForExp(){
//	alert($("#betaStatus").val());
//	if($("#betaStatus").val()!=undefined){
//		queryIsExitExp();
//		return;
//	}
	$.ajax({
		url: "publiccourse!queryUserInfoForExp.action",
		dataType: "json",
		type: "post",
		data: {ecid:ecid},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success"){
				var coin = $(data).attr("coin");
				var price = $(data).attr("price");
				if(price == 0){
					queryIsExitExp();
				}else	if(coin < price){
					jPay("亲，您只有"+coin+"合氏币，不够用哦！");
				}else if(coin >= price){
					if(languageFirst == "English"){
						var str = "Dear，Your current"+coin+"He icon，Add course expenditure"+price+"He icon，Do you want to add？";
					}else{
						var str = "亲，你现有"+coin+"合氏币，添加该实验花费"+price+"合氏币，确定添加么？";
					}
					jConfirm(str, null, function(val){
						if(val){
							queryIsExitExp();
						}
					},null,null,getPh());
				}
			}
		},error:function(q,w,e){
		}
	});
}

function queryIsExitExp(){
	$.ajax({
		url: "publiccourse!queryIsExitExp.action",
		dataType: "json",
		type: "post",
		data: {ecid:ecid},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success"){
				if($(data).attr("message").length >0 ){
					$("#already_course").children().remove();
					$($(data).attr("message")).each(function(num){
						var htmlObj="<div class=\"cc_01\" name=\""+$(this).attr("ccid")+"\" onclick=\"setApplycouID('"+$(this).attr("ccid")+"',this)\">" +
						" <div class=\"cc1\"> <img style=\"width:54;height:29;\"  src=\""+$(this).attr("picture")+" \" onError=\"noHeadImg(this)\">&nbsp;&nbsp;<span>"+$(this).attr("ccname")+"</span></div></div>";
						$("#already_course").append(htmlObj);
						if(num == 0){
							$("#already_course").children().eq(0).trigger("click");
						}
					});
					$("#continue_add").die().click(function(){
						regAddExp();
					});
					addcourse("already_add");
				}else{
					regAddExp();
				}
			}
		},error:function(q,w,e){
		}
	});
}

//注册用户添加实验
function regAddExp(){
	if(!checkPurchaseAauthority(ecid)){
		jAlert("对不起，该实验为内测实验，您不是内测人员，不能购买。", null, 
				null, 5000, null,"error",null,getPh());
		return;
	}
	var orign = false;
	var o = LocationUtil.getParameter("orign");
	if(o != undefined && o != ""){
		orign= o;
	}
	$.ajax({
		url: "regAddExp.action",
		dataType: "json",
		type: "post",
		data: {ecid:ecid,orign:orign,token:getToken()},
		async : false,
		success: function(data){
			if($(data).attr("result") == "success"){
				var ename =$(data).attr("message").exptName;
				closecourse("already_add");
				if(languageFirst == "English"){
					var str = "added！";
				}else{
					var str = "恭喜您！"+ename+"实验添加成功！";
				}
				jAlert(str, null, function(){
					var url = "/expc.do?ec="+ecid;
					document.location.href=url;
				}, 5000, null, "info", null, getPh());
			}else if($(data).attr("result") == "failure"){
				var url = "/expc.do?ec="+ecid;
				document.location.href=url;
			}
		},error:function(q,w,e){
		}
	});
}

/**
 * 检查购买权限:针对河粉测试
 */
function checkPurchaseAauthority(ecid){
	var result = false;
	$.ajax({
		url:"betaAction!checkBetaAuthority.action",
		data:{ecid:ecid},
		dataType:"json",
		type:"post",
		async:false,
		success : function(data){
			if(data != null){
				if(data.result=="success"){
					result= true;
				}
			}
		}
	});
	return result;
}

function closecourse(divid){
	$("#blackBg").css("display","none");
	$("#"+divid).css("display","none");
}

function addcourse(divid){
	$("#"+divid).css("display","block");
	$("#blackBg").css("display","block");
}

function setApplycouID(courid,obj){
	ccid = courid;
	$(obj).parent().children().removeClass("choose");
	$(obj).addClass("choose");
	$(obj).parent().children().css("background-image","");
	$(obj).css("background-image","url(img/common/tea_bg2.jpg)");
	$(".application-button").css("display","block");
	$(".gray-button").css("display","none");
}

//添加课程
function addCou(courid,canbeAp){
	var redata;
	$.ajax({
	  url:"teacher/tokencourse!addCourse.action",
		data:{ccid:courid,stuIds:null,canbeAppl:1,ecid:ecid,token:getToken()},
		type:"post",
		dataType:"json",
		async : false,
		success:function(e){
			$("#choose-teacher").css("display","none");
			$("#blackBg").css("display","none");
			if($(e).attr("result") == "success"){
				var cname =$(e).attr("cname");
				jAlert("恭喜您！\""+cname+"\"课程添加成功！", null, function(){
					document.location = LocationUtil.getServerUrl()+"/pages/teacher/teach-main.jsp?couid="+$(e).attr("couid")+"&ceid="+$(e).attr("eecid");
				}, 5000);
			 }else{
			 	jAlert("添加失败！", null, function(){}, 5000);
			 }
		},
		error:function(q,w,r){
			
		}
	});
	return redata;
}
/**
 *对于用户添加过的已经设置为未开放的实验判断  
 */
function checkExpOpen(ecid){
	var result =false;
	$.ajax({
		url:"courseExp!judgeUnOpen.action",
		data:{ec:ecid},
		dataType: "json",
		type: "post",
		async: false,
		success:function(data){
			if($(data).attr("result")=="success"){
					result=true;
			}
		}	
	});
	return result;
}

function getRegistConsole(cId,eId,uId,vmId){
	//先判断资源是否还存在
	var flag = queryDeployMent(eId);
	if(flag){
		/*var url = LocationUtil.getContextPath() + "/pages/registerUser/ru-monitor.jsp?e="+eId+"&c="+cId+"&u="+uId+"&v="+vmId;*/
		var url ="/queryExpStudy.do?ceid="+eId;
		var ischrome  = window.navigator.userAgent.indexOf("Chrome") > -1 ;
		if($.browser.mozilla || ischrome) {
			var str = "<a id=\"enter\" href=\""+url+"\" target=\"_blank\"><span id=\"enterc\">进入</span></a>";
			$("body").append(str);
			$("#enterc").trigger("click");
			$("#enterc").remove();
		}else {
			var str = "<a id=\"enter\" href=\""+url+"\" target=\"_blank\"><span id=\"enterc\">进入</span></a>";
			$("body").append(str);
			$("#enterc").trigger("click");
		}
	}else{
		resetExp(null);
		exptDoing();
	}
}

function queryDeployMent(id){
 	var flag = false;
 	$.ajax({
		url : "registerUser/courseExp!queryDeployment.action",
		type : "post",
		data : ({
			"ceid" : id,
			}),
		dataType : "json",
		async : false,
		success : function(resp, status) {
			if($(resp).attr("result") == "success"){
				flag = true;
			}
		},
		error : function(x, s, e) {
		}
 	});
 	return flag;
}

function stopExpMac(stopBtn,exptid){
	// 停止实验
	var str = "释放实验机，将无法保留实验机内已进行的所有操作，确认释放么？";
	jConfirm(str, null, function(val) {
		if(val){
			stopBtn.die();
			if (stopExpt(exptid, "true")) {
				resetExp(null);
				exptDoing();
			} else {
				jAlert("系统繁忙..！", null, null, 5000, null, "error", -210, -40);
			}
		}
	},null,null,getPh());
}

function stopExpt(ceid, isRelease){
 	if(!Validate.isValid(isRelease)){
 		isRelease = "false";
 	}
 }

function getcontDown(ceid){
	$.ajax({
		url : "registerUser/teaExp!getDeploymentFinishtime.action",
		dataType : "json",
		type : "post",
		data : {
			cexpID : ceid
		},
		async : false,
		success : function(data) {
//				$("#clockbox").css("background","rgba(0, 0, 0, 0) url('img/common/colockbg.png') no-repeat scroll -3 0");
			if($(data).attr("countDown") != -1){
				countDown($(data).attr("countDown"),null,"#clockbox .hour","#clockbox .minute","#clockbox .second","");
				$("#exp_countDown").css("display","block");
			}
		}, error : function(q, w, e){
		
		}
	});
}


/**************************************************************以下为现金支付的接口和方法******************************/

/**
 * 获取将要购买的实验信息
 * @param ecid
 */
function getExptInfoById(ecid){
	$.ajax({
		url:"payExptAction!getExptInfoById.action",
		type:"post",
		data:{ecid:ecid},
		dataType: "json",
		async:false,
		success:function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				var price = $(mes).attr("price");
				if(price > 0){
					jConfirm("亲，添加该实验需花费"+price+"元人民币，确认添加吗？", null, function(val){
						if(val){
							var difficulty = $(mes).attr("desc");
							var ecId = $(mes).attr("ecId");
							var expName = $(mes).attr("ecName");
							var expImg = $(mes).attr("picture");
							//判断金额是否含有小数
							if(!String(price).indexOf(".")>-1){
								price = price + ".00";
							}
							var learnNum = $(mes).attr("useTimes")
							expOrderInfoShow(expImg,expName,learnNum,difficulty,price);
						}
					},null,null,getPh());
				}else{
					queryUserInfoForExp();//走购买普通实验流程
				}
			}else{
				if(mes == "HaveExp"){
					jAlert("实验已购买，请勿重新购买！", null, null, 5000, null,"error",null,getPh());
					window.location.reload();
				}else{
					jAlert("获取实验信息失败！", null, null, 5000, null,"error",null,getPh());
				}
			}
		},
		error : function(){
			jAlert("后台数据异常！", null, null, 5000, null,"error",null,getPh());
		}
 	});
}

/**
 * 创建购买实验订单
 */
function buildMoneyOrder(ecid,money,payWay){
	$.ajax({
		url:"payExptAction!buildMoneyOrder.action",
		type:"post",
		data:{cid:ecid,money:money,payWay:payWay},
		dataType:"json",
		async:false,
		success:function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				var orderId = $(data).attr("message");
				payMoneyExp(orderId,payWay);
			}else{
				if(mes == "moneyError"){
					jAlert("价格有误！", null, null, 5000, null,"error",null,getPh());
				}else if(mes == "NoBuy"){
					jAlert("该实验不支持单独购买！", null, null, 5000, null,"error",null,getPh());
				}else if(mes == "haveExp"){
					jAlert("实验已购买，请勿重复购买！", null, null, 5000, null,"error",null,getPh());
					window.location.reload();
				}else if(mes == "errPayway"){
					jAlert("支付方式有误！", null, null, 5000, null,"error",null,getPh());
				}else{
					jAlert("订单创建失败！", null, null, 5000, null,"error",null,getPh());
				}
			}
		},
		error : function(){
			jAlert("后台数据异常！", null, null, 5000, null,"error",null,getPh());
		}
 	});
}

//展示订单信息
function expOrderInfoShow(expImg,expName,learnNum,difficulty,price){
	var orderStr = "<div class=\"pay-select\">";
	orderStr += "<div class=\"buyEc\">";
	orderStr += "购买精品实验<img id=\"closePayPage\" class=\"close\" src=\"/img/close.png\"/>";
	orderStr += "</div>";
	orderStr += "<div class=\"checkedDiv\" data-name=\"选择支付方式\">";
	orderStr += "<div class=\"course-Relevant\">";
	orderStr += "<div class=\"coursCoin\">";
	orderStr += "<img src=\""+expImg+"\" onerror=\"noCourseImg(this)\"> ";
	orderStr += "</div>";
	orderStr += "<div class=\"coursIntroduce\">";
	orderStr += "<h3>"+expName+"</h3><span>价格：<i>"+price+"</i>元</span>";
	orderStr += "<p>购买人数："+learnNum+"</p>";
	orderStr += "<p>难度："+difficulty+"</p>";
	orderStr += "</div>";
	orderStr += "</div>";
	/*orderStr += "<div class=\"coupon\">";
	orderStr += "<div class=\"coupontitle\">优惠券<span><i>3</i>张可用优惠券<img src=\"/img/coursePage/arrowsbottom.png\"/></span></div>";
	orderStr += "<div class=\"couponList\">";
	orderStr += "<div class=\"couponSingle\">";
	orderStr += "<span class=\"money\">￥<i>10</i></span>";
	orderStr += "<span class=\"text\">现</br>金</span>";
	orderStr += "</div>";
	orderStr += "</div>";
	orderStr += "</div>"*/
	orderStr += "<p class=\"h2\">支付方式</p>";
	orderStr += "<div class=\"sl-index\">";
	orderStr += "<div class=\"payDiv yesIns\" data-name=\"微信\" data-type=\"2\">";
	orderStr += "<img src=\"/img/course/vxico.png\">&nbsp;微信支付";
	orderStr += "</div><div class=\"payDiv\" data-name=\"支付宝\" data-type=\"1\">";
	orderStr += "<img src=\"/img/course/zfbico.png\">&nbsp;支付宝";
	orderStr += "</div>";
	orderStr += "</div>";
	orderStr += "<div class=\"hrs\"></div>";
	orderStr += "<div class=\"confirms\">";
	orderStr += "<div class=\"showMay\">付款金额 <span>￥</span><span id=\"money\">"+price+"</span></div>";
	orderStr += "<div id=\"payMoney\" class=\"confirmBug\">确认购买</div>";
	orderStr += "</div>";
	orderStr += "</div>";
	orderStr += "<div class=\"warn-info\">";
	orderStr += "<div class=\"info_warn\"><img src=\"img/bank/warn_info.png\"/></div>";
	orderStr += "<div class=\"warn_div\">";
	orderStr += "<p style=\"margin-top:12px;\">付款完成前，请不要关闭此窗口</p>";
	orderStr += "<p>付款完成后，请根据您的情况点击下面的按钮</p>";
	orderStr += "<p style=\"margin-top:35px;\">";
	orderStr += "<span class=\"btn-result btn-error\">";
	orderStr += "支付遇到问题";
	orderStr += "</span>";
	orderStr += "<span class=\"btn-result btn-succ\">";
	orderStr += "已支付成功";
	orderStr += "</span>";
	orderStr += "</p>";
	orderStr += "</div>";
	orderStr += "</div>";
	orderStr += "</div>";
	$("body").append(orderStr);
	$(".bg").show();
}

/**
 * 发送支付请求
 * @param orderId 订单id
 * @param payWay 支付方式
 */
function payMoneyExp(orderId,payWay){
	$.ajax({
		url:"payExptAction!payMoneyExp.action",
		type:"post",
		data:{orderId:orderId,payWay:payWay},
		dataType: "json",
		async:false,
		success:function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				$(".checkedDiv").hide();
				$(".warn-info").show();
				window.open(mes);
			}else{
				if(mes == "errOrder"){
					jAlert("订单信息有误！", null, null, 5000, null,"error",null,getPh());
				}else if(mes == "moneyError"){
					jAlert("购买金额有误！", null, null, 5000, null,"error",null,getPh());
				}else if(mes == "errPayway"){
					jAlert("支付方式有误！", null, null, 5000, null,"error",null,getPh());
				}else if(mes == "successOrder"){
					jAlert("已付款成功，请勿重复支付！", null, null, 5000, null,"error",null,getPh());
				}
			}
		},
		error : function(){
			jAlert("后台数据异常！", null, null, 5000, null,"error",null,getPh());
		}
 	});
}