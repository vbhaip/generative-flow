//heavily inspired by tyler hobb's fidenza: https://tylerxhobbs.com/fidenza

let size = 500;

let NOISE_ZOOM = size*0.5;

let FPS = 10
let TOTAL_TIME = 10

let seed = Math.floor(Math.random()*1000);

function setup() {
	// put setup code here
	createCanvas(size, size);
	background(255);
	frameRate(FPS);
	colorMode(HSB, 100);
	// colorMode(HSB, 255)

	// noiseDetail(2, 0.1)
	noiseDetail(4, 0.5)
	
	noiseSeed(seed)
	console.log("seed: " + seed);

	// showflowfield();

	
	strokeCap(SQUARE)
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

//previous implementation, changed to just use a package
function getControlPoint(index, arr){
	//the point we're building off
	let px = arr[index][0];
	let py = arr[index][1];

	let v1 = getVector(arr[index-1], arr[index])
	let v2 = getVector(arr[index], arr[index+1])

	let dir = normal_dir(v1.x, v1.y, v2.x, v2.y);

	//this is the tangent vector the point
	v = v1.copy();
	v.add(v2);

	// console.log(v);
	// console.log(v1);
	// console.log(v2);
	
	// console.log("v mag: " + v.mag())
	// console.log("v1 mag: " + v1.mag())
	// console.log("v2 mag: " + v2.mag())
	// let sharpness = v.mag()/(v1.mag() + v2.mag());
	// console.log(sharpness);

	//rotated 90 degrees clockwise
	v.rotate(-HALF_PI)


	//normalize and adjust direction
	// v.normalize();
	v.mult(dir);

	//now v is the normal vector to the curve

	

	// let m = console.log(random(5, 10))
	//this is the control point
	return [px + 3*v.x, py + 3*v.y]


}


function quadColorLerp(p0, p1, p2, t){
	p3 = lerpColor(p0, p1, t)
	p4 = lerpColor(p1, p2, t)
	return lerpColor(p3, p4, t)

	
}

function draw() {
	// put drawing code here
	// background(220);
	// if(frameCount >= TOTAL_TIME*FPS+5){
	// 	noLoop();
	// }
	stroke(255, 0, 0);
	strokeWeight(random(5, 20));

	let x = floor(random(-0.1*size, size*1.1));
	let y = floor(random(-0.1*size, size*1.1));

	
	//sample points to get bezier curve
	let sample_size = 47;
	let length = random(0.5, 2)
	// let first_stop = Math.floor((sample_size-2)/3)
	// let second_stop = Math.floor(2*(sample_size-2)/3)

	let samples = [[x,y]];

	for(let step = 0; step < sample_size; step++){
		let t = step/sample_size;
		let n = nnoise(x, y);

		x += cos(2*PI*n)*length;
		y += sin(2*PI*n)*length;
		
		samples.push([x, y]);
	}


	// let b1 = getControlPoint(first_stop, samples);
	// let b2 = getControlPoint(second_stop, samples);

	// console.log(samples);
	let curve = fitCurve(samples, 50)[0]
	// console.log(curve)

	let b1 = curve[1]
	let b2 = curve[2]


	let a = random(5, 20)

	stroke(0)
	strokeCap(PROJECT)
	strokeWeight(a*1.2)
	noFill();
	beginShape();
	vertex(...curve[0]);
	bezierVertex(...b1, ...b2, ...curve[3]);
	endShape();

	let c0 = color(86, 50, 100);
	let c1 = color(60, 50, 100);
	let c2 = color(44, 50, 100);

	// stroke(255, 0, 0)
	let t = (curve[0][0]+curve[0][1])/(2*size)
	// stroke(quadColorLerp(c0, c1, c2, t));
	stroke(color(Math.random()*100, 50, 100))
	strokeCap(PROJECT)
	strokeWeight(a)

	noFill();
	beginShape();
	vertex(...curve[0]);
	bezierVertex(...b1, ...b2, ...curve[3]);
	endShape();

	// noLoop();
}