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

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawRoad() {
    ctx.fillStyle = gameState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();

    // Actualización del juego
    gameState.speed += 0.001;

    requestAnimationFrame(gameLoop);
}

// Iniciar juego
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameState.isPlaying = true;
    gameMusic.play();
    gameLoop();
});

// Reiniciar juego
restartButton.addEventListener('click', () => {
    const now = new Date();
    lastGame.date = now.toLocaleDateString();
    lastGame.time = now.toLocaleTimeString();
    lastGame.score = gameState.score;

    gameState = {
        score: 0,
        speed: 5,
        isGameOver: false,
        currentLane: 1,
        roadOffset: 0,
        level: 1,
        backgroundColor: '#000000',
        isPlaying: true
    };

    gameOverScreen.style.display = 'none';
    gameMusic.currentTime = 0;
    gameMusic.play();
    gameLoop();
});

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
