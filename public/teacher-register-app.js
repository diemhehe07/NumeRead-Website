(function () {
  const form = document.getElementById("teacherRegisterForm");
  const status = document.getElementById("teacherRegisterStatus");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Creating your account…";
    const result = await window.NumeReadData.registerTeacher({
      name: document.getElementById("teacherName").value,
      email: document.getElementById("teacherEmail").value,
      password: document.getElementById("teacherPassword").value,
      section: document.getElementById("teacherSection").value
    });
    if (!result.success) { status.textContent = result.message; return; }
    status.textContent = "Account created. Check your email to verify it, then sign in.";
    form.reset();
  });
})();
