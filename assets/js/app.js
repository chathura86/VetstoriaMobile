var Data = {
	token : null
}
var Core = {
	bindEvents : function () {
		$('.page').live('pageinit', function () {
			//redirect to login if not logged in
			if (Data.token === null) {
				Core.logout();
				
				return false;
			}
		});
		
		$('.page').live('pageshow', function () {
			//keep the old one on the stack
			Screens.stack.push($(this));
			return true;
		})
		
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
			
			Api.post('auth', {username : email.val(), password : password.val()}, function (response) {
				if (response.success){
					Data.token = response.data.token;
					email.val('');
					password.val('');
					Screens.show('screen-main');
				} else {
					alert ('Invalid username/password');
				}
			});
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
		$('#screen-upload-photo').live('pageinit', function () {
			$('#screen-upload-photo-save').tap(function () {
				var album = $('select#screen-upload-photo-select-album').val();
				var pet = $('select#screen-upload-photo-select-pet').val();
				
				if (album > 0) {
					Api.post('photo', {album : album, photo : Cam.lastPhoto}, function (response) {
						$('#screen-my-pet').data('pet', pet);
						$('#screen-my-pet-album').data('album', album);
						Screens.show('screen-my-pet-album');
					});
				} else {
					alert('Please select an album');
					return false;
				}
			});
		});
		
		$('#screen-upload-photo').live('pageshow', function () {
//			if (Cam.lastPhoto === false) {
//				Screens.back();
//				return;
//			}
			
			Screens.current.find('#cam-photo-thumb').attr('src', "data:image/jpeg;base64," + Cam.lastPhoto);
			
			var updateAlbumsList = function (pet) {
				var list = $('select#screen-upload-photo-select-album');
				list.empty();
				list.append('<option value="0" data-placeholder="true">Choose an album...</option>');
				list.val(0);
				
				list.change(function () {
					var selected = $(this).val();
					if (selected > 0){
						$('#screen-upload-photo-save').removeAttr('disabled');
					} else {
						$('#screen-upload-photo-save').attr('disabled', true);
					}
				})
				
				Api.getList('album', function (response) {
					list.selectmenu('enable');
					for (var i in response.data.items)
					{
						var album = response.data.items[i];
						$('<option/>')
							.attr('value', album.id)
							.text(album.name.trim())
							.appendTo(list)
					}

					list.selectmenu('refresh');

					//select a pet if possible
					if (Cam.data.album > 0)
					{
						list.val(Cam.data.album);
						$('#screen-upload-photo-save').removeAttr('disabled');
					}
					
				}, {pet : pet});
			}

			//lodaing pets
			Api.getList('mypet', function (response) { 
				var list = $('select#screen-upload-photo-select-pet');
				list.empty();
				list.append('<option value="0" data-placeholder="true">Choose a pet...</option>');
				list.val(0);
				
				list.change(function () {
					var selected = $(this).val();
					if (selected > 0){
						updateAlbumsList(selected);
					} else {
						$('select#screen-upload-photo-select-album').selectmenu('disable');
					}
				});
				
				for (var i in response.data.items)
				{
					var pet = response.data.items[i];
					$('<option/>')
						.attr('value', pet.id)
						.text(pet.name + " " + pet.species.trim())
						.appendTo(list)
				}
				
				list.selectmenu('refresh');
				
				//select a pet if possible
				if (Cam.data.pet > 0) {
					list.val(Cam.data.pet);
					updateAlbumsList(Cam.data.pet);
				} else {
					$('select#screen-upload-photo-select-album').selectmenu('disable');
				}
			});
		});
		
		$('#screen-logout').live('pageinit', function () {
			var self = $(this);
			self.find('#screen-logout-yes').click(function () {
				Core.logout();
			});
			
			self.find('#screen-logout-no').click(function () {
				Screens.back();
				return false;
			});
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
			
			self.find('#screen-my-pet-photos').click(function () {
				$('#screen-my-pet-albums').data('pet', self.data('pet'));
				Screens.show('screen-my-pet-albums');
				return false;
			});
		});
		
		$('#screen-my-pet-albums').live('pageshow', function () {
			var self = $(this);
			
			if (!self.data('pet')) {
				Screens.show('screen-my-pets');
				return false;
			}
			
			Api.getList('album', function (response) {
				//iterate albums and add to list
				var list = $('ul#my-pet-albums-list');
				
				//remove prev list
				list.find('li').remove();
				
				for (var i in response.data.items)
				{
					var album = response.data.items[i];
					var link = $('<a/>')
						.append($('<img/>', {'class' : "ui-li-thumb",  src : MEDIA_PATH + album.photos[0].file}))
						.append($('<h3/>', {text : album.name.trim()}))
						.append($('<p/>', {text : "" + album.posted_date.trim() + " (" + album.view_count.trim() + ") Views"}))
						.data('album', album.id)
						.click(function () {
							$('#screen-my-pet-album').data('album', $(this).data('album'));
							Screens.show('screen-my-pet-album');
							return false;
						});
						
					var edit = $('<a/>')
						.attr('data-icon', 'gear')
						.data('album', album.id)
						.click(function () {
							$('#screen-my-pet-album-edit').data('album', $(this).data('album'));
							Screens.show('screen-my-pet-album-edit');
							return false;
						});
					$('<li/>').append(link).append(edit).appendTo(list);
				}
				
				list.listview('refresh');
			}, {pet : self.data('pet')});
		});
		
		$('#screen-my-pet-album').live('pageshow', function(e){
			var self = $(this);
			Api.get('album', self.data('album'), function (response) {
				if (response.success) {
					for (var i in response.data.photos) {
						var photo = $('<li><a href="" rel="external"><img src="" alt="" /></a></li>');
						photo.find('a').attr('href', MEDIA_PATH + response.data.photos[i].file);
						photo.find('img')
							.attr('src', Server + '/service/imageresize/?image=' + MEDIA_PATH + response.data.photos[i].file)
							.attr('alt', response.data.name);
							
						photo.appendTo(self.find('#my-pet-album-gallery'));
					}
					var	options = {};
					var	photoSwipeInstance = $("ul.gallery a", e.target).photoSwipe(options,  self.attr('id'));
				}
			});
			
			return true;

		})
		.live('pagehide', function(e){
			var currentPage = $(e.target);
			var	photoSwipeInstance = window.Code.PhotoSwipe.getInstance(currentPage.attr('id'));

			if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
				window.Code.PhotoSwipe.detatch(photoSwipeInstance);
			}

			//remove all the photos
			currentPage.find('#my-pet-album-gallery li').remove();

			return true;
		});
		
		
		$('#screen-my-pet-album-edit').live('pageshow', function () {
			var self = $(this);
			//remove prev list
			$('#my-pet-album-gallery-edit').find('li').remove();
			
			Api.get('album', self.data('album'), function (response) {
				if (response.success) {
					for (var i in response.data.photos) {
						var photo = $('<li><a href="javascript;" rel="external"><img src="" alt="" /></a></li>');
						photo.find('a')
							.data('photo', response.data.photos[i].id)
							.click(function () {
								//confimr delete
								if (confirm("Are you sure you want to delete this pgoto?")) {
									Api.del('photo', $(this).data('photo'), function (response) {
										if (response.success)
											photo.remove();
									});
								}
								
								return false;
							});
						photo.find('img')
							.attr('src', Server + '/service/imageresize/?image=' + MEDIA_PATH + response.data.photos[i].file)
							.attr('alt', response.data.name);
							
						photo.appendTo(self.find('#my-pet-album-gallery-edit'));
					}
				}
			});
		});
		
		$('#screen-my-pet-album-edit').live('pageinit', function () {
			var self = $(this);
			self.find('#screen-my-pet-album-edit-delete-album').click(function () {
				//confimr delete
				if (confirm("Are you sure you want to delete this album?")) {
					Api.del('album', self.data('album'), function (response) {
						if (response.success)
							Screens.back();
					});
				}
				
				return false;
			});
			
			self.find('#screen-my-pet-album-edit-take-a-photo').click(function () {
				Cam.open({album : self.data('album')});
				return false;
			});
			
			self.find('#screen-my-pet-album-edit-browse').click(function () {
				Cam.select({album : self.data('album')});
				return false;
			});
		});
	},
	login : function (data) {
		
	},
	logout : function () {
		Api.del('auth', '', function () {
			Data.token = null,
			Screens.stack = [];
			Screens.show('screen-login');
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
	$.mobile.selectmenu.prototype.options.nativeMenu = false;
});

$( document ).bind( "pagechange", function() {
	
});

document.addEventListener("deviceready", onDeviceReady, false);
