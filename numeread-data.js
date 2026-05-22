(function () {
  const STORE_KEY = "numeread_students_v1";
  const hasFirebaseConfig = () => {
    const config = window.NumeReadFirebaseConfig || {};
    return Boolean(config.apiKey && !String(config.apiKey).startsWith("PASTE_") && config.projectId && !String(config.projectId).startsWith("PASTE_"));
  };

  const seedStudents = [
    {
      id: "maria-r",
      name: "Maria R.",
      grade: "Grade 2",
      xp: 140,
      streak: 7,
      badges: ["Starter Star", "Blend Builder", "Number Scout"],
      reading: 64,
      math: 48,
      wpm: [28, 42, 56, 68],
      mastery: { "Addition facts": 55, Subtraction: 40, "Word problems": 38 },
      gaps: ["Blends", "Word problems"],
      activities: ["reading-bridge"]
    },
    {
      id: "james-r",
      name: "James R.",
      grade: "Grade 2",
      xp: 80,
      streak: 3,
      badges: ["Starter Star"],
      reading: 38,
      math: 42,
      wpm: [18, 24, 31, 35],
      mastery: { "Addition facts": 36, Subtraction: 44, "Word problems": 30 },
      gaps: ["Addition regrouping", "Reading fluency"],
      activities: []
    },
    {
      id: "sofia-c",
      name: "Sofia C.",
      grade: "Grade 2",
      xp: 110,
      streak: 5,
      badges: ["Starter Star", "Sound Hunter"],
      reading: 55,
      math: 61,
      wpm: [24, 33, 45, 52],
      mastery: { "Addition facts": 70, Subtraction: 48, "Word problems": 52 },
      gaps: ["Digraphs", "Place value"],
      activities: []
    },
    {
      id: "lea-m",
      name: "Lea M.",
      grade: "Grade 2",
      xp: 60,
      streak: 2,
      badges: ["Starter Star"],
      reading: 41,
      math: 39,
      wpm: [16, 22, 27, 32],
      mastery: { "Addition facts": 42, Subtraction: 30, "Word problems": 35 },
      gaps: ["Comprehension", "Subtraction"],
      activities: []
    }
  ];

  let db = null;

  function slugify(value) {
    return String(value || "student").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "student";
  }

  function normalizeStudent(student) {
    const id = student.id || slugify(student.name);
    return {
      id,
      name: student.name || "Student",
      grade: student.grade || "Grade 2",
      xp: Number(student.xp || 0),
      streak: Number(student.streak || 0),
      badges: Array.isArray(student.badges) ? student.badges : ["Starter Star"],
      reading: Number(student.reading || 0),
      math: Number(student.math || 0),
      wpm: Array.isArray(student.wpm) ? student.wpm : [0, 0, 0, 0],
      mastery: student.mastery || { "Addition facts": 0, Subtraction: 0, "Word problems": 0 },
      gaps: Array.isArray(student.gaps) ? student.gaps : [],
      activities: Array.isArray(student.activities) ? student.activities : [],
      pretest: student.pretest || null,
      assignedPath: student.assignedPath || "",
      updatedAt: student.updatedAt || new Date().toISOString()
    };
  }

  function localStudents() {
    const saved = localStorage.getItem(STORE_KEY);
    if (!saved) {
      localStorage.setItem(STORE_KEY, JSON.stringify(seedStudents));
      return seedStudents.map(normalizeStudent);
    }
    try {
      return JSON.parse(saved).map(normalizeStudent);
    } catch {
      localStorage.setItem(STORE_KEY, JSON.stringify(seedStudents));
      return seedStudents.map(normalizeStudent);
    }
  }

  function saveLocalStudents(students) {
    localStorage.setItem(STORE_KEY, JSON.stringify(students.map(normalizeStudent)));
  }

  async function initFirebase() {
    if (!hasFirebaseConfig() || !window.firebase) return false;
    if (!firebase.apps.length) firebase.initializeApp(window.NumeReadFirebaseConfig);
    db = firebase.firestore();
    return true;
  }

  async function getStudents() {
    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return localStudents();
      const snapshot = await db.collection("students").get();
      if (snapshot.empty) {
        await Promise.all(seedStudents.map((student) => db.collection("students").doc(student.id).set(normalizeStudent(student))));
        return seedStudents.map(normalizeStudent);
      }
      return snapshot.docs.map((doc) => normalizeStudent({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("NumeRead Firebase unavailable, using demo storage.", error);
      return localStudents();
    }
  }

  async function getOrCreateStudent(name, grade) {
    const id = slugify(name);
    const students = await getStudents();
    let student = students.find((item) => item.id === id || item.name.toLowerCase() === String(name).toLowerCase());
    if (!student) {
      student = normalizeStudent({ id, name, grade, xp: 0, streak: 1, badges: ["Starter Star"], reading: 0, math: 0, wpm: [0, 0, 0, 0] });
      await saveStudent(student);
    }
    return normalizeStudent({ ...student, grade: grade || student.grade });
  }

  async function saveStudent(student) {
    const normalized = normalizeStudent({ ...student, updatedAt: new Date().toISOString() });
    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        await db.collection("students").doc(normalized.id).set(normalized, { merge: true });
        return normalized;
      }
    } catch (error) {
      console.warn("NumeRead Firebase save failed, using demo storage.", error);
    }
    const students = localStudents();
    const index = students.findIndex((item) => item.id === normalized.id);
    if (index >= 0) students[index] = normalized;
    else students.push(normalized);
    saveLocalStudents(students);
    return normalized;
  }

  window.NumeReadData = {
    slugify,
    getStudents,
    getOrCreateStudent,
    saveStudent,
    usingFirebase: hasFirebaseConfig
  };
})();
