(function () {
  const API_BASE_KEY = "numeread_api_base_url";

  function apiBaseUrl() {
    const configuredUrl = localStorage.getItem(API_BASE_KEY);
    if (configuredUrl) return configuredUrl.replace(/\/$/, "");
    // The local launcher serves the website from FastAPI on port 8000.
    if (window.location.port === "8000") return window.location.origin;
    return "http://127.0.0.1:8000";
  }

  function configured() {
    return true;
  }

  function fallbackFeedback(context) {
    if (context.correct) return "Great work. Explain the pattern once more, then try the next challenge.";
    if (context.skill === "Blends") return "Look at the first two letters. Say each sound slowly, then blend them together.";
    if (context.skill === "Reading fluency") return "Read in short phrases. Pause at commas and periods.";
    if (context.skill === "Word problems") return "Find the numbers, circle the question, then decide whether the story is joining or taking away.";
    return "Use a friendly strategy: make ten, count on, or break the number into parts.";
  }

  async function askTutor(context) {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/tutor-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skill: context.skill || "Learning practice",
          difficulty: context.difficulty || "average",
          correct: Boolean(context.correct),
          prompt: context.prompt || ""
        })
      });
      if (!response.ok) throw new Error(`AI API error ${response.status}`);
      const data = await response.json();
      return data.feedback || fallbackFeedback(context);
    } catch (error) {
      console.warn("NumeRead AI unavailable, using local tutor feedback.", error);
      return fallbackFeedback(context);
    }
  }

  async function generatePersonalizedGameItems(params) {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/test-bank/generate-personalized`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: params.studentId || params.student?.id || "demo-student",
          activity_id: params.activityId,
          difficulty: params.difficulty || "easy",
          skill: params.skill || "",
          struggling: Boolean(params.struggling),
          mastery: params.mastery || params.student?.mastery || {},
          gaps: params.gaps || params.student?.gaps || [],
          learning_progress: params.learningProgress || params.student?.learningProgress || {},
          count: Number(params.count || 10),
          subtopic: params.subtopic || null,
          recent_performance: Number(params.recentPerformance ?? 1),
          failed_attempts: Number(params.failedAttempts || 0)
        })
      });
      if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("API personalized game item generation unavailable, using test bank fallback.", error);
      return null;
    }
  }

  async function fetchTestBankItems(activityId, difficulty, studentId) {
    try {
      const url = new URL(`${apiBaseUrl()}/api/test-bank/${encodeURIComponent(activityId)}/${encodeURIComponent(difficulty)}`);
      if (studentId) url.searchParams.set("student_id", studentId);
      const response = await fetch(url.toString());
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data.items) && data.items.length ? data.items : null;
    } catch (e) {
      return null;
    }
  }

  async function storeTestBankItems(activityId, difficulty, items, studentId) {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/test-bank/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: activityId,
          difficulty: difficulty,
          student_id: studentId || null,
          items: items || []
        })
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  window.NumeReadAI = {
    askTutor,
    configured,
    apiBaseUrl,
    generatePersonalizedGameItems,
    fetchTestBankItems,
    storeTestBankItems
  };
})();
