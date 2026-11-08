// Factory function to make player objects
function Player(name, marker) {
	let winningStreak = 0;
	let overallScore = 0;
	const incrementWinningStreak = function () {
		winningStreak++;
	};
	const resetWinningStreak = function () {
		winningStreak = 0;
	};
	const getWinningStreak = function () {
		return winningStreak;
	};
	const incrementOverallScore = function () {
		return overallScore++;
	};
	const getOverallScore = function () {
		return overallScore;
	};
	return {
		name,
		marker,
		incrementWinningStreak,
		getWinningStreak,
		resetWinningStreak,
		incrementOverallScore,
		getOverallScore,
	};
}

const gameBoard = (function () {
	console.log("gameBoard called");
	// Game board function to keep track of game state and on reset on the end

	const row1 = new Array(3);
	const row2 = new Array(3);
	const row3 = new Array(3);
	const boardArray = [row1, row2, row3];

	const player1 = Player("Player 1", "X");
	const player2 = Player("Player 2", "O");

	const getPlayer1 = function () {
		functionCalled(getPlayer1, "gameBoard");
		return player1;
	};
	const getPlayer2 = function () {
		functionCalled(getPlayer2, "gameBoard");
		return player2;
	};

	const getBoardArray = function () {
		functionCalled(getBoardArray, "gameBoard");
		console.log(boardArray[0], boardArray[1], boardArray[2]);
	};

	let moveNumber = 0;
	// let roundResult = "";
	let lastTurnPlayer = player2.name;
	const playTurn = function (boardRow, boardCell) {
		functionCalled(playTurn, "gameBoard");
		// Checking who played last turn, game always starts from player1 for first time only.
		// After each round the first move will be for player who lost the last round. Because
		// we are not resetting the lastTurnPlayer variable once game starts, it always flips
		// at the end of each turn of player.
		let currentTurnPlayer =
			lastTurnPlayer === player1.name ? player2 : player1;

		// To display the game status or messages after each move
		let isMoveAllowed = true;
		let statusMessages = { challengeResult: {}, roundResult: {} }; // Initializing these two because they will have objects inside objects
		// let challengeResult = "";
		let isDraw = false;

		incrementMoveNum();

		// Only send round info when challenge is set
		if (streakTracker.getIsChallengeSet()) {
			statusMessages.roundInfo = `Round: ${streakTracker.getCurrentRound()}`;
		}

		// Making player move
		const currentCellValue = boardArray[boardRow - 1][boardCell - 1];
		// Checking if cell is already taken or not
		if (currentCellValue === "X" || currentCellValue === "O") {
			isMoveAllowed = false;
			statusMessages.push(
				`Move not allowed, already placed ${currentCellValue} here.`,
			);
		} else {
			boardArray[boardRow - 1][boardCell - 1] = currentTurnPlayer.marker;

			// Checking if we have a winner yet?
			// roundResult = checkWinner(currentTurnPlayer);
			if (checkWinner(currentTurnPlayer) !== false) {
				// If yes, increment round count, reset moveNumber, reset the boardArray
				statusMessages.roundResult.announc = "We have a Winner!";
				[
					statusMessages.roundResult.winner,
					statusMessages.roundResult.streakPlayer,
					statusMessages.roundResult.streakResult,
				] = checkWinner(currentTurnPlayer); // Array destructuring assignment

				statusMessages.roundOverInfo = `${resetBoard()}`; // This is round-over like game-over, calling it before incrementing the round

				// check if challenge is set and then only check if it ends, if yes get the results
				if (streakTracker.getIsChallengeSet()) {
					if (streakTracker.isChallengeEnded()) {
						[
							statusMessages.challengeResult.heading,
							statusMessages.challengeResult.text,
						] = streakTracker.getChallengeResult(); // If challenge rounds also end, get the results.

						streakTracker.resetRoundCount();
					} else {
						streakTracker.updateRoundCount(); // only increment the rounds count if still rounds remaining in ste challenge
					}
				}

				moveNumber = 0;
			} else if (
				checkWinner(currentTurnPlayer) === false &&
				moveNumber === 9
			) {
				isDraw = true;

				// If we don't have a winner and this is last move,
				// call it a draw, and reset the rounds count
				statusMessages.roundResult.announc = "We have a draw here!";
				statusMessages.roundOverInfo = `${resetBoard()}`;
			}

			// Setting lastTurnPlayer variable for next turn, and updating round
			lastTurnPlayer = currentTurnPlayer.name;

			let nextPlayer =
				currentTurnPlayer.name === player1.name
					? player2.name
					: player1.name;
			statusMessages.nextPlayer = `${nextPlayer}, take your turn`;
		}

		return [
			isMoveAllowed,
			currentTurnPlayer.name,
			currentTurnPlayer.marker,
			// roundResult,
			moveNumber,
			statusMessages,
			// challengeResult,
			isDraw,
		];
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
		functionCalled(checkWinner, "gameBoard");
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
		for (const combination of winningCombinations) {
			// Check if at any combination we have a true value
			if (combination === true) {
				player.incrementOverallScore();
				let winnerMessage = `${player.name} with marker '${player.marker}' have won the round.`;
				let [streakPlayer, streakResult] =
					streakTracker.updateWinningPlayer(player);
				return [winnerMessage, streakPlayer, streakResult];
			}
		}
		return false; // If every member is false return false from this method
	};

	const resetBoard = function () {
		functionCalled(resetBoard, "gameBoard");
		for (const row of boardArray) {
			for (let i = 0; i < row.length; i++) {
				delete row[i];
			}
		}
		return `Round ${streakTracker.getCurrentRound()} Over`;
	};

	return {
		getPlayer1,
		getPlayer2,
		playTurn,
		getBoardArray,
		resetBoard,
		functionCalled,
	};
})();

//
const streakTracker = (function () {
	// Setting up the streak tracking section
	let bestOf = 1;
	let isChallengeSet = false;
	let roundsCount = 1;
	let lastRoundWinner = "";

	const setBestOf = function (rounds = 1) {
		gameBoard.functionCalled(setBestOf, "streakTracker");
		// It sets the rounds for bestOf challenge, and also resets the
		// current running streaks of both players
		isChallengeSet = true;
		bestOf = rounds;
		console.log(
			`Best of: ${rounds} round(s).`,
			"isChallengeSet",
			getIsChallengeSet(),
		);

		gameBoard.getPlayer1().resetWinningStreak();
		gameBoard.getPlayer2().resetWinningStreak();

		return `Best of ${rounds}`;
	};
	const getIsChallengeSet = function () {
		return isChallengeSet;
	};

	const updateRoundCount = function () {
		gameBoard.functionCalled(updateRoundCount, "streakTracker");
		roundsCount++;
	};

	const resetRoundCount = function () {
		gameBoard.functionCalled(resetRoundCount, "streakTracker");
		roundsCount = 1;
	};

	const isChallengeEnded = function () {
		gameBoard.functionCalled(isChallengeEnded, "streakTracker");

		console.log(getIsChallengeSet(), bestOf, roundsCount);
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
		gameBoard.functionCalled(getChallengeResult, "streakTracker");
		// If bestOf challenge is on, and its the end of last round, announce
		// result and reset both variables, bestOf and roundCount

		const player1 = gameBoard.getPlayer1();
		const player2 = gameBoard.getPlayer2();

		const p1Streak = gameBoard.getPlayer1().getWinningStreak();
		const p2Streak = gameBoard.getPlayer2().getWinningStreak();

		if (p1Streak === p2Streak) {
			heading = "Challenge resulted is a draw";
			result = `Both ${player1.name} & ${player2.name} have won ${p1Streak} ${p1Streak == 1 ? "round" : rounds}.`;
		} else if (p1Streak > p2Streak) {
			heading = `${player1.name} have won the Challenge`;
			result = `Score: ${p1Streak} - ${p2Streak}`;
		} else {
			heading = `${player2.name} have won the Challenge`;
			result = `Score: ${p2Streak} - ${p1Streak}`;
		}
		bestOf = 1; // Not calling the method setBestOf() here, because it will also rest the streak of players if they want to play without setting bestOf challenge
		roundsCount = 1;

		return [heading, result];
	};

	const getCurrentRound = function () {
		gameBoard.functionCalled(getCurrentRound, "streakTracker");
		return roundsCount;
	};

	const updateWinningPlayer = function (player) {
		gameBoard.functionCalled(updateWinningPlayer, "streakTracker");
		// Checking if streak should continue or should be reset
		if (lastRoundWinner !== player.name) player.resetWinningStreak(); // Resetting the player of last round winner streak to 0.

		// In any case winner streak should increment because this method
		// was called when game detected a winner.
		player.incrementWinningStreak();

		const streakPlayer = `Winning Player: ${player.name}`;
		const streakResult = `Streak: ${player.getWinningStreak()} Rounds`;

		// Setting new lastRoundWinner for next time
		lastRoundWinner = player.name;

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

			const [
				isMoveAllowed,
				currentTurnPlayerName,
				currentTurnPlayerMarker,
				// roundResult,
				moveNumber,
				statusMessages,
				// challengeResult,
				isDraw,
			] = gameBoard.playTurn(rowNum, cellNum);

			console.table(statusMessages);
			newGameBtn.disabled = false; // Enabling the new game button, if disabled

			if (isMoveAllowed) {
				e.target.textContent = currentTurnPlayerMarker;
			}

			// Only displaying rounds info of we have a challenge going-on
			if (streakTracker.getIsChallengeSet()) {
				dispRndInfo.textContent = statusMessages.roundInfo;
				dispRndInfo.textContent = statusMessages.roundOverInfo;
			}

			// Setting the text of newGame button depending if challenge is On or not, Keeping it separate from above is better
			newGameBtn.textContent = streakTracker.getIsChallengeSet()
				? "Restart round"
				: "New game";

			dispChlResHead.textContent = statusMessages.challengeResult.heading;
			dispChlResText.textContent = statusMessages.challengeResult.text;
			dispNextPlayer.textContent = statusMessages.nextPlayer;

			// Checking if we have result of round yet or not?
			if (statusMessages.roundResult.announc !== undefined) {
				pauseGame();

				dispRndResAn.textContent = statusMessages.roundResult.announc;
				dispRndResWin.textContent = statusMessages.roundResult.winner;
				dispRndResStrP.textContent =
					statusMessages.roundResult.streakPlayer;
				dispRndResStrR.textContent =
					statusMessages.roundResult.streakResult;

				p1ScoreDisplay.textContent =
					"Overall Score: " +
					gameBoard.getPlayer1().getOverallScore();
				p2ScoreDisplay.textContent =
					"Overall Score: " +
					gameBoard.getPlayer2().getOverallScore();
			}

			if (isDraw) pauseGame();
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
