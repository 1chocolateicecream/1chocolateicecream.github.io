// --- Получаем все нужные элементы ---
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const convertButton = document.getElementById('convertButton');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const pasteButton = document.getElementById('pasteButton');
const soundButton = document.getElementById('soundControl'); // Используем одно имя для кнопки звука
const secretSound = document.getElementById('secretSound');

// --- Переменные состояния ---
let hoverTimeout;
let audioUnlocked = false;
let clickCount = 0;
let firstClickTime = null;
let capsMode = false;

// Объединяем все в одну переменную состояния для звука
// true = звук включен, иконка on, кнопка убегает
// false = звук выключен, иконка off, кнопка стоит на месте
let isSoundEnabled = false; // По умолчанию звук выключен

function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// --- Логика разблокировки аудио (НОВАЯ, ТИХАЯ ВЕРСИЯ) ---
document.body.addEventListener('click', () => {
    if (!audioUnlocked) {
        // ВРЕМЕННО мьютим звук перед "техническим" проигрыванием
        secretSound.muted = true; 
        
        secretSound.play().then(() => {
            secretSound.pause();
            secretSound.currentTime = 0;
            audioUnlocked = true;
            
            // Теперь, когда аудио разблокировано, возвращаем настройку звука к той,
            // которую выбрал пользователь (т.е. к состоянию нашей кнопки)
            secretSound.muted = !isSoundEnabled; 

        }).catch(() => {
            // Если что-то пошло не так, все равно вернем мьют в норму
            secretSound.muted = !isSoundEnabled;
        });
    }
}, { once: true });

function playSecretSound() {
    if (audioUnlocked) {
        secretSound.currentTime = 0; // Сбрасываем звук, чтобы он играл с начала
        secretSound.play().catch(err => console.log('Ошибка воспроизведения:', err));
    }
}

// --- Функционал основных кнопок ---

// Вставка текста
pasteButton.addEventListener('click', async () => {
    try {
        const clipboardText = await navigator.clipboard.readText();
        inputText.value = clipboardText;
    } catch (err) {
        console.error('Не удалось вставить текст:', err);
    }
});

// Очистка полей
clearButton.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
});

// Копирование результата
copyButton.addEventListener('click', () => {
    outputText.select();
    document.execCommand('copy');
    copyButton.textContent = 'скопировано!';
    setTimeout(() => {
        copyButton.textContent = 'копировать';
    }, 3000);
});

// --- ЕДИНЫЙ обработчик для кнопки "преобразовать" (с пасхалкой) ---
convertButton.addEventListener('click', () => {
    const now = Date.now();

    // Логика для пасхалки с 5 кликами
    if (firstClickTime === null) {
        firstClickTime = now;
    }

    if (now - firstClickTime > 6000) {
        clickCount = 0;
        firstClickTime = now;
    }
    
    clickCount++;

    // Переключаем режим CAPS
    if (clickCount >= 5 && !capsMode) {
        capsMode = true;
        convertButton.textContent = "ПРЕОБРАЗОВАТЬ";
        convertButton.classList.add("secret-active");
    }

    // Применяем преобразование в зависимости от режима
    if (capsMode) {
        outputText.value = inputText.value.toUpperCase();
    } else {
        outputText.value = inputText.value.toLowerCase();
    }
});

// --- Пасхалка со звуком и цветом (удержание/наведение) ---

const activateSecretEffect = () => {
    if (isSoundEnabled) { 
        playSecretSound();
    }
    convertButton.classList.add('secret-active');
};

const deactivateSecretEffect = () => {
    clearTimeout(hoverTimeout);
    convertButton.classList.remove('secret-active');
};

// Проверяем, с какого устройства зашли
if (isTouchDevice()) {
    // ЛОГИКА ДЛЯ ТЕЛЕФОНОВ (долгое нажатие)
    convertButton.addEventListener('touchstart', (e) => {
        // e.preventDefault(); // Можно раскомментить, если будут странные баги с двойным срабатыванием
        hoverTimeout = setTimeout(activateSecretEffect, 3000); // Для телефонов можно и побыстрее, 3 сек
    }, { passive: true });

    convertButton.addEventListener('touchend', deactivateSecretEffect);
    convertButton.addEventListener('touchcancel', deactivateSecretEffect); // На случай, если палец уехал за пределы экрана

} else {
    // ЛОГИКА ДЛЯ КОМПОВ (наведение мышкой)
    convertButton.addEventListener('mouseover', () => {
        hoverTimeout = setTimeout(activateSecretEffect, 5000);
    });

    convertButton.addEventListener('mouseout', deactivateSecretEffect);
}

// --- Логика "убегающей" кнопки ---
function addMovingEffect(button) {
    document.addEventListener('mousemove', (event) => {
        // Проверяем то же самое единое состояние звука
        if (!isSoundEnabled) {
            button.style.transform = 'translate(0, 0)'; // Если убегание выключено, возвращаем кнопку на место
            return;
        }

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

    document.addEventListener('mouseleave', () => {
        if (isSoundEnabled) {
                button.style.transform = 'translate(0, 0)';
        }
    });
}

addMovingEffect(soundButton); // Применяем эффект к нашей кнопке звука


// --- ЕДИНЫЙ обработчик для кнопки звука ---
soundButton.addEventListener('click', () => {
    // Просто переключаем наше единственное состояние
    isSoundEnabled = !isSoundEnabled;

    // Обновляем всё в зависимости от этого состояния
    if (isSoundEnabled) {
        soundButton.src = 'assets/button-images/rui_sound-on.PNG';
        secretSound.muted = false;
        // Эффект "убегания" начнет работать автоматически, т.к. он проверяет isSoundEnabled
    } else {
        soundButton.src = 'assets/button-images/rui_sound-off.PNG';
        secretSound.muted = true;
        // Эффект "убегания" перестанет работать, и кнопка вернется на место
    }
});