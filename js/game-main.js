// Game namespace - generic for GameWeaver
var Game = Game || {};

// Initiate a new game and set the size of the entire windows
// Phaser.AUTO means that whether the game will be rendered on a CANVAS element or using WebGL will depend on the browser
Game.instance = new Phaser.Game(512, 384, Phaser.AUTO, '', null, false, false);

Game.instance.state.add('Boot', Game.Boot);
Game.instance.state.add('Preloader', Game.Preloader);
Game.instance.state.add('MainMenu', Game.MainMenu);
Game.instance.state.add('Game', Game.GameState);

Game.instance.state.start('Boot');

