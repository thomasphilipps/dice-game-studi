/****************
 * Dice methods *
 ****************/

class Dice {
  /**
   * Throws a dice with n sides
   *
   * @param {Integer} n The number of sides
   * @returns Number
   */
  static roll(n) {
    return Math.floor(Math.random() * n) + 1;
  }

  /**
   * Renders the face of the dice on the screen
   *
   * @param {number} dots The number of dots on the face
   */
  static render(dots) {
    dots = parseInt(dots, 10); //making sure provided number is an integer
    const dice = document.getElementById("dice-face");
    let content = "";
    for (let i = 0; i < dots; i++) {
      content += '<span class="dice-dot"></span>';
    }
    dice.innerHTML = content;
  }
}

/******************************************
 * Player-relative properties and methods *
 ******************************************/

class Player {
  constructor(name) {
    this._name = name;
    this._roundScore = 0;
    this._globalScore = 0;
    this._active = false;
  }

  get name() {
    return this._name.toUpperCase();
  }

  get roundScore() {
    return this._roundScore;
  }

  get globalScore() {
    return this._globalScore;
  }

  get active() {
    return this._active;
  }

  set name(value) {
    if (typeof value === "string") {
      this._name = value;
    } else {
      console.warn(`Provided .name for ${this.name} is not a string`);
    }
  }

  set roundScore(value) {
    //Safety check
    if (value === parseInt(value, 10)) {
      this._roundScore = value;
    } else {
      console.warn(`Provided .roundScore for ${this.name} is not an integer`);
      this._roundScore = 0;
    }
  }

  set globalScore(value) {
    //Safety check
    if (value === parseInt(value, 10)) {
      this._globalScore = value;
    } else {
      console.warn(`Provided .globalScore for ${this.name} is not an integer`);
      this._globalScore = 0;
    }
  }

  set active(value) {
    if (typeof value === "boolean") {
      this._active = value;
    } else {
      console.warn(`Provided .active for ${this.name} is not a boolean`);
      this._active = false;
    }
  }

  /**
   * Displays the player's data
   *
   * @param {string} id The player's HTML container id
   */
  render(id) {
    // list of player's dynamic #ids
    const idList = {
      name: "player-name",
      roundScore: "player-round-score",
      globalScore: "player-global-score",
    };

    // getting the player's container
    const parent = document.getElementById(id);

    // setting the player's dynamic areas by their #ids
    for (let key in idList) {
      let child = parent.querySelector(`#${idList[key]}`);
      child.innerHTML = this[key];
    }

    //adding the turn dot
    if (this.active) {
      let activeDot = parent.querySelector(`#player-name`);
      activeDot.innerHTML += '<span class="active-dot"></span>';
    }
  }

  /**
   * Toss the first player
   *
   * @returns {Player}
   */
  static toss() {
    let result = Dice.roll(2);
    if (result === 1) {
      player1.active = true;
      return player1;
    } else {
      player2.active = true;
      return player2;
    }
  }

  /**
   * Actions when the Roll Dice button is triggered
   */
  onRollDice() {
    let result = Dice.roll(6);
    Dice.render(result);
    if (result > 1) {
      this.roundScore += result;
      player1.render("player1");
      player2.render("player2");
    } else {
      alert(`${this.name} rolled a 1 and passes his turn`);
      currentPlayer = Player.switch();
    }
  }

  /**
   * Action when the Hold button is triggerd
   */
  onHold() {
    this.globalScore += this.roundScore;
    if (this.globalScore >= 100) {
      this.win();
    } else {
      this.roundScore = 0;
      currentPlayer = Player.switch();
    }
  }

  /**
   * Resets the player
   *
   * @param {Integer} n 1 or 2, the player's number
   */
  reset(n) {
    this.name = `Player ${n}`;
    this.globalScore = 0;
    this.roundScore = 0;
    this.active = false;
  }

  /**
   * Actions when winning the game
   */
  win() {
    alert(`${this.name} won the game`);
    Game.onNewGame();
  }

  /**
   * Switch turn
   *
   * @returns {Player}
   */
  static switch() {
    if (player1.active) {
      player1.active = false;
      player1.roundScore = 0;
      player2.active = true;
      player1.render("player1");
      player2.render("player2");
      return player2;
    } else {
      player1.active = true;
      player2.active = false;
      player2.roundScore = 0;
      player1.render("player1");
      player2.render("player2");
      return player1;
    }
  }
}

/**
 * Game methods
 */

class Game {
  /**
   * Resets the game
   */
  static onNewGame() {
    this.activatePlayerControls();
    // Reset players
    player1.reset(1);
    player2.reset(2);
    currentPlayer = Player.toss();
    player1.render("player1");
    player2.render("player2");
  }

  /**
   * Activate the players controls
   */
  static activatePlayerControls() {
    // Enlight players controls
    rollDiceBtn.classList.remove("darken-control");
    holdBtn.classList.remove("darken-control");

    /* // Activate listeners
    rollDiceBtn.addEventListener("click", currentPlayer.onRollDice());
    holdBtn.addEventListener("click", currentPlayer.onHold()); */
  }

  /**
   * Desactivate the players controls
   */
  static deactivatePlayerControls() {
    // Darken players controls
    rollDiceBtn.classList.add("darken-control");
    holdBtn.classList.add("darken-control");

    /* // Deactivate listeners
    rollDiceBtn.removeEventListener("click", currentPlayer.onRollDice());
    holdBtn.removeEventListener("click", currentPlayer.onHold()); */
  }
}

//Tests

// Players declaration
const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
let currentPlayer = new Player("");

// Player controls
const newGameBtn = document.getElementById("new-game");
const rollDiceBtn = document.getElementById("roll-dice");
const holdBtn = document.getElementById("hold");

// Prevent text selection on controls
newGameBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});
rollDiceBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});
holdBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});

// Controls listeners
newGameBtn.addEventListener("click", () => Game.onNewGame());
rollDiceBtn.addEventListener("click", () => currentPlayer.onRollDice());
holdBtn.addEventListener("click", () => currentPlayer.onHold());

//Hide players controls before the game
Game.deactivatePlayerControls();
