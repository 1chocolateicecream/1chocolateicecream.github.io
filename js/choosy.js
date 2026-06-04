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

// Изменяем пути для GIF-ок
// Они находятся в assets/gifs/, а этот JS-файл в js/.
// Нужно выйти из js/ (..) и зайти в assets/gifs/.
const gifIdle = '../assets/gifs/rui-idle.gif';
const gifSurprise = '../assets/gifs/rui-surprise.gif';
const gifLaugh = '../assets/gifs/rui-laugh.gif';
const gifThinking = '../assets/gifs/rui-listen.gif'; // поза "слушает/думает" во время раздумья

// Изменяем пути для картинок кнопок
// rui_sound-on.PNG и rui_sound-off.PNG находятся в assets/button-images/.
// Нужно выйти из js/ (..) и зайти в assets/button-images/.
const imgEffectsOn = '../assets/button-images/rui_sound-on.PNG';
const imgEffectsOff = '../assets/button-images/rui_sound-off.PNG';

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
    effectsToggleBtn.setAttribute('aria-pressed', String(fancyEffectsEnabled));
    console.log(`Эффекты ${fancyEffectsEnabled ? 'включены' : 'выключены'}!`);

    if (fancyEffectsEnabled) {
        resetAfkTimer();
    } else {
        clearTimeout(afkTimer);
        ruiGif.src = gifIdle;
        // Если хочешь, чтобы при выключении эффектов сбрасывалась фраза — раскомментируй строку ниже:
        // ruiSaysParagraph.textContent = initialPhrase;
    }
});

// Клавиатурная активация иконки эффектов (Enter / Пробел)
effectsToggleBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        effectsToggleBtn.click();
    }
});

// --- ШАГ 4: РЕАКЦИИ РУИ (гладят / стукнули по башке) ---
// Длительности гифок (полный цикл). Возвращаемся к idle ровно по окончании
// анимации — на бесшовном стыке цикла, поэтому переход плавный, без обрыва.
const GIF_LAUGH_MS = 5070;
const GIF_SURPRISE_MS = 3390;

let hoverTimer = null;
let reactionTimer = null;
let isHovered = false; // палец/курсор сейчас на Руи

// Проигрываем реакцию. Любой новый триггер ПЕРЕБИВАЕТ текущую анимацию:
// сбрасываем гифку на idle на один кадр, чтобы тот же src гарантированно
// перезапустился с нуля (иначе браузер не перезагружает одинаковый src),
// и сразу ставим новую реакцию. Если её не перебьют — доиграет до конца.
function playReaction(src, duration) {
    if (!fancyEffectsEnabled) return;
    clearTimeout(reactionTimer);
    ruiGif.src = gifIdle;   // короткий сброс — чинит перезапуск той же гифки
    ruiGif.src = src;       // и тут же запускаем нужную реакцию с первого кадра
    reactionTimer = setTimeout(() => {
        if (fancyEffectsEnabled) ruiGif.src = gifIdle;
    }, duration);
}

// Запустить таймер «погладить» (смех через секунду удержания)
function startLaughTimer() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
        if (fancyEffectsEnabled && !isDeciding && isHovered) {
            playReaction(gifLaugh, GIF_LAUGH_MS); // смех перебивает что угодно
        }
    }, 1000);
}

// Навёл/держит палец → начинаем гладить
function handleRuiHoverStart() {
    if (!fancyEffectsEnabled || isDeciding) return;
    isHovered = true;
    startLaughTimer();
}

function handleRuiHoverEnd() {
    isHovered = false;
    clearTimeout(hoverTimer);
}

// Поддержка и мыши, и пальца!
ruiGif.addEventListener('mouseenter', handleRuiHoverStart);
ruiGif.addEventListener('mouseleave', handleRuiHoverEnd);
ruiGif.addEventListener('touchstart', handleRuiHoverStart);
ruiGif.addEventListener('touchend', handleRuiHoverEnd);

// Клик/тык по башке → испуг. Перебивает смех мгновенно.
// А если курсор/палец остался на Руи — сразу заводим «погладить»,
// поэтому можно пиздануть и тут же погладить, не уводя курсор.
ruiGif.addEventListener('click', () => {
    if (!fancyEffectsEnabled || isDeciding) return;
    playReaction(gifSurprise, GIF_SURPRISE_MS);
    if (isHovered) startLaughTimer();
});

// --- ШАГ 5: ВЫБОР ВАРИАНТА ---
let isDeciding = false; // защита от спама кнопки во время "раздумья"

decideBtn.addEventListener('click', () => {
    if (isDeciding) return; // пока Руи думает — повторные клики игнорируем

    const choice1 = option1Input.value.trim();
    const choice2 = option2Input.value.trim();

    if (choice1 === '' || choice2 === '') {
        ruiSaysParagraph.textContent = 'хм? кажется, мне не дали варианты для выбора...';
        return;
    }

    if (fancyEffectsEnabled) {
        isDeciding = true;
        decideBtn.disabled = true; // блокируем кнопку, чтобы эффекты не наслаивались
        clearTimeout(reactionTimer); // гасим реакцию (смех/испуг), если она шла
        playDramaticEffect();
        ruiGif.src = gifThinking;
        ruiSaysParagraph.textContent = 'хммм, дай-ка подумать...';

        setTimeout(() => {
            const finalAnswer = makeChoice(choice1, choice2);
            ruiSaysParagraph.textContent = finalAnswer;
            ruiGif.src = gifIdle;
            isDeciding = false;
            decideBtn.disabled = false;
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

        // Изменяем путь для drums.mp3
        // Он находится в assets/sound/, а этот JS-файл в js/.
        // Нужно выйти из js/ (..) и зайти в assets/sound/.
        const response = await fetch('../assets/sound/drums.mp3');
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
    // Афк-фраза — это тоже эффект: молчим, пока главный рубильник выключен
    if (!fancyEffectsEnabled) return;
    afkTimer = setTimeout(() => {
        if (ruiSaysParagraph.textContent === initialPhrase) {
            const randomAfkIndex = Math.floor(Math.random() * afkPhrases.length);
            ruiSaysParagraph.textContent = afkPhrases[randomAfkIndex];
        }
    }, 10000);
}

// Любое взаимодействие = пользователь НЕ афк
function markUserActive() {
    if (fancyEffectsEnabled) resetAfkTimer();
}

// Десктоп + общие события
['mousemove', 'mousedown', 'keydown', 'wheel'].forEach(evt =>
    window.addEventListener(evt, markUserActive, { passive: true })
);

// Телефон: тач и, ГЛАВНОЕ, печать в полях.
// На мобилках виртуальная клавиатура часто не шлёт keydown, поэтому
// раньше Руи начинал ныть, пока ты набирала варианты с телефона.
['touchstart', 'touchmove', 'pointerdown'].forEach(evt =>
    window.addEventListener(evt, markUserActive, { passive: true })
);
[option1Input, option2Input].forEach(input => {
    input.addEventListener('input', markUserActive); // набор текста = активность
    input.addEventListener('focus', markUserActive);
});