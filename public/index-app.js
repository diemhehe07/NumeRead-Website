(function () {
  window.addEventListener("DOMContentLoaded", () => {
    const studentForm = document.querySelector("[data-student-form]");
    const teacherForm = document.querySelector("[data-teacher-form]");
    const status = document.querySelector("[data-login-status]");
    if (!studentForm || !window.NumeReadData) return;

    const lrnInput = studentForm.elements.lrn;
    lrnInput.addEventListener("input", () => {
      lrnInput.value = lrnInput.value.replace(/\D/g, "").slice(0, 12);
    });

    studentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(studentForm);
      const studentName = String(formData.get("studentName") || "").trim();
      const lrn = String(formData.get("lrn") || "").trim();
      
      status.textContent = "Signing in...";
      
      try {
        const student = await window.NumeReadData.authenticateStudent(studentName, lrn);
        if (!student) {
          status.textContent = "We couldn't find a registration matching that name and LRN.";
          return;
        }
        
        // Store student data for session
        sessionStorage.setItem('numeread_student', JSON.stringify(student));
        
        const params = new URLSearchParams({ 
          studentName: student.fullName || studentName, 
          grade: student.grade,
          lrn: student.lrn
        });
        window.location.href = `student.html?${params.toString()}`;
      } catch (err) {
        status.textContent = "Error: " + err.message;
        console.error(err);
      }
    });

    teacherForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "Signing in to the teacher dashboard…";
      const data = new FormData(teacherForm);
      const result = await window.NumeReadData.loginTeacher(data.get("email"), data.get("password"));
      if (!result.success) { status.textContent = result.message; return; }
      window.location.assign("teacher.html");
    });
  });
})();
