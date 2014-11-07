
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
				cache: true,
				expires: 3000,
				url: Global.app.opts.url + 'a=render&classid=' + 120 + '&id=' + aid 
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

			myApp.hideIndicator();

			this.saveImagesToPhoto();
		},

		saveImagesToPhoto: function() {
			var self = this;
			var resultCallback = function() {};
			var success = function(msg){
			    self.tips({text: '已保存至相册'});
			};
			var error = function(err){
			    self.tips({text: '保存失败！未知错误：'+err+'', className: 'icon-round-close'});
			};
		
			var clicksHanle = function() {
				var imgesSrc = $(self.$sliderWrap).find('.item.current img')[0].src;

				window.saveImageToPhone(imgesSrc, success, error);

				return;
				
				var resultCallback = function(re) {
					if (re !== 2) return;
					

					window.saveImageToPhone(imgesSrc, success, error);
				}
				window.navigator.notification.confirm("你确定要保存图片？", resultCallback, "", ["取消", "确定"]);

			}
			$(this.$wrap).find('button.icon-share-down').off().on('click',clicksHanle);
		},

		tips: function(obj) {
			var tipsWrape = $('.commom-tips');
			var tipsText = tipsWrape.find('.text');
			var iconfont = tipsWrape.find('.iconfont');

			(obj.className === 'icon-round-close') ? iconfont.removeClass('icon-round-check').addClass('icon-round-close') : iconfont.addClass('icon-round-check');

			tipsWrape.addClass('fadeOut animated')
				.on('webkitAnimationEnd', function() {
					$(this).removeClass('fadeOut animated');
				});

			tipsText.html(obj.text);
		}

	});

	// 详情新闻
	return new PictureDetailView({ collection: PictureCollection });
})

