module.exports = function(app) {
	var express = require('express');

	app.configure(function() {
		//static files
		app.use(express.static('./static'));

		//form parsing
		app.use(express.bodyParser());

		//sessions
		app.use(express.cookieParser());
		app.use(express.session({
			store: sessionStore,
			secret: 'F4ME*3}HM3kW&{T6;{iLUK$a76PJ8u6WZPt/ybLk',
			key: 'express.sid'
		}));

		//view engine
		app.set('view engine', 'ejs');
		app.register('.html', require('ejs'));
	});

	app.listen(80);
};