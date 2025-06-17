document.addEventListener('DOMContentLoaded', function() {
    // Список полей, теперь пары "Initial" и "Current" для каждого игрока
    const fields = [];
    for (let i = 5; i <= 10; i++) {
        fields.push(`g${i}P1Initial`);
        fields.push(`g${i}P1Current`);
        fields.push(`g${i}P2Initial`);
        fields.push(`g${i}P2Current`);
    }

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
        let player1CurrentCoeffs = [];
        let player2CurrentCoeffs = [];
        let player1InitialCoeffs = [];
        let player2InitialCoeffs = [];
        
        let allCoeffsValid = true;

        // Фактор влияния разбега. Настройте это значение для определения силы влияния.
        // Чем больше значение, тем сильнее разбег будет влиять на скорректированную сумму.
        const spreadImpactFactor = 2.0; // Возможно, потребуется более высокое значение для заметного влияния

        // Собираем коэффициенты для геймов 5-10
        for (let i = 5; i <= 10; i++) {
            const p1InitialInput = document.getElementById(`g${i}P1Initial`);
            const p1CurrentInput = document.getElementById(`g${i}P1Current`);
            const p2InitialInput = document.getElementById(`g${i}P2Initial`);
            const p2CurrentInput = document.getElementById(`g${i}P2Current`);

            const inputs = [p1InitialInput, p1CurrentInput, p2InitialInput, p2CurrentInput];

            inputs.forEach(input => {
                if (!input) return; // Пропускаем, если поле не найдено

                const val = parseFloat(input.value);
                // Валидация: коэффициент должен быть числом и быть в адекватном диапазоне (от 1.00 до 10.00)
                if (!isNaN(val) && val >= 1.00 && val <= 10.00) { 
                    input.classList.remove('is-invalid');
                } else if (input.value.length > 0) { // Если что-то введено, но невалидно
                    input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    input.classList.remove('is-invalid'); // Если пусто, то не ошибка
                }
            });

            // Добавляем значения только если они валидны и присутствуют оба
            if (!isNaN(parseFloat(p1InitialInput.value)) && !isNaN(parseFloat(p1CurrentInput.value)) &&
                !isNaN(parseFloat(p2InitialInput.value)) && !isNaN(parseFloat(p2CurrentInput.value)) &&
                p1InitialInput.value.length > 0 && p1CurrentInput.value.length > 0 &&
                p2InitialInput.value.length > 0 && p2CurrentInput.value.length > 0) {
                
                player1InitialCoeffs.push(parseFloat(p1InitialInput.value));
                player1CurrentCoeffs.push(parseFloat(p1CurrentInput.value));
                player2InitialCoeffs.push(parseFloat(p2InitialInput.value));
                player2CurrentCoeffs.push(parseFloat(p2CurrentInput.value));
            } else if (p1InitialInput.value.length > 0 || p1CurrentInput.value.length > 0 ||
                       p2InitialInput.value.length > 0 || p2CurrentInput.value.length > 0) {
                // Если хоть одно поле в гейме заполнено, но пара не полная, считаем невалидным
                allCoeffsValid = false;
            }
        }

        // Если есть невалидные коэффициенты, показываем ошибку и не рассчитываем
        if (!allCoeffsValid) {
            document.getElementById('error').textContent = 'Проверьте формат или полноту ввода коэффициентов (например, 1.85). Все поля для гейма должны быть заполнены.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        // Если нет ни одной полной пары валидных коэффициентов, то не рассчитываем
        if (player1CurrentCoeffs.length === 0) {
            document.getElementById('error').textContent = 'Введите хотя бы одну полную пару коэффициентов (начальный и текущий) для обоих игроков.';
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
        for (let i = 0; i < player1CurrentCoeffs.length; i++) {
            const p1Initial = player1InitialCoeffs[i];
            const p1Current = player1CurrentCoeffs[i];
            const p2Initial = player2InitialCoeffs[i];
            const p2Current = player2CurrentCoeffs[i];

            // Суммируем десятичные части от ТЕКУЩИХ коэффициентов
            totalDecimalPlayer1 += (p1Current - Math.floor(p1Current));
            totalDecimalPlayer2 += (p2Current - Math.floor(p2Current));

            // Расчет разбега для Игрока 1
            const spreadP1 = p1Initial - p1Current; // Положительное, если упал; отрицательное, если вырос
            if (spreadP1 > 0) {
                totalDecreaseSpreadP1 += spreadP1;
            } else if (spreadP1 < 0) {
                totalIncreaseSpreadP1 += Math.abs(spreadP1); // Учитываем абсолютное значение роста
            }

            // Расчет разбега для Игрока 2
            const spreadP2 = p2Initial - p2Current; // Положительное, если упал; отрицательное, если вырос
            if (spreadP2 > 0) {
                totalDecreaseSpreadP2 += spreadP2;
            } else if (spreadP2 < 0) {
                totalIncreaseSpreadP2 += Math.abs(spreadP2);
            }
        }

        // Финальная скорректированная сумма
        // Чем больше разбег на снижение, тем "лучше" игрок, значит, его сумма должна уменьшаться.
        // Чем больше разбег на повышение, тем "хуже" игрок, значит, его сумма должна увеличиваться.
        let adjustedSumPlayer1 = totalDecimalPlayer1 - (totalDecreaseSpreadP1 * spreadImpactFactor) + (totalIncreaseSpreadP1 * spreadImpactFactor);
        let adjustedSumPlayer2 = totalDecimalPlayer2 - (totalDecreaseSpreadP2 * spreadImpactFactor) + (totalIncreaseSpreadP2 * spreadImpactFactor);
        
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
