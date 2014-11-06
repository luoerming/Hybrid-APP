
define ([
	'underscore',
	'backbone',
	'models/comment'
], function(_, Backbone, commentModel) {

	var CommentCollection = Backbone.Collection.extend({
		model: commentModel,
		url: 'http://192.168.1.111/app.php?m=mobile&a=comment&methodType=addArticleComment',
	});

	return new CommentCollection();

})