
// app ui
// 
define (['namespace'], function(Global) {

	var $ = function (query) { return document.querySelector(query); };
	var $$ = function (query) { return document.querySelectorAll(query); };

	// initailize appui data
	var initNewListCount = initPictureCount = initVideoCount = initMemberCount = initFavorCount = 0;

	var slideOpts = {
	    sl:     ['slin',   'slout' ],
	    sr:     ['srin',   'srout' ],
	    popin:  ['popin',  'noanim'],
	    popout: ['noanim', 'popout'],
	};

	// switch channel
	var SwitchTabs = function(el) {
		// if (!el) return;
		el = this;

		var viewIn = $('#' +el.dataset.vin);
		var viewOut = $('section.active');
		var _thisIn = el;
		var _thisOut = $('nav button.active');
  
		// hidden current show section element
		viewOut.classList.remove('active');
		viewOut.classList.add('hidden');

		// on the basis of viewIn attributes value (data-view) assign
		viewIn.classList.remove('hidden');
		viewIn.classList.add('active');
		
		// switch current viewport
		_thisOut.classList.remove('active');
		_thisIn.classList.add('active');

		// 处理app router
		if (Global.app.appRouter) {
			if (viewIn.id === 'view-list') {
				initNewListCount++;
				if (initNewListCount <= 1){
					Global.app.appRouter.navigate('list/' + 1, { trigger: true });
				}
				else if (initNewListCount > 2){
					Global.app.appRouter.navigate('list/' + 1, { trigger: false });
				}
			}
			if (viewIn.id === 'view-picture') {
				initPictureCount++;
				if (initPictureCount <= 1){
					Global.app.appRouter.navigate('list/' + 120, { trigger: true });
				}
				else if (initPictureCount > 2){
					Global.app.appRouter.navigate('list/' + 120, { trigger: false });
				}
			}
			if (viewIn.id === 'view-video') {
				initVideoCount++;
				if (initVideoCount <= 1){
					Global.app.appRouter.navigate('video', { trigger: true });
				}
				else if (initVideoCount > 2){
					Global.app.appRouter.navigate('video', { trigger: false });
				}
			}
			if (viewIn.id === 'view-member') {
				Global.app.appRouter.navigate('member', { trigger: true });
				return;
				initMemberCount++;
				if (initMemberCount <= 1){
					Global.app.appRouter.navigate('member', { trigger: true });
				}
				else if (initMemberCount > 2){
					Global.app.appRouter.navigate('member', { trigger: false });
				}

			}
			if (viewIn.id === 'view-favor') {
				Global.app.appRouter.navigate('favor', { trigger: true });
				return;
				initFavorCount++;
				if (initFavorCount <= 1){
					Global.app.appRouter.navigate('favor', { trigger: true });
				}
				else if (initFavorCount > 2){
					Global.app.appRouter.navigate('member', { trigger: false });
				}
			}
		}
	};

	var Slide = function(el, isDelegate) {
		if (!isDelegate) el = this;
	    var vIn = $('#'+el.dataset.vin);
	    var vOut = $('section.active');
	    var slideType = el.dataset.sd;
	    var getActionURL = el.getAttribute('data-action');
	    var getReturnURL = el.getAttribute('data-return');
	    var getIsNav = el.getAttribute('data-isNav');
	    var nav = $('nav');

        var onAnimationEnd = function () {
            vOut.classList.add('hidden');
            vIn.classList.add('active');

            vIn.classList.remove(slideOpts[slideType][0]);
            vOut.classList.remove(slideOpts[slideType][1]);
            vOut.removeEventListener('webkitAnimationEnd', onAnimationEnd, false);
            vOut.removeEventListener('animationend',       onAnimationEnd);

            // animation end of call location method
		    if (getActionURL) window.location.href = getActionURL;
        };

        // if value's doesn't exist, set viewport status
	    if (getActionURL && vIn.id === 'view-newsDetail' || el.getAttribute('data-indicator') === 'true') {
	    	// vIn.querySelector('.loading').style.display = 'block';
	    	myApp.showIndicator();
	    	vIn.querySelector('.scroll .content').innerHTML = '';
	    	if (vIn.id === 'view-newsDetail') vIn.querySelector('header .icon-favor-wrap .icon-favor').classList.remove('checked');
	    }

	   	// set view in return URL
	   	if (getReturnURL) {
	   		vIn.querySelector('button.onBind').setAttribute('data-vin-return', getReturnURL);
	   	}

	    // set app routes URL
	   	if (el.className === 'onBind' 
	   		|| el.getAttribute('data-vin') === 'view-list' 
	   		|| el.getAttribute('data-vin') === 'view-member' 
	   		|| el.getAttribute('data-vin') === 'view-comment'
	   		|| el.getAttribute('data-vin') === 'view-favor'
	   		|| el.getAttribute('data-vin') === 'view-myComment'
	   		) 
	   	{
	   		var getButtonReturnURL = el.getAttribute('data-vin-return');

			if (Global.app.appRouter && getButtonReturnURL !== null) {
				Global.app.appRouter.navigate(getButtonReturnURL, {trigger: false});
			}

			if (nav.classList.contains('nav-out') && el.getAttribute('data-vin') != 'view-newsDetail') {
				nav.classList.remove('nav-out');
				nav.classList.add('nav-in');
			}
	   	}

	   	if (getIsNav || el.getAttribute('data-vin') === 'view-favor' || el.getAttribute('data-vin') === 'view-myComment') {
	   		nav.classList.remove('nav-in');
	   		nav.classList.add('nav-out');
	   	}

	    vOut.addEventListener('webkitAnimationEnd', onAnimationEnd, false);
	    vOut.addEventListener('animationEnd', onAnimationEnd, false);

	    // hidden indicator
	    if (el.className === 'onBind') {
	    	myApp.hideIndicator();
	    }

	    // if (event && typeof event === 'function') {
	    // 	event();
	    // }

	    vOut.classList.remove('active');
	    vIn.classList.remove('hidden');
	    vIn.classList.add( slideOpts[slideType][0]);
	    vOut.classList.add(slideOpts[slideType][1]);

	};

	var UI  = {
		// initailize appui
		init: function() {

			// switch channel
			var tabBtns = $$('nav button');
			for ( var i = 0; i < tabBtns.length; i++ ) {
				tabBtns[i].addEventListener('click', SwitchTabs, false);
			}

			// head button's switch
			var navbtns = $$('#view-newsDetail header button.onBind, #view-newsDetail header .icon-comment-wrap, #view-comment header button.onBind, #view-pictureDetail header button.onBind, #view-favor header button.onBind, #view-articleFontSize header button.onBind, #view-login header button.login-right-close, #view-aboutBiketo  header button.onBind, #view-team  header button.onBind, #view-aboutUs  header button.onBind, #view-myComment  header button.onBind');
        	for (var i = 0; i<navbtns.length; i++) navbtns[i].addEventListener('click', Slide, false);

        	// init click event Used delegate event
        	this.newsSwitchTabs();
        	this.pictureSwitchTabs();
		},

		// switch newslist
		newsSwitchTabs: function() {
			function handleClicks(e) {
				var clicked = e.target;
				e.preventDefault();

				// Listener slidelist
				var slideItem;
				if (clicked.parentNode.classList.contains('item')) slideItem = clicked.parentNode;
				if (slideItem) Slide(slideItem, true);

				// Listener newslist
				var newsItem;
				if (clicked.classList.contains('item-text') || clicked.classList.contains('item-title') || clicked.parentNode.classList.contains('item-media')) {
					e.preventDefault();
					if (clicked.classList.contains('item-text') || clicked.parentNode.classList.contains('item-media')) {
						newsItem = clicked.parentNode.parentNode.parentNode;
					} else if (clicked.classList.contains('item-title')) {
						newsItem = clicked.parentNode.parentNode.parentNode.parentNode;
					}
				}
				if (newsItem) Slide(newsItem, true);

				// Set return view value
				var viewInWrapper = $('section#view-newsDetail');
				var viewInWrapperButton = viewInWrapper.querySelector('button');
				viewInWrapperButton.setAttribute('data-vin', 'view-list');
			}
			$('#view-list .iScroll').addEventListener('click', handleClicks, false);
		},

		// switch picture list
		pictureSwitchTabs: function() {
			function handleClicks(e) {
				var clicked = e.target;
				e.preventDefault();
				// Listener slidelist
				var pictureListItem;
				if (clicked.parentNode.parentNode.parentNode.parentNode.dataset.vin === 'view-pictureDetail') {
					pictureListItem = clicked.parentNode.parentNode.parentNode.parentNode;
				} else if (clicked.parentNode.parentNode.dataset.vin === 'view-pictureDetail') {
					pictureListItem = clicked.parentNode.parentNode;
				}
				if (pictureListItem) {
					Slide(pictureListItem, true);
					$$('nav button')[1].classList.add('active');
				}
			}
			$('#view-picture .iscroll').addEventListener('click', handleClicks, false);
		},

		// asynchronous execute method
		showSwitchTabs: function(length) {
 			var tabBtns = $$('nav button');
 			SwitchTabs.apply(tabBtns[length]);
  		},

  		// export an asynchronous method 
  		exSlide: function() {
  			Slide.apply(this);
  		}

	};

	return UI;
})