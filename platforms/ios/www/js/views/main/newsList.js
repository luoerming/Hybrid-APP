
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
	'webStorage',
	'flipsnap'
], function($, _, Backbone, NewsCollection, NewsSliderCollection, NewsItemView, Global, Iscroll, Slider, 
	WebStorage, Flipsnap) {

	var NewsListView = Backbone.View.extend({

		el: '#view-list',

		initialize: function() {
			this._isJump = false; // 判断栏目跳转
			this._isCache = false; // 判断是否更新缓存
			this._isTips = false; // 判断是否显示提示
			this._page = 1;
			this._cid = 1;
			this._initData = false;

			this.listenToOnce(this.collection, 'reset', this.newsListScroll); // 初始化iscroll (仅一次)
			this.listenToOnce(this.collection, 'reset', this.navigator);
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
			if (this._isCache) this.updateCache(Global.app.opts.url + 'a=render&classid=' + this._cid + '&page');

			if (this._isJump || !this._initData && !this._isJump) {
				myApp.showIndicator();
				this._initData = true;
			}
		},

		navigator: function() {
			var self = this;
			var isEditDone = false;
			var $navWrap =  $('#view-list header .nav-wrap');
			var $navSrollWrap = $navWrap.find('.nav .viewport');
			var $navSelectHaderButton = $navWrap.find('.nav-select-haader .nav-select-header-icon');
			var $editButton = $navWrap.find('.nav-select-haader .nav-select-header-edit');
			var $addedColumn = $navWrap.find('.added-column');
			var $removeColumn = $navWrap.find('.remove-column');

			var getStorageItem = JSON.parse(localStorage.getItem('navigatorCustom')) || '';
			var getDefSelected = getStorageItem.selected;
			var getDefUnselect = getStorageItem.unselect;
			var defaultSelected = [];
			var defaultUnselected = [];


			if (!getDefSelected) {
				$addedColumn.find('.item').each(function() {
					defaultSelected.push(this.outerHTML);
				});
				log('no selected', defaultSelected.length)
			}

			if (!getDefUnselect) {
				$removeColumn.find('.item').each(function() {
					defaultUnselected.push(this.outerHTML);
				})
				log('no unSelected', defaultUnselected.length)
			}

			var selected = getDefSelected || defaultSelected;
			var unselect = getDefUnselect || defaultUnselected;

			var obj = {
				'selected': selected,
				'unselect': unselect
			}

			// initialize localStorage data
			if (!getStorageItem) localStorage.setItem('navigatorCustom', JSON.stringify(obj));

			var refreshNav = function() {
				var getStorageItem = JSON.parse(localStorage.getItem('navigatorCustom')) || '';
				var getDefSelected = getStorageItem.selected;
				var reGetDefSelected = [];
				var _i = 0;
				var _length = getDefSelected.length;
				var currentClassId = WebStorage.get().classId;

				var navPostion = function(thisSortId, maxNumber, isLengthen) {
					setTimeout(function(){
						(thisSortId <= 3) && flipsnap.moveToPoint(0);
						(thisSortId >= 3) && flipsnap.moveToPoint(1);
						(thisSortId >= 4) && flipsnap.moveToPoint(2);
						if (thisSortId >= 6) {
							flipsnap.moveToPoint(3);
						}
						if (thisSortId >= 7) {
							flipsnap.moveToPoint(4);
						}
						if (thisSortId >= 8) {
							isLengthen ? flipsnap.moveToPoint(6) : flipsnap.moveToPoint(5);
						}
						if (thisSortId >= 9) {
							isLengthen ? flipsnap.moveToPoint(7) : flipsnap.moveToPoint(6);
						}
						if (thisSortId >= 10) {
							isLengthen ? flipsnap.moveToPoint(8) : flipsnap.moveToPoint(7);
						}
						if (thisSortId >= 11) {
							isLengthen ? flipsnap.moveToPoint(9) : flipsnap.moveToPoint(8);
						}
						if (thisSortId >= 12) {
							isLengthen ? flipsnap.moveToPoint(10) : flipsnap.moveToPoint(9);
						}
						if (thisSortId >= 13) {
							isLengthen ? flipsnap.moveToPoint(11) : flipsnap.moveToPoint(10);
						}
						if (thisSortId >= 14) {
							isLengthen ? flipsnap.moveToPoint(12) : flipsnap.moveToPoint(11);
						} 
						if (thisSortId >= 15) {
							isLengthen ? flipsnap.moveToPoint(13) : flipsnap.moveToPoint(12);
						} 
						if (thisSortId >= 16) {
							isLengthen ? flipsnap.moveToPoint(14) : flipsnap.moveToPoint(13);
						} 
						if (thisSortId >= 17) {
							isLengthen ? flipsnap.moveToPoint(15) : flipsnap.moveToPoint(14);
						} 
						if (thisSortId >= 18) {
							isLengthen ? flipsnap.moveToPoint(16) : flipsnap.moveToPoint(15);
						} 
						if (thisSortId >= 18 || thisSortId >= 19 || thisSortId >= 20) {
							isLengthen ? flipsnap.moveToPoint(16) : flipsnap.moveToPoint(15);
						} 
					}, 0);
				}

				var fspointmoveHandle = function() {

				}

				var navItemDelegateHandle = function() {
					var thisSortId = $(this).attr('data-sort');
					var isLengthen = $(this).hasClass('item-lengthen');
					navPostion(thisSortId, _length, isLengthen);
				}

				for ( _i; _i < _length; _i++ ) {
					var reItem = $(getDefSelected[_i]).attr('data-sort', _i)[0].outerHTML;
					if ( $(reItem).attr('data-classid') == currentClassId ) {
						reItem = $(reItem).addClass('hover')[0];
						var thisSortId = $(reItem).attr('data-sort');
						var isLengthen = $(reItem).hasClass('item-lengthen');
						navPostion(thisSortId, _length, isLengthen);
					}
					reGetDefSelected.push(reItem);					
				};

				$navSrollWrap.html(reGetDefSelected);

				flipsnap.refresh();

				$(flipsnap.element).on('fspointmove', fspointmoveHandle);
				$navWrap.undelegate().delegate('.item', 'click', navItemDelegateHandle);
			}

			var overwriteSelectContent = function() {
				var getStorageItem = JSON.parse(localStorage.getItem('navigatorCustom')) || '';
				var getDefSelected = getStorageItem.selected;
				var getDefUnselect = getStorageItem.unselect;

				if (getDefSelected) $addedColumn.html(getDefSelected);
				if (getDefUnselect) $removeColumn.html(getDefUnselect);
			}

			var removeLoclStorege = function(elClassId, type) {
				if (!elClassId) return;
				var getStorageItem = JSON.parse(localStorage.getItem('navigatorCustom')) || '';
				var selectArray = [];
				var unselectArray = [];

				if (type === 'selected') {
					for (var i = 0; i < getStorageItem.selected.length; i++) {
						if (getStorageItem.selected[i].indexOf('="'+elClassId+'"') <= 0) selectArray.push(getStorageItem.selected[i]);
					}
					obj.selected = selectArray;
					localStorage.setItem('navigatorCustom', JSON.stringify(obj))
				}

				if (type === 'unselect') {
					for (var i = 0; i < getStorageItem.unselect.length; i++) {
						if (getStorageItem.unselect[i].indexOf('="'+elClassId+'"') <= 0) unselectArray.push(getStorageItem.unselect[i]);
					}
					obj.unselect = unselectArray;
					localStorage.setItem('navigatorCustom', JSON.stringify(obj))
				}
			}

			var addLoclStorege = function(el, type) {
				if (!el) return;
				var getStorageItem = JSON.parse(localStorage.getItem('navigatorCustom')) || '';
				var classId = $(el).attr('data-classid');

				if (type === 'selected') {
					getStorageItem.selected.push(el);
					obj.selected = getStorageItem.selected;
					localStorage.setItem('navigatorCustom', JSON.stringify(obj));
					removeLoclStorege(classId, 'unselect');
				}

				if (type === 'unselect') {
					getStorageItem.unselect.push(el);
					obj.unselect = getStorageItem.unselect;
					localStorage.setItem('navigatorCustom', JSON.stringify(obj));
					removeLoclStorege(classId, 'selected');
				}
			}

			var hiddenSelectNav = function() {
				$navWrap.addClass('navpopout');
				$navWrap.removeClass('deactive');
				setTimeout(function() {
					$navWrap.removeClass('navpopout');
					$navWrap.removeClass('active');
					$navWrap.addClass('deactive');
				}, 300);
			}

			var showSelectNav = function() {
				$navWrap.addClass('active');
			}

			var toggleNavHandle = function(e) {
				$navWrap.hasClass('active') ? hiddenSelectNav() : showSelectNav();
				overwriteSelectContent();
				refreshNav();
			}

			var toggleEditHandle = function() {
				if ($navWrap.hasClass('edit')) {
					isEditDone = false;
					$editButton.html('编辑');
					$navWrap.removeClass('edit');
				} 
				else {
					isEditDone = true;
					$editButton.html('完成');
					$navWrap.addClass('edit')
				}
			}

			var addedColumnDelageterHandle = function(e) {
				if (isEditDone) {
					if (this.outerHTML.indexOf('="1"') >=0) return;
					e.preventDefault()
					$(this).find('.iconfont').remove();
					$removeColumn.append(this);
					addLoclStorege(this.outerHTML, 'unselect');
				}
				if (!isEditDone) hiddenSelectNav();
			}

			var removeColumnDelageterHandle = function(e) {
				var classId = $(this).attr('data-classid');
				$(this).append('<i class="iconfont icon-remove"></i>');
				$addedColumn.append(this);
				e.preventDefault();

				// add to localstorage 
				addLoclStorege(this.outerHTML, 'selected');
			}

			// init flipsnap 
			var flipsnap = Flipsnap($navSrollWrap[0], {

			});

			window.flipsnap = flipsnap;

			refreshNav();

			// bind event
			$navSelectHaderButton.off().on('click', toggleNavHandle);
			$editButton.off().on('click', toggleEditHandle);

			$addedColumn.undelegate('click', addedColumnDelageterHandle);
			$addedColumn.delegate('.item', 'click', addedColumnDelageterHandle)

			$removeColumn.undelegate('click', removeColumnDelageterHandle);
			$removeColumn.delegate('.item', 'click',removeColumnDelageterHandle)

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

			var data = [];
			var wrap = this.$newsListScrollWrepper[0].querySelector('.ui-sliderWrap .ui-slider');
			var wrapWidth = wrap['offsetWidth'] + 300;
			wrap.innerHTML = '';

			var sliderInitCount = 0;
			function buildSlider(collection) {

				if (collection.length === 0) {
					this.$newsListScrollWrepper.find('.ui-sliderWrap').hide();
					return;
				};

				if (sliderInitCount++ > 0) return;

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
			
			self.listenTo(NewsSliderCollection, 'reset', buildSlider); // 渲染数据
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
			self.render(WebStorage.get().classId, this._page);
			myApp.hideIndicator();
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
			
			if (self._isJump) {
				self.NewsListScroll.scrollTo(0, -40, 0);
			} 

			myApp.hideIndicator();

			//数据加载完成后改变状态
			self.NewsListScroll.refresh();

			// 提示信息
			self.tips();
		},

		// 更新缓存数据
		updateCache: function(url) {
			var fetchCacheObject = Backbone.fetchCache._cache;
			var filterCacheItemArray = _.filter(_.keys(fetchCacheObject), function(key) { return key.indexOf(url) !== -1 });
			for (var i = 0; i < filterCacheItemArray.length; i++) Backbone.fetchCache.clearItem(filterCacheItemArray[i]);
		}, 

		// 提示动画
		tips: function() {

			return;
			
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