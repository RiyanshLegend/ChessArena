"use strict";

/* =========================================
   CHESS ARENA — MAGNUS AI
   Stockfish 18 Lite WASM
   chess.js 0.10.x compatible
========================================= */

const game = new Chess();

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const historyElement = document.getElementById("moveHistory");

const newGameButton = document.getElementById("newGame");
const resignButton = document.getElementById("resign");

let selectedSquare = null;
let thinking = false;
let gameEnded = false;
let engineReady = false;


/* =========================================
   PIECES
========================================= */

const PIECES = {
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


/* =========================================
   STOCKFISH
========================================= */

const engine = new Worker("stockfish-18-lite-single.js");

engine.onmessage = function (event) {

    const message = event.data;

    console.log("MAGNUS:", message);

    if (typeof message !== "string") {
        return;
    }

    if (message === "uciok") {

        engineReady = true;

        engine.postMessage("setoption name Skill Level value 20");
        engine.postMessage("setoption name Threads value 1");
        engine.postMessage("setoption name Hash value 128");

        engine.postMessage("isready");

        statusElement.textContent = "YOUR MOVE";

        return;
    }


    if (message === "readyok") {

        console.log("MAGNUS ENGINE READY");

        return;
    }


    if (message.startsWith("bestmove")) {

        const parts = message.split(" ");
        const bestMove = parts[1];

        if (bestMove && bestMove !== "(none)") {

            playMagnusMove(bestMove);

        } else {

            thinking = false;
            finishGame();

        }
    }
};


/* =========================================
   START STOCKFISH
========================================= */

engine.postMessage("uci");


/* =========================================
   DRAW BOARD
========================================= */

function drawBoard() {

    boardElement.innerHTML = "";

    const position = game.board();

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            const light = (row + col) % 2 === 0;

            square.className =
                light
                    ? "square light"
                    : "square dark";


            const file =
                String.fromCharCode(97 + col);

            const rank = 8 - row;

            const squareName = file + rank;

            square.dataset.square = squareName;


            const piece = position[row][col];

            if (piece) {

                const pieceElement =
                    document.createElement("span");

                const key =
                    piece.color +
                    piece.type.toUpperCase();

                pieceElement.textContent =
                    PIECES[key];

                pieceElement.className =
                    piece.color === "w"
                        ? "piece white-piece"
                        : "piece black-piece";

                square.appendChild(pieceElement);
            }


            square.addEventListener(
                "click",
                function () {
                    handleSquareClick(squareName);
                }
            );


            boardElement.appendChild(square);
        }
    }
}


/* =========================================
   PLAYER CLICK
========================================= */

function handleSquareClick(square) {

    if (gameEnded) {
        return;
    }

    if (thinking) {
        return;
    }

    /* Player is White */

    if (game.turn() !== "w") {
        return;
    }


    /* Select a piece */

    if (!selectedSquare) {

        const piece = game.get(square);

        if (!piece) {
            return;
        }

        if (piece.color !== "w") {
            return;
        }

        selectedSquare = square;

        highlightSquare(square);

        return;
    }


    /* Move the piece */

    const move = game.move({
        from: selectedSquare,
        to: square,
        promotion: "q"
    });


    /* Illegal move */

    if (!move) {

        selectedSquare = null;

        drawBoard();

        return;
    }


    selectedSquare = null;

    drawBoard();
    updateHistory();


    /* Game over? */

    if (game.game_over()) {

        finishGame();

        return;
    }


    /* Magnus turn */

    magnusThink();
}


/* =========================================
   HIGHLIGHT
========================================= */

function highlightSquare(square) {

    const element =
        document.querySelector(
            '[data-square="' + square + '"]'
        );

    if (element) {

        element.classList.add("selected");

    }
}


/* =========================================
   MAGNUS THINKS
========================================= */

function magnusThink() {

    if (!engineReady) {

        statusElement.textContent =
            "MAGNUS ENGINE LOADING...";

        return;
    }


    thinking = true;

    statusElement.textContent =
        "👑 MAGNUS IS THINKING...";


    const fen = game.fen();


    /* Tell Stockfish current position */

    engine.postMessage(
        "position fen " + fen
    );


    /*
       Stockfish Skill Level 20
       High search depth.
    */

    engine.postMessage(
        "go depth 24"
    );
}


/* =========================================
   MAGNUS MAKES MOVE
========================================= */

function playMagnusMove(uciMove) {

    if (!thinking) {
        return;
    }


    const from =
        uciMove.substring(0, 2);

    const to =
        uciMove.substring(2, 4);


    let promotion = "q";


    if (uciMove.length >= 5) {

        promotion =
            uciMove.substring(4, 5);

    }


    const move = game.move({

        from: from,
        to: to,
        promotion: promotion

    });


    if (!move) {

        console.error(
            "Invalid Stockfish move:",
            uciMove
        );

        thinking = false;

        statusElement.textContent =
            "ENGINE ERROR";

        return;
    }


    thinking = false;


    drawBoard();
    updateHistory();


    if (game.game_over()) {

        finishGame();

        return;
    }


    statusElement.textContent =
        "YOUR MOVE";
}


/* =========================================
   MOVE HISTORY
========================================= */

function updateHistory() {

    const moves = game.history();


    if (moves.length === 0) {

        historyElement.textContent =
            "No moves yet.";

        return;
    }


    historyElement.innerHTML = "";


    for (let i = 0; i < moves.length; i += 2) {

        const row =
            document.createElement("div");


        const moveNumber =
            Math.floor(i / 2) + 1;


        const whiteMove =
            moves[i] || "";


        const blackMove =
            moves[i + 1] || "";


        row.textContent =
            moveNumber +
            ". " +
            whiteMove +
            " " +
            blackMove;


        historyElement.appendChild(row);
    }
}


/* =========================================
   GAME OVER
========================================= */

function finishGame() {

    thinking = false;
    gameEnded = true;


    if (game.in_checkmate()) {

        /*
           If it's White's turn after checkmate,
           White was checkmated.
        */

        if (game.turn() === "w") {

            statusElement.textContent =
                "👑 CHECKMATE — MAGNUS WINS";

        } else {

            statusElement.textContent =
                "🏆 YOU BEAT MAGNUS!";
        }

        return;
    }


    if (game.in_draw()) {

        statusElement.textContent =
            "🤝 DRAW";

        return;
    }


    statusElement.textContent =
        "GAME OVER";
}


/* =========================================
   NEW GAME
========================================= */

newGameButton.addEventListener(
    "click",
    function () {

        game.reset();

        selectedSquare = null;

        thinking = false;

        gameEnded = false;


        engine.postMessage("ucinewgame");


        drawBoard();
        updateHistory();


        statusElement.textContent =
            "YOUR MOVE";
    }
);


/* =========================================
   RESIGN
========================================= */

resignButton.addEventListener(
    "click",
    function () {

        if (gameEnded) {
            return;
        }


        gameEnded = true;
        thinking = false;


        statusElement.textContent =
            "👑 MAGNUS WINS — YOU RESIGNED";
    }
);


/* =========================================
   INITIALIZE
========================================= */

drawBoard();

updateHistory();

statusElement.textContent =
    "LOADING MAGNUS...";
