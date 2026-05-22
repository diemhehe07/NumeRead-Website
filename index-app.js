(function () {
  window.addEventListener("DOMContentLoaded", () => {
    const studentForm = document.querySelector("[data-student-form]");
    const status = document.querySelector("[data-login-status]");
    if (!studentForm || !window.NumeReadData) return;

    status.textContent = window.NumeReadData.usingFirebase() ? "Firebase connected" : "Demo mode: local browser storage";

    studentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(studentForm);
      const studentName = formData.get("studentName") || "Student";
      const grade = formData.get("grade") || "Grade 2";
      status.textContent = "Preparing learner profile...";
      await window.NumeReadData.getOrCreateStudent(studentName, grade);
      const params = new URLSearchParams({ studentName, grade });
      window.location.href = `student.html?${params.toString()}`;
    });
  });
})();
