// game-math-ninja.js - Math Ninja Addition Game

(function() {
  // ============================================
  // GAME CONFIGURATION
  // ============================================
  const VALID_LEVELS = ["easy", "average", "intermediate", "advanced"];
  const requestedLevel = String(new URLSearchParams(window.location.search).get("level") || "").toLowerCase();
  const savedLaunchLevel = String(sessionStorage.getItem("numeread_launch_level_math-ninja") || "").toLowerCase();
  // The dashboard link is authoritative for this launch. It must not be
  // replaced by the Easy fallback if the learner profile call is interrupted.
  const launchLevel = VALID_LEVELS.includes(requestedLevel) ? requestedLevel : (VALID_LEVELS.includes(savedLaunchLevel) ? savedLaunchLevel : "");
  let TOTAL_ROUNDS = 10;
  let difficulty = launchLevel || "easy";
  let currentProblem = null;
  let score = 0;
  let currentRound = 0;
  let combo = 0;
  let gameCompleted = false;
  let studentName = "Math Ninja";
  let teacherLessonText = "";
  let waitingForNext = false;
  let dashboardUrl = "student.html";
  let materialProblems = [];

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
  const scoreCountSpan = document.getElementById("scoreCount");
  const comboCountSpan = document.getElementById("comboCount");
  const ninjaFill = document.getElementById("ninjaFill");
  const ninjaStones = document.getElementById("ninjaStones");

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get number ranges based on difficulty
  function getNumberRange() {
    const ranges = {
      easy: [1, 9],
      average: [1, 12],
      intermediate: [8, 24],
      advanced: [25, 99]
    };
    return ranges[difficulty] || [1, 12];
  }

  // Get lesson tip based on difficulty
  function getLessonTip() {
    const tips = {
      easy: "Easy: Addition joins two small groups. Count on from the bigger number.",
      average: "Average: Use objects, fingers, or quick drawings to check your sum.",
      intermediate: "Intermediate: Make ten first, then add the remaining ones.",
      advanced: "Advanced: Add tens and ones mentally, then combine the partial sums."
    };
    return tips[difficulty] || "Addition joins two amounts. Count on from the bigger number or make ten first.";
  }

  // Generate a math problem
  function generateProblem() {
    const bank = window.NumeReadGame?.getActivityQuestions?.("math-ninja", difficulty, { seed: 0 }) || window.NumeReadTestBanks?.getForActivity("math-ninja", difficulty, { seed: 0 }) || [];
    // `currentRound` is zero-based until the round has been rendered below.
    // Reading `currentRound - 1` on the first turn requested bank[-1], which
    // stopped the render and left the page's 0 + 0 placeholder on screen.
    const item = bank[currentRound];
    if (!item) throw new Error(`No Math Ninja item is available for round ${currentRound}.`);
    return {
      prompt: item.prompt,
      answer: Number(item.answer),
      choices: item.choices.map(Number),
      a: Number(item.a || 0),
      b: Number(item.b || 0),
      tip: item.tip || getLessonTip()
    };
  }

  // Update progress visual (bridge/ninja stones)
  function updateProgressVisual() {
    const progress = (currentRound / TOTAL_ROUNDS) * 100;
    ninjaFill.style.width = `${progress}%`;
    
    // Update stone markers
    ninjaStones.innerHTML = "";
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const stone = document.createElement("div");
      stone.className = "stone-marker";
      stone.textContent = (i + 1).toString();
      if (i < currentRound) {
        stone.classList.add("completed");
      } else if (i === currentRound && !gameCompleted && currentRound < TOTAL_ROUNDS) {
        stone.classList.add("current");
      }
      ninjaStones.appendChild(stone);
    }
    
    // Update score display
    scoreCountSpan.textContent = `${score}/${currentRound}`;
    comboCountSpan.textContent = combo;
  }

  // Render current round
  function renderRound() {
    if (gameCompleted) return;
    
    currentProblem = generateProblem();
    currentRound++;
    
    roundDisplay.textContent = `${currentRound}/${TOTAL_ROUNDS}`;
    lessonText.textContent = teacherLessonText || currentProblem.tip;
    promptText.innerHTML = `<i class="fas fa-calculator"></i> ${currentProblem.prompt} = ?`;
    
    // Render choice buttons
    choicesContainer.innerHTML = currentProblem.choices.map(choice => `
      <button class="choice-card" data-choice="${choice}">
        ${choice}
      </button>
    `).join("");
    
    feedbackMsg.innerHTML = "";
    updateProgressVisual();
    waitingForNext = false;
  }

  // Handle user's answer
  async function handleChoice(choiceValue, buttonElement) {
    if (gameCompleted || waitingForNext) return;
    
    const isCorrect = Number(choiceValue) === currentProblem.answer;
    waitingForNext = true;
    feedbackMsg.dataset.status = isCorrect ? "correct" : "incorrect";
    
    // Disable all buttons during feedback
    const allButtons = document.querySelectorAll(".choice-card");
    allButtons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
      // Correct answer
      score++;
      combo++;
      
      // Bonus points for combo
      let bonusText = "";
      if (combo >= 3) {
        bonusText = ` 🔥 ${combo}x COMBO! +${Math.min(combo, 5)} bonus!`;
      }
      
      feedbackMsg.innerHTML = `<span style="color:#2e7d32;"><i class="fas fa-check-circle"></i> ✅ NINJA STRIKE! ${currentProblem.prompt} = ${currentProblem.answer}${bonusText}</span>`;
      buttonElement.classList.add("correct-animation");
      
      // AI feedback for correct answer (non-blocking)
      if (window.NumeReadGame && window.NumeReadGame.tutorFeedback) {
        window.NumeReadGame.tutorFeedback({
          skill: "Addition facts",
          difficulty: difficulty,
          correct: true,
          prompt: currentProblem.prompt,
          responseTime: 0
        }).catch(() => {});
      }
      
      // Check if game is complete
      if (currentRound >= TOTAL_ROUNDS) {
        setTimeout(() => completeGame(), 800);
      } else {
        setTimeout(() => {
          renderRound();
        }, 800);
      }
    } else {
      // Wrong answer
      combo = 0;
      feedbackMsg.innerHTML = `<span style="color:#c2410c;"><i class="fas fa-times-circle"></i> ❌ Ninja miss! ${currentProblem.prompt} = ${currentProblem.answer}, not ${choiceValue}. Keep practicing!</span>`;
      buttonElement.classList.add("wrong-animation");
      
      // AI feedback for wrong answer (non-blocking)
      if (window.NumeReadGame && window.NumeReadGame.tutorFeedback) {
        window.NumeReadGame.tutorFeedback({
          skill: "Addition facts",
          difficulty: difficulty,
          correct: false,
          prompt: currentProblem.prompt
        }).catch(() => {});
      }
      
      // Move to next round after delay
      if (currentRound >= TOTAL_ROUNDS) {
        setTimeout(() => completeGame(), 1500);
      } else {
        setTimeout(() => {
          renderRound();
        }, 1500);
      }
    }
    
    // Remove animation classes
    setTimeout(() => {
      if (buttonElement) {
        buttonElement.classList.remove("correct-animation", "wrong-animation");
      }
    }, 500);
    
    updateProgressVisual();
  }

  // Complete the game and save progress
  async function completeGame() {
    gameCompleted = true;
    const percent = Math.round((score / TOTAL_ROUNDS) * 100);
    
    let medal = "";
    if (percent === 100) medal = " 🏆 PERFECT NINJA MASTER! 🏆";
    else if (percent >= 80) medal = " 🥷 BLACK BELT NINJA! 🥷";
    else if (percent >= 60) medal = " ⚡ SKILLFUL NINJA! ⚡";
    else medal = " 🌱 Keep training, young ninja! 🌱";
    
    scoreMessageSpan.innerHTML = `🎯 Score: ${score} / ${TOTAL_ROUNDS} (${percent}%) ${medal}`;
    completionPanel.classList.remove("hidden");
    feedbackMsg.innerHTML = `🏅 Great math battle! You answered ${score} out of ${TOTAL_ROUNDS} correctly. ${medal}`;
    
    // Disable all choice buttons
    const allButtons = document.querySelectorAll(".choice-card");
    allButtons.forEach(btn => btn.disabled = true);
    
    // Fill progress to 100%
    ninjaFill.style.width = "100%";
    updateProgressVisual();
    
    // Save progress
    try {
      localStorage.setItem("numeread_ninja_score", score);
      localStorage.setItem("numeread_ninja_total", TOTAL_ROUNDS);
      localStorage.setItem("numeread_ninja_difficulty", difficulty);
      localStorage.setItem("numeread_ninja_completed", new Date().toISOString());
      
      if (window.NumeReadGame && window.NumeReadGame.finishGame) {
        const gain = Math.max(4, score * 3);
        await window.NumeReadGame.finishGame({
          activityId: "math-ninja",
          area: "math",
          skill: "Addition facts",
          gain: gain,
          performance: score / TOTAL_ROUNDS,
          xp: 30,
          badge: "Number Ninja"
        });
      }
    } catch(e) { 
      console.log("Progress saved locally"); 
    }
  }

  // Initialize game
  async function initGame() {
    try {
      if (window.NumeReadGame && window.NumeReadGame.initGame) {
        const game = await window.NumeReadGame.initGame({ area: "math" });
        difficulty = launchLevel || game.difficulty || difficulty;
        TOTAL_ROUNDS = (window.NumeReadGame?.getActivityQuestions?.("math-ninja", difficulty) || window.NumeReadTestBanks?.getForActivity("math-ninja", difficulty) || []).length || 10;
        studentName = game.student?.name || studentName;
        dashboardUrl = game.dashboardUrl || (game.query ? `student.html?${game.query}` : dashboardUrl);
        teacherLessonText = game.teacherLesson?.content ? `Teacher module: ${game.teacherLesson.content}` : "";
        materialProblems = (window.NumeReadGame.getMaterialQuestions?.() || []).filter((item) => Number.isFinite(Number(item.answer)) && item.choices?.every((choice) => Number.isFinite(Number(choice))));
      } else {
        const savedDiff = String(localStorage.getItem("numeread_difficulty") || "").toLowerCase();
        difficulty = launchLevel || (VALID_LEVELS.includes(savedDiff) ? savedDiff : difficulty);
      }
    } catch(e) {
      // Preserve the level selected from the dashboard if optional game setup
      // (such as materials or language controls) is unavailable.
      console.warn("Math Ninja started with local level data.", e);
    }
    
    TOTAL_ROUNDS = (window.NumeReadGame?.getActivityQuestions?.("math-ninja", difficulty) || window.NumeReadTestBanks?.getForActivity("math-ninja", difficulty) || []).length || 10;

    // Get student name
    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · math coach`;
    
    // Reset game state
    score = 0;
    currentRound = 0;
    combo = 0;
    gameCompleted = false;
    waitingForNext = false;
    
    // Start first round
    renderRound();
  }

  // Event delegation for choice clicks
  choicesContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".choice-card");
    if (button && !button.disabled && !gameCompleted && !waitingForNext) {
      const choice = button.dataset.choice;
      handleChoice(choice, button);
    }
  });
  
  // Back button navigation
  backBtn.addEventListener("click", () => {
    if (!gameCompleted && currentRound > 0) {
      localStorage.setItem("numeread_ninja_progress", JSON.stringify({
        score: score,
        round: currentRound,
        difficulty: difficulty
      }));
    }
    window.location.href = dashboardUrl;
  });
  
  // Start the game
  initGame();
})();
