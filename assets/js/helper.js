var Screens = {
	current : null,
	stack : [],
	show : function (target, reverse) {
		target = (typeof target == 'string') ? $('#' + target) : target;
		reverse = reverse || false

		//hide the prev screen
		if (Screens.current != null)
			Screens.current.hide();
		
		//show new screen
		$.mobile.changePage(target, { reverse : reverse, allowSamePageTransition : false })
		target.show();

		//set the cuurent to new screen
		Screens.current = target;
	},
	back : function () {
		Screens.stack.pop();
		var screen = Screens.stack.pop();
		console.log(screen);	
		if (screen && screen.attr('id') !== 'screen-login')
			Screens.show(screen, true);
	}
}

var Cam = {
	lastPhoto : false,
	open : function () {
		navigator.camera.getPicture(Cam.success, Cam.error, {
			quality: 80, 
			allowEdit: true
		});
	},
	success : function (imageData) {
		Cam.lastPhoto = "data:image/jpeg;base64," + imageData;
		
		//hoto image preview window
		Screens.show('screen-upload-photo');
		
	},
	error : function (message) {
		alert('Failed because: ' + message);
	}
}