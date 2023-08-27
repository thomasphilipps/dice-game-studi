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
      activeDot.innerHTML += '<div class="active-dot"></div>';
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
}

//Tests

function onRollDice() {
  let result = Dice.roll(6);
  Dice.render(result);
  return result;
}

function onNewGame() {
  //Reset players
  player1 = new Player("Player 1");
  player2 = new Player("Player 2");
  currentPlayer = Player.toss();
  player1.render("player1");
  player2.render("player2");
}

let player1;
let player2;
let currentPlayer;

const newGameBtn = document.getElementById("new-game");
const rollDiceBtn = document.getElementById("roll-dice");
newGameBtn.addEventListener("click", () => onNewGame());
rollDiceBtn.addEventListener("click", () => onRollDice());
