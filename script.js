// Configuración inicial mejorada
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const gameMusic = document.getElementById('gameMusic');
const showDetailsButton = document.getElementById('showDetails');
const gameDetails = document.getElementById('gameDetails');

// Sistema de poderes y mejoras
const POWER_UPS = {
    SHIELD: '🛡️',
    SPEED_BOOST: '⚡',
    MAGNET: '🧲',
    MULTIPLIER: '✨'
};

// Efectos de sonido
const SOUNDS = {
    collect: new Audio('collect.mp3'),
    powerup: new Audio('powerup.mp3'),
    levelUp: new Audio('levelup.mp3'),
    crash: new Audio('crash.mp3')
};

let gameState = {
    score: 0,
    speed: 5,
    isGameOver: false,
    currentLane: 1,
    roadOffset: 0,
    level: 1,
    combo: 1,
    maxCombo: 1,
    powerUps: [],
    backgroundColor: '#000000',
    foodSpawnRate: 0.02,
    obstacleSpawnRate: 0.01,
    isPlaying: false,
    multiplier: 1,
    shield: false,
    magnetActive: false,
    speedBoostActive: false
};

// Sistema de niveles mejorado
const LEVEL_MODIFIERS = {
    speed: 0.8,
    foodSpawnRate: 0.003,
    obstacleSpawnRate: 0.002,
    specialFoodChance: 0.1
};

// Comidas especiales con diferentes valores
const SPECIAL_FOODS = [
    { emoji: '🍕', points: 30, chance: 0.4 },
    { emoji: '🌮', points: 40, chance: 0.3 },
    { emoji: '🍣', points: 50, chance: 0.2 },
    { emoji: '🥩', points: 100, chance: 0.1 }
];

class PowerUp {
    constructor(type) {
        this.type = type;
        this.lane = Math.floor(Math.random() * 3);
        this.x = canvas.width / 2 + LANES[this.lane];
        this.y = -50;
        this.duration = 10000; // 10 segundos
        this.active = false;
        this.collectedTime = null;
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
        this.collectedTime = Date.now();
        SOUNDS.powerup.play();
        
        switch(this.type) {
            case POWER_UPS.SHIELD:
                gameState.shield = true;
                break;
            case POWER_UPS.SPEED_BOOST:
                gameState.speedBoostActive = true;
                gameState.speed *= 1.5;
                break;
            case POWER_UPS.MAGNET:
                gameState.magnetActive = true;
                break;
            case POWER_UPS.MULTIPLIER:
                gameState.multiplier *= 2;
                break;
        }

        setTimeout(() => this.deactivate(), this.duration);
    }

    deactivate() {
        this.active = false;
        switch(this.type) {
            case POWER_UPS.SHIELD:
                gameState.shield = false;
                break;
            case POWER_UPS.SPEED_BOOST:
                gameState.speedBoostActive = false;
                gameState.speed /= 1.5;
                break;
            case POWER_UPS.MAGNET:
                gameState.magnetActive = false;
                break;
            case POWER_UPS.MULTIPLIER:
                gameState.multiplier /= 2;
                break;
        }
    }
}

class Food extends GameObject {
    constructor() {
        super();
        this.isSpecial = Math.random() < LEVEL_MODIFIERS.specialFoodChance * gameState.level;
        if (this.isSpecial) {
            const specialFood = selectRandomSpecialFood();
            this.emoji = specialFood.emoji;
            this.points = specialFood.points;
        } else {
            this.emoji = '🍔';
            this.points = 15;
        }
        this.magnetInfluence = false;
    }

    update() {
        if (gameState.magnetActive && !this.magnetInfluence) {
            const dx = plate.x - this.x;
            const dy = plate.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                this.magnetInfluence = true;
            }
        }

        if (this.magnetInfluence) {
            this.x += (plate.x - this.x) * 0.1;
            this.y += (plate.y - this.y) * 0.1;
        } else {
            this.y += gameState.speed;
        }
    }
}

function updateLevel() {
    const newLevel = Math.floor(gameState.score / 300) + 1;
    if (newLevel !== gameState.level) {
        gameState.level = newLevel;
        SOUNDS.levelUp.play();
        
        // Aumentar dificultad progresivamente
        gameState.speed += LEVEL_MODIFIERS.speed;
        gameState.foodSpawnRate += LEVEL_MODIFIERS.foodSpawnRate;
        gameState.obstacleSpawnRate += LEVEL_MODIFIERS.obstacleSpawnRate;
        
        // Efectos visuales de nivel
        createLevelUpEffect();
        showLevelUpMessage();
        
        // Actualizar UI
        document.getElementById('level').textContent = `Nivel ${gameState.level} 🌟`;
    }
}

function createLevelUpEffect() {
    // Efecto visual de explosión de partículas
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(
            canvas.width / 2,
            canvas.height / 2,
            Math.random() * 5 + 2,
            `hsl(${Math.random() * 360}, 50%, 50%)`
        ));
    }
}

function showLevelUpMessage() {
    const message = document.createElement('div');
    message.className = 'level-up-message';
    message.textContent = `¡NIVEL ${gameState.level}!`;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

function checkCollisions() {
    foods = foods.filter((food) => {
        const dist = Math.hypot(food.x - plate.x, food.y - plate.y);
        if (dist < plate.width / 2) {
            const points = food.points * gameState.multiplier * gameState.combo;
            gameState.score += points;
            gameState.combo++;
            gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
            
            showPointsPopup(points);
            SOUNDS.collect.play();
            
            return false;
        }
        return true;
    });

    obstacles.forEach((obstacle) => {
        const dist = Math.hypot(obstacle.x - plate.x, obstacle.y - plate.y);
        if (dist < plate.width / 2) {
            if (gameState.shield) {
                obstacles = obstacles.filter(o => o !== obstacle);
                showMessage("¡Escudo activado! 🛡️");
            } else {
                SOUNDS.crash.play();
                gameOver();
            }
        }
    });
}

function showPointsPopup(points) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points}`;
    popup.style.left = `${plate.x}px`;
    popup.style.top = `${plate.y}px`;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

function gameLoop() {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updateParticles();
    
    // Actualizar y dibujar elementos del juego
    plate.update(gameState.currentLane);
    plate.draw();
    
    foods.forEach(food => {
        food.update();
        food.draw();
    });
    
    obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
    });
    
    powerUps.forEach(powerUp => {
        powerUp.update();
        powerUp.draw();
    });
    
    // Lógica del juego
    spawnEntities();
    checkCollisions();
    updateLevel();
    updateScoreDisplay();
    
    // Continuar el loop
    requestAnimationFrame(gameLoop);
}
