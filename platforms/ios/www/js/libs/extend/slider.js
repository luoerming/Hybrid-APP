/**
 * @file 图片轮播组件 
 */

define (['hammer'], function(Hammer) {

	/**
     * //扩展对象(默认值替换)
     * @param  {object} target 默认值对象
     * @param  {object} obj    待扩展的对象
     * @return {object}        返回扩展后的对象
     */
	function extend(target, obj) {
	  if (obj) {
	    for (var i in target) {
	      if ((typeof obj[i]) === "undefined") {
	        obj[i] = target[i];
	      }
	    }
	    return obj;
	  } else {
	    return target;
	  }
	}

	function dirProp(direction, hProp, vProp) {
        return (direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp
    }

    /**
     * Create a object
     * @param {[type]} config [description]
     */
	function Slider(config) {

		// Default configuration
		config = extend({
			dataList: [], // default table data
			container: document.querySelector('.ui-slider'), // default wrap document
			direction: Hammer.DIRECTION_HORIZONTAL, //default show horizontal
			currentIndex: 0, // default switch value
			urlExtend: 'd/imagecache/rewidth/400',
			showDots: true,
			showNumber: false,
			multiTouch: false,
			setAttr: false,
			title: '',
		}, config);

		this.dataList = config.dataList;
		this.container = config.container;
		this.direction = config.direction;
		this.containerSize = this.container[dirProp(this.direction, 'offsetWidth', 'offsetHeight')]; // Get container width value
		this.urlExtend = config.urlExtend ? config.urlExtend : '';
		this.currentIndex = 0;
		this.showDots = config.showDots;
		this.multiTouch = config.multiTouch;
		this.setAttr = config.setAttr;
		this.title = config.title;
		this.ticking = true;

		this.init();
	};

	Slider.prototype = {

		// initialize
		init: function() {
			if (!this.dataList) return false;

			this.renderDOM();
			this.bindHammer();
			this.show(this.currentIndex);
			this.lazyload(this.currentIndex);
			
			(this.showDots) && this.dots();
			(this.multiTouch) && this.zoom();
			(this.multiTouch) && this.articleInfo();
		},

		/**
		 * building DOM
		 * @return {[type]} [description]
		 */
		renderDOM: function() {
			var len = this.dataList.length;

			var itemIndex, item, data;
			for (itemIndex = 0; itemIndex < len; itemIndex++) {
				var data = this.dataList[itemIndex];
				var item = document.createElement('div');
				var title = document.createElement('p');
				var img = '<img lazyload="http://biketo.com/' +this.urlExtend +data['titlepic']+'" />';

				// 判断幻灯片类型，构建不同的DOM结构
				if (this.multiTouch) {
					var pinchWrap = document.createElement('div');
						pinchWrap.innerHTML = img;
						pinchWrap.classList.add('pincWrap');
					item.appendChild(pinchWrap);
				} else {
					item.innerHTML = img;
					title.innerHTML = data['title'];
					item.appendChild(title);
				}
				item.classList.add('fadeIn');
				item.classList.add('item');

				if (this.setAttr) {
					item.setAttribute('data-action','#list/' + data['classid'] + '/' + data['id']);
					item.setAttribute('data-vin','view-newsDetail');
					item.setAttribute('data-sd','sl');
					item.setAttribute('data-return','#list/' + data['channelid']);
				}

				this.container.appendChild(item);
			}

			// AppUI.newsSliderSwitch();
		},

		/**
		 * bind event
		 * @return {Ojbct} hammer
		 */
		bindHammer: function() {
			// hammerJS
			hammer = new Hammer(this.container);
	  		hammer.on("pan panend pancancel", Hammer.bindFn(this.onPan, this));
		},
		/**
		 * Pinch zoom picture
		 * @return {[type]} [description]
		 */
		zoom: function() {
			zoomItem = Array.prototype.slice.call(this.container.childNodes, 0);
			for (var itemIndex = 0; itemIndex < zoomItem.length; itemIndex++) {
				zoomEl = new Hammer(zoomItem[itemIndex].querySelector('img'));
				zoomEl.get('pinch').set({enable: true})
				zoomEl.on("doubletap", Hammer.bindFn(this.doubleTap, this));
				zoomEl.on("pinch", Hammer.bindFn(this.onPinch, this));
			}
		},

		doubleTap: function(ev) {

			if (this.ticking) {
				// hammer.destroy();
				this.ticking = false;
				transform = {
		            translate: { x: 0, y: 0 },
		            scale: 2,
		            rotate: 0
	        	};
				this.updateElementTransform();
			}
			else {
				transform = {
		            translate: { x: 0, y: 0 },
		            scale: 1,
		            rotate: 0
	        	};
				this.updateElementTransform();

				// hammer.on("pan panend", Hammer.bindFn(this.onPan, this));
				this.ticking = true;
			}

		},

		updateElementTransform: function() {
			// 获取双击的坐标来改变translate的值，使其居中显示放大的位置； {！！！！！}
			var el = zoomItem[this.currentIndex].querySelector('.pincWrap');
	        var value = [
	                    'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
	                    'scale(' + transform.scale + ', ' + transform.scale + ')',
	                    'rotate(' + transform.rotate + 'deg)'];

	        value = value.join(" ");
	        el.style.webkitTransform = value;
	        el.style.transform = value;
	        el.style.transition = 'all .3s';
		},

		/**
		 * handle onPan
		 * @param  {Object} ev
		 */
		onPan: function(ev) {
			var delta = dirProp(this.direction, ev.deltaX, ev.deltaY); // 判断是水平方向还是垂直方向
			var percent = (100 / this.containerSize) * delta; // 算出百分比 使用 100 / 宽度 * X坐标值
			var animate = false;

			if (ev.type =='panend' || ev.type == 'pancancel') {

				if (Math.abs(percent) > 10 && ev.type == 'panend') {
					this.currentIndex += (percent < 0) ? 1 : -1;
					this.lazyload(this.currentIndex);
					this.dots();
					this.articleInfo();
					this.ticking = true;
				}
				percent = 0;
				animate = true;
			}
			this.show(this.currentIndex, percent, animate);
		},

		/**
		 * show a item
		 * @param {[Number]} showIndex
		 * @param {[Number]} [percent] percentage visible
		 * @param {[Boolean]} animate
		 */
		show: function(showIndex, percent, animate) {
			var item = Array.prototype.slice.call(this.container.childNodes, 0);
			showIndex = Math.max(0, Math.min(showIndex, item.length -1)); // 最小 = 0， 最大 = len -1;
			percent = percent || 0;

			var className = this.container.className;
			if (animate) {
				(className.indexOf('animate') === -1) && (this.container.className += ' animate');
			} else {
				(className.indexOf('animate') !== -1) && (this.container.className = className.replace('animate', '').trim());
			}

			var itemIndex, pos, translate;
			for (itemIndex = 0; itemIndex < item.length; itemIndex++) {
				pos = (this.containerSize / 100) * (((itemIndex - showIndex) * 100) + percent);

				if (this.direction & Hammer.DIRECTION_HORIZONTAL) { // Is horizontal
					translate = 'translate3d(' + pos + 'px, 0, 0)';
				} else {
					translate = 'translate3d(0, ' + pos + 'px, 0)';
				}
				item[itemIndex].style.webkitTransform = translate;

				item[itemIndex].classList.remove('current');
			}
			item[showIndex].classList.add('current');
		},

		/**
		 * 用点来显示当前的图片个数及位置
		 */
		dots: function() {
			if (!this.showDots) return false;
			var len = this.dataList.length;
			var container = this.container.parentNode;
			var dotsItem = document.createElement('p');
			var index = Math.max(0, Math.min(len -1, this.currentIndex));
			var dotsContainer = container.querySelector('.ui-slider-dots');

			if (!dotsContainer) {
				for (var i = 0 ; i < len; i++ ) {
					dotsItem.appendChild(document.createElement('b'));
				}
				dotsItem.classList.add('ui-slider-dots');
				container.appendChild(dotsItem);
			}

			var currentDots = container.querySelector('.ui-slider-dots').getElementsByTagName('b');
			for (var i = 0; i < currentDots.length; i++ ) {
				currentDots[i].classList.remove('ui-state-active');
			}
			currentDots[index].classList.add('ui-state-active');
		},

		/**
		 * 显示文件描述信息，标题、图片描述、图片个数等；
		 * @param  {[type]} str [description]
		 * @return {[type]}     [description]
		 */
		articleInfo: function() {
			if (!this.multiTouch) return false;

			var data = this.dataList;
			var index = Math.max(0, Math.min(data.length -1, this.currentIndex));
			var container = this.container.parentNode;
			var dotsItem = document.createElement('p');
			var desc = container.querySelector('.description');

			var h1 = desc.querySelector('h1');
			var p = desc.querySelector('p')
			var count = desc.querySelector('.count');
			var b = count.querySelector('b');
			var i = count.querySelector('i');
			
			h1.innerHTML = this.title;
			p.innerHTML = data[index].title;
			b.innerHTML = index +1;
			i.innerHTML = data.length;
		},

		/**
		 * 预加载下一张图片
		 * @param {Number} currentIndex
		 */
		lazyload: function() {
			var itemsArray = Array.prototype.slice.call(this.container.childNodes, 0);
			var index = Math.max(0, Math.min(itemsArray.length -1, this.currentIndex));

			(index === 0) && (itemsArray[index].querySelector('img').src = itemsArray[index].querySelector('img').getAttribute('lazyload'));

			if (index < itemsArray.length -1) {
				var item = itemsArray[index +1].querySelector('img');
				var currentItem = item.getAttribute('lazyload');

				if (!currentItem || !item) return false;
				item.src = currentItem;
				item.removeAttribute('lazyload');
			}

		},
	}
	return Slider;
});



