var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');

var PhaserGame = function() {
  this.player = null;
  this.platforms = null;
  this.facing = 'left';
  this.cursors = null;
  this.midAir = false;
};

PhaserGame.prototype = {
  init: function() {
    this.game.renderer.renderSession.roundPixels = true;

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.physics.arcade.gravity.y = 1869;
  },

  preload: function() {
    //  We need this because the assets are on Amazon S3
    //  Remove the next 2 lines if running locally
    // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue003/';
    this.load.crossOrigin = 'anonymous';

    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('ice-platform', 'assets/ice-platform.png');
    this.load.spritesheet('dude', 'assets/dude.png', 32, 48);

    //  Note: Graphics are Copyright 2015 Photon Storm Ltd.
  },

  create: function() {
    this.add.sprite(0, 0, 'background');

    this.platforms = this.add.physicsGroup();

    this.platforms.create(0, 64, 'ice-platform');
    this.platforms.create(200, 180, 'platform');
    this.platforms.create(400, 296, 'ice-platform');
    this.platforms.create(600, 412, 'platform');

    this.platforms.setAll('body.allowGravity', false);
    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.velocity.x', 100);

    this.player = this.add.sprite(320, 432, 'dude');

    this.physics.arcade.enable(this.player);

    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20, 32, 5, 16);
    this.player.body.maxVelocity.x = 500;
    this.player.body.maxVelocity.y = 5000;

    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  wrapPlatform: function(platform) {
    if (platform.body.velocity.x < 0 && platform.x <= -160) {
      platform.x = 640;
    } else if (platform.body.velocity.x > 0 && platform.x >= 640) {
      platform.x = -160;
    }
  },

  setFriction: function(player, platform) {
    if (platform.key === 'ice-platform') {
      player.body.drag.x = 0;
    }
  },

  update: function() {
    this.platforms.forEach(this.wrapPlatform, this);

    this.player.body.acceleration.x = 0;
    this.player.body.drag.x = 2000;

    this.physics.arcade.collide(this.player, this.platforms, this.setFriction); //, null, this);

    //  Do this AFTER the collide check, or we won't have blocked/touching set
    var standing = this.player.body.blocked.down || this.player.body.touching.down;
    var canJump = standing || this.midAir;
    if (standing) this.midAir = false;

    if (this.cursors.left.isDown) {
      this.player.body.acceleration.x = -1500;

      if (this.facing !== 'left') {
        this.player.play('left');
        this.facing = 'left';
      }
    } else if (this.cursors.right.isDown) {
      this.player.body.acceleration.x = 1500;

      if (this.facing !== 'right') {
        this.player.play('right');
        this.facing = 'right';
      }
    } else {
      if (this.facing !== 'idle') {
        this.player.animations.stop();

        if (this.facing === 'left') {
          this.player.frame = 0;
        } else {
          this.player.frame = 5;
        }

        this.facing = 'idle';
      }
    }

    if (canJump && this.cursors.up.downDuration(5)) {
      this.player.body.velocity.y = -700;
      this.midAir = !this.midAir;
    }
  }
};

game.state.add('Game', PhaserGame, true);
