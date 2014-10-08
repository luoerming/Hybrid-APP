
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var NewsSliderModel = Backbone.Model.extend({
		defaults: {
	      title: 'unamed'
	    }
	});

	return NewsSliderModel;
})