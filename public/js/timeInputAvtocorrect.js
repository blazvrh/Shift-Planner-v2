// ker vpišemo 00:00 ko pritisnemo na prazno, pobrišemo polje on blur, če ni bilo vnosa
var isEmptyOnFocus = false;

function correct_timeInput_onKeyDown (timeInputElement, evt) {
    isEmptyOnFocus = false;
    
    const keyPressed = evt.key;
    const keyPressedNum = Number.parseInt(evt.key);
    const valueWhole = timeInputElement.value;

    // če je izbran text
    if (timeInputElement.selectionStart !== timeInputElement.selectionEnd) {
        if (keyPressed.match(/[0-9]/)) {
            timeInputElement.value = (
                timeInputElement.value.substr(0, timeInputElement.selectionStart) + 
                keyPressed + 
                timeInputElement.value.substr(timeInputElement.selectionEnd));

            correct_timeInputValue_onInput(timeInputElement);
            
            cancelInput(evt);
            
            return;
        }
    }

    // če je pritisnjena številka
    if (keyPressed.match(/[0-9]/)) {
        if (valueWhole.length === 0 && keyPressedNum > 2) {
            timeInputElement.value = "0"+ keyPressed + ":";
        }
        else if (valueWhole.length === 0) {
            timeInputElement.value = keyPressed;
        }
        else if (valueWhole.length === 1) {
            if (Number.parseInt(valueWhole) == "2" && keyPressedNum > 4) {
                if (keyPressedNum < 6) {
                    timeInputElement.value = "0" + valueWhole + ":" + keyPressed;
                }
                else {
                    timeInputElement.value = "0" + valueWhole + ":0" + keyPressed;
                }
            }
            else {
                timeInputElement.value += keyPressed + ":";
            }
        }
        else if (valueWhole.length > 1) {
            if (valueWhole.length === 3 && keyPressedNum > 5) {
                timeInputElement.value += "0" + keyPressed;
            }
            else {
                timeInputElement.value += keyPressed;
            }
            correct_timeInputValue_onInput(timeInputElement);
        }
        cancelInput(evt);
    }
    // če brišemo  
    else if (keyPressed === "Backspace" || keyPressed === "Delete" || keyPressed === "Tab" || keyPressed.match(/Arrow/)) {
        return;
    }
    // če je neveljavna tipka
    else {
        cancelInput(evt);
    }
}

// prekliče samodejen vnos številke
function cancelInput (evt) {
    evt.preventDefault();
}

// popravi čas med inputom
function correct_timeInputValue_onInput (timeInputElement) {
    let timeVal = timeInputElement.value;
    
    timeVal = timeVal.replace(":", "");

    if (timeVal.length > 1) {
        timeVal = timeVal.substr(0,2) + ":" + timeVal.substr(2);
    }
    else if (timeVal.length === 1 && timeVal.match(/[0-9]/)) {
        timeVal = Number.parseInt(timeVal) > 2 ? "0" + timeVal + ":" : timeVal;
    }

    if (timeVal.length > 5) {
        timeVal = timeVal.substr(0,5);
    }

    timeInputElement.value = timeVal;
}

// popravi čas ko končamo input
function correct_timeInputValue_onBlur (timeInputElement) {
    if (isEmptyOnFocus === true) {
        timeInputElement.value = "";
        return;
    }

    const timeVal = timeInputElement.value.replace("[^0-9]", "");

    // če ni vnosa končaj
    if (timeVal === "") return;

    // razdelimo na ure in minute
    const splitedTime = timeVal.split(":");

    let hourValNum = Number.parseInt(splitedTime[0]);
    let minuteValNum = Number.parseInt(splitedTime[1]);

    if (Number.isNaN(hourValNum) || typeof(hourValNum) === undefined) hourValNum = 0;
    if (Number.isNaN(minuteValNum) || typeof(minuteValNum) === undefined) minuteValNum = 0;
    
    if (hourValNum > 24) hourValNum = 0;
    if (minuteValNum > 59) minuteValNum = 0;

    const hourStr = hourValNum > 9 ? hourValNum.toString() : "0" + hourValNum.toString();
    const minuteStr = minuteValNum > 9 ? minuteValNum.toString() : "0" + minuteValNum.toString();

    timeInputElement.value = hourStr + ":" + minuteStr;
}

// izbere celoten text v input fieldu
function select_wholeInputText(inputElement) {
    if (inputElement.value === "") {
        inputElement.value = "00:00";
        isEmptyOnFocus = true;
    }
    inputElement.selectionStart = 0;
    inputElement.selectionEnd = inputElement.value.length;
}

function add_liseners_toTextInputWithTime(inputElement) {
    inputElement.addEventListener('keydown', function (evt) {
        correct_timeInput_onKeyDown(this, evt);
    });
    inputElement.addEventListener('blur', function (evt) {
        correct_timeInputValue_onBlur(this);
    });
    inputElement.addEventListener('focus', function (evt) {
        select_wholeInputText(this);
    });
}