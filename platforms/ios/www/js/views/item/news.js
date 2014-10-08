
define ([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/item/newsItem.html'
], function($, _, Backbone, TplItem) {

	var NewsItemView = Backbone.View.extend({
		className: 'item',
		template: _.template(TplItem),
		render: function() {
			this.$el.html( this.template(this.model.toJSON()) );
			return this;
		}
	});
	return NewsItemView;
})