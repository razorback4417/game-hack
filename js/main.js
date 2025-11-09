// If the object exists already, we'll use it, otherwise we'll use a new object
var Game = Game || {};

// Initiate a new game and set the size of the entire windows
// Phaser.AUTO means that whether the game will be rendered on a CANVAS element or using WebGL will depend on the browser
// Inject the game into the .game-container div
var gameContainer = document.querySelector('.game-container');
Game.instance = new Phaser.Game(512, 384, Phaser.AUTO, gameContainer || '', null, false, false);

Game.instance.state.add('Boot', Game.Boot);
Game.instance.state.add('Preloader', Game.Preloader);
Game.instance.state.add('MainMenu', Game.MainMenu);
Game.instance.state.add('Game', Game.GameState);

Game.instance.state.start('Boot');
