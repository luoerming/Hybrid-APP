
/**
 * Name: btFrameworkJS
 * 
 * Author: Carroll (htt://luoerming.com, mailto: me@luoerming.com)
 * 
 * Date: {
 *   2014/09/10 - 
 *     1、初步构建代码结构
 *     
 *   2014/09/25 -
 *     1、修改代码结构 （参考多个UI框架）
 *     2、
 * }
 * 
 * Description: 
 *   一个微型的移动开发框架，集成简单的DOM操作、页面UI交互动画、AJAX等常用的功能
 *   bt-framework.js (是BT是目前所有公司名biketo的缩写, 也是"变态"的缩写 - - ||)
 */

(function(){

  'use strict';

  /*---------------------------------------
  * 框架UI部分
  ---------------------------------------*/
  window.btFramework = function(params) {

    // 使用别名
    var app = this;

    // 版本
    app.version = '0.1.0';

    // 默认值
    app.param = {
      // Modals
      modalTemplate: '',
    };

    // 扩展默认参数
    for (var param in params) app.params[param] = params[param];

    // DOM lib
    var $ = Dom;

    // *** Views *** 

    app.views = [];

    // 构造一个View的类
    function View(selector, params) {
      var defaults = {
        // ...
      };

      params = params || {};
      for (var def in defaults) {
        if (typeof params[def] === 'undefined') params[def] = defaults[def];
      }

      // 使用别名
      var view = this;
      view.params = params;

      // 返回一个object
      return view;
    };

     // *** Modal *** 
    
    var _modalTemplateTempDiv = document.createElement('div');
    app.modal = function(params) {
      params = params || {};

      var buttonHTML = '';
      if (params.buttons && params.buttons.length > 0) {
        for (var i = 0; i < params.buttons.length; i++) {
          buttonHTML += '<span class="modal-button">' + params.buttons[i].text + '</span>';
        }
      }

      /// ... 考虑项目进度暂不编写该函数, 先使用原先的modal UI来使用，后期的扩展是，先判断如果应用已被打包（如：phoneGap）则使用原生自带的model UI，否则使用该方法内UI；
    }

    // *** 显示加载状态 ***
    app.showIndicator = function () {
        // $('body').append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
        $('body').append('<div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
    };

    app.hideIndicator = function () {
        $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
        $('.preloader-indicator-modal').remove();
    };

  };

  /*---------------------------------------
  * Dom Library
  ---------------------------------------*/
  var Dom = (function(){

    // 构造一个Dom的类
    function Dom(arr) {
      var self = this, 
          i = 0;

      // Create array-like object
      for (i = 0; i < arr.length; i++) self[i] = arr[i];

      self.length = arr.length;

      // Return collection methods
      return this;
    };

    // 使用 $ 来实例Dom的方法，最后返回所有Dom内的实例方法
    // Use $ method, last return in Dom instance of method
    var $ = function(selector, context) {
      var arr = [], i = 0;

      // 如果只有第一个selector参数
      if (selector && !context) {

        // 判断是否是 Dom的实例方法，再返回该方法
        if (selector instanceof Dom) {
          return selector;
        }
      }

      if (selector) {

        // 如果是字符串类型
        if (typeof selector === 'string') {
          var els = (context || document).querySelectorAll(selector);
          for (i = 0; i < els.length; i++) arr.push(els[i]);

          // console.log('string :', selector);
        }

        // 否则如果是Node/element的类型
        else if (selector.nodeType || selector === window || selector === document) {
          arr.push(selector);

          // console.log('node/element: ', selector);
        }

        // 否则如果是 Arry组合元素，或Dom的实例
        else if (selector.length > 0 && selector[0].nodeType) {
          for (i = 0; i < selector.length; i++) arr.push(selector[i]);

          // console.log('array: ', selector);
        }
      }

      // 最后传递arr的参数（数组类型），实例化Dom的方法
      return new Dom(arr);
    };

    Dom.prototype = {

      addClass: function(className) {},

      removeClass: function(className) {},

      hasClass: function(className) {},

      toogleClass: function(className) {},

      attr: function(attr, value) {},

      removeAttr: function(attr) {},

      // prop: function

      data: function(key, value) {},

      val: function(value) {},

      // Transforms
      transform: function(transform) {},

      transition: function(duration) {},

      // ...

      // Events
      on: function(eventName, targetSelector, listener) {},

      off: function(eventName, listener) {},

      trigger: function(eventName, eventData) {
        for (var i = 0; i < this.length; i++) {
            var evt;
            try {
                evt = new CustomEvent(eventName, {detail: eventData, bubbles: true, cancelable: true});
            }
            catch (e) {
                evt = document.createEvent('Event');
                evt.initEvent(eventName, true, true);
                evt.detail = eventData;
            }
            this[i].dispatchEvent(evt);
        }
        return this;
      },

      transitionEnd: function(callback) {},

      animationEnd: function(callback) {},

      // Sizing/Styles
      width: function() {},

      outerWidth: function(margins) {},

      // ...

      // Dom manipulation
      each: function(callback) {},

      html: function(html) {},

      append: function(newChild) {
        var i, j;
        for (i = 0; i < this.length; i++) {
            if (typeof newChild === 'string') {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = newChild;
                while (tempDiv.firstChild) {
                    this[i].appendChild(tempDiv.firstChild);
                }
            }
            else if (newChild instanceof Dom7) {
                for (j = 0; j < newChild.length; j++) {
                    this[i].appendChild(newChild[j]);
                }
            }
            else {
                this[i].appendChild(newChild);
            }
        }
        return this;
      },

      find: function(selector) {},

      // 移动元素
      remove: function(selector) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
        }
        return this;
      },

    };

    // ** Ajax **

    /**
     * $.ajax
     * @param {[Object]} settings 参数
     */
    $.ajax = function(settings) {

      //参数默认值扩展
      settings = $.extend({
        url: '',
        type: 'get',
        data: '',
        isJson: false
      }, settings);

      //参数
      var url = $.trim(settings.url), //url去除前后空格
          type = settings.type.toLowerCase(),
          data = settings.data,
          isJson = settings.isJson,
          success = settings.success,
          response;

      //url合法性筛选
      if (typeof url !== "string" || url === "") { return; };

      //发送http请求
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223) {
            var response = decodeURIComponent(xhr.responseText);
            if (isJson) {
              response = eval("(" + response + ")"); //json格式解析
            }
            if (success) {
              success(response);
            }
          }
        }
      };

      // Open XHR
      xhr.open(type, url, true);
      if (type === "get") {
        xhr.send(null);
      } 
      else if (type === "post") {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(data);
      }

    };

    // ** DOM Library Utilites **

    // 扩展对象（替换默认值）
    $.extend = function(target, obj) {
      if(obj) {
        for (var i in target) {
          if ((typeof obj[i]) === 'undefined') {
            obj[i] = target[i];
          }
        }
        return obj;
      }
      else {
        return target;
      }
    }

    //去除字符串的左右空格
    $.trim = function(str, pos) {
      /**参数解释
       * str:需要去除空格的字符串
       * pos:去除空格的位置,可选值为"left","right"[可选]
       */
      var trimLeft = /^[\s\xA0]+/,
        trimRight = /[\s\xA0]+$/;
      if (!pos || (pos !== "left" && pos !== "right")) { //默认去除字符串两边空格
        return str.replace(trimLeft, "").replace(trimRight, "");
      } else if (pos === "left") { //去除字符串左空格
        return str.replace(trimLeft, "");
      } else if (pos === "right") { //去除字符串右空格
        return str.replace(trimRight, "");
      }
    };

    // 返回所有Dom内的实例方法
    return $;
  })();
  // --------------------------------------
  // Dom End ....


  // Export Dom to btFramework
  btFramework.$ = Dom;

  // Export to local scope
  var $ = Dom;

  // Export to Window
  window.Dom = Dom;

})();
// --------------------------------------
// bt-framework End ....