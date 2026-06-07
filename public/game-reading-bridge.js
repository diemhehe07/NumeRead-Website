// game-reading-bridge.js - Reading Bridge Game (Blends & Phonics)

(function() {
  // ============================================
  // BLEND DATASETS BY DIFFICULTY (Enhanced)
  // ============================================
  const blendSets = {
    starter: [
      { blend: "bl", choices: ["blue", "dog", "pen"], answer: "blue", lesson: "Blend the first two sounds without stopping. /b/ /l/ → bl." },
      { blend: "tr", choices: ["train", "apple", "kite"], answer: "train", lesson: "Train begins with /t/ and /r/ blended together." },
      { blend: "cl", choices: ["clock", "sun", "fish"], answer: "clock", lesson: "Say /c/ then /l/ quickly. cl-ock!" },
      { blend: "gr", choices: ["green", "rain", "boat"], answer: "green", lesson: "Listen for two beginning sounds before the vowel." }
    ],
    support: [
      { blend: "br", choices: ["brush", "sun", "map"], answer: "brush", lesson: "A blend keeps both sounds. Say /b/ then /r/ quickly." },
      { blend: "cl", choices: ["cup", "clock", "fish"], answer: "clock", lesson: "The letters c and l blend at the start of clock." },
      { blend: "dr", choices: ["drum", "cat", "ball"], answer: "drum", lesson: "/d/ and /r/ make the dr sound like in drum." },
      { blend: "fl", choices: ["flag", "log", "chair"], answer: "flag", lesson: "Flag starts with /f/ and /l/ blended." }
    ],
    practice: [
      { blend: "gr", choices: ["green", "rain", "boat"], answer: "green", lesson: "Listen for two beginning sounds before the vowel." },
      { blend: "fl", choices: ["flag", "log", "chair"], answer: "flag", lesson: "Flag starts with /f/ and /l/ blended together." },
      { blend: "pl", choices: ["plane", "tree", "fish"], answer: "plane", lesson: "/p/ + /l/ = pl. Plane, play, please!" },
      { blend: "cr", choices: ["crab", "dog", "sun"], answer: "crab", lesson: "Crunchy crab starts with /c/ and /r/." }
    ],
    challenge: [
      { blend: "str", choices: ["street", "tree", "seat"], answer: "street", lesson: "Three-letter blends can keep all three sounds: s-t-r." },
      { blend: "scr", choices: ["screen", "cream", "seen"], answer: "screen", lesson: "Say /s/ /c/ /r/, then slide into the rest of the word." },
      { blend: "spl", choices: ["splash", "flash", "ash"], answer: "splash", lesson: "Three sounds: s-p-l. Splash, split, splendid!" },
      { blend: "thr", choices: ["three", "tree", "see"], answer: "three", lesson: "Thr is tricky! Th-r-ee. Keep all three sounds." }
    ]
  };

  // ============================================
  // GAME STATE
  // ============================================
  let currentRounds = [];
  let currentRoundIndex = 0;
  let score = 0;
  let difficulty = "starter";
  let studentName = "Reader";
  let gameCompleted = false;
  let dashboardUrl = "student.html";

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
  const bridgeFill = document.getElementById("bridgeFill");
  const bridgeStones = document.getElementById("bridgeStones");

  // Get rounds for difficulty
  function getRoundsForDifficulty(diff) {
    return blendSets[diff] || blendSets.starter;
  }

  // Update bridge visual
  function updateBridgeProgress() {
    const total = currentRounds.length;
    const progress = ((currentRoundIndex) / total) * 100;
    bridgeFill.style.width = `${progress}%`;
    
    // Update stone markers
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
  }

  // Render current round
  function renderRound() {
    if (currentRoundIndex >= currentRounds.length) {
      completeGame();
      return;
    }
    
    const round = currentRounds[currentRoundIndex];
    roundDisplay.textContent = `${currentRoundIndex + 1}/${currentRounds.length}`;
    lessonText.textContent = round.lesson;
    promptText.innerHTML = `<i class="fas fa-ear-listen"></i> Choose the word that begins with <strong style="color:#e67e22; font-size:1.8rem;">${round.blend}</strong>`;
    
    // Shuffle choices for variety
    const shuffledChoices = [...round.choices];
    for (let i = shuffledChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
    }
    
    choicesContainer.innerHTML = shuffledChoices.map(choice => `
      <button class="choice-card" data-choice="${choice}">
        <i class="fas fa-word-simple"></i> ${choice}
      </button>
    `).join("");
    
    feedbackMsg.innerHTML = "";
    updateBridgeProgress();
  }

  // Handle user choice
  async function handleChoice(choice, buttonElement) {
    if (gameCompleted) {
      feedbackMsg.innerHTML = "🏁 Bridge is complete! Return to dashboard.";
      return;
    }
    
    const round = currentRounds[currentRoundIndex];
    const isCorrect = (choice === round.answer);
    
    // Disable all choice buttons during feedback
    const allButtons = document.querySelectorAll(".choice-card");
    allButtons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
      score++;
      feedbackMsg.innerHTML = `<span style="color:#2e7d32;"><i class="fas fa-check-circle"></i> ✅ Correct! "${choice}" begins with ${round.blend}! Bridge stone placed.</span>`;
      buttonElement.classList.add("correct-animation");
      
      // Play success effect
      currentRoundIndex++;
      
      if (currentRoundIndex < currentRounds.length) {
        setTimeout(() => {
          renderRound();
        }, 800);
      } else {
        setTimeout(() => {
          completeGame();
        }, 800);
      }
    } else {
      feedbackMsg.innerHTML = `<span style="color:#c2410c;"><i class="fas fa-times-circle"></i> ❌ Oops! "${choice}" doesn't begin with ${round.blend}. The correct word is "${round.answer}". Try the next one!</span>`;
      buttonElement.classList.add("wrong-animation");
      
      // AI feedback if available
      if (window.NumeReadGame && window.NumeReadGame.tutorFeedback) {
        await window.NumeReadGame.tutorFeedback({
          skill: "Blends",
          difficulty: difficulty,
          correct: false,
          prompt: `${round.blend} blend`
        });
      }
      
      // Move to next round after delay
      currentRoundIndex++;
      if (currentRoundIndex < currentRounds.length) {
        setTimeout(() => {
          renderRound();
        }, 1500);
      } else {
        setTimeout(() => {
          completeGame();
        }, 1500);
      }
    }
    
    // Remove animation classes after timeout
    setTimeout(() => {
      if (buttonElement) {
        buttonElement.classList.remove("correct-animation", "wrong-animation");
      }
    }, 500);
  }

  // Complete the game and save progress
  async function completeGame() {
    gameCompleted = true;
    const total = currentRounds.length;
    const percent = Math.round((score / total) * 100);
    
    scoreMessageSpan.innerHTML = `🌉 Score: ${score} / ${total} (${percent}%) 🎉`;
    completionPanel.classList.remove("hidden");
    
    if (score === total) {
      feedbackMsg.innerHTML = `🏆 PERFECT! You built the entire bridge! Amazing reading skills! 🏆`;
    } else {
      feedbackMsg.innerHTML = `👍 Great effort! You correctly identified ${score} out of ${total} blends. Keep practicing!`;
    }
    
    // Disable all choice buttons
    const allButtons = document.querySelectorAll(".choice-card");
    allButtons.forEach(btn => btn.disabled = true);
    
    // Update bridge fill to 100% for completion
    bridgeFill.style.width = "100%";
    updateBridgeProgress();
    
    // Save progress
    try {
      localStorage.setItem("numeread_bridge_score", score);
      localStorage.setItem("numeread_bridge_total", total);
      localStorage.setItem("numeread_bridge_difficulty", difficulty);
      localStorage.setItem("numeread_bridge_completed", new Date().toISOString());
      
      if (window.NumeReadGame && window.NumeReadGame.finishGame) {
        const gain = score === total ? 10 : 5;
        await window.NumeReadGame.finishGame({
          activityId: "reading-bridge",
          area: "reading",
          skill: "Blends",
          gain: gain,
          xp: 25,
          badge: "Bridge Reader",
          clearGaps: ["Reading fluency"]
        });
      }
    } catch(e) { console.log("Progress saved locally"); }
  }

  // Initialize game
  async function initGame() {
    try {
      if (window.NumeReadGame && window.NumeReadGame.initGame) {
        const game = await window.NumeReadGame.initGame({ area: "reading" });
        difficulty = game.difficulty || "starter";
        dashboardUrl = game.dashboardUrl || (game.query ? `student.html?${game.query}` : dashboardUrl);
      } else {
        const savedDiff = localStorage.getItem("numeread_difficulty") || "starter";
        difficulty = savedDiff;
      }
    } catch(e) {
      difficulty = "starter";
    }
    
    // Get student name
    studentName = localStorage.getItem("numeread_student") || "Maya";
    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · blend coach`;
    
    currentRounds = getRoundsForDifficulty(difficulty);
    currentRoundIndex = 0;
    score = 0;
    gameCompleted = false;
    
    renderRound();
  }

  // Event delegation for choice clicks
  choicesContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".choice-card");
    if (button && !button.disabled && !gameCompleted) {
      const choice = button.dataset.choice;
      handleChoice(choice, button);
    }
  });
  
  // Back button navigation
  backBtn.addEventListener("click", () => {
    if (!gameCompleted && currentRoundIndex > 0) {
      localStorage.setItem("numeread_bridge_progress", JSON.stringify({
        score: score,
        index: currentRoundIndex,
        difficulty: difficulty
      }));
    }
    window.location.href = dashboardUrl;
  });
  
  // Start the game
  initGame();
})();
