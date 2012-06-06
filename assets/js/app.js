var Data = {
	token : null,
	userType : '',
	clinicUser: false
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
			var self = $(this);
			
			var ignoreList = [
				'screen-upload-photo',
				'screen-create-album'
			]
			
			if ($.inArray(self.attr('id'), ignoreList) >= 0)
				return;
			
			Screens.stack.push(self);
			return true;
		})
		
		$('.back-button').tap(function () {
			Screens.back();
			return false;
		});
		
		$('.home-button').tap(function () {
			switch(Data.userType) {
				case 'clinic':
					Screens.show('screen-main-clinic', true);
					break;
				default:
					Screens.show('screen-main', true);
			}
			return false;
		});
		
		$('#screen-main-logout, #screen-main-clinic-logout').tap(function () {
			Screens.show('screen-logout');
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
					switch(response.data.type) {
						case 'clinic':
							Data.userType = 'clinic';
							Screens.show('screen-main-clinic');
							break;
						default:
							Data.userType = 'petowner';
							Screens.show('screen-main');
					}
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
		
		$('#screen-main-messages').tap(function () {
			Screens.show('screen-my-messages');
			return false;
		});
		
		$('#screen-main-vet-updates').tap(function () {
			Screens.show('screen-vets-update');
			return false;
		});
		
		$('#screen-vets-update').live('pageshow', function () {
			var $this = $(this);
			//iterate pets and add to list
			var list = $this.find('div.updates');
			list.empty();
				
			Api.getList('vetsupdate', function (response) {
				//iterate pets and add to list
				list.empty();
				
				for (var i in response.data.items)
				{
					var update = response.data.items[i];
					$('<div/>')
						.append($('<h3/>', {html : update.custom_title}))
						.append($('<p/>', {html : update.content}))
						.append($('<p/>', {html : update.shortname + ' - ' + update.posted_date}))
						.appendTo(list);
					
					list.append('<hr />');
				}
			});
		});
		
		$('#screen-pet-vets-update').live('pageshow', function () {
			var $this = $(this);
			var data = { pet : $this.data('pet') }
			
			var list = $this.find('div.updates');
			list.empty();
			
			Api.getList('vetsupdate', function (response) {
				//iterate pets and add to list
				list.empty();
				
				for (var i in response.data.items)
				{
					var update = response.data.items[i];
					$('<div/>')
						.append($('<h3/>', {html : update.custom_title}))
						.append($('<p/>', {html : update.content}))
						.append($('<p/>', {html : update.shortname + ' - ' + update.posted_date}))
						.appendTo(list);
					
					list.append('<hr />');
				}
			}, data);
		});
		
		$('#screen-main').live('pageshow', function () {
			Api.getList('message', function (response) {
				$('#screen-main-message-count').text(response.data.unreaded);
			});
		});
		
		$('#screen-main-clinic').live('pageinit', function () {
			$('#screen-main-clinic-switch-user').tap(function () {
				Screens.show('screen-clinic-selectuser');
				return false;
			});
			
			$('#screen-main-clinic-find-pets').tap(function () {
				Screens.show('screen-clinic-find-pet');
				return false;
			});
		});
		
		$('#screen-main-clinic').live('pageshow', function () {
			if (Data.clinicUser == false) {
				Screens.show('screen-clinic-selectuser');
			}
		});
		
		$('#screen-clinic-find-pet').live('pageshow', function () {
			$(this).find('#screen-clinic-find-pet-list').empty().listview('refresh');
		});
		
		$('#screen-clinic-find-pet').live('pageinit', function () {
			var self = $(this);
			var list = self.find('#screen-clinic-find-pet-list');
			
			$('#screen-clinic-find-pet-search-back').tap(function () {
				$('#screen-clinic-find-pet-form').show('blind');
				$('#screen-clinic-find-pet-form-black').hide('blind');

				self.find('#pet').val('');
				self.find('#owner').val('');
				self.find('#species').val('');
				
				list.empty();
			});
			
			$('#screen-clinic-find-pet-search').tap(function () {
				$('#screen-clinic-find-pet-form').hide('blind');
				$('#screen-clinic-find-pet-form-black').show('blind');
				
				list.empty();
				var data = {
					pet: self.find('#pet').val(),
					owner: self.find('#owner').val(),
					species: self.find('#species').val()
				}
				
				if (data.species == 'all')
					data.species = '';
				
				if (data.pet == "" && data.owner == "" && data.species == "")
				{
					alert('Please select atleast one search criteria');
					return false;
				}
				
				Api.getList('petsearch', function (response) {
					list.empty();
					
					if (response.data.length == 0)
						alert('No results found');
					
					//iterate pets and add to list
					for (var i in response.data)
					{
						var pet = response.data[i];
						var a = $('<a/>')
							.data('pet', pet)
							.append($('<h3/>', {html : pet.name + "(" + pet.species + " - " + pet.age + ")"}))
							.append($('<p/>', {html : pet.petowner}))
							.click(function () {								
								$('#screen-vet-pet-album').data('pet', $(this).data('pet'))
								Screens.show('screen-vet-pet-album');
								return false;
							});
					
						$('<li/>').append(a).appendTo(list);
					}
					
					list.listview('refresh');
				}, data);
				
				return false;
			});
		})
		.live('pageshow', function () {
			var self = $(this);
			
			$('#screen-clinic-find-pet-form').show('blind');
			$('#screen-clinic-find-pet-form-black').hide('blind');
			
			self.find('#pet').val('');
			self.find('#owner').val('');
			self.find('#species').val('');
		});
		
		$('#screen-vet-pet-album')
		.live('pageinit', function () {
			var self = $(this);
			
			self.find('#screen-vet-pet-album-edit-take-a-photo').tap(function () {
				Cam.open({
					pet : self.data('pet').id
				});
				return false;
			});
			
			self.find('#screen-vet-pet-album-edit-browse').tap(function () {
				Cam.select({
					pet : self.data('pet').id
				});
				return false;
			});
				
		})
		.live('pageshow', function (e){
			var self = $(this);
			var pet = self.data('pet');
			self.find('#vet-pet-album-gallery').empty();
			
			Api.getList('vetpetalbum', function (response) {
				if (response.success) {
					for (var i in response.data.photos) {
						var photo = $('<li><a href="" rel="external"><img src="" alt="" /></a></li>');
						photo.find('a').attr('href', MEDIA_PATH + response.data.photos[i].file);
						photo.find('img')
							.attr('src', Server + '/service/imageresize/?image=' + MEDIA_PATH + response.data.photos[i].file)
							.attr('alt', response.data.name);
							
						photo.appendTo(self.find('#vet-pet-album-gallery'));
					}
					var	options = {};
					var	photoSwipeInstance = self.find("ul.gallery a").photoSwipe(options,  self.attr('id'));
				}
			}, {pet : pet.id});
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
		
		$('#screen-clinic-selectuser').live('pageshow', function () {
			Api.getList('vetuser', function (response) {
				//iterate pets and add to list
				var list = $('ul#screen-clinic-selectuser-list');
				list.empty();
				
				for (var i in response.data.veterinarian)
				{
					var vet = response.data.veterinarian[i];
					var a = $('<a/>')
						.data('vet', vet)
//						.append($('<img/>', {'class' : "ui-li-thumb",  src : vet.profile_picture_id}))
						.append($('<span/>', {text : vet.forename + ' ' + vet.surname}))
//						.append($('<p/>', {text : vet.custom_title }))
						.click(function () {
							Data.clinicUser = $(this).data('vet');
							Screens.show('screen-main-clinic');
							return false;
						});
					
					$('<li/>').append(a).appendTo(list);
				}
				
				list.listview('refresh');	
			});
		});
		
		//page init bindings
		$('#screen-upload-photo-clinic').live('pageinit', function () {
			$('#screen-upload-photo-clinic-save').tap(function () {
				$(this).attr('disabled', true)
				var pet = Cam.data.pet;
				var desc = $('#screen-upload-photoc-description').val();
				
				if (pet > 0) {
					Api.post('photo', {pet : pet, photo : Cam.lastPhoto, desc : desc}, function (response) {
						$('#screen-vet-pet-album').data('pet', {id : pet});
						Cam.lastPhoto = false;
						Screens.show('screen-vet-pet-album');
					}, function () {
						$('#screen-vet-pet-album').data('pet', {id : pet});
						Cam.lastPhoto = false;
						Screens.show('screen-vet-pet-album');
					});
				} else {
					alert('Please select a pet');
					return false;
				}
			});
		})
		.live('pageshow', function () {
			if (Cam.lastPhoto === false || Cam.data.pet <= 0) {
				Screens.back();
				return;
			}
			
			$(this).removeAttr('disabled');
			
			Screens.current.find('#cam-photoc-thumb').attr('src', "data:image/jpeg;base64," + Cam.lastPhoto);
		});
		
		//page init bindings
		$('#screen-upload-photo').live('pageinit', function () {
			$('#screen-upload-photo-save').tap(function () {
				var album = $('select#screen-upload-photo-select-album').val();
				var pet = $('select#screen-upload-photo-select-pet').val();
				var desc = $('#screen-upload-photo-description').val();
				
				if (album > 0) {
					Api.post('photo', {album : album, photo : Cam.lastPhoto, desc : desc}, function (response) {
						$('#screen-my-pet').data('pet', pet);
						$('#screen-my-pet-album').data('album', album);
						Cam.lastPhoto = false;
						Screens.show('screen-my-pet-album');
					});
				} else {
					alert('Please select an album');
					return false;
				}
			});
			
			$('#screen-upload-photo-clinic-back').tap(function () {
				Screens.back();
			});
		});
		
		$('#screen-upload-photo').live('pageshow', function () {
			if (Cam.lastPhoto === false) {
				Screens.back();
				return;
			}
			
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
						list.selectmenu('refresh');
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
					list.selectmenu('refresh');
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
		
		$('#screen-my-pets').live('pageshow', function () {
			Api.getList('mypet', function (response) { 
				//iterate pets and add to list
				var list = $('ul#my-pets-list');
				
				list.empty();
				
				for (var i in response.data.items)
				{
					var pet = response.data.items[i];
					var a = $('<a/>')
						.data('pet_id', pet.id)
						.append($('<img/>', {'class' : "ui-li-thumb list-thumb",  src : pet.image}))
						.append($('<h3/>', {text : pet.name.trim()}))
						.append($('<p/>', {text : "" + pet.species.trim() + " - (" + pet.breed.trim() + ")"}))
						.click(function () {
							$('#screen-my-pet').data('pet', $(this).data('pet_id'));
							Screens.show('screen-my-pet');
							return false;
						});
					
					$('<li/>').append(a).appendTo(list);
				}
				
				list.listview('refresh');
			});
		});
		
		$('#screen-my-messages').live('pageshow', function () {
			Api.getList('message', function (response) { 
				//iterate pets and add to list
				var list = $('ul#my-message-list');
				
				list.empty();
				
				for (var i in response.data.items)
				{
					var message = response.data.items[i];
					var a = $('<a/>')
						.data('message', message)
						.append($('<h3/>', {text : message.title.trim()}))
						.append($('<p/>', {html : "From : " + message.from_name.trim() + " - (" + message.from_type.trim() + ")" + "<br />Date: " + message.date.trim()}))
						.click(function () {
							$('#screen-my-message').data('message', $(this).data('message'));
							Screens.show('screen-my-message');
							return false;
						});
					
					$('<li/>').append(a).appendTo(list);
				}
				
				list.listview('refresh');
			});
		});
		
		$('#screen-my-message').live('pageshow', function () {
			var $this = $(this);
			var message = $this.data('message');
			var content = $this.find('.message');
			content.empty();
			content.append($('<h2/>', {text : message.title.trim()}));
			content.append($('<h3/>', {text : 'From : ' + message.from_name.trim()}));
			content.append($('<h3/>', {text : 'Date : ' + message.date.trim()}));
			content.append($('<p/>', {html : message.content.trim()}));
		});
		
		$('#screen-my-pet')
		.live('pageinit', function () {
			var self = $(this);
			self.find('#screen-my-pet-photos').click(function () {
				$('#screen-my-pet-albums').data('pet', self.data('pet'));
				Screens.show('screen-my-pet-albums');
				return false;
			});
			
			self.find('#screen-my-pet-take-a-photo').click(function () {
				Cam.open({
					pet : self.data('pet')
				});
				return false;
			});
			
			self.find('#screen-my-pet-new-album').click(function () {
				$('#screen-create-album').data('pet', self.data('pet'));
				Screens.show('screen-create-album');
				return false;
			});
			
			self.find('#screen-my-pet-vet-updates').click(function () {
				$('#screen-pet-vets-update').data('pet', self.data('pet'))
				Screens.show('screen-pet-vets-update');
				return false;
			});
			
		})
		.live('pageshow', function () {
			var self = $(this);
			
			if (!self.data('pet')) {
				Screens.show('screen-my-pets');
				return false;
			}
			
			Api.get('mypet', self.data('pet'), function (response) {
				self.find('.pet-name').html(response.data.name);
				self.find('#pet-profile-thumb').attr('src', MEDIA_PATH + response.data.profile_image);
				self.find('.prop-dob').html(response.data.dob);
				self.find('.prop-breed').html(response.data.breed);
				self.find('.prop-species').html(response.data.species);
				self.find('.prop-sex').html(response.data.sex);
			});
			
		});
		
		$('#screen-create-album').live('pageinit', function () {
			var self = $(this);
			self.find('#screen-create-album-save').click(function () {
				var data = {
					pet : self.data('pet'),
					name : self.find('input[name="name"]').val()
				}
				
				if (data.name == "") {
					alert ('Please enter the album name');
					return false;
				}
				
				Api.post('album', data, function (response) {
					if (response.success) {
						$('#screen-my-pet-album-edit').data('album', response.data.id);
						Screens.show('screen-my-pet-album-edit');
						return false;
					} else {
						console.log(response)
					}
				})
				
				return false;
			});
		})
		.live('pageshow', function () {
			var self = $(this);
			if (!self.data('pet')) {
				Screens.show('screen-my-pets');
				return false;
			}
		})
		
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
					if (album.photos == undefined)
						album.photos = [{file : 'default-album.png'}];
					
					var link = $('<a/>')
						.append($('<img/>', {'class' : "ui-li-thumb list-thumb",  src : Server + '/service/imageresize/?image=' + MEDIA_PATH + album.photos[0].file}))
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
				Cam.open({
					pet : $('#screen-my-pet').data('pet'),
					album : self.data('album')
				});
				return false;
			});
			
			self.find('#screen-my-pet-album-edit-browse').click(function () {
				Cam.select({
					pet : $('#screen-my-pet').data('pet'),
					album : self.data('album')
				});
				return false;
			});
			
			self.find('#screen-my-pet-album-edit-sharing').click(function () {
				$('#screen-share-album').data('album', self.data('album'));
				Screens.show('screen-share-album');
				return false;
			});
		});
		
		$('#screen-share-album').live('pageinit', function () {
			var self = $(this);
			
			self.find('#screen-share-album-save').click(function () {
				var data = {
					album: self.data('album'),
					all : {
						selected : self.find('#share_all_in_vets').is(':checked'),
						id : self.find('#share_all_in_vets').data('share_id')
					},
					friends : {
						selected : self.find('#share_all_friends').is(':checked'),
						id : self.find('#share_all_friends').data('share_id')
					},
					fb : {
						selected : self.find('#share_on_fb').is(':checked'),
						id : self.find('#share_on_fb').data('share_id')
					},
					'private' : {
						selected : self.find('#share_private').is(':checked'),
						id : self.find('#share_private').data('share_id')
					}
				}
				
				Api.update('share', data, function (response) {
					if (response.success){
						alert('Saved successfully')
					} else {
						console.log(response);
					}
				});
			});
			
			self.find("input[type='checkbox']").change(function () {
				var $this = $(this);
				
				switch ($this.attr('id')) {
					case 'share_all_in_vets' :
						self.find('#share_all_friends').data('share_id', 0).removeAttr('checked');
						self.find('#share_private').data('share_id', 0).removeAttr('checked');
						break;
					case 'share_all_friends' :
						self.find('#share_all_in_vets').data('share_id', 0).removeAttr('checked');
						self.find('#share_private').data('share_id', 0).removeAttr('checked');
						break;
					case 'share_private' :
						self.find('#share_all_in_vets').data('share_id', 0).removeAttr('checked');
						self.find('#share_all_friends').data('share_id', 0).removeAttr('checked');
						self.find('#share_on_fb').data('share_id', 0).removeAttr('checked');
				}
				
				self.find("input[type='checkbox']").checkboxradio("refresh")
			});
		});
		
		$('#screen-share-album').live('pageshow', function () {
			var self = $(this);
			
			Api.get('album', self.data('album'), function (response) {
				if (response.success) {
					
					self.find('#share_all_in_vets').data('share_id', 0).removeAttr('checked');
					self.find('#share_all_friends').data('share_id', 0).removeAttr('checked');
					self.find('#share_on_fb').data('share_id', 0).removeAttr('checked');
					self.find('#share_private').data('share_id', 0).removeAttr('checked');
					
					if (response.data.hasFB == 0)
						self.find('#share_on_fb').checkboxradio('disable');
					
					for (var i in response.data.share) {
						var share = response.data.share[i];
						switch (share.type) {
							case 'private':
								self.find('#share_private').attr('checked', 'checked').data('share_id', share.id);
								break;
							case 'community':
								self.find('#share_all_in_vets').data('share_id', share.id).attr('checked', 'checked');
								break;
							case 'all-friends':
								self.find('#share_all_friends').data('share_id', share.id).attr('checked', 'checked');
								break;
							case 'fb':
								self.find('#share_on_fb').data('share_id', share.id).attr('checked', 'checked');
								break;
						}
					}
					
					self.find("input[type='checkbox']").checkboxradio("refresh");
				}
			});
		})
	},
	login : function (data) {
		
	},
	logout : function () {
		Api.del('auth', '', function () {
			Data.token = null,
			Screens.stack = [];
			Screens.show('screen-login');
			Data.clinicUser = false;
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

//enable when running on browser
//$(function () {
//	onDeviceReady();
//});