(function () {
  const ranges = {
    easy: [5, 12],
    average: [10, 30],
    intermediate: [20, 70],
    advanced: [50, 120]
  };
  const totalRounds = 5;
  let difficulty = "easy";
  let round = 0;
  let score = 0;
  let current = null;
  let dashboardUrl = "student.html";

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeProblem() {
    const [min, max] = ranges[difficulty] || ranges.easy;
    const a = rand(min, max);
    const b = rand(1, Math.max(2, Math.floor(a / 2)));
    const answer = a - b;
    const choices = Array.from(new Set([answer, answer + rand(1, 4), Math.max(0, answer - rand(1, 4))])).slice(0, 3);
    while (choices.length < 3) choices.push(answer + rand(2, 6));
    return { prompt: `${a} - ${b}`, answer, choices: choices.sort(() => Math.random() - 0.5) };
  }

  function render() {
    current = makeProblem();
    round += 1;
    document.getElementById("roundDisplay").textContent = `${round}/${totalRounds}`;
    document.getElementById("lessonText").textContent = "Subtraction means taking away. Count back or think: what plus the answer makes the first number?";
    document.getElementById("promptText").innerHTML = `<i class="fas fa-minus"></i> ${current.prompt} = ?`;
    document.getElementById("choicesContainer").innerHTML = current.choices.map((choice) => `<button class="choice-card" data-choice="${choice}">${choice}</button>`).join("");
    document.getElementById("feedbackMsg").textContent = "";
  }

  async function choose(choice, button) {
    const correct = Number(choice) === current.answer;
    if (correct) score += 1;
    button.classList.add(correct ? "correct-animation" : "wrong-animation");
    document.querySelectorAll(".choice-card").forEach((choiceButton) => choiceButton.disabled = true);
    document.getElementById("feedbackMsg").textContent = correct ? "Correct subtraction." : `${current.prompt} = ${current.answer}.`;
    await window.NumeReadGame.tutorFeedback({ skill: "Subtraction", difficulty, correct, prompt: current.prompt });
    if (round >= totalRounds) await finish();
    else setTimeout(render, 900);
  }

  async function finish() {
    document.getElementById("completionPanel").classList.remove("hidden");
    document.getElementById("scoreMessage").textContent = `Score: ${score}/${totalRounds}. Subtraction progress saved.`;
    document.getElementById("choicesContainer").innerHTML = "";
    await window.NumeReadGame.finishGame({ activityId: "subtraction-sprint", area: "math", skill: "Subtraction", gain: Math.max(5, score * 3), xp: 30, badge: "Subtraction Sprinter" });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty;
    dashboardUrl = game.dashboardUrl;
    render();
    document.getElementById("choicesContainer").addEventListener("click", (event) => {
      const button = event.target.closest(".choice-card");
      if (button && !button.disabled) choose(button.dataset.choice, button);
    });
    document.getElementById("backDashboardBtn").addEventListener("click", () => { window.location.href = dashboardUrl; });
  });
})();
