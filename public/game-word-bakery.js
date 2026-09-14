// game-word-bakery.js - Enhanced Game Logic for Word Problem Bakery

window.NumeReadBakeryProblems = {
  getProblemsForDifficulty: (difficulty, seed = 0) => {
    const bank = window.NumeReadGame?.getActivityQuestions?.("word-bakery", difficulty, { seed }) || window.NumeReadTestBanks?.getForActivity("word-bakery", difficulty, { seed });
    if (!Array.isArray(bank) || !bank.length) throw new Error("Word Problem Bakery test bank is unavailable.");
    return bank.map((p, idx) => ({ ...p, id: idx }));
  }
};

window.NumeReadAI = window.NumeReadAI || {
  generateHint: (problem) => {
    const hints = {
      add: "Look for keywords like 'total', 'together', 'in all', 'altogether'. That means we join groups!",
      subtract: "Look for keywords like 'remain', 'left', 'fewer', 'sold'. That means we take away!"
    };
    return hints[problem?.correctOp] || "Read carefully: do we combine items or take them away?";
  },
  isEnabled: true
};

(function() {
  // DOM Elements
  const storyDiv = document.getElementById("storyText");
  const lessonTextSpan = document.getElementById("lessonText");
  const feedbackDiv = document.getElementById("feedbackMsg");
  const opAdd = document.getElementById("opAddBtn");
  const opSubtract = document.getElementById("opSubtractBtn");
  const choicesContainer = document.getElementById("choicesContainer");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessageSpan = document.getElementById("scoreMessage");
  const studentNameSpan = document.getElementById("studentNameDisplay");
  const difficultySpan = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");
  const speakBtn = document.getElementById("speakBtn");
  const roundDisplay = document.getElementById("roundDisplay");
  const scoreCountEl = document.getElementById("scoreCount");
  const comboCountEl = document.getElementById("comboCount");
  const bakeryTray = document.getElementById("bakeryTray");

  // Game State
  let currentProblemsList = [];
  let currentProblemIndex = 0;
  let currentProblem = null;
  let selectedOperation = null;
  let score = 0;
  let streak = 0;
  let totalQuestions = 10;
  let gameCompleted = false;
  let difficulty = "easy";
  let studentName = "Baker";
  let dashboardUrl = "student.html";
  let contentSet = 0;

  function renderBakeryTray(problem) {
    if (!bakeryTray) return;
    const emoji = problem.item || "🥐";
    const n1 = problem.num1 || 6;
    const n2 = problem.num2 || 3;
    const isAdd = problem.correctOp === "add";

    let html = `<div style="text-align:center; margin-bottom: 6px;">`;
    html += `<span class="badge" style="background:#fef3c7; color:#92400e; font-size:12px; font-weight:700; padding:3px 10px; border-radius:12px;">`;
    html += `🥐 Chef's Display Tray: Group A (${n1}) ${isAdd ? "+ Group B (" + n2 + ")" : "- Sold (" + n2 + ")"}`;
    html += `</span></div>`;

    html += `<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px; max-width:480px; margin:0 auto;">`;
    const maxRender = Math.min(n1, 15);
    for (let i = 0; i < maxRender; i++) {
      html += `<span style="font-size:24px; animation: popIn 0.3s ease-out; display:inline-block;" title="Item ${i + 1}">${emoji}</span>`;
    }
    if (n1 > 15) {
      html += `<span style="align-self:center; font-size:12px; font-weight:800; color:#b45309; background:#fff; padding:2px 8px; border-radius:8px; border:1px solid #fde68a;">+${n1 - 15} more</span>`;
    }

    if (isAdd) {
      html += `<div style="width:100%; height:1px; background:#fde68a; margin:4px 0;"></div>`;
      const maxRender2 = Math.min(n2, 10);
      for (let j = 0; j < maxRender2; j++) {
        html += `<span style="font-size:22px; opacity:0.85; filter: hue-rotate(40deg);" title="Added ${j + 1}">✨${emoji}</span>`;
      }
      if (n2 > 10) {
        html += `<span style="align-self:center; font-size:12px; font-weight:800; color:#047857; background:#fff; padding:2px 8px; border-radius:8px; border:1px solid #a7f3d0;">+${n2 - 10} more</span>`;
      }
    } else {
      html += `<div style="width:100%; height:1px; background:#fde68a; margin:4px 0;"></div>`;
      html += `<span style="font-size:11px; font-weight:700; color:#dc2626; align-self:center;">🔻 ${n2} taken away/sold</span>`;
    }

    html += `</div>`;
    bakeryTray.innerHTML = html;
  }

  function updateOperationButtonsActive(selected) {
    if (selected === 'add') {
      opAdd.classList.add("op-active");
      opSubtract.classList.remove("op-active");
    } else if (selected === 'subtract') {
      opSubtract.classList.add("op-active");
      opAdd.classList.remove("op-active");
    } else {
      opAdd.classList.remove("op-active");
      opSubtract.classList.remove("op-active");
    }
  }

  function generateChoices(correctAnswer) {
    const set = new Set();
    set.add(correctAnswer);
    const offsets = [-2, 2, -1, 1, -5, 5, -10, 10];
    for (const offset of offsets) {
      const candidate = correctAnswer + offset;
      if (candidate > 0 && candidate !== correctAnswer) {
        set.add(candidate);
      }
      if (set.size >= 4) break;
    }
    while (set.size < 4) {
      const r = Math.max(1, correctAnswer + Math.floor(Math.random() * 9) - 4);
      set.add(r);
    }
    const arr = Array.from(set);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderChoices(problem) {
    if (!choicesContainer) return;
    choicesContainer.innerHTML = "";
    const choices = generateChoices(problem.answer);

    choices.forEach(val => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-card";
      btn.innerHTML = `<span class="choice-val">${val}</span><span class="choice-sub">baked items</span>`;
      btn.onclick = () => handleChoiceSelect(val, btn);
      choicesContainer.appendChild(btn);
    });
  }

  function loadCurrentProblem() {
    if (currentProblemIndex >= totalQuestions) {
      completeGame();
      return;
    }
    currentProblem = currentProblemsList[currentProblemIndex];
    storyDiv.innerText = currentProblem.story;
    feedbackDiv.innerHTML = "";
    selectedOperation = null;
    updateOperationButtonsActive(null);
    storyDiv.classList.remove("correct-flash");

    if (roundDisplay) {
      roundDisplay.innerText = `${currentProblemIndex + 1}/${totalQuestions}`;
    }

    renderBakeryTray(currentProblem);
    renderChoices(currentProblem);
  }

  async function handleChoiceSelect(chosenValue, btnEl) {
    if (gameCompleted || !currentProblem) return;

    if (!selectedOperation) {
      feedbackDiv.innerHTML = `<span style="color:#d97706;"><i class="fas fa-hand-pointer"></i> First choose an operation: <strong>Add ➕</strong> or <strong>Subtract ➖</strong>!</span>`;
      if (window.NumeReadSound) window.NumeReadSound.playChime(false);
      return;
    }

    const isCorrectOp = (selectedOperation === currentProblem.correctOp);
    const isCorrectVal = (chosenValue === currentProblem.answer);

    if (isCorrectOp && isCorrectVal) {
      score++;
      streak++;
      if (scoreCountEl) scoreCountEl.innerText = score;
      if (comboCountEl) comboCountEl.innerText = streak;

      try {
        if (window.NumeReadSound) {
          window.NumeReadSound.playChime(true);
          if (streak >= 3 && typeof window.NumeReadSound.triggerConfetti === "function") {
            window.NumeReadSound.triggerConfetti();
          }
        }
      } catch (e) {}

      btnEl.style.background = "#dcfce7";
      btnEl.style.borderColor = "#16a34a";
      feedbackDiv.innerHTML = `<span style="color:#15803d; font-weight:700;"><i class="fas fa-check-circle"></i> Outstanding Chef! ${selectedOperation === 'add' ? 'Addition' : 'Subtraction'} gives ${currentProblem.answer}!</span>`;
      storyDiv.classList.add("correct-flash");

      // Disable choice buttons during advance
      const allBtns = choicesContainer.querySelectorAll(".choice-card");
      allBtns.forEach(b => b.disabled = true);

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(true, `Great job! ${currentProblem.answer} baked items.`);
      }

      currentProblemIndex++;
      setTimeout(() => {
        if (currentProblemIndex < totalQuestions) {
          loadCurrentProblem();
        } else {
          completeGame();
        }
      }, 1200);
    } else {
      streak = 0;
      if (comboCountEl) comboCountEl.innerText = streak;
      if (window.NumeReadSound) window.NumeReadSound.playChime(false);

      btnEl.style.background = "#fee2e2";
      btnEl.style.borderColor = "#dc2626";

      let tip = "";
      if (!isCorrectOp && !isCorrectVal) {
        tip = `Story needs ${currentProblem.correctOp === 'add' ? 'addition (combine)' : 'subtraction (take away)'}. Review the numbers and try again!`;
      } else if (!isCorrectOp) {
        tip = `The number was close, but the operation should be ${currentProblem.correctOp === 'add' ? 'Add (+)' : 'Subtract (-)'}.`;
      } else {
        tip = `Operation is correct, but calculate the count again carefully!`;
      }

      feedbackDiv.innerHTML = `<span style="color:#dc2626; font-weight:600;"><i class="fas fa-times-circle"></i> ${tip}</span>`;
      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(false, tip);
      }
    }
  }

  function handleOperation(op) {
    if (gameCompleted) return;
    selectedOperation = op;
    updateOperationButtonsActive(op);
    feedbackDiv.innerHTML = `Operation selected: <strong>${op === 'add' ? 'Addition ➕' : 'Subtraction ➖'}</strong>. Now tap the matching recipe answer!`;
  }

  async function completeGame() {
    gameCompleted = true;
    const percent = Math.round((score / totalQuestions) * 100);
    scoreMessageSpan.innerText = `🥐 Score: ${score} / ${totalQuestions} (${percent}%) 🎉`;
    completionPanel.classList.remove("hidden");
    feedbackDiv.innerHTML = `🏆 Star Baker! You completed all ${totalQuestions} bakery orders.`;

    try {
      if (window.NumeReadSound) {
        window.NumeReadSound.playVictory();
        if (typeof window.NumeReadSound.triggerConfetti === "function") {
          window.NumeReadSound.triggerConfetti();
        }
      }
    } catch (e) {}

    if (choicesContainer) choicesContainer.innerHTML = "";
    if (bakeryTray) bakeryTray.innerHTML = `<div style="text-align:center; font-size:40px; padding:10px;">🥐 🧁 🍩 🥖 🎂</div>`;

    try {
      if (window.NumeReadGame?.finishGame) {
        await window.NumeReadGame.finishGame({
          activityId: "word-bakery",
          area: "combined",
          skill: "Word problems",
          gain: score === totalQuestions ? 10 : 6,
          performance: totalQuestions ? score / totalQuestions : 0,
          xp: 35,
          badge: "Word Problem Baker"
        });
      }
    } catch(e) {
      console.log("Progress saved locally only", e);
    }
  }

  async function initGame() {
    if (window.NumeReadGame && window.NumeReadGame.initGame) {
      try {
        const game = await window.NumeReadGame.initGame({ area: "combined" });
        difficulty = game.difficulty || difficulty;
        contentSet = game.contentSet || 0;
        studentName = game.student?.name || studentName;
        dashboardUrl = game.dashboardUrl || (game.query ? `student.html?${game.query}` : dashboardUrl);
      } catch(e) {
        console.log("Using local bakery context");
      }
    }

    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · active`;

    const problems = window.NumeReadGame?.getActivityQuestions?.("word-bakery", difficulty, { seed: contentSet }) || window.NumeReadTestBanks?.getForActivity("word-bakery", difficulty, { seed: contentSet }) || [];
    currentProblemsList = problems;
    totalQuestions = currentProblemsList.length || 10;

    currentProblemIndex = 0;
    score = 0;
    streak = 0;
    gameCompleted = false;
    selectedOperation = null;
    updateOperationButtonsActive(null);
    completionPanel.classList.add("hidden");
    feedbackDiv.innerHTML = "";

    if (scoreCountEl) scoreCountEl.innerText = "0";
    if (comboCountEl) comboCountEl.innerText = "0";

    const lessonMsg = {
      easy: "Easy: Use Addition (+) when groups join and Subtraction (-) when items are sold or eaten.",
      average: "Average: Check keywords like total or remaining to choose the correct recipe calculation.",
      intermediate: "Intermediate: Watch out for larger counts and double-check your arithmetic.",
      advanced: "Advanced: Multi-step bakery inventory challenges with higher order counts!"
    };
    lessonTextSpan.innerText = lessonMsg[difficulty] || lessonMsg.easy;

    if (speakBtn) {
      speakBtn.onclick = () => {
        if (currentProblem?.story && window.NumeReadSound) {
          window.NumeReadSound.speak(currentProblem.story);
        }
      };
    }

    if (totalQuestions > 0) {
      loadCurrentProblem();
    }
  }

  opAdd.addEventListener("click", () => handleOperation("add"));
  opSubtract.addEventListener("click", () => handleOperation("subtract"));
  backBtn.addEventListener("click", () => {
    window.location.href = dashboardUrl;
  });

  initGame();
})();
