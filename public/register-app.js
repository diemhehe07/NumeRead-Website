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

    // LRN input: only digits, max 12
    const lrnInput = document.getElementById('lrn');
    lrnInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').slice(0, 12);
    });

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
      const lrnRaw = document.getElementById('lrn').value.trim();

      // Basic validation
      if (!lastName || !firstName || !lrnRaw) {
        errorText.innerText = 'Last name, First name, and LRN are required.';
        errorDiv.classList.add('show');
        return;
      }

      if (lrnRaw.length !== 12 || !/^\d{12}$/.test(lrnRaw)) {
        errorText.innerText = 'LRN must be exactly 12 digits.';
        errorDiv.classList.add('show');
        return;
      }

      try {
        // Attempt registration
        const result = await window.NumeReadData.registerStudent(
          lastName,
          firstName,
          middleInitial,
          gradeSection,
          lrnRaw
        );

        if (!result.success) {
          errorText.innerText = result.message;
          errorDiv.classList.add('show');
          return;
        }

        // Success!
        const student = result.student;
        successText.innerText = `✅ Registration successful! Welcome, ${student.fullName}`;
        successDiv.classList.add('show');

        // Store student data for auto-login
        sessionStorage.setItem('numeread_student', JSON.stringify(student));

        // Redirect after brief delay
        setTimeout(() => {
          const params = new URLSearchParams({
            studentName: student.fullName,
            grade: student.gradeSection,
            lrn: student.lrn,
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