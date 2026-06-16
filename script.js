// ============================================
// CYBER RETRO ARCADE - GAME ENGINE
// ============================================

const ArcadeManager = {
    currentGame: null,
    gameActive: false,
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    gamesPlayed: localStorage.getItem('gamesPlayed') || 0,
    timePlayed: localStorage.getItem('timePlayed') || 0,
    sessionStartTime: null,
    audioEnabled: true,
    gameInstances: {},
    keyStates: {},

    init() {
        this.updateStats();
        this.attachEventListeners();
        this.setupKeyboardControls();
        this.setupTouchControls();
        console.log('🎮 Cyber Arcade initialized!');
    },

    attachEventListeners() {
        // Game card click handlers
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.game;
                if (gameType !== 'coming-soon') {
                    this.startGame(gameType);
                }
            });
        });

        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameType = btn.closest('.game-card').dataset.game;
                if (gameType !== 'coming-soon') {
                    this.startGame(gameType);
                }
            });
        });

        // Control buttons
        document.getElementById('btn-back-menu')?.addEventListener('click', () => this.backToMenu());
        document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('btn-select')?.addEventListener('click', () => console.log('SELECT pressed'));
        document.getElementById('btn-start')?.addEventListener('click', () => this.pauseGame());
    },

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.keyStates[e.key.toLowerCase()] = true;

            if (this.gameActive && this.gameInstances[this.currentGame]) {
                this.gameInstances[this.currentGame].handleKeyDown(e);
            }

            // Global shortcuts
            if (e.key.toLowerCase() === 'm') this.toggleAudio();
            if (e.key.toLowerCase() === 'p') this.pauseGame();
            if (e.key === 'Escape') this.backToMenu();
        });

        document.addEventListener('keyup', (e) => {
            this.keyStates[e.key.toLowerCase()] = false;
            if (this.gameActive && this.gameInstances[this.currentGame]) {
                this.gameInstances[this.currentGame].handleKeyUp(e);
            }
        });
    },

    setupTouchControls() {
        const dpadUp = document.getElementById('dpad-up');
        const dpadDown = document.getElementById('dpad-down');
        const dpadLeft = document.getElementById('dpad-left');
        const dpadRight = document.getElementById('dpad-right');

        [dpadUp, dpadDown, dpadLeft, dpadRight].forEach(btn => {
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.style.background = 'var(--cyan)';
                const direction = btn.id.replace('dpad-', '');
                if (this.gameActive && this.gameInstances[this.currentGame]) {
                    this.gameInstances[this.currentGame].handleDpadInput(direction);
                }
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.background = 'rgba(0, 212, 255, 0.1)';
            });
        });
    },

    startGame(gameType) {
        this.currentGame = gameType;
        this.gameActive = true;
        this.score = 0;
        this.sessionStartTime = Date.now();
        this.gamesPlayed++;

        const gameMenu = document.getElementById('game-menu');
        const gameView = document.getElementById('game-view');
        gameMenu.style.display = 'none';
        gameView.style.display = 'flex';

        document.getElementById('current-game-name').textContent = this.getGameTitle(gameType);
        document.getElementById('game-status').textContent = 'PLAYING';

        gameView.innerHTML = '';

        switch (gameType) {
            case 'snake':
                this.gameInstances.snake = new CyberSnakeGame();
                this.gameInstances.snake.init(gameView);
                break;
            case 'space-invaders':
                this.gameInstances['space-invaders'] = new SpaceInvadersGame();
                this.gameInstances['space-invaders'].init(gameView);
                break;
            case 'brick-breaker':
                this.gameInstances['brick-breaker'] = new BrickBreakerGame();
                this.gameInstances['brick-breaker'].init(gameView);
                break;
        }

        localStorage.setItem('gamesPlayed', this.gamesPlayed);
        this.updateStats();
    },

    updateScore(points) {
        this.score += points;
        document.getElementById('current-game-score').textContent = `Score: ${this.score}`;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        this.updateStats();
    },

    backToMenu() {
        if (!this.gameActive) return;
        this.gameActive = false;
        const gameMenu = document.getElementById('game-menu');
        const gameView = document.getElementById('game-view');
        gameMenu.style.display = 'flex';
        gameView.style.display = 'none';
        document.getElementById('game-status').textContent = 'READY';

        if (this.sessionStartTime) {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            this.timePlayed = (parseInt(this.timePlayed) || 0) + elapsed;
            localStorage.setItem('timePlayed', this.timePlayed);
        }
    },

    pauseGame() {
        if (!this.gameActive) return;
        document.getElementById('game-status').textContent = this.gameActive ? 'PAUSED' : 'PLAYING';
    },

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        console.log(`🔊 Audio: ${this.audioEnabled ? 'ON' : 'OFF'}`);
    },

    toggleFullscreen() {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    },

    getGameTitle(gameType) {
        const titles = {
            snake: '🐍 CYBER SNAKE',
            'space-invaders': '👾 SPACE INVADERS',
            'brick-breaker': '🧱 BRICK BREAKER'
        };
        return titles[gameType] || 'UNKNOWN GAME';
    },

    updateStats() {
        document.getElementById('high-score').textContent = this.highScore;
        document.getElementById('games-played').textContent = this.gamesPlayed;
        document.getElementById('time-played').textContent = `${Math.floor(this.timePlayed / 60)}h`;
    }
};

// ============================================
// CYBER SNAKE GAME
// ============================================
class CyberSnakeGame {
    constructor() {
        this.gridSize = 20;
        this.tileCount = 15;
        this.snake = [{ x: 7, y: 7 }];
        this.food = this.generateFood();
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = true;
        this.speed = 8;
    }

    init(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
        this.gameLoop();
    }

    generateFood() {
        let food;
        let collision = true;
        while (collision) {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            collision = this.snake.some(s => s.x === food.x && s.y === food.y);
        }
        return food;
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') this.nextDirection = { x: 0, y: -1 };
        if (key === 'arrowdown' || key === 's') this.nextDirection = { x: 0, y: 1 };
        if (key === 'arrowleft' || key === 'a') this.nextDirection = { x: -1, y: 0 };
        if (key === 'arrowright' || key === 'd') this.nextDirection = { x: 1, y: 0 };
    }

    handleKeyUp(e) { }

    handleDpadInput(direction) {
        const dirMap = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        this.nextDirection = dirMap[direction] || this.nextDirection;
    }

    update() {
        this.direction = this.nextDirection;
        const head = this.snake[0];
        const newHead = {
            x: (head.x + this.direction.x + this.tileCount) % this.tileCount,
            y: (head.y + this.direction.y + this.tileCount) % this.tileCount
        };

        if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.gameRunning = false;
            ArcadeManager.backToMenu();
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            ArcadeManager.updateScore(10);
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(13, 14, 21, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            const pos = (i / this.tileCount) * this.canvas.width;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }

        // Snake
        this.snake.forEach((segment, index) => {
            const x = (segment.x / this.tileCount) * this.canvas.width;
            const y = (segment.y / this.tileCount) * this.canvas.height;
            const size = (this.gridSize / this.tileCount) * this.canvas.width;

            this.ctx.fillStyle = index === 0 ? '#00d4ff' : 'rgba(0, 212, 255, 0.7)';
            this.ctx.shadowColor = '#00d4ff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x, y, size, size);
            this.ctx.shadowBlur = 0;
        });

        // Food
        const fx = (this.food.x / this.tileCount) * this.canvas.width;
        const fy = (this.food.y / this.tileCount) * this.canvas.height;
        const fsize = (this.gridSize / this.tileCount) * this.canvas.width;
        this.ctx.fillStyle = '#ff006e';
        this.ctx.shadowColor = '#ff006e';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(fx + fsize / 2, fy + fsize / 2, fsize / 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    gameLoop = () => {
        if (!this.gameRunning) return;
        this.update();
        this.draw();
        setTimeout(this.gameLoop, 1000 / this.speed);
    }
}

// ============================================
// SPACE INVADERS GAME
// ============================================
class SpaceInvadersGame {
    constructor() {
        this.gameRunning = true;
        this.score = 0;
        this.player = { x: 175, y: 350, width: 40, height: 30, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.spawnEnemies(3);
    }

    init(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
        this.gameLoop();
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            this.enemies.push({
                x: Math.random() * 360,
                y: 20 + Math.random() * 50,
                width: 30,
                height: 25,
                speed: 1 + Math.random() * 1.5
            });
        }
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.player.x = Math.max(0, this.player.x - this.player.speed * 5);
        if (e.key === 'ArrowRight' || e.key === 'd') this.player.x = Math.min(400 - this.player.width, this.player.x + this.player.speed * 5);
        if (e.key === ' ') this.shoot();
    }

    handleKeyUp(e) { }

    handleDpadInput(direction) {
        if (direction === 'left') this.player.x = Math.max(0, this.player.x - this.player.speed * 5);
        if (direction === 'right') this.player.x = Math.min(400 - this.player.width, this.player.x + this.player.speed * 5);
    }

    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }

    update() {
        this.bullets.forEach((bullet, idx) => {
            bullet.y -= bullet.speed;
            if (bullet.y < 0) this.bullets.splice(idx, 1);
        });

        this.enemies.forEach((enemy, idx) => {
            enemy.x += enemy.speed;
            if (enemy.x <= 0 || enemy.x + enemy.width >= 400) {
                enemy.speed *= -1;
            }
            if (Math.random() < 0.01) {
                this.enemyBullets.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height,
                    width: 3,
                    height: 8,
                    speed: 4
                });
            }
        });

        this.enemyBullets.forEach((bullet, idx) => {
            bullet.y += bullet.speed;
            if (bullet.y > 400) this.enemyBullets.splice(idx, 1);
            if (this.checkCollision(bullet, this.player)) {
                this.gameRunning = false;
                ArcadeManager.backToMenu();
            }
        });

        this.bullets.forEach((bullet, bIdx) => {
            this.enemies.forEach((enemy, eIdx) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bIdx, 1);
                    this.enemies.splice(eIdx, 1);
                    this.score += 10;
                    ArcadeManager.updateScore(10);
                    if (this.enemies.length === 0) this.spawnEnemies(3);
                }
            });
        });
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    draw() {
        this.ctx.fillStyle = 'rgba(13, 14, 21, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Player
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Bullets
        this.ctx.fillStyle = '#39ff14';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Enemies
        this.ctx.fillStyle = '#ff006e';
        this.ctx.shadowColor = '#ff006e';
        this.ctx.shadowBlur = 10;
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });

        // Enemy Bullets
        this.ctx.fillStyle = '#FFD700';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        this.ctx.shadowBlur = 0;
    }

    gameLoop = () => {
        if (!this.gameRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

// ============================================
// BRICK BREAKER GAME
// ============================================
class BrickBreakerGame {
    constructor() {
        this.gameRunning = true;
        this.score = 0;
        this.paddle = { x: 175, y: 370, width: 60, height: 12, speed: 6 };
        this.ball = { x: 200, y: 350, radius: 5, vx: 3, vy: -4, speed: 4 };
        this.bricks = this.generateBricks();
        this.lives = 3;
        this.paddleMovement = { left: false, right: false };
    }

    init(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
        this.gameLoop();
    }

    generateBricks() {
        const bricks = [];
        const rows = 4;
        const cols = 5;
        const brickWidth = 70;
        const brickHeight = 15;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                bricks.push({
                    x: 15 + c * (brickWidth + 5),
                    y: 30 + r * (brickHeight + 5),
                    width: brickWidth,
                    height: brickHeight,
                    active: true
                });
            }
        }
        return bricks;
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.paddleMovement.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') this.paddleMovement.right = true;
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.paddleMovement.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd') this.paddleMovement.right = false;
    }

    handleDpadInput(direction) {
        if (direction === 'left') this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
        if (direction === 'right') this.paddle.x = Math.min(400 - this.paddle.width, this.paddle.x + this.paddle.speed);
    }

    update() {
        if (this.paddleMovement.left) this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
        if (this.paddleMovement.right) this.paddle.x = Math.min(400 - this.paddle.width, this.paddle.x + this.paddle.speed);

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > 400) this.ball.vx *= -1;
        if (this.ball.y - this.ball.radius < 0) this.ball.vy *= -1;

        if (this.ball.y + this.ball.radius > 400) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameRunning = false;
                ArcadeManager.backToMenu();
            } else {
                this.ball = { x: 200, y: 350, radius: 5, vx: 3, vy: -4 };
            }
        }

        if (this.checkCollision(this.ball, this.paddle)) this.ball.vy *= -1;

        this.bricks.forEach(brick => {
            if (brick.active && this.checkBrickCollision(this.ball, brick)) {
                brick.active = false;
                this.ball.vy *= -1;
                this.score += 5;
                ArcadeManager.updateScore(5);
            }
        });

        if (this.bricks.every(b => !b.active)) {
            this.bricks = this.generateBricks();
        }
    }

    checkCollision(ball, paddle) {
        return ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + ball.radius > paddle.y && ball.y < paddle.y + paddle.height;
    }

    checkBrickCollision(ball, brick) {
        return ball.x + ball.radius > brick.x && ball.x - ball.radius < brick.x + brick.width && ball.y + ball.radius > brick.y && ball.y - ball.radius < brick.y + brick.height;
    }

    draw() {
        this.ctx.fillStyle = 'rgba(13, 14, 21, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Paddle
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Ball
        this.ctx.fillStyle = '#39ff14';
        this.ctx.shadowColor = '#39ff14';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Bricks
        this.ctx.fillStyle = '#ff006e';
        this.ctx.shadowColor = '#ff006e';
        this.bricks.forEach(brick => {
            if (brick.active) {
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        });

        this.ctx.shadowBlur = 0;

        // Lives display
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 20);
    }

    gameLoop = () => {
        if (!this.gameRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

// ============================================
// INITIALIZE ON LOAD
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    ArcadeManager.init();
});
