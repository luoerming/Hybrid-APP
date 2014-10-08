
define ([
	'underscore',
	'backbone',
	'models/picture'
], function(_, Backbone, pictureModel) {

	var PictureListCollection = Backbone.Collection.extend({
		model: pictureModel,
	});

	return new PictureListCollection();

})