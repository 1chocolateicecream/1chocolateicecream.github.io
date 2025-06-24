// --- Файл: js/choosy.js (ВЕРСИЯ С ПЕРЕКЛЮЧАТЕЛЕМ ЭФФЕКТОВ) ---

// --- ШАГ 1: ВСЕ НАШИ ЭЛЕМЕНТЫ И ПЕРЕМЕННЫЕ ---
const option1Input = document.getElementById('option1');
const option2Input = document.getElementById('option2');
const decideBtn = document.getElementById('decide-btn');
const ruiSaysParagraph = document.getElementById('rui-says');
const ruiGif = document.getElementById('rui-gif');
const overlay = document.getElementById('overlay');
const effectsToggleBtn = document.getElementById('effects-toggle'); // НАША НОВАЯ КНОПКА

// --- ГЛАВНАЯ ПЕРЕМЕННАЯ-ПЕРЕКЛЮЧАТЕЛЬ ---
let fancyEffectsEnabled = false; // По умолчанию эффекты выключены

// Пути к гифкам и звукам
const gifIdle = '/assets/gifs/idle-speed.gif';
const gifSurprise = '/assets/gifs/surprise-speed.gif';
const gifLaugh = '/assets/gifs/laugh-speed.gif';
const gifThinking = '/assets/gifs/thinking-speed.gif';
const imgEffectsOn = 'assets/button-images/rui_sound-on.PNG'; // Путь к картинке "ВКЛ"
const imgEffectsOff = 'assets/button-images/rui_sound-off.PNG'; // Путь к картинке "ВЫКЛ"
const drumSound = new Audio('/assets/sound/drums.mp3');

// Фразы Руи
const ruiPhrases = [
    "хммм… будь я на твоем месте, я бы выбрал «{choice}», если тебя это интересует.",
    "тебе стоит выбрать «{choice}»; дружеский совет, фуфу~",
    "без всяких сомнений, мой выбор падает на «{choice}»!",
    "я думаю, что «{choice}» будет самым интересным вариантом. ☆",
    "такой сложный выбор... но, пожалуй, я остановлюсь на «{choice}».",
    "вот это выбор! но я бы сказал, что «{choice}» — это то, что тебе нужно."
];
const afkPhrases = [
    "хей, ты еще здесь? я жду...",
    "кажется, я остался совсем один... фуфу~",
    "может, выберем что-нибудь еще?",
    "все еще думаешь? я могу подождать!",
    "я тут, если что! не стесняйся, фуфу~"
];
let initialPhrase = 'жду твоего сигнала, фуфу~';
ruiSaysParagraph.textContent = initialPhrase;


// --- ШАГ 2: ЛОГИКА ПЕРЕКЛЮЧАТЕЛЯ ЭФФЕКТОВ ---
effectsToggleBtn.addEventListener('click', () => {
    // Меняем значение на противоположное (было true -> станет false, и наоборот)
    fancyEffectsEnabled = !fancyEffectsEnabled;

    if (fancyEffectsEnabled) {
        // Если ВКЛЮЧИЛИ эффекты
        effectsToggleBtn.src = imgEffectsOn;
        console.log("Эффекты включены!");
    } else {
        // Если ВЫКЛЮЧИЛИ эффекты
        effectsToggleBtn.src = imgEffectsOff;
        console.log("Эффекты выключены!");
        // Сразу вернем гифку в исходное состояние, на всякий случай
        ruiGif.src = gifIdle;
    }
});


// --- ШАГ 3: "ЖИВОЙ" РУИ (теперь работает только с эффектами) ---
let hoverTimer;
let isHovered = false;
let justClicked = false; // <-- добавим флаг, чтобы не ржал сразу после клика

ruiGif.addEventListener('mouseenter', () => {
    if (!fancyEffectsEnabled || isHovered || justClicked) return;

    isHovered = true;

    hoverTimer = setTimeout(() => {
        // Если всё ещё fancy и пользователь не кликал недавно — ржёт
        if (!justClicked && fancyEffectsEnabled) {
            ruiGif.src = gifLaugh;

            setTimeout(() => {
                if (fancyEffectsEnabled) ruiGif.src = gifIdle;
            }, 2000);
        }
    }, 1000); // "глажка" — 1 сек
});

ruiGif.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    isHovered = false;
});

// Клик по гифке — испуг
ruiGif.addEventListener('click', () => {
    if (!fancyEffectsEnabled) return;

    justClicked = true; // <-- ставим флаг: был клик
    clearTimeout(hoverTimer); // отменяем хихишку, если она была на подходе

    ruiGif.src = gifSurprise;

    setTimeout(() => {
        if (fancyEffectsEnabled) ruiGif.src = gifIdle;
    }, 1500);

    // Снимаем флаг через небольшое время
    setTimeout(() => {
        justClicked = false;
    }, 1600); // чуть больше времени, чем пугание
});


// --- ШАГ 4: КНОПКА ВЫБОРА (теперь с двумя режимами) ---
decideBtn.addEventListener('click', () => {
    const choice1 = option1Input.value.trim();
    const choice2 = option2Input.value.trim();

    if (choice1 === '' || choice2 === '') {
        ruiSaysParagraph.textContent = 'хм? кажется, мне не дали варианты для выбора...';
        return;
    }

    // Проверяем, включены ли эффекты
    if (fancyEffectsEnabled) {
        // РЕЖИМ С ЭФФЕКТАМИ (старая логика)
        overlay.style.display = 'block';
        drumSound.play();
        ruiGif.src = gifThinking;
        ruiSaysParagraph.textContent = 'хммм, дай-ка подумать...';

        setTimeout(() => {
            const finalAnswer = makeChoice(choice1, choice2);
            ruiSaysParagraph.textContent = finalAnswer;
            overlay.style.display = 'none';
            ruiGif.src = gifIdle;
        }, 2500);

    } else {
        // ПРОСТОЙ РЕЖИМ (без драмы)
        const finalAnswer = makeChoice(choice1, choice2);
        ruiSaysParagraph.textContent = finalAnswer;
    }
});

// Я вынес логику выбора в отдельную функцию, чтобы не дублировать код
function makeChoice(choice1, choice2) {
    const choices = [choice1, choice2];
    const randomIndex = Math.floor(Math.random() * choices.length);
    const chosenOption = choices[randomIndex];
    const randomPhraseIndex = Math.floor(Math.random() * ruiPhrases.length);
    const phraseTemplate = ruiPhrases[randomPhraseIndex];
    return phraseTemplate.replace('{choice}', chosenOption);
}


// --- ШАГ 5: АФК-ФРАЗА (тоже зависит от переключателя) ---
let afkTimer;
function resetAfkTimer() {
    clearTimeout(afkTimer);
    // Таймер запускается, только если эффекты включены
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
// Первый запуск, чтобы система начала работать, если эффекты вдруг включены по умолчанию
resetAfkTimer();