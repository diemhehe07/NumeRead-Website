// game-lesson-quest.js - Auto-Generated Playable Game from Teacher Lessons & Learning Materials
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const searchParams = new URLSearchParams(window.location.search);
  const materialId = searchParams.get("materialId") || "";
  const isTeacherPreview = searchParams.get("preview") === "teacher";

  const VALID_LEVELS = ["easy", "average", "intermediate", "advanced"];
  const requestedLevel = String(searchParams.get("level") || "").toLowerCase();

  let material = null;
  let activityId = materialId ? `lesson-game-${materialId}` : "lesson-game-custom";
  let meta = { activityId: "reading-bridge", skill: "Reading", area: "reading", type: "Reading" };
  let difficulty = VALID_LEVELS.includes(requestedLevel) ? requestedLevel : "easy";
  let contentSet = 0;
  let dashboardUrl = isTeacherPreview ? "teacher.html" : "student.html";

  let rounds = [];
  let index = 0;
  let score = 0;
  let streak = 0;
  let gameCompleted = false;
  let waitingForNext = false;

  // Ensure teacher preview works even when no student session is active
  if (isTeacherPreview) {
    try {
      const existing = JSON.parse(sessionStorage.getItem("numeread_student") || "null");
      if (!existing?.name || !existing?.section || !existing?.studentId) {
        sessionStorage.setItem("numeread_student", JSON.stringify({
          id: "teacher-preview-student",
          name: "Classroom Preview",
          grade: "Grade 2",
          section: searchParams.get("section") || "All Sections",
          studentId: "PREVIEW-01",
          reading: 75,
          math: 75,
          mastery: {},
          activities: []
        }));
      }
    } catch (_) {}
  }

  function escapeHtml(value) {
    const span = document.createElement("span");
    span.textContent = String(value || "");
    return span.innerHTML;
  }

  function resolveMaterialSynchronously() {
    const cached = window.NumeReadData?.getCachedLearningMaterials?.() || [];
    if (materialId) {
      return cached.find((item) => item.id === materialId) || null;
    }
    return cached.find((item) => !item.hiddenBuiltInId) || null;
  }

  function render() {
    if (index >= rounds.length) {
      finishGameSession();
      return;
    }
    waitingForNext = false;
    const item = rounds[index];
    $("roundDisplay").textContent = `${index + 1}/${rounds.length}`;
    $("scoreCount").textContent = String(score);
    $("comboCount").textContent = String(streak);
    $("feedbackMsg").textContent = "";
    $("feedbackMsg").className = "feedback-message";

    const contextBox = $("contextBox");
    if (contextBox) {
      if (item.context) {
        contextBox.textContent = item.context;
        contextBox.classList.remove("hidden");
      } else {
        contextBox.textContent = "";
        contextBox.classList.add("hidden");
      }
    }

    $("questionPrompt").textContent = item.prompt || "Choose the correct answer:";

    const letters = ["A", "B", "C", "D"];
    const choices = Array.isArray(item.choices) ? item.choices : [String(item.answer)];
    $("choicesContainer").innerHTML = choices.map((choice, idx) => `
      <button type="button" class="choice-btn" data-choice="${escapeHtml(String(choice))}">
        <span class="choice-letter">${letters[idx] || idx + 1}.</span>
        <span>${escapeHtml(String(choice))}</span>
      </button>
    `).join("");

    $("choicesContainer").querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleAnswer(btn, item));
    });
  }

  function handleAnswer(selectedBtn, item) {
    if (waitingForNext || gameCompleted) return;
    waitingForNext = true;

    const chosen = String(selectedBtn.dataset.choice || "").trim();
    const correctAns = String(item.answer || "").trim();
    const isCorrect = chosen.toLowerCase() === correctAns.toLowerCase();

    const allBtns = $("choicesContainer").querySelectorAll(".choice-btn");
    allBtns.forEach((btn) => {
      btn.disabled = true;
      const btnVal = String(btn.dataset.choice || "").trim();
      if (btnVal.toLowerCase() === correctAns.toLowerCase()) {
        btn.classList.add("correct-highlight");
      } else if (btn === selectedBtn && !isCorrect) {
        btn.classList.add("wrong-highlight");
      }
    });

    const feedbackEl = $("feedbackMsg");
    if (isCorrect) {
      score += 1;
      streak += 1;
      window.NumeReadGame?.playCorrect?.();
      window.NumeReadGame?.showAnswerFeedback?.(true, `Correct! "${correctAns}" is the right answer.`);
      if (feedbackEl) {
        feedbackEl.textContent = `✓ Correct! "${correctAns}" is right.`;
        feedbackEl.className = "feedback-message feedback-success";
      }
    } else {
      streak = 0;
      window.NumeReadGame?.playIncorrect?.();
      window.NumeReadGame?.showAnswerFeedback?.(false, `The correct answer is "${correctAns}". ${item.hint || ""}`);
      if (feedbackEl) {
        feedbackEl.textContent = `✗ The correct answer is "${correctAns}". ${item.hint ? "Tip: " + item.hint : ""}`;
        feedbackEl.className = "feedback-message feedback-error";
      }
    }

    $("scoreCount").textContent = String(score);
    $("comboCount").textContent = String(streak);

    setTimeout(() => {
      index += 1;
      render();
    }, isCorrect ? 1000 : 1600);
  }

  async function finishGameSession() {
    if (gameCompleted) return;
    gameCompleted = true;

    const total = rounds.length || 10;
    const performance = total > 0 ? score / total : 0;
    const pct = Math.round(performance * 100);

    $("completionPanel")?.classList.remove("hidden");
    if ($("scoreMessage")) {
      $("scoreMessage").textContent = `You scored ${score}/${total} (${pct}%) on ${difficulty.toUpperCase()} level!`;
    }

    try {
      if (window.NumeReadGame?.finishGame) {
        await window.NumeReadGame.finishGame({
          activityId,
          area: meta.area,
          skill: meta.skill,
          gain: performance >= 0.7 ? 10 : 6,
          performance,
          difficulty,
          xp: 35,
          badge: "Lesson Explorer",
          clearGaps: [meta.skill]
        });
      }
    } catch (_) {}

    setTimeout(() => {
      window.NumeReadGame?.showProgressionOverlay?.({
        performance,
        difficulty,
        dashboardUrl: isTeacherPreview ? "teacher.html" : dashboardUrl
      });
    }, 1500);
  }

  async function init() {
    material = resolveMaterialSynchronously();
    if (!material && window.NumeReadData?.getLearningMaterials) {
      const all = await window.NumeReadData.getLearningMaterials();
      material = materialId
        ? all.find((item) => item.id === materialId)
        : all.find((item) => !item.hiddenBuiltInId);
    }

    if (!material) {
      material = {
        id: materialId || "custom",
        title: searchParams.get("title") || "Teacher Lesson",
        area: searchParams.get("area") || "Reading",
        level: "Easy",
        content: "Use the clues and lesson concepts from your teacher to answer each round.",
        keywords: []
      };
    }

    activityId = window.NumeReadLessonGame.getActivityId(material);
    meta = window.NumeReadLessonGame.resolveMeta(material);
    document.body.dataset.activity = activityId;

    const gameTitle = window.NumeReadLessonGame.getGameTitle(material);
    document.title = `NumeRead · ${gameTitle}`;
    if ($("gameTitleHeading")) $("gameTitleHeading").textContent = `${gameTitle} ✨`;
    if ($("gameSkillBadge")) {
      $("gameSkillBadge").innerHTML = `<i class="fas ${meta.icon || "fa-wand-magic-sparkles"}"></i> ${escapeHtml(meta.skill)} · Teacher Lesson Game`;
    }
    if ($("gameSubhead")) {
      $("gameSubhead").textContent = `Generated from your teacher's lesson: “${material.title}”`;
    }

    const noteSummary = String(material.content || material.summary || "Use your teacher's lesson steps to solve each round.").trim();
    if ($("lessonText")) {
      $("lessonText").textContent = noteSummary.length > 180 ? `${noteSummary.slice(0, 180)}…` : noteSummary;
    }
    if ($("lessonRefDrawer")) {
      $("lessonRefDrawer").textContent = `📚 Lesson Reference (${material.title}):\n${noteSummary}`;
    }
    if ($("toggleLessonRefBtn")) {
      $("toggleLessonRefBtn").onclick = () => {
        $("lessonRefDrawer")?.classList.toggle("hidden");
      };
    }

    try {
      if (window.NumeReadGame?.initGame) {
        const game = await window.NumeReadGame.initGame({ activityId, area: meta.area });
        difficulty = VALID_LEVELS.includes(requestedLevel) ? requestedLevel : (game.difficulty || "easy");
        contentSet = game.contentSet || 0;
        if (!isTeacherPreview && game.dashboardUrl) {
          dashboardUrl = game.dashboardUrl;
        }
        if ($("studentNameDisplay") && game.student?.name) {
          $("studentNameDisplay").textContent = game.student.name;
        }
      }
    } catch (_) {}

    if ($("difficultyDisplay")) {
      $("difficultyDisplay").textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
    if ($("aiStatusSpan")) {
      $("aiStatusSpan").textContent = `${meta.skill} · ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    }

    rounds = window.NumeReadLessonGame.generateQuestions(material, difficulty, contentSet);
    index = 0;
    score = 0;
    streak = 0;
    gameCompleted = false;
    render();

    if ($("speakBtn")) {
      $("speakBtn").onclick = () => {
        const current = rounds[index];
        if (!current) return;
        const speech = `${current.context ? current.context + ". " : ""}${current.prompt}. Choices: ${(current.choices || []).join(", ")}.`;
        if (window.NumeReadSound?.speak) {
          window.NumeReadSound.speak(speech);
        } else if (typeof window.speechSynthesis !== "undefined") {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(speech));
        }
      };
    }

    if ($("backDashboardBtn")) {
      $("backDashboardBtn").onclick = () => {
        window.location.href = isTeacherPreview ? "teacher.html" : dashboardUrl;
      };
    }
  }

  init();
})();

