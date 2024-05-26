const cols = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E", 5:"F", 6:"G", 7:"H"};
const table = document.createElement("table");
table.className = "board";
let a = 1;
let coords = [];

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

let ball = document.querySelector(".box1");
ball.setAttribute("data-tank", true);

document.querySelector(".box62").setAttribute("data-cannon",true);

function checkPiece(s) {
    if (s.getAttribute("data-tank") === "true" || s.getAttribute("data-titan") === "true" || s.getAttribute("data-rico") === "true" || s.getAttribute("data-srico") === "true"|| s.getAttribute("data-cannon") === "true") {
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