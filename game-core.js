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
    if (!student.pretest) return "starter";
    if (score < 50) return "support";
    if (score < 75) return "practice";
    return "challenge";
  }

  function learnerQuery() {
    return new URLSearchParams({ studentName: student.name, grade: student.grade }).toString();
  }

  async function initGame(options) {
    student = await window.NumeReadData.getOrCreateStudent(studentName, grade);
    document.querySelector("[data-student-name]").textContent = student.name;
    document.querySelector("[data-difficulty]").textContent = difficultyFor(options.area);
    document.querySelector("[data-ai-status]").textContent = window.NumeReadAI.configured() ? "AI tutor connected" : "Local tutor mode";
    return { student, difficulty: difficultyFor(options.area), query: learnerQuery() };
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
    const doneNode = document.querySelector("[data-done]");
    if (doneNode) doneNode.classList.remove("hidden");
  }

  window.NumeReadGame = { initGame, tutorFeedback, finishGame };
})();
