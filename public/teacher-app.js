(function () {
  const $ = (selector) => document.querySelector(selector);

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
    "Blends": { module: "Blends and Phonics Module", activities: ["Reading Bridge", "Sentence Builder"] },
    "Reading fluency": { module: "Reading Fluency Audio-Visual", activities: ["Sentence Builder", "Pronunciation Practice"] },
    "Vocabulary": { module: "Read-and-Solve Worksheet", activities: ["Vocabulary Quest", "Comprehension Trail"] },
    "Comprehension": { module: "Read-and-Solve Worksheet", activities: ["Comprehension Trail", "Sentence Builder"] },
    "Addition facts": { module: "Addition Facts Module", activities: ["Math Ninja", "Place Value Builder"] },
    "Subtraction": { module: "Addition Facts Module", activities: ["Subtraction Sprint", "Math Ninja"] },
    "Word problems": { module: "Word Problem Walkthrough", activities: ["Word Problem Bakery", "Math Ninja"] },
    "Place value": { module: "Addition Facts Module", activities: ["Place Value Builder", "Math Ninja"] }
  };

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
        <span><i class="fas fa-user"></i> ${escapeHtml(student.name)}</span>
        <span class="text-sm text-red-600">${escapeHtml(student.gaps.join(", ") || "Needs support")}</span>
        <button data-assign="${escapeHtml(student.id)}" class="text-xs bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-full">Assign personal path</button>
      </li>
    `).join("") : `<li class="text-sm text-gray-500">No learners below 50% right now.</li>`;

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
        <td class="px-5 py-3"><button data-assign="${escapeHtml(student.id)}" class="text-teal-600 text-sm underline">Assign personal path</button></td>
      </tr>
    `).join("");
    renderClassRecommendation(students);
  }

  async function render() {
    renderStudents(await window.NumeReadData.getStudentsForCurrentTeacher());
  }

  function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = String(value || "");
    return node.innerHTML;
  }

  async function renderLessons() {
    const list = await window.NumeReadData.getLearningMaterials();
    const holder = $("#lessonList");
    if (!holder) return;
    holder.innerHTML = list.length ? list.map((lesson) => `<article class="border border-orange-100 rounded-xl p-3"><p class="font-semibold">${escapeHtml(lesson.title)}</p><p class="text-xs text-gray-500">${escapeHtml(lesson.area)} · ${escapeHtml(lesson.level)} · ${escapeHtml(lesson.section)}</p><p class="text-sm mt-2">${escapeHtml(lesson.content || lesson.summary)}</p>${lesson.fileName ? `<p class="text-xs text-teal-700 mt-2"><i class="fas fa-paperclip"></i> ${escapeHtml(lesson.fileName)}</p>` : ""}</article>`).join("") : '<p class="text-sm text-gray-500">No lessons yet. Add one above to personalize matching game activities.</p>';
  }

  function readFile(file) {
    if (!file) return Promise.resolve({ fileName: "", fileType: "", fileData: "" });
    if (file.size > 650000) return Promise.reject(new Error("Please choose a file smaller than 650 KB."));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ fileName: file.name, fileType: file.type, fileData: reader.result });
      reader.onerror = () => reject(new Error("The file could not be read."));
      reader.readAsDataURL(file);
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
      const file = await readFile(formData.get("lessonFile"));
      const keywords = String(formData.get("keywords") || "").split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
      const gameQuestions = parseGameQuestions(formData.get("gameQuestions"));
      await window.NumeReadData.saveLearningMaterial({
        title: formData.get("title"), area: formData.get("area"), level: formData.get("level"), section: formData.get("section"),
        content: formData.get("content"), summary: formData.get("content"), keywords, gameQuestions, category: "Teacher Lesson Module", ...file
      });
      form.reset();
      status.textContent = "Lesson saved. Matching games will use it for the right learner and level.";
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
      await window.NumeReadData.saveLearningMaterial({
        title, sourceUrl, content, summary: content.slice(0, 240), keywords, activityIds,
        area: formData.get("area"), level: formData.get("level"), category: "Online Learning Link"
      });
      form.reset();
      status.textContent = `Added “${title}”. Students can open the source link from Learning Materials.${activityIds.length ? " The linked game will use this lesson text." : ""}`;
      await renderLessons();
      return;

      const token = await firebase.auth().currentUser?.getIdToken();
      if (!token) throw new Error("Sign in as a teacher first.");
      const legacyKeywords = String(formData.get("keywords") || "").split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
      const response = await fetch("/api/import-material", {
        method: "POST", headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({sourceUrl: formData.get("sourceUrl"), title: formData.get("title"), area: formData.get("area"), level: formData.get("level"), keywords: legacyKeywords})
      });
      const responseText = await response.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        // A Hosting/Functions routing failure may return an empty or HTML
        // response. Show a useful diagnostic instead of a JSON parser error.
        result = {};
      }
      if (!response.ok) {
        const serverMessage = result.error || result.message || responseText.trim();
        throw new Error(serverMessage || `The import service returned HTTP ${response.status}. Please ask the administrator to deploy the import function.`);
      }
      if (!result.id || !result.title) {
        throw new Error("The import service returned an incomplete response. Please ask the administrator to deploy the import function.");
      }
      form.reset();
      status.textContent = `Imported “${result.title}”. Students can now open it from Learning Materials.`;
      await renderLessons();
    } catch (error) {
      status.textContent = error.message || "The online material could not be imported.";
    } finally {
      submit.disabled = false;
    }
  }

  function exportReport() {
    window.NumeReadData.getStudentsForCurrentTeacher().then((students) => {
      const header = "Student,Grade,Reading,Math,XP,Streak,Gaps";
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
      link.download = "numeread-class-report.csv";
      link.click();
      URL.revokeObjectURL(url);
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
      $("#teacherSection").textContent = teacher.section;
      $("#lessonSection").value = teacher.section;
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
    document.addEventListener("click", (event) => {
      const assignButton = event.target.closest("[data-assign]");
      if (assignButton) assignPath(assignButton.dataset.assign);
      if (event.target.closest("[data-export]")) exportReport();
      if (event.target.closest("[data-logout]")) firebase.auth().signOut().finally(() => window.location.assign("index.html"));
      if (event.target.closest("[data-class-path]")) {
        assignClassPaths().catch((error) => {
          $("#classMessage").textContent = error.message || "The class paths could not be assigned.";
        });
      }
    });
  });
})();
