// game-word-bakery.js - Main Game Logic for Word Problem Bakery

// --------------------------------------------------------------
// Data Module (numeread-data.js equivalent)
// --------------------------------------------------------------
window.NumeReadData = window.NumeReadData || {
  getProblemsForDifficulty: (difficulty) => {
    const problemsDB = {
      starter: [
        { story: "🍞 The bakery made 12 croissants in the morning and 8 baguettes in the afternoon. How many baked goods in total?", correctOp: "add", answer: 20 },
        { story: "🥧 There were 15 cinnamon rolls. The baker sold 7. How many remain?", correctOp: "subtract", answer: 8 },
        { story: "🍩 A customer ordered 9 donuts and later asked for 6 more. Total donuts?", correctOp: "add", answer: 15 },
        { story: "🧁 Chef baked 24 cupcakes, then a party bought 10. How many cupcakes left?", correctOp: "subtract", answer: 14 }
      ],
      intermediate: [
        { story: "🥖 The bakery produced 38 loaves of sourdough. They delivered 12 to a cafe and 9 to a hotel. How many loaves remain?", correctOp: "subtract", answer: 17 },
        { story: "🍰 On Monday, 23 cheesecakes were sold. Tuesday 17, Wednesday 29. Total sold?", correctOp: "add", answer: 69 },
        { story: "🥨 A baker makes 45 pretzels. He puts them in bags of 5. How many bags? (multi-step)", correctOp: "subtract", answer: 9 }
      ],
      advanced: [
        { story: "🎂 A pastry chef baked 120 macarons. She sold 45 in the morning and 38 in the afternoon. How many macarons are left?", correctOp: "subtract", answer: 37 },
        { story: "🍪 The bakery's daily cookie production is 250. If 127 are chocolate chip and the rest are oatmeal, how many oatmeal cookies?", correctOp: "subtract", answer: 123 }
      ]
    };
    let level = problemsDB[difficulty] || problemsDB.starter;
    return level.map((p, idx) => ({ ...p, id: idx }));
  }
};

// --------------------------------------------------------------
// AI Module (numeread-ai.js equivalent)
// --------------------------------------------------------------
window.NumeReadAI = window.NumeReadAI || {
  generateHint: (problem, selectedOp) => {
    const hints = {
      add: "Look for keywords like 'total', 'together', 'in all', 'combined'.",
      subtract: "Look for keywords like 'remain', 'left', 'fewer', 'difference'."
    };
    return hints[problem?.correctOp] || "Read carefully: do you combine or take away?";
  },
  isEnabled: true
};

// --------------------------------------------------------------
// Game Core (game-core.js equivalent)
// --------------------------------------------------------------
window.GameCore = window.GameCore || {
  checkAnswer: (userAns, correctAns) => userAns === correctAns,
  calculateScore: (correctCount, total) => Math.round((correctCount / total) * 100)
};

// --------------------------------------------------------------
// Firebase Config (firebase-config.js stub)
// --------------------------------------------------------------
window.firebaseConfig = window.firebaseConfig || {
  apiKey: "demo-numeread",
  authDomain: "numeread-demo.firebaseapp.com",
  projectId: "numeread-demo"
};

// Initialize Firebase mock if needed
if (typeof firebase !== 'undefined' && firebase.initializeApp && !firebase.apps?.length) {
  try {
    firebase.initializeApp(window.firebaseConfig);
  } catch(e) { console.log("Firebase init skipped (demo mode)"); }
}

// --------------------------------------------------------------
// Main Bakery Game Controller
// --------------------------------------------------------------
(function() {
  // DOM Elements
  const storyDiv = document.getElementById("storyText");
  const lessonTextSpan = document.getElementById("lessonText");
  const feedbackDiv = document.getElementById("feedbackMsg");
  const opAdd = document.getElementById("opAddBtn");
  const opSubtract = document.getElementById("opSubtractBtn");
  const answerInput = document.getElementById("answerInput");
  const submitBtn = document.getElementById("submitAnswerBtn");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessageSpan = document.getElementById("scoreMessage");
  const studentNameSpan = document.getElementById("studentNameDisplay");
  const difficultySpan = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");

  // Game State
  let currentProblemsList = [];
  let currentProblemIndex = 0;
  let currentProblem = null;
  let selectedOperation = null;
  let score = 0;
  let totalQuestions = 0;
  let gameCompleted = false;
  let difficulty = "starter";
  let studentName = "Baker";
  let hintTimeout = null;

  // Helper: Load problems based on difficulty
  function loadProblemsForDifficulty(diff) {
    const dataSet = window.NumeReadData.getProblemsForDifficulty(diff);
    return dataSet.map(p => ({
      story: p.story,
      correctOp: p.correctOp,
      answer: p.answer
    }));
  }

  // Update operation button active states
  function updateOperationButtonsActive(selected) {
    if (selected === 'add') {
      opAdd.classList.add("op-active");
      opSubtract.classList.remove("op-active");
    } else if (selected === 'subtract') {
      opSubtract.classList.add("op-active");
      opAdd.classList.remove("op-active");
    } else {
      opAdd.classList.remove("op-active");
      opSubtract.classList.remove("op-active");
    }
  }

  // Load current problem into UI
  function loadCurrentProblem() {
    if (currentProblemIndex >= totalQuestions) {
      completeGame();
      return;
    }
    currentProblem = currentProblemsList[currentProblemIndex];
    storyDiv.innerText = currentProblem.story;
    answerInput.value = "";
    feedbackDiv.innerHTML = "";
    selectedOperation = null;
    updateOperationButtonsActive(null);
    answerInput.disabled = false;
    submitBtn.disabled = false;
    storyDiv.classList.remove("correct-flash");
    
    // Clear any pending hint timeout
    if (hintTimeout) clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
      if (!gameCompleted && currentProblem && !selectedOperation && feedbackDiv.innerHTML === "") {
        const aiHint = window.NumeReadAI.generateHint(currentProblem, null);
        feedbackDiv.innerHTML = `🤖 <strong>AI Baker Tip:</strong> ${aiHint}`;
      }
    }, 8000);
  }

  // Complete the game and save progress
  function completeGame() {
    gameCompleted = true;
    const percent = window.GameCore.calculateScore(score, totalQuestions);
    scoreMessageSpan.innerText = `🍪 Score: ${score} / ${totalQuestions} (${percent}%) 🎉`;
    completionPanel.classList.remove("hidden");
    feedbackDiv.innerHTML = `🏆 Amazing baking! You solved ${score} out of ${totalQuestions} problems correctly.`;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    opAdd.disabled = true;
    opSubtract.disabled = true;
    
    // Save progress to localStorage and attempt Firebase
    try {
      localStorage.setItem("numeread_last_score", score);
      localStorage.setItem("numeread_last_total", totalQuestions);
      localStorage.setItem("numeread_last_difficulty", difficulty);
      localStorage.setItem("numeread_completed", new Date().toISOString());
      
      if (typeof firebase !== 'undefined' && firebase.firestore && firebase.apps?.length) {
        const db = firebase.firestore();
        db.collection("progress").doc("bakery_progress").set({
          student: studentName,
          difficulty: difficulty,
          score: score,
          total: totalQuestions,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.log("Firestore save skipped (demo)"));
      }
    } catch(e) { console.log("Progress saved locally only"); }
  }

  // Check user's answer and operation
  function checkAnswerAndAdvance() {
    if (gameCompleted) {
      feedbackDiv.innerHTML = "🏁 Game finished! Return to dashboard to start a new batch.";
      return;
    }
    if (!currentProblem) return;
    
    if (!selectedOperation) {
      feedbackDiv.innerHTML = "🍞 First, choose an operation: Add ➕ or Subtract ➖";
      return;
    }
    
    const rawAnswer = answerInput.value.trim();
    if (rawAnswer === "") {
      feedbackDiv.innerHTML = "🥧 Type a number answer before checking!";
      return;
    }
    
    const userAnswer = Number(rawAnswer);
    if (isNaN(userAnswer)) {
      feedbackDiv.innerHTML = "🔢 That's not a valid number... try again!";
      return;
    }
    
    const isCorrectOperation = (selectedOperation === currentProblem.correctOp);
    const isCorrectValue = window.GameCore.checkAnswer(userAnswer, currentProblem.answer);
    const overallCorrect = (isCorrectOperation && isCorrectValue);
    
    if (overallCorrect) {
      // Correct answer!
      score++;
      feedbackDiv.innerHTML = `<span style="color:#2e7d32;"><i class="fas fa-check-circle"></i> Perfect! ${selectedOperation === 'add' ? 'Addition' : 'Subtraction'} was right, answer ${currentProblem.answer} — delicious math!</span>`;
      storyDiv.classList.add("correct-flash");
      setTimeout(() => storyDiv.classList.remove("correct-flash"), 500);
      
      // Move to next problem
      currentProblemIndex++;
      if (currentProblemIndex < totalQuestions) {
        loadCurrentProblem();
      } else {
        completeGame();
      }
    } else {
      // Wrong answer - provide detailed feedback
      let errorMsg = "";
      if (!isCorrectOperation && !isCorrectValue) {
        errorMsg = `❌ Wrong operation and wrong number. The story needs ${currentProblem.correctOp === 'add' ? 'addition (total/combine)' : 'subtraction (left/remain)'}. Try again!`;
      } else if (!isCorrectOperation) {
        errorMsg = `⚠️ Operation mismatch: The story suggests ${currentProblem.correctOp === 'add' ? 'addition' : 'subtraction'}. The number was correct though!`;
      } else if (!isCorrectValue) {
        errorMsg = `🧮 The operation ${selectedOperation === 'add' ? 'addition' : 'subtraction'} is correct, but the number is wrong. Re-read and calculate carefully.`;
      }
      feedbackDiv.innerHTML = `${errorMsg} <i class="fas fa-doughnut"></i> Keep going, try this problem again.`;
      // Don't advance - let user retry same problem
    }
  }

  // Handle operation selection
  function handleOperation(op) {
    if (gameCompleted) {
      feedbackDiv.innerHTML = "Game already finished! Go back to dashboard.";
      return;
    }
    selectedOperation = op;
    updateOperationButtonsActive(op);
    feedbackDiv.innerHTML = `✅ Operation selected: <strong>${op === 'add' ? 'Addition ➕' : 'Subtraction ➖'}</strong>. Now enter your answer.`;
  }

  // Initialize or reset the game
  function initGame() {
    // Load saved data from localStorage
    const savedDiff = localStorage.getItem("numeread_difficulty") || "starter";
    const savedStudent = localStorage.getItem("numeread_student") || "Maya";
    difficulty = savedDiff;
    studentName = savedStudent;
    
    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · hints enabled`;
    
    const problems = loadProblemsForDifficulty(difficulty);
    if (!problems.length) {
      currentProblemsList = [{ story: "Bakery has 5 muffins, bakes 3 more. Total?", correctOp: "add", answer: 8 }];
    } else {
      currentProblemsList = problems;
    }
    
    totalQuestions = currentProblemsList.length;
    currentProblemIndex = 0;
    score = 0;
    gameCompleted = false;
    selectedOperation = null;
    updateOperationButtonsActive(null);
    completionPanel.classList.add("hidden");
    feedbackDiv.innerHTML = "";
    answerInput.value = "";
    answerInput.disabled = false;
    submitBtn.disabled = false;
    opAdd.disabled = false;
    opSubtract.disabled = false;
    
    // Set mini lesson based on difficulty
    let lessonMsg = "";
    if (difficulty === "starter") {
      lessonMsg = "⭐ Starter: Use addition (+) when things join together, subtraction (-) when things are taken away.";
    } else if (difficulty === "intermediate") {
      lessonMsg = "📘 Intermediate: Read carefully — sometimes you need two-step thinking! Look for keywords.";
    } else {
      lessonMsg = "🧠 Advanced: Pay close attention to keywords like 'total', 'remain', 'left', 'difference'.";
    }
    lessonTextSpan.innerText = lessonMsg;
    
    if (totalQuestions > 0) loadCurrentProblem();
    else feedbackDiv.innerHTML = "⚠️ No problems available for this difficulty.";
  }

  // Navigate back to dashboard
  function goToDashboard() {
    // Save current progress before leaving
    if (!gameCompleted && currentProblemIndex > 0) {
      localStorage.setItem("numeread_bakery_progress", JSON.stringify({
        score: score,
        index: currentProblemIndex,
        total: totalQuestions,
        difficulty: difficulty
      }));
    }
    window.location.href = "student.html";
  }

  // Event Listeners
  opAdd.addEventListener("click", () => handleOperation("add"));
  opSubtract.addEventListener("click", () => handleOperation("subtract"));
  submitBtn.addEventListener("click", checkAnswerAndAdvance);
  backBtn.addEventListener("click", goToDashboard);
  
  answerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkAnswerAndAdvance();
    }
  });

  // Start the game
  initGame();
})();