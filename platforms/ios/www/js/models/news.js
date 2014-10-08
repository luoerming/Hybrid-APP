
define ([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var newsModel = Backbone.Model.extend({

		initialize: function() {

			// var getFetchCacheKey = _.keys(Backbone.fetchCache._cache);

			// for (var i = 0; i < getFetchCacheKey.length; i++) {

			// 	if (getFetchCacheKey[i].indexOf(this.get('id') === -1)) {
			// 		console.log(getFetchCacheKey[i])
			// 	}

			// }
		},

		defaults: {
	      title: 'unamed',
	      visited: false
	    }

	});

	return newsModel;
})