// --- Получаем все нужные элементы ---
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const convertButton = document.getElementById('convertButton');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const pasteButton = document.getElementById('pasteButton');
const soundButton = document.getElementById('soundControl');
const secretSoundElement = document.getElementById('secretSound'); // Переименовал для ясности

// --- Переменные состояния ---
let hoverTimeout;
let clickCount = 0;
let firstClickTime = null;
let capsMode = false;
let isSoundEnabled = false; // Главный рубильник для всех пасхалок

// --- НОВАЯ СИСТЕМА АУДИО (Web Audio API) ---
// Она позволит играть звук поверх музыки, не прерывая её.
let audioContext;
let secretSoundBuffer;
let audioUnlocked = false;

// Функция для подготовки аудиосистемы. Сработает 1 раз при первом клике.
function initAudio() {
    if (audioUnlocked) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        fetch('assets/sound/rui-laugh.wav') // ← всё, чёткий путь, не нужен HTML-аудио
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedBuffer => {
                secretSoundBuffer = decodedBuffer;
                audioUnlocked = true;
                console.log('Хихишка успешно загружена и готова к бою!');
            })
            .catch(err => console.error('Не удалось загрузить хихишку:', err));
    } catch (e) {
        console.error('Web Audio API не поддерживается этим браузером.', e);
    }
}

// Запускаем подготовку аудио по первому клику на странице
document.body.addEventListener('click', initAudio, { once: true });


// НОВАЯ функция проигрывания звука
function playSecretSound() {
    // Играем, только если аудио готово, буфер есть и пасхалки ВКЛЮЧЕНЫ
    if (audioUnlocked && secretSoundBuffer && isSoundEnabled) {
        const source = audioContext.createBufferSource(); // Создаем новый источник звука
        source.buffer = secretSoundBuffer;                // Подключаем наш звук
        source.connect(audioContext.destination);         // Направляем на колонки
        source.start(0);                                  // Плей!
    }
}

// --- ФУНКЦИИ-ПОМОЩНИКИ ---
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}


// --- ФУНКЦИОНАЛ ОСНОВНЫХ КНОПОК ---

pasteButton.addEventListener('click', () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
        alert('Вставить не получится. Браузер не поддерживает эту фичу или сайт открыт не по HTTPS.');
        return;
    }
    navigator.clipboard.readText().then(clipboardText => {
        inputText.value = clipboardText;
    }).catch(err => {
        console.error('Не удалось вставить текст:', err);
        alert('Не получилось вставить текст. Возможно, нужно дать разрешение.');
    });
});

clearButton.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
});

copyButton.addEventListener('click', () => {
    if (!outputText.value) return;
    outputText.select();
    document.execCommand('copy');
    copyButton.textContent = 'скопировано!';
    setTimeout(() => {
        copyButton.textContent = 'копировать';
    }, 3000);
});


// --- ОБРАБОТЧИК КНОПКИ "ПРЕОБРАЗОВАТЬ" (с УСЛОВНОЙ пасхалкой) ---
convertButton.addEventListener('click', () => {
    // FIX 1: Пасхалка с капсом работает ТОЛЬКО когда включен главный рубильник
    if (isSoundEnabled) {
        // Логика переключения: 1 клик на ВЫКЛ, 5 на ВКЛ
        if (capsMode) {
            capsMode = false;
            clickCount = 0;
            firstClickTime = null;
        } else {
            const now = Date.now();
            if (firstClickTime === null) firstClickTime = now;
            if (now - firstClickTime > 6000) {
                clickCount = 0;
                firstClickTime = now;
            }
            clickCount++;
            if (clickCount >= 5) {
                capsMode = true;
                clickCount = 0;
                firstClickTime = null;
            }
        }
    } else {
        // Если пасхалки выключены, убеждаемся, что капс тоже выключен
        capsMode = false;
    }

    // Применяем преобразование в зависимости от итогового состояния
    if (capsMode) {
        outputText.value = inputText.value.toUpperCase();
        convertButton.textContent = "ПРЕОБРАЗОВАТЬ";
        convertButton.classList.add("secret-active");
    } else {
        outputText.value = inputText.value.toLowerCase();
        convertButton.textContent = "преобразовать";
        convertButton.classList.remove("secret-active");
    }
});


// --- ПАСХАЛКА СО ЗВУКОМ И ЦВЕТОМ (удержание/наведение) ---
// (Тут уже всё было хорошо, просто вызываем новую функцию звука)
const activateSecretEffect = () => {
    if (isSoundEnabled) {
        playSecretSound(); // Используем новую функцию
        convertButton.classList.add('secret-active');
    }
};

const deactivateSecretEffect = () => {
    clearTimeout(hoverTimeout);
    if (!capsMode) {
        convertButton.classList.remove('secret-active');
    }
};

if (isTouchDevice()) {
    convertButton.addEventListener('touchstart', () => { hoverTimeout = setTimeout(activateSecretEffect, 1000); }, { passive: true });
    convertButton.addEventListener('touchend', deactivateSecretEffect);
    convertButton.addEventListener('touchcancel', deactivateSecretEffect);
} else {
    convertButton.addEventListener('mouseover', () => { hoverTimeout = setTimeout(activateSecretEffect, 3000); });
    convertButton.addEventListener('mouseout', deactivateSecretEffect);
}


// --- ЛОГИКА "УБЕГАЮЩЕЙ" КНОПКИ ---
// (Тут всё работает от переменной isSoundEnabled, так что трогать не надо)
function addMovingEffect(button) {
    document.addEventListener('mousemove', (event) => {
        if (!isSoundEnabled) { button.style.transform = 'translate(0, 0)'; return; }
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = event.clientX - centerX;
        const offsetY = event.clientY - centerY;
        const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
        const maxDistance = 55;
        if (distance < maxDistance) {
            const moveFactor = (maxDistance - distance) / maxDistance;
            const moveX = offsetX * -1.2 * moveFactor;
            const moveY = offsetY * -1.2 * moveFactor;
            button.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
            button.style.transform = 'translate(0, 0)';
        }
    });
    document.addEventListener('mouseleave', () => { if (isSoundEnabled) { button.style.transform = 'translate(0, 0)'; } });
}
addMovingEffect(soundButton);


// --- ОБРАБОТЧИК ДЛЯ ГЛАВНОЙ КНОПКИ ПАСХАЛОК ---
soundButton.addEventListener('click', () => {
    // Включаем/выключаем наш главный рубильник
    isSoundEnabled = !isSoundEnabled;

    // Меняем иконку
    if (isSoundEnabled) {
        soundButton.src = 'assets/button-images/rui_sound-on.PNG';
        // Если контекст еще не создан (юзер не кликал ни разу), пробуем создать его сейчас
        if (!audioContext) {
            initAudio();
        }
        // Разбудим контекст, если он уснул (некоторые браузеры так делают)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } else {
        soundButton.src = 'assets/button-images/rui_sound-off.PNG';
    }
});