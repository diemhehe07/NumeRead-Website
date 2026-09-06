(function() {
  // Wait for NumeReadData to be available
  function init() {
    if (!window.NumeReadData) {
      setTimeout(init, 100);
      return;
    }

    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');

    // Hide messages initially
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    // Middle initial: uppercase and max 2 chars
    const miInput = document.getElementById('middleInitial');
    miInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Clear previous messages
      errorDiv.classList.remove('show');
      successDiv.classList.remove('show');

      // Gather fields
      const lastName = document.getElementById('lastName').value.trim();
      const firstName = document.getElementById('firstName').value.trim();
      const middleInitial = document.getElementById('middleInitial').value.trim();
      const gradeSection = document.getElementById('gradeSection').value;
      // Basic validation
      if (!lastName || !firstName) {
        errorText.innerText = 'Last name and First name are required.';
        errorDiv.classList.add('show');
        return;
      }

      try {
        // Attempt registration
        const result = await window.NumeReadData.registerStudent(
          lastName,
          firstName,
          middleInitial,
          gradeSection
        );

        if (!result.success) {
          errorText.innerText = result.message;
          errorDiv.classList.add('show');
          return;
        }

        // Success!
        const student = result.student;
        successText.innerText = `Registration successful! Your student ID is ${student.studentId}.`;
        successDiv.classList.add('show');

        // Store student data for auto-login
        sessionStorage.setItem('numeread_student', JSON.stringify(student));

        // Redirect after brief delay
        setTimeout(() => {
          const params = new URLSearchParams({
            studentName: student.name,
            grade: student.gradeSection,
            section: student.section,
            studentId: student.studentId,
            registered: 'true'
          });
          window.location.href = `student.html?${params.toString()}`;
        }, 1500);

      } catch (err) {
        errorText.innerText = 'Registration error: ' + err.message;
        errorDiv.classList.add('show');
      }
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
