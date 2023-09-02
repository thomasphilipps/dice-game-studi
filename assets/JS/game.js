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
      let messageContent = `${this.name} ${translationData["passTurn"]}`;
      Game.showModal("roundLostModal", "roundLostModalLabel", messageContent);
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
    player1.render("player1");
    player2.render("player2");
    let messageContent = `${this.name} ${translationData["playerWin"]}`;
    Game.showModal("gameWinModal", "gameWinModalLabel", messageContent);
    Game.deactivatePlayerControls();
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
    // Activate player controls
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
  }

  /**
   * Desactivate the players controls
   */
  static deactivatePlayerControls() {
    // Darken players controls
    rollDiceBtn.classList.add("darken-control");
    holdBtn.classList.add("darken-control");
  }

  static showModal(modalId, modalLabelId, messageContent) {
    let modal = new bootstrap.Modal(document.getElementById(modalId), {});
    if (messageContent) {
      let modalLabel = document.getElementById(modalLabelId);
      modalLabel.innerHTML = messageContent;
    }
    modal.show();
  }
}

/********************
 * LANGUAGE SUPPORT *
 ********************/

const dropdownElement = document.getElementById("language-dropdown");
const jsonFiles = ["fr.json", "en.json"];
let translationData = {};

// Generate dropdown options from JSON file list
jsonFiles.forEach((fileName) => {
  let optionName = fileName.substring(0, fileName.lastIndexOf("."));
  const option = document.createElement("option");
  option.value = fileName; // The value is the file name without extension
  option.textContent = optionName; // The text displayed is also the file name without extension
  dropdownElement.appendChild(option);
});

async function loadTranslations(fileName) {
  try {
    const response = await fetch(fileName);
    const translations = await response.json();
    translationData = translations;
    document.getElementById("rule1").textContent = translations["rule1"];
    document.getElementById("rule2").textContent = translations["rule2"];
    document.getElementById("ruleOptionHeader").textContent = translations["ruleOptionHeader"];
    document.getElementById("ruleOption1").textContent = translations["ruleOption1"];
    document.getElementById("ruleOption2").textContent = translations["ruleOption2"];
    document.getElementById("ruleWin").textContent = translations["ruleWin"];
    document.getElementById("infoModalClose").textContent = translations["close"];
    document.getElementById("currentPlayer1").textContent = translations["current"];
    document.getElementById("currentPlayer2").textContent = translations["current"];
    document.getElementById("newGame").textContent = translations["newGame"];
    document.getElementById("rollDice").textContent = translations["rollDice"];
    document.getElementById("holdLang").textContent = translations["hold"];
    player1.name = `${translationData["player"]} 1`;
    player2.name = `${translationData["player"]} 2`;
  } catch (error) {
    console.error("Erreur lors du chargement des traductions :", error);
  }
}

dropdownElement.addEventListener("change", function () {
  const selectedFileName = "./assets/lang/" + this.value;
  loadTranslations(selectedFileName).then(() => {
    player1.render("player1");
    player2.render("player2");
  });;
});

/*******************
 * THE GAME ITSELF *
 *******************/

// Players declaration
const player1 = new Player("");
const player2 = new Player("");
let currentPlayer = new Player("");

loadTranslations("./assets/lang/fr.json").then(() => {
  player1.render("player1");
  player2.render("player2");
});

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

//Info button modal
const infoBtn = document.getElementById("infoBtn");
infoBtn.addEventListener("click", () => {
  Game.showModal("infoModal", "infoModalLabel", translationData["rules"]);
});
