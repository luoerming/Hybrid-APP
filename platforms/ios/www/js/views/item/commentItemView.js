
define ([
	'jquery',
	'underscore',
	'backbone',
	'namespace',
	'text!templates/item/commentItemView.html',
	'appUI'
], function($, _, Backbone, Global, TplItem, AppUI) {

	var CommentItemView = Backbone.View.extend({

		className: 'comment-item',

		attributes: {
			'data-vin': 'view-login',
			'data-sd': 'popin',
		},

		template: _.template(TplItem),

		initialize: function() {
			// this.$el.attr('data-return','#comment/' +this.model.get('aid'));
			this.$el.attr('data-plid', this.model.get('plid'));
			this.$el.attr('data-topid', this.model.get('topid'));
			this.$el.attr('data-zcnum', this.model.get('zcnum'));
		},

		render: function() {
			this.$el.html( this.template(this.model.toJSON()) );
			return this;
		}
	});
	return CommentItemView;
})