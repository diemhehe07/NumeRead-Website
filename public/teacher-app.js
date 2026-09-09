(function () {
  const $ = (selector) => document.querySelector(selector);
  // File data is stored in a Firestore document, where base64 encoding adds
  // roughly one third to the original size. This keeps uploads below 1 MiB.
  const MAX_RESOURCE_FILE_SIZE = 700 * 1024;
  const materialCatalog = [
    { id: "module-blends", title: "Blends and Phonics Module", area: "Reading", level: "Easy", icon: "fa-book-open", skill: "Blends" },
    { id: "av-fluency", title: "Reading Fluency Audio-Visual", area: "Reading", level: "Average", icon: "fa-video", skill: "Reading fluency" },
    { id: "module-addition", title: "Addition Facts Module", area: "Math", level: "Easy", icon: "fa-calculator", skill: "Addition facts" },
    { id: "av-word-problems", title: "Word Problem Walkthrough", area: "Math", level: "Intermediate", icon: "fa-circle-play", skill: "Word problems" },
    { id: "worksheet-read-solve", title: "Read-and-Solve Worksheet", area: "Reading and Math", level: "Average", icon: "fa-file-lines", skill: "Comprehension, Word problems" },
    { id: "challenge-set", title: "Advanced Challenge Set", area: "Reading and Math", level: "Advanced", icon: "fa-medal", skill: "Comprehension, Place value" },
    { id: "module-fractions", title: "Fraction Fundamentals: Slices of a Whole", area: "Math", level: "Easy", icon: "fa-pizza-slice", skill: "Fractions" },
    { id: "av-fraction-visuals", title: "Visual Fractions & Equivalent Slices Guide", area: "Math", level: "Average", icon: "fa-chart-pie", skill: "Fractions" },
    { id: "module-subtraction", title: "Subtraction Sprint & Number Line Guide", area: "Math", level: "Easy", icon: "fa-person-running", skill: "Subtraction" },
    { id: "module-place-value", title: "Place Value Power & Base-10 Blocks", area: "Math", level: "Average", icon: "fa-cubes-stacked", skill: "Place value" },
    { id: "module-vocab", title: "Vocabulary Clue Detective Guide", area: "Reading", level: "Easy", icon: "fa-magnifying-glass", skill: "Vocabulary" },
    { id: "module-comprehension", title: "Comprehension Clue Finder Module", area: "Reading", level: "Average", icon: "fa-compass", skill: "Comprehension" }
  ];

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

  function renderMaterialCatalog(materials, teacher) {
    const holder = $("#materialCatalogList");
    if (!holder) return;
    const hiddenBuiltInIds = new Set(materials
      .filter((item) => item.hiddenBuiltInId && item.teacherUid === teacher?.uid)
      .map((item) => item.hiddenBuiltInId));
    holder.innerHTML = materialCatalog.filter((material) => !hiddenBuiltInIds.has(material.id)).map((material) => {
      const resourceCount = materials.filter((item) => item.baseMaterialId === material.id).length;
      return `<article class="teacher-material-card">
        <i class="fas ${material.icon} teacher-material-card__icon"></i>
        <div class="teacher-material-card__body">
          <p class="teacher-material-card__meta">${escapeHtml(material.area)} · ${escapeHtml(material.level)}</p>
          <h4>${escapeHtml(material.title)}</h4>
          <p>${resourceCount ? `${resourceCount} teacher resource${resourceCount === 1 ? "" : "s"} attached` : "No teacher resource attached yet"}</p>
        </div>
        <button type="button" class="teacher-material-card__action" data-add-resource="${escapeHtml(material.id)}"><i class="fas fa-paperclip"></i><span>Add resource</span></button>
        <button type="button" class="teacher-material-card__delete" data-delete-built-in="${escapeHtml(material.id)}" data-material-title="${escapeHtml(material.title)}" aria-label="Remove ${escapeHtml(material.title)}" title="Remove material"><i class="fas fa-xmark"></i></button>
      </article>`;
    }).join("");

    const teacherResources = materials.filter((material) => material.teacherUid && !material.hiddenBuiltInId);
    holder.insertAdjacentHTML("beforeend", teacherResources.map((material) => {
      const isOwner = material.teacherUid === teacher?.uid;
      const accessLabel = material.sourceUrl ? "Open link" : material.fileName ? "Attached file" : "Text lesson";
      return `<article class="teacher-material-card teacher-material-card--resource">
        <i class="fas ${material.fileName ? "fa-paperclip" : material.sourceUrl ? "fa-link" : "fa-file-lines"} teacher-material-card__icon"></i>
        <div class="teacher-material-card__body">
          <p class="teacher-material-card__meta">${escapeHtml(material.area)} · ${escapeHtml(material.level)} · Teacher resource</p>
          <h4>${escapeHtml(material.title)}</h4>
          <p>${escapeHtml(material.fileName || accessLabel)}</p>
        </div>
        ${isOwner ? `<button type="button" class="teacher-material-card__delete" data-delete-material="${escapeHtml(material.id)}" data-material-title="${escapeHtml(material.title)}" aria-label="Delete ${escapeHtml(material.title)}" title="Delete material"><i class="fas fa-xmark"></i></button>` : ""}
      </article>`;
    }).join(""));
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
    queueMicrotask(() => {
      if (!teacher?.uid) return;
      holder.querySelectorAll("article").forEach((card, index) => {
        const lesson = list[index];
        if (!lesson || lesson.teacherUid !== teacher.uid) return;
        card.insertAdjacentHTML("beforeend", `<button type="button" data-delete-material="${escapeHtml(lesson.id)}" data-material-title="${escapeHtml(lesson.title)}" class="block mt-3 text-xs text-red-600 hover:text-red-700"><i class="fas fa-trash-can"></i> Delete material</button>`);
      });
    });
    holder.innerHTML = list.length ? list.map((lesson) => `<article class="border border-orange-100 rounded-xl p-3"><p class="font-semibold">${escapeHtml(lesson.title)}</p><p class="text-xs text-gray-500">${escapeHtml(lesson.area)} · ${escapeHtml(lesson.level)} · ${escapeHtml(lesson.section)}</p><p class="text-sm mt-2">${escapeHtml(lesson.content || lesson.summary)}</p>${lesson.sourceUrl ? `<a href="${escapeHtml(lesson.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs text-teal-700 mt-2"><i class="fas fa-circle-play"></i> Online material</a>` : lesson.fileName ? `<p class="text-xs text-teal-700 mt-2"><i class="fas fa-paperclip"></i> ${escapeHtml(lesson.fileName)}</p>` : ""}</article>`).join("") : '<p class="text-sm text-gray-500">No lessons yet. Add one above to personalize matching game activities.</p>';
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
      await window.NumeReadData.saveLearningMaterial({
        title: formData.get("title"), area: formData.get("area"), level: formData.get("level"), section: formData.get("section"),
        sourceUrl, content: content || "Open the teacher resource to begin this lesson.", summary: (content || file?.name || "Online learning material").slice(0, 240), keywords, gameQuestions,
        baseMaterialId: String(formData.get("baseMaterialId") || ""), fileName: hasFile ? file.name : "", fileType: hasFile ? file.type : "", fileSize: hasFile ? file.size : 0, fileData,
        category: hasFile ? "Teacher File Resource" : sourceUrl ? "Online Learning Material" : "Teacher Text Module"
      });
      form.reset();
      const teacher = await window.NumeReadData.currentTeacher();
      if (teacher) $("#lessonSection").value = teacher.section;
      status.textContent = hasFile ? "File resource saved. Students can open it from Learning Materials." : sourceUrl ? "Online material saved. Students can open the card and access it online." : "Text module saved. Students can read it when they open the card.";
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
      const deleteMaterialButton = event.target.closest("[data-delete-material]");
      if (deleteMaterialButton) deleteLesson(deleteMaterialButton);
      const deleteBuiltInButton = event.target.closest("[data-delete-built-in]");
      if (deleteBuiltInButton) hideBuiltInMaterial(deleteBuiltInButton);
      const addResourceButton = event.target.closest("[data-add-resource]");
      if (addResourceButton) prepareResourceForm(addResourceButton.dataset.addResource);
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
