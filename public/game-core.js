(function () {
  const params = new URLSearchParams(window.location.search);
  const studentName = params.get("studentName") || "Maria R.";
  const grade = params.get("grade") || "Grade 2";
  let student = null;
  let finished = false;
  let teacherLesson = null;
  let musicEnabled = false;
  let audioContext = null;
  let musicTimer = null;
  const ONLINE_LOAD_TIMEOUT_MS = 4000;

  function withTimeout(promise, fallback) {
    return Promise.race([
      promise,
      new Promise((resolve) => window.setTimeout(() => resolve(fallback), ONLINE_LOAD_TIMEOUT_MS))
    ]);
  }

  const ACTIVITY_DETAILS = {
    "game-reading-bridge.html": { id: "reading-bridge", skill: "Blends" },
    "game-math-ninja.html": { id: "math-ninja", skill: "Addition facts" },
    "game-word-bakery.html": { id: "word-bakery", skill: "Word problems" },
    "game-sentence-builder.html": { id: "sentence-builder", skill: "Reading fluency" },
    "game-vocab-quest.html": { id: "vocab-quest", skill: "Vocabulary" },
    "game-spelling.html": { id: "spelling-sprint", skill: "Spelling" },
    "game-comprehension-trail.html": { id: "comprehension-trail", skill: "Comprehension" },
    "game-subtraction-sprint.html": { id: "subtraction-sprint", skill: "Subtraction" },
    "game-division-dash.html": { id: "division-dash", skill: "Division" },
    "game-place-value-builder.html": { id: "place-value-builder", skill: "Place value" },
    "game-fraction-pizza.html": { id: "fraction-pizza", skill: "Fractions" }
  };
  const STAGES = ["easy", "average", "intermediate", "advanced"];
  // These mirror the student-facing modules. Teacher lessons are placed first
  // when present, so a teacher can replace this starter practice per class.
  const CURRICULUM_MATERIALS = [
    {
      id: "module-blends", title: "Blends and Phonics Module", area: "Reading", level: "Easy",
      activityIds: ["reading-bridge"], keywords: ["Blends", "Reading Bridge"],
      content: "Listen for both beginning sounds, slide them together, then read the whole word.",
      gameQuestions: [
        { prompt: "bl", answer: "blue", choices: ["blue", "sun", "cat"] },
        { prompt: "br", answer: "brush", choices: ["brush", "map", "dog"] },
        { prompt: "cl", answer: "clap", choices: ["clap", "fish", "pen"] },
        { prompt: "tr", answer: "train", choices: ["train", "apple", "moon"] }
      ]
    },
    {
      id: "module-addition", title: "Addition Facts Module", area: "Mathematics", level: "Easy",
      activityIds: ["math-ninja"], keywords: ["Addition facts", "Math Ninja"],
      content: "Start with the bigger number, count on, and check your total with a drawing or ten-frame.",
      gameQuestions: [
        { prompt: "7 + 5", answer: 12, choices: ["10", "11", "12"] },
        { prompt: "6 + 4", answer: 10, choices: ["9", "10", "11"] },
        { prompt: "8 + 3", answer: 11, choices: ["10", "11", "12"] },
        { prompt: "9 + 2", answer: 11, choices: ["10", "11", "12"] }
      ]
    },
    {
      id: "av-word-problems", title: "Word Problem Walkthrough", area: "Mathematics", level: "Intermediate",
      activityIds: ["word-bakery"], keywords: ["Word problems", "Word Problem Bakery"],
      content: "Underline the numbers, circle the question, then decide whether the groups join or something is taken away.",
      gameQuestions: [
        { prompt: "Mia has 14 crayons and gives 5 away. How many crayons are left?", answer: 9, choices: ["8", "9", "19"] },
        { prompt: "A shelf has 8 books and receives 6 more. How many books are there in all?", answer: 14, choices: ["12", "14", "16"] },
        { prompt: "There are 17 apples. 7 are eaten. How many remain?", answer: 10, choices: ["10", "12", "24"] }
      ]
    },
    {
      id: "module-fractions", title: "Fraction Fundamentals: Slices of a Whole", area: "Mathematics", level: "Easy",
      activityIds: ["fraction-pizza"], keywords: ["Fractions", "Fraction Pizza", "parts of a whole", "equal slices"],
      content: "A fraction represents equal parts of a whole. The top number is the numerator and bottom number is the denominator.",
      gameQuestions: [
        { prompt: "What fraction represents 1 out of 4 equal pizza slices?", answer: "1/4", choices: ["1/4", "1/2", "3/4"] },
        { prompt: "If a pizza is cut into 2 equal halves, what is one slice?", answer: "1/2", choices: ["1/2", "1/3", "2/2"] },
        { prompt: "In the fraction 3/4, which number is the denominator (total equal parts)?", answer: "4", choices: ["3", "4", "7"] },
        { prompt: "What fraction of a pizza is 2 out of 3 equal slices?", answer: "2/3", choices: ["1/3", "2/3", "3/4"] },
        { prompt: "Which fraction is equivalent (equal) to 1/2?", answer: "2/4", choices: ["1/4", "2/4", "3/4"] }
      ]
    },
    {
      id: "module-subtraction", title: "Subtraction Sprint & Number Line Guide", area: "Mathematics", level: "Easy",
      activityIds: ["subtraction-sprint"], keywords: ["Subtraction", "Subtraction Sprint", "counting back", "difference"],
      content: "Subtraction means taking away from a whole or finding the distance between two numbers. Jump backward on a number line.",
      gameQuestions: [
        { prompt: "12 - 4", answer: 8, choices: ["7", "8", "9"] },
        { prompt: "15 - 6", answer: 9, choices: ["8", "9", "10"] },
        { prompt: "20 - 7", answer: 13, choices: ["12", "13", "14"] }
      ]
    },
    {
      id: "module-place-value", title: "Place Value Power & Base-10 Blocks Module", area: "Mathematics", level: "Easy",
      activityIds: ["place-value-builder"], keywords: ["Place value", "Place Value Builder", "tens and ones", "hundreds"],
      content: "Every digit has a value determined by its position. Hundreds are flats of 100, tens are rods of 10, and ones are unit cubes.",
      gameQuestions: [
        { prompt: "3 tens and 5 ones", answer: 35, choices: ["35", "53", "305"] },
        { prompt: "6 tens and 2 ones", answer: 62, choices: ["26", "62", "620"] },
        { prompt: "1 hundred, 4 tens, and 8 ones", answer: 148, choices: ["148", "184", "418"] }
      ]
    },
    {
      id: "module-vocab", title: "Vocabulary Clue Detective Guide", area: "Reading", level: "Easy",
      activityIds: ["vocab-quest"], keywords: ["Vocabulary", "Vocabulary Quest", "context clues", "word meanings"],
      content: "When you see an unfamiliar word, look around the sentence for context clues: synonyms, antonyms, and explanation clues.",
      gameQuestions: [
        { prompt: "The tiny puppy fit inside a teacup. What does tiny mean?", answer: "very small", choices: ["very small", "very noisy", "very tall"] },
        { prompt: "Carlo was thrilled when he received the prize. What does thrilled mean?", answer: "very excited and happy", choices: ["very excited and happy", "very sleepy", "very scared"] }
      ]
    },
    {
      id: "module-comprehension", title: "Comprehension Clue Finder Module", area: "Reading", level: "Average",
      activityIds: ["comprehension-trail"], keywords: ["Comprehension", "Comprehension Trail", "main idea", "reading passage"],
      content: "Good readers read once for the main idea, and reread to find exact evidence in the sentences that prove their answer.",
      gameQuestions: [
        { prompt: "Maria brought seeds and watered the soil daily. What was Maria doing?", answer: "gardening", choices: ["gardening", "cooking lunch", "buying clothes"] }
      ]
    }
  ];

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

  function normalizeStage(value) {
    const stage = String(value || "").toLowerCase();
    return STAGES.includes(stage) ? stage : null;
  }

  function completedStagesFor(progress) {
    const savedStages = Array.isArray(progress?.completedStages)
      ? progress.completedStages.filter((stage) => STAGES.includes(stage))
      : [];
    if (savedStages.length) return savedStages;

    // Before level-by-level tracking was introduced, progress saved only the
    // next `difficulty`. Convert that value into the equivalent completed
    // stages so an Average card starts Average rather than falling back to Easy.
    const savedDifficulty = normalizeStage(progress?.difficulty);
    return savedDifficulty ? STAGES.slice(0, STAGES.indexOf(savedDifficulty)) : [];
  }

  function adaptiveDifficulty(currentStudent, area, skill, progress) {
    // The next level is always the first level not yet passed. Legacy records
    // that stored only `difficulty` are migrated by completedStagesFor.
    const completedStages = completedStagesFor(progress);
    return STAGES.find((stage) => !completedStages.includes(stage)) || STAGES[STAGES.length - 1];
  }

  function personalizedItems(activityId, level, options = {}) {
    const assignment = student?.personalizedActivities?.[activityId];
    if (assignment?.itemSetId && window.NumeReadTestBanks?.createPersonalizedSet) {
      return window.NumeReadTestBanks.createPersonalizedSet(activityId, level, assignment);
    }
    return window.NumeReadTestBanks?.getForActivity(activityId, level, options) || [];
  }

  function learnerQuery() {
    return new URLSearchParams({ studentName: student.name, grade: student.grade }).toString();
  }

  function setText(selector, text) {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  }

  function matchesLesson(material, details, area) {
    const level = String(material.level || "").toLowerCase();
    const section = String(material.section || "All Sections").toLowerCase();
    const activityIds = Array.isArray(material.activityIds) ? material.activityIds : [];
    const keywords = `${material.title || ""} ${material.summary || ""} ${material.content || ""} ${(material.keywords || []).join(" ")}`.toLowerCase();
    const skill = details.skill.toLowerCase();
    const activityMatch = activityIds.includes(details.id) || keywords.includes(details.id.replace(/-/g, " ")) || keywords.includes(skill);
    const areaMatch = String(material.area || "").toLowerCase().includes(area) || String(material.area || "").toLowerCase().includes("reading and math");
    const levelMatch = !level || level === "all levels" || level === "all" || level === teacherLessonDifficulty;
    const sectionMatch = !section || section === "all sections" || [student.section, student.grade, student.gradeSection].some((value) => section === String(value || "").toLowerCase());
    return activityMatch && areaMatch && levelMatch && sectionMatch;
  }

  let teacherLessonDifficulty = "easy";

  function selectTeacherLesson(materials, details, area, difficulty) {
    teacherLessonDifficulty = difficulty;
    const exact = materials.find((material) => matchesLesson(material, details, area));
    if (exact) return exact;
    return null;
  }

  function playTone(frequency, duration, offset = 0) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + offset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + offset + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + offset);
    oscillator.stop(audioContext.currentTime + offset + duration + 0.02);
  }

  // Universal Web Audio & Web Speech Synthesizer
  const SoundEngine = {
    init() {
      if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
      return audioContext;
    },
    playChime(isCorrect) {
      try {
        const ctx = SoundEngine.init();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (isCorrect) {
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.08);
          osc.frequency.setValueAtTime(783.99, now + 0.16);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.42);
        } else {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(165, now + 0.09);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
          osc.start(now);
          osc.stop(now + 0.28);
        }
      } catch (e) {}
    },
    playVictory() {
      try {
        const ctx = SoundEngine.init();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.001, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.45);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.48);
        });
      } catch (e) {}
    },
    speak(text, onEnd) {
      if (window.NumeReadI18n && typeof window.NumeReadI18n.speak === "function") {
        window.NumeReadI18n.speak(text, onEnd);
        return;
      }
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const clean = String(text || "").replace(/<[^>]+>/g, " ").trim();
      if (!clean) return;
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.03;
      utterance.pitch = 1.18;
      if (typeof onEnd === "function") utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
    },
    stopSpeaking() {
      if (window.NumeReadI18n && typeof window.NumeReadI18n.stopSpeaking === "function") {
        window.NumeReadI18n.stopSpeaking();
      } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },
    triggerConfetti() {
      triggerConfetti();
    }
  };

  function triggerConfetti() {
    try {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.inset = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "9999";
      container.style.overflow = "hidden";
      document.body.appendChild(container);
      const colors = ["#f97316", "#0d9488", "#eab308", "#3b82f6", "#ec4899"];
      for (let i = 0; i < 40; i++) {
        const bit = document.createElement("div");
        bit.style.position = "absolute";
        bit.style.width = `${Math.random() * 8 + 6}px`;
        bit.style.height = `${Math.random() * 12 + 6}px`;
        bit.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        bit.style.left = `${Math.random() * 100}%`;
        bit.style.top = "-20px";
        bit.style.borderRadius = "3px";
        bit.style.opacity = String(Math.random() * 0.6 + 0.4);
        bit.style.transform = `rotate(${Math.random() * 360}deg)`;
        bit.style.transition = `top ${Math.random() * 1.5 + 1.2}s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${Math.random() * 1.5 + 1.2}s ease, opacity 0.5s ease 1.5s`;
        container.appendChild(bit);
        setTimeout(() => {
          bit.style.top = `${window.innerHeight + 20}px`;
          bit.style.transform = `rotate(${Math.random() * 720}deg) translateX(${(Math.random() - 0.5) * 150}px)`;
          bit.style.opacity = "0";
        }, 30);
      }
      setTimeout(() => container.remove(), 2800);
    } catch (e) {}
  }

  function setMusic(enabled) {
    musicEnabled = enabled;
    const control = document.querySelector("[data-game-music]");
    if (control) control.innerHTML = `<i class="fas fa-${enabled ? "volume-high" : "music"}"></i> Music: ${enabled ? "On" : "Off"}`;
    if (!enabled) {
      clearInterval(musicTimer);
      musicTimer = null;
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext = audioContext || new AudioContext();
    audioContext.resume();
    const phrase = () => {
      [261.63, 329.63, 392, 329.63].forEach((note, index) => playTone(note, 0.22, index * 0.28));
    };
    phrase();
    clearInterval(musicTimer);
    musicTimer = setInterval(phrase, 1800);
  }

  function installMusicControl() {
    const bar = document.querySelector(".stats-pills");
    if (!bar || document.querySelector("[data-game-music]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.gameMusic = "";
    button.className = "pill";
    button.style.border = "1px solid #fed7aa";
    button.style.cursor = "pointer";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<i class="fas fa-music"></i> Music: Off';
    button.addEventListener("click", () => {
      setMusic(!musicEnabled);
      button.setAttribute("aria-pressed", String(musicEnabled));
    });
    bar.appendChild(button);
  }

  async function initGame(options) {
    let sessionStudent;
    try {
      sessionStudent = JSON.parse(sessionStorage.getItem("numeread_student") || "null");
    } catch (error) {
      sessionStudent = null;
    }
    if (!sessionStudent?.name || !sessionStudent?.section || !sessionStudent?.studentId) {
      if (params.get("studentName")) {
        sessionStudent = {
          id: "demo-student",
          name: params.get("studentName") || "Maria R.",
          grade: params.get("grade") || "Grade 2",
          section: params.get("section") || "Grade 2 - A",
          studentId: params.get("studentId") || "STU-00001",
          reading: 75,
          math: 75,
          mastery: {},
          activities: []
        };
        sessionStorage.setItem("numeread_student", JSON.stringify(sessionStudent));
      } else {
        window.location.replace("index.html");
        throw new Error("Sign in is required.");
      }
    }
    const timedOut = Symbol("student-load-timeout");
    student = await withTimeout(
      window.NumeReadData.authenticateStudent(sessionStudent.name, sessionStudent.section, sessionStudent.studentId),
      timedOut
    );
    if (student === timedOut || !student) {
      // Keep the activity usable if the online data request is slow, offline, or demo mode.
      student = { ...sessionStudent, reading: Number(sessionStudent.reading || 70), math: Number(sessionStudent.math || 70), mastery: sessionStudent.mastery || {} };
    }
    if (!student) {
      sessionStorage.removeItem("numeread_student");
      window.location.replace("index.html");
      throw new Error("Your sign-in session is no longer valid.");
    }
    const details = activityDetails();
    const progress = student.learningProgress?.[details.id] || {};
    const savedDifficulty = adaptiveDifficulty(student, options.area, details.skill, progress);
    // The dashboard includes its displayed level in the link. This avoids a
    // slow/offline student lookup briefly loading a different level on a game.
    const linkedDifficulty = normalizeStage(params.get("level"));
    const difficulty = linkedDifficulty || savedDifficulty;
    const uploadedMaterials = await withTimeout(
      Promise.resolve(window.NumeReadData.getLearningMaterials?.()),
      []
    ) || [];
    const materials = [...uploadedMaterials, ...CURRICULUM_MATERIALS];
    teacherLesson = selectTeacherLesson(materials, details, options.area, difficulty);
    const aiStatus = "Learning support";
    setText("[data-student-name]", student.name);
    const diffNode = document.querySelector("#difficultyDisplay");
    if (diffNode) {
      diffNode.setAttribute("data-raw-difficulty", difficulty);
      const isFil = window.NumeReadI18n?.getLanguage?.() === "fil";
      const filMap = { easy: "Madali", average: "Katamtaman", intermediate: "Panggitna", advanced: "Mataas" };
      diffNode.textContent = isFil ? (filMap[difficulty] || difficulty) : (difficulty.charAt(0).toUpperCase() + difficulty.slice(1));
    }
    setText("[data-difficulty]", difficulty);
    setText("[data-ai-status]", aiStatus);
    setText("#aiStatusSpan", aiStatus);
    installMusicControl();
    installLanguageControl();
    installTutorialControl(details.id);
    return { student, difficulty, contentSet: Number(progress.contentSet || 0), attempt: Number(progress.attempts || 0) + 1, query: learnerQuery(), dashboardUrl: `student.html?${learnerQuery()}`, teacherLesson };
  }

  function installLanguageControl() {
    const initI18n = () => {
      if (window.NumeReadI18n) {
        window.NumeReadI18n.installLanguageToggle(".stats-pills");
      }
    };

    if (!window.NumeReadI18n) {
      const script = document.createElement("script");
      script.src = "numeread-i18n.js";
      script.onload = initI18n;
      document.body.appendChild(script);
    } else {
      initI18n();
    }
  }

  function installTutorialControl(activityId) {
    if (!document.querySelector('link[href*="game-tutorial.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "game-tutorial.css";
      document.head.appendChild(link);
    }

    const initTutorial = () => {
      if (window.NumeReadTutorial) {
        window.NumeReadTutorial.installButton(activityId);
      }
    };

    if (!window.NumeReadTutorial) {
      const script = document.createElement("script");
      script.src = "game-tutorial.js";
      script.onload = initTutorial;
      document.body.appendChild(script);
    } else {
      initTutorial();
    }
  }

  async function tutorFeedback(context) {
    try {
      if (window.NumeReadAI && typeof window.NumeReadAI.askTutor === "function") {
        const feedback = await window.NumeReadAI.askTutor(context);
        const feedbackNode = document.querySelector("[data-feedback]");
        if (feedbackNode) feedbackNode.textContent = feedback;
        return feedback;
      }
    } catch (e) {
      console.warn("NumeRead AI tutor feedback unavailable, continuing seamlessly.", e);
    }
    return "";
  }

  function showAnswerFeedback(correct, message) {
    const feedbackNode = document.getElementById("feedbackMsg");
    if (!feedbackNode) return;
    feedbackNode.textContent = `${correct ? "✓ Correct!" : "✕ Not quite."} ${message}`;
    feedbackNode.dataset.status = correct ? "correct" : "incorrect";
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
    } else if (result.area === "combined") {
      // Combined games contribute to both subject areas, but only by a
      // modest amount so a single activity cannot replace subject practice.
      const combinedGain = Math.max(1, Math.round(Number(result.gain || 0) / 2));
      student.reading = pct(student.reading + combinedGain);
      student.math = pct(student.math + combinedGain);
      student.wpm[student.wpm.length - 1] = Number(student.wpm[student.wpm.length - 1] || 0) + Math.max(1, Math.round(combinedGain / 2));
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
    const completedStages = completedStagesFor(previous);
    const currentStage = STAGES.find((stage) => !completedStages.includes(stage)) || STAGES[STAGES.length - 1];
    const previousStage = STAGES.indexOf(currentStage);
    const passedLevel = performance >= 0.8;
    if (passedLevel && !completedStages.includes(STAGES[previousStage])) completedStages.push(STAGES[previousStage]);
    const nextStage = passedLevel ? Math.min(STAGES.length - 1, previousStage + 1) : previousStage;
    student.learningProgress = {
      ...(student.learningProgress || {}),
      [activityId]: {
        attempts: Number(previous.attempts || 0) + 1,
        contentSet: Number(previous.contentSet || 0) + 1,
        difficulty: STAGES[nextStage],
        completedStages,
        lastPerformance: performance,
        lastCompletedAt: new Date().toISOString()
      }
    };
    // Persist the level before optional logging. A failed activity-log write
    // must never prevent a learner from unlocking the next game level.
    student = await window.NumeReadData.saveStudent(student);
    try {
      sessionStorage.setItem("numeread_student", JSON.stringify(student));
    } catch (error) {
      console.warn("Learner session could not be refreshed.", error);
    }
    try {
      await window.NumeReadData.saveActivityLog(student, result);
    } catch (error) {
      console.warn("Activity log could not be saved; level progress was saved.", error);
    }
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

  function getMaterialQuestions() {
    const details = activityDetails();
    const bankQuestions = personalizedItems(details.id, difficulty, { seed: Number(student?.learningProgress?.[details.id]?.contentSet || 0) });
    if (bankQuestions.length) return bankQuestions;
    const questions = teacherLesson?.gameQuestions;
    if (Array.isArray(questions) && questions.length) {
      return questions.filter((item) => item?.prompt && item?.answer !== undefined && Array.isArray(item?.choices));
    }
    // Online materials retain their extracted text in `content`. Turn only
    // explicit, checkable patterns in that text into practice; otherwise the
    // game keeps its age-appropriate built-in questions instead of guessing.
    const text = String(teacherLesson?.content || "");
    if (details.id === "reading-bridge") {
      const words = [...new Set((text.match(/\b[a-z]{3,16}\b/gi) || []).map((word) => word.toLowerCase()))];
      const blendWords = words.filter((word) => /^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr)/.test(word)).slice(0, 5);
      return blendWords.map((word, index) => {
        const blend = word.slice(0, word.startsWith("sc") || word.startsWith("sk") || word.startsWith("sl") || word.startsWith("sm") || word.startsWith("sn") || word.startsWith("sp") || word.startsWith("st") || word.startsWith("sw") ? 2 : 2);
        const distractors = words.filter((candidate) => candidate !== word && !candidate.startsWith(blend)).slice(index * 2, index * 2 + 2);
        return distractors.length === 2 ? {prompt: blend, answer: word, choices: [word, ...distractors]} : null;
      }).filter(Boolean);
    }
    const expressions = [...text.matchAll(/\b(\d{1,3})\s*\+\s*(\d{1,3})\b/g)].slice(0, 5);
    if (details.id === "math-ninja") {
      return expressions.map((match) => {
        const answer = Number(match[1]) + Number(match[2]);
        return {prompt: `${match[1]} + ${match[2]}`, answer, choices: [answer - 1, answer, answer + 1].map(String)};
      });
    }
    if (details.id === "word-bakery") {
      const sentences = text.match(/[^.!?]*\b\d{1,3}\b[^.!?]*\b\d{1,3}\b[^.!?]*[.!?]/g) || [];
      return sentences.slice(0, 5).map((sentence) => {
        const numbers = sentence.match(/\b\d{1,3}\b/g)?.map(Number) || [];
        if (numbers.length < 2) return null;
        const subtract = /\b(left|remain|remaining|take away|gave away|sold|fewer|difference)\b/i.test(sentence);
        const answer = subtract ? numbers[0] - numbers[1] : numbers[0] + numbers[1];
        return answer >= 0 ? {prompt: sentence.trim(), answer, choices: [answer - 1, answer, answer + 1].map(String)} : null;
      }).filter(Boolean);
    }
    if (details.id === "fraction-pizza") {
      const fractions = [...text.matchAll(/\b(\d)\s*\/\s*(\d)\b/g)].slice(0, 5);
      if (fractions.length) {
        return fractions.map((m) => {
          const frac = `${m[1]}/${m[2]}`;
          const alt1 = `${Math.max(1, Number(m[1]) - 1)}/${m[2]}`;
          const alt2 = `${Number(m[1]) + 1}/${m[2]}`;
          return { prompt: `What fraction shows ${m[1]} out of ${m[2]} equal slices?`, answer: frac, choices: [frac, alt1, alt2] };
        });
      }
    }
    return [];
  }

  window.NumeReadSound = SoundEngine;
  window.NumeReadGame = {
    initGame,
    tutorFeedback,
    showAnswerFeedback,
    finishGame: async function(result) {
      SoundEngine.playVictory();
      triggerConfetti();
      return finishGame(result);
    },
    setMusic,
    sound: SoundEngine,
    triggerConfetti,
    getTeacherLesson: () => teacherLesson,
    getMaterialQuestions,
    getActivityQuestions: (activityId, difficulty, options = {}) => personalizedItems(activityId, difficulty, options),
    getTestBankQuestions: (activityId, difficulty, options = {}) => personalizedItems(activityId, difficulty, options),
    startTutorial: (id) => window.NumeReadTutorial?.start(id || activityDetails().id)
  };
})();
