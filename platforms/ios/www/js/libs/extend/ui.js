
// app ui
// 
define (['namespace'], function(Global) {

	var $ = function (query) { return document.querySelector(query); };
	var $$ = function (query) { return document.querySelectorAll(query); };

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
			(viewIn.id === 'view-list') && Global.app.appRouter.navigate('list/' + 1, { trigger: true });
			(viewIn.id === 'view-picture') && Global.app.appRouter.navigate('list/' + 120, { trigger: true });
			(viewIn.id === 'view-video') && Global.app.appRouter.navigate('video', { trigger: true });
			(viewIn.id === 'view-member') && Global.app.appRouter.navigate('member', { trigger: true });
		}
	};

	var Slide = function(el, isDelegate) {
		if (!isDelegate) el = this;
	    var vIn = $('#'+el.dataset.vin);
	    var vOut = $('section.active');
	    var slideType = el.dataset.sd;
	    var getActionURL = el.getAttribute('data-action');
	    var getReturnURL = el.getAttribute('data-return');

        var onAnimationEnd = function () {
            vOut.classList.add('hidden');
            vIn.classList.add('active');

            vIn.classList.remove(slideOpts[slideType][0]);
            vOut.classList.remove(slideOpts[slideType][1]);
            vOut.removeEventListener('webkitAnimationEnd', onAnimationEnd, false);
            vOut.removeEventListener('animationend',       onAnimationEnd);

            // animation end of call location method
		    getActionURL && (window.location.href = getActionURL);
        };

        // if value's doesn't exist, set viewport status
	    if (getActionURL && vIn.id === 'view-newsDetail') {
	    	// vIn.querySelector('.loading').style.display = 'block';
	    	myApp.showIndicator();
	    	vIn.querySelector('.scroll .content').innerHTML = '';
	    	vIn.querySelector('header .icon-favor-wrap .icon-favor').classList.remove('checked');
	    }

	   	// set view in return URL
	   	if (getReturnURL) {
	   		vIn.querySelector('button.onBind').setAttribute('data-vin-return', getReturnURL);
	   	}

	    // set app routes URL
	   	if (el.className === 'onBind' && el.getAttribute('data-vin') === 'view-list' || el.getAttribute('data-vin') === 'view-member') {
	   		var getButtonReturnURL = el.getAttribute('data-vin-return');

			if (Global.app.appRouter && getButtonReturnURL !== null) {
				Global.app.appRouter.navigate(getButtonReturnURL, {trigger: false});
			}
	   	}

	    vOut.addEventListener('webkitAnimationEnd', onAnimationEnd, false);
	    vOut.addEventListener('animationEnd', onAnimationEnd, false);

	    // if (event && typeof event === 'function') {
	    // 	event();
	    // }

	    vOut.classList.remove('active');
	    vIn.classList.remove('hidden');
	    vIn.classList.add( slideOpts[slideType][0]);
	    vOut.classList.add(slideOpts[slideType][1]);

	};

	// 使用事件委托的方式（事件冒泡原理），类似JQUERY中的live和delegate( live绑定在document，delegate绑定在提供的父元素上)
	// var initClickEvents = function() {

	// 	function handleClicks(e) {

	// 		var clicked = e.target;

	// 		// switch channel
	// 		var navButtons;
	// 		if (clicked.parentNode.nodeName === 'BUTTON') {
	// 			navButtons = clicked.parentNode
	// 		} else if (clicked.parentNode.nodeName === 'NAV') {
	// 			navButtons = clicked
	// 		}
	// 		if (navButtons) {
	// 			if (navButtons.parentNode.nodeName === 'NAV') SwitchTabs(navButtons);
	// 		}

	// 		// switch header button
	// 		var viewHaderButton;
	// 		if (clicked.parentNode.parentNode.nodeName === 'BUTTON') {
	// 			viewHaderButton = clicked.parentNode.parentNode;
	// 		} else if (clicked.nodeName === 'BUTTON') {
	// 			viewHaderButton = clicked;
	// 		}
	// 		if (viewHaderButton) {
	// 			if (viewHaderButton.classList.contains('onBind')) Slide(viewHaderButton);
	// 		}

	// 		// switch newslist
	// 		var newsListEl;
	// 		if (clicked.classList.contains('item-text') || clicked.classList.contains('item-title') || clicked.nodeName === 'IMG') {
	// 			e.preventDefault();
	// 			if (clicked.classList.contains('item-text') || clicked.nodeName === 'IMG') {
	// 				newsListEl = clicked.parentNode.parentNode.parentNode;
	// 				console.log(newsListEl);
	// 			} else if (clicked.classList.contains('item-title')) {
	// 				newsListEl = clicked.parentNode.parentNode.parentNode.parentNode;
	// 			}
	// 		}
	// 		if (newsListEl) {
	// 			console.log(newsListEl, clicked)
	// 			// if (newsListEl.dataset.vin === 'view-newsDetail') Slide(newsListEl);
	// 		}


	// 	}
	// 	document.addEventListener('click', handleClicks, false);
	// };

	// initClickEvents();

	var UI  = {
		// initailize appui
		init: function() {

			// switch channel
			var tabBtns = $$('nav button');
			for ( var i = 0; i < tabBtns.length; i++ ) {
				tabBtns[i].addEventListener('click', SwitchTabs, false);
			}

			// head button's switch
			var navbtns = $$('#view-newsDetail header button.onBind, #view-pictureDetail button.onBind');
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

		// member content favorlist
		memberContentFavorList: function(el) {
			if (!el) { return false; };
			for (var i = 0; i < el.length; i++) {
				el[i].addEventListener('click', this.exSlide, false);
			}
			var viewInWrapper = $('section#view-newsDetail');
			var viewInWrapperButton = viewInWrapper.querySelector('button');
			viewInWrapperButton.setAttribute('data-vin', 'view-member');
		},

		memberContentLogin: function() {
			var login = $('#view-member .member-header-wrapper');
			var logout = $('#view-login .login-right-close');
			login.addEventListener('click', this.exSlide, false);
			logout.addEventListener('click', Slide, false);
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