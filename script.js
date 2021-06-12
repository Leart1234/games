// Allows to enable/disable logs
var bIsLogEnabled = true;

var GameModel = {
    // game data structure
    matrix : [],

    // current player (either 1 or 2)
    lastPlayer : 2,
    currentPlayer : 1,

    // the x index of the first square available given the column of the cell clicked
    xToUpdate : null,

    //
    winnerSquares : {
        // help to find the winner
        winType: null,
        startX: 0,
        startY: 0
    },

    // initialize the game model
    init : function () {
        printLog('Model init');
        for (var i = 0; i < 6; i++) {
            this.matrix[i] = new Array(7);
            for (var j = 0; j < 7; j++) {
                this.matrix[i][j] = 0;
            }
        }
        this.lastPlayer = 2;
        this.currentPlayer = 1;
        this.winnerSquares.winType = null;
        this.xToUpdate = null;
    },

    // reset
    reset : function () {
        printLog('Model reset');
        this.init();
    },

    // update the game model
    update : function (el) {
        printLog('Model update');

        this.xToUpdate = null;

        var x = parseInt(el.id.substring(0,1));
        var y = parseInt(el.id.substring(1));

        // Find the first square in the column where to add the new piece
        for (var i = 5; i >= 0; i--) {
            if (this.matrix[i][y] === 0) {
                this.xToUpdate = i;
                this.matrix[i][y] = this.currentPlayer;
                break;
            }
        }
        this.checkAllDirections(this.xToUpdate, y);

        // Update next player to play even if we have a winner (for consistency purpose)
        this.lastPlayer = this.lastPlayer === 1 ? 2 : 1;
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    },

    //
    checkAllDirections : function (x,y) {
        this.checkVertical(x,y);
        if (this.winnerSquares.winType === null) {
            this.checkHorizontal(x,y);
            if (this.winnerSquares.winType === null) {
                this.checkDiagonal1(x,y);
                if (this.winnerSquares.winType === null) {
                    this.checkDiagonal2(x,y);
                }
            }
        }
    },

    // Check if the last added piece make the player be a winner vertically
    checkVertical : function (x,y) {
        var count = 0;
        // From last vertical piece added to the bottom
        for (var i = x; i < this.matrix.length; i++) {
            if (this.matrix[i][y] === this.currentPlayer) {
                count++;
                if (count === 1) {
                    this.winnerSquares.startX = i;
                    this.winnerSquares.startY = y;
                }
                else if (count === 4) {
                    // vertical win code type
                    this.winnerSquares.winType = "vertical";
                    break;
                }
            }
            else {
                count = 0;
            }
        }
    },

    // Check if the last added piece make the player be a winner horizontally
    checkHorizontal : function (x,y) {
        var count = 0;
        // from left to right
        for (var i = 0; i < this.matrix[0].length; i++) {
            if (this.matrix[x][i] === this.currentPlayer) {
                count++;
                if (count === 1) {
                    this.winnerSquares.startX = x;
                    this.winnerSquares.startY = i;
                }
                else if (count === 4) {
                    // horizontal win code type
                    this.winnerSquares.winType = "horizontal";
                    break;
                }
            }
            else {
                count = 0;
            }
        }
    },

    // Check if the last added piece make the player be a winner diagonally
    // From top left to bottom right
    checkDiagonal1 : function (xC,yC) {
        var count = 0;
        var x = xC - yC;
        if (x < 0) {
            x = 0;
        }
        var y = yC - xC;
        if (y < 0) {
            y = 0;
        }
        for (var i = x; i < this.matrix.length; i++) {
            if (this.matrix[i][y] === this.currentPlayer) {
                count++;
                if (count === 1) {
                    this.winnerSquares.startX = i;
                    this.winnerSquares.startY = y;
                }
                else if (count === 4) {
                    // horizontal win code type
                    this.winnerSquares.winType = "diagonal 1";
                    break;
                }
            }
            else {
                count = 0;
            }
            if (y < this.matrix.length) {
                y++;
            }
            else {
                break;
            }
        }
    },

    // Check if the last added piece make the player be a winner diagonally
    // From top right to bottom left
    checkDiagonal2 : function (xC,yC) {
        var count = 0;
        // Calculate y first
        var y = xC + yC;
        var diff = 0;
        if (y >= this.matrix[0].length) {
            diff = y - this.matrix.length;
            y = this.matrix[0].length - 1;
        }
        var x = diff;
        for (var i = x; i < this.matrix.length; i++) {
            if (this.matrix[i][y] === this.currentPlayer) {
                count++;
                if (count === 1) {
                    this.winnerSquares.startX = i;
                    this.winnerSquares.startY = y;
                }
                else if (count === 4) {
                    // horizontal win code type
                    this.winnerSquares.winType = "diagonal 2";
                    break;
                }
            }
            else {
                count = 0;
            }
            if (y > 0) {
                y--;
            }
            else {
                break;
            }
        }
    }
};

/*
 * View
 */
var GameView = {
    // initialize the game view
    init : function (model) {
        printLog('View init');

        var gameContainer = document.querySelector("#game-container");
        var tableEl = document.createElement("table");
        tableEl.id = "game-table";
        for (var i = 0; i < 6; i++) {
            var rowEl = document.createElement("tr");
            rowEl.id = i;
            for (var j = 0; j < 7; j++) {
                var tdEl = document.createElement("td");
                tdEl.id = ""+i+j;
                tdEl.className = "game-cell";
                tdEl.onclick = function () {
                    GameController.handler(this);
                };
                rowEl.appendChild(tdEl);
            }
            tableEl.appendChild(rowEl);
        }
        gameContainer.appendChild(tableEl);

        // initialize game info container
        var gameContainer = document.querySelector("#game-info");
        gameContainer.innerHTML = "<span class='info-p1'>Player " + model.currentPlayer + "</span> to play.";
    },

    unregisterEvent : function (model) {
        printLog('View unregister event');
        var cells = document.getElementsByClassName("game-cell");
        for (var i = 0; i < cells.length; i++) {
            cells[i].onclick = null;
        }
    },

    flashSquares : function (model) {
        if (model.winnerSquares.winType === "vertical") {
            for (var i = 0; i < 4; i++) {
                this.flash(model, model.winnerSquares.startX + i, model.winnerSquares.startY);
            }
        }
        else if (model.winnerSquares.winType === "horizontal") {
            for (var i = 0; i < 4; i++) {
                this.flash(model, model.winnerSquares.startX, model.winnerSquares.startY + i);
            }
        }
        else if (model.winnerSquares.winType === "diagonal 1") {
            for (var i = 0; i < 4; i++) {
                this.flash(model, model.winnerSquares.startX + i, model.winnerSquares.startY + i);
            }
        }
        else {
            for (var i = 0; i < 4; i++) {
                this.flash(model, model.winnerSquares.startX + i, model.winnerSquares.startY - i);
            }
        }
    },

    flash : function (model, squareX, squareY) {
        var id = ""+ squareX + squareY;
        var square = document.getElementById(id);
        var piece = square.getElementsByClassName("piece");
        setInterval(function() {
            piece[0].style.display = (piece[0].style.display == 'none' ? '' : 'none');
        }, 300);
    },

    // reset
    reset : function () {
        printLog('View reset');
        var gameContainer = document.querySelector("#game-container");
        gameContainer.innerHTML = "";
    },

    // update the game view
    update : function (el, model) {
        printLog('View update');

        if (model.xToUpdate != null) {
            var cellId = "" + model.xToUpdate + el.id.substring(1);
            var cellToUpdate = document.getElementById(cellId);
            var newPiece = document.createElement("div");
            // because the model is already updated to next player to play
            var pieceClass = model.lastPlayer === 1 ? "piece-p1" : "piece-p2";
            newPiece.className = "piece " + pieceClass;
            cellToUpdate.appendChild(newPiece);
            this.animate(model.xToUpdate, newPiece);

            // update game info container
            var gameContainer = document.querySelector("#game-info");
            // last player is also the next player to play
            if (model.winnerSquares.winType === null) {
                // Next player to play
                var infoClass = model.currentPlayer === 1 ? "info-p1" : "info-p2";
                gameContainer.innerHTML = "<span class="+ infoClass +">Player " + model.currentPlayer + "</span> to play.";
            }
            else {
                this.unregisterEvent();
                this.flashSquares(model);
                var infoClass = model.lastPlayer === 1 ? "info-p1" : "info-p2";
                gameContainer.innerHTML = "Winner is <span class="+ infoClass +"> Player" + model.lastPlayer + "</span> with " + model.winnerSquares.winType + " combination.";
            }
        }
    },

    animate : function (x, piece) {
        var positionClass = "position" + (6 - x);
        piece.classList.add(positionClass);
        piece.classList.add("translate");
        setTimeout(this.animation(piece, positionClass), 100);
    },

    animation : function (piece, positionClass) {
        return function () {
            piece.classList.remove(positionClass);
        };
    }
};

/*
 * Controller
 */
var GameController = {
    model : GameModel,
    view: GameView,

    init : function () {
        printLog('Controller init');

        this.model.init();
        this.view.init(this.model);
        var resetButton = document.querySelector("#reset");
        resetButton.onclick = function () {
            GameController.reset.call(GameController);
        };
    },

    handler : function (el) {
        printLog('Controller handler');
        this.model.update(el);
        this.view.update(el, this.model);
    },

    reset : function () {
        printLog('Controller reset');
        this.model.reset();
        this.view.reset();
        this.view.init(this.model);
    }
};

// execute on page load
function onLoad () {
    GameController.init.call(GameController);

}

// print logs if enabled
function printLog (sLog) {
    if (bIsLogEnabled) console.log(sLog);
}