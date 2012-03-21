var MEDIA_PATH = "http://devmedia.vetstoria.com/";
var Api = {
	path : 'http://dev.api.vetstoria.com/rest/',
	key : 'my-key',
	getList : function (resource, success, data) {
		data = data || {};
		Api.request(resource, success, 'GET', data);
	},
	get : function (resource, id, success) {
		Api.request(resource + '/' + id, success, 'GET');
	},
	post : function (resource, data, success, error) {
		error = error || false;
		Api.request(resource, success, 'POST', data);
	},
	del : function (resource, success) {
		Api.request(resource, success, 'DELETE');
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
			success: success,
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
		console.log(data);
		console.log(textStatus);
		console.log(jqXHR);
	},
	error : function (jqXHR, textStatus, errorThrown) {
		console.log(jqXHR);
		console.log(textStatus);
		console.log(errorThrown);
	}
}