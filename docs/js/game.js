//------------------------------------------------


function Game2048 () {
  this.board = [
    [null,null,null,null],
    [null,null,null,null],
    [null,null,null,null],
    [null,null,null,null]
  ];

  this.score  = 0;
  this.won   = false;
  this.lost  = false;
  this._generateTile();
  this._generateTile();
}

Game2048.prototype._generateTile = function () {
  //if condition = true ? return x : return y;
  var initialValue = (Math.random() < 0.8 ? 2:4);

  var emptyTile = this._getAvailablePosition();
  //if we have an empty tile fill it in with the found position
  if (emptyTile) {
    this.board[emptyTile.x][emptyTile.y] = initialValue;
  }

};
Game2048.prototype._getAvailablePosition = function () {

  //if we have an empty tile then update board with the found position
  var emptyTiles = [];

  this.board.forEach(function(row, rowIndex){
    row.forEach(function(elem, colIndex){
      if (!elem) emptyTiles.push({ x: rowIndex, y: colIndex });
    });
  });

  if (emptyTiles.length === 0)
    return false;

  var randomPosition = Math.floor(Math.random() * emptyTiles.length);
  return emptyTiles[randomPosition];
};

Game2048.prototype._renderBoard = function () {
  this.board.forEach(function(row){ console.log(row); });
  console.log('Score: ' + this.score);
};

Game2048.prototype._moveLeft = function () {
  var newBoard = [];
  var that = this;
  var boardChanged = false;

  this.board.forEach (function (row) {
    var newRow = row.filter(function (i) {
      return i !== null;
    });

    for(i = 0; i < newRow.length - 1; i++) {
      if (newRow[i+1] === newRow[i]) {
        newRow[i]   = newRow[i] * 2;
        newRow[i+1] = null;
      }
    }

    var merged = newRow.filter(function (i) {
      return i !== null;
    });

    while(merged.length < 4) {
      merged.push(null);
    }

    if (newRow.length !== row.length)
      boardChanged = true;

    newBoard.push(merged);
  });

  this.board = newBoard;
  return boardChanged;
};

Game2048.prototype._moveRight = function () {
  var newBoard = [];
  var that = this;
  var boardChanged = false;

  this.board.forEach (function (row) {
    var newRow = row.filter(function (i) {
      return i !== null;
    });
    //set current index to the
    for (i=newRow.length - 1; i>0; i--) {
      if (newRow[i-1] === newRow[i]) {
        newRow[i]   = newRow[i] * 2;
        newRow[i-1] = null;
        that._updateScore(newRow[i]);
      }
      //if the length of the new row does not equal current row length
      if (newRow.length !== row.length) boardChanged = true;
    }
    //merged equals the filtered new row where i is not null
    var merged = newRow.filter(function (i) {
      return i !== null;
    });
    //while merged length is less than 4
    while(merged.length < 4) {
      //item to the front of the array
      merged.unshift(null);
    }

    newBoard.push(merged);
  });

  this.board = newBoard;
  return boardChanged;
};

Game2048.prototype._moveUp = function () {
  this._transposeMatrix();
  var boardChanged = this._moveLeft();
  this._transposeMatrix();
  return boardChanged;
};

Game2048.prototype._moveDown = function () {
  this._transposeMatrix();
  var boardChanged = this._moveRight();
  this._transposeMatrix();
  return boardChanged;
};

// Transpose the 4x4 board...in other words turn it 90 deg
Game2048.prototype._transposeMatrix = function () {
  for (var row = 0; row < this.board.length; row++) {
    for (var column = row+1; column < this.board.length; column++) {
      var temp = this.board[row][column];
      this.board[row][column] = this.board[column][row];
      this.board[column][row] = temp;
    }
  }
};

Game2048.prototype.move = function (direction) {
  ion.sound.play("beer_can_opening");
  if (!this._gameFinished()) {
    switch (direction) {
      case "up":    boardChanged = this._moveUp();    break;
      case "down":  boardChanged = this._moveDown();  break;
      case "left":  boardChanged = this._moveLeft();  break;
      case "right": boardChanged = this._moveRight(); break;
    }

    if (boardChanged) {
      this._generateTile();
    }
  }
};

Game2048.prototype._updateScore = function(value) {
  this.score += value;

  if (value === 2048) {
    this.won = true;
  }
};


Game2048.prototype._gameFinished = function () {
  return this.lost;
};

Game2048.prototype._isGameLost = function () {
  if (this._getAvailablePosition())
    return;

  var that   = this;
  var isLost = true;

  this.board.forEach(function (row, rowIndex) {
    row.forEach(function (cell, cellIndex) {
      var current = that.board[rowIndex][cellIndex];
      var top, bottom, left, right;

      if (that.board[rowIndex][cellIndex - 1]) {
        left  = that.board[rowIndex][cellIndex - 1];
      }
      if (that.board[rowIndex][cellIndex + 1]) {
        right = that.board[rowIndex][cellIndex + 1];
      }
      if (that.board[rowIndex - 1]) {
        top    = that.board[rowIndex - 1][cellIndex];
      }
      if (that.board[rowIndex + 1]) {
        bottom = that.board[rowIndex + 1][cellIndex];
      }

      if (current === top || current === bottom || current === left || current === right)
        isLost = false;
    });
  });

  this.lost = isLost;
};

window.onload = function () {
  game = new Game2048();
  renderTiles();
};

function renderTiles () {
  game.board.forEach(function(row, rowIndex){
    row.forEach(function (cell, cellIndex) {
      if (cell) {
        var tileContainer = document.getElementById("tile-container");
        var newTile       = document.createElement("div");

        newTile.classList  = "tile val-" + cell;
        newTile.classList += " tile-position-" + rowIndex + "-" + cellIndex;
        newTile.innerHTML  = (cell);

        tileContainer.appendChild(newTile);
      }
    });
  });
}

function updateScore () {
  var score          = game.score;
  var scoreContainer = document.getElementsByClassName("js-score");

  Array.prototype.slice.call(scoreContainer).forEach(function (span) {
    span.innerHTML = score;
  });
}

function gameStatus () {
  if (game.lost()) {
    document.getElementById("game-over").classList = "show-won";
  } else if (game.lose()) {
    document.getElementById("game-over").classList = "show-lost";
  }
}

function moveListeners (event) {
  var keys = [37, 38, 39, 40];

  if (keys.indexOf(event.keyCode) < 0)

    return;

  switch (event.keyCode) {
    case 37: game.move("left");  break;
    case 38: game.move("up");    break;
    case 39: game.move("right"); break;
    case 40: game.move("down");  break;
  }

  resetTiles();
  renderTiles();
  updateScore();
}

function resetTiles () {

  var tilesContainer = document.getElementById("tile-container");
  //grab all the tiles off the tiilesContainer
  var tiles          = tilesContainer.getElementsByClassName("tile");
//taking the slice method, and lending it to this node collection getElementsByClassName and creating arrays from it
  Array.prototype.slice.call(tiles).forEach(function (tile) {
    tilesContainer.removeChild(tile);
  });


// for(i = 0; i < newRow.length - 1; i++) {
//   if (newRow[i+1] === newRow[i]) {
//     ion.sound.play("tap");
//     // more code
//   }
}

document.addEventListener("keydown", moveListeners);

//load sounds from ion sound library ion.sound.min.js
function loadSounds () {
  ion.sound({
    sounds: [{name: "beer_can_opening"}, {name: "tap"}],

    path: "./js/lib/ion.sound-3.0.7/sounds/",
    preload: true,
    volume: 1.0
  });
}

$(document).ready(function (){
  var game = new Game2048();
  console.log("Initial Board ");
  loadSounds ();
  // game._renderBoard();
  // game.move("up");
  // game._renderBoard();
  // game.move("down");
  // game._renderBoard();
  // game.move("left");
  // game._renderBoard();
  // game.move("right");
  // game._renderBoard();
  //
  // console.log("Game has been loaded");

});
