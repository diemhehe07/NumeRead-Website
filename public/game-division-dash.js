(function () {
  let difficulty = "easy", total = 10, round = 0, score = 0, streak = 0, current = null, waiting = false, dashboardUrl = "student.html";
  const byId = (id) => document.getElementById(id);

  function getProblem() {
    const bank = window.NumeReadGame?.getActivityQuestions?.("division-dash", difficulty, { seed: 0 }) || window.NumeReadTestBanks?.getForActivity("division-dash", difficulty, { seed: 0 }) || [];
    const item = bank[round];
    if (!item) throw new Error(`No Division Dash item is available for round ${round + 1}.`);
    return { ...item, answer: Number(item.answer), choices: item.choices.map(Number) };
  }

  function renderGroups() {
    const perGroup = current.answer;
    const shown = Math.min(perGroup, 12);
    byId("groupVisual").innerHTML = Array.from({ length: current.b }, (_, index) => `<div class="share-group"><span class="share-group__title">Group ${index + 1}</span>${"<span class=\"share-token\">●</span>".repeat(shown)}${perGroup > shown ? `<span class="share-more">+${perGroup - shown}</span>` : ""}</div>`).join("");
  }

  function render() {
    waiting = false;
    current = getProblem();
    round += 1;
    byId("roundDisplay").textContent = `${round}/${total}`;
    byId("scoreCount").textContent = score;
    byId("comboCount").textContent = streak;
    byId("progressFill").style.width = `${((round - 1) / total) * 100}%`;
    byId("lessonText").textContent = current.tip;
    byId("promptMath").textContent = `${current.prompt} = ?`;
    renderGroups();
    byId("choicesContainer").innerHTML = current.choices.map((choice) => `<button type="button" class="choice-card" data-choice="${choice}">${choice}</button>`).join("");
    byId("feedbackMsg").textContent = "";
  }

  async function choose(value, button) {
    if (waiting) return;
    waiting = true;
    const correct = Number(value) === current.answer;
    score += correct ? 1 : 0;
    streak = correct ? streak + 1 : 0;
    document.querySelectorAll(".division-choices .choice-card").forEach((item) => item.disabled = true);
    button.classList.add(correct ? "correct-animation" : "wrong-animation");
    byId("scoreCount").textContent = score;
    byId("comboCount").textContent = streak;
    window.NumeReadSound?.playChime(correct);
    const feedback = correct ? `Great sharing! ${current.a} divided into ${current.b} equal groups is ${current.answer}.` : (current.tip ? `Try again: ${current.tip}` : `Try again: ${current.a} shared equally among ${current.b} groups gives ${current.answer} in each group.`);
    window.NumeReadGame?.showAnswerFeedback?.(correct, feedback);
    window.NumeReadGame?.tutorFeedback?.({ skill: "Division", difficulty, correct, prompt: current.prompt, userAnswer: value, correctAnswer: current.answer }).catch(() => {});
    if (round >= total) setTimeout(finish, 1100); else setTimeout(render, correct ? 1000 : 1500);
  }

  async function finish() {
    byId("progressFill").style.width = "100%";
    byId("choicesContainer").innerHTML = "";
    byId("completionPanel").classList.remove("hidden");
    byId("scoreMessage").innerHTML = `You shared <strong>${score}/${total}</strong> sets correctly!`;
    await window.NumeReadGame?.finishGame?.({ activityId: "division-dash", area: "math", skill: "Division", gain: Math.max(6, score * 3), performance: score / total, xp: 30, badge: "Division Dasher" });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty || difficulty;
    total = (window.NumeReadGame?.getActivityQuestions?.("division-dash", difficulty) || window.NumeReadTestBanks?.getForActivity("division-dash", difficulty) || []).length || 10;
    dashboardUrl = game.dashboardUrl || dashboardUrl;
    byId("studentNameDisplay").textContent = game.student?.name || "Student";
    byId("difficultyDisplay").textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    byId("aiStatusSpan").textContent = "AI · division coach";
    render();
    byId("choicesContainer").addEventListener("click", (event) => { const button = event.target.closest(".choice-card"); if (button && !button.disabled) choose(button.dataset.choice, button); });
    byId("backDashboardBtn").addEventListener("click", () => { window.location.href = dashboardUrl; });
    byId("speakBtn").addEventListener("click", () => window.NumeReadSound?.speak(`${current.a} divided by ${current.b}`));
  });
})();
