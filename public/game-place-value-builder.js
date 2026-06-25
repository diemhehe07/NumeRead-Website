(function () {
  const ranges = {
    easy: [10, 49],
    average: [20, 99],
    intermediate: [100, 499],
    advanced: [100, 999]
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

  function describe(number) {
    const hundreds = Math.floor(number / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;
    if (number >= 100) return `${hundreds} hundreds, ${tens} tens, and ${ones} ones`;
    return `${tens} tens and ${ones} ones`;
  }

  function makeProblem() {
    const [min, max] = ranges[difficulty] || ranges.easy;
    const answer = rand(min, max);
    const choices = Array.from(new Set([answer, answer + 10, Math.max(0, answer - 10), Number(String(answer).split("").reverse().join(""))])).filter((value) => value >= 0).slice(0, 3);
    while (choices.length < 3) choices.push(answer + rand(1, 9));
    return { prompt: `Build the number with ${describe(answer)}.`, answer, choices: choices.sort(() => Math.random() - 0.5) };
  }

  function render() {
    current = makeProblem();
    round += 1;
    document.getElementById("roundDisplay").textContent = `${round}/${totalRounds}`;
    document.getElementById("lessonText").textContent = "Place value tells what each digit means. Tens are groups of 10, hundreds are groups of 100.";
    document.getElementById("promptText").textContent = current.prompt;
    document.getElementById("choicesContainer").innerHTML = current.choices.map((choice) => `<button class="choice-card" data-choice="${choice}">${choice}</button>`).join("");
    document.getElementById("feedbackMsg").textContent = "";
  }

  async function choose(choice, button) {
    const correct = Number(choice) === current.answer;
    if (correct) score += 1;
    button.classList.add(correct ? "correct-animation" : "wrong-animation");
    document.querySelectorAll(".choice-card").forEach((choiceButton) => choiceButton.disabled = true);
    document.getElementById("feedbackMsg").textContent = correct ? "Correct place value." : `The number is ${current.answer}.`;
    await window.NumeReadGame.tutorFeedback({ skill: "Place value", difficulty, correct, prompt: current.prompt });
    if (round >= totalRounds) await finish();
    else setTimeout(render, 900);
  }

  async function finish() {
    document.getElementById("completionPanel").classList.remove("hidden");
    document.getElementById("scoreMessage").textContent = `Score: ${score}/${totalRounds}. Place value progress saved.`;
    document.getElementById("choicesContainer").innerHTML = "";
    await window.NumeReadGame.finishGame({ activityId: "place-value-builder", area: "math", skill: "Place value", gain: Math.max(5, score * 3), xp: 30, badge: "Place Value Builder" });
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
