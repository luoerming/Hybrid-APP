
define ([
	'underscore',
	'backbone',
	'text!templates/item/favorItem.html'
], function(_, Backbone, TplItem) {

	var FavorItemView = Backbone.View.extend({
		className: 'item',
		template: _.template(TplItem),
		render: function() {
			this.el.innerHTML = this.template(this.model);
			return this;
		}
	});
	return FavorItemView;
})