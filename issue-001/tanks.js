var Tanks;
(function (Tanks) {
    var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
    game.state.add('Game', new Tanks.GameState(), true);
})(Tanks || (Tanks = {}));
