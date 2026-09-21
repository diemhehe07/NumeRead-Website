// game-fraction-pizza.js - Fraction Pizza Chef Mathematics Game
(function () {
  let TOTAL_ROUNDS = 10;
  let difficulty = "easy";
  let currentRound = 0;
  let score = 0;
  let combo = 0;
  let currentProblem = null;
  let dashboardUrl = "student.html";
  let waitingForNext = false;
  let teacherLesson = null;
  let audioContext = null;

  // Sound synthesis via Web Audio API
  function initAudio() {
    if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playChime(isCorrect) {
    try {
      initAudio();
      if (!audioContext) return;
      if (audioContext.state === "suspended") audioContext.resume();

      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      if (isCorrect) {
        // Joyful two-tone chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // Low gentle boop
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.12);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio not permitted or supported; silent fallback
    }
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Generate SVG pizza markup
  function generatePizzaSvg(numerator, denominator) {
    const num = Math.min(numerator, denominator);
    const den = denominator;
    const cx = 100;
    const cy = 100;
    const r = 86;
    const crustR = 92;

    let slicesHtml = "";
    const anglePerSlice = (2 * Math.PI) / den;

    for (let i = 0; i < den; i++) {
      const startAngle = i * anglePerSlice - Math.PI / 2;
      const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const largeArc = anglePerSlice > Math.PI ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      const isTopped = i < num;
      const fillColor = isTopped ? "#f59e0b" : "#fef3c7";
      const strokeColor = "#92400e";

      // Pepperoni positions inside slice
      let toppingsHtml = "";
      if (isTopped) {
        const midAngle = startAngle + anglePerSlice / 2;
        const dist1 = r * 0.58;
        const px1 = cx + dist1 * Math.cos(midAngle);
        const py1 = cy + dist1 * Math.sin(midAngle);
        toppingsHtml += `<circle cx="${px1.toFixed(1)}" cy="${py1.toFixed(1)}" r="7" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>
                         <circle cx="${(px1 - 2).toFixed(1)}" cy="${(py1 - 2).toFixed(1)}" r="2" fill="#ef4444" opacity="0.8"/>`;

        if (den <= 6) {
          const dist2 = r * 0.32;
          const px2 = cx + dist2 * Math.cos(midAngle);
          const py2 = cy + dist2 * Math.sin(midAngle);
          toppingsHtml += `<circle cx="${px2.toFixed(1)}" cy="${py2.toFixed(1)}" r="5.5" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>`;
        }
      }

      slicesHtml += `
        <g class="pizza-slice-group">
          <path d="${pathData}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.8" class="pizza-slice-path ${isTopped ? 'is-active' : ''}"/>
          ${toppingsHtml}
        </g>
      `;
    }

    return `
      <svg viewBox="0 0 200 200" class="pizza-svg" role="img" aria-label="Pizza with ${num} out of ${den} slices topped with pepperoni">
        <!-- Crust Base -->
        <circle cx="${cx}" cy="${cy}" r="${crustR}" fill="#d97706" stroke="#92400e" stroke-width="3"/>
        <circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="#b45309" opacity="0.3"/>
        <!-- Slices -->
        ${slicesHtml}
        <!-- Pizza Center Hub -->
        <circle cx="${cx}" cy="${cy}" r="6" fill="#b45309"/>
      </svg>
    `;
  }

  // Fraction naming dictionary
  const FRACTION_NAMES = {
    "1/2": "one half",
    "2/2": "two halves (whole)",
    "1/3": "one third",
    "2/3": "two thirds",
    "3/3": "three thirds (whole)",
    "1/4": "one quarter",
    "2/4": "two quarters",
    "3/4": "three quarters",
    "4/4": "four quarters (whole)",
    "1/5": "one fifth",
    "2/5": "two fifths",
    "3/5": "three fifths",
    "4/5": "four fifths",
    "1/6": "one sixth",
    "2/6": "two sixths",
    "3/6": "three sixths",
    "4/6": "four sixths",
    "5/6": "five sixths",
    "1/8": "one eighth",
    "2/8": "two eighths",
    "3/8": "three eighths",
    "4/8": "four eighths",
    "5/8": "five eighths",
    "6/8": "six eighths",
    "7/8": "seven eighths"
  };

  function fractionLabel(num, den) {
    return FRACTION_NAMES[`${num}/${den}`] || `${num}/${den}`;
  }

  // Problem Generators by Difficulty
  function makeEasyProblem() {
    // Halves, Thirds, Quarters unit & simple fractions
    const pool = [
      { n: 1, d: 2 },
      { n: 1, d: 3 },
      { n: 1, d: 4 },
      { n: 2, d: 4 },
      { n: 2, d: 3 },
      { n: 3, d: 4 }
    ];
    const item = pool[rand(0, pool.length - 1)];
    const correctFrac = `${item.n}/${item.d}`;

    const distractorPool = ["1/2", "1/3", "1/4", "2/3", "3/4", "1/5"].filter((f) => f !== correctFrac);
    const choices = shuffle([correctFrac, ...distractorPool.slice(0, 2)]);

    return {
      type: "visual",
      num: item.n,
      den: item.d,
      prompt: `What fraction of the pizza has pepperoni toppings?`,
      subPrompt: `${item.n} out of ${item.d} equal slices are topped.`,
      answer: correctFrac,
      choices: choices.map((val) => {
        const [n, d] = val.split("/");
        return { value: val, label: val, sub: fractionLabel(n, d) };
      }),
      tip: "Count the topped slices for the top number (numerator). Count ALL slices for the bottom number (denominator)."
    };
  }

  function makeAverageProblem() {
    const denPool = [3, 4, 5, 6];
    const den = denPool[rand(0, denPool.length - 1)];
    const num = rand(1, den - 1);
    const correctFrac = `${num}/${den}`;

    // Sometimes ask for remaining / uneaten slices to vary cognitive skill
    const askRemaining = Math.random() < 0.4;
    const targetNum = askRemaining ? den - num : num;
    const targetFrac = `${targetNum}/${den}`;

    const distractorCandidates = [
      `${Math.max(1, targetNum - 1)}/${den}`,
      `${Math.min(den, targetNum + 1)}/${den}`,
      `${targetNum}/${Math.min(8, den + 2)}`,
      `${den - targetNum}/${den}`,
      `1/${den}`
    ].filter((f) => f !== targetFrac);

    const distractors = [...new Set(distractorCandidates)].slice(0, 2);
    const choices = shuffle([targetFrac, ...distractors]);

    return {
      type: "visual",
      num: num,
      den: den,
      prompt: askRemaining
        ? `What fraction of the pizza is PLAIN (cheese only)?`
        : `What fraction of the pizza has PEPPERONI?`,
      subPrompt: askRemaining
        ? `Count the ${targetNum} plain slices out of ${den} total slices.`
        : `Count the ${targetNum} topped slices out of ${den} total slices.`,
      answer: targetFrac,
      choices: choices.map((val) => {
        const [n, d] = val.split("/");
        return { value: val, label: val, sub: fractionLabel(n, d) };
      }),
      tip: `The denominator is ${den} because the pizza is cut into ${den} equal pieces.`
    };
  }

  function makeIntermediateProblem() {
    const roll = Math.random();

    if (roll < 0.35) {
      // Numerator vs Denominator terminology
      const den = rand(4, 8);
      const num = rand(1, den - 1);
      const isNumeratorQ = Math.random() < 0.5;

      const question = isNumeratorQ
        ? `In the fraction ${num}/${den}, which number is the NUMERATOR (parts chosen)?`
        : `In the fraction ${num}/${den}, which number is the DENOMINATOR (total equal parts)?`;
      const answer = String(isNumeratorQ ? num : den);
      const choices = shuffle([String(num), String(den), String(num + den)]);

      return {
        type: "visual",
        num: num,
        den: den,
        prompt: question,
        subPrompt: isNumeratorQ ? `Remember: Numerator is on TOP!` : `Remember: Denominator is on the BOTTOM!`,
        answer: answer,
        choices: choices.map((c) => ({ value: c, label: c, sub: c === String(num) ? "Top number" : c === String(den) ? "Bottom number" : "Sum of parts" })),
        tip: "The numerator is on top (number of slices). The denominator is on the bottom (total slices)."
      };
    } else {
      // Word problem
      const den = [4, 6, 8][rand(0, 2)];
      const eaten = rand(1, den - 2);
      const names = ["Chef Carlo", "Leo", "Maya", "Emma", "Ben"];
      const person = names[rand(0, names.length - 1)];

      const correctFrac = `${eaten}/${den}`;
      const distractors = [
        `${den - eaten}/${den}`,
        `${eaten}/${den + 2}`,
        `1/${den}`
      ].filter((f) => f !== correctFrac);

      const choices = shuffle([correctFrac, ...distractors.slice(0, 2)]);

      return {
        type: "visual",
        num: eaten,
        den: den,
        prompt: `${person} baked a pizza with ${den} equal slices and served ${eaten} slices. What fraction was served?`,
        subPrompt: `${eaten} slices served out of ${den} total slices.`,
        answer: correctFrac,
        choices: choices.map((val) => {
          const [n, d] = val.split("/");
          return { value: val, label: val, sub: fractionLabel(n, d) };
        }),
        tip: "Write the slices served on top and the total slices on the bottom."
      };
    }
  }

  function makeAdvancedProblem() {
    const roll = Math.random();

    if (roll < 0.5) {
      // Equivalent fractions
      const pairs = [
        { orig: "1/2", equiv: "2/4", visualN: 2, visualD: 4, others: ["1/4", "3/4", "2/3"] },
        { orig: "1/2", equiv: "4/8", visualN: 4, visualD: 8, others: ["3/8", "5/8", "1/4"] },
        { orig: "1/3", equiv: "2/6", visualN: 2, visualD: 6, others: ["1/6", "3/6", "4/6"] },
        { orig: "2/4", equiv: "1/2", visualN: 1, visualD: 2, others: ["1/4", "3/4", "2/3"] }
      ];
      const item = pairs[rand(0, pairs.length - 1)];
      const choices = shuffle([item.equiv, ...item.others.slice(0, 2)]);

      return {
        type: "visual",
        num: item.visualN,
        den: item.visualD,
        prompt: `Look at the pizza: which fraction is EQUIVALENT (equal) to ${item.orig}?`,
        subPrompt: `The pizza shows ${item.equiv}, which covers the same amount as ${item.orig}!`,
        answer: item.equiv,
        choices: choices.map((val) => {
          const [n, d] = val.split("/");
          return { value: val, label: val, sub: fractionLabel(n, d) };
        }),
        tip: "Equivalent fractions name the exact same amount of pizza using different slice sizes."
      };
    } else {
      // Comparing fractions
      const den = [4, 6, 8][rand(0, 2)];
      const n1 = rand(2, den - 1);
      const n2 = rand(1, n1 - 1);

      const f1 = `${n1}/${den}`;
      const f2 = `${n2}/${den}`;
      const choices = shuffle([f1, f2, "They are equal"]);

      return {
        type: "visual",
        num: n1,
        den: den,
        prompt: `Which fraction represents MORE pizza: ${f1} or ${f2}?`,
        subPrompt: `When the denominators are the same, compare the numerators: ${n1} vs ${n2}.`,
        answer: f1,
        choices: choices.map((c) => ({ value: c, label: c, sub: c === f1 ? "Larger numerator" : c === f2 ? "Smaller numerator" : "Equal amounts" })),
        tip: `Both pizzas have ${den} slices. ${n1} slices is more than ${n2} slices!`
      };
    }
  }

  function getProblem() {
    const bank = window.NumeReadGame?.getActivityQuestions?.("fraction-pizza", difficulty, { seed: 0 }) || window.NumeReadTestBanks?.getForActivity("fraction-pizza", difficulty, { seed: 0 }) || [];
    const item = bank[currentRound];
    if (!item) throw new Error(`No Fraction Pizza item is available for round ${currentRound + 1}.`);
    return {
      ...item,
      answer: String(item.answer),
      choices: (item.choices || []).map((c) => typeof c === "object" ? { ...c, value: String(c.value), label: String(c.label) } : { value: String(c), label: String(c), sub: "" })
    };
  }

  function renderRound() {
    waitingForNext = false;
    currentProblem = getProblem();
    currentRound += 1;

    // Update Top bar & round status
    document.getElementById("roundDisplay").textContent = `${currentRound}/${TOTAL_ROUNDS}`;
    document.getElementById("lessonText").textContent = currentProblem.tip;
    document.getElementById("scoreCount").textContent = String(score);
    document.getElementById("comboCount").textContent = String(combo);

    // Update Pizza Meter. The number of tokens now matches the test-bank level.
    const meter = document.querySelector(".pizza-slices-meter");
    if (meter && currentRound === 1) {
      meter.setAttribute("aria-label", `${TOTAL_ROUNDS} pizza orders`);
      meter.innerHTML = Array.from({ length: TOTAL_ROUNDS }, (_, i) => `<span class="mini-pizza-token" title="Order ${i + 1}">${i + 1}</span>`).join("");
    }
    const meterTokens = document.querySelectorAll(".mini-pizza-token");
    meterTokens.forEach((token, index) => {
      if (index < currentRound - 1) {
        token.classList.add("is-baked");
      }
    });

    // Render Pizza SVG
    const pizzaWrapper = document.getElementById("pizzaWrapper");
    pizzaWrapper.innerHTML = generatePizzaSvg(currentProblem.num, currentProblem.den);

    // Render Meta Badge
    document.getElementById("pizzaMetaBadge").innerHTML = `
      <i class="fas fa-chart-pie"></i> ${currentProblem.num} / ${currentProblem.den} slices topped
      <span class="text-xs text-amber-700 font-normal">(${fractionLabel(currentProblem.num, currentProblem.den)})</span>
    `;

    // Render Question Prompt
    document.getElementById("promptText").innerHTML = `
      <div>${currentProblem.prompt}</div>
      <div class="text-sm font-normal text-amber-800 mt-1">${currentProblem.subPrompt}</div>
    `;

    // Render Choices Grid
    const choicesContainer = document.getElementById("choicesContainer");
    choicesContainer.innerHTML = currentProblem.choices.map((c) => `
      <button type="button" class="choice-card" data-choice="${c.value}">
        <span class="choice-label-main">${c.label}</span>
        ${c.sub ? `<span class="choice-label-sub">${c.sub}</span>` : ""}
      </button>
    `).join("");

    // Clear feedback
    const feedbackNode = document.getElementById("feedbackMsg");
    feedbackNode.textContent = "";
    feedbackNode.className = "feedback-message";
  }

  async function handleChoice(selectedChoice, button) {
    if (waitingForNext) return;
    waitingForNext = true;

    const isCorrect = String(selectedChoice) === String(currentProblem.answer);
    if (isCorrect) {
      score += 1;
      combo += 1;
      playChime(true);
      button.classList.add("correct-animation");
    } else {
      combo = 0;
      playChime(false);
      button.classList.add("wrong-animation");
    }

    // Disable choices
    document.querySelectorAll(".pizza-choices .choice-card").forEach((btn) => (btn.disabled = true));

    // Update stats
    document.getElementById("scoreCount").textContent = String(score);
    document.getElementById("comboCount").textContent = String(combo);

    // Feedback message
    const feedbackText = isCorrect
      ? `🍕 Delicious! ${currentProblem.answer} is correct!`
      : `Good try! The correct fraction is ${currentProblem.answer}.${currentProblem.tip ? " Tip: " + currentProblem.tip : ""}`;
    window.NumeReadGame.showAnswerFeedback(isCorrect, feedbackText);

    // Ask AI Tutor (non-blocking)
    if (window.NumeReadGame?.tutorFeedback) {
      window.NumeReadGame.tutorFeedback({
        skill: "Fractions",
        difficulty,
        correct: isCorrect,
        prompt: currentProblem.prompt,
        userAnswer: selectedChoice,
        correctAnswer: currentProblem.answer
      }).catch(() => {});
    }

    if (currentRound >= TOTAL_ROUNDS) {
      // Mark current token
      const meterTokens = document.querySelectorAll(".mini-pizza-token");
      if (meterTokens[currentRound - 1] && isCorrect) {
        meterTokens[currentRound - 1].classList.add("is-baked");
      }
      setTimeout(finishGame, 1000);
    } else {
      setTimeout(renderRound, 1200);
    }
  }

  async function finishGame() {
    const completionPanel = document.getElementById("completionPanel");
    completionPanel.classList.remove("hidden");
    document.getElementById("scoreMessage").innerHTML = `You solved <strong>${score} out of ${TOTAL_ROUNDS}</strong> fraction orders accurately!`;

    // Empty choices container
    document.getElementById("choicesContainer").innerHTML = "";

    const masteryGain = Math.max(6, score * 3);
    await window.NumeReadGame.finishGame({
      activityId: "fraction-pizza",
      area: "math",
      skill: "Fractions",
      gain: masteryGain,
      performance: score / TOTAL_ROUNDS,
      xp: 30,
      badge: "Fraction Pizza Chef"
    });
  }

  // Setup on Page Load
  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty || "easy";
    TOTAL_ROUNDS = (window.NumeReadGame?.getActivityQuestions?.("fraction-pizza", difficulty) || window.NumeReadTestBanks?.getForActivity("fraction-pizza", difficulty) || []).length || 10;
    dashboardUrl = game.dashboardUrl || "student.html";

    const difficultyDisplay = document.getElementById("difficultyDisplay");
    if (difficultyDisplay) difficultyDisplay.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    renderRound();

    // Choice click delegation
    document.getElementById("choicesContainer").addEventListener("click", (event) => {
      const button = event.target.closest(".choice-card");
      if (button && !button.disabled) {
        handleChoice(button.dataset.choice, button);
      }
    });

    // Back to dashboard
    document.getElementById("backDashboardBtn").addEventListener("click", () => {
      window.location.href = dashboardUrl;
    });

    // Allow clicking anywhere to unlock audio context on mobile
    document.body.addEventListener("pointerdown", initAudio, { once: true });
  });
})();
