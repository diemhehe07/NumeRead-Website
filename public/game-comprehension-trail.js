// game-comprehension-trail.js - Upgraded Comprehension Trail Game (Mountain Expedition & Audio)

(function () {
  const banks = {
    easy: [
      {
        passage: "Lito has a bright red backpack. He packs his favorite dinosaur storybook inside to read with his friends at school.",
        question: "What color is Lito's backpack?",
        answer: "Bright red",
        choices: ["Bright red", "Ocean blue", "Forest green", "Sunny yellow"],
        evidence: "Lito has a bright red backpack."
      },
      {
        passage: "Max the playful puppy runs to the garden gate. He wags his tail and barks happily when grandma arrives.",
        question: "What does Max do at the garden gate?",
        answer: "Wags tail and barks",
        choices: ["Wags tail and barks", "Sleeps on the rug", "Chases a squirrel", "Eats a biscuit"],
        evidence: "He wags his tail and barks happily."
      },
      {
        passage: "Mina drinks a tall glass of cool water because she is very thirsty after soccer practice.",
        question: "Why does Mina drink cool water?",
        answer: "She is very thirsty",
        choices: ["She is very thirsty", "She feels freezing cold", "She is running late", "She wants to cook"],
        evidence: "because she is very thirsty after soccer practice."
      },
      {
        passage: "Oliver found a shiny silver coin hidden under the roots of the old oak tree.",
        question: "Where did Oliver find the shiny silver coin?",
        answer: "Under the oak tree roots",
        choices: ["Under the oak tree roots", "Inside his pocket", "At the corner store", "In the bird nest"],
        evidence: "hidden under the roots of the old oak tree."
      },
      {
        passage: "The big yellow sunflower slowly turned its golden petals toward the bright morning sun.",
        question: "What did the sunflower turn toward?",
        answer: "The morning sun",
        choices: ["The morning sun", "The garden sprinkler", "The barking dog", "The tall fence"],
        evidence: "toward the bright morning sun."
      }
    ],
    average: [
      {
        passage: "Ana forgot her umbrella at school. Heavy grey rainclouds formed, and rain started falling before she reached home.",
        question: "What item will Ana most likely need?",
        answer: "An umbrella",
        choices: ["An umbrella", "A beach towel", "Sunglasses", "A winter coat"],
        evidence: "Ana forgot her umbrella... rain started falling."
      },
      {
        passage: "Rico practiced reading aloud for fifteen minutes every night. By Friday, he read his chapter book faster and smoother.",
        question: "Why did Rico's reading fluency improve?",
        answer: "He practiced reading every night",
        choices: ["He practiced reading every night", "He slept through class", "He bought new books", "He watched cartoons"],
        evidence: "Rico practiced reading aloud... every night."
      },
      {
        passage: "The second-grade class planted sunflower seeds in damp soil. After five warm, sunny days, tiny green sprouts poked through.",
        question: "What caused the seeds to sprout?",
        answer: "Damp soil and warm sunny days",
        choices: ["Damp soil and warm sunny days", "Cold snowstorms", "Staying in dark closets", "Strong wind blowing"],
        evidence: "in damp soil... after five warm, sunny days."
      },
      {
        passage: "Lucas packed warm gloves, thick wool socks, and a knit beanie into his duffel bag for the weekend trip.",
        question: "What kind of weather is Lucas preparing for?",
        answer: "Cold and chilly weather",
        choices: ["Cold and chilly weather", "Sweltering summer heat", "Tropical beach weather", "Desert sandstorm"],
        evidence: "warm gloves, thick wool socks, and a knit beanie."
      },
      {
        passage: "The baker turned off the oven and set the warm tray of blueberry muffins by the open window to cool.",
        question: "Why did the baker place the muffins near the open window?",
        answer: "To let them cool down",
        choices: ["To let them cool down", "To throw them outside", "To hide them from guests", "To keep them baking"],
        evidence: "by the open window to cool."
      }
    ],
    intermediate: [
      {
        passage: "Because the wooden river bridge was closed for urgent repairs, Carla took the long scenic mountain road to reach school.",
        question: "Why did Carla take the longer road?",
        answer: "The bridge was closed for repairs",
        choices: ["The bridge was closed for repairs", "She lost her bus ticket", "School was canceled", "She wanted to go swimming"],
        evidence: "the wooden river bridge was closed for urgent repairs."
      },
      {
        passage: "Marco saved every nickel and dime from doing household chores for four months. Finally, he visited the bookstore and purchased the astronomy atlas.",
        question: "What can you infer about Marco's character?",
        answer: "He is patient and hardworking",
        choices: ["He is patient and hardworking", "He spends money carelessly", "He dislikes studying space", "He forgets his goals easily"],
        evidence: "saved every nickel and dime... for four months."
      },
      {
        passage: "The afternoon sky darkened to charcoal, winds rattled the windowpanes, and songbirds fell silent. Mother rushed outside to pull the laundry off the line.",
        question: "What weather event was rapidly approaching?",
        answer: "A severe thunderstorm",
        choices: ["A severe thunderstorm", "A sunny heatwave", "A gentle spring shower", "A bright solar eclipse"],
        evidence: "sky darkened to charcoal, winds rattled the windowpanes."
      },
      {
        passage: "The sorting robot whirred softly, scanned the QR code on the crate, and smoothly directed the package onto conveyor belt B.",
        question: "How did the robot know which conveyor belt to use?",
        answer: "It scanned the crate's QR code",
        choices: ["It scanned the crate's QR code", "A human pushed the button", "It made a random guess", "It weighed the heavy box"],
        evidence: "scanned the QR code on the crate."
      },
      {
        passage: "Elena double-checked her math equations, corrected two subtraction slips, and proudly turned in her finished test paper.",
        question: "Which quality did Elena demonstrate?",
        answer: "Thoroughness and carefulness",
        choices: ["Thoroughness and carefulness", "Rushing through questions", "Giving up too quickly", "Ignoring mistakes"],
        evidence: "double-checked her equations, corrected two subtraction slips."
      }
    ],
    advanced: [
      {
        passage: "Although Ella felt discouraged after missing the initial puzzle, she took a steady breath, dissected the clue structures methodically, and completed the escape room in record time.",
        question: "What central theme does Ella's experience illustrate?",
        answer: "Composure and persistence overcome setbacks",
        choices: ["Composure and persistence overcome setbacks", "Rushing is always the most effective strategy", "Difficult puzzles should be avoided", "Initial failure guarantees total defeat"],
        evidence: "took a steady breath, dissected clue structures methodically."
      },
      {
        passage: "The community garden had suffered from drought until Niko instituted an evening drip-irrigation regimen. Within a fortnight, the wilting squash blossomed vibrantly.",
        question: "Which evidence proves that Niko's irrigation strategy succeeded?",
        answer: "The wilting squash blossomed vibrantly",
        choices: ["The wilting squash blossomed vibrantly", "The summer drought was long", "Niko worked in the evening", "The garden suffered from lack of water"],
        evidence: "Within a fortnight, the wilting squash blossomed vibrantly."
      },
      {
        passage: "Tara willingly selected the rigorous historical chronicle rather than the simple comic book, eager to expand her analytical vocabulary regardless of reading pace.",
        question: "What core trait characterizes Tara's learning mindset?",
        answer: "Intellectual curiosity and determination",
        choices: ["Intellectual curiosity and determination", "Careless disinterest in learning", "Fear of challenging assignments", "Preference for easy shortcuts"],
        evidence: "eager to expand her analytical vocabulary regardless of pace."
      },
      {
        passage: "Dr. Morales cross-referenced the deep polar ice-core data with solar flare archives, identifying a precise temperature anomaly cycle repeating every two centuries.",
        question: "What research approach enabled Dr. Morales's scientific discovery?",
        answer: "Correlating distinct historical datasets",
        choices: ["Correlating distinct historical datasets", "Relying purely on recent weather forecasts", "Discarding older polar ice records", "Guessing without measurement"],
        evidence: "cross-referenced the deep polar ice-core data with solar flare archives."
      },
      {
        passage: "The city council deliberated for three hours, balancing ecological conservation against commercial expansion, before unanimously adopting the riverfront greenway proposal.",
        question: "What does the council's final decision show about their priority?",
        answer: "Preserving environmental health alongside growth",
        choices: ["Preserving environmental health alongside growth", "Ignoring environmental concerns completely", "Closing all public city parks", "Rushing decisions without debate"],
        evidence: "balancing ecological conservation against commercial expansion... unanimously adopting greenway."
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
  const passageText = document.getElementById("passageText");
  const promptText = document.getElementById("promptText");
  const choicesContainer = document.getElementById("choicesContainer");
  const feedbackMsg = document.getElementById("feedbackMsg");
  const completionPanel = document.getElementById("completionPanel");
  const scoreMessage = document.getElementById("scoreMessage");
  const speakPassageBtn = document.getElementById("speakPassageBtn");
  const scoreCountEl = document.getElementById("scoreCount");
  const comboCountEl = document.getElementById("comboCount");
  const campsTrack = document.getElementById("campsTrack");
  const hikerMarker = document.getElementById("hikerMarker");
  const studentNameDisplay = document.getElementById("studentNameDisplay");
  const difficultyDisplay = document.getElementById("difficultyDisplay");
  const aiStatusSpan = document.getElementById("aiStatusSpan");
  const backBtn = document.getElementById("backDashboardBtn");

  function updateMountainTrail() {
    const total = rounds.length;
    if (!campsTrack) return;
    campsTrack.innerHTML = "";

    for (let i = 0; i < total; i++) {
      const camp = document.createElement("div");
      camp.className = "camp-checkpoint";
      camp.textContent = i === total - 1 ? "🏔️" : (i + 1).toString();

      if (i < index) {
        camp.classList.add("completed");
      } else if (i === index && !gameCompleted) {
        camp.classList.add("current");
      }
      campsTrack.appendChild(camp);
    }

    if (hikerMarker) {
      if (gameCompleted) {
        hikerMarker.style.left = "90%";
        hikerMarker.textContent = "🧗🏔️🎉";
      } else {
        const pct = 6 + (index / total) * 80;
        hikerMarker.style.left = `${pct}%`;
        hikerMarker.textContent = "🧗";
      }
    }
  }

  function render() {
    if (index >= rounds.length) {
      finish();
      return;
    }

    const item = rounds[index];
    if (roundDisplay) roundDisplay.textContent = `${index + 1}/${rounds.length}`;
    if (passageText) passageText.textContent = item.passage;
    if (promptText) promptText.textContent = item.question;

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
    updateMountainTrail();

    const tips = {
      easy: "Look for key naming words and colors directly in the short story.",
      average: "Notice why things happen: look for 'because' and descriptive details.",
      intermediate: "Make inferences based on actions and evidence in the text.",
      advanced: "Identify central themes and synthesize multiple sentences for the main point."
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
        feedbackMsg.innerHTML = `<span style="color:#15803d; font-weight:700;"><i class="fas fa-check-circle"></i> Camp reached! Text evidence: "${item.evidence}".</span>`;
      }

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(true, `Great evidence reading! "${item.answer}" is correct.`);
      }

      index += 1;
      updateMountainTrail();
      setTimeout(render, 1200);
    } else {
      streak = 0;
      if (comboCountEl) comboCountEl.innerText = streak;

      try {
        if (window.NumeReadSound) window.NumeReadSound.playChime(false);
      } catch (e) {}

      button.style.background = "#fee2e2";
      button.style.borderColor = "#dc2626";
      if (feedbackMsg) {
        feedbackMsg.innerHTML = `<span style="color:#dc2626; font-weight:600;"><i class="fas fa-times-circle"></i> Best answer: "${item.answer}". Passage clue: "${item.evidence}".</span>`;
      }

      if (window.NumeReadGame?.showAnswerFeedback) {
        window.NumeReadGame.showAnswerFeedback(false, `The best answer is "${item.answer}."`);
      }

      if (window.NumeReadGame?.tutorFeedback) {
        window.NumeReadGame.tutorFeedback({
          skill: "Comprehension",
          difficulty,
          correct: false,
          prompt: item.passage
        }).catch(() => {});
      }

      index += 1;
      updateMountainTrail();
      setTimeout(render, 1600);
    }
  }

  async function finish() {
    gameCompleted = true;
    updateMountainTrail();
    if (completionPanel) completionPanel.classList.remove("hidden");
    const percent = Math.round((score / rounds.length) * 100);
    if (scoreMessage) {
      scoreMessage.innerHTML = `🏔️ Score: ${score} / ${rounds.length} (${percent}%) 🎉`;
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
          activityId: "comprehension-trail",
          area: "reading",
          skill: "Comprehension",
          gain: score >= 4 ? 10 : 6,
          performance: rounds.length ? score / rounds.length : 0,
          xp: 35,
          badge: "Summit Reader",
          clearGaps: ["Comprehension"]
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
      aiStatusSpan.innerHTML = `<i class="fas fa-brain"></i> AI · trail guide`;
    }

    const fallback = banks[difficulty] || banks.easy;
    rounds = window.NumeReadAdaptiveContent?.get("comprehension-trail", difficulty, contentSet, fallback) || fallback;
    rounds = rounds.slice(0, 5);

    render();

    if (speakPassageBtn) {
      speakPassageBtn.onclick = () => {
        if (!rounds[index]) return;
        const itm = rounds[index];
        const speech = `${itm.passage} Question: ${itm.question}`;
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
