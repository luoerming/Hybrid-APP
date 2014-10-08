
define ([
	'underscore',
	'backbone',
	'text!templates/item/videoItem.html'
], function(_, Backbone, TplItem) {

	var VideoItemView = Backbone.View.extend({

		className: 'item',

		template: _.template(TplItem),

		render: function() {
			this.el.innerHTML = this.template(this.model.toJSON());
			return this;
		}
		
	});
	return VideoItemView;
})