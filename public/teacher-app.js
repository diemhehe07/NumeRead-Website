(function () {
  const $ = (selector) => document.querySelector(selector);
  // File data is stored in a Firestore document, where base64 encoding adds
  // roughly one third to the original size. This keeps uploads below 1 MiB.
  const MAX_RESOURCE_FILE_SIZE = 700 * 1024;
  const materialCatalog = [
    {
      id: "module-blends", title: "Blends and Phonics Module", area: "Reading", level: "Easy", icon: "fa-book-open", skill: "Blends",
      summary: "Step-by-step practice for beginning blends such as bl, br, cl, and tr.",
      content: "Read each blend, say the sound, then use it in a short word: bl - blue, br - brush, cl - clap, tr - train.",
      steps: ["Listen for both beginning sounds.", "Slide the sounds together without pausing.", "Read the whole word and use it in a sentence."],
      check: { question: "Which word starts with bl?", answer: "blue", choices: ["blue", "sun", "cat"] }
    },
    {
      id: "av-fluency", title: "Reading Fluency Audio-Visual", area: "Reading", level: "Average", icon: "fa-video", skill: "Reading fluency",
      summary: "Listen, repeat, and read short sentences with expression.",
      content: "Watch the sentence appear, listen to the pacing, then read it aloud twice. Focus on smooth phrasing and pauses.",
      steps: ["Listen once without reading.", "Read with the speaker, pausing at punctuation.", "Read again smoothly in your own voice."],
      check: { question: "What helps a reader sound smooth?", answer: "Pausing at punctuation", choices: ["Pausing at punctuation", "Reading every word as fast as possible", "Skipping long words"] }
    },
    {
      id: "module-addition", title: "Addition Facts Module", area: "Math", level: "Easy", icon: "fa-calculator", skill: "Addition facts",
      summary: "Practice counting on, making ten, and adding small numbers.",
      content: "Start from the bigger number, count on the smaller number, and check using a ten-frame or quick drawing.",
      steps: ["Find the bigger addend.", "Count on the smaller addend.", "Check your total with a drawing or ten-frame."],
      check: { question: "What is 7 + 5?", answer: "12", choices: ["10", "11", "12"] }
    },
    {
      id: "av-word-problems", title: "Word Problem Walkthrough", area: "Math", level: "Intermediate", icon: "fa-circle-play", skill: "Word problems",
      summary: "Animated steps for identifying numbers, keywords, and operations.",
      content: "First underline numbers. Next circle the question. Then decide: are groups joining, or is something being taken away?",
      steps: ["Underline the numbers in the story.", "Circle what the question asks.", "Choose addition for joining or subtraction for taking away."],
      check: { question: "Mia has 4 shells and finds 3 more. Which operation helps?", answer: "Addition", choices: ["Addition", "Subtraction", "Multiplication"] }
    },
    {
      id: "worksheet-read-solve", title: "Read-and-Solve Worksheet", area: "Reading and Math", level: "Average", icon: "fa-file-lines", skill: "Comprehension, Word problems",
      summary: "Short passages with simple computation questions.",
      content: "Read the short story, answer one comprehension question, then solve the number problem from the story.",
      steps: ["Read the whole story once.", "Find the detail that answers the reading question.", "Use the story numbers to solve the math question."],
      check: { question: "What should you do before solving the number problem?", answer: "Read the whole story", choices: ["Guess the answer", "Read the whole story", "Skip the question"] }
    },
    {
      id: "challenge-set", title: "Advanced Challenge Set", area: "Reading and Math", level: "Advanced", icon: "fa-medal", skill: "Comprehension, Place value",
      summary: "Longer comprehension prompts and two-digit mental math.",
      content: "Use evidence from the passage and solve multi-step number problems. Explain your answer in one sentence.",
      steps: ["Break a multi-step question into smaller parts.", "Show the evidence or calculation for each part.", "Explain how you know your answer is correct."],
      check: { question: "What makes an answer strong?", answer: "Evidence and an explanation", choices: ["A quick guess", "Evidence and an explanation", "Only the final number"] }
    },
    {
      id: "module-fractions", title: "Fraction Fundamentals: Slices of a Whole", area: "Math", level: "Easy", icon: "fa-pizza-slice", skill: "Fractions",
      summary: "Learn how whole shapes divide into equal parts called halves, thirds, and quarters.",
      content: "A fraction represents equal parts of a whole object or group.\n\n• Numerator (Top Number): How many equal parts you have, select, or eat.\n• Denominator (Bottom Number): The total number of equal parts that make up the whole.\n\nFor example, if a pizza is cut into 4 equal slices and you eat 1 slice, you have eaten 1/4 (one quarter) of the pizza! To be a true fraction, all parts must be equal in size.",
      steps: ["Count all the equal slices in the whole pizza (this is your denominator on the bottom).", "Count how many slices have toppings or are chosen (this is your numerator on top).", "Read the fraction aloud: 1/2 is 'one half', 1/3 is 'one third', and 1/4 is 'one quarter'."],
      check: { question: "In the fraction 3/4, what does the number 4 represent?", answer: "Total equal slices in the whole", choices: ["Total equal slices in the whole", "Slices with pepperoni", "The whole number four"] }
    },
    {
      id: "av-fraction-visuals", title: "Visual Fractions & Equivalent Slices Guide", area: "Math", level: "Average", icon: "fa-chart-pie", skill: "Fractions",
      summary: "See how 2 quarters equal 1 half and compare fraction sizes using visual models.",
      content: "Visual models help us see fractions in action!\n\nWhen you cut a pizza in half, you have 2 large slices (1/2 each). If you cut that same pizza into 4 slices, 2 of those smaller slices (2/4) cover the EXACT same amount of pizza as 1/2.\n\nThese are called EQUIVALENT FRACTIONS: 1/2 = 2/4 = 4/8.\n\nRemember: When the denominator (bottom number) is bigger, the pieces are cut smaller!",
      steps: ["Compare slice sizes: 1/2 is bigger than 1/4 because fewer cuts make bigger slices.", "Recognize equivalent amounts: 2/4 is the exact same amount of pizza as 1/2.", "When denominators match, compare numerators: 3/4 is more pizza than 1/4."],
      check: { question: "Which fraction is equivalent (equal) to 1/2?", answer: "2/4", choices: ["2/4", "1/4", "3/4"] }
    },
    {
      id: "module-subtraction", title: "Subtraction Sprint & Number Line Guide", area: "Math", level: "Easy", icon: "fa-person-running", skill: "Subtraction",
      summary: "Master backward jumps along number lines to conquer subtraction with speed.",
      content: "Subtraction means taking away from a whole or finding the distance between two numbers.\n\n• Count Back Strategy: Place your finger on the starting number and hop backward step by step.\n• Number Line Model: A backward jump of 4 from 12 lands on 8 (12 - 4 = 8).\n• Difference: The distance remaining between the two numbers.",
      steps: ["Find your starting number on the number line.", "Jump backward the number of steps being subtracted.", "The number you land on is your final difference!"],
      check: { question: "If you start at 15 and jump back 6, where do you land?", answer: "9", choices: ["8", "9", "10"] }
    },
    {
      id: "module-place-value", title: "Place Value Power & Base-10 Blocks", area: "Math", level: "Average", icon: "fa-cubes-stacked", skill: "Place value",
      summary: "Explore Hundreds Flats, Tens Rods, and Ones Cubes to understand number structures.",
      content: "Every digit has a value determined by its position in the number!\n\n• Hundreds (Flats): 1 flat = 100 unit cubes.\n• Tens (Rods): 1 rod = 10 unit cubes.\n• Ones (Cubes): 1 single unit cube = 1.\n\nFor example, 345 means: 3 hundreds (300) + 4 tens (40) + 5 ones (5) = 345!",
      steps: ["Count Hundreds flats first to get the hundreds place.", "Count Tens rods to get the tens place.", "Count individual Ones cubes to complete the full number."],
      check: { question: "What number is made of 5 tens and 8 ones?", answer: "58", choices: ["58", "85", "508"] }
    },
    {
      id: "module-vocab", title: "Vocabulary Clue Detective Guide", area: "Reading", level: "Easy", icon: "fa-magnifying-glass", skill: "Vocabulary",
      summary: "Become a word detective by finding clues in sentences to crack mystery definitions.",
      content: "When you read an unfamiliar word, don't stop! Look around the sentence for context clues.\n\n• Definition Clues: The sentence directly tells what the word means.\n• Synonym Clues: Another word with the same meaning is used nearby.\n• Example Clues: The author lists examples that explain the word.\n\nExample: 'The arid desert had no water or rain.' -> 'no water or rain' tells us arid means dry!",
      steps: ["Circle or identify the unfamiliar mystery word.", "Read the words before and after looking for clue words.", "Replace the mystery word with your guess to see if the sentence makes sense."],
      check: { question: "In 'The fragile crystal cup shattered easily', which words are the clue?", answer: "Shattered easily", choices: ["Shattered easily", "The cup", "Crystal"] }
    },
    {
      id: "module-comprehension", title: "Comprehension Clue Finder Module", area: "Reading", level: "Average", icon: "fa-compass", skill: "Comprehension",
      summary: "Discover how to locate text evidence and master passage reading.",
      content: "Good readers don't just guess—they find proof inside the story!\n\n• First Read: Read the passage smoothly to understand the big picture.\n• Question Check: Read the question and identify keywords (Who, Where, Why).\n• Text Evidence: Return to the story and find the exact sentence that answers the question.",
      steps: ["Read the whole passage once to understand the story.", "Underline keywords in the question.", "Look back at the passage and point to the sentence that proves your answer."],
      check: { question: "What is text evidence?", answer: "Proof found directly in the reading passage", choices: ["Proof found directly in the reading passage", "A random guess", "The title of the book"] }
    },
    {
      id: "module-volume", title: "Volume Lab: Building with Cubes", area: "Math", level: "Easy", icon: "fa-cube", skill: "Volume",
      summary: "A complete lesson on measuring the space inside rectangular prisms with cubic units.",
      content: "Volume is the amount of space inside a three-dimensional object, such as a box, aquarium, or storage bin. We measure it with cubic units because the space is filled with little cubes. A unit cube that is 1 cm long, 1 cm wide, and 1 cm high has a volume of 1 cubic centimeter (1 cm³).\n\nFor a rectangular prism, use V = length × width × height. First find how many cubes fit in one layer (length × width). Then count the layers (height). For a 4 cm × 3 cm × 2 cm box: one layer has 12 cubes and there are 2 layers, so 12 × 2 = 24 cm³.",
      steps: ["Write the length, width, and height with their units.", "Multiply length × width to find one layer.", "Multiply by height and label the answer in cubic units."],
      check: { question: "What is the volume of a 5 cm × 2 cm × 3 cm box?", answer: "30 cm³", choices: ["10 cm²", "30 cm³", "15 cm"] }
    },
    {
      id: "module-gemdas", title: "GEMDAS Mission: Solve in Order", area: "Math", level: "Average", icon: "fa-rocket", skill: "GEMDAS",
      summary: "A complete lesson on using GEMDAS to solve expressions accurately.",
      content: "GEMDAS is a memory guide for the order of operations: Grouping symbols, Exponents, Multiplication and Division from left to right, then Addition and Subtraction from left to right. It keeps everyone solving the same expression in the same order.\n\nStart inside parentheses or other grouping symbols. Then handle exponents when they appear. Next, complete multiplication and division in the order they occur from left to right. Finally, complete addition and subtraction from left to right.",
      steps: ["Circle grouping symbols and solve inside them first.", "Work multiplication and division left to right.", "Work addition and subtraction left to right, showing each line."],
      check: { question: "Solve: (3 + 5) × 2", answer: "16", choices: ["13", "16", "10"] }
    },
    {
      id: "module-composite-area", title: "Composite Area Studio: Split, Find, Add", area: "Math", level: "Intermediate", icon: "fa-drafting-compass", skill: "Composite area",
      summary: "A complete lesson on finding the area of L-shaped and combined rectangles.",
      content: "Composite shapes are figures made by joining simple shapes. Many floor plans, gardens, and playgrounds are composite shapes. The key is to turn a complicated-looking shape into rectangles you already know how to measure.\n\nMethod 1: split the shape into rectangles that do not overlap. Find each rectangle's area with length × width, then add the areas. Method 2: imagine the smallest whole rectangle that contains the L-shape. Find the whole rectangle's area, find the missing corner's area, and subtract.",
      steps: ["Sketch the whole shape and mark all known lengths.", "Split into non-overlapping rectangles or identify the missing corner.", "Find each area, add or subtract, and label the total in square units."],
      check: { question: "A 9 m × 6 m rectangle has a 2 m × 3 m corner removed. What is its area?", answer: "48 m²", choices: ["54 m²", "6 m²", "48 m²"] }
    }
  ];

  let cachedTeacherMaterials = [];
  let cachedCurrentTeacher = null;
  let activeModalMaterialId = "";
  let activeModalResourceIndex = 0;

  function avg(students, key) {
    if (!students.length) return 0;
    return Math.round(students.reduce((total, student) => total + Number(student[key] || 0), 0) / students.length);
  }

  function level(score) {
    if (score >= 75) return "Independent";
    if (score >= 50) return "Instructional";
    return "Frustration";
  }

  function barColor(score) {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-orange-400";
    return "bg-red-400";
  }

  const PATHS = {
    "Spelling": { module: "Vocabulary Clue Detective Guide", activities: ["Spelling Sprint"], activityIds: ["spelling-sprint"], subtopics: ["Short vowel patterns", "Long vowel patterns", "Common sight words"] },
    "Blends": { module: "Blends and Phonics Module", activities: ["Reading Bridge", "Sentence Builder"], activityIds: ["reading-bridge", "sentence-builder"], subtopics: ["Beginning blends", "Ending blends", "Three-letter blends"] },
    "Reading fluency": { module: "Reading Fluency Audio-Visual", activities: ["Sentence Builder", "Pronunciation Practice"], activityIds: ["sentence-builder", "pronunciation-practice"], subtopics: ["Word accuracy", "Phrasing and expression", "Reading rate"] },
    "Vocabulary": { module: "Vocabulary Clue Detective Guide", activities: ["Vocabulary Quest", "Comprehension Trail"], activityIds: ["vocab-quest", "comprehension-trail"], subtopics: ["Using context clues", "Synonyms and antonyms", "Word meanings"] },
    "Comprehension": { module: "Comprehension Clue Finder Module", activities: ["Comprehension Trail", "Sentence Builder"], activityIds: ["comprehension-trail", "sentence-builder"], subtopics: ["Main idea", "Supporting details", "Making inferences"] },
    "Addition facts": { module: "Addition Facts Module", activities: ["Math Ninja"], activityIds: ["math-ninja"], subtopics: ["Counting on", "Doubles facts", "Making ten", "Regrouping"] },
    "Subtraction": { module: "Subtraction Sprint & Number Line Guide", activities: ["Subtraction Sprint"], activityIds: ["subtraction-sprint"], subtopics: ["Counting back", "Subtracting across ten", "Regrouping"] },
    "Division": { module: "Equal Groups Practice", activities: ["Division Dash"], activityIds: ["division-dash"], subtopics: ["Equal groups", "Sharing equally", "Fact families"] },
    "Word problems": { module: "Word Problem Walkthrough", activities: ["Word Problem Bakery"], activityIds: ["word-bakery"], subtopics: ["Choosing addition", "Choosing subtraction", "Identifying key information"] },
    "Place value": { module: "Place Value Power & Base-10 Blocks", activities: ["Place Value Builder"], activityIds: ["place-value-builder"], subtopics: ["Tens and ones", "Hundreds, tens, and ones", "Digit value"] },
    "Fractions": { module: "Fraction Fundamentals: Slices of a Whole", activities: ["Fraction Pizza"], activityIds: ["fraction-pizza"], subtopics: ["Equal parts of a whole", "Numerator and denominator", "Equivalent fractions"] },
    "Volume": { module: "Volume Lab: Building with Cubes", activities: ["Volume Voyage"], activityIds: ["volume-voyage"], subtopics: ["Counting cubic units", "Volume of rectangular prisms", "Cubic unit labels"] },
    "GEMDAS": { module: "GEMDAS Mission: Solve in Order", activities: ["GEMDAS Galaxy"], activityIds: ["gemdas-galaxy"], subtopics: ["Grouping symbols", "Multiplication and division", "Full order of operations"] },
    "Composite area": { module: "Composite Area Studio: Split, Find, Add", activities: ["Composite Area Architect"], activityIds: ["composite-area-architect"], subtopics: ["Splitting shapes", "Adding rectangle areas", "Subtracting a missing corner"] }
  };

  const ASSESSMENT_TOPICS = Object.keys(PATHS);
  let assessmentStudent = null;

  async function openAssessment(studentId) {
    const students = await window.NumeReadData.getStudentsForCurrentTeacher();
    assessmentStudent = students.find((student) => student.id === studentId);
    if (!assessmentStudent) return;
    $("#assessmentStudentName").textContent = `${assessmentStudent.name} · Reading ${assessmentStudent.reading}% · Math ${assessmentStudent.math}%`;
    const prior = assessmentStudent.assessmentFocus || {};
    $("#assessmentChecklist").innerHTML = ASSESSMENT_TOPICS.map((topic) => {
      const checked = (assessmentStudent.gaps || []).includes(topic);
      const chosen = prior.topic === topic ? prior.subtopic : "";
      const options = PATHS[topic].subtopics.map((subtopic) => `<option value="${escapeHtml(subtopic)}" ${chosen === subtopic ? "selected" : ""}>${escapeHtml(subtopic)}</option>`).join("");
      return `<label class="border rounded-xl p-3 text-sm cursor-pointer"><span class="block"><input type="checkbox" value="${escapeHtml(topic)}" class="mr-2" ${checked ? "checked" : ""}>${escapeHtml(topic)}</span><select data-assessment-subtopic="${escapeHtml(topic)}" class="mt-2 w-full border rounded-lg px-2 py-1 text-xs" ${checked ? "" : "disabled"}><option value="">Select the specific gap</option>${options}</select></label>`;
    }).join("");
    $("#assessmentChecklist").onchange = (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      const select = document.querySelector(`[data-assessment-subtopic="${event.target.value}"]`);
      if (select) select.disabled = !event.target.checked;
    };
    $("#assessmentStatus").textContent = "";
    $("#assessmentPanel").classList.remove("hidden");
    $("#assessmentPanel").scrollIntoView({ behavior: "smooth" });
  }

  async function generateRemediation() {
    const selected = [...document.querySelectorAll("#assessmentChecklist input:checked")].map((input) => ({ topic: input.value, subtopic: document.querySelector(`[data-assessment-subtopic="${input.value}"]`)?.value || "" }));
    if (!assessmentStudent || !selected.length) { $("#assessmentStatus").textContent = "Select at least one topic first."; return; }
    const incomplete = selected.find((item) => !item.subtopic);
    if (incomplete) { $("#assessmentStatus").textContent = `Choose a specific gap for ${incomplete.topic}.`; return; }
    const generatedAt = new Date().toISOString();
    const assignments = { ...(assessmentStudent.personalizedActivities || {}) };
    selected.forEach(({ topic, subtopic }) => PATHS[topic].activityIds.forEach((activityId) => {
      assignments[activityId] = { topic, subtopic, itemSetId: `${assessmentStudent.id}-${activityId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, generatedAt, status: "assigned" };
    }));
    const focus = selected[0], path = PATHS[focus.topic];
    assessmentStudent.gaps = selected.map((item) => item.topic);
    assessmentStudent.assessmentFocus = { ...focus, assessedAt: generatedAt };
    assessmentStudent.personalizedActivities = assignments;
    assessmentStudent.assignedPath = `Focus: ${focus.topic} — ${focus.subtopic} | Module: ${path.module} | Activities: ${path.activities.join(", ")}`;
    await window.NumeReadData.saveStudent(assessmentStudent);
    $("#assessmentStatus").textContent = `Generated new ${focus.subtopic} items for ${path.activities.join(" and ")}.`;
    await render();
  }

  function focusFor(student) {
    const knownSkills = Object.keys(PATHS);
    const gaps = (student.gaps || []).map((gap) => String(gap).toLowerCase());
    const gapMatch = knownSkills.find((skill) => gaps.some((gap) => gap.includes(skill.toLowerCase())));
    if (gapMatch) return gapMatch;
    const mastery = Object.entries(student.mastery || {}).filter(([skill]) => PATHS[skill]);
    if (mastery.length) return mastery.sort(([, left], [, right]) => Number(left) - Number(right))[0][0];
    return Number(student.reading || 0) <= Number(student.math || 0) ? "Reading fluency" : "Addition facts";
  }

  function planFor(student) {
    const focus = focusFor(student);
    const path = PATHS[focus];
    return {
      focus,
      module: path.module,
      activities: path.activities,
      summary: `Focus: ${focus} | Module: ${path.module} | Activities: ${path.activities.join(", ")}`
    };
  }

  async function savePlan(student) {
    const plan = planFor(student);
    student.assignedPath = plan.summary;
    student.updatedAt = new Date().toISOString();
    await window.NumeReadData.saveStudent(student);
    await window.NumeReadData.saveTeacherAction({
      type: "assign-personalized-path",
      studentId: student.id,
      studentName: student.name,
      assignedPath: plan.summary
    });
    return plan;
  }

  async function assignPath(studentId) {
    const students = await window.NumeReadData.getStudentsForCurrentTeacher();
    const student = students.find((item) => item.id === studentId);
    if (!student) return;
    const plan = await savePlan(student);
    $("#assignmentMessage").textContent = `${student.name} was assigned ${plan.module} and ${plan.activities.join(", ")} for ${plan.focus}.`;
    await render();
  }

  function renderClassRecommendation(students) {
    const needingSupport = students.filter((student) => Number(student.reading || 0) < 75 || Number(student.math || 0) < 75 || (student.gaps || []).length);
    const counts = needingSupport.reduce((result, student) => {
      const focus = focusFor(student);
      result[focus] = (result[focus] || 0) + 1;
      return result;
    }, {});
    const groups = Object.entries(counts).sort(([, left], [, right]) => right - left).slice(0, 3);
    $("#classGroups").innerHTML = groups.length
      ? groups.map(([focus, count], index) => `<span class="bg-white px-3 py-1 rounded-full text-xs shadow-sm">Group ${index + 1}: ${escapeHtml(focus)} (${count} learner${count === 1 ? "" : "s"})</span>`).join("")
      : '<span class="bg-white px-3 py-1 rounded-full text-xs shadow-sm">No intervention group is needed right now.</span>';
  }

  async function assignClassPaths() {
    const students = await window.NumeReadData.getStudentsForCurrentTeacher();
    const needingSupport = students.filter((student) => Number(student.reading || 0) < 75 || Number(student.math || 0) < 75 || (student.gaps || []).length);
    if (!needingSupport.length) {
      $("#classMessage").textContent = "Everyone is currently on track. No class paths were assigned.";
      return;
    }
    const button = document.querySelector("[data-class-path]");
    button.disabled = true;
    button.textContent = "Assigning personalized paths…";
    try {
      await Promise.all(needingSupport.map(savePlan));
      $("#classMessage").textContent = `${needingSupport.length} learner${needingSupport.length === 1 ? "" : "s"} received a personalized module and activity path.`;
      await render();
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-paper-plane"></i> Assign Personalized Class Paths';
    }
  }

  function renderStudents(students) {
    const readingAvg = avg(students, "reading");
    const mathAvg = avg(students, "math");
    const struggling = students.filter((student) => student.reading < 50 || student.math < 50);

    $("#firebaseStatus").textContent = window.NumeReadData.usingFirebase() ? "Connected" : "Browser storage";
    $("#totalStudents").textContent = students.length;
    $("#avgReading").textContent = `${readingAvg}%`;
    $("#avgReadingBar").style.width = `${readingAvg}%`;
    $("#avgMath").textContent = `${mathAvg}%`;
    $("#avgMathBar").style.width = `${mathAvg}%`;
    $("#strugglingCount").textContent = struggling.length;

    $("#strugglingList").innerHTML = struggling.length ? struggling.map((student) => `
      <li class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-3">
        <span class="font-medium text-gray-800"><i class="fas fa-user-circle text-orange-400 mr-1.5"></i>${escapeHtml(student.name)}</span>
        <span class="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">${escapeHtml(student.gaps.join(", ") || "Needs support")}</span>
        <button type="button" data-assess="${escapeHtml(student.id)}" class="btn-assess-struggling" title="Assess skill gaps for ${escapeHtml(student.name)}">
          <i class="fas fa-clipboard-user"></i>
          <span>Assess</span>
          <i class="fas fa-angle-right"></i>
        </button>
      </li>
    `).join("") : `<li class="text-sm text-gray-500 py-2">No learners below 50% right now.</li>`;

    $("#studentRows").innerHTML = students.map((student) => `
      <tr>
        <td class="px-5 py-3 font-medium">${escapeHtml(student.name)}</td>
        <td class="px-5 py-3 text-sm font-mono">${escapeHtml(student.studentId || "—")}</td>
        <td class="px-5 py-3">
          <div class="flex items-center gap-2">
            <span class="text-xs">${level(student.reading)}</span>
            <div class="w-24 bg-gray-200 rounded-full h-1.5"><div class="${barColor(student.reading)} h-1.5 rounded-full" style="width:${student.reading}%"></div></div>
            <span class="text-xs text-gray-500">${student.reading}%</span>
          </div>
        </td>
        <td class="px-5 py-3">${student.math}%</td>
        <td class="px-5 py-3 text-sm">${escapeHtml(student.gaps.join(", ") || "On track")}</td>
        <td class="px-5 py-3 text-sm">${escapeHtml(student.assignedPath || "Adaptive path pending")}</td>
        <td class="px-5 py-3">
          <button type="button" data-assess="${escapeHtml(student.id)}" class="btn-assess-table" title="Assess learning gaps for ${escapeHtml(student.name)}">
            <i class="fas fa-clipboard-check"></i>
            <span>Assess</span>
            <i class="fas fa-angle-right"></i>
          </button>
        </td>
      </tr>
    `).join("");
    renderClassRecommendation(students);
  }

  const ACTIVITY_LABELS = {
    "reading-bridge": "Reading Bridge", "math-ninja": "Math Ninja", "word-bakery": "Word Problem Bakery",
    "sentence-builder": "Sentence Builder", "pronunciation-practice": "Pronunciation Practice", "vocab-quest": "Vocabulary Quest",
    "spelling-sprint": "Spelling Sprint", "comprehension-trail": "Comprehension Trail", "subtraction-sprint": "Subtraction Sprint",
    "division-dash": "Division Dash", "place-value-builder": "Place Value Builder", "fraction-pizza": "Fraction Pizza Chef",
    "multiplication-mountain": "Multiplication Mountain", "volume-voyage": "Volume Voyage", "gemdas-galaxy": "GEMDAS Galaxy",
    "composite-area-architect": "Composite Area Architect"
  };

  function formatDate(value) {
    const date = new Date(value || "");
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  async function openScoreReport(studentId) {
    const students = await window.NumeReadData.getStudentsForCurrentTeacher();
    const student = students.find((item) => item.id === studentId);
    if (!student) return;
    const pretest = student.pretest;
    $("#scoreStudentName").textContent = `${student.name} · ${student.studentId || "Student"}`;
    $("#pretestScores").innerHTML = pretest
      ? `<h3 class="font-semibold">Pre-test scores</h3><div class="grid sm:grid-cols-3 gap-3 mt-3"><div class="rounded-xl bg-orange-50 p-3"><span class="text-xs text-gray-500">Reading</span><strong class="block text-xl text-orange-700">${Number(student.reading || 0)}%</strong><span class="text-xs">${Number(pretest.readingCorrect || 0)}/${Number(pretest.readingTotal || 0)}</span></div><div class="rounded-xl bg-teal-50 p-3"><span class="text-xs text-gray-500">Mathematics</span><strong class="block text-xl text-teal-700">${Number(student.math || 0)}%</strong><span class="text-xs">${Number(pretest.mathCorrect || 0)}/${Number(pretest.mathTotal || 0)}</span></div><div class="rounded-xl bg-violet-50 p-3"><span class="text-xs text-gray-500">Reading & Math</span><strong class="block text-xl text-violet-700">${Number(pretest.combinedScore || 0)}%</strong><span class="text-xs">${Number(pretest.combinedCorrect || 0)}/${Number(pretest.combinedTotal || 0)} · ${formatDate(pretest.takenAt)}</span></div></div>`
      : `<h3 class="font-semibold">Pre-test scores</h3><p class="mt-2 text-sm text-gray-500">This learner has not completed the pre-test yet.</p>`;
    const progress = student.learningProgress || {};
    const activityIds = [...new Set([...Object.keys(ACTIVITY_LABELS), ...Object.keys(progress)])];
    const scored = activityIds.filter((id) => Number(progress[id]?.attempts || 0) > 0);
    $("#activityScores").innerHTML = scored.length ? scored.map((activityId) => {
      const entry = progress[activityId] || {};
      const history = Array.isArray(entry.scoreHistory) ? entry.scoreHistory.slice(-5).reverse() : [];
      const latest = Number.isFinite(Number(entry.lastScorePercent)) ? `${Math.round(Number(entry.lastScorePercent))}%` : (Number.isFinite(Number(entry.lastPerformance)) ? `${Math.round(Number(entry.lastPerformance) * 100)}%` : "—");
      const historyText = history.length ? history.map((item) => `${Math.round(Number(item.scorePercent || 0))}% (${escapeHtml(item.level || "practice")})`).join(" · ") : "Scores will appear after the next completed attempt.";
      let activityLabel = ACTIVITY_LABELS[activityId] || activityId;
      if (String(activityId).startsWith("lesson-game-")) {
        const materialId = String(activityId).replace(/^lesson-game-/, "");
        const matchedMaterial = cachedTeacherMaterials.find((item) => item.id === materialId);
        if (matchedMaterial) {
          activityLabel = matchedMaterial.generatedGameTitle || window.NumeReadLessonGame?.getGameTitle?.(matchedMaterial) || `${matchedMaterial.title} Quest`;
        }
      }
      return `<article class="rounded-xl border border-gray-200 p-4"><h4 class="font-semibold text-gray-800">${escapeHtml(activityLabel)}</h4><div class="grid grid-cols-3 gap-2 mt-3 text-center"><div class="rounded-lg bg-gray-50 p-2"><span class="block text-xs text-gray-500">Latest</span><strong>${latest}</strong></div><div class="rounded-lg bg-gray-50 p-2"><span class="block text-xs text-gray-500">Best</span><strong>${Number(entry.bestScorePercent || entry.lastScorePercent || 0)}%</strong></div><div class="rounded-lg bg-gray-50 p-2"><span class="block text-xs text-gray-500">Attempts</span><strong>${Number(entry.attempts || 0)}</strong></div></div><p class="mt-3 text-xs text-gray-500">Recent: ${historyText}</p><p class="mt-1 text-xs text-gray-400">Last completed: ${formatDate(entry.lastCompletedAt)}</p></article>`;
    }).join("") : '<p class="text-sm text-gray-500">No activities completed yet.</p>';
    $("#scorePanel").classList.remove("hidden");
    $("#scorePanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function render() {
    renderStudents(await window.NumeReadData.getStudentsForCurrentTeacher());
  }

  function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = String(value || "");
    return node.innerHTML;
  }

  function inferBaseMaterialId(title, keywords, area, targetLevel) {
    const normTitle = String(title || "").toLowerCase().trim();
    const normKeywords = String(keywords || "").toLowerCase().trim();
    const normLevel = String(targetLevel || "").toLowerCase().trim();
    for (const card of materialCatalog) {
      const cardTitle = card.title.toLowerCase();
      if (normTitle && (normTitle.includes(cardTitle) || cardTitle.includes(normTitle))) {
        return card.id;
      }
    }
    if (normKeywords) {
      const skillMatches = materialCatalog.filter((card) => {
        const cardSkills = String(card.skill || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        return cardSkills.some((sk) => normKeywords.includes(sk) || sk.includes(normKeywords));
      });
      if (skillMatches.length === 1) return skillMatches[0].id;
      if (skillMatches.length > 1) {
        const levelMatch = skillMatches.find((card) => card.level.toLowerCase() === normLevel);
        return (levelMatch || skillMatches[0]).id;
      }
    }
    return "";
  }

  function getResourcesForMaterial(card, materials) {
    return materials.filter((item) => {
      if (!item || item.hiddenBuiltInId) return false;
      if (item.baseMaterialId) return item.baseMaterialId === card.id;
      const inferred = inferBaseMaterialId(item.title, (item.keywords || []).join(", "), item.area, item.level);
      return inferred === card.id;
    });
  }

  function populateBaseMaterialSelect(hiddenBuiltInIds) {
    const select = $("#lessonBaseMaterialId");
    if (!select) return;
    const currentValue = select.value;
    const visibleCards = materialCatalog.filter((m) => !hiddenBuiltInIds.has(m.id));
    select.innerHTML = `<option value="">Auto-match by lesson title / skill (or standalone lesson)</option>` +
      visibleCards.map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.title)} (${escapeHtml(m.area)} · ${escapeHtml(m.level)})</option>`).join("");
    if (currentValue && visibleCards.some((m) => m.id === currentValue)) {
      select.value = currentValue;
    }
  }

  function renderMaterialCatalog(materials, teacher) {
    cachedTeacherMaterials = Array.isArray(materials) ? materials : [];
    cachedCurrentTeacher = teacher || cachedCurrentTeacher;
    const holder = $("#materialCatalogList");
    if (!holder) return;
    const hiddenBuiltInIds = new Set(cachedTeacherMaterials
      .filter((item) => item.hiddenBuiltInId && item.teacherUid === teacher?.uid)
      .map((item) => item.hiddenBuiltInId));

    populateBaseMaterialSelect(hiddenBuiltInIds);

    const matchedResourceIds = new Set();
    holder.innerHTML = materialCatalog.filter((material) => !hiddenBuiltInIds.has(material.id)).map((material) => {
      const attachedResources = getResourcesForMaterial(material, cachedTeacherMaterials);
      attachedResources.forEach((res) => matchedResourceIds.add(res.id));
      const resourceCount = attachedResources.length;
      const hasResource = resourceCount > 0;
      return `<article class="teacher-material-card ${hasResource ? "teacher-material-card--has-resource" : ""}">
        <i class="fas ${material.icon} teacher-material-card__icon"></i>
        <div class="teacher-material-card__body">
          <p class="teacher-material-card__meta">${escapeHtml(material.area)} · ${escapeHtml(material.level)}</p>
          <h4>${escapeHtml(material.title)}</h4>
          <p class="${hasResource ? "teacher-material-card__status-attached" : ""}">${hasResource ? `<i class="fas fa-circle-check"></i> ${resourceCount} teacher resource${resourceCount === 1 ? "" : "s"} attached` : "No teacher resource attached yet"}</p>
        </div>
        <div class="teacher-material-card__actions">
          ${hasResource ? `<button type="button" class="teacher-material-card__open" data-open-material="${escapeHtml(material.id)}"><i class="fas fa-book-open-reader"></i><span>Open material</span></button>` : ""}
          <button type="button" class="teacher-material-card__action" data-add-resource="${escapeHtml(material.id)}"><i class="fas fa-paperclip"></i><span>Add resource</span></button>
        </div>
        <button type="button" class="teacher-material-card__delete" data-delete-built-in="${escapeHtml(material.id)}" data-material-title="${escapeHtml(material.title)}" aria-label="Remove ${escapeHtml(material.title)}" title="Remove material"><i class="fas fa-xmark"></i></button>
      </article>`;
    }).join("");

    const standaloneTeacherResources = cachedTeacherMaterials.filter((material) => !material.hiddenBuiltInId && !matchedResourceIds.has(material.id));
    holder.insertAdjacentHTML("beforeend", standaloneTeacherResources.map((material) => {
      const isLegacySectionMaterial = !Object.prototype.hasOwnProperty.call(material, "teacherUid")
        && String(material.section || "") === String(teacher?.section || "");
      const isOwner = material.teacherUid === teacher?.uid || isLegacySectionMaterial;
      const accessLabel = material.sourceUrl ? "Online link uploaded" : material.fileName ? material.fileName : "Text lesson uploaded";
      return `<article class="teacher-material-card teacher-material-card--resource teacher-material-card--has-resource">
        <i class="fas ${material.fileName ? "fa-paperclip" : material.sourceUrl ? "fa-link" : "fa-file-lines"} teacher-material-card__icon"></i>
        <div class="teacher-material-card__body">
          <p class="teacher-material-card__meta">${escapeHtml(material.area)} · ${escapeHtml(material.level)} · Custom Lesson</p>
          <h4>${escapeHtml(material.title)}</h4>
          <p class="teacher-material-card__status-attached"><i class="fas fa-circle-check"></i> ${escapeHtml(accessLabel)}</p>
        </div>
        <div class="teacher-material-card__actions">
          <button type="button" class="teacher-material-card__open" data-open-material="${escapeHtml(material.id)}"><i class="fas fa-book-open-reader"></i><span>Open material</span></button>
        </div>
        ${isOwner ? `<button type="button" class="teacher-material-card__delete" data-delete-material="${escapeHtml(material.id)}" data-material-title="${escapeHtml(material.title)}" aria-label="Delete ${escapeHtml(material.title)}" title="Delete material"><i class="fas fa-xmark"></i></button>` : ""}
      </article>`;
    }).join(""));
  }

  function renderMaterialVisual(materialId) {
    if (materialId === "module-fractions" || materialId === "av-fraction-visuals") {
      return `
        <div class="material-visual-box">
          <p class="material-visual-title"><i class="fas fa-pizza-slice mr-1"></i> Interactive Slice Visualizer (Pizza Model)</p>
          <div class="fraction-slices-grid">
            <div>
              <svg width="84" height="84" viewBox="0 0 100 100" class="mx-auto">
                <circle cx="50" cy="50" r="46" fill="#fde68a" stroke="#d97706" stroke-width="4"/>
                <path d="M 50 50 L 50 4 A 46 46 0 0 1 50 96 Z" fill="#ef4444" opacity="0.85"/>
                <line x1="50" y1="4" x2="50" y2="96" stroke="#b45309" stroke-width="2"/>
              </svg>
              <div style="font-weight:900; color:#78350f; font-size:0.88rem; margin-top:0.25rem;">1/2 (1 of 2 slices)</div>
            </div>
            <div>
              <svg width="84" height="84" viewBox="0 0 100 100" class="mx-auto">
                <circle cx="50" cy="50" r="46" fill="#fde68a" stroke="#d97706" stroke-width="4"/>
                <path d="M 50 50 L 50 4 A 46 46 0 0 1 96 50 Z" fill="#ef4444" opacity="0.85"/>
                <line x1="50" y1="4" x2="50" y2="96" stroke="#b45309" stroke-width="2"/>
                <line x1="4" y1="50" x2="96" y2="50" stroke="#b45309" stroke-width="2"/>
              </svg>
              <div style="font-weight:900; color:#78350f; font-size:0.88rem; margin-top:0.25rem;">1/4 (1 of 4 slices)</div>
            </div>
            <div>
              <svg width="84" height="84" viewBox="0 0 100 100" class="mx-auto">
                <circle cx="50" cy="50" r="46" fill="#fde68a" stroke="#d97706" stroke-width="4"/>
                <path d="M 50 50 L 96 50 A 46 46 0 0 1 50 96 Z" fill="#ef4444" opacity="0.85"/>
                <line x1="50" y1="4" x2="50" y2="96" stroke="#b45309" stroke-width="2"/>
                <line x1="4" y1="50" x2="96" y2="50" stroke="#b45309" stroke-width="2"/>
              </svg>
              <div style="font-weight:900; color:#15803d; font-size:0.88rem; margin-top:0.25rem;">2/4 = 1/2 (Equivalent)</div>
            </div>
          </div>
        </div>`;
    }
    if (materialId === "module-subtraction") {
      return `
        <div class="material-visual-box">
          <p class="material-visual-title"><i class="fas fa-person-running mr-1"></i> Number Line Backward Jump: 15 - 6 = 9</p>
          <svg width="100%" height="65" viewBox="0 0 440 65" class="mx-auto" style="max-width: 440px; display: block;">
            <line x1="20" y1="45" x2="420" y2="45" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
            <path d="M 380 45 Q 265 10 150 45" fill="none" stroke="#e11d48" stroke-width="3" stroke-dasharray="4,4"/>
            <polygon points="150,45 162,38 158,50" fill="#e11d48"/>
            <text x="265" y="22" font-size="12" font-weight="bold" fill="#be123c" text-anchor="middle">-6 Jumps</text>
            <circle cx="380" cy="45" r="6" fill="#0284c7"/>
            <text x="380" y="60" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">15</text>
            <circle cx="150" cy="45" r="6" fill="#16a34a"/>
            <text x="150" y="60" font-size="11" font-weight="bold" fill="#15803d" text-anchor="middle">9</text>
          </svg>
        </div>`;
    }
    if (materialId === "module-place-value") {
      return `
        <div class="material-visual-box">
          <p class="material-visual-title"><i class="fas fa-cubes-stacked mr-1"></i> Base-10 Blocks: 1 Hundred + 4 Tens + 5 Ones = 145</p>
          <div class="place-value-blocks-grid">
            <div style="padding:0.6rem; background:#fff; border-radius:0.75rem; border:1px solid #c7d2fe; min-width:90px;">
              <div style="width:44px; height:44px; background:#e0e7ff; border:2px solid #6366f1; border-radius:4px; margin:auto; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.75rem; color:#4338ca;">100</div>
              <div style="font-size:0.72rem; font-weight:800; color:#312e81; margin-top:0.35rem;">1 Hundred (100)</div>
            </div>
            <div style="padding:0.6rem; background:#fff; border-radius:0.75rem; border:1px solid #c7d2fe; min-width:90px;">
              <div style="display:flex; gap:3px; justify-content:center; height:44px; align-items:center;">
                <div style="width:7px; height:40px; background:#34d399; border:1px solid #059669; border-radius:2px;"></div>
                <div style="width:7px; height:40px; background:#34d399; border:1px solid #059669; border-radius:2px;"></div>
                <div style="width:7px; height:40px; background:#34d399; border:1px solid #059669; border-radius:2px;"></div>
                <div style="width:7px; height:40px; background:#34d399; border:1px solid #059669; border-radius:2px;"></div>
              </div>
              <div style="font-size:0.72rem; font-weight:800; color:#065f46; margin-top:0.35rem;">4 Tens (40)</div>
            </div>
            <div style="padding:0.6rem; background:#fff; border-radius:0.75rem; border:1px solid #c7d2fe; min-width:90px;">
              <div style="display:flex; gap:3px; justify-content:center; align-items:center; height:44px;">
                <div style="width:10px; height:10px; background:#fbbf24; border:1px solid #d97706; border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:#fbbf24; border:1px solid #d97706; border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:#fbbf24; border:1px solid #d97706; border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:#fbbf24; border:1px solid #d97706; border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:#fbbf24; border:1px solid #d97706; border-radius:2px;"></div>
              </div>
              <div style="font-size:0.72rem; font-weight:800; color:#92400e; margin-top:0.35rem;">5 Ones (5)</div>
            </div>
          </div>
        </div>`;
    }
    if (materialId === "module-addition") {
      return `
        <div class="material-visual-box">
          <p class="material-visual-title"><i class="fas fa-table-cells mr-1"></i> Visual Ten-Frame: 7 + 5 = 12</p>
          <div class="ten-frame-container">
            <div class="ten-frame-card">
              <div class="ten-frame-grid">
                <div class="ten-frame-dot dot-purple"></div><div class="ten-frame-dot dot-purple"></div><div class="ten-frame-dot dot-purple"></div><div class="ten-frame-dot dot-purple"></div><div class="ten-frame-dot dot-purple"></div>
                <div class="ten-frame-dot dot-purple"></div><div class="ten-frame-dot dot-purple"></div><div class="ten-frame-dot dot-orange"></div><div class="ten-frame-dot dot-orange"></div><div class="ten-frame-dot dot-orange"></div>
              </div>
              <div class="ten-frame-label">Full Ten (10)</div>
            </div>
            <div class="ten-frame-card">
              <div class="ten-frame-grid">
                <div class="ten-frame-dot dot-orange"></div><div class="ten-frame-dot dot-orange"></div><div class="ten-frame-dot dot-empty"></div><div class="ten-frame-dot dot-empty"></div><div class="ten-frame-dot dot-empty"></div>
                <div class="ten-frame-dot dot-empty"></div><div class="ten-frame-dot dot-empty"></div><div class="ten-frame-dot dot-empty"></div><div class="ten-frame-dot dot-empty"></div><div class="ten-frame-dot dot-empty"></div>
              </div>
              <div class="ten-frame-label">+2 Ones = 12</div>
            </div>
          </div>
        </div>`;
    }
    if (materialId === "module-blends") {
      return `
        <div class="material-visual-box">
          <p class="material-visual-title"><i class="fas fa-tower-bridge mr-1"></i> Beginning Phonics Blend Sound Cards</p>
          <div class="phonics-sound-grid">
            <div class="phonics-sound-card"><span class="phonics-blend-letters">bl</span><span class="phonics-blend-word">🔵 blue</span></div>
            <div class="phonics-sound-card"><span class="phonics-blend-letters">br</span><span class="phonics-blend-word">🪥 brush</span></div>
            <div class="phonics-sound-card"><span class="phonics-blend-letters">cl</span><span class="phonics-blend-word">⏰ clock</span></div>
            <div class="phonics-sound-card"><span class="phonics-blend-letters">tr</span><span class="phonics-blend-word">🚂 train</span></div>
          </div>
        </div>`;
    }
    return "";
  }

  function extractYouTubeEmbedUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    const match = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  }

  function renderUploadedResourcePresenter(resource) {
    if (!resource) return "";
    const mediaUrl = resource.fileUrl || resource.fileData || "";
    const safeMediaUrl = escapeHtml(mediaUrl);
    const fileType = String(resource.fileType || "").toLowerCase();
    const sourceUrl = String(resource.sourceUrl || "").trim();
    const ytEmbed = extractYouTubeEmbedUrl(sourceUrl);
    const isLegacySectionMaterial = !Object.prototype.hasOwnProperty.call(resource, "teacherUid")
      && String(resource.section || "") === String(cachedCurrentTeacher?.section || "");
    const isOwner = !resource.teacherUid || resource.teacherUid === cachedCurrentTeacher?.uid || isLegacySectionMaterial;

    let mediaEmbedHtml = "";
    if (ytEmbed) {
      mediaEmbedHtml = `<div class="teacher-present-media"><iframe class="teacher-present-iframe" src="${escapeHtml(ytEmbed)}" title="${escapeHtml(resource.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    } else if (fileType === "application/pdf" && mediaUrl) {
      mediaEmbedHtml = `<div class="teacher-present-media"><iframe class="teacher-present-iframe" src="${safeMediaUrl}" title="${escapeHtml(resource.fileName || resource.title)}"></iframe></div>`;
    } else if (fileType.startsWith("image/") && mediaUrl) {
      mediaEmbedHtml = `<div class="teacher-present-media" style="background:#f8fafc; padding:0.75rem;"><img class="teacher-present-image" src="${safeMediaUrl}" alt="${escapeHtml(resource.fileName || resource.title)}"></div>`;
    } else if (fileType.startsWith("video/") && mediaUrl) {
      mediaEmbedHtml = `<div class="teacher-present-media"><video style="width:100%; max-height:60vh; display:block;" controls playsinline preload="metadata"><source src="${safeMediaUrl}" type="${escapeHtml(fileType)}">Your browser cannot play this video.</video></div>`;
    } else if (fileType.startsWith("audio/") && mediaUrl) {
      mediaEmbedHtml = `<div style="margin-top:1rem; padding:1rem; background:#f0fdfa; border:1px solid #ccfbf1; border-radius:0.85rem;"><p style="font-weight:700; font-size:0.85rem; color:#0f766e; margin:0 0 0.5rem;"><i class="fas fa-headphones mr-1"></i> Classroom Audio Playback</p><audio style="width:100%;" controls preload="metadata"><source src="${safeMediaUrl}" type="${escapeHtml(fileType)}"></audio></div>`;
    }

    const customQuestions = Array.isArray(resource.gameQuestions) && resource.gameQuestions.length
      ? `<div class="material-check-box" style="margin-top:1rem;">
          <p class="material-check-question"><i class="fas fa-gamepad"></i> Teacher Custom Class Practice Questions (${resource.gameQuestions.length})</p>
          <div style="display:grid; gap:0.75rem;">
            ${resource.gameQuestions.map((q, qIdx) => `
              <div style="background:#ffffff; border:1px solid #fed7aa; border-radius:0.75rem; padding:0.75rem;">
                <p style="font-weight:700; color:#1e293b; font-size:0.9rem; margin:0 0 0.5rem;">${qIdx + 1}. ${escapeHtml(q.prompt)}</p>
                <div class="material-check-choices">
                  ${(q.choices || []).map((choice) => `<button type="button" class="material-check-btn" data-teacher-check data-answer="${escapeHtml(String(q.answer))}" data-choice="${escapeHtml(String(choice))}">${escapeHtml(String(choice))}</button>`).join("")}
                </div>
                <p class="material-check-feedback" data-teacher-check-feedback></p>
              </div>
            `).join("")}
          </div>
        </div>`
      : "";

    return `
      <section class="teacher-present-resource" aria-label="Uploaded teacher learning material">
        <div class="teacher-present-resource__header">
          <div>
            <span class="teacher-present-resource__eyebrow"><i class="fas fa-chalkboard-user"></i> Uploaded Teacher Material · ${escapeHtml(resource.section || "All Sections")}</span>
            <h3 class="teacher-present-resource__title">${escapeHtml(resource.title)}</h3>
            ${resource.fileName ? `<p style="font-size:0.8rem; color:#0f766e; font-weight:600; margin-top:0.2rem;"><i class="fas fa-paperclip"></i> ${escapeHtml(resource.fileName)}</p>` : ""}
          </div>
          <div class="teacher-present-resource__actions">
            ${resource.id ? `<a href="game-lesson-quest.html?materialId=${encodeURIComponent(resource.id)}&preview=teacher&section=${encodeURIComponent(resource.section || "")}" class="teacher-present-link-btn"><i class="fas fa-gamepad"></i><span>Play / Present Generated Game</span></a>` : ""}
            ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="teacher-present-link-btn"><i class="fas fa-up-right-from-square"></i><span>Open Online Link</span></a>` : ""}
            ${mediaUrl ? `<a href="${safeMediaUrl}" target="_blank" rel="noopener noreferrer" download="${escapeHtml(resource.fileName || "learning-material")}" class="teacher-present-link-btn"><i class="fas fa-file-arrow-down"></i><span>Open / Download File</span></a>` : ""}
            ${isOwner && resource.id ? `<button type="button" class="teacher-present-delete-btn" data-delete-material="${escapeHtml(resource.id)}" data-material-title="${escapeHtml(resource.title)}"><i class="fas fa-trash-can"></i><span>Delete Resource</span></button>` : ""}
          </div>
        </div>
        ${mediaEmbedHtml}
        ${resource.content ? `<div class="teacher-present-note">${escapeHtml(resource.content)}</div>` : ""}
        ${customQuestions}
      </section>
    `;
  }

  function openTeacherMaterial(materialId, resourceIndex = 0) {
    const modal = $("#teacherMaterialModal");
    const body = $("#teacherModalBody");
    const titleEl = $("#teacherModalTitle");
    const badgeEl = $("#teacherModalBadge");
    const addAnotherBtn = $("#teacherModalAddAnotherBtn");
    if (!modal || !body || !titleEl) return;

    const catalogCard = materialCatalog.find((item) => item.id === materialId);
    const attachedResources = catalogCard
      ? getResourcesForMaterial(catalogCard, cachedTeacherMaterials)
      : cachedTeacherMaterials.filter((item) => item.id === materialId);

    if (!attachedResources.length) return;

    activeModalMaterialId = materialId;
    activeModalResourceIndex = Math.max(0, Math.min(resourceIndex, attachedResources.length - 1));
    const activeResource = attachedResources[activeModalResourceIndex];

    const displayArea = catalogCard?.area || activeResource?.area || "Lesson";
    const displayLevel = catalogCard?.level || activeResource?.level || "All Levels";
    titleEl.textContent = catalogCard ? catalogCard.title : activeResource.title;
    if (badgeEl) {
      badgeEl.innerHTML = `<i class="fas fa-chalkboard-user"></i> Classroom Presentation · ${escapeHtml(displayArea)} · ${escapeHtml(displayLevel)}`;
    }
    if (addAnotherBtn) {
      addAnotherBtn.style.display = catalogCard ? "inline-flex" : "none";
      addAnotherBtn.onclick = () => {
        closeTeacherMaterial();
        prepareResourceForm(catalogCard.id);
      };
    }

    const tabsHtml = attachedResources.length > 1
      ? `<div class="teacher-resource-tabs" role="tablist" aria-label="Uploaded resources for this lesson">
          ${attachedResources.map((res, idx) => `
            <button type="button" class="teacher-resource-tab ${idx === activeModalResourceIndex ? "is-active" : ""}" data-resource-tab="${idx}">
              <i class="fas ${res.fileName ? "fa-paperclip" : res.sourceUrl ? "fa-link" : "fa-file-lines"}"></i>
              <span>Resource ${idx + 1}: ${escapeHtml(res.fileName || res.title)}</span>
            </button>
          `).join("")}
        </div>`
      : "";

    const builtInLessonHtml = catalogCard ? `
      <section style="margin-top:1.25rem; border-top:1px dashed #cbd5e1; padding-top:1.15rem;">
        <p style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#0f766e; margin:0 0 0.65rem;"><i class="fas fa-graduation-cap"></i> Interactive Lesson Guide & Visual Aids for Students</p>
        <div class="material-content-box">${escapeHtml(catalogCard.content)}</div>
        ${renderMaterialVisual(catalogCard.id)}
        ${Array.isArray(catalogCard.steps) && catalogCard.steps.length ? `
          <div class="material-steps-box">
            <p class="material-steps-title"><i class="fas fa-list-check" style="color:#0d9488;"></i> Step-by-Step Classroom Walkthrough</p>
            <ol class="material-steps-list">${catalogCard.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </div>` : ""}
        ${catalogCard.check?.question ? `
          <div class="material-check-box">
            <p class="material-check-question"><i class="fas fa-lightbulb" style="color:#ea580c;"></i> Class Quick Check: ${escapeHtml(catalogCard.check.question)}</p>
            <div class="material-check-choices">
              ${(catalogCard.check.choices || []).map((choice) => `<button type="button" class="material-check-btn" data-teacher-check data-answer="${escapeHtml(catalogCard.check.answer)}" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`).join("")}
            </div>
            <p class="material-check-feedback" data-teacher-check-feedback aria-live="polite"></p>
          </div>` : ""}
      </section>
    ` : "";

    body.innerHTML = `${tabsHtml}${renderUploadedResourcePresenter(activeResource)}${builtInLessonHtml}`;
    body.scrollTop = 0;

    const speakBtn = $("#teacherSpeakMaterialBtn");
    if (speakBtn) {
      speakBtn.onclick = () => {
        if (typeof window.speechSynthesis === "undefined") return;
        window.speechSynthesis.cancel();
        const parts = [
          titleEl.textContent,
          activeResource?.content || "",
          catalogCard?.content || "",
          ...(catalogCard?.steps || [])
        ].filter(Boolean).join(". ");
        const utterance = new SpeechSynthesisUtterance(parts.replace(/[•\n]/g, " "));
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      };
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeTeacherMaterial() {
    const modal = $("#teacherMaterialModal");
    if (!modal) return;
    if (typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.cancel();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    modal.classList.remove("is-presentation-mode");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    const fullscreenBtn = $("#teacherFullscreenMaterialBtn");
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = '<i class="fas fa-tv"></i><span>Present Fullscreen</span>';
    }
  }

  function toggleTeacherPresentationFullscreen() {
    const modal = $("#teacherMaterialModal");
    const card = $("#teacherMaterialModalCard");
    const btn = $("#teacherFullscreenMaterialBtn");
    if (!modal || !card) return;
    const isPresenting = modal.classList.toggle("is-presentation-mode");
    if (isPresenting) {
      card.requestFullscreen?.().catch(() => {});
      if (btn) btn.innerHTML = '<i class="fas fa-compress"></i><span>Exit Fullscreen</span>';
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      if (btn) btn.innerHTML = '<i class="fas fa-tv"></i><span>Present Fullscreen</span>';
    }
  }

  function prepareResourceForm(materialId) {
    const material = materialCatalog.find((item) => item.id === materialId);
    const form = $("#lessonForm");
    if (!material || !form) return;
    form.elements.title.value = `${material.title} - Teacher Resource`;
    form.elements.keywords.value = material.skill;
    form.elements.area.value = material.area;
    form.elements.level.value = material.level;
    form.elements.baseMaterialId.value = material.id;
    form.elements.content.value = `Teacher-provided resource for ${material.title}.`;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.sourceUrl.focus();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("The selected file could not be read."));
      reader.readAsDataURL(file);
    });
  }

  async function renderLessons() {
    const list = await window.NumeReadData.getLearningMaterials();
    const holder = $("#lessonList");
    if (!holder) return;
    const teacher = await window.NumeReadData.currentTeacher();
    renderMaterialCatalog(list, teacher);
    const visibleLessons = list.filter((lesson) => !lesson.hiddenBuiltInId);
    holder.innerHTML = visibleLessons.length ? visibleLessons.map((lesson) => {
      const isOwner = lesson.teacherUid === teacher?.uid;
      const gameTitle = lesson.generatedGameTitle || window.NumeReadLessonGame?.getGameTitle?.(lesson) || `${lesson.title} Quest`;
      return `<article class="border border-orange-100 rounded-xl p-3 relative"><p class="font-semibold">${escapeHtml(lesson.title)}</p><p class="text-xs text-gray-500">${escapeHtml(lesson.area)} · ${escapeHtml(lesson.level)} · ${escapeHtml(lesson.section)}</p><p class="text-sm mt-2">${escapeHtml(lesson.content || lesson.summary)}</p><div class="flex flex-wrap items-center gap-3 mt-2">${lesson.sourceUrl ? `<a href="${escapeHtml(lesson.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs text-teal-700 font-semibold"><i class="fas fa-circle-play"></i> Online material</a>` : lesson.fileName ? `<p class="text-xs text-teal-700 font-semibold"><i class="fas fa-paperclip"></i> ${escapeHtml(lesson.fileName)}</p>` : ""}${lesson.id ? `<a href="game-lesson-quest.html?materialId=${encodeURIComponent(lesson.id)}&preview=teacher&section=${encodeURIComponent(lesson.section || "")}" class="inline-block text-xs text-orange-700 font-bold"><i class="fas fa-gamepad"></i> Generated Game: ${escapeHtml(gameTitle)}</a>` : ""}</div>${isOwner ? `<button type="button" data-delete-material="${escapeHtml(lesson.id)}" data-material-title="${escapeHtml(lesson.title)}" class="absolute top-3 right-3 text-red-600 hover:text-red-700" aria-label="Delete ${escapeHtml(lesson.title)}" title="Delete material"><i class="fas fa-xmark"></i></button>` : ""}</article>`;
    }).join("") : '<p class="text-sm text-gray-500">No lessons yet. Add one above to personalize matching game activities.</p>';
  }

  async function deleteLesson(button) {
    const title = button.dataset.materialTitle || "this material";
    if (!(await confirmDeleteLesson(title))) return;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    try {
      await window.NumeReadData.deleteLearningMaterial(button.dataset.deleteMaterial);
      $("#lessonStatus").textContent = `Deleted “${title}”.`;
      await renderLessons();
      if (activeModalMaterialId) {
        const card = materialCatalog.find((item) => item.id === activeModalMaterialId);
        const remaining = card
          ? getResourcesForMaterial(card, cachedTeacherMaterials)
          : cachedTeacherMaterials.filter((item) => item.id === activeModalMaterialId);
        if (!remaining.length) {
          closeTeacherMaterial();
        } else {
          openTeacherMaterial(activeModalMaterialId, 0);
        }
      }
    } catch (error) {
      $("#lessonStatus").textContent = error.message || "The material could not be deleted.";
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-trash-can"></i> Delete material';
    }
  }

  async function hideBuiltInMaterial(button) {
    const materialId = button.dataset.deleteBuiltIn;
    const material = materialCatalog.find((item) => item.id === materialId);
    if (!material || !(await confirmDeleteLesson(material.title))) return;
    button.disabled = true;
    try {
      await window.NumeReadData.saveLearningMaterial({
        id: `hidden-material-${material.id}-${Date.now()}`,
        title: `Hidden ${material.title}`,
        category: "Material visibility",
        area: material.area,
        level: material.level,
        content: `Hide ${material.title} for this section.`,
        summary: "Built-in material hidden by the teacher.",
        hiddenBuiltInId: material.id
      });
      $("#lessonStatus").textContent = `${material.title} was removed for this section.`;
      await renderLessons();
    } catch (error) {
      $("#lessonStatus").textContent = error.message || "The material could not be removed.";
      button.disabled = false;
    }
  }

  function confirmDeleteLesson(title) {
    const dialog = $("#deleteMaterialDialog");
    const message = $("#deleteMaterialMessage");
    const cancelButtons = dialog?.querySelectorAll("[data-cancel-delete]");
    const confirmButton = dialog?.querySelector("[data-confirm-delete]");
    if (!dialog || !message || !cancelButtons?.length || !confirmButton) return Promise.resolve(false);

    message.textContent = `Delete “${title}”? This action cannot be undone.`;
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    confirmButton.focus();

    return new Promise((resolve) => {
      const close = (confirmed) => {
        dialog.classList.remove("is-open");
        dialog.setAttribute("aria-hidden", "true");
        cancelButtons.forEach((button) => button.removeEventListener("click", cancel));
        confirmButton.removeEventListener("click", confirm);
        document.removeEventListener("keydown", onKeydown);
        resolve(confirmed);
      };
      const cancel = () => close(false);
      const confirm = () => close(true);
      const onKeydown = (event) => { if (event.key === "Escape") close(false); };
      cancelButtons.forEach((button) => button.addEventListener("click", cancel));
      confirmButton.addEventListener("click", confirm);
      document.addEventListener("keydown", onKeydown);
    });
  }

  function parseGameQuestions(value) {
    return String(value || "").split(/\r?\n/).map((line) => {
      const [prompt, answer, choices] = line.split("|").map((part) => part.trim());
      if (!prompt || !answer || !choices) return null;
      const options = choices.split(/[,;]/).map((item) => item.trim()).filter(Boolean);
      return options.length >= 2 ? { prompt, answer, choices: options.includes(answer) ? options : [...options, answer] } : null;
    }).filter(Boolean);
  }

  function activityIdsFromKeywords(keywords) {
    const value = String(keywords || "").toLowerCase();
    const matches = [
      ["word-bakery", "Word Problem Bakery", "word problem"],
      ["math-ninja", "Math Ninja", "addition facts"],
      ["subtraction-sprint", "Subtraction Sprint", "subtraction"],
      ["place-value-builder", "Place Value Builder", "place value"],
      ["fraction-pizza", "Fraction Pizza Chef", "Fraction Pizza", "fraction", "fractions", "half", "halves", "quarter", "thirds"],
      ["reading-bridge", "Reading Bridge", "blends"],
      ["sentence-builder", "Sentence Builder", "sentence"],
      ["vocab-quest", "Vocabulary Quest", "vocabulary"],
      ["comprehension-trail", "Comprehension Trail", "comprehension"]
    ];
    return matches.filter(([, ...terms]) => terms.some((term) => value.includes(term.toLowerCase()))).map(([id]) => id);
  }

  async function saveLesson(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const status = $("#lessonStatus");
    try {
      status.textContent = "Saving lesson…";
      const sourceUrl = String(formData.get("sourceUrl") || "").trim();
      const content = String(formData.get("content") || "").trim();
      const file = formData.get("resourceFile");
      const hasFile = file instanceof File && file.size > 0;
      if (sourceUrl && !/^https:\/\/.+/i.test(sourceUrl)) throw new Error("Use a public HTTPS video or lesson URL.");
      if (hasFile && file.size > MAX_RESOURCE_FILE_SIZE) throw new Error("Choose a file smaller than 700 KB.");
      if (hasFile && !(/^(application\/pdf|image\/|audio\/|video\/)/.test(file.type))) throw new Error("Attach a PDF, image, audio, or video file.");
      if (!content && !sourceUrl && !hasFile) throw new Error("Add a teaching note, a file, or a public online resource URL.");
      const keywords = String(formData.get("keywords") || "").split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
      const gameQuestions = parseGameQuestions(formData.get("gameQuestions"));
      const fileData = hasFile ? await readFileAsDataUrl(file) : "";
      const explicitBaseId = String(formData.get("baseMaterialId") || "").trim();
      const resolvedBaseMaterialId = explicitBaseId || inferBaseMaterialId(formData.get("title"), formData.get("keywords"), formData.get("area"), formData.get("level"));

      const savedMaterial = await window.NumeReadData.saveLearningMaterial({
        title: formData.get("title"), area: formData.get("area"), level: formData.get("level"), section: formData.get("section"),
        sourceUrl, content: content || "Open the teacher resource to begin this lesson.", summary: (content || file?.name || "Online learning material").slice(0, 240), keywords, gameQuestions,
        baseMaterialId: resolvedBaseMaterialId, fileName: hasFile ? file.name : "", fileType: hasFile ? file.type : "", fileSize: hasFile ? file.size : 0, fileData,
        category: hasFile ? "Teacher File Resource" : sourceUrl ? "Online Learning Material" : "Teacher Text Module"
      });
      form.reset();
      const teacher = await window.NumeReadData.currentTeacher();
      if (teacher) $("#lessonSection").value = teacher.section;
      const rawName = String(teacher?.name || "").trim();
      const cleanName = rawName.replace(/^teacher\s+/i, "").trim() || rawName || "Teacher";
      const teacherTitle = /^teacher\s+/i.test(rawName) ? rawName : (cleanName ? `Teacher ${cleanName}` : "Teacher");
      if ($("#lessonTeacherName")) $("#lessonTeacherName").value = teacherTitle;

      const gameTitle = savedMaterial?.generatedGameTitle || window.NumeReadLessonGame?.getGameTitle?.(savedMaterial) || "Lesson Quest";
      const attachedToCard = Boolean(resolvedBaseMaterialId);
      status.textContent = attachedToCard
        ? `Resource attached & new game “${gameTitle}” generated! Click “Open material” on the lesson card above to present it.`
        : `Lesson saved & new game “${gameTitle}” generated for students! Click “Open material” on the card to present it.`;
      await renderLessons();
    } catch (error) { status.textContent = error.message || "Lesson could not be saved."; }
  }

  async function importOnlineMaterial(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const status = $("#onlineMaterialStatus");
    const submit = form.querySelector('[type="submit"]');
    try {
      status.textContent = "Retrieving and extracting the online lesson…";
      submit.disabled = true;
      const sourceUrl = String(formData.get("sourceUrl") || "").trim();
      const title = String(formData.get("title") || "").trim();
      const content = String(formData.get("content") || "").trim();
      if (!/^https:\/\/.+/i.test(sourceUrl)) throw new Error("Use a public HTTPS lesson URL.");
      if (!title || !content) throw new Error("Add a display title and lesson text.");
      const keywords = String(formData.get("keywords") || "").split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
      const activityIds = activityIdsFromKeywords(keywords.join(" "));
      const resolvedBaseMaterialId = inferBaseMaterialId(title, keywords.join(", "), formData.get("area"), formData.get("level"));
      const savedOnline = await window.NumeReadData.saveLearningMaterial({
        title, sourceUrl, content, summary: content.slice(0, 240), keywords, activityIds,
        baseMaterialId: resolvedBaseMaterialId,
        area: formData.get("area"), level: formData.get("level"), category: "Online Learning Link"
      });
      form.reset();
      const onlineGameTitle = savedOnline?.generatedGameTitle || window.NumeReadLessonGame?.getGameTitle?.(savedOnline) || `${title} Quest`;
      status.textContent = `Added “${title}” & generated new game “${onlineGameTitle}”! Click “Open material” to present it.`;
      await renderLessons();
    } catch (error) {
      status.textContent = error.message || "The online material could not be imported.";
    } finally {
      submit.disabled = false;
    }
  }

  function exportReport() {
    window.NumeReadData.currentTeacher().then((teacher) => {
      window.NumeReadData.getStudentsForCurrentTeacher().then((students) => {
        const teacherName = teacher?.name || "Teacher";
        const sectionName = teacher?.section || "Class";
        const header = `# Teacher: ${teacherName} | Section: ${sectionName}\nStudent,Grade,Reading,Math,XP,Streak,Gaps`;
        const rows = students.map((student) => [
          student.name,
          student.grade,
          student.reading,
          student.math,
          student.xp,
          student.streak,
          `"${student.gaps.join("; ")}"`
        ].join(","));
        const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `numeread-class-report-${sectionName.replace(/\s+/g, "_")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    (async () => {
      const teacher = await window.NumeReadData.currentTeacher();
      if (!teacher) {
        $("#teacherAccessDetail").textContent = "Verify your teacher email, then sign in with the same account to open this dashboard.";
        $("#teacherAccessMessage").classList.remove("hidden");
        return;
      }
      cachedCurrentTeacher = teacher;
      const rawName = String(teacher.name || "").trim();
      const cleanName = rawName.replace(/^teacher\s+/i, "").trim() || rawName || "Teacher";
      const teacherTitle = /^teacher\s+/i.test(rawName) ? rawName : (cleanName ? `Teacher ${cleanName}` : "Teacher");

      if ($("#teacherName")) $("#teacherName").textContent = cleanName;
      if ($("#teacherWelcomeName")) $("#teacherWelcomeName").textContent = teacherTitle;
      if ($("#teacherWelcomeSection")) $("#teacherWelcomeSection").textContent = teacher.section || "";
      if ($("#tableTeacherName")) $("#tableTeacherName").textContent = teacherTitle;
      if ($("#lessonTeacherName")) $("#lessonTeacherName").value = teacherTitle;
      if ($("#teacherSection")) $("#teacherSection").textContent = teacher.section;
      if ($("#lessonSection")) $("#lessonSection").value = teacher.section;
      if ($("#teacherClassCode") && teacher.classCode) $("#teacherClassCode").textContent = teacher.classCode;
      $("#firebaseStatus").textContent = "Secure connection";
      await render();
      await renderLessons();
    })().catch((error) => {
      console.error("Teacher dashboard access failed.", error);
      $("#teacherAccessDetail").textContent = error?.message || "We could not verify your teacher session. Please sign in again.";
      $("#teacherAccessMessage").classList.remove("hidden");
    });

    $("#lessonForm")?.addEventListener("submit", saveLesson);
    $("#onlineMaterialForm")?.addEventListener("submit", importOnlineMaterial);
    $("#teacherFullscreenMaterialBtn")?.addEventListener("click", toggleTeacherPresentationFullscreen);

    $("#copyClassCodeBtn")?.addEventListener("click", () => {
      const code = $("#teacherClassCode")?.textContent?.trim() || "";
      if (!code || code === "------") return;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const btn = $("#copyClassCodeBtn");
          if (btn) {
            btn.innerHTML = '<i class="fas fa-check text-green-600"></i> <span class="text-green-700">Copied!</span>';
            setTimeout(() => {
              btn.innerHTML = '<i class="fas fa-copy"></i> <span>Copy</span>';
            }, 2000);
          }
        }).catch(() => {});
      }
    });

    document.addEventListener("click", (event) => {
      const assignButton = event.target.closest("[data-assign]");
      if (assignButton) assignPath(assignButton.dataset.assign);
      const scoreButton = event.target.closest("[data-view-scores]");
      if (scoreButton) openScoreReport(scoreButton.dataset.viewScores);
      if (event.target.closest("[data-close-scores]")) $("#scorePanel")?.classList.add("hidden");
      const assessButton = event.target.closest("[data-assess]");
      if (assessButton) openAssessment(assessButton.dataset.assess);
      if (event.target.closest("[data-close-assessment]")) $("#assessmentPanel").classList.add("hidden");
      if (event.target.closest("[data-generate-remediation]")) generateRemediation().catch((error) => { $("#assessmentStatus").textContent = error.message || "Could not generate activity."; });
      const deleteMaterialButton = event.target.closest("[data-delete-material]");
      if (deleteMaterialButton) deleteLesson(deleteMaterialButton);
      const deleteBuiltInButton = event.target.closest("[data-delete-built-in]");
      if (deleteBuiltInButton) hideBuiltInMaterial(deleteBuiltInButton);
      const openMaterialButton = event.target.closest("[data-open-material]");
      if (openMaterialButton) openTeacherMaterial(openMaterialButton.dataset.openMaterial, 0);
      const resourceTabButton = event.target.closest("[data-resource-tab]");
      if (resourceTabButton && activeModalMaterialId) {
        openTeacherMaterial(activeModalMaterialId, Number(resourceTabButton.dataset.resourceTab || 0));
      }
      const teacherCheckButton = event.target.closest("[data-teacher-check]");
      if (teacherCheckButton) {
        const container = teacherCheckButton.closest("div")?.parentElement;
        const feedback = container?.querySelector("[data-teacher-check-feedback]");
        if (feedback) {
          const isCorrect = teacherCheckButton.dataset.choice === teacherCheckButton.dataset.answer;
          feedback.textContent = isCorrect ? "✓ Correct! Great job, class!" : "✗ Not quite — let's review the steps together.";
          feedback.className = `material-check-feedback ${isCorrect ? "is-correct" : "is-incorrect"}`;
        }
      }
      if (event.target.closest("[data-close-teacher-material]") || event.target.id === "teacherMaterialModal") {
        closeTeacherMaterial();
      }
      const addResourceButton = event.target.closest("[data-add-resource]");
      if (addResourceButton) prepareResourceForm(addResourceButton.dataset.addResource);
      if (event.target.closest("[data-export]")) exportReport();
      if (event.target.closest("[data-logout]")) {
        try { sessionStorage.removeItem("numeread_teacher"); } catch (_) {}
        firebase.auth().signOut().finally(() => window.location.assign("index.html"));
      }
      if (event.target.closest("[data-class-path]")) {
        assignClassPaths().catch((error) => {
          $("#classMessage").textContent = error.message || "The class paths could not be assigned.";
        });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const modal = $("#teacherMaterialModal");
        if (modal && !modal.classList.contains("hidden")) {
          closeTeacherMaterial();
        }
      }
    });
  });
})();
