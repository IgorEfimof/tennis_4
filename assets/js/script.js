document.addEventListener('DOMContentLoaded', function() {
    const fields = [
        'currentGamesP1', 'currentGamesP2', 'currentGamePointsP1', 'currentGamePointsP2',
        'g5p1', 'g5p2', 'g6p1', 'g6p2', 'g7p1', 'g7p2', 'g8p1', 'g8p2', 'g9p1', 'g9p2', 'g10p1', 'g10p2'
    ];

    // Функция для очистки и форматирования коэффициентов (X.XX)
    function handleCoeffInput(e, idx) {
        let input = e.target;
        let val = input.value.replace(/[^\d]/g, ''); // Удаляем все, кроме цифр

        // Форматируем в X.XX
        if (val.length > 1) {
            val = val.slice(0, 1) + '.' + val.slice(1, 3);
        }
        if (val.length > 4) val = val.slice(0, 4);

        input.value = val;

        // Автоматический переход к следующему полю, если введено 4 символа (X.XX)
        if (val.length === 4) {
            if (idx < fields.length - 1) {
                // Ищем следующее поле для фокуса
                let nextInputFound = false;
                for (let i = idx + 1; i < fields.length; i++) {
                    const nextInput = document.getElementById(fields[i]);
                    // Проверяем, что это не поля для счета (type="number")
                    if (nextInput && nextInput.type !== 'number' && nextInput.type !== 'radio') {
                        nextInput.focus();
                        nextInputFound = true;
                        break;
                    }
                }
                // Если следующее поле - это счет или радио, или конец списка, просто вызываем расчет
                if (!nextInputFound) {
                    input.blur();
                    calculateWinner();
                }
            } else {
                input.blur();
                calculateWinner();
            }
        }
        calculateWinner(); // Также вызываем расчет при каждом изменении, чтобы динамически обновлять
    }

    // Функция для обработки вставки коэффициентов
    function handleCoeffPaste(e, idx) {
        e.preventDefault();
        let text = (e.clipboardData || window.clipboardData).getData('text');
        text = text.replace(/[^\d]/g, '');

        if (text.length > 1) {
            text = text.slice(0, 1) + '.' + text.slice(1, 3);
        }
        if (text.length > 4) text = text.slice(0, 4);

        e.target.value = text;
        if (text.length === 4) {
            if (idx < fields.length - 1) {
                let nextInputFound = false;
                for (let i = idx + 1; i < fields.length; i++) {
                    const nextInput = document.getElementById(fields[i]);
                    if (nextInput && nextInput.type !== 'number' && nextInput.type !== 'radio') {
                        nextInput.focus();
                        nextInputFound = true;
                        break;
                    }
                }
                if (!nextInputFound) {
                    e.target.blur();
                    calculateWinner();
                }
            } else {
                e.target.blur();
                calculateWinner();
            }
        }
        calculateWinner();
    }

    fields.forEach((id, idx) => {
        const input = document.getElementById(id);
        if (input) { // Убедимся, что элемент существует
            if (input.type === 'text') { // Применяем только к текстовым полям (коэффициентам)
                input.setAttribute('maxlength', '4');
                input.setAttribute('inputmode', 'decimal');
                input.classList.add('text-center'); // Уже есть в HTML, но можно продублировать
                input.addEventListener('input', (e) => handleCoeffInput(e, idx));
                input.addEventListener('paste', (e) => handleCoeffPaste(e, idx));
                input.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        if (idx < fields.length - 1) {
                            let nextInputFound = false;
                            for (let i = idx + 1; i < fields.length; i++) {
                                const nextInput = document.getElementById(fields[i]);
                                if (nextInput && nextInput.type !== 'number' && nextInput.type !== 'radio') {
                                    nextInput.focus();
                                    nextInputFound = true;
                                    break;
                                }
                            }
                            if (!nextInputFound) {
                                input.blur();
                                calculateWinner();
                            }
                        } else {
                            input.blur();
                            calculateWinner();
                        }
                    }
                });
            } else if (input.type === 'number' || input.type === 'radio') {
                input.addEventListener('input', calculateWinner); // Обновляем расчет при изменении счета или подачи
                input.addEventListener('change', calculateWinner); // Для радио кнопок
            }
        }
    });

    // Initial calculation on load
    calculateWinner();

    function calculateWinner() {
        let player1Coeffs = [], player2Coeffs = [];
        let allCoeffsFilled = true;

        // Получаем текущий счет по геймам
        const currentGamesP1 = parseInt(document.getElementById('currentGamesP1').value) || 0;
        const currentGamesP2 = parseInt(document.getElementById('currentGamesP2').value) || 0;

        // Получаем текущий счет в гейме
        const currentGamePointsP1 = parseInt(document.getElementById('currentGamePointsP1').value) || 0;
        const currentGamePointsP2 = parseInt(document.getElementById('currentGamePointsP2').value) || 0;

        // Получаем, кто подает
        const servingPlayer = document.querySelector('input[name="servingPlayer"]:checked').value;

        // Собираем коэффициенты
        for (let i = 5; i <= 10; i++) {
            const p1 = document.getElementById(`g${i}p1`);
            const p2 = document.getElementById(`g${i}p2`);

            if (p1 && p2) { // Проверяем, что элементы существуют
                if (p1.value.length === 4 && p2.value.length === 4) {
                    player1Coeffs.push(parseFloat(p1.value));
                    player2Coeffs.push(parseFloat(p2.value));
                    p1.classList.remove('is-invalid');
                    p2.classList.remove('is-invalid');
                } else {
                    allCoeffsFilled = false;
                    // Добавляем класс 'is-invalid' только если поле не пустое, но не полностью заполнено
                    if (p1.value.length > 0 && p1.value.length !== 4) p1.classList.add('is-invalid');
                    else if (p1.value.length === 0) p1.classList.remove('is-invalid'); // Убираем, если пусто
                    if (p2.value.length > 0 && p2.value.length !== 4) p2.classList.add('is-invalid');
                    else if (p2.value.length === 0) p2.classList.remove('is-invalid'); // Убираем, если пусто
                }
            }
        }

        // Если не все коэффициенты заполнены, показываем ошибку
        if (!allCoeffsFilled || player1Coeffs.length === 0) {
            document.getElementById('error').textContent = 'Пожалуйста, заполните все коэффициенты на геймы в формате X.XX';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

        const sumDecimalPlayer1 = player1Coeffs.reduce((sum, coeff) => sum + (coeff % 1), 0);
        const sumDecimalPlayer2 = player2Coeffs.reduce((sum, coeff) => sum + (coeff % 1), 0);

        let adjustedSumPlayer1 = sumDecimalPlayer1;
        let adjustedSumPlayer2 = sumDecimalPlayer2;

        // Корректировка на основе счета по геймам
        const gameDiff = currentGamesP1 - currentGamesP2;
        if (gameDiff > 0) { // Игрок 1 ведет по геймам
            adjustedSumPlayer1 -= gameDiff * 0.05; // Даем Игроку 1 преимущество
            adjustedSumPlayer2 += gameDiff * 0.05; // Увеличиваем "штраф" для Игрока 2
        } else if (gameDiff < 0) { // Игрок 2 ведет по геймам
            adjustedSumPlayer2 -= Math.abs(gameDiff) * 0.05;
            adjustedSumPlayer1 += Math.abs(gameDiff) * 0.05;
        }

        // Корректировка на основе счета в текущем гейме (если гейм не завершен)
        const pointDiff = currentGamePointsP1 - currentGamePointsP2;
        if (pointDiff > 0) { // Игрок 1 ведет по очкам
            adjustedSumPlayer1 -= pointDiff * 0.01; // Небольшое преимущество за каждое очко
            adjustedSumPlayer2 += pointDiff * 0.01;
        } else if (pointDiff < 0) { // Игрок 2 ведет по очкам
            adjustedSumPlayer2 -= Math.abs(pointDiff) * 0.01;
            adjustedSumPlayer1 += Math.abs(pointDiff) * 0.01;
        }

        // Корректировка на основе подающего игрока
        const servingBonus = 0.02; // Небольшой бонус для подающего
        if (servingPlayer === 'player1') {
            adjustedSumPlayer1 -= servingBonus;
            adjustedSumPlayer2 += servingBonus;
        } else if (servingPlayer === 'player2') {
            adjustedSumPlayer2 -= servingBonus;
            adjustedSumPlayer1 += servingBonus;
        }


        let winnerMessage;
        if (adjustedSumPlayer1 < adjustedSumPlayer2) {
            winnerMessage = `Победитель: Игрок 1 (${(adjustedSumPlayer2 - adjustedSumPlayer1).toFixed(4)} преимущество)`;
        } else if (adjustedSumPlayer2 < adjustedSumPlayer1) {
            winnerMessage = `Победитель: Игрок 2 (${(adjustedSumPlayer1 - adjustedSumPlayer2).toFixed(4)} преимущество)`;
        } else {
            winnerMessage = "Ничья (скорректированные суммы десятичных частей равны)";
        }

        document.getElementById('player1_sum').textContent = `Сумма десятичных частей (Игрок 1): ${sumDecimalPlayer1.toFixed(4)}`;
        document.getElementById('player2_sum').textContent = `Сумма десятичных частей (Игрок 2): ${sumDecimalPlayer2.toFixed(4)}`;
        document.getElementById('player1_adjusted_sum').textContent = `Скорректированная сумма (Игрок 1): ${adjustedSumPlayer1.toFixed(4)}`;
        document.getElementById('player2_adjusted_sum').textContent = `Скорректированная сумма (Игрок 2): ${adjustedSumPlayer2.toFixed(4)}`;
        document.getElementById('winner').textContent = winnerMessage;
        document.getElementById('result').style.display = 'block';
    }
});
