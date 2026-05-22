(function () {
  const sets = {
    support: [
      { blend: "br", choices: ["brush", "sun", "map"], answer: "brush", lesson: "A blend keeps both sounds. Say /b/ then /r/ quickly." },
      { blend: "cl", choices: ["cup", "clock", "fish"], answer: "clock", lesson: "The letters c and l blend at the start of clock." }
    ],
    practice: [
      { blend: "gr", choices: ["green", "rain", "boat"], answer: "green", lesson: "Listen for two beginning sounds before the vowel." },
      { blend: "fl", choices: ["flag", "log", "chair"], answer: "flag", lesson: "Flag starts with /f/ and /l/ blended together." }
    ],
    challenge: [
      { blend: "str", choices: ["street", "tree", "seat"], answer: "street", lesson: "Three-letter blends can keep all three sounds." },
      { blend: "scr", choices: ["screen", "cream", "seen"], answer: "screen", lesson: "Say /s/ /c/ /r/, then slide into the rest of the word." }
    ],
    starter: [
      { blend: "bl", choices: ["blue", "dog", "pen"], answer: "blue", lesson: "Blend the first two sounds without stopping." },
      { blend: "tr", choices: ["train", "apple", "kite"], answer: "train", lesson: "Train begins with /t/ and /r/." }
    ]
  };

  let rounds = [];
  let index = 0;
  let score = 0;
  let difficulty = "starter";

  function render() {
    const round = rounds[index];
    document.querySelector("[data-round]").textContent = `${index + 1}/${rounds.length}`;
    document.querySelector("[data-lesson]").textContent = round.lesson;
    document.querySelector("[data-prompt]").textContent = `Choose the word that begins with ${round.blend}.`;
    document.querySelector("[data-choices]").innerHTML = round.choices.map((choice) => `
      <button data-choice="${choice}" class="bg-white hover:bg-orange-50 border border-orange-200 rounded-2xl p-5 text-xl font-bold shadow-sm">${choice}</button>
    `).join("");
  }

  async function choose(choice) {
    if (index >= rounds.length) return;
    const round = rounds[index];
    const correct = choice === round.answer;
    if (correct) score += 1;
    await window.NumeReadGame.tutorFeedback({ skill: "Blends", difficulty, correct, prompt: round.blend });
    index += 1;
    if (index >= rounds.length) {
      const gain = score === rounds.length ? 10 : 5;
      await window.NumeReadGame.finishGame({ activityId: "reading-bridge", area: "reading", skill: "Blends", gain, xp: 25, badge: "Bridge Reader", clearGaps: ["Reading fluency"] });
      document.querySelector("[data-score]").textContent = `${score}/${rounds.length}`;
      document.querySelector("[data-choices]").innerHTML = "";
      return;
    }
    render();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "reading" });
    difficulty = game.difficulty;
    rounds = sets[difficulty];
    document.querySelector("[data-back]").href = `student.html?${game.query}`;
    render();
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-choice]");
      if (button) choose(button.dataset.choice);
    });
  });
})();
