//heavily inspired by tyler hobb's fidenza: https://tylerxhobbs.com/fidenza

let size = 500;

let NOISE_ZOOM = size*0.5;

let FPS = 20
let TOTAL_TIME = 10

let seed = Math.floor(Math.random()*1000);

let BACKGROUND_COLOR = 0

let c0;
let c1;
let c2;

function setup() {
	// put setup code here
	createCanvas(size, size);
	background(BACKGROUND_COLOR);
	frameRate(FPS);
	colorMode(HSB, 100);
	// colorMode(HSB, 255)

	// noiseDetail(2, 0.1)
	noiseDetail(4, 0.5)
	
	noiseSeed(seed)
	console.log("seed: " + seed);

	// showflowfield();

	
	strokeCap(SQUARE)
	blendMode(BLEND)

	c0 = color(Math.random()*100, Math.random()*100, 100);
	c1 = color(Math.random()*100, Math.random()*100, 100);
	c2 = color(Math.random()*100, Math.random()*100, 100);
}


//shows the underlying flow field
function showflowfield() {
	let detail = 16;

	background(0);

	stroke(255);

	for(let i = 0; i < size; i+=detail){
		for(let j = 0; j < size; j+=detail){
			let n = noise(i*1.0/NOISE_ZOOM, j*1.0/NOISE_ZOOM);
			xdir = cos(2*PI*n);
			ydir = sin(2*PI*n);

			line(i, j, i+xdir*detail, j+ydir*detail);
		}
	}
}

//returns 1 if cross product > 0, -1 if cross product < 0
function normal_dir(x1, y1, x2, y2){
	return x1*y2-x2*y1 > 0 ? 1 : -1;
}

//get normalized noise
function nnoise(x, y){
	return noise(x*1.0/NOISE_ZOOM, y*1.0/NOISE_ZOOM)
}

function getVector(p1, p2){
	return createVector(p2[0] - p1[0], p2[1] - p1[1]);
}



function quadColorLerp(p0, p1, p2, t){
	p3 = lerpColor(p0, p1, t)
	p4 = lerpColor(p1, p2, t)
	return lerpColor(p3, p4, t)

	
}

function drawCurve(points, width, show_border, use_background){

	let curve = fitCurve(points, 500)[0]

	let b1 = curve[1]
	let b2 = curve[2]

	blendMode(BLEND);

	if(show_border){
		blendMode(BLEND);
		stroke(0)
		strokeCap(PROJECT)
		strokeWeight(width*1.2)
		noFill();
		beginShape();
		vertex(...curve[0]);
		bezierVertex(...b1, ...b2, ...curve[3]);
		endShape();
	}

	// stroke(255, 0, 0)
	let t = (curve[0][0]+curve[0][1])/(2*size)
	// let t = nnoise(curve[0][0], curve[0][1])
	// console.log(t);
	stroke(quadColorLerp(c0, c1, c2, t+Math.random()*0.2-0.1));
	// stroke(color(Math.random()*100, 50, 100))
	strokeCap(SQUARE)
	strokeWeight(width)

	if(use_background){
		stroke(BACKGROUND_COLOR);
		strokeWeight(width*0.5)
	}

	noFill();
	beginShape();
	vertex(...curve[0]);
	bezierVertex(...b1, ...b2, ...curve[3]);
	endShape();
}

function subdivide(points){
	let subdivisions = [];

	let start = 0;
	let end = 4;

	while(end < points.length-3){
		if(Math.random() < 0.025){
			subdivisions.push(points.slice(start, end))
			start = end - 1;
			end = start + 4;
		}
		else{
			end += 1;
		}
	}

	subdivisions.push(points.slice(start));
	// console.log(subdivisions)
	return subdivisions;
}

function draw() {
	// put drawing code here
	// background(220);
	// if(frameCount >= TOTAL_TIME*FPS+5){
	// 	noLoop();
	// }
	stroke(255, 0, 0);
	strokeWeight(random(3, 15));

	let x = floor(random(-0.1*size, size*1.1));
	let y = floor(random(-0.1*size, size*1.1));

	
	//sample points to get bezier curve
	let sample_size = 47;
	let length = random(0.5, 2)

	let samples = [[x,y]];

	for(let step = 0; step < sample_size; step++){
		let t = step/sample_size;
		let n = nnoise(x, y);

		x += cos(2*PI*n)*length;
		y += sin(2*PI*n)*length;
		
		samples.push([x, y]);
	}

	let width = random(5, 20);

	loadPixels();
	let before = [...pixels]
	drawCurve(samples, width, false, true);
	loadPixels();
	let after = [...pixels]
	// console.log(pixels)
	// console.log(after.pixels)

	if(!_.isEqual(before, after)){
		clear();
		background(BACKGROUND_COLOR);
		// set(before)
		// pixels = [...before];
		for(let i = 0; i < pixels.length; i++){
			pixels[i] = before[i];
		}
		updatePixels();
		console.log("yo")

	}
	else{


		// drawCurve(samples, width, true, true)

		let subdivisions = subdivide(samples)

		drawCurve(samples, width)
		subdivisions.map(curve_part => drawCurve(curve_part, width, false, false))
		
		// noLoop();
	}
	//ensures garbage collection
	before = null;
	after = null;
}