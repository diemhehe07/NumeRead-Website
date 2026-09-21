// game-sentence-builder.js - Upgraded Sentence Builder Game (Interactive Slots & Speech)

(function() {
  const sentenceSets = {
    easy: [
      {
        words: ["The", "cat", "runs", "fast"],
        sentence: "The cat runs fast",
        question: "Who runs fast in the sentence?",
        answer: "The cat",
        choices: ["The cat", "A dog", "A bird", "The mouse"],
        hint: "Look for the furry pet at the beginning."
      },
      {
        words: ["A", "dog", "barks", "loudly"],
        sentence: "A dog barks loudly",
        question: "What does the dog do?",
        answer: "Barks",
        choices: ["Barks", "Sleeps", "Jumps", "Eats"],
        hint: "The noisy action sound made by a dog."
      },
      {
        words: ["The", "sun", "shines", "bright"],
        sentence: "The sun shines bright",
        question: "What shines bright in the sky?",
        answer: "The sun",
        choices: ["The sun", "The moon", "A cloud", "A lamp"],
        hint: "The warm yellow star above us."
      },
      {
        words: ["Fish", "swim", "in", "water"],
        sentence: "Fish swim in water",
        question: "Where do fish swim?",
        answer: "In water",
        choices: ["In water", "On grass", "In trees", "In clouds"],
        hint: "The liquid where sea creatures live."
      },
      {
        words: ["Birds", "sing", "sweet", "songs"],
        sentence: "Birds sing sweet songs",
        question: "What do birds sing?",
        answer: "Sweet songs",
        choices: ["Sweet songs", "Loud alarms", "Quiet whispers", "Drum beats"],
        hint: "The lovely musical sounds of birds."
      }
    ],
    average: [
      {
        words: ["The", "small", "bird", "sings", "sweetly"],
        sentence: "The small bird sings sweetly",
        question: "What size is the bird?",
        answer: "Small",
        choices: ["Small", "Giant", "Heavy", "Huge"],
        hint: "The describing word right before bird."
      },
      {
        words: ["My", "red", "ball", "bounces", "high"],
        sentence: "My red ball bounces high",
        question: "What color is the bouncing ball?",
        answer: "Red",
        choices: ["Red", "Blue", "Green", "Yellow"],
        hint: "The color word in the sentence."
      },
      {
        words: ["The", "happy", "girl", "dances", "joyfully"],
        sentence: "The happy girl dances joyfully",
        question: "How does the girl feel?",
        answer: "Happy",
        choices: ["Happy", "Sleepy", "Angry", "Sad"],
        hint: "The cheerful emotion word."
      },
      {
        words: ["Green", "frogs", "leap", "into", "ponds"],
        sentence: "Green frogs leap into ponds",
        question: "What action do the frogs do?",
        answer: "Leap",
        choices: ["Leap", "Fly", "Crawl", "Glide"],
        hint: "Another word for jump."
      },
      {
        words: ["Bright", "yellow", "stars", "light", "the", "sky"],
        sentence: "Bright yellow stars light the sky",
        question: "What lights up the nighttime sky?",
        answer: "Stars",
        choices: ["Stars", "Campfire", "Flashlight", "Headlights"],
        hint: "The glittering points of light at night."
      }
    ],
    intermediate: [
      {
        words: ["Rina", "reads", "a", "funny", "adventure", "story"],
        sentence: "Rina reads a funny adventure story",
        question: "What kind of story does Rina read?",
        answer: "Funny adventure",
        choices: ["Funny adventure", "Scary monster", "Boring recipe", "Math test"],
        hint: "Look at the two describing words before story."
      },
      {
        words: ["The", "big", "elephant", "trumpets", "very", "loudly"],
        sentence: "The big elephant trumpets very loudly",
        question: "How does the elephant make sound?",
        answer: "Trumpets loudly",
        choices: ["Trumpets loudly", "Whispers softly", "Chirps quietly", "Hisses gently"],
        hint: "The powerful brass-like trumpet sound."
      },
      {
        words: ["Mom", "bakes", "warm", "delicious", "butter", "cookies"],
        sentence: "Mom bakes warm delicious butter cookies",
        question: "Who is baking the delicious treats?",
        answer: "Mom",
        choices: ["Mom", "Grandpa", "Teacher", "Uncle"],
        hint: "The caring family baker."
      },
      {
        words: ["Clever", "foxes", "hunt", "through", "snowy", "woods"],
        sentence: "Clever foxes hunt through snowy woods",
        question: "Where do the clever foxes hunt?",
        answer: "Snowy woods",
        choices: ["Snowy woods", "Sandy desert", "Busy mall", "Ocean waves"],
        hint: "The forest covered in white snow."
      },
      {
        words: ["Children", "build", "sandcastles", "on", "sunny", "beaches"],
        sentence: "Children build sandcastles on sunny beaches",
        question: "What do the children build?",
        answer: "Sandcastles",
        choices: ["Sandcastles", "Snowmen", "Skyscrapers", "Treehouses"],
        hint: "Castles made out of wet sand."
      }
    ],
    advanced: [
      {
        words: ["After", "class", "Marco", "solves", "three", "challenging", "puzzles"],
        sentence: "After class Marco solves three challenging puzzles",
        question: "When does Marco solve his puzzles?",
        answer: "After class",
        choices: ["After class", "Before breakfast", "During recess", "At midnight"],
        hint: "Notice the introductory time phrase."
      },
      {
        words: ["Because", "of", "heavy", "rain", "we", "stayed", "indoors"],
        sentence: "Because of heavy rain we stayed indoors",
        question: "Why did everyone stay inside?",
        answer: "Heavy rain",
        choices: ["Heavy rain", "Hot sunshine", "Power outage", "Windy storm"],
        hint: "The wet weather reason."
      },
      {
        words: ["The", "brave", "knight", "bravely", "defended", "the", "ancient", "kingdom"],
        sentence: "The brave knight bravely defended the ancient kingdom",
        question: "Who defended the kingdom from danger?",
        answer: "The brave knight",
        choices: ["The brave knight", "The quiet wizard", "The angry dragon", "The silly jester"],
        hint: "The warrior in armor."
      },
      {
        words: ["Curious", "scientists", "explore", "deep", "ocean", "trenches", "safely"],
        sentence: "Curious scientists explore deep ocean trenches safely",
        question: "Who is exploring the deep trenches?",
        answer: "Curious scientists",
        choices: ["Curious scientists", "Wild dolphins", "Pirate captains", "Submarine tourists"],
        hint: "The researchers seeking scientific discoveries."
      },
      {
        words: ["During", "autumn", "colorful", "maple", "leaves", "drift", "down", "gently"],
        sentence: "During autumn colorful maple leaves drift down gently",
        question: "In what season do the maple leaves fall?",
        answer: "Autumn",
        choices: ["Autumn", "Spring", "Summer", "Winter"],
        hint: "The season also known as fall."
      }
    ]
  };

  // State
  let currentDifficulty = "easy";
  let currentSetIndex = 0;
  let currentItem = null;
  let builtWords = [];
  let originalShuffledWords = [];
  let score = 0;
  let streak = 0;
  let totalQuestions = 5;
  let gameCompleted = false;
  let studentName = "Reader";
  let teacherLessonText = "";
  let dashboardUrl = "student.html";
  let contentSet = 0;

  // DOM Elements
  const roundDisplay = document.getElementById("roundDisplay");
  const lessonText = document.getElementById("lessonText");
  const sentenceSlotsTrack = document.getElementById("sentenceSlotsTrack");
  const wordsContainer = document.getElementById("wordsContainer");
  const resetBtn = document.getElementById("resetBtn");
  const speakSentenceBtn = document.getElementById("speakSentenceBtn");
  const questionLabel = document.getElementById("questionLabel");
  const compChoicesContainer = document.getElementById("compChoicesContainer");
  const feedbackMsg = document.getElementById("feedbackMsg");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessageSpan = document.getElementById("scoreMessage");
  const studentNameSpan = document.getElementById("studentNameDisplay");
  const difficultySpan = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");
  const scoreCountEl = document.getElementById("scoreCount");
  const comboCountEl = document.getElementById("comboCount");

  function getSentencesForDifficulty(diff) {
    const level = window.NumeReadTestBanks?.normalizeLevel(diff) || "easy";
    const bank = window.NumeReadGame?.getActivityQuestions?.("sentence-builder", level, { seed: contentSet }) || window.NumeReadTestBanks?.getForActivity("sentence-builder", level, { seed: contentSet });
    if (!Array.isArray(bank) || !bank.length) throw new Error("Sentence Builder test bank is unavailable.");
    return bank;
  }

  function renderSlots() {
    if (!sentenceSlotsTrack || !currentItem) return;
    sentenceSlotsTrack.innerHTML = "";

    const totalSlots = currentItem.words.length;
    for (let i = 0; i < totalSlots; i++) {
      const slot = document.createElement("div");
      slot.className = "slot-box";

      if (i < builtWords.length) {
        slot.classList.add("filled");
        slot.textContent = builtWords[i];
        slot.title = "Tap to remove word";
        slot.onclick = () => removeWordAt(i);
      } else {
        slot.textContent = `Word ${i + 1}`;
      }
      sentenceSlotsTrack.appendChild(slot);
    }

    if (speakSentenceBtn) {
      speakSentenceBtn.disabled = (builtWords.length < 2);
    }
  }

  function renderWordBank() {
    if (!wordsContainer) return;
    wordsContainer.innerHTML = "";

    // Track usage counts to handle duplicate words in a sentence
    const usedCounts = {};
    builtWords.forEach(w => {
      usedCounts[w] = (usedCounts[w] || 0) + 1;
    });

    const renderedCounts = {};
    originalShuffledWords.forEach((word) => {
      renderedCounts[word] = (renderedCounts[word] || 0) + 1;
      const isUsed = (renderedCounts[word] <= (usedCounts[word] || 0));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "word-btn";
      btn.textContent = word;
      if (isUsed) {
        btn.disabled = true;
      } else {
        btn.onclick = () => addWord(word);
      }
      wordsContainer.appendChild(btn);
    });
  }

  function renderComprehension() {
    if (!questionLabel || !compChoicesContainer || !currentItem) return;
    questionLabel.innerHTML = `<i class="fas fa-question-circle text-indigo-500"></i> ${currentItem.question}`;
    compChoicesContainer.innerHTML = "";

    const shuffledChoices = [...currentItem.choices];
    for (let i = shuffledChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
    }

    shuffledChoices.forEach(choice => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "comp-choice-card";
      btn.textContent = choice;
      btn.onclick = () => checkComprehension(choice, btn);
      compChoicesContainer.appendChild(btn);
    });
  }

  function addWord(word) {
    if (gameCompleted || !currentItem) return;
    if (builtWords.length >= currentItem.words.length) {
      feedbackMsg.innerHTML = `<span style="color:#d97706;">All slots are filled! Tap an occupied word to remove it if you need to adjust order.</span>`;
      return;
    }
    builtWords.push(word);
    renderSlots();
    renderWordBank();

    if (builtWords.length === currentItem.words.length) {
      const builtText = builtWords.join(" ");
      if (builtText === currentItem.sentence) {
        feedbackMsg.innerHTML = `<span style="color:#15803d; font-weight:700;"><i class="fas fa-check"></i> Perfect sentence order! Now answer the comprehension question below.</span>`;
        if (window.NumeReadSound) window.NumeReadSound.playChime(true);
      } else {
        feedbackMsg.innerHTML = `<span style="color:#ea580c;"><i class="fas fa-info-circle"></i> Check word order: "${builtText}". Tap any word to return it to the bank.</span>`;
      }
    }
  }

  function removeWordAt(index) {
    if (gameCompleted) return;
    builtWords.splice(index, 1);
    renderSlots();
    renderWordBank();
  }

  function resetSlots() {
    if (gameCompleted) return;
    builtWords = [];
    renderSlots();
    renderWordBank();
    feedbackMsg.innerHTML = `<span>Slots cleared. Tap words in order!</span>`;
  }

  async function checkComprehension(chosenAnswer, btnEl) {
    if (gameCompleted || !currentItem) return;

    if (builtWords.length !== currentItem.words.length) {
      feedbackMsg.innerHTML = `<span style="color:#d97706;"><i class="fas fa-hand-pointer"></i> Build the full sentence first! Fill all ${currentItem.words.length} slots.</span>`;
      if (window.NumeReadSound) window.NumeReadSound.playChime(false);
      return;
    }

    const builtSentence = builtWords.join(" ");
    const isSentenceCorrect = (builtSentence === currentItem.sentence);
    const isCompCorrect = (chosenAnswer.toLowerCase() === currentItem.answer.toLowerCase());

    if (isSentenceCorrect && isCompCorrect) {
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
      } catch (e) {}

      btnEl.style.background = "#dcfce7";
      btnEl.style.borderColor = "#16a34a";
      feedbackMsg.innerHTML = `<span style="color:#15803d; font-weight:700;"><i class="fas fa-check-circle"></i> Brilliant! "${builtSentence}" & "${chosenAnswer}" are both correct!</span>`;

      const allCompBtns = compChoicesContainer.querySelectorAll(".comp-choice-card");
      allCompBtns.forEach(b => b.disabled = true);

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(true, `Super! "${builtSentence}" answered accurately.`);
      }

      currentSetIndex++;
      setTimeout(() => {
        if (currentSetIndex < totalQuestions) {
          loadCurrentSentence();
        } else {
          completeGame();
        }
      }, 1200);
    } else {
      streak = 0;
      if (comboCountEl) comboCountEl.innerText = streak;

      if (window.NumeReadSound) window.NumeReadSound.playChime(false);

      btnEl.style.background = "#fee2e2";
      btnEl.style.borderColor = "#dc2626";

      let errorMsg = "";
      if (!isSentenceCorrect) {
        errorMsg = `The sentence order isn't quite right. Target: "${currentItem.sentence}".`;
      } else {
        errorMsg = `Sentence is correct, but "${chosenAnswer}" isn't right. Hint: ${currentItem.hint}`;
      }
      if (currentItem.tip) {
        errorMsg += ` Tip: ${currentItem.tip}`;
      }
      feedbackMsg.innerHTML = `<span style="color:#dc2626; font-weight:600;"><i class="fas fa-times-circle"></i> ${errorMsg}</span>`;

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(false, errorMsg);
      }
    }
  }

  function loadCurrentSentence() {
    const list = getSentencesForDifficulty(currentDifficulty);
    if (currentSetIndex >= totalQuestions) {
      completeGame();
      return;
    }

    currentItem = list[currentSetIndex];
    builtWords = [];

    originalShuffledWords = [...currentItem.words];
    for (let i = originalShuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalShuffledWords[i], originalShuffledWords[j]] = [originalShuffledWords[j], originalShuffledWords[i]];
    }

    if (roundDisplay) {
      roundDisplay.innerText = `${currentSetIndex + 1}/${totalQuestions}`;
    }

    renderSlots();
    renderWordBank();
    renderComprehension();
    feedbackMsg.innerHTML = "";

    const tip = {
      easy: "Put words in order from left to right. Then choose the answer to the question!",
      average: "Notice describing words (colors, feelings, sizes) before naming words.",
      intermediate: "Read your sentence smoothly to make sure the grammar and meaning fit.",
      advanced: "Pay attention to complex time phrases and sentence prepositions."
    };
    lessonText.innerText = teacherLessonText || tip[currentDifficulty] || tip.easy;
  }

  async function completeGame() {
    gameCompleted = true;
    const percent = Math.round((score / totalQuestions) * 100);
    scoreMessageSpan.innerHTML = `📝 Score: ${score} / ${totalQuestions} (${percent}%)`;
    completionPanel.classList.remove("hidden");
    feedbackMsg.innerHTML = `🏆 Master Builder! You constructed and comprehended ${score} sentences!`;

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
          activityId: "sentence-builder",
          area: "reading",
          skill: "Reading fluency",
          gain: score === totalQuestions ? 10 : 6,
          performance: totalQuestions ? score / totalQuestions : 0,
          xp: 35,
          badge: "Sentence Builder",
          clearGaps: ["Comprehension"]
        });
      }
    } catch(e) {
      console.log("Progress saved locally");
    }
  }

  async function initGame() {
    currentSetIndex = 0;
    score = 0;
    streak = 0;
    gameCompleted = false;

    if (scoreCountEl) scoreCountEl.innerText = "0";
    if (comboCountEl) comboCountEl.innerText = "0";

    try {
      if (window.NumeReadGame && window.NumeReadGame.initGame) {
        const game = await window.NumeReadGame.initGame({ area: "reading" });
        currentDifficulty = game.difficulty || "easy";
        contentSet = game.contentSet || 0;
        studentName = game.student?.name || studentName;
        dashboardUrl = game.dashboardUrl || (game.query ? `student.html?${game.query}` : dashboardUrl);
        teacherLessonText = game.teacherLesson?.content ? `Teacher module: ${game.teacherLesson.content}` : "";
      }
    } catch(e) {
      // fallback
    }

    studentNameSpan.innerText = studentName;
    difficultySpan.innerText = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · reading coach`;

    const list = getSentencesForDifficulty(currentDifficulty);
    totalQuestions = list.length;

    loadCurrentSentence();

    if (resetBtn) {
      resetBtn.onclick = resetSlots;
    }
    if (speakSentenceBtn) {
      speakSentenceBtn.onclick = () => {
        if (builtWords.length > 0 && window.NumeReadSound) {
          window.NumeReadSound.speak(builtWords.join(" "));
        }
      };
    }
  }

  backBtn.addEventListener("click", () => {
    window.location.href = dashboardUrl;
  });

  initGame();
})();
