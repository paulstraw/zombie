module.exports = function(io) {
	var _ = require('underscore'),
		players = worldData.players,
		territories = worldData.territories.data;

	//TODO this is crappy code
	setInterval(function() {
		_.each(territories, function(level, levelName) {
			if (Object.keys(level.zombies).length <= (level.players.length + 1) * 20) {
				var name = ~~(Math.random() * 10000) + +new Date,
					zombie = {
						name: name,
						x: ~~(Math.random() * level.size.x),
						y: ~~(Math.random() * level.size.y)
					},
					clientZombie = {};

				clientZombie[name] = zombie;

				io.sockets.in(levelName).emit('updateZombies', clientZombie);

				level.zombies[name] = zombie;
			}
		});
	}, 1000);

	io.sockets.on('connection', function(socket) {
		//save the new player's name for easy access
		var name = socket.id;
		//players.push(name);

		//give our new player their assigned name
		socket.emit('welcome', {
			name: name
		});

		//tell all the other players about the new player
		//socket.broadcast.emit('playerConnect', name);*/

		//send out player updates when we get them
		//TODO throttle this?
		socket.on('playerUpdate', function(update) {
			socket.get('currentLevel', function(err, levelName) {
				socket.broadcast.to(levelName).emit('playerUpdate', update);
			});
		});

		//when a player kills a zombie
		socket.on('killedZombie', function(zombieName) {
			socket.get('currentLevel', function(err, levelName) {
				if (err) throw err;

				//get that zombie out of the level's zombie object
				delete territories[levelName].zombies[zombieName];

				//tell the other clients he's gone
				socket.broadcast.to(levelName).emit('killZombie', zombieName);
			});
		});

		//handle when a client sends us a zombie update
		//TODO make this a little more secure by saving the last client we asked for this
		socket.on('zombieUpdate', function(zombies) {
			socket.get('currentLevel', function(err, levelName) {
				if (err) throw err;

				territories[levelName].zombies = zombies;

				socket.broadcast.to(levelName).emit('updateZombies', zombies);
			});
		});

		//when a player enters a level
		socket.on('enterLevel', function(levelName, callback) {
			var level = territories[levelName],
				//save a random player on this level to get our zombie update from;
				zombieMaster = level.players[~~(Math.random() * level.players.length)];

			//fire off a request to get zombie updates
			io.sockets.to(levelName).emit('getZombieUpdate', zombieMaster);

			//add player to appropriate level channel
			socket.join(levelName);

			//add player to list of players in the level they're entering
			level.players.push(name);

			//load the zombies we know about into the map
			//these will get updated if/when we get a response from `getZombieUpdate()` above
			socket.emit('updateZombies', level.zombies);

			//tell other players in territory about new player
			socket
				.broadcast
				.to(levelName)
				.emit(
					'playerEnter',
					{
						name: name
					}
				);

			//set the player's `currentLevel`
			socket.set('currentLevel', levelName, function() {
				//respond to the newly-joined player with current level data
				callback(level);
			});
		});

		function handleLeaveLevel() {
			socket.get('currentLevel', function(err, levelName) {
				if (err) throw err;

				//if the player isn't in a level for some reason, bail
				if (!levelName) {
					console.log('NOLEVELDISCONNECT');
					return;
				}

				//remove player from players in the level they're leaving
				var levelPlayers = territories[levelName].players;
				levelPlayers.splice(levelPlayers.indexOf(name), 1);

				//tell other players this player left the level
				socket.broadcast.to(levelName).emit('playerLeave', {level: levelName, name: name});
			});
		}

		//we only have one level right now, so all leaves will also be disconnects
		socket.on('leaveLevel', handleLeaveLevel);

		socket.on('disconnect', function() {
			//players.splice(players.indexOf(name), 1);

			handleLeaveLevel();

			//let other players know someone disconnected
			//socket.broadcast.emit('playerDisconnect', name);
		});
	});
};