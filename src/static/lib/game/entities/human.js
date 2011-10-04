ig.module(
	'game.entities.human'
).requires(
	'impact.entity'
).defines(function() {

EntityHuman = ig.Entity.extend({
	//checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.ACTIVE,

	size: {x: 10, y: 14},
	animSheet: new ig.AnimationSheet('media/sprite-human.png', 10, 14),

	//action
	init: function(x, y, settings) {
		this.parent(x, y, settings);

		this.addAnim('idle', 1, [1]);
		this.addAnim('walk', 0.15, [0, 3]);
	},

	update: function() {
		//animation
		if (ig.input.state('up') || ig.input.state('down') || ig.input.state('left') || ig.input.state('right')) {
			this.currentAnim = this.anims.walk;
		} else {
			this.currentAnim = this.anims.idle;
		}

		//walking
		if (ig.input.state('up')) {
			this.vel.y = -60;
		} else if (ig.input.state('down')) {
			this.vel.y = 60;
		} else {
			this.vel.y = 0;
		}

		if (ig.input.state('left')) {
			this.vel.x = -60;
		} else if (ig.input.state('right')) {
			this.vel.x = 60;
		} else {
			this.vel.x = 0;
		}

		//turning
		var angle = Math.atan2(
				ig.input.mouse.y + ig.game.screen.y - (this.pos.y + this.size.y / 2),
				ig.input.mouse.x + ig.game.screen.x - (this.pos.x + this.size.x / 2)
			);

		//set our current animation to the correct angle, and save the current angle for later (bullet direction)
		this.currentAnim.angle = angle;
		this.angle = angle;

		//shooting
		var shot = false;

		if (ig.input.pressed('fire')) {
			shot = true;

			var sin = Math.sin(this.currentAnim.angle),
				cos = Math.cos(this.currentAnim.angle);

			ig.game.spawnEntity(
				EntityBullet,
				(this.pos.x + this.size.x / 2) - (8 * sin),
				(this.pos.y + 7) + (7 * cos),
				{
					angle: this.angle,
					shooter: this,
					vel: {
						x: cos * 200,
						y: sin * 200
					}
				}
			);
		}

		this.parent();

		//camera work
		ig.game.camera.follow(this);

		socket.emit(
			'playerUpdate',
			{
				name: this.name,
				vel: this.vel,
				pos: this.pos,
				angle: this.angle,
				shot: shot
			}
		);
	},

	check: function(other) {
		//collided with player
		//this.kill();
	}
});


EntityBullet = ig.Entity.extend({
	type: ig.Entity.TYPE.A,

	checkAgainst: ig.Entity.TYPE.B,

	collides: ig.Entity.COLLIDES.NONE,

	size: {x: 4, y: 2},

	maxVel: {x: 1000, y: 1000},

	animSheet: new ig.AnimationSheet('media/sprite-bullet.png', 4, 2),

	init: function(x, y, settings) {
		this.parent(x, y, settings);

		this.addAnim('idle', 1, [0]);
		this.anims.idle.angle = this.angle;
	},

	handleMovementTrace: function(res) {
		if (res.collision.x || res.collision.y) {
			this.kill();
		}

		this.parent(res);
	},

	check: function(other) {
		other.receiveDamage(10, this);
		this.kill();
	}
});

});