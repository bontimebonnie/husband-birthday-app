// ========================================
// PIXEL-ART BIRTHDAY APP - JAVASCRIPT
// Clean & Optimized Code
// ========================================

'use strict';

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    userName: '',
    blowAttempt: 0, // 0 = not started, 1 = first blow, 2 = second blow, 3 = final blow
    totalCandles: 0,
    litCandles: [],
    audioContext: null,
    analyser: null,
    microphone: null,
    microphoneAllowed: false,
    isListeningForBlow: false
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    // Stages
    nameInputStage: document.getElementById('nameInputStage'),
    birthdayStage: document.getElementById('birthdayStage'),

    // Forms & Inputs
    nameForm: document.getElementById('nameForm'),
    nameInput: document.getElementById('nameInput'),

    // Buttons
    letsGoBtn: document.getElementById('letsGoBtn'),
    closeEyesOkBtn: document.getElementById('closeEyesOkBtn'),
    instructionOkayBtn: document.getElementById('instructionOkayBtn'),
    firstBlowOkBtn: document.getElementById('firstBlowOkBtn'),
    secondBlowOkBtn: document.getElementById('secondBlowOkBtn'),
    tapFallbackBtn: document.getElementById('tapFallbackBtn'),
    enableAudioBtn: document.getElementById('enableAudioBtn'),

    // Modals & Panels
    closeEyesModal: document.getElementById('closeEyesModal'),
    instructionPanel: document.getElementById('instructionPanel'),
    instructionText: document.getElementById('instructionText'),
    blowIndicatorSmall: document.getElementById('blowIndicatorSmall'),
    firstBlowModal: document.getElementById('firstBlowModal'),
    secondBlowModal: document.getElementById('secondBlowModal'),
    funMessageModal: document.getElementById('funMessageModal'),
    funMessageText: document.getElementById('funMessageText'),
    funMessageOkBtn: document.getElementById('funMessageOkBtn'),
    congratsModal: document.getElementById('congratsModal'),
    birthdayCardImage: document.getElementById('birthdayCardImage'),
    enlargedCardModal: document.getElementById('enlargedCardModal'),
    closeEnlargedCardBtn: document.getElementById('closeEnlargedCardBtn'),
    audioOverlay: document.getElementById('audioOverlay'),

    // Dynamic Content
    candleRing: document.getElementById('candleRing'),

    // Media
    birthdayMusic: document.getElementById('birthdayMusic'),
    confettiCanvas: document.getElementById('confettiCanvas')
};

// ========================================
// CONSTANTS
// ========================================

const CONFIG = {
    TRANSITION_DELAY: 600,
    BLOW_THRESHOLD: 50,
    BLOW_COOLDOWN: 1000,
    CONFETTI_COUNT: 150,
    CONFETTI_COLORS: ['#FFB6C1', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'],
    TOTAL_CANDLES: 35
};

const FUN_MESSAGES = [
    "Best wife ever!",
    "This banner is amazing!",
    "I'm loved 😌",
    "She made this?? Wow!"
];

// ========================================
// STAGE 1: NAME INPUT
// ========================================

elements.nameForm.addEventListener('submit', handleNameSubmit);

function handleNameSubmit(e) {
    e.preventDefault();
    state.userName = elements.nameInput.value.trim();

    if (state.userName) {
        transitionToStage(elements.nameInputStage, elements.birthdayStage, () => {
            initializeCake();
            attemptAutoplay();
        });
    }
}

// ========================================
// STAGE TRANSITIONS
// ========================================

function transitionToStage(fromStage, toStage, callback) {
    fromStage.classList.remove('active');

    setTimeout(() => {
        toStage.classList.add('active');
        if (callback) callback();
    }, CONFIG.TRANSITION_DELAY);
}

// ========================================
// AUDIO MANAGEMENT
// ========================================

function attemptAutoplay() {
    const playPromise = elements.birthdayMusic.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => console.log('Audio autoplaying'))
            .catch(() => showAudioOverlay());
    }
}

function showAudioOverlay() {
    console.log('Autoplay blocked, showing audio overlay');
    elements.audioOverlay.classList.remove('hidden');
    elements.audioOverlay.classList.add('active');
}

elements.enableAudioBtn.addEventListener('click', () => {
    elements.birthdayMusic.play();
    elements.audioOverlay.classList.remove('active');
    setTimeout(() => elements.audioOverlay.classList.add('hidden'), 300);
});

// ========================================
// STAGE 2: CAKE INITIALIZATION
// ========================================

function initializeCake() {
    state.totalCandles = CONFIG.TOTAL_CANDLES;

    // Generate candles with unique IDs
    elements.candleRing.innerHTML = '';
    state.litCandles = [];

    for (let i = 0; i < state.totalCandles; i++) {
        const candle = createCandleElement(i + 1);
        elements.candleRing.appendChild(candle);
        state.litCandles.push(true);
    }
}

function createCandleElement(id) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.id = `candle-${id}`;

    // Calculate angle for this candle (360 degrees / 35 candles)
    const angle = (360 / CONFIG.TOTAL_CANDLES) * (id - 1);
    candle.style.setProperty('--angle', `${angle}deg`);

    candle.innerHTML = `
        <div class="candle-flame"></div>
        <div class="candle-stick"></div>
    `;
    return candle;
}

// ========================================
// STAGE 3: WISH MODAL & BLOWING SEQUENCE
// ========================================

const INSTRUCTION_MESSAGES = [
    "Give it a try! Blow softly and see which candles listen to you.",
    "You've got this. Blow again and see the magic happen!",
    "Final blow! This is the moment!"
];

elements.letsGoBtn.addEventListener('click', handleLetsGo);
elements.closeEyesOkBtn.addEventListener('click', handleCloseEyesOk);
elements.instructionOkayBtn.addEventListener('click', handleInstructionOkay);
elements.firstBlowOkBtn.addEventListener('click', handleFirstBlowOk);
elements.secondBlowOkBtn.addEventListener('click', handleSecondBlowOk);
elements.funMessageOkBtn.addEventListener('click', handleFunMessageOk);
elements.birthdayCardImage.addEventListener('click', showEnlargedCard);
elements.closeEnlargedCardBtn.addEventListener('click', closeEnlargedCard);

function handleLetsGo() {
    showModal(elements.closeEyesModal);
}

function handleCloseEyesOk() {
    hideModal(elements.closeEyesModal, () => {
        state.blowAttempt = 1;
        showInstructionPanel(INSTRUCTION_MESSAGES[0]);
        requestMicrophoneAccess();
    });
}

function showInstructionPanel(message) {
    elements.instructionText.textContent = message;
    elements.instructionPanel.classList.remove('hidden');
    elements.instructionPanel.classList.add('active');
}

function hideInstructionPanel(callback) {
    elements.instructionPanel.classList.remove('active');
    setTimeout(() => {
        elements.instructionPanel.classList.add('hidden');
        if (callback) callback();
    }, 300);
}

function handleInstructionOkay() {
    hideInstructionPanel(() => {
        // Hide Let's go button
        elements.letsGoBtn.style.display = 'none';

        // Show blow indicator
        elements.blowIndicatorSmall.classList.remove('hidden');
        elements.blowIndicatorSmall.classList.add('active');

        // Start listening for blows
        state.isListeningForBlow = true;

        // Show fallback button if mic not allowed (check after a small delay to ensure mic request completed)
        setTimeout(() => {
            if (!state.microphoneAllowed) {
                elements.tapFallbackBtn.classList.remove('hidden');
            }
        }, 500);
    });
}

function handleFirstBlowOk() {
    hideModal(elements.firstBlowModal, () => {
        state.blowAttempt = 2;
        // Go straight to blowing - no instruction panel
        elements.blowIndicatorSmall.classList.remove('hidden');
        elements.blowIndicatorSmall.classList.add('active');
        state.isListeningForBlow = true;

        // Show fallback button if mic not allowed
        if (!state.microphoneAllowed) {
            elements.tapFallbackBtn.classList.remove('hidden');
        }
    });
}

function handleSecondBlowOk() {
    hideModal(elements.secondBlowModal, () => {
        state.blowAttempt = 3;
        // Go straight to blowing - no instruction panel
        elements.blowIndicatorSmall.classList.remove('hidden');
        elements.blowIndicatorSmall.classList.add('active');
        state.isListeningForBlow = true;

        // Show fallback button if mic not allowed
        if (!state.microphoneAllowed) {
            elements.tapFallbackBtn.classList.remove('hidden');
        }
    });
}

function showEnlargedCard() {
    showModal(elements.enlargedCardModal);
}

function closeEnlargedCard() {
    hideModal(elements.enlargedCardModal);
}

function handleFunMessageOk() {
    hideModal(elements.funMessageModal, () => {
        showModal(elements.congratsModal);
    });
}

// ========================================
// STAGE 4: MICROPHONE ACCESS
// ========================================

// ========================================
// MICROPHONE DETECTION
// ========================================

async function requestMicrophoneAccess() {
    // Only request once
    if (state.audioContext) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.microphoneAllowed = true;
        setupAudioAnalyser(stream);
    } catch (error) {
        console.log('Microphone access denied:', error);
        state.microphoneAllowed = false;
    }
}

function setupAudioAnalyser(stream) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    state.analyser = state.audioContext.createAnalyser();
    state.microphone = state.audioContext.createMediaStreamSource(stream);
    state.microphone.connect(state.analyser);
    state.analyser.fftSize = 256;

    detectBlow();
}

function detectBlow() {
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function checkVolume() {
        // Only detect if we're listening
        if (!state.isListeningForBlow || state.blowAttempt === 0 || state.blowAttempt > 3) {
            requestAnimationFrame(checkVolume);
            return;
        }

        state.analyser.getByteFrequencyData(dataArray);

        const average = calculateAverage(dataArray);

        if (average > CONFIG.BLOW_THRESHOLD) {
            handleBlow();
            setTimeout(() => requestAnimationFrame(checkVolume), CONFIG.BLOW_COOLDOWN);
        } else {
            requestAnimationFrame(checkVolume);
        }
    }

    checkVolume();
}

function calculateAverage(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

// ========================================
// BLOW HANDLER
// ========================================

elements.tapFallbackBtn.addEventListener('click', handleBlow);

function handleBlow() {
    if (!state.isListeningForBlow || state.blowAttempt === 0 || state.blowAttempt > 3) return;

    // Stop listening temporarily
    state.isListeningForBlow = false;

    // Hide blow indicator
    elements.blowIndicatorSmall.classList.remove('active');
    elements.blowIndicatorSmall.classList.add('hidden');

    // Hide fallback button
    elements.tapFallbackBtn.classList.add('hidden');

    // Progressive candle blowout
    const blowoutMap = { 1: 0.3, 2: 0.7, 3: 1.0 };
    blowOutCandles(blowoutMap[state.blowAttempt]);

    // Show appropriate feedback modal
    setTimeout(() => {
        if (state.blowAttempt === 1) {
            showModal(elements.firstBlowModal);
        } else if (state.blowAttempt === 2) {
            showModal(elements.secondBlowModal);
        } else if (state.blowAttempt === 3) {
            finishBlowing();
        }
    }, 800);
}

function blowOutCandles(percentage) {
    const targetCount = Math.floor(state.totalCandles * percentage);
    const candles = document.querySelectorAll('.candle-flame');

    const currentlyLit = state.litCandles.filter(lit => lit).length;
    const toBlowOut = targetCount - (state.totalCandles - currentlyLit);

    // Get indices of lit candles
    const litIndices = [];
    for (let i = 0; i < state.litCandles.length; i++) {
        if (state.litCandles[i]) {
            litIndices.push(i);
        }
    }

    // Randomly shuffle lit candles and blow out the required number
    shuffleArray(litIndices);
    for (let i = 0; i < toBlowOut && i < litIndices.length; i++) {
        const index = litIndices[i];
        state.litCandles[index] = false;
        candles[index].classList.add('out');
    }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function finishBlowing() {
    startConfetti();

    // Pick a random fun message
    const randomMessage = FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)];
    elements.funMessageText.textContent = randomMessage;

    setTimeout(() => {
        showModal(elements.funMessageModal);
    }, 500);
}

function cleanupMicrophone() {
    if (state.microphone) {
        state.microphone.disconnect();
    }
    if (state.audioContext) {
        state.audioContext.close();
    }
}


// ========================================
// MODAL UTILITIES
// ========================================

function showModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
}

function hideModal(modal, callback) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
        if (callback) callback();
    }, 300);
}

// ========================================
// CONFETTI ANIMATION
// ========================================

function startConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];

    class ConfettiPiece {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.w = Math.random() * 10 + 5;
            this.h = Math.random() * 5 + 5;
            this.color = CONFIG.CONFETTI_COLORS[Math.floor(Math.random() * CONFIG.CONFETTI_COLORS.length)];
            this.speedY = Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;

            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            ctx.restore();
        }
    }

    // Initialize confetti pieces
    for (let i = 0; i < CONFIG.CONFETTI_COUNT; i++) {
        confettiPieces.push(new ConfettiPiece());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiPieces.forEach(piece => {
            piece.update();
            piece.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// ========================================
// RESPONSIVE CANVAS RESIZE
// ========================================

window.addEventListener('resize', handleResize);

function handleResize() {
    if (elements.confettiCanvas.width > 0) {
        elements.confettiCanvas.width = window.innerWidth;
        elements.confettiCanvas.height = window.innerHeight;
    }
}
