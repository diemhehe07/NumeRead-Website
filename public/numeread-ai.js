(function () {
  function configured() {
    const config = window.NumeReadAIConfig || {};
    return Boolean(config.endpoint && config.apiKey && !String(config.apiKey).startsWith("PASTE_"));
  }

  function fallbackFeedback(context) {
    if (context.correct) return "Great work. Explain the pattern once more, then try the next challenge.";
    if (context.skill === "Blends") return "Look at the first two letters. Say each sound slowly, then blend them together.";
    if (context.skill === "Reading fluency") return "Read in short phrases. Pause at commas and periods.";
    if (context.skill === "Word problems") return "Find the numbers, circle the question, then decide whether the story is joining or taking away.";
    return "Use a friendly strategy: make ten, count on, or break the number into parts.";
  }

  async function askTutor(context) {
    if (!configured()) return fallbackFeedback(context);
    const config = window.NumeReadAIConfig;
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          input: `You are NumeRead, a warm elementary reading and math tutor. Give one short hint or feedback sentence for this learner. Skill: ${context.skill}. Difficulty: ${context.difficulty}. Correct: ${context.correct}. Prompt: ${context.prompt}.`
        })
      });
      if (!response.ok) throw new Error(`AI API error ${response.status}`);
      const data = await response.json();
      return data.output_text || data.message || data.choices?.[0]?.message?.content || fallbackFeedback(context);
    } catch (error) {
      console.warn("NumeRead AI unavailable, using local tutor feedback.", error);
      return fallbackFeedback(context);
    }
  }

  window.NumeReadAI = { askTutor, configured };
})();
