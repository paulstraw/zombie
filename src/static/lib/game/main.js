ig.module(
	'game.main'
)
.requires(
	//core
	'impact.game',
	'impact.font',
	'impact.debug.debug',

	//util
	'game.util.camera',

	//entities
	'game.entities.human',
	'game.entities.zombie',
	'game.entities.otherHuman',

	//levels
	'game.levels.factory'
)
.defines(function(){

zombie = ig.Game.extend({

	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),


	init: function() {
		//keys
		ig.input.bind(ig.KEY.W, 'up');
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.S, 'down');
		ig.input.bind(ig.KEY.D, 'right');

		//mouse
		ig.input.initMouse();
		ig.input.bind(ig.KEY.MOUSE1, 'fire');

		//camera
		this.camera = new Camera(ig.system.width / 2 - 16, ig.system.height / 2 - 16, 1);
		this.camera.trap.size.x = 32;
		this.camera.trap.size.y = 32;
		this.camera.debug = true;

		this.loadLevel(LevelFactory, 'factory');
	},

	loadLevel: function(level, levelName) {
		this.parent(level);
		var t = this;
		t.currentLevel = levelName;

		window.players = {};

		socket.emit(
			'enterLevel',
			levelName,
			function(levelData) {
				_.each(levelData.players, function(name) {
					if (name != globals.name) {
						console.log('spawned player');

						ig.game.spawnEntity(
							EntityOtherHuman,
							10,
							10,
							{
								name: name
							}
						);
					}
				});

				t.camera.max.x = t.collisionMap.width * t.collisionMap.tilesize - ig.system.width;
				t.camera.max.y = t.collisionMap.height * t.collisionMap.tilesize - ig.system.height;

				t.camera.set(ig.game.spawnEntity(
					EntityHuman,
					100,
					100,
					{
						name: globals.name
					}
				));
			}
		);

		socket.on(
			'updateZombies',
			function(zombies) {
				_.each(zombies, function(zombie) {
					var gameZombie = ig.game.getEntityByName(zombie.name);

					if (gameZombie) {
						console.log('updated existing zombie');

						gameZombie.pos.x = zombie.x;
						gameZombie.pos.y = zombie.y;
					} else {
						console.log('spawned zombie');

						ig.game.spawnEntity(
							EntityZombie,
							zombie.x,
							zombie.y,
							{
								name: zombie.name
							}
						);
					}
				});
			}
		);

		socket.on(
			'getZombieUpdate',
			function(zombieMaster) {
				if (globals.name != zombieMaster) return;

				var gameZombies = ig.game.getEntitiesByType(EntityZombie),
					returnZombies = {};

				_.each(gameZombies, function(zombie) {
					returnZombies[zombie.name] = {
						name: zombie.name,
						x: zombie.pos.x,
						y: zombie.pos.y
					};
				});

				//return our zombies!
				socket.emit('zombieUpdate', returnZombies);
			}
		)

		socket.on(
			'killZombie',
			function(zombieName) {
				var zombie = ig.game.getEntityByName(zombieName);

				zombie && zombie.kill();
			}
		);

		socket.on(
			'playerLeave',
			function(playerInfo) {
				ig.game.removeEntity(_.detect(
					ig.game.getEntitiesByType(EntityOtherHuman),
					function(otherHuman) {
						return otherHuman.name = playerInfo.name;
					}
				));
			}
		);

		socket.on(
			'playerEnter',
			function(playerInfo) {
				ig.game.spawnEntity(
					EntityOtherHuman,
					10,
					10,
					{
						name: playerInfo.name
					}
				);
			}
		);

		socket.on(
			'playerUpdate',
			function(update) {
				window.players[update.name] = update;
			}
		);
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

		// Add your own, additional update code here
	},

	draw: function() {
		this.parent();

		this.camera.debug && this.camera.draw();
		//this.font.draw( 'It Works!', x, y, ig.Font.ALIGN.CENTER );
	}
});

window.socket = io.connect(location.host);

socket.on('welcome', function(data) {
	window.globals = {};
	globals.name = data.name;

	//pulled for now
	/*globals.players = data.players;

	socket.on(
		'playerDisconnect',
		function(name) {
			globals.players.splice(globals.players.indexOf(name), 1);
		}
	);

	socket.on(
		'playerConnect',
		function(name) {
			globals.players.push(name);
		}
	);*/

	//start game at 60fps, 320x240, 2x scale
	ig.main('#canvas', zombie, 60, 480, 320, 2);

	/*function fullscreenify() {
		ig.system.resize($(window).width() / 2, $(window).height() / 2);
	}
	fullscreenify();*/

	//$(window).resize(fullscreenify);
});

});
