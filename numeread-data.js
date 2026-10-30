// numeread-data.js - Data layer with registration and duplicate checking
(function () {
  const STORE_KEY = "numeread_students_v1";
  const COLLECTIONS = {
    students: "students",
    pretests: "pretestResults",
    activities: "activityLogs",
    teacherActions: "teacherActions",
    learningMaterials: "learningMaterials",
    teacherAccounts: "teacherAccounts",
    teacherSections: "teacherSections",
    sectionCounters: "sectionCounters"
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
      mastery: { "Addition facts": 55, Subtraction: 40, "Word problems": 38, "Place value": 45, Fractions: 50, Vocabulary: 50, Comprehension: 46 },
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
      mastery: { "Addition facts": 36, Subtraction: 44, "Word problems": 30, "Place value": 35, Fractions: 32, Vocabulary: 38, Comprehension: 32 },
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
      mastery: { "Addition facts": 70, Subtraction: 48, "Word problems": 52, "Place value": 58, Fractions: 64, Vocabulary: 60, Comprehension: 55 },
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
      mastery: { "Addition facts": 42, Subtraction: 30, "Word problems": 35, "Place value": 36, Fractions: 38, Vocabulary: 40, Comprehension: 34 },
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

  function sectionKey(section) {
    return slugify(section || "section");
  }

  // The public ID starts at 1 for every class section. The Firestore document
  // key also contains the section so identical public IDs in two sections do
  // not overwrite one another.
  function generateStudentId(number) {
    return `STU-${String(Number(number) || 0).padStart(5, "0")}`;
  }

  function studentDocumentId(section, studentId) {
    return `${sectionKey(section)}--${String(studentId || "").toUpperCase()}`;
  }

  function normalizeStudent(student) {
    // Handle both old format (name) and new format (firstName, lastName)
    let name = student.name || '';
    if (!name && student.firstName && student.lastName) {
      name = buildFullName(student.lastName, student.firstName, student.middleInitial);
    }
    if (!name) name = 'Student';

    const section = student.section || student.gradeSection || "Section A";
    const studentId = String(student.studentId || student.id || "").toUpperCase();
    const id = student.id || studentDocumentId(section, studentId || `LEGACY-${Date.now()}`);
    
    return {
      id,
      ownerId: student.ownerId || '',
      name: name,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      middleInitial: student.middleInitial || '',
      grade: student.grade || "Grade 2",
      gradeSection: student.gradeSection || student.grade || "Grade 2",
      section,
      studentId,
      sectionNumber: Number(student.sectionNumber || 0),
      xp: Number(student.xp || 0),
      streak: Number(student.streak || 0),
      badges: Array.isArray(student.badges) ? student.badges : ["Starter Star"],
      reading: Number(student.reading || 0),
      math: Number(student.math || 0),
      wpm: Array.isArray(student.wpm) ? student.wpm : [0, 0, 0, 0],
      mastery: {
        "Addition facts": 0,
        Subtraction: 0,
        Division: 0,
        "Word problems": 0,
        "Place value": 0,
        Fractions: 0,
        Volume: 0,
        GEMDAS: 0,
        "Composite area": 0,
        Vocabulary: 0,
        Comprehension: 0,
        ...(student.mastery || {})
      },
      gaps: Array.isArray(student.gaps) ? student.gaps : [],
      activities: Array.isArray(student.activities) ? student.activities : [],
      materialsCompleted: Array.isArray(student.materialsCompleted) ? student.materialsCompleted : [],
      learningProgress: student.learningProgress && typeof student.learningProgress === "object" ? student.learningProgress : {},
      // Teacher-generated practice is deliberately kept per learner and per
      // activity.  Older records simply start with an empty set of assignments.
      personalizedActivities: student.personalizedActivities && typeof student.personalizedActivities === "object" ? student.personalizedActivities : {},
      assessmentFocus: student.assessmentFocus && typeof student.assessmentFocus === "object" ? student.assessmentFocus : null,
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

  // Firebase restores a persisted anonymous session asynchronously. Waiting for
  // it prevents the first read after opening the app from being sent without
  // the learner's identity.
  function currentFirebaseUser() {
    if (!firebase.auth) return Promise.resolve(null);
    if (firebase.auth().currentUser) return Promise.resolve(firebase.auth().currentUser);
    return new Promise((resolve) => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
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

  // A name only needs to be unique within its class section. Student IDs are
  // assigned by the section counter, not supplied by the learner.
  async function isDuplicateStudent(lastName, firstName, middleInitial, gradeSection) {
    const students = await getStudents();
    const fullName = buildFullName(lastName, firstName, middleInitial);
    const normalizedFull = fullName.trim().toLowerCase();
    const normalizedSection = String(gradeSection || "").trim();

    return students.some(s => {
      const existingFull = s.name ? s.name.toLowerCase() : '';
      if (existingFull === normalizedFull && String(s.section || s.gradeSection || "").trim() === normalizedSection) return true;
      // Also check by firstName + lastName combo
      if (s.firstName && s.lastName) {
        const sFull = buildFullName(s.lastName, s.firstName, s.middleInitial).toLowerCase();
        if (sFull === normalizedFull && String(s.section || s.gradeSection || "").trim() === normalizedSection) return true;
      }
      return false;
    });
  }

  // Register a new student with full details
  async function registerStudent(lastName, firstName, middleInitial, gradeSectionOrCode) {
    // Validate required fields
    if (!lastName || !firstName) {
      return { success: false, message: 'Last name and First name are required.' };
    }

    let resolvedSection = String(gradeSectionOrCode || "").trim();
    if (!resolvedSection) {
      return { success: false, message: 'Teacher 6-character section key is required.' };
    }

    const cleanInput = resolvedSection.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleanInput.length === 6) {
      const teacherInfo = await getTeacherByClassCode(cleanInput);
      if (!teacherInfo || !teacherInfo.section) {
        return { success: false, message: "Invalid 6-character teacher section key. Please ask your teacher for your class code." };
      }
      resolvedSection = teacherInfo.section;
    }

    // Every learner record is tied to an authenticated Firebase identity. For
    // younger learners we use a device-bound anonymous identity rather than
    // exposing a shared database by name and student ID.
    if (!(await initFirebase()) || !firebase.auth) {
      return { success: false, message: 'Secure registration is unavailable. Please try again later.' };
    }
    if (!(await currentFirebaseUser())) {
      try {
        await firebase.auth().signInAnonymously();
      } catch (error) {
        // Firebase returns this when the project's Auth settings block
        // self-service account creation. Do not expose the raw SDK error to
        // students, and do not fall back to unprotected local registration.
        if (error && error.code === "auth/admin-restricted-operation") {
          return {
            success: false,
            message: "Student registration is temporarily unavailable because account creation is disabled for this school. Please ask the NumeRead administrator to enable it in Firebase Authentication settings."
          };
        }
        console.error("Student authentication setup failed:", error);
        return {
          success: false,
          message: "We could not start secure registration. Please check your internet connection and try again."
        };
      }
    }
    const ownerId = firebase.auth().currentUser.uid;

    // Check duplicates
    const duplicate = await isDuplicateStudent(lastName, firstName, middleInitial, resolvedSection);
    if (duplicate) {
      return { success: false, message: 'A student with this full name is already registered in this section.' };
    }

    const fullName = buildFullName(lastName, firstName, middleInitial);
    try {
      const section = resolvedSection || "Grade 2 - A";
      const counterRef = db.collection(COLLECTIONS.sectionCounters).doc(sectionKey(section));
      const saved = await db.runTransaction(async (transaction) => {
        const counter = await transaction.get(counterRef);
        const sectionNumber = Number(counter.exists ? counter.data().nextStudentNumber : 1) || 1;
        const studentId = generateStudentId(sectionNumber);
        const id = studentDocumentId(section, studentId);
        const newStudent = normalizeStudent({
          id, studentId, sectionNumber, ownerId, name: fullName,
          firstName: firstName.trim(), lastName: lastName.trim(),
          middleInitial: middleInitial ? middleInitial.trim().toUpperCase() : '',
          grade: section, gradeSection: section, section,
          xp: 0, streak: 1, badges: ["Starter Star"], reading: 0, math: 0,
          wpm: [0, 0, 0, 0],
          mastery: { "Addition facts": 0, Subtraction: 0, "Word problems": 0, "Place value": 0, Fractions: 0, Volume: 0, GEMDAS: 0, "Composite area": 0, Vocabulary: 0, Comprehension: 0 },
          gaps: [], activities: [], materialsCompleted: [], learningProgress: {},
          pretest: null, posttest: null, assignedPath: "",
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        });
        transaction.set(counterRef, { section, nextStudentNumber: sectionNumber + 1, updatedAt: new Date().toISOString() }, { merge: true });
        transaction.set(studentRef(id), { ...newStudent, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() });
        return newStudent;
      });
      return { success: true, student: saved };
    } catch (error) {
      console.error('Registration save error:', error);
      if (error?.code === "permission-denied") {
        return { success: false, message: "Registration is blocked by the database security rules. Please ask the NumeRead administrator to deploy the current Firestore rules." };
      }
      if (error?.code === "unavailable" || error?.code === "deadline-exceeded") {
        return { success: false, message: "The database is temporarily unavailable. Check your internet connection and try again." };
      }
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

    // Always update local cache & session immediately so student UI never loses progress
    const students = localStudents();
    const index = students.findIndex((item) => item.id === normalized.id);
    if (index >= 0) students[index] = normalized;
    else students.push(normalized);
    saveLocalStudents(students);
    try {
      sessionStorage.setItem("numeread_student", JSON.stringify(normalized));
    } catch (_) {}

    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        if (firebase.auth && !firebase.auth().currentUser) {
          try {
            await firebase.auth().signInAnonymously();
          } catch (_) {}
        }
        await studentRef(normalized.id).set({
          ...normalized,
          updatedAtServer: serverTimestamp()
        }, { merge: true });
        return normalized;
      }
    } catch (error) {
      console.warn("NumeRead Firebase save failed, using demo storage.", error);
    }
    return normalized;
  }

  async function findStudentById(studentId) {
    const clean = String(studentId || '').trim().toUpperCase();
    if (!/^STU-\d{5}$/.test(clean)) return null;
    const students = await getStudents();
    return students.find(s => s.studentId === clean) || null;
  }

  // Find student by full name
  async function findStudentByName(name) {
    const students = await getStudents();
    return students.find(s => s.name.toLowerCase() === name.trim().toLowerCase()) || null;
  }

  // A student signs in with the registered name, section, and generated ID.
  async function authenticateStudent(name, section, studentId) {
    const enteredName = String(name || '').trim().replace(/\s+/g, ' ');
    const fullName = enteredName.toLowerCase();
    const cleanSection = String(section || '').trim();
    const cleanStudentId = String(studentId || '').trim().toUpperCase();
    if (!fullName || !cleanSection || !/^STU-\d{5}$/.test(cleanStudentId)) return null;

    try {
      const canUseFirebase = await initFirebase();
      const documentId = studentDocumentId(cleanSection, cleanStudentId);
      if (canUseFirebase) {
        let user = await currentFirebaseUser();
        if (!user && firebase.auth) {
          try {
            await firebase.auth().signInAnonymously();
            user = await currentFirebaseUser();
          } catch (authErr) {
            console.warn("Anonymous sign-in on student auth failed", authErr);
          }
        }
        if (user) {
          // This is a single-document read. It works with the privacy rules for
          // the learner who created the record and never exposes a class list.
          const snapshot = await studentRef(documentId).get();
          if (snapshot.exists) {
            const student = normalizeStudent({ id: snapshot.id, ...snapshot.data() });
            if (String(student.name || '').trim().toLowerCase() === fullName && student.section === cleanSection && student.studentId === cleanStudentId) {
              return student;
            }
          }
        }
      }
    } catch (error) {
      console.warn("NumeRead student sign-in lookup failed.", error);
    }

    // Local storage remains only for offline/demo mode. Do not use a Firestore
    // collection query here: students must not be able to list other records.
    return localStudents().find((student) =>
      String(student.name || '').trim().toLowerCase() === fullName && student.section === cleanSection && student.studentId === cleanStudentId
    ) || null;
  }

  async function savePretestResult(student, result) {
    const normalized = normalizeStudent(student);
    const payload = {
      studentId: normalized.id,
      studentName: normalized.name,
      grade: normalized.grade,
      readingCorrect: Number(result.readingCorrect || 0),
      readingTotal: Number(result.readingTotal || result.readingItems || 10),
      mathCorrect: Number(result.mathCorrect || 0),
      mathTotal: Number(result.mathTotal || result.mathItems || 10),
      combinedCorrect: Number(result.combinedCorrect || 0),
      combinedTotal: Number(result.combinedTotal || result.combinedItems || 10),
      combinedScore: Number(result.combinedScore || 0),
      topicScores: result.topicScores || {},
      totalItems: Number(result.totalItems || 30),
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
  const MATERIALS_CACHE_TS_KEY = "numeread_teacher_materials_ts_v1";
  const TEACHERS_KEY = "numeread_teacher_accounts_v1";

  function readLocalList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function writeLocalList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (_) {}
  }

  function getCachedLearningMaterials() {
    return readLocalList(MATERIALS_KEY);
  }

  async function fetchLearningMaterialsFromRemote() {
    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return readLocalList(MATERIALS_KEY);
      const snapshot = await db.collection(COLLECTIONS.learningMaterials).orderBy("createdAt", "desc").get();
      const remoteList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      writeLocalList(MATERIALS_KEY, remoteList);
      try {
        sessionStorage.setItem(MATERIALS_CACHE_TS_KEY, String(Date.now()));
      } catch (_) {}
      return remoteList;
    } catch (error) {
      console.warn("NumeRead learning material fetch failed.", error);
      return readLocalList(MATERIALS_KEY);
    }
  }

  async function getLearningMaterials(options = {}) {
    try {
      const lastTs = Number(sessionStorage.getItem(MATERIALS_CACHE_TS_KEY) || 0);
      if (!options.force && lastTs && Date.now() - lastTs < 180000) {
        const cached = readLocalList(MATERIALS_KEY);
        fetchLearningMaterialsFromRemote().catch(() => {});
        return cached;
      }
    } catch (_) {}
    return fetchLearningMaterialsFromRemote();
  }

  async function saveLearningMaterial(material) {
    const teacher = await currentTeacher();
    if (!teacher) throw new Error("A verified teacher account is required.");
    const payload = {
      id: material.id || `material-${Date.now()}`,
      title: material.title || "Teacher Material",
      category: material.category || "Teacher Upload",
      area: material.area || "Reading and Math",
      level: material.level || "Average",
      section: teacher.section,
      teacherUid: teacher.uid,
      fileName: material.fileName || "",
      fileType: material.fileType || "",
      fileSize: Number(material.fileSize || 0),
      filePath: material.filePath || "",
      fileUrl: material.fileUrl || "",
      mediaKind: material.mediaKind || "",
      fileData: material.fileData || "",
      sourceUrl: String(material.sourceUrl || "").trim().slice(0, 2000),
      baseMaterialId: String(material.baseMaterialId || "").trim().slice(0, 160),
      hiddenBuiltInId: String(material.hiddenBuiltInId || "").trim().slice(0, 160),
      summary: material.summary || "Teacher-uploaded learning material.",
      content: material.content || "Open the attached file to study this material.",
      activityIds: Array.isArray(material.activityIds) ? material.activityIds : [],
      keywords: Array.isArray(material.keywords) ? material.keywords : [],
      gameQuestions: Array.isArray(material.gameQuestions) ? material.gameQuestions.map((question) => ({
        prompt: String(question?.prompt || "").trim(),
        answer: question?.answer ?? "",
        choices: Array.isArray(question?.choices) ? question.choices.map((choice) => String(choice).trim()).filter(Boolean) : []
      })).filter((question) => question.prompt && String(question.answer).trim() && question.choices.length >= 2) : [],
      createdBy: teacher.name,
      createdAt: material.createdAt || new Date().toISOString()
    };
    if (!payload.hiddenBuiltInId) {
      payload.generatedGameId = material.generatedGameId || `lesson-game-${payload.id}`;
      payload.generatedGameTitle = material.generatedGameTitle || buildLessonGameTitle(payload.title);
    }
    const list = readLocalList(MATERIALS_KEY).filter((item) => item.id !== payload.id);
    list.unshift(payload);
    writeLocalList(MATERIALS_KEY, list);
    try {
      sessionStorage.setItem(MATERIALS_CACHE_TS_KEY, String(Date.now()));
    } catch (_) {}
    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        await db.collection(COLLECTIONS.learningMaterials).doc(payload.id).set({
          ...payload,
          createdAtServer: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.warn("NumeRead learning material save failed.", error);
    }
    return payload;
  }

  async function deleteLearningMaterial(materialId) {
    const id = String(materialId || "").trim();
    if (!id) throw new Error("This learning material could not be identified.");
    const teacher = await currentTeacher();
    if (!teacher) throw new Error("A verified teacher account is required.");

    const canUseFirebase = await initFirebase();
    if (canUseFirebase) {
      const reference = db.collection(COLLECTIONS.learningMaterials).doc(id);
      const snapshot = await reference.get();
      if (snapshot.exists) {
        const material = snapshot.data();
        const isLegacySectionMaterial = !Object.prototype.hasOwnProperty.call(material, "teacherUid")
          && String(material.section || "") === String(teacher.section || "");
        if (material.teacherUid !== teacher.uid && !isLegacySectionMaterial) throw new Error("You can only delete materials that you created.");
        await reference.delete();
      }
      const list = readLocalList(MATERIALS_KEY).filter((item) => item.id !== id);
      writeLocalList(MATERIALS_KEY, list);
      try {
        sessionStorage.setItem(MATERIALS_CACHE_TS_KEY, String(Date.now()));
      } catch (_) {}
      return;
    }

    const list = readLocalList(MATERIALS_KEY);
    const material = list.find((item) => item.id === id);
    const isLegacySectionMaterial = material && !Object.prototype.hasOwnProperty.call(material, "teacherUid")
      && String(material.section || "") === String(teacher.section || "");
    if (material?.teacherUid && material.teacherUid !== teacher.uid) throw new Error("You can only delete materials that you created.");
    if (material && !material.teacherUid && !isLegacySectionMaterial) throw new Error("You can only delete materials in your section.");
    writeLocalList(MATERIALS_KEY, list.filter((item) => item.id !== id));
    try {
      sessionStorage.setItem(MATERIALS_CACHE_TS_KEY, String(Date.now()));
    } catch (_) {}
  }

  const CLASS_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  function generateClassCode() {
    let result = "";
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * CLASS_CODE_CHARS.length);
      result += CLASS_CODE_CHARS[idx];
    }
    return result;
  }

  function removeLocalTeacherSection(sectionOrKey) {
    if (!sectionOrKey) return;
    const targetKey = sectionKey(sectionOrKey);
    const list = readLocalList(TEACHERS_KEY).filter((item) => sectionKey(item?.section) !== targetKey && item?.sectionKey !== targetKey);
    writeLocalList(TEACHERS_KEY, list);
  }

  function recordLocalTeacherSection(account) {
    if (!account?.section) return;
    const targetKey = sectionKey(account.section);
    const cleanCode = String(account.classCode || "").trim().toUpperCase();
    const list = readLocalList(TEACHERS_KEY).filter((item) => sectionKey(item.section) !== targetKey && item.id !== account.id && item.uid !== account.uid);
    list.push({
      id: account.id || account.uid || `teacher-${targetKey}`,
      uid: account.uid || account.id || `teacher-${targetKey}`,
      name: account.name || "Teacher",
      email: account.email || "",
      section: account.section,
      sectionKey: targetKey,
      classCode: cleanCode,
      role: "teacher",
      createdAt: account.createdAt || new Date().toISOString()
    });
    writeLocalList(TEACHERS_KEY, list);
  }

  async function getTeacherByClassCode(code) {
    const clean = String(code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length !== 6) return null;

    try {
      if ((await initFirebase()) && db) {
        // Query live Firestore teacherAccounts first
        try {
          const acctSnap = await db.collection(COLLECTIONS.teacherAccounts).where("classCode", "==", clean).limit(1).get();
          if (!acctSnap.empty) {
            const doc = acctSnap.docs[0];
            const data = doc.data() || {};
            recordLocalTeacherSection({
              id: doc.id,
              uid: data.uid || doc.id,
              name: data.name,
              section: data.section,
              classCode: clean,
              createdAt: data.createdAt
            });
            return {
              section: data.section,
              sectionKey: sectionKey(data.section || "section"),
              teacherName: data.name || "Teacher",
              classCode: clean,
              uid: data.uid || doc.id
            };
          }
        } catch (_) {}

        // Query live Firestore teacherSections and verify teacher still exists
        try {
          const lockSnap = await db.collection(COLLECTIONS.teacherSections).where("classCode", "==", clean).limit(1).get();
          if (!lockSnap.empty) {
            const doc = lockSnap.docs[0];
            const data = doc.data() || {};
            let active = false;
            if (data.uid) {
              try {
                const tDoc = await db.collection(COLLECTIONS.teacherAccounts).doc(data.uid).get();
                if (tDoc.exists) active = true;
              } catch (_) {}
            }
            if (active) {
              recordLocalTeacherSection({
                id: data.uid || doc.id,
                uid: data.uid,
                name: data.name,
                section: data.section,
                classCode: clean,
                createdAt: data.createdAt
              });
              return {
                section: data.section,
                sectionKey: data.sectionKey || doc.id,
                teacherName: data.name || "Teacher",
                classCode: clean,
                uid: data.uid || ""
              };
            } else {
              // Lock is orphaned because teacher was deleted
              removeLocalTeacherSection(data.section);
              try { await db.collection(COLLECTIONS.teacherSections).doc(doc.id).delete(); } catch (_) {}
            }
          }
        } catch (_) {}
      }
    } catch (_) {}

    // Offline fallback to local cache
    const local = readLocalList(TEACHERS_KEY);
    const localTeacher = local.find((t) => String(t.classCode || "").toUpperCase() === clean);
    if (localTeacher && localTeacher.section) {
      return {
        section: localTeacher.section,
        sectionKey: sectionKey(localTeacher.section),
        teacherName: localTeacher.name || "Teacher",
        classCode: clean,
        uid: localTeacher.uid || localTeacher.id || ""
      };
    }
    return null;
  }

  async function ensureTeacherSectionLock(teacher) {
    if (!teacher?.section || !teacher?.uid) return;
    const sKey = sectionKey(teacher.section);
    let classCode = String(teacher.classCode || "").trim().toUpperCase();
    if (!classCode || classCode.length !== 6) {
      const existing = readLocalList(TEACHERS_KEY).find((t) => sectionKey(t.section) === sKey && t.classCode);
      classCode = existing?.classCode || generateClassCode();
      teacher.classCode = classCode;
    }
    recordLocalTeacherSection(teacher);
    try {
      if ((await initFirebase()) && db) {
        const ref = db.collection(COLLECTIONS.teacherSections).doc(sKey);
        const snap = await ref.get();
        let canClaim = !snap.exists || snap.data()?.uid === teacher.uid;
        if (!canClaim) {
          const prevUid = snap.data()?.uid;
          let prevActive = false;
          if (prevUid) {
            try {
              const prevDoc = await db.collection(COLLECTIONS.teacherAccounts).doc(prevUid).get();
              if (prevDoc.exists) prevActive = true;
            } catch (_) {}
          }
          if (!prevActive) {
            canClaim = true;
          }
        }
        if (canClaim) {
          await ref.set({
            section: teacher.section,
            sectionKey: sKey,
            uid: teacher.uid,
            name: cleanText(teacher.name || "Teacher", 80),
            classCode,
            createdAt: teacher.createdAt || new Date().toISOString(),
            createdAtServer: serverTimestamp()
          });
        } else if (!snap.data()?.classCode) {
          await ref.set({ classCode }, { merge: true });
        }

        const acctRef = db.collection(COLLECTIONS.teacherAccounts).doc(teacher.uid);
        const acctSnap = await acctRef.get();
        if (acctSnap.exists && !acctSnap.data()?.classCode) {
          await acctRef.set({ classCode }, { merge: true });
        }
      }
    } catch (_) {}
  }

  async function getRegisteredTeacherSections() {
    try {
      if ((await initFirebase()) && db) {
        const sections = new Set();
        const activeAccounts = [];
        const activeUids = new Set();

        try {
          const acctSnap = await db.collection(COLLECTIONS.teacherAccounts).get();
          acctSnap.docs.forEach((doc) => {
            const data = doc.data() || {};
            const sec = String(data.section || "").trim();
            const uid = data.uid || doc.id;
            if (sec && uid) {
              sections.add(sec);
              activeUids.add(uid);
              activeAccounts.push({
                id: doc.id,
                uid: uid,
                name: data.name || "Teacher",
                section: sec,
                sectionKey: sectionKey(sec),
                classCode: data.classCode || "",
                createdAt: data.createdAt
              });
            }
          });
        } catch (acctErr) {
          console.warn("NumeRead live teacherAccounts fetch note:", acctErr);
        }

        try {
          const lockSnap = await db.collection(COLLECTIONS.teacherSections).get();
          for (const doc of lockSnap.docs) {
            const data = doc.data() || {};
            const sec = String(data.section || "").trim();
            const lockUid = data.uid;
            if (!sec) continue;

            if (lockUid && activeUids.has(lockUid)) {
              sections.add(sec);
            } else if (lockUid) {
              let existsInAccts = false;
              try {
                const checkDoc = await db.collection(COLLECTIONS.teacherAccounts).doc(lockUid).get();
                if (checkDoc.exists) existsInAccts = true;
              } catch (_) {}

              if (existsInAccts) {
                sections.add(sec);
                activeUids.add(lockUid);
                activeAccounts.push({
                  id: lockUid,
                  uid: lockUid,
                  name: data.name || "Teacher",
                  section: sec,
                  sectionKey: sectionKey(sec),
                  classCode: data.classCode || "",
                  createdAt: data.createdAt
                });
              } else {
                // Orphaned lock! The teacher account was deleted on the database.
                // The section is free. Attempt cleaning up the orphaned lock document.
                try { await db.collection(COLLECTIONS.teacherSections).doc(doc.id).delete(); } catch (_) {}
              }
            }
          }
        } catch (lockErr) {
          console.warn("NumeRead live teacherSections fetch note:", lockErr);
        }

        // Overwrite local storage cache with ONLY active teachers, purging deleted accounts!
        writeLocalList(TEACHERS_KEY, activeAccounts);
        return Array.from(sections);
      }
    } catch (_) {}

    // Offline fallback to local storage
    return Array.from(
      new Set(
        readLocalList(TEACHERS_KEY)
          .map((item) => String(item?.section || "").trim())
          .filter(Boolean)
      )
    );
  }

  async function resetTeacherRegistrationCache() {
    writeLocalList(TEACHERS_KEY, []);
    try {
      if ((await initFirebase()) && db) {
        try {
          const lockSnap = await db.collection(COLLECTIONS.teacherSections).get();
          for (const doc of lockSnap.docs) {
            const data = doc.data() || {};
            const lockUid = data.uid;
            let active = false;
            if (lockUid) {
              try {
                const aDoc = await db.collection(COLLECTIONS.teacherAccounts).doc(lockUid).get();
                if (aDoc.exists) active = true;
              } catch (_) {}
            }
            if (!active) {
              try { await db.collection(COLLECTIONS.teacherSections).doc(doc.id).delete(); } catch (_) {}
            }
          }
        } catch (_) {}
        return await getRegisteredTeacherSections();
      }
    } catch (_) {}
    return [];
  }

  async function isSectionTeacherRegistered(section, ignoreUid = "") {
    const cleanSec = cleanText(section, 40);
    if (!cleanSec) return false;
    const targetKey = sectionKey(cleanSec);

    try {
      if ((await initFirebase()) && db) {
        // 1. Check live teacherSections lock
        try {
          const lockDoc = await db.collection(COLLECTIONS.teacherSections).doc(targetKey).get();
          if (lockDoc.exists) {
            const lockData = lockDoc.data() || {};
            const lockUid = lockData.uid;
            if (ignoreUid && (lockUid === ignoreUid || lockDoc.id === ignoreUid)) {
              // Current user already holds this lock
            } else if (lockUid) {
              let teacherActive = false;
              try {
                const acctDoc = await db.collection(COLLECTIONS.teacherAccounts).doc(lockUid).get();
                if (acctDoc.exists) teacherActive = true;
              } catch (_) {}

              if (teacherActive) {
                recordLocalTeacherSection({
                  id: lockUid,
                  uid: lockUid,
                  name: lockData.name,
                  section: lockData.section || cleanSec,
                  classCode: lockData.classCode,
                  createdAt: lockData.createdAt
                });
                return true;
              } else {
                // Orphaned lock: teacher account was deleted. Clean up!
                removeLocalTeacherSection(cleanSec);
                try { await db.collection(COLLECTIONS.teacherSections).doc(targetKey).delete(); } catch (_) {}
              }
            }
          }
        } catch (_) {}

        // 2. Check live teacherAccounts collection
        try {
          const acctSnap = await db.collection(COLLECTIONS.teacherAccounts).where("section", "==", cleanSec).limit(2).get();
          const otherDoc = acctSnap.docs.find((doc) => !ignoreUid || (doc.id !== ignoreUid && doc.data()?.uid !== ignoreUid));
          if (otherDoc) {
            const otherData = otherDoc.data() || {};
            recordLocalTeacherSection({
              id: otherDoc.id,
              uid: otherData.uid || otherDoc.id,
              name: otherData.name,
              section: cleanSec,
              classCode: otherData.classCode,
              createdAt: otherData.createdAt
            });
            return true;
          }
        } catch (_) {}

        // Neither active lock nor active teacher account found in Firebase.
        // Purge any stale local cache for this section:
        removeLocalTeacherSection(cleanSec);
        return false;
      }
    } catch (_) {}

    // Offline fallback: check local storage only if Firebase is unavailable
    const localMatch = readLocalList(TEACHERS_KEY).find((item) => sectionKey(item?.section) === targetKey);
    if (localMatch && (!ignoreUid || (localMatch.uid !== ignoreUid && localMatch.id !== ignoreUid))) {
      return true;
    }
    return false;
  }

  async function getTeacherAccounts() {
    try {
      const canUseFirebase = await initFirebase();
      if (!canUseFirebase) return readLocalList(TEACHERS_KEY);
      const snapshot = await db.collection(COLLECTIONS.teacherAccounts).orderBy("section").get();
      const accounts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      writeLocalList(TEACHERS_KEY, accounts);
      return accounts;
    } catch (error) {
      console.warn("NumeRead teacher account fetch failed.", error);
      return readLocalList(TEACHERS_KEY);
    }
  }

  async function saveTeacherAccount(account) {
    const payload = {
      id: account.id || `teacher-${Date.now()}`,
      uid: account.uid || account.id || `teacher-${Date.now()}`,
      name: account.name || "Teacher",
      email: account.email || "",
      section: account.section || "Section A",
      role: "teacher",
      createdAt: account.createdAt || new Date().toISOString()
    };
    if (await isSectionTeacherRegistered(payload.section, payload.uid)) {
      throw new Error(`A teacher is already registered for ${payload.section}. Only one teacher can register per section.`);
    }
    try {
      const canUseFirebase = await initFirebase();
      if (canUseFirebase) {
        await db.collection(COLLECTIONS.teacherAccounts).doc(payload.id).set(payload, { merge: true });
        await ensureTeacherSectionLock(payload);
        return payload;
      }
    } catch (error) {
      console.warn("NumeRead teacher account save failed.", error);
    }
    recordLocalTeacherSection(payload);
    return payload;
  }

  function cleanText(value, maxLength) {
    return String(value || "").trim().replace(/[<>]/g, "").slice(0, maxLength);
  }

  async function registerTeacher(details) {
    const name = cleanText(details.name, 80);
    const email = String(details.email || "").trim().toLowerCase();
    const section = cleanText(details.section, 40);
    const password = String(details.password || "");
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !section || password.length < 12) {
      return { success: false, message: "Enter a name, school email, section, and a password of at least 12 characters." };
    }

    // 1. Pre-check if this section already has a registered teacher
    if (await isSectionTeacherRegistered(section)) {
      return {
        success: false,
        message: `A teacher is already registered for ${section}. Only one teacher can register per section.`
      };
    }

    if (!(await initFirebase()) || !firebase.auth) {
      return { success: false, message: "Firebase Authentication is not available. Check the Firebase configuration." };
    }

    let credential = null;
    try {
      credential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = credential.user.uid;

      // 2. Post-auth check against teacherAccounts and teacherSections while signed in
      if (await isSectionTeacherRegistered(section, uid)) {
        try { await credential.user.delete(); } catch (_) {}
        try { await firebase.auth().signOut(); } catch (_) {}
        return {
          success: false,
          message: `A teacher is already registered for ${section}. Only one teacher can register per section.`
        };
      }

      const sKey = sectionKey(section);
      const classCode = generateClassCode();
      const nowIso = new Date().toISOString();
      const sectionRef = db.collection(COLLECTIONS.teacherSections).doc(sKey);
      const teacherRef = db.collection(COLLECTIONS.teacherAccounts).doc(uid);

      // 3. Atomic transaction to claim the section and create the teacher profile
      if (typeof db.runTransaction === "function") {
        await db.runTransaction(async (transaction) => {
          const sectionDoc = await transaction.get(sectionRef);
          if (sectionDoc.exists && sectionDoc.data()?.uid !== uid) {
            const existingUid = sectionDoc.data()?.uid;
            let existingActive = false;
            if (existingUid) {
              const existingTeacherDoc = await transaction.get(db.collection(COLLECTIONS.teacherAccounts).doc(existingUid));
              if (existingTeacherDoc.exists) existingActive = true;
            }
            if (existingActive) {
              const takenErr = new Error(`A teacher is already registered for ${section}. Only one teacher can register per section.`);
              takenErr.code = "section-already-registered";
              throw takenErr;
            }
          }
          transaction.set(sectionRef, {
            section,
            sectionKey: sKey,
            uid,
            name,
            classCode,
            createdAt: nowIso,
            createdAtServer: serverTimestamp()
          });
          transaction.set(teacherRef, {
            uid,
            name,
            section,
            role: "teacher",
            classCode,
            createdAt: nowIso,
            createdAtServer: serverTimestamp()
          });
        });
      } else {
        await sectionRef.set({
          section,
          sectionKey: sKey,
          uid,
          name,
          classCode,
          createdAt: nowIso,
          createdAtServer: serverTimestamp()
        });
        await teacherRef.set({
          uid,
          name,
          section,
          role: "teacher",
          classCode,
          createdAt: nowIso,
          createdAtServer: serverTimestamp()
        });
      }

      recordLocalTeacherSection({ id: uid, uid, name, email, section, classCode, createdAt: nowIso });
      await credential.user.sendEmailVerification();
      await firebase.auth().signOut();
      return { success: true };
    } catch (error) {
      if (credential?.user && error?.code === "section-already-registered") {
        try { await credential.user.delete(); } catch (_) {}
        try { await firebase.auth().signOut(); } catch (_) {}
        return {
          success: false,
          message: `A teacher is already registered for ${section}. Only one teacher can register per section.`
        };
      }
      if (credential?.user) {
        try { await credential.user.delete(); } catch (_) {}
        try { await firebase.auth().signOut(); } catch (_) {}
      }
      return { success: false, message: error.message || "The teacher account could not be created." };
    }
  }

  async function loginTeacher(email, password) {
    if (!(await initFirebase()) || !firebase.auth) return { success: false, message: "Firebase Authentication is not available." };
    try {
      const credential = await firebase.auth().signInWithEmailAndPassword(String(email || "").trim().toLowerCase(), String(password || ""));
      await credential.user.reload();
      if (!credential.user.emailVerified) {
        await firebase.auth().signOut();
        return { success: false, message: "Verify your email before opening the teacher dashboard." };
      }
      // Refresh the token after email verification so the next page receives
      // the current verified-account state.
      await credential.user.getIdToken(true);
      const profile = await db.collection(COLLECTIONS.teacherAccounts).doc(credential.user.uid).get();
      if (!profile.exists) { await firebase.auth().signOut(); return { success: false, message: "This account is not registered as a teacher." }; }
      const profileData = profile.data() || {};
      const resolvedName = profileData.name || profileData.fullName || profileData.teacherName || credential.user.displayName || (credential.user.email ? credential.user.email.split("@")[0] : "") || "Teacher";
      const resolvedClassCode = profileData.classCode || generateClassCode();
      const teacherPayload = { uid: credential.user.uid, email: credential.user.email, ...profileData, name: resolvedName, classCode: resolvedClassCode };
      await ensureTeacherSectionLock(teacherPayload);
      try { sessionStorage.setItem("numeread_teacher", JSON.stringify(teacherPayload)); } catch (_) {}
      return { success: true, teacher: teacherPayload };
    } catch (error) {
      // Do not claim the password is wrong when Firebase rejected the request
      // for a configuration, network, or Firestore-rules reason.
      console.error("Teacher sign-in failed:", error);
      switch (error?.code) {
        case "auth/operation-not-allowed":
          return { success: false, message: "Email/password sign-in is disabled in Firebase Authentication. Ask the administrator to enable it." };
        case "auth/admin-restricted-operation":
          return { success: false, message: "Firebase account actions are currently restricted for this project. Ask the administrator to enable them." };
        case "auth/network-request-failed":
          return { success: false, message: "We could not contact Firebase. Check your connection and try again." };
        case "auth/too-many-requests":
          return { success: false, message: "Too many sign-in attempts. Please wait a few minutes and try again." };
        case "permission-denied":
        case "firestore/permission-denied":
          return { success: false, message: "Your account signed in, but its teacher profile could not be read. Ask the administrator to deploy the Firestore rules." };
        default:
          // Keep this generic so the form cannot be used to discover accounts.
          return { success: false, message: "Incorrect email or password." };
      }
    }
  }

  async function resetTeacherPassword(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return {
        success: false,
        message: "Enter the registered school email address for your teacher account."
      };
    }
    if (!(await initFirebase()) || !firebase.auth) {
      return {
        success: false,
        message: "Password reset is unavailable right now. Check the Firebase configuration."
      };
    }
    try {
      await firebase.auth().sendPasswordResetEmail(cleanEmail);
      return {
        success: true,
        message: `Password reset link sent to ${cleanEmail}. Check your inbox (and spam folder) to set a new password.`
      };
    } catch (error) {
      console.error("Teacher password reset failed:", error);
      switch (error?.code) {
        case "auth/invalid-email":
          return { success: false, message: "Enter a valid school email address." };
        case "auth/user-not-found":
          return { success: false, message: "No teacher account was found with that email address." };
        case "auth/too-many-requests":
          return { success: false, message: "Too many password reset requests. Please wait a few minutes and try again." };
        case "auth/network-request-failed":
          return { success: false, message: "We could not contact Firebase. Check your internet connection and try again." };
        default:
          return { success: false, message: error?.message || "We could not send the password reset email. Please try again." };
      }
    }
  }

  async function currentTeacher() {
    if (!(await initFirebase()) || !firebase.auth) {
      try {
        const cached = sessionStorage.getItem("numeread_teacher");
        return cached ? JSON.parse(cached) : null;
      } catch (_) {
        return null;
      }
    }
    // Auth persistence is restored asynchronously on a new page. Waiting here
    // prevents the dashboard from mistaking that brief restore period for a
    // signed-out teacher and redirecting back to the login screen.
    const user = await currentFirebaseUser();
    if (!user) {
      try {
        const cached = sessionStorage.getItem("numeread_teacher");
        return cached ? JSON.parse(cached) : null;
      } catch (_) {
        return null;
      }
    }
    try {
      await user.reload();
      if (!user.emailVerified) return null;
      await user.getIdToken(true);
      const profile = await db.collection(COLLECTIONS.teacherAccounts).doc(user.uid).get();
      if (!profile.exists || profile.data().role !== "teacher") return null;
      const profileData = profile.data() || {};
      const resolvedName = profileData.name || profileData.fullName || profileData.teacherName || user.displayName || (user.email ? user.email.split("@")[0] : "") || "Teacher";
      const resolvedClassCode = profileData.classCode || generateClassCode();
      const teacherPayload = { uid: user.uid, email: user.email, ...profileData, name: resolvedName, classCode: resolvedClassCode };
      ensureTeacherSectionLock(teacherPayload);
      try { sessionStorage.setItem("numeread_teacher", JSON.stringify(teacherPayload)); } catch (_) {}
      return teacherPayload;
    } catch (error) {
      console.warn("NumeRead online teacher fetch issue, using session fallback if available.", error);
      try {
        const cached = sessionStorage.getItem("numeread_teacher");
        return cached ? JSON.parse(cached) : null;
      } catch (_) {
        return null;
      }
    }
  }

  async function getStudentsForCurrentTeacher() {
    const teacher = await currentTeacher();
    if (!teacher) throw new Error("Teacher authentication is required.");
    if (await initFirebase() && db) {
      try {
        // Sort after the section-only query. This keeps the dashboard available
        // immediately, even while Firestore is building a composite index.
        const snapshot = await db.collection(COLLECTIONS.students).where("section", "==", teacher.section).get();
        return snapshot.docs
          .map((doc) => normalizeStudent({ id: doc.id, ...doc.data() }))
          .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
      } catch (error) {
        console.warn("NumeRead Firebase teacher students read failed, falling back to local storage.", error);
      }
    }
    const allLocal = localStudents();
    const matched = teacher.section ? allLocal.filter((student) => student.section === teacher.section) : allLocal;
    return (matched.length ? matched : allLocal)
      .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
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
  // AUTOMATIC LESSON-TO-GAME GENERATOR
  // ============================================

  const BASE_MATERIAL_TO_ACTIVITY = {
    "module-blends": { activityId: "reading-bridge", skill: "Blends", icon: "fa-book-open", type: "Reading" },
    "av-fluency": { activityId: "sentence-builder", skill: "Reading fluency", icon: "fa-microphone-alt", type: "Reading" },
    "module-addition": { activityId: "math-ninja", skill: "Addition facts", icon: "fa-calculator", type: "Math" },
    "av-word-problems": { activityId: "word-bakery", skill: "Word problems", icon: "fa-chalkboard", type: "Combo" },
    "worksheet-read-solve": { activityId: "word-bakery", skill: "Word problems", icon: "fa-puzzle-piece", type: "Combo" },
    "challenge-set": { activityId: "comprehension-trail", skill: "Comprehension", icon: "fa-medal", type: "Combo" },
    "module-fractions": { activityId: "fraction-pizza", skill: "Fractions", icon: "fa-pizza-slice", type: "Math" },
    "av-fraction-visuals": { activityId: "fraction-pizza", skill: "Fractions", icon: "fa-chart-pie", type: "Math" },
    "module-subtraction": { activityId: "subtraction-sprint", skill: "Subtraction", icon: "fa-minus", type: "Math" },
    "module-place-value": { activityId: "place-value-builder", skill: "Place value", icon: "fa-layer-group", type: "Math" },
    "module-vocab": { activityId: "vocab-quest", skill: "Vocabulary", icon: "fa-spell-check", type: "Reading" },
    "module-comprehension": { activityId: "comprehension-trail", skill: "Comprehension", icon: "fa-route", type: "Reading" },
    "module-volume": { activityId: "volume-voyage", skill: "Volume", icon: "fa-cube", type: "Math" },
    "module-gemdas": { activityId: "gemdas-galaxy", skill: "GEMDAS", icon: "fa-rocket", type: "Math" },
    "module-composite-area": { activityId: "composite-area-architect", skill: "Composite area", icon: "fa-drafting-compass", type: "Math" }
  };

  function buildLessonGameTitle(rawTitle) {
    const clean = String(rawTitle || "Lesson")
      .replace(/\s*-\s*teacher\s*resource\s*$/i, "")
      .replace(/\s*\b(module|guide|walkthrough|worksheet|resource)\b\s*$/i, "")
      .trim() || "Lesson";
    if (/\b(quest|game|sprint|challenge|dash|voyage|galaxy|adventure)\b/i.test(clean)) {
      return clean;
    }
    return `${clean} Quest`;
  }

  function shuffleOptions(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function resolveLessonGameMeta(material) {
    if (!material) {
      return { activityId: "reading-bridge", skill: "Reading", icon: "fa-wand-magic-sparkles", type: "Reading", area: "reading" };
    }
    const byBase = BASE_MATERIAL_TO_ACTIVITY[material.baseMaterialId];
    if (byBase) {
      const area = byBase.type === "Math" ? "math" : byBase.type === "Combo" ? "combined" : "reading";
      return { ...byBase, area };
    }
    const text = `${material.title || ""} ${(material.keywords || []).join(" ")} ${(material.activityIds || []).join(" ")}`.toLowerCase();
    const rules = [
      { match: /fraction|slice|half|quarter|numerator|denominator/, activityId: "fraction-pizza", skill: "Fractions", icon: "fa-pizza-slice", type: "Math" },
      { match: /volume|cubic|prism|cube/, activityId: "volume-voyage", skill: "Volume", icon: "fa-cube", type: "Math" },
      { match: /gemdas|pemdas|order of operations|parentheses/, activityId: "gemdas-galaxy", skill: "GEMDAS", icon: "fa-rocket", type: "Math" },
      { match: /composite|area|rectangle|l-shape/, activityId: "composite-area-architect", skill: "Composite area", icon: "fa-drafting-compass", type: "Math" },
      { match: /place value|hundreds|tens|ones|base-10/, activityId: "place-value-builder", skill: "Place value", icon: "fa-layer-group", type: "Math" },
      { match: /multiply|multiplication|times|product/, activityId: "multiplication-mountain", skill: "Multiplication", icon: "fa-mountain", type: "Math" },
      { match: /divide|division|quotient|equal groups/, activityId: "division-dash", skill: "Division", icon: "fa-people-group", type: "Math" },
      { match: /subtract|subtraction|difference|take away|number line/, activityId: "subtraction-sprint", skill: "Subtraction", icon: "fa-minus", type: "Math" },
      { match: /word problem|bakery|story problem/, activityId: "word-bakery", skill: "Word problems", icon: "fa-chalkboard", type: "Combo" },
      { match: /add|addition|sum|math ninja|ten-frame/, activityId: "math-ninja", skill: "Addition facts", icon: "fa-calculator", type: "Math" },
      { match: /spell|spelling/, activityId: "spelling-sprint", skill: "Spelling", icon: "fa-keyboard", type: "Reading" },
      { match: /vocab|context clue|meaning|synonym/, activityId: "vocab-quest", skill: "Vocabulary", icon: "fa-spell-check", type: "Reading" },
      { match: /comprehension|passage|main idea|evidence/, activityId: "comprehension-trail", skill: "Comprehension", icon: "fa-route", type: "Reading" },
      { match: /fluency|sentence|pronunciation/, activityId: "sentence-builder", skill: "Reading fluency", icon: "fa-microphone-alt", type: "Reading" },
      { match: /blend|phonics|reading bridge/, activityId: "reading-bridge", skill: "Blends", icon: "fa-book-open", type: "Reading" }
    ];
    for (const rule of rules) {
      if (rule.match.test(text)) {
        const area = rule.type === "Math" ? "math" : rule.type === "Combo" ? "combined" : "reading";
        return { ...rule, area };
      }
    }
    const rawArea = String(material.area || "").toLowerCase();
    if (rawArea.includes("reading") && rawArea.includes("math")) {
      return { activityId: "word-bakery", skill: material.keywords?.[0] || "Word problems", icon: "fa-puzzle-piece", type: "Combo", area: "combined" };
    }
    if (rawArea.includes("math")) {
      return { activityId: "math-ninja", skill: material.keywords?.[0] || "Addition facts", icon: "fa-calculator", type: "Math", area: "math" };
    }
    return { activityId: "vocab-quest", skill: material.keywords?.[0] || "Comprehension", icon: "fa-wand-magic-sparkles", type: "Reading", area: "reading" };
  }

  function extractQuestionsFromLessonText(material) {
    const extracted = [];
    const content = String(material?.content || "").trim();
    const title = String(material?.title || "Lesson").trim();
    if (!content) return extracted;

    // 1. Extract arithmetic expressions if present (e.g., 7 + 5 = 12 or 12 - 4)
    const mathMatches = [...content.matchAll(/\b(\d{1,3})\s*([+\-×*÷])\s*(\d{1,3})(?:\s*=\s*(\d{1,4}))?/g)];
    mathMatches.slice(0, 6).forEach((m, idx) => {
      const a = Number(m[1]);
      const op = m[2];
      const b = Number(m[3]);
      let ans = m[4] !== undefined ? Number(m[4]) : null;
      if (ans === null) {
        if (op === "+") ans = a + b;
        else if (op === "-") ans = a - b;
        else if (op === "×" || op === "*") ans = a * b;
        else if (op === "÷" && b !== 0 && a % b === 0) ans = a / b;
      }
      if (ans !== null && Number.isFinite(ans)) {
        const displayOp = op === "*" ? "×" : op;
        const choices = shuffleOptions([
          String(ans),
          String(ans + 1),
          String(Math.max(0, ans - 1 === ans ? ans + 2 : ans - 1)),
          String(ans + (b > 1 ? b : 3))
        ]).filter((v, i, self) => self.indexOf(v) === i);
        while (choices.length < 4) choices.push(String(ans + choices.length + 2));
        extracted.push({
          id: `lesson-math-${idx}`,
          context: `From your teacher's lesson "${title}":`,
          prompt: `Solve the lesson expression: ${a} ${displayOp} ${b} = ?`,
          answer: String(ans),
          choices: shuffleOptions(choices.slice(0, 4)),
          hint: content.slice(0, 160)
        });
      }
    });

    // 2. Extract key study sentences for fill-in-the-blank comprehension items
    const sentences = content
      .split(/[\r\n.!?]+/)
      .map((s) => s.replace(/^[•\-*\d.)\s]+/, "").trim())
      .filter((s) => s.length >= 24 && s.length <= 180);

    const stopWords = new Set(["the", "and", "for", "that", "this", "with", "from", "your", "have", "are", "was", "were", "will", "into", "when", "what", "where", "which", "their", "there", "about", "open", "teacher", "resource", "begin", "lesson", "module"]);
    const allKeyWords = [...new Set(
      (content.match(/\b[A-Za-z]{4,14}\b/g) || [])
        .map((w) => w.toLowerCase())
        .filter((w) => !stopWords.has(w))
    )];

    sentences.slice(0, 6).forEach((sentence, idx) => {
      const words = (sentence.match(/\b[A-Za-z]{4,14}\b/g) || []).filter((w) => !stopWords.has(w.toLowerCase()));
      if (!words.length) return;
      const targetWord = words[words.length - 1];
      const blanked = sentence.replace(new RegExp(`\\b${targetWord}\\b`), "_______");
      if (blanked === sentence) return;
      const distractors = allKeyWords.filter((w) => w !== targetWord.toLowerCase()).slice(0, 6);
      const fallbackPool = ["number", "pattern", "sentence", "group", "total", "meaning", "answer", "value"];
      const optionSet = new Set([targetWord]);
      for (const d of [...distractors, ...fallbackPool]) {
        if (optionSet.size >= 4) break;
        if (d.toLowerCase() !== targetWord.toLowerCase()) optionSet.add(d);
      }
      extracted.push({
        id: `lesson-cloze-${idx}`,
        context: `Lesson Clue (${title}): "${blanked}"`,
        prompt: "Which word from the lesson best completes the blank?",
        answer: targetWord,
        choices: shuffleOptions([...optionSet]),
        hint: `Review the lesson note: "${sentence}"`
      });
    });

    return extracted;
  }

  function normalizeBankItemToQuestion(item, baseActivityId, idx) {
    if (!item) return null;
    if (baseActivityId === "reading-bridge") {
      const blend = item.blend || item.prompt || "bl";
      const ans = String(item.answer || "blue");
      const rawChoices = Array.isArray(item.choices) ? item.choices : [ans, "sun", "cat", "dog"];
      return {
        id: item.id || `rb-${idx}`,
        context: item.clue || `Find the word that begins with the "${blend}" blend sound.`,
        prompt: `Which word starts with the blend "${blend.toUpperCase()}"?`,
        answer: ans,
        choices: shuffleOptions(rawChoices.map(String)),
        hint: item.tip || `Listen for the "${blend}" sound at the beginning of the word.`
      };
    }
    if (baseActivityId === "vocab-quest") {
      const word = item.word || item.prompt || "";
      const ans = String(item.answer || "");
      return {
        id: item.id || `vq-${idx}`,
        context: item.sentence ? `Sentence clue: "${item.sentence}"` : "",
        prompt: `What is the best meaning of the word "${word.toUpperCase()}"?`,
        answer: ans,
        choices: shuffleOptions((item.choices || [ans]).map(String)),
        hint: item.clue || item.tip || "Look at the context clues around the word."
      };
    }
    if (baseActivityId === "comprehension-trail") {
      const ans = String(item.answer || "");
      return {
        id: item.id || `ct-${idx}`,
        context: item.passage ? `Passage: "${item.passage}"` : "",
        prompt: item.question || item.prompt || "Choose the best answer based on the passage.",
        answer: ans,
        choices: shuffleOptions((item.choices || [ans]).map(String)),
        hint: item.tip || "Find the sentence in the passage that proves your answer."
      };
    }
    if (baseActivityId === "sentence-builder") {
      const ans = String(item.answer || "");
      return {
        id: item.id || `sb-${idx}`,
        context: item.target ? `Sentence: "${item.target}"` : "",
        prompt: item.question || item.prompt || "Read the sentence and answer the question.",
        answer: ans,
        choices: shuffleOptions((item.choices || [ans]).map(String)),
        hint: item.tip || "Reread the sentence smoothly to check its meaning."
      };
    }
    if (baseActivityId === "spelling-sprint") {
      const ans = String(item.answer || item.word || "");
      const scrambled = ans.split("").reverse().join("");
      const alt1 = ans.length > 2 ? ans[0] + ans.slice(2) + ans[1] : ans + "e";
      const alt2 = ans + "s";
      const choices = [...new Set([ans, scrambled, alt1, alt2])];
      while (choices.length < 4) choices.push(`${ans}${choices.length}`);
      return {
        id: item.id || `sp-${idx}`,
        context: item.tip || `Unscramble and spell the target word carefully.`,
        prompt: item.prompt || `Which of these is the correct spelling?`,
        answer: ans,
        choices: shuffleOptions(choices.slice(0, 4)),
        hint: item.tip || `Say each sound slowly: ${ans}.`
      };
    }
    if (baseActivityId === "word-bakery") {
      const ans = String(item.answer ?? "");
      const numAns = Number(ans);
      const rawChoices = Array.isArray(item.choices) && item.choices.length >= 2
        ? item.choices.map(String)
        : [String(numAns), String(numAns + 2), String(Math.max(0, numAns - 2)), String(numAns + 5)];
      return {
        id: item.id || `wb-${idx}`,
        context: item.story || "",
        prompt: item.story ? "Solve this word problem:" : (item.prompt || "Solve the word problem:"),
        answer: ans,
        choices: shuffleOptions([...new Set(rawChoices)]),
        hint: item.hint || item.tip || "Check whether groups join (+) or are taken away (-)."
      };
    }
    const ans = String(item.answer ?? "");
    const rawChoices = Array.isArray(item.choices)
      ? item.choices.map((c) => String(c?.value ?? c?.label ?? c))
      : [ans, String(Number(ans || 0) + 1), String(Math.max(0, Number(ans || 0) - 1)), String(Number(ans || 0) + 2)];
    if (!rawChoices.includes(ans)) rawChoices.unshift(ans);
    return {
      id: item.id || `q-${idx}`,
      context: item.story || item.passage || item.clue || "",
      prompt: item.prompt || item.question || "Choose the correct answer:",
      answer: ans,
      choices: shuffleOptions([...new Set(rawChoices)].slice(0, 4)),
      hint: item.tip || item.hint || "Use the lesson steps to check your answer."
    };
  }

  const LessonGameEngine = {
    getActivityId(material) {
      if (!material) return "lesson-game-custom";
      return material.generatedGameId || `lesson-game-${material.id}`;
    },
    getGameTitle(material) {
      if (!material) return "Lesson Quest";
      return material.generatedGameTitle || buildLessonGameTitle(material.title);
    },
    resolveMeta(material) {
      return resolveLessonGameMeta(material);
    },
    toActivityCard(material) {
      if (!material || material.hiddenBuiltInId) return null;
      const meta = resolveLessonGameMeta(material);
      const activityId = LessonGameEngine.getActivityId(material);
      const gameTitle = LessonGameEngine.getGameTitle(material);
      return {
        id: activityId,
        materialId: material.id,
        title: gameTitle,
        type: meta.type,
        icon: meta.icon || "fa-wand-magic-sparkles",
        xp: 35,
        skill: meta.skill,
        prompt: `Auto-generated 4-level game from your teacher's lesson: "${material.title}".`,
        material: material.content || material.summary || "Use your teacher's lesson guide to master each round.",
        url: `game-lesson-quest.html?materialId=${encodeURIComponent(material.id)}`,
        isGeneratedLessonGame: true,
        sourceMaterialTitle: material.title
      };
    },
    generateQuestions(material, level = "easy", seed = 0) {
      const normLevel = String(level || "easy").toLowerCase();
      const targetCount = { easy: 10, average: 15, intermediate: 20, advanced: 25 }[normLevel] || 10;
      const meta = resolveLessonGameMeta(material);
      const pool = [];

      // 1. Teacher's explicit gameQuestions
      if (Array.isArray(material?.gameQuestions)) {
        material.gameQuestions.forEach((q, idx) => {
          if (!q?.prompt || q?.answer === undefined) return;
          const ans = String(q.answer).trim();
          const opts = Array.isArray(q.choices) ? q.choices.map((c) => String(c).trim()).filter(Boolean) : [];
          if (!opts.includes(ans)) opts.unshift(ans);
          pool.push({
            id: `teacher-q-${idx}`,
            context: `Teacher Lesson Question (${material.title || "Lesson"})`,
            prompt: q.prompt,
            answer: ans,
            choices: shuffleOptions([...new Set(opts)]),
            hint: material.content || "Use your teacher's lesson note to answer."
          });
        });
      }

      // 2. Questions extracted from the teacher's lesson text/notes
      const extracted = extractQuestionsFromLessonText(material);
      pool.push(...extracted);

      // 3. Progressive level items from the matching NumeRead test bank
      const bankItems = window.NumeReadTestBanks?.getForActivity?.(meta.activityId, normLevel, { seed }) || [];
      bankItems.forEach((item, idx) => {
        const normalized = normalizeBankItemToQuestion(item, meta.activityId, idx);
        if (normalized && normalized.choices.length >= 2) {
          pool.push(normalized);
        }
      });

      // Deduplicate by prompt + answer and fill to targetCount
      const unique = [];
      const seen = new Set();
      for (const item of pool) {
        const key = `${item.prompt}::${item.answer}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push({ ...item, choices: shuffleOptions(item.choices) });
        }
        if (unique.length >= targetCount) break;
      }

      let fillerIdx = 0;
      while (unique.length < targetCount && pool.length > 0) {
        const base = pool[fillerIdx % pool.length];
        unique.push({
          ...base,
          id: `${base.id}-r${fillerIdx}`,
          choices: shuffleOptions(base.choices)
        });
        fillerIdx += 1;
      }

      return unique.slice(0, targetCount);
    }
  };

  window.NumeReadLessonGame = LessonGameEngine;

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
    getCachedLearningMaterials,
    saveLearningMaterial,
    deleteLearningMaterial,
    getTeacherAccounts,
    getRegisteredTeacherSections,
    isSectionTeacherRegistered,
    removeLocalTeacherSection,
    resetTeacherRegistrationCache,
    getTeacherByClassCode,
    generateClassCode,
    saveTeacherAccount,
    registerTeacher,
    loginTeacher,
    resetTeacherPassword,
    currentTeacher,
    getStudentsForCurrentTeacher,
    subscribeStudents,
    usingFirebase: () => hasFirebaseConfig() && (firebaseReady || Boolean(window.firebase && firebase.firestore)),
    
    // Registration functions (NEW)
    registerStudent,
    isDuplicateStudent,
    findStudentById,
    findStudentByName,
    authenticateStudent,
    buildFullName,
    generateStudentId,
    studentDocumentId,
    
    // Helper to get all students (for debugging)
    getAllStudents: getStudents
  };

  console.log('📚 NumeReadData loaded with registration support.');
})();
