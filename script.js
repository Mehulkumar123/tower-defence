const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;

let numberOfResources = 500;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];

//mouse
const mouse = {
	x: 10,
	y: 10,
	width: 0.1,
	height: 0.1
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
	mouse.x = e.x - canvasPosition.left;
	mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
	mouse.x = undefined;
	mouse.y = undefined;
});

//game board
const controlsBar = {
	width: canvas.width,
	height: cellSize
};

class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
	}
	draw() {
		if (mouse.x && mouse.y && collision(this, mouse)) {
			ctx.strokeStyle = "black";
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}
}

function createGrid() {
	for (var y = cellSize; y < canvas.height; y += cellSize) {
		for (var x = 0; x < canvas.width; x += cellSize) {
			gameGrid.push(new Cell(x, y));
		}
	}
}
createGrid();

function handleGameGrid() {
	for (var i = 0; i < gameGrid.length; i++) {
		gameGrid[i].draw();
	}
}
console.log(gameGrid);

//projectiles
class Projectile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
		this.power = 20;
		this.speed = 5;
	}
	update() {
		this.x += this.speed;
	}
	draw() {
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
		ctx.fill();
	}
}

//

function handleProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		projectiles[i].update();
		projectiles[i].draw();
		if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
			projectiles.splice(i, 1);
			i--;
		}
		console.log("projectiles" + projectiles.length);
	}
}

//defenders
class Defender {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
		this.shootings = false;
		this.health = 100;
		this.projectiles = [];
		this.time = 0;
	}
	draw() {
		ctx.fillStyle = "blue";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "30px orbitron";
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
	}
	update() {
		this.timer++;
		if (this.timer % 100 === 0) {
			projectiles.push(new Projectile(this.x, this.y));
		}
	}
}
canvas.addEventListener("click", function () {
	const gridPositionX = mouse.x - (mouse.x % cellSize);
	const gridPositionY = mouse.y - (mouse.y % cellSize);
	if (gridPositionY < cellSize) return;
	for (let i = 0; i < defenders.length; i++) {
		if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
			return;
	}
	let defendersCost = 100;
	if (numberOfResources >= defendersCost) {
		defenders.push(new Defender(gridPositionX, gridPositionY));
		numberOfResources -= defendersCost;
	}
});
function handleDefenders() {
	for (let i = 0; i < defenders.length; i++) {
		defenders[i].draw();
		defenders[i].update();
		for (let j = 0; j < enemies.length; j++) {
			if (defenders[i] &&(collision(defenders[i], enemies[j]))) {
				enemies[j].movement = 0;
				defenders[i].health -= 0.2;
			}
			if (defenders[i] && defenders[i].health <= 0) {
				defenders.splice(i, 1);
				i++;
				enemies[j].movement = enemies[j].speed;
			}
		}
	}
}

//enemies
class Enemy {
	constructor(verticalPosition) {
		this.x = canvas.width;
		this.y = verticalPosition;
		this.width = cellSize;
		this.height = cellSize;
		this.speed = Math.random() * 0.2 + 0.4;
		this.movement = this.speed;
		this.health = 100;
		this.maxHealth = this.health;
	}
	update() {
		this.x -= this.movement;
	}
	draw() {
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "black";
		ctx.font = "30px orbitron";
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
	}
}
function handleEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].update();
		enemies[i].draw();
		if (enemies[i].x < 0) {
			gameOver = true;
		}
	}
	if (frame % 100 === 0) {
		let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
		enemies.push(new Enemy(verticalPosition));
		enemyPositions.push(verticalPosition);
		if (enemiesInterval > 120) enemiesInterval -= 100;
	}
}

//resources

//utilities
function handleGameStatus() {
	ctx.fillStyle = "gold";
	ctx.font = "30px orbitron";
	ctx.fillText("Resources: " + numberOfResources, 20, 55);
	if (gameOver) {
		ctx.fillStyle = "black";
		ctx.font = "90px orbitron";
		ctx.fillText("GAME OVER", 135, 330);
	}
}

//animation
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	handleGameGrid();
	handleDefenders();
	handleProjectiles();
	handleEnemies();
	handleGameStatus();
	frame++;
    console.log(frame);
	if (!gameOver) requestAnimationFrame(animate);
}
animate();


//collision detection
function collision(first, second) {
	if (
		!(
			first.x > second.x + second.width ||
			first.x + first.width < second.x ||
			first.y > second.y + second.height ||
			first.y + first.height < second.y
		)
	) {
		return true;
	}
}
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;

let numberOfResources = 500;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];

//mouse
const mouse = {
	x: 10,
	y: 10,
	width: 0.1,
	height: 0.1
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
	mouse.x = e.x - canvasPosition.left;
	mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
	mouse.x = undefined;
	mouse.y = undefined;
});

//game board
const controlsBar = {
	width: canvas.width,
	height: cellSize
};

class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
	}
	draw() {
		if (mouse.x && mouse.y && collision(this, mouse)) {
			ctx.strokeStyle = "black";
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}
}

function createGrid() {
	for (var y = cellSize; y < canvas.height; y += cellSize) {
		for (var x = 0; x < canvas.width; x += cellSize) {
			gameGrid.push(new Cell(x, y));
		}
	}
}
createGrid();

function handleGameGrid() {
	for (var i = 0; i < gameGrid.length; i++) {
		gameGrid[i].draw();
	}
}
console.log(gameGrid);

//projectiles
class Projectile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
		this.power = 20;
		this.speed = 5;
	}
	update() {
		this.x += this.speed;
	}
	draw() {
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
		ctx.fill();
	}
}

//

function handleProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		projectiles[i].update();
		projectiles[i].draw();
		if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
			projectiles.splice(i, 1);
			i--;
		}
		console.log("projectiles" + projectiles.length);
	}
}

//defenders
class Defender {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
		this.shootings = false;
		this.health = 100;
		this.projectiles = [];
		this.time = 0;
	}
	draw() {
		ctx.fillStyle = "blue";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "30px orbitron";
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
	}
	update() {
		this.timer++;
		if (this.timer % 100 === 0) {
			projectiles.push(new Projectile(this.x, this.y));
		}
	}
}
canvas.addEventListener("click", function () {
	const gridPositionX = mouse.x - (mouse.x % cellSize);
	const gridPositionY = mouse.y - (mouse.y % cellSize);
	if (gridPositionY < cellSize) return;
	for (let i = 0; i < defenders.length; i++) {
		if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
			return;
	}
	let defendersCost = 100;
	if (numberOfResources >= defendersCost) {
		defenders.push(new Defender(gridPositionX, gridPositionY));
		numberOfResources -= defendersCost;
	}
});
function handleDefenders() {
	for (let i = 0; i < defenders.length; i++) {
		defenders[i].draw();
		defenders[i].update();
		for (let j = 0; j < enemies.length; j++) {
			if (defenders[i] &&(collision(defenders[i], enemies[j]))) {
				enemies[j].movement = 0;
				defenders[i].health -= 0.2;
			}
			if (defenders[i] && defenders[i].health <= 0) {
				defenders.splice(i, 1);
				i++;
				enemies[j].movement = enemies[j].speed;
			}
		}
	}
}

//enemies
class Enemy {
	constructor(verticalPosition) {
		this.x = canvas.width;
		this.y = verticalPosition;
		this.width = cellSize;
		this.height = cellSize;
		this.speed = Math.random() * 0.2 + 0.4;
		this.movement = this.speed;
		this.health = 100;
		this.maxHealth = this.health;
	}
	update() {
		this.x -= this.movement;
	}
	draw() {
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "black";
		ctx.font = "30px orbitron";
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
	}
}
function handleEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].update();
		enemies[i].draw();
		if (enemies[i].x < 0) {
			gameOver = true;
		}
	}
	if (frame % 100 === 0) {
		let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
		enemies.push(new Enemy(verticalPosition));
		enemyPositions.push(verticalPosition);
		if (enemiesInterval > 120) enemiesInterval -= 100;
	}
}

//resources

//utilities
function handleGameStatus() {
	ctx.fillStyle = "gold";
	ctx.font = "30px orbitron";
	ctx.fillText("Resources: " + numberOfResources, 20, 55);
	if (gameOver) {
		ctx.fillStyle = "black";
		ctx.font = "90px orbitron";
		ctx.fillText("GAME OVER", 135, 330);
	}
}

//animation
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	handleGameGrid();
	handleDefenders();
	handleProjectiles();
	handleEnemies();
	handleGameStatus();
	frame++;
    console.log(frame);
	if (!gameOver) requestAnimationFrame(animate);
}
animate();


//collision detection
function collision(first, second) {
	if (
		!(
			first.x > second.x + second.width ||
			first.x + first.width < second.x ||
			first.y > second.y + second.height ||
			first.y + first.height < second.y
		)
	) {
		return true;
	}
}
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;

let numberOfResources = 500;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];

//mouse
const mouse = {
	x: 10,
	y: 10,
	width: 0.1,
	height: 0.1
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
	mouse.x = e.x - canvasPosition.left;
	mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
	mouse.x = undefined;
	mouse.y = undefined;
});

//game board
const controlsBar = {
	width: canvas.width,
	height: cellSize
};

class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
	}
	draw() {
		if (mouse.x && mouse.y && collision(this, mouse)) {
			ctx.strokeStyle = "black";
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}
}

function createGrid() {
	for (var y = cellSize; y < canvas.height; y += cellSize) {
		for (var x = 0; x < canvas.width; x += cellSize) {
			gameGrid.push(new Cell(x, y));
		}
	}
}
createGrid();

function handleGameGrid() {
	for (var i = 0; i < gameGrid.length; i++) {
		gameGrid[i].draw();
	}
}
console.log(gameGrid);

//projectiles
class Projectile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
		this.power = 20;
		this.speed = 5;
	}
	update() {
		this.x += this.speed;
	}
	draw() {
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
		ctx.fill();
	}
}
function handleProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		projectiles[i].update();
		projectiles[i].draw();
		if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
			projectiles.splice(i, 1);
			i--;
		}
		console.log("projectiles" + projectiles.length);
	}
}

//defenders
class Defender {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
		this.shootings = false;
		this.health = 100;
		this.projectiles = [];
		this.time = 0;
	}
	draw() {
		ctx.fillStyle = "blue";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "30px orbitron";
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
	}
	update() {
		this.timer++;
		if (this.timer % 100 === 0) {
			projectiles.push(new Projectile(this.x, this.y));
		}
	}
}
canvas.addEventListener("click", function () {
	const gridPositionX = mouse.x - (mouse.x % cellSize);
	const gridPositionY = mouse.y - (mouse.y % cellSize);
	if (gridPositionY < cellSize) return;
	for (let i = 0; i < defenders.length; i++) {
		if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
			return;
	}
	let defendersCost = 100;
	if (numberOfResources >= defendersCost) {
		defenders.push(new Defender(gridPositionX, gridPositionY));
		numberOfResources -= defendersCost;
	}
});
function handleDefenders() {
	for (let i = 0; i < defenders.length; i++) {
		defenders[i].draw();
		defenders[i].update();
		for (let j = 0; j < enemies.length; j++) {
			if (defenders[i] &&(collision(defenders[i], enemies[j]))) {
				enemies[j].movement = 0;
				defenders[i].health -= 0.2;
			}
			if (defenders[i] && defenders[i].health <= 0) {
				defenders.splice(i, 1);
				i++;
				enemies[j].movement = enemies[j].speed;
			}
		}
	}
}

//enemies
class Enemy {
	constructor(verticalPosition) {
		this.x = canvas.width;
		this.y = verticalPosition;
		this.width = cellSize;
		this.height = cellSize;
		this.speed = Math.random() * 0.2 + 0.4;
		this.movement = this.speed;
		this.health = 100;
		this.maxHealth = this.health;
	}
	update() {
		this.x -= this.movement;
	}
	draw() {
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "black";
		ctx.font = "30px orbitron";
		ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
	}
}
function handleEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].update();
		enemies[i].draw();
		if (enemies[i].x < 0) {
			gameOver = true;
		}
	}
	if (frame % 100 === 0) {
		let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
		enemies.push(new Enemy(verticalPosition));
		enemyPositions.push(verticalPosition);
		if (enemiesInterval > 120) enemiesInterval -= 100;
	}
}

//resources

//utilities
function handleGameStatus() {
	ctx.fillStyle = "gold";
	ctx.font = "30px orbitron";
	ctx.fillText("Resources: " + numberOfResources, 20, 55);
	if (gameOver) {
		ctx.fillStyle = "black";
		ctx.font = "90px orbitron";
		ctx.fillText("GAME OVER", 135, 330);
	}
}

//animation
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	handleGameGrid();
	handleDefenders();
	handleProjectiles();
	handleEnemies();
	handleGameStatus();
	frame++;
    console.log(frame);
	if (!gameOver) requestAnimationFrame(animate);
}
animate();


//collision detection
function collision(first, second) {
	if (
		!(
			first.x > second.x + second.width ||
			first.x + first.width < second.x ||
			first.y > second.y + second.height ||
			first.y + first.height < second.y
		)
	) {
		return true;
	}
}
