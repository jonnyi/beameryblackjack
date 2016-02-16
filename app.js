
var theDeck = [];
var thePlayers = [];



/**
 * Initiates game
 */
function startNewGame(){
	resetGame();
	createPlayers();
	shuffleDeck();
	dealCards();
	for (var i = 0; i < thePlayers.length; i++){
		playersTurn(thePlayers[i]);
	}	
	resultHandler();
}

/**
 * Populates global players array with player objects and generates player sections of html on the plage, number of player is taken from input on the 
 * page, plus and extra player for the dealer.
 */
function createPlayers(){
	var playerContainer = document.getElementById("player_container");
	var numOfPlayer = document.getElementById("numberOfPlayers").value; 
	for (var i = 1; i <= numOfPlayer; i++){
		thePlayers.push({player_id: i, playerName : 'Player ' + i, handArr : [], isDealer : false, isBust : false, finalScore : 0});
		playerContainer.insertAdjacentHTML('beforeend', "<div class='player' id='player_" + i + "'><h2 id='player_" + i +"_title'>Player " + i + "</h2> <div id='result_text_" + i + "'></div><div class='card_container' id='cards_" + i + "'></div></div>");
	}
	thePlayers.push({player_id: i,playerName : 'The Dealer', handArr : [], isDealer : true, isBust : false, finalScore : 0});
	numOfPlayer++;
	playerContainer.insertAdjacentHTML('beforeend', "<div class='player' id='player_" + numOfPlayer + "'><h2 id='player_" + i +"_title'>Dealer</h2> <div id='result_text_" + numOfPlayer + "'></div><div class='card_container' id='cards_" + numOfPlayer + "'></div><div id='dealers_final_score'></div>");	
}

/**
 * Populates global deck object with 52 card objects. Cards objects created through nested loops for rank and suit then randomised
 */
function shuffleDeck(){
	var newDeck = [];
	var rank = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
	var suit = ["Heart", "Club", "Diamond", "Spade"];
	for (var i = 0; i < rank.length; i++){
		var curRank = rank[i];
		for (var j = 0; j < suit.length; j++){
			var curSuit = suit[j];
			newDeck.push({rank : curRank, suit : curSuit});
		}
	}
	for (var i = 0; i < newDeck.length; i++){
	        var j = Math.floor(Math.random() * (i + 1));
			var tempArray = newDeck[i];
			newDeck[i] = newDeck[j];
			newDeck[j] = tempArray;
	}
	theDeck = newDeck;
}

/**
 * Function removed card object from the deck array and passes the value into the handArr of each player, each player is assigned one card at a time in turn
 * so the outer loop is required. HTML for each card object added to the players section on the page, dealers last card is rendered with hidden class
 */
function dealCards(){
	for (var j = 0; j < 2; j++){
		for (var i = 0; i < thePlayers.length; i++){
			var newCardObj = theDeck.shift();
			var newCardHTML = "<div class='card'><span>" + newCardObj.rank + "</span><span class='suit symbol_" + newCardObj.suit + "'></span><span>" + newCardObj.rank + "</span></div>"
			var newCardHTMLHidden = "<div id='blindCard' class='card hidden'><span>" + newCardObj.rank + "</span><span class='suit symbol_" + newCardObj.suit + "'></span><span>" + newCardObj.rank + "</span></div>"
			var playerCardDiv = document.getElementById("cards_" + (i+1));
			thePlayers[i].handArr.push(newCardObj);
			if(j == 1 && i == (thePlayers.length - 1)){
				playerCardDiv.insertAdjacentHTML('beforeend', newCardHTMLHidden);	//dealers last card should be hidden
			} else {
				playerCardDiv.insertAdjacentHTML('beforeend', newCardHTML);			
			}
		}
	}
}

/**
 * Function will be executed for each player in turn per round, function will offer player option to hit or stick if they are elegable of mark them as
 bust is total score is over 21, as user 'hits' additional cards objects are passed to the arrHand and HTML will render new card. On dealers turn these
 steps are taken automatically based on dealers score.
 * @param {playerObject} Player object 
 * @return
 */
function playersTurn(playerObject){
	var playersCurrentTotal = getPlayerTotal(playerObject);
	var playersTitle = document.getElementById("player_" + playerObject.player_id +"_title");
	messageHandler(playerObject.playerName + "'s turn, current score is " + playersCurrentTotal);	
	if(playersCurrentTotal[0] < 21){//Normal hand
		if(playerObject.isDealer == false){//Player
			if (confirm("Do you want to hit?") == true) {//HIT
	    	    var newCardObj = theDeck.shift();
	    	    var newCardHTML = "<div class='card'><span>" + newCardObj.rank + "</span><span class='suit symbol_" + newCardObj.suit + "'></span><span>" + newCardObj.rank + "</span></div>"
	    	    var playerCardDiv = document.getElementById("cards_" + playerObject.player_id);
	    	    playerObject.handArr.push(newCardObj);
	    	    playerCardDiv.insertAdjacentHTML('beforeend', newCardHTML);
	    	    playersCurrentTotal = playersTurn(playerObject);

	    	} else {
	    		playerObject.finalScore = playersCurrentTotal;
	    		return;
	    	}
    	} else {
    		if (playersCurrentTotal[0] <= 16){
	    	    var newCardObj = theDeck.shift();
	    	    var newCardHTML = "<div class='card'><span>" + newCardObj.rank + "</span><span class='suit symbol_" + newCardObj.suit + "'></span><span>" + newCardObj.rank + "</span></div>"
	    	    var playerCardDiv = document.getElementById("cards_" + playerObject.player_id);
	    	    playerObject.handArr.push(newCardObj);
	    	    playerCardDiv.insertAdjacentHTML('beforeend', newCardHTML);
	    	    playersCurrentTotal = playersTurn(playerObject);
    		} else {
    			playerObject.finalScore = playersCurrentTotal;
	    		return;    			
    		}
    	}
    } else if (playersCurrentTotal[0] > 21){
		messageHandler(playerObject.playerName + " you are bust!");
		playersTitle.insertAdjacentHTML('beforeend', "<span class='bust'>&#x2716; Bust</span>");
		playerObject.isBust = true;
    	playerObject.finalScore = [0];
    	return;
	} else {
		messageHandler("You got 21!");
		playerObject.finalScore = playersCurrentTotal;
		return;
	}
}

/*
* Given a player object function will determine players current score and assign it to the current score attribute of the player as array, array is
* required as when a ace is drawn multiple score options are available.
 * @param {playerObject} Player object 
 * @return {currentTotalOptions} array of possible scores
*/
function getPlayerTotal(playerObject){
	var currentTotalOptions = [];
	var currentTotal = 0;
	var containsAce = false;
	var aceCount = 0;
	for(var i = 0; i < playerObject.handArr.length; i++) {
        playerObject.handArr[i].rank === "A" && aceCount++;
	    if (aceCount == 2){
	    	currentTotalOptions.push(2);
	    	currentTotalOptions.push(12);
    		return currentTotalOptions;
	    } else if (aceCount == 1){
	    	containsAce = true;
	    }       
    }
	for(var j = 0; j < playerObject.handArr.length; j++){
		var rank = playerObject.handArr[j].rank;
		var currentCardValue = 0;
		if (rank != "A"){
			currentCardValue = (typeof rank == "string" ? 10 : rank);
		}
		currentTotal = currentTotal + currentCardValue;
	}
	if(containsAce){
		currentTotalOptions.push(currentTotal + 1);
		(currentTotal + 11) <= 21 && currentTotalOptions.push(currentTotal + 11);
	} else {
		currentTotalOptions.push(currentTotal);
	}
	return 	currentTotalOptions;
}

/*
* After each player has had a turn funtion will evaluate the final results of the round and mark against each player object
*/
function resultHandler(){
	var dealerScore = thePlayers[(thePlayers.length - 1)].finalScore.pop();
	var dealerScoreDiv = document.getElementById("dealers_final_score");
	document.getElementById("blindCard").className = "card";
	for (var i = 0; i < (thePlayers.length - 1); i++){
		var playerScore = thePlayers[i].finalScore.pop();
		var playersTitle = document.getElementById("player_" + thePlayers[i].player_id +"_title");
		if(playerScore > dealerScore){
			playersTitle.insertAdjacentHTML('beforeend', "<span class='win'>&#x2605; Winner</span>");
		} else if (playerScore < dealerScore && thePlayers[i].isBust == false) {
			playersTitle.insertAdjacentHTML('beforeend', "<span class='bust'>&#x2716;Lost</span>");
		} else if (dealerScore == playerScore && thePlayers[i].isBust == false){
			playersTitle.insertAdjacentHTML('beforeend', "<span class='Tied'>Tied with dealer</span>");
		}
	}
	dealerScoreDiv.insertAdjacentHTML('beforeend', "Dealer scored: " + dealerScore);
	messageHandler("Round is over, click Start to play again");
}
/*
* Funtion will update the information section at top of the page with message that is passed to it.
 * @param {String} Message to display
*/
function messageHandler(message){
	document.getElementById("playermessage").innerHTML = message;
}

/*
* Funciton resets global variables and dom so multiple rounds can be played
*/
function resetGame(){
	theDeck = [];
	thePlayers = [];
	document.getElementById("player_container").innerHTML = "";
}







