(function () {
  const params = new URLSearchParams(window.location.search);
  const studentName = params.get("studentName") || "Maria R.";
  const grade = params.get("grade") || "Grade 2";
  let student = null;
  let finished = false;

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
    const difficulty = difficultyFor(options.area);
    const aiStatus = "Learning support";
    setText("[data-student-name]", student.name);
    setText("#studentNameDisplay", student.name);
    setText("[data-difficulty]", difficulty);
    setText("#difficultyDisplay", difficulty);
    setText("[data-ai-status]", aiStatus);
    setText("#aiStatusSpan", aiStatus);
    localStorage.setItem("numeread_difficulty", difficulty);
    return { student, difficulty, query: learnerQuery(), dashboardUrl: `student.html?${learnerQuery()}` };
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
