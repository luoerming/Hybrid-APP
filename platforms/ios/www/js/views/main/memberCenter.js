/**
 * 新闻列表：
 */
define ([
	'underscore',
	'backbone',
	'namespace',
	'views/main/userLogin',
	'views/main/userFavor',
	'appUI'
], function(_, Backbone, Global, UserLogin, UsrFavorList, AppUI) {

	var MemberCenter = Backbone.View.extend({
		
		initialize: function() {

		},

		render: function() {
			
			this.$el = document.querySelector('#view-member');
			this.$el.logoutButton = this.$el.querySelector('.logoutButton'); 
			this.$el.loginButton  = this.$el.querySelector('.member-header-wrapper');

			// login Verify
			// (UserLogin.isLoginFunc()) ? UserLogin.isShowLoginPage(false) : UserLogin.isShowLoginPage(true), UserLogin.render();

			// initailize userFavorList 
			UsrFavorList.render('show', {});
			
			// listtner button event's
			this.$el.logoutButton.addEventListener('click', UserLogin.logoutFunc, false);
			AppUI.memberContentLogin();
			UserLogin.render();

			// 如果已登录则接触绑定
			if (UserLogin.isLoginFunc()) { 
				this.$el.loginButton.removeEventListener('click', AppUI.exSlide, false);
				this.$el.loginButton.classList.add('logged');
			} else {
				this.$el.loginButton.addEventListener('click', AppUI.exSlide, false);
				this.$el.loginButton.classList.remove('logged');
			}

		},

		usrFavorList: function() {
			console.log('usrFavorList .... memberView ..... init ....')
		}

	});

	return new MemberCenter();
	// return new MemberCenter({ collection: memberCenterViewItem });
});