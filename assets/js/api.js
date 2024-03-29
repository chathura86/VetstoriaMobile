var MEDIA_PATH = "http://devmedia.vetstoria.com/";
var Server = 'http://api.vetstoria.com';
var Api = {
	path : Server + '/rest/',
	key : 'my-key',
	getList : function (resource, success, data) {
		data = data || {};
		Api.request(resource, success, 'GET', data);
	},
	get : function (resource, id, success) {
		success = success || false;
		Api.request(resource + '/' + id, success, 'GET');
	},
	post : function (resource, data, success, error) {
		error = error || false;
		Api.request(resource, success, 'POST', data, error);
	},
	del : function (resource, id, success) {
		resource = resource + '/' + id;
		Api.request(resource, success, 'DELETE');
	},
	update : function (resource, data, success, error) {
		error = error || false;
		Api.request(resource, success, 'PUT', data);
	},
	request : function (resource, success, type, data, error) {
		type = type || 'GET';
		data = data || {};
		
		success = success || Api.success
		error = error || Api.error

		$.ajax({
			url: Api.path + resource + '?format=json',
			data : type == 'GET' ? data : JSON.stringify(data),
			success: success,
			error : error,
			crossDomain: true,
			type: type,
			dataType : 'json',
			jsonpCallback: 'callback',
			jsonp: "jsonp-callback",
			contentType : 'application/json',
			accept : 'application/json',
			headers: {
				"API-TOKEN": Data.token,
				"API-KEY": "7920662156744a67273e6b5e7d"
			}
		});
	},
	success : function (data, textStatus, jqXHR) {
		alert('Success');
		alert(data);
		alert(textStatus);
		alert(jqXHR);
		alert('-------');
	},
	error : function (jqXHR, textStatus, errorThrown) {
		console.log('Error');
		console.log(jqXHR);
		console.log(jqXHR.responseText);
		console.log(textStatus);
		console.log(errorThrown);
		console.log('-------');
	}
}