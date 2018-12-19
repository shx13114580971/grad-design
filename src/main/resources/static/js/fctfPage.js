var ecid = $("#ecid").val();
var ceid = $("#ceid").val();
var stateCode = "";
var difficulty = new Array();
var evaluatetotalPage = 1;
var notestotalPage = 1;
var questionstotalPage = 1;
var evaluateBetatotalPage = 1;
var showSubmitBtn = false;
var showBetarepyly = false;//判断内测实验回复按钮的权限标识
var taskIdArr = new Array();
var pArr = new Array("A","B","C","D","E","F","G","H","I","J","K");

$(document).ready(function(){
	//examTimeScroll();
//	fctfClick();
	//fctfimentmenu();
	$(".head_img img").attr("src",$(".siLg-img img").attr("src"))
	queryCollectionById(ecid);
	$("#select-satisfactiondiv").sSelect();
	$("#select-timediv").sSelect();
	$(".fctf_menu_list li").eq(0).trigger("click");
	getNewStudy(ecid);
	$('#evaluate-start').raty({ 
		score: 5,
	});
	if($(".fctf_introduce_list").html().length > 145 ){
		$(".fctf_introduce_list").addClass("long");
	}
});

//监听事件
// function examTimeScroll(){
// 	$(window).on("scroll",function(){
// 		if($(window).scrollTop() > 418){
// 			$(".fctf_menu_list").css({"position":"fixed","top":"0px","z-index":"100"});
// 		}else{
// 			$(".fctf_menu_list").css({"position":"relative"});
// 		}
// 	});
// }

function fctfClick() {

    //菜单栏点击事件
    $(".fctf_menu_list li").live("click", function () {
        menuSlide($(this).index());
        clearDate();
        $(".main_list").children(".fctf").hide();
        $(".main_list").children("#" + $(this).attr("id") + "_list").show();

    });

    //打开新的指导书页面
    $(".fullscreen").click(function () {
        window.open("/pages/registerUser/guidebookHtml.jsp?ceid=" + ceid);
    })

    //添加笔记
    $(".addnotes_btn").click(function () {
        var notecontent = $("#notes_editor_text").val().trim();
        if (checlogin()) {
            if (notecontent == "") {
                $(".addnotes_btn").parent().find(".error-message").html("笔记内容不能为空！");
            } else {
                if (ceid != "") {
                    addNotes(notecontent, ceid);
                } else {
                    $(".addnotes_btn").parent().find(".error-message").html("请购买后发表笔记 ！");
                }
            }
        } else {
            window.open("/loginLab.do", "_blank");
        }
    });

    //收起或展开点击事件
    $(".fctftaskdiv").find(".unfold").click(function () {
        var state = $(this).data("state");
        var guidancebooktitle = $(".guidancebookList").find(".guidancebooktitle");
        var guidancebookcontent = $(".guidancebookList").find(".guidancebookcontent");
        if (state == true || state == undefined) {
            $(this).data("state", false);
            $(guidancebookcontent).slideUp('normal');
            $(guidancebooktitle).addClass("bgUnfold");
        } else {
            $(this).data("state", true);
            $(guidancebookcontent).slideDown('normal');
            $(guidancebooktitle).removeClass("bgUnfold");
        }
    })

    //单个收起或展开点击事件
    $(".guidancebooktitle").live("click", function () {
        var guidancebookcontent = $(this).parent().find(".guidancebookcontent");
        if ($(guidancebookcontent).is(':hidden') == true) {
            $(guidancebookcontent).slideDown('normal');
            $(this).removeClass("bgUnfold");
        } else {
            $(guidancebookcontent).slideUp('normal');
            $(this).addClass("bgUnfold");
        }
    })

    //添加提问
    $(".addquestion_btn").click(function () {
        var questioncontent = $("#question_editor_text").val().trim();
        if (checlogin()) {
            if (questioncontent == "") {
                $(".addquestion_btn").parent().find(".error-message").html("提问内容不能为空！");
            } else {
                if (ceid != "") {
                    addQuizs(questioncontent, ceid);
                } else {
                    $(".addquestion_btn").parent().find(".error-message").html("请购买后发表提问！");
                }
            }
        } else {
            window.open("/loginLab.do", "_blank");
        }
    })

    //问答点赞
    $(".questions_menu").find(".praise-s img").live("click", function () {
        var flag = $(this).parent().parent().parent().data("praiseFlag");
        if (checlogin()) {
            if (flag) {
                deletePraises($(this).parent().parent().parent().attr("id"), this);
            } else {
                addPraises($(this).parent().parent().parent().attr("id"), this);
            }
        } else {
            window.open("/loginLab.do", "_blank");
        }
    })


    //添加评论点击事件
    //添加评论点击事件
    $(".addevaluate_btn").click(function(){
        var exp_id = $("#experiment_id").val();
        var text = $("#evaluate_editor_text").val();
        var createtime = new Date().format("yy-MM-dd hh:mm:ss");
        var score = $('#evaluate-start').raty('score');
        if(text == ""){
            $("#evaluate_editor_text").parent().find(".error-message").html("评论内容不能为空！");
        }else{
            addExAss(exp_id,text,createtime,score);
        }
    })
    function addExAss(exp_id,text,createtime,score){
        $.ajax({
            url:"/experiment/comment",
            data:{
                expfctf_id:exp_id,
                content:text,
                createtime:createtime,
                score:score,
            },
            type:"post",
            dataType:"json",
            async : true,
            success : function(data){
                if(data.code==0){
                    //刷新评论区
                    layer.msg("添加评论成功！");
                    $("#evaluate_editor_text").val("");
                    getAssContent(1,true);
                }else if(data.code==500210){
                    window.location.href="/login";
                } else{
                    layer.msg(data.msg);
                }
            },error : function(){
                layer.closeAll();
            }
        })
    }


    /**
     * 获取实验评价
     * @param ecid
     */
    function getAssContent(pageNum,flag){
        $(".evaluateList").empty();
        $("#evaluate_page").show()
        //Loading($(".evaluateList"),'evaluate');
        $.ajax({
            url:"/experiment/commentList/"+$("#experiment_id").val(),
            data:{pageNum:pageNum},
            type:"post",
            dataType:"json",
            complete:function(){
                removeLoading('evaluate');
            },
            success : function(data){
                if(data.code == 0){
                    mes = data.data;
                    evaluatetotalPage = Math.ceil(data.msg/10);
                    $("#evaluate").children("span").append("(<span>"+data.msg.toString()+"</span>)");
                    if(mes != null){
                        $(mes).each(function(){
                            var createTime = $(this).attr("createtime");
                            var content = $(this).attr("content");//内容
                            var commentId = $(this).attr("com_id");
                            var userName = $(this).attr("userName");
                            var userId = $(this).attr("userId");
                            var expId = $(this).attr("expfctf_id");
                            var score = $(this).attr("score")
                            getAssContentVray(createTime,expId,userId,content,commentId,userName,score);
                        })
                    }else{
                        if(languageFirst == "English"){
                            $(".evaluateList").html(noDateshow("Sorry, there's no result!"));
                        }else{
                            $(".evaluateList").html(noDateshow("该实验下暂无实验评价呦！"));
                        }
                    }
                    if(flag){evaluate_pagination();}
                    //if(evaluatetotalPage>1){$("#evaluate_page").show()}
                }else{
                    $(".evaluateList").html(noDateshow("数据异常，请稍后重试！"));
                }
            }
        })
    }

    function getAssContentVray(createTime,expId,userId,content,commentId,userName,score){
        var replyStr = "<div id='"+commentId+"'  class=\"evaluatediv\">";
        replyStr += "<div class=\"head_img\"><a href=\"profile.do?u="+userId+"\" target=\"_blank\"><img onerror=\"noHeadImg(this)\" src=\"/images/default.jpg\"></a></div>";
        replyStr += "<div class=\"evaluate_name\">"+userName+"</div>";
        replyStr += "<div class=\"evaluate_difficulty\">";
        replyStr += "<i class=\"icon gray\"><i class=\"icon orange\" style=\"width:"+20*score+"%;\"></i></i>";
        replyStr +="（"+difficulty[score-1]+"）";
        replyStr += "</div>";
        replyStr += "<div class=\"evaluate_content\">"+content+"</div>";
        replyStr += "<div class=\"evaluate_menu\">";
        if(languageFirst == "English"){
            replyStr += "<span class=\"evaluate_time\">Time："+createTime+"</span>&nbsp;&nbsp;";
            //replyStr += "<span class=\"evaluate_source\" id=\""+ecid+"\">stem from：<a href=\"expc.do?ec="+ecid+"\" target=\"_blank\">"+expName+"</a></span>";
        }else{
            replyStr += "<span class=\"evaluate_time\">时间："+createTime+"</span>&nbsp;&nbsp;";
            //replyStr += "<span class=\"evaluate_source\" id=\""+ecid+"\">源自：<a href=\"expc.do?ec="+ecid+"\" target=\"_blank\">"+expName+"</a></span>";
        }
        // if(replyNum == 0){
        // 	replyStr += "<span class=\"questions-s\" data-num="+replyNum+"><img src=\"/img/coursePage/reply-icon.png\" style=\"cursor:default;\">"+replyNum+"</span>";
        // }else{
        // 	replyStr += "<span class=\"questions-s\" data-num="+replyNum+"><img src=\"/img/coursePage/reply-icon.png\" title=\"点击展开回复列表\">"+replyNum+"</span>";
        // }
        // if(replyFlag){
        // 	if(languageFirst == "English"){
        // 		replyStr += "<span class=\"reply-btn\">Reply</span>";
        // 	}else{
        // 		replyStr += "<span class=\"reply-btn\">回复</span>";
        // 	}
        // }
        replyStr += "</div>";
        replyStr += "<div class=\"clear\"></div>";
        replyStr += "</div>";
        $(".evaluateList").append(replyStr);
        //$(".evaluateList").find("#"+commentId).find(".questions-s img").trigger("click");
    }

//实验评价分页
    function evaluate_pagination(){
        if(languageFirst == "English"){
            $('#evaluate_page').pagination({
                pageCount: evaluatetotalPage,
                isHide: true,
                keepShowPN: true,
                prevContent:'Previous Page',
                nextContent:'Next Page',
                homePage:'First page',
                endPage:'Last page',
                jumpBtn:'Go',
                count: 2,
                callback:function(api){
                    window.scrollTo(0,418);
                    getAssContent(api.getCurrent(),false);
                }
            });
        }else{
            $("#evaluate_page").pagination({
                pageCount: evaluatetotalPage,
                isHide: true,
                keepShowPN: true,
                count: 2,
                callback:function(api){
                    window.scrollTo(0,418);
                    getAssContent(api.getCurrent(),false);
                }
            });
        }

    }



    /*$("#Inviter_Q").Twitter({
        ajaxUrl:"queAns!queryTweerUserInfo.action",
        loadCallBack:createUserInfo,
        loadType:false
    });*/

    //收藏实验点击事件
    $(".collect").find("i").click(function () {
        if (checlogin()) {
            if ($(this).data("state")) {
                //true 添加过
                delCollectionInfo(ecid);
            } else {
                //false未添加
                addCollectionInfo(ecid);
            }
        } else {
            window.open("/loginLab.do", "_self");
        }

    })

}
function createUserInfo(data){
	if($(data).attr("result") == "success"){
		var mes = $(data).attr("message");
		return mes;
	}else{
		return "";
	}
}

//菜单栏方法执行点击事件
function fctfimentmenu(){
	
	$(".fctf_menu_list").find("#guidancebook").live("click",function(){
		queryGuideId(ceid);
	})
	
	$(".fctf_menu_list").find("#evaluate").die("click").live("click",function(event){
		if(fctfAssShow(ceid) == 1){
			$(".addevaluatediv").show();
		}else{
			$(".addevaluatediv").hide();
		}
		querySatisfied();
		queryAssTime();
		queryAssDiff();
		getAssContent(ecid,1,true);
	})
	
	$(".fctf_menu_list").find("#questions").live("click",function(){
		queryQuestionByid(ecid,1,true);
	})
	
	$(".fctf_menu_list").find("#notes").live("click",function(){
		queryNotesByEcid(ecid,1,true);
	})
	
	$(".fctf_menu_list").find("#answer").live("click",function(){
		queryFctfExamInfo();
	})
	
	$(".fctf_menu_list").find("#evaluateBeta").live("click",function(){
		if(fctfBetaAssShow(ceid) == "1"){
			$(".addevaluateBetasdiv").show();
		}else{
			$(".addevaluateBetasdiv").hide();
		}
		$(".evaluateBeta_editordiv_top").find("li:eq(0)").trigger("click");
		clearDate();
		queryReplyBtn(ecid);
		queryBetaByCeidAndUserId(ceid);
		queryBetaByEcid(ecid,1,true);
	})
	
}

//菜单滑动
function menuSlide(type){
	var left = 135*type;
	$(".fctfLeftList").find(".hr").find("span").animate({left:left+"px"},250);
}


//加载中
function Loading(id,name){
	if(languageFirst == "English"){
		$(id).loading({
			loadingWidth:300,
			title:'on loading,please wait for a while...',
			name:name,
			type:'origin',
			originDivWidth:40,
			originDivHeight:40,
			originWidth:6,
			originHeight:6,
			smallLoading:true,
		})
	}else{
		$(id).loading({
			loadingWidth:300,
			title:'努力加载中，请稍候...',
			name:name,
			type:'origin',
			originDivWidth:40,
			originDivHeight:40,
			originWidth:6,
			originHeight:6,
			smallLoading:true,
		})
	}
}

//无数据展示
function noDateshow(message,flag){
	var noStr = "";
	if(flag == undefined){
		noStr += "<div class=\"nodate\">";
		noStr += "<div class=\"nodateImg\"><img src=\"/img/coursePage/nodate-icon.png\"/></div>";
		noStr += "<p>"+message+"</p>";
		noStr += "</div>";
	}else{
		noStr += "<div class=\"nodate\" style=\"width:100%;margin-top:0;\">";
		noStr += "<div class=\"nodateImg\"><img src=\"/img/coursePage/nodate-icon.png\"/></div>";
		noStr += "<p>"+message+"</p>";
		noStr += "</div>";
	}
	
	return noStr;
}

/*********************************************************************************************************************/

/**
 * 获取相关推荐实验
 */
function queryRandFctf(ecid){
	
	$.ajax({
		url:"newFctf!queryRandFctf.action",
		data:{ecid:ecid},
		type:"post",
		dataType:"json",
		async : false,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if(mes != null){
					$(".recommendList ul").empty();
					$(mes).each(function(){
						var ecid = $(this).attr("ecid");
						var picture = $(this).attr("ecPicture");
						var ecname = $(this).attr("ecname");
						getRodomCourseVray(ecid,ecname,picture);
					})
				}
			}
		},
		error : function(){
			
		}
	})
}

//数据渲染
function getRodomCourseVray(ecid,ecname,picture){
	var fctfStr = "<li>";
	fctfStr += "<div class=\"cou_img\"><a href=\"fctfc.do?ec="+ecid+"\" target=\"_blank\"><img onerror=\"noCourseImg(this)\" src="+picture+"></a></div>";
	fctfStr += "<div class=\"cou_name\">"+ecname+"</div>";
	fctfStr += "</li>";
	$(".recommendList ul").append(fctfStr);
}

/**
 * 获取最新学习过该实验的人员
 * @param ecid
 */
function getNewStudy(ecid){
	
	// $.ajax({
	// 	url:"newFctf!getNewStudy.action",
	// 	data:{ecid:ecid},
	// 	type:"post",
	// 	dataType:"json",
	// 	async : true,
	// 	success : function(data){
	// 		if($(data).attr("result") == "success"){
	// 			var mes = $(data).attr("infos");
	// 			if(mes != null){
	// 				$(".study_people_list").empty();
	// 				$(mes).each(function(i){
	// 					var userId = $(this).attr("userId");
	// 					var userName = $(this).attr("userName");
	// 					var userHead = $(this).attr("userHead");
	// 					getNewStudyVray(userId,userName,userHead,i);
	// 				})
	// 			}else{
	// 				if(languageFirst == "English"){
	// 					$(".study_people_list").html(noDateshow("Sorry, there's no result！"))
	// 				}else{
	// 					$(".study_people_list").html(noDateshow("暂无相关学习伙伴哦！",false))
	// 				}
	// 			}
	// 		}
	// 	},
	// 	error : function(){
	//
	// 	}
	// })
}

//数据渲染
function getNewStudyVray(userId,userName,userHead,i){
	if(i%5 != 4){
		var stuStr = "<div class=\"study_people\">";
	}else{
		var stuStr = "<div class=\"study_people ri\">";
	}
	stuStr += "<a href=\"profile.do?u="+userId+"\" target=\"_blank\"><img class=\"hvimg\" onerror=\"noHeadImg(this)\" title=\""+userName+"\" src=\""+userHead+"\"></a>";
	stuStr += "</div>";
	$(".study_people_list").append(stuStr);
}

/**
 * 查询是否收藏过该实验
 * @param ecid
 */
function queryCollectionById(ecid){
	
	$.ajax({
		url:"collectionAction!queryCollectionById.action",
		data:{
			objectId:ecid
			},
		dataType:"json",
		type:"post",
		async:true,
		success:function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if(mes != ""){
					$(".collect").find("img").attr("src","img/news/alreadyCollect.png");
					if(languageFirst == "English"){
						$(".collect").find("img").attr("title","Cancel Save");
					}else{
						$(".collect").find("img").attr("title","取消收藏");
					}
					$(".collect").find("i").data("state",true);
				}else{
					$(".collect").find("img").attr("src","img/news/collection.png");
					if(languageFirst == "English"){
						$(".collect").find("img").attr("title","Join Save");
					}else{
						$(".collect").find("img").attr("title","加入收藏");
					}
					$(".collect").find("i").data("state",false);
				}
			}
		},
		error:function(){
			
		}
	});
}

/**
 * 收藏实验
 * 加入收藏
 * @param ecid
 */
function addCollectionInfo(ecid){
	$.ajax({
		url:"collectionAction!addCollectionInfo.action",
		data:{
			objectId:ecid
			},
		dataType:"json",
		type:"post",
		async:true,
		success:function(data){
			if($(data).attr("result") == "success"){
				$(".collect").find("img").attr("src","img/news/alreadyCollect.png");
				$(".collect").find("img").attr("title","取消收藏");
				$(".collect").find("i").data("state",true);
			}
		},
		error:function(){
			
		}
	});
}

/**
 * 收藏实验
 * 取消收藏
 * @param ecid
 */
function delCollectionInfo(ecid){
	
	$.ajax({
		url:"collectionAction!delCollectionInfo.action",
		data:{
			objectId:ecid
		},
		dataType:"json",
		type:"post",
		async:true,
		success:function(data){
			if($(data).attr("result") == "success"){
				$(".collect").find("img").attr("src","img/news/collection.png");
				$(".collect").find("img").attr("title","加入收藏");
				$(".collect").find("i").data("state",false);
			}
		},
		error:function(){
			
		}
	});
}


/**************************************************************指导书********************************************************/

/** 
 * 获取实验指导书所有任务点
 * 	@param ecid
 */
function queryGuideId(ceid){
	// $(".guidancebookList").empty();
	// Loading($(".guidancebookList"),'guidancebook');
	// $.ajax({
	// 	url:"newFctf!queryGuideByCeid.action",
	// 	data:{ceid:ceid,ecid:ecid},
	// 	type:"post",
	// 	dataType:"json",
	// 	async : true,
	// 	complete:function(){
	// 		removeLoading('guidancebook');
	// 	},
	// 	success : function(data){
	// 		if($(data).attr("result") == "success"){
	// 			var mes = $(data).attr("message");
	// 			if(mes != null){
	// 				$(mes).each(function(){
	// 					var sectionId = $(this).attr("sectionId");
	// 					var sectionName = $(this).attr("sectionName");
	// 					var sectionText = $(this).attr("sectionText");
	// 					queryGuideIdVray(sectionId,sectionName,sectionText);
	// 				})
	// 				PostbirdImgGlass.init({
	// 				    domSelector:".guidancebookcontent img",
	// 				    animation:true,
	// 				});
	// 				$(".guidancebookList img").css("height","auto");
	// 			}else{
	// 				$(".guidancebookList").html(noDateshow("指导书内容为空！"))
	// 			}
	// 		}else{
	// 			if(languageFirst == "English"){
	// 				$(".guidancebookList").html(noDateshow("Sorry, there's no result!"))
	// 			}else{
	// 				$(".guidancebookList").html(noDateshow("获取指导书失败，请稍后重试！"))
	// 			}
	// 		}
	// 	},
	// 	error : function(){
	// 		$(".guidancebookList").html(noDateshow("获取指导书失败，请稍后重试！"))
	// 	}
	// })
}

//数据渲染
function queryGuideIdVray(sectionId,sectionName,sectionText){
	var guideStr = "<div class=\"guidancebookdiv\" id=\""+sectionId+"\">";
	guideStr += "<div class=\"guidancebooktitle\" data-name=\"指导书标题\">"+sectionName+"</div>";
	guideStr += "<div class=\"guidancebookcontent\" data-name=\"指导书内容\">"+sectionText+"</div>";
	guideStr += "</div>";
	$(".guidancebookList").append(guideStr);
}
/**************************************************************答题******************************************************/

/**************************************************************实验评价******************************************************/
/**
 * 获取实验评价
 * @param ecid
 */
function getAssContent(ecid,pageNum,flag){
	// $(".evaluateList").empty();
	// $("#evaluate_page").hide()
	// Loading($(".evaluateList"),'evaluate');
	// $.ajax({
	// 	url:"newFctf!getFctfAss.action",
	// 	data:{ecid:ecid,pageNum:pageNum},
	// 	type:"post",
	// 	dataType:"json",
	// 	async : true,
	// 	complete:function(){
	// 		removeLoading('evaluate');
	// 	},
	// 	success : function(data){
	// 		if($(data).attr("result") == "success"){
	// 			var mes = $(data).attr("message");
	// 			evaluatetotalPage = $(data).attr("totalpage");
	// 			if(mes != null){
	// 				$(mes).each(function(){
	// 					var userPicture = $(this).attr("userPicture");
	// 					var createTime = $(this).attr("createTime");
	// 					var ecid = $(this).attr("ecid");
	// 					var assessmentId = $(this).attr("assessmentId");
	// 					var userId = $(this).attr("userId");
	// 					var assessment = $(this).attr("assessment");//内容
	// 					var fctfName = $(this).attr("fctfName");
	// 					var risk = $(this).attr("risk");//评价
	// 					var replyNum = $(this).attr("rissk");//回复数量
	// 					var userName = $(this).attr("userName");
	// 					var replyFlag = $(this).attr("replyFlag")//是否有回答权限 true有 false没有
	// 					getAssContentVray(userPicture,createTime,ecid,assessmentId,userId,assessment,fctfName,risk,replyNum,userName,replyFlag);
	// 				})
	// 			}else{
	// 				if(languageFirst == "English"){
	// 					$(".evaluateList").html(noDateshow("Sorry, there's no result!"));
	// 				}else{
	// 					$(".evaluateList").html(noDateshow("该实验下暂无实验评价呦！"));
	// 				}
	// 			}
	// 			if(flag){evaluate_pagination();}
	// 			if(evaluatetotalPage>1){$("#evaluate_page").show()}
	// 		}else{
	// 			$(".evaluateList").html(noDateshow("数据异常，请稍后重试！"));
	// 		}
	// 	},
	// 	error : function(){
	// 		$(".evaluateList").html(noDateshow("数据异常，请稍后重试！"));
	// 	}
	// })
}


/**
 * 实验满意度
 */
function querySatisfied(){
	
	$.ajax({
		url:"newCourseAction!querySatisfied.action",
		data:{},
		type:"post",
		dataType:"json",
		async : false,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if(mes != null){
					$(mes).each(function(){
						var description = $(this).attr("description");
						var name = $(this).attr("name");
						difficulty.push(description);
					})
				}
			}
		},
		error : function(){
			
		}
	})
}

/**
 * 花费时间
 */
function queryAssTime(){
	
	$.ajax({
		url:"newCourseAction!queryAssTime.action",
		data:{},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				$("#select-time").empty();
				if(mes != null){
					$(mes).each(function(i){
						var description = $(this).attr("description");
						var name = $(this).attr("name");
						if(i == 0){$("#select-timediv__jQSelect0").find("h4").html(description);}
						var str = "<option value="+name+">"+description+"</option>";
						$("#select-time").append(str);
					})
				}
			}
		},
		error : function(){
			
		}
	})
}

/**
 * 评价实验难度
 */
function queryAssDiff(){
	
	$.ajax({
		url:"newCourseAction!queryAssDiff.action",
		data:{},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				$("#select-satisfaction").empty();
				if(mes != null){
					$(mes).each(function(i){
						var description = $(this).attr("description");
						var name = $(this).attr("name");
						if(i == 0){$("#select-satisfactiondiv__jQSelect0").find("h4").html(description);}
						var str = "<option value="+name+">"+description+"</option>";
						$("#select-satisfaction").append(str);
					})
				}
			}
		},
		error : function(){
			
		}
	})
}


/**
 * 查看评论下的回复
 * @param assmentId
 * @returns
 */
function queryContentByAssId(assmentId,obj){
	
	$.ajax({
		url:"assessmentReplyAction!queryContentByAssId.action",
		data:{assmentId:assmentId},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				$(obj).parent().parent().find(".replyList").remove();
				if(mes != null && mes != ""){
					queryContentByAssIdVray(mes,obj);
				}
			}
		},
		error : function(){
			
		}
	})
}

//评论回复数据渲染
function queryContentByAssIdVray(mes,obj){
	var str ="<div class=\"replyList\">";
	var buserName = $(obj).parent().parent().parent().find(".evaluate_name").html();
	$(mes).each(function(){
		var content = $(this).attr("content");
		var createTime = sqlDate2Str($(this).attr("createTime"));
		var userName = $(this).attr("userName");
		var userId = $(this).attr("userId");
		str += "<div class=\"replydiv\">";
		str += "<div class=\"reply-info\">";
		if(languageFirst == "English"){
			str += "<span class=\"replyperson\">"+userName+"</span> Reply <span class=\"replyperson\">"+buserName+"</span><span class=\"replytime\">"+createTime+"</span>";
		}else{
			str += "<span class=\"replyperson\">"+userName+"</span> 回复 <span class=\"replyperson\">"+buserName+"</span><span class=\"replytime\">"+createTime+"</span>";
		}
		str += "</div>";
		str += "<div class=\"reply-content\"><span class=\"reply-content-details\">"+content+"</span></div>";
		str += "</div>";
	})
	str += "</div>";
	$(obj).parent().parent().append(str);
}

/**
 * 回复评论
 * @param assmentId
 * @param replyContent
 * @param ecid
 * @param obj
 */
function insertReply(assmentId,replyContent,ecid,obj){
	// $.ajax({
	// 	url:"newFctf!insertReply.action",
	// 	data:{assId:assmentId,replyContent:replyContent,ecid:ecid},
	// 	type:"post",
	// 	dataType:"json",
	// 	async : true,
	// 	success : function(data){
	// 		var mes = $(data).attr("message");
	// 		if($(data).attr("result") == "success"){
	// 			queryContentByAssId(assmentId,$(obj).parent().parent().find(".questions-s img"));
	// 			var num = $(obj).parent().parent().find(".questions-s").text();
	// 			$(obj).parent().parent().find(".questions-s").html("<img src=\"/img/coursePage/reply-icon.png\" title=\"点击展开回复列表\">"+(parseInt(num)+1));
	// 			$(obj).parent().remove();
	// 		}else{
	// 			if(mes == "noAut"){
	// 				$(obj).parent().find(".error-message").html("抱歉，您的权限不足，回复失败！");
	// 			}
	// 		}
	// 	},
	// 	error : function(){
	//
	// 	}
	// })
	
}

/**
 * 添加实验评价
 * @param ceid
 * @param assessmentTemp
 * @param difficulty
 * @param completion
 * @param risk
 */
function addExAss(assessmentTemp){
	$.ajax({
		url:"courseFctf!addExAss.action",
		data:{
			userId:$("#sessionuuid").val(),
			assessment:assessmentTemp,
		},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			var mes = $(data).attr("message");
			var info = $(data).attr("info");
			clearDate();
			if($(data).attr("result") == "success"){
				var cont = parseInt($(".fctf_menu_list #evaluate span span").text());
				$(".fctf_menu_list #evaluate span span").text(cont+1);
				//$(".addevaluatediv").hide();
				$("#popup_cancel").trigger('click');
				getAssContent(ecid,1,true)
			}else if($(data).attr("result") == "needCode"){
				jCode("", "", function(val){
					$("#evaluate_editor_text").data("isNeed",val);
					addExAss(ceid,assessmentTemp,difficulty,completion,risk);
				}, null, 0, getPh());
			}else if($(data).attr("result") == "codefail"){
				jCode("", "", function(val){
					$("#evaluate_editor_text").data("isNeed",val);
					addExAss(ceid,assessmentTemp,difficulty,completion,risk);
				}, null, 0, getPh());
				var str = '<p id="codeErrorMsg" class="errorMsg codeMsg_z prompt" style="clear: both; position: absolute; font-size: 12px; color: rgb(254, 115, 1); margin-top: -4px;">';
				str = str + '<img src="img/ico_warn_yellow.png" style="">';
				str = str + '<span>验证码有误哦！</span></p>';
				$("#popup_prompt").parent().append(str);
			}else{
				if(info == "two"){
					$(".addevaluate_btn").parent().find(".error-message").html("请勿重复评论！")
				}else{
					$(".addevaluate_btn").parent().find(".error-message").html("添加失败！，请稍后重试！")
				}
			}
		},
		error : function(){
			
		}
	})
}


//判断是否为空
function isNull(obj){
	var flag = false;
	if(obj != ""){
		flag = true;
	}
	return flag;
}

//判断字符串长度
function isLength(obj){
	var flag = false;
	if(obj.length > 20){
		flag = true;
	}
	return flag;
}

//数据渲染
function getBetaReplyInfoByBidVray(mes,obj){
	var str ="<div class=\"replybetaList\">";
	var buserName = $(obj).parent().parent().parent().find(".evaluateBeta_name").html();
	$(mes).each(function(){
		var content = $(this).attr("content");
		var createTime = sqlDate2Str($(this).attr("createTime"));
		var userName = $(this).attr("userName");
		var userId = $(this).attr("userId");
		str += "<div class=\"replybetadiv\">";
		str += "<div class=\"reply-info\">";
		if(languageFirst == "English"){
			str += "<span class=\"replyperson\">"+userName+"</span> Reply <span class=\"replyperson\">"+buserName+"</span><span class=\"replytime\">"+createTime+"</span>";
		}else{
			str += "<span class=\"replyperson\">"+userName+"</span> 回复 <span class=\"replyperson\">"+buserName+"</span><span class=\"replytime\">"+createTime+"</span>";
		}
		str += "</div>";
		str += "<div class=\"reply-content\"><span class=\"reply-content-details\">"+content+"</span></div>";
		str += "</div>";
	})
	str += "</div>";
	$(obj).parent().parent().append(str);
}