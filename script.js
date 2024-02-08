"use strict";

const HIGHSCORE_KEY = "GUESS_MY_AGE_HIGHSCORE";
const GENDER_KEY = "GUESS_MY_AGE_GENDER";

const switchGenderBtn = document.querySelector(".gender");
const checkAgeBtn = document.querySelector(".check");
const playAgainBtn = document.querySelector(".again");
const hintBtn = document.querySelector(".hint");

const profile = document.querySelector(".profile");
const number = document.querySelector(".number");

const resetHighScore = document.getElementById("reset");

const genders = ["Any", "F", "M"];

let defaultGender = localStorage.getItem(GENDER_KEY) || genders[0];

let personImage, personName, personAge;
let playerWon = false;
let currentScore = 20;
let highScore = localStorage.getItem(HIGHSCORE_KEY) || 0;

/**
 * Methods to set the text content of message, score and number
 * @param {*} message,
 * @param {*} score,
 * @param {*} number
 */
const displayMessage = (message) => {
  document.querySelector(".message").textContent = message;
};

const displayScore = (score) => {
  document.querySelector(".score").textContent = score;
};

const displayNumber = (number) => {
  document.querySelector(".number").textContent = number;
};

const toggleProfileNumber = () => {
  document.querySelector(".profile").classList.toggle("hidden");
  document.querySelector(".number").classList.toggle("hidden");
};

const startGame = () => {
  fetchProfileInfo(defaultGender);
  document.querySelector(".hint").classList.remove("hidden");
  document.querySelector(".highscore").textContent = highScore;
  document.querySelector(".switch").textContent = defaultGender;
};

const resetGameState = () => {
  // Reset the current score
  currentScore = 20;
  playerWon = false;

  // Reset the scores and messages to default
  displayScore(currentScore);
  displayNumber("?");
  displayMessage("Start guessing...");

  // Reset the styling of the page
  document.querySelector(".guess").style.border = "4px solid #eee";
  document.querySelector(".guess").value = "";
  document.querySelector("body").style.backgroundColor = "#181414";

  // Toggle to set the image as default when reset
  document.querySelector(".number").classList.add("hidden");
  document.querySelector(".profile").classList.remove("hidden");
  document.querySelector(".hint").classList.remove("hidden");

  fetchProfileInfo(defaultGender);
};

// Async function to fetch the profile of a random person (based on gender also)
const fetchProfileInfo = async (gender) => {
  displayMessage("Loading please Wait...");
  document.querySelector(".guess").disabled = true;

  const url =
    gender === "Any"
      ? "https://randomuser.me/api/?results=1&inc=name,gender,dob,picture"
      : `https://randomuser.me/api/?results=1&inc=name,gender,dob,picture&gender=${
          gender === "M" ? "male" : "female"
        }`;

  await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      personImage = data?.results[0].picture?.large;
      personName = `${data?.results[0].name?.title} ${data?.results[0].name?.first} ${data?.results[0].name?.last}`;
      personAge = data?.results[0].dob?.age;
    });

  document.querySelector(".person-image").src = personImage;
  document.querySelector(".person-image").alt = personName;
  document.querySelector(
    ".person-name"
  ).textContent = `Hi 👋 I'm, ${personName}`;

  displayMessage("Start guessing...");
  document.querySelector(".guess").disabled = false;
};

// Initiate the game
startGame();

// Change the default gender
switchGenderBtn.addEventListener("click", function () {
  defaultGender = genders[(genders.indexOf(defaultGender) + 1) % 3];

  localStorage.setItem(GENDER_KEY, defaultGender);

  document.querySelector(".switch").textContent = defaultGender;
  resetGameState();
});

checkAgeBtn.addEventListener("click", function () {
  if (!playerWon) {
    const guess = Number(document.querySelector(".guess").value);

    if (!guess || guess < 1) {
      displayMessage("❌ Not a valid age");
      document.querySelector(".guess").style.border = "4px solid #97240e";
    } else if (guess === personAge) {
      playerWon = true;
      if (currentScore > highScore) {
        highScore = currentScore;
        document.querySelector(".highscore").textContent = highScore;
        localStorage.setItem(HIGHSCORE_KEY, highScore);
      }

      document.querySelector("body").style.backgroundColor = "#60b347";
      document.querySelector(".guess").style.border = "4px solid #057d3b";

      displayMessage("You guessed it right 🎉");
      displayNumber(personAge);

      // If won show the age instead of the profile pic
      // Still user can click on the age to get the profile pic back and vice versa
      document.querySelector(".profile").classList.toggle("hidden");
      document.querySelector(".number").classList.toggle("hidden");
    } else if (guess !== personAge) {
      playerWon = false;
      document.querySelector(".guess").style.border = "4px solid #eee";
      if (currentScore > 1) {
        displayScore(--currentScore);
        displayMessage(
          guess > personAge
            ? "Strange, Do I look this old? 🤐"
            : "I'm not this young! 😀"
        );
      } else {
        currentScore = 0;
        displayScore(currentScore);
        displayMessage("🤯 You lost the game");
        document.querySelector("body").style.backgroundColor = "#b34747";
      }
    }
  }
});

hintBtn.addEventListener("click", function () {
  if (currentScore > 0 && !playerWon) {
    let takeHint = confirm("Taking hint will cost 1 score point. Take Hint?");

    if (takeHint) {
      document.querySelector(".hint").classList.add("hidden");
      displayScore(--currentScore);
      const rangeStart = personAge - (personAge % 10) - 12;
      const rangeEnd = personAge - (personAge % 10) + 12;

      alert(`Age is between ${rangeStart} and ${rangeEnd}`);
    }
  } else {
    alert("You don't have enough score to take hint / You already won");
  }
});

resetHighScore.addEventListener("click", function () {
  highScore = 0;
  document.querySelector(".highscore").textContent = highScore;
  localStorage.setItem(HIGHSCORE_KEY, highScore);
});

profile.addEventListener("click", toggleProfileNumber);
number.addEventListener("click", toggleProfileNumber);
playAgainBtn.addEventListener("click", resetGameState);
