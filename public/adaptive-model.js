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

  const SKILL_PLANS = {
    "Blends": { area: "reading", activity: "Reading Bridge", materials: ["Blends and Phonics Module", "Reading Fluency Audio-Visual"] },
    "Reading fluency": { area: "reading", activity: "Sentence Builder", materials: ["Reading Fluency Audio-Visual", "Blends and Phonics Module"] },
    "Vocabulary": { area: "reading", activity: "Vocabulary Quest", materials: ["Vocabulary Clue Detective Guide", "Read-and-Solve Worksheet"] },
    "Comprehension": { area: "reading", activity: "Comprehension Trail", materials: ["Comprehension Clue Finder Module", "Read-and-Solve Worksheet"] },
    "Addition facts": { area: "math", activity: "Math Ninja", materials: ["Addition Facts Module", "Word Problem Walkthrough"] },
    "Subtraction": { area: "math", activity: "Subtraction Sprint", materials: ["Subtraction Sprint & Number Line Guide", "Addition Facts Module"] },
    "Word problems": { area: "math", activity: "Word Problem Bakery", materials: ["Word Problem Walkthrough", "Read-and-Solve Worksheet"] },
    "Place value": { area: "math", activity: "Place Value Builder", materials: ["Place Value Power & Base-10 Blocks", "Addition Facts Module"] },
    "Fractions": { area: "math", activity: "Fraction Pizza Chef", materials: ["Fraction Fundamentals: Slices of a Whole", "Visual Fractions & Equivalent Slices Guide"] }
  };

  function normalizedSkill(value) {
    const source = String(value || "").toLowerCase();
    return Object.keys(SKILL_PLANS).find((skill) => source.includes(skill.toLowerCase()));
  }

  function focusSkills(student) {
    const mastery = student.mastery || {};
    const listedGaps = new Set((student.gaps || []).map(normalizedSkill).filter(Boolean));
    const candidates = Object.keys(SKILL_PLANS).map((skill) => {
      const savedMastery = Object.entries(mastery).find(([name]) => normalizedSkill(name) === skill)?.[1];
      const baseline = SKILL_PLANS[skill].area === "reading" ? Number(student.reading || 0) : Number(student.math || 0);
      const score = Number.isFinite(Number(savedMastery)) ? Number(savedMastery) : baseline;
      // An explicitly identified gap has precedence, even when the overall
      // subject score is currently higher than another area.
      return { skill, score: listedGaps.has(skill) ? score - 100 : score };
    });
    return candidates.sort((left, right) => left.score - right.score || left.skill.localeCompare(right.skill)).slice(0, 2).map((item) => item.skill);
  }

  function materialPlan(student) {
    if (!student.pretest) return ["Blends and Phonics Module", "Addition Facts Module"];
    return [...new Set(focusSkills(student).flatMap((skill) => SKILL_PLANS[skill].materials))];
  }

  function recommend(student) {
    const area = priorityArea(student);
    const readingLevel = band(student.reading);
    const mathLevel = band(student.math);
    const readingDifficulty = difficulty(student.reading, Boolean(student.pretest));
    const mathDifficulty = difficulty(student.math, Boolean(student.pretest));
    const skills = student.pretest ? focusSkills(student) : [];

    const message = !student.pretest
      ? "Take the pre-test first so the system can place you in the right reading and math level."
      : `Focus first on ${skills.join(" and ")}. Start with ${SKILL_PLANS[skills[0]].activity}, then practice ${skills[1]} with ${SKILL_PLANS[skills[1]].activity}.`;

    return {
      area,
      readingLevel,
      mathLevel,
      readingDifficulty,
      mathDifficulty,
      focusSkills: skills,
      materials: materialPlan(student),
      message
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
