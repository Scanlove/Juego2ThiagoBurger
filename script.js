const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const rewardMessageElement = document.getElementById('rewardMessage');

// Efectos de sonido
const gameMusic = document.getElementById('gameMusic');
const collectSound = document.getElementById('collectSound');
const powerupSound = document.getElementById('powerupSound');
const levelUpSound = document.getElementById('levelUpSound');
const crashSound = document.getElementById('crashSound');

// Estado inicial del juego
let gameState = {
    score: 0,
    level: 1,
    isPlaying: false,
    isGameOver: false,
    currentLane: 1,
    speed: 5,
    foods: [],
    obstacles: [],
    plate: null,
    combo: 1,
    maxCombo: 1,
    powerups: [],
    particles: [],
    shield: false,
    multiplier: 1,
    speedBoost: false,
};

// Configuración de carriles y colores
const LANES = [-100, 0, 100];
const LEVEL_COLORS = ['#2f3542', '#57606f', '#ffa502', '#3742fa', '#ff4757', '#2ed573', '#1e90ff', '#5f27cd'];
const FOOD_EMOJIS = ['🍔', '🌭', '🍗', '🥩', '🍕', '🌮', '🥪', '🍜'];
const POWERUP_TYPES = ['🛡️', '⚡', '💥', '💰'];

// Recompensas
const rewards = [
    { points: 800, message: "¡Ganaste un Vaso Refrescante! 🥤" },
    { points: 1500, message: "¡Ganaste Papas Premium! 🍟" },
    { points: 2000, message: "¡Ganaste un 10% de Descuento VIP! 💫" },
    { points: 3000, message: "¡Ganaste un Plato Sorpresa Deluxe! 🎁" },
];

// Ajustar tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Clase para el plato
class Plate {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.width = 60;
        this.color = '#fff';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = gameState.shield ? '#00ff00' : this.color;
        ctx.fill();
        ctx.strokeStyle = gameState.shield ? '#00ff00' : '#ddd';
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
        this.value = 15;
    }

    draw() {
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.y += gameState.speed * (gameState.speedBoost ? 1.5 : 1);
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
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }

    update() {
        this.y += gameState.speed * (gameState.speedBoost ? 1.5 : 1);
    }
}

// Clase para Power-ups
class Powerup {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    }

    draw() {
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type, this.x, this.y);
    }

    update() {
        this.y += gameState.speed;
    }
}

// Manejar eventos de teclado
document.addEventListener('keydown', (e) => {
    if (gameState.isPlaying) {
        if (e.key === 'ArrowLeft' && gameState.currentLane > 0) {
            gameState.currentLane--;
        } else if (e.key === 'ArrowRight' && gameState.currentLane < 2) {
            gameState.currentLane++;
        }
    }
});

// Iniciar el juego
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameMusic.play();
    initGame();
    gameLoop();
});

// Reiniciar el juego
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameMusic.currentTime = 0;
    gameMusic.play();
    initGame();
    gameLoop();
});

// Inicializar el juego
function initGame() {
    gameState = {
        score: 0,
        level: 1,
        isPlaying: true,
        isGameOver: false,
        currentLane: 1,
        speed: 5,
        foods: [],
        obstacles: [],
        plate: new Plate(),
        combo: 1,
        maxCombo: 1,
        powerups: [],
        particles: [],
        shield: false,
        multiplier: 1,
        speedBoost: false,
    };
    rewardMessageElement.textContent = '';
}

// Dibujar el fondo
function drawBackground() {
    ctx.fillStyle = LEVEL_COLORS[gameState.level % LEVEL_COLORS.length];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Generar alimentos, obstáculos y power-ups
function spawnEntities() {
    if (Math.random() < 0.02) {
        gameState.foods.push(new Food());
    }
    if (Math.random() < 0.01) {
        gameState.obstacles.push(new Obstacle());
    }
    if (Math.random() < 0.005) {
        gameState.powerups.push(new Powerup());
    }
}

// Verificar colisiones
function checkCollisions() {
    // Colisión con alimentos
    gameState.foods = gameState.foods.filter((food) => {
        const dist = Math.hypot(food.x - gameState.plate.x, food.y - gameState.plate.y);
        if (dist < gameState.plate.width / 2) {
            collectSound.play();
            gameState.score += food.value * gameState.multiplier;
            gameState.combo++;
            gameState.maxCombo = Math.max(gameState.combo, gameState.maxCombo);
            return false;
        }
        return true;
    });

    // Colisión con power-ups
    gameState.powerups = gameState.powerups.filter((powerup) => {
        const dist = Math.hypot(powerup.x - gameState.plate.x, powerup.y - gameState.plate.y);
        if (dist < gameState.plate.width / 2) {
            powerupSound.play();
            switch (powerup.type) {
                case '🛡️':
                    gameState.shield = true;
                    setTimeout(() => gameState.shield = false, 5000);
                    break;
                case '⚡':
                    gameState.speedBoost = true;
                    setTimeout(() => gameState.speedBoost = false, 5000);
                    break;
                case '💥':
                    gameState.obstacles = [];
                    break;
                case '💰':
                    gameState.multiplier = 2;
                    setTimeout(() => gameState.multiplier = 1, 5000);
                    break;
            }
            return false;
        }
        return true;
    });

    // Colisión con obstáculos
    gameState.obstacles.forEach((obstacle) => {
        const dist = Math.hypot(obstacle.x - gameState.plate.x, obstacle.y - gameState.plate.y);
        if (dist < gameState.plate.width / 2) {
            if (gameState.shield) {
                gameState.shield = false;
            } else {
                crashSound.play();
                gameOver();
            }
        }
    });
}

// Fin del juego
function gameOver() {
    gameState.isPlaying = false;
    gameState.isGameOver = true;
    gameMusic.pause();
    gameOverScreen.style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('maxCombo').textContent = gameState.maxCombo;
    document.getElementById('finalLevel').textContent = gameState.level;

    const reward = rewards.find((r) => gameState.score >= r.points);
    rewardMessageElement.textContent = reward
        ? reward.message
        : "No alcanzaste al premio mayor. ¡Inténtalo de nuevo!";
}

// Actualizar el HUD
function updateHUD() {
    document.getElementById('score').innerHTML = `🍔 ${gameState.score}`;
    document.getElementById('level').innerHTML = `Nivel ${gameState.level}`;
    document.getElementById('combo').innerHTML = `Combo x${gameState.combo}`;
}

// Subir de nivel
function levelUp() {
    if (gameState.score >= gameState.level * 500) {
        levelUpSound.play();
        gameState.level++;
        gameState.speed += 1;
        const powerupElement = document.getElementById('powerups');
        powerupElement.innerHTML = `🎉 ¡Nivel ${gameState.level}! Velocidad aumentada`;
        setTimeout(() => powerupElement.innerHTML = '', 2000);
    }
}

// Bucle principal del juego
function gameLoop() {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Dibujar y actualizar el plato
    gameState.plate.update(gameState.currentLane);
    gameState.plate.draw();

    // Dibujar y actualizar alimentos
    gameState.foods.forEach((food) => {
        food.update();
        food.draw();
    });

    // Dibujar y actualizar obstáculos
    gameState.obstacles.forEach((obstacle) => {
        obstacle.update();
        obstacle.draw();
    });

    // Dibujar y actualizar power-ups
    gameState.powerups.forEach((powerup) => {
        powerup.update();
        powerup.draw();
    });

    // Generar nuevos elementos y verificar colisiones
    spawnEntities();
    checkCollisions();

    // Actualizar la interfaz del usuario
    updateHUD();
    levelUp();

    // Continuar el bucle
    requestAnimationFrame(gameLoop);
}
