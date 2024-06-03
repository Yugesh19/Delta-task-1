const cols = {0:"A", 1:"B", 2:"C", 3:"D", 4:"E", 5:"F", 6:"G", 7:"H"};
const table = document.createElement("table");
table.className = "board";
let a = 1;
let coords = [];
let currentplayer = 1;
let selectedPiece = null;
let timers = {1: 180, 2: 180};
let timerInterval = null;
let gamePaused = false;
let GameHistory=[];
let prevMoves=[];
/*let swapPiece=false;*/
let selectedRico=null;
let gamewon=false;

const bgmusic = new Audio("audio/2-main-bg-music.mp3")
const fire = new Audio("audio/3-plasma-gun-fire.mp3")
const ricosound = new Audio("audio/4-ricochet.mp3")
const sricosound = new Audio("audio/5-semi-ricochet-death.mp3")
const tanksound = new Audio("audio/6-tank.mp3")
const winneraudio = new Audio("audio/7-winner-audio.mp3")

window.addEventListener("click",()=>{
    bgmusic.play();
    bgmusic.loop=true;
})

if(localStorage.getItem(`Game1`)===null){gameNumber=1}
else(gameNumber = Number(localStorage.getItem(`game`)))

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
    gamewon=false;
    winneraudio.pause()
    winneraudio.currentTime=0;
    bgmusic.play()
    bgmusic.loop = true;
    gamePaused=false;
    document.querySelector(`[data-timer="player1"]`).textContent = `3:00`;
    document.querySelector(`[data-timer="player2"]`).textContent = `3:00`;
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
    if(piece==='rico'||piece==='srico'){
        cell.dataset.rotation=getRandomInt(1,4);
    }
    cell.setAttribute("data-player", player);
    cell.classList.add(`player${player}-${piece}`);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleClick(cell) {
    selectedRico=cell;
    if (gamePaused) return;
    if (cell.getAttribute("data-highlight") === "true" && selectedPiece) {
        movePiece(cell);
        shootCannons(currentplayer);
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
        if(cell.getAttribute("data-rico") === "true" || cell.getAttribute("data-srico") === "true"){
            displayRotate();
            /*if(cell.getAttribute("data-rico") === "true"){
                displaySwap();
            }
            else{
                removeSwap();
            }*/
        }
        else{
            removeRotate();
            /*removeSwap();*/
        }
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
            if(selectedPiece.getAttribute(`data-rico`) === "true"||selectedPiece.getAttribute(`data-srico`) === "true"){
                let dtdir = selectedPiece.getAttribute("data-rotation")
                targetCell.setAttribute(`data-rotation`, dtdir);
                selectedPiece.removeAttribute("data-rotation");
            }
            targetCell.setAttribute(`data-${piece}`, true);
            selectedPiece.setAttribute(`data-${piece}`, false);
        }
    
    });

    let player = selectedPiece.getAttribute("data-player");
    targetCell.setAttribute("data-player", player);
    selectedPiece.setAttribute("data-player", 0);
    logmove(selectedPiece,targetCell,Number(player));

    
    pieceTypes.forEach(piece => {
        selectedPiece.classList.remove(`player${player}-${piece}`);
        if (targetCell.getAttribute(`data-${piece}`) === "true") {
            targetCell.classList.add(`player${player}-${piece}`);
        }
    });

    unhighlight();
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
    bgmusic.pause();
}

function resumeTimer() {
    if(gamewon){return}
    gamePaused = false;
    startTimer();
    bgmusic.play();
}

function resetGame() {
    
    unhighlight();
    clearInterval(timerInterval);
    timers = {1: 180, 2: 180};

    for(let i=0;i<blueHistory.length;i++){
        GameHistory.push(`${blueHistory[i]},`);
        GameHistory.push(`${redHistory[i]},`);
    }
    localStorage.setItem(`Game${gameNumber}`,GameHistory);
    gameNumber+=1;
    localStorage.setItem("game",gameNumber);
    blueHistory=[];
    redHistory=[];
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

function declareWinner(player) {
    gamewon=true;
    bgmusic.pause()
    winneraudio.play()
    clearInterval(timerInterval);
    document.getElementById("winner-message").textContent = player===1?`Blue wins!`:`Red wins!`;
    document.getElementById("winner-popup").classList.add("active");
    
    gamePaused=true;
}

function shootCannons(player) {
    let cannons = document.querySelectorAll(`td[data-player='${player}'][data-cannon='true']`);
    cannons.forEach(cannonCell => {
        shootCannon(cannonCell);
    });
}

function shootCannon(cell) {
    gamePaused=true;
    let row = Number(cell.getAttribute("data-row"));
    let col = Number(cell.getAttribute("data-col"));
    let bulletDirection = currentplayer === 1 ? "down":"up";
    fire.play();
    fire.playbackRate=6;
    let bulletInterval = setInterval(() => {
        switch(bulletDirection){
            case "up":
                row-=1;
                break;
            case "down":
                row+=1;
                break;
            case "left":
                col-=1
                break;
            case "right":
                col+=1;
                break;
        }
        if (row < 1 || row > 8 || col < 1 || col > 8) {
            clearInterval(bulletInterval);
            gamePaused=false;
            return;
        }

        let targetCell = document.querySelector(`td[data-row='${row}'][data-col='${col}']`);

        if (!targetCell) {
            clearInterval(bulletInterval);
            gamePaused=false;
            return;
        }

        if (targetCell.getAttribute("data-tank") === "true") {
            if(targetCell.getAttribute("data-player")==="1" && bulletDirection==="down"){
                gamePaused=false;
            }
            else if(targetCell.getAttribute("data-player")==="2" && bulletDirection==="up"){
                gamePaused=false;
            }
            else{
                tanksound.play();
                clearInterval(bulletInterval);
                gamePaused=false;
                return;
            }
            
        }

        if (targetCell.getAttribute("data-rico") === "true") {
            ricosound.currentTime=0;
            ricosound.play();
            let direction = Number(targetCell.getAttribute("data-rotation"));
            if(direction===1||direction===3){
                switch(bulletDirection){
                    case "up":
                        bulletDirection = "left";
                        break;
                    case "down":
                        bulletDirection="right";
                        break;
                    case "right":
                        bulletDirection="down";
                        break;
                    case "left":
                        bulletDirection="up";
                        break;
                }
            }
            else if(direction===2||direction===4){
                switch(bulletDirection){
                    case "up":
                        bulletDirection = "right";
                        break;
                    case "down":
                        bulletDirection="left";
                        break;
                    case "right":
                        bulletDirection="up";
                        break;
                    case "left":
                        bulletDirection="down";
                        break;
                }
                
            }

            
        }

        if (targetCell.getAttribute("data-srico") === "true") {
            let direction = Number(targetCell.getAttribute("data-rotation"));
            let p = targetCell.getAttribute("data-player");
            switch (direction) {
                case 1:
                    switch(bulletDirection){
                        case "down":
                            bulletDirection = "right";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "left":
                            bulletDirection = "up";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "right":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                        case "up":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                    }
                    break;
                case 2:
                    switch(bulletDirection){
                        case "up":
                            bulletDirection = "right";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "left":
                            bulletDirection = "down";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "right":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                        case "down":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                    }
                    break;
                case 3:
                    switch(bulletDirection){
                        case "up":
                            bulletDirection = "left";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "right":
                            bulletDirection = "down";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "left":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                        case "down":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                    }
                    break;
                case 4:
                    switch(bulletDirection){
                        case "down":
                            bulletDirection = "left";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "right":
                            bulletDirection = "up";
                            ricosound.currentTime=0;
                            ricosound.play();
                            break;
                        case "left":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                        case "up":
                            sricosound.play()
                            destroylog(p,targetCell);
                            clearInterval(bulletInterval);
                            gamePaused=false;
                            targetCell.setAttribute("data-srico",false);
                            targetCell.classList.remove(`player${3-currentplayer}-srico`)
                            targetCell.classList.remove(`player${currentplayer}-srico`)
                            targetCell.removeAttribute("data-rotation");
                            targetCell.setAttribute("data-player",0);
                            break;
                    }
                    break;

            }
        }

        if (targetCell.getAttribute("data-titan") === "true") {
            if(Number(targetCell.getAttribute("data-player")) === currentplayer){
                gamePaused=false;
                clearInterval(bulletInterval);
                declareWinner(3 - currentplayer);
                return;
            }
            else{
                clearInterval(bulletInterval);
                gamePaused=false;
            }
        }
        if(3-currentplayer===1){
            targetCell.classList.add("bullet1");
            targetCell.classList.add(bulletDirection);
        }
        else{
            targetCell.classList.add("bullet2");
            targetCell.classList.add(bulletDirection);
        }
        setTimeout(() => {
            if(3-currentplayer===1){
                targetCell.classList.remove("bullet1");
                targetCell.classList.remove(bulletDirection);
            }
            else{
                targetCell.classList.remove("bullet2");
                targetCell.classList.remove(bulletDirection);
            } 
        }, 200);
    }, 200);
}

function displayRotate(){
    document.querySelector(".rotation-controls").style.display = "flex";
}
function removeRotate(){
    document.querySelector(".rotation-controls").style.display = "none";
}
/*function displaySwap(){
    document.querySelector(".swap").style.display = "block";
}
function removeSwap(){
    document.querySelector(".swap").style.display = "none";
}*/
function rotateRight(){
    let direct = Number(selectedPiece.getAttribute("data-rotation"));
    if(direct>=4){direct=1;}
    else{direct++}
    if(selectedPiece.getAttribute("data-rico")===true){
        if(currentplayer===1){blueHistory.push(`B-Ricochet-(RR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
        else{redHistory.push(`R-Ricochet-(RR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
    }
    else{
        if(currentplayer===1){blueHistory.push(`B-SemiRicochet-(RR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
        else{redHistory.push(`R-SemiRicochet(RR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
    }
    selectedPiece.setAttribute("data-rotation",direct)
    shootCannons(currentplayer);
    currentplayer = 3 - currentplayer;
    unhighlight();
    removeRotate();
}
function rotateLeft(){
    let direct = selectedPiece.getAttribute("data-rotation");
    if(direct<=1){direct=4;}
    else{direct--}
    if(selectedPiece.getAttribute("data-rico")===true){
        if(currentplayer===1){blueHistory.push(`B-Ricochet-(LR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
        else{redHistory.push(`R-Ricochet-(LR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
    }
    else{
        if(currentplayer===1){blueHistory.push(`B-SemiRicochet-(LR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
        else{redHistory.push(`R-SemiRicochet-(LR)-[${selectedPiece.getAttribute("data-row")}],[${selectedPiece.getAttribute("data-col")}]`)}
    }
    selectedPiece.setAttribute("data-rotation",direct)
    shootCannons(currentplayer);
    currentplayer = 3 - currentplayer;
    unhighlight();
    removeRotate();
}

let blueHistory=[];
let redHistory=[];

function logmove(initial,final,p){
    if(final.getAttribute("data-tank") === "true"){
        if(p === 1){
            blueHistory.push(`B-Tank-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]`);
        }
        else {
            redHistory.push(`R-Tank-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]`);
        }
    }
    else if(final.getAttribute("data-titan") === "true"){
        if(p === 1){
            blueHistory.push(`B-Titan-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]`);
        }
        else {
            redHistory.push(`R-Titan[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]`);
        }
    }
    else if(final.getAttribute("data-rico") === "true"){
        if(p === 1){
            blueHistory.push(`B-Ricochet-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]-${final.getAttribute("data-rotation")}`);
        }
        else {
            redHistory.push(`R-Ricochet-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]-${final.getAttribute("data-rotation")}`);
        }
    }
    else if(final.getAttribute("data-srico") === "true"){
        if(p === 1){
            blueHistory.push(`B-SemiRicochet-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]-${final.getAttribute("data-rotation")}`);
        }
        else {
            redHistory.push(`R-SemiRicochet-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]-${final.getAttribute("data-rotation")}`);
        }
    }
    else if(final.getAttribute("data-cannon") === "true"){
        if(p === 1){
            blueHistory.push(`B-Cannon-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]`);
        }
        else {
            redHistory.push(`R-Cannon-[${Number(initial.getAttribute("data-row"))}],[${Number(initial.getAttribute("data-col"))}]-[${Number(final.getAttribute("data-row"))}],[${Number(final.getAttribute("data-col"))}]`);
        }
    }
}

function unhighlight(){
    let unhigh = document.getElementsByClassName("square");
    Array.from(unhigh).forEach(element => element.setAttribute("data-highlight", false));
    selectedPiece = null;
    let bluelist = document.getElementById("blueHistory");
    bluelist.innerHTML = "";
    blueHistory.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item;
        bluelist.appendChild(li);
    });

    let redlist = document.getElementById("redHistory");
    redlist.innerHTML = "";
    redHistory.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item;
        redlist.appendChild(li);
    });
}
let undonemoves=[];
function undo(){
    let r1;
    let c1;
    let r2;
    let c2;
    if(currentplayer===1){
        if(redHistory.length<=0){return;}
        lastmove=String(redHistory.pop());
    }
    else{
        if(blueHistory.length<=0){return;}
        lastmove=String(blueHistory.pop());
    }
    Ulastmove=split(lastmove,'-');
    console.log(Ulastmove);
    unhighlight();
    if(Ulastmove[0]==='B'){
        switch(Ulastmove[1]){
            case 'Tank':
                r1 = Ulastmove[2][1];
                c1 = Ulastmove[2][5];
                r2 = Ulastmove[3][1];
                c2 = Ulastmove[3][5];
                Array.from(document.querySelectorAll(".square")).forEach(e => {
                    if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                        e.setAttribute("data-tank",true);
                        e.setAttribute("data-player",1)
                        e.classList.add("player1-tank");
                    }
                    if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                        e.setAttribute("data-tank",false);
                        e.setAttribute("data-player",0)
                        e.classList.remove("player1-tank");
                    }
                })
                
                break;
            case 'Titan':
                r1 = Ulastmove[2][1];
                c1 = Ulastmove[2][5];
                r2 = Ulastmove[3][1];
                c2 = Ulastmove[3][5];
                Array.from(document.querySelectorAll(".square")).forEach(e => {
                    if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                        e.setAttribute("data-titan",true);
                        e.setAttribute("data-player",1)
                        e.classList.add("player1-titan");
                    }
                    if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                        e.setAttribute("data-titan",false);
                        e.setAttribute("data-player",0)
                        e.classList.remove("player1-titan");
                    }
                })
                
                break;
            case 'Ricochet':
                if(Ulastmove[2]==='(RR)'||Ulastmove==='(LR)'){
                    if(Ulastmove[2]==='(RR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                                if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                    dir = Number(e.getAttribute("data-rotation"));
                                    if(dir<=1){dir=4;}
                                    else{dir--}
                                    e.setAttribute("data-rotation",dir)
                                }
                        })
                    }
                    if(Ulastmove[2]==='(LR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                            if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                dir = Number(e.getAttribute("data-rotation"));
                                if(dir>=4){dir=1;}
                                else{dir++}
                                e.setAttribute("data-rotation",dir)
                            }
                        })
                        
                    }
                }
                else{
                    r1 = Ulastmove[2][1];
                    c1 = Ulastmove[2][5];
                    r2 = Ulastmove[3][1];
                    c2 = Ulastmove[3][5];
                    Array.from(document.querySelectorAll(".square")).forEach(e => {
                        if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                            e.setAttribute("data-rico",true);
                            e.setAttribute("data-player",1)
                            e.classList.add("player1-rico");
                            e.setAttribute("data-rotation",Ulastmove[4])
                        }
                        if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                            e.setAttribute("data-rico",false);
                            e.setAttribute("data-player",0)
                            e.classList.remove("player1-rico");
                            e.removeAttribute("data-rotation");
                        }
                    })
                }
                
                break;
            case 'SemiRicochet':
                if(Ulastmove[2]==='(RR)'||Ulastmove==='(LR)'){
                    if(Ulastmove[2]==='(RR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                                if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                    dir = Number(e.getAttribute("data-rotation"));
                                    if(dir<=1){dir=4;}
                                    else{dir--}
                                    e.setAttribute("data-rotation",dir)
                                }
                        })
                    }
                    if(Ulastmove[2]==='(LR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                            if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                dir = Number(e.getAttribute("data-rotation"));
                                if(dir>=4){dir=1;}
                                else{dir++}
                                e.setAttribute("data-rotation",dir)
                                
                            }
                        })
                        
                    }
                }
                else if(Ulastmove[2]==='XX'){
                    let rb = Ulastmove[3][1];
                    let cb = Ulastmove[3][5];
                    Array.from(document.querySelectorAll(".square")).forEach(e => {
                        if(e.getAttribute("data-row")===rb && e.getAttribute("data-col")===cb){
                            e.setAttribute("data-srico",true);
                            e.setAttribute("data-player",1);
                            e.classList.add("player1-srico");
                            e.setAttribute("data-rotation",Ulastmove[4])
                            undo();
                        }
                    })
                }
                else{
                    r1 = Ulastmove[2][1];
                    c1 = Ulastmove[2][5];
                    r2 = Ulastmove[3][1];
                    c2 = Ulastmove[3][5];
                    Array.from(document.querySelectorAll(".square")).forEach(e => {
                        if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                            e.setAttribute("data-srico",true);
                            e.setAttribute("data-player",1)
                            e.classList.add("player1-srico");
                            e.setAttribute("data-rotation",Ulastmove[4])
                        }
                        if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                            e.setAttribute("data-srico",false);
                            e.setAttribute("data-player",0)
                            e.classList.remove("player1-srico");
                            e.removeAttribute("data-rotation")
                        }
                    })
                }
                
                break;
            case 'Cannon':
                r1 = Ulastmove[2][1];
                c1 = Ulastmove[2][5];
                r2 = Ulastmove[3][1];
                c2 = Ulastmove[3][5];
                Array.from(document.querySelectorAll(".square")).forEach(e => {
                    if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                        e.setAttribute("data-cannon",true);
                        e.setAttribute("data-player",1)
                        e.classList.add("player1-cannon");
                    }
                    if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                        e.setAttribute("data-cannon",false);
                        e.setAttribute("data-player",0)
                        e.classList.remove("player1-cannon");
                    }
                })
                
                break;
        }
    }
    else if(Ulastmove[0]==='R'){
        switch(Ulastmove[1]){
            case 'Tank':
                r1 = Ulastmove[2][1];
                c1 = Ulastmove[2][5];
                r2 = Ulastmove[3][1];
                c2 = Ulastmove[3][5];
                Array.from(document.querySelectorAll(".square")).forEach(e => {
                    if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                        e.setAttribute("data-tank",true);
                        e.setAttribute("data-player",2)
                        e.classList.add("player2-tank");
                    }
                    if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                        e.setAttribute("data-tank",false);
                        e.setAttribute("data-player",0)
                        e.classList.remove("player2-tank");
                    }
                })
                
                break;
            case 'Titan':
                r1 = Ulastmove[2][1];
                c1 = Ulastmove[2][5];
                r2 = Ulastmove[3][1];
                c2 = Ulastmove[3][5];
                Array.from(document.querySelectorAll(".square")).forEach(e => {
                    if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                        e.setAttribute("data-titan",true);
                        e.setAttribute("data-player",2)
                        e.classList.add("player2-titan");
                    }
                    if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                        e.setAttribute("data-titan",false);
                        e.setAttribute("data-player",0)
                        e.classList.remove("player2-titan");
                    }
                })
                
                break;
            case 'Ricochet':
                if(Ulastmove[2]==='(RR)'||Ulastmove==='(LR)'){
                    if(Ulastmove[2]==='(RR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                                if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                    dir = Number(e.getAttribute("data-rotation"));
                                    if(dir<=1){dir=4;}
                                    else{dir--}
                                    e.setAttribute("data-rotation",dir)
                                }
                        })
                    }
                    if(Ulastmove[2]==='(LR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                            if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                dir = Number(e.getAttribute("data-rotation"));
                                if(dir>=4){dir=1;}
                                else{dir++}
                                e.setAttribute("data-rotation",dir)
                            }
                        })
                        
                    }
                }
                else{
                    r1 = Ulastmove[2][1];
                    c1 = Ulastmove[2][5];
                    r2 = Ulastmove[3][1];
                    c2 = Ulastmove[3][5];
                    Array.from(document.querySelectorAll(".square")).forEach(e => {
                        if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                            e.setAttribute("data-rico",true);
                            e.setAttribute("data-player",2)
                            e.classList.add("player2-rico");
                            e.setAttribute("data-rotation",Ulastmove[4])
                        }
                        if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                            e.setAttribute("data-rico",false);
                            e.setAttribute("data-player",0)
                            e.classList.remove("player2-rico");
                            e.removeAttribute("data-rotation")
                        }
                    })
                }
                
                break;
            case 'SemiRicochet':
                if(Ulastmove[2]==='(RR)'||Ulastmove==='(LR)'){
                    if(Ulastmove[2]==='(RR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                                if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                    dir = Number(e.getAttribute("data-rotation"));
                                    if(dir<=1){dir=4;}
                                    else{dir--}
                                    e.setAttribute("data-rotation",dir)
                                }
                        })
                    }
                    if(Ulastmove[2]==='(LR)'){
                        Array.from(document.querySelectorAll(".square")).forEach(e => {
                            if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                                dir = Number(e.getAttribute("data-rotation"));
                                if(dir>=4){dir=1;}
                                else{dir++}
                                e.setAttribute("data-rotation",dir)
                            }
                        })
                        
                    }
                }
                else if(Ulastmove[2]==='XX'){
                    let rb = Ulastmove[3][1];
                    let cb = Ulastmove[3][5];
                    Array.from(document.querySelectorAll(".square")).forEach(e => {
                        if(e.getAttribute("data-row")===rb && e.getAttribute("data-col")===cb){
                            e.setAttribute("data-srico",true);
                            e.setAttribute("data-player",2);
                            e.classList.add("player2-srico");
                            e.setAttribute("data-rotation",Ulastmove[4])
                            
                        }
                    })
                }
                else{
                    r1 = Ulastmove[2][1];
                    c1 = Ulastmove[2][5];
                    r2 = Ulastmove[3][1];
                    c2 = Ulastmove[3][5];
                    Array.from(document.querySelectorAll(".square")).forEach(e => {
                        if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                            e.setAttribute("data-srico",true);
                            e.setAttribute("data-player",2)
                            e.classList.add("player2-srico");
                            e.setAttribute("data-rotation",Ulastmove[4])
                        }
                        if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                            e.setAttribute("data-srico",false);
                            e.setAttribute("data-player",0)
                            e.classList.remove("player2-srico");
                            e.removeAttribute("data-rotation")
                        }
                    })
                }
                
                break;
            case 'Cannon':
                r1 = Ulastmove[2][1];
                c1 = Ulastmove[2][5];
                r2 = Ulastmove[3][1];
                c2 = Ulastmove[3][5];
                Array.from(document.querySelectorAll(".square")).forEach(e => {
                    if(e.getAttribute("data-row")===r1 && e.getAttribute("data-col")===c1){
                        e.setAttribute("data-cannon",true);
                        e.setAttribute("data-player",2)
                        e.classList.add("player2-cannon");
                    }
                    if(e.getAttribute("data-row")===r2 && e.getAttribute("data-col")===c2){
                        e.setAttribute("data-cannon",false);
                        e.setAttribute("data-player",0)
                        e.classList.remove("player2-cannon");
                    }
                })
                
                break;
        }
    }
    undonemoves.push(Ulastmove);
    currentplayer = 3-currentplayer;
    console.log(undonemoves)
}
let tar;

/*function redo(){
    if(undonemoves.length<=0){return;}
    prevundo = undonemoves.pop();
    console.log(undonemoves);
    if(prevundo.length<5){
        if(Ulastmove[2]==='(RR)'){
            Array.from(document.querySelectorAll(".square")).forEach(e => {
                if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                        selectedPiece = e;
                        rotateRight();
                    }
            })
        }
        if(Ulastmove[2]==='(LR)'){
            Array.from(document.querySelectorAll(".square")).forEach(e => {
                if(e.getAttribute("data-row")===Ulastmove[3][1] && e.getAttribute("data-col")===Ulastmove[3][5]){
                    selectedPiece = e;
                    rotateLeft();
                }
            })
            
        }
        }
    else if(Ulastmove[3]==='XX'){
        redo();
        return;
    }
    else{
        rr1 = Ulastmove[2][1];
        rc1 = Ulastmove[2][5];
        rr2=Ulastmove[3][1];
        rc2=Ulastmove[3][5];
        Array.from(document.querySelectorAll(".square")).forEach(e => {
            if(e.getAttribute("data-row")===rr1 && e.getAttribute("data-col")===rc1){
                selectedPiece = e;
            }
            if(e.getAttribute("data-row")===rr2 && e.getAttribute("data-col")===rc2){
                tar = e;
            }
        })
        movePiece(tar);
    }
}*/

function split(word,sep){
    let splitString = [];
    let tempStr = '';
    for(i=0;i<word.length;i++){
        if (word[i] === sep) {
            splitString.push(tempStr);
            tempStr = '';
        } else {
            tempStr += word[i];
        }
    }
    splitString.push(tempStr);
    return splitString
}

function destroylog(p,t){
    if(p==='1'){
        blueHistory.push(`B-SemiRicochet-XX-[${t.getAttribute("data-row")}],[${t.getAttribute("data-col")}]-${t.getAttribute("data-rotation")}`)
    }
    else{
        redHistory.push(`R-SemiRicochet-XX-[${t.getAttribute("data-row")}],[${t.getAttribute("data-col")}]-${t.getAttribute("data-rotation")}`)
    }
    unhighlight();
}
/*function swap(){
    swapPiece=false?true:false;
    unhighlight();
    Array.from(document.getElementsByClassName("square")).forEach(e=>{
        if(e.getAttribute("data-tank")===true){
            e.classList.add("transparentHighlight");
        }
        if(e.getAttribute("data-rico")===true){
            e.classList.add("transparentHighlight");
        }
        if(e.getAttribute("data-rico")===true){
            if(e.getAttribute("data-player")!==currentplayer){
                transhigh.classList.add("transparentHighlight");
            }
        }
    })

    removeSwap();
}*/