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
    if (value === parseInt(value, 10)) {
      this._roundScore = value;
    } else {
      console.warn(`Provided .roundScore for ${this.name} is not an integer`);
      this._roundScore = 0;
    }
  }

  set globalScore(value) {
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
    const idList = {
      name: "player-name",
      roundScore: "player-round-score",
      globalScore: "player-global-score",
    };

    const parent = document.getElementById(id);

    for (let key in idList) {
      let child = parent.querySelector(`#${idList[key]}`);
      child.innerHTML = this[key];
    }

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
   * Action when the Hold button is triggered
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
    this.name = `${translationData["player"]} ${n}`;
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
  static playerData() {
    return {
      player1: {
        name: player1.name,
        globalScore: player1.globalScore,
        roundScore: player1.roundScore,
        active: player1.active,
      },
      player2: {
        name: player2.name,
        globalScore: player2.globalScore,
        roundScore: player2.roundScore,
        active: player2.active,
      },
    };
  }

  static assignPlayerData(data) {
    Object.assign(player1, data.player1);
    Object.assign(player2, data.player2);
  }

  /**
   * Resets the game
   */
  static onNewGame() {
    this.activatePlayerControls();
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
    rollDiceBtn.classList.remove("darken-control");
    holdBtn.classList.remove("darken-control");
    saveGameBtn.classList.remove("darken-control");
  }

  /**
   * Deactivate the players controls
   */
  static deactivatePlayerControls() {
    rollDiceBtn.classList.add("darken-control");
    holdBtn.classList.add("darken-control");
    saveGameBtn.classList.add("darken-control");
  }

  static showModal(modalId, modalLabelId, messageContent) {
    let modal = new bootstrap.Modal(document.getElementById(modalId), {});
    if (messageContent) {
      let modalLabel = document.getElementById(modalLabelId);
      modalLabel.innerHTML = messageContent;
    }
    modal.show();
  }

  /****************
   * Save & Restore methods
   ****************/

  /**
   * Save the game state to an external API
   * @param {string} saveName The name of the save
   */
  static async saveGame(saveName) {
    const saveData = { name: saveName, ...this.playerData() };

    try {
      const response = await fetch(apiBaseUrl, {
        method: "POST",
        body: JSON.stringify(saveData),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const result = await response.json();
      console.log("Partie sauvegardée avec succès : ", result);
      alert("Sauvegarde réussie !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la partie : ", error);
      alert("Erreur lors de la sauvegarde");
    }
  }

  /**
   * Restore the game state from an external API
   * @param {number} saveId The ID of the save to restore
   */
  static async restoreGame(saveId) {
    try {
      const response = await fetch(`${apiBaseUrl}/${saveId}`);
      const saveData = await response.json();

      this.assignPlayerData(saveData);

      player1.render("player1");
      player2.render("player2");

      this.activatePlayerControls();
      console.log("Partie restaurée avec succès : ", saveData);
    } catch (error) {
      console.error("Erreur lors de la restauration de la partie : ", error);
      alert("Erreur lors de la restauration");
    }
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
    document.getElementById("saveGame").textContent = translations["saveGame"];
    document.getElementById("restoreGame").textContent = translations["restoreGame"];
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
  });
});

/*******************
 * THE GAME ITSELF *
 *******************/

// Players declaration
const player1 = new Player("");
const player2 = new Player("");
let currentPlayer = new Player("");

// API base URL
const apiBaseUrl = "http://localhost:3000/games";

loadTranslations("./assets/lang/fr.json").then(() => {
  player1.render("player1");
  player2.render("player2");
});

// Player controls
const newGameBtn = document.getElementById("new-game");
const rollDiceBtn = document.getElementById("roll-dice");
const holdBtn = document.getElementById("hold");
const saveGameBtn = document.getElementById("save-game");
const restoreGameBtn = document.getElementById("restore-game");

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
saveGameBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});
restoreGameBtn.addEventListener("mousedown", (e) => {
  e.preventDefault();
});

// Controls listeners
newGameBtn.addEventListener("click", () => Game.onNewGame());
rollDiceBtn.addEventListener("click", () => currentPlayer.onRollDice());
holdBtn.addEventListener("click", () => currentPlayer.onHold());

// Hide players controls before the game
Game.deactivatePlayerControls();

// Info button modal
const infoBtn = document.getElementById("infoBtn");
infoBtn.addEventListener("click", () => {
  Game.showModal("infoModal", "infoModalLabel", translationData["rules"]);
});

// Save and Restore buttons

saveGameBtn.addEventListener("click", () => {
  const saveName = prompt("Nom de la sauvegarde : ");
  if (saveName) Game.saveGame(saveName);
});

restoreGameBtn.addEventListener("click", () => {
  const saveId = prompt("ID de la sauvegarde à restaurer : ");
  if (saveId) Game.restoreGame(saveId);
});
