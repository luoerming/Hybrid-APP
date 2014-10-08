
define ([
	'jquery',
	'underscore',
	'backbone',
	'collections/newsCollection',
	'collections/newsSliderCollection',
	'views/item/news',
	'namespace',
	'iscroll',
	'slider',
	'appUI',
	'webStorage'
], function($, _, Backbone, NewsCollection, NewsSliderCollection, NewsItemView, Global, Iscroll, Slider, AppUI, WebStorage) {

	var NewsListView = Backbone.View.extend({

		el: '#view-list',

		initialize: function() {
			
			this._isJump = false; // 判断栏目跳转
			this._isCache = false; // 判断是否更新缓存
			this._isTips = false; // 判断是否显示提示
			this._page = 1;
			this._cid = 1;

			this.listenToOnce( this.collection, 'reset', this.Scroll ); // 初始化iscroll (仅一次)
			this.listenTo( this.collection, 'reset', this.renderAll ); // 渲染列表数据 	
			// this.listenTo( this.collection, 'reset', this.slider ); // 渲染幻灯片数据 
			
		},

		render: function(cid, page) {
			// Get DomElements
			this.$scrollWrap = $('.news'),
			this.$newsList = $('.news .iScroll .content'),
			this.$refershFull = $('.news .pulldown, .news .pullup'),
			this.$newsList.css({'min-height':this.$scrollWrap.height()}); //动态设置iscroller的高
			this._cid = cid;

			var cid = cid || 0;
			var page = page || 1;
			var oldCid = WebStorage.get().classId;

			// 更新缓存数据
			// if (this._isCache) {
			// 	this.updateCache(Global.app.opts.url + 'a=render&classid=' + cid + '&page');
			// 	this.slider();
			// }

			// 判断是否跳转栏目
			if (cid != oldCid) {
				this._page = 1;
				this._isJump = true;
				this._isTips = false;
			};

			// 获取数据
			this.collection.fetch({
				cache: false,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=render&classid=' + cid + '&page=' + page + '&showType=newsList'
			});
		},

		// 幻灯片
		slider: function() {

			if(this._page !== 1) return;

			var sliderWrap = this.$scrollWrap.find('.ui-sliderWrap');
			(sliderWrap) && sliderWrap.remove();
			$(this.$newsList).before('<div class="ui-sliderWrap"><div class="ui-slider"></div></div>');

			NewsSliderCollection.fetch({
				cache: false,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=render&classid=' + this._cid + '&page=0&showType=slideList'
			});

			var buildSlider = function(collection) {
				var data = [];
				var wrap = this.$scrollWrap[0].querySelector('.ui-sliderWrap .ui-slider');
				var wrapWidth = wrap['offsetWidth'] + 300;
				wrap.innerHTML = '';

				for (var i = 0; i < collection.models.length; i++) {
					data.push(collection.models[i].attributes);
				}
				var slider = new Slider({
					container : wrap, 
					dataList : data,
					urlExtend: 'd/imagecache/rewidth/' +wrapWidth,
				});
			};

			this.listenTo(NewsSliderCollection, 'reset', buildSlider); // 渲染数据
		},

		// 初始iscroll插件
		Scroll: function() {
			this.$refershFull.show();
			this.newsListScroll = Iscroll.newVerScrollForPull( this.$scrollWrap, _.bind( this.pulldownAction, this ), _.bind( this.pullupAction, this ) );
		},

		// 下拉执行逻辑 (更新)
		pulldownAction : function () {
			var self = this;
			self._isCache = self._isTips = true;
			self._page = 1;
			self.render( WebStorage.get().classId, this._page);

			console.log('更新中')
		},

		// 上拉执行逻辑 （下一页）
		pullupAction : function () {
			var self = this;
			self._isCache = this._isJump = false;
			self.render(WebStorage.get().classId, this._page++);
		},

		// 点击顶部滚动到最上
		holdTopScrollTo: function() {
			
		},
		// 渲染数据
		renderAll: function(data) {
			var self = this, liArr = [];

			if (data.length === 0) { return; };

			// 循环数据
			data.each(function(model){
				model.set('channelid', self._cid);
				var view = new NewsItemView({ model: model });
				liArr.push( view.render().el );
			});

			// 添加至DOM
			self.$newsList[(self._isJump || self._isCache) ? 'html' : 'append' ](liArr);

			self._isJump && self.newsListScroll.scrollTo(0, -40, 0 );
			self._isCache && self.newsListScroll.scrollTo(0, -40, 300);
			
			//数据加载完成后改变状态
			self.newsListScroll.refresh();

			//url跳转
			AppUI.newsSwitchTabs();

			// 提示信息
			this.tips();
		},

		// 更新缓存数据
		updateCache: function(url) {
			var fetchCacheObject = Backbone.fetchCache._cache;
			var filterCacheItemArray = _.filter(_.keys(fetchCacheObject), function(key) { return key.indexOf(url) !== -1 });
			for (var i = 0; i < filterCacheItemArray.length; i++) Backbone.fetchCache.clearItem(filterCacheItemArray[i]);
		}, 

		// 提示动画
		tips: function() {
			// var notice = $('#view-list .noticeFinished'),
			// 	self = this;
			// (this._isTips) && notice.show();
			// notice.on('webkitAnimationEnd', function() {
			// 	notice.hide(); 
			// 	this._isTips = false;
			// });
		}

	});

	return new NewsListView({collection: NewsCollection});
});