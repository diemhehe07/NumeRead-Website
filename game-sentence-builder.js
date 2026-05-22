(function () {
  const sets = {
    starter: [
      { words: ["The", "cat", "runs"], sentence: "The cat runs", question: "Who runs?", answer: "cat" }
    ],
    support: [
      { words: ["The", "small", "bird", "sings"], sentence: "The small bird sings", question: "What does the bird do?", answer: "sings" }
    ],
    practice: [
      { words: ["Rina", "reads", "a", "funny", "story"], sentence: "Rina reads a funny story", question: "What does Rina read?", answer: "story" }
    ],
    challenge: [
      { words: ["After", "class", "Marco", "solves", "three", "puzzles"], sentence: "After class Marco solves three puzzles", question: "When does Marco solve puzzles?", answer: "After class" }
    ]
  };

  let difficulty = "starter";
  let item = null;
  let built = [];

  function render() {
    item = sets[difficulty][0];
    built = [];
    const shuffled = [...item.words].sort(() => Math.random() - 0.5);
    document.querySelector("[data-lesson]").textContent = "A sentence needs words in an order that makes sense. Read it again to check meaning.";
    document.querySelector("[data-question]").textContent = item.question;
    document.querySelector("[data-built]").textContent = "";
    document.querySelector("[data-words]").innerHTML = shuffled.map((word) => `
      <button data-word="${word}" class="bg-white hover:bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 font-bold shadow-sm">${word}</button>
    `).join("");
  }

  function addWord(button) {
    built.push(button.dataset.word);
    button.disabled = true;
    button.classList.add("opacity-40");
    document.querySelector("[data-built]").textContent = built.join(" ");
  }

  async function submit() {
    const answer = document.querySelector("[data-answer]").value.trim().toLowerCase();
    const sentenceCorrect = built.join(" ") === item.sentence;
    const answerCorrect = answer.includes(item.answer.toLowerCase());
    const correct = sentenceCorrect && answerCorrect;
    await window.NumeReadGame.tutorFeedback({ skill: "Reading fluency", difficulty, correct, prompt: item.sentence });
    await window.NumeReadGame.finishGame({ activityId: "sentence-builder", area: "reading", skill: "Reading fluency", gain: correct ? 10 : 5, xp: 25, badge: "Sentence Builder", clearGaps: ["Comprehension"] });
    document.querySelector("[data-score]").textContent = correct ? "Complete" : `Sentence: ${item.sentence}`;
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "reading" });
    difficulty = game.difficulty;
    document.querySelector("[data-back]").href = `student.html?${game.query}`;
    render();
    document.addEventListener("click", (event) => {
      const wordButton = event.target.closest("[data-word]");
      if (wordButton) addWord(wordButton);
      if (event.target.closest("[data-reset]")) render();
      if (event.target.closest("[data-submit]")) submit();
    });
  });
})();
