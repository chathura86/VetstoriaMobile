var Core = {
	bindEvents : function () {
		$('.back-button').tap(function () {
			Screens.back();
			return false;
		});
		
		$('#screen-login-login').tap(function () {
			var screen = $('#screen-login');
			var email = screen.find('#email');
			var password = screen.find('#password');
			
			if (!(email.get(0).checkValidity() && password.get(0).checkValidity())) {
				alert('Invalid username/password');
				return false;
			}
			
			Api.post('auth', { username : email.val(), password : password.val()}, function () {});
			//Screens.show('screen-main');
			return false;
		});
		
		$('#screen-main-take-a-photo').tap(function () {
			Cam.open();
			return false;
		});
	
		
		$('#screen-main-my-pets').tap(function () {
			Screens.show('screen-my-pets');
			return false;
		});
		
		//page init bindings
		$('#screen-upload-photo').live('pageshow', function () {
			if (Cam.lastPhoto === false) {
				Screens.back();
				return;
			}
			
			Screens.current.find('#cam-photo-thumb').attr('src', Cam.lastPhoto);
		});
		
		$('#screen-my-pets').live('pageinit', function () {
			Api.getList('mypet', function (response) { 
				//iterate pets and add to list
				var list = $('ul#my-pets-list');
				
				for (var i in response.data.items)
				{
					var pet = response.data.items[i];
					var a = $('<a/>')
						.append($('<img/>', {'class' : "ui-li-thumb",  src : pet.image}))
						.append($('<h3/>', {text : pet.name.trim()}))
						.append($('<p/>', {text : "" + pet.species.trim() + " - (" + pet.breed.trim() + ")"}))
						.click(function () {
							$('#screen-my-pet').data('pet', pet.id);
							Screens.show('screen-my-pet');
							return false;
						});
					
					$('<li/>').append(a).appendTo(list);
				}
				
				list.listview('refresh');
			});
		});
		
		$('#screen-my-pet').live('pageshow', function () {
			var self = $(this);
			
			if (!self.data('pet')) {
				Screens.show('screen-my-pets');
				return false;
			}
			
			Api.get('mypet', self.data('pet'), function (response) {
				self.find('.pet-name').html(response.data.name);
				self.find('#pet-profile-thumb').attr('src', MEDIA_PATH + response.data.image);
				self.find('.prop-dob').html(response.data.dob);
				self.find('.prop-breed').html(response.data.breed);
				self.find('.prop-species').html(response.data.species);
				self.find('.prop-sex').html(response.data.sex);
			});
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