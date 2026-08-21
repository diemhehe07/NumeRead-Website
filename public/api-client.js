(function () {
  const API_BASE_KEY = "numeread_api_base_url";

  // Python FastAPI server
  const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

  function baseUrl() {
    return (
      localStorage.getItem(API_BASE_KEY) ||
      DEFAULT_BASE_URL
    );
  }

  function setBaseUrl(url) {
    localStorage.setItem(
      API_BASE_KEY,
      url || DEFAULT_BASE_URL
    );
  }

  async function postJson(paths, payload) {
    const errors = [];

    for (const path of paths) {
      try {
        const response = await fetch(
          `${baseUrl()}${path}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        if (response.ok) {
          return await response.json();
        }

        const errorText = await response.text();

        errors.push(
          `${path}: ${response.status} ${errorText}`
        );

      } catch (error) {
        errors.push(
          `${path}: ${error.message}`
        );
      }
    }

    throw new Error(
      errors.join("; ")
    );
  }

  async function analyzeStudent(student) {

    if (!student?.id) {
      throw new Error(
        "Student ID is missing."
      );
    }

    /*
     * IMPORTANT:
     * We now send ONLY the Firebase document ID.
     *
     * Python will:
     * 1. receive student_id
     * 2. retrieve the student from Firestore
     * 3. convert the Firebase data
     * 4. run the NumeRead AI
     * 5. return the recommendation
     */

    const payload = {
      student_id: String(student.id)
    };

    try {

      console.log(
        "[NumeRead API] Requesting AI analysis for:",
        student.id
      );

      const result = await postJson(
        ["/api/analyze-student"],
        payload
      );

      console.log(
        "[NumeRead API] AI response:",
        result
      );

      return {
        source: "api",
        result
      };

    } catch (error) {

      console.error(
        "[NumeRead API] Request failed:",
        error
      );

      /*
       * Keep the local model as a fallback
       * so the student dashboard can still work
       * if the Python server is temporarily offline.
       */

      const localResult =
        window.NumeReadAdaptiveModel
          ? window.NumeReadAdaptiveModel.recommend(student)
          : null;

      return {
        source: "local",
        result: localResult,
        error: error.message
      };
    }
  }

  /*
   * Send a completed learning session to Python.
   */
  async function recordLearningSession(session) {

    if (!session?.student_id) {
      throw new Error(
        "Student ID is required."
      );
    }

    const payload = {
      student_id: String(
        session.student_id
      ),

      content_id:
        session.content_id || null,

      concepts:
        Array.isArray(session.concepts)
          ? session.concepts
          : [],

      performance:
        Number(session.performance || 0),

      time_spent:
        Number(session.time_spent || 0),

      engagement_level:
        session.engagement_level == null
          ? null
          : Number(
              session.engagement_level
            ),

      interaction_count:
        Number(
          session.interaction_count || 1
        ),

      content_type:
        session.content_type || "game"
    };

    return await postJson(
      ["/record-learning-session"],
      payload
    );
  }

  window.NumeReadAPI = {
    analyzeStudent,
    recordLearningSession,
    baseUrl,
    setBaseUrl
  };

})();