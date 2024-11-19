const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const gameMusic = document.getElementById('gameMusic');
const showDetailsButton = document.getElementById('showDetails');
const gameDetails = document.getElementById('gameDetails');
const rewardMessageElement = document.getElementById('rewardMessage');

// Configuración inicial
let gameState = {
    score: 0,
    level: 1,
    isPlaying: false,
    isGameOver: false
};

const rewards = [
    { points: 800, message: "¡Ganaste un Vaso Refrescante! 🥤" },
    { points: 1500, message: "¡Ganaste Papas Premium! 🍟" },
    { points: 2000, message: "¡Ganaste un 10% de Descuento VIP! 💫" },
    { points: 3000, message: "¡Ganaste un Plato Sorpresa Deluxe! 🎁" }
];

// Iniciar el juego
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameState.isPlaying = true;
    gameLoop();
});

// Reiniciar el juego
restartButton.addEventListener('click', () => {
    gameState = { score: 0, level: 1, isPlaying: true, isGameOver: false };
    rewardMessageElement.textContent = '';
    gameOverScreen.style.display = 'none';
    gameLoop();
});

// Fin del juego
function gameOver() {
    gameState.isPlaying = false;
    gameState.isGameOver = true;
    gameOverScreen.style.display = 'block';

    document.getElementById('finalScore').textContent = gameState.score;

    const reward = rewards.find(r => gameState.score >= r.points);
    rewardMessageElement.textContent = reward ? reward.message : "No alcanzaste al premio mayor. ¡Inténtalo de nuevo!";
}

// Lógica del juego
function gameLoop() {
    if (!gameState.isPlaying) return;

    // Lógica del juego...

    requestAnimationFrame(gameLoop);
}
