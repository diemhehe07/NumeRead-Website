(function () {
  const API_BASE_KEY = "numeread_api_base_url";
  const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

  function baseUrl() {
    return localStorage.getItem(API_BASE_KEY) || DEFAULT_BASE_URL;
  }

  function setBaseUrl(url) {
    localStorage.setItem(API_BASE_KEY, url || DEFAULT_BASE_URL);
  }

  async function postJson(paths, payload) {
    const errors = [];
    for (const path of paths) {
      try {
        const response = await fetch(`${baseUrl()}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) return await response.json();
        errors.push(`${path}: ${response.status}`);
      } catch (error) {
        errors.push(`${path}: ${error.message}`);
      }
    }
    throw new Error(errors.join("; "));
  }

  async function analyzeStudent(student) {
    const payload = {
      student_id: student.id,
      name: student.name,
      grade: student.grade,
      section: student.section || student.gradeSection || "Section A",
      reading_score: Number(student.reading || 0),
      math_score: Number(student.math || 0),
      mastery: student.mastery || {},
      gaps: student.gaps || [],
      activities: student.activities || [],
      materials_completed: student.materialsCompleted || [],
      pretest: student.pretest || null,
      posttest: student.posttest || null
    };

    try {
      const result = await postJson([
        "/api/analyze-student",
        "/analyze-student",
        "/student/analyze",
        "/recommendations"
      ], payload);
      return { source: "api", result };
    } catch (error) {
      const result = window.NumeReadAdaptiveModel ? window.NumeReadAdaptiveModel.recommend(student) : null;
      return { source: "local", result, error: error.message };
    }
  }

  window.NumeReadAPI = { analyzeStudent, baseUrl, setBaseUrl };
})();
