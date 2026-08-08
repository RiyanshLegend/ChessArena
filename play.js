"use strict";

const game = new Chess();

const board = document.getElementById("board");
const status = document.getElementById("status");
const history = document.getElementById("moveHistory");

const newGame = document.getElementById("newGame");
const resign = document.getElementById("resign");

let selectedSquare = null;
let gameOver = false;

const pieces = {
    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",
    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟"
};

function drawBoard() {
    board.innerHTML = "";

    const position = game.board();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.className =
                (row + col) % 2 === 0
                    ? "square light"
                    : "square dark";

            const name =
                String.fromCharCode(97 + col) + (8 - row);

            square.dataset.square = name;

            const piece = position[row][col];

            if (piece) {
                const pieceElement = document.createElement("span");

                pieceElement.className = "piece";

                pieceElement.textContent =
                    pieces[piece.color + piece.type.toUpperCase()];

                square.appendChild(pieceElement);
            }

            square.addEventListener("click", () => clickSquare(name));

            board.appendChild(square);
        }
    }
}

function clickSquare(square) {

    if (gameOver) return;

    if (!selectedSquare) {

        const piece = game.get(square);

        if (!piece || piece.color !== "w") return;

        selectedSquare = square;

        document
            .querySelector(`[data-square="${square}"]`)
            .classList.add("selected");

        return;
    }

    const move = game.move({
        from: selectedSquare,
        to: square,
        promotion: "q"
    });

    selectedSquare = null;

    if (!move) {
        drawBoard();
        return;
    }

    drawBoard();
    updateHistory();

    status.textContent = "MOVE PLAYED";

    if (game.isGameOver()) {
        finishGame();
    }
}

function updateHistory() {

    const moves = game.history();

    if (!moves.length) {
        history.textContent = "No moves yet.";
        return;
    }

    history.innerHTML = "";

    for (let i = 0; i < moves.length; i += 2) {

        const row = document.createElement("div");

        row.textContent =
            `${Math.floor(i / 2) + 1}. ${moves[i] || ""} ${moves[i + 1] || ""}`;

        history.appendChild(row);
    }
}

function finishGame() {

    gameOver = true;

    if (game.isCheckmate()) {
        status.textContent =
            game.turn() === "w"
                ? "CHECKMATE"
                : "YOU WIN!";
    }
    else if (game.isDraw()) {
        status.textContent = "DRAW";
    }
    else {
        status.textContent = "GAME OVER";
    }
}

newGame.addEventListener("click", () => {

    game.reset();

    selectedSquare = null;
    gameOver = false;

    drawBoard();
    updateHistory();

    status.textContent = "YOUR MOVE";
});

resign.addEventListener("click", () => {

    if (gameOver) return;

    gameOver = true;

    status.textContent =
        "👑 MAGNUS WINS — YOU RESIGNED";
});

drawBoard();
updateHistory();
