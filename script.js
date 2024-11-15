const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const gameMusic = document.getElementById('gameMusic');
const showDetailsButton = document.getElementById('showDetails');
const gameDetails = document.getElementById('gameDetails');

let lastGame = {
    date: null,
    time: null,
    score: 0
};

let gameState = {
    score: 0,
    speed: 5,
    isGameOver: false,
    currentLane: 1,
    roadOffset: 0,
    level: 1,
    backgroundColor: '#000000',
    isPlaying: false
};

const LANES = [-100, 0, 100];
const FOOD_EMOJIS = ['🍔', '🌭', '🍗', '🥩'];
const LEVEL_COLORS = ['#000000', '#FF0000', '#FFFF00', '#87CEEB', '#008000'];

// Configuración del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Dibujar fondo con imagen central
function drawBackground() {
    ctx.fillStyle = gameState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = 'foto1.png'; // Asegúrate de que esta imagen esté en el mismo directorio
    img.onload = () => {
        const imgSize = Math.min(canvas.width, canvas.height) / 3;
        ctx.globalAlpha = 0.2; // Transparencia para que no moleste el juego
        ctx.drawImage(img, canvas.width / 2 - imgSize / 2, canvas.height / 2 - imgSize / 2, imgSize, imgSize);
        ctx.globalAlpha = 1.0; // Restaurar opacidad
    };
}

// Clase para el plato
class Plate {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 150;
        this.width = 60;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    update(targetLane) {
        const targetX = canvas.width / 2 + LANES[targetLane];
        this.x += (targetX - this.x) * 0.1;
    }
}

// Clase para los alimentos
class Food {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    }

    draw() {
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.y += gameState.speed;
    }
}

// Clase para los obstáculos
class Obstacle {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.width = 50;
        this.height = 50;
    }

    draw() {
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }

    update() {
        this.y += gameState.speed;
    }
}

const plate = new Plate();
let foods = [];
let obstacles = [];

// Dibujar carretera
function drawRoad() {
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#fff';
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 5;

    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + i * 100, 0);
        ctx.lineTo(canvas.width / 2 + i * 100, canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

// Manejar eventos de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && gameState.currentLane > 0) {
        gameState.currentLane--;
    } else if (e.key === 'ArrowRight' && gameState.currentLane < 2) {
        gameState.currentLane++;
    }
});

// Iniciar juego
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameState.isPlaying = true;
    gameMusic.play();
    gameLoop();
});

// Función para finalizar el juego
function gameOver() {
    gameState.isGameOver = true;
    gameState.isPlaying = false;
    gameMusic.pause();
    document.getElementById('finalScore').textContent = gameState.score;
    gameOverScreen.style.display = 'block';

    // Guardar detalles del último juego
    const now = new Date();
    lastGame.date = now.toLocaleDateString();
    lastGame.time = now.toLocaleTimeString();
    lastGame.score = gameState.score;
}

// Mostrar detalles del último juego
showDetailsButton.addEventListener('click', () => {
    if (gameDetails.style.display === 'none') {
        const date = lastGame.date || 'N/A';
        const time = lastGame.time || 'N/A';
        const score = lastGame.score || 0;
        gameDetails.innerHTML = `
            <p>Fecha: ${date}</p>
            <p>Hora: ${time}</p>
            <p>Puntaje: ${score}</p>
        `;
        gameDetails.style.display = 'block';
    } else {
        gameDetails.style.display = 'none';
    }
});

// Reiniciar juego
restartButton.addEventListener('click', () => {
    gameState = {
        score: 0,
        speed: 5,
        isGameOver: false,
        currentLane: 1,
        roadOffset: 0,
        level: 1,
        backgroundColor: LEVEL_COLORS[0],
        isPlaying: true
    };
    foods = [];
    obstacles = [];
    gameOverScreen.style.display = 'none';
    gameMusic.currentTime = 0;
    gameMusic.play();
    gameLoop();
});

// Generar alimentos y obstáculos
function spawnEntities() {
    if (Math.random() < 0.02) {
        foods.push(new Food());
    }
    if (Math.random() < 0.01) {
        obstacles.push(new Obstacle());
    }
}

// Verificar colisiones
function checkCollisions() {
    foods = foods.filter((food) => {
        const dist = Math.hypot(food.x - plate.x, food.y - plate.y);
        if (dist < plate.width / 2) {
            gameState.score += 5;
            document.getElementById('score').textContent = `🍔 ${gameState.score}`;
            return false;
        }
        return true;
    });

    obstacles.forEach((obstacle) => {
        const dist = Math.hypot(obstacle.x - plate.x, obstacle.y - plate.y);
        if (dist < plate.width / 2) {
            gameOver();
        }
    });
}

// Ciclo principal del juego
function gameLoop() {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    plate.update(gameState.currentLane);
    plate.draw();

    foods.forEach((food) => {
        food.update();
        food.draw();
    });

    obstacles.forEach((obstacle) => {
        obstacle.update();
        obstacle.draw();
    });

    spawnEntities();
    checkCollisions();

    // Cambiar nivel
    if (Math.floor(gameState.score / 400) + 1 !== gameState.level) {
        gameState.level = Math.floor(gameState.score / 400) + 1;
        gameState.backgroundColor =
            LEVEL_COLORS[(gameState.level - 1) % LEVEL_COLORS.length];
        document.getElementById('level').textContent = `Nivel = ${gameState.level}`;
    }

    requestAnimationFrame(gameLoop);
}
