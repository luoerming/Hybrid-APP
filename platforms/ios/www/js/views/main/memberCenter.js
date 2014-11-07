/**
 * 新闻列表：
 */
define ([
	'jquery',
	'underscore',
	'backbone',
	'namespace',
	'views/main/userLogin',
	'views/main/userFavor',
	'views/main/userLogin',
	'appUI',
	'webStorage'
], function($, _, Backbone, Global, UserLogin, UsrFavorList, UserLogin, AppUI, WebStorage) {

	var MemberCenter = Backbone.View.extend({
		
		initialize: function() {
			$$ = window.Dom;
		},

		render: function() {

			this.$el = document.querySelector('#view-member');
			this.$el.loginButton  = this.$el.querySelector('.member-header-wrapper');
			this.$el.logoutButton = this.$el.querySelector('.logoutButton'); 
			this.$el.userName = this.$el.querySelector('.member-item-inner-title .logged');
			this.$el.userRegister = this.$el.querySelector('.member-item-inner-info .logged span');
			this.$el.userPicture = this.$el.querySelector('.member-profile-picture .profile-picture');
			this.$nav = document.querySelector('nav');
			this.$userLogoutWrap = $(this.$el).find('.user-logout').parent();

			// listener login event and update login stutus...
			$$(document)[0].addEventListener('logouted', _.bind(this.updateLoginStatus, this, false), false);
			$$(document)[0].addEventListener('logged', _.bind(this.updateLoginStatus, this, true), false);
			UserLogin.isLoginFunc() ? this.updateLoginStatus(true) : this.updateLoginStatus(false);
		
			// initialize UserLogin
			UserLogin.render();

			_.once(this.initClicaks());

		},

		updateLoginStatus: function(isLogin) {
			if (isLogin) {
				var store = WebStorage.get().userinfo;
				this.$el.loginButton.removeEventListener('click', AppUI.exSlide, false);
				this.$el.loginButton.classList.add('logged');
				this.$el.userName.innerHTML = store.username;
				this.$el.userRegister.innerHTML = store.registertime;
				this.$el.userPicture.src = 'http://ucbike0.biketo.com/avatar.php?uid=' + store.userid + '&size=big'
				
				this.$userLogoutWrap.show();

				myApp.hideIndicator();
			} 
			else {
				this.$el.loginButton.addEventListener('click', AppUI.exSlide, false);
				this.$el.loginButton.classList.remove('logged');

				this.$userLogoutWrap.hide();
			}
		},

		initClicaks: function() {
			var self = this;
			var memberNavDelegateHandle = function(e) {
				var clicked = $(this);
				if (clicked.hasClass('article-fontSize')) {
					delateFunc.goToArticleFontSize.call(clicked);
				}
				if (clicked.hasClass('switch__input')) {
					delateFunc.setSwitchNigth.call(clicked);
				}
				if (clicked.hasClass('clear-cache')) {
					delateFunc.clearCache.call(clicked);
				}
				if (clicked.hasClass('itunes-grade')) {
					delateFunc.itunesGrade.call(clicked);
				}
				if (clicked.hasClass('about-biketo')) {
					delateFunc.aboutBiketo.call(clicked);
				}
				if (clicked.hasClass('view-favor')) {
					AppUI.exSlide.call(clicked[0]);
				}
				if (clicked.hasClass('view-comment')) {
					delateFunc.showMyComment.call(clicked[0]);
				}
				if (clicked.hasClass('view-feedback')) {
					delateFunc.sendMail.call(clicked);
				}
				if (clicked.hasClass('user-logout')) {
					UserLogin.logoutFunc();
					$(clicked).parent().fadeOut();
					self.tips({text:'已登出！'})
				}

			}
			var delateFunc = {
				goToArticleFontSize: function() {
					var el = $('#view-articleFontSize');
					var range = el.find('.range-title .range');
					var pervieText = el.find('.preview-text p');

					var storeFontsize = WebStorage.get().fontsize;
					range.val(storeFontsize);
					pervieText.css('font-size', storeFontsize + 'px');

					range.change(function() {
						var fontSize = $(this).val();
						pervieText.css('font-size', fontSize + 'px');
						WebStorage.set({'fontsize': fontSize});
					})

					AppUI.exSlide.call(this[0]);
				},

				setSwitchNigth: function() {
					if ($(this).is(':checked')) {
						WebStorage.set({'switchNight': 'true'});
						$('html').addClass('isNigth');
					} else {
						WebStorage.set({'switchNight': 'false'});
						$('html').removeClass('isNigth');
					}
				},

				clearCache: function() {
					var self = $(this);
					var tipsWrape = $('.commom-tips');
					var tipsText = tipsWrape.find('.text');

					tipsWrape
					.addClass('fadeOut animated')
					.on('webkitAnimationEnd', function() {
						$(this).removeClass('fadeOut animated');
					});

					self.find('.item-after').html('0.00 MB');
					tipsText.html('清除完成！');
					localStorage.setItem('backboneCache', '');
				},

				itunesGrade: function() {
					window.location.href = 'itms-apps://itunes.apple.com/app/id852965719';
				},

				aboutBiketo: function() {
					var el = $('#view-aboutBiketo');
					var aboutActionHandle = function() {
						var clicked = $(this);
						if (clicked.hasClass('biketo-team')) {
							AppUI.exSlide.call(clicked[0]);
							console.log(clicked[0])
						}
						if (clicked.hasClass('about-us')) {
							AppUI.exSlide.call(clicked[0]);
						}
					}
					$('#view-aboutBiketo .list-block ul').undelegate().delegate('li', 'click', aboutActionHandle);
					AppUI.exSlide.call(this[0]);
				},

				showMyComment: function() {
					var self = this;
					var createElem = $('<div data-vin="view-login" data-sd="popin"></div>')
					var logView = $('#view-login');
					var logViewRightCloseBtn = logView.find('.login-right-close');

					var resultCallback = function(re) {
						if (re !== 2) return;
						logViewRightCloseBtn.attr('data-vin','view-member');
						AppUI.exSlide.call(createElem[0]);
					}
					// check user is login
					if (!UserLogin.isLoginFunc()) {
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
						AppUI.exSlide.call(self)
					}
				},

				sendMail: function() {
					var tipsText = '检测到您并没有配置邮箱, 请打开系统设置 》邮箱 》添加邮件（或联系:carol@biketo.com）';
					var resultCallback = function() {};
					cordova.plugins.email.isAvailable(function (valu) {
						if (valu) {
							cordova.plugins.email.open({
							    to: 'carol@biketo.com',
							    cc: '',
							    bcc: [],
							    subject: '',
							    body: ''
							});
						} else {
							window.navigator.notification.alert("", resultCallback, tipsText);
						}
					});
				},

			}

			// init localStorage value 
			var initStorageValue = (function() {
				var showCacheSizeWrape = $(self.$el).find('.member-nav-wrapper ul li.clear-cache .item-after');
				var cacheSize = ((localStorage['backboneCache'].length * 2)/1024/1024).toFixed(2) + ' MB';
				showCacheSizeWrape.html(cacheSize);


			})();

			$(self.$el).undelegate().delegate('li.article-fontSize, li.checkbox, li.switch-night input.switch__input, li.clear-cache, li.version-upgrades, li.itunes-grade, li.about-biketo, li.user-logout, .view-favor, .view-comment, .view-feedback', 'click', memberNavDelegateHandle);
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

	return new MemberCenter();
	// return new MemberCenter({ collection: memberCenterViewItem });
});