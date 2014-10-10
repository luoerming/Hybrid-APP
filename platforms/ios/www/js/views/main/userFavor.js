
define ([
	'underscore',
	'backbone',
	'collections/newsCollection',
	'views/item/favor',
	'views/main/userLogin',
	'namespace',
	'webStorage',
	'appUI'
], function(_, Backbone, newsCollection, FavorItemView, UserLogin, Global, WebStorage, AppUI) {

	var UserFavorListView = Backbone.View.extend({

		initialize: function() {
			this._syncFavored = 0;
		},

		render: function(method, argObject) {

			this.$el = document.querySelector('#view-member .member-favor');
			this.$el.favorHead = this.$el.querySelector('.content-block-title');
			this.$el.favorList = this.$el.querySelector('.list-block ul');

			this.args = argObject || {};

			switch (method) {
				case 'save':
					this.save();
					break
				case 'show':
					this.show();
					break
				default:
					console.log('it is method empty');
					return false;
			}
		},

		save: function() {
			!(UserLogin.isLoginFunc()) ? this.fetchOfflineFavorDate() : this.fetchOnlineFavorData();
		},

		show: function() {
			this.renderList();
			this.toggleDeleteItems();
			this.fetchOnlineFavorData();
		},

		fetchOfflineFavorDate: function() {
			console.log('offline');
			// this.saveToLoclstorage();
		},

		fetchOnlineFavorData: function() {
			console.log('online');
			// this.saveToServer();
			this.saveToLoclstorage();
			
			// this.syncAndMergeData();
		},

		// 尝试同步数据
		syncAndMergeData: function() {

			this._syncFavored ++;
			
			if (this._syncFavored > 1) {
				return ;
			}

			var self = this;
			var storeFavor = (WebStorage.get().favor === '0') ? [] : WebStorage.get().favor;
			var storeUserinfo = WebStorage.get().userinfo;


			// 合并两个对象方法
			var merge = function() {
			    var obj = {},
			        i = 0,
			        il = arguments.length,
			        key;
			    for (; i < il; i++) {
			        for (key in arguments[i]) {
			            if (arguments[i].hasOwnProperty(key)) {
			                obj[key] = arguments[i][key];
			            }
			        }
			    }
			    return obj;
			};

			var url = '&token=' + storeUserinfo.token + '&username=' + storeUserinfo.username + '&userid=' + storeUserinfo.userid;
			$$.ajax({
				url: Global.app.opts.url + 'a=setMemberFavor' + url,
				type: "post", //请求类型,可为get或post
				isJson: false,
				success: ajaxCallback
			});

			// callback
			function ajaxCallback(response) {
				var responseParse = JSON.parse(response);

				// 成功
				if (responseParse.code === '20000') {

					var serverFavorList = responseParse.favorList;
					var localAndServerMerge = merge(serverFavorList, storeFavor);
				
					for (var i = 0; i < _.keys(localAndServerMerge).length; i++) {
						storeFavor.push(localAndServerMerge[i]);
					}
					// 替换本地
					WebStorage.set({'favor': storeFavor });
					self.renderList();

				}
				// token错误
				if (responseParse.code === '40002') {
					console.log('token错误');
				}
			};

		},

		saveToServer: function() {
			this.syncAndMergeData();
		},

		saveToLoclstorage: function() {
			var self = this,
				args = self.args,
				saveButton = args.el,
				models = args.models,
				storageValue = (WebStorage.get().favor === '0') ? [] : WebStorage.get().favor,
				tips = document.querySelector('.commom-tips'),
				tipsIcon = tips.querySelector('.iconfont'),
				tipsText = tips.querySelector('.text');
			if (!saveButton) { return; };
			// Set button's style
			(_.some(storageValue, function(v) { return v.aid === models.aid })) ? 
			saveButton.classList.add('checked') : 
			saveButton.classList.remove('checked');

			var submitFavorFunc = function() {

				// If localStorage key value doesn't exist.
				if (!_.some(storageValue, function(v) { return v.aid === models.aid })) {
					storageValue.push(models);
					WebStorage.set({'favor': storageValue});

					saveButton.classList.add('checked');
					tipsIcon.classList.add('icon-round-close');
					tipsText.innerHTML = '收藏成功';
				}
				else {
					storageValue = _.filter(storageValue, function(v) { return v.aid !== models.aid });
					WebStorage.set({'favor': storageValue});

					saveButton.classList.remove('checked');
					tipsIcon.classList.remove('icon-round-close');
					tipsText.innerHTML = '已取消收藏';

					// else update renderlist function
					// self.renderList();
				}

				tips.addEventListener('webkitAnimationEnd', function() { this.classList.remove('fadeOut', 'animated'); });
				tips.classList.add('fadeOut', 'animated');
			};

			saveButton.addEventListener('click', _.debounce(submitFavorFunc, 1000, true));
		},

		renderList: function() {
			var self = this,
				storageCollection = WebStorage.get().favor,
				_arrayLi = [], _i;

			if (storageCollection.length <= 0) {
				self.$el.favorList.parentNode.classList.add('favorListPlaceholder');
				self.$el.favorList.innerHTML = '<i class="iconfont icon-favorAll"></i><p>时光已飞逝那些重要的事？<br>收藏它们吧</p>';
				return;
			} 
			else {
				self.$el.favorList.parentNode.classList.remove('favorListPlaceholder');
			}

			for (_i = 0; _i < storageCollection.length; _i++) {
				var itemView = new FavorItemView({model: storageCollection[_i]});
				 _arrayLi.push(itemView.render().el.innerHTML);
			}
			self.$el.favorList.innerHTML = _arrayLi.join('');
			// bind appui
			AppUI.memberContentFavorList(self.$el.favorList.querySelectorAll('li'));
		},

		toggleDeleteItems: function() {
			var self = this;
			self._instance;

			// constructor object's of class 
			function ToogleDelete() {
				this.$toggleButton = self.$el.favorHead.querySelector('.toggle-delete-items');
				this.$nav = document.querySelector('nav');

				this.init();
			};

			var fn = ToogleDelete.prototype;

			fn.init = function() {
				this.$toggleButton && this.$toggleButton.addEventListener('click', _.bind(this.submiteToogleFunc, this), false);
			};

			fn.bindEventFunc = function(isBind) {
				// update selector element
				var items = self.$el.favorList.querySelectorAll('li'),
					deleteItems = self.$el.favorList.querySelectorAll('.delete-items-handler'),
					_len = items.length,
					_i;

				var isBind = isBind || false;
				for (_i = 0; _i < _len; _i ++) { // loop listitem and set listener event
					if (isBind) {
						items[_i].removeEventListener('click', AppUI.exSlide, false);
						deleteItems[_i].addEventListener('click', this.removeStoreFavor, false);
					}
					else {
						items[_i].addEventListener('click', AppUI.exSlide, false);
						deleteItems[_i].removeEventListener('click', this.removeStoreFavor, false);
					}
				}
			};

			fn.removeStoreFavor = function() {
				
				var isConfirm = confirm("你确定要取消收藏 ？");

				if (isConfirm == true) {
					var storage = WebStorage.get().favor || [],
						getActionURL = this.parentNode.getAttribute('data-action'),
						aid = getActionURL.split('/')[2];
					reStorageValue = _.filter(storage, function(v){ return v.aid != aid });
					WebStorage.set({'favor': reStorageValue});
					console.log(aid, '已取消收藏');
					this.parentNode.classList.add('removed');
					var self = this;
					setTimeout(function(){self.parentNode.style.display = 'none';}, 1000);
				} 
				else { return; };
			};

			fn.listenerNavEvent = function() {
				this.bindEventFunc(false);
				self.$el.classList.remove('delete-items-open');
			};

			fn.submiteToogleFunc = function() {

				self.$el.classList.toggle('delete-items-open');

				(self.$el.classList.contains('delete-items-open')) ? this.bindEventFunc(true) : this.bindEventFunc(false);

				// if user click the nav element, unbind the method and remove the element className
				this.$nav.addEventListener('click', _.bind(this.listenerNavEvent, this), false);
			};

			// Singleton (单例模式)
			if (!self._instance) self._instance = new ToogleDelete();
			return self._instance;
		},

	});

	return new UserFavorListView({ collection: newsCollection });
});