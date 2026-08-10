// numeread-data.js - Data layer with registration and duplicate checking
(function () {
  const STORE_KEY = "numeread_students_v1";
  const COLLECTIONS = {
    students: "students",
    pretests: "pretestResults",
    activities: "activityLogs",
    teacherActions: "teacherActions",
    learningMaterials: "learningMaterials",
    teacherAccounts: "teacherAccounts"
  };

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
      mastery: { "Addition facts": 55, Subtraction: 40, "Word problems": 38, "Place value": 45, Vocabulary: 50, Comprehension: 46 },
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
      mastery: { "Addition facts": 36, Subtraction: 44, "Word problems": 30, "Place value": 35, Vocabulary: 38, Comprehension: 32 },
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
      mastery: { "Addition facts": 70, Subtraction: 48, "Word problems": 52, "Place value": 58, Vocabulary: 60, Comprehension: 55 },
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
      mastery: { "Addition facts": 42, Subtraction: 30, "Word problems": 35, "Place value": 36, Vocabulary: 40, Comprehension: 34 },
      gaps: ["Comprehension", "Subtraction"],
      activities: []
    }
  ];

  let db = null;
  let firebaseReady = false;

  function slugify(value) {
    return String(value || "student").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "student";
  }

  // Helper: build full name from components
  function buildFullName(lastName, firstName, middleInitial) {
    const last = lastName ? lastName.trim() : '';
    const first = firstName ? firstName.trim() : '';
    const mi = middleInitial ? middleInitial.trim().toUpperCase() : '';
    const middlePart = mi ? mi.charAt(0) + '.' : '';
    const full = `${first} ${middlePart} ${last}`.replace(/\s+/g, ' ').trim();
    return full || 'Student';
  }

  // Helper: generate unique ID from components
  function generateStudentId(lastName, firstName, lrn) {
    const last = slugify(lastName);
    const first = slugify(firstName);
    const lrnPart = lrn ? lrn.slice(-6) : '000000';
    return `${last}-${first}-${lrnPart}`;
  }

  function normalizeStudent(student) {
    // Handle both old format (name) and new format (firstName, lastName)
    let name = student.name || '';
    if (!name && student.firstName && student.lastName) {
      name = buildFullName(student.lastName, student.firstName, student.middleInitial);
    }
    if (!name) name = 'Student';

    const id = student.id || slugify(name) + '-' + (student.lrn ? student.lrn.slice(-6) : Date.now().toString().slice(-6));
    
    return {
      id,
      name: name,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      middleInitial: student.middleInitial || '',
      grade: student.grade || "Grade 2",
      gradeSection: student.gradeSection || student.grade || "Grade 2",
      section: student.section || student.gradeSection || "Section A",
      lrn: student.lrn || '',
      xp: Number(student.xp || 0),
      streak: Number(student.streak || 0),
      badges: Array.isArray(student.badges) ? student.badges : ["Starter Star"],
      reading: Number(student.reading || 0),
      math: Number(student.math || 0),
      wpm: Array.isArray(student.wpm) ? student.wpm : [0, 0, 0, 0],
      mastery: {
        "Addition facts": 0,
        Subtraction: 0,
        "Word problems": 0,
        "Place value": 0,
        Vocabulary: 0,
        Comprehension: 0,
        ...(student.mastery || {})
      },
      gaps: Array.isArray(student.gaps) ? student.gaps : [],
      activities: Array.isArray(student.activities) ? student.activities : [],
      materialsCompleted: Array.isArray(student.materialsCompleted) ? student.materialsCompleted : [],
      pretest: student.pretest || null,
      posttest: student.posttest || null,
      assignedPath: student.assignedPath || "",
      createdAt: student.createdAt || new Date().toISOString(),
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
    if (!hasFirebaseConfig() || !window.firebase || !firebase.firestore) return false;
    if (!firebase.apps.length) firebase.initializeApp(window.NumeReadFirebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
    return true;
  }

  function serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  function studentRef(studentId) {
    return db.collection(COLLECTIONS.students).doc(studentId);
  }

  async function seedFirebaseStudents() {
    const batch = db.batch();
    seedStudents.map(normalizeStudent).forEach((student) => {
      batch.set(studentRef(student.id), {
        ...student,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    });
    await batch.commit();
  }

  async function getStudents() {
    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return localStudents();
      const snapshot = await db.collection(COLLECTIONS.students).orderBy("name").get();
      if (snapshot.empty) {
        await seedFirebaseStudents();
        return seedStudents.map(normalizeStudent);
      }
      return snapshot.docs.map((doc) => normalizeStudent({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("NumeRead Firebase unavailable, using demo storage.", error);
      return localStudents();
    }
  }

  // ============================================
  // REGISTRATION FUNCTIONS
  // ============================================

  // Check duplicate by full name or LRN
  async function isDuplicateStudent(lastName, firstName, middleInitial, lrn) {
    const students = await getStudents();
    const fullName = buildFullName(lastName, firstName, middleInitial);
    const normalizedFull = fullName.trim().toLowerCase();
    const normalizedLrn = lrn.trim();

    return students.some(s => {
      const existingFull = s.name ? s.name.toLowerCase() : '';
      const existingLrn = s.lrn ? s.lrn.trim() : '';
      // Check by full name (case-insensitive) or LRN
      if (existingFull === normalizedFull) return true;
      if (existingLrn === normalizedLrn && normalizedLrn) return true;
      // Also check by firstName + lastName combo
      if (s.firstName && s.lastName) {
        const sFull = buildFullName(s.lastName, s.firstName, s.middleInitial).toLowerCase();
        if (sFull === normalizedFull) return true;
      }
      return false;
    });
  }

  // Register a new student with full details
  async function registerStudent(lastName, firstName, middleInitial, gradeSection, lrn) {
    // Validate LRN format
    const lrnClean = lrn ? lrn.replace(/\s/g, '') : '';
    if (!lrnClean || !/^\d{12}$/.test(lrnClean)) {
      return { success: false, message: 'LRN must be exactly 12 digits.' };
    }

    // Validate required fields
    if (!lastName || !firstName) {
      return { success: false, message: 'Last name and First name are required.' };
    }

    // Check duplicates
    const duplicate = await isDuplicateStudent(lastName, firstName, middleInitial, lrnClean);
    if (duplicate) {
      return { 
        success: false, 
        message: 'A student with this full name or LRN already exists. Please use a unique name and LRN.' 
      };
    }

    // Build full name
    const fullName = buildFullName(lastName, firstName, middleInitial);
    const id = generateStudentId(lastName, firstName, lrnClean);

    // Create student object
    const newStudent = {
      id: id,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleInitial: middleInitial ? middleInitial.trim().toUpperCase() : '',
      grade: gradeSection || 'Grade 2',
      gradeSection: gradeSection || 'Grade 2',
      lrn: lrnClean,
      xp: 0,
      streak: 1,
      badges: ["Starter Star"],
      reading: 0,
      math: 0,
      wpm: [0, 0, 0, 0],
      mastery: {
        "Addition facts": 0,
        Subtraction: 0,
        "Word problems": 0,
        "Place value": 0,
        Vocabulary: 0,
        Comprehension: 0
      },
      gaps: [],
      activities: [],
      materialsCompleted: [],
      pretest: null,
      posttest: null,
      assignedPath: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save the student
    try {
      const saved = await saveStudent(newStudent);
      return { success: true, student: saved };
    } catch (error) {
      console.error('Registration save error:', error);
      return { success: false, message: 'Failed to save student. Please try again.' };
    }
  }

  async function getOrCreateStudent(name, grade) {
    const id = slugify(name);
    const students = await getStudents();
    let student = students.find((item) => item.id === id || item.name.toLowerCase() === String(name).toLowerCase());
    if (!student) return null;
    if (grade && student.grade !== grade) {
      student = await saveStudent({ ...student, grade });
    }
    return normalizeStudent(student);
  }

  async function saveStudent(student) {
    const normalized = normalizeStudent({ ...student, updatedAt: new Date().toISOString() });
    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        await studentRef(normalized.id).set({
          ...normalized,
          updatedAtServer: serverTimestamp()
        }, { merge: true });
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

  // Find student by LRN
  async function findStudentByLRN(lrn) {
    const clean = lrn ? lrn.trim() : '';
    if (!clean) return null;
    const students = await getStudents();
    return students.find(s => s.lrn === clean) || null;
  }

  // Find student by full name
  async function findStudentByName(name) {
    const students = await getStudents();
    return students.find(s => s.name.toLowerCase() === name.trim().toLowerCase()) || null;
  }

  // A student may sign in only when both details match an existing registration.
  async function authenticateStudent(name, lrn) {
    const fullName = String(name || '').trim().toLowerCase();
    const cleanLrn = String(lrn || '').replace(/\s/g, '');
    if (!fullName || !/^\d{12}$/.test(cleanLrn)) return null;
    const students = await getStudents();
    return students.find((student) =>
      String(student.name || '').trim().toLowerCase() === fullName && student.lrn === cleanLrn
    ) || null;
  }

  async function savePretestResult(student, result) {
    const normalized = normalizeStudent(student);
    const payload = {
      studentId: normalized.id,
      studentName: normalized.name,
      grade: normalized.grade,
      readingCorrect: Number(result.readingCorrect || 0),
      mathCorrect: Number(result.mathCorrect || 0),
      readingScore: Number(normalized.reading || 0),
      mathScore: Number(normalized.math || 0),
      gaps: normalized.gaps,
      takenAt: result.takenAt || new Date().toISOString()
    };

    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return payload;
      await db.collection(COLLECTIONS.pretests).add({
        ...payload,
        createdAtServer: serverTimestamp()
      });
    } catch (error) {
      console.warn("NumeRead Firebase pretest log failed.", error);
    }
    return payload;
  }

  async function saveActivityLog(student, result) {
    const normalized = normalizeStudent(student);
    const payload = {
      studentId: normalized.id,
      studentName: normalized.name,
      grade: normalized.grade,
      activityId: result.activityId || "",
      area: result.area || "",
      skill: result.skill || "",
      gain: Number(result.gain || 0),
      xp: Number(result.xp || 0),
      badge: result.badge || "",
      reading: normalized.reading,
      math: normalized.math,
      completedAt: new Date().toISOString()
    };

    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return payload;
      await db.collection(COLLECTIONS.activities).add({
        ...payload,
        createdAtServer: serverTimestamp()
      });
    } catch (error) {
      console.warn("NumeRead Firebase activity log failed.", error);
    }
    return payload;
  }

  async function saveTeacherAction(action) {
    const payload = {
      type: action.type || "teacher-action",
      studentId: action.studentId || "",
      studentName: action.studentName || "",
      assignedPath: action.assignedPath || "",
      createdAt: new Date().toISOString()
    };

    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return payload;
      await db.collection(COLLECTIONS.teacherActions).add({
        ...payload,
        createdAtServer: serverTimestamp()
      });
    } catch (error) {
      console.warn("NumeRead Firebase teacher action log failed.", error);
    }
    return payload;
  }

  const MATERIALS_KEY = "numeread_teacher_materials_v1";
  const TEACHERS_KEY = "numeread_teacher_accounts_v1";

  function readLocalList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function writeLocalList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  async function getLearningMaterials() {
    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return readLocalList(MATERIALS_KEY);
      const snapshot = await db.collection(COLLECTIONS.learningMaterials).orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("NumeRead learning material fetch failed.", error);
      return readLocalList(MATERIALS_KEY);
    }
  }

  async function saveLearningMaterial(material) {
    const payload = {
      id: material.id || `material-${Date.now()}`,
      title: material.title || "Teacher Material",
      category: material.category || "Teacher Upload",
      area: material.area || "Reading and Math",
      level: material.level || "Average",
      section: material.section || "All Sections",
      fileName: material.fileName || "",
      fileType: material.fileType || "",
      fileData: material.fileData || "",
      summary: material.summary || "Teacher-uploaded learning material.",
      content: material.content || "Open the attached file to study this material.",
      createdBy: material.createdBy || "Teacher",
      createdAt: material.createdAt || new Date().toISOString()
    };
    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        await db.collection(COLLECTIONS.learningMaterials).doc(payload.id).set({
          ...payload,
          createdAtServer: serverTimestamp()
        }, { merge: true });
        return payload;
      }
    } catch (error) {
      console.warn("NumeRead learning material save failed.", error);
    }
    const list = readLocalList(MATERIALS_KEY).filter((item) => item.id !== payload.id);
    list.unshift(payload);
    writeLocalList(MATERIALS_KEY, list);
    return payload;
  }

  async function getTeacherAccounts() {
    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return readLocalList(TEACHERS_KEY);
      const snapshot = await db.collection(COLLECTIONS.teacherAccounts).orderBy("section").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("NumeRead teacher account fetch failed.", error);
      return readLocalList(TEACHERS_KEY);
    }
  }

  async function saveTeacherAccount(account) {
    const payload = {
      id: account.id || `teacher-${Date.now()}`,
      name: account.name || "Teacher",
      email: account.email || "",
      section: account.section || "Section A",
      role: "teacher",
      createdAt: account.createdAt || new Date().toISOString()
    };
    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        await db.collection(COLLECTIONS.teacherAccounts).doc(payload.id).set(payload, { merge: true });
        return payload;
      }
    } catch (error) {
      console.warn("NumeRead teacher account save failed.", error);
    }
    const list = readLocalList(TEACHERS_KEY).filter((item) => item.id !== payload.id);
    list.push(payload);
    writeLocalList(TEACHERS_KEY, list);
    return payload;
  }

  function subscribeStudents(onChange, onError) {
    let unsubscribe = null;
    initFirebase().then((canUseFirebase) => {
      if (!canUseFirebase) {
        onChange(localStudents());
        return;
      }
      unsubscribe = db.collection(COLLECTIONS.students).orderBy("name").onSnapshot((snapshot) => {
        if (snapshot.empty) {
          seedFirebaseStudents();
          onChange(seedStudents.map(normalizeStudent));
          return;
        }
        onChange(snapshot.docs.map((doc) => normalizeStudent({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.warn("NumeRead Firebase realtime listener failed.", error);
        if (onError) onError(error);
        onChange(localStudents());
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }

  // ============================================
  // EXPOSE PUBLIC API
  // ============================================

  window.NumeReadData = {
    // Core functions
    slugify,
    getStudents,
    getOrCreateStudent,
    saveStudent,
    savePretestResult,
    saveActivityLog,
    saveTeacherAction,
    getLearningMaterials,
    saveLearningMaterial,
    getTeacherAccounts,
    saveTeacherAccount,
    subscribeStudents,
    usingFirebase: () => hasFirebaseConfig() && (firebaseReady || Boolean(window.firebase && firebase.firestore)),
    
    // Registration functions (NEW)
    registerStudent,
    isDuplicateStudent,
    findStudentByLRN,
    findStudentByName,
    authenticateStudent,
    buildFullName,
    generateStudentId,
    
    // Helper to get all students (for debugging)
    getAllStudents: getStudents
  };

  console.log('📚 NumeReadData loaded with registration support.');
})();
