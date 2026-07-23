(function () {
  window.addEventListener("DOMContentLoaded", () => {
    const studentForm = document.querySelector("[data-student-form]");
    const status = document.querySelector("[data-login-status]");
    if (!studentForm || !window.NumeReadData) return;

    status.textContent = window.NumeReadData.usingFirebase() ? "Firebase connected" : "Demo mode: local browser storage";

    studentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(studentForm);
      let studentName = formData.get("studentName") || "Student";
      const grade = formData.get("grade") || "Grade 2";
      
      status.textContent = "Preparing learner profile...";
      
      try {
        // Check if student exists or create new one
        const student = await window.NumeReadData.getOrCreateStudent(studentName, grade);
        
        // Store student data for session
        sessionStorage.setItem('numeread_student', JSON.stringify(student));
        
        const params = new URLSearchParams({ 
          studentName: student.fullName || studentName, 
          grade: grade,
          lrn: student.lrn || ''
        });
        window.location.href = `student.html?${params.toString()}`;
      } catch (err) {
        status.textContent = "Error: " + err.message;
        console.error(err);
      }
    });
  });
})();