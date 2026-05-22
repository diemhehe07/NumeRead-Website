(function () {
  const banks = {
    starter: [
      { story: "Mia baked 6 buns. She baked 3 more. How many buns now?", op: "add", answer: 9 },
      { story: "Leo had 8 pies. He sold 2. How many pies are left?", op: "subtract", answer: 6 }
    ],
    support: [
      { story: "Ana made 12 cupcakes. Her friend made 5. How many cupcakes altogether?", op: "add", answer: 17 },
      { story: "There were 15 rolls. 4 were eaten. How many rolls remain?", op: "subtract", answer: 11 }
    ],
    practice: [
      { story: "A tray has 18 cookies. The class adds 9 more. How many cookies are on the tray?", op: "add", answer: 27 },
      { story: "There are 24 muffins. The teacher gives away 8. How many muffins are left?", op: "subtract", answer: 16 }
    ],
    challenge: [
      { story: "The bakery packed 36 pandesal in the morning and 28 in the afternoon. How many were packed?", op: "add", answer: 64 },
      { story: "A shelf had 52 cakes. Customers bought 19. How many cakes stayed on the shelf?", op: "subtract", answer: 33 }
    ]
  };

  let difficulty = "starter";
  let problem = null;
  let selectedOp = "";

  function render() {
    problem = banks[difficulty][Math.floor(Math.random() * banks[difficulty].length)];
    document.querySelector("[data-story]").textContent = problem.story;
    document.querySelector("[data-lesson]").textContent = "Read the story first. If amounts join, add. If something leaves, subtract.";
  }

  async function submit() {
    const answer = Number(document.querySelector("[data-answer]").value);
    const correct = selectedOp === problem.op && answer === problem.answer;
    await window.NumeReadGame.tutorFeedback({ skill: "Word problems", difficulty, correct, prompt: problem.story });
    const gain = correct ? 12 : 5;
    await window.NumeReadGame.finishGame({ activityId: "word-bakery", area: "math", skill: "Word problems", gain, xp: 30, badge: "Problem Baker" });
    document.querySelector("[data-score]").textContent = correct ? "Solved" : `Answer: ${problem.answer}`;
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const game = await window.NumeReadGame.initGame({ area: "math" });
    difficulty = game.difficulty;
    document.querySelector("[data-back]").href = `student.html?${game.query}`;
    render();
    document.addEventListener("click", (event) => {
      const opButton = event.target.closest("[data-op]");
      if (opButton) {
        selectedOp = opButton.dataset.op;
        document.querySelectorAll("[data-op]").forEach((button) => button.classList.remove("bg-orange-500", "text-white"));
        opButton.classList.add("bg-orange-500", "text-white");
      }
      if (event.target.closest("[data-submit]")) submit();
    });
  });
})();
