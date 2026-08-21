(function () {
  const words = ["cat", "dog", "school", "reading", "apple", "elephant", "teacher", "book"];
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
  const backDashboardButton = document.getElementById("backDashboardBtn");

  let currentIndex = 0;
  let currentWord = words[currentIndex];
  let student = null;
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
    currentWord = words[currentIndex];
    wordElement.textContent = currentWord;
    wordProgressElement.textContent = `${currentIndex + 1}/${words.length}`;
    statusElement.textContent = "Listen first, then say the word.";
    resultElement.classList.add("hidden");
    nextButton.classList.add("hidden");
  }

  function speakWord() {
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
    feedbackElement.textContent = score >= 90 ? "Excellent pronunciation!" : score >= 75 ? "Good job!" : score >= 60 ? "Almost! Try again." : "Listen again and try once more.";
    statusElement.textContent = `You said: “${spokenWord}”`;
    nextButton.classList.remove("hidden");
  }

  async function savePronunciationResult(score, points) {
    if (!student || !window.NumeReadData) return;
    const gain = score >= 75 ? 2 : score >= 60 ? 1 : 0;
    if (!student.activities.includes("pronunciation-practice")) student.activities.push("pronunciation-practice");
    student.xp += points;
    student.reading = Math.min(100, student.reading + gain);
    student.mastery = { ...student.mastery, Pronunciation: Math.min(100, Number(student.mastery.Pronunciation || 0) + gain) };
    student = await window.NumeReadData.saveStudent(student);
    await window.NumeReadData.saveActivityLog(student, {
      activityId: "pronunciation-practice", area: "reading", skill: "Pronunciation", gain, xp: points,
      badge: score >= 90 ? "Clear Speaker" : ""
    });
    try {
      const baseUrl = window.NumeReadAI?.apiBaseUrl?.() || (window.location.port === "8000" ? window.location.origin : "http://127.0.0.1:8000");
      await fetch(`${baseUrl}/api/pronunciation/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: String(student.id),
          target_word: currentWord,
          spoken_word: "",
          score,
          confidence: score / 100,
          points
        })
      });
    } catch (error) {
      console.warn("NumeRead API pronunciation sync unavailable.", error);
    }
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
    recognition.addEventListener("result", async (event) => {
      const result = event.results[0][0];
      const spokenWord = result.transcript;
      const score = calculateScore(currentWord, spokenWord, result.confidence || 0);
      const points = calculatePoints(score);
      displayResult(score, points, spokenWord);
      try {
        await savePronunciationResult(score, points);
      } catch (error) {
        console.error("Could not save pronunciation progress.", error);
        statusElement.textContent += " Your result could not be saved.";
      }
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

  async function getSignedInStudent() {
    try {
      const stored = JSON.parse(sessionStorage.getItem("numeread_student") || "null");
      if (stored?.name && stored?.lrn && window.NumeReadData) student = await window.NumeReadData.authenticateStudent(stored.name, stored.lrn);
      if (student) studentNameElement.textContent = student.name;
    } catch (error) {
      console.warn("No signed-in student was found for pronunciation practice.", error);
    }
  }

  listenButton.addEventListener("click", speakWord);
  speakButton.addEventListener("click", startRecognition);
  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % words.length;
    showWord();
  });
  backDashboardButton.addEventListener("click", () => {
    window.location.href = "student.html";
  });

  (async function init() {
    showWord();
    setupRecognition();
    await getSignedInStudent();
  })();
})();
