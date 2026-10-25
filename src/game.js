// Motor de Pac-Man 2026 - VibeOps Edition (Con Sistema de Niveles, 4 Fantasmas, Separación y Pantalla de Victoria)
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');

const container = document.getElementById('game-container');
container.innerHTML = '';
container.appendChild(canvas);

// Leaderboard simulando Firestore
let leaderboard = [
    { playerName: "VibeMaster", score: 350 },
    { playerName: "CloudSec", score: 280 },
    { playerName: "PacHero", score: 150 }
];

// Objeto Pac-Man
let pacman = {
    x: 200,
    y: 200,
    size: 15,
    speed: 3,
    dx: 0,
    dy: 0,
    score: 0,
    lives: 3
};

// Control de Niveles y Fantasmas
let currentLevel = 1;
let maxLevel = 4; // Nivel máximo para obtener la Copa
let ghosts = [];
let gameWon = false;
let gameOver = false;

// Función para inicializar los fantasmas según el nivel (máximo 4, velocidad constante)
function initGhosts(level) {
    ghosts = [];
    let numGhosts = Math.min(level, 4); // Máximo 4 fantasmas
    let colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb851']; // Blinky, Pinky, Inky, Clyde
    let spawnPositions = [
        { x: 50, y: 50 },
        { x: 350, y: 50 },
        { x: 50, y: 350 },
        { x: 350, y: 350 }
    ];

    for (let i = 0; i < numGhosts; i++) {
        ghosts.push({
            x: spawnPositions[i].x,
            y: spawnPositions[i].y,
            size: 15,
            speed: 1.5, // Velocidad constante y equilibrada
            color: colors[i]
        });
    }
}

// Generar puntos (dots)
let dots = [];
function initDots() {
    dots = [];
    for (let i = 50; i < canvas.width; i += 50) {
        for (let j = 50; j < canvas.height; j += 50) {
            dots.push({ x: i, y: j, eaten: false });
        }
    }
}

// Inicializar por primera vez
initDots();
initGhosts(currentLevel);

// Capturar eventos del teclado
window.addEventListener('keydown', (e) => {
    if ((gameOver || gameWon) && (e.key === 'r' || e.key === 'R')) {
        resetGame();
        return;
    }

    if (!gameOver && !gameWon) {
        switch (e.key) {
            case 'ArrowUp':
                pacman.dx = 0;
                pacman.dy = -pacman.speed;
                break;
            case 'ArrowDown':
                pacman.dx = 0;
                pacman.dy = pacman.speed;
                break;
            case 'ArrowLeft':
                pacman.dx = -pacman.speed;
                pacman.dy = 0;
                break;
            case 'ArrowRight':
                pacman.dx = pacman.speed;
                pacman.dy = 0;
                break;
        }
    }
});

function resetGame() {
    pacman.x = 200;
    pacman.y = 200;
    pacman.dx = 0;
    pacman.dy = 0;
    pacman.score = 0;
    pacman.lives = 3;
    currentLevel = 1;
    gameWon = false;
    gameOver = false;
    initDots();
    initGhosts(currentLevel);
}

function updateGame() {
    if (gameOver || gameWon) return;

    // Mover a Pac-Man
    pacman.x += pacman.dx;
    pacman.y += pacman.dy;

    // Límites de la pantalla
    if (pacman.x - pacman.size < 0) pacman.x = pacman.size;
    if (pacman.x + pacman.size > canvas.width) pacman.x = canvas.width - pacman.size;
    if (pacman.y - pacman.size < 0) pacman.y = pacman.size;
    if (pacman.y + pacman.size > canvas.height) pacman.y = canvas.height - pacman.size;

    // Lógica de fantasmas con persecución y separación espacial
    ghosts.forEach((ghost, index) => {
        let targetX = pacman.x;
        let targetY = pacman.y;

        if (index > 0) {
            targetX += (index % 2 === 0 ? 1 : -1) * (index * 10);
            targetY += (index % 2 !== 0 ? 1 : -1) * (index * 10);
        }

        if (ghost.x < targetX) ghost.x += ghost.speed;
        if (ghost.x > targetX) ghost.x -= ghost.speed;
        if (ghost.y < targetY) ghost.y += ghost.speed;
        if (ghost.y > targetY) ghost.y -= ghost.speed;

        // Fuerza de separación entre fantasmas
        ghosts.forEach((otherGhost, otherIndex) => {
            if (index !== otherIndex) {
                let dx = ghost.x - otherGhost.x;
                let dy = ghost.y - otherGhost.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 25 && distance > 0) {
                    let pushForce = 0.8;
                    ghost.x += (dx / distance) * pushForce;
                    ghost.y += (dy / distance) * pushForce;
                }
            }
        });

        // Colisión Pac-Man con fantasma
        let distGhostX = pacman.x - ghost.x;
        let distGhostY = pacman.y - ghost.y;
        let distGhost = Math.sqrt(distGhostX * distGhostX + distGhostY * distGhostY);
        
        if (distGhost < pacman.size + ghost.size - 5) {
            pacman.lives -= 1;
            if (pacman.lives <= 0) {
                pacman.lives = 0;
                gameOver = true;
                leaderboard.push({ playerName: "Player1", score: pacman.score });
            } else {
                pacman.x = 200;
                pacman.y = 200;
                pacman.dx = 0;
                pacman.dy = 0;
                initGhosts(currentLevel);
            }
        }
    });

    // Comprobar colisión con los puntos
    dots.forEach(dot => {
        if (!dot.eaten) {
            let distX = pacman.x - dot.x;
            let distY = pacman.y - dot.y;
            let distance = Math.sqrt(distX * distX + distY * distY);
            if (distance < pacman.size + 5) {
                dot.eaten = true;
                pacman.score += 10;
            }
        }
    });

    // Verificar si se comieron todas las galletas (Subir de nivel o ganar el juego)
    let allEaten = dots.every(dot => dot.eaten);
    if (allEaten) {
        if (currentLevel >= maxLevel) {
            gameWon = true;
            leaderboard.push({ playerName: "Champion", score: pacman.score + 500 }); // Bonus por victoria
        } else {
            currentLevel += 1;
            initDots();
            initGhosts(currentLevel);
            pacman.x = 200;
            pacman.y = 200;
            pacman.dx = 0;
            pacman.dy = 0;
        }
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar los puntos
    ctx.fillStyle = '#ffb8ae';
    dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Dibujar a Pac-Man
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();

    // Dibujar fantasmas
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, ghost.size, Math.PI, 0, false);
        ctx.lineTo(ghost.x + ghost.size, ghost.y + ghost.size);
        ctx.lineTo(ghost.x - ghost.size, ghost.y + ghost.size);
        ctx.fill();
    });

    // Marcador superior
    ctx.fillStyle = '#fff';
    ctx.font = '13px Arial';
    ctx.fillText("Score: " + pacman.score, 15, 25);
    ctx.fillText("Nivel: " + currentLevel + "/" + maxLevel, 165, 25);
    ctx.fillText("Vidas: " + pacman.lives, 320, 25);

    // Pantalla de VICTORIA (COPA DE PREMIO)
    if (gameWon) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar icono de Copa de Oro
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("🏆", canvas.width / 2, 65);

        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 22px Arial';
        ctx.fillText("¡VICTORIA ÉPICA!", canvas.width / 2, 105);

        ctx.fillStyle = '#fff';
        ctx.font = '15px Arial';
        ctx.fillText("¡Completaste los 4 niveles y venciste al enjambre!", canvas.width / 2, 135);
        ctx.fillText("Puntaje Final con Bonus: " + (pacman.score + 500), canvas.width / 2, 160);

        // Leaderboard en victoria
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 13px Arial';
        ctx.fillText("🏆 TOP LEADERBOARD", canvas.width / 2, 195);

        ctx.font = '13px Arial';
        let startY = 220;
        leaderboard.sort((a, b) => b.score - a.score);
        let topEntries = leaderboard.slice(0, 3);
        
        topEntries.forEach((entry, index) => {
            ctx.fillStyle = '#fff';
            ctx.fillText(`${index + 1}. ${entry.playerName} - ${entry.score} pts`, canvas.width / 2, startY);
            startY += 20;
        });

        ctx.fillStyle = '#00ffcc';
        ctx.font = '13px Arial';
        ctx.fillText("Presiona 'R' para jugar de nuevo", canvas.width / 2, canvas.height - 25);
        ctx.textAlign = 'left';
    }

    // Pantalla de GAME OVER
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", canvas.width / 2, 60);

        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText("Puntaje Final: " + pacman.score, canvas.width / 2, 95);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText("🏆 TOP LEADERBOARD", canvas.width / 2, 130);

        ctx.font = '13px Arial';
        let startY = 155;
        leaderboard.sort((a, b) => b.score - a.score);
        let topEntries = leaderboard.slice(0, 3);
        
        topEntries.forEach((entry, index) => {
            ctx.fillStyle = '#fff';
            ctx.fillText(`${index + 1}. ${entry.playerName} - ${entry.score} pts`, canvas.width / 2, startY);
            startY += 22;
        });

        ctx.fillStyle = '#00ffcc';
        ctx.font = '13px Arial';
        ctx.fillText("Presiona la tecla 'R' para reiniciar", canvas.width / 2, canvas.height - 40);
        ctx.textAlign = 'left'; 
    }
}

// Bucle principal del juego
function loop() {
    updateGame();
    draw();
    requestAnimationFrame(loop);
}

// Iniciar bucle
loop();