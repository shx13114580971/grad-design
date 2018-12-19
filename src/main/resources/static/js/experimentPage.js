var ecid = $("#ecid").val();
var ceid = $("#ceid").val();
var stateCode = "";
var difficulty = new Array("不满意","一般","较满意","很满意","完美");
var evaluatetotalPage = 1;
var notestotalPage = 1;
var questionstotalPage = 1;
var evaluateBetatotalPage = 1;
var showSubmitBtn = false;
var showBetarepyly = false;//判断内测实验回复按钮的权限标识
var taskIdArr = new Array();
var pArr = new Array("A","B","C","D","E","F","G","H","I","J","K");

$(document).ready(function(){
	examTimeScroll();
	experimentClick();
	expimentmenu();
	isVedeoHover();
	vm_isRunning();
    listTestQuestion();
	$(".head_img img").attr("src",$(".siLg-img img").attr("src"))
	queryCollectionById(ecid);
	$("#select-satisfactiondiv").sSelect();
	$("#select-timediv").sSelect();
	queryVideoByEcid(ecid,ceid);//获取实验是否有视频资源
	$(".exp_menu_list li").eq(0).trigger("click");
	queryRandExp(ecid);
	getNewStudy(ecid);
    $('#evaluate-start').raty({
        score: 5,
    });
	// if($(".exp_introduce_list").html().length > 145 ){
	// 	$(".exp_introduce_list").addClass("long");
	// }
});

//列出测题
function listTestQuestion() {
    var count =0;
    var questionHtml = "";
    var questionJson = $("#questionJson").val();
    var questionList = JSON.parse(questionJson);
    for(var i=0;i<questionList.length;i++){
        var question = questionList[i];

        questionHtml += "<div id=\"question"+ count +"\" class=\"questionsbegin\">";
        questionHtml += "<h3 class=\"questionStatement\">"+ question.questionStatement +"<input type='hidden' id='answer"+ count +"' value='"+ question.answer +"'></h3>";
        var items = question.items[0];
        for(var item in items){
            if(item == question.answer){
                questionHtml += "<div id=\"item"+ item +"\" class=\"questionItem_correct\" ><input type='radio'  name='question-item"+ count +"' style='padding-left: 5px' value=\""+ item +"\">&nbsp;"+ items[item] +"</div>";
            }else{
                questionHtml += "<div id=\"item"+ item +"\" class=\"questionItem_incorrect\" ><input type='radio'  name='question-item"+ count +"' style='padding-left: 5px' value=\""+ item +"\">&nbsp;"+ items[item] +"</div>";
            }
        }
        questionHtml += "</div>";
        count++;
    }
    $("#questionList").append(questionHtml);
}
//实验中的测题答案判断
function isExpCorrect(){
    var count = $("#questionList").children("div").length;
    $(".questionItem_correct").css("color","green");
    $(".questionItem_correct").css("font-size","18px");
    $(".questionItem_correct").css("font-weight","bold");
    for(var i = 0; i < count; i++){
    	var answer = $("#answer"+i).val();
    	var checked = $("input[type=radio][name=question-item"+ i +"]:checked");
    	if(answer == checked.val()){
    		//回答正确应该把这道题发送给后台做记录，后台自动抽取下一道题
		}else{
            checked.parent("div").css("color","red");
            checked.parent("div").css("font-size","18px");
            checked.parent("div").css("font-weight","bold");
		}
	}
}

//实验测评中的测题答案判断
function isExpTestCorrect(){
    var count = $("#questionList").children("div").length;
    $(".questionItem_correct").css("color","green");
    $(".questionItem_correct").css("font-size","18px");
    $(".questionItem_correct").css("font-weight","bold");
    //只有所有选择测题都正确，这道实验测试才算通过
    var flag = true;
    for(var i = 0; i < count; i++){
        var answer = $("#answer"+i).val();
        var checked = $("input[type=radio][name=question-item"+ i +"]:checked");
        if(answer != checked.val()){
            checked.parent("div").css("color","red");
            checked.parent("div").css("font-size","18px");
            checked.parent("div").css("font-weight","bold");
            flag = false;
            //回答错误则将这个实验信息传至后台，然后推荐实验
        }
    }
    if(flag == false){
        $.ajax({
            url: "/test/recommExp",
            type: "POST",
            data:{
            	exp_id:$("#experiment_id").val(),
                class1:$("#class1").text(),
            },
            success:function(data){
                if(data.code == 0){
                    var expList = data.data;
                    var expLink = "";
                    var thisExpId = $("#experiment_id").val();
                    var thisExpName = $(".exp_name").text();
                    for(var i = 0; i < expList.length; i++){
                    	expLink = expLink + "<div class='recommLink'><a class='recommLink' href='/experiment/"+expList[i].exp_id+"'>"+expList[i].exp_name+"</a></div>";
					}

					expLink = expLink + "<div class='recommLink'><a href='/experiment/"+thisExpId+"'>"+thisExpName+"</a></div>"
                    $("#recommLayer").append(expLink);
                    layer.open({
                        title:"实验推荐",
                        type:1,
                        content:$("#recommLayer"),
                        area: ["500px", "250px"],
                        skin:"layer-btn",
                        btn: ["取消"],
                    });
                }else if(data.code==500210){
                    window.location.href="/login";
                } else{
                    layer.msg(data.msg);
                }
            },
            error:function(){
                layer.closeAll();
            }
        });
	}else {
        //回答正确应该把这个实验发送给后台持久化，并放入缓存，避免下次重复选题，后台自动选取下一道题
		var testClass = $("#class1").text();
        $.ajax({
            url: "/test/next_exp/"+$("#experiment_id").val()+"?class1="+testClass,
            type: "POST",
            success:function(data){
                if(data.code == 0){
                	if(data.data == null){
                		alert("恭喜你，已经通过此类型下所有实验测试");

					}else{
                        if(confirm("通过本实验测试，是否进行下一道？")){
                            document.location.href = "/test/test_exp?testClass="+testClass+"&testId="+data.data;
                        }
					}
                }else if(data.code==500210){
                    layer.msg("请先登录");
                } else{
                    layer.msg(data.msg);
                }
            },
            error:function(){
                layer.closeAll();
            }
        });
	}

}
//当前用户是否有正在运行的虚拟机
function vm_isRunning() {
    $.ajax({
        url: "/experiment/vm_isRunning",
        type: "POST",
        success:function(data){
            if(data.code == 0){
            	if(data.data == 'true'){
            		$("#addexp-button").hide();
            		$("#endexp-button").show();
				}else{
                    $("#addexp-button").show();
                    $("#endexp-button").hide();
				}
            }else if(data.code==500210){
                //window.location.href="/login";
            } else{
                layer.msg(data.msg);
            }
        },
        error:function(){
            layer.closeAll();
        }
    });
}

//监听事件
function examTimeScroll(){
	$(window).on("scroll",function(){
		if($(window).scrollTop() > 418){
			$(".exp_menu_list").css({"position":"relative"});
		}else{
			$(".exp_menu_list").css({"position":"relative"});
		}
	});
}

function experimentClick(){
	
	//菜单栏点击事件
	$(".exp_menu_list li").live("click",function(){
		menuSlide($(this).index());
		clearDate();
		$(".main_list").children(".exp").hide();
		$(".main_list").children("#"+$(this).attr("id")+"_list").show();
		
	});
	
	//打开新的指导书页面
	$(".fullscreen").click(function(){
		window.open("/pages/registerUser/guidebookHtml.jsp?ceid="+ceid);
	})
	
	//学习资源视频点击事件
	$(".exp_video").live("click",function(){
		videoShow();
		$(".videoList").find("p").eq(0).trigger("click");
	})
	
	//视频切换点击事件
	$(".videoList p").live("click",function(){
		$(this).parent().find("p").css("color","#333333");
		$(this).css("color","#0f7afe");
		var wareid = $(this).attr("id");
		var warename = $(this).attr("data-name");
		var wareprovider = $(this).attr("data-provider");
		var warenums = parseInt($(this).attr("data-videoNum"))+1;
		$(".bg-videodiv").find(".videoName").html(warename);
		$(".bg-videodiv").find(".videoprovider i").html(wareprovider);
		$(".bg-videodiv").find(".videoNum i").html(warenums);
		$(this).attr("data-videoNum",warenums);
		getVideoId(ecid,"#playerDiv","770px","440px","RU",wareid);
	})
	
	//学习资源视频关闭点击事件
	$("#fade").live("click",function(){
		videoHide();
	});
	
	//添加笔记
	$(".addnotes_btn").click(function(){
		var notecontent = $("#notes_editor_text").val().trim();
		if(checlogin()){
			if(notecontent == ""){
				$(".addnotes_btn").parent().find(".error-message").html("笔记内容不能为空！");
			}else{
				if(ceid != ""){
					addNotes(notecontent,ceid);
				}else{
					$(".addnotes_btn").parent().find(".error-message").html("请购买后发表笔记 ！");
				}
			}
		}else{
			window.open("/loginLab.do","_blank");
		}
	});
	
	//收起或展开点击事件
	$(".exptaskdiv").find(".unfold").click(function(){
		var state = $(this).data("state");
		var guidancebooktitle = $(".guidancebookList").find(".guidancebooktitle");
		var guidancebookcontent = $(".guidancebookList").find(".guidancebookcontent");
		if(state == true || state == undefined){
			$(this).data("state",false);
			$(guidancebookcontent).slideUp('normal');
			$(guidancebooktitle).addClass("bgUnfold");
		}else{
			$(this).data("state",true);
			$(guidancebookcontent).slideDown('normal');
			$(guidancebooktitle).removeClass("bgUnfold");
		}
	})
	
	//单个收起或展开点击事件
	$(".guidancebooktitle").live("click",function(){
		var guidancebookcontent = $(this).parent().find(".guidancebookcontent");
		if($(guidancebookcontent).is(':hidden') == true){
			$(guidancebookcontent).slideDown('normal');
			$(this).removeClass("bgUnfold");
		}else{
			$(guidancebookcontent).slideUp('normal');
			$(this).addClass("bgUnfold");
		}
	})
	
	//添加提问
	$(".addquestion_btn").click(function(){
		var questioncontent = $("#question_editor_text").val().trim();
		if(checlogin()){
			if(questioncontent == ""){
				$(".addquestion_btn").parent().find(".error-message").html("提问内容不能为空！");
			}else{
				if(ceid != ""){
					addQuizs(questioncontent,ceid);
				}else{
					$(".addquestion_btn").parent().find(".error-message").html("请购买后发表提问！");
				}
			}
		}else{
			window.open("/loginLab.do","_blank");
		}
	})
	
	//问答点赞
	$(".questions_menu").find(".praise-s img").live("click",function(){
		var flag = $(this).parent().parent().parent().data("praiseFlag");
		if(checlogin()){
			if(flag){
				deletePraises($(this).parent().parent().parent().attr("id"),this);
			}else{
				addPraises($(this).parent().parent().parent().attr("id"),this);
			}
		}else{
			window.open("/loginLab.do","_blank");
		}
	})
	
	//回复点击事件
	$(".evaluate_menu").find(".questions-s img").die("click").live("click",function(){
		var assmentId = $(this).parent().parent().parent().attr("id");
		var num = $(this).parent().attr("data-num");
		if(num > 0){
			queryContentByAssId(assmentId,this);
		}
	});
	
	//展示评论回复框
	$(".reply-btn").live("click",function(){
		$(this).parent().find(".reply-editor").remove();
		replyEditorVray(this,$(this).parent().parent().find(".evaluate_name").html())
	})
	
	//评论回复点击事件
	$(".replyeditor-btn").live("click",function(){
		var replyContent = $(this).parent().find("#reply_editor_text").val();
		var assmentId = $(this).parent().parent().parent().attr("id");
		var ecid = $(this).parent().parent().find(".evaluate_source").attr("id");
		if(checlogin()){
			if(replyContent == ""){
				$(this).parent().find(".error-message").html("回复内容不能为空！");
			}else{
				insertReply(assmentId,replyContent,ecid,this);
			}
		}else{
			window.open("/loginLab.do","_blank");
		}
	})
	
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
	
	/*$("#Inviter_Q").Twitter({
		ajaxUrl:"queAns!queryTweerUserInfo.action",
		loadCallBack:createUserInfo, 
		loadType:false
	});*/
	
	//收藏实验点击事件
	$(".collect").find("i").click(function(){
		if(checlogin()){
			if($(this).data("state")){ 
				//true 添加过  
				delCollectionInfo(ecid);
			}else{
				//false未添加
				addCollectionInfo(ecid);
			}
		}else{
			window.open("/loginLab.do","_self");
		}
		
	})
	//内测实验回复点击事件
	$(".replybetaeditor-btn").live("click",function(){
		var replyContent = $("#replybeta_editor_text").val();
		var assmentId = $(this).parent().parent().parent().attr("id");
		if(checlogin()){
			if(replyContent == ""){
				$(this).parent().find(".error-message").html("回复内容不能为空！");
			}else{
				addBetaReplay(assmentId,replyContent,this);
			}
		}else{
			window.open("/loginLab.do","_blank");
		}
	})
	
	//视频以学点击事件
	$("#learnbtn").click(function(){
		if(checlogin()){
			if($("#expbuy").val() == "true"){
				setExpState(1);
				$("#learnbtn").html("已学过")
				$("#learnbtn").attr("disabled","disabled");
				$("#learnbtn").unbind();
			}
		}
	})


	//创建考试点击事件
	$(".questionsbeginBtn").click(function(){
		createStuExam();
	})
	
	//继续答题点击事件
	$(".questionscontinueBtn").click(function(){
		continueQue();
	})
	
	//重新答题点击事件
	$(".questionsagainBtn").live("click",function(){
		createStuExam();
	})
	
	//下一题点击事件
	$(".submitanswerBtn").live("click",function(){
		var examInstanceId = $(this).attr("examInstanceId");
		var examtype = $(this).attr("examtype");
		submitQue(examInstanceId,examtype);
	})
	
	//单选题点击事件
	$(".radio_li").die("click").live("click",function(){
		$(this).parent().find("input").removeAttr("checked");
		$(this).find("input").attr("checked","checked");
		$(this).parents("ul").find("li").removeClass("bluetext");
		$(this).addClass("bluetext");
	})
	
	//多选题点击事件
	$(".checkbox_li").die("click").live("click",function(){
		if($(this).find("input").attr("checked") == undefined){
			$(this).addClass("bluetext");
			$(this).find("input").attr("checked","checked");
		}else{
			if(!$(this).find("input").attr("checked")){
				$(this).addClass("bluetext");
				$(this).find("input").attr("checked","checked");
			}else{
				$(this).removeClass("bluetext");
				$(this).find("input").removeAttr("checked");
			}
		}
	})

	//购买实验模拟点击事件
	$("#addcour").live("click",function(){
		$("#addexp-button").trigger("click");
	})
}

var isLgnavTime;
function isVedeoHover(){
	$(".videoList-bg").hover(function(){
		clearTimeout(isLgnavTime);
		$(this).find(".videoList").show();
	},function(){
		isLgnavTime = setTimeout(function(){
			$(this).find(".videoList").hide();
		},200);
	});
	$(".videoList").hover(function(){
		clearTimeout(isLgnavTime);
	},function(){
		$(this).hide();
	});
}

function createUserInfo(data){
	if($(data).attr("result") == "success"){
		var mes = $(data).attr("message");
		return mes;
	}else{
		return "";
	}
}

//展示视频
function videoShow(){
	$(".bg").show();
	$(".bg-videodiv").show();
}

//关闭视频
function videoHide(){
	$(".bg").hide();
	$(".bg-videodiv").hide();
	$("#newid_100").remove();
}

//菜单栏方法执行点击事件
function expimentmenu(){
	
	$(".exp_menu_list").find("#guidancebook").live("click",function(){
		//queryGuideId(ceid);
	})
	
	$(".exp_menu_list").find("#evaluate").die("click").live("click",function(event){
		if(expAssShow(ceid) == 1){
			$(".addevaluatediv").show();
		}else{
			$(".addevaluatediv").hide();
		}
		querySatisfied();
		queryAssTime();
		queryAssDiff();
		getAssContent(1,true);
	})
	
	$(".exp_menu_list").find("#questions").live("click",function(){
		queryQuestionByid(ecid,1,true);
	})
	
	$(".exp_menu_list").find("#notes").live("click",function(){
		queryNotesByEcid(ecid,1,true);
	})

	
	$(".exp_menu_list").find("#evaluateBeta").live("click",function(){
		if(expBetaAssShow(ceid) == "1"){
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
	$(".expLeftList").find(".hr").find("span").animate({left:left+"px"},250);
}

function clearDate(){
	//清除笔记数据
	$("#notes_editor_text").val("");
	$(".notes_editor").find(".error-message").html("");
	//清除问答数据
	$("#question_editor_text").val("");
	$(".question_editor").find(".error-message").html("");
	//清除评价数据
	$("#evaluate_editor_text").val("");
	$(".evaluate_editor").find(".error-message").html("");
	//清除内测评价
	$(".evaluateBeta_editordiv").find("textarea").val("");
	$(".addevaluateBetasdiv").find(".error-message").html("");
}

//笔记分页
function notes_pagination(){
	if(languageFirst == "English"){
		$('#notes_page').pagination({
			pageCount: notestotalPage,
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
				queryNotesByEcid(ecid,api.getCurrent(),false);
			}
		});
	}else{
		$('#notes_page').pagination({
			pageCount: notestotalPage,
			isHide: true,
			keepShowPN: true,
			count: 2,
			callback:function(api){
				window.scrollTo(0,418);
				queryNotesByEcid(ecid,api.getCurrent(),false);
			}
		});
	}
	
}

//问答分页
function questions_pagination(){
	if(languageFirst == "English"){
		$('#questions_page').pagination({
			pageCount: questionstotalPage,
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
				queryQuestionByid(ecid,api.getCurrent(),false);
			}
		});
	}else{
		$('#questions_page').pagination({
			pageCount: questionstotalPage,
			isHide: true,
			keepShowPN: true,
			count: 2,
			callback:function(api){
				window.scrollTo(0,418);
				queryQuestionByid(ecid,api.getCurrent(),false);
			}
		});
	}
	
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

//实验内测评价
function evaluateBeta_pagination(){
	if(languageFirst == "English"){
		$('#evaluateBeta_page').pagination({
			pageCount: evaluateBetatotalPage,
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
				queryBetaByEcid(ecid,api.getCurrent(),false);
			}
		});
	}else{
		$('#evaluateBeta_page').pagination({
			pageCount: evaluateBetatotalPage,
			isHide: true,
			keepShowPN: true,
			count: 2,
			callback:function(api){
				window.scrollTo(0,418);
				queryBetaByEcid(ecid,api.getCurrent(),false);
			}
		});
	}
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

//评论回复框展示
function replyEditorVray(obj,replyperson){
	var editorStr  = "<div class=\"reply-editor\">";
	editorStr += "<div class=\"replyName\">回复<span class=\"replyperson\">"+replyperson+"</span></div>";
	editorStr += "<textarea id=\"reply_editor_text\" rows=\"\" cols=\"\"></textarea>";
	editorStr += "<div class=\"replyeditor-btn\">回复</div>";
	editorStr += "<p class=\"error-message\"></p>";
	editorStr += "</div>";
	$(obj).after(editorStr);
}

//内测回复框展示
function replybetaEditorVray(obj,replyperson){
	var editorStr  = "<div class=\"replybeta-editor\">";
	editorStr += "<div class=\"replyName\">回复<span class=\"replyperson\">"+replyperson+"</span></div>";
	editorStr += "<textarea id=\"replybeta_editor_text\" rows=\"\" cols=\"\"></textarea>";
	editorStr += "<div class=\"replybetaeditor-btn\">回复</div>";
	editorStr += "<p class=\"error-message\"></p>";
	editorStr += "</div>";
	$(obj).after(editorStr);
}

/*********************************************************************************************************************/

/**
 * 获取相关推荐实验
 */
function queryRandExp(ecid){
	
	$.ajax({
		url:"newExp!queryRandExp.action",
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
	var expStr = "<li>";
	expStr += "<div class=\"cou_img\"><a href=\"expc.do?ec="+ecid+"\" target=\"_blank\"><img onerror=\"noCourseImg(this)\" src="+picture+"></a></div>";
	expStr += "<div class=\"cou_name\">"+ecname+"</div>";
	expStr += "</li>";
	$(".recommendList ul").append(expStr);
}

/**
 * 获取最新学习过该实验的人员
 * @param ecid
 */
function getNewStudy(ecid){
	
	$.ajax({
		url:"newExp!getNewStudy.action",
		data:{ecid:ecid},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("infos");
				if(mes != null){
					$(".study_people_list").empty();
					$(mes).each(function(i){
						var userId = $(this).attr("userId");
						var userName = $(this).attr("userName");
						var userHead = $(this).attr("userHead");
						getNewStudyVray(userId,userName,userHead,i);
					})
				}else{
					if(languageFirst == "English"){
						$(".study_people_list").html(noDateshow("Sorry, there's no result！"))
					}else{
						$(".study_people_list").html(noDateshow("暂无相关学习伙伴哦！",false))
					}
				}
			}
		},
		error : function(){
			
		}
	})
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
// function queryGuideId(ceid){
// 	$(".guidancebookList").empty();
// 	Loading($(".guidancebookList"),'guidancebook');
// 	$.ajax({
// 		url:"newExp!queryGuideByCeid.action",
// 		data:{ceid:ceid,ecid:ecid},
// 		type:"post",
// 		dataType:"json",
// 		async : true,
// 		complete:function(){
// 			removeLoading('guidancebook');
// 		},
// 		success : function(data){
// 			if($(data).attr("result") == "success"){
// 				var mes = $(data).attr("message");
// 				if(mes != null){
// 					$(mes).each(function(){
// 						var sectionId = $(this).attr("sectionId");
// 						var sectionName = $(this).attr("sectionName");
// 						var sectionText = $(this).attr("sectionText");
// 						queryGuideIdVray(sectionId,sectionName,sectionText);
// 					})
// 					PostbirdImgGlass.init({
// 					    domSelector:".guidancebookcontent img",
// 					    animation:true,
// 					});
// 					$(".guidancebookList img").css("height","auto");
// 				}else{
// 					$(".guidancebookList").html(noDateshow("指导书内容为空！"))
// 				}
// 			}else{
// 				if(languageFirst == "English"){
// 					$(".guidancebookList").html(noDateshow("Sorry, there's no result!"))
// 				}else{
// 					$(".guidancebookList").html(noDateshow("获取指导书失败，请稍后重试！"))
// 				}
// 			}
// 		},
// 		error : function(){
// 			$(".guidancebookList").html(noDateshow("获取指导书失败，请稍后重试！"))
// 		}
// 	})
// }

//数据渲染
function queryGuideIdVray(sectionId,sectionName,sectionText){
	var guideStr = "<div class=\"guidancebookdiv\" id=\""+sectionId+"\">";
	guideStr += "<div class=\"guidancebooktitle\" data-name=\"指导书标题\">"+sectionName+"</div>";
	guideStr += "<div class=\"guidancebookcontent\" data-name=\"指导书内容\">"+sectionText+"</div>";
	guideStr += "</div>";
	$(".guidancebookList").append(guideStr);
}
/**************************************************************答题******************************************************/
var testNum = $("#testNum").val();
var stateCode = $("#stateCode").val();
/**
 * 获取考试状态 查看是否有考试实例
 * @param ceid
 */
// function queryExpExamInfo(){
// 	$.ajax({
// 		url:"newStudyPageAction!queryExpExamInfo.action",
// 		data:{ceid:ceid},
// 		type:"post",
// 		dataType:"json",
// 		async : true,
// 		success:function(data){
// 			//下面进行数据渲染
// 			if($(data).attr("result") == "success"){
// 				var expStatus = $(data).attr("expState");
// 				var mes = $(data).attr("message");
// 				if(expStatus == 0){ //实验未开放
// 					if(mes == "noInstance"){
// 						$("#answer_list").children("div").hide();
// 						$("#answer_list").children(".questionsList").show();
// 						$("#answer_list").find(".questionsList").html(noDateshow("实验暂未开放！"))
// 					}else if(mes == "examFinish"){
// 						var info = $(data).attr("info");
// 						loadAllQue(info);
// 					}
// 				}else if(expStatus == 1 || expStatus == 2){//实验进行中或已完成
// 					if(mes == "noInstance"){
// 						//没有实例 询问是否需要答题
// 						if(testNum > 0){
// 							showIsStartQue();
// 						}else{
// 							$("#answer_list").children("div").hide();
// 							$("#answer_list").children(".questionsList").show();
// 							$("#answer_list").find(".questionsList").html(noDateshow("该实验暂无试题！"));
// 						}
// 					}else if(mes == "needWarn"){
// 						//需要警告是否继续答题
// 						var info = $(data).attr("info");
// 						var queNo = info.questionNo;
// 						showIsContinueQue(queNo);
// 					}else if(mes == "showQue"){
// 						//直接展示试题
// 						var info = $(data).attr("info");
// 						showQuestionContent(info);
// 					}else if(mes == "examFinish"){
// 						//直接展示试题
// 						var info = $(data).attr("info");
// 						loadAllQue(info);
// 					}
// 				}
// 			}else{
// 				$("#answer_list").children("div").hide();
// 				$("#answer_list").children(".questionsList").show();
// 				$("#answer_list").find(".questionsList").html(noDateshow("试题获取失败！"))
// 			}
// 		},
// 		error:function() {
// 			jAlert("服务器响应错误！", null, null, 5000, null,"error",null,getPh());
// 		}
// 	});
// }

/**
 * 创建试题场次
 */
// function createStuExam(){
// 	$.ajax({
// 		url:"newStudyPageAction!createStuExptExam.action",
// 		data:{ceid:ceid},
// 		type:"post",
// 		dataType:"json",
// 		async : true,
// 		success:function(data){
// 			//下面进行数据渲染
// 			if($(data).attr("result") == "success"){
// 				queryExpExamInfo();
// 			}else{
// 				$("#answer_list").children("div").hide();
// 				$("#answer_list").children(".questions").show();
// 				//$("#answer_list").find(".questionsList").html(noDateshow("创建试题场次失败！"));
// 			}
// 		},
// 		error:function() {
// 			//系统响应错误
// 			jAlert("服务器响应错误！", null, null, 5000, null,"error",null,getPh());
// 		}
// 	});
// }

/**
 * 继续答题
 */
function continueQue(){
	$.ajax({
		url:"newStudyPageAction!queryReplyingQuestion.action",
		data:{ceid:ceid},
		type:"post",
		dataType:"json",
		async : true,
		success:function(data){
			//下面进行数据渲染
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if(mes == "examFinish"){
					//直接展示全部试题
					var info = $(data).attr("info");
					loadAllQue(info);
				}else if(mes == "showQue"){
					//直接展示当前试题
					var info = $(data).attr("info");
					showQuestionContent(info);
				}
			}else{
				jAlert("系统异常！", null, null, 5000, null,"error",null,getPh());
			}
		},
		error:function() {
			//系统响应错误
			jAlert("服务器响应错误！", null, null, 5000, null,"error",null,getPh());
		}
	});
}

/**
 * 提交答案
 * @param instanceId
 */
function submitQue(instanceId,examtype){
	//获取选择的试题id
	var i = 0;
	var dataStr = '{';
	if(examtype == 2){ //填空
		var content = $(".questionsdiv").find(".fill-box input").val();
		if(content != ""){
			dataStr += '"opList[0]":"'+content+'",';
		}else{
			jAlert("请输入答案内容！", null, null, 5000, null,"error",null,getPh());
			return;
		}
	}else{ //单选或多选
		$(".answerlist li").find("input").each(function(){
			if($(this).attr("checked")){
				dataStr += '"opList['+i+']":"'+$(this).parents("li").attr("name")+'",';
				i++;
			}
		});
	}
	dataStr += '"ceid":"'+ceid+'",';
	dataStr += '"instanceId":"'+instanceId+'"}';
	if(examtype != 2){
		if(i <= 0){
			//jAlert("未选择答案！", null, null, 5000, null,"error",null,getPh());
			return;
		}
	}
	$.ajax({
		url:"newStudyPageAction!submitQueAnswer.action",
		data:jQuery.parseJSON(dataStr),
		type:"post",
		dataType:"json",
		async : true,
		success:function(data){
			//下面进行数据渲染
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if(mes == "examFinish" ||  mes == "teacherEnd"){
					//直接展示试题
					var info = $(data).attr("info");
					loadAllQue(info);
					if(mes == "teacherEnd"){
						jAlert("试题已经结束！", null, null, 5000, null,"error",null,getPh());
					}
					var coinInfo = $(data).attr("coinInfo");
					if(coinInfo != ""){
						jAlert(coinInfo, null, null, 5000, null,"info",null,getPh());
					}
				}else if(mes == "showQue"){
					//直接展示试题
					var info = $(data).attr("info");
					showQuestionContent(info);
				}
			}else{
				jAlert("答案提交失败！", null, null, 5000, null,"error",null,getPh());
			}
		},
		error:function() {
			//系统响应错误
			jAlert("服务器响应错误！", null, null, 5000, null,"error",null,getPh());
		}
	});
}

//询问是否开始答题
// function showIsStartQue(){
// 	$("#answer_list").children("div").hide();
// 	$("#answer_list").find(".questionsbegin").show();
// }
//
// //询问是否继续答题
// function showIsContinueQue(queNo){
// 	$("#answer_list").children("div").hide();
// 	$("#answer_list").find(".questionscontinue").show();
// 	$("#answer_list").find(".topichint").html("您上次回答道第"+queNo+"题，是否继续？");
// }

//渲染当前试题
// function showQuestionContent(objData){
// 	var totalCount = objData.totalCount;//总数量
// 	var queNo = objData.orderNo;//当前题
// 	var examInstanceId = objData.questionInstanceId;//试题实例id
// 	var queContent = objData.questionContent;//试题内容
// 	var type = objData.type;//类型 0-单选  1--多选 2--填空
// 	var optionList = objData.list;
// 	var orderNo = objData.orderNo;//序号
// 	//下面进行试题渲染
// 	if(type == 0){
// 		var str = "<div class=\"questionsdiv\">";
// 		str += "<p class=\"issuecontent\"><span>"+orderNo+"、<img class=\"issueType\" src=\"../../img/expanipulator/radio-icon.png\"/></span>"+queContent+"</p>";
// 		str += "<ul class=\"answerlist\">";
// 		$(optionList).each(function(i){
// 			str += "<li class=\"radio_li\" name=\""+$(this).attr("oid")+"\"><span><input id=\"radio_"+i+"\" type=\"radio\" name=\"radio\"/><label for=\"radio_"+i+"\"></label>"+pArr[i]+"、</span>"+$(this).attr("content")+"</li>";
// 		});
// 		str += "</ul>";
// 		str += "</div>";
// 	}else if(type == 1){
// 		var str = "<div class=\"questionsdiv\">";
// 		str += "<p class=\"issuecontent\"><span>"+orderNo+"、<img class=\"issueType\" src=\"../../img/expanipulator/multiple-icon.png\"/></span>"+queContent+"</p>";
// 		str += "<ul class=\"answerlist\">";
// 		$(optionList).each(function(i){
// 			str += "<li class=\"checkbox_li\" name=\""+$(this).attr("oid")+"\"><span><input id=\"checkbox_"+i+"\" type=\"checkbox\" name=\"checkbox\"/><label for=\"checkbox_"+i+"\"></label>"+pArr[i]+"：</span>"+$(this).attr("content")+"</li>";
// 		});
// 		str += "</ul>";
// 		str += "</div>";
// 	}else if(type == 2){
// 		var str = "<div class=\"questionsdiv\">";
// 		str += "<p class=\"issuecontent\"><span>"+orderNo+"、<img class=\"issueType\" src=\"../../img/expanipulator/filling-icon.png\"/></span>"+queContent+"</p>";
// 		str += "<div class=\"fill-box\"><input type=\"text\" placeholder=\"请在此处添加答案\"/></div>";
// 		str += "</div>";
// 	}
// 	if(orderNo == totalCount){
// 		str += "<div examInstanceId=\""+examInstanceId+"\" examtype=\""+type+"\" class=\"submitanswerBtn\">提交</div>";
// 	}else{
// 		str += "<div examInstanceId=\""+examInstanceId+"\" examtype=\""+type+"\" class=\"submitanswerBtn\">下一题</div>";
// 	}
// 	$("#answer_list").find(".questionsList").html(str);
// 	$("#answer_list").children("div").hide();
// 	$("#answer_list").find(".questionsList").show();
// }

//渲染全部试题
// function loadAllQue(obj){
// 	if(obj != null && obj != ""){
// 		$("#answer_list").find(".questionsList").empty();
// 		var qlist = $(obj).attr("slist");
// 		var str = "<div class=\"questionscontinue-div\">";
// 		str += "<p class=\"exp_name\">课后习题</p>";
// 		str += "<p class=\"topichint\"></p>";
// 		str += "<div class=\"questionsagainBtn\">重新答题</div>";
// 		str += "</div>";
// 		$("#answer_list").find(".questionsList").append(str);
// 		$(qlist).each(function(){
// 			//试题进行渲染
// 			var questionId = $(this).attr("questionId");
// 			var orderNo = $(this).attr("orderNo");
// 			var content = $(this).attr("questionContent");
// 			var right = $(this).attr("rightState");
// 			var type = $(this).attr("type");
// 			var str = "<div class=\"questionsdiv\">";
// 			//渲染题目
// 			if(type == 0){
// 				str += "<p class=\"issuecontent\"><span>"+orderNo+"、<img class=\"issueType\" src=\"../../img/expanipulator/radio-icon.png\"/></span>"+content+"</p>";
// 			}else if(type == 1){
// 				str += "<p class=\"issuecontent\"><span>"+orderNo+"、<img class=\"issueType\" src=\"../../img/expanipulator/multiple-icon.png\"/></span>"+content+"</p>";
// 			}else if(type == 2){
// 				str += "<p class=\"issuecontent\"><span>"+orderNo+"、<img class=\"issueType\" src=\"../../img/expanipulator/filling-icon.png\"/></span>"+content+"</p>";
// 			}
// 			//渲染是否正确
// 			if(right == 1){
// 				str += "<img class=\"rightIcon\" src=\"../../img/expanipulator/right.png\"/>";
// 			}
// 			if(type != 2){ //非填空题
// 				//渲染答案
// 				var optionList = $(this).attr("olist");
// 				str += "<ul class=\"answerlist\">";
// 				$(optionList).each(function(i){
// 					var oid = $(this).attr("oid");
// 					var ocontent = $(this).attr("content");
// 					str += "<li name=\""+oid+"\" style=\"padding-left:25px;\"><span>"+pArr[i]+"：</span>"+ocontent+"</li>";
// 				})
// 				str += "</ul>";
// 				str += "</div>";
// 				$("#answer_list").find(".questionsList").append(str);
//
// 				//下面进行自己答的试题渲染
// 				var objs = $("#answer_list").find(".questionsList").children().last();
// 				var ownAnswer = $(this).attr("ownAnswer");
// 				$(ownAnswer).each(function(){
// 					objs.find("li[name='"+$(this)[0]+"']").addClass("bluetext");
// 				});
//
// 				//下面渲染正确的答案
// 				/*var rightAnswer = $(this).attr("rightAnswer");
// 				var astr = "<div class=\"right_answer\">本题正确答案为";
// 				$(rightAnswer).each(function(){
// 					$(this)[0];
// 					var i = objs.find("li").index(objs.find("li[name='"+$(this)[0]+"']"));
// 					astr += " "+pArr[i];
// 				});
// 				astr += "</div>";
// 				objs.append(astr);*/
// 			}else{ //填空题
//
// 				//渲染我的答案
// 				var ownAnswer = $(this).attr("ownAnswer");
// 				var rightAnswer = $(this).attr("rightAnswer");
// 				str += "<div class=\"fill-box bluetext\" style=\"height:25px\">"+$(ownAnswer).get(0)+"</div>";
// 				$("#answer_list").find(".questionsList").append(str);
//
// 				/*var objs = $("#answer_list").find(".questionsList").children().last();
// 				//下面渲染正确的答案
// 				var astr = "<div class=\"right_answer\">本题正确答案为   "
// 				$(rightAnswer).each(function(i){
// 					if(i == 0){
// 						astr+= ""+$(this).get()+" ";
// 					}else{
// 						astr+= "或   "+$(this).get()+" ";
// 					}
// 				})
// 				astr+= "</div>";
// 				objs.append(astr);*/
//
// 			}
//
// 		});
// 		$("#answer_list").children("div").hide();
// 		$("#answer_list").find(".questionsList").show();
// 	}
// }


/**************************************************************实验评价******************************************************/
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
/*function getAssContent(pageNum,flag){
	$(".evaluateList").empty();
	$("#evaluate_page").hide()
	Loading($(".evaluateList"),'evaluate');
	$.ajax({
		url:"newExp!getExpAss.action",
		data:{ecid:ecid,pageNum:pageNum},
		type:"post",
		dataType:"json",
		async : true,
		complete:function(){
			removeLoading('evaluate');
		},
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				evaluatetotalPage = $(data).attr("totalpage");
				if(mes != null){
					$(mes).each(function(){
						var userPicture = $(this).attr("userPicture");
						var createTime = $(this).attr("createTime");
						var ecid = $(this).attr("ecid");
						var assessmentId = $(this).attr("assessmentId");
						var userId = $(this).attr("userId");
						var assessment = $(this).attr("assessment");//内容
						var expName = $(this).attr("expName");
						var risk = $(this).attr("risk");//评价
						var replyNum = $(this).attr("rissk");//回复数量
						var userName = $(this).attr("userName");
						var replyFlag = $(this).attr("replyFlag")//是否有回答权限 true有 false没有
						getAssContentVray(userPicture,createTime,ecid,assessmentId,userId,assessment,expName,risk,replyNum,userName,replyFlag);
					})
				}else{
					if(languageFirst == "English"){
						$(".evaluateList").html(noDateshow("Sorry, there's no result!"));
					}else{
						$(".evaluateList").html(noDateshow("该实验下暂无实验评价呦！"));
					}
				}
				if(flag){evaluate_pagination();}
				if(evaluatetotalPage>1){$("#evaluate_page").show()}
			}else{
				$(".evaluateList").html(noDateshow("数据异常，请稍后重试！"));
			}
		},
		error : function(){
			$(".evaluateList").html(noDateshow("数据异常，请稍后重试！"));
		}
	})
}
*/
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
	$.ajax({
		url:"newExp!insertReply.action",
		data:{assId:assmentId,replyContent:replyContent,ecid:ecid},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				queryContentByAssId(assmentId,$(obj).parent().parent().find(".questions-s img"));
				var num = $(obj).parent().parent().find(".questions-s").text();
				$(obj).parent().parent().find(".questions-s").html("<img src=\"/img/coursePage/reply-icon.png\" title=\"点击展开回复列表\">"+(parseInt(num)+1));
				$(obj).parent().remove();
			}else{
				if(mes == "noAut"){
					$(obj).parent().find(".error-message").html("抱歉，您的权限不足，回复失败！");
				}
			}
		},
		error : function(){
			
		}
	})
	
}

/**
 * 添加实验评价
 * @param ceid
 * @param assessmentTemp
 * @param difficulty
 * @param completion
 * @param risk
 */
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
 * 查看是否展示评价框
 * @param ceid
 * @returns
 */
function expAssShow(ceid){
	var date="";
	$.ajax({
		url:"courseExp!expAssShow.action",
		data:{ceid:ceid},
		type:"post",
		dataType:"json",
		async : false,
		success : function(data){
			date = $(data).attr("message");
		},
		error : function(){
		}
	})
	return date;
}
function saveBateFeedBackInfo(ceid,ecid){
	var ContentQuality = $("#evaluateBeta_editor_quality").val().trim();
	var PrincipleDescription = $("#evaluateBeta_editor_describe").val().trim();
	var KnowledgeQuantity = $("#evaluateBeta_editor_knowledge").val().trim();
	var GuideStructure = $("#evaluateBeta_editor_rationality").val().trim();
	var GuideEnvironment = $("#evaluateBeta_editor_consistency").val().trim();
	var OverallEvaluation = $("#evaluateBeta_editor_evaluation").val().trim();
	if(!isNull(ContentQuality)){
		$(".addevaluateBetasdiv").find(".error-message").html("实验内容质量不能为空！");
		return;
	}else{
		if(!isLength(ContentQuality)){
			$(".addevaluateBetasdiv").find(".error-message").html("实验内容质量长度大于20个字符！");
			return;
		}else{
			$(".addevaluateBetasdiv").find(".error-message").html("");
		}
	}
	
	if(!isNull(PrincipleDescription)){
		$(".addevaluateBetasdiv").find(".error-message").html("实验原理描述不能为空！");
		return;
	}else{
		if(!isLength(PrincipleDescription)){
			$(".addevaluateBetasdiv").find(".error-message").html("实验原理描述长度大于20个字符！");
			return;
		}else{
			$(".addevaluateBetasdiv").find(".error-message").html("");
		}
	}
	
	if(!isNull(KnowledgeQuantity)){
		$(".addevaluateBetasdiv").find(".error-message").html("实验知识量不能为空！");
		return;
	}else{
		if(!isLength(KnowledgeQuantity)){
			$(".addevaluateBetasdiv").find(".error-message").html("实验知识量长度大于20个字符！");
			return;
		}else{
			$(".addevaluateBetasdiv").find(".error-message").html("");
		}
	}
	
	if(!isNull(GuideStructure)){
		$(".addevaluateBetasdiv").find(".error-message").html("指导书结构的合理性不能为空！");
		return;
	}else{
		if(!isLength(GuideStructure)){
			$(".addevaluateBetasdiv").find(".error-message").html("指导书结构的合理性长度大于20个字符！");
			return;
		}else{
			$(".addevaluateBetasdiv").find(".error-message").html("");
		}
	}
	
	if(!isNull(GuideEnvironment)){
		$(".addevaluateBetasdiv").find(".error-message").html("指导书与环境的一致性不能为空！");
		return;
	}else{
		if(!isLength(GuideEnvironment)){
			$(".addevaluateBetasdiv").find(".error-message").html("指导书与环境的一致性长度大于20个字符！");
			return;
		}else{
			$(".addevaluateBetasdiv").find(".error-message").html("");
		}
	}
	
	if(!isNull(OverallEvaluation)){
		$(".addevaluateBetasdiv").find(".error-message").html("整体评价不能为空！");
		return;
	}else{
		if(!isLength(OverallEvaluation)){
			$(".addevaluateBetasdiv").find(".error-message").html("整体评价长度大于20个字符！");
			return;
		}else{
			$(".addevaluateBetasdiv").find(".error-message").html("");
		}
	}
	$.ajax({
		url:"betaAction!saveBateFeedBackInfo.action",
		dataType:"json",
		type: "post",
		data: {
			"betaBill.ceid":ceid,
			"betaBill.contentQuality":ContentQuality,
			"betaBill.principleDescription":PrincipleDescription,
			"betaBill.KnowledgeQuantity":KnowledgeQuantity,
			"betaBill.GuideStructure":GuideStructure,
			"betaBill.GuideEnvironment":GuideEnvironment,
			"betaBill.overallEvaluation":OverallEvaluation},
		async : true,
		success:function(data){
			if($(data).attr("result") == "success") {
				$(".addevaluateBetasdiv").remove();
				var cont = parseInt($(".exp_menu_list #evaluateBeta span span").text());
				$(".exp_menu_list #evaluateBeta span span").text(cont+1);
				queryBetaByCeidAndUserId(ceid);
				queryBetaByEcid(ecid,1,true);
			}else{
				
			}
		},
	});
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

/**
 * 查看是否展示内测评价框
 * @param ceid
 * @returns
 */
function expBetaAssShow(ceid){
	var date;
	$.ajax({
		url:"courseExp!expBetaAssShow.action",
		data:{ceid:ceid},
		type:"post",
		dataType:"json",
		async : false,
		success : function(data){
			date = $(data).attr("message");
		},
		error : function(){
		}
	})
	return date;
}

/**
 * 判断是否内测实验的回复权限
 * @param ecid
 * @returns
 */
function queryReplyBtn(ecid){
	
	$.ajax({
		url:"betaAction!queryReplyBtn.action",
		data:{ecid:ecid},
		type:"post",
		dataType:"json",
		async : false,
		success : function(data){
			showBetarepyly = $(data).attr("message");
		},
		error : function(){
		}
	})
}

/**
 * 查询自己的内测评价
 * @param ceid
 */
function queryBetaByCeidAndUserId(ceid){
	var userId = $("#sessionuuid").val();
	$.ajax({
		url:"betaAction!queryBetaByCeidAndUserId.action",
		dataType:"json",
		type: "post",
		data: {ceid:ceid,UserId:userId},
		async : true,
		success:function(data){
			$("#meBetaList").empty();
			if($(data).attr("result") == "success") {
				var mes = $(data).attr("message");
				if(mes != "" && mes != null){
					var createTime = sqlDate2Str($(mes).attr("createTime"));
					var headImg = $(mes).attr("headImg");
					var userName = $(mes).attr("userName");
					var userId = $(mes).attr("userId");
					var allEvaluation = $(mes).attr("allEvaluation");
					var billId = $(mes).attr("billId");
					var countReply = $(mes).attr("countReply");
					var str = BetaVray(createTime,headImg,userName,userId,allEvaluation,billId,countReply);
					$("#meBetaList").append(str);
					$(".evaluateBetaList").find("#"+billId).find(".replyBetaNum img").trigger("click");
				}
			}
		},
	});
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

/**
 * 回复内测实验评价
 * @param bbid
 * @param content
 */
function addBetaReplay(bbid,content,obj){
	var userId = $("#sessionuuid").val();
	$.ajax({
		url:"betaAction!addBetaReplay.action",
		data:{"betaReply.bbid":bbid,"betaReply.content":content,"betaReply.bbCreator":userId},
		dataType: "json",
		type: "post",
		async : true,
		success:function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if($(data).attr("result") == "success"){
					getBetaReplyInfoByBid(bbid,$(obj).parent().parent().find(".replyBetaNum img"));
					var num = $(obj).parent().parent().find(".replyBetaNum").text();
					$(obj).parent().parent().find(".replyBetaNum").html("<img src=\"/img/coursePage/reply-icon.png\" title=\"点击展开回复列表\">"+(parseInt(num)+1));
					$(obj).parent().remove();
				}else{
					if(mes == "noAut"){
						$(obj).parent().find(".error-message").html("抱歉，您的权限不足，回复失败！");
					}
				}
			}
		},
		error:function(){
			alert("系统繁忙，请稍后重试！");
		}
	});
}


/*********************************************************问答****************************************************************/
/**
 * 查询问答内容
 */
function queryQuestionByid(ecid,pageNum,flag){
	$(".answersList").empty();
	Loading($(".answersList"),'questions');
	$("#question_editor_text").val("");
	$("#questions_page").hide();
	$.ajax({
		url:"queAns!queryQuestionByid.action",
		data:{ecid:ecid,pageNum:pageNum},
		type:"post",
		dataType:"json",
		async : true,
		complete:function(){
			removeLoading('questions');
		},
		success : function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				questionstotalPage = $(data).attr("totalpage");
				if(mes != null){
					$(mes).each(function(){
						var headImg = $(this).attr("headImg");
						var content = $(this).attr("content");
						var createTime = $(this).attr("createTime");
						var qid = $(this).attr("qid");
						var userName = $(this).attr("userName");
						var countAns = $(this).attr("countAns");
						var countPri = $(this).attr("countPri");
						var praiseFlag = $(this).attr("falg");
						var userId = $(this).attr("userId");
						//被邀请人 
						var inviterName = $(this).attr("inviterUserName");
						var inviterId = $(this).attr("inviterUserId");
						queryQuestionByidVray(qid,headImg,userName,content,createTime,countAns,countPri,praiseFlag,userId,inviterId,inviterName);
					})
				}else{
					if(languageFirst == "English"){
						$(".answersList").html(noDateshow("Sorry, there's no result!"));
					}else{
						$(".answersList").html(noDateshow("该实验下暂无实验问答呦！"));
					}
				}
				if(flag){questions_pagination();}
				if(questionstotalPage>1){$("#questions_page").show()}
			}else{
				$(".answersList").html(noDateshow("数据异常，请稍后重试！"));
			}
		},
		error : function(){
			$(".answersList").html(noDateshow("数据异常，请稍后重试！"));
		}
	})
}

function queryQuestionByidVray(qid,headImg,userName,content,createTime,countAns,countPri,praiseFlag,userId,inviterId,inviterName){
	var inviter = "";
	if(inviterId != "" && inviterId != null){
		inviter = "<a href=\"/profile.do?u="+inviterId+"\" target=\"_blank\">@"+inviterName+" </a>";
	}
	var conIndexoOf = 4;
	var questionStr = "<div id=\""+qid+"\" class=\"questionsdiv\">"
	questionStr += "<div class=\"head_img\"><a href=\"profile.do?u="+userId+"\" target=\"_blank\"><img onerror=\"noHeadImg(this)\" src=\""+headImg+"\"/></a></div>";
	questionStr += "<div class=\"questions_name\">"+userName+"</div>";
	var contentIndex1 = content.indexOf("</a>");
	if(contentIndex1 < 0){
		contentIndex1 = content.indexOf("<\/a>");
		if(contentIndex1 < 0){
			conIndexoOf = 0
		}
	}
	var contentIndex2 = content.indexOf("<a href='pages/profile.jsp?");
	var content1 = "";
	var content2 = "";
	if(content.indexOf("<a href='pages/profile.jsp?") > -1){
		content1 = content.substring(0,contentIndex2);
		content2 = content.substring(contentIndex1+conIndexoOf,content.length);
		content = content1 + content2;
	}
	questionStr += "<div class=\"questions_content\">"+inviter+"<a style=\"color:#555555;\" href=\"/pages/answersDetails.html?qid="+qid+"\" target=\"_blank\">"+content+"</a></div>";
	questionStr += "<div class=\"questions_menu\">";
	if(languageFirst == "English"){
		questionStr += "<span class=\"questions_time\">Time："+dateStrTime(sqlDate2Str(createTime))+"</span>";
	}else{
		questionStr += "<span class=\"questions_time\">时间："+dateStrTime(sqlDate2Str(createTime))+"</span>";
	}
	questionStr += "<span class=\"questions-s\"><img src=\"/img/coursePage/questions-icon.png\"  style=\"cursor:default;\" />"+countAns+"</span>";
	questionStr += "<span class=\"praise-s\"><img src=\"/img/coursePage/praise-icon.png\"/>"+countPri+"</span>";
	questionStr += "</div>";
	questionStr += "</div>";
	$(".answersList").append(questionStr);
	$("#"+qid).data("praiseFlag",praiseFlag);
}

/**
 * 添加问答
 * @param content
 * @param ecid
 */
function addQuizs(content,ceid){
	var beUserId = "";
	if($('#Inviter_Q').is(':checked')){
		beUserId = "ba84d3c3-a4a1-4cd2-a00d-2f5722ee86a2";
	}
	$.ajax({
		url:"queAns!addQuizs.action",
		data:{beUserId:beUserId,content:content,ceid:ceid,code:$("#question_editor_text").data("isNeed")},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			clearDate();
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				var cont = parseInt($(".exp_menu_list #questions span span").text());
				$(".exp_menu_list #questions span span").text(cont+1);
				$("#Inviter_Q").clearValue();
				queryQuestionByid(ecid,1,true);
				$("#popup_cancel").trigger('click');
			}else if($(data).attr("result") == "needCode"){
				jCode("", "", function(val){
					$("#question_editor_text").data("isNeed",val);
					addQuizs(content,ceid);
				}, null, 0, getPh());
			}else if($(data).attr("result") == "codefail"){
				jCode("", "", function(val){
					$("#question_editor_text").data("isNeed",val);
					addQuizs(content,ceid);
				}, null, 0, getPh());
				var str = '<p id="codeErrorMsg" class="errorMsg codeMsg_z prompt" style="clear: both; position: absolute; font-size: 12px; color: rgb(254, 115, 1); margin-top: -4px;">';
				str = str + '<img src="img/ico_warn_yellow.png" style="">';
				str = str + '<span>验证码有误哦！</span></p>';
				$("#popup_prompt").parent().append(str);
			}else{
				if(mes == "NoLogin"){
					if(languageFirst == "English"){
						$(".addquestion_btn").parent().find(".error-message").html("Please log in and operate！")
					}else{
						$(".addquestion_btn").parent().find(".error-message").html("请登录后进行操作!")
					}
				}else{
					$(".addquestion_btn").parent().find(".error-message").html("添加失败！请稍后重试!")
				}
			}
		},
		error : function(){
			$(".addquestion_btn").parent().find(".error-message").html("添加失败！请稍后重试!")
		}
	})
}

/**
 * 问答点赞功能
 * @param qid
 */
function addPraises(qid,obj){
	
	$.ajax({
		url:"queAns!addPraises.action",
		data:{qid:qid},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				$(obj).parent().parent().parent().data("praiseFlag",true);
				var num = $(obj).parent().text();
				$(obj).parent().html("<img src=\"/img/coursePage/praise-icon.png\">"+(parseInt(num)+1));
			}else{
				if(mes == "NoLogin"){
					if(languageFirst == "English"){
						jAlert("Please log in and operate！", null, null, 5000, null,"info",null,getPh());
					}else{
						jAlert("请登录后进行操作！", null, null, 5000, null,"info",null,getPh());
					}
				}else{
					jAlert("系统繁忙！请稍候再试。", null, null, 5000, null,"error",null,getPh());
				}
			}
		},
		error : function(){
			
		}
	})
}

/**
 * 取消点赞
 * @param qid
 * @param obj
 */
function deletePraises(qid,obj){
	$.ajax({
		url:"queAns!deletePraises.action",
		data:{qid:qid},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				$(obj).parent().parent().parent().data("praiseFlag",false);
				var num = $(obj).parent().text();
				$(obj).parent().html("<img src=\"/img/coursePage/praise-icon.png\">"+(parseInt(num)-1));
			}else{
				if(mes == "NoLogin"){
					if(languageFirst == "English"){
						jAlert("Please log in and operate！", null, null, 5000, null,"info",null,getPh());
					}else{
						jAlert("请登录后进行操作！", null, null, 5000, null,"info",null,getPh());
					}
				}else{
					jAlert("系统繁忙！请稍候再试。", null, null, 5000, null,"error",null,getPh());
				}
			}
		},
		error : function(){
			
		}
	})
}

/*********************************************************笔记****************************************************************/
/**
 * 获取笔记内容
 * @param ecid
 */
function queryNotesByEcid(ecid,pageNum,flag){
	$(".notesList").empty();
	Loading($(".notesList"),'notes');
	$("#notes_page").hide();
	$.ajax({
		url:"noteInfo!queryNotesByEcid.action",
		data:{ecid:ecid,pageNum:pageNum},
		type:"post",
		dataType:"json",
		async : true,
		complete:function(){
			removeLoading('notes');
		},
		success : function(data){
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				notestotalPage = $(data).attr("totalpage");
				if(mes != null){
					$(mes).each(function(){
						var headImg = $(this).attr("headImg");
						var content = $(this).attr("content");
						var createTime = $(this).attr("createTime");
						var name = $(this).attr("name");
						var userId = $(this).attr("userId");
						queryNotesByEcidVray(headImg,content,createTime,name,userId);
					})
				}else{
					if(languageFirst == "English"){
						$(".notesList").html(noDateshow("Sorry, there's no result!"));
					}else{
						$(".notesList").html(noDateshow("该实验下暂无实验笔记呦！"));
					}
				}
				if(flag){notes_pagination();}
				if(notestotalPage>1){$("#notes_page").show()}
			}else{
				if(mes == "NoLogin"){
					if(languageFirst == "English"){
						$(".notesList").html(noDateshow("Please<a href=\"/loginRegistration.html\" target=\"_blank\">Sign in</a>Post check notes！"));
					}else{
						$(".notesList").html(noDateshow("请<a href=\"/loginRegistration.html\" target=\"_blank\">登录</a>后查看笔记！"));
					}
				}else{
					$(".notesList").html(noDateshow("数据异常，请稍后重试！"));
				}
			}
		},
		error : function(){
			$(".notesList").html(noDateshow("数据异常，请稍后重试！"));
		}
	})
}

function queryNotesByEcidVray(headImg,content,createTime,name,userId){
	var notesStr = "<div class=\"notesdiv\">";
	notesStr += "<div class=\"head_img\"><a href=\"profile.do?u="+userId+"\" target=\"_blank\"><img onerror=\"noHeadImg(this)\" src=\""+headImg+"\"></a></div>";
	notesStr += "<div class=\"notes_content\" title="+content+">"+content+"</div>";
	if(languageFirst == "English"){
		notesStr += "<div class=\"notes_menu\"><span class=\"notes_time\">Time："+sqlDate2Str(createTime)+"</span></div>";
	}else{
		notesStr += "<div class=\"notes_menu\"><span class=\"notes_time\">时间："+dateStrTime(sqlDate2Str(createTime))+"</span></div>";
	}
	notesStr += "</div>";
	$(".notesList").append(notesStr);
}

/**
 * 添加笔记
 * @param content
 * @param ceid
 */
function addNotes(content,ceid){
	$("#notes_editor_text").val("");
	$.ajax({
		url:"noteInfo!addNotes.action",
		data:{content:content,exptId:ceid,code:$("#notes_editor_text").data("isNeed")},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			clearDate();
			var mes = $(data).attr("message");
			if($(data).attr("result") == "success"){
				var cont = parseInt($(".exp_menu_list #notes span span").text());
				$(".exp_menu_list #notes span span").text(cont+1);
				queryNotesByEcid(ecid,1,true);
				$("#popup_cancel").trigger('click');
			}else if($(data).attr("result") == "needCode"){
				jCode("", "", function(val){
					$("#notes_editor_text").data("isNeed",val);
					addNotes(content,ceid);
				}, null, 0, getPh());
			}else if($(data).attr("result") == "codefail"){
				jCode("", "", function(val){
					$("#notes_editor_text").data("isNeed",val);
					addNotes(content,ceid);
				}, null, 0, getPh());
				var str = '<p id="codeErrorMsg" class="errorMsg codeMsg_z prompt" style="clear: both; position: absolute; font-size: 12px; color: rgb(254, 115, 1); margin-top: -4px;">';
				str = str + '<img src="img/ico_warn_yellow.png" style="">';
				str = str + '<span>验证码有误哦！</span></p>';
				$("#popup_prompt").parent().append(str);
			}else{
				if(mes == "NoLogin"){
					if(languageFirst == "English"){
						$(".addnotes_btn").parent().find(".error-message").html("Add failure! Please login again!");
					}else{
						$(".addnotes_btn").parent().find(".error-message").html("添加失败！请重新登录！");
					}
				}else{
					$(".addnotes_btn").parent().find(".error-message").html("添加失败！请稍后重试!")
				}
			}
		},
		error : function(){
			$(".addnotes_btn").parent().find(".error-message").html("添加失败！请稍后重试!")
		}
	})
}

/************************************************************视频***************************************/
/**
 * 获取实验视频
 * @param ecid
 */
function queryVideoByEcid(ecid,ceid){
	$.ajax({
		url:"newExp!queryVideoByEcid.action",
		data:{ecid:ecid,ceid:ceid},
		type:"post",
		dataType:"json",
		async : true,
		success : function(data){
			if($(data).attr("result") == "success"){
				var mes = $(data).attr("message");
				if(mes != null){
					var str = "<img class=\"exp_video\" src=\"/img/coursePage/vedioBtn.png\">";
					$(".exp_img_list").append(str);
					$(".videoList").empty();
					$(mes).each(function(i){
						var expName = $(this).attr("ecName");
						var provider = $(this).attr("userName");
						var videoNum = $(this).attr("views");
						var wareId = $(this).attr("wareId");
						var flagShow = $(this).attr("flagShow");
						var str = "<p id=\""+wareId+"\" data-provider=\""+provider+"\" data-videoNum=\""+videoNum+"\" data-name=\""+expName+"\">"+expName+"</p>";
						$(".videoList").append(str);
						if(mes.length > 1){
							$(".videoList-bg").show();
						}else{
							$(".videoList-bg").hide();
						}
						if(flagShow){
							$("#learnbtn").html("已学过");
							$("#learnbtn").attr("disabled","disabled");
							$("#learnbtn").unbind();
						}
					})
				}
			}
		},
		error : function(){
			
		}
	})
}

//调整弹出框位置
function getPh(){
	var ctop = window.screen.height;
	ctop = ctop/3;
	var ph = top.pageYOffset;
	var top1 = ((window.screen.height - $("#popup_container")
				.outerHeight()) / 2)+ $.alerts.verticalOffset;
	ph = -ph-(top1-ctop)+30;
	return ph;
}