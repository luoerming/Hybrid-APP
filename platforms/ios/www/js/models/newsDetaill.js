
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var newsDetaillModel = Backbone.Model.extend({
		initialize: function() {
			// this.set({
			// 	title: JSON.parse(sessionStorage.getItem('currentVarible')).title,
			// });
		}
	});

	return newsDetaillModel;
})