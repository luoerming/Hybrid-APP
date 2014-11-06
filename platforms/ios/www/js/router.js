
define ([
	'jquery',
	'underscore',
	'backbone',
	'webStorage',
	'views/main',
	'views/main/header',
	'appUI',
], function($, _, Backbone, WebStorage, MainView, Header, AppUI) {

	var AppRoute = Backbone.Router.extend({
		routes: {
			'': 'viewNewsList',
			'list/:classid': 'viewNewsList',
			'list/:classid/:aid': 'viewNewsDetail',
			'video': 'viewVideoList',
			'member': 'viewMemberCenter',
			'favor': 'viewFavor',
			'comment/:classid/:articleid': 'viewComment',
			'comment/:classid/:plid/add': 'viewAddComment',
			'myComment': 'viewMyComment'
		},
		initialize: function() {
			WebStorage.set({'classId': 1});
			this.init = 0;
		},
		viewNewsList: function(cid) {
			var cid = cid || 1;
			if (cid === '120' ) {
				MainView.showPictureList(cid);
				AppUI.showSwitchTabs(1)
			}
			else if(cid !== '120' ) {
				MainView.showNewsList( cid );
				Header.navigationHover( cid );
				WebStorage.set({'classId': cid});
			}
		},
		viewVideoList: function() {
			AppUI.showSwitchTabs(2);
			MainView.showVideoList();
		},
		viewNewsDetail: function(cid, aid) {
			this.init ++;
			if (cid === '120' && aid) {
				MainView.showPictureDetail(aid);
				(this.init === 1) &&  AppUI.showSwitchTabs(1);
			}
			else if(cid != '120') {
				MainView.showNewsDetail(cid, aid);
			}
		},
		viewMemberCenter: function() {
			AppUI.showSwitchTabs(3);
			MainView.showMemberCenter();
		},

		viewFavor: function() {
			// AppUI.showSwitchTabs(4);
			MainView.showFavor();
		},

		viewComment: function(classid, articleid) {
			MainView.showComment(classid, articleid);
		},

		viewAddComment: function(classid, plid, str) {
			MainView.showAddComment(classid, plid);
		},

		viewMyComment: function() {
			MainView.showMyComment();
			console.log('approute myComment')
		}

	})
	
	return new AppRoute();
})