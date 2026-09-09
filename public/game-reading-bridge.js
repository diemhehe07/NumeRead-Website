// game-reading-bridge.js - Upgraded Reading Bridge Game (Blends & Phonics)

(function() {
  const blendSets = {
    easy: [
      { blend: "bl", choices: ["blue", "dog", "pen", "hat"], answer: "blue", lesson: "Blend /b/ and /l/ smoothly: bl-ue! The color blue starts with bl." },
      { blend: "tr", choices: ["train", "apple", "kite", "frog"], answer: "train", lesson: "Train begins with /t/ and /r/ blended together: tr-ain!" },
      { blend: "cl", choices: ["clock", "sun", "fish", "bed"], answer: "clock", lesson: "Say /c/ then /l/ quickly without stopping: cl-ock!" },
      { blend: "gr", choices: ["green", "rain", "boat", "cup"], answer: "green", lesson: "Listen for two beginning sounds: /g/ and /r/ make gr-een!" },
      { blend: "st", choices: ["star", "moon", "car", "bird"], answer: "star", lesson: "Star begins with /s/ and /t/ joined together: st-ar!" }
    ],
    average: [
      { blend: "br", choices: ["brush", "sun", "map", "cup"], answer: "brush", lesson: "A blend keeps both sounds. Say /b/ then /r/: br-ush!" },
      { blend: "dr", choices: ["drum", "cat", "ball", "nest"], answer: "drum", lesson: "/d/ and /r/ make the dr sound at the start of drum." },
      { blend: "fl", choices: ["flag", "log", "chair", "shoe"], answer: "flag", lesson: "Flag starts with /f/ and /l/ blended together: fl-ag!" },
      { blend: "pl", choices: ["plant", "tree", "fish", "bell"], answer: "plant", lesson: "/p/ + /l/ = pl. Plant, plane, play, please!" },
      { blend: "sp", choices: ["spoon", "fork", "ring", "cake"], answer: "spoon", lesson: "Listen to the start of spoon: /s/ /p/ blended into sp!" }
    ],
    intermediate: [
      { blend: "cr", choices: ["crab", "fish", "shell", "wave"], answer: "crab", lesson: "Crunchy crab starts with /c/ and /r/ blended: cr-ab!" },
      { blend: "gl", choices: ["glass", "plate", "cup", "bowl"], answer: "glass", lesson: "Glistening glass starts with /g/ and /l/: gl-ass!" },
      { blend: "pr", choices: ["prize", "gift", "box", "ribbon"], answer: "prize", lesson: "Say /p/ and /r/ smoothly together: pr-ize!" },
      { blend: "sl", choices: ["slide", "swing", "bench", "park"], answer: "slide", lesson: "Slide starts with /s/ and /l/ joined: sl-ide!" },
      { blend: "tw", choices: ["twins", "friends", "kids", "baby"], answer: "twins", lesson: "/t/ and /w/ blend into tw: tw-ins, twelve, twenty!" }
    ],
    advanced: [
      { blend: "str", choices: ["street", "road", "path", "alley"], answer: "street", lesson: "Three-letter blend: s-t-r. Street, strong, stripe!" },
      { blend: "scr", choices: ["screen", "glass", "window", "frame"], answer: "screen", lesson: "Three sounds blended: /s/ /c/ /r/ make scr-een!" },
      { blend: "spl", choices: ["splash", "drip", "drop", "wave"], answer: "splash", lesson: "Three sounds: s-p-l! Splash, split, splendid!" },
      { blend: "thr", choices: ["three", "two", "four", "count"], answer: "three", lesson: "Keep all three sounds: th-r-ee! Three, throw, thrill!" },
      { blend: "spr", choices: ["spring", "summer", "winter", "autumn"], answer: "spring", lesson: "Triple blend s-p-r: spring, spread, sprout!" }
    ]
  };

  // Game State
  let currentRounds = [];
  let currentRoundIndex = 0;
  let score = 0;
  let streak = 0;
  let difficulty = "easy";
  let studentName = "Reader";
  let teacherLessonText = "";
  let gameCompleted = false;
  let dashboardUrl = "student.html";
  let contentSet = 0;

  // DOM Elements
  const roundDisplay = document.getElementById("roundDisplay");
  const lessonText = document.getElementById("lessonText");
  const promptText = document.getElementById("promptText");
  const choicesContainer = document.getElementById("choicesContainer");
  const feedbackMsg = document.getElementById("feedbackMsg");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessageSpan = document.getElementById("scoreMessage");
  const studentNameSpan = document.getElementById("studentNameDisplay");
  const difficultySpan = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");
  const bridgeStones = document.getElementById("bridgeStones");
  const bridgeAvatar = document.getElementById("bridgeAvatar");
  const speakBtn = document.getElementById("speakBtn");
  const scoreCountEl = document.getElementById("scoreCount");
  const comboCountEl = document.getElementById("comboCount");

  function getRoundsForDifficulty(diff) {
    const level = String(diff || "easy").toLowerCase();
    const fallbackRounds = blendSets[level] || blendSets.easy;
    const materialQuestions = window.NumeReadGame?.getMaterialQuestions?.() || [];
    if (materialQuestions.length) {
      return materialQuestions.map((question, index) => ({
        blend: question.prompt,
        answer: String(question.answer),
        choices: question.choices.map(String),
        lesson: teacherLessonText || question.lesson || fallbackRounds[index % fallbackRounds.length].lesson
      }));
    }
    let generatedRounds;
    try {
      generatedRounds = window.NumeReadAdaptiveContent?.get("reading-bridge", level, contentSet, fallbackRounds);
    } catch (e) {
      // ignore
    }
    const rounds = Array.isArray(generatedRounds) && generatedRounds.length ? generatedRounds : fallbackRounds;
    return rounds.slice(0, 5);
  }

  function updateBridgeVisual() {
    const total = currentRounds.length;
    if (!bridgeStones) return;
    bridgeStones.innerHTML = "";

    for (let i = 0; i < total; i++) {
      const stone = document.createElement("div");
      stone.className = "stone-marker";
      stone.textContent = (i + 1).toString();
      if (i < currentRoundIndex) {
        stone.classList.add("completed");
      } else if (i === currentRoundIndex && !gameCompleted) {
        stone.classList.add("current");
      }
      bridgeStones.appendChild(stone);
    }

    if (bridgeAvatar) {
      if (gameCompleted) {
        bridgeAvatar.style.left = "92%";
        bridgeAvatar.textContent = "🏃🎉";
      } else {
        const pct = 6 + (currentRoundIndex / total) * 82;
        bridgeAvatar.style.left = `${pct}%`;
        bridgeAvatar.textContent = currentRoundIndex % 2 === 0 ? "🚶" : "🏃";
      }
    }
  }

  function speakCurrentBlend() {
    if (!currentRounds[currentRoundIndex]) return;
    const round = currentRounds[currentRoundIndex];
    const textToSpeak = `The blend sound is ${round.blend.split('').join('-')}, ${round.blend}! Choose the word that begins with ${round.blend}.`;
    if (window.NumeReadSound) {
      window.NumeReadSound.speak(textToSpeak);
    }
  }

  function renderRound() {
    if (currentRoundIndex >= currentRounds.length) {
      completeGame();
      return;
    }

    const round = currentRounds[currentRoundIndex];
    if (roundDisplay) {
      roundDisplay.textContent = `${currentRoundIndex + 1}/${currentRounds.length}`;
    }
    lessonText.textContent = teacherLessonText || round.lesson;
    promptText.innerHTML = `Choose the word that begins with <strong class="blend-highlight">${round.blend}</strong>`;

    const shuffledChoices = [...round.choices];
    for (let i = shuffledChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
    }

    choicesContainer.innerHTML = "";
    shuffledChoices.forEach(choice => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-card";
      btn.innerHTML = `<i class="fas fa-volume-low text-sky-500"></i> ${choice}`;
      btn.onclick = () => handleChoice(choice, btn);
      choicesContainer.appendChild(btn);
    });

    feedbackMsg.innerHTML = "";
    updateBridgeVisual();
  }

  async function handleChoice(choice, btnEl) {
    if (gameCompleted) return;
    const round = currentRounds[currentRoundIndex];
    if (!round) {
      completeGame();
      return;
    }
    const isCorrect = (String(choice).toLowerCase() === String(round.answer).toLowerCase());

    const allButtons = choicesContainer.querySelectorAll(".choice-card");
    allButtons.forEach(b => b.disabled = true);

    if (isCorrect) {
      score++;
      streak++;
      if (scoreCountEl) scoreCountEl.innerText = score;
      if (comboCountEl) comboCountEl.innerText = streak;

      try {
        if (window.NumeReadSound) {
          window.NumeReadSound.playChime(true);
          if (streak >= 3 && typeof window.NumeReadSound.triggerConfetti === "function") {
            window.NumeReadSound.triggerConfetti();
          }
        }
      } catch (e) {
        console.warn("Sound/confetti error, proceeding anyway:", e);
      }

      btnEl.style.background = "#dcfce7";
      btnEl.style.borderColor = "#16a34a";
      if (feedbackMsg) {
        feedbackMsg.innerHTML = `<span style="color:#15803d; font-weight:700;"><i class="fas fa-check-circle"></i> Excellent! "${choice}" begins with ${round.blend}! Stepping stone placed.</span>`;
      }

      try {
        if (window.NumeReadGame?.showAnswerFeedback) {
          window.NumeReadGame.showAnswerFeedback(true, `"${choice}" starts with ${round.blend}!`);
        }
      } catch (e) {}

      currentRoundIndex++;
      updateBridgeVisual();

      setTimeout(() => {
        if (currentRoundIndex < currentRounds.length) {
          renderRound();
        } else {
          completeGame();
        }
      }, 1000);
    } else {
      streak = 0;
      if (comboCountEl) comboCountEl.innerText = streak;

      try {
        if (window.NumeReadSound) {
          window.NumeReadSound.playChime(false);
        }
      } catch (e) {}

      btnEl.style.background = "#fee2e2";
      btnEl.style.borderColor = "#dc2626";
      if (feedbackMsg) {
        feedbackMsg.innerHTML = `<span style="color:#c2410c; font-weight:600;"><i class="fas fa-times-circle"></i> "${choice}" doesn't start with ${round.blend}. The correct word is "${round.answer}".</span>`;
      }

      try {
        if (window.NumeReadGame?.showAnswerFeedback) {
          window.NumeReadGame.showAnswerFeedback(false, `The correct word for ${round.blend} is ${round.answer}.`);
        }
      } catch (e) {}

      if (window.NumeReadGame?.tutorFeedback) {
        window.NumeReadGame.tutorFeedback({
          skill: "Blends",
          difficulty,
          correct: false,
          prompt: `${round.blend} blend`
        }).catch(() => {});
      }

      currentRoundIndex++;
      updateBridgeVisual();

      setTimeout(() => {
        if (currentRoundIndex < currentRounds.length) {
          renderRound();
        } else {
          completeGame();
        }
      }, 1500);
    }
  }

  async function completeGame() {
    gameCompleted = true;
    const total = currentRounds.length;
    const percent = Math.round((score / total) * 100);

    scoreMessageSpan.innerHTML = `🌉 Score: ${score} / ${total} (${percent}%)`;
    completionPanel.classList.remove("hidden");
    if (feedbackMsg) {
      feedbackMsg.innerHTML = score === total
        ? `🏆 PERFECT BRIDGE! You safely crossed the river with full fluency!`
        : `👏 Great reading! You placed ${score} out of ${total} stones.`;
    }

    updateBridgeVisual();

    try {
      if (window.NumeReadSound) {
        window.NumeReadSound.playVictory();
        if (typeof window.NumeReadSound.triggerConfetti === "function") {
          window.NumeReadSound.triggerConfetti();
        }
      }
    } catch (e) {}

    try {
      if (window.NumeReadGame?.finishGame) {
        await window.NumeReadGame.finishGame({
          activityId: "reading-bridge",
          area: "reading",
          skill: "Blends",
          gain: score === total ? 10 : 6,
          performance: total ? score / total : 0,
          xp: 30,
          badge: "Bridge Reader",
          clearGaps: ["Reading fluency"]
        });
      }
    } catch(e) {
      console.log("Progress saved locally");
    }
  }

  async function initGame() {
    currentRounds = getRoundsForDifficulty(difficulty);
    currentRoundIndex = 0;
    score = 0;
    streak = 0;
    gameCompleted = false;

    if (scoreCountEl) scoreCountEl.innerText = "0";
    if (comboCountEl) comboCountEl.innerText = "0";

    try {
      if (window.NumeReadGame && window.NumeReadGame.initGame) {
        const game = await window.NumeReadGame.initGame({ area: "reading" });
        difficulty = game.difficulty || "easy";
        contentSet = game.contentSet || 0;
        studentName = game.student?.name || studentName;
        dashboardUrl = game.dashboardUrl || (game.query ? `student.html?${game.query}` : dashboardUrl);
        teacherLessonText = game.teacherLesson?.content ? `Teacher module: ${game.teacherLesson.content}` : "";
      }
    } catch(e) {
      // fallback
    }

    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · blend coach`;

    currentRounds = getRoundsForDifficulty(difficulty);
    renderRound();

    if (speakBtn) {
      speakBtn.onclick = speakCurrentBlend;
    }
  }

  backBtn.addEventListener("click", () => {
    window.location.href = dashboardUrl;
  });

  initGame();
})();
