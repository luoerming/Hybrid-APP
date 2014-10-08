
define ([
	'jquery',
	'underscore',
	'backbone',
], function($, _, Backbone) {

	var HeaderView = Backbone.View.extend({

		el: $('nav'),

		navigationHover: function(classid) {
			var navLi = $('#view-list .nav ul li');
			$.each(navLi, function() {
				var navClassId = $(this).attr('data-classid');
				var hoverClassId = classid;
				if(navClassId == hoverClassId) {
					$.each(navLi, function(){
						$(this).removeClass('hover');
					})
					$(this).addClass('hover');
				}
			})
		},

	});

	return new HeaderView();
})