
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var CommentModel = Backbone.Model.extend({
		defaults: {
	      saytime: '刚刚',
	      quoteUsername: ''
	    }

	});
	return CommentModel;
})