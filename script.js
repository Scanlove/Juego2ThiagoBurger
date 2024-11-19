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
    foodSpawnRate: 0.02,
    obstacleSpawnRate: 0.01,
    isPlaying: false
};

const LANES = [-100, 0, 100];
const FOOD_EMOJIS = ['🍔', '🌭', '🍗', '🥩'];
const LEVEL_COLORS = ['#000000', '#1C1C1C', '#0A0A29', '#003300', '#3E2723'];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const img = new Image();
img.src = 'foto1.png';

function drawBackground() {
    // Primero dibujamos el color de fondo según el nivel
    ctx.fillStyle = gameState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quitamos esta línea que sobrescribía el color
    // ctx.fillStyle = '#666';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujamos las líneas de la carretera
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

    const imgSize = Math.min(canvas.width, canvas.height) / 3;
    ctx.globalAlpha = 0.2;
    ctx.drawImage(img, canvas.width / 2 - imgSize / 2, canvas.height / 2 - imgSize / 2, imgSize, imgSize);
    ctx.globalAlpha = 1.0;
}

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

// Manejar eventos de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && gameState.currentLane > 0) {
        gameState.currentLane--;
    } else if (e.key === 'ArrowRight' && gameState.currentLane < 2) {
        gameState.currentLane++;
    }
});

// Manejar eventos táctiles
canvas.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;

    // Detectar si el toque fue en la izquierda o derecha de la pantalla
    if (touchX < canvas.width / 2 && gameState.currentLane > 0) {
        gameState.currentLane--; // Mover a la izquierda
    } else if (touchX >= canvas.width / 2 && gameState.currentLane < 2) {
        gameState.currentLane++; // Mover a la derecha
    }
});


startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameState.isPlaying = true;
    gameMusic.play();
    gameLoop();
});

function gameOver() {
    gameState.isGameOver = true;
    gameState.isPlaying = false;
    gameMusic.pause();
    document.getElementById('finalScore').textContent = gameState.score;

    // Eliminar cualquier mensaje previo de recompensa
    const existingRewardElement = gameOverScreen.querySelector('.reward-message');
    if (existingRewardElement) {
        existingRewardElement.remove();
    }

    // Determinar si el jugador ganó algo según su puntaje
    let rewardMessage = '';
    if (gameState.score >= 3000) {
        rewardMessage = "🎉 ¡Ganaste un Plato Sorpresa!";
    } else if (gameState.score >= 2000) {
        rewardMessage = "🎉 ¡Ganaste un 10% de Descuento!";
    } else if (gameState.score >= 1500) {
        rewardMessage = "🏆 ¡Ganaste una Porción de Papas!";
    } else if (gameState.score >= 800) {
        rewardMessage = "🏅 ¡Ganaste un Vaso de Refresco!";
    } else {
        rewardMessage = "😢 No alcanzaste al premio MAYOR. ¡Inténtalo de nuevo!";
    }

    // Crear un nuevo mensaje de recompensa
    const rewardElement = document.createElement('p');
    rewardElement.textContent = rewardMessage;
    rewardElement.style.fontSize = '20px';
    rewardElement.style.color = '#FFD700';
    rewardElement.style.marginTop = '20px';
    rewardElement.style.fontWeight = 'bold';
    rewardElement.classList.add('reward-message'); // Clase para identificar el mensaje

    // Agregar el mensaje al cuadro de "Juego Terminado"
    gameOverScreen.appendChild(rewardElement);
    gameOverScreen.style.display = 'block';

    // Guardar detalles del último juego
    const now = new Date();
    lastGame.date = now.toLocaleDateString();
    lastGame.time = now.toLocaleTimeString();
    lastGame.score = gameState.score;
}



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

restartButton.addEventListener('click', () => {
    gameState = {
        score: 0,
        speed: 5,
        isGameOver: false,
        currentLane: 1,
        roadOffset: 0,
        level: 1,
        backgroundColor: LEVEL_COLORS[0],
        foodSpawnRate: 0.02,
        obstacleSpawnRate: 0.01,
        isPlaying: true
    };
    foods = [];
    obstacles = [];
    gameOverScreen.style.display = 'none';
    gameMusic.currentTime = 0;
    gameMusic.play();
    gameLoop();
});

function spawnEntities() {
    if (Math.random() < gameState.foodSpawnRate) {
        foods.push(new Food());
    }
    if (Math.random() < gameState.obstacleSpawnRate) {
        obstacles.push(new Obstacle());
    }
}

function checkCollisions() {
    foods = foods.filter((food) => {
        const dist = Math.hypot(food.x - plate.x, food.y - plate.y);
        if (dist < plate.width / 2) {
            gameState.score += 15;
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

    const currentLevel = Math.floor(gameState.score / 400) + 1;
    if (currentLevel !== gameState.level) {
        gameState.level = currentLevel;
        gameState.backgroundColor = LEVEL_COLORS[(gameState.level - 1) % LEVEL_COLORS.length];
        gameState.speed += 0.5;
        gameState.foodSpawnRate += 0.005;
        gameState.obstacleSpawnRate += 0.002;
        document.getElementById('level').textContent = `Nivel = ${gameState.level}`;
    }

    requestAnimationFrame(gameLoop);
}
