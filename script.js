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

// Mostrar foto en el centro
function drawPhoto() {
    const img = new Image();
    img.src = 'foto1.png';
    img.onload = () => {
        const x = canvas.width / 2 - img.width / 2;
        const y = canvas.height / 2 - img.height / 2;
        ctx.drawImage(img, x, y, 200, 200); // Ajustar tamaño a 200x200
    };
}

// Dibujar carretera
function drawRoad() {
    ctx.fillStyle = gameState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

// Función para iniciar el juego
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameState.isPlaying = true;
    gameMusic.play();
    gameLoop();
});

// Reiniciar juego
restartButton.addEventListener('click', resetGame);

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

// Reinicio del juego
function resetGame() {
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
        isPlaying: false
    };

    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'block';
    gameMusic.pause();
    gameMusic.currentTime = 0;
}
