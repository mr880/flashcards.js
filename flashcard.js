	
	/************************************/
	/*								 	*/
	/*		 FLASHCARD GENERATOR 		*/
	/*	  CREATED BY: MICHAEL RUSSO		*/
	/*									*/
	/************************************/

var fs = require("fs");
var inquirer = require("inquirer");
var basicArr = [];		
var clozeArr = [];	
var questions = 0;			//gets number of questions to be made form user

var check = false;
var wins = 0;				//keep track of questions answered correctly
var temp = 0;	

var i=1;					//created globally for funcitonality purposes
var j=3;					//created globally for funcitonality purposes
var count = 0;				//help keep track of questions answered

var append = false;


//constructor for basic flashcard
function BasicCard(front, back){
	this.front = front;
	this.back = back;
}

//constructor for clozeCard
function ClozeCard(text,clozeArg){
	this.fullText = text;
	this.clozeArg = clozeArg;

	//function creates partialized cloze questions
	this.partial = function(){
		var textArr = this.fullText.split(" ");
		var clozeArr = this.clozeArg.split(" ");

		//the dreaded tripple for loop... While aware of its extreme inefficiency on a large scale
		//I took into account it's small scale application for this homework assignment :)
		for(var i = 0; i<textArr.length; i++){
			for(var j = 0; j<clozeArr.length; j++){
				if(textArr[i] == clozeArr[j]){
					//size of the string taken in
					var size = clozeArr[j].length;
					check = true;
					textArr[i] = "";
					for(var k = 0; k<size; k++){
						textArr[i] += '_';
					}
					
				}
			}
		}
		//error check
		if(!check){
			console.log("Error: cloze not found!");
			check = false;
		}

		//takes our array of strings and joins them into a string
		var x = textArr.join(" ");
		
		//we return our string here
		return x;
	
	};
}

function reset(){

	count = 0;
	wins = 0;
	i=1;					
	j=3;
	append = false;
	basicArr = [];		
	clozeArr = [];	
	questions = 0;	
}

function exit(){

	process.stdout.write('\033c');

	console.log("Take Care!");
}

function newGame(){

	inquirer.prompt([
	  {
	  	type: "list",
      	message: "New Game?",
      	choices: ["Yes", "No"],
      	name: "ans"
	  	
	  }
	]).then(function(info){
		if(info.ans == "Yes"){
			reset();
			start();
		}
		else if(info.ans == "No"){
			exit();
		}
	});
}

//function that prompts user for their basic quesitons recursively
function tester(){

	fs.readFile("log.txt", "utf8", function(error, data) {


		// If the code experiences any errors it will log the error to the console.
		if (error) {
			return console.log(error);
		}

		//create an array for the basic questions
		var basicArr = data.split("\n");
		questions = ((basicArr.length-1)/2);
		//uses a global variable of i to traverse through the basic array 
		if(i<basicArr.length){
			//save our temp value
			temp = i;				

			inquirer.prompt([

				{
				name: "answer",
				message: basicArr[i] + ": "
				},
				
    		]).then(function(info) {
    			
    			//correct answer updates wins, count and does a recursive callback
    			if(info.answer.toLowerCase() == basicArr[temp+1].toLowerCase()){
    				console.log("Correct!");
    				wins++;
    				//update i by 6, the number of lines in the log.txt file with the next question
    				i+=2;
    				tester();
    				count++;

    			}
    			//incorrect answer updates count and does a recursive callback 
    			else{
    				//update i by 6, the number of lines in the log.txt file with the next question
    				i+=2;
    				console.log("Incorrect!");
    				tester();
    				count++;
    			}
    		});
    	}
    	if(count == questions){
    		console.log("You got " + wins + " questions correct out of " + questions);
    		if(questions == wins){
    			console.log("A perfect score!");
    			newGame();
    		}else{
    			newGame();
    		}
    	}
	});
}

//called to prompt user for which type of test they would like to take
function promptUser(){

	process.stdout.write('\033c');

	inquirer.prompt([
	  {
	  	type: "list",
      	message: "What would you like to do now?",
      	choices: ["Create more flashcards", "Test card(s)"],
      	name: "ans"
	  	
	  }
	]).then(function(info){
		if(info.ans == "Create more flashcards"){
			append = true;
			blankSlate();	//but not really
		}
		else if(info.ans == "Test card(s)"){
			tester();
		}
	});
}

function getInfoBasic(){

	inquirer.prompt([

		{
		name: "front",
		message: "Enter front of flashcard: "
		}, {
		name: "back",
		message: "Enter back of flashcard: "
		}

    ]).then(function(info) {
      
		var basic = new BasicCard(info.front, info.back);
		basicArr.push(basic);

		console.log("Basic flashcard added...");

		fs.appendFile("log.txt", "\n" + basic.front + "\n" + basic.back , function(err) {

		  	// If an error was experienced we say it.
			if (err) {
		    	console.log(err);
		  	}

		  	// If no error is experienced, we'll log the phrase "Content Added" to our node console.
		  	else {
		  	    //console.log("Content Added!");
		  	}

		});

		//recursively get more info
		if (basicArr.length < questions) {
			getInfoBasic();
		}
		else{
			promptUser();
		}
	});
}

function getInfoCloze(){

	inquirer.prompt([

		{
		name: "text",
		message: "Enter Cloze Card Text: "
		}, {
		name: "cloze",
		message: "Enter Cloze Argument(s): "
		}

    ]).then(function(info) {
      
		var clozer = new ClozeCard(info.text, info.cloze);
		
		clozeArr.push(clozer);

		console.log("Cloze Card added...");

		fs.appendFile("log.txt", "\n" + clozer.partial() + "\n" + clozer.clozeArg  , function(err) {

		  	// If an error was experienced we say it.
			if (err) {
		    	console.log(err);
		  	}

		  	// If no error is experienced, we'll log the phrase "Content Added" to our node console.
		  	else {
		  	    //console.log("Content Added!");
		  	}
		});

		//recursively get more info
		if (clozeArr.length < questions) {
			getInfoCloze();
		}
		else{
			promptUser();
		}
	});
}

function getBasicQuestions(){

	process.stdout.write('\033c');

	inquirer.prompt([
	  {
	  	name: "number",
	  	message: "Enter number of basic cards you wish to make: ",
	  	validate: function(value) {
          if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= 10) {
            return true;
          }
          return false;
        }
	  }
	]).then(function(info){
		questions = parseInt(info.number);
		getInfoBasic();
	});
}

//generate info from the user to store into flashcards
function getClozeQuestions(){

	process.stdout.write('\033c');

	inquirer.prompt([
	  {
	  	name: "number",
	  	message: "Enter number of cloze cards you wish to make: ",
	  	validate: function(value) {
          if (isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= 10) {
            return true;
          }
          return false;
        }
	  }
	]).then(function(info){
		questions = parseInt(info.number);
		getInfoCloze();
	});
}

function blankSlate(){

	process.stdout.write('\033c');

	if(!append){

		fs.writeFile("log.txt", "", function(err) {

		  // If the code experiences any errors it will log the error to the console.
			if (err) {
		    	return console.log(err);
		 	}
		});
	}

	inquirer.prompt([
	  {
	  	type: "list",
      	message: "Which card would you like to create?",
      	choices: ["Basic", "Cloze"],
      	name: "ans"
	  	
	  }
	]).then(function(info){
		if(info.ans == "Basic"){
			getBasicQuestions();
		}
		else if(info.ans == "Cloze"){
			getClozeQuestions();
		}
	});
}

//starter function, prompts user for how many games they would like to play
//and stores that value into var questions
function start(){

	process.stdout.write('\033c');

	inquirer.prompt([
	  {
	  	type: "list",
      	message: "Choose your path!",
      	choices: ["Take Quiz", "Add New Questions", "Create New Questions(blank slate)"],
      	name: "ans"
	  	
	  }
	]).then(function(info){
		if(info.ans == "Take Quiz"){
			testSkip = true;
			tester();
		}
		else if(info.ans == "Add New Questions"){
			append = true;
			blankSlate();	//but not really
		}
		else if(info.ans == "Create New Questions(blank slate)"){
			blankSlate();
		}
	});
}


function initialLoad() {
	process.stdout.write('\033c');
    console.log(" 	 			_______________________________");
    console.log("				                               ");
    console.log("				       Welcome to  the         ");
    console.log("				      Flashcard Generator      ");
    console.log("				     created by Mike Russo     ");
    console.log(" 	 			_______________________________");
    setTimeout(function(){ 
    	 start();
    }, 3000);
    
}

initialLoad();

