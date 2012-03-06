var Core = {
	bindEvents : function () {
		$('.back-button').tap(function () {
			Screens.back();
		});
		
		$('#screen-login-login').tap(function () {
			Screens.show('screen-main')
		});
		
		$('#screen-main-take-a-photo').tap(function () {
			Cam.open();
		});
		
		//page init bindings
		$('#screen-upload-photo').live('pageinit', function () {
			if (Cam.lastPhoto === false) {
				Screens.back();
				return;
			}
			
			Screens.current.find('#cam-photo-thumb').attr('src', Cam.lastPhoto);
		});
	}
}

function onDeviceReady () {
	//bind buttons
	Core.bindEvents();
}

$( document ).bind( "mobileinit", function() {
	// Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
});

$( document ).bind( "pagechange", function() {
	//keep the old one on the stack
	Screens.stack.push($.mobile.activePage);
});

document.addEventListener("deviceready", onDeviceReady, false);

$(function () {
	onDeviceReady();
})