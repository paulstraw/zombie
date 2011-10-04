module.exports = function(app) {
	var appForms = require('./appForms');

	app.get('/', function(req, res) {
		res.render('index.html', {
			layout: false,
			loginForm: appForms.login.toHTML(),
			signupForm: appForms.signup.toHTML()
		});
	});

	app.get('/game', function(req, res) {
		res.render('game.html', {
			layout: false
		});
	});

	app.post('/login', function(req, res) {
		appForms.login.handle(req, {
			success: function(form) {
				//form.data
				res.redirect('/');
			},

			error: function(form) {
				res.redirect('/');
			},

			empty: function(form) {
				res.redirect('/');
			}
		});
	});

	app.post('/signup', function(req, res) {
		appForms.signup.handle(req, {
			success: function(form) {
				//form.data
				res.redirect('/');
			},

			error: function(form) {
				res.redirect('/');
			},

			empty: function(form) {
				res.redirect('/');
			}
		});
	});

	app.get('/confirm/:email/:confirmation', function(req, res) {

	});
};