(function () {
  const API_BASE_KEY = "numeread_api_base_url";
  const OFFLINE_CACHE_KEY = "numeread_api_offline_until";
  const API_TIMEOUT_MS = 800;

  function apiBaseUrl() {
    try {
      const configuredUrl = localStorage.getItem(API_BASE_KEY);
      if (configuredUrl) return configuredUrl.replace(/\/$/, "");
    } catch (_) {}
    // The local launcher serves the website from FastAPI on port 8000.
    if (typeof window !== "undefined" && window.location.port === "8000") return window.location.origin;
    // In production HTTPS, do not attempt insecure local HTTP connection
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      return "";
    }
    return "http://127.0.0.1:8000";
  }

  function isBackendReachable() {
    const base = apiBaseUrl();
    if (!base) return false;
    try {
      const offlineUntil = Number(sessionStorage.getItem(OFFLINE_CACHE_KEY) || 0);
      if (offlineUntil > Date.now()) return false;
    } catch (_) {}
    return true;
  }

  function markBackendOffline() {
    try {
      sessionStorage.setItem(OFFLINE_CACHE_KEY, String(Date.now() + 120000));
    } catch (_) {}
  }

  async function fetchApi(path, options = {}) {
    if (!isBackendReachable()) throw new Error("Backend offline or not configured");
    const base = apiBaseUrl();
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), API_TIMEOUT_MS) : null;
    try {
      const response = await fetch(`${base}${path}`, {
        ...options,
        signal: controller ? controller.signal : undefined
      });
      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) markBackendOffline();
        throw new Error(`AI API error ${response.status}`);
      }
      return response;
    } catch (err) {
      markBackendOffline();
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
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
    if (!isBackendReachable()) return fallbackFeedback(context);
    try {
      const response = await fetchApi("/api/tutor-feedback", {
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
      const data = await response.json();
      return data.feedback || fallbackFeedback(context);
    } catch (error) {
      return fallbackFeedback(context);
    }
  }

  async function generatePersonalizedGameItems(params) {
    if (!isBackendReachable()) return null;
    try {
      const response = await fetchApi("/api/test-bank/generate-personalized", {
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
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function fetchTestBankItems(activityId, difficulty, studentId) {
    if (!isBackendReachable()) return null;
    try {
      const qs = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
      const response = await fetchApi(`/api/test-bank/${encodeURIComponent(activityId)}/${encodeURIComponent(difficulty)}${qs}`);
      const data = await response.json();
      return Array.isArray(data.items) && data.items.length ? data.items : null;
    } catch (e) {
      return null;
    }
  }

  async function storeTestBankItems(activityId, difficulty, items, studentId) {
    if (!isBackendReachable()) return false;
    try {
      const response = await fetchApi("/api/test-bank/store", {
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
    isBackendReachable,
    fetchApi,
    generatePersonalizedGameItems,
    fetchTestBankItems,
    storeTestBankItems
  };
})();
