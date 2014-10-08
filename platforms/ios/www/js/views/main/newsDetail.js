
define ([
	'jquery',
	'underscore',
	'backbone',
	'namespace',
	'webStorage',
	'text!templates/newsDetail.html',
	'models/newsDetaill',
	'views/main/userFavor'
], function($, _, Backbone, Global, WebStorage, Tpl, NewsDetaillModel, UserFavor) {

	var NewsDetailView = Backbone.View.extend({

		template: function() {
			// 使用 textarea的小技巧返回未转义的html值；
			var escape = document.createElement('textarea');
			escape.innerHTML = $(Tpl).find('.content')[0].innerHTML;
			return escape.value;
		},

		render: function(cid, aid) {
			// set appui
			this.newsDetail = $('#view-newsDetail');
			this.vOut = $('section.active');
			this.loaded = this.newsDetail.find('.loading').height(this.newsDetail.height() -55);

			this.vOut.toggleClass('active');
			this.vOut.addClass('hidden');
			this.newsDetail.removeClass('hidden');
			this.newsDetail.addClass('active');
			
			// this.loaded.show();

			this.model = new NewsDetaillModel();

			this.model.fetch({
				cache: true,
				url: Global.app.opts.url + 'a=render&classid=' + cid + '&aid=' +aid
			});

			this.model.listenTo(this.model, 'sync', _.bind(this.renderAll, this));
			this.model.listenTo(this.model, 'sync', _.bind(this.newsFavor, this));
		},

		renderAll: function(model) {
			var _me = this;
			var newstext = model.get('newstext').replace(/(\[!--empirenews.page--\])/g, '').replace(/(img src)/g, 'img data-src');
			var container = $('#view-newsDetail .content');
			var objStr = {
				title: model.get('title'),
				newstext: newstext,
				diggtop: model.get('diggtop'),
				newstime: model.get('newstime'),
				classname: model.get('classname')
			};
			_me.newsDetail.find('.scroll')[0].scrollTop = 0;
			container.html(_.template(_me.template(), objStr));
			_me.loaded.hide();
		},

		/**
		 * 顶文章
		 * @param cid 
		 * @param aid 
		 */
		// newsDiggtop: function(cid, aid) {
		// 	var button = this.newsDetail.find('.icon-like-wrap .icon-like');
		// 	var url = 'http://www.biketo.com/do/digg/';
		// 	var thisValue = '#list/'+cid +'/' +aid;
		// 	var getValue = WebStorage.get().favor || [];
		// 	var isValueTrue = _.contains(getValue, thisValue);

		// 	// 判断是否已存在
		// 	(isValueTrue) ? button.addClass("checked") : button.removeClass("checked");
		// 	if (isValueTrue) return false;

		// 	var submitForm = function() {
		// 		/**
		// 		 *  如果没有：
		// 		 *  1、添加一个，
		// 		 *  2、尝试提交，成功后再高亮显示；
		// 		 */
		// 		if (!isValueTrue) {
		// 			getValue.push(thisValue);
		// 			WebStorage.set({'favor': getValue });
		// 		}
		// 		$.post(url, {'classid' : cid, 'id' : aid }, submitCallback, 'json');
		// 	}
		// 	var submitCallback = function (d) {
		// 		var status = d.status, data = d.data, message = d.message;
		// 		if (status) {
		// 			console.log('ok',data);
		// 			button.addClass("checked");
		// 		} else {
		// 			if (message == '您已提交过了') {
		// 				button.addClass("checked");
		// 			}
		// 		}
		// 	}
		// 	// 绑定提交按钮
		// 	button.on('click', _.debounce(submitForm, 100, true));
		// },

		/**
		 * 文章收藏
		 */
		newsFavor: function(model) {
			var button = document.querySelector('#view-newsDetail .icon-favor-wrap .icon-favor');
			UserFavor.render('save', {
				el: button, 
				models: {
					title: model.get('title'), 
					cid: model.get('classid'),
					aid: model.get('id')
				}
			});
		},

		fixNewsText: function() {
			var img = this.$el.find('img');
			var p = this.$el.find('p');
			img.attr('src','images/image-loading.png')
			   .attr('data-img','http://www.biketo.com' + img.attr('src'))
			   .attr('isload','false')
			   .parents().css('text-align','center');
		}
	});

	// 详情新闻
	return new NewsDetailView();
})

