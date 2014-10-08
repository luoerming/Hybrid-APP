
define ([
	'underscore',
	'backbone',
	'models/video'
], function(_, Backbone, videoModel) {

	var VideoListCollection = Backbone.Collection.extend({
		initialize: function() {
			// console.log(this)
		},
		model: videoModel,
	});

	return new VideoListCollection();

})