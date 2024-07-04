const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let clients = [];
let board = [];
const rows = 10;
const cols = 10;
const minesCount = 20;

// Initialize the board
function initBoard() {
    board = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let cell = {
                revealed: false,
                mine: false,
                adjacentMines: 0,
                flagged: false
            };
            row.push(cell);
        }
        board.push(row);
    }
}

// Place mines randomly
function placeMines() {
    let placedMines = 0;
    while (placedMines < minesCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (!board[r][c].mine) {
            board[r][c].mine = true;
            placedMines++;
        }
    }
}

// Calculate adjacent mines for each cell
function calculateAdjacentMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].mine) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        let nr = r + dr;
                        let nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !(dr === 0 && dc === 0)) {
                            board[nr][nc].adjacentMines++;
                        }
                    }
                }
            }
        }
    }
}

// Initialize the game board
function initGame() {
    initBoard();
    placeMines();
    calculateAdjacentMines();
}

// Send the board to all clients
function sendBoard() {
    const boardData = JSON.stringify(board);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'board', board: boardData }));
        }
    });
}

wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('New client connected');

    // Send the current board to the new client
    if (board.length > 0) {
        ws.send(JSON.stringify({ type: 'board', board: JSON.stringify(board) }));
    }

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'reveal') {
            const { row, col } = parsedMessage;
            board[row][col].revealed = true;
            // Broadcast the reveal to all clients
            broadcastToAllExcept(ws, { type: 'reveal', row, col });
        } else if (parsedMessage.type === 'flag') {
            const { row, col } = parsedMessage;
            board[row][col].flagged = !board[row][col].flagged;
            // Broadcast the flag to all clients except the sender
            broadcastToAllExcept(ws, { type: 'flag', row, col });
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

// New function to broadcast to all clients except the sender
function broadcastToAllExcept(sender, message) {
    clients.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    initGame();
    sendBoard();
});