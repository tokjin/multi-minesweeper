document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const rows = 10;
    const cols = 10;
    let board = [];
    let ws;

    // Initialize WebSocket
    function initWebSocket() {
        ws = new WebSocket(`ws://${window.location.host}`);
        ws.onopen = () => {
            console.log('Connected to the server');
        };
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'board') {
                    board = JSON.parse(message.board);
                    renderBoard();
                } else if (message.type === 'reveal') {
                    revealCellFromServer(message.row, message.col);
                } else if (message.type === 'flag') {
                    flagCellFromServer(message.row, message.col);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
        ws.onclose = () => {
            console.log('Disconnected from the server');
        };
    }

    // Render the board
    function renderBoard() {
        gameBoard.innerHTML = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.dataset.row = r;
                cellDiv.dataset.col = c;
                cellDiv.addEventListener('click', () => revealCell(r, c));
                cellDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    flagCell(r, c);
                });
                updateCellDisplay(cellDiv, r, c);
                gameBoard.appendChild(cellDiv);
            }
        }
    }

    // Update cell display
    function updateCellDisplay(cellDiv, row, col) {
        if (board[row][col].revealed) {
            cellDiv.classList.add('revealed');
            if (board[row][col].mine) {
                cellDiv.textContent = '💣';
            } else {
                cellDiv.textContent = board[row][col].adjacentMines || '';
            }
        } else if (board[row][col].flagged) {
            cellDiv.textContent = '🚩';
            cellDiv.classList.add('flagged');
        } else {
            cellDiv.textContent = '';
            cellDiv.classList.remove('flagged');
        }
    }

    // Reveal cell
    function revealCell(row, col) {
        if (board[row][col].revealed || board[row][col].flagged) return;
        board[row][col].revealed = true;
        const cellDiv = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        updateCellDisplay(cellDiv, row, col);
        if (board[row][col].mine) {
            alert('Game Over!');
        }
        // Send the cell reveal to the server
        ws.send(JSON.stringify({
            type: 'reveal',
            row: row,
            col: col
        }));
    }

    // Reveal cell from server
    function revealCellFromServer(row, col) {
        if (board[row][col].revealed) return;
        board[row][col].revealed = true;
        const cellDiv = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        updateCellDisplay(cellDiv, row, col);
    }

    // Flag cell
    function flagCell(row, col) {
        if (board[row][col].revealed) return;
        board[row][col].flagged = !board[row][col].flagged;
        const cellDiv = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        updateCellDisplay(cellDiv, row, col);
        // Send the cell flag to the server
        ws.send(JSON.stringify({
            type: 'flag',
            row: row,
            col: col
        }));
    }

    // Flag cell from server
    function flagCellFromServer(row, col) {
        // Only update if the local state doesn't match the server state
        if (board[row][col].flagged !== !board[row][col].flagged) {
            board[row][col].flagged = !board[row][col].flagged;
            const cellDiv = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            updateCellDisplay(cellDiv, row, col);
        }
    }

    // Initialize the game
    function initGame() {
        initWebSocket();
    }

    initGame();
});