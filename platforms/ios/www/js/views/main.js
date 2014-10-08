
define ([
	'jquery',
	'underscore',
	'backbone',

	'views/main/newsDetail', 
	'views/main/newsList', 

	'views/main/pictureList', 
	'views/main/pictureDetail',

	'views/main/videoList',
	'views/main/memberCenter',

	'text!templates/newsList.html',
	'text!templates/newsDetail.html',

	'text!templates/pictureList.html',
	'text!templates/pictureDetail.html',

	'text!templates/videoList.html',
	'text!templates/member.html',
	'text!templates/login.html',
	'text!templates/nav.html'
], function(
	$, 
	_, 
	Backbone, 

	NewsDetail, 
	NewsList, 

	PictureList, 
	PictureDetail, 

	VideoList, 
	MemberCenter,

	NewsListTpl, 
	NewsDetailTpl, 

	PictureListTpl, 
	PictureDetailTpl, 

	VideoListTpl, 

	MemberTpl, 

	LoginTpl,

	NavTpl
	) {

	var MainView = Backbone.View.extend({
		className: 'container',
		initialize: function() {
			this.$el.append(
				// 列表模板
				NewsListTpl,
				PictureListTpl,
				VideoListTpl,
				// 详情模板
				NewsDetailTpl,
				PictureDetailTpl,
				// 会员中心，登录
				MemberTpl,
				LoginTpl,
				// 全局导航
				NavTpl);
		},

		render: function() {
			return this;
		},

		showNewsList: function(cid) {
			NewsList.render(cid);
		},
		
		showVideoList: function() {
			VideoList.render();
		},

		showPictureList: function(cid) {
			PictureList.render(cid);
		},

		showPictureDetail: function(aid) {
			PictureDetail.render(aid);
		},

		showNewsDetail: function(cid, aid) {
			this.$el.append(NewsDetail.render(cid, aid));
		},

		showMemberCenter: function() {
			MemberCenter.render();
		}

	});

	// 返回一个主体容器
	return new MainView();
})
