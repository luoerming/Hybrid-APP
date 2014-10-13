
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

			this._isSyncd = false;
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
			// If the user is not logged 
			!(UserLogin.isLoginFunc()) ? this.userNotLoggedFavorDate() : this.userIsLoggedFavorData();
		},

		show: function() {
			this.renderList();
			this.toggleDeleteItems();

			// 这里要判断同步的状态是否已同步过，如果已同步步跳过； isSyncd = true;
			if (!this._isSyncd) !(UserLogin.isLoginFunc()) ? this.userNotLoggedFavorDate() : this.userIsLoggedFavorData();
		},

		// User is not logged.
		userNotLoggedFavorDate: function() {
			console.log('Not logged: 未登录');
			this.saveToLoclstorage();
		},

		// User is logged.
		userIsLoggedFavorData: function() {
			console.log('Is logged: 已登录');
			this.saveToLoclstorage();
			this.trySyncAndMergeData();
		},

		// Trying to sync from local data or server data.
		trySyncAndMergeData: function() {
			var self = this;

			if (self._isSyncd) return;

			var storeFavor = (WebStorage.get().favor === '0') ? [] : WebStorage.get().favor;
			var storeUserinfo = WebStorage.get().userinfo;

			// To jsaonString
			var favorDataToJSON = [];
			for (var i = 0; i < storeFavor.length; i++) {
				var reDate = {classid: storeFavor[i].classid, id: storeFavor[i].id};
				favorDataToJSON.push(reDate)
			};

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

			if (favorDataToJSON.length > 150) {
				alert('您的数据超过150条限制无法完成同步操作!');
				return;
			}

			var url = '&token=' + storeUserinfo.token + '&username=' + storeUserinfo.username + '&userid=' + storeUserinfo.userid + '&data=' + JSON.stringify(favorDataToJSON);
			$$.ajax({
				url: Global.app.opts.url + 'a=setMemberFavor' + url,
				type: "post", //请求类型,可为get或post
				isJson: false,
				success: ajaxCallback
			});

			// callback
			function ajaxCallback(response) {

				console.log(response)
				return;
				var responseParse = JSON.parse(response);

				// 成功
				if (responseParse.code === '20000') {
					var serverFavorList = responseParse.favorList;
					var localAndServerMerge = merge(serverFavorList, storeFavor);
				
					for (var i = 0; i < _.keys(localAndServerMerge).length; i++) {
						storeFavor.push(localAndServerMerge[i]);
					}
					// 替换本地
					WebStorage.set({'favor': storeFavor});
					self.renderList();

					// 设置已同步同步状态
					self._isSyncd = true;

				}

				// token错误
				if (responseParse.code === '40001') {
					// 退出登录
					UserLogin.logoutFunc();
					console.log('token错误');
				}
			};

		},

		saveToServer: function() {
			this.trySyncAndMergeData();
		},

		saveToLoclstorage: function() {
			var self = this;
			var args = self.args;
			var saveButton = args.el;
			var models = args.models;
			var storageValue = (WebStorage.get().favor === '0') ? [] : WebStorage.get().favor;
			var tips = document.querySelector('.commom-tips');
			var tipsIcon = tips.querySelector('.iconfont');
			var tipsText = tips.querySelector('.text');

			if (!saveButton) return;

			// Set button's style
			(_.some(storageValue, function(v) { return v.id === models.id })) ? 
			saveButton.classList.add('checked') : 
			saveButton.classList.remove('checked');

			var submitFavorFunc = function() {

				// If localStorage key value doesn't exist.
				if (!_.some(storageValue, function(v) { return v.id === models.id })) {
					storageValue.push(models);
					WebStorage.set({'favor': storageValue});

					saveButton.classList.add('checked');
					tipsIcon.classList.add('icon-round-close');
					tipsText.innerHTML = '收藏成功';
				}
				else {
					storageValue = _.filter(storageValue, function(v) { return v.id !== models.id });
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

			if (storageCollection === '0') {
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

			// Bind the UI
			AppUI.memberContentFavorList(self.$el.favorList.querySelectorAll('li'));
		},

		// Delete favorList function
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
				var self = this;
				var storage = WebStorage.get().favor || [];
				var getActionURL = self.parentNode.getAttribute('data-action');
				var id = getActionURL.split('/')[2];

				var resultCallback = function(re) {
					if (re !== 2) return;
					reStorageValue = _.filter(storage, function(v){ return v.id != id });
					WebStorage.set({'favor': reStorageValue});
					self.parentNode.classList.add('removed');
					setTimeout(function(){self.parentNode.style.display = 'none';}, 1000);

					// debug
					console.log(id,' :已取消收藏');
				}
				window.navigator.notification.confirm("你确定要取消收藏？111", resultCallback, "", ["取消", "确定"]);
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