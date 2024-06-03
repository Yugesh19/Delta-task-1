const bgmusic = new Audio("audio/1-intro-music.mp3");
window.addEventListener("mouseover",()=>{
    bgmusic.play();
    bgmusic.volume=0.7;
})
function startGame() {
    setTimeout(()=>window.location.href="normalmode.html",500);
}

function loadGame() {
    setTimeout(()=>window.location.href="",500);
}

function openOptions() {
    document.getElementById("options-box").style.display = "block";
}

function closeOptions() {
    document.getElementById("options-box").style.display = "none";
}