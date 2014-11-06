/**
 * 新闻列表：
 */
define ([
	'underscore',
	'backbone',
	'collections/videoListCollection',
	'views/item/video',
	'namespace',
	'iscroll',
], function(_, Backbone, VideoCollection, VideoItemView, Global, Iscroll) {

	var VideoView = Backbone.View.extend({

		initialize: function() {
			this._isCache = this._isTips = this._isJump = this._initData = false; 
			this._page = 1;
			this._cid = 121;

			this.listenToOnce(this.collection, 'reset', this.initScroll);
			this.listenTo(this.collection, 'reset', this.renderDataAll);
			this.listenTo(this.collection, 'reset', this.playerVideo); 
			this.listenTo(this.collection, 'reset', this.moreDetail);
			this.listenToOnce(this.collection, 'reset', this.unfoldToggle);
		},
		
		render: function() {
			this.$el = document.querySelector('#view-video');
			this.$el.scrollWrap = this.$el.querySelector('.scroll');
			this.$el.scrollContainer = this.$el.scrollWrap.querySelector('.iscroll .content');
			this.$el.refershPullDown = this.$el.scrollWrap.querySelector('.pulldown');
			this.$el.refershPullUp = this.$el.scrollWrap.querySelector('.pullup');

			var opts = {
				cache: true,
				expires: false, // 默认5分钟
				reset: true,
				url: Global.app.opts.url + 'a=render&classid=' + this._cid + '&page=' + this._page + '&showType=videoList'
			};

			this.collection.fetch(opts);

			// 更新缓存数据
			(this._isCache) && this.updateCache( opts.url );

			if (this._isJump || !this._initData) {
				myApp.showIndicator();
				this._initData = true;
			}
		},

		initScroll: function() {
			videoListScroll = Iscroll.newVerScrollForPull( this.$el.scrollWrap, _.bind(this.pulldownAction, this), _.bind(this.pullupAction, this) );
			this.$el.refershPullDown.style.display = this.$el.refershPullUp.style.display = 'block';
		},

		// 下拉执行逻辑 (更新)
		pulldownAction : function () {
 			this._page = 1;
 			this._isJump = this._isCache = true;
 			this.render();
 			myApp.hideIndicator();
		},

		// 上拉执行逻辑 （下一页）
		pullupAction : function () {
			var self = this;
			self._isJump = false;
			self._page ++;
			self.render();
		},

		renderDataAll: function(collection) {

			var self = this;

			if (collection.models.length === 0) {
				self.$el.querySelector('.pullup').style.display = 'none';
				return;
			}
			else {
				self.$el.querySelector('.pullup').style.display = 'black';
			}

			var itemArr = [];
			collection.each(function(model, i) {
				var itemView = new VideoItemView({model: model});
				itemArr.push('<div class="item">' + itemView.render().el.innerHTML + '</div>');
			});
			
			if (self._isJump) {
				videoListScroll.scrollTo( 0, -44, 0 );
				self.$el.scrollContainer.innerHTML = '加载中请慢等 》。。。。';
				self.$el.scrollContainer.innerHTML = itemArr.join(' ');
			}
			else { self.$el.scrollContainer.innerHTML += itemArr.join(' '); }

			//数据加载完成后改变状态
			videoListScroll.refresh();

			myApp.hideIndicator();

		},

		playerVideo: function() {
			var self = this;
			var isVideo = false;
			var listenerItem = self.$el.scrollContainer.querySelectorAll('.item dl dt .videoDatas');
			var onClickItem = function() {
				var _me = this;
				var thisSrcValue = _me.getAttribute('data-src');
				$.getJSON('http://api.flvxz.com/token/5ac2fec5ad4c305dce09a3301a0f4ad2/url/'+ thisSrcValue +'/jsonp/purejson/ftype/mp4/hd/2', function(json) {
					var src = json[0].files[0].furl;
					_me.setAttribute('src', src);
				})
				.done( _.bind(player, this) );
			}
			var player = function () {
				isVideo = true;
                var videoUrl = this.getAttribute('src');
                var options = {
                    successCallback: function() {
                      console.log('播放完成没有任何错误');
                      isVideo = false;
                    },
                    errorCallback: function(errMsg) {
                      console.log("Error! " + errMsg);
                      isVideo = false;
                    }
                };
                try {
                	window.plugins.streamingMedia.playVideo(videoUrl, options);
                } catch (err) {
                	console.log('youku-videoUrl: ',videoUrl, 'err: ', err);
                	isVideo = false
                }
			}

			var delegateHandle = function() {
				var self = this;
				if (!isVideo) onClickItem.call(self);
			}

			$(self.$el).delegate('.videoDatas', 'click', _.debounce(delegateHandle, 500) );
		},

		moreDetail: function() {
			var more = function() {
				var content = this.parentNode.querySelector('.more-detail-content');
				content.classList.add('active');
				this.style.display = 'none';
			}
			var items = this.$el.scrollContainer.querySelectorAll('.more-detail .more-detail-button');
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var content = items[i].parentNode.querySelector('.more-detail-content');
				var contentHeightValue = parseInt(window.getComputedStyle(content, null).getPropertyValue('height'));
				var contentLenghtValue = content.innerText.length;
				// item.parentNode.parentNode.querySelector('h3').innerHTML += '<font color=red>'+content.innerText.length+' </font>' + window.outerWidth;
				(contentHeightValue < 55 || contentLenghtValue < 77) && (item.style.display = 'none');
				item.addEventListener('click', more, false);
			}
		},

		unfoldToggle: function() {
			var self = this;
			var unfold = this.$el.querySelector('.unfold-toggle');
			var items = unfold.querySelectorAll('.item-content');
			var title = unfold.querySelector('.unfold-toggle-title');
			var extend = this.$el.querySelector('.extend');
			var nav = document.querySelector('nav');

			function active() {
				(unfold.classList.contains('active')) ? unfold.classList.remove('active') : unfold.classList.add('active');
			}

			function action() {
				var classid = this.getAttribute('data-action').split('/')[1];
				self._isJump = true;
				self._cid = classid;
				self._page = 1;
				self.render();
				title.querySelector('span').innerText = (classid === '121') ? 'BIKETO 视频' : $$.trim(this.innerText);
				setTimeout(active(), 3000);
			}

			for (var i = 0; i < items.length; i++) {
				items[i].addEventListener('click', action, false);
			}

			title.addEventListener('click', active, false);
			extend.addEventListener('click', active, false);
			nav.addEventListener('click', function(){ unfold.classList.remove('active'); }, false);
		},

		// 更新缓存数据
		updateCache: function(url) {
			var fetchCacheObject = Backbone.fetchCache._cache;
			var filterCacheItemArray = _.filter(_.keys(fetchCacheObject), function(key) { return key.indexOf(url) !== -1 });
			for (var i = 0; i < filterCacheItemArray.length; i++) Backbone.fetchCache.clearItem(filterCacheItemArray[i]);
		}, 
		
	});

	return new VideoView({ collection: VideoCollection });
});