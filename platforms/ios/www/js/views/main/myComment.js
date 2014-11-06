
define ([
	'jquery',
	'underscore',
	'backbone',
	'collections/myCommentCollection',
	'views/item/commentItemView',
	'namespace',
	'webStorage',
	'appUI'
], function($, _, Backbone, MyCommentCollection, CommentItemView, Global, WebStorage, AppUI) {

	var MyCommentListView = Backbone.View.extend({

		initialize: function() {
			this.listenTo(this.collection, 'reset', this.renderAll);
			this.listenTo(this.collection, 'reset', _.bind(this.bindArticleEl, this));
		},

		render: function() {

			this.$el = $('#view-myComment');
			this.$vOut = $('section.active');
			this.$nav = $('nav');
			this.$content = this.$el.find('.content');

			var userid = WebStorage.get().userinfo.userid;
			if (!userid) return;

			var opts = {
				cache: false,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=comment&methodType=getUserComment&userid=' + userid
			}; 

			this.collection.fetch(opts);
			
			// show comment page
			this.showMyCommentPage();

			myApp.showIndicator();
		},

		showMyCommentPage: function() {
			this.$vOut.removeClass('active');
			this.$vOut.addClass('hidden');
			this.$el.removeClass('hidden');
			this.$el.addClass('active');
			this.$nav.addClass('nav-out');
			this.$nav.removeClass('nav-in');
		},

		renderAll: function(collections) {
			var self = this;
			var commentItemViewEl = [];
			collections.each(function(commentTtemView){
				var view = new CommentItemView({model: commentTtemView});
				commentItemViewEl.push(view.render().el);
			});
			self.$content.html(commentItemViewEl);
			myApp.hideIndicator();
		},

		bindArticleEl: function() {

			var delagetHandle = function() {
				$('section#view-newsDetail button').attr('data-vin', 'view-myComment');
				AppUI.exSlide.call(this);
			}

			this.$content.undelegate().delegate('.comment-item-articleTitle', 'click', delagetHandle);
		}

	});

	return new MyCommentListView({ collection: MyCommentCollection });
});