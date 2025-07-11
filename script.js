const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// --- Configurações do Jogo ---
const playerRadius = 15;
const collectibleRadius = 7;
const obstacleWidth = 80;
const obstacleHeight = 20;
const baseSpeed = 2;

// --- Configuração de Direção ---
const directionStates = [
    { dx: 0, dy: -1 }, // 0: Cima
    { dx: -1, dy: 0 }, // 1: Esquerda
    { dx: 0, dy: 1 },  // 2: Baixo
    { dx: 1, dy: 0 }   // 3: Direita
];

// --- Variáveis de Estado ---
let player, collectibles, obstacles, score, speedMultiplier, gameOver, animationId, currentDirectionIndex;

function init() {
    // --- Jogador ---
    player = {
        x: canvas.width / 2,
        y: canvas.height / 2, // Começa no centro para ter mais espaço
    };

    // --- Outras Variáveis ---
    collectibles = [];
    obstacles = [];
    score = 0;
    speedMultiplier = 1.0;
    gameOver = false;
    currentDirectionIndex = 0; // Começa apontando para CIMA

    // --- Elementos da UI ---
    scoreEl.innerText = '0';
    speedEl.innerText = '1.0';
    gameOverScreen.classList.add('hidden');

    // Adiciona os controles
    document.addEventListener('keydown', changeDirection);
    document.addEventListener('mousedown', changeDirection);

    // --- Início ---
    spawnCollectible();
    if(animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

// --- Funções de Geração ---
function spawnCollectible() {
    let x, y;
    x = Math.random() * (canvas.width - collectibleRadius * 4) + collectibleRadius * 2;
    y = Math.random() * (canvas.height - collectibleRadius * 4) + collectibleRadius * 2;
    collectibles.push({ x, y });
}

function spawnObstacle() {
    const shapeType = Math.random() < 0.5 ? 'rect' : 'triangle';
    obstacles.push({
        x: Math.random() * (canvas.width - obstacleWidth),
        y: -obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        dy: 1,
        shape: shapeType
    });
}

// --- Função de Controle ---
function changeDirection() {
    if (gameOver) return; // Não muda de direção se o jogo acabou
    currentDirectionIndex++;
    if (currentDirectionIndex >= directionStates.length) {
        currentDirectionIndex = 0; // Volta para o início do ciclo
    }
}

// --- Funções de Colisão ---
function checkCollisions() {
    // Colisão com colecionáveis
    collectibles.forEach((collectible, index) => {
        const dist = Math.hypot(player.x - collectible.x, player.y - collectible.y);
        if (dist < playerRadius + collectibleRadius) {
            collectibles.splice(index, 1);
            score++;
            speedMultiplier += 0.1;
            scoreEl.innerText = score;
            speedEl.innerText = speedMultiplier.toFixed(1);
            spawnCollectible();

            if (score > 0 && score % 7 === 0) {
                spawnObstacle();
            }
        }
    });

    // Colisão com obstáculos
    obstacles.forEach(obstacle => {
        if (
            player.x > obstacle.x &&
            player.x < obstacle.x + obstacle.width &&
            player.y > obstacle.y &&
            player.y < obstacle.y + obstacle.height
        ) {
            endGame();
        }
    });
}

// --- Funções de Desenho ---
function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#4d94ff';
    ctx.fill();
    ctx.closePath();
}

function drawCollectibles() {
    collectibles.forEach(collectible => {
        ctx.beginPath();
        ctx.arc(collectible.x, collectible.y, collectibleRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
        ctx.closePath();
    });
}

function drawObstacles() {
    ctx.fillStyle = '#ff4d4d';
    obstacles.forEach(obstacle => {
        if (obstacle.shape === 'rect') {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(obstacle.x, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height);
            ctx.fill();
            ctx.closePath();
        }
    });
}

// --- Funções de Jogo ---
function update() {
    // Define a direção atual baseada no índice
    const direction = directionStates[currentDirectionIndex];

    // Move o jogador
    player.x += direction.dx * baseSpeed * speedMultiplier;
    player.y += direction.dy * baseSpeed * speedMultiplier;

    // Colisão com paredes (AGORA DÁ GAME OVER)
    if (
        player.x + playerRadius > canvas.width ||
        player.x - playerRadius < 0 ||
        player.y + playerRadius > canvas.height ||
        player.y - playerRadius < 0
    ) {
        endGame();
    }

    // Move os obstáculos
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.dy;
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
        }
    });
}

function endGame() {
    if (gameOver) return; // Previne que a função rode múltiplas vezes
    gameOver = true;
    
    // Simula uma "explosão"
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(player.x, player.y, playerRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Remove os controles para não interferir na tela final
    document.removeEventListener('keydown', changeDirection);
    document.removeEventListener('mousedown', changeDirection);
    
    cancelAnimationFrame(animationId);

    // Mostra a tela de Fim de Jogo com um pequeno atraso
    setTimeout(() => {
        finalScoreEl.innerText = score;
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

// --- Loop Principal ---
function gameLoop() {
    if (gameOver) return;

    animationId = requestAnimationFrame(gameLoop);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    drawCollectibles();
    drawObstacles();
    
    update();
    checkCollisions();
}

// --- Eventos ---
restartButton.addEventListener('click', init);

// --- Inicia o Jogo ---
init();