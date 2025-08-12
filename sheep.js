var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.lineCap = 'round';

var grid = document.getElementById('grid');
var gridHover = grid.querySelector('.grid__hover');
var gridFocus = grid.querySelector('.grid__focus');

var columns = 125;
var rows = 80;
var hoverCol = 0;
var hoverRow = 0;


var grayToColor = function(gray) {
	var c = ('00' + gray.toString(16)).substr(-2);
	return '#' + c + c + c;
};

var eachWithTimeout = function(array, fn, timeout) {
	return new Promise(resolve => {
		var tmp = i => {
			if (i >= array.length) {
				resolve();
			} else {
				setTimeout(() => {
					fn(array[i]);
					tmp(i + 1);
				}, timeout);
			}
		};
		tmp(0);
	});
};

var drawSheep = function(sheep) {
	var yOff = sheep[0] / 2;
	var xOff = sheep[1] / 2;

	ctx.beginPath();
	return eachWithTimeout(sheep.slice(2), cmd => {
		if (cmd[0] === 'lift') {
			ctx.beginPath();
		} else if (cmd[0] === 'stroke') {
			ctx.lineWidth = cmd[1];
		} else if (cmd[0] === 'grey') {
			ctx.strokeStyle = grayToColor(cmd[1]);
		} else {
			ctx.moveTo(cmd[2] + xOff, cmd[3] + yOff);
			ctx.lineTo(cmd[0] + xOff, cmd[1] + yOff);
			ctx.stroke();
		}
	}, 10);
};

var setHelperPosition = function(el) {
	el.style.top = 100 / rows * hoverRow + '%';
	el.style.left = 100 / columns * hoverCol + '%';
};

var updateHover = function() {
	var n = rows * hoverCol + hoverRow + 1;
	grid.href = '?sheep=' + n;
	setHelperPosition(gridHover);
};

grid.addEventListener('mousemove', event => {
	var rect = grid.getBoundingClientRect();
	hoverRow = (event.clientY - rect.y) / rect.height * rows;
	hoverRow = Math.max(0, Math.min(rows - 1, Math.floor(hoverRow)));
	hoverCol = (event.clientX - rect.x) / rect.width * columns;
	hoverCol = Math.max(0, Math.min(columns - 1, Math.floor(hoverCol)));
	updateHover();
});

grid.addEventListener('keydown', event => {
	var dx = 0;
	var dy = 0;
	if (event.code === 'ArrowUp' && hoverRow > 0) {
		dy = -1;
	} else if (event.code === 'ArrowRight' && hoverCol + 1 < columns) {
		dx = 1;
	} else if (event.code === 'ArrowDown' && hoverRow + 1 < rows) {
		dy = 1;
	} else if (event.code === 'ArrowLeft' && hoverCol > 0) {
		dx = -1;
	}
	if (dx || dy) {
		event.preventDefault();
		hoverCol += dx;
		hoverRow += dy;
		updateHover();
		gridHover.scrollIntoView();
	}
});

var q = new URLSearchParams(location.search);
var id = parseInt(q.get('sheep'), 10);
if (id) {
	var response = await fetch(`bin/${Math.floor((id - 1) / 100)}`);
	var data = CBOR.decode(await response.arrayBuffer());
	var sheep = data[(id - 1) % 100];
	drawSheep(sheep);

	hoverRow = (id - 1) % rows;
	hoverCol = Math.floor((id - 1) / rows);
	setHelperPosition(gridFocus);
	updateHover();
}

document.querySelector('[href="#more"]').addEventListener('click', event => {
	event.preventDefault();
	document.querySelector('#more').showModal();
});
