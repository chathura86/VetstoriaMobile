var MEDIA_PATH = "http://devmedia.vetstoria.com/";
var Api = {
	path : 'http://dev.api.vetstoria.com/rest/',
	key : 'my-key',
	getList : function (resource, success) {
		Api.request(resource, success, 'GET');
	},
	get : function (resource, id, success) {
		Api.request(resource + '/' + id, success, 'GET');
	},
	post : function (resource, data, success, error) {
		error = error || false;
		Api.request(resource, success, 'POST', data);
	},
	request : function (resource, success, type, data, error) {
		type = type || 'GET';
		data = data || {};
		
		success = success || Api.success
		error = error || Api.error

		$.ajax({
			url: Api.path + resource + '?format=json',
			data : JSON.stringify(data),
			success: success,
			error : error,
			crossDomain: true,
			type: type,
			success: success,
			error : error,
			dataType : 'json',
			jsonpCallback: 'callback',
			jsonp: "jsonp-callback",
			contentType : 'application/json',
			accept : 'application/json',
			beforeSend: function(x) {
				if (x && x.overrideMimeType) {
					x.overrideMimeType("application/json;charset=UTF-8");
				}
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