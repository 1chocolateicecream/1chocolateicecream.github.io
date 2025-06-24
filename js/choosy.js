const option1Input = document.getElementById('option1');
const option2Input = document.getElementById('option2');
const decideBtn = document.getElementById('decide-btn');
const ruiSaysParagraph = document.getElementById('rui-says');
// Гифку пока не трогаем, но пусть будет на будущее, когда анимации прикручивать будем
// const ruiGif = document.getElementById('rui-gif');

// Шаг 2: Создаем массив с фразами Руи. Можешь добавить сюда хоть сотню!
// Я сделал шаблон {choice}, куда мы потом подставим выбранный вариант.
const ruiPhrases = [
    "хммм… будь я на твоем месте, я бы выбрал «{choice}», если тебя это интересует",
    "тебе стоит выбрать «{choice}»; дружеский совет, фуфу~",
    "без всяких сомнений, мой выбор падает на «{choice}»!",
    "я думаю, что «{choice}» будет самым интересным вариантом!",
    "такой сложный выбор... но, пожалуй, я остановлюсь на «{choice}»"
];

// Сразу заменим текст-плейсхолдер на что-то более подходящее
ruiSaysParagraph.textContent = 'жду твоего сигнала, фуфу~';

// Шаг 3: Вешаем на кнопку "прослушку" событий. Она будет ждать клика.
decideBtn.addEventListener('click', () => {
    // Этот код будет выполняться КАЖДЫЙ РАЗ, когда ты нажимаешь на кнопку

    // Получаем то, что ты ввела в поля. .trim() убирает случайные пробелы в начале и конце
    const choice1 = option1Input.value.trim();
    const choice2 = option2Input.value.trim();

    // Маленькая проверка: а вдруг ты ничего не ввела?
    if (choice1 === '' || choice2 === '') {
        ruiSaysParagraph.textContent = 'хм? кажется, ты забыла дать мне варианты для выбора';
        // return останавливает выполнение функции, чтобы дальше код не шел
        return; 
    }

    // Создаем массив с твоими вариантами
    const choices = [choice1, choice2];

    // --- Магия рандома! ---
    // Math.random() дает случайное число от 0 до 0.999...
    // Умножаем на длину массива (у нас это 2), получаем от 0 до 1.999...
    // Math.floor() округляет это все вниз до ближайшего целого. В итоге будет либо 0, либо 1.
    const randomIndex = Math.floor(Math.random() * choices.length);
    const chosenOption = choices[randomIndex]; // Вытаскиваем победителя из массива!

    // Теперь так же рандомно выберем фразу для Руи
    const randomPhraseIndex = Math.floor(Math.random() * ruiPhrases.length);
    const phraseTemplate = ruiPhrases[randomPhraseIndex];

    // С помощью .replace() заменяем наш шаблон {choice} на реальный выбранный вариант
    const finalAnswer = phraseTemplate.replace('{choice}', chosenOption);

    // И вуаля! Показываем результат в абзаце
    ruiSaysParagraph.textContent = finalAnswer;
});