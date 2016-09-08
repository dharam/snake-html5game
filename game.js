(function () {
	'use strict';

	//Constants
	var GAME_COMPONENTS = [{
		x 		: 10,
		y 		: 120,
		width 	: 30,
		height 	: 30,
		type 	: 'snake',
		color 	: 'black'
	},
	{
		x 		: 200,
		y 		: 70,
		width 	: 30,
		height 	: 30,
		type 	: 'ball',
		color 	: 'red'
	}];	

	var UPDATE_INTERVAL = 500; //1000ms/50fps

	var CANVAS = {
		WIDTH : 480,
		HEIGHT : 270
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

	var updateComponents = function () {
		componentsArr.forEach( function (component) {
			component.update();
		});
	}

	var updateGameArea = function () {
		gameObj.clear();
		componentsArr.forEach( function (component) {
			component.move();
		});
		gameObj.update();
	}

	var handleClick = function (e) {
		if (!e || !e.target) {
			return;
		}

		console.log(e);
		var direction = e.target.getAttribute('value');
		var DIRECTION_CODES = {
			'UP' : 2,
			'RIGHT' : 1,
			'LEFT' : -1,
			'DOWN' : -2
		};

		gameObj.currentDirection = (DIRECTION_CODES[direction] !== (-1 * gameObj.currentDirection)) ? DIRECTION_CODES[direction] : gameObj.currentDirection;				
	}

	var installGameListeners = function () {
		var listenerElements = {
			"up" : handleClick,
			"down" : handleClick,
			"left" : handleClick,
			"right" : handleClick
		};
		
		for (var i in listenerElements) {
			if (listenerElements.hasOwnProperty(i)) {
				document.getElementById(i).addEventListener('click', listenerElements[i]);
			}
		}		
	}

	//Game Object
	var gameObj = {
		canvas : document.createElement('canvas'),
		start : gameStart,
		clear : gameIntervalClear,
		stop : gameStop,
		update : updateComponents,
		currentDirection : 1
	}

	var gameComponents = {
		init : function () {
			//initialize the grid


			//Initialize components
			GAME_COMPONENTS.forEach(function (args) {
				componentsArr.push(new Component(args));				
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
	}

	Component.prototype.update = function () {
		var ctx = gameObj.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	Component.prototype.move = function (direction) {
		if (this.type === 'ball') {
			return;
		}

		if (Math.abs(gameObj.currentDirection) === 1) {
			this.x += gameObj.currentDirection * 30;	
		} else {
			this.y += parseInt(gameObj.currentDirection / 2, 10) * -30;	
		}		
	}

	//Game Grid
	var gameGrid = {
		width : 50,
		height : 50		
		init : initializeGameGrid,
		data : []
	}

	var initializeGameGrid = function () {
		for (var i = 0; i < gameGrid.height; i++) {
			for (var j = 0; j < gameGrid.width; j++) {
				gameGrid.data[i][j] = 0;
			}
		}
	}

	//main
	
	var init = function () {
		gameGrid.init();		
		gameComponents.init();
		gameListeners.init();
		gameObj.start();
	}

	window.onload = init;
}());