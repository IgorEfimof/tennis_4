document.addEventListener('DOMContentLoaded', function() {
    // Список полей, только коэффициенты
    const fields = [
        'g5P1', 'g5P2', 'g6P1', 'g6P2', 'g7P1', 'g7P2',
        'g8P1', 'g8P2', 'g9P1', 'g9P2', 'g10P1', 'g10P2'
    ];

    // Функция для очистки и форматирования коэффициентов (автоматическая точка)
    function handleCoeffInput(e, idx) {
        let input = e.target;
        let val = input.value.replace(/[^\d]/g, ''); // Удаляем все, кроме цифр

        // Если введено 3 цифры, предполагаем формат "1XX" и делаем "1.XX"
        if (val.length === 3) {
            val = val.substring(0, 1) + '.' + val.substring(1, 3);
        } else if (val.length > 3) {
            val = val.substring(0, 1) + '.' + val.substring(1, 3); // Ограничиваем до 1.XX
        }

        input.value = val;

        // Автоматический переход к следующему полю при полном вводе (1.XX)
        // Инициируем переход, если поле заполнено до 1.XX (4 символа)
        if (val.length === 4) {
            if (idx === fields.length - 1) {
                input.blur(); // Убираем фокус с последнего поля
                calculateWinner();
            } else {
                const nextInput = document.getElementById(fields[idx + 1]);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    input.blur();
                    calculateWinner();
                }
            }
        }
        calculateWinner(); // Вызываем расчет при каждом изменении для динамического обновления
    }

    // Функция для обработки вставки коэффициентов (автоматическая точка)
    function handleCoeffPaste(e, idx) {
        e.preventDefault();
        let input = e.target;
        let text = (e.clipboardData || window.clipboardData).getData('text');
        text = text.replace(/[^\d]/g, ''); // Удаляем все, кроме цифр

        if (text.length === 3) {
            text = text.substring(0, 1) + '.' + text.substring(1, 3);
        } else if (text.length > 3) {
            text = text.substring(0, 1) + '.' + text.substring(1, 3); // Ограничиваем до 1.XX
        } else if (text.length === 2) { // Если вставили "85", делаем "1.85"
             text = '1.' + text;
        }


        input.value = text;

        if (text.length === 4) { // После вставки также переходим
            if (idx === fields.length - 1) {
                input.blur();
                calculateWinner();
            } else {
                const nextInput = document.getElementById(fields[idx + 1]);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    input.blur();
                    calculateWinner();
                }
            }
        }
        calculateWinner();
    }

    // Привязываем обработчики событий ко всем полям ввода коэффициентов
    fields.forEach((id, idx) => {
        const input = document.getElementById(id);
        if (input) {
            input.setAttribute('maxlength', '4'); // Макс. длина 4 символа (1.85)
            input.setAttribute('inputmode', 'decimal'); // Числовая клавиатура с точкой для мобильных
            input.classList.add('text-center');
            input.addEventListener('input', (e) => handleCoeffInput(e, idx));
            input.addEventListener('paste', (e) => handleCoeffPaste(e, idx));
            input.addEventListener('keypress', function(event) {
                // Если нажата точка, пропускаем, но не даем вводить более одной
                if (event.key === '.') {
                    if (input.value.includes('.')) {
                        event.preventDefault(); // Не даем вводить вторую точку
                    }
                    return; // Пропускаем дальше
                }
                // Если нажата не цифра и не Backspace, и не Enter
                if (!/\d/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
                    event.preventDefault(); // Запрещаем ввод нецифровых символов (кроме Backspace)
                }

                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (idx === fields.length - 1) {
                        input.blur();
                        calculateWinner();
                    } else {
                        const nextInput = document.getElementById(fields[idx + 1]);
                        if (nextInput) {
                            nextInput.focus();
                        } else {
                            input.blur();
                            calculateWinner();
                        }
                    }
                }
            });
        }
    });

    // Главная функция расчета
    function calculateWinner() {
        let player1Coeffs = [];
        let player2Coeffs = [];
        let allCoeffsValid = true;

        // Фактор влияния разбега. Настройте это значение для определения силы влияния.
        // Чем больше значение, тем сильнее разбег будет влиять на скорректированную сумму.
        const spreadImpactFactor = 0.5; 

        // Собираем коэффициенты для геймов 5-10
        for (let i = 5; i <= 10; i++) {
            const p1CoeffInput = document.getElementById(`g${i}P1`);
            const p2CoeffInput = document.getElementById(`g${i}P2`);

            if (p1CoeffInput && p2CoeffInput) {
                const p1Val = parseFloat(p1CoeffInput.value);
                const p2Val = parseFloat(p2CoeffInput.value);

                // Валидация: коэффициент должен быть числом и быть в адекватном диапазоне (например, от 1.00 до 10.00)
                if (!isNaN(p1Val) && p1Val >= 1.00 && p1Val <= 10.00) { 
                    player1Coeffs.push(p1Val);
                    p1CoeffInput.classList.remove('is-invalid');
                } else if (p1CoeffInput.value.length > 0) { // Если что-то введено, но невалидно
                    p1CoeffInput.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    p1CoeffInput.classList.remove('is-invalid'); // Если пусто, то не ошибка
                }

                if (!isNaN(p2Val) && p2Val >= 1.00 && p2Val <= 10.00) {
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

        // Если есть невалидные коэффициенты, показываем ошибку и не рассчитываем
        if (!allCoeffsValid) {
            document.getElementById('error').textContent = 'Проверьте формат коэффициентов (например, 1.85).';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        // Если нет ни одной пары валидных коэффициентов, то не рассчитываем
        if (player1Coeffs.length === 0 || player2Coeffs.length === 0 || player1Coeffs.length !== player2Coeffs.length) {
            document.getElementById('error').textContent = 'Введите хотя бы одну пару коэффициентов для обоих игроков.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

        let totalDecimalPlayer1 = 0;
        let totalDecimalPlayer2 = 0;
        
        let adjustedSumPlayer1 = 0;
        let adjustedSumPlayer2 = 0;

        // Суммируем десятичные части и корректируем на основе разбега
        for (let i = 0; i < player1Coeffs.length; i++) {
            const coeff1 = player1Coeffs[i];
            const coeff2 = player2Coeffs[i];

            // Суммируем десятичные части
            totalDecimalPlayer1 += (coeff1 - Math.floor(coeff1)); // Берем только дробную часть
            totalDecimalPlayer2 += (coeff2 - Math.floor(coeff2));

            // Рассчитываем разбег
            const spread = Math.abs(coeff1 - coeff2);

            // Применяем влияние разбега
            if (coeff1 < coeff2) { // Если Кф. Игрока 1 ниже (он "сильнее"), уменьшаем его скорректированную сумму
                adjustedSumPlayer1 += (coeff1 - Math.floor(coeff1)) - (spread * spreadImpactFactor);
                adjustedSumPlayer2 += (coeff2 - Math.floor(coeff2)) + (spread * spreadImpactFactor);
            } else if (coeff2 < coeff1) { // Если Кф. Игрока 2 ниже (он "сильнее"), уменьшаем его скорректированную сумму
                adjustedSumPlayer1 += (coeff1 - Math.floor(coeff1)) + (spread * spreadImpactFactor);
                adjustedSumPlayer2 += (coeff2 - Math.floor(coeff2)) - (spread * spreadImpactFactor);
            } else { // Если коэффициенты равны, просто добавляем десятичные части без корректировки разбега
                adjustedSumPlayer1 += (coeff1 - Math.floor(coeff1));
                adjustedSumPlayer2 += (coeff2 - Math.floor(coeff2));
            }
        }
        
        let winnerMessage;
        if (adjustedSumPlayer1 < adjustedSumPlayer2) {
            winnerMessage = `Победитель: Игрок 1 (преимущество ${(adjustedSumPlayer2 - adjustedSumPlayer1).toFixed(4)})`;
        } else if (adjustedSumPlayer2 < adjustedSumPlayer1) {
            winnerMessage = `Победитель: Игрок 2 (преимущество ${(adjustedSumPlayer1 - adjustedSumPlayer2).toFixed(4)})`;
        } else {
            winnerMessage = "Ничья";
        }

        document.getElementById('player1_sum').textContent = `Сумма дес. частей (И1): ${totalDecimalPlayer1.toFixed(4)}`;
        document.getElementById('player2_sum').textContent = `Сумма дес. частей (И2): ${totalDecimalPlayer2.toFixed(4)}`;
        document.getElementById('player1_adjusted_sum').textContent = `Скорр. сумма (И1): ${adjustedSumPlayer1.toFixed(4)}`;
        document.getElementById('player2_adjusted_sum').textContent = `Скорр. сумма (И2): ${adjustedSumPlayer2.toFixed(4)}`;
        document.getElementById('winner').textContent = winnerMessage;
        document.getElementById('result').style.display = 'block';
    }

    // Инициализируем расчет при загрузке
    calculateWinner();
});
