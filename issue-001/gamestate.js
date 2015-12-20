var Tanks;
(function (Tanks) {
    var tank = null;
    var turret = null;
    var flame = null;
    var bullet = null;
    var background = null;
    var targets = null;
    var power = 300;
    var powerText = null;
    var cursors = null;
    var fireButton = null;
    var GameState = (function () {
        function GameState() {
        }
        GameState.prototype.init = function () {
            this.game.renderer.renderSession.roundPixels = true;
            this.game.world.setBounds(0, 0, 992, 480);
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.physics.arcade.gravity.y = 200;
        };
        GameState.prototype.preload = function () {
            this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue001/';
            this.load.crossOrigin = 'anonymous';
            this.load.image('tank', 'assets/tank.png');
            this.load.image('turret', 'assets/turret.png');
            this.load.image('bullet', 'assets/bullet.png');
            this.load.image('background', 'assets/background.png');
            this.load.image('flame', 'assets/flame.png');
            this.load.image('target', 'assets/target.png');
        };
        GameState.prototype.create = function () {
            background = this.add.sprite(0, 0, 'background');
            targets = this.add.group(this.game.world, 'targets', false, true, Phaser.Physics.ARCADE);
            targets.create(300, 390, 'target');
            targets.create(500, 390, 'target');
            targets.create(700, 390, 'target');
            targets.create(900, 390, 'target');
            targets.setAll('body.allowGravity', false);
            bullet = this.add.sprite(0, 0, 'bullet');
            bullet.exists = false;
            this.physics.arcade.enable(bullet);
            tank = this.add.sprite(24, 383, 'tank');
            turret = this.add.sprite(tank.x + 30, tank.y + 14, 'turret');
            flame = this.add.sprite(0, 0, 'flame');
            flame.anchor.set(0.5);
            flame.visible = false;
            power = 300;
            powerText = this.add.text(8, 8, 'Power: 300', { font: "18px Arial", fill: "#ffffff" });
            powerText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
            powerText.fixedToCamera = true;
            this.cursors = this.input.keyboard.createCursorKeys();
            this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.fireButton.onDown.add(this.fire, this);
        };
        ;
        GameState.prototype.update = function () {
            if (bullet.exists) {
                if (bullet.y > 420) {
                    this.removeBullet(bullet);
                }
                else {
                    this.physics.arcade.overlap(bullet, targets, this.hitTarget, null, this);
                }
            }
            else {
                if (this.cursors.left.isDown && power > 100) {
                    power -= 2;
                }
                else if (this.cursors.right.isDown && power < 600) {
                    power += 2;
                }
                if (this.cursors.up.isDown && turret.angle > -90) {
                    turret.angle--;
                }
                else if (this.cursors.down.isDown && turret.angle < 0) {
                    turret.angle++;
                }
                powerText.text = 'Power: ' + power;
            }
        };
        GameState.prototype.fire = function () {
            if (bullet.exists) {
                return;
            }
            bullet.reset(turret.x, turret.y);
            var p = new Phaser.Point(turret.x, turret.y);
            p.rotate(p.x, p.y, turret.rotation, false, 34);
            flame.x = p.x;
            flame.y = p.y;
            flame.alpha = 1;
            flame.visible = true;
            this.add.tween(flame).to({ alpha: 0 }, 100, "Linear", true);
            this.camera.follow(bullet);
            this.physics.arcade.velocityFromRotation(turret.rotation, power, bullet.body.velocity);
        };
        GameState.prototype.hitTarget = function (bullet, target) {
            target.kill();
            this.removeBullet(bullet);
        };
        GameState.prototype.removeBullet = function (bullet) {
            bullet.kill();
            this.camera.follow(null);
            this.add.tween(this.camera).to({ x: 0 }, 1000, "Quint", true, 1000);
        };
        return GameState;
    })();
    Tanks.GameState = GameState;
})(Tanks || (Tanks = {}));
