module.exports = function(io) {
	var parseCookie = require('connect').utils.parseCookie;

	io.configure(function() {
		io.enable('browser client minification');
		io.enable('browser client etag');
		io.set('log level', 1);
		io.set('transports', [
			'websocket',
			//'flashsocket',
			//'htmlfile',
			//'xhr-polling',
			//'jsonp-polling'
		]);

		//global auth
		io.set('authorization', function(handshake, callback) {
			var sessionId = handshake.headers.cookie ?
					parseCookie(handshake.headers.cookie)['express.sid'] :
					null,
				session;
			console.log(sessionId);

			if (sessionId) {
				sessionStore.get(sessionId, function(err, session) {
					console.log(err);
					console.log('SLDKJLKSJDFLSKDJF');
					if (err || typeof session == 'undefined') {
						console.log('invalid session');
						callback('invalid session', false);
					} else {
						console.log('valid session');
						console.log(session);

						callback(null, true);
					}
				});
			} else {
				console.log('no session');
				callback('no session', false);
			}
		});
	});
};