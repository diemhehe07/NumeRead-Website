(function () {
  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const photo = document.getElementById("profilePhoto");
  const photoInput = document.getElementById("photoInput");
  const photoStatus = document.getElementById("photoStatus");
  let student = null;

  const photoKey = (studentId) => `numeread_profile_photo_${studentId}`;
  const defaultPhoto = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='64' fill='%23fff7ed'/%3E%3Ccircle cx='64' cy='48' r='24' fill='%23fb923c'/%3E%3Cpath d='M20 120c5-28 22-42 44-42s39 14 44 42' fill='%23fb923c'/%3E%3C/svg%3E";
  const setText = (id, value) => { document.getElementById(id).textContent = value || "—"; };

  function showPhoto() {
    const savedPhoto = student?.id ? localStorage.getItem(photoKey(student.id)) : "";
    if (savedPhoto) {
      photo.src = savedPhoto;
      photo.classList.remove("profile-photo-fallback");
      photo.alt = `${student.name}'s profile picture`;
    } else {
      photo.src = defaultPhoto;
      photo.classList.add("profile-photo-fallback");
      photo.alt = "No profile picture selected";
    }
  }

  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("The selected photo could not be read."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("The selected file is not a valid image."));
        image.onload = () => {
          const limit = 320;
          const scale = Math.min(1, limit / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file || !student) return;
    if (!file.type.startsWith("image/")) {
      photoStatus.textContent = "Please choose an image file.";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      photoStatus.textContent = "Choose a photo smaller than 8 MB.";
      return;
    }
    photoStatus.textContent = "Saving your photo…";
    try {
      localStorage.setItem(photoKey(student.id), await resizeImage(file));
      showPhoto();
      photoStatus.textContent = "Profile picture updated.";
    } catch (error) {
      console.error("Profile photo error:", error);
      photoStatus.textContent = "We could not save that photo. Please try a different one.";
    } finally {
      photoInput.value = "";
    }
  }

  async function init() {
    let stored;
    try { stored = JSON.parse(sessionStorage.getItem("numeread_student") || "null"); } catch { stored = null; }
    if (!stored?.name || !stored?.lrn || !window.NumeReadData) {
      window.location.replace("index.html");
      return;
    }
    student = await window.NumeReadData.authenticateStudent(stored.name, stored.lrn);
    if (!student || student.id !== stored.id) {
      sessionStorage.removeItem("numeread_student");
      window.location.replace("index.html");
      return;
    }
    setText("profileName", student.name);
    setText("detailName", student.name);
    setText("detailGrade", student.gradeSection || student.grade);
    setText("detailLrn", student.lrn);
    setText("detailXp", `${student.xp || 0} XP`);
    showPhoto();
  }

  document.getElementById("changePhotoButton").addEventListener("click", () => photoInput.click());
  document.getElementById("choosePhotoButton").addEventListener("click", () => photoInput.click());
  document.getElementById("removePhotoButton").addEventListener("click", () => {
    if (!student) return;
    localStorage.removeItem(photoKey(student.id));
    showPhoto();
    photoStatus.textContent = "Profile picture removed.";
  });
  photoInput.addEventListener("change", choosePhoto);
  init();
})();
