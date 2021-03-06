
define ([
	'underscore',
	'backbone',
	'namespace',
	'webStorage',
	'text!templates/newsDetail.html',
	'models/newsDetaill',
	'views/main/userFavor',
	'dataLazyImages',
	'slider',
], function(_, Backbone, Global, WebStorage, Tpl, NewsDetaillModel, UserFavor, DataLazyImages, Slider) {

	var NewsDetailView = Backbone.View.extend({

		initialize: function() {
			
		},

		template: function() {
			// 使用 textarea的小技巧返回未转义的html值；
			var escape = document.createElement('textarea');
			escape.innerHTML = $(Tpl).find('.content')[0].innerHTML;
			return escape.value;
		},

		render: function(classid, id) {
			this.$el = document.querySelector('#view-newsDetail');
			this.$elContent = this.$el.querySelector('.content .bd');
			this.$vOut = document.querySelector('section.active');
			this.$actionComment = this.$el.querySelector('#view-newsDetail header button.icon-comment-wrap');

			this.$vOut.classList.toggle('active');
			this.$vOut.classList.add('hidden');
			this.$el.classList.remove('hidden');
			this.$el.classList.add('active');


			myApp.showIndicator();

			this.model = new NewsDetaillModel();
			this.model.fetch({
				cache: true,
				url: Global.app.opts.url + 'a=render&classid=' + classid + '&id=' +id
			});

			this.model.listenTo(this.model, 'sync', _.bind(this.renderAll, this));
			this.model.listenTo(this.model, 'sync', _.bind(this.newsFavor, this));
			this.model.listenTo(this.model, 'sync', _.bind(this.articleComment, this));
			this.model.listenTo(this.model, 'sync', _.bind(this.articleShare, this));


		},

		renderAll: function(model) {
			var self = this;
			var newstext = model.get('newstext').replace(/(\[!--empirenews.page--\])/g, '').replace(/(src)/g, 'data-src');
			var container = document.querySelector('#view-newsDetail .content');
			var containerTempData = {
				title: model.get('title'),
				newstext: newstext,
				diggtop: model.get('diggtop'),
				newstime: model.get('newstime'),
				classname: model.get('classname'),
			};

			var headerCommentTempData = {
				classid: model.get('classid'),
				id: model.get('id')
			};
			container.innerHTML.scrollTop = 0;
			container.style.fontSize = WebStorage.get().fontsize +'px';
			container.innerHTML = _.template(self.template(), containerTempData);
			this.$actionComment.setAttribute('data-action', '#comment/' + model.get('classid') + '/' + model.get('id'));
			this.$actionComment.setAttribute('data-return', '#list/'+ model.get('classid')+'/'+model.get('id'));
			
			myApp.hideIndicator();

			this.newsDetailSlideFunc();

			this.lazyLoadImages($(this.$el).find('.scroll'));
		},

		lazyLoadImages: function(container) {
			container.find('img').each(function(i){
				var img = $(this);
				var imgParent = img.parent();
            	
            	// img.attr('data-src', img.attr('src'));
            	img.attr('data-img', img.attr('data-src'));
				img.attr('data-src','http://www.biketo.com/d/imagecache/rewidth/384' + img.attr('data-src'));
				img.attr('data-index', i);
				img.addClass('lazy');
				if (imgParent[0].tagName === 'SPAN' || imgParent[0].tagName === 'A') imgParent = imgParent.parents('p');
            	imgParent.addClass('algin-center');
			});

			$("img.lazy").lazyload({
				container: container,
				effect : "fadeIn",
			    threshold : 500
			});
		},

		newsDetailSlideFunc: function() {

			var self = this;
			var sliderWrap = document.querySelector('#view-newsDetail .ui-slider');
			var newsDetailSlide = $(self.$el).find('.news-detaill-slide');
			var container = $(self.$el).find('.scroll');
			var buttonBack = $(self.$el).find('.news-detail-slide-button .back-page');
			var buttonSave = $(self.$el).find('.news-detail-slide-button .save-images');

			var buttonDelegateHandle = function() {
				var clicked = $(this);
				if (clicked.hasClass('back-page')) {
					newsDetailSlide.fadeOut();
				}

				if (clicked.hasClass('save-images')) {
					var imgesSrc = $(self.$el).find('.item.current img')[0].src;
					var success = function(msg){
					    self.tips({text: '已保存至相册'});
					}
					var error = function(err){
					    self.tips({text: '保存失败！未知错误：'+err+'', className: 'icon-round-close'});
					}
					window.saveImageToPhone(imgesSrc, success, error);
					log("saveing ...", imgesSrc)
				}

			}

			var delegateHandle = function() {
				var index = $(this).attr('data-index');
				var imagesArray = [];

	       		// 幻灯片
				container.find('img').each(function(i){
					var img = $(this);
	            	var imagesArrayObj = {
	            		title: '',
	            		titlepic: img.attr('data-img')
	            	}
	            	imagesArray.push(imagesArrayObj);
				});

				sliderWrap.innerHTML = '';
				
				setTimeout(function() {
					new Slider({
						container: sliderWrap,
						dataList: imagesArray,
						title: '',
						hiddenContainer: newsDetailSlide[0],
						currentIndex: index,
						multiTouch: true, // 多手势操作
						urlExtend: false, // 不使用扩展地址
						showDots: false, // 取消点显示，则使用数字类型
					});
				})

				// show detail slide
				newsDetailSlide.fadeIn();
			}

			$(self.$el).undelegate().delegate('.back-page, .save-images', 'click', buttonDelegateHandle);
			container.undelegate().delegate('img', 'click', delegateHandle);
		},

		/**
		 * 文章分享
		 * @return {[Array]} 当前模型数据
		 */
		articleShare: function(model) {

			var self = this;
			var shareBtn = self.$el.querySelector('.icon-share-wrap');

			self.shareTitle = model.get('title');
			this.shareSmalltext = model.get('smalltext');
			this.shareTItlePic = "http://www.biketo.com/d/imagecache/in/80x80/" + model.get("titlepic");
			this.shareUrl = "http://biketo.com/#list/'"+model.get('classid')+"'/'"+model.get('id')+"'";

			// share html tempalte 
			var shareTemp = '<div class="actions-modal">' +
								'<div class="actions-modal-group">' +
									'<div class="actions-modal-button"><i class="iconfont icon-wecaht"></i><div class="actions-modal-button-text">微信好友</div></div>' +
									'<div class="actions-modal-button"><i class="iconfont icon-wecahtQuan"></i><div class="actions-modal-button-text">朋友圈</div></div>' +
									'<div class="actions-modal-button"><i class="iconfont icon-copy"></i><div class="actions-modal-button-text">复制链接</div></div>' +
								'</div>' +
							'</div>';
			// modal overlay html tempalte 
			var modalOverlayTemp = '<div class="modal-overlay"></div>';


			if (!document.querySelector('.modal-overlay')) {
				var modalOverWrapeTemp = document.createElement('div'); modalOverWrapeTemp.innerHTML = modalOverlayTemp;
				document.body.appendChild(modalOverWrapeTemp.firstChild);
			}

			var modalOver = document.querySelector('.modal-overlay');

			var showShareDom = function(isShow) {

				var self = this;

				if (!document.querySelector('.actions-modal')) {
					var shareWrapeTem = document.createElement('div'); shareWrapeTem.innerHTML = shareTemp;
					document.body.appendChild(shareWrapeTem.firstChild);
				}

				var share = document.querySelector('.actions-modal');
				var shareButtons = share.querySelectorAll('.actions-modal-button');
				var shareWeChat = shareButtons[0];
				var shareWeChatQuan = shareButtons[1];
				var shareCopylink = shareButtons[2];

				if (isShow) {
					setTimeout(function(){
						share.classList.add('modal-in');
						share.classList.remove('modal-out');
					},100);
				}
				else {
					share.classList.remove('modal-in');
					share.classList.add('modal-out');
					setTimeout(function(){
						try {
							document.body.removeChild(share)
						} catch (err) {};
					},300);
				}
				shareWeChat.addEventListener('click', _.bind(clickShareWeChatBtnHandle, self, shareWeChat), false);
				shareWeChatQuan.addEventListener('click', _.bind(clickShareWeChatQuanHandle, self, shareWeChatQuan), false);
				shareCopylink.addEventListener('click', _.bind(clickShareCopylinkHandle, self, shareCopylink), false);
			}

			var clickShareBtnHandle = function() {
				var self = this;
				modalOver.classList.add('modal-overlay-visible');

				showShareDom.call(self, true);

				modalOver.addEventListener('click', _.bind(clickModalOverlayHandle, self), false);
				modalOver.addEventListener('touchmove', _.bind(clickModalOverlayHandle, self), false);
			}
			var clickModalOverlayHandle = function() {
				var self = this;
				modalOver.classList.remove('modal-overlay-visible');

				showShareDom.call(self, false);
			}

			// share wechat firend
			var clickShareWeChatBtnHandle = function(el) {
				var self = this;

				if(el.classList.contains('action') || !window.Wechat || !window.navigator) return;

     			window.Wechat.share({
     			    message: {
     			       title: self.shareTitle,
     			       description: self.shareSmalltext,
     			       mediaTagName: "Media Tag Name(optional)",
     			       thumb: self.shareTItlePic,
     			       media: {
     			           type: Wechat.Type.WEBPAGE,   // webpage
     			           webpageUrl: self.shareUrl    // webpage
     			       }
     			   },
     			   scene: Wechat.Scene.SESSION   // share to Timeline
     			}, 

     			function () {
     			    window.navigator.notification.alert("", success, "成功分享！");
     			    clickModalOverlayHandle();
     			}, 

     			function (reason) {
     			    var success = function() {};
					window.navigator.notification.alert("", success, "分享失败！");
     			    clickModalOverlayHandle();
     			});

     			el.classList.add('action');

     			// auto hidden
     			setTimeout(function() {
     				clickModalOverlayHandle();
     			}, 3000);
			}

			// share wechat Quan
			var clickShareWeChatQuanHandle = function(el) {
				var self = this;

				if(el.classList.contains('action') || !window.Wechat || !window.navigator) return;

     			window.Wechat.share({
     			    message: {
     			       title: self.shareTitle,
     			       description: self.shareSmalltext,
     			       mediaTagName: "Media Tag Name(optional)",
     			       thumb: self.shareTItlePic,
     			       media: {
     			           type: Wechat.Type.WEBPAGE,   // webpage
     			           webpageUrl: self.shareUrl    // webpage
     			       }
     			   },
     			   scene: Wechat.Scene.TIMELINE   // share to Timeline
     			}, 

     			function () {
     			    var success = function() {
     			    	clickModalOverlayHandle();
     			    };
     			    window.navigator.notification.alert("", success, "成功分享！", "确定");
     			}, 

     			function (reason) {
     			    var success = function() {
     			    	clickModalOverlayHandle();
     			    };
					window.navigator.notification.alert("", success, "分享失败！", "确定");
     			});

     			el.classList.add('action');

     			// auto hidden
     			setTimeout(function() {
     				clickModalOverlayHandle();
     			}, 3000);
			}

			// copy this links
			var clickShareCopylinkHandle = function(el) {
				var self = this;

				if(!window.navigator.notification) return;

				var shareUrl = "http://biketo.com/#list/"+model.get('classid')+"/"+model.get('id')+"";
				window.cordova.plugins.clipboard.copy(shareUrl);
				window.cordova.plugins.clipboard.paste(function (text) { 
     			    var success = function() {
     			    	clickModalOverlayHandle();
     			    };
					window.navigator.notification.alert("", success, "成功复制！", "确定");
				});
				el.classList.add('action');
			}

			// initBind event
			if (!self.shareInitBind) {
				self.shareInitBind = true;
				shareBtn.addEventListener('click', _.bind(clickShareBtnHandle, self), false);
			}
			
		},

		/**
		 * 文章收藏
		 * @return {[Array]} 当前模型数据
		 */
		newsFavor: function(model) {
			var button = document.querySelector('#view-newsDetail .icon-favor-wrap .icon-favor');
			UserFavor.render('save', {
				el: button, 
				models: {
					title: model.get('title'), 
					classid: model.get('classid'),
					id: model.get('id')
				}
			});
		},

		/**
		 * 文章评论
		 * @return {[Number]} 当前文章ID
		 */
		articleComment: function(id) {
			// var button = document.querySelector('#view-newsDetail .icon-comment-wrap');
		},

		fixNewsText: function() {
			var img = this.$el.find('img');
			var p = this.$el.find('p');
			img.attr('src','images/image-loading.png')
			   .attr('data-img','http://www.biketo.com' + img.attr('src'))
			   .attr('isload','false')
			   .parents().css('text-align','center');
		},

		tips: function(obj) {
			var tipsWrape = $('.commom-tips');
			var tipsText = tipsWrape.find('.text');
			var iconfont = tipsWrape.find('.iconfont');

			(obj.className === 'icon-round-close') ? iconfont.removeClass('icon-round-check').addClass('icon-round-close') : iconfont.addClass('icon-round-check');

			tipsWrape.addClass('fadeOut animated')
				.on('webkitAnimationEnd', function() {
					$(this).removeClass('fadeOut animated');
				});

			tipsText.html(obj.text);
		},
		/**
		 * 顶文章
		 * @param cid 
		 * @param aid 
		 */
		// newsDiggtop: function(cid, aid) {
		// 	var button = this.$el.find('.icon-like-wrap .icon-like');
		// 	var url = 'http://www.biketo.com/do/digg/';
		// 	var thisValue = '#list/'+cid +'/' +aid;
		// 	var getValue = WebStorage.get().favor || [];
		// 	var isValueTrue = _.contains(getValue, thisValue);

		// 	// 判断是否已存在
		// 	(isValueTrue) ? button.addClass("checked") : button.removeClass("checked");
		// 	if (isValueTrue) return false;

		// 	var submitForm = function() {
		// 		/**
		// 		 *  如果没有：
		// 		 *  1、添加一个，
		// 		 *  2、尝试提交，成功后再高亮显示；
		// 		 */
		// 		if (!isValueTrue) {
		// 			getValue.push(thisValue);
		// 			WebStorage.set({'favor': getValue });
		// 		}
		// 		$.post(url, {'classid' : cid, 'id' : aid }, submitCallback, 'json');
		// 	}
		// 	var submitCallback = function (d) {
		// 		var status = d.status, data = d.data, message = d.message;
		// 		if (status) {
		// 			console.log('ok',data);
		// 			button.addClass("checked");
		// 		} else {
		// 			if (message == '您已提交过了') {
		// 				button.addClass("checked");
		// 			}
		// 		}
		// 	}
		// 	// 绑定提交按钮
		// 	button.on('click', _.debounce(submitForm, 100, true));
		// },
	});

	// 详情新闻
	return new NewsDetailView();
})

