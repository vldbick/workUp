sessionStorage.clear();

const inputsList = {
    sprintTime: document.querySelector('#time-focus'),
    shortBreak: document.querySelector('#time-shortBreak'),
    longBreak: document.querySelector('#time-longBreak'),
    periodsLongBreak: document.querySelector('#period-longBreak')
}


const modal = document.querySelector('.c-modal'),
    clockFace = document.querySelector('.p-timer');

main()


document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Предотвратить стандартное действие Enter
        // Добавьте здесь свой код для обработки нажатия Enter на кнопке
    }
});

document.querySelector('.s-modal__body').addEventListener('change', (ev) => {
    if (ev.target.value <= 0) {
        ev.target.value = 1;
    }
});

modal.addEventListener('click', (ev) => {
    ev.preventDefault();

    const tarClass = ev.target.className;
    if (tarClass.includes('modal-closer')) {
        document.querySelector('.c-modal').classList.add('hide');
        getInputValue(inputsList);
    }
})

// взаимодействие с верхней панелькой таймера

document.querySelector('.p-timer__head').addEventListener('click', (ev) => {
    const tar = ev.target,
        tit = ev.target.title;

    if (tit === 'Setting') {
        modal.classList.remove('hide');
    } else if (tit === 'Full Screen') {
        if (document.fullscreenElement === null) {
            const el = document.documentElement;
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        console.log(tit);
    }
})

// взаимодействие с кнопками старт и стоп




function main() {
    const modeOptional = {
        classic: [25, 5, 15, 4],
        personal: [30, 2, 25, 4],
        work: [50, 10, 20, 2]
    }

    writeMode(modeOptional.classic);
    writeTime([modeOptional.classic[0], 60]);
    showTimer(modeOptional.classic[0]);
    showStepsForRest(modeOptional.classic[3])


    createButtonModeOptional(modeOptional);
    fillingInputInSetting(inputsList, modeOptional.classic)
}

// функция, которая делает кнопки modeOptional

function createButtonModeOptional(modes) {
    const buttonHolder = document.querySelector('.smb-options-mode');
    const buttonsArray = Object.entries(modes);
    for (let i = 0; i < buttonsArray.length; i++) {
        const b = document.createElement('button');
        b.textContent = `${buttonsArray[i][0]}:${buttonsArray[i][1].join(' ')}`;
        buttonHolder.appendChild(b);
    }
    const b = document.createElement('button');
    b.disabled = true;
    b.textContent = '+';
    b.id = 'adderModes';
    buttonHolder.appendChild(b);

    buttonHolder.addEventListener('click', (ev) => {
        ev.preventDefault();
        let cur;
        const char = ev.target.textContent.indexOf(':') + 1;
        cur = ev.target.textContent.slice(char).split(' ');
        fillingInputInSetting(inputsList, cur);

    })
}

// функция, которая заполняет инпуты в настройках

function fillingInputInSetting(inputs, curMode) {
    const inputsListArray = Object.entries(inputs);
    for (let i = 0; i < curMode.length; i++) {
        inputsListArray[i][1].value = curMode[i];
    }

}


// функции для работы с текущим модом и 
// текущим временем в таймеречерез sessionStorage работает через массив

function readMode() {
    const str = sessionStorage.getItem('currentMode');
    const arr = str.split(',');
    return arr;
}

function writeMode(arr) {
    sessionStorage.setItem('currentMode', arr);
}

function readTime() {
    const str = sessionStorage.getItem('currentTime');
    const arr = str.split(',');
    return arr;
}

function writeTime(arr) {
    sessionStorage.setItem('currentTime', arr);
}

// получаем значения с инпутов, что в модалке 

function getInputValue(listInputs) {
    const inputsListArray = Object.entries(listInputs);
    let curMode = readMode()
    for (let i = 0; i < curMode.length; i++) {
        curMode[i] = inputsListArray[i][1].value;
    }
    writeMode(curMode);
    writeTime([curMode[0], 60]);
    showStepsForRest(curMode[3]);
    showTimer(curMode[0]);
}

// вывод цифер в циферблат

function showTimer(minutes, seconds = '0', place = clockFace) {
    let finMin, finSec;
    if (seconds < 10) {
        finSec = `0${seconds}`;
    } else {
        finSec = seconds;
    }

    if (minutes < 10) {
        finMin = `0${minutes}`
    } else {
        finMin = minutes
    }
    place.textContent = `${finMin}:${finSec}`;
}

// функция, которая будет обрабатывать логику таймера с момента запуска

let stateTimer;
let stateMode = 'work';
const tim = document.querySelector('.pomodoro-timer');
const audio = new Audio('../audio/new_message_notice.mp3')

document.querySelector('.p-timer__buttons').addEventListener('click', (ev) => {
    const start = document.querySelector('#start-timer'),
        stop = document.querySelector('#stop-timer');

    const curMode = readMode();

    if (stateMode === 'work') {

        if (ev.target == start) {
            if (start.title === 'start') {
                stateTimer = timerLogic();
                stop.disabled = false;
                start.textContent = 'ПАУЗА';
                start.title = 'pause';
            } else if (start.title === 'pause') {
                clearInterval(stateTimer);
                let timeArray = clockFace.textContent.split(':');
                writeTime(timeArray);
                start.textContent = 'ПРОДОЛЖИТЬ';
                start.title = 'continue';

                stop.textContent = 'СДЕЛАНО';
                stop.title = 'done';
            } else if (start.title === 'continue') {
                stop.textContent = 'СТОП';
                stop.title = 'stop';
                start.textContent = 'ПАУЗА';
                start.title = 'pause';
                stateTimer = timerLogic();
            }
        }

        if (ev.target == stop) {
            if (stop.title === 'stop') {
                clearInterval(stateTimer);
                showTimer(curMode[0]);

                start.textContent = 'СТАРТ';
                start.title = 'start';
            }
            if (stop.title === 'done') {
                curMode[3] = curMode[3] - 1;
                writeMode(curMode);
                showStepsForRest(curMode[3])
                stateMode = 'break';
                start.textContent = 'ПАУЗА';
                start.title = 'pause';

                stop.textContent = 'ПРОПУСТИТЬ';
                stop.title = 'next';
                showTimer(curMode[1]);
                if (curMode[3] < 1) {
                    writeTime([curMode[2], 60]);
                } else {
                    writeTime([curMode[1], 60]);
                }

                audio.play()
                tim.classList.add('pt-break');
                stateTimer = timerLogic();
            }

        }
    } else if (stateMode === 'break') {
        if (ev.target == start) {
            if (start.title === 'start') {
                stateTimer = timerLogic()
                start.textContent = 'ПАУЗА';
                start.title = 'pause';
            } else if (start.title === 'pause') {
                clearInterval(stateTimer);
                let timeArray = clockFace.textContent.split(':')
                writeTime(timeArray);
                start.textContent = 'ПРОДОЛЖИТЬ';
                start.title = 'continue';
            } else if (start.title === 'continue') {
                start.textContent = 'ПАУЗА';
                start.title = 'pause';
                stateTimer = timerLogic();
            }
        }

        if (ev.target == stop) {
            if (stop.title === 'next') {
                clearInterval(stateTimer);
                showTimer(curMode[0]);
                writeTime([curMode[0], 60])
                stateMode = 'work';

                start.textContent = 'СТАРТ';
                start.title = 'start';

                stop.textContent = 'СТОП';
                stop.title = 'stop';
                stop.disabled = true;
                audio.play();
                tim.classList.remove('pt-break');
                showStepsForRest(curMode[3]);
            }

        }
    }



})

function timerLogic() {
    const startHolder = document.querySelector('#start-timer'),
        stopHolder = document.querySelector('#stop-timer');
    let curMode = readMode();
    let curTime = readTime();
    if (stateMode === 'work') {
        let minutes = Number.parseInt(curTime[0]),
            seconds = Number.parseInt(curTime[1]);
        if (seconds === 60) {
            seconds--
            minutes--
        }

        showTimer(minutes, seconds);

        const mainLoop = setInterval(() => {
            seconds--

            if (seconds < 0) {
                seconds = 59;
                minutes--;
            }


            showTimer(minutes, seconds);

            if (minutes <= 0 && seconds <= 0) {
                clearInterval(mainLoop);
                curMode[3] = curMode[3] - 1;
                writeMode(curMode);
                showStepsForRest(curMode[3])
                stateMode = 'break';
                if (curMode[3] < 1) {
                    writeTime([curMode[2], 60]);
                } else {
                    writeTime([curMode[1], 60]);
                }
                audio.play();
                tim.classList.add('pt-break');
                stateTimer = timerLogic();

                stopHolder.textContent = 'ПРОПУСТИТЬ';
                stopHolder.title = 'next';
            }

        }, 1000)

        return mainLoop;
    } else if (stateMode === 'break') {
        if (curMode[3] < 1) {
            showStepsForRest('СДЕЛАЙТЕ ДЛИННЫЙ ПЕРЕРЫВ');
        } else {
            showStepsForRest('СДЕЛАЙТЕ КОРОТКИЙ ПЕРЕРЫВ');
        }
        let minutes = Number.parseInt(curTime[0]),
            seconds = Number.parseInt(curTime[1]);
        if (seconds === 60) {
            seconds--
            minutes--
        }
        showTimer(minutes, seconds);

        const mainLoop = setInterval(() => {
            seconds--

            if (seconds < 0) {
                seconds = 59;
                minutes--;
            }


            showTimer(minutes, seconds);

            if (minutes <= 0 && seconds <= 0) {
                clearInterval(mainLoop);
                stateMode = 'work';
                audio.play();
                writeTime([curMode[0], 60]);
                showTimer(curMode[0])
                tim.classList.remove('pt-break');

                stopHolder.textContent = 'СТОП';
                stopHolder.title = 'stop';
                stopHolder.disabled = true;

                startHolder.textContent = 'СТАРТ';
                startHolder.title = 'start';
                showStepsForRest(curMode[3]);

            }

        }, 1000)

        return mainLoop;
    }

}

// вывод шагов до длинного отдыха

function showStepsForRest(steps) {
    const holder = document.querySelector('.steps-to-long-break');
    holder.textContent = `(${steps})`
}




