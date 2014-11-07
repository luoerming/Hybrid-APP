
define ([
	'underscore',
	'backbone',
	'webStorage',
	'namespace',
	'appUI',
], function(_, Backbone, WebStorage, Global, AppUI ) {

	var UserLogin = Backbone.View.extend({

		initialize: function() {
			this.passwordErrorCount = 0;
			// this.isLoginFunc();
		},
		
		render: function() {
			this.$el = document.querySelector('#view-login');
			this.$el.loginClose    = this.$el.querySelector('button.login-right-close');
			this.$el.userNameInput = this.$el.querySelector('input[type="text"]');
			this.$el.passwordInput = this.$el.querySelector('input[type="password"]');
			this.$el.submitButton  = this.$el.querySelector('button.login-button');
			this.$el.loginTipsText = this.$el.querySelector('.login-tips .text');
			this.$el.tipsWrap 	   = this.$el.loginTipsText.parentNode;
			this.$el.passwordErrorCount = this.$el.querySelector('.login-tips p.password-tips');
			this.$el.ajaxCallback  = 'BIKETO_' + Date.parse(new Date());

			// member view elements
			this.$memberEl = document.querySelector('#view-member');
			this.$memberEl.memberViewLoginHeader = this.$memberEl.querySelector('.member-header-wrapper');

			this.listenerNativeKeybordEvent();
			$(this.$el.submitButton).off().on('click', _.bind(this.submitButtonValidatorFunc, this));
		},

		showMemberView: function() {
			var self = this;
		
			self.$el.classList.remove('active');
			self.$el.classList.add('fadeOut');
			self.$el.classList.add('hidden');
			setTimeout(function(){ self.$el.classList.remove('fadeOut'); }, 2000);
			this.$memberEl.classList.remove('hidden');
			this.$memberEl.classList.add('active');

			self.$memberEl.memberViewLoginHeader.removeEventListener('click', AppUI.exSlide, false);
			self.$memberEl.memberViewLoginHeader.classList.add('logged');

			$$(document).trigger('logged');
		},

		// listener ios or android Native event
		listenerNativeKeybordEvent: function() {
			var self = this;
			var clicksHandle = function(e) {

				// You pressed enter!
				if (e.which == 13) cordova.plugins.Keyboard.close(true);
				 $(self.$el).find('.scrollWrap').css('margin-top','-110px');
				// console.log(this);
				try {
					window.addEventListener('native.keyboardhide', keyboardHideHandler);
				} catch (err) {
					console.log(err);
					$(window).trigger('native.keyboardshow');
				}
				function keyboardHideHandler(e){
					console.log('hide')
				    $(self.$el).find('.scrollWrap').css('margin-top','0');
				}
			}

			$(self.$el).undelegate().delegate('input', 'focus keyup keyup', clicksHandle);
		},

		submitButtonValidatorFunc: function(e) {
			var self = this,
				userNamelValue = self.$el.userNameInput.value,
				passwordValue = self.$el.passwordInput.value;
			
			console.log(e)

			// show tips wrapper
			this.$el.tipsWrap.classList.contains('hidden') && this.$el.tipsWrap.classList.remove('hidden')

			// show tips text 
			if (userNamelValue.length > 2 && passwordValue.length > 5) {
				self.$el.submitButton.disabled = self.$el.userNameInput.disabled = self.$el.passwordInput.disabled = true;
				// self.$el.submitButton.innerHTML = '登录中请稍后 ...';
				myApp.showIndicator();
				self.postServerValidatorFunc(userNamelValue, passwordValue);
			}
			else {
				if (userNamelValue.length <= 0) {
					self.$el.userNameInput.focus();
					self.$el.loginTipsText.innerHTML = '请输入用户名';
				}
				else if (userNamelValue.length <= 2) {
					self.$el.userNameInput.focus();
					self.$el.loginTipsText.innerHTML = '用户名错误';
				}
				else if(passwordValue.length <= 0) {
					self.$el.passwordInput.focus();
					self.$el.loginTipsText.innerHTML = '请输入密码';
				}
				else if(passwordValue.length < 5) {
					self.$el.passwordInput.focus();
					self.$el.loginTipsText.innerHTML = '密码小于6位数';
				}
				self.$el.querySelector('.scrollWrap').style.marginTop = '-110px';
			}

			// toggle tips className 
			self.$el.tipsWrap.classList.toggle('active');

			var onAnimationend = function() {
				self.$el.tipsWrap.classList.remove('active');
			}
			self.$el.tipsWrap.addEventListener('webkitAnimationEnd', onAnimationend, false);
		},

		postServerValidatorFunc: function(emailValidate, passwordValidate) {
			var self = this,
				ajaxValue = '&callback=' + self.$el.ajaxCallback + '&username=' + emailValidate + '&userpass=' + passwordValidate;
			$$.ajax({
				url: Global.app.opts.url + 'a=login' + ajaxValue,
				type: "post", //请求类型,可为get或post
				isJson: false,
				success: function(response) {
					var responseParse = JSON.parse(response);
					// 登录成功
					if (responseParse.code === '0') {
						self.$el.loginTipsText.innerText = '登录中...';
						self.setUserTokenFunc(responseParse);
						self.showMemberView();

						setTimeout(function(){
							self.$el.loginTipsText.parentNode.classList.add('hidden');
							self.$el.userNameInput.value = '';
							self.$el.passwordInput.value = '';
						}, 300)
						// console.log(responseParse)
					}
					// 用户不存在
					if (responseParse.code === '40001') {
						self.$el.userNameInput.focus();
						self.$el.loginTipsText.innerText = '用户不存在';
					}
					// 用户密码错误
					if (responseParse.code === '40002') {
						self.passwordErrorCount ++;
						self.$el.loginTipsText.innerText = '密码错误';
						(self.passwordErrorCount >= 3) && self.$el.passwordErrorCount.classList.add('active');
					}
					// 用户未审核
					if (responseParse.code === '40003') {
						self.$el.loginTipsText.innerText = '用户未审核';
					}
					self.$el.submitButton.disabled = self.$el.userNameInput.disabled = self.$el.passwordInput.disabled = false;
					self.$el.submitButton.innerHTML = '登 录';
					myApp.hideIndicator();
				}
			});
		},

		// listenerKeybordFunc: function(e) {
		// 	var self = this;
		// 	// (self.$el.userNameInput.value.length < 3 || self.$el.passwordInput.value.length < 6) ? self.$el.submitButton.disabled = true : self.$el.submitButton.disabled = false;

		// 	console.log('You pressed enter!')
		// },

		userEmailValidatorFunc: function(emailString) {
			var atpos = emailString.indexOf('@'),
				dotpos = emailString.lastIndexOf(".");
			return !(atpos < 1 || dotpos < atpos +2 || dotpos >= emailString.length);
		},

		setUserTokenFunc: function(response) {
			delete response.massage;
			delete response.code;
			WebStorage.set({'userinfo': response });
		},

		isLoginFunc: function() {
			var getStorageUserToken = WebStorage.get().userinfo;
			 return !(getStorageUserToken === '0');
		},

		logoutFunc: function() {
			WebStorage.set({'userinfo': '0'});
			console.log('logouted ....');
			$$(document).trigger('logouted');
		},

	});

	return new UserLogin();
});