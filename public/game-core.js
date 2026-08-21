(function () {
  const params = new URLSearchParams(window.location.search);
  const studentName = params.get("studentName") || "Maria R.";
  const grade = params.get("grade") || "Grade 2";
  let student = null;
  let finished = false;

  const ACTIVITY_DETAILS = {
    "game-reading-bridge.html": { id: "reading-bridge", skill: "Blends" },
    "game-math-ninja.html": { id: "math-ninja", skill: "Addition facts" },
    "game-word-bakery.html": { id: "word-bakery", skill: "Word problems" },
    "game-sentence-builder.html": { id: "sentence-builder", skill: "Reading fluency" },
    "game-vocab-quest.html": { id: "vocab-quest", skill: "Vocabulary" },
    "game-comprehension-trail.html": { id: "comprehension-trail", skill: "Comprehension" },
    "game-subtraction-sprint.html": { id: "subtraction-sprint", skill: "Subtraction" },
    "game-place-value-builder.html": { id: "place-value-builder", skill: "Place value" }
  };
  const STAGES = ["easy", "average", "intermediate", "advanced"];

  function pct(value) {
    return Math.max(0, Math.min(100, Math.round(value || 0)));
  }

  function difficultyFor(area) {
    const score = area === "reading" ? student.reading : student.math;
    if (window.NumeReadAdaptiveModel) {
      return window.NumeReadAdaptiveModel.difficulty(score, Boolean(student.pretest));
    }
    if (!student.pretest) return "easy";
    if (score < 50) return "easy";
    if (score < 75) return "average";
    if (score < 90) return "intermediate";
    return "advanced";
  }

  function activityDetails() {
    return ACTIVITY_DETAILS[window.location.pathname.split("/").pop()] || { id: "practice", skill: "" };
  }

  function adaptiveDifficulty(currentStudent, area, skill, progress) {
    const mastery = Number(currentStudent.mastery?.[skill] ?? (area === "reading" ? currentStudent.reading : currentStudent.math) ?? 0);
    const earnedStage = mastery < 50 ? 0 : mastery < 75 ? 1 : mastery < 90 ? 2 : 3;
    const storedStage = STAGES.indexOf(progress?.difficulty);
    return STAGES[Math.max(earnedStage, storedStage < 0 ? 0 : storedStage)];
  }

  function learnerQuery() {
    return new URLSearchParams({ studentName: student.name, grade: student.grade }).toString();
  }

  function setText(selector, text) {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  }

  async function initGame(options) {
    let sessionStudent;
    try {
      sessionStudent = JSON.parse(sessionStorage.getItem("numeread_student") || "null");
    } catch (error) {
      sessionStudent = null;
    }
    if (!sessionStudent?.name || !sessionStudent?.lrn) {
      window.location.replace("index.html");
      throw new Error("Sign in is required.");
    }
    student = await window.NumeReadData.authenticateStudent(sessionStudent.name, sessionStudent.lrn);
    if (!student || student.id !== sessionStudent.id) {
      sessionStorage.removeItem("numeread_student");
      window.location.replace("index.html");
      throw new Error("Your sign-in session is no longer valid.");
    }
    const details = activityDetails();
    const progress = student.learningProgress?.[details.id] || {};
    const difficulty = adaptiveDifficulty(student, options.area, details.skill, progress);
    const aiStatus = "Learning support";
    setText("[data-student-name]", student.name);
    setText("#studentNameDisplay", student.name);
    setText("[data-difficulty]", difficulty);
    setText("#difficultyDisplay", difficulty);
    setText("[data-ai-status]", aiStatus);
    setText("#aiStatusSpan", aiStatus);
    localStorage.setItem("numeread_difficulty", difficulty);
    return { student, difficulty, contentSet: Number(progress.contentSet || 0), attempt: Number(progress.attempts || 0) + 1, query: learnerQuery(), dashboardUrl: `student.html?${learnerQuery()}` };
  }

  async function tutorFeedback(context) {
    const feedback = await window.NumeReadAI.askTutor(context);
    const feedbackNode = document.querySelector("[data-feedback]");
    if (feedbackNode) feedbackNode.textContent = feedback;
    return feedback;
  }

  async function finishGame(result) {
    if (finished) return;
    finished = true;
    const activityId = result.activityId;
    if (!student.activities.includes(activityId)) student.activities.push(activityId);
    student.xp += Number(result.xp || 0);
    student.streak = Math.max(1, student.streak);
    if (student.xp >= 100 && !student.badges.includes("XP Explorer")) student.badges.push("XP Explorer");
    if (result.badge && !student.badges.includes(result.badge)) student.badges.push(result.badge);

    if (result.area === "reading") {
      student.reading = pct(student.reading + result.gain);
      student.wpm[student.wpm.length - 1] = Number(student.wpm[student.wpm.length - 1] || 0) + Math.max(1, Math.round(result.gain / 2));
    } else {
      student.math = pct(student.math + result.gain);
    }

    if (result.skill && student.mastery[result.skill] !== undefined) {
      student.mastery[result.skill] = pct(student.mastery[result.skill] + result.gain + 2);
    }

    student.gaps = student.gaps.filter((gap) => gap !== result.skill && !(result.clearGaps || []).includes(gap));
    const previous = student.learningProgress?.[activityId] || {};
    const performance = Number.isFinite(Number(result.performance))
      ? Math.max(0, Math.min(1, Number(result.performance)))
      : Math.max(0.35, Math.min(0.95, Number(result.gain || 0) / 12));
    const previousStage = Math.max(0, STAGES.indexOf(previous.difficulty || difficultyFor(result.area)));
    const nextStage = performance >= 0.8 ? Math.min(STAGES.length - 1, previousStage + 1) : performance < 0.5 ? Math.max(0, previousStage - 1) : previousStage;
    student.learningProgress = {
      ...(student.learningProgress || {}),
      [activityId]: {
        attempts: Number(previous.attempts || 0) + 1,
        contentSet: Number(previous.contentSet || 0) + 1,
        difficulty: STAGES[nextStage],
        lastPerformance: performance,
        lastCompletedAt: new Date().toISOString()
      }
    };
    student = await window.NumeReadData.saveStudent(student);
    await window.NumeReadData.saveActivityLog(student, result);
    // Keep the adaptive API informed after every completed game. The local
    // Firestore update above remains the source of truth if the API is offline.
    try {
      const baseUrl = window.NumeReadAI?.apiBaseUrl?.() || "http://127.0.0.1:8000";
      await fetch(`${baseUrl}/record-learning-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: String(student.id),
          content_id: activityId,
          concepts: result.skill ? [result.skill] : [],
          performance: Math.max(0, Math.min(1, Number(result.gain || 0) / 10)),
          time_spent: Number(result.timeSpent || 0),
          engagement_level: 0.7,
          interaction_count: 1,
          content_type: "game"
        })
      });
    } catch (error) {
      console.warn("NumeRead API session sync unavailable.", error);
    }
    const doneNode = document.querySelector("[data-done]");
    if (doneNode) doneNode.classList.remove("hidden");
  }

  window.NumeReadGame = { initGame, tutorFeedback, finishGame };
})();
