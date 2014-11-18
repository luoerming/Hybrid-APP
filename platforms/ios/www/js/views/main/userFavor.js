
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
			this._isSyncd = false;
			$$ = window.Dom;
			$$(document)[0].addEventListener('logged', _.bind(this.show, this), false);
		},

		render: function(method, argObject) {

			this.$el = document.querySelector('#view-favor');
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

			// update UIView
			this.showUIView();

			console.log('favor init....')
		},

		showUIView: function() {
			var self = this;
			this.$nav = $('nav');

			self.$el.querySelector('.onBind').addEventListener('click', function() {
				self.$nav.addClass('nav-in');
				self.$nav.removeClass('nav-out');
			}, false);

		},

		save: function() {
			// If the user is not logged 
			!(UserLogin.isLoginFunc()) ? this.userNotLoggedFavorDate() : this.userIsLoggedFavorData();
		},

		show: function() {
			this.renderList();
			this.toggleDeleteItems();

			// 这里要判断同步的状态是否已同步过，如果已同步步跳过； isSyncd = true;
			if (!this._isSyncd ) !(UserLogin.isLoginFunc()) ? this.userNotLoggedFavorDate() : this.userIsLoggedFavorData();
		},

		// User is not logged.
		userNotLoggedFavorDate: function() {
			this.saveToLoclstorage();
		},

		// User is logged.
		userIsLoggedFavorData: function() {
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

			if (favorDataToJSON.length > 150) {
				alert('您的数据超过150条限制无法完成同步操作!');
				return;
			}

			myApp.showIndicator();

			var url = '&token=' + storeUserinfo.token + '&username=' + storeUserinfo.username + '&userid=' + storeUserinfo.userid + '&methodType=' + 'sync' + '&data=' + JSON.stringify(favorDataToJSON);
			$$.ajax({
				url: Global.app.opts.url + 'a=setMemberFavor' + url,
				type: "post", //请求类型,可为get或post
				isJson: false,
				success: ajaxCallback
			});

			// callback
			function ajaxCallback(response) {

				try {
					var responseParse = JSON.parse(response);
				} catch (err) {
					console.log(response, err.message);
					return;
				}

				// 成功
				if (responseParse.code === '20000') {
					var serverFavorList = responseParse.favorList;

					// 替换本地
					WebStorage.set({'favor': responseParse.favorList});
					self.renderList();
					
					// 设置已同步同步状态
					self._isSyncd = true;

					console.log('完成数据同步 ...');
					myApp.hideIndicator();
				}

				// token错误
				if (responseParse.code === '40001') {
					// 退出登录
					UserLogin.logoutFunc();
					console.log('同步数据失败，token错误');
				}
			};
		},

		saveToLoclstorage: function() {

			var self = this;
			var args = self.args;
			var saveButton = args.el;
			var storageValue = (WebStorage.get().favor === '0') ? [] : WebStorage.get().favor;
			var tips = document.querySelector('.commom-tips');
			var tipsIcon = tips.querySelector('.iconfont');
			var tipsText = tips.querySelector('.text');

			if (!saveButton) return;

			// Set button's style
			(_.some(storageValue, function(v) { return v.id === self.args.models.id })) ? 
			saveButton.classList.add('checked') : 
			saveButton.classList.remove('checked');

			var submitFavorFunc = function() {
				// If localStorage key value doesn't exist.
				if (!_.some(storageValue, function(v) { return v.id === self.args.models.id })) {
					storageValue.push(self.args.models);
					WebStorage.set({'favor': storageValue});

					// removeToServer
					(UserLogin.isLoginFunc()) && addToServer(self.args.models.classid, self.args.models.id);

					console.log('addToServer: ', self.args.models.classid, self.args.models.id);

					saveButton.classList.add('checked');
					tipsIcon.classList.remove('icon-round-close');
					tipsIcon.classList.add('icon-round-check');
					tipsText.innerHTML = '收藏成功';
				}
				else {
					storageValue = _.filter(storageValue, function(v) { return v.id !== self.args.models.id });
					WebStorage.set({'favor': storageValue});

					// removeToServer
					(UserLogin.isLoginFunc()) && deleteToServer(self.args.models.classid, self.args.models.id);

					console.log('removeToServer: ', self.args.models.classid, self.args.models.id);

					saveButton.classList.remove('checked');
					tipsIcon.classList.remove('icon-round-check');
					tipsIcon.classList.add('icon-round-close');
					tipsText.innerHTML = '已取消收藏';

					// else update renderlist function
					self.renderList();
				}
				tips.addEventListener('webkitAnimationEnd', function() { this.classList.remove('fadeOut', 'animated'); });
				tips.classList.add('fadeOut', 'animated');
			};

			if (!self._initSaveToLocl) {
				self._initSaveToLocl = true;
				saveButton.addEventListener('click', submitFavorFunc, false);
			} else { return; }


			var addToServer = function(classid, id) {
				var storeUserinfo = WebStorage.get().userinfo;
				var favorDataToJSON = [];
				favorDataToJSON.push({'classid':classid, 'id':id});

				var url = '&token=' + storeUserinfo.token + '&username=' + storeUserinfo.username + '&userid=' + storeUserinfo.userid + '&methodType=' + 'add' + '&data=' + JSON.stringify(favorDataToJSON);
				
				var ajaxCallbackHandle = function(response) {
					try {
						var responseParse = JSON.parse(response);
					} catch (err) {
						console.log(response, err.message);
						return;
					}
					// 成功
					if (responseParse.code === '20000') {
						console.log('完成数据同步 ...');
					}

					// token错误
					if (responseParse.code === '40001') {
						// 退出登录
						UserLogin.logoutFunc();
						console.log('完成数据同步，token错误');
					}
				}

				$$.ajax({
					url: Global.app.opts.url + 'a=setMemberFavor' + url,
					type: "post", //请求类型,可为get或post
					isJson: false,
					success: ajaxCallbackHandle
				});
			}

			var deleteToServer = function(classid, id) {
				var storeUserinfo = WebStorage.get().userinfo;
				var favorDataToJSON = [];
				favorDataToJSON.push({'classid':classid, 'id':id});

				var url = '&token=' + storeUserinfo.token + '&username=' + storeUserinfo.username + '&userid=' + storeUserinfo.userid + '&methodType=' + 'delete' + '&data=' + JSON.stringify(favorDataToJSON);
				
				var ajaxCallbackHandle = function(response) {

					try {
						var responseParse = JSON.parse(response);
					} catch (err) {
						console.log(response, err.message);
						return;
					}

					// 成功
					if (responseParse.code === '20000') {
						console.log('删除完成 ...');
					}
					// token错误
					if (responseParse.code === '40001') {
						// 退出登录
						UserLogin.logoutFunc();
						console.log('删除失败，token错误');
					}
				}

				$$.ajax({
					url: Global.app.opts.url + 'a=setMemberFavor' + url,
					type: "post", //请求类型,可为get或post
					isJson: false,
					success: ajaxCallbackHandle
				});
			}
			
		},

		renderList: function() {
			var self = this,
				storageCollection = WebStorage.get().favor,
				_arrayLi = [], _i;

			if (!UserLogin.isLoginFunc()) self._isSyncd = false;

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
		},

		// Delete favorList function
		toggleDeleteItems: function() {
			var self = this;
			self._instance;

			// constructor object's of class 
			function ToogleDelete() {
				this.$toggleButton = self.$el.querySelector('.toggle-delete-items');
				this.$nav = document.querySelector('nav');

				this.isOpenToggle = false;
				this.init();
			};

			var fn = ToogleDelete.prototype;

			fn.init = function() {

				this.$toggleButton.addEventListener('click', _.bind(this.submiteToogleFunc, this), false);

				self.$el.favorList.addEventListener('click', _.bind(this.clicksEvnetHandel, this), false);

				// if user click the nav element, unbind the method and remove the element className
				this.$nav.addEventListener('click', function() { self.$el.classList.remove('delete-items-open'); }, false);
			};

			fn.submiteToogleFunc = function() {
				if (!this.isOpenToggle) {
					self.$el.classList.add('delete-items-open');
					this.$toggleButton.innerHTML = '完成';
					this.isOpenToggle = true;
				} 
				else {
					self.$el.classList.remove('delete-items-open');
					this.$toggleButton.innerHTML = '编辑';
					this.isOpenToggle = false;
				}
			};

			fn.clicksEvnetHandel = function(e) {
				
				e.preventDefault();

				var clicked = e.target;
				var newsItem;
				var removeNewsButton;
				var viewInWrapper = document.querySelector('section#view-newsDetail');
				var viewInWrapperButton = viewInWrapper.querySelector('button');

				// view newslist
				if (clicked.classList.contains('item-title')) {
					newsItem = clicked.parentNode.parentNode.parentNode;
				} 
				else if (clicked.classList.contains('item-inner')) {
					newsItem = clicked.parentNode.parentNode;
				}
				if (newsItem && !this.isOpenToggle) {
					newsItem.addEventListener('click', AppUI.exSlide.call(newsItem), false);
					viewInWrapperButton.setAttribute('data-vin', 'view-favor');
				}

				// remove newsItem button
				if (clicked.classList.contains('delete-items-handler')) {
					removeNewsButton = clicked;
				} 
				else if (clicked.classList.contains('icon-delte')) {
					removeNewsButton = clicked.parentNode;
				}
				if (removeNewsButton && this.isOpenToggle) this.removeStoreFavor.call(removeNewsButton, this);
			}

			fn.removeStoreFavor = function(self) {
				var _this = this;
				var storage = WebStorage.get().favor || [];
				var getActionURL = this.parentNode.getAttribute('data-action');
				var id = getActionURL.split('/')[2];
				var classid = getActionURL.split('/')[1];

				var resultCallback = function(re) {
					if (re !== 2) return;
					reStorageValue = _.filter(storage, function(v){ return v.id != id });
					WebStorage.set({'favor': reStorageValue});
					_this.parentNode.classList.add('removed');
					setTimeout(function() {
						_this.parentNode.style.display = 'none';
					}, 1000);

					(UserLogin.isLoginFunc()) && self.removeServerFavor(classid, id);
				}

				try {
					window.navigator.notification.confirm("你确定要取消收藏？", resultCallback, "", ["取消", "确定"]);
				} catch (err) {
					// debug
					if (confirm('确定要取消收藏？')) {
						resultCallback(2)
					} else {
						return;
					};
					
					(UserLogin.isLoginFunc()) && self.removeServerFavor(classid, id);
				}
			};

			fn.removeServerFavor = function(classid, id) {

				var storeUserinfo = WebStorage.get().userinfo;
				var favorDataToJSON = [];
				favorDataToJSON.push({'classid':classid, 'id':id});

				var url = '&token=' + storeUserinfo.token + '&username=' + storeUserinfo.username + '&userid=' + storeUserinfo.userid + '&methodType=' + 'delete' + '&data=' + JSON.stringify(favorDataToJSON);
				
				var ajaxCallbackHandle = function(response) {

					try {
						var responseParse = JSON.parse(response);
					} catch (err) {
						console.log(response, err.message);
						return;
					}
					
					// 成功
					if (responseParse.code === '20000') {
						console.log('完成数据同步 ...');
					}

					// token错误
					if (responseParse.code === '40001') {
						// 退出登录
						UserLogin.logoutFunc();
						console.log('token错误');
					}
				}

				$$.ajax({
					url: Global.app.opts.url + 'a=setMemberFavor' + url,
					type: "post", //请求类型,可为get或post
					isJson: false,
					success: ajaxCallbackHandle
				});
			}

			// Singleton (单例模式)
			if (!self._instance) self._instance = new ToogleDelete();
			return self._instance;
		},

	});

	return new UserFavorListView({ collection: newsCollection });
});