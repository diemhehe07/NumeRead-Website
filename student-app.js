(function () {
  const activities = [
    {
      id: "reading-bridge",
      title: "Reading Bridge",
      type: "Reading",
      icon: "fa-book-open",
      xp: 25,
      skill: "Blends",
      prompt: "Choose beginning blends to build a bridge.",
      material: "Break words into chunks. A blend keeps both sounds, like br in brave.",
      url: "game-reading-bridge.html"
    },
    {
      id: "math-ninja",
      title: "Math Ninja",
      type: "Math",
      icon: "fa-cubes",
      xp: 30,
      skill: "Addition facts",
      prompt: "Solve adaptive addition rounds.",
      material: "Make ten first, count on from the bigger number, or split numbers into parts.",
      url: "game-math-ninja.html"
    },
    {
      id: "word-bakery",
      title: "Word Problem Bakery",
      type: "Combo",
      icon: "fa-chalkboard",
      xp: 30,
      skill: "Word problems",
      prompt: "Read a story, choose the operation, and solve.",
      material: "Underline numbers, circle the question, then decide whether the story joins or takes away.",
      url: "game-word-bakery.html"
    },
    {
      id: "sentence-builder",
      title: "Sentence Builder",
      type: "Fluency",
      icon: "fa-microphone-alt",
      xp: 25,
      skill: "Reading fluency",
      prompt: "Arrange words and answer a comprehension question.",
      material: "A strong sentence has words in an order that makes sense. Reread to check meaning.",
      url: "game-sentence-builder.html"
    }
  ];

  const pretestQuestions = [
    { area: "reading", question: "Which word starts with the same blend as 'frog'?", options: ["flag", "sun", "tree"], answer: "flag" },
    { area: "reading", question: "Choose the best meaning of: 'Lina was thrilled.'", options: ["very happy", "very sleepy", "very cold"], answer: "very happy" },
    { area: "math", question: "What is 14 + 8?", options: ["20", "22", "24"], answer: "22" },
    { area: "math", question: "Ben had 18 mangoes and gave away 6. How many are left?", options: ["12", "14", "24"], answer: "12" }
  ];

  let student = null;
  const $ = (selector) => document.querySelector(selector);

  function pct(value) {
    return Math.max(0, Math.min(100, Math.round(value || 0)));
  }

  function learningLevel(score) {
    if (score >= 75) return "Independent";
    if (score >= 50) return "Instructional";
    return "Frustration";
  }

  function recommendationFor(currentStudent) {
    if (!currentStudent.pretest) return "Take the pre-test to unlock your adaptive path.";
    const lowestMath = Object.entries(currentStudent.mastery).sort((a, b) => a[1] - b[1])[0]?.[0] || "Word problems";
    if (currentStudent.reading < currentStudent.math) return `Recommended: ${activities.find((item) => item.skill === "Blends").title} for reading fluency.`;
    return `Recommended: ${lowestMath} practice through ${activities.find((item) => item.skill === lowestMath)?.title || "Read & Solve"}.`;
  }

  function renderDashboard() {
    $("#studentDisplay").textContent = student.name;
    $("#studentNameHero").textContent = student.name;
    $("#firebaseStatus").textContent = window.NumeReadData.usingFirebase() ? "Firebase connected" : "Demo storage";
    $("#xpValue").textContent = student.xp;
    $("#streakValue").textContent = `${student.streak} days`;
    $("#badgeValue").textContent = student.badges.length;

    $("#readingLevel").textContent = learningLevel(student.reading);
    $("#readingBar").style.width = `${pct(student.reading)}%`;
    $("#readingScore").textContent = `${pct(student.reading)}% mastery`;
    $("#mathLevel").textContent = learningLevel(student.math);
    $("#mathBar").style.width = `${pct(student.math)}%`;
    $("#mathScore").textContent = `${pct(student.math)}% number sense`;
    $("#gapText").textContent = student.gaps.length ? student.gaps.join(", ") : "No major gaps yet";
    $("#aiRecommendation").textContent = recommendationFor(student);
    renderActivities();
    renderMaterials();
    renderProgress();
  }

  function renderActivities() {
    $("#activityGrid").innerHTML = activities.map((activity) => {
      const done = student.activities.includes(activity.id);
      const params = new URLSearchParams({ studentName: student.name, grade: student.grade });
      return `
        <article class="bg-white rounded-2xl shadow p-5 card-hover flex flex-col">
          <div class="flex items-start justify-between gap-3">
            <i class="fas ${activity.icon} text-2xl ${activity.type === "Math" ? "text-teal-500" : "text-orange-500"}"></i>
            <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">${activity.type}</span>
          </div>
          <h3 class="font-bold mt-3">${activity.title}</h3>
          <p class="text-sm text-gray-500 mt-1">${activity.prompt}</p>
          <div class="flex justify-between mt-3 text-xs text-gray-600">
            <span><i class="fas fa-star text-yellow-400"></i> +${activity.xp} XP</span>
            <span>${activity.skill}</span>
          </div>
          <a href="${activity.url}?${params.toString()}" class="text-center mt-4 ${done ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-orange-500 hover:text-white"} w-full py-2 rounded-xl transition">
            ${done ? "Replay Game" : "Play Game"}
          </a>
        </article>
      `;
    }).join("");
  }

  function renderMaterials() {
    $("#materialsGrid").innerHTML = activities.map((activity) => `
      <button data-material="${activity.id}" class="text-left bg-white rounded-2xl shadow p-5 card-hover">
        <span class="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">${activity.skill}</span>
        <h3 class="font-bold mt-3">${activity.title}</h3>
        <p class="text-sm text-gray-500 mt-2">${activity.material}</p>
      </button>
    `).join("");
  }

  function renderProgress() {
    const maxWpm = Math.max(...student.wpm, 70);
    $("#wpmBars").innerHTML = student.wpm.map((value, index) => `
      <div class="flex-1 text-center text-xs text-gray-600">
        <div class="${index === student.wpm.length - 1 ? "bg-amber-400" : "bg-orange-400"} rounded-t-lg text-white flex items-end justify-center pb-1" style="height:${Math.max(28, (value / maxWpm) * 112)}px">${value}</div>
        <span>W${index + 1}</span>
      </div>
    `).join("");

    $("#masteryList").innerHTML = Object.entries(student.mastery).map(([name, value]) => `
      <div>
        <div class="flex justify-between text-sm"><span>${name}</span><span>${pct(value)}%</span></div>
        <div class="w-full bg-gray-200 rounded-full h-2"><div class="${value < 45 ? "bg-orange-400" : "bg-teal-500"} h-2 rounded-full" style="width:${pct(value)}%"></div></div>
      </div>
    `).join("");
    $("#feedbackText").textContent = recommendationFor(student);
  }

  async function completeActivity(activityId) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity || student.activities.includes(activityId)) return;
    student.activities.push(activityId);
    student.xp += activity.xp;
    student.streak = Math.max(1, student.streak);
    if (student.xp >= 100 && !student.badges.includes("XP Explorer")) student.badges.push("XP Explorer");
    if (activity.skill === "Blends") student.reading = pct(student.reading + 6);
    if (student.mastery[activity.skill] !== undefined) student.mastery[activity.skill] = pct(student.mastery[activity.skill] + 8);
    if (activity.skill === "Reading fluency") student.wpm[student.wpm.length - 1] += 4;
    student = await window.NumeReadData.saveStudent(student);
    renderDashboard();
  }

  async function submitPretest(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let readingCorrect = 0;
    let mathCorrect = 0;
    pretestQuestions.forEach((item, index) => {
      if (formData.get(`q${index}`) === item.answer) {
        if (item.area === "reading") readingCorrect += 1;
        else mathCorrect += 1;
      }
    });
    student.reading = pct((readingCorrect / 2) * 100);
    student.math = pct((mathCorrect / 2) * 100);
    student.pretest = { readingCorrect, mathCorrect, takenAt: new Date().toISOString() };
    student.gaps = [];
    if (student.reading < 75) student.gaps.push("Blends", "Reading fluency");
    if (student.math < 75) student.gaps.push("Word problems", "Addition facts");
    student.xp += 40;
    if (!student.badges.includes("Pre-test Pioneer")) student.badges.push("Pre-test Pioneer");
    student = await window.NumeReadData.saveStudent(student);
    $("#pretestResult").textContent = `Reading ${student.reading}%, Math ${student.math}%. Your adaptive path is ready.`;
    renderDashboard();
  }

  function openMaterial(activityId) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;
    $("#modalTitle").textContent = activity.title;
    $("#modalBody").innerHTML = `<p>${activity.material}</p><p class="mt-3 font-semibold text-gray-800">${activity.prompt}</p>`;
    $("#materialModal").classList.remove("hidden");
  }

  function renderPretest() {
    $("#pretestQuestions").innerHTML = pretestQuestions.map((item, index) => `
      <fieldset class="bg-white rounded-2xl shadow p-5">
        <legend class="font-semibold">${index + 1}. ${item.question}</legend>
        <div class="grid sm:grid-cols-3 gap-2 mt-3">
          ${item.options.map((option) => `
            <label class="border rounded-xl px-3 py-2 cursor-pointer hover:border-orange-400">
              <input class="mr-2" type="radio" name="q${index}" value="${option}" required>${option}
            </label>
          `).join("")}
        </div>
      </fieldset>
    `).join("");
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const studentName = params.get("studentName") || "Maria R.";
    const grade = params.get("grade") || "Grade 2";
    student = await window.NumeReadData.getOrCreateStudent(studentName, grade);
    renderPretest();
    renderDashboard();

    document.addEventListener("click", (event) => {
      const materialButton = event.target.closest("[data-material]");
      if (materialButton) openMaterial(materialButton.dataset.material);
      if (event.target.closest("[data-scroll]")) {
        document.querySelector(event.target.closest("[data-scroll]").dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
      }
      if (event.target.closest("[data-close-modal]")) $("#materialModal").classList.add("hidden");
    });

    $("#pretestForm").addEventListener("submit", submitPretest);

    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    function setActiveLink() {
      let current = "";
      const scrollPos = window.scrollY + 150;
      sections.forEach((section) => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) current = section.id;
      });
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
    }
    navLinks.forEach((link) => link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector(link.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
    }));
    window.addEventListener("scroll", setActiveLink);
    setActiveLink();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
