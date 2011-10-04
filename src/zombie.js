var express = require('express'),
	app = express.createServer(),
	io = require('socket.io').listen(app),
	ds = require('./lib/datastore')();

//using evil globals for a few things we need pretty much everywhere
global.sessionStore = new express.session.MemoryStore();

global.worldData = {
	territories: ds.load('territories'),
	players: []
};


//express setup
require('./lib/appConfig')(app);
require('./lib/routes')(app);


//socket.io config
require('./lib/ioConfig')(io);


//game logic
require('./lib/playerLogic')(io);


//cleanup on close (moduleify this. also, it's firing twice)
/*process.on('SIGHUP', function() {
	console.log('cleanup...');

	setTimeout(function () {
		console.log('all done!');
		process.exit(0);
	}, 500);
})*/