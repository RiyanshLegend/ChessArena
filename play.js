const btn = document.getElementById("challengeBtn");

btn.onclick = () => {

btn.disabled = true;

btn.innerHTML = "INITIALIZING...";

document.body.style.transition = "1s";
document.body.style.opacity = "0";

setTimeout(() => {

window.location.href = "game.html";

},1000);

};
