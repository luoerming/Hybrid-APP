
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
	'webStorage'
], function($, _, Backbone, NewsCollection, NewsSliderCollection, NewsItemView, Global, Iscroll, Slider, 
	WebStorage) {

	var NewsListView = Backbone.View.extend({

		el: '#view-list',

		initialize: function() {
			
			this._isJump = false; // 判断栏目跳转
			this._isCache = false; // 判断是否更新缓存
			this._isTips = false; // 判断是否显示提示
			this._page = 1;
			this._cid = 1;

			this.listenToOnce(this.collection, 'reset', this.newsListScroll); // 初始化iscroll (仅一次)
			this.listenTo(this.collection, 'reset', this.slider); // 渲染幻灯片数据 

			this.listenTo(this.collection, 'reset', this.renderAll); // 渲染列表数据 	
			
		},

		render: function(cid, page) {

			this._cid = cid;

			// 如果用户切换栏目
			if (this._cid != WebStorage.get().classId) {
				this._page = 1;
				this._isJump = true;
				this._isTips = false;
			};

			this.$newsListScrollWrepper = $('.news');
			this.$newsListScrollContent = $('.news .iScroll .content');
			this.$refershFull = $('.news .pulldown, .news .pullup');
			this.$newsListScrollContent.css({'min-height':this.$newsListScrollWrepper.height()}); //动态设置iscroller的高

			var opts = {
				cache: true,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=render&classid=' + this._cid + '&page=' + this._page + '&showType=newsList'
			};

			this.collection.fetch(opts);

			// 更新缓存数据
			if (this._isCache) {
				this.updateCache(Global.app.opts.url + 'a=render&classid=' + this._cid + '&page');
				// this.slider();
			}

		},

		// 幻灯片
		slider: function() {
			var self = this;
			if (this._page !== 1) { return; };
			var sliderWrap = this.$newsListScrollWrepper.find('.ui-sliderWrap');
			(sliderWrap) && sliderWrap.remove();
			$(this.$newsListScrollContent).before('<div class="ui-sliderWrap"><div class="ui-slider"></div></div>');

			var opts = {
				cache: true,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=render&classid=' + this._cid + '&page=0&showType=slideList'
			};

			NewsSliderCollection.fetch(opts);

			// 初始化一个幻灯片
			function buildSlider(collection) {
				var data = [],
					wrap = this.$newsListScrollWrepper[0].querySelector('.ui-sliderWrap .ui-slider'),
					wrapWidth = wrap['offsetWidth'] + 300;

				wrap.innerHTML = '';

				for (var i = 0; i < collection.models.length; i++) {
					collection.models[i].set('channelid', self._cid);
					data.push(collection.models[i].attributes);
				}

				var slider = new Slider({
					container : wrap, 
					dataList : data,
					urlExtend: 'd/imagecache/rewidth/' +wrapWidth,
					setAttr: true
				});
			};

			this.listenTo(NewsSliderCollection, 'reset', buildSlider); // 渲染数据
		},


		// 初始iscroll插件
		newsListScroll: function() {
			this.$refershFull.show();
			this.NewsListScroll = Iscroll.newVerScrollForPull( this.$newsListScrollWrepper, _.bind( this.pulldownAction, this ), _.bind( this.pullupAction, this ) );
		},

		// 下拉执行逻辑 (更新)
		pulldownAction : function () {
			var self = this;
			self._isCache = self._isTips = true;
			self._page = 1;
			self.render( WebStorage.get().classId, this._page);
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

			if (data.length === 0) {
				$('.news .pullup').hide()
				return;
			} else {
				$('.news .pullup').show()
			}

			// 循环数据
			data.each(function(model){
				model.set('channelid', self._cid);
				var view = new NewsItemView({ model: model });
				liArr.push( view.render().el );
			});

			// 添加至DOM
			self.$newsListScrollContent[(self._isJump || self._isCache) ? 'html' : 'append' ](liArr);
			
			this._isJump && this.NewsListScroll.scrollTo(0, -40, 0);

			//数据加载完成后改变状态
			self.NewsListScroll.refresh();

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
			var self = this,
				notice = $('#view-list .noticeFinished');

			self._isTips ? notice.show() : notice.hide();
			function onAnimate() {
				self._isTips = false;
				notice.hide(); 
			}
			notice.on('webkitAnimationEnd', onAnimate);
		}

	});

	return new NewsListView({collection: NewsCollection});
});