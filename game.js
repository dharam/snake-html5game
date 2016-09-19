(function () {
	'use strict';

	//Constants
	const COMPONENT_WIDTH = 10;
	const COMPONENT_HEIGHT = 10;

	var GAME_COMPONENTS = [{
		x 		: 3,
		y 		: 4,
		currentX: 3,
		currentY: 4,
		width 	: COMPONENT_WIDTH,
		height 	: COMPONENT_HEIGHT,
		type 	: 'snake',
		color 	: 'green',
		direction : 1
	},
	{
		x 		: 2,
		y 		: 3,
		width 	: COMPONENT_WIDTH,
		height 	: COMPONENT_HEIGHT,
		type 	: 'ball',
		color 	: 'white'
	}];

	//Game Grid
	var gameGrid = {
		width : 50,
		height : 50,
		data : []
	}

	gameGrid.set = function (x, y) {
		if (!gameGrid.data[x]) {
			gameGrid.data[x] = [];
		}
		gameGrid.data[x][y] = gameObj.direction;
	}

	var UPDATE_INTERVAL = 60; //1000ms/50fps

	var CANVAS = {
		WIDTH : gameGrid.width * COMPONENT_WIDTH,
		HEIGHT : gameGrid.height * COMPONENT_HEIGHT
	};

	var componentsArr = [];

	//Helpers
	var gameIntervalClear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	var gameStart = function () {

		this.canvas.width = CANVAS.WIDTH;
		this.canvas.height = CANVAS.HEIGHT;

		this.context = this.canvas.getContext('2d');

		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, UPDATE_INTERVAL);
	}

	var gameStop = function () {
		clearInterval(this.interval);
	}

	var drawComponents = function () {
		componentsArr.forEach( function (component) {
			component.draw();
		});
	}

	var updateGameArea = function () {
		gameObj.clear();
		componentsArr.forEach( function (component) {
			component.move();
		});
		gameObj.draw();
	}

	var handleKeyPress = function (e) {
		console.log(e);
		if (!e || !e.key) {
			return;
		}

		var direction = e.key;
		var DIRECTION_CODES = {
			'w' : 2,
			'd' : 1,
			'a' : -1,
			's' : -2
		};

		gameObj.direction = (DIRECTION_CODES[direction] !== (-1 * gameObj.direction)) ? DIRECTION_CODES[direction] : gameObj.direction;
	}

	var installGameListeners = function () {
		window.addEventListener('keypress', handleKeyPress);
	}

	var checkCollision = function (x, y) {
		for (let i = 0; i < gameObj.path.length; i++) {
			if (gameObj.path[i][0] === x && gameObj.path[i][1] === y) {
				gameObj.status = 0;
				gameObj.sounds.gameover.play();
				return true;
			}
		}

		return false;
	}

	var foundFood = function (x, y) {
		if (x === gameObj.ballInstance.x && y === gameObj.ballInstance.y) {
			gameObj.ballInstance.changePosition();
			return true;
		}

		return false;
	}

	//Game Object
	var gameObj = {
		canvas 		: document.createElement('canvas'),
		start 		: gameStart,
		clear 		: gameIntervalClear,
		stop 		: gameStop,
		draw 		: drawComponents,
		path 		: [],
		direction 	: 1,
		length 		: 1,
		checkCollision : checkCollision,
		status		: 1,
		foundFood	: foundFood,
		sounds 		: {}
	};

	var gameComponents = {
		init : function () {

			//Initialize components
			GAME_COMPONENTS.forEach(function (args) {
				var instance;

				instance = new Component(args);
				if (args.type === 'ball') {
					gameObj.ballInstance = instance;
				} else if (args.type === 'snake') {
					gameObj.snakeInstance = instance;
				}
				componentsArr.push(instance);
			});

			this.loadImages();
			this.loadSounds();
		},
		images : [
			{
				type : 'background',
				src  : 'bg-pattern.png',
				repeat : 'repeat'
			}
		],
		sounds : [
			{	type: 'eat',
				src : 'eat.mp3'
			},
			{	type: 'gameover',
				src : 'gameover.mp3'
			}
		],
		loadSounds : function () {
			this.sounds.forEach( function (sound) {
				gameObj.sounds[sound.type] = new gameComponents._sound(sound.src);
			})
		},
		_sound : function (src) {
		    this.sound = document.createElement("audio");
		    this.sound.src = src;
		    this.sound.setAttribute("preload", "auto");
		    this.sound.setAttribute("controls", "none");
		    this.sound.style.display = "none";
		    document.body.appendChild(this.sound);
		    this.play = function(){
		        this.sound.play();
		    }
		    this.stop = function(){
		        this.sound.pause();
		    }
		},
		loadImages : function () {
			this.images.forEach (function (image) {
				if (image.type === 'background') {
					//document.getElementsByTagName('canvas')[0].style.background = 'url("bg-pattern")';
				}
			});
		}
	};

	//GAME LISTENERS
	var gameListeners = {
		init : installGameListeners
	}

	//Constructors
	function Component (options) {
		//Co-ordinate positions
		this.x 		= options.x;
		this.y 		= options.y;

		//Dimensions
		this.width 	= options.width;
		this.height = options.height;

		this.color 	= options.color;
		this.type	= options.type;
		this.positionOnGrid();

		if (this.type === 'ball') {
			this.changePosition = changePosition;
		}
	}

	function changePosition () {
		this.x = Math.floor(Math.random() * (gameGrid.width - 1)) + 1;
		this.y = Math.floor(Math.random() * (gameGrid.height - 1)) + 1;
	}

	Component.prototype.positionOnGrid = function () {
		gameGrid.set(this.x, this.y);
	}

	Component.prototype.draw = function () {
		var ctx = gameObj.context;
		var path;
		ctx.fillStyle = this.color;
		if (this.type === 'snake') {
			for (let i = 0; i < gameObj.path.length; i++) {
				path = gameObj.path[i];
				ctx.fillRect(path[0] * this.width, path[1] * this.height, this.width, this.height);
			}
		} else if (this.type === 'ball') {
			ctx.fillRect(this.x * this.width, this.y * this.height, this.width, this.height);
		}
	}

	Component.prototype.move = function () {
		if (this.type !== 'snake') {
			return;
		}
		var direction = gameObj.direction;

		if (direction === 1) {
			this.x = (gameGrid.width - 1) > this.x ? ++this.x : 0;
			this.y = this.y;
		} else if (direction === -1){
			this.x = this.x  > 0 ? --this.x : (gameGrid.width - 1);
			this.y = this.y;
		} else if (direction === -2) {
			this.x = this.x;
			this.y = (gameGrid.height - 1) > this.y ? ++this.y : 0;
		} else if (direction === 2){
			this.x = this.x;
			this.y = this.y  > 0 ? --this.y : (gameGrid.height - 1);
		}

		if (gameObj.foundFood(this.x, this.y)) {
			gameObj.sounds.eat.play();
			gameObj.length++;
		}

		if (!gameObj.checkCollision(this.x, this.y)) {
			this.currentX = this.x;
			this.currentY = this.y;
			gameObj.path.push([this.currentX, this.currentY]);

			if (gameObj.path.length > gameObj.length) {
				gameObj.path.splice(0, (gameObj.path.length - gameObj.length));
			}
		} else {
			gameObj.stop();
		}
	}

	//main

	var init = function () {
		gameComponents.init();
		gameListeners.init();
		gameObj.start();
	}

	window.onload = init;
}());
