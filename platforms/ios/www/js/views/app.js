
define ([
	'jquery',
	'underscore',
	'backbone',
	'views/main',
	'fetchCache',
	'fastclick',
	'appUI',
	'webStorage'
], function($, _, Backbone, mainView, FetchCache, FastClick, AppUI, WebStorage) {

	var AppView = Backbone.View.extend({
		el: 'body',
		initialize: function() {
			this.main = mainView;
			this.render();
			FastClick.attach(document.body);
			AppUI.init();
			this.initIsNight();
		},

		render: function() {
			this.$el.append( this.main.render().el ); // 主体视图
			return this;
		},

		initIsNight: function() {
			var getStorageSwitchNigthValue = WebStorage.get().switchNight;
			var isSwitchNigth = getStorageSwitchNigthValue === 'true' ? true : false
			var switcheNightEl = $('#view-member .member-nav-wrapper li.switch-night input.switch__input');
			isSwitchNigth ? $('html').addClass('isNigth') : $('html').removeClass('isNigth')
			$(switcheNightEl).attr("checked", isSwitchNigth);
		}
	});

	// 返回全局实例对象，包含MainView和 ...
	return new AppView();
})