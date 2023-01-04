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


var parseQuery = function(query) {
	query = query.trim();
	if (query[0] === '?') {
		query = query.substr(1);
	}
	var ret = {};
	query.split('&').forEach(function(part) {
		var a = part.split('=');
		ret[a[0]] = a[1];
	});
	return ret;
};

var grayToColor = function(gray) {
	var c = ('00' + gray.toString(16)).substr(-2);
	return '#' + c + c + c;
};

var eachWithTimeout = function(array, fn, timeout) {
	return new Promise(function(resolve) {
		var tmp = function(i) {
			if (i >= array.length) {
				resolve();
			} else {
				setTimeout(function() {
					fn(array[i]);
					tmp(i + 1);
				}, timeout);
			}
		};
		tmp(0);
	});
};

var drawSheep = function(sheep) {
	var xOff = parseFloat(sheep.xOff, 10);
	var yOff = parseFloat(sheep.yOff, 10);

	ctx.beginPath();
	return eachWithTimeout(sheep.drawing.split('_'), function(s) {
		var cmd = s.split('.');

		if (cmd[0] === 'lift') {
			ctx.beginPath();
		} else if (cmd[0] === 'stroke') {
			ctx.lineWidth = parseInt(cmd[1], 10);
		} else if (cmd[0] === 'grey') {
			ctx.strokeStyle = grayToColor(parseInt(cmd[1], 10));
		} else if (parseInt(cmd[0], 10)) {
			var coords = cmd.map(x => parseInt(x, 10));
			ctx.moveTo(coords[2] + xOff, coords[3] + yOff);
			ctx.lineTo(coords[0] + xOff, coords[1] + yOff);
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

grid.addEventListener('mousemove', function(event) {
	var rect = grid.getBoundingClientRect();
	hoverRow = (event.clientY - rect.y) / rect.height * rows;
	hoverRow = Math.max(0, Math.min(rows - 1, Math.floor(hoverRow)));
	hoverCol = (event.clientX - rect.x) / rect.width * columns;
	hoverCol = Math.max(0, Math.min(columns - 1, Math.floor(hoverCol)));
	updateHover();
});

grid.addEventListener('keydown', function(event) {
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

var q = parseQuery(location.search);
var id = parseInt(q.sheep, 10);
if (id) {
	fetch('data/' + id)
		.then(r => r.text())
		.then(parseQuery)
		.then(drawSheep);

	hoverRow = (id - 1) % rows;
	hoverCol = Math.floor((id - 1) / rows);
	setHelperPosition(gridFocus);
	updateHover();
}

document.querySelector('[href="#more"]').addEventListener('click', function(event) {
	event.preventDefault();
	document.querySelector('#more').showModal();
});
