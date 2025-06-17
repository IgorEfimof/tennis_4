document.addEventListener('DOMContentLoaded', function() {
    // Список всех полей, включая 12 коэффициентов
    const fields = [
        'currentGamesP1', 'currentGamesP2', 'currentGamePointsP1', 'currentGamePointsP2',
        'g5P1', 'g5P2', 'g6P1', 'g6P2', 'g7P1', 'g7P2',
        'g8P1', 'g8P2', 'g9P1', 'g9P2', 'g10P1', 'g10P2'
    ];

    // Функция для очистки и форматирования коэффициентов (автоматическое добавление "1.")
    function handleCoeffInput(e, idx) {
        let input = e.target;
        // Очищаем от всего, кроме цифр
        let val = input.value.replace(/[^\d]/g, '');

        if (val.length > 2) {
            val = val.slice(0, 2); // Ограничиваем до двух цифр
        }

        // Если введены две цифры, форматируем в "1.XX"
        if (val.length === 2) {
            input.value = `1.${val}`;
        } else {
            input.value = val; // Иначе оставляем как есть
        }

        // Переход на следующее поле или запуск расчета
        if (val.length === 2) { // Проверяем, что введены 2 цифры
            if (idx === fields.length - 1) {
                input.blur(); // Убираем фокус с последнего поля
                calculateWinner();
            } else {
                let nextInputFound = false;
                for (let i = idx + 1; i < fields.length; i++) {
                    const nextInput = document.getElementById(fields[i]);
                    if (nextInput) { // Просто переходим к следующему полю в списке
                        nextInput.focus();
                        nextInputFound = true;
                        break;
                    }
                }
                if (!nextInputFound) { // Если следующее поле не найдено (хотя такого быть не должно)
                    input.blur();
                    calculateWinner();
                }
            }
        }
        calculateWinner(); // Также вызываем расчет при каждом изменении, чтобы динамически обновлять
    }

    // Функция для обработки вставки коэффициентов (также форматируем в "1.XX")
    function handleCoeffPaste(e, idx) {
        e.preventDefault();
        let input = e.target;
        let text = (e.clipboardData || window.clipboardData).getData('text');
        text = text.replace(/[^\d]/g, ''); // Очищаем от всего, кроме цифр

        if (text.length > 2) {
            text = text.slice(0, 2); // Ограничиваем до двух цифр
        }

        if (text.length === 2) {
            input.value = `1.${text}`;
        } else {
            input.value = text;
        }

        if (text.length === 2) {
            if (idx === fields.length - 1) {
                input.blur();
                calculateWinner();
            } else {
                let nextInputFound = false;
                for (let i = idx + 1; i < fields.length; i++) {
                    const nextInput = document.getElementById(fields[i]);
                    if (nextInput) {
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
        calculateWinner();
    }

    fields.forEach((id, idx) => {
        const input = document.getElementById(id);
        if (input) {
            if (input.type === 'text') { // Применяем только к текстовым полям (коэффициентам)
                input.setAttribute('maxlength', '2'); // Теперь 2 символа
                input.setAttribute('inputmode', 'decimal');
                input.classList.add('text-center');
                input.addEventListener('input', (e) => handleCoeffInput(e, idx));
                input.addEventListener('paste', (e) => handleCocoeffPaste(e, idx));
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
                                if (nextInput) {
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

    // Функция для обновления информации о текущем гейме (упрощенная)
    function updateGameInfo() {
        const currentGamesP1 = parseInt(document.getElementById('currentGamesP1').value) || 0;
        const currentGamesP2 = parseInt(document.getElementById('currentGamesP2').value) || 0;
        const currentGamePointsP1 = parseInt(document.getElementById('currentGamePointsP1').value) || 0;
        const currentGamePointsP2 = parseInt(document.getElementById('currentGamePointsP2').value) || 0;

        let gameNumber = currentGamesP1 + currentGamesP2 + 1;

        const gameInfoSpan = document.getElementById('current_game_info');
        if (gameInfoSpan) {
            let infoText = `Гейм ${gameNumber}`;
            if (currentGamePointsP1 > 0 || currentGamePointsP2 > 0) {
                infoText += ` (счет ${currentGamePointsP1}-${currentGamePointsP2})`;
            } else {
                infoText += ` (0-0)`; // Показываем 0-0 если очки не введены
            }
            gameInfoSpan.textContent = infoText;
        }
    }


    // Главная функция расчета
    function calculateWinner() {
        updateGameInfo(); // Обновляем информацию о гейме

        let player1Coeffs = [];
        let player2Coeffs = [];
        let allCoeffsValid = true; // Будем проверять на валидность

        const currentGamesP1 = parseInt(document.getElementById('currentGamesP1').value) || 0;
        const currentGamesP2 = parseInt(document.getElementById('currentGamesP2').value) || 0;
        const currentGamePointsP1 = parseInt(document.getElementById('currentGamePointsP1').value) || 0;
        const currentGamePointsP2 = parseInt(document.getElementById('currentGamePointsP2').value) || 0;
        const servingPlayer = document.querySelector('input[name="servingPlayer"]:checked').value;

        // Собираем коэффициенты для геймов 5-10
        for (let i = 5; i <= 10; i++) {
            const p1CoeffInput = document.getElementById(`g${i}P1`);
            const p2CoeffInput = document.getElementById(`g${i}P2`);

            if (p1CoeffInput && p2CoeffInput) {
                const p1Val = parseFloat(p1CoeffInput.value);
                const p2Val = parseFloat(p2CoeffInput.value);

                // Если поле пустое или не является числом, оно невалидно.
                // Но мы не хотим выводить ошибку, если пользователь просто не ввел все 12.
                // Просто игнорируем невалидные коэффициенты в расчете.
                if (!isNaN(p1Val) && p1Val >= 1.00 && p1Val < 2.00) { // Проверяем на адекватность кф
                    player1Coeffs.push(p1Val);
                    p1CoeffInput.classList.remove('is-invalid');
                } else if (p1CoeffInput.value.length > 0) { // Если что-то введено, но невалидно
                    p1CoeffInput.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    p1CoeffInput.classList.remove('is-invalid'); // Если пусто, то не ошибка
                }

                if (!isNaN(p2Val) && p2Val >= 1.00 && p2Val < 2.00) {
                    player2Coeffs.push(p2Val);
                    p2CoeffInput.classList.remove('is-invalid');
                } else if (p2CoeffInput.value.length > 0) {
                    p2CoeffInput.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    p2CoeffInput.classList.remove('is-invalid');
                }
            }
        }

        // Если введены невалидные коэффициенты, показываем ошибку
        if (!allCoeffsValid) {
            document.getElementById('error').textContent = 'Проверьте введенные коэффициенты (например, "85" для 1.85).';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        // Если нет ни одного валидного коэффициента, то не рассчитываем
        if (player1Coeffs.length === 0 || player2Coeffs.length === 0) {
            document.getElementById('error').textContent = 'Введите хотя бы одну пару коэффициентов.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }


        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

        // Суммируем десятичные части всех введенных коэффициентов
        const sumDecimalPlayer1 = player1Coeffs.reduce((sum, coeff) => sum + (coeff % 1), 0);
        const sumDecimalPlayer2 = player2Coeffs.reduce((sum, coeff) => sum + (coeff % 1), 0);

        let adjustedSumPlayer1 = sumDecimalPlayer1;
        let adjustedSumPlayer2 = sumDecimalPlayer2;

        const gameDiff = currentGamesP1 - currentGamesP2;
        const gameWeight = 0.04;
        if (gameDiff > 0) {
            adjustedSumPlayer1 -= gameDiff * gameWeight;
            adjustedSumPlayer2 += gameDiff * gameWeight;
        } else if (gameDiff < 0) {
            adjustedSumPlayer2 -= Math.abs(gameDiff) * gameWeight;
            adjustedSumPlayer1 += Math.abs(gameDiff) * gameWeight;
        }

        const pointDiff = currentGamePointsP1 - currentGamePointsP2;
        const pointWeight = 0.008;
        if (pointDiff > 0) {
            adjustedSumPlayer1 -= pointDiff * pointWeight;
            adjustedSumPlayer2 += pointDiff * pointWeight;
        } else if (pointDiff < 0) {
            adjustedSumPlayer2 -= Math.abs(pointDiff) * pointWeight;
            adjustedSumPlayer1 += Math.abs(pointDiff) * pointWeight;
        }

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

    // Инициализируем расчет при загрузке, чтобы показать актуальную информацию
    calculateWinner();
});
