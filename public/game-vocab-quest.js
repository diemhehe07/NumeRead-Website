(function () {
  const banks = {
    easy: [
      { word: "tiny", sentence: "The tiny seed was hard to see.", answer: "very small", choices: ["very small", "very loud", "very late"] },
      { word: "happy", sentence: "Mia was happy when she won.", answer: "glad", choices: ["glad", "angry", "sleepy"] },
      { word: "quick", sentence: "The quick child ran to class.", answer: "fast", choices: ["fast", "cold", "round"] },
      { word: "near", sentence: "The bag is near the desk.", answer: "close", choices: ["close", "far", "lost"] }
    ],
    average: [
      { word: "brave", sentence: "The brave child tried again.", answer: "not afraid", choices: ["not afraid", "very tired", "full of food"] },
      { word: "silent", sentence: "The room was silent during reading.", answer: "quiet", choices: ["quiet", "messy", "bright"] },
      { word: "reply", sentence: "Please reply to the question.", answer: "answer", choices: ["answer", "hide", "draw"] },
      { word: "usual", sentence: "I sat in my usual chair.", answer: "regular", choices: ["regular", "broken", "tiny"] }
    ],
    intermediate: [
      { word: "enormous", sentence: "The enormous box filled the room.", answer: "very big", choices: ["very big", "very soft", "very early"] },
      { word: "discover", sentence: "They discover a new path.", answer: "find", choices: ["find", "forget", "throw"] },
      { word: "careful", sentence: "Be careful with the glass.", answer: "not careless", choices: ["not careless", "very sleepy", "always late"] },
      { word: "select", sentence: "Select the best answer.", answer: "choose", choices: ["choose", "erase", "carry"] }
    ],
    advanced: [
      { word: "predict", sentence: "Use clues to predict what happens next.", answer: "tell what may happen", choices: ["tell what may happen", "read very loudly", "count backward"] },
      { word: "compare", sentence: "Compare the two stories.", answer: "tell how things are alike or different", choices: ["tell how things are alike or different", "make something smaller", "skip the ending"] },
      { word: "evidence", sentence: "Use evidence from the passage.", answer: "details that prove an answer", choices: ["details that prove an answer", "a funny picture", "a list of numbers"] },
      { word: "conclude", sentence: "Conclude why the character left.", answer: "decide using clues", choices: ["decide using clues", "start again", "speak softly"] }
    ]
  };

  let rounds = [];
  let index = 0;
  let score = 0;
  let difficulty = "easy";
  let dashboardUrl = "student.html";

  function render() {
    const item = rounds[index];
    document.getElementById("roundDisplay").textContent = `${index + 1}/${rounds.length}`;
    document.getElementById("lessonText").textContent = "Use the sentence clues around the word to figure out its meaning.";
    document.getElementById("promptText").innerHTML = `<strong>${item.word}</strong><br><span style="font-size:1rem;">${item.sentence}</span>`;
    document.getElementById("choicesContainer").innerHTML = item.choices.map((choice) => `<button class="choice-card" data-choice="${choice}">${choice}</button>`).join("");
    document.getElementById("feedbackMsg").textContent = "";
  }

  async function choose(choice, button) {
    const item = rounds[index];
    const correct = choice === item.answer;
    if (correct) score += 1;
    button.classList.add(correct ? "correct-animation" : "wrong-animation");
    document.querySelectorAll(".choice-card").forEach((choiceButton) => choiceButton.disabled = true);
    document.getElementById("feedbackMsg").textContent = correct ? "Correct. Context clues helped you." : `The best meaning is "${item.answer}".`;
    await window.NumeReadGame.tutorFeedback({ skill: "Vocabulary", difficulty, correct, prompt: item.sentence });
    index += 1;
    if (index >= rounds.length) {
      await finish();
    } else {
      setTimeout(render, 900);
    }
  }

  async function finish() {
    document.getElementById("completionPanel").classList.remove("hidden");
    document.getElementById("scoreMessage").textContent = `Score: ${score}/${rounds.length}. Vocabulary progress saved.`;
    document.getElementById("choicesContainer").innerHTML = "";
    await window.NumeReadGame.finishGame({ activityId: "vocab-quest", area: "reading", skill: "Vocabulary", gain: score >= 3 ? 10 : 5, xp: 25, badge: "Word Explorer" });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "reading" });
    difficulty = game.difficulty;
    dashboardUrl = game.dashboardUrl;
    rounds = banks[difficulty] || banks.easy;
    render();
    document.getElementById("choicesContainer").addEventListener("click", (event) => {
      const button = event.target.closest(".choice-card");
      if (button && !button.disabled) choose(button.dataset.choice, button);
    });
    document.getElementById("backDashboardBtn").addEventListener("click", () => { window.location.href = dashboardUrl; });
  });
})();
