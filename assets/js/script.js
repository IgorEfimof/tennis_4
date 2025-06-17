document.addEventListener('DOMContentLoaded', function() {
    // Добавлен 'matchFormat' в список полей, чтобы он тоже вызывал пересчет
    const fields = [
        'matchFormat', // Новое поле
        'currentGamesP1', 'currentGamesP2', 'currentGamePointsP1', 'currentGamePointsP2',
        'gNextP1', 'gNextP2'
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
            if (input.type === 'text') {
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
                // Добавил event listener для радио-кнопок matchFormat
                input.addEventListener('input', calculateWinner);
                input.addEventListener('change', calculateWinner); // Для радио кнопок
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

    // Функция для обновления информации о текущем гейме и его статусе
    function updateGameInfo() {
        const currentGamesP1 = parseInt(document.getElementById('currentGamesP1').value) || 0;
        const currentGamesP2 = parseInt(document.getElementById('currentGamesP2').value) || 0;
        const currentGamePointsP1 = parseInt(document.getElementById('currentGamePointsP1').value) || 0;
        const currentGamePointsP2 = parseInt(document.getElementById('currentGamePointsP2').value) || 0;

        // Определяем формат матча (до 3 или до 4 побед)
        const gamesToWin = parseInt(document.querySelector('input[name="matchFormat"]:checked').value) || 3; // По умолчанию до 3 побед

        let gameNumber = currentGamesP1 + currentGamesP2 + 1; // Номер гейма, который сейчас идет или будет следующим

        const gameInfoSpan = document.getElementById('current_game_info');
        if (gameInfoSpan) {
            let infoText = `Гейм ${gameNumber}`;

            // Проверяем, является ли текущий гейм потенциально решающим
            const maxGamesForMatch = (gamesToWin * 2) - 1; // Максимальное количество геймов в матче (например, для 3 побед это 2*3-1=5 геймов)
            const gamesRemainingForP1 = gamesToWin - currentGamesP1;
            const gamesRemainingForP2 = gamesToWin - currentGamesP2;

            if (gameNumber > maxGamesForMatch) {
                // Если счет по геймам уже превысил максимальное количество геймов для матча
                // (например, если было 2-2, а играют до 3 побед, и начался 5 гейм - это решающий)
                if (Math.max(currentGamesP1, currentGamesP2) === (gamesToWin - 1) &&
                    Math.min(currentGamesP1, currentGamesP2) === (gamesToWin - 1)) {
                    infoText += ` (Решающий гейм)`;
                } else if (Math.max(currentGamesP1, currentGamesP2) === gamesToWin) {
                     infoText = `Матч завершен: И1 ${currentGamesP1}-${currentGamesP2} И2`;
                     // Возможно, здесь стоит отключить поля ввода кф и результат
                }
            } else if (currentGamesP1 === (gamesToWin - 1) && currentGamesP2 === (gamesToWin - 1)) {
                 // Например, 2-2 при формате "До 3 побед" - это 5-й гейм, он решающий
                infoText += ` (Решающий гейм)`;
            } else if (currentGamesP1 === (gamesToWin - 1) && currentGamesP2 < (gamesToWin - 1)) {
                // Игрок 1 в одном гейме от победы
                 infoText += ` (Матчбол И1)`;
            } else if (currentGamesP2 === (gamesToWin - 1) && currentGamesP1 < (gamesToWin - 1)) {
                // Игрок 2 в одном гейме от победы
                 infoText += ` (Матчбол И2)`;
            }

            // Добавляем счет по очкам, если гейм уже идет
            if (currentGamePointsP1 > 0 || currentGamePointsP2 > 0) {
                infoText += ` (счет ${currentGamePointsP1}-${currentGamePointsP2})`;
            } else if (gameNumber <= maxGamesForMatch) {
                 infoText += ` (следующий гейм)`; // Только если матч еще не завершен
            }

            gameInfoSpan.textContent = infoText;
        }
    }

    // Вызываем updateGameInfo при каждом расчете и при загрузке
    function calculateWinner() {
        updateGameInfo(); // Обновляем информацию о гейме перед расчетом

        let player1Coeffs = [], player2Coeffs = [];
        let allCoeffsFilled = true;

        const currentGamesP1 = parseInt(document.getElementById('currentGamesP1').value) || 0;
        const currentGamesP2 = parseInt(document.getElementById('currentGamesP2').value) || 0;

        const currentGamePointsP1 = parseInt(document.getElementById('currentGamePointsP1').value) || 0;
        const currentGamePointsP2 = parseInt(document.getElementById('currentGamePointsP2').value) || 0;

        const servingPlayer = document.querySelector('input[name="servingPlayer"]:checked').value;
        const gamesToWin = parseInt(document.querySelector('input[name="matchFormat"]:checked').value) || 3;

        // Проверка на завершение матча
        if (currentGamesP1 >= gamesToWin || currentGamesP2 >= gamesToWin) {
            document.getElementById('error').textContent = 'Матч уже завершен.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            // Дополнительно можно отключить поля ввода коэффициентов
            document.getElementById('gNextP1').disabled = true;
            document.getElementById('gNextP2').disabled = true;
            return;
        } else {
             document.getElementById('gNextP1').disabled = false;
             document.getElementById('gNextP2').disabled = false;
        }

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
            allCoeffsFilled = false;
        }

        if (!allCoeffsFilled || player1Coeffs.length < 1) {
            document.getElementById('error').textContent = 'Заполните коэффициенты на гейм в формате X.XX';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

        const sumDecimalPlayer1 = player1Coeffs[0] % 1;
        const sumDecimalPlayer2 = player2Coeffs[0] % 1;

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
});
