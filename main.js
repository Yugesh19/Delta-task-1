const cols = {0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H"};
const table = document.createElement("table");
table.className = "board";
let a = 1;
let coords = [];
let currentplayer = 1;
let selectedPiece = null;
let timers = {1: 300, 2: 300};
let timerInterval = null;
let gamePaused = false;

boardCreator();

function boardCreator() {
    for (let i = 1; i < 9; i++) {
        let tr = document.createElement('tr');
        tr.dataset.line = i;
        for (let j = 1; j < 9; j++) {
            let td = document.createElement('td');
            td.dataset.row = i;
            td.dataset.col = j;
            let c = [i, j];
            coords.push(c);

            td.dataset.player = 0;
            td.dataset.tank = false;
            td.dataset.rico = false;
            td.dataset.srico = false;
            td.dataset.titan = false;
            td.dataset.cannon = false;
            td.dataset.highlight = false;

            td.addEventListener("click", function (e) {
                handleClick(this);
            });

            td.className = (i % 2 === j % 2) ? "white square" : "black square";
            td.classList.add("box" + String(a));
            tr.appendChild(td);
            a++;
        }
        table.appendChild(tr);
    }
}

document.querySelector("div#board").appendChild(table);
setInitialPieces();
startTimer();

function setInitialPieces() {
    setPiece(1, 4, 'cannon', 1);
    setPiece(8, 5, 'cannon', 2);

    let player1Pieces = ['tank', 'rico', 'srico', 'titan'];
    player1Pieces.forEach(piece => placeRandomPiece(piece, 1));

    let player2Pieces = ['tank', 'rico', 'srico', 'titan'];
    player2Pieces.forEach(piece => placeRandomPiece(piece, 2));
}

function placeRandomPiece(piece, player) {
    let row, col, cell;
    do {
        row = getRandomInt(player === 1 ? 2 : 5, player === 1 ? 4 : 7);
        col = getRandomInt(1, 8);
        cell = document.querySelector(`td[data-row='${row}'][data-col='${col}']`);
    } while (cell.getAttribute("data-player") != 0);

    setPiece(row, col, piece, player);
}

function setPiece(row, col, piece, player) {
    let cell = document.querySelector(`td[data-row='${row}'][data-col='${col}']`);
    cell.setAttribute(`data-${piece}`, true);
    cell.setAttribute("data-player", player);
    cell.classList.add(`player${player}-${piece}`);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleClick(cell) {
    if (gamePaused) return;
    if (cell.getAttribute("data-highlight") === "true" && selectedPiece) {
        movePiece(cell);
        /*shootProjectile(document.querySelector(`player${currentplayer}-cannon`).getAttribute("data-player"));*/
        currentplayer = 3 - currentplayer;
        document.getElementById("current-player").textContent = `Current Player: ${currentplayer}`;
        startTimer();
    } else {
        checkPiece(cell);
    }
}

function checkPiece(cell) {
    if (cell.getAttribute("data-player") != currentplayer) return;

    let check = (cell.getAttribute("data-tank") === "true" || cell.getAttribute("data-titan") === "true" || cell.getAttribute("data-rico") === "true" || cell.getAttribute("data-srico") === "true" || cell.getAttribute("data-cannon") === "true");

    if (check) {
        let unhigh = document.getElementsByClassName("square");
        Array.from(unhigh).forEach(element => element.setAttribute("data-highlight", false));

        selectedPiece = cell;

        let row = Number(cell.getAttribute("data-row"));
        let col = Number(cell.getAttribute("data-col"));
        let neighbors;
        if (cell.getAttribute("data-cannon") !== "true") {
            neighbors = [
                [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
                [row, col + 1], [row + 1, col + 1], [row + 1, col],
                [row + 1, col - 1], [row, col - 1]
            ];
        } else {
            neighbors = [[row, col - 1], [row, col + 1]];
        }
        neighbors = neighbors.filter(([r, c]) => r >= 1 && r <= 8 && c >= 1 && c <= 8);

        neighbors.forEach(([r, c]) => {
            let neighborCell = document.querySelector(`td[data-row='${r}'][data-col='${c}']`);
            if (neighborCell && neighborCell.getAttribute("data-player") == 0) {
                neighborCell.setAttribute("data-highlight", true);
            }
        });
    } else {
        let unhigh = document.getElementsByClassName("square");
        Array.from(unhigh).forEach(element => element.setAttribute("data-highlight", false));
        selectedPiece = null;
    }
}

function movePiece(targetCell) {
    if (!selectedPiece) return;

    let pieceTypes = ['tank', 'rico', 'srico', 'titan', 'cannon'];
    pieceTypes.forEach(piece => {
        if (selectedPiece.getAttribute(`data-${piece}`) === "true") {
            targetCell.setAttribute(`data-${piece}`, true);
            selectedPiece.setAttribute(`data-${piece}`, false);
        }
    });

    let player = selectedPiece.getAttribute("data-player");
    targetCell.setAttribute("data-player", player);
    selectedPiece.setAttribute("data-player", 0);

    pieceTypes.forEach(piece => {
        selectedPiece.classList.remove(`player${player}-${piece}`);
        if (targetCell.getAttribute(`data-${piece}`) === "true") {
            targetCell.classList.add(`player${player}-${piece}`);
        }
    });

    let unhigh = document.getElementsByClassName("square");
    Array.from(unhigh).forEach(element => element.setAttribute("data-highlight", false));
    selectedPiece = null;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timers[currentplayer] > 0) {
            timers[currentplayer]--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            declareWinner(3 - currentplayer);
        }
    }, 1000);
}

function updateTimerDisplay() {
    let minutes = Math.floor(timers[currentplayer] / 60);
    let seconds = timers[currentplayer] % 60;
    document.querySelector(`[data-timer="player${currentplayer}"]`).textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function pauseTimer() {
    gamePaused = true;
    clearInterval(timerInterval);
}

function resumeTimer() {
    gamePaused = false;
    startTimer();
}

function resetGame() {
    clearInterval(timerInterval);
    timers = {1: 300, 2: 300};
    currentplayer = 1;
    document.getElementById("current-player").textContent = `Current Player: 1`;
    resetBoard();
    setInitialPieces();
    if(!gamePaused){startTimer();}
    document.getElementById("winner-popup").classList.remove("active");
}

function resetBoard() {
    let cells = document.querySelectorAll("td");
    cells.forEach(cell => {
        cell.setAttribute("data-player", 0);
        cell.setAttribute("data-tank", false);
        cell.setAttribute("data-rico", false);
        cell.setAttribute("data-srico", false);
        cell.setAttribute("data-titan", false);
        cell.setAttribute("data-cannon", false);
        cell.setAttribute("data-highlight", false);
        cell.className = cell.className.replace(/player\d-\w+/g, '');
    });
}

/*function shootProjectile(c) {
    let cannon = document.querySelector(`player${c}-cannon`)
    let row = Number(cannon.getAttribute("data-row"));
    let col = Number(cannon.getAttribute("data-col"));
    let direction = currentplayer === 1 ? 1 : -1;
    let nextRow = row + direction;

    while (nextRow >= 1 && nextRow <= 8) {
        let targetCell = document.querySelector(`td[data-row='${nextRow}'][data-col='${col}']`);
        if (targetCell.getAttribute("data-player") != 0) {
            if (targetCell.getAttribute("data-titan") === "true") {
                declareWinner(currentplayer);
                return;
            } else if (targetCell.getAttribute("data-tank") === "true") {
                return; // Bullet blocked by tank
            } else if (targetCell.getAttribute("data-srico") === "true" || targetCell.getAttribute("data-rico") === "true") {
                direction = direction === 1 ? -1 : 1; // Bullet reflected
            }
        }
        nextRow += direction;
    }
}*/

function declareWinner(player) {
    clearInterval(timerInterval);
    document.getElementById("winner-message").textContent = `Player ${player} wins!`;
    document.getElementById("winner-popup").classList.add("active");
}