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

  async function assignPath(studentId) {
    const students = await window.NumeReadData.getStudentsForCurrentTeacher();
    const student = students.find((item) => item.id === studentId);
    if (!student) return;
    student.assignedPath = student.reading < student.math ? "Reading fluency path" : "Numeracy recovery path";
    student.updatedAt = new Date().toISOString();
    await window.NumeReadData.saveStudent(student);
    await window.NumeReadData.saveTeacherAction({
      type: "assign-path",
      studentId: student.id,
      studentName: student.name,
      assignedPath: student.assignedPath
    });
    await render();
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
        <button data-assign="${escapeHtml(student.id)}" class="text-xs bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-full">Assign AI module</button>
      </li>
    `).join("") : `<li class="text-sm text-gray-500">No learners below 50% right now.</li>`;

    $("#studentRows").innerHTML = students.map((student) => `
      <tr>
        <td class="px-5 py-3 font-medium">${escapeHtml(student.name)}</td>
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
        <td class="px-5 py-3"><button data-assign="${escapeHtml(student.id)}" class="text-teal-600 text-sm underline">Assign path</button></td>
      </tr>
    `).join("");
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

  async function saveLesson(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const status = $("#lessonStatus");
    try {
      status.textContent = "Saving lesson…";
      const file = await readFile(formData.get("lessonFile"));
      const keywords = String(formData.get("keywords") || "").split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
      await window.NumeReadData.saveLearningMaterial({
        title: formData.get("title"), area: formData.get("area"), level: formData.get("level"), section: formData.get("section"),
        content: formData.get("content"), summary: formData.get("content"), keywords, category: "Teacher Lesson Module", ...file
      });
      form.reset();
      status.textContent = "Lesson saved. Matching games will use it for the right learner and level.";
      await renderLessons();
    } catch (error) { status.textContent = error.message || "Lesson could not be saved."; }
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
      if (!teacher) { window.location.replace("index.html"); return; }
      $("#teacherSection").textContent = teacher.section;
      $("#lessonSection").value = teacher.section;
      $("#firebaseStatus").textContent = "Secure connection";
      await render();
      await renderLessons();
    })().catch((error) => { console.error(error); window.location.replace("index.html"); });
    $("#lessonForm")?.addEventListener("submit", saveLesson);
    document.addEventListener("click", (event) => {
      const assignButton = event.target.closest("[data-assign]");
      if (assignButton) assignPath(assignButton.dataset.assign);
      if (event.target.closest("[data-export]")) exportReport();
      if (event.target.closest("[data-logout]")) firebase.auth().signOut().finally(() => window.location.assign("index.html"));
      if (event.target.closest("[data-class-path]")) {
        document.querySelector("#classMessage").textContent = "Whole-class path generated: daily fluency warm-up, number bonds, then word-problem practice.";
      }
    });
  });
})();
