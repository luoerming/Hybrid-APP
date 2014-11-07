
define ([
	'jquery',
	'underscore',
	'backbone',
	'collections/pictureListCollection',
	'views/item/picture',
	'namespace',
	'iscroll',
	'appUI'
], function($, _, Backbone, PictureListCollection, PictureItemView, Global, Iscroll, AppUI) {

	var PictureView = Backbone.View.extend({
		initialize: function() {
			// Set Default Value
			this._isCache = false; // 判断是否更新缓存
			this._isTips = false; // 判断是否显示提示
			this._page = 1;
			this._cid = 1;

			this.listenToOnce( this.collection, 'reset', this.PictureScroll ); // 初始化iscroll (仅一次)
			this.listenTo( this.collection, 'reset', this.renderAll );
		},
		
		render: function() {

			// Get DomElements
			$iscrollWrap = $('#view-picture .scroll'),
			$pictureList = $('#view-picture .scroll .iscroll .content'),
			$refershFull = $('#view-picture .pulldown, #view-picture .pullup');
			$pictureList.css({ 'min-height' : $iscrollWrap.height() }); //动态设置iscroller的高

			var opts = { // fetch Datas options
				cache: true,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=render&classid=' + this._cid + '&page=' + this._page + '&showType=pictureList'
			};

			// 更新缓存数据
			(this._isCache) && this.updateCache( opts.url );

			// 获取数据
			this.collection.fetch( opts );

			if (!this._isCache) myApp.showIndicator();
		},

		// 初始iscroll插件
		PictureScroll: function() {
			$refershFull.show();
			pictureScroll = Iscroll.newVerScrollForPull( $iscrollWrap, _.bind(this.pulldownAction, this), _.bind(this.pullupAction, this) );
		},

		// 下拉执行逻辑 (更新)
		pulldownAction : function () {
			this._isCache = this._isTips = true;
			this._page = 1;
			this._cid = 1;
			this.render();
		},

		// 上拉执行逻辑 （下一页）
		pullupAction : function () {
			this._isCache = _isJump = false;
			this._page ++;
			this.render();
			myApp.hideIndicator()
		},

		// 渲染数据
		renderAll: function( collection ) {

			if (collection.models.length === 0) {
				$iscrollWrap.find('.pullup').hide();
				return;
			}
			else {
				$iscrollWrap.find('.pullup').show();
			}

			var self = this, liArr = [];

			if (collection.length === 0) return;

			// 循环数据
			collection.each(function( model, i ) {
				var view = new PictureItemView({ model: model });
				liArr.push( view.render().el );
			});

			// 添加至DOM
			$pictureList[ this._isCache ? 'html' : 'append' ]( liArr );

			this.bindAppUISlide();

			//数据加载完成后改变状态
			pictureScroll.refresh();  
			
			// 提示信息
			this.tips();

			myApp.hideIndicator();

		},

		bindAppUISlide: function() {
			var delegateHandle = function() {
				AppUI.exSlide.call(this);
			}
			$pictureList.undelegate().delegate('dl', 'click', delegateHandle);

			console.log("ok")
		},

		// 更新缓存数据
		updateCache: function(url) {
			var fetchCacheObject = Backbone.fetchCache._cache;
			var filterCacheItemArray = _.filter(_.keys(fetchCacheObject), function(key) { return key.indexOf(url) !== -1 });
			for (var i = 0; i < filterCacheItemArray.length; i++) Backbone.fetchCache.clearItem(filterCacheItemArray[i]);
		}, 

		// 提示动画
		tips: function() {
			var notice = $('#view-picture .noticeFinished');
			var self = this;

			( this._isTips ) && notice.show();

			notice.on('webkitAnimationEnd', function(){
				notice.hide(); 
				this._isTips = false;
			});
		}

	});

	return new PictureView({ collection: PictureListCollection });
});