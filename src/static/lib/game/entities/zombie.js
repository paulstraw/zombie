ig.module(
	'game.entities.zombie'
).requires(
	'impact.entity'
).defines(function() {

EntityZombie = ig.Entity.extend({
	type: ig.Entity.TYPE.B,

	//checkAgainst: ig.Entity.TYPE.A,

	collides: ig.Entity.COLLIDES.ACTIVE,

	size: {x: 10, y: 14},
	animSheet: new ig.AnimationSheet('media/sprite-zombie.png', 10, 14),

	health: 30,

	hurtTimer: new ig.Timer(),

	//action
	init: function(x, y, settings) {
		this.parent(x, y, settings);

		this.addAnim('idle', 1, [0]);
		this.addAnim('walk', 0.15, [1, 2]);
		this.addAnim('hurt', 1, [3]);
	},

	update: function() {
		var zombie = this,
			closestHuman = _.sortBy(
					_.union(
						ig.game.getEntitiesByType(EntityHuman),
						ig.game.getEntitiesByType(EntityOtherHuman)
					),
					function(human) {
						return zombie.distanceTo(human);
					}
				)[0],
			angleToHuman = closestHuman ? this.angleTo(closestHuman) : null;

		if (this.hurtTimer.delta() > 0) {
			this.vel.x != 0 || this.vel.y != 0 ?
				this.currentAnim = this.anims.walk :
				this.currentAnim = this.anims.idle;
		}

		if (angleToHuman) {
			this.currentAnim.angle = angleToHuman;

			this.vel.x = Math.cos(angleToHuman) * 20;
			this.vel.y = Math.sin(angleToHuman) * 20;
		} else {
			this.currentAnim = this.anims.idle;
			this.vel.x = 0;
			this.vel.y = 0;
		}

		this.parent();
	},

	receiveDamage: function(amount, from) {
		this.parent(amount, from);

		this.hurtTimer.set(0.1);

		this.anims.hurt.angle = this.currentAnim.angle;
		this.currentAnim = this.anims.hurt;

		this.vel.x = 0;
		this.vel.y = 0;
	},

	kill: function() {
		this.parent();

		socket.emit('killedZombie', this.name);
		//socket this.name, from.name
	},

	check: function(other) {
		//collided with player
		//this.kill();
	}
});

});