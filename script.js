document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Constants
    const boardElement = document.getElementById('sudoku-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const resetBtn = document.getElementById('reset-btn');
    const checkBtn = document.getElementById('check-btn');
    const pencilBtn = document.getElementById('pencil-btn');

    // Game State Variables
    let board = [];
    let initialBoard = [];
    let solution = [];
    let selectedCell = null;
    let pencilMode = false;

    /**
     * Creates the 9x9 Sudoku grid in the DOM.
     */
    function createBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            const row = Math.floor(i / 9);
            const col = i % 9;
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.dataset.row = row;
            cell.dataset.col = col;
            boardElement.appendChild(cell);
        }
    }

    /**
     * Counts the number of solutions for a given Sudoku board using backtracking.
     * The count is capped at 2, as we only need to know if there's 0, 1, or >1 solution.
     * @param {number[]} board - A board to check. Note: this board will be modified.
     * @returns {number} - The number of solutions found (0, 1, or 2).
     */
    function countSolutions(board) {
        let solutionCount = 0;

        function findAndCount() {
            const emptyCell = findEmptyCell(board);
            if (!emptyCell) {
                solutionCount++;
                return;
            }

            const [row, col] = emptyCell;
            const index = row * 9 + col;

            for (let num = 1; num <= 9; num++) {
                if (isValid(board, row, col, num)) {
                    board[index] = num;
                    findAndCount();
                }
                if (solutionCount >= 2) {
                    break;
                }
            }
            board[index] = 0; // Backtrack
        }

        findAndCount();
        return solutionCount;
    }

    /**
     * Initializes a new game by creating a new board, generating a puzzle, and displaying it.
     */
    function initializeGame() {
        createBoard();
        generateSudoku();
        displayBoard();
    }

    /**
     * Generates a new Sudoku puzzle.
     * It starts with an empty board, solves it completely,
     * stores the solution, and then removes numbers to create the puzzle.
     */
    function generateSudoku() {
        board = Array(81).fill(0);
        solveSudoku(board);
        solution = [...board];
        removeNumbers(board);
        initialBoard = [...board];
    }

    /**
     * Renders the current state of the board on the UI.
     * It clears previous states and highlights given numbers.
     */
    function displayBoard() {
        const cells = boardElement.children;
        for (let i = 0; i < 81; i++) {
            const cell = cells[i];
            cell.classList.remove('given', 'conflict', 'selected');

            if (board[i] !== 0) {
                cell.textContent = board[i];
                if (initialBoard[i] !== 0) {
                    cell.classList.add('given');
                }
            } else {
                cell.textContent = '';
            }
        }
    }

    /**
     * Solves the Sudoku board using a backtracking algorithm.
     * @param {number[]} board - The board to solve.
     * @returns {boolean} - True if a solution was found, false otherwise.
     */
    function solveSudoku(board) {
        const emptyCell = findEmptyCell(board);
        if (!emptyCell) {
            return true; // Board is solved
        }

        const [row, col] = emptyCell;
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of nums) {
            if (isValid(board, row, col, num)) {
                board[row * 9 + col] = num;
                if (solveSudoku(board)) {
                    return true;
                }
                board[row * 9 + col] = 0; // Backtrack
            }
        }
        return false;
    }

    /**
     * Finds the next empty cell on the board.
     * @param {number[]} board - The current board state.
     * @returns {number[]|null} - The [row, col] of the empty cell, or null if none.
     */
    function findEmptyCell(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                return [Math.floor(i / 9), i % 9];
            }
        }
        return null;
    }

    /**
     * Checks if a number is valid to be placed in a given cell.
     * @param {number[]} board - The current board state.
     * @param {number} row - The row of the cell.
     * @param {number} col - The column of the cell.
     * @param {number} num - The number to check.
     * @returns {boolean} - True if the number is valid, false otherwise.
     */
    function isValid(board, row, col, num) {
        // Check row and column
        for (let i = 0; i < 9; i++) {
            if (board[row * 9 + i] === num || board[i * 9 + col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[(startRow + i) * 9 + (startCol + j)] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Removes numbers from a solved board to create a puzzle with a unique solution.
     * @param {number[]} board - The solved Sudoku board.
     */
    function removeNumbers(board) {
        let attempts = 5; // Limit attempts to prevent infinite loops on difficult boards
        let removedCount = 0;
        const maxToRemove = 50; // Controls puzzle difficulty

        const indices = shuffle(Array.from(Array(81).keys()));

        for (const index of indices) {
            if (removedCount >= maxToRemove) {
                break;
            }

            const originalValue = board[index];
            if (originalValue === 0) {
                continue;
            }

            board[index] = 0;
            const tempBoard = [...board];
            const solutions = countSolutions(tempBoard);

            if (solutions !== 1) {
                // If removing the number results in not exactly one solution, put it back.
                board[index] = originalValue;
                attempts--;
                if (attempts === 0) {
                    // To avoid getting stuck, we can stop early if we fail too many times.
                    // This could be adjusted for more difficult puzzles.
                }
            } else {
                removedCount++;
            }
        }
    }

    /**
     * Shuffles an array randomly.
     * @param {any[]} array - The array to shuffle.
     * @returns {any[]} - The shuffled array.
     */
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Event Listeners ---

    // Starts a new game when the "New Puzzle" button is clicked.
    newGameBtn.addEventListener('click', initializeGame);

    // Resets the board to its initial state.
    resetBtn.addEventListener('click', () => {
        board = [...initialBoard];
        displayBoard();
    });

    // Checks the user's solution for correctness.
    checkBtn.addEventListener('click', () => {
        let isComplete = !board.includes(0);
        let correct = true;

        for (let i = 0; i < 81; i++) {
            const cell = boardElement.children[i];
            cell.classList.remove('conflict');
            if (board[i] !== 0 && board[i] !== solution[i]) {
                cell.classList.add('conflict');
                correct = false;
            }
        }

        if (isComplete && correct) {
            alert('Congratulations! You solved the puzzle!');
        } else if (isComplete) {
            alert('The solution is incorrect. Keep trying!');
        } else {
            alert('The board is not yet complete.');
        }
    });

    // Handles cell selection on the board.
    boardElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('cell')) {
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            selectedCell = e.target;
            selectedCell.classList.add('selected');
        }
    });

    // Toggles pencil mode.
    pencilBtn.addEventListener('click', () => {
        pencilMode = !pencilMode;
        pencilBtn.classList.toggle('active');
    });

    // Handles keyboard input for numbers and pencil notes.
    document.addEventListener('keydown', (e) => {
        if (selectedCell && !selectedCell.classList.contains('given')) {
            const key = parseInt(e.key);
            const index = parseInt(selectedCell.dataset.index);
            if (key >= 1 && key <= 9) {
                if (pencilMode) {
                    addPencilNote(key);
                } else {
                    const row = Math.floor(index / 9);
                    const col = index % 9;
                    if (isValid(board, row, col, key)) {
                        board[index] = key;
                        selectedCell.textContent = key;
                        selectedCell.classList.remove('conflict');
                        updateHighlights();
                    } else {
                        board[index] = key;
                        selectedCell.textContent = key;
                        selectedCell.classList.add('conflict');
                    }
                    clearPencilNotes();
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                board[index] = 0;
                selectedCell.textContent = '';
                selectedCell.classList.remove('conflict');
                clearPencilNotes();
                updateHighlights();
            }
        }
    });

    /**
     * Checks for and highlights completed rows, columns, and 3x3 boxes.
     */
    function updateHighlights() {
        const cells = boardElement.children;

        // Clear previous highlights
        for (let i = 0; i < 81; i++) {
            cells[i].classList.remove('completed');
        }

        // Check rows
        for (let row = 0; row < 9; row++) {
            const rowCells = [];
            let isComplete = true;
            for (let col = 0; col < 9; col++) {
                const index = row * 9 + col;
                rowCells.push(cells[index]);
                if (board[index] === 0 || board[index] !== solution[index]) {
                    isComplete = false;
                }
            }
            if (isComplete) {
                rowCells.forEach(cell => cell.classList.add('completed'));
            }
        }

        // Check columns
        for (let col = 0; col < 9; col++) {
            const colCells = [];
            let isComplete = true;
            for (let row = 0; row < 9; row++) {
                const index = row * 9 + col;
                colCells.push(cells[index]);
                if (board[index] === 0 || board[index] !== solution[index]) {
                    isComplete = false;
                }
            }
            if (isComplete) {
                colCells.forEach(cell => cell.classList.add('completed'));
            }
        }

        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxCells = [];
                let isComplete = true;
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const r = boxRow * 3 + row;
                        const c = boxCol * 3 + col;
                        const index = r * 9 + c;
                        boxCells.push(cells[index]);
                        if (board[index] === 0 || board[index] !== solution[index]) {
                            isComplete = false;
                        }
                    }
                }
                if (isComplete) {
                    boxCells.forEach(cell => cell.classList.add('completed'));
                }
            }
        }
    }

    /**
     * Adds or removes a pencil note from the selected cell.
     * @param {number} num - The number to add/remove as a note.
     */
    function addPencilNote(num) {
        const noteContainer = getOrCreateNoteContainer();
        const existingNote = noteContainer.querySelector(`.note-${num}`);
        if (existingNote) {
            existingNote.remove();
        } else {
            const note = document.createElement('div');
            note.classList.add('pencil-note', `note-${num}`);
            note.textContent = num;
            note.style.top = `${(Math.floor((num - 1) / 3)) * 15}px`;
            note.style.left = `${((num - 1) % 3) * 15}px`;
            noteContainer.appendChild(note);
        }
    }

    /**
     * Gets or creates the container for pencil notes in the selected cell.
     * @returns {HTMLElement} - The pencil notes container.
     */
    function getOrCreateNoteContainer() {
        let container = selectedCell.querySelector('.pencil-notes-container');
        if (!container) {
            container = document.createElement('div');
            container.classList.add('pencil-notes-container');
            selectedCell.appendChild(container);
        }
        return container;
    }

    /**
     * Clears all pencil notes from the selected cell.
     */
    function clearPencilNotes() {
        const container = selectedCell.querySelector('.pencil-notes-container');
        if (container) {
            container.remove();
        }
    }

    // Initialize the game when the page loads.
    initializeGame();
});
