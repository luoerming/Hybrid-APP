
define ([
	'jquery',
	'underscore',
	'backbone',
	'namespace',
	'collections/pictureCollection',
	'slider',
	'hammer',
	'views/main/userFavor'
], function($, _, Backbone, Global, PictureCollection,  Slider, Hammer, UserFavor) {

	var PictureDetailView = Backbone.View.extend({

		initialize: function() {
			this.listenTo(this.collection, 'reset', this.renderAll);
		},
		
		render: function(aid) {
			var self = this;
			this.aid = aid;
			this.collection.fetch({
				reset: true,
				cache: false,
				expires: 3000,
				url: Global.app.opts.url + 'a=render&classid=' + 120 + '&aid=' + aid 
			});
		},

		renderAll: function(collection) {
			this.$wrap = $('#view-pictureDetail');
			this.$content = this.$wrap.find('.content');
			this.$sliderWrap = this.$content.find('.ui-slider');
			this.$sliderWrap.html('').height(this.$wrap.height());

			var title = collection.models[0].get('title');
			var morepic = collection.models[0].get('morepic');
			var data = [];
			for (var i = 0; i < morepic.length; i++) {
				data.push(morepic[i]);
			}
			var slider = new Slider({
				container: this.$sliderWrap[0],
				dataList: data,
				title: title,
				multiTouch: true, // 多手势操作
				urlExtend: false, // 不使用扩展地址
				showDots: false, // 取消点显示，则使用数字类型
			});

			this.pictureFavor(collection.models[0]);
		},

	});

	// 详情新闻
	return new PictureDetailView({ collection: PictureCollection });
})

