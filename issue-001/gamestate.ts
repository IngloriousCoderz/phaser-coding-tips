/// <reference path="tanks.ts" />

module Tanks {
  // export var GameState: Phaser.State = new Phaser.State();

  var tank = null;
  var turret = null;
  var flame = null;
  var bullet = null;

  var background = null;
  var targets = null;

  var power = 300;
  var powerText = null;

  export class GameState extends Phaser.State {
    cursors: Phaser.CursorKeys;
    fireButton: Phaser.Key;

    init() {
      this.game.renderer.renderSession.roundPixels = true;

      this.game.world.setBounds(0, 0, 992, 480);

      this.physics.startSystem(Phaser.Physics.ARCADE);
      this.physics.arcade.gravity.y = 200;
    }

    preload() {
      //  We need this because the assets are on Amazon S3
      //  Remove the next 2 lines if running locally
      this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue001/';
      this.load.crossOrigin = 'anonymous';

      this.load.image('tank', 'assets/tank.png');
      this.load.image('turret', 'assets/turret.png');
      this.load.image('bullet', 'assets/bullet.png');
      this.load.image('background', 'assets/background.png');
      this.load.image('flame', 'assets/flame.png');
      this.load.image('target', 'assets/target.png');

      //  Note: Graphics from Amiga Tanx Copyright 1991 Gary Roberts
    }

    create() {
      //  Simple but pretty background
      background = this.add.sprite(0, 0, 'background');

      //  Something to shoot at :)
      targets = this.add.group(this.game.world, 'targets', false, true, Phaser.Physics.ARCADE);

      targets.create(300, 390, 'target');
      targets.create(500, 390, 'target');
      targets.create(700, 390, 'target');
      targets.create(900, 390, 'target');

      //  Stop gravity from pulling them away
      targets.setAll('body.allowGravity', false);

      //  A single bullet that the tank will fire
      bullet = this.add.sprite(0, 0, 'bullet');
      bullet.exists = false;
      this.physics.arcade.enable(bullet);

      //  The body of the tank
      tank = this.add.sprite(24, 383, 'tank');

      //  The turret which we rotate (offset 30x14 from the tank)
      turret = this.add.sprite(tank.x + 30, tank.y + 14, 'turret');

      //  When we shoot this little flame sprite will appear briefly at the end of the turret
      flame = this.add.sprite(0, 0, 'flame');
      flame.anchor.set(0.5);
      flame.visible = false;

      //  Used to display the power of the shot
      power = 300;
      powerText = this.add.text(8, 8, 'Power: 300', { font: "18px Arial", fill: "#ffffff" });
      powerText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
      powerText.fixedToCamera = true;

      //  Some basic controls
      this.cursors = this.input.keyboard.createCursorKeys();

      this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.fireButton.onDown.add(this.fire, this);
    };

    /**
     * Core update loop. Handles collision checks and player input.
     *
     * @method update
     */
    update() {
      //  If the bullet is in flight we don't let them control anything
      if (bullet.exists) {
        if (bullet.y > 420) {
          //  Simple check to see if it's fallen too low
          this.removeBullet(bullet);
        }
        else {
          //  Bullet vs. the Targets
          this.physics.arcade.overlap(bullet, targets, this.hitTarget, null, this);
        }
      }
      else {
        //  Allow them to set the power between 100 and 600
        if (this.cursors.left.isDown && power > 100) {
          power -= 2;
        }
        else if (this.cursors.right.isDown && power < 600) {
          power += 2;
        }

        //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
        if (this.cursors.up.isDown && turret.angle > -90) {
          turret.angle--;
        }
        else if (this.cursors.down.isDown && turret.angle < 0) {
          turret.angle++;
        }

        //  Update the text
        powerText.text = 'Power: ' + power;
      }
    }

    /**
     * Called by fireButton.onDown
     *
     * @method fire
     */
    fire() {
      if (bullet.exists) {
        return;
      }

      //  Re-position the bullet where the turret is
      bullet.reset(turret.x, turret.y);

      //  Now work out where the END of the turret is
      var p = new Phaser.Point(turret.x, turret.y);
      p.rotate(p.x, p.y, turret.rotation, false, 34);

      //  And position the flame sprite there
      flame.x = p.x;
      flame.y = p.y;
      flame.alpha = 1;
      flame.visible = true;

      //  Boom
      this.add.tween(flame).to({ alpha: 0 }, 100, "Linear", true);

      //  So we can see what's going on when the bullet leaves the screen
      this.camera.follow(bullet);

      //  Our launch trajectory is based on the angle of the turret and the power
      this.physics.arcade.velocityFromRotation(turret.rotation, power, bullet.body.velocity);
    }

    /**
     * Called by physics.arcade.overlap if the bullet and a target overlap
     *
     * @method hitTarget
     * @param {Phaser.Sprite} bullet - A reference to the bullet (same as bullet)
     * @param {Phaser.Sprite} target - The target the bullet hit
     */
    hitTarget(bullet: Phaser.Sprite, target: Phaser.Sprite) {
      target.kill();
      this.removeBullet(bullet);
    }

    /**
     * Removes the bullet, stops the camera following and tweens the camera back to the tank.
     * Have put this into its own method as it's called from several places.
     *
     * @method removeBullet
     */
    removeBullet(bullet: Phaser.Sprite) {
      bullet.kill();
      this.camera.follow(null);
      this.add.tween(this.camera).to({ x: 0 }, 1000, "Quint", true, 1000);
    }
  }
}
