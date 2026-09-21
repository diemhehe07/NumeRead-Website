(function () {
  const $ = (id) => document.getElementById(id);
  let rounds = [], index = 0, built = [], score = 0, streak = 0;
  let difficulty = "easy", dashboard = "student.html", completed = false;

  function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
  function updateStats() { $("scoreCount").textContent = score; $("comboCount").textContent = streak; }

  function render() {
    const item = rounds[index];
    if (!item) { finish(); return; }
    $("roundDisplay").textContent = `${index + 1}/${rounds.length}`;
    $("promptText").textContent = "Arrange the letters to spell the word";
    $("lessonText").textContent = `Say it slowly: ${item.word}. Then build it from left to right.`;
    built = [];
    $("builtWord").textContent = "_ ".repeat(item.word.length).trim();
    $("checkBtn").disabled = true;
    $("feedbackMsg").textContent = "";
    $("letterBank").innerHTML = shuffle(item.word.split("")).map((letter, position) => `<button type="button" class="choice-card" data-letter="${letter}" data-position="${position}">${letter.toUpperCase()}</button>`).join("");
    document.querySelectorAll("[data-letter]").forEach((button) => button.addEventListener("click", () => {
      built.push(button.dataset.letter); button.disabled = true;
      $("builtWord").textContent = built.join("").toUpperCase();
      $("checkBtn").disabled = built.length !== item.word.length;
    }));
  }

  function check() {
    const item = rounds[index];
    const correct = built.join("").toLowerCase() === item.answer.toLowerCase();
    if (correct) { score += 1; streak += 1; $("feedbackMsg").textContent = "Correct! Great spelling."; }
    else { streak = 0; $("feedbackMsg").textContent = `The correct spelling is ${item.answer.toUpperCase()}.${item.tip ? " Tip: " + item.tip : ""}`; }
    updateStats();
    document.querySelectorAll(".choice-card").forEach((button) => { button.disabled = true; });
    window.NumeReadGame?.showAnswerFeedback?.(correct, correct ? "You built the word correctly." : `Review the order: ${item.answer}.`);
    window.setTimeout(() => { index += 1; render(); }, correct ? 850 : 1400);
  }

  async function finish() {
    if (completed) return; completed = true;
    const performance = rounds.length ? score / rounds.length : 0;
    $("completionPanel").classList.remove("hidden");
    $("scoreMessage").textContent = `Score: ${score}/${rounds.length} (${Math.round(performance * 100)}%)`;
    $("checkBtn").disabled = true;
    $("feedbackMsg").textContent = "Saving your completed level...";
    try {
      await window.NumeReadGame?.finishGame?.({ activityId: "spelling-sprint", area: "reading", skill: "Spelling", gain: Math.max(4, score), performance, xp: 25, badge: "Spelling Star" });
      const nextLevel = performance >= 0.8 ? "The next level is unlocked." : "Score 80% or higher to unlock the next level.";
      $("feedbackMsg").textContent = `Level saved. ${nextLevel}`;
    } catch (error) {
      // Keep the result visible instead of silently leaving the learner on
      // Easy. The shared save layer already has a local-storage fallback.
      console.error("Spelling Sprint progress could not be saved.", error);
      $("feedbackMsg").textContent = "Your score is complete, but saving the next level failed. Please try again.";
      completed = false;
    }
  }

  async function init() {
    const game = await window.NumeReadGame.initGame({ area: "reading" });
    difficulty = game.difficulty || difficulty; dashboard = game.dashboardUrl || dashboard;
    $("studentNameDisplay").textContent = game.student?.name || "Student";
    $("difficultyDisplay").textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    rounds = window.NumeReadGame?.getActivityQuestions?.("spelling-sprint", difficulty, { seed: game.contentSet }) || window.NumeReadTestBanks.getForActivity("spelling-sprint", difficulty, { seed: game.contentSet });
    if (!rounds.length) throw new Error("Spelling test bank is unavailable.");
    updateStats(); render();
  }

  $("checkBtn").addEventListener("click", check);
  $("backDashboardBtn").addEventListener("click", () => { window.location.href = dashboard; });
  init().catch((error) => { $("feedbackMsg").textContent = "Unable to load the spelling game."; console.error(error); });
})();
