
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var newsModel = Backbone.Model.extend({
		initialize: function() {
			this.set('moviesay', this.get('moviesay').replace(/(&nbsp;)/g,''));
		}
	});

	return newsModel;
})