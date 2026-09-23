const HUMAN = "X";
const AI = "O";
const EMPTY = "";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill(EMPTY);
let gameOver = false;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const algorithmElement = document.getElementById("algorithm");
const resetButton = document.getElementById("resetBtn");

const nodesVisitedElement = document.getElementById("nodesVisited");
const prunedBranchesElement = document.getElementById("prunedBranches");
const bestScoreElement = document.getElementById("bestScore");

function createBoardUI() {
  boardElement.innerHTML = "";

  board.forEach((value, index) => {
    const button = document.createElement("button");
    button.className = "cell";
    button.dataset.index = index;
    button.setAttribute("aria-label", `Ô ${index + 1}`);
    button.addEventListener("click", handleHumanMove);
    boardElement.appendChild(button);
  });

  render();
}

function render() {
  [...boardElement.children].forEach((cell, index) => {
    cell.textContent = board[index];
    cell.classList.toggle("x", board[index] === HUMAN);
    cell.classList.toggle("o", board[index] === AI);
    cell.disabled = gameOver || board[index] !== EMPTY;
  });
}

function handleHumanMove(event) {
  if (gameOver) return;

  const index = Number(event.currentTarget.dataset.index);

  if (board[index] !== EMPTY) return;

  board[index] = HUMAN;

  if (finishIfNeeded()) {
    render();
    return;
  }

  statusElement.textContent = "AI đang tính nước đi...";
  render();

  // setTimeout giúp giao diện cập nhật trước khi AI tính toán.
  setTimeout(() => {
    makeAIMove();
    render();
    finishIfNeeded();

    if (!gameOver) {
      statusElement.textContent = "Lượt của bạn (X)";
    }
  }, 80);
}

function makeAIMove() {
  const algorithm = algorithmElement.value;
  const stats = {
    nodesVisited: 0,
    prunedBranches: 0,
  };

  const result =
    algorithm === "alphabeta"
      ? findBestMoveAlphaBeta(board, stats)
      : findBestMoveMinimax(board, stats);

  if (result.index !== null) {
    board[result.index] = AI;
  }

  nodesVisitedElement.textContent = stats.nodesVisited;
  prunedBranchesElement.textContent = stats.prunedBranches;
  bestScoreElement.textContent = result.score;
}

function findBestMoveMinimax(currentBoard, stats) {
  let bestScore = -Infinity;
  let bestIndex = null;

  for (const index of getAvailableMoves(currentBoard)) {
    currentBoard[index] = AI;
    const score = minimax(currentBoard, 0, false, stats);
    currentBoard[index] = EMPTY;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return { index: bestIndex, score: bestScore };
}

function minimax(currentBoard, depth, isMaximizing, stats) {
  stats.nodesVisited++;

  const terminalScore = evaluateTerminal(currentBoard, depth);

  if (terminalScore !== null) {
    return terminalScore;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const index of getAvailableMoves(currentBoard)) {
      currentBoard[index] = AI;
      const score = minimax(currentBoard, depth + 1, false, stats);
      currentBoard[index] = EMPTY;
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const index of getAvailableMoves(currentBoard)) {
    currentBoard[index] = HUMAN;
    const score = minimax(currentBoard, depth + 1, true, stats);
    currentBoard[index] = EMPTY;
    bestScore = Math.min(bestScore, score);
  }

  return bestScore;
}

function findBestMoveAlphaBeta(currentBoard, stats) {
  let bestScore = -Infinity;
  let bestIndex = null;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const index of getAvailableMoves(currentBoard)) {
    currentBoard[index] = AI;

    const score = alphaBeta(
      currentBoard,
      0,
      false,
      alpha,
      beta,
      stats
    );

    currentBoard[index] = EMPTY;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }

    alpha = Math.max(alpha, bestScore);
  }

  return { index: bestIndex, score: bestScore };
}

function alphaBeta(
  currentBoard,
  depth,
  isMaximizing,
  alpha,
  beta,
  stats
) {
  stats.nodesVisited++;

  const terminalScore = evaluateTerminal(currentBoard, depth);

  if (terminalScore !== null) {
    return terminalScore;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (const index of getAvailableMoves(currentBoard)) {
      currentBoard[index] = AI;

      const score = alphaBeta(
        currentBoard,
        depth + 1,
        false,
        alpha,
        beta,
        stats
      );

      currentBoard[index] = EMPTY;
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);

      if (beta <= alpha) {
        stats.prunedBranches++;
        break;
      }
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const index of getAvailableMoves(currentBoard)) {
    currentBoard[index] = HUMAN;

    const score = alphaBeta(
      currentBoard,
      depth + 1,
      true,
      alpha,
      beta,
      stats
    );

    currentBoard[index] = EMPTY;
    bestScore = Math.min(bestScore, score);
    beta = Math.min(beta, bestScore);

    if (beta <= alpha) {
      stats.prunedBranches++;
      break;
    }
  }

  return bestScore;
}

function evaluateTerminal(currentBoard, depth) {
  const winner = getWinner(currentBoard);

  if (winner === AI) {
    return 10 - depth;
  }

  if (winner === HUMAN) {
    return depth - 10;
  }

  if (getAvailableMoves(currentBoard).length === 0) {
    return 0;
  }

  return null;
}

function getWinner(currentBoard) {
  for (const [a, b, c] of WINNING_LINES) {
    if (
      currentBoard[a] !== EMPTY &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return currentBoard[a];
    }
  }

  return null;
}

function getAvailableMoves(currentBoard) {
  const moves = [];

  currentBoard.forEach((value, index) => {
    if (value === EMPTY) {
      moves.push(index);
    }
  });

  return moves;
}

function finishIfNeeded() {
  const winner = getWinner(board);

  if (winner === HUMAN) {
    gameOver = true;
    statusElement.textContent = "Bạn thắng!";
    return true;
  }

  if (winner === AI) {
    gameOver = true;
    statusElement.textContent = "AI thắng!";
    return true;
  }

  if (getAvailableMoves(board).length === 0) {
    gameOver = true;
    statusElement.textContent = "Hòa!";
    return true;
  }

  return false;
}

function resetGame() {
  board = Array(9).fill(EMPTY);
  gameOver = false;

  nodesVisitedElement.textContent = "0";
  prunedBranchesElement.textContent = "0";
  bestScoreElement.textContent = "-";
  statusElement.textContent = "Lượt của bạn (X)";

  render();
}

resetButton.addEventListener("click", resetGame);

algorithmElement.addEventListener("change", () => {
  resetGame();
});

createBoardUI();
