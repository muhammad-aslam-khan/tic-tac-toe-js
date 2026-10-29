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
	// Game board function to keep track of game state and on reset on the end

	const row1 = new Array(3);
	const row2 = new Array(3);
	const row3 = new Array(3);
	const boardArray = [row1, row2, row3];

	const player1 = Player("Player 1", "X");
	const player2 = Player("Player 2", "O");

	const getPlayer1 = function () {
		return player1;
	};
	const getPlayer2 = function () {
		return player2;
	};

	const getBoardArray = function () {
		console.log(boardArray);
	};

	let moveNumber = 0;
	let roundResult = "";
	let lastTurnPlayer = player2.name;
	const playTurn = function (boardRow, boardCell) {
		// Checking who played last turn, game always starts from player1 for first time only.
		// After each round the first move will be for player who lost the last round. Because
		// we are not resetting the lastTurnPlayer variable once game starts, it always flips
		// at the end of each turn of player.
		let currentTurnPlayer =
			lastTurnPlayer === player1.name ? player2 : player1;

		// To display the game status or messages after each move
		let isMoveAllowed = true;
		let statusMessages = [];
		let challengeResult = "";

		incrementMoveNum();

		// If First move of the round, log the round Number too
		if (moveNumber === 1) {
			// console.log(moveNumber);
			statusMessages.push(
				`Round start: ${streakTracker.getCurrentRound()}`,
			);
		}

		// statusMessages.push(`Move Number: ${moveNumber} by ${currentTurnPlayer.name}`);

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
			roundResult = checkWinner(currentTurnPlayer);
			if (roundResult) {
				// If yes, increment round count, reset moveNumber,
				// check if challenge ends reset the boardArray
				statusMessages.push(resetBoard()); // This is round-over like game-over, calling it before incrementing the round
				statusMessages.push(streakTracker.updateRoundCount());
				if (streakTracker.checkChallengeEnd() === true) {
					challengeResult = streakTracker.getChallengeResult(); // If challenge rounds also end, get the results.
				}
				moveNumber = 0;
			} else if (roundResult === false && moveNumber === 9) {
				// If we don't have a winner and this is last move,
				// call it a draw, and reset the rounds count
				statusMessages.push("We have a draw here!");
				statusMessages.push(resetBoard());
				streakTracker.resetRoundCount();
			}

			// Setting lastTurnPlayer variable for next turn, and updating round
			lastTurnPlayer = currentTurnPlayer.name;

			let nextPlayer =
				currentTurnPlayer.name === player1.name
					? player2.name
					: player1.name;
			statusMessages.push(`${nextPlayer}, take your turn`);
		}
		return [
			isMoveAllowed,
			currentTurnPlayer.name,
			currentTurnPlayer.marker,
			roundResult,
			moveNumber,
			statusMessages,
			challengeResult,
		];
	};
	const incrementMoveNum = function () {
		moveNumber++;
	};

	const checkWinner = function (player) {
		// Initializing 3 member arrays of 8 winning patterns from grid
		const winningCombinations = [
			[row1[0], row1[1], row1[2]],
			[row2[0], row2[1], row2[2]],
			[row3[0], row3[1], row3[2]],
			[row1[0], row2[0], row3[0]],
			[row1[1], row2[1], row3[1]],
			[row1[2], row2[2], row3[2]],
			[row1[0], row2[1], row3[2]],
			[row1[2], row2[1], row3[0]],
		];
		for (const combination of winningCombinations) {
			let markers = []; // One by one populating this array with markers at identified positions
			for (let i = 0; i < combination.length; i++) {
				markers.push(combination[i]);
			}
			// console.log(markers);
			// Checking if all array markers are same or not
			if (
				markers[0] !== undefined &&
				markers[0] === markers[1] &&
				markers[1] === markers[2]
			) {
				// console.log(markers);

				// Update the player score in instance of Player's object
				// and update the player streak, if qualifies
				player.incrementOverallScore();
				let winnerMessage = `We have a Winner! \n${player.name} with marker '${player.marker}' have won the round.`;
				let streakStatus = streakTracker.updateWinningPlayer(player);
				return [winnerMessage, streakStatus];
			}
		}
		return false;
	};

	const resetBoard = function () {
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
	};
})();

//
const streakTracker = (function () {
	// Setting up the streak tracking section
	let bestOf = 1;
	let roundsCount = 1;
	let lastRoundWinner = "";

	const setBestOf = function (rounds = 1) {
		// It sets the rounds for bestOf challenge, and also resets the
		// current running streaks of both players
		bestOf = rounds;
		console.log(`Best of: ${rounds} round(s).`);

		gameBoard.getPlayer1().resetWinningStreak();
		gameBoard.getPlayer2().resetWinningStreak();

		return `Best of ${rounds}`;
	};

	const updateRoundCount = function () {
		// only increment the rounds count if still rounds remaining in ste challenge
		if (checkChallengeEnd() === false) {
			roundsCount++;
		}
	};

	const resetRoundCount = function () {
		roundsCount = 1;
	};

	const checkChallengeEnd = function () {
		return bestOf === roundsCount ? true : false;
	};

	const getChallengeResult = function () {
		// If bestOf challenge is on, and its the end of last round, announce
		// result and reset both variables, bestOf and roundCount

		const player1 = gameBoard.getPlayer1();
		const player2 = gameBoard.getPlayer2();

		const p1Streak = gameBoard.getPlayer1().getWinningStreak();
		const p2Streak = gameBoard.getPlayer2().getWinningStreak();

		if (p1Streak === p2Streak) {
			result = `Tournament Complete \nIt's a draw \nBoth ${player1.name} & ${player2.name} have won ${p1Streak} ${p1Streak == 1 ? "round" : rounds} each.`;
		} else if (p1Streak > p2Streak) {
			result = `Tournament Complete \n${player1.name} have won tournament by ${p1Streak} - ${p2Streak}`;
		} else {
			result = `Tournament Complete \n${player2.name} have won tournament by ${p2Streak} - ${p1Streak}`;
		}
		bestOf = 1; // Not calling the method setBestOf() here, because it will also rest the streak of players if they want to play without setting bestOf challenge
		roundsCount = 1;

		return result;
	};

	const getCurrentRound = function () {
		return roundsCount;
	};

	const updateWinningPlayer = function (player) {
		// Checking if streak should continue or should be reset
		if (lastRoundWinner !== player.name) {
			player.resetWinningStreak(); // Resetting the player of last round winner streak to 0.
		}

		// In any case winner streak should increment because this method
		// was called when game detected a winner.
		player.incrementWinningStreak();

		// Setting new lastRoundWinner for next time
		lastRoundWinner = player.name;

		return `Winning Player: ${player.name}, Winning Streak: ${player.getWinningStreak()}`;
	};

	return {
		setBestOf,
		getCurrentRound,
		updateRoundCount,
		resetRoundCount,
		updateWinningPlayer,
		checkChallengeEnd,
		getChallengeResult,
	};
})();

const displayGame = (function () {
	const gameButtons = document.getElementsByClassName("game-btn");

	for (const btn of gameButtons) {
		btn.addEventListener("click", (e) => {
			const [rowNum, cellNum] = [
				e.target.dataset.row,
				e.target.dataset.cell,
			];

			// References of 'scores' sections divs
			const dispStatusMessages =
				document.getElementById("status-messages");
			const displayRound = document.getElementById("display-round");
			const dispRoundResult = document.getElementById("round-result");
			const dispStreakStatus = document.getElementById("display-streak");
			const dispChallengeRes =
				document.getElementById("challenge-result");

			const [
				isMoveAllowed,
				currentTurnPlayerName,
				currentTurnPlayerMarker,
				roundResult,
				moveNumber,
				statusMessages,
				challengeResult,
			] = gameBoard.playTurn(rowNum, cellNum);

			if (isMoveAllowed) {
				e.target.textContent = currentTurnPlayerMarker;
			}

			displayRound.textContent =
				"Round - " + streakTracker.getCurrentRound();
			dispStatusMessages.innerHTML = statusMessages.join(`<br/>`);
			dispChallengeRes.textContent = challengeResult;

			if (roundResult) {
				const [winnerMessage, streakStatus] = roundResult;
				dispRoundResult.textContent = winnerMessage;
				dispStreakStatus.textContent = streakStatus;
			}
		});
	}
})();

// streakTracker.setBestOf(3);

// gameBoard.getBoardArray();
// const player1 = gameBoard.getPlayer1();
// const player2 = gameBoard.getPlayer2();

// // Round-1
// gameBoard.playTurn(3, 1);
// gameBoard.playTurn(2, 1);
// gameBoard.playTurn(3, 2);
// gameBoard.playTurn(2, 2);
// gameBoard.playTurn(3, 3);
// gameBoard.playTurn(1, 1);
// gameBoard.playTurn(2, 3);

// // Round-2
// gameBoard.resetBoard();
// gameBoard.playTurn(1, 2);
// gameBoard.playTurn(3, 1);
// gameBoard.playTurn(2, 2);
// gameBoard.playTurn(3, 2);
// gameBoard.playTurn(3, 3);
// gameBoard.playTurn(2, 1);
// gameBoard.playTurn(1, 3);
// gameBoard.playTurn(1, 1);

// // Round-3
// gameBoard.resetBoard();
// gameBoard.playTurn(1, 2);
// gameBoard.playTurn(3, 1);
// gameBoard.playTurn(2, 2);
// gameBoard.playTurn(3, 2);
// gameBoard.playTurn(3, 3);
// gameBoard.playTurn(2, 1);
// gameBoard.playTurn(1, 3);
// gameBoard.playTurn(1, 1);
