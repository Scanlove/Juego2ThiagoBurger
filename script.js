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
    shakeIntensity: 0,
    titleScale: 1,
};

// Configuración de carriles y alimentos
const LANES = [-100, 0, 100];
const FOOD_EMOJIS = ['🍔', '🌭', '🍗', '🥩', '🍕', '🌮', '🥪', '🍜']; // Más variedad de comida
const LEVEL_COLORS = ['#2f3542', '#57606f', '#ffa502', '#3742fa', '#ff4757', '#2ed573', '#1e90ff', '#5f27cd'];
const POWERUP_TYPES = ['⚡', '🌟', '🛡️', '🎯'];

// Recompensas mejoradas
const rewards = [
    { points: 800, message: "¡INCREÍBLE! ¡Ganaste un Vaso Refrescante! 🥤" },
    { points: 1500, message: "¡ESPECTACULAR! ¡Ganaste Papas Premium! 🍟" },
    { points: 2000, message: "¡LEGENDARIO! ¡Ganaste un 10% de Descuento VIP! 💫" },
    { points: 3000, message: "¡SUPREMO! ¡Ganaste un Plato Sorpresa Deluxe! 🎁" },
];

// Sistema de partículas
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
        this.size -= 0.1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Clase PowerUp
class PowerUp {
    constructor() {
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        this.active = false;
        this.duration = 5000; // 5 segundos
    }

    draw() {
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type, this.x, this.y);
    }

    update() {
        this.y += gameState.speed;
    }

    activate() {
        this.active = true;
        powerupSound.play();
        setTimeout(() => this.deactivate(), this.duration);
    }

    deactivate() {
        this.active = false;
    }
}

// Ajustar tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Clase para el plato mejorada
class Plate {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.width = 60;
        this.rotation = 0;
        this.isInvincible = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Efecto de invencibilidad
        if (this.isInvincible) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20;
        }

        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    update(targetLane) {
        const targetX = canvas.width / 2 + LANES[targetLane];
        this.x += (targetX - this.x) * 0.1;
        this.rotation += (targetX - this.x) * 0.001;
    }
}

// Eventos de teclado mejorados
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) return;

    if (e.key === 'ArrowLeft' && gameState.currentLane > 0) {
        gameState.currentLane--;
        createParticles(gameState.plate.x, gameState.plate.y, '#fff');
    } else if (e.key === 'ArrowRight' && gameState.currentLane < 2) {
        gameState.currentLane++;
        createParticles(gameState.plate.x, gameState.plate.y, '#fff');
    }
});

// Función para crear partículas
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        gameState.particles.push(new Particle(x, y, color));
    }
}

// Iniciar el juego con animación
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
        shakeIntensity: 0,
        titleScale: 1,
    };
    rewardMessageElement.textContent = '';
}

// Bucle principal del juego mejorado
function gameLoop() {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    ctx.save();
    
    // Efecto de sacudida de la cámara
    if (gameState.shakeIntensity > 0) {
        ctx.translate(
            Math.random() * gameState.shakeIntensity - gameState.shakeIntensity / 2,
            Math.random() * gameState.shakeIntensity - gameState.shakeIntensity / 2
        );
        gameState.shakeIntensity *= 0.9;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Actualizar y dibujar partículas
    gameState.particles = gameState.particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });

    // Dibujar y actualizar el plato
    gameState.plate.update(gameState.currentLane);
    gameState.plate.draw();

    // Dibujar y actualizar alimentos
    gameState.foods.forEach((food, index) => {
        food.update();
        food.draw();
    });

    // Dibujar y actualizar obstáculos
    gameState.obstacles.forEach((obstacle) => {
        obstacle.update();
        obstacle.draw();
    });

    // Dibujar y actualizar powerups
    gameState.powerups.forEach((powerup) => {
        powerup.update();
        powerup.draw();
    });

    ctx.restore();

    // Generar nuevos elementos
    spawnEntities();

    // Verificar colisiones
    checkCollisions();

    // Actualizar el HUD
    updateHUD();

    // Incrementar dificultad
    if (gameState.score > gameState.level * 500) {
        levelUp();
    }

    // Continuar el bucle
    requestAnimationFrame(gameLoop);
}

// Función de nivel superior
function levelUp() {
    gameState.level++;
    gameState.speed += 0.5;
    levelUpSound.play();
    createParticles(canvas.width / 2, canvas.height / 2, '#ffd700');
    gameState.shakeIntensity = 10;
}

// Generar elementos mejorado
function spawnEntities() {
    if (Math.random() < 0.02 + (gameState.level * 0.005)) {
        gameState.foods.push(new Food());
    }
    if (Math.random() < 0.01 + (gameState.level * 0.002)) {
        gameState.obstacles.push(new Obstacle());
    }
    if (Math.random() < 0.005) {
        gameState.powerups.push(new PowerUp());
    }
}

// Verificar colisiones mejorado
function checkCollisions() {
    // Colisión con alimentos
    gameState.foods = gameState.foods.filter((food) => {
        const dist = Math.hypot(food.x - gameState.plate.x, food.y - gameState.plate.y);
        if (dist < gameState.plate.width / 2) {
            collectSound.play();
            gameState.score += 15 * gameState.combo;
            gameState.combo++;
            gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
            createParticles(food.x, food.y, '#ffd700');
            return false;
        }
        return food.y < canvas.height + 50;
    });

    // Colisión con powerups
    gameState.powerups = gameState.powerups.filter((powerup) => {
        const dist = Math.hypot(powerup.x - gameState.plate.x, powerup.y - gameState.plate.y);
        if (dist < gameState.plate.width / 2) {
            powerup.activate();
            gameState.plate.isInvincible = true;
            setTimeout(() => {
                gameState.plate.isInvincible = false;
            }, 5000);
            return false;
        }
        return powerup.y < canvas.height + 50;
    });

    // Colisión con obstáculos
    if (!gameState.plate.isInvincible) {
        gameState.obstacles.forEach((obstacle) => {
            const dist = Math.hypot(obstacle.x - gameState.plate.x, obstacle.y - gameState.plate.y);
            if (dist < gameState.plate.width / 2) {
                crashSound.play();
                gameOver();
            }
        });
    }
}

// Fin del juego mejorado
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
        : "¡No te rindas! ¡Inténtalo de nuevo para ganar premios increíbles! 🎮";
}

// Actualizar el HUD mejorado
function updateHUD() {
    document.getElementById('score').textContent = `🍔 ${gameState.score}`;
    document.getElementById('level').textContent = `Nivel ${gameState.level}`;
    document.getElementById('combo').textContent = `Combo x${gameState.combo}`;
}

// Efecto de título pulsante
function updateTitleScale() {
    gameState.titleScale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
    document.querySelector('.game-title').style.transform = `scale(${gameState.titleScale})`;
    requestAnimationFrame(updateTitleScale);
}

// Iniciar efectos visuales
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
updateTitleScale();
