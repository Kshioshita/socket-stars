// P5 STUFF

var stars= []; //where star locations are stored
var lines=[]; //where lines are stored
var clickNum=3;
var x1, x2, y1, y2;
var isGrowing=true;
var h, sat, bri; //stores the shade of yellow
var isMoved= false;
var moveStar, starNum;
var poked=true;
function setup() {
	createCanvas(windowWidth, windowHeight-110);
	// generates a random shade of yellow
	h=random(30, 60);
	sat=random(40, 100);
	bri=random(60, 100);

	// Generate Stars button
	var col="#1e1896";
	button = createButton('Generate Stars');
  	button.position((windowWidth/2-123), 120);
  	button.style('background-color', col);
  	button.style('font-size', '.3em');
  	button.style('border-radius', '4px');
  	button.style('padding', '5px');
  	button.style('color', 'white');
  	button.style('border', 'none');
  	button.mousePressed(genStars);

  	// Clear lines button
  	button = createButton('Clear Constellations');
  	button.position((windowWidth/2), 120);
  	button.style('background-color', col);
  	button.style('font-size', '.3em');
  	button.style('border-radius', '4px');
  	button.style('padding', '5px');
  	button.style('color', 'white');
  	button.style('border', 'none');
  	button.mousePressed(emptylines);

}

function draw() {
	background("#0e2c5b");
	textSize(20);
	fill('#ffdd00');
	if(clickNum==0){
		noStroke();
		textAlign(CENTER);
		text('Click a star', windowWidth/2, 80);
	}
	else if(clickNum==1){
		noStroke();
		textAlign(CENTER);
		text('Click your second star', windowWidth/2, 80);
	}
	else if(clickNum==3){
		noStroke();
		textAlign(CENTER);
		text('Generate stars to Start', windowWidth/2, 80);
	}
	
	for(var i=0; i<stars.length; i++){
		// displays the stars
 		stars[i].display();
 		// calls function to make stars blink
 		stars[i].update();
 	}
 	// shows connections between stars
 	for(var i=0; i<lines.length; i++){
 		lines[i].show();
 	}

 	if(isMoved){
 		moveStar.x=mouseX;
 		moveStar.y=mouseY;
 		clickNum=0;
		sendMoveStar({
			'starX': moveStar.x,
			'starY': moveStar.y,
			'starNum': starNum
		});
 	}
}

function sendStars(message){
	// sends star locations
	socket.emit('starArray', message);
}

function sendLine(message){
	// send line location
	socket.emit('newLine',message);
}

function sendOneStar(message){
	//send new star
	socket.emit('newStar', message);
}
function sendClear(){
	// send request to clear lines
	socket.emit('clearing');
}
function sendMoveStar(message){
	socket.emit('movestar', message);
}

function otherStars(someX, someY, i){
	// display received locations of stars
	if(i==0){
		stars=[]; //clear previous stars
		emptylines(); //clear previous lines
		stars.push(new Star(someX, someY)); //add star array, so it can be displayed
	}
	else{
		stars.push(new Star(someX, someY));
	}
	clickNum=0;
}

function otherLine(x1, y1, x2, y2, h, sat, bri){
	// adds new line to array to be displayed, with the color of the line
	lines.push(new Connection(x1, y1, x2, y2, h, sat, bri));

}

function otherClear(){
	// clears lines when it receives the request from a different user
	lines=[];
	background("#0e2c5b");
	clickNum=0;
}

function addingStar(starX, starY){
	stars.push(new Star(starX, starY));
}

function movingStar(starX, starY, starNum){
	stars[starNum].x=starX;
	stars[starNum].y=starY;
}

function windoResized(){
	createCanvas(windowWidth, windowHeight);
}

function mouseClicked(){
	// console.log('mouse clicked');

	// checks to see if a star is clicked
	poked=false;
	for(var i=0; i<stars.length; i++){
		if(stars[i].poke()){
			poked=true;
			// console.log(stars[i].x +","+ stars[i].y);
			// tracks if the first or second star is clicked
			clickNum++;

			if(clickNum==1){
				// console.log("clickNum is " + clickNum);
				// stores the location of first star
				x1=mouseX;
				y1=mouseY;
			}
			else if(clickNum==2){
				// console.log("clickNum is now " + clickNum);
				// stores the location of the second star
				x2=mouseX;
				y2=mouseY;

				// add a line between star one and two
				lines.push(new Connection(x1, y1, x2, y2, h, sat, bri));
				// sends the line so it can be displayed to other users
				sendLine({
					'x1':x1,
					'x2':x2,
					'y1':y1,
					'y2':y2,
					'h':h,
					'sat':sat,
					'bri':bri
				});

				// resets number of stars clicked
				clickNum=0;
			}
		}
	}
	if(poked===false){
		stars.push(new Star(mouseX, mouseY));
		clickNum=0;
		sendOneStar({
 			'starX': mouseX,
 			'starY': mouseY
 		});

	}
}

function mouseDragged(){
	for(var i=0; i<stars.length; i++){
		if(stars[i].poke()){
			poked=true;
			// console.log(stars[i].x +","+ stars[i].y);
			// tracks if the first or second star is clicked
			isMoved=true;
			moveStar=stars[i];
			starNum=i;
		}
			
	}
}
function mouseReleased(){
	isMoved=false;
	isLineMove=false;
}
function Star(x, y){
	// create stars
	this.x=x;
	this.y=y;
	// set random size
	this.size=random(10, 20);

	this.display=function(){
		// draws star
		noStroke()
		fill('#ffdd00');
		ellipse(this.x, this.y, this.size, this.size);

	}

	this.update=function(){
		// set the state 
		if(this.size<=10){
			this.isGrowing=true;
		}
		if(this.size>=25){
			this.isGrowing=false;
		}

		// update the size
		if(this.isGrowing){
			// increases size by a random size, so stars blink at different rates
			this.size=this.size+random(3);
		}
		if(!this.isGrowing){
			// decreases size by a random size, so stars blink at different rates
			this.size=this.size-random(3);
		}
	}

	this.poke=function(){
		// checks to see if mouse is touching a star
		if(mouseX > (this.x-this.size/2) &&
			mouseX < (this.x+this.size/2) &&
			mouseY > (this.y-this.size/2) &&
			mouseY < (this.y+this.size/2)){
			// console.log(this.x + ',' + this.y);
			return true;
		}
		else{
			return false;
		}

	}

}

function Connection(x1, y1, x2, y2, h, sat, bri){
	this.x1=x1;
	this.y1=y1;
	this.x2=x2;
	this.y2=y2;
	this.h=h;
	this.sat=sat;
	this.bri=bri;

	this.show=function(){
		// draws line between two stars
		colorMode(HSB);
		strokeWeight(4);
		stroke(h, sat, bri);
		line(this.x1, this.y1, this.x2, this.y2);
	}
}

function emptylines(){
	// removes the lines between the stars without changing location of the stars
	lines=[];
	background("#0e2c5b");
	// poked=true;
	clickNum=0;
	// sends the request to clear lines to other users
	sendClear();
}


function genStars(){
	stars=[];
	// poked=true;
	for(var i=0; i<20; i++){
		// creates 20 stars and randomly places them around the page
		stars.push(new Star(random(1300), random(50, 500)));
		// console.log(stars[i].x + ", "+ stars[i].y);
	}
 	//sendStatrs is a function that will emit array to the server
 	sendStars({
 		'starry': stars
 	});
 	emptylines();
 	clickNum=0;

}



