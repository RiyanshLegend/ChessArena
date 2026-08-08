"use strict";

/* ================================
   CHESS GAME
================================ */

const game = new Chess();

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const historyElement = document.getElementById("moveHistory");

const newGameButton = document.getElementById("newGame");
const resignButton = document.getElementById("resign");

let selectedSquare = null;
let thinking = false;


/* ================================
   PIECES
================================ */

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


/* ================================
   STOCKFISH
================================ */

let engine;

try {

    engine = new Worker("stockfish-18-lite-single.js");

    engine.postMessage("uci");

    engine.onmessage = function(event) {

        const message = event.data;

        console.log("MAGNUS:", message);

        if (typeof message !== "string") return;

        if (message.startsWith("bestmove")) {

            const parts = message.split(" ");
            const bestMove = parts[1];

            if (bestMove && bestMove !== "(none)") {
                playMagnusMove(bestMove);
            }

        }

    };

} catch (error) {

    console.error("Stockfish failed to load:", error);

    statusElement.textContent = "MAGNUS ENGINE FAILED TO LOAD";

}


/* ================================
   CREATE BOARD
================================ */

function createBoard() {

    boardElement.innerHTML = "";

    const position = game.board();

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            const isLight = (row + col) % 2 === 0;

            square.className = isLight
                ? "square light"
                : "square dark";

            const file = String.fromCharCode(97 + col);
            const rank = 8 - row;

            const squareName = file + rank;

            square.dataset.square = squareName;

            const piece = position[row][col];

            if (piece) {

                const pieceElement = document.createElement("span");

                const key =
                    piece.color +
                    piece.type.toUpperCase();

                pieceElement.textContent = pieces[key];

                pieceElement.className =
                    piece.color === "w"
                        ? "piece white-piece"
                        : "piece black-piece";

                square.appendChild(pieceElement);

            }

            square.addEventListener(
                "click",
                () => handleSquareClick(squareName)
            );

            boardElement.appendChild(square);

        }

    }

}


/* ================================
   PLAYER MOVE
================================ */

function handleSquareClick(square) {

    if (thinking) return;

    if (game.isGameOver()) return;

    if (game.turn() !== "w") return;


    /* Select a piece */

    if (!selectedSquare) {

        const piece = game.get(square);

        if (!piece || piece.color !== "w") return;

        selectedSquare = square;

        highlightSquare(square);

        return;
    }


    /* Try move */

    const move = game.move({

        from: selectedSquare,
        to: square,
        promotion: "q"

    });


    /* Illegal move */

    if (!move) {

        selectedSquare = null;

        createBoard();

        return;
    }


    selectedSquare = null;

    createBoard();

    updateHistory();

    updateStatus();


    /* Check game end */

    if (game.isGameOver()) {

        finishGame();

        return;
    }


    /* Magnus thinks */

    magnusMove();

}


/* ================================
   HIGHLIGHT
================================ */

function highlightSquare(square) {

    const element =
        document.querySelector(
            `[data-square="${square}"]`
        );

    if (element) {

        element.classList.add("selected");

    }

}


/* ================================
   MAGNUS THINKS
================================ */

function magnusMove() {

    thinking = true;

    statusElement.textContent =
        "👑 MAGNUS IS THINKING...";

    const fen = game.fen();

    engine.postMessage("position fen " + fen);

    /*
       High search depth.
       The lite engine is still extremely strong.
    */

    engine.postMessage("go depth 30");

}


/* ================================
   MAGNUS MOVE
================================ */

function playMagnusMove(uciMove) {

    if (!thinking) return;


    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);

    let promotion = "q";

    if (uciMove.length >= 5) {
        promotion = uciMove.substring(4, 5);
    }


    const move = game.move({

        from: from,
        to: to,
        promotion: promotion

    });


    if (!move) {

        console.error(
            "Magnus produced an invalid move:",
            uciMove
        );

        thinking = false;

        return;
    }


    thinking = false;

    createBoard();

    updateHistory();

    updateStatus();


    if (game.isGameOver()) {

        finishGame();

    } else {

        statusElement.textContent =
            "YOUR MOVE";

    }

}


/* ================================
   MOVE HISTORY
================================ */

function updateHistory() {

    const moves = game.history();

    if (moves.length === 0) {

        historyElement.textContent =
            "No moves yet.";

        return;
    }


    historyElement.innerHTML = "";


    for (let i = 0; i < moves.length; i += 2) {

        const row = document.createElement("div");

        const moveNumber =
            Math.floor(i / 2) + 1;

        const whiteMove =
            moves[i] || "";

        const blackMove =
            moves[i + 1] || "";

        row.textContent =
            `${moveNumber}. ${whiteMove} ${blackMove}`;

        historyElement.appendChild(row);

    }

}


/* ================================
   STATUS
================================ */

function updateStatus() {

    if (game.isCheck()) {

        statusElement.textContent =
            "⚔️ CHECK!";

        return;
    }

    statusElement.textContent =
        "YOUR MOVE";

}


/* ================================
   GAME OVER
================================ */

function finishGame() {

    thinking = false;

    if (game.isCheckmate()) {

        if (game.turn() === "w") {

            statusElement.textContent =
                "👑 CHECKMATE — MAGNUS WINS";

        } else {

            statusElement.textContent =
                "🏆 YOU BEAT MAGNUS!";

        }

        return;
    }


    if (game.isDraw()) {

        statusElement.textContent =
            "DRAW";

        return;
    }


    statusElement.textContent =
        "GAME OVER";

}


/* ================================
   NEW GAME
================================ */

newGameButton.addEventListener(
    "click",
    () => {

        game.reset();

        selectedSquare = null;

        thinking = false;

        createBoard();

        updateHistory();

        statusElement.textContent =
            "YOUR MOVE";

        engine.postMessage("ucinewgame");

    }
);


/* ================================
   RESIGN
================================ */

resignButton.addEventListener(
    "click",
    () => {

        if (game.isGameOver()) return;

        thinking = false;

        statusElement.textContent =
            "👑 MAGNUS WINS — YOU RESIGNED";

    }
);


/* ================================
   START
================================ */

createBoard();

updateHistory();

statusElement.textContent =
    "YOUR MOVE";
