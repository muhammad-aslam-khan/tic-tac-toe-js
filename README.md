# Tic Tac Toe

A browser-based, two-player Tic Tac Toe game built with HTML, CSS and JavaScript.

The game supports individual rounds as well as multi-round challenges. Players can track their overall scores, winning streaks and challenge results through a simple interactive interface.

## User Guide

### How to Play

1. Open `index.html` in a web browser.
2. Player 1 starts with **X**, and Player 2 uses **O**.
3. Players take turns selecting an empty cell on the 3×3 game board.
4. The first player to complete a horizontal, vertical or diagonal line of three markers wins the round.
5. If all nine cells are filled without a winner, the round ends in a draw.

### Game Options

- **New Game:** Start a new round.
- **Best-of Challenge:** Use the slider to set a challenge of 1 to 5 rounds. A value of 1 represents a normal game without a multi-round challenge.
- **Restart Round:** Restart the current round while keeping the challenge active.

### Scores and Results

The interface displays:

- Overall wins for each player.
- The winner of the current round.
- Consecutive winning rounds (winning streak).
- Current challenge round and final challenge result.

## How It Works

The application is divided into separate modules, each responsible for a particular part of the game.

### 1. Player Management

The `Player` factory function creates player objects.

Each player maintains their own:

- Name and marker.
- Overall score.
- Winning streak.

The player's internal data is accessed and updated through methods provided by the factory.

### 2. Game Board

The `gameBoard` module manages the 3×3 board.

It is responsible for:

- Storing the current board arrangement.
- Updating a cell when a player makes a move.
- Providing the current board state.
- Clearing the board when a round ends or is restarted.

It does not decide whose turn it is or whether a player has won.

### 3. Game Controller

The `gameController` module manages the actual game flow.

It handles:

- Selecting the current player.
- Validating moves.
- Updating the board through `gameBoard`.
- Checking all possible winning combinations.
- Detecting a draw.
- Updating player scores and preparing round results.

This keeps the game rules separate from the board's data management.

### 4. Challenge Tracker

The `streakTracker` module manages multi-round challenges.

It keeps track of:

- The selected challenge length.
- The current round.
- Consecutive round wins.
- The final challenge result.

It also updates the winning streaks of the players when a round is completed.

### 5. Display Controller

The `displayGame` module connects the game logic with the browser interface.

It handles player clicks, updates the board display, shows scores and result messages, disables the board when a round ends, and responds to the new-game button and challenge slider.

The display controller communicates with the game modules instead of implementing the game rules itself.

## Project Structure & Maintenance Reference

```text
tic-tac-toe-js/
│
├── index.html
│
├── src/
│   ├── script.js
│   ├── style.css
│   ├── fonts.css
│   └── tic-tac-toe-game.svg
│
└── README.md
```

| File                   | Purpose                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `index.html`           | Defines the page structure and game interface.                                |
| `script.js`            | Contains player creation, game logic, challenge tracking and display control. |
| `style.css`            | Defines the layout, colors and visual appearance.                             |
| `fonts.css`            | Contains font-family classes used by the interface.                           |
| `tic-tac-toe-game.svg` | Browser tab icon (favicon).                                                   |
| `README.md`            | Project introduction, user guide and maintenance reference.                   |

### Maintenance Notes

When making changes to the project, the following separation of responsibilities should be maintained:

- Changes to board storage or cell operations belong in `gameBoard`.
- Changes to turns, move validation, winning combinations or draw conditions belong in `gameController`.
- Changes to player scores or individual player data belong in the `Player` factory.
- Changes to challenge length, round tracking or winning streaks belong in `streakTracker`.
- Changes to HTML elements, event listeners or displayed messages belong in `displayGame`.

This structure helps keep the modules independent and makes future updates easier to manage.

## Credits & Disclaimer

- Developed as part of **[The Odin Project](https://www.theodinproject.com/)** JavaScript curriculum.
- Fonts provided by [Google Fonts](https://fonts.google.com/).
- This is an educational project developed to practise JavaScript fundamentals, including factory functions, IIFEs, closures, DOM manipulation and separation of responsibilities.

The project is intended for learning and demonstration purposes.
