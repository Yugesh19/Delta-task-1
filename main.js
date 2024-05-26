const cols = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E", 5:"F", 6:"G", 7:"H"}
const table = document.createElement("table");
table.className = "board";
let a = 1;
let coords = []
for (let i = 1; i < 9; i++) {
    let tr = document.createElement('tr');
    tr.dataset.line = i
    for (let j = 1; j < 9; j++) {
        let td = document.createElement('td');

        /*td.setAttribute("id",("box"+String(a)))*/

        td.dataset.row = i;
        td.dataset.col = j;
        c=[i,j];
        coords.push(c);

        td.dataset.tank = false;
        td.dataset.rico = false;
        td.dataset.srico = false;
        td.dataset.titan = false;

        td.addEventListener("click", function (e) {checkPiece(this)})

        td.className = (i%2 === j%2) ? "white square" : "black square";
        td.classList.add(("box"+String(a)));
        tr.appendChild(td);
        a++;
    }
    table.appendChild(tr);
}

document.querySelector("div").appendChild(table);
/*console.log(coords);*/

ball = document.querySelector(".box1");
ball.setAttribute("data-tank",true)



function checkPiece(s){
    if((s.getAttribute("data-tank")==="true")||(s.getAttribute("data-titan")==="true")||(s.getAttribute("data-rico")==="true")||(s.getAttribute("data-srico")==="true")){
        let row = s.getAttribute("data-row");
        let col = s.getAttribute("data-col");
        ro=Number(row);
        co=Number(col);
        let index = getIndex(row,col)
        
        let ul = [ro-1,co-1]
        let u =  [ro-1,co]
        let ur = [ro-1,co+1]
        let r = [ro,co+1]
        let dr = [ro+1,co+1]
        let d = [ro+1,co]
        let dl = [ro+1,co-1]
        let l = [ro,co-1]
        h = [ul,u,ur,r,dr,d,dl,l]
        
        for(let i=0;i<8;i++){
            let ind;
            ind = getIndex(h[i][0],h[i][1])
            viab(ind,i)
        }
        
        
    }
}

function getIndex(r,c){
    for(let i=0;i<64;i++){
        if(coords[i][0]===Number(r)){
            if(coords[i][1]===Number(c)){
                return [+r,+c]
            }
        }
    }
}

function viab(ind,i){
    if(typeof ind === "undefined"){
        console.log(h[i])
    }
}