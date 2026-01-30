document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Select Elements
    const form = document.getElementById('calcForm');
    const inputAttempted = document.getElementById('totalAttempted');
    const inputWrong = document.getElementById('wrongAnswers');
    const inputMarksCorrect = document.getElementById('marksCorrect');
    const inputMarksWrong = document.getElementById('marksWrong');
    const calculateBtn = document.getElementById('calculateBtn');
    
    const resultBox = document.getElementById('result-box');
    const resetBtn = document.getElementById('resetBtn');
    
    const displayScore = document.getElementById('finalScore');
    const displayCorrect = document.getElementById('correctCount');
    const displayWrong = document.getElementById('wrongCount');
    const displayAccuracy = document.getElementById('accuracyVal');

    // 2. State: Is the calculator in "Auto Mode" yet?
    let isAutoMode = false;

    // 3. The Calculation Function
    function calculate() {
        // Parse Inputs (Default to 0 if empty)
        const total = parseFloat(inputAttempted.value) || 0;
        const wrong = parseFloat(inputWrong.value) || 0;
        const marksPerCorrect = parseFloat(inputMarksCorrect.value) || 0;
        const penaltyPerWrong = parseFloat(inputMarksWrong.value) || 0;

        // Validation: Logic Check
        if (wrong > total) {
            alert("Wrong answers cannot be more than Total Attempted!");
            return;
        }

        // Math Logic
        const correct = total - wrong;
        const positiveScore = correct * marksPerCorrect;
        const negativeScore = wrong * penaltyPerWrong;
        const finalScore = positiveScore - negativeScore;
        
        // Accuracy Logic
        let accuracy = 0;
        if (total > 0) {
            accuracy = (correct / total) * 100;
        }

        // Update UI
        displayScore.textContent = finalScore.toFixed(2); // Two decimals
        displayCorrect.textContent = correct;
        displayWrong.textContent = wrong;
        displayAccuracy.textContent = accuracy.toFixed(1) + "%";

        // Show Result Box (if hidden)
        if (resultBox.style.display !== 'block') {
            resultBox.style.display = 'block';
            calculateBtn.style.display = 'none'; // Optional: Hide button to reduce clutter
        }

        // Enable Auto Mode
        isAutoMode = true;
    }

    // 4. Reset Function
    function resetTool() {
        form.reset(); // Clears inputs
        isAutoMode = false;
        resultBox.style.display = 'none';
        calculateBtn.style.display = 'block'; // Bring button back
        
        // Reset defaults if needed (Form reset handles value, but good to be safe)
        inputMarksCorrect.value = "4";
        inputMarksWrong.value = "1";
    }

    // 5. Event Listeners
    
    // A. Click "Calculate"
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload
        calculate();
    });

    // B. Input Changes (Hybrid Auto-Calc)
    const inputs = [inputAttempted, inputWrong, inputMarksCorrect, inputMarksWrong];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (isAutoMode) {
                calculate();
            }
        });
    });

    // C. Click "Reset"
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submit
        resetTool();
    });

});
