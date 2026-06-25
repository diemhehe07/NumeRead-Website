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
    },
    {
      id: "vocab-quest",
      title: "Vocabulary Quest",
      type: "Reading",
      icon: "fa-spell-check",
      xp: 25,
      skill: "Vocabulary",
      prompt: "Use context clues to choose word meanings.",
      material: "Look at the words around an unfamiliar word. The sentence gives clues to meaning.",
      url: "game-vocab-quest.html"
    },
    {
      id: "comprehension-trail",
      title: "Comprehension Trail",
      type: "Reading",
      icon: "fa-route",
      xp: 30,
      skill: "Comprehension",
      prompt: "Read short passages and answer clue-based questions.",
      material: "Read the passage twice. Find details that prove your answer.",
      url: "game-comprehension-trail.html"
    },
    {
      id: "subtraction-sprint",
      title: "Subtraction Sprint",
      type: "Math",
      icon: "fa-minus",
      xp: 30,
      skill: "Subtraction",
      prompt: "Choose the difference and practice taking away.",
      material: "Subtract by counting back, using a number line, or thinking addition facts backward.",
      url: "game-subtraction-sprint.html"
    },
    {
      id: "place-value-builder",
      title: "Place Value Builder",
      type: "Math",
      icon: "fa-layer-group",
      xp: 30,
      skill: "Place value",
      prompt: "Match tens, ones, and hundreds to the correct number.",
      material: "Each digit has a value based on its place. 34 means 3 tens and 4 ones.",
      url: "game-place-value-builder.html"
    }
  ];

  const pretestQuestions = [
    { area: "reading", question: "Which word starts with the same blend as 'frog'?", options: ["flag", "sun", "tree"], answer: "flag" },
    { area: "reading", question: "Choose the best meaning of: 'Lina was thrilled.'", options: ["very happy", "very sleepy", "very cold"], answer: "very happy" },
    { area: "reading", question: "Which word has the same ending sound as 'cake'?", options: ["make", "cat", "sun"], answer: "make" },
    { area: "reading", question: "What is the main idea of: 'The sun is hot. It gives us light. Plants need it to grow.'?", options: ["The sun helps Earth", "Dogs like food", "Rain is cold"], answer: "The sun helps Earth" },
    { area: "reading", question: "Choose the word that completes the sentence: The bird can ____.", options: ["fly", "table", "blue"], answer: "fly" },
    { area: "reading", question: "Which word is a noun?", options: ["book", "quickly", "jump"], answer: "book" },
    { area: "reading", question: "What happened first? 'Mia opened her book. Then she read a story.'", options: ["Mia opened her book", "Mia read a story", "Mia slept"], answer: "Mia opened her book" },
    { area: "reading", question: "Which sentence is complete?", options: ["The boy runs.", "Runs fast", "The happy"], answer: "The boy runs." },
    { area: "reading", question: "What does 'tiny' mean?", options: ["very small", "very loud", "very late"], answer: "very small" },
    { area: "reading", question: "Which word has a long vowel sound?", options: ["bike", "bed", "cup"], answer: "bike" },
    { area: "math", question: "What is 14 + 8?", options: ["20", "22", "24"], answer: "22" },
    { area: "math", question: "Ben had 18 mangoes and gave away 6. How many are left?", options: ["12", "14", "24"], answer: "12" },
    { area: "math", question: "What number comes after 39?", options: ["38", "40", "49"], answer: "40" },
    { area: "math", question: "Which is greater?", options: ["27", "17", "7"], answer: "27" },
    { area: "math", question: "What is 5 + 6?", options: ["10", "11", "12"], answer: "11" },
    { area: "math", question: "What is 20 - 9?", options: ["9", "11", "12"], answer: "11" },
    { area: "math", question: "Which shows 3 tens and 4 ones?", options: ["34", "43", "304"], answer: "34" },
    { area: "math", question: "Ana has 7 pencils. Leo gives her 5 more. How many pencils now?", options: ["12", "10", "2"], answer: "12" },
    { area: "math", question: "Which shape has 3 sides?", options: ["triangle", "square", "circle"], answer: "triangle" },
    { area: "math", question: "Skip count by 5: 5, 10, 15, ____.", options: ["18", "20", "25"], answer: "20" }
  ];

  const posttestQuestions = [
    { area: "reading", question: "Which word begins with a three-letter blend?", options: ["street", "rain", "apple"], answer: "street" },
    { area: "reading", question: "Read: 'Carlo planted seeds because he wanted flowers.' Why did Carlo plant seeds?", options: ["He wanted flowers", "He lost a book", "It was dark"], answer: "He wanted flowers" },
    { area: "reading", question: "Which sentence uses correct order?", options: ["The child reads quietly.", "Reads child the quietly.", "Quietly the reads child."], answer: "The child reads quietly." },
    { area: "reading", question: "What does 'enormous' mean?", options: ["very big", "very small", "very quick"], answer: "very big" },
    { area: "reading", question: "Which word is an action word?", options: ["solve", "pencil", "yellow"], answer: "solve" },
    { area: "reading", question: "What is the best title for: 'Fish swim. Birds fly. Dogs run.'?", options: ["Animals Move", "My Lunch", "A Rainy Day"], answer: "Animals Move" },
    { area: "reading", question: "Which detail tells when something happened? 'After class, Marco solved puzzles.'", options: ["After class", "Marco", "puzzles"], answer: "After class" },
    { area: "reading", question: "Choose the cause: 'Because it rained, we stayed inside.'", options: ["it rained", "we stayed inside", "we played"], answer: "it rained" },
    { area: "reading", question: "Which word completes: The brave child ____ the hard book.", options: ["read", "blue", "under"], answer: "read" },
    { area: "reading", question: "Which answer shows comprehension? 'Lina was tired, so she rested.' Why did Lina rest?", options: ["She was tired", "She was hungry", "She was outside"], answer: "She was tired" },
    { area: "math", question: "What is 36 + 28?", options: ["54", "64", "74"], answer: "64" },
    { area: "math", question: "What is 52 - 19?", options: ["33", "43", "31"], answer: "33" },
    { area: "math", question: "A tray has 18 cookies and 9 more are added. How many cookies?", options: ["27", "26", "29"], answer: "27" },
    { area: "math", question: "There are 45 pretzels in bags of 5. How many bags?", options: ["8", "9", "10"], answer: "9" },
    { area: "math", question: "Which number is 6 tens and 7 ones?", options: ["67", "76", "607"], answer: "67" },
    { area: "math", question: "What is 25 + 17?", options: ["32", "42", "52"], answer: "42" },
    { area: "math", question: "What is 40 - 16?", options: ["24", "26", "34"], answer: "24" },
    { area: "math", question: "Which is the largest?", options: ["89", "98", "79"], answer: "98" },
    { area: "math", question: "Skip count by 10: 30, 40, 50, ____.", options: ["55", "60", "70"], answer: "60" },
    { area: "math", question: "A class has 23 books and receives 14 more. How many books?", options: ["37", "36", "39"], answer: "37" }
  ];

  const learningMaterials = [
    {
      id: "module-blends",
      title: "Blends and Phonics Module",
      category: "Module",
      area: "Reading",
      level: "Easy",
      icon: "fa-book-open",
      summary: "Step-by-step practice for beginning blends such as bl, br, cl, and tr.",
      content: "Read each blend, say the sound, then use it in a short word: bl - blue, br - brush, cl - clap, tr - train."
    },
    {
      id: "av-fluency",
      title: "Reading Fluency Audio-Visual",
      category: "Audio-Visual",
      area: "Reading",
      level: "Average",
      icon: "fa-video",
      summary: "Listen, repeat, and read short sentences with expression.",
      content: "Watch the sentence appear, listen to the pacing, then read it aloud twice. Focus on smooth phrasing and pauses."
    },
    {
      id: "module-addition",
      title: "Addition Facts Module",
      category: "Module",
      area: "Mathematics",
      level: "Easy",
      icon: "fa-calculator",
      summary: "Practice counting on, making ten, and adding small numbers.",
      content: "Start from the bigger number, count on the smaller number, and check using a ten-frame or quick drawing."
    },
    {
      id: "av-word-problems",
      title: "Word Problem Walkthrough",
      category: "Audio-Visual",
      area: "Mathematics",
      level: "Intermediate",
      icon: "fa-circle-play",
      summary: "Animated steps for identifying numbers, keywords, and operations.",
      content: "First underline numbers. Next circle the question. Then decide: are groups joining, or is something being taken away?"
    },
    {
      id: "worksheet-read-solve",
      title: "Read-and-Solve Worksheet",
      category: "Other Material",
      area: "Reading and Math",
      level: "Average",
      icon: "fa-file-lines",
      summary: "Short passages with simple computation questions.",
      content: "Read the short story, answer one comprehension question, then solve the number problem from the story."
    },
    {
      id: "challenge-set",
      title: "Advanced Challenge Set",
      category: "Other Material",
      area: "Reading and Math",
      level: "Advanced",
      icon: "fa-medal",
      summary: "Longer comprehension prompts and two-digit mental math.",
      content: "Use evidence from the passage and solve multi-step number problems. Explain your answer in one sentence."
    }
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
    if (window.NumeReadAdaptiveModel) return window.NumeReadAdaptiveModel.recommend(currentStudent).message;
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
    renderPretestVisibility();
    renderFinalTestStatus();
  }

  function renderActivities() {
    const orderedActivities = [...activities].sort((a, b) => activityPriority(b) - activityPriority(a));
    $("#activityGrid").innerHTML = orderedActivities.map((activity) => {
      const done = student.activities.includes(activity.id);
      const params = new URLSearchParams({ studentName: student.name, grade: student.grade });
      const recommended = activityPriority(activity) > 0;
      return `
        <article class="bg-white rounded-2xl shadow p-5 card-hover flex flex-col">
          <div class="flex items-start justify-between gap-3">
            <i class="fas ${activity.icon} text-2xl ${activity.type === "Math" ? "text-teal-500" : "text-orange-500"}"></i>
            <span class="${recommended ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"} text-xs px-2 py-1 rounded-full">${recommended ? "AI Game Pick" : activity.type}</span>
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

  function activityPriority(activity) {
    const gaps = (student.gaps || []).join(" ").toLowerCase();
    const skill = activity.skill.toLowerCase();
    let priority = 0;
    if (gaps.includes(skill.toLowerCase())) priority += 5;
    if (student.reading < student.math && activity.type !== "Math") priority += 3;
    if (student.math < student.reading && activity.type === "Math") priority += 3;
    if (student.reading < 75 && ["Blends", "Reading fluency", "Vocabulary", "Comprehension"].includes(activity.skill)) priority += 1;
    if (student.math < 75 && ["Addition facts", "Subtraction", "Word problems", "Place value"].includes(activity.skill)) priority += 1;
    if (student.activities.includes(activity.id)) priority -= 10;
    return priority;
  }

  function renderMaterials() {
    const plan = window.NumeReadAdaptiveModel ? window.NumeReadAdaptiveModel.recommend(student) : null;
    const suggestedTitles = plan ? plan.materials : [];
    const sortedMaterials = [...learningMaterials].sort((a, b) => {
      const aSuggested = suggestedTitles.some((title) => a.title.includes(title) || title.includes(a.title));
      const bSuggested = suggestedTitles.some((title) => b.title.includes(title) || title.includes(b.title));
      return Number(bSuggested) - Number(aSuggested);
    });

    $("#materialsGrid").innerHTML = sortedMaterials.map((material) => {
      const suggested = suggestedTitles.some((title) => material.title.includes(title) || title.includes(material.title));
      return `
      <button data-material="${material.id}" class="text-left bg-white rounded-2xl shadow p-5 card-hover">
        <div class="flex items-start justify-between gap-3">
          <i class="fas ${material.icon} text-2xl ${material.area.includes("Math") ? "text-teal-600" : "text-orange-500"}"></i>
          <span class="text-xs ${student.materialsCompleted?.includes(material.id) ? "bg-green-100 text-green-700" : suggested ? "bg-orange-100 text-orange-700" : "bg-teal-50 text-teal-700"} px-2 py-1 rounded-full">${student.materialsCompleted?.includes(material.id) ? "Completed" : suggested ? "AI Pick" : material.category}</span>
        </div>
        <h3 class="font-bold mt-3">${material.title}</h3>
        <p class="text-xs text-gray-500 mt-1">${material.area} - ${material.level}</p>
        <p class="text-sm text-gray-500 mt-2">${material.summary}</p>
      </button>
    `;
    }).join("");
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
    student.reading = pct((readingCorrect / 10) * 100);
    student.math = pct((mathCorrect / 10) * 100);
    student.pretest = { readingCorrect, mathCorrect, takenAt: new Date().toISOString() };
    student.gaps = [];
    if (student.reading < 75) student.gaps.push("Blends", "Reading fluency");
    if (student.math < 75) student.gaps.push("Word problems", "Addition facts");
    student.xp += 40;
    if (!student.badges.includes("Pre-test Pioneer")) student.badges.push("Pre-test Pioneer");
    student = await window.NumeReadData.saveStudent(student);
    await window.NumeReadData.savePretestResult(student, student.pretest);
    $("#pretestResult").textContent = `Reading ${student.reading}%, Math ${student.math}%. Your adaptive path is ready.`;
    renderDashboard();
    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
  }

  function openMaterial(activityId) {
    const material = learningMaterials.find((item) => item.id === activityId);
    if (!material) return;
    $("#modalTitle").textContent = material.title;
    const completed = student.materialsCompleted?.includes(material.id);
    $("#modalBody").innerHTML = `
      <p class="text-sm text-gray-500">${material.category} - ${material.area} - ${material.level}</p>
      <p class="mt-3">${material.content}</p>
      <button data-complete-material="${material.id}" class="mt-5 ${completed ? "bg-green-100 text-green-700" : "bg-orange-500 text-white"} px-4 py-2 rounded-full">${completed ? "Material Completed" : "Mark as Completed"}</button>
    `;
    $("#materialModal").classList.remove("hidden");
  }

  async function completeMaterial(materialId) {
    if (!student.materialsCompleted) student.materialsCompleted = [];
    if (!student.materialsCompleted.includes(materialId)) {
      student.materialsCompleted.push(materialId);
      student.xp += 10;
      student = await window.NumeReadData.saveStudent(student);
    }
    $("#materialModal").classList.add("hidden");
    renderDashboard();
  }

  function allGamesDone() {
    return activities.every((activity) => student.activities.includes(activity.id));
  }

  function allMaterialsDone() {
    return learningMaterials.every((material) => student.materialsCompleted?.includes(material.id));
  }

  function finalTestUnlocked() {
    return allGamesDone() && allMaterialsDone();
  }

  function renderPretestVisibility() {
    const pretestSection = $("#pretest");
    const pretestLink = document.querySelector('[href="#pretest"]');
    const startButton = document.querySelector('[data-scroll="#pretest"]');
    if (!pretestSection) return;
    const taken = Boolean(student.pretest);
    pretestSection.classList.toggle("hidden", taken);
    pretestLink?.classList.toggle("hidden", taken);
    startButton?.classList.toggle("hidden", taken);
    ["home", "dashboard", "learning", "materials", "final-test", "progress"].forEach((id) => {
      document.getElementById(id)?.classList.toggle("hidden", !taken);
      document.querySelector(`[href="#${id}"]`)?.classList.toggle("hidden", !taken);
    });
  }

  function renderFinalTestStatus() {
    const status = $("#finalTestStatus");
    const launchButton = $("#launchFinalTest");
    if (!status || !launchButton) return;
    const gamesDone = activities.filter((activity) => student.activities.includes(activity.id)).length;
    const materialsDone = learningMaterials.filter((material) => student.materialsCompleted?.includes(material.id)).length;
    const unlocked = finalTestUnlocked();
    status.textContent = unlocked
      ? "Final test unlocked. You completed all games and learning materials."
      : `Complete all requirements to unlock: ${gamesDone}/${activities.length} games and ${materialsDone}/${learningMaterials.length} materials done.`;
    launchButton.classList.toggle("hidden", !unlocked || Boolean(student.posttest));
    $("#posttestDone")?.classList.toggle("hidden", !student.posttest);
    if (student.posttest) $("#posttestDone").textContent = `Final test completed: Reading ${student.posttest.readingScore}%, Math ${student.posttest.mathScore}%.`;
  }

  function renderPosttest() {
    $("#posttestQuestions").innerHTML = posttestQuestions.map((item, index) => `
      <fieldset class="bg-white rounded-2xl shadow p-5">
        <legend class="font-semibold">${index + 1}. ${item.question}</legend>
        <div class="grid sm:grid-cols-3 gap-2 mt-3">
          ${item.options.map((option) => `
            <label class="border rounded-xl px-3 py-2 cursor-pointer hover:border-teal-500">
              <input class="mr-2" type="radio" name="p${index}" value="${option}" required>${option}
            </label>
          `).join("")}
        </div>
      </fieldset>
    `).join("");
  }

  async function submitPosttest(event) {
    event.preventDefault();
    if (!finalTestUnlocked()) return;
    const formData = new FormData(event.currentTarget);
    let readingCorrect = 0;
    let mathCorrect = 0;
    posttestQuestions.forEach((item, index) => {
      if (formData.get(`p${index}`) === item.answer) {
        if (item.area === "reading") readingCorrect += 1;
        else mathCorrect += 1;
      }
    });
    student.posttest = {
      readingCorrect,
      mathCorrect,
      readingScore: pct((readingCorrect / 10) * 100),
      mathScore: pct((mathCorrect / 10) * 100),
      takenAt: new Date().toISOString()
    };
    student.reading = Math.max(student.reading, student.posttest.readingScore);
    student.math = Math.max(student.math, student.posttest.mathScore);
    if (!student.badges.includes("Completion Champion")) student.badges.push("Completion Champion");
    student.xp += 60;
    student = await window.NumeReadData.saveStudent(student);
    $("#posttestForm").classList.add("hidden");
    $("#posttestResult").textContent = `Final test submitted. Reading ${student.posttest.readingScore}%, Math ${student.posttest.mathScore}%.`;
    renderDashboard();
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
    renderPosttest();
    renderDashboard();
    if (!student.pretest) {
      setTimeout(() => document.querySelector("#pretest")?.scrollIntoView({ behavior: "smooth" }), 250);
    }

    document.addEventListener("click", (event) => {
      const materialButton = event.target.closest("[data-material]");
      if (materialButton) openMaterial(materialButton.dataset.material);
      const completeMaterialButton = event.target.closest("[data-complete-material]");
      if (completeMaterialButton) completeMaterial(completeMaterialButton.dataset.completeMaterial);
      if (event.target.closest("#launchFinalTest")) {
        $("#posttestForm").classList.remove("hidden");
        $("#posttestForm").scrollIntoView({ behavior: "smooth" });
      }
      if (event.target.closest("[data-scroll]")) {
        document.querySelector(event.target.closest("[data-scroll]").dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
      }
      if (event.target.closest("[data-close-modal]")) $("#materialModal").classList.add("hidden");
    });

    $("#pretestForm").addEventListener("submit", submitPretest);
    $("#posttestForm").addEventListener("submit", submitPosttest);

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
