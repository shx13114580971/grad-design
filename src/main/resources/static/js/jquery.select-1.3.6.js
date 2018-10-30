/*
 * jQuery Select Plugins v1.3.6.2
 * Copyright (c) 2009 zhangjingwei
 * Dual licensed under the MIT and GPL licenses.
 * Date: 2009-11-17 09:37
 * Revision: 1.3.6.2
 * www.leadwit.com- modify in  2010-07-26 14:26
 */

(function($){
$.fn.extend({
	sSelect: function() {
		return this.each(function(i,obj){
		var selectId = (this.name||this.id)+'__jQSelect'+i||'__jQSelect'+i;
		if(obj.style.display != 'none' && $(this).parents()[0].id.indexOf('__jQSelect')<0){
		var tabindex = this.tabIndex||0;
		$(this).before("<div class='dropdown' id="+selectId+" tabIndex="+tabindex+"></div>").prependTo($("#"+selectId));
		var selectZindex = $(this).css('z-index'),selectIndex = $('#'+selectId+' option').index($('#'+selectId+' option:selected')[0]);
		if($('#'+selectId+' option').length == 0){
			$('#'+selectId).append('<div class="dropselectbox"><h4 class="disabled"></h4><ul></ul></div>');
		}else{
			$('#'+selectId).append('<div class="dropselectbox"><h4></h4><ul></ul></div>');
		}
		var str1 = "";
		//为了试验机切换临时新加的功能  后续会修改
		if(selectId == "env-vim__jQSelect0"){
			str1 = "<img src=\""+$(this).val()+"\"/>";
		}
		$('#'+selectId+' h4').empty().append(str1+$('#'+selectId+' option:selected').html());
		var selectWidth=$('#'+selectId+' select').width();
		if($.browser.safari){selectWidth = selectWidth+15}
		$('#'+selectId+' h4').css({width:selectWidth});
		var selectUlwidth = selectWidth + parseInt($('#'+selectId+' h4').css("padding-left")) + parseInt($('#'+selectId+' h4').css("padding-right"));
		$('#'+selectId+' ul').css({width:selectUlwidth+'px'});
		$('#'+selectId+' select').hide();
		$('#'+selectId+' div').hover(function(){
			if($('#'+selectId+' option').length == 0){//no any data
				$('#'+selectId+' h4').css("cursor", "default");
				$('#'+selectId+' ul').css("border", "0px");
				$('#'+selectId+' h4').addClass("disabled");
				$('#'+selectId+' h4').removeClass("over");
			} else {
				$('#'+selectId+' h4').removeClass("disabled");
				$('#'+selectId+' h4').addClass("over");
			}
		},function(){
			$('#'+selectId+' h4').removeClass("over");
		});

		var timeobj;
		$('#'+selectId+' ul').bind("mouseover",function(e){
			clearTimeout(timeobj);
		});
		var click_fun = function(){
				if($('#'+selectId+' option').length == 0){//no any data
					$('#'+selectId+' h4').removeClass("current");
					$('#'+selectId+' h4').addClass("disabled");
				} else {
					$('#'+selectId+' h4').removeClass("disabled");
					$('#'+selectId+' h4').addClass("current");
					$('#'+selectId+' ul').show();
				}
				var selectZindex = $('#'+selectId).css('z-index');
				if ($.browser.msie || $.browser.opera){$('.dropdown').css({'position':'relative','z-index':'0'});}
				$('#'+selectId).css({'position':'relative','z-index':'999'});
				$.fn.setSelectValue(selectId);
				selectIndex = $('#'+selectId+' li').index($('.selectedli')[0]);
				var windowspace = ($(window).scrollTop() + document.documentElement.clientHeight) - $('#'+selectId).offset().top;
				var ulspace = $('#'+selectId+' ul').outerHeight(true);
				var windowspace2 = $('#'+selectId).offset().top - $(window).scrollTop() - ulspace;
				windowspace < ulspace && windowspace2 > 0?$('#'+selectId+' ul').css({top:-ulspace}):$('#'+selectId+' ul').css({top:$('#'+selectId+' h4').outerHeight(true)});
				$(window).scroll(function(){
					windowspace = ($(window).scrollTop() + document.documentElement.clientHeight) - $('#'+selectId).offset().top;
					windowspace < ulspace?$('#'+selectId+' ul').css({top:-ulspace}):$('#'+selectId+' ul').css({top:$('#'+selectId+' h4').outerHeight(true)});
				});	
				$('#'+selectId+' li').click(function(e){
						selectIndex = $('#'+selectId+' li').index(this);
						$.fn.keyDown(selectId,selectIndex);
						var str1 = "";
						//为了试验机切换临时新加的功能  后续会修改
						if(selectId == "env-vim__jQSelect0"){
							str1 = "<img src=\""+$('#'+selectId+' option:selected').val()+"\"/>";
						}
						$('#'+selectId+' h4').empty().append(str1+$('#'+selectId+' option:selected').html());
						$.fn.clearSelectMenu(selectId,selectZindex);
						e.stopPropagation();
						e.cancelbubble = true;
				})
				.hover(
					   function(){
							$('#'+selectId+' li').removeClass("over");
							$(this).addClass("over").addClass("selectedli");
							selectIndex = $('#'+selectId+' li').index(this);
						},
						function(){
							$(this).removeClass("over");
						}
				);
		}

		$('#'+selectId)
		.bind("focus",function(){
			//$.fn.clearSelectMenu(selectId,selectZindex);
			$('#'+selectId+' h4').addClass("over");
		})
		.bind("click",function(e){
			if($('#'+selectId+' ul').css("display") == 'block'){
				$.fn.clearSelectMenu(selectId,selectZindex);
				return false;
			}else{
				click_fun();
			};
			e.stopPropagation();
		})
		.bind("mouseover",function(e){
			if($('#'+selectId+' ul').css("display") == 'block'){
				//$.fn.clearSelectMenu(selectId,selectZindex);
				return false;
			}else{
				click_fun();
			};
			e.stopPropagation();
		})
		.bind("mouseout",function(e){
			if($('#'+selectId+' ul').css("display") == 'block'){
				timeobj = setTimeout(function(){
					$.fn.clearSelectMenu(selectId,selectZindex);
				},500);
				return false;
			}
			e.stopPropagation();
		})
		 .bind('mousewheel', function(e,delta) {
				e.preventDefault();
				var mousewheel = {
					$obj : $('#'+selectId+' li.over'),
					$slength : $('#'+selectId+' option').length,
					mup:function(){
						this.$obj.removeClass("over");
						selectIndex == 0?selectIndex = 0:selectIndex--;
						$.fn.keyDown(selectId,selectIndex);
					},
					mdown:function(){
						this.$obj.removeClass("over");
						selectIndex == (this.$slength - 1)?selectIndex = this.$slength - 1:selectIndex ++;
						$.fn.keyDown(selectId,selectIndex);
					}
				}
				delta>0?mousewheel.mup():mousewheel.mdown();
		 })
		.bind("dblclick", function(){
			$.fn.clearSelectMenu(selectId,selectZindex);
			return false;
		})
		.bind("keydown",function(e){
			$(this).bind('keydown',function(e){
				if (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 35 || e.keyCode == 36){
					return false;
				}
			});
			var $obj = $('#'+selectId+' li.over'),$slength = $('#'+selectId+' option').length;
			switch(e.keyCode){
				case 9:
					return true;
					break;
				case 13:
					//enter
					$.fn.clearSelectMenu(selectId,selectZindex);
					break;
				case 27:
					//esc
					$.fn.clearSelectMenu(selectId,selectZindex);
					break;
				case 33:
					$obj.removeClass("over");
					selectIndex = 0;
					$.fn.keyDown(selectId,selectIndex);
					break;
				case 34:
					$obj.removeClass("over");
					selectIndex = ($slength - 1);
					$.fn.keyDown(selectId,selectIndex);
					break;
				case 35:
					$obj.removeClass("over");
					selectIndex = ($slength - 1);
					$.fn.keyDown(selectId,selectIndex);
					break;
				case 36:
					$obj.removeClass("over");
					selectIndex = 0;
					$.fn.keyDown(selectId,selectIndex);
					break;
				case 38:
					//up
					e.preventDefault();
					$obj.removeClass("over");
					selectIndex == 0?selectIndex = 0:selectIndex--;
					$.fn.keyDown(selectId,selectIndex);
					break;
				case 40:
					//down
					e.preventDefault();
					$obj.removeClass("over");
					selectIndex == ($slength - 1)?selectIndex = $slength - 1:selectIndex ++;
					$.fn.keyDown(selectId,selectIndex);
					break;
				default:
					e.preventDefault();
					break;
			};
		})
		.bind("blur",function(){
			$.fn.clearSelectMenu(selectId,selectZindex);
			return false;
		})
		.bind("selectstart",function(){
			return false;
		});
	}else if($(this).parents()[0].id.indexOf('__jQSelect')>0){
		selectId = $(this).parents()[0].id;
		$.fn.setSelectValue(selectId);
		var selectWidth=$('#'+selectId+' select').width();
		if($.browser.safari){selectWidth = selectWidth+15}
		$('#'+selectId+' h4').css({width:selectWidth});
		var selectUlwidth = selectWidth + parseInt($('#'+selectId+' h4').css("padding-left")) + parseInt($('#'+selectId+' h4').css("padding-right"));
		$('#'+selectId+' ul').css({width:selectUlwidth+'px'});
		if(this.style.display != 'none'){$(this).hide();}
	}})},
	clearSelectMenu:function(selectId,selectZindex){
		if(selectId != undefined){
			selectZindex = selectZindex||'auto';
			$('#'+selectId+' ul').empty().hide();
			$('#'+selectId+' h4').removeClass("over").removeClass("current");
			$('#'+selectId).css({'z-index':selectZindex});
		}
	},
	rSelect: function() {
		return this.each(function(i,obj){
			var selectId = (this.name||this.id)+'__jQSelect'+i||'__jQSelect'+i;
			var tabindex = this.tabIndex||0;
			var sel = $(this).prop('outerHTML');
			$("#"+selectId).before(sel);
			$("#"+selectId).remove();
	})},
	setSelectValue:function(sID){
		var content = [];
		$.each($('#'+sID+' option'), function(i){
			var str = "";
			//为了试验机切换临时新加的功能  后续会修改
			if(sID == "env-vim__jQSelect0"){
				str = "<img src=\""+$(this).val()+"\"/>";
			}
			content.push("<li class='FixSelectBrowser'>"+str+$(this).html()+"</li>");
		});
		content = content.join('');
		$('#'+sID+' ul').html(content);
		var str = "";
		//为了试验机切换临时新加的功能  后续会修改
		if(sID == "env-vim__jQSelect0"){
			str = "<img src=\""+$('#'+sID+' option:selected').val()+"\"/>";
		}
		$('#'+sID+' h4').html(str+$('#'+sID+' option:selected').html());
		$('#'+sID+' li').eq($('#'+sID+' select')[0].selectedIndex).addClass("over").addClass("selectedli");
	},
	keyDown:function(sID,selectIndex){
		var $obj = $('#'+sID+' select');
		$obj[0].selectedIndex = selectIndex;
		$obj.change();
		$('#'+sID+' li:eq('+selectIndex+')').toggleClass("over");
		$('#'+sID+' h4').html($('#'+sID+' option:selected').html());
	}
});
var types = ['DOMMouseScroll', 'mousewheel'];
$.event.special.mousewheel = {
	setup: function() {
		if ( this.addEventListener )
			for ( var i=types.length; i; )
				this.addEventListener( types[--i], handler, false );
		else
			this.onmousewheel = handler;
	},
	teardown: function() {
		if ( this.removeEventListener )
			for ( var i=types.length; i; )
				this.removeEventListener( types[--i], handler, false );
		else
			this.onmousewheel = null;
	}
};
$.fn.extend({
	mousewheel: function(fn) {
		return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
	},

	unmousewheel: function(fn) {
		return this.unbind("mousewheel", fn);
	}
});
function handler(event) {
	var args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true;
	event = $.event.fix(event || window.event);
	event.type = "mousewheel";	
	if ( event.wheelDelta ) delta = event.wheelDelta/120;
	if ( event.detail     ) delta = -event.detail/3;
	args.unshift(event, delta);
	return $.event.handle.apply(this, args);
}
})(jQuery);