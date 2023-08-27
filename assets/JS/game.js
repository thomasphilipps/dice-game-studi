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
   * @param {integer} dots The number of dots on the face
   */

  static render(dots) {
    dots = parseInt(dots);
    const dice = document.getElementById("dice-face");
    let content = "";
    for (let i = 0; i < dots; i++) {
      content += '<span class="dice-dot"></span>';
    }
    dice.innerHTML = content;
  }
}

//Tests

function onRollDice() {
  console.log("roll clicked")
  let result = Dice.roll(6);
  
  console.log(result);
  Dice.render(result);
  return result;
}

const rollDiceBtn = document.getElementById("roll-dice");
rollDiceBtn.addEventListener("click", () => onRollDice());
