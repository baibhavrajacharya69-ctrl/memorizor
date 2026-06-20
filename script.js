const pads = document.querySelectorAll('.pad');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('start-btn');
const colors = ['green', 'red', 'yellow', 'blue', 'orange', 'purple'];

let sequence = [];
let userSequence = [];
let level = 0;
let highScore = localStorage.getItem('simonHighScore') || 0;
let acceptingInput = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(color) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const freqs = { 
        green: 261.6, red: 329.6, yellow: 392.0, 
        blue: 523.2, orange: 587.3, purple: 659.3 
    };
    
    osc.frequency.value = freqs[color];
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
    osc.stop(audioCtx.currentTime + 0.4);
}

function flash(color) {
    const pad = document.getElementById(color);
    playSound(color);
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 300);
}

async function playSequence() {
    acceptingInput = false;
    statusDisplay.innerText = "Watch...";
    for (const color of sequence) {
        await new Promise(resolve => setTimeout(resolve, 700));
        flash(color);
    }
    acceptingInput = true;
    statusDisplay.innerText = `Level ${level} - Your Turn!`;
}

function nextSequence() {
    userSequence = [];
    level++;
    if (level > highScore) {
        highScore = level;
        localStorage.setItem('simonHighScore', highScore);
    }
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    playSequence();
}

function checkAnswer(index) {
    if (userSequence[index] === sequence[index]) {
        if (userSequence.length === sequence.length) {
            acceptingInput = false;
            setTimeout(nextSequence, 1000);
        }
    } else {
        statusDisplay.innerText = "Oops! Game Over!";
        sequence = [];
        level = 0;
        acceptingInput = false;
        startBtn.style.display = "inline-block";
        startBtn.innerText = "Play Again";
    }
}

pads.forEach(pad => {
    pad.addEventListener('click', () => {
        if (!acceptingInput) return;
        const color = pad.getAttribute('data-color');
        userSequence.push(color);
        flash(color);
        checkAnswer(userSequence.length - 1);
    });
});

startBtn.addEventListener('click', () => {
    startBtn.style.display = "none";
    nextSequence();
});