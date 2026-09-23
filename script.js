// ======================================================
// 1. CÁC GIÁ TRỊ CƠ BẢN
// ======================================================

// Người chơi dùng X.
const HUMAN = "X";

// AI dùng O.
const AI = "O";

// Giá trị đại diện cho ô trống.
const EMPTY = "";


// ======================================================
// 2. CÁC ĐƯỜNG THẮNG
// ======================================================
//
// Index bàn cờ:
//
// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8
//
// ======================================================

const WINNING_LINES = [

    // Hàng ngang
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // Hàng dọc
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // Hai đường chéo
    [0, 4, 8],
    [2, 4, 6]
];


// ======================================================
// 3. TRẠNG THÁI GAME
// ======================================================

// Bàn cờ gồm 9 ô.
let board =
    Array(9).fill(EMPTY);

// Trạng thái game.
let gameOver = false;


// ======================================================
// 4. LẤY PHẦN TỬ HTML
// ======================================================

const boardElement =
    document.getElementById(
        "board"
    );

const statusElement =
    document.getElementById(
        "status"
    );

const algorithmElement =
    document.getElementById(
        "algorithm"
    );

const resetButton =
    document.getElementById(
        "resetBtn"
    );


const nodesVisitedElement =
    document.getElementById(
        "nodesVisited"
    );

const maxDepthElement =
    document.getElementById(
        "maxDepth"
    );

const terminalStatesElement =
    document.getElementById(
        "terminalStates"
    );

const prunedBranchesElement =
    document.getElementById(
        "prunedBranches"
    );

const bestScoreElement =
    document.getElementById(
        "bestScore"
    );

const algorithmDescriptionElement =
    document.getElementById(
        "algorithmDescription"
    );


// ======================================================
// 5. TẠO GIAO DIỆN BÀN CỜ
// ======================================================

function createBoardUI() {

    boardElement.innerHTML = "";


    board.forEach(
        (value, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "cell";


            button.dataset.index =
                index;


            button.setAttribute(
                "aria-label",
                `Ô ${index + 1}`
            );


            button.addEventListener(
                "click",
                handleHumanMove
            );


            boardElement.appendChild(
                button
            );
        }
    );


    render();
}


// ======================================================
// 6. CẬP NHẬT GIAO DIỆN
// ======================================================

function render() {

    [
        ...boardElement.children

    ].forEach(
        (cell, index) => {

            cell.textContent =
                board[index];


            cell.classList.toggle(
                "x",
                board[index] === HUMAN
            );


            cell.classList.toggle(
                "o",
                board[index] === AI
            );


            cell.disabled =

                gameOver ||

                board[index] !== EMPTY;
        }
    );
}


// ======================================================
// 7. XỬ LÝ NƯỚC ĐI CỦA NGƯỜI CHƠI
// ======================================================

function handleHumanMove(event) {

    if (gameOver) {
        return;
    }


    const index =
        Number(
            event.currentTarget
                .dataset.index
        );


    // Ô đã có quân.
    if (
        board[index] !== EMPTY
    ) {
        return;
    }


    // Người chơi đánh X.
    board[index] = HUMAN;


    // Kiểm tra kết thúc.
    if (finishIfNeeded()) {

        render();

        return;
    }


    statusElement.textContent =
        "AI đang tính nước đi...";


    render();


    // Cho trình duyệt cập nhật UI
    // trước khi AI tính.
    setTimeout(
        () => {

            makeAIMove();

            render();

            finishIfNeeded();


            if (!gameOver) {

                statusElement.textContent =
                    "Lượt của bạn (X)";
            }

        },
        80
    );
}


// ======================================================
// 8. AI CHỌN THUẬT TOÁN
// ======================================================

function makeAIMove() {

    const algorithm =
        algorithmElement.value;


    // Thống kê cho mỗi lượt AI.
    const stats = {

        // Tổng node được duyệt.
        nodesVisited: 0,

        // Độ sâu lớn nhất.
        maxDepth: 0,

        // Số trạng thái cuối.
        terminalStates: 0,

        // Số lần Alpha-Beta cắt.
        prunedBranches: 0
    };


    let result;


    // ================================================
    // CHỌN THUẬT TOÁN
    // ================================================

    if (algorithm === "dfs") {

        result =
            findMoveDFSDemo(
                board,
                stats
            );

    } else if (
        algorithm === "alphabeta"
    ) {

        result =
            findBestMoveAlphaBeta(
                board,
                stats
            );

    } else {

        result =
            findBestMoveMinimax(
                board,
                stats
            );
    }


    // AI đánh nước đã chọn.
    if (
        result.index !== null
    ) {

        board[result.index] = AI;
    }


    // Hiển thị thống kê.
    nodesVisitedElement.textContent =
        stats.nodesVisited;


    maxDepthElement.textContent =
        stats.maxDepth;


    terminalStatesElement.textContent =
        stats.terminalStates;


    prunedBranchesElement.textContent =
        stats.prunedBranches;


    bestScoreElement.textContent =

        result.score === null

            ? "N/A"

            : result.score;
}


// ######################################################
// ######################################################
//
//        CHỦ ĐỀ 1: DFS
//
//        DEPTH FIRST SEARCH
//
// ######################################################
// ######################################################
//
// DFS hoạt động:
//
// CHỌN
//   ↓
// ĐI SÂU
//   ↓
// GẶP TRẠNG THÁI CUỐI
//   ↓
// QUAY LUI
//   ↓
// THỬ NHÁNH KHÁC
//
// ######################################################


// ======================================================
// 9. DFS DUYỆT CÂY TRÒ CHƠI
// ======================================================

function dfsExplore(
    currentBoard,
    isAITurn,
    depth,
    stats
) {

    // Mỗi lần vào hàm
    // là duyệt thêm 1 node.
    stats.nodesVisited++;


    // Ghi nhận độ sâu lớn nhất.
    stats.maxDepth =
        Math.max(
            stats.maxDepth,
            depth
        );


    // Kiểm tra đã có người thắng chưa.
    const winner =
        getWinner(
            currentBoard
        );


    const moves =
        getAvailableMoves(
            currentBoard
        );


    // ================================================
    // ĐIỀU KIỆN DỪNG DFS
    // ================================================
    //
    // Nếu:
    //
    // - AI thắng
    // - Người thắng
    // - Hết ô -> hòa
    //
    // thì đây là node kết thúc.
    //
    // ================================================

    if (
        winner !== null ||
        moves.length === 0
    ) {

        stats.terminalStates++;

        return;
    }


    // ================================================
    // DFS:
    // DUYỆT TỪNG TRẠNG THÁI CON
    // ================================================

    for (
        const index
        of moves
    ) {

        // --------------------------------------------
        // BƯỚC 1: CHỌN
        // --------------------------------------------

        currentBoard[index] =

            isAITurn

                ? AI

                : HUMAN;


        // --------------------------------------------
        // BƯỚC 2: ĐI SÂU
        // --------------------------------------------

        dfsExplore(
            currentBoard,

            // Đổi lượt.
            !isAITurn,

            // Sang tầng tiếp theo.
            depth + 1,

            stats
        );


        // --------------------------------------------
        // BƯỚC 3: QUAY LUI
        // BACKTRACKING
        // --------------------------------------------

        currentBoard[index] =
            EMPTY;
    }
}


// ======================================================
// 10. CHẾ ĐỘ DFS DEMO
// ======================================================
//
// LƯU Ý:
//
// DFS chỉ là thuật toán DUYỆT CÂY.
//
// DFS không có MAX/MIN,
// không tự biết nước nào tốt hơn.
//
// Vì vậy ở chế độ Demo:
//
// 1. DFS duyệt toàn bộ cây để
//    cho thấy số trạng thái.
//
// 2. AI sau đó chọn ô trống đầu tiên.
//
// Mục đích là minh họa DFS,
// không phải tạo AI tối ưu.
//
// ======================================================

function findMoveDFSDemo(
    currentBoard,
    stats
) {

    // Dùng DFS duyệt cây.
    dfsExplore(

        currentBoard,

        // Hiện tại là lượt AI.
        true,

        0,

        stats
    );


    const moves =
        getAvailableMoves(
            currentBoard
        );


    // Nếu không còn nước.
    if (
        moves.length === 0
    ) {

        return {

            index: null,

            score: null
        };
    }


    // DFS không đánh giá nước đi.
    // Demo chọn ô trống đầu tiên.
    return {

        index: moves[0],

        score: null
    };
}


// ######################################################
// ######################################################
//
//        CHỦ ĐỀ 2: MINIMAX
//
// ######################################################
// ######################################################
//
// AI     = MAX
//
// Người  = MIN
//
// MAX chọn giá trị lớn nhất.
//
// MIN chọn giá trị nhỏ nhất.
//
// Minimax sử dụng DFS để
// đi sâu xuống cây.
//
// ######################################################


// ======================================================
// 11. TÌM NƯỚC TỐT NHẤT BẰNG MINIMAX
// ======================================================

function findBestMoveMinimax(
    currentBoard,
    stats
) {

    // AI là MAX.
    let bestScore =
        -Infinity;


    let bestIndex =
        null;


    // Thử tất cả nước
    // AI có thể đánh.
    for (
        const index
        of getAvailableMoves(
            currentBoard
        )
    ) {

        // ============================================
        // DFS: CHỌN
        // ============================================

        currentBoard[index] =
            AI;


        // ============================================
        // DFS: ĐI SÂU
        // ============================================

        const score =
            minimax(
                currentBoard,

                0,

                // Sau AI là lượt người.
                false,

                stats
            );


        // ============================================
        // DFS: QUAY LUI
        // ============================================

        currentBoard[index] =
            EMPTY;


        // ============================================
        // MINIMAX:
        // AI chọn score lớn hơn.
        // ============================================

        if (
            score > bestScore
        ) {

            bestScore =
                score;

            bestIndex =
                index;
        }
    }


    return {

        index: bestIndex,

        score: bestScore
    };
}


// ======================================================
// 12. THUẬT TOÁN MINIMAX
// ======================================================

function minimax(
    currentBoard,
    depth,
    isMaximizing,
    stats
) {

    // Đếm node.
    stats.nodesVisited++;


    stats.maxDepth =
        Math.max(
            stats.maxDepth,
            depth
        );


    // Kiểm tra node cuối.
    const terminalScore =
        evaluateTerminal(
            currentBoard,
            depth
        );


    // ================================================
    // ĐIỀU KIỆN DỪNG
    // ================================================

    if (
        terminalScore !== null
    ) {

        stats.terminalStates++;

        return terminalScore;
    }


    // ================================================
    // MAX - LƯỢT AI
    // ================================================

    if (isMaximizing) {

        let bestScore =
            -Infinity;


        for (
            const index
            of getAvailableMoves(
                currentBoard
            )
        ) {

            // DFS: CHỌN
            currentBoard[index] =
                AI;


            // DFS: ĐI SÂU
            const score =
                minimax(

                    currentBoard,

                    depth + 1,

                    false,

                    stats
                );


            // DFS: QUAY LUI
            currentBoard[index] =
                EMPTY;


            // ========================================
            // MINIMAX:
            // MAX chọn số lớn nhất.
            // ========================================

            bestScore =
                Math.max(
                    bestScore,
                    score
                );
        }


        return bestScore;
    }


    // ================================================
    // MIN - LƯỢT NGƯỜI
    // ================================================

    let bestScore =
        Infinity;


    for (
        const index
        of getAvailableMoves(
            currentBoard
        )
    ) {

        // DFS: CHỌN
        currentBoard[index] =
            HUMAN;


        // DFS: ĐI SÂU
        const score =
            minimax(

                currentBoard,

                depth + 1,

                true,

                stats
            );


        // DFS: QUAY LUI
        currentBoard[index] =
            EMPTY;


        // ============================================
        // MINIMAX:
        // MIN chọn số nhỏ nhất.
        // ============================================

        bestScore =
            Math.min(
                bestScore,
                score
            );
    }


    return bestScore;
}


// ######################################################
// ######################################################
//
//      CHỦ ĐỀ 3: ALPHA-BETA
//
// ######################################################
// ######################################################
//
// Alpha-Beta vẫn dùng:
//
// DFS
// +
// Minimax
//
// Nhưng thêm:
//
// alpha
// beta
//
// Nếu:
//
// beta <= alpha
//
// thì:
//
// CẮT NHÁNH
//
// ######################################################


// ======================================================
// 13. TÌM NƯỚC TỐT NHẤT BẰNG ALPHA-BETA
// ======================================================

function findBestMoveAlphaBeta(
    currentBoard,
    stats
) {

    let bestScore =
        -Infinity;


    let bestIndex =
        null;


    // Giá trị tốt nhất
    // MAX đang có.
    let alpha =
        -Infinity;


    // Cận trên ban đầu.
    const beta =
        Infinity;


    for (
        const index
        of getAvailableMoves(
            currentBoard
        )
    ) {

        // DFS: CHỌN
        currentBoard[index] =
            AI;


        // DFS: ĐI SÂU
        const score =
            alphaBeta(

                currentBoard,

                0,

                false,

                alpha,

                beta,

                stats
            );


        // DFS: QUAY LUI
        currentBoard[index] =
            EMPTY;


        // Ghi nhận nước tốt hơn.
        if (
            score > bestScore
        ) {

            bestScore =
                score;

            bestIndex =
                index;
        }


        // MAX cập nhật alpha.
        alpha =
            Math.max(
                alpha,
                bestScore
            );
    }


    return {

        index: bestIndex,

        score: bestScore
    };
}


// ======================================================
// 14. THUẬT TOÁN ALPHA-BETA
// ======================================================

function alphaBeta(
    currentBoard,
    depth,
    isMaximizing,
    alpha,
    beta,
    stats
) {

    // Đếm node.
    stats.nodesVisited++;


    stats.maxDepth =
        Math.max(
            stats.maxDepth,
            depth
        );


    // Kiểm tra node cuối.
    const terminalScore =
        evaluateTerminal(
            currentBoard,
            depth
        );


    if (
        terminalScore !== null
    ) {

        stats.terminalStates++;

        return terminalScore;
    }


    // ================================================
    // MAX - AI
    // ================================================

    if (isMaximizing) {

        let bestScore =
            -Infinity;


        for (
            const index
            of getAvailableMoves(
                currentBoard
            )
        ) {

            // DFS: CHỌN
            currentBoard[index] =
                AI;


            // DFS: ĐI SÂU
            const score =
                alphaBeta(

                    currentBoard,

                    depth + 1,

                    false,

                    alpha,

                    beta,

                    stats
                );


            // DFS: QUAY LUI
            currentBoard[index] =
                EMPTY;


            // MINIMAX - MAX
            bestScore =
                Math.max(
                    bestScore,
                    score
                );


            // ========================================
            // ALPHA-BETA:
            // cập nhật alpha.
            // ========================================

            alpha =
                Math.max(
                    alpha,
                    bestScore
                );


            // ========================================
            // CẮT NHÁNH
            // ========================================

            if (
                beta <= alpha
            ) {

                stats.prunedBranches++;

                break;
            }
        }


        return bestScore;
    }


    // ================================================
    // MIN - NGƯỜI
    // ================================================

    let bestScore =
        Infinity;


    for (
        const index
        of getAvailableMoves(
            currentBoard
        )
    ) {

        // DFS: CHỌN
        currentBoard[index] =
            HUMAN;


        // DFS: ĐI SÂU
        const score =
            alphaBeta(

                currentBoard,

                depth + 1,

                true,

                alpha,

                beta,

                stats
            );


        // DFS: QUAY LUI
        currentBoard[index] =
            EMPTY;


        // MINIMAX - MIN
        bestScore =
            Math.min(
                bestScore,
                score
            );


        // ============================================
        // ALPHA-BETA:
        // cập nhật beta.
        // ============================================

        beta =
            Math.min(
                beta,
                bestScore
            );


        // ============================================
        // CẮT NHÁNH
        // ============================================

        if (
            beta <= alpha
        ) {

            stats.prunedBranches++;

            break;
        }
    }


    return bestScore;
}


// ======================================================
// 15. HÀM ĐÁNH GIÁ TRẠNG THÁI CUỐI
// ======================================================

function evaluateTerminal(
    currentBoard,
    depth
) {

    const winner =
        getWinner(
            currentBoard
        );


    // AI thắng.
    if (
        winner === AI
    ) {

        // Thắng càng sớm
        // càng nhiều điểm.
        return 10 - depth;
    }


    // Người thắng.
    if (
        winner === HUMAN
    ) {

        return depth - 10;
    }


    // Hết ô mà chưa ai thắng.
    if (
        getAvailableMoves(
            currentBoard
        ).length === 0
    ) {

        return 0;
    }


    // Game chưa kết thúc.
    return null;
}


// ======================================================
// 16. KIỂM TRA NGƯỜI THẮNG
// ======================================================

function getWinner(
    currentBoard
) {

    for (
        const [a, b, c]
        of WINNING_LINES
    ) {

        if (

            currentBoard[a] !==
                EMPTY

            &&

            currentBoard[a] ===
                currentBoard[b]

            &&

            currentBoard[a] ===
                currentBoard[c]

        ) {

            return currentBoard[a];
        }
    }


    return null;
}


// ======================================================
// 17. LẤY TẤT CẢ NƯỚC ĐI HỢP LỆ
// ======================================================
//
// Đây tương ứng với:
//
// Actions(s)
//
// trong cây trò chơi.
//
// ======================================================

function getAvailableMoves(
    currentBoard
) {

    const moves = [];


    currentBoard.forEach(
        (value, index) => {

            if (
                value === EMPTY
            ) {

                moves.push(
                    index
                );
            }
        }
    );


    return moves;
}


// ======================================================
// 18. KIỂM TRA GAME KẾT THÚC
// ======================================================

function finishIfNeeded() {

    const winner =
        getWinner(
            board
        );


    // Người thắng.
    if (
        winner === HUMAN
    ) {

        gameOver = true;

        statusElement.textContent =
            "Bạn thắng!";

        return true;
    }


    // AI thắng.
    if (
        winner === AI
    ) {

        gameOver = true;

        statusElement.textContent =
            "AI thắng!";

        return true;
    }


    // Hòa.
    if (
        getAvailableMoves(
            board
        ).length === 0
    ) {

        gameOver = true;

        statusElement.textContent =
            "Hòa!";

        return true;
    }


    return false;
}


// ======================================================
// 19. RESET GAME
// ======================================================

function resetGame() {

    // Tạo lại bàn cờ.
    board =
        Array(9).fill(
            EMPTY
        );


    gameOver = false;


    // Reset thống kê.
    nodesVisitedElement.textContent =
        "0";


    maxDepthElement.textContent =
        "0";


    terminalStatesElement.textContent =
        "0";


    prunedBranchesElement.textContent =
        "0";


    bestScoreElement.textContent =
        "-";


    statusElement.textContent =
        "Lượt của bạn (X)";


    updateAlgorithmDescription();


    render();
}


// ======================================================
// 20. GIẢI THÍCH THUẬT TOÁN ĐANG CHỌN
// ======================================================

function updateAlgorithmDescription() {

    const algorithm =
        algorithmElement.value;


    if (
        algorithm === "dfs"
    ) {

        algorithmDescriptionElement
            .textContent =

            "DFS Demo chỉ minh họa cách "
            + "duyệt cây theo chiều sâu. "
            + "DFS không tự đánh giá nước đi, "
            + "nên AI sẽ chọn ô trống đầu tiên.";

    } else if (
        algorithm === "minimax"
    ) {

        algorithmDescriptionElement
            .textContent =

            "Minimax sử dụng DFS để duyệt "
            + "cây trò chơi. AI là MAX chọn "
            + "điểm lớn nhất, người chơi là "
            + "MIN chọn điểm nhỏ nhất.";

    } else {

        algorithmDescriptionElement
            .textContent =

            "Alpha-Beta tối ưu Minimax bằng "
            + "hai cận alpha và beta. Khi "
            + "beta <= alpha, các nhánh còn "
            + "lại được cắt bỏ.";
    }
}


// ======================================================
// 21. SỰ KIỆN GIAO DIỆN
// ======================================================

// Nút chơi lại.
resetButton.addEventListener(
    "click",
    resetGame
);


// Khi đổi thuật toán.
algorithmElement.addEventListener(
    "change",
    () => {

        resetGame();
    }
);


// ======================================================
// 22. KHỞI ĐỘNG CHƯƠNG TRÌNH
// ======================================================

updateAlgorithmDescription();

createBoardUI();