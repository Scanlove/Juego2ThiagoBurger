const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurar tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables del juego
const LANE_WIDTH = 100;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];
const LEVEL_COLORS = ['#000000', '#FF0000', '#FFFF00', '#87CEEB', '#008000'];
let gameState = {
    score: 0,
    speed: 5,
    isGameOver: false,
    currentLane: 1,
    roadOffset: 0,
    level: 1,
    backgroundColor: LEVEL_COLORS[0]
};

class Plate {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2;
        this.y = canvas.height - 150;
        this.targetX = this.x;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Dibujar plato (círculo blanco con borde)
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }

    update() {
        this.targetX = canvas.width / 2 + LANES[gameState.currentLane];
        this.x += (this.targetX - this.x) * 0.1;
    }
}

class Food {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.width = 40;
        this.height = 40;

        // Seleccionar un emoji de alimento aleatorio
        const emojis = ['🍔', '🌭', '🍗', '🥩'];
        this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
    }

    draw() {
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, this.x, this.y + 16);
    }

    update() {
        this.y += gameState.speed;
        return this.y > canvas.height;
    }
}

class Obstacle {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.width = 50;
        this.height = 50;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Dibujar obstáculo (caja)
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    update() {
        this.y += gameState.speed;
        return this.y > canvas.height;
    }
}

const plate = new Plate();
let foods = [];
let obstacles = [];

// Control táctil
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const diffX = touchX - touchStartX;

    if (diffX > 50 && gameState.currentLane < 2) {
        gameState.currentLane++;
        touchStartX = touchX;
    } else if (diffX < -50 && gameState.currentLane > 0) {
        gameState.currentLane--;
        touchStartX = touchX;
    }
});

// Control con teclado (para pruebas)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && gameState.currentLane > 0) {
        gameState.currentLane--;
    } else if (e.key === 'ArrowRight' && gameState.currentLane < 2) {
        gameState.currentLane++;
    }
});

function updateLevel() {
    const newLevel = Math.floor(gameState.score / 400) + 1;
    if (newLevel !== gameState.level) {
        gameState.level = newLevel;
        gameState.backgroundColor = LEVEL_COLORS[(gameState.level - 1) % LEVEL_COLORS.length];
    }
}

function drawBackground() {
    ctx.fillStyle = gameState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function spawnFood() {
    if (Math.random() < 0.02) {
        foods.push(new Food());
    }
}

function spawnObstacle() {
    if (Math.random() < 0.01) {
        obstacles.push(new Obstacle());
    }
}

function checkCollisions() {
    const plateHitbox = {
        x: plate.x - plate.width / 2,
        y: plate.y - plate.height / 2,
        width: plate.width,
        height: plate.height
    };

    // Colisión con alimentos
    foods = foods.filter(food => {
        const foodHitbox = {
            x: food.x - food.width / 2,
            y: food.y - food.height / 2,
            width: food.width,
            height: food.height
        };

        if (checkCollision(plateHitbox, foodHitbox)) {
            gameState.score += 5;
            document.getElementById('score').textContent = `🍔 ${gameState.score}`;
            document.getElementById('level').textContent = `Nivel = ${gameState.level}`;
            return false;
        }
        return true;
    });

    // Colisión con obstáculos
    obstacles.forEach(obstacle => {
        const obstacleHitbox = {
            x: obstacle.x - obstacle.width / 2,
            y: obstacle.y - obstacle.height / 2,
            width: obstacle.width,
            height: obstacle.height
        };

        if (checkCollision(plateHitbox, obstacleHitbox)) {
            gameOver();
        }
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function gameOver() {
    gameState.isGameOver = true;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.score;
}

function resetGame() {
    gameState = {
        score: 0,
        speed: 5,
        isGameOver: false,
        currentLane: 1,
        roadOffset: 0,
        level: 1,
        backgroundColor: LEVEL_COLORS[0]
    };
    foods = [];
    obstacles = [];
    document.getElementById('score').textContent = '🍔 0';
    document.getElementById('level').textContent = 'Nivel = 1';
    document.getElementById('gameOver').style.display = 'none';
    gameLoop();
}

document.getElementById('restartButton').addEventListener('click', resetGame);

function gameLoop() {
    if (gameState.isGameOver) return;

    drawBackground();

    spawnFood();
    spawnObstacle();

    // Actualizar y dibujar alimentos
    foods = foods.filter(food => !food.update());
    foods.forEach(food => food.draw());

    // Actualizar y dibujar obstáculos
    obstacles = obstacles.filter(obstacle => !obstacle.update());
    obstacles.forEach(obstacle => obstacle.draw());

    plate.update();
    plate.draw();

    checkCollisions();
    updateLevel();

    // Aumentar velocidad gradualmente
    gameState.speed += 0.001;

    requestAnimationFrame(gameLoop);
}

gameLoop();
