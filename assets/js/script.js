document.addEventListener('DOMContentLoaded', function() {
    // Список полей, теперь только текущие коэффициенты
    const games = [5, 6, 7, 8, 9, 10]; // Номера геймов для итерации
    const fields = games.flatMap(g => [`g${g}P1`, `g${g}P2`]); // ['g5P1', 'g5P2', 'g6P1', 'g6P2', ...]

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
                if (event.key === '.') { // Разрешаем точку, но только одну
                    if (input.value.includes('.')) {
                        event.preventDefault();
                    }
                    return;
                }
                if (!/\d/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
                    event.preventDefault(); // Запрещаем нецифровые символы
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
        let player1Coeffs = []; // Здесь будут храниться все введенные коэффициенты для P1
        let player2Coeffs = []; // Для P2
        let allCoeffsValid = true;

        // Фактор влияния разбега. Возможно, потребуется более высокое значение для заметного влияния.
        // Это значение умножается на сумму разбега.
        const spreadImpactFactor = 2.5; 

        // Собираем коэффициенты для геймов 5-10
        for (let i = 5; i <= 10; i++) {
            const p1Input = document.getElementById(`g${i}P1`);
            const p2Input = document.getElementById(`g${i}P2`);

            if (p1Input && p2Input) {
                const p1Val = parseFloat(p1Input.value);
                const p2Val = parseFloat(p2Input.value);

                // Валидация: коэффициент должен быть числом и быть в адекватном диапазоне (от 1.00 до 10.00)
                if (!isNaN(p1Val) && p1Val >= 1.00 && p1Val <= 10.00) { 
                    player1Coeffs.push(p1Val);
                    p1Input.classList.remove('is-invalid');
                } else if (p1Input.value.length > 0) { // Если что-то введено, но невалидно
                    p1Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    player1Coeffs.push(NaN); // Добавляем NaN, чтобы сохранить индексы
                    p1Input.classList.remove('is-invalid'); // Если пусто, не помечаем как ошибку
                }

                if (!isNaN(p2Val) && p2Val >= 1.00 && p2Val <= 10.00) {
                    player2Coeffs.push(p2Val);
                    p2Input.classList.remove('is-invalid');
                } else if (p2Input.value.length > 0) {
                    p2Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    player2Coeffs.push(NaN); // Добавляем NaN, чтобы сохранить индексы
                    p2Input.classList.remove('is-invalid');
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

        // Проверяем, есть ли хотя бы один полный гейм для расчета
        const hasValidGame = player1Coeffs.some(val => !isNaN(val)) && player2Coeffs.some(val => !isNaN(val));
        if (!hasValidGame) {
            document.getElementById('error').textContent = 'Введите хотя бы одну пару коэффициентов.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

        let totalDecimalPlayer1 = 0;
        let totalDecimalPlayer2 = 0;
        
        let totalDecreaseSpreadP1 = 0; // Сумма разбегов на снижение для Игрока 1
        let totalIncreaseSpreadP1 = 0; // Сумма разбегов на повышение для Игрока 1
        let totalDecreaseSpreadP2 = 0; // Сумма разбегов на снижение для Игрока 2
        let totalIncreaseSpreadP2 = 0; // Сумма разбегов на повышение для Игрока 2

        // Суммируем десятичные части и рассчитываем разбеги
        for (let i = 0; i < games.length; i++) { // Итерируем по индексам геймов (0 для Г5, 1 для Г6 и т.д.)
            const p1Current = player1Coeffs[i];
            const p2Current = player2Coeffs[i];

            // Если текущий коэффициент невалиден, пропускаем его
            if (isNaN(p1Current) || isNaN(p2Current)) continue;

            // Суммируем десятичные части от ТЕКУЩИХ коэффициентов
            totalDecimalPlayer1 += (p1Current - Math.floor(p1Current));
            totalDecimalPlayer2 += (p2Current - Math.floor(p2Current));

            // Расчет разбега начинается с Г6 (индекс 1)
            if (i > 0) {
                const p1Previous = player1Coeffs[i - 1];
                const p2Previous = player2Coeffs[i - 1];

                if (!isNaN(p1Previous) && !isNaN(p2Previous)) { // Только если предыдущий кф. тоже валиден
                    // Разбег для Игрока 1: (Кф. предыдущего гейма - Кф. текущего гейма)
                    const spreadP1 = p1Previous - p1Current; 
                    if (spreadP1 > 0) { // Кф. снизился
                        totalDecreaseSpreadP1 += spreadP1;
                    } else if (spreadP1 < 0) { // Кф. вырос
                        totalIncreaseSpreadP1 += Math.abs(spreadP1);
                    }

                    // Разбег для Игрока 2
                    const spreadP2 = p2Previous - p2Current;
                    if (spreadP2 > 0) { // Кф. снизился
                        totalDecreaseSpreadP2 += spreadP2;
                    } else if (spreadP2 < 0) { // Кф. вырос
                        totalIncreaseSpreadP2 += Math.abs(spreadP2);
                    }
                }
            }
        }

        // Финальная скорректированная сумма
        // "Если у игрока сумма меньше и разбег в сторону понижения больше, то вероятность его выигрыша больше и наоборот."
        // Значит, разбег на снижение уменьшает скорректированную сумму (усиливает игрока)
        // Разбег на повышение увеличивает скорректированную сумму (ослабляет игрока)
        let adjustedSumPlayer1 = totalDecimalPlayer1 - (totalDecreaseSpreadP1 * spreadImpactFactor) + (totalIncreaseSpreadP1 * spreadImpactFactor);
        let adjustedSumPlayer2 = totalDecimalPlayer2 - (totalDecreaseSpreadP2 * spreadImpactFactor) + (totalIncreaseSpreadP2 * spreadImpactFactor);
        
        let winnerMessage;
        let advantage = 0;

        if (adjustedSumPlayer1 < adjustedSumPlayer2) {
            advantage = adjustedSumPlayer2 - adjustedSumPlayer1;
            winnerMessage = `Победитель: Игрок 1 (преимущество ${advantage.toFixed(4)})`;
        } else if (adjustedSumPlayer2 < adjustedSumPlayer1) {
            advantage = adjustedSumPlayer1 - adjustedSumPlayer2;
            winnerMessage = `Победитель: Игрок 2 (преимущество ${advantage.toFixed(4)})`;
        } else {
            winnerMessage = "Ничья";
        }

        document.getElementById('player1_sum').textContent = `Сумма дес. частей (И1): ${totalDecimalPlayer1.toFixed(4)}`;
        document.getElementById('player2_sum').textContent = `Сумма дес. частей (И2): ${totalDecimalPlayer2.toFixed(4)}`;
        document.getElementById('player1_total_decrease_spread').textContent = `Разбег ↓ (И1): ${totalDecreaseSpreadP1.toFixed(4)}`;
        document.getElementById('player2_total_decrease_spread').textContent = `Разбег ↓ (И2): ${totalDecreaseSpreadP2.toFixed(4)}`;
        document.getElementById('player1_total_increase_spread').textContent = `Разбег ↑ (И1): ${totalIncreaseSpreadP1.toFixed(4)}`;
        document.getElementById('player2_total_increase_spread').textContent = `Разбег ↑ (И2): ${totalIncreaseSpreadP2.toFixed(4)}`;
        document.getElementById('winner').textContent = winnerMessage;
        document.getElementById('result').style.display = 'block';
    }

    // Инициализируем расчет при загрузке
    calculateWinner();
});
