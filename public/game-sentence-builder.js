// game-sentence-builder.js - Sentence Builder Reading Comprehension Game

(function() {
  // ============================================
  // WORD & SENTENCE DATASETS BY DIFFICULTY
  // ============================================
  const sentenceSets = {
    starter: [
      { 
        words: ["The", "cat", "runs"], 
        sentence: "The cat runs", 
        question: "Who runs?", 
        answer: "cat",
        hint: "Look for the animal that runs."
      },
      { 
        words: ["A", "dog", "barks"], 
        sentence: "A dog barks", 
        question: "What does the dog do?", 
        answer: "barks",
        hint: "The action of a dog."
      },
      { 
        words: ["The", "sun", "shines"], 
        sentence: "The sun shines", 
        question: "What shines?", 
        answer: "sun",
        hint: "The bright thing in the sky."
      }
    ],
    support: [
      { 
        words: ["The", "small", "bird", "sings"], 
        sentence: "The small bird sings", 
        question: "What does the bird do?", 
        answer: "sings",
        hint: "A sound birds make."
      },
      { 
        words: ["My", "red", "ball", "bounces"], 
        sentence: "My red ball bounces", 
        question: "What color is the ball?", 
        answer: "red",
        hint: "Look for the color word."
      },
      { 
        words: ["The", "happy", "girl", "dances"], 
        sentence: "The happy girl dances", 
        question: "How does the girl feel?", 
        answer: "happy",
        hint: "An emotion word."
      }
    ],
    practice: [
      { 
        words: ["Rina", "reads", "a", "funny", "story"], 
        sentence: "Rina reads a funny story", 
        question: "What does Rina read?", 
        answer: "story",
        hint: "Something you read for fun."
      },
      { 
        words: ["The", "big", "elephant", "trumpets", "loudly"], 
        sentence: "The big elephant trumpets loudly", 
        question: "How does the elephant trumpet?", 
        answer: "loudly",
        hint: "Opposite of quietly."
      },
      { 
        words: ["Mom", "bakes", "delicious", "cookies"], 
        sentence: "Mom bakes delicious cookies", 
        question: "Who bakes cookies?", 
        answer: "Mom",
        hint: "The family member."
      }
    ],
    challenge: [
      { 
        words: ["After", "class", "Marco", "solves", "three", "puzzles"], 
        sentence: "After class Marco solves three puzzles", 
        question: "When does Marco solve puzzles?", 
        answer: "After class",
        hint: "Think about the time phrase at the beginning."
      },
      { 
        words: ["Because", "of", "the", "rain", "we", "stay", "inside"], 
        sentence: "Because of the rain we stay inside", 
        question: "Why do we stay inside?", 
        answer: "rain",
        hint: "Weather condition."
      },
      { 
        words: ["The", "brave", "knight", "defeats", "the", "dragon"], 
        sentence: "The brave knight defeats the dragon", 
        question: "Who defeats the dragon?", 
        answer: "knight",
        hint: "The hero in armor."
      }
    ]
  };

  // ============================================
  // GAME STATE
  // ============================================
  let currentDifficulty = "starter";
  let currentSetIndex = 0;
  let currentItem = null;
  let builtWords = [];
  let originalShuffledWords = [];
  let gameCompleted = false;
  let studentName = "Reader";
  let score = 0;
  let totalQuestions = 0;
  let dashboardUrl = "student.html";

  // DOM Elements
  const lessonText = document.getElementById("lessonText");
  const builtSentenceDisplay = document.getElementById("builtSentenceDisplay");
  const wordsContainer = document.getElementById("wordsContainer");
  const resetBtn = document.getElementById("resetBtn");
  const questionLabel = document.getElementById("questionLabel");
  const answerInput = document.getElementById("answerInput");
  const submitBtn = document.getElementById("submitBtn");
  const feedbackMsg = document.getElementById("feedbackMsg");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessageSpan = document.getElementById("scoreMessage");
  const studentNameSpan = document.getElementById("studentNameDisplay");
  const difficultySpan = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");

  // Helper: Get all sentences for a difficulty level
  function getSentencesForDifficulty(difficulty) {
    return sentenceSets[difficulty] || sentenceSets.starter;
  }

  // Load current sentence item
  function loadCurrentSentence() {
    const sentences = getSentencesForDifficulty(currentDifficulty);
    if (sentences.length === 0) return;
    
    currentItem = sentences[currentSetIndex];
    builtWords = [];
    
    // Shuffle words for display
    originalShuffledWords = [...currentItem.words];
    for (let i = originalShuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalShuffledWords[i], originalShuffledWords[j]] = [originalShuffledWords[j], originalShuffledWords[i]];
    }
    
    renderWords();
    updateBuiltSentence();
    
    // Set question
    questionLabel.innerHTML = `<i class="fas fa-question-circle"></i> ${currentItem.question}`;
    answerInput.value = "";
    feedbackMsg.innerHTML = "";
    
    // Enable inputs
    answerInput.disabled = false;
    submitBtn.disabled = false;
    gameCompleted = false;
    completionPanel.classList.add("hidden");
    
    // Update lesson text with difficulty-appropriate tip
    let lessonTip = "";
    if (currentDifficulty === "starter") {
      lessonTip = "⭐ Starter: Tap words in the correct order to make a sentence. Then answer the question!";
    } else if (currentDifficulty === "support") {
      lessonTip = "📘 Support: Build the sentence correctly, then show you understood by answering the question.";
    } else if (currentDifficulty === "practice") {
      lessonTip = "✏️ Practice: Order matters! Read your sentence out loud to check if it sounds right.";
    } else {
      lessonTip = "🧠 Challenge: Pay attention to tricky word order like 'After class' and 'Because of'.";
    }
    lessonText.innerText = lessonTip;
  }

  // Render word buttons
  function renderWords() {
    wordsContainer.innerHTML = "";
    originalShuffledWords.forEach((word, idx) => {
      const isUsed = builtWords.includes(word) && builtWords.filter(w => w === word).length > 
                     originalShuffledWords.filter(w => w === word).indexOf(word) >= 0 ?
                     builtWords.filter(w => w === word).length > originalShuffledWords.filter(w => w === word).indexOf(word) : false;
      
      // Better check: count occurrences
      const usedCount = builtWords.filter(w => w === word).length;
      const totalCount = originalShuffledWords.filter(w => w === word).length;
      const isDisabled = usedCount >= totalCount;
      
      const btn = document.createElement("button");
      btn.textContent = word;
      btn.className = "word-btn";
      if (isDisabled) {
        btn.disabled = true;
        btn.classList.add("opacity-40");
      }
      btn.addEventListener("click", () => addWord(word, btn));
      wordsContainer.appendChild(btn);
    });
  }

  // Add word to built sentence
  function addWord(word, buttonElement) {
    if (gameCompleted) {
      feedbackMsg.innerHTML = "🏁 Game finished! Return to dashboard to start a new challenge.";
      return;
    }
    
    builtWords.push(word);
    buttonElement.disabled = true;
    buttonElement.classList.add("opacity-40");
    updateBuiltSentence();
    
    // Auto-check if all words are used
    const totalWordsNeeded = currentItem.words.length;
    if (builtWords.length === totalWordsNeeded) {
      // Auto-check the sentence order
      checkSentenceCompletion();
    }
  }

  // Update the built sentence display
  function updateBuiltSentence() {
    if (builtWords.length === 0) {
      builtSentenceDisplay.innerHTML = "✨ Tap words in order to build your sentence...";
    } else {
      builtSentenceDisplay.innerHTML = builtWords.join(" ");
    }
  }

  // Reset current sentence
  function resetSentence() {
    if (gameCompleted) {
      feedbackMsg.innerHTML = "Game already completed! Go back to dashboard.";
      return;
    }
    builtWords = [];
    // Re-shuffle remaining words
    originalShuffledWords = [...currentItem.words];
    for (let i = originalShuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalShuffledWords[i], originalShuffledWords[j]] = [originalShuffledWords[j], originalShuffledWords[i]];
    }
    renderWords();
    updateBuiltSentence();
    feedbackMsg.innerHTML = "🔄 Sentence reset. Try building it again!";
    answerInput.disabled = false;
    submitBtn.disabled = false;
  }

  // Check if the built sentence matches the correct sentence
  function checkSentenceCompletion() {
    const builtSentence = builtWords.join(" ");
    const isSentenceCorrect = (builtSentence === currentItem.sentence);
    
    if (!isSentenceCorrect && builtWords.length === currentItem.words.length) {
      feedbackMsg.innerHTML = `⚠️ The word order is not quite right. The correct sentence is: "<strong>${currentItem.sentence}</strong>". Click Reset to try again!`;
      builtSentenceDisplay.classList.add("sentence-correct");
      setTimeout(() => builtSentenceDisplay.classList.remove("sentence-correct"), 500);
    } else if (isSentenceCorrect && builtWords.length === currentItem.words.length) {
      feedbackMsg.innerHTML = `✅ Great! The sentence "<strong>${currentItem.sentence}</strong>" is correct! Now answer the question below.`;
      builtSentenceDisplay.classList.add("sentence-correct");
      setTimeout(() => builtSentenceDisplay.classList.remove("sentence-correct"), 500);
    }
  }

  // Submit final answer (sentence + comprehension)
  async function submitAnswer() {
    if (gameCompleted) {
      feedbackMsg.innerHTML = "Game already completed! Please go back to dashboard.";
      return;
    }
    
    const builtSentence = builtWords.join(" ");
    const isSentenceCorrect = (builtSentence === currentItem.sentence);
    
    if (builtWords.length !== currentItem.words.length) {
      feedbackMsg.innerHTML = `📖 Use all the words to build the sentence first! You've used ${builtWords.length} of ${currentItem.words.length} words.`;
      return;
    }
    
    if (!isSentenceCorrect) {
      feedbackMsg.innerHTML = `🔤 The sentence order is incorrect. The correct sentence is: "<strong>${currentItem.sentence}</strong>". Click Reset to try again.`;
      return;
    }
    
    // Check comprehension answer
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (userAnswer === "") {
      feedbackMsg.innerHTML = "❓ Please answer the comprehension question!";
      return;
    }
    
    const isAnswerCorrect = userAnswer.includes(currentItem.answer.toLowerCase());
    const overallCorrect = isSentenceCorrect && isAnswerCorrect;
    
    if (overallCorrect) {
      score++;
      feedbackMsg.innerHTML = `🎉 Perfect! Both the sentence and answer are correct! "${currentItem.sentence}" — and "${userAnswer}" is right!`;
      
      // Move to next sentence or complete
      const sentences = getSentencesForDifficulty(currentDifficulty);
      totalQuestions = sentences.length;
      
      if (currentSetIndex + 1 < sentences.length) {
        currentSetIndex++;
        loadCurrentSentence();
        feedbackMsg.innerHTML = `✅ Great job! Move to next sentence. Score: ${score}/${currentSetIndex}`;
      } else {
        completeGame();
      }
    } else {
      // Wrong answer
      let errorMsg = "";
      if (!isAnswerCorrect) {
        errorMsg = `📚 The comprehension answer "${userAnswer}" is not quite right. Hint: ${currentItem.hint || "Re-read the sentence carefully."} The correct answer is: "${currentItem.answer}".`;
      } else {
        errorMsg = `The sentence is correct, but something went wrong. Try again!`;
      }
      feedbackMsg.innerHTML = errorMsg;
      
      // Call AI feedback if available
      if (window.NumeReadGame && window.NumeReadGame.tutorFeedback) {
        await window.NumeReadGame.tutorFeedback({
          skill: "Reading fluency & comprehension",
          difficulty: currentDifficulty,
          correct: false,
          prompt: currentItem.sentence
        });
      }
    }
  }

  // Complete the game and save progress
  async function completeGame() {
    gameCompleted = true;
    const sentences = getSentencesForDifficulty(currentDifficulty);
    const percent = Math.round((score / sentences.length) * 100);
    scoreMessageSpan.innerHTML = `📖 Score: ${score} / ${sentences.length} (${percent}%) 🎉`;
    completionPanel.classList.remove("hidden");
    feedbackMsg.innerHTML = `🏆 Amazing reading! You built ${score} correct sentences with comprehension.`;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    
    // Disable all word buttons
    document.querySelectorAll(".word-btn").forEach(btn => btn.disabled = true);
    
    // Save progress
    try {
      localStorage.setItem("numeread_sentence_score", score);
      localStorage.setItem("numeread_sentence_total", sentences.length);
      localStorage.setItem("numeread_sentence_difficulty", currentDifficulty);
      
      if (window.NumeReadGame && window.NumeReadGame.finishGame) {
        await window.NumeReadGame.finishGame({
          activityId: "sentence-builder",
          area: "reading",
          skill: "Reading fluency",
          gain: score > 0 ? 10 : 5,
          xp: 25,
          badge: "Sentence Builder",
          clearGaps: ["Comprehension"]
        });
      }
    } catch(e) { console.log("Progress saved locally"); }
  }

  // Initialize game from NumeReadGame or localStorage
  async function initGame() {
    try {
      // Try to get game context from NumeReadGame
      if (window.NumeReadGame && window.NumeReadGame.initGame) {
        const game = await window.NumeReadGame.initGame({ area: "reading" });
        currentDifficulty = game.difficulty || "starter";
        dashboardUrl = game.dashboardUrl || (game.query ? `student.html?${game.query}` : dashboardUrl);
      } else {
        // Fallback to localStorage
        const savedDiff = localStorage.getItem("numeread_difficulty") || "starter";
        const savedStudent = localStorage.getItem("numeread_student") || "Maya";
        currentDifficulty = savedDiff;
        studentName = savedStudent;
      }
    } catch(e) {
      currentDifficulty = "starter";
      studentName = "Reader";
    }
    
    // Get student name from localStorage
    studentName = localStorage.getItem("numeread_student") || "Maya";
    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · reading coach`;
    
    const sentences = getSentencesForDifficulty(currentDifficulty);
    totalQuestions = sentences.length;
    currentSetIndex = 0;
    score = 0;
    gameCompleted = false;
    
    loadCurrentSentence();
  }

  // Navigate back
  function goToDashboard() {
    if (!gameCompleted && currentSetIndex > 0) {
      localStorage.setItem("numeread_sentence_progress", JSON.stringify({
        score: score,
        index: currentSetIndex,
        difficulty: currentDifficulty
      }));
    }
    window.location.href = dashboardUrl;
  }

  // Event listeners
  resetBtn.addEventListener("click", resetSentence);
  submitBtn.addEventListener("click", submitAnswer);
  backBtn.addEventListener("click", goToDashboard);
  
  answerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAnswer();
    }
  });

  // Start the game
  initGame();
})();
