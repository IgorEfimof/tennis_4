document.addEventListener('DOMContentLoaded', function() {
    // Список полей, только текущие коэффициенты
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
                    player1Coeffs.push(NaN); // Добавляем NaN, чтобы сохранить индексы и пропускать невалидные
                    p1Input.classList.remove('is-invalid'); // Если пусто, не помечаем как ошибку
                }

                if (!isNaN(p2Val) && p2Val >= 1.00 && p2Val <= 10.00) {
                    player2Coeffs.push(p2Val);
                    p2Input.classList.remove('is-invalid');
                } else if (p2Input.value.length > 0) {
                    p2Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    player2Coeffs.push(NaN); // Добавляем NaN, чтобы сохранить индексы и пропускать невалидные
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

        // Проверяем, есть ли хотя бы один полный гейм для расчета (Г5 обязательно для начала)
        if (isNaN(player1Coeffs[0]) || isNaN(player2Coeffs[0])) { // Если Г5 не заполнен полностью
            document.getElementById('error').textContent = 'Заполните коэффициенты для Гейма 5, чтобы начать расчет.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }
        
        // Проверяем, есть ли хотя бы одна пара валидных коэффициентов (кроме Г5)
        const hasAnyValidPair = games.slice(1).some((_, index) => // Начиная с Г6 (индекс 1)
            !isNaN(player1Coeffs[index + 1]) && !isNaN(player2Coeffs[index + 1])
        );

        if (!hasAnyValidPair && (isNaN(player1Coeffs[0]) || isNaN(player2Coeffs[0]))) { // Если даже Г5 пуст
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

            // Суммируем десятичные части от ТЕКУЩИХ коэффициентов, только если они валидны
            if (!isNaN(p1Current)) {
                totalDecimalPlayer1 += (p1Current - Math.floor(p1Current));
            }
            if (!isNaN(p2Current)) {
                totalDecimalPlayer2 += (p2Current - Math.floor(p2Current));
            }

            // Расчет разбега начинается с Г6 (индекс 1), т.е. сравниваем текущий гейм с предыдущим
            if (i > 0) { // Для геймов 6, 7, 8, 9, 10
                const p1Previous = player1Coeffs[i - 1];
                const p2Previous = player2Coeffs[i - 1];

                // Разбег считаем только если оба коэффициента (текущий и предыдущий) валидны
                if (!isNaN(p1Previous) && !isNaN(p1Current)) { 
                    const spreadP1 = p1Previous - p1Current; // Положительное, если упал; отрицательное, если вырос
                    if (spreadP1 > 0) { // Кф. снизился
                        totalDecreaseSpreadP1 += spreadP1;
                    } else if (spreadP1 < 0) { // Кф. вырос
                        totalIncreaseSpreadP1 += Math.abs(spreadP1);
                    }
                }

                if (!isNaN(p2Previous) && !isNaN(p2Current)) {
                    const spreadP2 = p2Previous - p2Current;
                    if (spreadP2 > 0) { // Кф. снизился
                        totalDecreaseSpreadP2 += spreadP2;
                    } else if (spreadP2 < 0) { // Кф. вырос
                        totalIncreaseSpreadP2 += Math.abs(spreadP2);
                    }
                }
            }
        }
        
        // Определение общего победителя по сумме десятичных частей
        let overallWinnerMessage;
        let advantageDecimal = 0;
        if (totalDecimalPlayer1 < totalDecimalPlayer2) {
            advantageDecimal = totalDecimalPlayer2 - totalDecimalPlayer1;
            overallWinnerMessage = `Победитель (дес. части): Игрок 1 (преимущество ${advantageDecimal.toFixed(4)})`;
        } else if (totalDecimalPlayer2 < totalDecimalPlayer1) {
            advantageDecimal = totalDecimalPlayer1 - totalDecimalPlayer2;
            overallWinnerMessage = `Победитель (дес. части): Игрок 2 (преимущество ${advantageDecimal.toFixed(4)})`;
        } else {
            overallWinnerMessage = "Десятичные части: Ничья";
        }

        // Анализ разбега для Игрока 1
        let p1SpreadAnalysisMessage = `Игрок 1: ↓ ${totalDecreaseSpreadP1.toFixed(4)} | ↑ ${totalIncreaseSpreadP1.toFixed(4)}. `;
        if (totalDecreaseSpreadP1 < totalIncreaseSpreadP1) {
            p1SpreadAnalysisMessage += `Вероятность победы выше (↓ < ↑)`;
        } else if (totalDecreaseSpreadP1 > totalIncreaseSpreadP1) {
            p1SpreadAnalysisMessage += `Вероятность победы ниже (↓ > ↑)`;
        } else if (totalDecreaseSpreadP1 === 0 && totalIncreaseSpreadP1 === 0) {
            p1SpreadAnalysisMessage += `(Нет изменений Кф.)`;
        } else {
            p1SpreadAnalysisMessage += `(↓ = ↑)`;
        }

        // Анализ разбега для Игрока 2
        let p2SpreadAnalysisMessage = `Игрок 2: ↓ ${totalDecreaseSpreadP2.toFixed(4)} | ↑ ${totalIncreaseSpreadP2.toFixed(4)}. `;
        if (totalDecreaseSpreadP2 < totalIncreaseSpreadP2) {
            p2SpreadAnalysisMessage += `Вероятность победы выше (↓ < ↑)`;
        } else if (totalDecreaseSpreadP2 > totalIncreaseSpreadP2) {
            p2SpreadAnalysisMessage += `Вероятность победы ниже (↓ > ↑)`;
        } else if (totalDecreaseSpreadP2 === 0 && totalIncreaseSpreadP2 === 0) {
            p2SpreadAnalysisMessage += `(Нет изменений Кф.)`;
        } else {
            p2SpreadAnalysisMessage += `(↓ = ↑)`;
        }

        document.getElementById('player1_sum').textContent = `Сумма дес. частей (И1): ${totalDecimalPlayer1.toFixed(4)}`;
        document.getElementById('player2_sum').textContent = `Сумма дес. частей (И2): ${totalDecimalPlayer2.toFixed(4)}`;
        document.getElementById('p1_spread_analysis').textContent = p1SpreadAnalysisMessage;
        document.getElementById('p2_spread_analysis').textContent = p2SpreadAnalysisMessage;
        document.getElementById('overall_winner').textContent = overallWinnerMessage;
        document.getElementById('result').style.display = 'block';
    }

    // Инициализируем расчет при загрузке
    calculateWinner();
});
