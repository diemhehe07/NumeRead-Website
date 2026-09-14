// game-subtraction-sprint.js - Upgraded Subtraction Sprint with Visual Number Line
(function () {
  let TOTAL_ROUNDS = 10;
  const ranges = {
    easy: [5, 12],
    average: [10, 25],
    intermediate: [20, 50],
    advanced: [50, 100]
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

  function makeProblem() {
    const bank = window.NumeReadGame?.getActivityQuestions?.("subtraction-sprint", difficulty, { seed: 0 }) || window.NumeReadTestBanks?.getForActivity("subtraction-sprint", difficulty, { seed: 0 }) || [];
    const item = bank[round];
    if (!item) throw new Error(`No Subtraction Sprint item is available for round ${round + 1}.`);
    return { ...item, choices: item.choices.map(Number) };
  }

  // Generate Visual Number Line SVG
  function renderNumberLine(a, b, answer) {
    const minVal = Math.max(0, Math.min(answer - 2, a - b - 2));
    const maxVal = a + 2;
    const range = maxVal - minVal;
    const width = 480;
    const padding = 35;
    const usableWidth = width - padding * 2;

    const xForVal = (val) => padding + ((val - minVal) / range) * usableWidth;

    let ticksHtml = "";
    const step = range > 20 ? 5 : range > 10 ? 2 : 1;

    for (let v = minVal; v <= maxVal; v += step) {
      const x = xForVal(v);
      const isStart = v === a;
      const isEnd = v === answer;
      const tickColor = isStart ? "#ea580c" : isEnd ? "#0d9488" : "#94a3b8";
      const tickH = isStart || isEnd ? 20 : 12;

      ticksHtml += `
        <line x1="${x.toFixed(1)}" y1="${50 - tickH / 2}" x2="${x.toFixed(1)}" y2="${50 + tickH / 2}" stroke="${tickColor}" stroke-width="${isStart || isEnd ? 3 : 1.5}"/>
        <text x="${x.toFixed(1)}" y="72" font-size="11" font-weight="${isStart || isEnd ? '700' : '500'}" fill="${tickColor}" text-anchor="middle">${v}</text>
      `;
    }

    // Backward Jump Arc from a to answer
    const xStart = xForVal(a);
    const xEnd = xForVal(answer);
    const midX = (xStart + xEnd) / 2;
    const arcHeight = 22;

    const arcPath = `M ${xStart.toFixed(1)} 45 Q ${midX.toFixed(1)} ${45 - arcHeight} ${xEnd.toFixed(1)} 45`;

    return `
      <svg viewBox="0 0 ${width} 85" class="number-line-svg" role="img" aria-label="Number line showing ${a} jumping backward ${b} steps to ${answer}">
        <!-- Main Line -->
        <line x1="${padding - 10}" y1="50" x2="${width - padding + 10}" y2="50" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Arrow heads -->
        <polygon points="${padding - 14},50 ${padding - 6},46 ${padding - 6},54" fill="#64748b"/>
        <polygon points="${width - padding + 14},50 ${width - padding + 6},46 ${width - padding + 6},54" fill="#64748b"/>
        <!-- Ticks -->
        ${ticksHtml}
        <!-- Jump Arc -->
        <path d="${arcPath}" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-dasharray="4,3"/>
        <polygon points="${xEnd.toFixed(1)},45 ${(xEnd + 6).toFixed(1)},39 ${(xEnd + 5).toFixed(1)},47" fill="#e11d48"/>
        <!-- Jump Label -->
        <text x="${midX.toFixed(1)}" y="${45 - arcHeight - 2}" font-size="13" font-weight="800" fill="#e11d48" text-anchor="middle">Jump back -${b}</text>
      </svg>
    `;
  }

  function render() {
    waiting = false;
    current = makeProblem();
    round += 1;

    document.getElementById("roundDisplay").textContent = `${round}/${TOTAL_ROUNDS}`;
    document.getElementById("scoreCount").textContent = String(score);
    document.getElementById("comboCount").textContent = String(combo);

    // Update runner track position
    const runner = document.getElementById("trackRunner");
    const progressPct = Math.min(94, Math.max(6, ((round - 1) / TOTAL_ROUNDS) * 100));
    runner.style.left = `${progressPct}%`;

    // Lesson Text
    document.getElementById("lessonText").textContent =
      "Subtraction means jumping backward on the number line or taking away. Count back from the start number.";

    // Render Prompt
    document.getElementById("promptMath").textContent = `${current.prompt} = ?`;

    // Render Number Line
    document.getElementById("numberLineWrapper").innerHTML = renderNumberLine(current.a, current.b, current.answer);

    // Render Choices
    document.getElementById("choicesContainer").innerHTML = current.choices
      .map((choice) => `<button type="button" class="choice-card" data-choice="${choice}">${choice}</button>`)
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

    document.querySelectorAll(".sprint-choices .choice-card").forEach((btn) => (btn.disabled = true));
    document.getElementById("scoreCount").textContent = String(score);
    document.getElementById("comboCount").textContent = String(combo);

    const feedback = correct
      ? `⚡ Fantastic sprint! ${current.prompt} = ${current.answer}!`
      : `Keep running! ${current.a} minus ${current.b} is ${current.answer}.`;
    window.NumeReadGame.showAnswerFeedback(correct, feedback);

    if (window.NumeReadGame?.tutorFeedback) {
      window.NumeReadGame.tutorFeedback({
        skill: "Subtraction",
        difficulty,
        correct,
        prompt: current.prompt,
        userAnswer: choice,
        correctAnswer: current.answer
      }).catch(() => {});
    }

    if (round >= TOTAL_ROUNDS) {
      // Advance runner to finish line
      document.getElementById("trackRunner").style.left = "92%";
      setTimeout(finish, 1000);
    } else {
      setTimeout(render, 1100);
    }
  }

  async function finish() {
    document.getElementById("completionPanel").classList.remove("hidden");
    document.getElementById("scoreMessage").innerHTML =
      `Sprint complete! You solved <strong>${score}/${TOTAL_ROUNDS}</strong> hurdles accurately!`;
    document.getElementById("choicesContainer").innerHTML = "";

    await window.NumeReadGame.finishGame({
      activityId: "subtraction-sprint",
      area: "math",
      skill: "Subtraction",
      gain: Math.max(6, score * 3),
      performance: score / TOTAL_ROUNDS,
      xp: 30,
      badge: "Subtraction Sprinter"
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty || "easy";
    TOTAL_ROUNDS = (window.NumeReadGame?.getActivityQuestions?.("subtraction-sprint", difficulty) || window.NumeReadTestBanks?.getForActivity("subtraction-sprint", difficulty) || []).length || 10;
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
      window.NumeReadSound?.speak(`${current.a} minus ${current.b}`);
    });
  });
})();
