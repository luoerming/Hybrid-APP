
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var pictureModel = Backbone.Model.extend({
		defaults: {
	      title: 'unamed',
	      count: ''
	    }
	});

	return pictureModel;
})