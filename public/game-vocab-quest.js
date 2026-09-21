// game-vocab-quest.js - Upgraded Vocabulary Quest Game (Detective Clues & Audio)

(function () {
  const banks = {
    easy: [
      {
        word: "tiny",
        phonics: "[tahy-nee]",
        sentence: "The tiny seed was hard to see among the stones.",
        clue: "hard to see",
        answer: "Very small",
        choices: ["Very small", "Very loud", "Very late", "Very heavy"]
      },
      {
        word: "glad",
        phonics: "[glad]",
        sentence: "Mia was glad and smiled happily when her friend arrived.",
        clue: "smiled happily",
        answer: "Full of joy",
        choices: ["Full of joy", "Extremely tired", "Feeling angry", "Cold outside"]
      },
      {
        word: "swift",
        phonics: "[swift]",
        sentence: "The swift cheetah raced across the grassy field.",
        clue: "raced across",
        answer: "Moving fast",
        choices: ["Moving fast", "Walking slowly", "Deep in sleep", "Lost in mud"]
      },
      {
        word: "cozy",
        phonics: "[koh-zee]",
        sentence: "The puppy slept in a cozy warm blanket by the fire.",
        clue: "warm blanket",
        answer: "Snug and comfortable",
        choices: ["Snug and comfortable", "Rough and scratchy", "Freezing cold", "Noisy and bright"]
      },
      {
        word: "gigantic",
        phonics: "[jahy-gan-tik]",
        sentence: "A gigantic whale as big as a ship leapt from the sea.",
        clue: "as big as a ship",
        answer: "Extremely huge",
        choices: ["Extremely huge", "Microscopic", "Paper thin", "Invisible"]
      }
    ],
    average: [
      {
        word: "courageous",
        phonics: "[kuh-rey-juhs]",
        sentence: "The courageous firefighter stepped forward without fear.",
        clue: "without fear",
        answer: "Brave and bold",
        choices: ["Brave and bold", "Scared and hidden", "Very sleepy", "Easily tricked"]
      },
      {
        word: "tranquil",
        phonics: "[trang-kwil]",
        sentence: "The tranquil lake was calm and peaceful with no waves.",
        clue: "calm and peaceful",
        answer: "Quiet and calm",
        choices: ["Quiet and calm", "Violent and stormy", "Crowded with cars", "Hot and boiling"]
      },
      {
        word: "ancient",
        phonics: "[eyn-shuhnt]",
        sentence: "We explored an ancient castle built thousands of years ago.",
        clue: "thousands of years ago",
        answer: "From long ago",
        choices: ["From long ago", "Built yesterday", "Brand new", "Shiny plastic"]
      },
      {
        word: "generous",
        phonics: "[jen-er-uhs]",
        sentence: "The generous baker shared extra warm loaves with everyone.",
        clue: "shared extra",
        answer: "Willing to share",
        choices: ["Willing to share", "Keeping everything", "Strict and grumpy", "Rude to others"]
      },
      {
        word: "peculiar",
        phonics: "[pi-kyool-yer]",
        sentence: "The animal made a peculiar whistling noise nobody heard before.",
        clue: "nobody heard before",
        answer: "Strange or unusual",
        choices: ["Strange or unusual", "Completely normal", "Everyday ordinary", "Simple and boring"]
      }
    ],
    intermediate: [
      {
        word: "illuminate",
        phonics: "[ih-loo-muh-neyt]",
        sentence: "The full moon will illuminate the dark winding path.",
        clue: "dark winding path",
        answer: "Light up brightly",
        choices: ["Light up brightly", "Cover in shadow", "Block completely", "Wash away"]
      },
      {
        word: "perseverance",
        phonics: "[pur-suh-veer-uhns]",
        sentence: "Through perseverance, Elena kept practicing until she won.",
        clue: "kept practicing until she won",
        answer: "Continuing despite difficulty",
        choices: ["Continuing despite difficulty", "Giving up early", "Waiting for luck", "Forgetting to practice"]
      },
      {
        word: "arid",
        phonics: "[ar-id]",
        sentence: "Cactus plants flourish in the arid desert where rain rarely falls.",
        clue: "rain rarely falls",
        answer: "Extremely dry",
        choices: ["Extremely dry", "Soaked in water", "Covered in snow", "Filled with swamps"]
      },
      {
        word: "fragile",
        phonics: "[fraj-uhl]",
        sentence: "Carry the fragile glass sculpture with gentle hands so it won't break.",
        clue: "so it won't break",
        answer: "Easily broken",
        choices: ["Easily broken", "Unbreakable steel", "Heavy and solid", "Soft and rubbery"]
      },
      {
        word: "abundant",
        phonics: "[uh-buhn-duhnt]",
        sentence: "Berries were abundant in the forest, overflowing twenty baskets.",
        clue: "overflowing twenty baskets",
        answer: "Existing in large quantities",
        choices: ["Existing in large quantities", "Extremely scarce", "Withered and dead", "Hard to discover"]
      }
    ],
    advanced: [
      {
        word: "meticulous",
        phonics: "[muh-tik-yuh-luhs]",
        sentence: "The clockmaker was meticulous, checking each tiny gear with precision.",
        clue: "with precision",
        answer: "Showing great attention to detail",
        choices: ["Showing great attention to detail", "Careless and messy", "Rushing through tasks", "Guessing randomly"]
      },
      {
        word: "ephemeral",
        phonics: "[ih-fem-er-uhl]",
        sentence: "The rainbow was ephemeral, fading away after just two minutes.",
        clue: "fading away after just two minutes",
        answer: "Lasting for a very short time",
        choices: ["Lasting for a very short time", "Permanent forever", "Solid as rock", "Never ending"]
      },
      {
        word: "audacious",
        phonics: "[aw-dey-shuhs]",
        sentence: "The captain made an audacious choice to sail straight into the unknown.",
        clue: "straight into the unknown",
        answer: "Showing a bold willingness to take risks",
        choices: ["Showing a bold willingness to take risks", "Timid and hesitant", "Following all rules", "Bored and sleepy"]
      },
      {
        word: "resilient",
        phonics: "[ri-zil-yuhnt]",
        sentence: "The resilient sapling bent in the gale winds but sprang back upright.",
        clue: "sprang back upright",
        answer: "Able to recover quickly from hardship",
        choices: ["Able to recover quickly from hardship", "Snapping into pieces", "Withering permanently", "Falling and dying"]
      },
      {
        word: "scrutinize",
        phonics: "[skroot-n-ahyz]",
        sentence: "The scientist will scrutinize the bacteria under a high-power microscope.",
        clue: "under a high-power microscope",
        answer: "Examine closely and critically",
        choices: ["Examine closely and critically", "Ignore completely", "Glance at briefly", "Throw into trash"]
      }
    ]
  };

  let rounds = [];
  let index = 0;
  let score = 0;
  let streak = 0;
  let difficulty = "easy";
  let dashboardUrl = "student.html";
  let contentSet = 0;
  let gameCompleted = false;

  const roundDisplay = document.getElementById("roundDisplay");
  const lessonText = document.getElementById("lessonText");
  const targetWordDisplay = document.getElementById("targetWordDisplay");
  const phonicsDisplay = document.getElementById("phonicsDisplay");
  const evidenceSentence = document.getElementById("evidenceSentence");
  const choicesContainer = document.getElementById("choicesContainer");
  const feedbackMsg = document.getElementById("feedbackMsg");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessage = document.getElementById("scoreMessage");
  const speakBtn = document.getElementById("speakBtn");
  const scoreCountEl = document.getElementById("scoreCount");
  const comboCountEl = document.getElementById("comboCount");
  const studentNameDisplay = document.getElementById("studentNameDisplay");
  const difficultyDisplay = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");

  function getRounds() {
    const bank = window.NumeReadGame?.getActivityQuestions?.("vocab-quest", difficulty, { seed: contentSet }) || window.NumeReadTestBanks?.getForActivity("vocab-quest", difficulty, { seed: contentSet });
    if (!Array.isArray(bank) || !bank.length) throw new Error("Vocabulary test bank is unavailable.");
    return bank.filter((item) => item && typeof item.word === "string" && Array.isArray(item.choices));
  }

  function render() {
    if (index >= rounds.length) {
      finish();
      return;
    }

    const item = rounds[index];
    if (roundDisplay) roundDisplay.textContent = `${index + 1}/${rounds.length}`;
    if (targetWordDisplay) targetWordDisplay.textContent = item.word.toUpperCase();
    if (phonicsDisplay) phonicsDisplay.textContent = item.phonics || `[${item.word}]`;

    // Highlight target word and clue in sentence
    let formattedSentence = item.sentence;
    const wordRegex = new RegExp(`\\b(${item.word})\\b`, "gi");
    formattedSentence = formattedSentence.replace(wordRegex, `<span class="target-highlight">$1</span>`);

    if (item.clue) {
      const clueRegex = new RegExp(`(${item.clue})`, "gi");
      formattedSentence = formattedSentence.replace(clueRegex, `<span class="clue-highlight">$1</span>`);
    }

    if (evidenceSentence) evidenceSentence.innerHTML = formattedSentence;

    const shuffledChoices = [...item.choices];
    for (let i = shuffledChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
    }

    if (choicesContainer) {
      choicesContainer.innerHTML = "";
      shuffledChoices.forEach(choice => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-card";
        btn.textContent = choice;
        btn.onclick = () => choose(choice, btn);
        choicesContainer.appendChild(btn);
      });
    }

    if (feedbackMsg) feedbackMsg.textContent = "";

    const tips = {
      easy: "Look at the words right around the mystery word to see what makes sense.",
      average: "Notice the action in the sentence. How does it describe the subject?",
      intermediate: "Find descriptive clues that give hints about texture, speed, or size.",
      advanced: "Analyze context evidence carefully to infer precise academic definitions."
    };
    if (lessonText) lessonText.textContent = tips[difficulty] || tips.easy;
  }

  async function choose(choice, button) {
    if (gameCompleted) return;
    const item = rounds[index];
    const correct = (choice.toLowerCase() === item.answer.toLowerCase());

    const allButtons = choicesContainer.querySelectorAll(".choice-card");
    allButtons.forEach(b => b.disabled = true);

    if (correct) {
      score += 1;
      streak += 1;
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

      button.style.background = "#dcfce7";
      button.style.borderColor = "#16a34a";
      if (feedbackMsg) {
        feedbackMsg.innerHTML = `<span style="color:#15803d; font-weight:700;"><i class="fas fa-check-circle"></i> Clue cracked! "${item.word}" means "${item.answer}".</span>`;
      }

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(true, `Context clues helped you crack "${item.word}".`);
      }

      index += 1;
      setTimeout(render, 1100);
    } else {
      streak = 0;
      if (comboCountEl) comboCountEl.innerText = streak;

      try {
        if (window.NumeReadSound) window.NumeReadSound.playChime(false);
      } catch (e) {}

      button.style.background = "#fee2e2";
      button.style.borderColor = "#dc2626";
      if (feedbackMsg) {
        const tipNote = item.tip ? `<br><small style="color:#4338ca;font-weight:600;"><i class="fas fa-lightbulb"></i> Tip: ${item.tip}</small>` : "";
        feedbackMsg.innerHTML = `<span style="color:#dc2626; font-weight:600;"><i class="fas fa-times-circle"></i> Best meaning: "${item.answer}". Sentence clue: "${item.clue}".${tipNote}</span>`;
      }

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(false, `The best meaning is "${item.answer}."`);
      }

      if (window.NumeReadGame?.tutorFeedback) {
        window.NumeReadGame.tutorFeedback({
          skill: "Vocabulary",
          difficulty,
          correct: false,
          prompt: item.sentence
        }).catch(() => {});
      }

      index += 1;
      setTimeout(render, 1500);
    }
  }

  async function finish() {
    gameCompleted = true;
    if (completionPanel) completionPanel.classList.remove("hidden");
    const percent = Math.round((score / rounds.length) * 100);
    if (scoreMessage) {
      scoreMessage.innerHTML = `🔍 Score: ${score} / ${rounds.length} (${percent}%) 🎉`;
    }
    if (choicesContainer) choicesContainer.innerHTML = "";

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
          activityId: "vocab-quest",
          area: "reading",
          skill: "Vocabulary",
          gain: score >= 4 ? 10 : 6,
          performance: rounds.length ? score / rounds.length : 0,
          xp: 35,
          badge: "Word Explorer",
          clearGaps: ["Vocabulary"]
        });
      }
    } catch(e) {
      console.log("Saved locally");
    }
  }

  async function init() {
    index = 0;
    score = 0;
    streak = 0;
    gameCompleted = false;

    if (scoreCountEl) scoreCountEl.innerText = "0";
    if (comboCountEl) comboCountEl.innerText = "0";

    // Render a local round before learner data arrives. Firebase or adaptive
    // requests must not leave the activity in its placeholder state.
    rounds = getRounds();
    render();

    try {
      if (window.NumeReadGame && window.NumeReadGame.initGame) {
        const game = await window.NumeReadGame.initGame({ area: "reading" });
        difficulty = game.difficulty || "easy";
        contentSet = game.contentSet || 0;
        dashboardUrl = game.dashboardUrl || dashboardUrl;
        if (studentNameDisplay && game.student?.name) {
          studentNameDisplay.innerText = game.student.name;
        }
      }
    } catch(e) {
      // fallback
    }

    if (difficultyDisplay) {
      difficultyDisplay.innerText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
    if (aiStatusSpan) {
      aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · vocab detective`;
    }

    rounds = getRounds();

    render();

    if (speakBtn) {
      speakBtn.onclick = () => {
        if (!rounds[index]) return;
        const itm = rounds[index];
        const speech = `Target word: ${itm.word}. Sentence: ${itm.sentence}. What does ${itm.word} mean?`;
        if (window.NumeReadSound) window.NumeReadSound.speak(speech);
      };
    }
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = dashboardUrl;
    });
  }

  init();
})();
