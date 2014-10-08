
define ([
	'underscore',
	'backbone',
	'models/newsSlider'
], function(_, Backbone, newsSliderModel) {

	var NewsSliderCollection = Backbone.Collection.extend({
		model: newsSliderModel,
	});

	return new NewsSliderCollection();

})