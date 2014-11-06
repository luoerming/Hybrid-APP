
define ([
	'underscore',
	'backbone',
	'webStorage',
	'namespace',
	'collections/commentCollection',
	'views/item/commentItemView',
	'appUI',
	'views/main/userLogin',
	'views/main/memberCenter',
	'webStorage'
], function(_, Backbone, WebStorage, Global, CommentCollection, CommentItemView, AppUi, UserLogin, MemberCenter, WebStorage) {

	var ArticleComment = Backbone.View.extend({

		el: '#view-comment',

		initialize: function() {
			this.listenTo(this.collection, 'reset', this.renderAll); // 渲染列表数据
			this.listenTo(this.collection, 'reset', this.quoteOrVoteCommentItem);
			this.listenTo(this.collection, 'add', this.createCommentItem);
			$$ = window.Dom;
		},

		render: function(classId, articleId) {

			this.$el = $('#view-comment');
			this.$nav = $('nav');
			this.$vOut = $('section.active');
			this.$content = this.$el.find('.content');
			this.$viewPostComment = this.$el.find('.button-right--comment'); 

			this.$addEl = $('#view-comment-add');
			this.$addElForCommentTextArea = this.$addEl.find('.addComment-textarea');
			this.$addElForBackButton = this.$addEl.find('.button-wrap .button-left-wrap button');
			this.$addElForPostButton = this.$addEl.find('.button-wrap .button-right-wrap button');
			this.$addElForTitle = this.$addEl.find('h1.nav');

			this.classId = classId;
			this.articleId = articleId;

			var opts = {
				cache: false,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=comment&methodType=getArticleComment&id=' + this.articleId
			}; 

			this.collection.fetch(opts);

			// show comment page
			this.showCommentPage();
			this.$viewPostComment.off().on('click', _.bind(this.postCommentItem, this, this.$viewPostComment[0], false, 0, 0));

			myApp.showIndicator();
		},

		showCommentPage: function() {
			this.$vOut.removeClass('active');
			this.$vOut.addClass('hidden');
			this.$el.removeClass('hidden');
			this.$el.addClass('active');
			this.$nav.addClass('nav-out');
			this.$nav.removeClass('nav-in');
		},

		renderAll: function(collections, re) {
			var commentItemViewEl = [];
			collections.each(function(commentTtemView){
				var view = new CommentItemView({model: commentTtemView});
				commentItemViewEl.push(view.render().el);
			});
			this.$content.html(commentItemViewEl);
			myApp.hideIndicator();
		},

		createCommentItem: function(returnModel, m) {
			var self = this;
			var rePlid = returnModel.attributes[0].plid;
			var reTopid = returnModel.attributes[0].topid;

			returnModel.set('plid', rePlid);
			returnModel.set('topid', reTopid);
			returnModel.set('zcnum', 0);
			returnModel.set('articleTitle','');
			var view = new CommentItemView({model: returnModel});
			self.$content.append(view.render().el);

			// hidden addcomment view and indicator
			setTimeout(function(){
				self.$addElForBackButton.trigger('click');
				self.$content.parent().scrollTop( self.$content.height() );
				self.$addElForCommentTextArea.val('');
				myApp.hideIndicator();
				self.tips({text:'评论成功！'})
			}, 300);

		},

		postCommentZcnumItem: function() {

		},

		postCommentItem: function(commentItemView, quoteUserName, topId, plId) {
			var self = this;

			var topId = topId || 0;
			var plId = plId || 0;

			if (!self.isLogin(self)) return;

			(!quoteUserName) ? self.$addElForTitle.html('写评论') : self.$addElForTitle.html('回复' + quoteUserName + '评论');

			setTimeout(function() {
				self.$addElForCommentTextArea.focus();
			},0);

			var postCommentHandle = function() {
				var store = WebStorage.get().userinfo;
				var sayText = self.$addElForCommentTextArea.val();
				var userid = store.userid;
				var username = store.username;
				var articleId = self.articleId;
				var classId = self.classId;

				if (!sayText) {
					alert('请输入评论');
					self.$addElForCommentTextArea.focus();
					return;
				}

				self.collection.create({
					saytext: sayText,
					username: username,
					quoteUserName: quoteUserName || '',
					userid: userid,
					articleid: articleId,
					classid: classId,
					topid: topId,
					plid: plId
				}, {
					wait: true
				});

				myApp.showIndicator();
			}

			if (commentItemView) AppUi.exSlide.call(commentItemView);

			self.$addElForBackButton.off().one('click', _.bind(AppUi.exSlide, self.$addElForBackButton[0]));

			self.$addElForPostButton.off().on('click', postCommentHandle);
		},

		controlPageClickEvents: function() {

		},

		controlKeybordValue: function() {

		},

		quoteOrVoteCommentItem: function() {

			var self = this;

			// quote action html tempalte 
			var quoteActionTemp = '<div class="comment-popover">' +
										'<div class="comment-popover-angle"><i class="iconfont icon-down"></i></div>' +
										'<div class="comment-popover-inner">' +
											'<ul>' +
												'<li class="digg"><i class="iconfont icon-digg"></i><span>支持</span></li>' +
												'<li class="quote"><i class="iconfont icon-comment"></i><span>回复</span></li>' +
											'</ul>' +
										'</div>' +
									'</div>';
			
			var commentItemDelegateHandle = function(event) {

				event.preventDefault();

				if ($(this).hasClass('comment-item') && $(this).find('.comment-popover').length === 0) {
					$('.comment-item .comment-popover').remove();
					$(this).append(quoteActionTemp);
				} else {
					$(this).find('.comment-popover').remove();
				}

				if ($(this).hasClass('digg')) {
					var thisItem = $(this).parents('.comment-item');
					var plId = thisItem.attr('data-plid');

					diggHandle(this, plId);
				}

				if ($(this).hasClass('quote')) {
					var thisItem = $(this).parents('.comment-item');
					var thisPopover = thisItem.find('.comment-popover');
					var quoteUserName = thisItem.find('.comment-item-userName').html();
					var plId = thisItem.attr('data-plid');
					var topId = thisItem.attr('data-topid');
					var reTopId = (topId === '0') ? plId : topId;
					quoteHandle(this, quoteUserName, reTopId, plId);
					thisPopover.empty();
				}
			}

			var diggHandle = function(diggEl, plId) {
				var getItemZcnumEl = $(diggEl).parents('.comment-item').find('.comment-item-zcnum');
				var getItemZcnumValue = getItemZcnumEl.find('.comment-item-zcnum-text');
				var getSessionValue = JSON.parse(sessionStorage.getItem('session')) || [];
				var url = Global.app.opts.url + 'a=comment&methodType=votecomment&plid=' + plId;

				if ( _.some(getSessionValue, function(v){return v.plid == plId}) ) {
					console.log('ok');
					self.tips({text:'你已赞过了！', className: 'icon-round-close'})
					return;
				} else {
					getSessionValue.push({'plid': plId});
					sessionStorage.setItem('session', JSON.stringify(getSessionValue));
				}

				var success = function(response) {
					if (response.code === '0') {
						getItemZcnumEl.addClass('zcnum-overlay-visible').css('background','#e21a22');
						getItemZcnumValue.html(response.zcnum);
					}
				}

				$.ajax({
				  type: "POST",
				  url: url,
				  data: {plid: plId},
				  success: success,
				  dataType: "json"
				});
			}

			var quoteHandle = function(quoteEl, quoteUserName, topId, plId) {
				self.postCommentItem(self.$viewPostComment[0], quoteUserName, topId, plId);
			}

			// delegate 
			self.$content.undelegate().delegate('.comment-item, .comment-item .comment-popover li', 'click', commentItemDelegateHandle);

			self.$el.find('.scroll').scroll(function(){
				$('.comment-item .comment-popover').fadeOut();
			})
		},

		isLogin: function(self) {

			var self = self;
			var createElem = $('<div data-vin="view-login" data-sd="popin"></div>')
			var logView = $('#view-login');
			var logViewRightCloseBtn = logView.find('.login-right-close');

			var resultCallback = function(re) {
				if (re !== 2) return;
				logViewRightCloseBtn.attr('data-vin','view-comment');
				AppUi.exSlide.call(createElem[0]);
			}

			var logged = function() {
				var self = this;
				var outView = $('section.active');
				outView.removeClass('active').addClass('hidden');
				$('#view-comment-add').removeClass('hidden').addClass('active');
				self.postCommentItem();
			}

			$$(document)[0].addEventListener('logged', _.bind(logged, self), false);

			// check user is login
			if (!UserLogin.isLoginFunc()) {
				MemberCenter.render();
				try {
					window.navigator.notification.confirm("未登录请登录后继续操作", resultCallback, "", ["取消", "确定"]);
				} catch (err) {
					// debug
					if (confirm('未登录请登录后继续操作'))
						resultCallback(2)
					else
						return;
				}
				return false;
			} 
			else {
				return true;
			}
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
		}

	});

	return new ArticleComment({collection: CommentCollection});
});