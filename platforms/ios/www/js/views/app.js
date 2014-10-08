
define ([
	'jquery',
	'underscore',
	'backbone',
	'views/main',
	'fetchCache',
	'fastclick',
	'appUI'
], function($, _, Backbone, mainView, FetchCache, FastClick, AppUI) {

	var AppView = Backbone.View.extend({
		el: 'body',
		initialize: function() {
			this.main = mainView;
			this.render();
			FastClick.attach(document.body);
			AppUI.init();
		},
		render: function() {
			this.$el.append( this.main.render().el ); // 主体视图
			return this;
		}
	});

	// 返回全局实例对象，包含MainView和 ...
	return new AppView();
})