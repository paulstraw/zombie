ig.module(
	'game.entities.otherHuman'
).requires(
	'impact.entity'
).defines(function() {

EntityOtherHuman = ig.Entity.extend({
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
		var props = window.players[this.name];

		if (!props) {
			//this.kill();
			return;
		}

		//animation
		props.vel.x > 0 || props.vel.y > 0 ?
			this.currentAnim = this.anims.walk :
			this.currentAnim = this.anims.idle;

		//set stuff from our update object
		this.vel = props.vel;
		this.pos = props.pos;
		this.currentAnim.angle = props.angle;

		if (props.shot) {
			ig.game.spawnEntity(
				EntityOtherBullet,
				(this.pos.x + this.size.x / 2) - (8 * Math.sin(props.angle)),
				(this.pos.y + 7) + (7 * Math.cos(props.angle)),
				{
					angle: props.angle,
					vel: {
						x: Math.cos(props.angle) * 200,
						y: Math.sin(props.angle) * 200
					}
				}
			);
		}

		this.parent();
	},

	draw: function() {
		//nametag
		var x = (this.pos.x + this.size.x / 2 - ig.game.screen.x) * ig.system.scale,
			y = (this.pos.y - ig.game.screen.y) * ig.system.scale - 6;

		ig.system.context.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ig.system.context.font = '10px Georgia';
		ig.system.context.textAlign = 'center';
		ig.system.context.fillText(this.name, x, y);

		this.parent();
	},

	check: function(other) {
		//collided with player
		//this.kill();
	}
});

EntityOtherBullet = ig.Entity.extend({
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
		this.kill();
	}
});

});