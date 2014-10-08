
define ([
	'underscore',
	'backbone',
	'models/picture'
], function(_, Backbone, pictureModel) {

	var PictureCollection = Backbone.Collection.extend({
		model: pictureModel,
	});

	return new PictureCollection();

})