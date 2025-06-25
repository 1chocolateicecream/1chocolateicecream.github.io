// --- Файл: js/choosy.js (С WEB AUDIO API ДЛЯ БАРАБАНА) ---

// --- ШАГ 1: ЭЛЕМЕНТЫ ---
const option1Input = document.getElementById('option1');
const option2Input = document.getElementById('option2');
const decideBtn = document.getElementById('decide-btn');
const ruiSaysParagraph = document.getElementById('rui-says');
const ruiGif = document.getElementById('rui-gif');
const overlay = document.getElementById('overlay');
const effectsToggleBtn = document.getElementById('effects-toggle');

// --- ШАГ 2: ПЕРЕМЕННЫЕ ---
let fancyEffectsEnabled = false;

const gifIdle = '/assets/gifs/idle-speed.gif';
const gifSurprise = '/assets/gifs/surprise-speed.gif';
const gifLaugh = '/assets/gifs/laugh-speed.gif';
const gifThinking = '/assets/gifs/thinking-speed.gif';
const imgEffectsOn = 'assets/button-images/rui_sound-on.PNG';
const imgEffectsOff = 'assets/button-images/rui_sound-off.PNG';

const ruiPhrases = [
    "хммм… будь я на твоем месте, я бы выбрал «{choice}».",
    "тебе стоит выбрать «{choice}»; дружеский совет, фуфу~",
    "без всяких сомнений, мой выбор падает на «{choice}»!",
    "я думаю, что «{choice}» будет самым интересным вариантом!",
    "такой сложный выбор... но, пожалуй, я остановлюсь на «{choice}».",
    "вот это выбор! но я бы сказал, что «{choice}» — это то, что тебе нужно."
];

const afkPhrases = [
    "ты еще здесь? я все еще жду!",
    "кажется, я остался совсем один... хех.", // СНОВА ЛОЛ :PPPPPPPP ржу
    "может, выберем что-нибудь еще?",
    "я не против подождать, но ты ведь скоро вернешься?",
    "еще думаешь? я могу подождать!",
    "я тут, если что! не стесняйся, фуфу~"
];

let initialPhrase = 'жду твоего сигнала, фуфу~';
ruiSaysParagraph.textContent = initialPhrase;


// --- ШАГ 3: ПЕРЕКЛЮЧАТЕЛЬ ЭФФЕКТОВ ---
effectsToggleBtn.addEventListener('click', () => {
    fancyEffectsEnabled = !fancyEffectsEnabled;

    effectsToggleBtn.src = fancyEffectsEnabled ? imgEffectsOn : imgEffectsOff;
    console.log(`Эффекты ${fancyEffectsEnabled ? 'включены' : 'выключены'}!`);

    if (!fancyEffectsEnabled) {
        ruiGif.src = gifIdle;
    }
});


// --- ШАГ 4: РЕАКЦИЯ НА НАВЕДЕНИЕ ---
let hoverTimer;
let isHovered = false;
let justClicked = false;

function handleRuiHoverStart() {
    if (!fancyEffectsEnabled || isHovered || justClicked) return;

    isHovered = true;

    hoverTimer = setTimeout(() => {
        if (!justClicked && fancyEffectsEnabled) {
            ruiGif.src = gifLaugh;
            setTimeout(() => {
                if (fancyEffectsEnabled) ruiGif.src = gifIdle;
            }, 2000);
        }
    }, 1000);
}

function handleRuiHoverEnd() {
    clearTimeout(hoverTimer);
    isHovered = false;
}

// Поддержка и мыши, и пальца!
ruiGif.addEventListener('mouseenter', handleRuiHoverStart);
ruiGif.addEventListener('mouseleave', handleRuiHoverEnd);
ruiGif.addEventListener('touchstart', handleRuiHoverStart);
ruiGif.addEventListener('touchend', handleRuiHoverEnd);

ruiGif.addEventListener('click', () => {
    if (!fancyEffectsEnabled) return;

    justClicked = true;
    clearTimeout(hoverTimer);

    ruiGif.src = gifSurprise;

    setTimeout(() => {
        if (fancyEffectsEnabled) ruiGif.src = gifIdle;
    }, 1500);

    setTimeout(() => {
        justClicked = false;
    }, 1600);
});


// --- ШАГ 5: ВЫБОР ВАРИАНТА ---
decideBtn.addEventListener('click', () => {
    const choice1 = option1Input.value.trim();
    const choice2 = option2Input.value.trim();

    if (choice1 === '' || choice2 === '') {
        ruiSaysParagraph.textContent = 'хм? кажется, мне не дали варианты для выбора...';
        return;
    }

    if (fancyEffectsEnabled) {
        playDramaticEffect();
        ruiGif.src = gifThinking;
        ruiSaysParagraph.textContent = 'хммм, дай-ка подумать...';

        setTimeout(() => {
            const finalAnswer = makeChoice(choice1, choice2);
            ruiSaysParagraph.textContent = finalAnswer;
            ruiGif.src = gifIdle;
        }, 2500);

    } else {
        const finalAnswer = makeChoice(choice1, choice2);
        ruiSaysParagraph.textContent = finalAnswer;
    }
});

function makeChoice(choice1, choice2) {
    const choices = [choice1, choice2];
    const randomIndex = Math.floor(Math.random() * choices.length);
    const chosenOption = choices[randomIndex];
    const randomPhraseIndex = Math.floor(Math.random() * ruiPhrases.length);
    const phraseTemplate = ruiPhrases[randomPhraseIndex];
    return phraseTemplate.replace('{choice}', chosenOption);
}


// --- ШАГ 6: DRAMATIC EFFECT + Web Audio API ---
let audioCtx;
let drumBuffer = null;

async function initDrumSound() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const response = await fetch('/assets/sound/drums.mp3');
        const arrayBuffer = await response.arrayBuffer();
        drumBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        console.log('Барабанная дробь загружена!');
    } catch (e) {
        console.error('Ошибка загрузки звука:', e);
    }
}

function playDrumSound() {
    if (!audioCtx || !drumBuffer) return;

    const source = audioCtx.createBufferSource();
    source.buffer = drumBuffer;
    source.connect(audioCtx.destination);
    source.start();
}

function playDramaticEffect() {
    overlay.classList.add('active');
    playDrumSound();

    setTimeout(() => {
        overlay.classList.remove('active');
    }, 2250);
}

window.addEventListener('load', () => {
    initDrumSound();
});

// Разрешаем звук при первом взаимодействии (особенно для мобилок/iOS)
document.body.addEventListener('click', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });


// --- ШАГ 7: АФК-ФРАЗА ---
let afkTimer;
function resetAfkTimer() {
    clearTimeout(afkTimer);
    if (fancyEffectsEnabled) {
        afkTimer = setTimeout(() => {
            if (ruiSaysParagraph.textContent === initialPhrase) {
                const randomAfkIndex = Math.floor(Math.random() * afkPhrases.length);
                ruiSaysParagraph.textContent = afkPhrases[randomAfkIndex];
            }
        }, 10000);
    }
}

window.addEventListener('mousemove', resetAfkTimer);
window.addEventListener('mousedown', resetAfkTimer);
window.addEventListener('keydown', resetAfkTimer);
resetAfkTimer();
