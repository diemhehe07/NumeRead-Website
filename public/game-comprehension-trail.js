(function () {
  const banks = {
    easy: [
      { passage: "Lito has a red bag. He puts a book inside.", question: "What color is Lito's bag?", answer: "red", choices: ["red", "blue", "green"] },
      { passage: "The dog runs to the gate. It barks loudly.", question: "What does the dog do?", answer: "barks", choices: ["barks", "sleeps", "reads"] },
      { passage: "Mina drinks water because she is thirsty.", question: "Why does Mina drink water?", answer: "she is thirsty", choices: ["she is thirsty", "she is cold", "she is late"] }
    ],
    average: [
      { passage: "Ana forgot her umbrella. The rain started before she reached home.", question: "What will Ana probably need?", answer: "an umbrella", choices: ["an umbrella", "a pencil", "a spoon"] },
      { passage: "Rico practiced reading every night. On Friday, he read faster.", question: "Why did Rico improve?", answer: "he practiced", choices: ["he practiced", "he slept", "he drew"] },
      { passage: "The class planted seeds. After many sunny days, small leaves appeared.", question: "What happened after sunny days?", answer: "leaves appeared", choices: ["leaves appeared", "books opened", "rain stopped"] }
    ],
    intermediate: [
      { passage: "Because the bridge was closed, Carla took the long road to school.", question: "Why did Carla take the long road?", answer: "the bridge was closed", choices: ["the bridge was closed", "she lost her bag", "school was closed"] },
      { passage: "Marco saved his coins for weeks. At last, he bought the book he wanted.", question: "What can you infer about Marco?", answer: "he was patient", choices: ["he was patient", "he disliked books", "he forgot his coins"] },
      { passage: "The sky turned dark, and the wind pushed the trees. Mother brought the clothes inside.", question: "What was probably coming?", answer: "a storm", choices: ["a storm", "a parade", "a birthday"] }
    ],
    advanced: [
      { passage: "Although Ella missed the first question, she slowed down, reread each item, and finished with confidence.", question: "What lesson does Ella show?", answer: "careful effort helps", choices: ["careful effort helps", "rushing is best", "questions are not useful"] },
      { passage: "The garden looked dry until Niko watered it each afternoon. By Friday, the leaves were bright again.", question: "Which evidence shows Niko helped?", answer: "the leaves were bright again", choices: ["the leaves were bright again", "the afternoon was long", "the garden looked dry first"] },
      { passage: "Tara chose the harder passage because she wanted to learn new words, even if reading it took longer.", question: "What trait best describes Tara?", answer: "determined", choices: ["determined", "careless", "sleepy"] }
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
    document.getElementById("lessonText").textContent = "Read the passage, find clues, then choose the best answer.";
    document.getElementById("passageText").textContent = item.passage;
    document.getElementById("promptText").textContent = item.question;
    document.getElementById("choicesContainer").innerHTML = item.choices.map((choice) => `<button class="choice-card" data-choice="${choice}">${choice}</button>`).join("");
    document.getElementById("feedbackMsg").textContent = "";
  }

  async function choose(choice, button) {
    const item = rounds[index];
    const correct = choice === item.answer;
    if (correct) score += 1;
    button.classList.add(correct ? "correct-animation" : "wrong-animation");
    document.querySelectorAll(".choice-card").forEach((choiceButton) => choiceButton.disabled = true);
    document.getElementById("feedbackMsg").textContent = correct ? "Correct. You used the passage clues." : `Best answer: ${item.answer}.`;
    await window.NumeReadGame.tutorFeedback({ skill: "Comprehension", difficulty, correct, prompt: item.passage });
    index += 1;
    if (index >= rounds.length) await finish();
    else setTimeout(render, 1000);
  }

  async function finish() {
    document.getElementById("completionPanel").classList.remove("hidden");
    document.getElementById("scoreMessage").textContent = `Score: ${score}/${rounds.length}. Comprehension progress saved.`;
    document.getElementById("choicesContainer").innerHTML = "";
    await window.NumeReadGame.finishGame({ activityId: "comprehension-trail", area: "reading", skill: "Comprehension", gain: score >= 2 ? 10 : 5, xp: 30, badge: "Clue Reader" });
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
