// Factory function to make player objects
function Player(givenId, givenName, givenMarker) {
	let playerName = givenName;
	let playerMarker = givenMarker;
	let winningStreak = 0;
	let overallScore = 0;

	const getId = () => givenId;
	const getName = () => playerName;
	const getMarker = () => playerMarker;
	const incrementWinningStreak = () => winningStreak++;
	const resetWinningStreak = () => (winningStreak = 0);
	const getWinningStreak = () => winningStreak;
	const incrementOverallScore = () => overallScore++;
	const getOverallScore = () => overallScore;
	const updateName = (name) => (playerName = name);
	const updateMarker = (marker) => (playerMarker = marker);

	return {
		getId,
		getName,
		getMarker,
		incrementWinningStreak,
		resetWinningStreak,
		getWinningStreak,
		incrementOverallScore,
		getOverallScore,
		updateName,
		updateMarker,
	};
}

const gameBoard = (function () {
	console.log("gameBoard called");
	// Game board function to keep track of game state and on reset on the end

	const row1 = new Array(3);
	const row2 = new Array(3);
	const row3 = new Array(3);
	const boardArray = [row1, row2, row3];

	const getBoardArray = () => boardArray;

	const updateBoardArray = (row, cell, marker) =>
		(boardArray[row - 1][cell - 1] = marker);

	const resetBoard = function () {
		for (const row of boardArray) {
			for (let i = 0; i < row.length; i++) {
				delete row[i];
			}
		}
		return `Round ${streakTracker.getCurrentRound()} Over`;
	};

	return {
		getBoardArray,
		updateBoardArray,
		resetBoard,
	};
})();

const gameController = (function () {
	// Initializing the players
	const player1 = Player("player-1", "Player 1", "X");
	const player2 = Player("player-2", "Player 2", "O");

	let moveNumber = 0;
	let lastTurnPlayer = player2.getId();

	const playTurn = function (row, cell) {
		// Checking who played last turn, game always starts from player1 for first time only.
		// After each round the first move will be for player who lost the last round. Because
		// we are not resetting the lastTurnPlayer variable once game starts, it always flips
		// at the end of each turn of player.
		let currentTurnPlayer =
			lastTurnPlayer === player1.getId() ? player2 : player1;

		// To display the game status or messages after each move
		let statusMessages = { challengeResult: {}, roundResult: {} }; // Initializing these two because they will have objects inside objects
		let isDraw = false;
		let moveAllowed = true;

		// Only send round info when challenge is set
		if (streakTracker.getIsChallengeSet()) {
			statusMessages.roundInfo = `Round: ${streakTracker.getCurrentRound()}`;
		}

		if (isMoveAllowed(row, cell)) {
			makeMove(row, cell, currentTurnPlayer.getMarker());

			// getting result of round after making move
			const moveResult = checkWinner(currentTurnPlayer);

			incrementMoveNum();

			// Move allowed but game ends or continues, we should flip the player for next turn
			// Setting lastTurnPlayer variable for next turn, and updating round
			lastTurnPlayer = currentTurnPlayer.getId();

			let nextPlayer =
				currentTurnPlayer.getId() === player1.getId()
					? player2.getName()
					: player1.getName();
			statusMessages.nextPlayer = `Next Player: ${nextPlayer}`;

			if (checkIsDraw(moveResult, moveNumber) === true) {
				// CONDITION-1 Checking Draw?
				// If we don't have a winner and this is last move,
				// call it a draw, and reset the rounds count
				isDraw = true;

				statusMessages.roundResult.announc = "We have a draw here!";
				statusMessages.roundOverInfo = `${gameBoard.resetBoard()}`;
			} else if (moveResult !== false) {
				// CONDITION-2 Have Winner Yet?
				// If yes, get round result, then check if challenge ends, then reset moveNumber
				statusMessages.roundResult.announc = "We have a Winner!";
				[
					statusMessages.roundResult.winner,
					statusMessages.roundResult.streakPlayer,
					statusMessages.roundResult.streakResult,
				] = moveResult; // Array destructuring assignment

				statusMessages.roundOverInfo = `${gameBoard.resetBoard()}`; // This is round-over like game-over, calling it before incrementing the round
			}

			// Still inside allowed move block, Checking if Draw or Have Winner Yet,
			// if Yes, 1- resetting the move number, 2- checking if challenge is set
			// to update round, & 3-get results
			if (
				checkIsDraw(moveResult, moveNumber) === true ||
				moveResult !== false
			) {
				moveNumber = 0;

				// First check if challenge ended , if yes reset rounds and get the result,
				// if not just update the rounds count.
				if (streakTracker.isChallengeEnded()) {
					streakTracker.resetRoundCount();

					[
						statusMessages.challengeResult.heading,
						statusMessages.challengeResult.text,
					] = streakTracker.getChallengeResult();
				} else if (streakTracker.getIsChallengeSet()) {
					streakTracker.updateRoundCount(); // only increment the rounds count if still rounds remaining in the challenge
				}
			}
		} else {
			moveAllowed = false;
			statusMessages.notAllowed = `Not allowed, already placed ${currentCellValue} here.`;
		}

		const getIsDraw = () => isDraw;
		const getStatusMsgsObj = () => statusMessages;
		const getIsMoveAllowed = () => moveAllowed;

		return {
			getIsMoveAllowed,
			currentTurnPlayer,
			getStatusMsgsObj,
			getIsDraw,
		};
	};

	const isMoveAllowed = function (row, cell) {
		// Checking if cell is already taken or not
		const currentCellValue = gameBoard.getBoardArray()[row - 1][cell - 1];
		if (currentCellValue === "X" || currentCellValue === "O") {
			return false;
		} else {
			return true;
		}
	};

	const makeMove = function (row, cell, marker) {
		gameBoard.updateBoardArray(row, cell, marker);
	};

	const checkIsDraw = function (moveResult, moveNumber) {
		return moveResult === false && moveNumber === 9 ? true : false;
	};

	let sequence = 1;
	const functionCalled = function (fun, from = "") {
		console.log(sequence, fun.name, "called from", from);
		sequence++;
	};

	const incrementMoveNum = function () {
		functionCalled(incrementMoveNum, "gameBoard");
		moveNumber++;
	};

	const checkWinner = function (player) {
		[row1, row2, row3] = gameBoard.getBoardArray();
		// Initializing 3 member arrays of 8 winning patterns from grid
		const winningCombinations = [
			row1[0] !== undefined && row1[0] === row1[1] && row1[0] === row1[2],
			row2[0] !== undefined && row2[0] === row2[1] && row2[0] === row2[2],
			row3[0] !== undefined && row3[0] === row3[1] && row3[0] === row3[2],
			row1[0] !== undefined && row1[0] === row2[0] && row1[0] === row3[0],
			row1[1] !== undefined && row1[1] === row2[1] && row1[1] === row3[1],
			row1[2] !== undefined && row1[2] === row2[2] && row1[2] === row3[2],
			row1[0] !== undefined && row1[0] === row2[1] && row1[0] === row3[2],
			row1[2] !== undefined && row1[2] === row2[1] && row1[2] === row3[0],
		];

		console.log(row3[0], row3[1], row3[2]);
		for (const combination of winningCombinations) {
			// Check if at any combination we have a true value
			// console.log("HEre", combination);
			if (combination === true) {
				player.incrementOverallScore();
				let winnerMessage = `${player.getName()} with marker '${player.getMarker()}' have won the round.`;
				let [streakPlayer, streakResult] =
					streakTracker.updateWinningPlayer(player);
				return [winnerMessage, streakPlayer, streakResult];
			}
		}
		return false; // If every member is false return false from this method
	};

	return { playTurn, player1, player2 };
})();

const streakTracker = (function () {
	// Setting up the streak tracking section
	let bestOf = 1;
	let isChallengeSet = false;
	let roundsCount = 1;
	let lastRoundWinner = "";

	const setBestOf = function (rounds = 1) {
		// gameBoard.functionCalled(setBestOf, "streakTracker");
		// It sets the rounds for bestOf challenge, and also resets the
		// current running streaks of both players
		isChallengeSet = true;
		bestOf = rounds;
		console.log(
			`Best of: ${rounds} round(s).`,
			"isChallengeSet",
			getIsChallengeSet(),
		);

		gameController.player1.resetWinningStreak();
		gameController.player2.resetWinningStreak();

		return `Best of ${rounds}`;
	};
	const getIsChallengeSet = () => isChallengeSet;
	const updateRoundCount = () => roundsCount++;
	const resetRoundCount = () => (roundsCount = 1);

	const isChallengeEnded = function () {
		console.log(
			"getIsChallengeSet()",
			getIsChallengeSet(),
			"| bestOf",
			bestOf,
			"| roundsCount",
			roundsCount,
		);
		if (getIsChallengeSet()) {
			if (bestOf == roundsCount) {
				isChallengeSet = false;
				return true;
			} else {
				return false;
			}
		}
	};

	const getChallengeResult = function () {
		// If bestOf challenge is on, and its the end of last round, announce
		// result and reset both variables, bestOf and roundCount

		const player1 = gameController.player1;
		const player2 = gameController.player2;

		const p1Streak = player1.getWinningStreak();
		const p2Streak = player2.getWinningStreak();

		if (p1Streak === p2Streak) {
			heading = "Challenge resulted is a draw";
			result = `Both ${player1.getName()} & ${player2.getName()} have won ${p1Streak} ${p1Streak == 1 ? "round" : rounds}.`;
		} else if (p1Streak > p2Streak) {
			heading = `${player1.getName()} have won the Challenge`;
			result = `Score: ${p1Streak} - ${p2Streak}`;
		} else {
			heading = `${player2.getName()} have won the Challenge`;
			result = `Score: ${p2Streak} - ${p1Streak}`;
		}
		bestOf = 1; // Not calling the method setBestOf() here, because it will also rest the streak of players if they want to play without setting bestOf challenge
		roundsCount = 1;

		return [heading, result];
	};

	const getCurrentRound = () => roundsCount;

	const updateWinningPlayer = function (player) {
		// Checking if streak should continue or should be reset
		if (lastRoundWinner !== player.getName()) player.resetWinningStreak(); // Resetting the player of last round winner streak to 0.

		// In any case winner streak should increment because this method
		// was called when game detected a winner.
		player.incrementWinningStreak();

		const streakPlayer = `Winning Player: ${player.getName()}`;
		const streakResult = `Streak: ${player.getWinningStreak()} Round(s)`;

		// Setting new lastRoundWinner for next time
		lastRoundWinner = player.getName();

		return [streakPlayer, streakResult];
	};

	return {
		setBestOf,
		getCurrentRound,
		updateRoundCount,
		getIsChallengeSet,
		resetRoundCount,
		updateWinningPlayer,
		isChallengeEnded,
		getChallengeResult,
	};
})();

const displayGame = (function () {
	const gameButtons = document.getElementsByClassName("game-btn");
	const newGameBtn = document.getElementById("new-game");
	newGameBtn.textContent = "New game";
	// newGameBtn.disabled = true; // On page load new game btn is disabled
	// Player overall scores
	const p1ScoreDisplay = document.getElementById("p1-overall-score");
	const p2ScoreDisplay = document.getElementById("p2-overall-score");
	// Rounds Challenge
	const roundsSetter = document.getElementById("set-rounds");
	const dispSetRounds = document.getElementById("display-rounds");
	// References of 'scores' sections divs
	const dispRndInfo = document.getElementById("round-info");
	const dispChlResHead = document.getElementById("chlng-res-heading");
	const dispChlResText = document.getElementById("chlng-res-text");
	const dispRndResAn = document.getElementById("round-res-anounc");
	const dispRndResWin = document.getElementById("round-res-winner");
	const dispRndResStrP = document.getElementById("round-res-strPlyr");
	const dispRndResStrR = document.getElementById("round-res-strRes");
	const dispNextPlayer = document.getElementById("next-player");

	for (const btn of gameButtons) {
		btn.addEventListener("click", (e) => {
			const [rowNum, cellNum] = [
				e.target.dataset.row,
				e.target.dataset.cell,
			];

			const {
				getIsMoveAllowed,
				currentTurnPlayer,
				getStatusMsgsObj,
				getIsDraw,
			} = gameController.playTurn(rowNum, cellNum);

			console.table(getStatusMsgsObj());
			newGameBtn.disabled = false; // Enabling the new game button, if disabled

			if (getIsMoveAllowed()) {
				e.target.textContent = currentTurnPlayer.getMarker();
			}

			// Only displaying rounds info of we have a challenge going-on
			if (streakTracker.getIsChallengeSet()) {
				dispRndInfo.textContent = getStatusMsgsObj().roundInfo;
				dispRndInfo.textContent = getStatusMsgsObj().roundOverInfo;
			}

			// Setting the text of newGame button depending if challenge is On or not, Keeping it separate from above is better
			newGameBtn.textContent = streakTracker.getIsChallengeSet()
				? "Restart round"
				: "New game";

			dispChlResHead.textContent =
				getStatusMsgsObj().challengeResult.heading;
			dispChlResText.textContent =
				getStatusMsgsObj().challengeResult.text;
			dispNextPlayer.textContent = getStatusMsgsObj().nextPlayer;

			// Checking if we have result of round yet or not?
			if (getStatusMsgsObj().roundResult.announc !== undefined) {
				pauseGame();

				dispRndResAn.textContent =
					getStatusMsgsObj().roundResult.announc;
				dispRndResWin.textContent =
					getStatusMsgsObj().roundResult.winner;
				dispRndResStrP.textContent =
					getStatusMsgsObj().roundResult.streakPlayer;
				dispRndResStrR.textContent =
					getStatusMsgsObj().roundResult.streakResult;

				p1ScoreDisplay.textContent =
					"Overall Score: " +
					gameController.player1.getOverallScore();
				p2ScoreDisplay.textContent =
					"Overall Score: " +
					gameController.player2.getOverallScore();
			}

			if (getIsDraw()) pauseGame();
		});
	}

	const resetGameDisplay = function () {
		// reset tests from game buttons
		for (const btn of gameButtons) {
			btn.disabled = false;
			btn.textContent = "";
		}
		newGameBtn.disabled = true; // Optional, to disable the new game button once round starts

		// reset the gameBoard Array
		gameBoard.resetBoard();

		// reset the messages
		dispRndInfo.textContent = "";
		dispRndInfo.textContent = "";
		dispChlResHead.textContent = "";
		dispChlResText.textContent = "";
		dispRndResAn.textContent = "";
		dispRndResWin.textContent = "";
		dispRndResStrP.textContent = "";
		dispRndResStrR.textContent = "";

		// Resetting the challengeSetter range input to 1
		if (streakTracker.getIsChallengeSet() === false) {
			roundsSetter.value = 1;
			dispSetRounds.textContent = "";

			// Reset new game btn text
			newGameBtn.textContent = "New game";
		} else if (streakTracker.getIsChallengeSet() === true) {
			newGameBtn.textContent = "Restart Round";
		}
	};
	newGameBtn.addEventListener("click", resetGameDisplay);

	// Sliding the range slider do not invoke andy gameBoard method.
	roundsSetter.addEventListener("input", (e) => {
		if (e.target.value > 1)
			dispSetRounds.textContent = `Best of ${e.target.value}`;
	});
	// Releasing the slider actually invokes methods
	roundsSetter.addEventListener("change", (e) => {
		if (e.target.value > 1) {
			streakTracker.setBestOf(e.target.value);
			gameBoard.resetBoard();
			resetGameDisplay();
		}
	});

	const pauseGame = function () {
		newGameBtn.disabled = false;
		for (const btn of gameButtons) {
			btn.disabled = true;
		}
		console.log(streakTracker.getIsChallengeSet());

		if (streakTracker.getIsChallengeSet() === true) {
			console.log("From Inside", streakTracker.getIsChallengeSet());
			newGameBtn.textContent = "Start Next Round";
			console.log(newGameBtn);
		}
	};
})();

// streakTracker.setBestOf(2);

// // gameBoard.getBoardArray();

// // Round-1
// gameBoard.playTurn(3, 1);
// gameBoard.playTurn(2, 1);
// gameBoard.playTurn(3, 2);
// gameBoard.playTurn(2, 2);
// gameBoard.playTurn(3, 3);

// // Round-2
// gameBoard.playTurn(1, 1);
// gameBoard.playTurn(2, 3);
// gameBoard.playTurn(1, 2);
// gameBoard.playTurn(1, 3);
// gameBoard.playTurn(2, 2);
// gameBoard.playTurn(3, 3);

// // Round-3
// gameBoard.playTurn(1, 3);
// gameBoard.playTurn(2, 2);

// gameBoard.getBoardArray();

// const obj = {
// 	roundResult: {
// 		announc: "We have a Winner!",
// 		winner: "Player 1 with marker 'X' have won the round.",
// 		streakPlayer: "Winning Player: Player 1",
// 		streakResult: "Streak: 2 Rounds",
// 	},
// 	challengeResult: {
// 		heading: "Player 1 have won the Challenge",
// 		text: "Score: 2 - 0",
// 	},
// 	roundInfo: "Round: 2",
// 	roundOverInfo: "Round 2 Over",
// 	nextPlayer: "Player 2, take your turn",
// };
