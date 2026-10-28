(function () {
  const config = {
    "volume-voyage": { title: "Volume Voyage", skill: "Volume", badge: "Volume Voyager", icon: "fa-cube", area: "math", success: "You packed the prisms perfectly!" },
    "gemdas-galaxy": { title: "GEMDAS Galaxy", skill: "GEMDAS", badge: "GEMDAS Guardian", icon: "fa-rocket", area: "math", success: "Your operation order is stellar!" },
    "composite-area-architect": { title: "Composite Area Architect", skill: "Composite area", badge: "Area Architect", icon: "fa-drafting-compass", area: "math", success: "Your floor plan is complete!" }
  }[document.body.dataset.activity];
  if (!config) return;
  const $ = (id) => document.getElementById(id);
  let game, rounds = [], index = 0, score = 0, waiting = false;

  function visual(item) {
    if (document.body.dataset.activity === "volume-voyage") {
      const shown = Math.min(item.answer, 64);
      return `<div class="volume-box" style="--cols:${Math.min(item.length, 8)}">${Array.from({ length: shown }, () => '<i class="volume-cube"></i>').join("")}</div><small>${item.length} × ${item.width} × ${item.height} unit-cube prism</small>`;
    }
    if (document.body.dataset.activity === "composite-area-architect") {
      return `<div class="area-layout" style="--shape-w:${item.width};--shape-h:${item.height};--cut-w:${(item.cutWidth / item.width) * 100}%;--cut-h:${(item.cutHeight / item.height) * 100}%"><div class="area-cutout"></div></div><small>Whole rectangle: ${item.width} m × ${item.height} m; white corner removed: ${item.cutWidth} m × ${item.cutHeight} m</small>`;
    }
    return `<i class="fas fa-star-and-crescent text-4xl"></i><span>${item.expression}</span>`;
  }
  function render() {
    const item = rounds[index]; waiting = false;
    $("roundDisplay").textContent = `${index + 1}/${rounds.length}`;
    $("scoreCount").textContent = score;
    $("progressFill").style.width = `${(index / rounds.length) * 100}%`;
    $("lessonText").textContent = item.tip;
    $("visual").innerHTML = visual(item);
    $("prompt").textContent = item.label || item.prompt;
    $("choices").innerHTML = item.choices.map((choice) => `<button class="mission-choice" data-choice="${choice}">${choice}${document.body.dataset.activity === "volume-voyage" || document.body.dataset.activity === "composite-area-architect" ? " units²".replace("²", document.body.dataset.activity === "volume-voyage" ? "³" : "²") : ""}</button>`).join("");
    $("feedback").textContent = "";
  }
  async function answer(button) {
    if (waiting) return; waiting = true;
    const item = rounds[index], correct = String(button.dataset.choice) === String(item.answer);
    if (correct) score += 1;
    document.querySelectorAll(".mission-choice").forEach((node) => node.disabled = true);
    button.classList.add(correct ? "correct" : "wrong");
    $("scoreCount").textContent = score;
    $("feedback").textContent = correct ? `Correct! ${item.tip}` : `Not quite. The answer is ${item.answer}. ${item.tip}`;
    window.NumeReadSound?.playChime(correct);
    window.NumeReadGame?.tutorFeedback?.({ skill: config.skill, difficulty: game.difficulty, correct, prompt: item.prompt, userAnswer: button.dataset.choice, correctAnswer: item.answer });
    if (index + 1 >= rounds.length) setTimeout(finish, 1250); else { index += 1; setTimeout(render, correct ? 850 : 1450); }
  }
  async function finish() {
    $("progressFill").style.width = "100%"; $("choices").innerHTML = "";
    $("complete").classList.remove("hidden"); $("scoreMessage").textContent = `${config.success} You solved ${score}/${rounds.length} correctly.`;
    await window.NumeReadGame?.finishGame?.({ activityId: document.body.dataset.activity, area: config.area, skill: config.skill, gain: Math.max(6, score * 3), performance: score / rounds.length, xp: 35, badge: config.badge });
    // Use the same Easy → Average → Intermediate → Advanced prompt as every
    // other activity, after the student's result has been safely saved.
    window.setTimeout(() => {
      window.NumeReadGame?.showProgressionOverlay?.({
        performance: score / rounds.length,
        difficulty: game.difficulty,
        dashboardUrl: game.dashboardUrl
      });
    }, 900);
  }
  async function boot() {
    game = await window.NumeReadGame.initGame({ area: config.area });
    rounds = window.NumeReadGame?.getActivityQuestions?.(document.body.dataset.activity, game.difficulty, { seed: game.contentSet }) || window.NumeReadTestBanks.getForActivity(document.body.dataset.activity, game.difficulty, { seed: game.contentSet });
    $("studentNameDisplay").textContent = game.student?.name || "Student"; $("difficultyDisplay").textContent = game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1);
    $("backDashboardBtn").onclick = () => { window.location.href = game.dashboardUrl; }; $("choices").onclick = (event) => { const button = event.target.closest("button[data-choice]"); if (button) answer(button); };
    render();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
