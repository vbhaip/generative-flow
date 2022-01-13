//heavily inspired by tyler hobb's fidenza: https://tylerxhobbs.com/fidenza

let size = 500;

let FPS = 20


//randomization

//seed for perlin noise
let seed = Math.floor(Math.random()*10000);

//background color is black or white
let BACKGROUND_COLOR = Math.random() > 0.5 ? 255 : 0;

//features of color scheme
let satur = Math.random()*100
let light = Math.random()*100

//how much perlin noise changes for steps
//mostly normal, but chance of getting more defined flow field
let NOISE_ZOOM = size*0.5;
if(Math.random() < 0.5){
	NOISE_ZOOM *= (Math.random()*0.8+0.2)
}

//do we allow shapes to overlap
let ALLOW_FULL_OVERLAP = Math.random() > 0.5 ? 0 : 1;

//if we do allow shapes to overlap, what's the margin of space that surrounds them
//positive means we have a margins surrounding them
let MARGIN = Math.random()*2-1

//should each bezier curve be broken up
let SHOULD_SUBDIVIDE = Math.random() > 0.7 ? 0 : 1;

//subdivision rate
let SUBDIVISION_RATE = Math.random()*0.1

//show border around bezier curve, need no subdivisions
let SHOW_BORDER = Math.random()>0.3 && !SHOULD_SUBDIVIDE ? 1 : 0

//how wide each curve can be
let low_w = Math.random()*5+3
let high_w = low_w + Math.random()*15
let STROKE_WIDTH_BOUNDS = [low_w, high_w]

//how many points to sample off the flow curve for the bezier curve
let FLOW_SAMPLE = 3*Math.floor(Math.random()*50+2)-2

//how long each line can be
let low_l = Math.random()
let high_l = Math.random()+low_l
let STROKE_LENGTH_BOUNDS = [low_l, high_l]

//falloff for parameter in perlin noise, keeps it at 0.5 (default) most of the time, but gives some deviation
let NOISE_FALLOFF = Math.min(0.5, Math.random()*0.5)



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
	noiseDetail(4, NOISE_FALLOFF)
	
	noiseSeed(seed)
	console.log("seed: " + seed);

	// showflowfield();

	
	strokeCap(SQUARE)
	blendMode(BLEND)


	c0 = color(Math.random()*100, satur, light);
	c1 = color(Math.random()*100, satur, light);
	c2 = color(Math.random()*100, satur, light);
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

function drawCurve(points, width, use_background){

	let curve = fitCurve(points, 500)[0]

	let b1 = curve[1]
	let b2 = curve[2]

	blendMode(BLEND);

	if(SHOW_BORDER){
		blendMode(BLEND);
		stroke(255-BACKGROUND_COLOR)
		strokeCap(PROJECT)
		strokeWeight(width*1.2)
		noFill();
		beginShape();
		vertex(...curve[0]);
		bezierVertex(...b1, ...b2, ...curve[3]);
		endShape();
	}

	// stroke(255, 0, 0)
	// let t = (curve[0][0]+curve[0][1])/(2*size)
	let t = nnoise(curve[0][0], curve[0][1])
	// console.log(t);
	stroke(quadColorLerp(c0, c1, c2, t+Math.random()*0.1-0.05));
	// stroke(color(Math.random()*100, 50, 100))

	if(!SHOW_BORDER){
		//if we aren't showing the border, then we can change back to square because it makes subdivisions show smoother
		strokeCap(SQUARE)
	}
	strokeWeight(width)

	if(use_background){
		stroke(BACKGROUND_COLOR);
		strokeWeight(width*(1+MARGIN))
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
		if(Math.random() < SUBDIVISION_RATE){
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

	stroke(255, 0, 0);
	strokeWeight(random(...STROKE_WIDTH_BOUNDS));

	let x = floor(random(-0.1*size, size*1.1));
	let y = floor(random(-0.1*size, size*1.1));

	
	//sample points to get bezier curve
	let sample_size = FLOW_SAMPLE;
	// let length = random(0.5, 2)

	//adjustment so that stroke length bounds isn't affected by sample_size
	let length = random(...STROKE_LENGTH_BOUNDS)*80.0/sample_size

	let samples = [[x,y]];

	for(let step = 0; step < sample_size; step++){
		let t = step/sample_size;
		let n = nnoise(x, y);

		x += cos(2*PI*n)*length;
		y += sin(2*PI*n)*length;
		
		samples.push([x, y]);
	}

	let width = random(...STROKE_WIDTH_BOUNDS);

	loadPixels();
	let before = [...pixels]
	if(!ALLOW_FULL_OVERLAP){
		drawCurve(samples, width, true);
	}
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
		console.log("skipping iteration")

	}
	else{


		if(SHOULD_SUBDIVIDE){
			let subdivisions = subdivide(samples)

			drawCurve(samples, width)
			subdivisions.map(curve_part => drawCurve(curve_part, width, false))
		}
		else{
			drawCurve(samples, width, false)
		}
		
		// noLoop();
	}
	//ensures garbage collection
	before = null;
	after = null;
}