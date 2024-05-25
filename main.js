const cols = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E", 5:"F", 6:"G", 7:"H"}
const table = document.createElement("table");
table.className = "board";
let a = 1;
for (let i = 1; i < 9; i++) {
    let tr = document.createElement('tr');
    tr.dataset.line = i
    for (let j = 1; j < 9; j++) {
        let td = document.createElement('td');
        td.setAttribute("id",("box"+String(a)))
        let d = document.createElement('div');
        d.className = (("box"+String(a)))
        td.appendChild(d);
        td.dataset.col = cols[j-1];
        td.dataset.line = i;
        td.className = (i%2 === j%2) ? "white square" : "black square";
        /*td.classList.add(("box"+String(a)));*/
        tr.appendChild(td);
        a++;
    }
    table.appendChild(tr);
}
document.querySelector("div").appendChild(table);


var color = [, "#3C9EE7", "#E7993C",
            "#E73C99", "#3CE746", "#E7993C"];
box1 = document.querySelectorAll(".square")
box1.forEach(Square => {
    Square.addEventListener("click", function (){
        for(let i = 1;i<=64;i++){
            p = "box"+String(i);
            document.getElementById(p).style.background = color[(Math.floor(Math.random() * color.length))];
        }
    }
    );
    
})

