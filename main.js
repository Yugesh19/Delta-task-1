const cols = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E", 5:"F", 6:"G", 7:"H"};
const table = document.createElement("table");
table.className = "board";
let a = 1;
let coords = [];
let currentplayer = 1;

boardCreator()

function boardCreator(){
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
            checkPiece(this);
            });

            td.className = (i % 2 === j % 2) ? "white square" : "black square";
            td.classList.add("box" + String(a));
            tr.appendChild(td);
            a++;
        }
        table.appendChild(tr);
    }
}

document.querySelector("div").appendChild(table);
setInitialPieces();

/*start*/

function setInitialPieces() {
    // Cannons at fixed positions
    setPiece(1, 1, 'cannon', 1);  // Player 1 cannon at bottom left
    setPiece(8, 8, 'cannon', 2);  // Player 2 cannon at top right

    // Randomly place other pieces for Player 1
    let player1Pieces = ['tank', 'rico', 'srico', 'titan'];
    player1Pieces.forEach(piece => placeRandomPiece(piece, 1));

    // Randomly place other pieces for Player 2
    let player2Pieces = ['tank', 'rico', 'srico', 'titan'];
    player2Pieces.forEach(piece => placeRandomPiece(piece, 2));
}

function placeRandomPiece(piece, player) {
    let row, col, cell;
    do {
        row = getRandomInt(1, 8);
        col = getRandomInt(1, 8);
        cell = document.querySelector(`td[data-row='${row}'][data-col='${col}']`);
    } while (cell.getAttribute("data-player") != 0 || (row === 1 && col === 1) || (row === 8 && col === 8));

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


/*stop*/



let ball = document.querySelector(".box1");
ball.setAttribute("data-tank", true);

document.querySelector(".box62").setAttribute("data-cannon",true);



function checkPiece(s) {
    check = (s.getAttribute("data-tank") === "true" || s.getAttribute("data-titan") === "true" || s.getAttribute("data-rico") === "true" || s.getAttribute("data-srico") === "true"|| s.getAttribute("data-cannon") === "true")

    if((s.getAttribute("data-highlight") === "true")&&(!check)){
        console.log("hello")
    }

    if (check) {
        unhigh = document.getElementsByClassName("square")
        Array.from(unhigh).forEach(element => element.setAttribute("data-highlight",false))
        
        let row = Number(s.getAttribute("data-row"));
        let col = Number(s.getAttribute("data-col"));
        if(s.getAttribute("data-cannon") !== "true"){
            neighbors = [
                [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
                [row, col + 1], [row + 1, col + 1], [row + 1, col],
                [row + 1, col - 1], [row, col - 1]
            ];
        }
        else{
            neighbors = [[row, col-1],[row,col+1]];
        }
        neighbors = neighbors.filter(([r, c]) => r >= 1 && r <= 8 && c >= 1 && c <= 8);

        neighbors.forEach(([r, c]) => {
            let cell = document.querySelector(`td[data-row='${r}'][data-col='${c}']`);
            if (cell) {
                // Here you can apply any logic to the cell, like changing its class or dataset attributes
                cell.setAttribute("data-highlight",true);
            }
        });
    }
    else{
        unhigh = document.getElementsByClassName("square")
        Array.from(unhigh).forEach(element => element.setAttribute("data-highlight",false))
    }
    
}