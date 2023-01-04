var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.lineCap = 'round';

var grid = document.getElementById('grid');
var gridHover = grid.querySelector('.grid__hover');
var gridFocus = grid.querySelector('.grid__focus');

var columns = 125;
var rows = 80;


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

var setHelperPosition = function(el, i, j) {
	el.style.top = 100 / rows * i + '%';
	el.style.left = 100 / columns * j + '%';
};

grid.addEventListener('mousemove', function(event) {
	var rect = grid.getBoundingClientRect();
	var x = (event.clientX - rect.x) / rect.width;
	var y = (event.clientY - rect.y) / rect.height;

	var i = Math.floor(y * rows);
	i = Math.max(0, Math.min(rows - 1, i));
	var j = Math.floor(x * columns);
	j = Math.max(0, Math.min(columns - 1, j));
	var n = rows * j + i + 1;

	grid.href = '?sheep=' + n;
	setHelperPosition(gridHover, i, j);
});

var q = parseQuery(location.search);
var id = parseInt(q.sheep, 10);
if (id) {
	fetch('data/' + id)
		.then(r => r.text())
		.then(parseQuery)
		.then(drawSheep);

	var i = (id - 1) % rows;
	var j = Math.floor((id - 1) / rows);
	setHelperPosition(gridFocus, i, j);
}

document.querySelector('[href="#more"]').addEventListener('click', function(event) {
	event.preventDefault();
	document.querySelector('#more').showModal();
});
