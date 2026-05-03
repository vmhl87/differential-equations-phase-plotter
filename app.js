const var1 = document.getElementById("var1");
const var2 = document.getElementById("var2");

const exp1 = document.getElementById("exp1");
const exp2 = document.getElementById("exp2");

const startx = document.getElementById("startx");
const starty = document.getElementById("starty");

const steps = document.getElementById("steps");
const stepsize = document.getElementById("stepsize");

const error_box = document.getElementById("error");

let state = {
	initial: [0, 0],
	steps: 0,
	dt: 0,
	var1: "X",
	var2: "Y",
	exp1: null,
	exp2: null,
};

function dx(X, Y){
	let ctx = {};
	ctx[state.var1] = X;
	ctx[state.var2] = Y;
	return state.exp1.evaluate(ctx);
}

function dy(X, Y){
	let ctx = {};
	ctx[state.var1] = X;
	ctx[state.var2] = Y;
	return state.exp2.evaluate(ctx);
}

let x = [], y = [], bounds = [[0, 0], [0, 0]];

function update_state(){
	const _state = {
		initial: [0, 0],
		steps: 0,
		dt: 0,
		var1: "X",
		var2: "Y",
		exp1: null,
		exp2: null,
	};

	_state.initial[0] = Number(startx.value);
	_state.initial[1] = Number(starty.value);

	_state.steps = Number(steps.value);
	_state.dt = Number(stepsize.value);

	_state.var1 = var1.value.trim();
	_state.var2 = var2.value.trim();

	let error_text = "";

	if(isNaN(_state.initial[0]) || isNaN(_state.initial[1]))
		error_text += "Error: Invalid initial condition\n";

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

	const ctx = {};
	ctx[_state.var1] = _state.initial[0];
	ctx[_state.var2] = _state.initial[1];

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

	error_text = error_text.trim().replaceAll("\n", "<br>");

	if(error_text.length != 0) error_box.innerHTML = error_text;
	else{
		error_box.innerHTML = "";
		state = _state;
	}

	recalc();
}

var1.addEventListener("change", update_state);
var2.addEventListener("change", update_state);

exp1.addEventListener("change", update_state);
exp2.addEventListener("change", update_state);

startx.addEventListener("change", update_state);
starty.addEventListener("change", update_state);

steps.addEventListener("change", update_state);
stepsize.addEventListener("change", update_state);

function setup(){
	createCanvas(800, 600);
	update_state();
}

function draw(){
	noLoop();
}

function update(){
	background(255);

	function _map(x, y){
		return [
			100 + (width-200) * (x-bounds[0][0])/(bounds[0][1]-bounds[0][0]+1e-6),
			100 + (height-200) * (1 - (y-bounds[1][0])/(bounds[1][1]-bounds[1][0]+1e-6)),
		];
	}

	stroke(170);
	strokeWeight(2);
	let origin = _map(0, 0);
	origin[0] = Math.round(Math.min(width-50, Math.max(50, origin[0])));
	origin[1] = Math.round(Math.min(height-50, Math.max(50, origin[1])));
	if(origin[1] > height/2){
		line(origin[0], 50, origin[0], height-30);
		push();
		fill(100); noStroke();
		textSize(14);
		textAlign(CENTER, BOTTOM);
		text(state.var2, origin[0], 50-10);
		pop();
	}else{
		line(origin[0], 30, origin[0], height-50);
		push();
		fill(100); noStroke();
		textSize(14);
		textAlign(CENTER, TOP);
		text(state.var2, origin[0], height-50+10);
		pop();
	}
	if(origin[0] > width/2){
		line(50, origin[1], width-30, origin[1]);
		push();
		fill(100); noStroke();
		textSize(14);
		textAlign(RIGHT, CENTER);
		text(state.var1, 50-10, origin[1]);
		pop();
	}else{
		line(30, origin[1], width-50, origin[1]);
		push();
		fill(100); noStroke();
		textSize(14);
		textAlign(LEFT, CENTER);
		text(state.var1, width-50+10, origin[1]);
		pop();
	}

	stroke(50);
	strokeWeight(1);
	const xscale = Math.pow(2, Math.ceil(Math.log2(bounds[0][1] - bounds[0][0]))) / 4;
	const yscale = Math.pow(2, Math.ceil(Math.log2(bounds[1][1] - bounds[1][0]))) / 4;
	for(let x=xscale*(Math.floor(state.initial[0]/xscale)-5), i=0; i<60; ++i, x+=xscale/4){
		if(x == 0) continue;
		const X = Math.round(_map(x, 0)[0]);
		if(X >= 50 && X <= width-50){
			if(i%4 == 0){
				line(X, origin[1]-6, X, origin[1]+6);
				push();
				fill(100); noStroke(); textSize(11);
				if(origin[1] > height/2){
					textAlign(CENTER, TOP);
					text(x.toPrecision(3), X, origin[1]+12);
				}else{
					textAlign(CENTER, BOTTOM);
					text(x.toPrecision(3), X, origin[1]-12);
				}
				pop();
			}else line(X, origin[1]-3, X, origin[1]+3);
		}
	}
	for(let y=yscale*(Math.floor(state.initial[1]/yscale)-5), i=0; i<60; ++i, y+=yscale/4){
		if(y == 0) continue;
		const Y = Math.round(_map(0, y)[1]);
		if(Y >= 50 && Y <= height-50){
			if(i%4 == 0){
				line(origin[0]-6, Y, origin[0]+6, Y);
				push();
				fill(100); noStroke(); textSize(11);
				if(origin[0] > width/2){
					textAlign(LEFT, CENTER);
					text(y.toPrecision(3), origin[0]+12, Y);
				}else{
					textAlign(RIGHT, CENTER);
					text(y.toPrecision(3), origin[0]-12, Y);
				}
				pop();

			}else line(origin[0]-3, Y, origin[0]+3, Y);
		}
	}

	fill(255, 25, 100, 100);
	noStroke();
	circle(..._map(...state.initial), 10);

	stroke(25, 100, 255, 100);
	strokeWeight(2);
	noFill();

	beginShape();

	for(let i=0; i<state.steps; ++i) vertex(..._map(x[i], y[i]));

	endShape();

	fill(255, 175); noStroke();
	let init = _map(...state.initial);
	const S = "(" + state.initial[0].toPrecision(2) + ", " + state.initial[1].toPrecision(2) + ")";
	textSize(11);
	if(init[1] > height/2){
		const W = textWidth(S);
		rect(init[0]-W/2-2, init[1]-12+2, W+4, -11-4);
		push();
		fill(100);
		textAlign(CENTER, BOTTOM);
		text(S, init[0], init[1]-12);
		pop();
	}else{
		const W = textWidth(S);
		rect(init[0]-W/2-2, init[1]+12-2, W+4, 11+4);
		push();
		fill(100);
		textAlign(CENTER, TOP);
		text(S, init[0], init[1]+12);
		pop();
	}
	
	loop();
}

function recalc(){
	x = new Array(state.steps).fill(0);
	y = new Array(state.steps).fill(0);

	x[0] = state.initial[0];
	y[0] = state.initial[1];

	bounds = [[x[0], x[0]], [y[0], y[0]]];

	for(let i=1; i<state.steps; ++i){
		const x0 = x[i-1], y0 = y[i-1];

		if(!isFinite(x0) || !isFinite(y0)){
			x[i] = x0, y[i] = y0;
			continue;
		}

		const x1 = dx(x0, y0);
		const y1 = dy(x0, y0);

		const x2 = dx(x0 + x1*state.dt/2, y0 + y1*state.dt/2);
		const y2 = dy(x0 + x1*state.dt/2, y0 + y1*state.dt/2);

		const x3 = dx(x0 + x2*state.dt/2, y0 + y2*state.dt/2);
		const y3 = dy(x0 + x2*state.dt/2, y0 + y2*state.dt/2);

		const x4 = dx(x0 + x3*state.dt, y0 + y3*state.dt);
		const y4 = dy(x0 + x3*state.dt, y0 + y3*state.dt);

		x[i] = x0 + (x1 + 2*x2 + 2*x3 + x4) * state.dt/6;
		y[i] = y0 + (y1 + 2*y2 + 2*y3 + y4) * state.dt/6;

		if(isFinite(x[i])) bounds[0][0] = Math.min(bounds[0][0], x[i]);
		if(isFinite(x[i])) bounds[0][1] = Math.max(bounds[0][1], x[i]);

		if(isFinite(y[i])) bounds[1][0] = Math.min(bounds[1][0], y[i]);
		if(isFinite(y[i])) bounds[1][1] = Math.max(bounds[1][1], y[i]);
	}

	update();
}
