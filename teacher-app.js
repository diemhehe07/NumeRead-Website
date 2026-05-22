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
    const students = await window.NumeReadData.getStudents();
    const student = students.find((item) => item.id === studentId);
    if (!student) return;
    student.assignedPath = student.reading < student.math ? "Reading fluency path" : "Numeracy recovery path";
    student.updatedAt = new Date().toISOString();
    await window.NumeReadData.saveStudent(student);
    await render();
  }

  async function render() {
    const students = await window.NumeReadData.getStudents();
    const readingAvg = avg(students, "reading");
    const mathAvg = avg(students, "math");
    const struggling = students.filter((student) => student.reading < 50 || student.math < 50);

    $("#firebaseStatus").textContent = window.NumeReadData.usingFirebase() ? "Firebase connected" : "Demo storage";
    $("#totalStudents").textContent = students.length;
    $("#avgReading").textContent = `${readingAvg}%`;
    $("#avgReadingBar").style.width = `${readingAvg}%`;
    $("#avgMath").textContent = `${mathAvg}%`;
    $("#avgMathBar").style.width = `${mathAvg}%`;
    $("#strugglingCount").textContent = struggling.length;

    $("#strugglingList").innerHTML = struggling.length ? struggling.map((student) => `
      <li class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-3">
        <span><i class="fas fa-user"></i> ${student.name}</span>
        <span class="text-sm text-red-600">${student.gaps.join(", ") || "Needs support"}</span>
        <button data-assign="${student.id}" class="text-xs bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-full">Assign AI module</button>
      </li>
    `).join("") : `<li class="text-sm text-gray-500">No learners below 50% right now.</li>`;

    $("#studentRows").innerHTML = students.map((student) => `
      <tr>
        <td class="px-5 py-3 font-medium">${student.name}</td>
        <td class="px-5 py-3">
          <div class="flex items-center gap-2">
            <span class="text-xs">${level(student.reading)}</span>
            <div class="w-24 bg-gray-200 rounded-full h-1.5"><div class="${barColor(student.reading)} h-1.5 rounded-full" style="width:${student.reading}%"></div></div>
            <span class="text-xs text-gray-500">${student.reading}%</span>
          </div>
        </td>
        <td class="px-5 py-3">${student.math}%</td>
        <td class="px-5 py-3 text-sm">${student.gaps.join(", ") || "On track"}</td>
        <td class="px-5 py-3 text-sm">${student.assignedPath || "Adaptive path pending"}</td>
        <td class="px-5 py-3"><button data-assign="${student.id}" class="text-teal-600 text-sm underline">Assign path</button></td>
      </tr>
    `).join("");
  }

  function exportReport() {
    window.NumeReadData.getStudents().then((students) => {
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
    render();
    document.addEventListener("click", (event) => {
      const assignButton = event.target.closest("[data-assign]");
      if (assignButton) assignPath(assignButton.dataset.assign);
      if (event.target.closest("[data-export]")) exportReport();
      if (event.target.closest("[data-class-path]")) {
        document.querySelector("#classMessage").textContent = "Whole-class path generated: daily fluency warm-up, number bonds, then word-problem practice.";
      }
    });
  });
})();
