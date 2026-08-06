// ===============================
// CHESS ARENA
// script.js
// ===============================

// Animated Counter
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);

    if (!element) return;

    let startTimestamp = null;

    function step(timestamp) {

        if (!startTimestamp)
            startTimestamp = timestamp;

        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();

        if (progress < 1)
            window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
}

// Start Counters
animateValue("online", 0, 12458, 2500);
animateValue("games", 0, 3861, 2500);

// Floating Background Particles
const bg = document.querySelector(".background");

for (let i = 0; i < 40; i++) {

    const star = document.createElement("div");

    star.className = "particle";

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    star.style.animationDuration =
        5 + Math.random() * 10 + "s";

    star.style.animationDelay =
        Math.random() * 5 + "s";

    bg.appendChild(star);
}

// Mouse Glow Effect
document.addEventListener("mousemove", (e) => {

    document.documentElement.style.setProperty(
        "--mouseX",
        e.clientX + "px"
    );

    document.documentElement.style.setProperty(
        "--mouseY",
        e.clientY + "px"
    );

});

// Play Button
const playBtn = document.querySelector(".playNow");

if (playBtn) {

    playBtn.addEventListener("click", () => {

        playBtn.innerHTML = "♟ Finding Match...";

        playBtn.disabled = true;

        setTimeout(() => {

            alert("🚀 Matchmaking will be added in the next update!");

            playBtn.innerHTML = "Play Now";

            playBtn.disabled = false;

        }, 1800);

    });

}

// Learn Button
const learnBtn = document.querySelector(".learn");

if (learnBtn) {

    learnBtn.addEventListener("click", () => {

        alert(
            "Chess Arena is a modern chess platform with multiplayer, puzzles, tournaments, and leaderboards coming soon!"
        );

    });

}

// Logo Click Animation
const logo = document.querySelector(".logo");

if (logo) {

    logo.addEventListener("click", () => {

        logo.animate(
            [
                { transform: "rotate(0deg) scale(1)" },
                { transform: "rotate(-8deg) scale(1.1)" },
                { transform: "rotate(8deg) scale(1.1)" },
                { transform: "rotate(0deg) scale(1)" }
            ],
            {
                duration: 700
            }
        );

    });

}

// Random Live Players
setInterval(() => {

    const online = document.getElementById("online");

    if (!online) return;

    let current = parseInt(
        online.textContent.replace(/,/g, "")
    );

    current += Math.floor(Math.random() * 8 - 3);

    if (current < 12000)
        current = 12000;

    online.textContent = current.toLocaleString();

}, 3000);

// Console Message 😎
console.log("%c♟ CHESS ARENA",
"font-size:24px;color:#4cc9f0;font-weight:bold");

console.log("%cWebsite Loaded Successfully!",
"color:#00ff99;font-size:14px");
