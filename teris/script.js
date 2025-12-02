document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const startOverlay = document.getElementById('start-overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalScoreDisplay = document.getElementById('final-score');
    const nextPieceGrid = document.getElementById('next-piece-grid');

    const width = 10;
    const height = 20;
    let squares = [];
    let timerId;
    let score = 0;
    let level = 1;
    let isGameOver = false;
    let isPaused = false;

    // Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
    const colors = ['type-L', 'type-Z', 'type-T', 'type-O', 'type-I'];

    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];
    let nextRandom = 0;

    // Initialize Grid
    function createGrid() {
        for (let i = 0; i < width * height; i++) {
            const square = document.createElement('div');
            square.classList.add('cell');
            grid.appendChild(square);
            squares.push(square);
        }
        // Taken bottom row (invisible barrier)
        for (let i = 0; i < width; i++) {
            const square = document.createElement('div');
            square.classList.add('taken', 'hidden'); // Hidden class to not mess up grid layout visually if we append it
            // Actually, for this logic, we usually append "taken" divs at the end or handle boundary checks.
            // Let's stick to index checking for bottom boundary to keep DOM clean, 
            // OR add a hidden row at the bottom.
            // For simplicity in this "div grid" approach, let's just use boundary checks.
        }
    }

    createGrid();

    // Controls
    function control(e) {
        if (isGameOver || isPaused) return;
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        } else if (e.keyCode === 32) {
            hardDrop();
        }
    }
    document.addEventListener('keyup', control);

    // Hard Drop
    function hardDrop() {
        if (isGameOver || isPaused) return;
        undraw();
        while (!current.some(index => (currentPosition + index + width >= width * height) || squares[currentPosition + index + width].classList.contains('taken'))) {
            currentPosition += width;
        }
        draw();
        freeze();
    }

    // Start Game
    startBtn.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        resetGame();
        draw();
        timerId = setInterval(moveDown, 1000);
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        displayShape();
    });

    restartBtn.addEventListener('click', () => {
        gameOverOverlay.classList.add('hidden');
        resetGame();
        draw();
        timerId = setInterval(moveDown, 1000);
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        displayShape();
    });

    function resetGame() {
        grid.innerHTML = '';
        squares = [];
        createGrid();
        score = 0;
        level = 1;
        scoreDisplay.innerHTML = score;
        levelDisplay.innerHTML = level;
        isGameOver = false;
        isPaused = false;
        clearInterval(timerId);

        random = Math.floor(Math.random() * theTetrominoes.length);
        current = theTetrominoes[random][currentRotation];
        currentPosition = 4;
    }

    // Draw
    function draw() {
        current.forEach(index => {
            if (squares[currentPosition + index]) {
                squares[currentPosition + index].classList.add('filled');
                squares[currentPosition + index].classList.add(colors[random]);
            }
        });
    }

    // Undraw
    function undraw() {
        current.forEach(index => {
            if (squares[currentPosition + index]) {
                squares[currentPosition + index].classList.remove('filled');
                squares[currentPosition + index].classList.remove(colors[random]);
            }
        });
    }

    // Move Down
    function moveDown() {
        if (isGameOver) return;
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze
    function freeze() {
        if (current.some(index => (currentPosition + index + width >= width * height) || squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // Start new tetromino
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // Move Left
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // Move Right
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // Rotate
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        // Check if rotation causes collision
        // (Simplified check - real Tetris has wall kicks)
        if (current.some(index => (currentPosition + index) % width === 0) && current.some(index => (currentPosition + index) % width === width - 1)) {
            // Wall kick attempt (very basic)
            if ((currentPosition + 1) % width < 5) currentPosition += 1;
            else currentPosition -= 1;
        }
        draw();
    }

    // Initialize Mini Grid for Next Piece
    function createMiniGrid() {
        for (let i = 0; i < 16; i++) {
            const square = document.createElement('div');
            square.classList.add('cell');
            nextPieceGrid.appendChild(square);
        }
    }
    createMiniGrid();

    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    // Tetrominoes without rotations for next piece display
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], // L
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // Z
        [1, displayWidth, displayWidth + 1, displayWidth + 2], // T
        [0, 1, displayWidth, displayWidth + 1], // O
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // I
    ];

    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('filled');
            square.classList.remove('type-L', 'type-Z', 'type-T', 'type-O', 'type-I');
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('filled');
            displaySquares[displayIndex + index].classList.add(colors[nextRandom]);
        });
    }

    // Game Over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
            isGameOver = true;
            finalScoreDisplay.innerHTML = score;
            gameOverOverlay.classList.remove('hidden');
        }
    }

    // Score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    createParticles(index); // Add particles
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('filled');
                    squares[index].classList.remove('type-L', 'type-Z', 'type-T', 'type-O', 'type-I');
                    squares[index].style.backgroundColor = ''; // Clear inline styles if any
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    function createParticles(index) {
        const cell = squares[index];
        const rect = cell.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();

        // Calculate relative position within the grid container
        const x = rect.left - gridRect.left + 15; // Center of cell
        const y = rect.top - gridRect.top + 15;

        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Random direction
            const tx = (Math.random() - 0.5) * 100;
            const ty = (Math.random() - 0.5) * 100;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            grid.appendChild(particle);

            setTimeout(() => particle.remove(), 800);
        }
    }
});
