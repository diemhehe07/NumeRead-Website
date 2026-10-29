(function () {
  const STAGES = ["easy", "average", "intermediate", "advanced"];
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const wordElement = document.getElementById("word");
  const statusElement = document.getElementById("status");
  const resultElement = document.getElementById("result");
  const feedbackElement = document.getElementById("feedback");
  const scoreElement = document.getElementById("score");
  const pointsElement = document.getElementById("points");
  const listenButton = document.getElementById("listenBtn");
  const speakButton = document.getElementById("speakBtn");
  const nextButton = document.getElementById("nextBtn");
  const wordProgressElement = document.getElementById("wordProgress");
  const studentNameElement = document.getElementById("studentNameDisplay");
  const difficultyElement = document.getElementById("difficultyDisplay");
  const backDashboardButton = document.getElementById("backDashboardBtn");

  const _search = typeof window !== "undefined" && window.location.search ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const _initLevel = window.NumeReadTestBanks?.normalizeLevel(_search.get("level")) ||
    window.NumeReadTestBanks?.normalizeLevel(typeof sessionStorage !== "undefined" ? (sessionStorage.getItem("numeread_launch_level_pronunciation-practice") || sessionStorage.getItem("numeread_launch_level")) : null) ||
    "easy";

  let currentIndex = 0;
  let rounds = [];
  let currentWord = "";
  let difficulty = _initLevel;
  let contentSet = 0;
  let earnedPoints = 0;
  let scores = [];
  let student = null;
  let dashboardUrl = "student.html";
  let recognition = null;
  let isListening = false;

  function normalizeWord(text) {
    return String(text || "").toLowerCase().trim().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ");
  }

  function calculateScore(target, spoken, confidence) {
    const targetWord = normalizeWord(target);
    const spokenWord = normalizeWord(spoken);
    if (spokenWord === targetWord) return Math.max(80, Math.round(confidence * 100));
    if (spokenWord.split(" ").includes(targetWord) || targetWord.includes(spokenWord)) return 70;
    return 40;
  }

  function calculatePoints(score) {
    if (score >= 90) return 10;
    if (score >= 75) return 7;
    if (score >= 60) return 4;
    return 0;
  }

  function showWord() {
    currentWord = rounds[currentIndex]?.word || "";
    if (!currentWord) return;
    wordElement.textContent = currentWord;
    wordProgressElement.textContent = `${currentIndex + 1}/${rounds.length}`;
    statusElement.textContent = "Listen first, then say the word.";
    resultElement.classList.add("hidden");
    nextButton.classList.add("hidden");
  }

  function speakWord() {
    if (window.NumeReadI18n) {
      statusElement.textContent = "Listen carefully...";
      window.NumeReadI18n.speak(currentWord, () => {
        statusElement.textContent = "Now say the word...";
      });
      return;
    }
    if (!("speechSynthesis" in window)) {
      statusElement.textContent = "Audio playback is not supported in this browser.";
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(currentWord);
    speech.lang = "en-US";
    speech.rate = 0.75;
    window.speechSynthesis.speak(speech);
    statusElement.textContent = "Listen carefully...";
  }

  function displayResult(score, points, spokenWord) {
    resultElement.classList.remove("hidden");
    scoreElement.textContent = `${score}%`;
    pointsElement.textContent = `+${points} points`;
    const baseFeedback = score >= 90 ? "Excellent pronunciation!" : score >= 75 ? "Good job!" : score >= 60 ? "Almost! Try again." : "Listen again and try once more.";
    const tipText = (score < 75 && rounds[currentIndex]?.tip) ? ` Tip: ${rounds[currentIndex].tip}` : "";
    feedbackElement.textContent = `${baseFeedback}${tipText}`;
    statusElement.textContent = `You said: “${spokenWord}”`;
    nextButton.classList.remove("hidden");
    nextButton.textContent = currentIndex === rounds.length - 1 ? "Finish Level" : "Next Word";
  }

  async function savePronunciationResult() {
    const averageScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0;
    const performance = averageScore / 100;
    const gain = averageScore >= 80 ? 6 : averageScore >= 60 ? 3 : 1;

    if (window.NumeReadGame?.finishGame) {
      student = await window.NumeReadGame.finishGame({
        activityId: "pronunciation-practice",
        area: "reading",
        skill: "Pronunciation",
        gain,
        performance,
        difficulty,
        xp: Math.max(10, earnedPoints),
        badge: averageScore >= 90 ? "Clear Speaker" : ""
      });
    } else if (student && window.NumeReadData) {
      if (!student.activities.includes("pronunciation-practice")) student.activities.push("pronunciation-practice");
      const previousProgress = student.learningProgress?.["pronunciation-practice"] || {};
      const completedStages = Array.isArray(previousProgress.completedStages)
        ? previousProgress.completedStages.filter((stage) => STAGES.includes(stage))
        : [];
      const passedLevel = averageScore >= 70;
      if (passedLevel && !completedStages.includes(difficulty)) completedStages.push(difficulty);
      completedStages.sort((a, b) => STAGES.indexOf(a) - STAGES.indexOf(b));
      const nextStage = STAGES.find((stage) => !completedStages.includes(stage)) || STAGES[STAGES.length - 1];
      student.learningProgress = {
        ...(student.learningProgress || {}),
        "pronunciation-practice": {
          attempts: Number(previousProgress.attempts || 0) + 1,
          contentSet: Number(previousProgress.contentSet || 0) + 1,
          difficulty: nextStage,
          completedStages,
          lastPerformance: performance,
          lastCompletedAt: new Date().toISOString()
        }
      };
      student.xp += earnedPoints;
      student.reading = Math.min(100, student.reading + gain);
      student.mastery = { ...student.mastery, Pronunciation: Math.min(100, Number(student.mastery.Pronunciation || 0) + gain) };
      student = await window.NumeReadData.saveStudent(student);
      try {
        sessionStorage.setItem("numeread_student", JSON.stringify(student));
      } catch(e) {}
    }

    if (window.NumeReadAI?.fetchApi && window.NumeReadAI?.isBackendReachable?.() && student) {
      window.NumeReadAI.fetchApi("/api/pronunciation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: String(student.id),
          target_word: currentWord,
          spoken_word: "",
          score: averageScore,
          confidence: averageScore / 100,
          points: earnedPoints
        })
      }).catch(() => {});
    }
  }

  async function finishLevel() {
    const averageScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0;
    nextButton.disabled = true;
    nextButton.textContent = "Saving your level...";
    try {
      await savePronunciationResult();
      feedbackElement.textContent = averageScore >= 70
        ? `Level complete! You passed ${difficulty} pronunciation with an average of ${averageScore}%.`
        : `Level complete with an average of ${averageScore}%. Practice this level again to reach 70% and unlock the next one.`;
      statusElement.textContent = "Your pronunciation level has been saved.";
    } catch (error) {
      console.error("Could not save pronunciation progress.", error);
      statusElement.textContent = "Your level could not be saved. Please try again.";
      nextButton.disabled = false;
      nextButton.textContent = "Try saving again";
      return;
    }

    setTimeout(() => {
      window.NumeReadGame?.showProgressionOverlay?.({
        performance: averageScore / 100,
        difficulty,
        dashboardUrl
      });
    }, 900);
  }

  function setupRecognition() {
    if (!SpeechRecognition) {
      speakButton.disabled = true;
      statusElement.textContent = "Speech recognition is available in Chrome or Edge. You can still use Listen.";
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.addEventListener("result", (event) => {
      const result = event.results[0][0];
      const spokenWord = result.transcript;
      const score = calculateScore(currentWord, spokenWord, result.confidence || 0);
      const points = calculatePoints(score);
      displayResult(score, points, spokenWord);
      scores.push(score);
      earnedPoints += points;
    });
    recognition.addEventListener("error", (event) => {
      const messages = {
        "not-allowed": "Microphone access is needed. Allow it in your browser and try again.",
        "no-speech": "We did not hear anything. Try speaking a little louder.",
        "audio-capture": "No microphone was found. Connect one and try again."
      };
      statusElement.textContent = messages[event.error] || "We could not recognize that. Please try again.";
    });
    recognition.addEventListener("end", () => {
      isListening = false;
      speakButton.disabled = false;
    });
  }

  function startRecognition() {
    if (!recognition || isListening) return;
    isListening = true;
    speakButton.disabled = true;
    statusElement.textContent = "Listening... Say the word!";
    try {
      recognition.start();
    } catch (error) {
      isListening = false;
      speakButton.disabled = false;
      statusElement.textContent = "Please wait a moment, then try again.";
    }
  }

  listenButton.addEventListener("click", speakWord);
  speakButton.addEventListener("click", startRecognition);
  nextButton.addEventListener("click", () => {
    if (currentIndex >= rounds.length - 1) {
      finishLevel();
      return;
    }
    currentIndex += 1;
    showWord();
  });
  backDashboardButton.addEventListener("click", () => {
    window.location.href = dashboardUrl;
  });

  (async function init() {
    setupRecognition();
    try {
      if (window.NumeReadGame?.initGame) {
        const game = await window.NumeReadGame.initGame({ activityId: "pronunciation-practice", area: "reading" });
        student = game.student || student;
        difficulty = game.difficulty || _initLevel || "easy";
        contentSet = Number(game.contentSet || 0);
        dashboardUrl = game.dashboardUrl || dashboardUrl;
      }
    } catch (error) {
      console.warn("Pronunciation started with local level data.", error);
    }
    if (studentNameElement && student?.name) studentNameElement.textContent = student.name;
    if (difficultyElement) difficultyElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    rounds = window.NumeReadGame?.getActivityQuestions?.("pronunciation-practice", difficulty, { seed: contentSet }) || window.NumeReadTestBanks?.getForActivity("pronunciation-practice", difficulty, { seed: contentSet }) || [];
    if (!rounds.length) {
      statusElement.textContent = "The pronunciation test bank is unavailable. Please return to the dashboard and try again.";
      speakButton.disabled = true;
      return;
    }
    currentIndex = 0;
    scores = [];
    earnedPoints = 0;
    showWord();
  })();
})();
