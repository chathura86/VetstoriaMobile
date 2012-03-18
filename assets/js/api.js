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
	request : function (resource, success, type, data, error) {
		type = type || 'GET';
		data = data || {};
		
		data = $.extend({}, data, { format : 'json' })
		
		success = success || Api.success
		error = error || Api.error
		$.ajax({
			url: Api.path + resource,
			data : data,
			type: 'DELETE',
			success: success,
			error : error,
			dataType : 'jsonp',
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