
define ([
	'underscore',
	'backbone',
	'webStorage',
	'namespace'
], function(_, Backbone, WebStorage, Global) {

	var ArticleCommentAdd = Backbone.View.extend({

		el: '#view-comment-add',

		initialize: function() {
			console.log('showCommentAdd');
		},

		render: function(classid, plid) {
			
			console.log(arguments)
		},

	});

	return new ArticleCommentAdd();
});