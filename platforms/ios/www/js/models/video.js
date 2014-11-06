
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var videoModel = Backbone.Model.extend({
		initialize: function() {
			this.set('moviesay', this.get('moviesay').replace(/(&nbsp;)/g,''));
		}
	});

	return videoModel;
})