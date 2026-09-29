// game-multiplication-mountain.js - Multiplication Mountain Game
// Adaptive multiplication practice with mountain-climbing visual metaphor.

(function () {
  "use strict";

  const VALID_LEVELS = ["easy", "average", "intermediate", "advanced"];
  const requestedLevel = String(new URLSearchParams(window.location.search).get("level") || "").toLowerCase();
  const savedLaunchLevel = String(sessionStorage.getItem("numeread_launch_level_multiplication-mountain") || "").toLowerCase();
  const launchLevel = VALID_LEVELS.includes(requestedLevel) ? requestedLevel : (VALID_LEVELS.includes(savedLaunchLevel) ? savedLaunchLevel : "");

  let TOTAL_ROUNDS = 10;
  let difficulty = launchLevel || "easy";
  let contentSet = 0;
  let currentRound = 0;
  let score = 0;
  let combo = 0;
  let gameCompleted = false;
  let waitingForNext = false;
  let studentName = "Learner";
  let dashboardUrl = "student.html";
  let currentProblem = null;

  // DOM refs
  const roundDisplay = document.getElementById("roundDisplay");
  const lessonText = document.getElementById("lessonText");
  const promptText = document.getElementById("promptText");
  const choicesContainer = document.getElementById("choicesContainer");
  const feedbackMsg = document.getElementById("feedbackMsg");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessageSpan = document.getElementById("scoreMessage");
  const studentNameSpan = document.getElementById("studentNameDisplay");
  const difficultySpan = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");
  const scoreCountSpan = document.getElementById("scoreCount");
  const comboCountSpan = document.getElementById("comboCount");
  const altitudeSpan = document.getElementById("altitudeDisplay");
  const skipCountBar = document.getElementById("skipCountBar");
  const arrayVisual = document.getElementById("arrayVisual");
  const climberEmoji = document.getElementById("climberEmoji");
  const speakBtn = document.getElementById("speakBtn");

  // Lesson tips by level
  function getLessonTip() {
    const tips = {
      easy: "Easy: Multiplication is skip-counting! 2 × 3 means count by 2s three times: 2, 4, 6.",
      average: "Average: Think of equal groups. 4 × 5 means 4 groups of 5. Count: 5, 10, 15, 20.",
      intermediate: "Intermediate: Use the break-apart strategy. 6 × 7 = (6 × 5) + (6 × 2) = 30 + 12 = 42.",
      advanced: "Advanced: Use known facts and patterns. 12 × 8 = (10 × 8) + (2 × 8) = 80 + 16 = 96."
    };
    return tips[difficulty] || tips.easy;
  }

  // Generate a problem from test banks or adaptively
  function generateProblem() {
    const bank = window.NumeReadTestBanks?.getForActivity?.("multiplication-mountain", difficulty, { seed: contentSet }) || [];
    const item = bank[currentRound];
    if (!item) {
      // Inline fallback generator
      const ranges = { easy: [2, 5, [1, 5]], average: [2, 9, [1, 9]], intermediate: [6, 12, [6, 12]], advanced: [7, 15, [7, 15]] };
      const [minF, maxF, [minG, maxG]] = ranges[difficulty] || ranges.easy;
      const a = minF + ((currentRound * 3 + 7) % (maxF - minF + 1));
      const b = minG + ((currentRound * 5 + 11) % (maxG - minG + 1));
      const answer = a * b;
      return { a, b, answer, prompt: `${a} \u00d7 ${b}`, choices: buildChoices(answer, a, b), tip: getLessonTip() };
    }
    return { ...item, prompt: item.prompt || `${item.a} \u00d7 ${item.b}` };
  }

  function buildChoices(answer, a, b) {
    const distractors = new Set();
    distractors.add(answer + b);
    distractors.add(Math.max(0, answer - b));
    distractors.add(a + b);
    distractors.add(answer + a);
    const arr = [answer, ...([...distractors].filter(d => d !== answer).slice(0, 3))];
    // Shuffle with deterministic seed
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i * 7 + arr.length * 3 + answer) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map(String);
  }

  // Render skip-count dots
  function renderSkipBar(a, b) {
    skipCountBar.innerHTML = "";
    if (!a || !b || a * b > 120) {
      skipCountBar.innerHTML = `<span style="font-size:0.8rem;color:#7c3aed;font-weight:600;">${a} groups of ${b} = ${a * b}</span>`;
      return;
    }
    for (let i = 1; i <= a; i++) {
      for (let j = 1; j <= b; j++) {
        const dot = document.createElement("div");
        dot.className = "skip-dot";
        dot.textContent = String(i * b);
        if (j === b) dot.classList.add("active");
        skipCountBar.appendChild(dot);
      }
    }
  }

  // Render array visual
  function renderArray(a, b) {
    arrayVisual.innerHTML = "";
    if (!a || !b || a * b > 100) return;
    for (let row = 0; row < a; row++) {
      for (let col = 0; col < b; col++) {
        const dot = document.createElement("div");
        dot.className = "array-dot";
        dot.style.animationDelay = `${(row * b + col) * 0.02}s`;
        arrayVisual.appendChild(dot);
      }
      if (row < a - 1) {
        const br = document.createElement("div");
        br.className = "array-row-break";
        arrayVisual.appendChild(br);
      }
    }
  }

  // Update climber position on the SVG mountain
  function updateClimber(percent) {
    if (!climberEmoji) return;
    // Map 0-100% to mountain path: base (y=170) to peak (y=15)
    const startY = 170, endY = 18;
    const startX = 200, peakX = 200;
    // X oscillates slightly for realism
    const t = percent / 100;
    const y = startY - t * (startY - endY);
    const x = peakX + Math.sin(t * Math.PI) * 0;
    climberEmoji.setAttribute("x", x);
    climberEmoji.setAttribute("y", y);
    if (altitudeSpan) altitudeSpan.textContent = `${Math.round(percent)}%`;
  }

  // Render a round
  function renderRound() {
    if (gameCompleted) return;
    currentProblem = generateProblem();
    const { a, b, answer, prompt, choices, tip } = currentProblem;

    if (lessonText) lessonText.textContent = tip || getLessonTip();
    if (promptText) promptText.textContent = prompt;
    if (roundDisplay) roundDisplay.textContent = `${currentRound + 1}/${TOTAL_ROUNDS}`;
    if (feedbackMsg) feedbackMsg.textContent = "";

    renderSkipBar(a, b);
    renderArray(a, b);

    choicesContainer.innerHTML = "";
    (choices || []).forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice;
      btn.setAttribute("aria-label", `Answer: ${choice}`);
      btn.addEventListener("click", () => handleAnswer(choice, String(answer), btn));
      choicesContainer.appendChild(btn);
    });

    updateClimber((currentRound / TOTAL_ROUNDS) * 100);
  }

  function handleAnswer(chosen, correct, btn) {
    if (waitingForNext || gameCompleted) return;
    waitingForNext = true;
    const isCorrect = String(chosen) === String(correct);

    // Highlight choice
    document.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
    if (isCorrect) {
      btn.classList.add("correct");
      score++;
      combo++;
      if (scoreCountSpan) scoreCountSpan.textContent = score;
      if (comboCountSpan) comboCountSpan.textContent = combo;
      feedbackMsg.textContent = combo >= 3 ? `🔥 ${combo}-streak! Excellent!` : "✅ Correct! Great job!";
      feedbackMsg.style.color = "#065f46";
      window.NumeReadGame?.playCorrect?.();
    } else {
      btn.classList.add("wrong");
      // Highlight correct answer
      document.querySelectorAll(".choice-btn").forEach(b => {
        if (b.textContent === String(correct)) b.classList.add("correct");
      });
      combo = 0;
      if (comboCountSpan) comboCountSpan.textContent = 0;
      feedbackMsg.textContent = `❌ The answer is ${correct}. ${currentProblem.tip || ""}`;
      feedbackMsg.style.color = "#991b1b";
      window.NumeReadGame?.playIncorrect?.();
    }

    currentRound++;
    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(finishGame, 1200);
    } else {
      setTimeout(() => {
        waitingForNext = false;
        renderRound();
      }, 1300);
    }
  }

  function finishGame() {
    gameCompleted = true;
    updateClimber(100);
    choicesContainer.innerHTML = "";
    if (promptText) promptText.textContent = "🏆 Summit!";
    const pct = Math.round((score / TOTAL_ROUNDS) * 100);
    const msg = pct >= 90 ? "Outstanding multiplier!" : pct >= 70 ? "Great climb!" : "Keep practicing!";
    if (scoreMessageSpan) scoreMessageSpan.textContent = `${msg} ${score}/${TOTAL_ROUNDS} correct (${pct}%).`;
    if (completionPanel) completionPanel.classList.remove("hidden");
    window.NumeReadGame?.playVictory?.();
    // Save progress
    window.NumeReadGame?.saveResult?.({
      activityId: "multiplication-mountain",
      skill: "Multiplication",
      score,
      total: TOTAL_ROUNDS,
      difficulty,
      performance: score / TOTAL_ROUNDS
    });
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = dashboardUrl;
    });
  }

  // Speak button
  if (speakBtn) {
    speakBtn.addEventListener("click", () => {
      if (currentProblem) {
        const text = `${currentProblem.a} times ${currentProblem.b} equals question mark`;
        window.NumeReadGame?.speak?.(text) || window.speechSynthesis?.speak?.(new SpeechSynthesisUtterance(text));
      }
    });
  }

  // Boot via game-core
  if (window.NumeReadGame?.init) {
    window.NumeReadGame.init({ area: "mathematics", activityId: "multiplication-mountain" })
      .then((ctx) => {
        if (ctx) {
          difficulty = ctx.difficulty || difficulty;
          contentSet = Number(ctx.contentSet || 0);
          studentName = ctx.student?.name || studentName;
          dashboardUrl = ctx.dashboardUrl || dashboardUrl;
          if (studentNameSpan) studentNameSpan.textContent = studentName;
          if (difficultySpan) difficultySpan.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
          const counts = { easy: 10, average: 15, intermediate: 20, advanced: 25 };
          TOTAL_ROUNDS = counts[difficulty] || 10;
          if (ctx.teacherLesson) {
            if (lessonText) lessonText.textContent = ctx.teacherLesson.content || getLessonTip();
          }
        }
        renderRound();
      })
      .catch(() => renderRound());
  } else {
    renderRound();
  }
})();
