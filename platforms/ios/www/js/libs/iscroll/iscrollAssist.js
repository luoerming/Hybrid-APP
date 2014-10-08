
/**
 * [description] 滚动辅助模块
 */

define ([
	'jquery',
	
], function($) {

	//模块对外提供的公共方法
	var exportsMethods = {
	
		/**
		 * 新建一个竖直滚动实例,并做一些处理,整合上拉下拉的功能
		 * wrapper        要渲染滚动实例的位置
		 * pulldownAction 下拉执行的逻辑
		 * pullupAction   上拉执行的逻辑
		 * opts           滚动个性化参数 
		 * pullText       拉动时不同状态要显示的文字
		 */
		newVerScrollForPull : function(wrapper, pulldownAction, pullupAction, opts, pullText){
			
			var $_wrapper 		= $(wrapper),
				$_pulldown 		= $_wrapper.find('.pulldown'),
				$_pulldownLabel = $_pulldown.find('.pulldown-label'),
				$_pullup  		= $_wrapper.find('.pullup'),
				$_pullupIcon  	= $_pullup.find('.pullup-icon'),
				$_pullupLabel   = $_pullup.find('.pullup-label'),
				pullupOffset 	= 0,
				pulldownOffset 	= 0;

			// 状态
			var statusPulldownRefresh   = pullText && pullText['statusPulldownRefresh']	 ? pullText['statusPulldownRefresh']  : '下拉刷新',
				statusPullupLoadingMore = pullText && pullText['statusPullupLoadingMore']? pullText['statusPullupLoadingMore']: '上拉加载更多',
				statusReleaseToRefresh  = pullText && pullText['statusReleaseToRefresh'] ? pullText['statusReleaseToRefresh'] : '释放立即刷新',
				statusReleaseToLoading  = pullText && pullText['statusReleaseToLoading'] ? pullText['statusReleaseToLoading'] : '释放立即加载',
				statLoading				= pullText && pullText['loading'] 				 ? pullText['loading'] 				  : '加载中';
			
			// 设置默认显示
			if ( $_pulldown.length > 0 && $_pullup.length > 0) {
				pulldownOffset	= $_pulldown.outerHeight();
				pullupOffset 	= $_pullup.outerHeight();
				$_pulldownLabel.html( statusPulldownRefresh );
				$_pullupLabel.html( statusPullupLoadingMore );
			} 
			else {
				return ;
			}
		
			//滚动刷新触发的事件
			var scrollRefreshFunc = function() {
				if ( $_pulldown.hasClass('loading') ) {
					$_pulldown.removeClass('loading');
					$_pulldownLabel.html( statusPulldownRefresh );
				} 
				else {
					$_pullupIcon.show();
					if ( $_pullup.hasClass('loading') ) {
						$_pullupIcon.show();
						$_pullup.removeClass('loading');
						$_pullupLabel.html( statusPullupLoadingMore );
					}
				}
			};

			//滚动的时候触发的事件
			var scrollMoveFunc = function() {
				// 下拉刷新
				if ( this.y > 5 && !$_pulldown.hasClass('flip') ) {
					$_pulldown.removeClass('loading').addClass('flip');
					$_pulldownLabel.html(statusReleaseToRefresh);
					this.minScrollY = 0;
				} 
				// 终止刷新操作，松手
				else if ( this.y < 5 && $_pulldown.hasClass('flip') ) {
					$_pulldown.removeClass('loading');
					$_pulldownLabel.html( statusPulldownRefresh );
					this.minScrollY = -pulldownOffset;
				}
				// this.y < this.minScrollY代表是上拉,以防下拉的时候未拉到尽头时进入上拉的逻辑中
				else if ( this.y < this.minScrollY && this.y < (this.maxScrollY - 3) && !$_pullup.hasClass('flip') ) {
					$_pullup.removeClass('loading').addClass('flip');
					$_pullupLabel.html(statusReleaseToLoading);
					this.maxScrollY = this.maxScrollY;
				} 

				else if ( (this.y > (this.maxScrollY + 5)) && $_pullup.hasClass('flip') ) {
					$_pullup.removeClass('loading');
					$_pullupLabel.html(statusPullupLoadingMore);
					this.maxScrollY = this.maxScrollY;
				}

			};

			// 滚动结束触发事件
			var scrollEndFunc = function() {

				if (parseInt(this.y) < parseInt(this.maxScrollY +300)) {
					pullupAction.call(scrollObj);
					return false;
				}

				if ($_pulldown.hasClass('flip')) {
					$_pulldown.removeClass('flip').addClass('loading');
					$_pullupLabel.html(statLoading);
					if ( typeof pulldownAction === 'function' ) {
						pulldownAction.call(scrollObj);
					}
				}
				else if ($_pullup.hasClass('flip') ) {
					$_pullup.removeClass('flip').addClass('loading');
					$_pullupLabel.html(statLoading);
					if ( typeof pullupAction === 'function' && $_pullup.parent().length>0 ) {
						pullupAction.call(scrollObj);
					}				
				}

			};

			//这个属性很重要,目前V5版本不支持,需修改源码
			var options = {
				topOffset : pulldownOffset,
				click : true
			};

			$.extend(true, options, opts);

			var scrollObj = this.newVerScroll( $_wrapper[0], options );

			// 监听scroll对象
			scrollObj.on('refresh', scrollRefreshFunc);
			scrollObj.on('scrollMove', scrollMoveFunc);
			scrollObj.on('scrollEnd', scrollEndFunc);
			
			return scrollObj;
		},

		/**
		 * 创建一个竖直方向的滚动实例
		 * @param obj    dom对象或者选择字符串
		 * @param option 滚动其他属性
		 * @return IScroll实例对象
		 */
		newVerScroll : function(dom, option){
			var opt = {
				scrollbars : true, //是否有滚动条
				useTransition: false,
			};

			if ( option ) {
				$.extend(opt, option);
			}

			var iSObj = new IScroll(dom, opt);

			//V5以前版本有个参数可以设置,V5之后目前只能手动处理滚动条的显示隐藏或者可从外部传个参数进来判断
			iSObj.on("scrollEnd", function(){

				if ( this.indicator1 ){
					this.indicator1.indicatorStyle['transition-duration'] = '350ms';
					this.indicator1.indicatorStyle['opacity'] = '0';
				}
			});

			iSObj.on("scrollMove", function(){
				if ( this.indicator1 ){
					this.indicator1.indicatorStyle['transition-duration'] = '0ms';
					this.indicator1.indicatorStyle['opacity'] = '0.8';
				}
			});
			
			return iSObj;
		}
	};

	return exportsMethods;

});