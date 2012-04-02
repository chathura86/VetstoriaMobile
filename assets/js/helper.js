String.prototype.lpad = function(padString, length) {
	var str = this;
	while (str.length < length)
	{
		str = padString + str;
	}

	return str;
};

//pads right
String.prototype.rpad = function(padString, length) {
	var str = this;
	while (str.length < length)
	{
		str = str + padString;
	}
	
	return str;
};

String.prototype.ltrim = function () {
	var re = /\s*((\S+\s*)*)/;
	return this.replace(re, "$1");
};

String.prototype.rtrim = function () {
	var re = /((\s*\S+)*)\s*/;
	return this.replace(re, "$1");
};

String.prototype.trim = function () {
	return this.ltrim().rtrim();
};

var Screens = {
	current : null,
	stack : [],
	show : function (target, reverse) {
		target = (typeof target == 'string') ? $('#' + target) : target;
		reverse = reverse || false

		//hide the prev screen
//		if (Screens.current != null)
//			Screens.current.hide();

		//show new screen
		$.mobile.changePage(target, { reverse : reverse, allowSamePageTransition : false })
//		target.show();

		//set the cuurent to new screen
		Screens.current = target;
	},
	back : function () {
		Screens.stack.pop();
		var screen = Screens.stack.pop();

		if (screen && screen.attr('id') !== 'screen-login')
			Screens.show(screen, true);
		else
			Screens.show('screen-main', true);
	}
}

var Cam = {
	data : {},
	lastPhoto : false,
	open : function (data) {
		data = data || {};
		Cam.data = data;
		
		try {
			navigator.camera.getPicture(Cam.success, Cam.error, {
				quality: 80, 
				allowEdit: true,
				sourceType : Camera.PictureSourceType.CAMERA, 
				destinationType : Camera.DestinationType.DATA_URL
			});
		} catch (e) {
			alert('Device not supported');
		}
	},
	select : function (data) {
		data = data || {};
		Cam.data = data;
		
		try {
			navigator.camera.getPicture(Cam.success, Cam.error, {
				quality: 80, 
				allowEdit: false,
				sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
				destinationType : Camera.DestinationType.DATA_URL
			});
		} catch (e) {
			alert('Device not supported');
		}
	},
	success : function (imageData) {
		Cam.lastPhoto = imageData;
		
		//photo image preview window
		Screens.show('screen-upload-photo');
		
	},
	error : function (message) {
		alert('Failed because: ' + message);
	}
}