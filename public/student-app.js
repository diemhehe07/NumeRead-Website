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
      id: "pronunciation-practice",
      title: "Pronunciation Practice",
      type: "Fluency",
      icon: "fa-microphone-lines",
      xp: 10,
      skill: "Pronunciation",
      prompt: "Listen to each word, say it aloud, and get instant feedback.",
      material: "Listen carefully, then speak clearly into your microphone.",
      url: "pronunciation.html"
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
  let displayedPretestQuestions = [];

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

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
      content: "Read each blend, say the sound, then use it in a short word: bl - blue, br - brush, cl - clap, tr - train.",
      steps: ["Listen for both beginning sounds.", "Slide the sounds together without pausing.", "Read the whole word and use it in a sentence."],
      check: { question: "Which word starts with bl?", answer: "blue", choices: ["blue", "sun", "cat"] },
      activityIds: ["reading-bridge"]
    },
    {
      id: "av-fluency",
      title: "Reading Fluency Audio-Visual",
      category: "Audio-Visual",
      area: "Reading",
      level: "Average",
      icon: "fa-video",
      summary: "Listen, repeat, and read short sentences with expression.",
      content: "Watch the sentence appear, listen to the pacing, then read it aloud twice. Focus on smooth phrasing and pauses.",
      steps: ["Listen once without reading.", "Read with the speaker, pausing at punctuation.", "Read again smoothly in your own voice."],
      check: { question: "What helps a reader sound smooth?", answer: "Pausing at punctuation", choices: ["Pausing at punctuation", "Reading every word as fast as possible", "Skipping long words"] },
      activityIds: ["sentence-builder", "pronunciation-practice"]
    },
    {
      id: "module-addition",
      title: "Addition Facts Module",
      category: "Module",
      area: "Mathematics",
      level: "Easy",
      icon: "fa-calculator",
      summary: "Practice counting on, making ten, and adding small numbers.",
      content: "Start from the bigger number, count on the smaller number, and check using a ten-frame or quick drawing.",
      steps: ["Find the bigger addend.", "Count on the smaller addend.", "Check your total with a drawing or ten-frame."],
      check: { question: "What is 7 + 5?", answer: "12", choices: ["10", "11", "12"] },
      activityIds: ["math-ninja"]
    },
    {
      id: "av-word-problems",
      title: "Word Problem Walkthrough",
      category: "Audio-Visual",
      area: "Mathematics",
      level: "Intermediate",
      icon: "fa-circle-play",
      summary: "Animated steps for identifying numbers, keywords, and operations.",
      content: "First underline numbers. Next circle the question. Then decide: are groups joining, or is something being taken away?",
      steps: ["Underline the numbers in the story.", "Circle what the question asks.", "Choose addition for joining or subtraction for taking away."],
      check: { question: "Mia has 4 shells and finds 3 more. Which operation helps?", answer: "Addition", choices: ["Addition", "Subtraction", "Multiplication"] },
      activityIds: ["word-bakery"]
    },
    {
      id: "worksheet-read-solve",
      title: "Read-and-Solve Worksheet",
      category: "Other Material",
      area: "Reading and Math",
      level: "Average",
      icon: "fa-file-lines",
      summary: "Short passages with simple computation questions.",
      content: "Read the short story, answer one comprehension question, then solve the number problem from the story.",
      steps: ["Read the whole story once.", "Find the detail that answers the reading question.", "Use the story numbers to solve the math question."],
      check: { question: "What should you do before solving the number problem?", answer: "Read the whole story", choices: ["Guess the answer", "Read the whole story", "Skip the question"] },
      activityIds: ["comprehension-trail", "word-bakery"]
    },
    {
      id: "challenge-set",
      title: "Advanced Challenge Set",
      category: "Other Material",
      area: "Reading and Math",
      level: "Advanced",
      icon: "fa-medal",
      summary: "Longer comprehension prompts and two-digit mental math.",
      content: "Use evidence from the passage and solve multi-step number problems. Explain your answer in one sentence.",
      steps: ["Break a multi-step question into smaller parts.", "Show the evidence or calculation for each part.", "Explain how you know your answer is correct."],
      check: { question: "What makes an answer strong?", answer: "Evidence and an explanation", choices: ["A quick guess", "Evidence and an explanation", "Only the final number"] },
      activityIds: ["comprehension-trail", "place-value-builder"]
    }
  ];

  let student = null;
  let uploadedMaterials = [];
  let apiProfile = null;
  let activeActivityCategory = "reading";
  let activeMaterialCategory = "reading";
  const $ = (selector) => document.querySelector(selector);

  function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = String(value || "");
    return node.innerHTML;
  }

  function pct(value) {
    return Math.max(0, Math.min(100, Math.round(value || 0)));
  }

  function profilePhotoKey(studentId) {
    return `numeread_profile_photo_${studentId}`;
  }

  function renderProfilePhoto() {
    const avatar = $("#studentAvatar");
    const fallback = $("#studentAvatarFallback");
    const photo = student?.id ? localStorage.getItem(profilePhotoKey(student.id)) : "";
    if (!avatar || !fallback) return;
    if (photo) {
      avatar.src = photo;
      avatar.classList.remove("hidden");
      fallback.classList.add("hidden");
    } else {
      avatar.removeAttribute("src");
      avatar.classList.add("hidden");
      fallback.classList.remove("hidden");
    }
  }

  function learningLevel(score) {
    if (score >= 75) return "Independent";
    if (score >= 50) return "Instructional";
    return "Frustration";
  }

  function recommendationFor(currentStudent) {
    if (currentStudent.assignedPath) return `Your teacher assigned this next path: ${currentStudent.assignedPath}`;
    if (window.NumeReadAdaptiveModel) return window.NumeReadAdaptiveModel.recommend(currentStudent).message;
    if (!currentStudent.pretest) return "Take the pre-test to unlock your adaptive path.";
    const lowestMath = Object.entries(currentStudent.mastery).sort((a, b) => a[1] - b[1])[0]?.[0] || "Word problems";
    if (currentStudent.reading < currentStudent.math) return `Recommended: ${activities.find((item) => item.skill === "Blends").title} for reading fluency.`;
    return `Recommended: ${lowestMath} practice through ${activities.find((item) => item.skill === lowestMath)?.title || "Read & Solve"}.`;
  }

  function renderDashboard() {
    // Fix: Use student.name or student.fullName, fallback to "Student"
    const displayName = student.name || student.fullName || student.firstName || 'Student';
    $("#studentDisplay").textContent = displayName;
    renderProfilePhoto();
    $("#studentNameHero").textContent = displayName;
    
    // Firebase status removed - no longer displayed
    
    $("#xpValue").textContent = student.xp || 0;
    $("#streakValue").textContent = student.streak ? `${student.streak} days` : '0 days';
    $("#badgeValue").textContent = (student.badges || []).length || 0;

    $("#readingLevel").textContent = learningLevel(student.reading || 0);
    $("#readingBar").style.width = `${pct(student.reading)}%`;
    $("#readingScore").textContent = `${pct(student.reading)}% mastery`;
    $("#mathLevel").textContent = learningLevel(student.math || 0);
    $("#mathBar").style.width = `${pct(student.math)}%`;
    $("#mathScore").textContent = `${pct(student.math)}% number sense`;
    $("#gapText").textContent = (student.gaps || []).length ? (student.gaps || []).join(", ") : "No major gaps yet";
    $("#aiRecommendation").textContent = modelRecommendationText();
    renderActivities();
    renderMaterials();
    renderProgress();
    renderPretestVisibility();
    renderFinalTestStatus();
  }

  function renderActivities() {
    const orderedActivities = [...activities].sort((a, b) => activityPriority(b) - activityPriority(a));
    const categories = [
      { id: "reading", label: "Reading", icon: "fa-book-open", description: "Build vocabulary, fluency, and comprehension." },
      { id: "mathematics", label: "Mathematics", icon: "fa-calculator", description: "Strengthen number sense and problem-solving." },
      { id: "combined", label: "Reading & Mathematics", icon: "fa-puzzle-piece", description: "Use reading and number skills together." }
    ];
    const categoryFor = (activity) => activity.type === "Math" ? "mathematics" : activity.type === "Combo" ? "combined" : "reading";
    const activityCard = (activity, categoryLabel) => {
      const done = (student.activities || []).includes(activity.id);
      const learningState = student.learningProgress?.[activity.id] || {};
      const nextSet = Number(learningState.contentSet || 0) + 1;
      const stage = learningState.difficulty || (activity.type === "Math" ? window.NumeReadAdaptiveModel?.difficulty(student.math || 0, Boolean(student.pretest)) : window.NumeReadAdaptiveModel?.difficulty(student.reading || 0, Boolean(student.pretest))) || "easy";
      const params = new URLSearchParams({ studentName: student.name || 'Student', grade: student.grade || 'Grade 2' });
      const teacherAssigned = assignedActivityTitles().includes(activity.title);
      const recommended = activityPriority(activity) > 0;
      return `
        <article class="bg-white rounded-2xl shadow p-5 card-hover flex flex-col">
          <div class="flex items-start justify-between gap-3">
            <i class="fas ${activity.icon} text-2xl ${activity.type === "Math" ? "text-teal-500" : "text-orange-500"}"></i>
            <span class="${teacherAssigned ? "bg-teal-100 text-teal-700" : recommended ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"} text-xs px-2 py-1 rounded-full">${teacherAssigned ? "Teacher assigned" : recommended ? "Recommended" : categoryLabel}</span>
          </div>
          <h3 class="font-bold mt-3">${activity.title}</h3>
          <p class="text-sm text-gray-500 mt-1">${activity.prompt}</p>
          <div class="flex justify-between mt-3 text-xs text-gray-600">
            <span><i class="fas fa-star text-yellow-400"></i> +${activity.xp} XP</span>
            <span>${activity.skill} · ${stage}</span>
          </div>
          <a href="${activity.url}?${params.toString()}" class="text-center mt-4 ${done ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-orange-500 hover:text-white"} w-full py-2 rounded-xl transition">
            ${done ? `Start new set ${nextSet}` : "Start adaptive set 1"}
          </a>
        </article>
      `;
    };
    const selectedCategory = categories.find((category) => category.id === activeActivityCategory) || categories[0];
    const categoryActivities = orderedActivities.filter((activity) => categoryFor(activity) === selectedCategory.id);
    $("#activityGrid").innerHTML = `
      <div class="learning-category-tabs" role="tablist" aria-label="Activity categories">
        ${categories.map((category) => `<button type="button" class="learning-category-tab learning-category-tab--${category.id} ${category.id === selectedCategory.id ? "is-active" : ""}" data-activity-category="${category.id}" role="tab" aria-selected="${category.id === selectedCategory.id}"><i class="fas ${category.icon}"></i><span>${category.label}</span></button>`).join("")}
      </div>
      <section class="learning-category learning-category--${selectedCategory.id}" aria-labelledby="activity-category-${selectedCategory.id}">
        <div class="learning-category__heading">
          <span class="learning-category__icon"><i class="fas ${selectedCategory.icon}"></i></span>
          <div><h3 id="activity-category-${selectedCategory.id}">${selectedCategory.label}</h3><p>${selectedCategory.description}</p></div>
          <span class="learning-category__count">${categoryActivities.length} activities</span>
        </div>
        <div class="learning-category__grid">${categoryActivities.map((activity) => activityCard(activity, selectedCategory.label)).join("")}</div>
      </section>
    `;
  }

  function activityPriority(activity) {
    const gaps = (student.gaps || []).join(" ").toLowerCase();
    const skill = activity.skill.toLowerCase();
    let priority = 0;
    if (assignedActivityTitles().includes(activity.title)) priority += 100;
    if (gaps.includes(skill.toLowerCase())) priority += 5;
    if ((student.reading || 0) < (student.math || 0) && activity.type !== "Math") priority += 3;
    if ((student.math || 0) < (student.reading || 0) && activity.type === "Math") priority += 3;
    if ((student.reading || 0) < 75 && ["Blends", "Reading fluency", "Pronunciation", "Vocabulary", "Comprehension"].includes(activity.skill)) priority += 1;
    if ((student.math || 0) < 75 && ["Addition facts", "Subtraction", "Word problems", "Place value"].includes(activity.skill)) priority += 1;
    if ((student.activities || []).includes(activity.id)) priority -= 10;
    return priority;
  }

  function renderMaterials() {
    const plan = window.NumeReadAdaptiveModel ? window.NumeReadAdaptiveModel.recommend(student) : null;
    const suggestedTitles = plan ? plan.materials : [];
    const sortedMaterials = getAllMaterials().sort((a, b) => {
      const aAssigned = a.title === assignedModuleTitle();
      const bAssigned = b.title === assignedModuleTitle();
      const aSuggested = suggestedTitles.some((title) => a.title.includes(title) || title.includes(a.title));
      const bSuggested = suggestedTitles.some((title) => b.title.includes(title) || title.includes(b.title));
      return Number(bAssigned) - Number(aAssigned) || Number(bSuggested) - Number(aSuggested);
    });

    const categories = [
      { id: "reading", label: "Reading", icon: "fa-book-open", description: "Lessons and resources for literacy skills." },
      { id: "mathematics", label: "Mathematics", icon: "fa-calculator", description: "Resources for number and math skills." },
      { id: "combined", label: "Reading & Mathematics", icon: "fa-puzzle-piece", description: "Materials that connect both learning areas." }
    ];
    const categoryFor = (material) => material.area === "Mathematics" ? "mathematics" : material.area === "Reading and Math" ? "combined" : "reading";
    const materialCard = (material) => {
      const assigned = material.title === assignedModuleTitle();
      const suggested = suggestedTitles.some((title) => material.title.includes(title) || title.includes(material.title));
      const completed = (student.materialsCompleted || []).includes(material.id);
      return `
      <button data-material="${material.id}" class="text-left bg-white rounded-2xl shadow p-5 card-hover">
        <div class="flex items-start justify-between gap-3">
          <i class="fas ${material.icon} text-2xl ${material.area.includes("Math") ? "text-teal-600" : "text-orange-500"}"></i>
          <span class="text-xs ${completed ? "bg-green-100 text-green-700" : assigned ? "bg-teal-100 text-teal-700" : suggested ? "bg-orange-100 text-orange-700" : "bg-teal-50 text-teal-700"} px-2 py-1 rounded-full">${completed ? "Completed" : assigned ? "Teacher assigned" : suggested ? "Recommended" : material.category}</span>
        </div>
        <h3 class="font-bold mt-3">${material.title}</h3>
        <p class="text-xs text-gray-500 mt-1">${material.area} - ${material.level}</p>
        <p class="text-sm text-gray-500 mt-2">${escapeHtml(material.summary)}</p>
        <p class="text-xs text-teal-700 font-medium mt-3"><i class="fas fa-book-reader mr-1"></i>Open lesson & practice</p>
      </button>
    `;
    };
    const selectedCategory = categories.find((category) => category.id === activeMaterialCategory) || categories[0];
    const categoryMaterials = sortedMaterials.filter((material) => categoryFor(material) === selectedCategory.id);
    $("#materialsGrid").innerHTML = `
      <div class="learning-category-tabs" role="tablist" aria-label="Learning material categories">
        ${categories.map((category) => `<button type="button" class="learning-category-tab learning-category-tab--${category.id} ${category.id === selectedCategory.id ? "is-active" : ""}" data-material-category="${category.id}" role="tab" aria-selected="${category.id === selectedCategory.id}"><i class="fas ${category.icon}"></i><span>${category.label}</span></button>`).join("")}
      </div>
      <section class="learning-category learning-category--${selectedCategory.id}" aria-labelledby="material-category-${selectedCategory.id}">
        <div class="learning-category__heading">
          <span class="learning-category__icon"><i class="fas ${selectedCategory.icon}"></i></span>
          <div><h3 id="material-category-${selectedCategory.id}">${selectedCategory.label}</h3><p>${selectedCategory.description}</p></div>
          <span class="learning-category__count">${categoryMaterials.length} materials</span>
        </div>
        <div class="learning-category__grid">${categoryMaterials.map(materialCard).join("")}</div>
      </section>
    `;
  }

  function getAllMaterials() {
    const studentSection = String(student?.section || student?.gradeSection || "").toLowerCase();
    const visibleUploads = uploadedMaterials.filter((material) => {
      const materialSection = String(material.section || "All Sections").toLowerCase();
      return materialSection === "all sections" || !materialSection || materialSection === studentSection;
    });
    return [...learningMaterials, ...visibleUploads.map((material) => ({
      id: material.id,
      title: material.title || "Teacher Material",
      category: material.category || "Teacher Upload",
      area: material.area || "Reading and Math",
      level: material.level || "Average",
      icon: (material.fileType || "").includes("audio") ? "fa-volume-high" : (material.fileType || "").includes("video") ? "fa-video" : "fa-file-lines",
      summary: `${material.summary || "Teacher-uploaded file"}${material.section && material.section !== "All Sections" ? ` - ${material.section}` : ""}`,
      content: material.content || "Open the attached file from your teacher.",
      fileName: material.fileName || "",
      fileType: material.fileType || "",
      fileUrl: material.fileUrl || "",
      fileData: material.fileData || "",
      sourceUrl: material.sourceUrl || "",
      steps: Array.isArray(material.steps) ? material.steps : [],
      check: material.check || null,
      activityIds: Array.isArray(material.activityIds) ? material.activityIds : []
    }))];
  }

  function assignedModuleTitle() {
    return String(student.assignedPath || "").match(/Module: ([^|]+)/)?.[1]?.trim() || "";
  }

  function assignedActivityTitles() {
    const value = String(student.assignedPath || "").match(/Activities: (.+)$/)?.[1] || "";
    return value.split(",").map((title) => title.trim()).filter(Boolean);
  }

  function modelRecommendationText() {
    if (student.assignedPath) return `Your teacher assigned this next path: ${student.assignedPath}`;
    const result = apiProfile?.result;
    if (result?.message) return `${result.message} (${apiProfile.source === "api" ? "API model" : "local model"})`;
    if (result?.recommendation) return `${result.recommendation} (${apiProfile.source === "api" ? "API model" : "local model"})`;
    if (result?.recommended_path) return `${result.recommended_path} (${apiProfile.source === "api" ? "API model" : "local model"})`;
    return recommendationFor(student);
  }

  function renderProgress() {
    const wpm = student.wpm || [0, 0, 0, 0];
    const maxWpm = Math.max(...wpm, 70);
    $("#wpmBars").innerHTML = wpm.map((value, index) => `
      <div class="flex-1 text-center text-xs text-gray-600">
        <div class="${index === wpm.length - 1 ? "bg-amber-400" : "bg-orange-400"} rounded-t-lg text-white flex items-end justify-center pb-1" style="height:${Math.max(28, (value / maxWpm) * 112)}px">${value}</div>
        <span>W${index + 1}</span>
      </div>
    `).join("");

    const mastery = student.mastery || {};
    $("#masteryList").innerHTML = Object.entries(mastery).map(([name, value]) => `
      <div>
        <div class="flex justify-between text-sm"><span>${name}</span><span>${pct(value)}%</span></div>
        <div class="w-full bg-gray-200 rounded-full h-2"><div class="${value < 45 ? "bg-orange-400" : "bg-teal-500"} h-2 rounded-full" style="width:${pct(value)}%"></div></div>
      </div>
    `).join("");
    $("#feedbackText").textContent = recommendationFor(student);
  }

  async function completeActivity(activityId) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity || (student.activities || []).includes(activityId)) return;
    student.activities = student.activities || [];
    student.activities.push(activityId);
    student.xp = (student.xp || 0) + activity.xp;
    student.streak = Math.max(1, student.streak || 1);
    if ((student.xp || 0) >= 100 && !(student.badges || []).includes("XP Explorer")) {
      student.badges = student.badges || [];
      student.badges.push("XP Explorer");
    }
    if (activity.skill === "Blends") student.reading = pct((student.reading || 0) + 6);
    if (student.mastery && student.mastery[activity.skill] !== undefined) {
      student.mastery[activity.skill] = pct(student.mastery[activity.skill] + 8);
    }
    if (activity.skill === "Reading fluency") {
      student.wpm = student.wpm || [0, 0, 0, 0];
      student.wpm[student.wpm.length - 1] += 4;
    }
    student = await window.NumeReadData.saveStudent(student);
    renderDashboard();
  }

  async function submitPretest(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let readingCorrect = 0;
    let mathCorrect = 0;
    displayedPretestQuestions.forEach((item, index) => {
      if (formData.get(`q${index}`) === item.answer) {
        if (item.area === "reading") readingCorrect += 1;
        else mathCorrect += 1;
      }
    });
    student.reading = pct((readingCorrect / 10) * 100);
    student.math = pct((mathCorrect / 10) * 100);
    student.pretest = { readingCorrect, mathCorrect, takenAt: new Date().toISOString() };
    student.gaps = student.gaps || [];
    if (student.reading < 75) student.gaps.push("Blends", "Reading fluency");
    if (student.math < 75) student.gaps.push("Word problems", "Addition facts");
    student.xp = (student.xp || 0) + 40;
    if (!(student.badges || []).includes("Pre-test Pioneer")) {
      student.badges = student.badges || [];
      student.badges.push("Pre-test Pioneer");
    }
    student = await window.NumeReadData.saveStudent(student);
    await window.NumeReadData.savePretestResult(student, student.pretest);
    $("#pretestResult").textContent = `Reading ${student.reading}%, Math ${student.math}%. Your adaptive path is ready.`;
    renderDashboard();
    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
  }

  function openMaterial(activityId) {
    const material = getAllMaterials().find((item) => item.id === activityId);
    if (!material) return;
    $("#modalTitle").textContent = material.title;
    const completed = (student.materialsCompleted || []).includes(material.id);
    const steps = Array.isArray(material.steps) && material.steps.length
      ? `<ol class="mt-4 space-y-2 list-decimal list-inside">${material.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
      : "";
    const check = material.check?.question ? `
      <div class="mt-5 rounded-xl bg-orange-50 p-4">
        <p class="font-semibold text-gray-800"><i class="fas fa-lightbulb text-orange-500 mr-1"></i>Quick check: ${escapeHtml(material.check.question)}</p>
        <div class="mt-3 flex flex-wrap gap-2">${(material.check.choices || []).map((choice) => `<button type="button" data-material-check="${escapeHtml(material.id)}" data-answer="${escapeHtml(material.check.answer)}" data-choice="${escapeHtml(choice)}" class="border border-orange-200 bg-white hover:bg-orange-100 rounded-full px-3 py-1 text-sm">${escapeHtml(choice)}</button>`).join("")}</div>
        <p data-check-feedback class="mt-2 text-sm font-medium" aria-live="polite"></p>
      </div>` : "";
    const linkedGames = (material.activityIds || []).map((id) => activities.find((activity) => activity.id === id)).filter(Boolean);
    const practice = linkedGames.length ? `<div class="mt-5"><p class="font-semibold text-gray-800">Practice this lesson</p><div class="mt-2 flex flex-wrap gap-2">${linkedGames.map((game) => `<a href="${game.url}?${new URLSearchParams({ studentName: student.name || "Student", grade: student.grade || "Grade 2" }).toString()}" class="bg-teal-600 text-white px-3 py-2 rounded-full text-sm"><i class="fas fa-gamepad mr-1"></i>${escapeHtml(game.title)}</a>`).join("")}</div></div>` : "";
    const mediaUrl = material.fileUrl || material.fileData || "";
    const fileType = String(material.fileType || "").toLowerCase();
    const safeMediaUrl = escapeHtml(mediaUrl);
    const inlineMedia = fileType.startsWith("video/") && mediaUrl
      ? `<section class="mt-5 rounded-xl overflow-hidden bg-slate-950"><video class="w-full max-h-[55vh]" controls playsinline preload="metadata"><source src="${safeMediaUrl}" type="${escapeHtml(fileType)}">Your browser cannot play this video.</video></section>`
      : fileType.startsWith("audio/") && mediaUrl
        ? `<section class="mt-5 rounded-xl bg-teal-50 p-4"><p class="font-semibold text-gray-800 mb-3"><i class="fas fa-headphones text-teal-600 mr-1"></i>Listen to this lesson</p><audio class="w-full" controls preload="metadata"><source src="${safeMediaUrl}" type="${escapeHtml(fileType)}">Your browser cannot play this audio.</audio></section>`
        : fileType === "application/pdf" && mediaUrl
          ? `<section class="mt-5"><iframe title="${escapeHtml(material.title)}" src="${safeMediaUrl}" class="w-full h-[55vh] rounded-xl border" loading="lazy">Your browser cannot display this PDF.</iframe></section>`
          : "";
    $("#modalBody").innerHTML = `
      <p class="text-sm text-gray-500">${material.category} - ${material.area} - ${material.level}</p>
      ${inlineMedia}
      <div class="mt-4 rounded-xl bg-slate-50 p-4 leading-relaxed whitespace-pre-wrap">${escapeHtml(material.content)}</div>
      ${steps}
      ${check}
      ${practice}
      ${material.sourceUrl ? `<a href="${escapeHtml(material.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 border border-teal-600 text-teal-700 px-4 py-2 rounded-full"><i class="fas fa-circle-play mr-1"></i>Watch / open online material</a>` : ""}
      ${mediaUrl && !inlineMedia ? `<a href="${safeMediaUrl}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 border border-teal-600 text-teal-700 px-4 py-2 rounded-full"><i class="fas fa-up-right-from-square mr-1"></i>Open learning material</a>` : ""}
      <button data-complete-material="${material.id}" class="mt-5 ${completed ? "bg-green-100 text-green-700" : "bg-orange-500 text-white"} px-4 py-2 rounded-full">${completed ? "Material Completed" : "Mark as Completed"}</button>
    `;
    $("#materialModal").classList.remove("hidden");
  }

  function answerMaterialCheck(button) {
    const feedback = $("[data-check-feedback]");
    if (!feedback) return;
    const correct = button.dataset.choice === button.dataset.answer;
    feedback.textContent = correct ? "Correct — you are ready to practise!" : "Try again. Review the lesson steps above.";
    feedback.className = `mt-2 text-sm font-medium ${correct ? "text-green-700" : "text-orange-700"}`;
  }

  async function completeMaterial(materialId) {
    if (!student.materialsCompleted) student.materialsCompleted = [];
    if (!student.materialsCompleted.includes(materialId)) {
      student.materialsCompleted.push(materialId);
      student.xp = (student.xp || 0) + 10;
      student = await window.NumeReadData.saveStudent(student);
    }
    $("#materialModal").classList.add("hidden");
    renderDashboard();
  }

  function allGamesDone() {
    return activities.every((activity) => (student.activities || []).includes(activity.id));
  }

  function allMaterialsDone() {
    return getAllMaterials().every((material) => (student.materialsCompleted || []).includes(material.id));
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
    if (pretestLink) pretestLink.classList.toggle("hidden", taken);
    if (startButton) startButton.classList.toggle("hidden", taken);
    ["home", "dashboard", "learning", "materials", "final-test", "progress"].forEach((id) => {
      const section = document.getElementById(id);
      const link = document.querySelector(`[href="#${id}"]`);
      if (section) section.classList.toggle("hidden", !taken);
      if (link) link.classList.toggle("hidden", !taken);
    });
  }

  function renderFinalTestStatus() {
    const status = $("#finalTestStatus");
    const launchButton = $("#launchFinalTest");
    if (!status || !launchButton) return;
    const gamesDone = activities.filter((activity) => (student.activities || []).includes(activity.id)).length;
    const allMaterials = getAllMaterials();
    const materialsDone = allMaterials.filter((material) => (student.materialsCompleted || []).includes(material.id)).length;
    const unlocked = finalTestUnlocked();
    status.textContent = unlocked
      ? "Final test unlocked. You completed all games and learning materials."
      : `Complete all requirements to unlock: ${gamesDone}/${activities.length} games and ${materialsDone}/${allMaterials.length} materials done.`;
    launchButton.classList.toggle("hidden", !unlocked || Boolean(student.posttest));
    const posttestDone = $("#posttestDone");
    if (posttestDone) posttestDone.classList.toggle("hidden", !student.posttest);
    if (student.posttest && posttestDone) {
      posttestDone.textContent = `Final test completed: Reading ${student.posttest.readingScore || 0}%, Math ${student.posttest.mathScore || 0}%.`;
    }
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
    student.reading = Math.max(student.reading || 0, student.posttest.readingScore);
    student.math = Math.max(student.math || 0, student.posttest.mathScore);
    if (!(student.badges || []).includes("Completion Champion")) {
      student.badges = student.badges || [];
      student.badges.push("Completion Champion");
    }
    student.xp = (student.xp || 0) + 60;
    student = await window.NumeReadData.saveStudent(student);
    $("#posttestForm").classList.add("hidden");
    $("#posttestResult").textContent = `Final test submitted. Reading ${student.posttest.readingScore}%, Math ${student.posttest.mathScore}%.`;
    renderDashboard();
  }

  function renderPretest() {
    displayedPretestQuestions = shuffle(pretestQuestions).map((item) => ({
      ...item,
      options: shuffle(item.options)
    }));
    $("#pretestQuestions").innerHTML = displayedPretestQuestions.map((item, index) => `
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
    let stored;
    try {
      stored = JSON.parse(sessionStorage.getItem('numeread_student') || 'null');
    } catch (error) {
      stored = null;
    }
    if (!stored?.name || !stored?.section || !stored?.studentId) {
      window.location.replace('index.html');
      return;
    }
    student = await window.NumeReadData.authenticateStudent(stored.name, stored.section, stored.studentId);
    if (!student || student.id !== stored.id) {
      sessionStorage.removeItem('numeread_student');
      window.location.replace('index.html');
      return;
    }
    uploadedMaterials = await window.NumeReadData.getLearningMaterials?.() || [];
    apiProfile = await window.NumeReadAPI?.analyzeStudent(student);
    renderPretest();
    renderPosttest();
    renderDashboard();
    if (!student.pretest) {
      setTimeout(() => document.querySelector("#pretest")?.scrollIntoView({ behavior: "smooth" }), 250);
    }

    // Mobile nav toggle
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        this.setAttribute('aria-expanded', isOpen);
        const icon = this.querySelector('i');
        if (icon) {
          icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-container') && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          const icon = navToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        }
      });
      
      // Close menu on link click (mobile)
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          const icon = navToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        });
      });
    }

    document.addEventListener("click", (event) => {
      const dashboardBackground = document.querySelector(".dashboard-background");
      const dashboardShape = event.target.closest(".dashboard-background__shape");
      if (dashboardShape) {
        const expanded = dashboardShape.classList.toggle("is-expanded");
        dashboardShape.style.setProperty("--route-scale", expanded ? "1.7" : "1");
        return;
      }
      if (dashboardBackground) {
        dashboardBackground.querySelectorAll(".dashboard-background__marker").forEach((marker) => {
          const box = marker.getBoundingClientRect();
          const shiftX = Math.max(-32, Math.min(32, (box.left + box.width / 2 - event.clientX) * 0.09));
          const shiftY = Math.max(-28, Math.min(28, (box.top + box.height / 2 - event.clientY) * 0.08));
          marker.style.setProperty("--route-x", `${shiftX}px`);
          marker.style.setProperty("--route-y", `${shiftY}px`);
        });
      }
      const activityCategoryButton = event.target.closest("[data-activity-category]");
      if (activityCategoryButton) {
        activeActivityCategory = activityCategoryButton.dataset.activityCategory;
        renderActivities();
        return;
      }
      const materialCategoryButton = event.target.closest("[data-material-category]");
      if (materialCategoryButton) {
        activeMaterialCategory = materialCategoryButton.dataset.materialCategory;
        renderMaterials();
        return;
      }
      const materialButton = event.target.closest("[data-material]");
      if (materialButton) openMaterial(materialButton.dataset.material);
      const materialCheckButton = event.target.closest("[data-material-check]");
      if (materialCheckButton) answerMaterialCheck(materialCheckButton);
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
