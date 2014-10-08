
define ([
	'underscore',
	'backbone',
	'models/news'
], function(_, Backbone, newsModel) {

	var NewsCollection = Backbone.Collection.extend({
		model: newsModel,
	});

	return new NewsCollection();

})