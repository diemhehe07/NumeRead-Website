(function () {
  let difficulty = "starter";
  let current = null;
  let score = 0;
  let round = 0;
  const totalRounds = 5;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeProblem() {
    const ranges = {
      starter: [1, 9],
      support: [1, 12],
      practice: [8, 24],
      challenge: [15, 60]
    };
    const [min, max] = ranges[difficulty];
    const a = rand(min, max);
    const b = rand(min, max);
    const answer = a + b;
    const choices = [answer, answer + rand(1, 4), Math.max(0, answer - rand(1, 4))].sort(() => Math.random() - 0.5);
    return { prompt: `${a} + ${b}`, answer, choices, lesson: "Addition joins two amounts. Count on from the bigger number or make ten first." };
  }

  function render() {
    current = makeProblem();
    round += 1;
    document.querySelector("[data-round]").textContent = `${round}/${totalRounds}`;
    document.querySelector("[data-lesson]").textContent = current.lesson;
    document.querySelector("[data-prompt]").textContent = current.prompt;
    document.querySelector("[data-choices]").innerHTML = current.choices.map((choice) => `
      <button data-choice="${choice}" class="bg-white hover:bg-teal-50 border border-teal-200 rounded-2xl p-5 text-2xl font-bold shadow-sm">${choice}</button>
    `).join("");
  }

  async function choose(value) {
    if (round > totalRounds) return;
    const correct = Number(value) === current.answer;
    if (correct) score += 1;
    await window.NumeReadGame.tutorFeedback({ skill: "Addition facts", difficulty, correct, prompt: current.prompt });
    if (round >= totalRounds) {
      const gain = Math.max(4, score * 3);
      await window.NumeReadGame.finishGame({ activityId: "math-ninja", area: "math", skill: "Addition facts", gain, xp: 30, badge: "Number Ninja" });
      document.querySelector("[data-score]").textContent = `${score}/${totalRounds}`;
      document.querySelector("[data-choices]").innerHTML = "";
      round += 1;
      return;
    }
    render();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty;
    document.querySelector("[data-back]").href = `student.html?${game.query}`;
    render();
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-choice]");
      if (button) choose(button.dataset.choice);
    });
  });
})();
