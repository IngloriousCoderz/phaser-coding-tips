/// <reference path="../../phaser-proto/bower_components/phaser/typescript/phaser.d.ts" />

module Tanks {
  var game: Phaser.Game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
  game.state.add('Game', Tanks.GameState, true);
}
