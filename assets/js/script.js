document.addEventListener('DOMContentLoaded', function() {
    // Обновленный список полей. Теперь только два поля для коэффициентов.
    const fields = [
        'currentGamesP1', 'currentGamesP2', 'currentGamePointsP1', 'currentGamePointsP2',
        'gNextP1', 'gNextP2' // Только эти два поля
    ];

    // Функция для очистки и форматирования коэффициентов (X.XX)
    function handleCoeffInput(e, idx) {
        let input = e.target;
        if (input.type === 'text') {
            let val = input.value.replace(/[^\d]/g, '');

            if (val.length > 1) {
                val = val.slice(0, 1) + '.' + val.slice(1, 3);
            }
            if (val.length > 4) val = val.slice(0, 4);

            input.value = val;

            if (val.length === 4) {
                // Если это последнее поле, запускаем расчет
                if (idx === fields.length - 1) {
                    input.blur(); // Убираем фокус
                    calculateWinner();
                } else {
                    // Ищем следующее текстовое поле
                    let nextInputFound = false;
                    for (let i = idx + 1; i < fields.length; i++) {
                        const nextInput = document.getElementById(fields[i]);
                        if (nextInput && nextInput.type === 'text') {
                            nextInput.focus();
                            nextInputFound = true;
                            break;
                        }
                    }
                    // Если следующее текстовое поле не найдено (или это были последние текстовые поля), запускаем расчет
                    if (!nextInputFound) {
                        input.blur();
                        calculateWinner();
                    }
                }
            }
        }
        calculateWinner(); // Также вызываем расчет при каждом изменении, чтобы динамически обновлять
    }

    // Функция для обработки вставки коэффициентов
    function handleCoeffPaste(e, idx) {
        e.preventDefault();
        let input = e.target;
        if (input.type === 'text') {
            let text = (e.clipboardData || window.clipboardData).getData('text');
            text = text.replace(/[^\d]/g, '');

            if (text.length > 1) {
                text = text.slice(0, 1) + '.' + text.slice(1, 3);
            }
            if (text.length > 4) text = text.slice(0, 4);

            input.value = text;
            if (text.length === 4) {
                 if (idx === fields.length - 1) {
                    input.blur();
                    calculateWinner();
                } else {
                    let nextInputFound = false;
                    for (let i = idx + 1; i < fields.length; i++) {
                        const nextInput = document.getElementById(fields[i]);
                        if (nextInput && nextInput.type === 'text') {
                            nextInput.focus();
                            nextInputFound = true;
                            break;
                        }
                    }
                    if (!nextInputFound) {
                        input.blur();
                        calculateWinner();
                    }
                }
            }
        }
        calculateWinner();
    }

    fields.forEach((id, idx) => {
        const input = document.getElementById(id);
        if (input) {
            if (input.type === 'text') { // Применяем только к текстовым полям (коэффициентам)
                input.setAttribute('maxlength', '4');
                input.setAttribute('inputmode', 'decimal');
                input.classList.add('text-center');
                input.addEventListener('input', (e) => handleCoeffInput(e, idx));
                input.addEventListener('paste', (e) => handleCoeffPaste(e, idx));
                input.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        if (idx === fields.length - 1) {
                            input.blur();
                            calculateWinner();
                        } else {
                            let nextInputFound = false;
                            for (let i = idx + 1; i < fields.length; i++) {
                                const nextInput = document.getElementById(fields[i]);
                                if (nextInput && nextInput.type === 'text') {
                                    nextInput.focus();
                                    nextInputFound = true;
                                    break;
                                }
                            }
                            if (!nextInputFound) {
                                input.blur();
                                calculateWinner();
                            }
                        }
                    }
                });
            } else if (input.type === 'number' || input.type === 'radio') {
                input.addEventListener('input', calculateWinner);
                input.addEventListener('change', calculateWinner);
                input.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        if (idx < fields.length - 1) {
                            const nextInput = document.getElementById(fields[idx + 1]);
                            if (nextInput) {
                                nextInput.focus();
                            }
                        } else {
                            input.blur();
                            calculateWinner();
                        }
                    }
                });
            }
        }
    });

    // Initial calculation on load
    calculateWinner();

    function calculateWinner() {
        let player1Coeffs = [], player2Coeffs = []; // Теперь будет только по одному коэффициенту
        let allCoeffsFilled = true;

        const currentGamesP1 = parseInt(document.getElementById('currentGamesP1').value) || 0;
        const currentGamesP2 = parseInt(document.getElementById('currentGamesP2').value) || 0;

        const currentGamePointsP1 = parseInt(document.getElementById('currentGamePointsP1').value) || 0;
        const currentGamePointsP2 = parseInt(document.getElementById('currentGamePointsP2').value) || 0;

        const servingPlayer = document.querySelector('input[name="servingPlayer"]:checked').value;

        // Собираем коэффициенты только для одного следующего гейма
        const p1 = document.getElementById('gNextP1');
        const p2 = document.getElementById('gNextP2');

        if (p1 && p2) {
            if (p1.value.length === 4 && p2.value.length === 4) {
                player1Coeffs.push(parseFloat(p1.value));
                player2Coeffs.push(parseFloat(p2.value));
                p1.classList.remove('is-invalid');
                p2.classList.remove('is-invalid');
            } else {
                allCoeffsFilled = false;
                if (p1.value.length > 0 && p1.value.length !== 4) p1.classList.add('is-invalid');
                else if (p1.value.length === 0) p1.classList.remove('is-invalid');
                if (p2.value.length > 0 && p2.value.length !== 4) p2.classList.add('is-invalid');
                else if (p2.value.length === 0) p2.classList.remove('is-invalid');
            }
        } else {
            allCoeffsFilled = false; // Если полей нет, считаем, что не заполнены (хотя их всегда должно быть 2)
        }


        // Если не все коэффициенты заполнены, показываем ошибку
        if (!allCoeffsFilled || player1Coeffs.length < 1) { // Проверяем, что хотя бы один кф. есть
            document.getElementById('error').textContent = 'Заполните коэффициенты на следующий гейм в формате X.XX';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

        // Теперь у нас только один коэффициент для каждого игрока, поэтому reduce не так критичен, но можно оставить
        const sumDecimalPlayer1 = player1Coeffs[0] % 1; // Берем десятичную часть только первого (единственного) коэффициента
        const sumDecimalPlayer2 = player2Coeffs[0] % 1; // То же самое

        let adjustedSumPlayer1 = sumDecimalPlayer1;
        let adjustedSumPlayer2 = sumDecimalPlayer2;

        // Корректировка на основе счета по геймам
        const gameDiff = currentGamesP1 - currentGamesP2;
        const gameWeight = 0.04;
        if (gameDiff > 0) {
            adjustedSumPlayer1 -= gameDiff * gameWeight;
            adjustedSumPlayer2 += gameDiff * gameWeight;
        } else if (gameDiff < 0) {
            adjustedSumPlayer2 -= Math.abs(gameDiff) * gameWeight;
            adjustedSumPlayer1 += Math.abs(gameDiff) * gameWeight;
        }

        // Корректировка на основе счета в текущем гейме
        const pointDiff = currentGamePointsP1 - currentGamePointsP2;
        const pointWeight = 0.008;
        if (pointDiff > 0) {
            adjustedSumPlayer1 -= pointDiff * pointWeight;
            adjustedSumPlayer2 += pointDiff * pointWeight;
        } else if (pointDiff < 0) {
            adjustedSumPlayer2 -= Math.abs(pointDiff) * pointWeight;
            adjustedSumPlayer1 += Math.abs(pointDiff) * pointWeight;
        }

        // Корректировка на основе подающего игрока
        const servingBonus = 0.015;
        if (servingPlayer === 'player1') {
            adjustedSumPlayer1 -= servingBonus;
            adjustedSumPlayer2 += servingBonus;
        } else if (servingPlayer === 'player2') {
            adjustedSumPlayer2 -= servingBonus;
            adjustedSumPlayer1 += servingBonus;
        }


        let winnerMessage;
        if (adjustedSumPlayer1 < adjustedSumPlayer2) {
            winnerMessage = `Победитель: Игрок 1 (преимущество ${(adjustedSumPlayer2 - adjustedSumPlayer1).toFixed(4)})`;
        } else if (adjustedSumPlayer2 < adjustedSumPlayer1) {
            winnerMessage = `Победитель: Игрок 2 (преимущество ${(adjustedSumPlayer1 - adjustedSumPlayer2).toFixed(4)})`;
        } else {
            winnerMessage = "Ничья";
        }

        document.getElementById('player1_sum').textContent = `Сумма дес. частей (И1): ${sumDecimalPlayer1.toFixed(4)}`;
        document.getElementById('player2_sum').textContent = `Сумма дес. частей (И2): ${sumDecimalPlayer2.toFixed(4)}`;
        document.getElementById('player1_adjusted_sum').textContent = `Скорр. сумма (И1): ${adjustedSumPlayer1.toFixed(4)}`;
        document.getElementById('player2_adjusted_sum').textContent = `Скорр. сумма (И2): ${adjustedSumPlayer2.toFixed(4)}`;
        document.getElementById('winner').textContent = winnerMessage;
        document.getElementById('result').style.display = 'block';
    }
});
