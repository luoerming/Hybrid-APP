	//创建模拟对象


define (function() {

	// 设置存储值
	function setStorage(argument) {
		var newValue = argument || {};
		var oldValue = getStorage();
		
		(!newValue.classId ) && (newValue.classId = oldValue.classId);
		(!newValue.favor ) && (newValue.favor = oldValue.favor);
		(!newValue.userinfo ) && (newValue.userinfo = oldValue.userinfo);

		var obj = { 
			'classId' : newValue.classId || '0', 
			'favor' : newValue.favor || '0', 
			'userinfo' : newValue.userinfo || '0', 
		};

		localStorage.setItem('biketo', JSON.stringify(obj));
		
	};

	// 获取已存储的值
	function getStorage(){
		var value = localStorage.getItem('biketo');
		var json = JSON.parse(value) || '0';
		return json;
	};

	return {
		set: setStorage,
		get: getStorage
	};

})