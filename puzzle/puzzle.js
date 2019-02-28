/* Cell */

function Cell(i, j) {
    this.i = i;
    this.j = j;
}

Cell.prototype.toString = function() {
    return this.i + ',' + this.j;
};

Cell.fromString = function(s) {
    var a = s.split(',');
    return new Cell(parseInt(a[0]), parseInt(a[1]));
};

/* CellSet */

function CellSet() {
    this.cells = {}
}

CellSet.prototype.addCell = function(cell) {
    this.cells[cell] = true;
};

CellSet.prototype.removeCell = function(cell) {
    delete this.cells[cell];
};

CellSet.prototype.hasCell = function(cell) {
    return cell in this.cells;
};

CellSet.prototype.hasCellsInCommon = function(cellSet) {
    for (var cell in this.cells) {
	if (cellSet.hasCell(cell)) {
	    return true;
	}
    }
    return false;
};

/* Puzzle */

function Puzzle(grid, title, tokens, shadedCells) {
    this.grid = grid;
    this.ctx = grid.getContext('2d');
    this.width = grid.width;
    this.height = grid.height;
    this.title = title;
    this.history = [];
    this.positionInHistory = 0;
    this.started = false;
    
    this.tokens = new CellSet();
    for (var i in tokens) {
	this.tokens.addCell(tokens[i]);
    }

    this.shaded = new CellSet();
    for (var i in shadedCells) {
	this.shaded.addCell(shadedCells[i]);
    }
}

Puzzle.CELL_SIZE = 80;

Puzzle.prototype.start = function() {
    this.redraw();
    this.started = true;
};

Puzzle.prototype.redraw = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.shadeCells();
    this.drawTokens();
};

Puzzle.prototype.drawGrid = function() {
    this.ctx.beginPath();
    for (var i = 1; i <= this.width || i <= this.height; i += Puzzle.CELL_SIZE) {
	this.ctx.moveTo(1, i);
	this.ctx.lineTo(this.width, i);
	this.ctx.moveTo(i, 1);
	this.ctx.lineTo(i, this.height);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
};

Puzzle.prototype.shadeCells = function() {
    for (var cellCode in this.shaded.cells) {
	this.fillCell(Cell.fromString(cellCode), 'lightGrey');
    }
};

Puzzle.prototype.fillCell = function(cell, style) {
    var x = cell.j * Puzzle.CELL_SIZE + 3;
    var y = cell.i * Puzzle.CELL_SIZE + 3;
    this.ctx.beginPath();
    this.ctx.rect(x, y, Puzzle.CELL_SIZE - 4, Puzzle.CELL_SIZE - 4);
    this.ctx.closePath();
    this.ctx.strokeStyle = style;
    this.ctx.stroke();
    this.ctx.fillStyle = style;
    this.ctx.fill();
};

Puzzle.prototype.drawTokens = function() {
    for (var cellCode in this.tokens.cells) {
	this.drawToken(Cell.fromString(cellCode), 'black');
    }
};

Puzzle.prototype.drawToken = function(cell, style) {
    var x = (cell.j + 0.5) * Puzzle.CELL_SIZE;
    var y = (cell.i + 0.5) * Puzzle.CELL_SIZE;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
    this.ctx.closePath();
    this.ctx.strokeStyle = style;
    this.ctx.stroke();
    this.ctx.fillStyle = style;
    this.ctx.fill();
};

Puzzle.prototype.clearCell = function(cell) {
    if (this.isShaded(cell)) {
	this.fillCell(cell, 'lightGrey');
    } else {
	this.fillCell(cell, 'white');
    }
};

Puzzle.prototype.isShaded = function(cell) {
    return this.shaded.hasCell(cell);
};

Puzzle.prototype.addToken = function(cell) {
    this.tokens.addCell(cell);
    this.clearCell(cell);
    this.drawToken(cell, 'black');
};

Puzzle.prototype.removeToken = function(cell) {
    this.tokens.removeCell(cell);
    this.clearCell(cell);
};

Puzzle.prototype.hasToken = function(cell) {
    return this.tokens.hasCell(cell);
};

Puzzle.prototype.attemptMove = function(cell) {
    var lowerCell = new Cell(cell.i + 1, cell.j);
    var rightCell = new Cell(cell.i, cell.j + 1);

    if (this.hasToken(cell) && !this.hasToken(lowerCell) && !this.hasToken(rightCell)) {
	this.removeToken(cell);
	this.addToken(lowerCell);
	this.addToken(rightCell);
	this.history = this.history.slice(0, this.positionInHistory);
	this.history.push(cell);
	this.positionInHistory++;
    }
};

Puzzle.prototype.undo = function() {
    if (this.positionInHistory > 0) {
	var cell = this.history[this.positionInHistory - 1];
	var lowerCell = new Cell(cell.i + 1, cell.j);
	var rightCell = new Cell(cell.i, cell.j + 1);
	if (!this.hasToken(cell) && this.hasToken(lowerCell) && this.hasToken(rightCell)) {
	    this.addToken(cell);
	    this.removeToken(lowerCell);
	    this.removeToken(rightCell);
	    this.positionInHistory--;
	}
    }
};

Puzzle.prototype.redo = function() {
    if (this.positionInHistory < this.history.length) {
	var cell = this.history[this.positionInHistory];
	var lowerCell = new Cell(cell.i + 1, cell.j);
	var rightCell = new Cell(cell.i, cell.j + 1);
	if (this.hasToken(cell) && !this.hasToken(lowerCell) && !this.hasToken(rightCell)) {
	    this.removeToken(cell);
	    this.addToken(lowerCell);
	    this.addToken(rightCell);
	    this.positionInHistory++;
	}
    }
}

Puzzle.prototype.isStarted = function() {
    return this.started;
};

Puzzle.prototype.isFinished = function() {
    return !this.shaded.hasCellsInCommon(this.tokens);
};

/* Game */

/**
 * The real prototype is Game(grid, titleElem, ...puzzles)
 */
function Game(grid, titleElem) {
    this.grid = grid;
    this.ctx = grid.getContext('2d');
    this.width = grid.width;
    this.height = grid.height;
    this.titleElem = titleElem;
    this.puzzles = Array.prototype.slice.call(arguments, 2);
    this.current = -1;
    this.grid.addEventListener('click', this.onClickListener.bind(this));
}

Game.prototype.addPuzzle = function(puzzle) {
    this.puzzles.push(puzzle);
};

Game.prototype.startPuzzle = function(i) {
    if (0 <= i && i < this.puzzles.length) {
	this.current = i;
	var puzzle = this.puzzles[this.current];
	this.titleElem.textContent = puzzle.title;
	if (!puzzle.isStarted()) {
	    this.ctx.clearRect(0, 0, this.width, this.height);
	    this.fadeOutText(puzzle.title, puzzle.start.bind(puzzle));
	} else {
	    puzzle.redraw();
	}
    }
};

Game.prototype.nextPuzzle = function() {
    this.startPuzzle(this.current + 1);
}

Game.prototype.previousPuzzle = function() {
    this.startPuzzle(this.current - 1);
}

Game.prototype.undo = function() {
    this.puzzles[this.current].undo();
}

Game.prototype.redo = function() {
    this.puzzles[this.current].redo();
}

Game.prototype.fadeOutText = function(text, continuation) {
    var alpha = 1.0;
    var interval = setInterval(function () {
        var style = "rgba(255, 0, 0, " + alpha + ")";
	this.writeText(text, style);
        alpha = alpha - 0.05;
        if (alpha < 0) {
	    clearInterval(interval);
	    continuation();
        }
    }.bind(this), 100); 
};

Game.prototype.writeText = function(text, style) {
    this.ctx.font = 'bold 40pt Calibri';
    this.ctx.fillStyle = style;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    var textWidth = this.ctx.measureText(text).width;
    var rectX = Math.floor((this.width - textWidth) / 2 / Puzzle.CELL_SIZE) * Puzzle.CELL_SIZE + 3;
    var rectY = this.height / 2 - Puzzle.CELL_SIZE + 1;
    var rectWidth = (Math.ceil(textWidth / Puzzle.CELL_SIZE) + 1) * Puzzle.CELL_SIZE - 3;
    var rectHeight =  Puzzle.CELL_SIZE * 2 - 2;
    this.ctx.clearRect(rectX, rectY, rectWidth, rectHeight);
    this.ctx.fillText(text, this.width / 2, this.height / 2);
};

Game.prototype.congratulate = function() {
    this.writeText("Congratulations! You win.", "red");
};

Game.prototype.onClickListener = function(evt) {
    if (0 <= this.current && this.current < this.puzzles.length) {
	var puzzle = this.puzzles[this.current];
	if (puzzle.isStarted() && !puzzle.isFinished()) {
	    var rect = this.grid.getBoundingClientRect();
	    var x = evt.clientX - rect.left;
	    var y = evt.clientY - rect.top;
	    var i = Math.floor(y / Puzzle.CELL_SIZE);
	    var j = Math.floor(x / Puzzle.CELL_SIZE);
	    
	    puzzle.attemptMove(new Cell(i, j));
	    if (puzzle.isFinished()) {
		this.congratulate();
		setTimeout(this.nextPuzzle.bind(this), 3000);
	    }
	}
    }
};
