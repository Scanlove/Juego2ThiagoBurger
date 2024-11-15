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

let gameState = {
    score: 0,
    speed: 5,
    isGameOver: false,
    currentLane: 1,
    roadOffset: 0
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

class Hamburger {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Dibujar hamburguesa (círculo marrón)
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#8B4513';
        ctx.fill();

        // Detalles de la hamburguesa
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-15, -5, 30, 3);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(-12, 5, 24, 2);

        ctx.restore();
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
let hamburgers = [];
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

function drawRoad() {
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de la carretera
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 5;

    // Dibujar líneas con efecto de movimiento
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + (i * LANE_WIDTH), 0);
        ctx.lineTo(canvas.width / 2 + (i * LANE_WIDTH), canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

function spawnHamburger() {
    if (Math.random() < 0.02) {
        hamburgers.push(new Hamburger());
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

    // Colisión con hamburguesas
    hamburgers = hamburgers.filter(hamburger => {
        const hamburgerHitbox = {
            x: hamburger.x - hamburger.width / 2,
            y: hamburger.y - hamburger.height / 2,
            width: hamburger.width,
            height: hamburger.height
        };

        if (checkCollision(plateHitbox, hamburgerHitbox)) {
            gameState.score++;
            document.getElementById('score').textContent = `🍔 ${gameState.score}`;
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
        roadOffset: 0
    };
    hamburgers = [];
    obstacles = [];
    document.getElementById('score').textContent = '🍔 0';
    document.getElementById('gameOver').style.display = 'none';
    gameLoop();
}

document.getElementById('restartButton').addEventListener('click', resetGame);

function gameLoop() {
    if (gameState.isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar offset de la carretera
    gameState.roadOffset = (gameState.roadOffset + gameState.speed) % 40;
    ctx.save();
    ctx.translate(0, gameState.roadOffset);
    drawRoad();
    ctx.restore();

    spawnHamburger();
    spawnObstacle();

    // Actualizar y dibujar hamburguesas
    hamburgers = hamburgers.filter(hamburger => !hamburger.update());
    hamburgers.forEach(hamburger => hamburger.draw());

    // Actualizar y dibujar obstáculos
    obstacles = obstacles.filter(obstacle => !obstacle.update());
    obstacles.forEach(obstacle => obstacle.draw());

    plate.update();
    plate.draw();

    checkCollisions();

    // Aumentar velocidad gradualmente
    gameState.speed += 0.001;

    requestAnimationFrame(gameLoop);
}

gameLoop();
