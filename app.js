const var1 = document.getElementById("var1");
const var2 = document.getElementById("var2");

const exp1 = document.getElementById("exp1");
const exp2 = document.getElementById("exp2");

const new_condition = document.getElementById("new-condition");
const remove_condition = document.getElementById("remove-condition");
let condition_count = 1;

const startx = [document.getElementById("startx-0")];
const starty = [document.getElementById("starty-0")];

const steps = document.getElementById("steps");
const stepsize = document.getElementById("stepsize");

const v_xy = document.getElementById("xy");
const v_zx = document.getElementById("zx");
const v_zy = document.getElementById("zy");

const error_box = document.getElementById("error");

let state = {
	initial: [],
	steps: 0,
	dt: 0,
	var1: "X",
	var2: "Y",
	exp1: null,
	exp2: null,
};

function dx(X, Y, T){
	let ctx = new Map();
	ctx.set(state.var1, X);
	ctx.set(state.var2, Y);
	ctx.set("T", T);
	return state.exp1.evaluate(ctx);
}

function dy(X, Y, T){
	let ctx = new Map();
	ctx.set(state.var1, X);
	ctx.set(state.var2, Y);
	ctx.set("T", T);
	return state.exp2.evaluate(ctx);
}

let x = [], y = [], bounds = [[0, 0], [0, 0]];

function update_state(){
	const _state = {
		initial: [],
		steps: 0,
		dt: 0,
		var1: "X",
		var2: "Y",
		exp1: null,
		exp2: null,
	};

	const container = document.getElementById("condition-container");
	condition_count = Array.from(container.children).filter(x => x.tagName == "DIV").length;

	for(let i=0; i<condition_count; ++i)
		_state.initial.push([Number(startx[i].value), Number(starty[i].value)]);

	_state.steps = Number(steps.value);
	_state.dt = Number(stepsize.value);

	_state.var1 = var1.value.trim();
	_state.var2 = var2.value.trim();

	let error_text = "";

	for(let i=0; i<condition_count; ++i){
		if(isNaN(_state.initial[0][0]) || isNaN(_state.initial[0][1]))
			error_text += "Error: Invalid initial condition\n";
	}

	if(isNaN(_state.steps))
		error_text += "Error: Invalid step count\n";
	else if(_state.steps != Math.floor(_state.steps))
		error_text += "Error: Non-integer step count\n";
	else if(_state.steps <= 0)
		error_text += "Error: Non-positive step count\n";

	if(isNaN(_state.dt))
		error_text += "Error: Invalid step size\n";
	else if(_state.dt <= 0)
		error_text += "Error: Non-positive step size\n";

	try{
		_state.exp1 = math.compile(exp1.value);

	}catch(e){
		error_text += "Error: Expression 1: " + e.message + '\n';
	}

	try{
		_state.exp2 = math.compile(exp2.value);

	}catch(e){
		error_text += "Error: Expression 2: " + e.message + '\n';
	}

	for(let i=0; i<condition_count; ++i){
		const ctx = new Map();
		ctx.set(_state.var1, _state.initial[i][0]);
		ctx.set(_state.var2, _state.initial[i][1]);
		ctx.set("T", 0);

		try{
			_state.exp1.evaluate(ctx);

		}catch(e){
			error_text += "Error: Expression 1: " + e.message + '\n';
		}

		try{
			_state.exp2.evaluate(ctx);

		}catch(e){
			error_text += "Error: Expression 2: " + e.message + '\n';
		}
	}

	error_text = error_text.trim().replaceAll("\n", "<br>");

	if(error_text.length != 0) error_box.innerHTML = error_text;
	else{
		error_box.innerHTML = "";
		state = _state;
		v_xy.textContent = state.var1 + " vs " + state.var2;
		v_zx.textContent = "T vs " + state.var1;
		v_zy.textContent = "T vs " + state.var2;
	}

	recalc();
}

var1.addEventListener("change", update_state);
var2.addEventListener("change", update_state);

exp1.addEventListener("change", update_state);
exp2.addEventListener("change", update_state);

new_condition.addEventListener("click", _ => {
	const container = document.getElementById("condition-container");

	const next = document.createElement("div");
	next.id = "condition-container-" + condition_count;
	next.textContent = "Initial condition: ";
	const _startx = document.createElement("input");
	_startx.id = "startx-" + condition_count;
	_startx.style.width = "40px";
	next.appendChild(_startx);
	const _com = document.createElement("text");
	_com.textContent = ", ";
	next.appendChild(_com);
	const _starty = document.createElement("input");
	_starty.id = "starty-" + condition_count;
	_starty.style.width = "40px";
	next.appendChild(_starty);

	startx.push(_startx);
	starty.push(_starty);
	_startx.addEventListener("change", update_state);
	_starty.addEventListener("change", update_state);

	container.insertBefore(next, container.children[condition_count]);
	++condition_count;

	update_state();
});

remove_condition.addEventListener("click", _ => {
	if(condition_count == 1) return;

	--condition_count;
	const el = document.getElementById("condition-container-" + condition_count);
	if(el) el.parentElement.removeChild(el);

	update_state();
});

startx[0].addEventListener("change", update_state);
starty[0].addEventListener("change", update_state);

steps.addEventListener("change", update_state);
stepsize.addEventListener("change", update_state);

function setup(){
	createCanvas(800, 500);
	update_state();
}

let camera = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
];

v_xy.addEventListener("click", _ => {
	camera = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	];

	loop();
});

v_zx.addEventListener("click", _ => {
	function norm(a){
		const M = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
		return [a[0]/M, a[1]/M, a[2]/M];
	}

	camera[2] = norm([-1, 10000, 0.0001]);
	camera[0] = norm(cross([0, 1, 0], camera[2]));
	camera[1] = norm(cross(camera[2], camera[0]));

	loop();
});

v_zy.addEventListener("click", _ => {
	function norm(a){
		const M = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
		return [a[0]/M, a[1]/M, a[2]/M];
	}

	camera[2] = norm([-10000, -1, 0.0001]);
	camera[0] = norm(cross([0, 1, 0], camera[2]));
	camera[1] = norm(cross(camera[2], camera[0]));

	loop();
});

function dot(a, b){
	return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function cross(a, b){
	return [
		a[1]*b[2]-a[2]*b[1],
		a[2]*b[0]-a[0]*b[2],
		a[0]*b[1]-a[1]*b[0],
	];
}

let pm = [0, 0], use = false;

function draw(){
	if(mouseIsPressed && use){
		function norm(a){
			const M = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
			return [a[0]/M, a[1]/M, a[2]/M];
		}
		function addmul(a, b, c, d) { return [a[0] + b[0]*c/d, a[1] + b[1]*c/d, a[2] + b[2]*c/d]; }
		function dist(a, b) { return Math.sqrt(Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2)); }
		let orig = [camera[2][0], camera[2][2]];
		camera[2] = addmul(camera[2], camera[0], (mouseX-pm[0]) * Math.sqrt(camera[2][0]*camera[2][0] + camera[2][2]*camera[2][2]), 100);
		camera[2] = addmul(camera[2], camera[1], pm[1]-mouseY, 100);
		if(dist(orig, [0, 0]) < dist(orig, [camera[2][0], camera[2][2]]) &&
			((camera[2][1] < 0 && mouseY > pm[1]) || (camera[2][1] > 0 && mouseY < pm[1]))){
			camera[2] = addmul(camera[2], camera[1], mouseY-pm[1], 100);
		}
		camera[2] = norm(camera[2]);
		camera[0] = norm(cross([0, 1, 0], camera[2]));
		camera[1] = norm(cross(camera[2], camera[0]));

	}else noLoop();

	pm = [mouseX, mouseY];

	background(255);

	function _map(x, y, z){
		let v1 = [x - (bounds[0][0]+bounds[0][1])/2, y - (bounds[1][0]+bounds[1][1])/2, z - 0.5];
		v1[0] /= Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]);
		v1[1] /= Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]);

		let v2 = [
			dot(v1, camera[0]),
			dot(v1, camera[1]),
			dot(v1, camera[2]),
		];

		return [
			width/2 + (height-200) * v2[0],
			height/2 - (height-200) * v2[1],
		];
	}

	strokeWeight(2);
	let origin = [bounds[0][0], bounds[1][0]];
	if(Math.abs(bounds[0][1]) < Math.abs(bounds[0][0])) origin[0] = bounds[0][1];
	if(Math.abs(bounds[1][1]) < Math.abs(bounds[1][0])) origin[1] = bounds[1][1];
	origin = [
		(origin[0]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 75) / (height/2 - 100) + (bounds[0][0]+bounds[0][1])/2,
		(origin[1]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 75) / (height/2 - 100) + (bounds[1][0]+bounds[1][1])/2,
	];
	if(((bounds[0][0]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 75) / (height/2 - 100) + (bounds[0][0]+bounds[0][1])/2)
		* ((bounds[0][1]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 75) / (height/2 - 100) + (bounds[0][0]+bounds[0][1])/2) < 0)
		origin[0] = 0;
	if(((bounds[1][0]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 75) / (height/2 - 100) + (bounds[1][0]+bounds[1][1])/2)
		* ((bounds[1][1]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 75) / (height/2 - 100) + (bounds[1][0]+bounds[1][1])/2) < 0)
		origin[1] = 0;
	stroke(170, Math.min(255, Math.max(50, 5000 * (1-Math.abs(camera[2][2])))));
	line(..._map(...origin, 0.5 - 0.5 * (height/2 - 75) / (height/2 - 100)),
		..._map(...origin, 0.5 + 0.5 * (height/2 - 75) / (height/2 - 100)));
	stroke(170, Math.min(255, Math.max(50, 5000 * (1-Math.abs(camera[2][0])))));
	line(
		..._map(
			(bounds[0][0]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 50) / (height/2 - 100) + (bounds[0][0]+bounds[0][1])/2,
			origin[1], 0),
		..._map(
			(bounds[0][1]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 50) / (height/2 - 100) + (bounds[0][0]+bounds[0][1])/2,
			origin[1], 0),
	);
	stroke(170, Math.min(255, Math.max(50, 5000 * (1-Math.abs(camera[2][1])))));
	line(
		..._map(origin[0],
			(bounds[1][0]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 50) / (height/2 - 100) + (bounds[1][0]+bounds[1][1])/2,
			0),
		..._map(origin[0],
			(bounds[1][1]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 50) / (height/2 - 100) + (bounds[1][0]+bounds[1][1])/2,
			0),
	);
	push();
	noStroke();
	textSize(14);
	textAlign(CENTER, CENTER);
	fill(100, Math.max(0, Math.min(255, 5000 * (1-Math.abs(camera[2][0])))));
	text(state.var1, ..._map(
		((Math.abs(bounds[0][1]) > Math.abs(bounds[0][0]) ? bounds[0][1] : bounds[0][0])
			- (bounds[0][0]+bounds[0][1])/2) * (height/2 - 30) / (height/2 - 100) + (bounds[0][0]+bounds[0][1])/2,
		origin[1],
		0,
	));
	fill(100, Math.max(0, Math.min(255, 5000 * (1-Math.abs(camera[2][1])))));
	text(state.var2, ..._map(
		origin[0],
		((Math.abs(bounds[1][1]) > Math.abs(bounds[1][0]) ? bounds[1][1] : bounds[1][0])
			- (bounds[1][0]+bounds[1][1])/2) * (height/2 - 30) / (height/2 - 100) + (bounds[1][0]+bounds[1][1])/2,
		0,
	));
	fill(100, Math.max(0, Math.min(255, 5000 * (1-Math.abs(camera[2][2])))));
	text("T", ..._map(...origin, 1.15));
	pop();
	
	textSize(11);
	strokeWeight(1);
	const xscale = Math.pow(2, Math.ceil(Math.log2(bounds[0][1] - bounds[0][0]))) / 4;
	const yscale = Math.pow(2, Math.ceil(Math.log2(bounds[1][1] - bounds[1][0]))) / 4;
	const zscale = Math.pow(2, Math.ceil(Math.log2(state.steps*state.dt))) / 4 / state.dt;
	for(let x=xscale*(Math.floor(bounds[0][0]/xscale)-5), i=0; i<60; ++i, x+=xscale/4){
		if(x == 0) continue;
		if(x > (bounds[0][0]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 50) / (height/2 - 100)  + (bounds[0][0]+bounds[0][1])/2
			&& x < (bounds[0][1]-(bounds[0][0]+bounds[0][1])/2) * (height/2 - 50) / (height/2 - 100)  + (bounds[0][0]+bounds[0][1])/2){
			stroke(50, Math.max(0, Math.min(255, Math.min(
				500 * (Math.abs(camera[2][2]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][1]*camera[2][1]) || 1) - 0.5),
				5000 * (1-Math.abs(camera[2][0]))))));
			if(i%4 == 0){
				push();
				fill(100, Math.max(0, Math.min(255, Math.min(
					500 * (Math.abs(camera[2][2]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][1]*camera[2][1]) || 1) - 0.5),
					5000 * (1-Math.abs(camera[2][0]))))));
				noStroke();
				if(origin[1] < (bounds[1][0]+bounds[1][1])/2){
					textAlign(CENTER, TOP);
					text(x.toPrecision(3), ..._map(x, origin[1] - 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), 0));
				}else{
					textAlign(CENTER, BOTTOM);
					text(x.toPrecision(3), ..._map(x, origin[1] + 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), 0));
				}
				pop();
				line(..._map(x, origin[1] + 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), 0),
					..._map(x, origin[1] - 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), 0));
			}else{
				line(..._map(x, origin[1] + 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), 0),
					..._map(x, origin[1] - 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), 0));
			}
			stroke(50, Math.max(0, Math.min(255, Math.min(
				500 * (Math.abs(camera[2][1]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][1]*camera[2][1]) || 1) - 0.5),
				5000 * (1-Math.abs(camera[2][0]))))));
			if(i%4 == 0){
				push();
				fill(100, Math.max(0, Math.min(255, Math.min(
					Math.min(
						500 * (Math.abs(camera[2][2]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
						500 * (Math.abs(camera[2][1]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][1]*camera[2][1]) || 1) - 0.5)),
					5000 * (1-Math.abs(camera[2][0]))))));
				noStroke();
				if(camera[1][2] > 0) textAlign(CENTER, TOP);
				else textAlign(CENTER, BOTTOM);
				if(camera[2][1] != 0) text(x.toPrecision(3), ..._map(x, origin[1], -18/height));
				pop();
				push();
				fill(100, Math.max(0, Math.min(255, Math.min(
					Math.min(
						500 * (Math.abs(camera[2][0]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
						500 * (Math.abs(camera[2][1]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][1]*camera[2][1]) || 1) - 0.5)),
					5000 * (1-Math.abs(camera[2][0]))))));
				noStroke();
				if(camera[2][0] > 0) textAlign(LEFT, CENTER);
				else textAlign(RIGHT, CENTER);
				if(camera[2][1] != 0) text(x.toPrecision(3), ..._map(x, origin[1], -18/height));
				pop();
				line(..._map(x, origin[1], 12/height),
					..._map(x, origin[1], -12/height));
			}else{
				line(..._map(x, origin[1], 6/height),
					..._map(x, origin[1], -6/height));
			}
		}
	}
	for(let y=yscale*(Math.floor(bounds[1][0]/yscale)-5), i=0; i<60; ++i, y+=yscale/4){
		if(y == 0) continue;
		if(y > (bounds[1][0]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 50) / (height/2 - 100)  + (bounds[1][0]+bounds[1][1])/2
			&& y < (bounds[1][1]-(bounds[1][0]+bounds[1][1])/2) * (height/2 - 50) / (height/2 - 100)  + (bounds[1][0]+bounds[1][1])/2){
			stroke(50, Math.max(0, Math.min(255, Math.min(
				500 * (Math.abs(camera[2][2]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
				5000 * (1-Math.abs(camera[2][1]))))));
			if(i%4 == 0){
				push();
				fill(100, Math.max(0, Math.min(255, Math.min(
					500 * (Math.abs(camera[2][2]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
					5000 * (1-Math.abs(camera[2][1]))))));
				noStroke();
				if(origin[0] < (bounds[0][0]+bounds[0][1])/2){
					if(camera[2][2] > 0) textAlign(RIGHT, CENTER);
					else textAlign(LEFT, CENTER);
					text(y.toPrecision(3), ..._map(origin[0] - 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), y, 0));
				}else{
					if(camera[2][2] > 0) textAlign(LEFT, CENTER);
					else textAlign(RIGHT, CENTER);
					text(y.toPrecision(3), ..._map(origin[0] + 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), y, 0));
				}
				pop();
				line(..._map(origin[0] + 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), y, 0),
					..._map(origin[0] - 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), y, 0));
			}else{
				line(..._map(origin[0] + 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), y, 0),
					..._map(origin[0] - 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), y, 0));
			}
			stroke(50, Math.max(0, Math.min(255, Math.min(
				500 * (Math.abs(camera[2][0]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
				5000 * (1-Math.abs(camera[2][1]))))));
			if(i%4 == 0){
				push();
				fill(100, Math.max(0, Math.min(255, Math.min(
					500 * (Math.abs(camera[2][0]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
					5000 * (1-Math.abs(camera[2][1]))))));
				noStroke();
				if(camera[2][0] > 0) textAlign(LEFT, CENTER);
				else textAlign(RIGHT, CENTER);
				if(camera[2][1] != 0) text(y.toPrecision(3), ..._map(origin[0], y, -18/height));
				pop();
				line(..._map(origin[0], y, 12/height),
					..._map(origin[0], y, -12/height));
			}else{
				line(..._map(origin[0], y, 6/height),
					..._map(origin[0], y, -6/height));
			}
		}
	}
	let B = [
		state.steps * (0.5 - 0.5 * (height/2 - 75) / (height/2 - 100)),
		state.steps * (0.5 + 0.5 * (height/2 - 75) / (height/2 - 100)),
	];
	for(let z=zscale*Math.floor(B[0]/zscale), i=0; z<=B[1]; z+=zscale/4, ++i){
		if(z < B[0]) continue;
		if(z == 0) continue;
		stroke(50, Math.max(0, Math.min(255, Math.min(
			500 * (Math.abs(camera[2][0]/Math.sqrt(camera[2][1]*camera[2][1] + camera[2][0]*camera[2][0]) || 1) - 0.5),
			5000 * (1-Math.abs(camera[2][2]))))));
		if(i%4 == 0){
			push();
			fill(100, Math.max(0, Math.min(255, Math.min(
				500 * (Math.abs(camera[2][0]/Math.sqrt(camera[2][1]*camera[2][1] + camera[2][0]*camera[2][0]) || 1) - 0.5),
				5000 * (1-Math.abs(camera[2][2]))))));
			noStroke();
			textAlign(CENTER, TOP);
			text((z*state.dt).toPrecision(3), ..._map(origin[0], origin[1] - 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), z/state.steps));
			pop();
			line(..._map(origin[0], origin[1] + 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), z/state.steps),
				..._map(origin[0], origin[1] - 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), z/state.steps));
		}else{
			line(..._map(origin[0], origin[1] + 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), z/state.steps),
				..._map(origin[0], origin[1] - 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), z/state.steps));
		}
		stroke(50, Math.max(0, Math.min(255, Math.min(
			500 * (Math.abs(camera[2][1]/Math.sqrt(camera[2][1]*camera[2][1] + camera[2][0]*camera[2][0]) || 1) - 0.5),
			5000 * (1-Math.abs(camera[2][2]))))));
		if(i%4 == 0){
			push();
			fill(100, Math.max(0, Math.min(255, Math.min(
				Math.min(
					500 * (Math.abs(camera[2][2]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
					500 * (Math.abs(camera[2][1]/Math.sqrt(camera[2][1]*camera[2][1] + camera[2][0]*camera[2][0]) || 1) - 0.5),
				),
				5000 * (1-Math.abs(camera[2][2]))))));
			noStroke();
			if(camera[2][2] < 0) textAlign(LEFT, CENTER);
			else textAlign(RIGHT, CENTER);
			text((z*state.dt).toPrecision(3), ..._map(origin[0] - 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), origin[1], z/state.steps));
			pop();
			push();
			fill(100, Math.max(0, Math.min(255, Math.min(
				Math.min(
					500 * (Math.abs(camera[2][0]/Math.sqrt(camera[2][2]*camera[2][2] + camera[2][0]*camera[2][0]) || 1) - 0.5),
					500 * (Math.abs(camera[2][1]/Math.sqrt(camera[2][1]*camera[2][1] + camera[2][0]*camera[2][0]) || 1) - 0.5),
				),
				5000 * (1-Math.abs(camera[2][2]))))));
			noStroke();
			if((camera[2][0] < 0) ^ (camera[2][1] < 0)) textAlign(CENTER, TOP);
			else textAlign(CENTER, BOTTOM);
			text((z*state.dt).toPrecision(3), ..._map(origin[0] - 18/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), origin[1], z/state.steps));
			pop();
			line(..._map(origin[0] + 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), origin[1], z/state.steps),
				..._map(origin[0] - 12/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), origin[1], z/state.steps));
		}else{
			line(..._map(origin[0] + 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), origin[1], z/state.steps),
				..._map(origin[0] - 6/height*Math.max(bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]), origin[1], z/state.steps));
		}
	}

	const pal1 = [
		[255, 25, 100],
		[100, 200, 25],
		[50, 50, 150],
	];

	noStroke();
	for(let i=0; i<condition_count; ++i){
		fill(...pal1[i%pal1.length], 100);
		circle(..._map(...state.initial[i], 0), 10);
	}

	strokeWeight(2);
	noFill();

	const pal2 = [
		[25, 100, 255],
		[255, 50, 25],
		[100, 100, 100],
	];

	for(let j=0; j<condition_count; ++j){
		stroke(...pal2[j%pal2.length], 100);
		beginShape();
		for(let i=0; i<state.steps; ++i) vertex(..._map(x[j][i], y[j][i], i/state.steps));
		endShape();
	}

	fill(100, Math.min(255, Math.max(0, 5000 * (1-Math.abs(Math.sqrt(camera[2][0]*camera[2][0] + camera[2][1]*camera[2][1])))))); noStroke();
	for(let i=0; i<condition_count; ++i){
		let init = _map(...state.initial[i], 0);
		const S = "(" + state.initial[i][0].toPrecision(2) + ", " + state.initial[i][1].toPrecision(2) + ")";
		textSize(11);
		if(origin[1] < (bounds[1][0]+bounds[1][1])/2){
			push();
			textAlign(CENTER, BOTTOM);
			text(S, init[0], init[1]-12);
			pop();
		}else{
			push();
			textAlign(CENTER, TOP);
			text(S, init[0], init[1]+12);
			pop();
		}
	}
}

function recalc(){
	x = new Array(condition_count);
	y = new Array(condition_count);

	bounds = [[state.initial[0][0], state.initial[0][0]], [state.initial[0][1], state.initial[0][1]]];

	for(let j=0; j<condition_count; ++j){
		_x = new Array(state.steps).fill(0);
		_y = new Array(state.steps).fill(0);

		_x[0] = state.initial[j][0];
		_y[0] = state.initial[j][1];


		for(let i=1; i<state.steps; ++i){
			const x0 = _x[i-1], y0 = _y[i-1], t0 = (i-1)*state.dt;

			if(!isFinite(x0) || !isFinite(y0)){
				_x[i] = x0, _y[i] = y0;
				continue;
			}

			const x1 = dx(x0, y0, t0);
			const y1 = dy(x0, y0, t0);

			const x2 = dx(x0 + x1*state.dt/2, y0 + y1*state.dt/2, t0 + state.dt/2);
			const y2 = dy(x0 + x1*state.dt/2, y0 + y1*state.dt/2, t0 + state.dt/2);

			const x3 = dx(x0 + x2*state.dt/2, y0 + y2*state.dt/2, t0 + state.dt/2);
			const y3 = dy(x0 + x2*state.dt/2, y0 + y2*state.dt/2, t0 + state.dt/2);

			const x4 = dx(x0 + x3*state.dt, y0 + y3*state.dt, t0 + state.dt);
			const y4 = dy(x0 + x3*state.dt, y0 + y3*state.dt, t0 + state.dt);

			_x[i] = x0 + (x1 + 2*x2 + 2*x3 + x4) * state.dt/6;
			_y[i] = y0 + (y1 + 2*y2 + 2*y3 + y4) * state.dt/6;

			if(isFinite(_x[i])) bounds[0][0] = Math.min(bounds[0][0], _x[i]);
			if(isFinite(_x[i])) bounds[0][1] = Math.max(bounds[0][1], _x[i]);

			if(isFinite(_y[i])) bounds[1][0] = Math.min(bounds[1][0], _y[i]);
			if(isFinite(_y[i])) bounds[1][1] = Math.max(bounds[1][1], _y[i]);
		}

		x[j] = _x;
		y[j] = _y;
	}

	loop();
}

function mousePressed(){
	if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
	pm = [mouseX, mouseY];
	use = true;
	loop();
}

function mouseReleased() { use = false; }
