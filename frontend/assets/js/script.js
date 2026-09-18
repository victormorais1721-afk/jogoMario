const startButton = document.querySelector('.start-button');
const restartButton = document.querySelector('.restart-button');
const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const lakitu = document.querySelector('.lakitu');
const gameBoard = document.querySelector('.game-board');
const scoreElement = document.getElementById('score-value');
const highScoreElement = document.getElementById('high-score-value');
const charBtns = document.querySelectorAll('.char-btn');
const charSelectContainer = document.querySelector('.character-select');
const gameOverText = document.querySelector('.game-over-text');
const mainMusic = new Audio('./assets/media/mario-music.mp3');
const gameOverMusic = new Audio('./assets/media/mario-gameover.mp3');
const jumpSound = new Audio('./assets/media/mario-jump.wav');

mainMusic.loop = true;

let gameStarted = false;
let selectedChar = 'mario';
let score = 0;
let highScore = Number(localStorage.getItem('marioHighScore')) || 0;
let scoreInterval, loop;
let pipeSpeed = 2.5; 
let nextPipeSpeed = 2.5;
let lakituPausedForSpacing = false;

if (highScoreElement) highScoreElement.innerText = highScore;

charBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        charBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedChar = btn.dataset.char;
        if (selectedChar === 'wario') {
            mario.src = './assets/images/wario.gif';
            mario.classList.add('is-wario');
        } else {
            mario.src = './assets/images/mario.gif';
            mario.classList.remove('is-wario');
        }       
    });
});

const jump = (event) => {
    if (!gameStarted) return;
    if (event.code === 'Space' && !mario.classList.contains('jump')) {
        jumpSound.currentTime = 0;
        jumpSound.play();
        mario.classList.add('jump');
        setTimeout(() => {
            mario.classList.remove('jump');
        }, 600);
    }
    if (event.code === 'ArrowDown') {
    mario.classList.add('crouch');
    }
};

pipe.addEventListener('animationiteration', () => {
    pipeSpeed = nextPipeSpeed;
    pipe.classList.remove('animate-pipe');
    void pipe.offsetWidth;
    pipe.style.setProperty('--pipe-speed', `${pipeSpeed}s`);
    pipe.classList.add('animate-pipe');
});

lakitu.addEventListener('animationiteration', () => {
    let randomDuration = 4 + Math.random() * 2;
    const pipeCycleProgress = (Date.now() / (pipeSpeed * 1000)) % 1;
    if (pipeCycleProgress > 0.4 && pipeCycleProgress < 0.6) {
        randomDuration += 1.5;
    }    
    lakitu.classList.remove('animate-lakitu');
    void lakitu.offsetWidth;
    lakitu.style.setProperty('--lakitu-speed', `${randomDuration}s`);
    lakitu.classList.add('animate-lakitu');
});

    const stopCrouch = (event) => {
    if (event.code === 'ArrowDown') {
    mario.classList.remove('crouch');
    }
};

const startGame = () => {
gameStarted = true;
score = 0;
if (scoreElement) scoreElement.innerText = score;

pipeSpeed = 2.5;
pipe.style.setProperty('--pipe-speed', `${pipeSpeed}s`);

startButton.style.display = 'none';
charSelectContainer.style.display = 'none';
restartButton.style.display = 'none';
gameOverText.classList.remove('show');

mainMusic.currentTime = 0;
mainMusic.play();

pipe.classList.add('animate-pipe');
lakitu.classList.add('animate-lakitu');

scoreInterval = setInterval(() => {
    score++;

    if (scoreElement) {
        scoreElement.innerText = score;
    }

    if (score % 100 === 0 && pipeSpeed > 0.8) {
        nextPipeSpeed -= 0.1;
        
    }

    if (Math.floor(score / 500) % 2 === 1) {
        gameBoard.classList.add('night');
    } else {
        gameBoard.classList.remove('night');
    }
}, 100);

loop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const lakituPosition = lakitu.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).getPropertyValue('bottom').replace('px', '');
    const isCrouching = mario.classList.contains('crouch');

    const minGap = 192;
if (Math.abs(pipePosition - lakituPosition) < minGap && pipePosition < 400 && lakituPosition < 400) {
    if (!lakituPausedForSpacing) {
        lakitu.style.animationPlayState = 'paused';
        lakituPausedForSpacing = true;
        setTimeout(() => {
            lakitu.style.animationPlayState = 'running';
            lakituPausedForSpacing = false;
        }, 600);
    }
} else if (lakituPausedForSpacing) {
    lakitu.style.animationPlayState = 'running';
    lakituPausedForSpacing = false;
}

    if (pipePosition <= 110 && pipePosition > 40 && marioPosition < 50) {
        endGame(pipePosition, lakituPosition, marioPosition);
}

    if (lakituPosition <= 110 && lakituPosition > 40) {
    if (!isCrouching && marioPosition > 60 && marioPosition < 160) {
        endGame(pipePosition, lakituPosition, marioPosition);
    }
}
}, 10);
};

const endGame = (pipePos, lakituPos, marioBottom) => {
    mainMusic.pause();
    gameOverMusic.play();

    mario.classList.remove('jump', 'crouch');

    pipe.style.animation = 'none';
    pipe.style.left = `${pipePos}px`;

    lakitu.style.animation = 'none';
    lakitu.style.left = `${lakituPos}px`;

    mario.style.animation = 'none';
    mario.style.bottom = `${marioBottom}px`;

    mario.classList.add('dead');

    if (selectedChar === 'wario') {
        mario.src = './assets/images/wario-game-over.png';
            } else {
        mario.src = './assets/images/game-over.png';
    }
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('marioHighScore', score);
        if (highScoreElement) highScoreElement.innerText = highScore;
    }
    gameOverText.classList.add('show');
    restartButton.style.display = 'block';
    
        clearInterval(loop);
        clearInterval(scoreInterval);
};


startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => location.reload());
document.addEventListener('keydown', jump);
document.addEventListener('keydown', stopCrouch);