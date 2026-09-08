(function () {
  window.addEventListener("DOMContentLoaded", () => {
    const studentForm = document.querySelector("[data-student-form]");
    const teacherForm = document.querySelector("[data-teacher-form]");
    const status = document.querySelector("[data-login-status]");
    const roleButtons = document.querySelectorAll("[data-role-button]");
    const rolePanels = document.querySelectorAll("[data-role-panel]");
    const drawer = document.querySelector("[data-register-drawer]");
    const registerButtons = document.querySelectorAll("[data-open-register]");
    const registerForms = document.querySelectorAll("[data-register-form]");
    const drawerIndicator = document.querySelector("[data-register-indicator]");
    const drawerDescription = document.querySelector("[data-register-description]");
    const drawerStatus = document.querySelector("[data-register-status]");
    const learningBackground = document.querySelector(".learning-background");
    if (!studentForm || !window.NumeReadData) return;

    // Let the decorative learning pieces react playfully without affecting the forms.
    document.addEventListener("click", (event) => {
      if (!learningBackground) return;

      const shape = event.target.closest(".learning-background__shape");
      if (shape) {
        const expanded = shape.classList.toggle("is-expanded");
        shape.style.setProperty("--item-scale", expanded ? "1.65" : "1");
        return;
      }

      // A click anywhere on the page gives each letter/number a short new drift direction.
      learningBackground.querySelectorAll(".learning-background__token").forEach((token) => {
        const box = token.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const distanceX = Math.max(-42, Math.min(42, (centerX - event.clientX) * 0.12));
        const distanceY = Math.max(-36, Math.min(36, (centerY - event.clientY) * 0.1));
        token.style.setProperty("--nudge-x", `${distanceX}px`);
        token.style.setProperty("--nudge-y", `${distanceY}px`);
      });
    });

    function selectRole(role) {
      roleButtons.forEach((button) => {
        const selected = button.dataset.roleButton === role;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      rolePanels.forEach((panel) => {
        const selected = panel.dataset.rolePanel === role;
        panel.hidden = !selected;
        if (selected) panel.querySelector("input, select")?.focus();
      });
      status.textContent = "";
    }

    roleButtons.forEach((button) => button.addEventListener("click", () => selectRole(button.dataset.roleButton)));

    function closeRegister() {
      drawer?.classList.remove("is-open");
      drawer?.setAttribute("aria-hidden", "true");
      document.body.classList.remove("register-modal-open");
      drawerStatus.textContent = "";
    }

    function openRegister(role) {
      drawer?.classList.add("is-open");
      drawer?.classList.toggle("is-teacher", role === "teacher");
      drawer?.setAttribute("aria-hidden", "false");
      document.body.classList.add("register-modal-open");
      drawerStatus.textContent = "";
      registerForms.forEach((form) => {
        const selected = form.dataset.registerForm === role;
        form.hidden = !selected;
        if (selected) form.querySelector("input, select")?.focus();
      });
      const isTeacher = role === "teacher";
      drawerIndicator.textContent = `Registering as ${isTeacher ? "Teacher" : "Student"}`;
      drawerDescription.textContent = isTeacher
        ? "Create your account, then verify the email link before signing in."
        : "Complete the form to receive your Student ID.";
    }

    registerButtons.forEach((button) => button.addEventListener("click", () => openRegister(button.dataset.openRegister)));
    drawer?.querySelectorAll("[data-close-register]").forEach((button) => button.addEventListener("click", closeRegister));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeRegister(); });

    const studentIdInput = studentForm.elements.studentId;
    studentIdInput.addEventListener("input", () => {
      studentIdInput.value = studentIdInput.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 9);
    });

    studentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(studentForm);
      const studentName = String(formData.get("studentName") || "").trim();
      const section = String(formData.get("section") || "").trim();
      const studentId = String(formData.get("studentId") || "").trim().toUpperCase();
      
      status.textContent = "Signing in...";
      
      try {
        const student = await window.NumeReadData.authenticateStudent(studentName, section, studentId);
        if (!student) {
          status.textContent = "We couldn't find a registration matching that name, section, and student ID.";
          return;
        }
        
        // Store student data for session
        sessionStorage.setItem('numeread_student', JSON.stringify(student));
        
        const params = new URLSearchParams({ 
          studentName: student.fullName || studentName, 
          grade: student.grade,
          section: student.section,
          studentId: student.studentId
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

    const studentRegisterForm = document.querySelector('[data-register-form="student"]');
    studentRegisterForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(studentRegisterForm);
      drawerStatus.textContent = "Creating your student account...";
      const result = await window.NumeReadData.registerStudent(data.get("lastName"), data.get("firstName"), data.get("middleInitial"), data.get("section"));
      if (!result.success) { drawerStatus.textContent = result.message; return; }
      drawerStatus.textContent = `Account created. Your Student ID is ${result.student.studentId}. Opening your dashboard...`;
      sessionStorage.setItem("numeread_student", JSON.stringify(result.student));
      window.setTimeout(() => window.location.assign(`student.html?${new URLSearchParams({ studentName: result.student.name, section: result.student.section, studentId: result.student.studentId })}`), 1500);
    });

    const teacherRegisterForm = document.querySelector('[data-register-form="teacher"]');
    teacherRegisterForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(teacherRegisterForm);
      drawerStatus.textContent = "Creating your teacher account...";
      const result = await window.NumeReadData.registerTeacher({ name: data.get("name"), email: data.get("email"), password: data.get("password"), section: data.get("section") });
      if (!result.success) { drawerStatus.textContent = result.message; return; }
      teacherRegisterForm.reset();
      drawerStatus.textContent = "Account created. Check your email to verify it, then sign in.";
    });
  });
})();
