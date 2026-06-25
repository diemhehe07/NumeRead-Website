(function () {
  function band(score) {
    if (score < 50) return "needs support";
    if (score < 75) return "developing";
    if (score < 90) return "proficient";
    return "advanced";
  }

  function difficulty(score, hasPretest) {
    if (!hasPretest) return "easy";
    if (score < 50) return "easy";
    if (score < 75) return "average";
    if (score < 90) return "intermediate";
    return "advanced";
  }

  function priorityArea(student) {
    const reading = Number(student.reading || 0);
    const math = Number(student.math || 0);
    if (!student.pretest) return "pretest";
    if (reading <= math - 10) return "reading";
    if (math <= reading - 10) return "math";
    if (reading < 75 && math < 75) return "both";
    return "enrichment";
  }

  function materialPlan(student) {
    const area = priorityArea(student);
    if (area === "pretest") return ["Blends and Phonics Module", "Addition Facts Module"];
    if (area === "reading") return ["Blends and Phonics Module", "Reading Fluency Audio-Visual", "Sentence Builder"];
    if (area === "math") return ["Addition Facts Module", "Word Problem Walkthrough", "Math strategy worksheet"];
    if (area === "both") return ["Reading Fluency Audio-Visual", "Addition Facts Module", "Read-and-Solve Worksheet"];
    return ["Advanced Challenge Set", "Word Problem Walkthrough"];
  }

  function recommend(student) {
    const area = priorityArea(student);
    const readingLevel = band(student.reading);
    const mathLevel = band(student.math);
    const readingDifficulty = difficulty(student.reading, Boolean(student.pretest));
    const mathDifficulty = difficulty(student.math, Boolean(student.pretest));

    const messages = {
      pretest: "Take the pre-test first so the system can place you in the right reading and math level.",
      reading: `Reading needs more support than math. Start with ${readingDifficulty} reading games and use audio-guided materials.`,
      math: `Math needs more support than reading. Start with ${mathDifficulty} math games and review number strategies.`,
      both: "Reading and math both need guided practice. Use short daily lessons before games.",
      enrichment: "You are ready for enrichment. Try intermediate or advanced activities for deeper practice."
    };

    return {
      area,
      readingLevel,
      mathLevel,
      readingDifficulty,
      mathDifficulty,
      materials: materialPlan(student),
      message: messages[area]
    };
  }

  window.NumeReadAdaptiveModel = {
    band,
    difficulty,
    priorityArea,
    materialPlan,
    recommend
  };
})();
