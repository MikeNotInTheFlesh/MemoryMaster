var numCards = 1;
var cards = [];
var firstGuessId = -1;
var timer = 0;
var hideCardsTimer = 0;
var correctGuessTimer = 0;
var pics = [];
var calls = [];
//var cardBack;
//var tableCloth;
var winFlag = true;
var buttons = [];
var font;
var score = 0;
var timerDelay = 60;
var picIds = [];
var songIds = [];
var cardW;
var gameMode = 'memory';
var gameModes = ["memory", "french", "birds"];
var gameModeButtons = [];

function preload() {
	correctPlay = loadSound('data/correctPlay.mp3');
	levelComplete = loadSound('data/levelComplete.mp3');

  cardBack = loadImage("data/cardBack.jpg");
  backRed = loadImage("data/backRed.jpg");
  backBlue = loadImage("data/backBlue.jpg");
  tableCloth = loadImage("data/tableCloth.jpg");

  musicImage = loadImage("data/musicImage.png");
  musicNote = loadImage("data/musicNote.png");
  soundOn = loadImage("data/soundOn.gif");
  soundOff = loadImage("data/soundOff.gif");
  thumbsUp = loadImage("data/thumbsUp.png");
  thumbsDown = loadImage("data/thumbsDown.png");
  myFont = loadFont('data/impact.ttf');
}

function setup() {

	correctPlay.setVolume(0.6);
	levelComplete.setVolume(0.4);

  // createCanvas(window.innerWidth * 0.95, window.innerHeight * 0.95);
  createCanvas(window.innerWidth * 1, window.innerHeight * 1);
  frameRate(30);
  tableCloth.resize(width, height);

  cardW = min(height, width);
  createBoard(cardW);

  textFont(myFont);

  soundIcon = new soundButton();

  // Create the buttons which the players uses choose the number of cards in new game
  if (buttons != null){ // I declared 'buttons = []' at the top so it should never be null? delete this if???
    for (var i = 0; i < 4; i++){
      buttons[i] = new Button(i * width / 5 + width / 10, 2 * height / 6,
      width / 6, height / 10, i);
    }
  }
  // Create buttons for each game mode (e.g. memory, french, bird calls)
  for (let i = 0; i < 3; i++) {
	gameModeButtons[i] = new Button(i * width / 3 + width / 20,  height / 6,
    width / 4, height / 15, gameModes[i]);
  }

  if (gameMode == 'french') {
  birds = [
    "cat_le_chat",
	"chair_la_chaise",
	"cow_la_vache",
	"dog_le_chien",
	"door_la_porte",
	"duck_le_canard",
	"fish_le_poisson",
	"fork_la_fourchette",
	"glass_le_verre",
	"hand_la_main",
	"insect_l'_insecte",
	"kitten_le_chaton",
	"knife_le_couteau",
	"mustache_la_moustache",
	"pig_le_cochon",
	"plate_l'_assiette",
	"puppy_le_chiot",
	"refrigerator_la_frigidaire",
	"spoon_la_cuillere"
  ]
  } else if (gameMode == 'birds') {
	birds = [
    "american_crow",
	"american_goldfinch",
    "american_robin",
    "american_tree_sparrow",
    "black-throated_sparrow",
    "blue_jay",
    "canada_goose",
	"great_horned_owl",
    "house_finch",
    "mallard",
	"northern_cardinal",
    "purple_finch",
	"red_bellied_woodpecker",
    "trumpeter_swan",
    "wood_duck",
    "wood_thrush"
  ]
  } else if (gameMode = 'memory') {
	  birds = [
    "001",
    "005",
    "036",
    "121",
    "1516",
    "IMG_1318",
    "IMG_1314",
    "IMG_1316",
    "IMG_1312",
    "IMG_1310",
    "IMG_1307",
    "IMG_1305",
    "IMG_1270",
    "IMG_1026",
    "IMG_1263",
    "IMG_0961",
    "IMG_1207",
    "chucky",
    "yellowy"
  ]
  }

  // We shuffle the images here
  birds = shuffle(birds);
  for (let i = 0; i < numCards; i++) {
	  pics[i] = loadImage("data/pics/" + gameMode + "/" + birds[i] + ".jpg");
  }
  if (gameMode != "memory") {
    for (let i = 0; i < numCards; i++) {
	  calls[i] = loadSound("data/calls/" + gameMode + "/" + birds[i] + ".mp3");
  }
  }
}

function draw() {
  background(0, 50, 120, 255);
  fill(255);
  imageMode(CORNER);
  background(tableCloth);

  if (! winFlag) {
    timer += 1;
  }

  hideCardsTimer -= 1;
  if (hideCardsTimer == 0){
    hideCards();
  }

  correctGuessTimer -= 1;
  if (correctGuessTimer == 0){
    correctGuess();
  }

  for (let card of cards){
    card.show();
  }

  if (winFlag) {
    for (let button of buttons) {
      button.visible = true;
    }
	for (let button of gameModeButtons) {
	  button.visible = true;
	}
    winner();
  }

  for (let button of buttons) {
    button.show();
  }
  for (let button of gameModeButtons) {
	button.show();
  }

  soundIcon.show();

	push();
	fill(255);
	textAlign(LEFT, TOP);
	textSize(min(width, height) / 30);
	text("Score: " + score, 5, height * 9.5 / 10);
  if (localStorage.getItem("highScore" + numCards + gameMode)){
	  text("High score: " + localStorage.getItem("highScore" + numCards + gameMode), 5, 5);
  	}
	pop();

  if (hideCardsTimer > 0) {
	  push();
	  imageMode(CENTER);
	  tint(255, 188); // make semi-transparent
	  image(thumbsDown, width / 2, height / 2, width / 3, width / 3);
	  pop();
  } else if (correctGuessTimer > 0) {
	  push();
	  imageMode(CENTER);
	  tint(255, 188);
	  image(thumbsUp, width / 2, height / 2, width / 3, width / 3);
	  pop();
	  showName();
  }

}

function createBoard(cardWidth) {
	this.cardWidth = cardWidth;
  var nextX, nextY, gap;
  // var cardWidth = min(height, width) / (sqrt (2 * (numCards + numCards / 10)) );
  gap = this.cardWidth / 10;
  nextX = gap;
  nextY = gap;
  var maxX = 0;
  ids = [];
  picIds = [];
  songIds = [];
  cards = [];

  // make a list of ids
  for (let i = 0; i < numCards * 2; i++) {
    if (i < numCards) {
      ids.push(i);
    } else {
      ids.push(i - numCards);
    }
  }
  // shuffle ids to use as param for new Cards
  ids = shuffle(ids);

  // Create Cards and put them in array: cards
  for (let i = 0; i < 2 * numCards; i++){
    if(nextX + gap + cardWidth > width){
      nextX = gap;
      nextY += (cardWidth * 3 / 4 + gap);
    }

	// var picIds = [];
	// var songIds = [];
	if (songIds.includes(ids[i]) || gameMode == 'memory'){
	  cards.push(new Card(nextX, nextY, cardWidth, ids[i]));
	} else if (picIds.includes(ids[i])){
	  cards.push(new Card(nextX, nextY, cardWidth, ids[i], true));
	} else if (random() > 0.5) {
		cards.push(new Card(nextX, nextY, cardWidth, ids[i]));
		picIds.push(ids[i]);
	} else {
		cards.push(new Card(nextX, nextY, cardWidth, ids[i], true));
		songIds.push(ids[i]);
	}
	nextX += (gap + cardWidth);
  }

  // center the cards on the board
  // centering on the x is harder because the last card may not be farthest right
  while (true) {
	  for (let card of cards) {
		  if (card.x > maxX) {
			  maxX = card.x;
		  }
	  }
	  if (cards[0].x < width - (maxX + cards[0].w + gap / 2)) {
		  for (let card of cards) {
			  card.x += gap / 10;
		  }
	  } else {
		  break;
	  }
  }

  // center the y axis
  while (cards[0].y < height - (cards[cards.length - 1].y + cards[0].h + gap)) {
	  for (let card of cards) {
		  card.y += gap / 10;
	  }
  }
  // Resize cards if they don't fit
  if (cards[cards.length - 1].y + cards[0].h > height){
	cardW *= 0.9;
	createBoard(cardW);
  }
}

function mouseReleased() {

	// These buttons start a new game
	if (winFlag) {
		for (let button of buttons) {
			if (button.checkPressed()){
				button.action();
			}
		}
		// These buttons change the game mode
		for (let button of gameModeButtons) {
			if (button.checkPressed()) {
				gameMode = button.id;
				if (gameMode == "memory") {
					timerDelay = 30;
				} else if (gameMode == "birds") {
					timerDelay = 120;
				} else if (gameMode == "french") {
					timerDelay = 60;
				}
			}
		}
	}
	// If someone wants to play faster clicking the screen will let them
	if (hideCardsTimer > 0) {
		// added a buffer to timerDelay for touch screens touching too fast
		if (hideCardsTimer < timerDelay * 2 - 6) {
			hideCardsTimer = 1;
		}
		return false;
	} else if (correctGuessTimer > 0 && hideCardsTimer < timerDelay - 6) {
		if (correctGuessTimer < timerDelay * 2 - 6) {
			correctGuessTimer = 1;
		}
		return false;
		// bug fix. Starting a new game would select the first card.
	} else if (timer < 5) {
		return false;
	}

	// Did someone click a card?
	for (let i = cards.length - 1; i >= 0; i--) {
		if (cards[i].x < mouseX && cards[i].x + cards[i].w > mouseX
      && cards[i].y < mouseY && cards[i].y + cards[i].w > mouseY
      && ! cards[i].visible
    ){
      cards[i].visible = true;
      checkGuess(cards[i].id);
	  // Check if card is a sound card
	  if(cards[i].song && soundIcon.mode == "on") {
		  // Stop any running sounds
		  for (let call of calls) {
			  if (call.isPlaying()) {
				  call.stop();
			  }
		  }
		  calls[cards[i].id].play();
	  }
      return false;
    }
	}
	if (
    soundIcon.x - soundIcon.r / 2 < mouseX
    && mouseX < soundIcon.x + soundIcon.r / 2
    && soundIcon.y - soundIcon.r / 2 < mouseY
    && mouseY < soundIcon.y + soundIcon.r / 2
  ) {
    soundIcon.change();
  }
  return false;
}

function checkGuess(id){
	// this 'if' covers the first card of two to be checked
	if (firstGuessId == -1){
    firstGuessId = id;
  } else if (firstGuessId == id) {
    // do stuff for correct answer
    correctGuessTimer = timerDelay;
    score += numCards * 5;
  } else{
    // do stuff for incorrect answer
    firstGuessId = -1;
    hideCardsTimer = timerDelay * 1.5;
    score -= numCards * 1;
  }
}

function hideCards() {
	for (let call of calls) {
		if (call.isPlaying()) {
		  call.stop();
		}
	}
  for (let card of cards) {
    card.visible = false;
  }
}

function correctGuess() {
	for (let call of calls) {
	  if (call.isPlaying()) {
		call.stop();
	  }
	}
  if (cards.length == 2) {
    winFlag = true;
	if (! localStorage.getItem("highScore" + numCards + gameMode)  || localStorage.getItem("highScore" + numCards + gameMode) < score) {
	  localStorage.setItem("highScore" + numCards + gameMode, score);
    }
	if (soundIcon.mode == 'on'){
	  levelComplete.play();
	}
    return;
  }
  for (let call of calls) {
	  if (call.isPlaying()) {
	    call.stop();
	  }
	}
  for (let i = cards.length - 1; i >= 0; i--) {
    if (cards[i].id == firstGuessId) {
      cards.splice(i, 1);
    }
  }
  if (soundIcon.mode == 'on'){
	correctPlay.play();
  }
  firstGuessId = -1;
}

// Displays game over messages
function winner() {
  push();
  textAlign(CENTER, BOTTOM);
  var bigness = min(width, height) / 7;
  textSize(bigness);
  fill(255, 0, 0, 255);
  if (score > 0) {
    text("You Win!", width / 2, height * 3 / 5);
    textAlign(CENTER, TOP);
    fill(255, 255, 255, 255);
    textSize(bigness);
    text("score: " + score, width / 2, height * 3 / 5);
  //text("seconds: "+ str(timer / 30), width / 2, height / 2);
  }
  textAlign(CENTER, CENTER);
  fill(255, 215, 0, 255);
  text("Start New Game", width / 2, height / 16);
  if (localStorage.getItem("highScore" + numCards + gameMode) == score && score > 0) {
	  // stroke('yellow');
	  // strokeWeight(bigness / 20);
	  textAlign(CENTER, BOTTOM);
	  textSize(bigness);
	  fill('yellow');
	  text("HIGH SCORE!!!", width / 2, height - height / 20);
	  fill('white');
	  text("HIGH SCORE!!!", width / 2 + width / 200, height - height / 20 + height / 200);
  }
  pop();
}

function newGame(tempNumCards) {
  numCards = tempNumCards;
  cards.length = 0;
  timer = 0;
  firstGuessId = -1;
  correctGuessTimer = 0;
  hideCardsTimer = 0;
  winFlag = false;
  score = 0;
  setup();
}

function showName() {
	if (gameMode == "memory") {
		return;
	}
	push();
	fill(85);
	textSize(min(width, height) / 10);
	textAlign(CENTER, CENTER);
	stroke(0);
	strokeWeight(textSize);
	  for (let card of cards){
		  if (card.visible){
			  let birdName = birds[card.id];
			  let birdNames = [];
			  birdNames = birdName.split("_");
			    // For French we're getting rid of first word in file name
			    if (gameMode == "french") {
			      birdNames.shift();
			  }

			  // For birds we'll put them upper-case
			  if (gameMode == "birds") {
			  for (let i = 0; i < birdNames.length; i++){
				birdNames[i] = birdNames[i].charAt(0).toUpperCase() + birdNames[i].substr(1);
			  }
			  }
			  birdName = birdNames.join(" ");
			  text(birdName, width / 2, height / 2);
			  break;
		  }
	  }
	  pop();
}
