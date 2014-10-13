
define ([
	'underscore',
	'backbone',
	'router',
	'views/app',
	'namespace'
], function(_, Backbone, AppRoute, AppView, Global ) {
	var initialize = function() {
		Global.app = {
			appRouter: AppRoute,
			opts: {
				url : 'http://192.168.1.111//app.php?m=mobile&'
				// url : 'http://www.biketo.com/app.php?m=mobile&'
			}
		};

		Backbone.history.start({pustState: true});
	};
	
	// 返回全局初始化函数，供初始化javascript脚本调用。
	return {
		initialize : initialize
	};
})