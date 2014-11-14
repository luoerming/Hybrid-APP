
define ([
	'jquery',
	'underscore',
	'backbone',
	'views/main',
	'fetchCache',
	'fastclick',
	'appUI',
	'webStorage'
], function($, _, Backbone, mainView, FetchCache, FastClick, AppUI, WebStorage) {

	var AppView = Backbone.View.extend({
		el: 'body',
		initialize: function() {
			this.main = mainView;
			this.render();
			FastClick.attach(document.body);
			AppUI.init();
			this.initIsNight();

			// initCordova plugins
			try {
				cordova.plugins.Keyboard.disableScroll(true);
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			} catch (err) {
				// console.log(err);
			}
			
			// save images to photo
			window.saveImageToPhone = function (url, success, error) {
			    var canvas, context, imageDataUrl, imageData;
			    var img = new Image();
			    img.onload = function() {
			        canvas = document.createElement('canvas');
			        canvas.width = img.width;
			        canvas.height = img.height;
			        context = canvas.getContext('2d');
			        context.drawImage(img, 0, 0);
			        try {
			            imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
			            imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
			            cordova.exec(
			                success,
			                error,
			                'Canvas2ImagePlugin',
			                'saveImageDataToLibrary',
			                [imageData]
			            );
			        }
			        catch(e) {
			            error(e.message);
			        }
			    };
			    try {
			        img.src = url;
			    }
			    catch(e) {
			        error(e.message);
			    }
			}

			// Shortcut to console.log
			window.log = console.log.bind(console);
			window.oops = console.error.bind(console);
		},

		render: function() {
			this.$el.append( this.main.render().el ); // 主体视图
			return this;
		},

		initIsNight: function() {
			var getStorageSwitchNigthValue = WebStorage.get().switchNight;
			var isSwitchNigth = getStorageSwitchNigthValue === 'true' ? true : false
			var switcheNightEl = $('#view-member .member-nav-wrapper li.switch-night input.switch__input');
			isSwitchNigth ? $('html').addClass('isNigth') : $('html').removeClass('isNigth')
			$(switcheNightEl).attr("checked", isSwitchNigth);
		}
	});

	// 返回全局实例对象，包含MainView和 ...
	return new AppView();
})