// game-place-value-builder.js - Upgraded Place Value Builder with Base-10 Blocks
(function () {
  let TOTAL_ROUNDS = 10;
  const ranges = {
    easy: [11, 49],
    average: [20, 99],
    intermediate: [100, 350],
    advanced: [100, 999]
  };

  let difficulty = "easy";
  let round = 0;
  let score = 0;
  let combo = 0;
  let current = null;
  let dashboardUrl = "student.html";
  let waiting = false;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Base-10 SVGs
  function flatSvg() {
    return `
      <svg viewBox="0 0 54 54" class="block-flat" role="img" aria-label="Hundred Flat">
        <rect x="1" y="1" width="52" height="52" rx="3" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        <line x1="1" y1="11" x2="53" y2="11" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="1" y1="22" x2="53" y2="22" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="1" y1="33" x2="53" y2="33" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="1" y1="43" x2="53" y2="43" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="11" y1="1" x2="11" y2="53" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="22" y1="1" x2="22" y2="53" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="33" y1="1" x2="33" y2="53" stroke="#16a34a" stroke-width="0.8"/>
        <line x1="43" y1="1" x2="43" y2="53" stroke="#16a34a" stroke-width="0.8"/>
      </svg>
    `;
  }

  function rodSvg() {
    return `
      <svg viewBox="0 0 14 54" class="block-rod" role="img" aria-label="Ten Rod">
        <rect x="1" y="1" width="12" height="52" rx="2" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
        <line x1="1" y1="11" x2="13" y2="11" stroke="#2563eb" stroke-width="0.8"/>
        <line x1="1" y1="22" x2="13" y2="22" stroke="#2563eb" stroke-width="0.8"/>
        <line x1="1" y1="33" x2="13" y2="33" stroke="#2563eb" stroke-width="0.8"/>
        <line x1="1" y1="43" x2="13" y2="43" stroke="#2563eb" stroke-width="0.8"/>
      </svg>
    `;
  }

  function cubeSvg() {
    return `
      <svg viewBox="0 0 14 14" class="block-cube" role="img" aria-label="One Cube">
        <rect x="1" y="1" width="12" height="12" rx="2" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      </svg>
    `;
  }

  function makeProblem() {
    const bank = window.NumeReadGame?.getActivityQuestions?.("place-value-builder", difficulty, { seed: 0 }) || window.NumeReadTestBanks?.getForActivity("place-value-builder", difficulty, { seed: 0 }) || [];
    const item = bank[round];
    if (!item) throw new Error(`No Place Value Builder item is available for round ${round + 1}.`);
    return { ...item, choices: item.choices.map(Number) };
  }

  function render() {
    waiting = false;
    current = makeProblem();
    round += 1;

    document.getElementById("roundDisplay").textContent = `${round}/${TOTAL_ROUNDS}`;
    document.getElementById("scoreCount").textContent = String(score);
    document.getElementById("comboCount").textContent = String(combo);

    document.getElementById("lessonText").textContent =
      "Each digit has a place value. Hundreds are groups of 100, tens are rods of 10, and ones are unit cubes.";

    document.getElementById("promptMath").textContent = current.description;

    // Render Base-10 blocks stage
    const showHundreds = current.hundreds > 0;
    const stageHtml = `
      <div class="place-value-columns">
        ${showHundreds ? `
          <div class="pv-column col-hundreds">
            <span class="pv-col-header">Hundreds</span>
            <div class="pv-blocks-container">${Array(current.hundreds).fill(flatSvg()).join("")}</div>
            <span class="pv-count-badge">${current.hundreds}</span>
          </div>
        ` : ""}
        <div class="pv-column col-tens">
          <span class="pv-col-header">Tens</span>
          <div class="pv-blocks-container">${Array(current.tens).fill(rodSvg()).join("")}</div>
          <span class="pv-count-badge">${current.tens}</span>
        </div>
        <div class="pv-column col-ones">
          <span class="pv-col-header">Ones</span>
          <div class="pv-blocks-container">${Array(current.ones).fill(cubeSvg()).join("")}</div>
          <span class="pv-count-badge">${current.ones}</span>
        </div>
      </div>
    `;
    document.getElementById("base10Wrapper").innerHTML = stageHtml;

    // Render Choices
    document.getElementById("choicesContainer").innerHTML = current.choices
      .map((c) => `<button type="button" class="choice-card" data-choice="${c}">${c}</button>`)
      .join("");

    document.getElementById("feedbackMsg").textContent = "";
    document.getElementById("feedbackMsg").className = "feedback-message";
  }

  async function choose(choice, button) {
    if (waiting) return;
    waiting = true;

    const correct = Number(choice) === current.answer;
    if (correct) {
      score += 1;
      combo += 1;
      button.classList.add("correct-animation");
      window.NumeReadSound?.playChime(true);
    } else {
      combo = 0;
      button.classList.add("wrong-animation");
      window.NumeReadSound?.playChime(false);
    }

    document.querySelectorAll(".builder-choices .choice-card").forEach((btn) => (btn.disabled = true));
    document.getElementById("scoreCount").textContent = String(score);
    document.getElementById("comboCount").textContent = String(combo);

    const feedback = correct
      ? `🧱 Excellent builder! ${current.description} = ${current.answer}!`
      : `Keep building! The number is ${current.answer}.${current.tip ? " Tip: " + current.tip : ""}`;
    window.NumeReadGame.showAnswerFeedback(correct, feedback);

    if (window.NumeReadGame?.tutorFeedback) {
      window.NumeReadGame.tutorFeedback({
        skill: "Place value",
        difficulty,
        correct,
        prompt: current.description,
        userAnswer: choice,
        correctAnswer: current.answer
      }).catch(() => {});
    }

    if (round >= TOTAL_ROUNDS) {
      setTimeout(finish, 1000);
    } else {
      setTimeout(render, 1100);
    }
  }

  async function finish() {
    document.getElementById("completionPanel").classList.remove("hidden");
    document.getElementById("scoreMessage").innerHTML =
      `Builder complete! You constructed <strong>${score}/${TOTAL_ROUNDS}</strong> numbers accurately!`;
    document.getElementById("choicesContainer").innerHTML = "";

    await window.NumeReadGame.finishGame({
      activityId: "place-value-builder",
      area: "math",
      skill: "Place value",
      gain: Math.max(6, score * 3),
      performance: score / TOTAL_ROUNDS,
      xp: 30,
      badge: "Place Value Master"
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty || "easy";
    TOTAL_ROUNDS = (window.NumeReadGame?.getActivityQuestions?.("place-value-builder", difficulty) || window.NumeReadTestBanks?.getForActivity("place-value-builder", difficulty) || []).length || 10;
    dashboardUrl = game.dashboardUrl || "student.html";

    render();

    document.getElementById("choicesContainer").addEventListener("click", (event) => {
      const button = event.target.closest(".choice-card");
      if (button && !button.disabled) choose(button.dataset.choice, button);
    });

    document.getElementById("backDashboardBtn").addEventListener("click", () => {
      window.location.href = dashboardUrl;
    });

    document.getElementById("speakBtn").addEventListener("click", () => {
      window.NumeReadSound?.speak(current.description);
    });
  });
})();
