/**
 * NumeRead Internationalization (i18n) & Lively Voice Engine
 * Provides bilingual support (English & Filipino / Tagalog) and an engaging,
 * expressive female/natural teacher voice for all reading and math activities.
 */

(function () {
  const STORAGE_KEY = "numeread_language";
  const DEFAULT_LANG = "en";

  // Core UI Strings in English & Filipino
  const DICTIONARY = {
    en: {
      langName: "English",
      langCode: "en",
      learner: "Learner",
      difficulty: "Difficulty",
      diffEasy: "Easy",
      diffAverage: "Average",
      diffIntermediate: "Intermediate",
      diffAdvanced: "Advanced",
      howToPlay: "How to Play",
      musicOn: "Music: On",
      musicOff: "Music: Off",
      dashboard: "Dashboard",
      stepOf: "Step {current} of {total}",
      tip: "Tip",
      listenToStep: "Listen to Step",
      speaking: "Speaking…",
      back: "Back",
      next: "Next",
      skip: "Skip",
      letsPlay: "Let's Play! 🚀",
      readToMe: "Read to Me",
      listenToSound: "Listen to Sound",
      listenToStory: "Listen to Story",
      listenToProblem: "Listen to Problem",
      correct: "✓ Correct!",
      notQuite: "✕ Not quite.",
      audioHint: "Lively audio narration active"
    },
    fil: {
      langName: "Filipino",
      langCode: "fil",
      learner: "Mag-aaral",
      difficulty: "Antas",
      diffEasy: "Madali",
      diffAverage: "Katamtaman",
      diffIntermediate: "Panggitna",
      diffAdvanced: "Mataas",
      howToPlay: "Paano Laruin",
      musicOn: "Musika: May Tunog",
      musicOff: "Musika: Naka-off",
      dashboard: "Dashboard",
      stepOf: "Hakbang {current} ng {total}",
      tip: "Paalala",
      listenToStep: "Pakinggan",
      speaking: "Nagsasalita…",
      back: "Bumalik",
      next: "Susunod",
      skip: "Laktawan",
      letsPlay: "Maglaro Na! 🚀",
      readToMe: "Basahin Para sa Akin",
      listenToSound: "Pakinggan ang Tunog",
      listenToStory: "Pakinggan ang Kuwento",
      listenToProblem: "Pakinggan ang Tanong",
      correct: "✓ Tama!",
      notQuite: "✕ Subukan muli.",
      audioHint: "Buhay at masiglang boses aktibo"
    }
  };

  // Phonetic respelling map for Tagalog to ensure authentic phonemes when an English TTS voice is used as a fallback
  const PHONETIC_TAGALOG_MAP = [
    [/\bmga\b/gi, "mah-ngah"],
    [/\bang\b/gi, "ahng"],
    [/\bng\b/gi, "nahng"],
    [/\bpindutin\b/gi, "peen-doo-teen"],
    [/\btamang\b/gi, "tah-mahng"],
    [/\bsagot\b/gi, "sah-goht"],
    [/\btingnan\b/gi, "teeng-nahn"],
    [/\bdalawang\b/gi, "dah-lah-wahng"],
    [/\bletrang\b/gi, "leh-trahng"],
    [/\bito\b/gi, "ee-toh"],
    [/\bpakinggan\b/gi, "pah-keeng-gahn"],
    [/\btunog\b/gi, "too-nohg"],
    [/\bupang\b/gi, "oo-pahng"],
    [/\btulungan\b/gi, "too-loo-ngahn"],
    [/\btumawid\b/gi, "too-mah-weed"],
    [/\bilog\b/gi, "ee-lohg"],
    [/\bpaano\b/gi, "pah-ah-noh"],
    [/\blaruin\b/gi, "lah-roo-een"],
    [/\bmaglaro\b/gi, "mahg-lah-roh"],
    [/\bhakbang\b/gi, "hahk-bahng"],
    [/\bkuwento\b/gi, "kwehn-toh"],
    [/\bpiliin\b/gi, "pee-lee-een"],
    [/\bmahusay\b/gi, "mah-hoo-sye"],
    [/\bating\b/gi, "ah-teeng"],
    [/\bpantig\b/gi, "pahn-teeg"],
    [/\bhiwa\b/gi, "hee-wah"],
    [/\bkatumbas\b/gi, "kah-toom-bahs"],
    [/\bdagdagan\b/gi, "dahg-dah-gahn"],
    [/\bbawasan\b/gi, "bah-wah-sahn"],
    [/\bmakinig\b/gi, "mah-kee-neeg"],
    [/\bmananakbo\b/gi, "mah-nah-nahk-boh"],
    [/\bmabilis\b/gi, "mah-bee-lees"],
    [/\bmagsalita\b/gi, "mahg-sah-lee-tah"],
    [/\bmikropono\b/gi, "meek-roh-poh-noh"],
    [/\bmalinaw\b/gi, "mah-lee-now"]
  ];

  /**
   * Native Tagalog Neural Audio Engine
   * Streams high-fidelity native Filipina pronunciation via Google Neural Tagalog audio
   * with seamless clause chunking and audio queueing.
   */
  class NativeTagalogAudioEngine {
    constructor() {
      this.currentAudio = null;
      this.audioQueue = [];
      this.isPlaying = false;
      this.onAllEnded = null;
    }

    stop() {
      this.audioQueue = [];
      this.isPlaying = false;
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
          this.currentAudio.src = "";
        } catch (e) {}
        this.currentAudio = null;
      }
    }

    chunkText(text) {
      const raw = String(text || "").trim();
      if (raw.length <= 150) return [raw];

      const chunks = [];
      const sentences = raw.split(/(?<=[.?!,;:\n])\s+/);
      let current = "";

      for (const s of sentences) {
        if ((current + " " + s).trim().length > 140) {
          if (current) chunks.push(current.trim());
          current = s;
        } else {
          current = (current ? current + " " + s : s);
        }
      }
      if (current && current.trim()) {
        chunks.push(current.trim());
      }

      return chunks.length > 0 ? chunks : [raw];
    }

    playTagalogSpeech(text, onEnd, onError) {
      this.stop();
      const chunks = this.chunkText(text);
      if (!chunks.length) {
        if (typeof onEnd === "function") onEnd();
        return;
      }

      this.audioQueue = [...chunks];
      this.onAllEnded = onEnd;
      this.playNextChunk(onError);
    }

    playNextChunk(onError) {
      if (!this.audioQueue.length) {
        this.isPlaying = false;
        if (typeof this.onAllEnded === "function") {
          this.onAllEnded();
        }
        return;
      }

      const chunk = this.audioQueue.shift();
      const url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=tl&client=tw-ob&q=" + encodeURIComponent(chunk);

      const audio = new Audio();
      audio.referrerPolicy = "no-referrer";
      audio.setAttribute("referrerpolicy", "no-referrer");
      this.currentAudio = audio;
      this.isPlaying = true;

      let handled = false;
      const handleNext = () => {
        if (handled) return;
        handled = true;
        this.playNextChunk(onError);
      };

      audio.onended = handleNext;

      audio.onerror = () => {
        if (handled) return;
        handled = true;
        if (typeof onError === "function") {
          onError();
        } else {
          handleNext();
        }
      };

      audio.src = url;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          if (handled) return;
          handled = true;
          if (typeof onError === "function") {
            onError();
          }
        });
      }
    }
  }

  class I18nManager {
    constructor() {
      this.currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
      if (!DICTIONARY[this.currentLang]) {
        this.currentLang = DEFAULT_LANG;
      }

      this.voices = [];
      this.cachedVoice = null;
      this.audioCtx = null;
      this.tagalogAudio = new NativeTagalogAudioEngine();

      this.initVoices();
    }

    /**
     * Preload and discover available speech synthesis voices
     */
    initVoices() {
      if (!("speechSynthesis" in window)) return;

      const updateVoices = () => {
        this.voices = window.speechSynthesis.getVoices() || [];
        this.cachedVoice = this.pickBestLivelyVoice(this.currentLang);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    /**
     * Checks if the device/browser actually has a native Filipino / Tagalog voice installed
     */
    hasCertifiedNativeFilipinoVoice() {
      if (!this.voices.length && "speechSynthesis" in window) {
        this.voices = window.speechSynthesis.getVoices() || [];
      }
      return this.voices.some(v =>
        /(fil|tagalog|fil-ph|tl-ph)/i.test(v.lang) ||
        /(blessica|angelo|filipino|tagalog)/i.test(v.name)
      );
    }

    /**
     * Converts Tagalog text to phonetic approximations for English TTS fallback
     */
    tagalogToPhonetic(text) {
      let res = String(text || "");
      for (const [pattern, replacement] of PHONETIC_TAGALOG_MAP) {
        res = res.replace(pattern, replacement);
      }
      return res;
    }

    /**
     * Pick an engaging, lively, and warm voice (prioritizing natural/expressive female voices)
     * Avoids monotonous, dry, robotic male voices.
     */
    pickBestLivelyVoice(langCode) {
      if (!this.voices.length && "speechSynthesis" in window) {
        this.voices = window.speechSynthesis.getVoices() || [];
      }
      if (!this.voices.length) return null;

      const lang = (langCode || this.currentLang).toLowerCase();

      // 1. If Filipino requested, check for Filipino / Tagalog voices
      if (lang === "fil" || lang === "tl") {
        // High priority: Microsoft Natural / Azure voices (Blessica, Angelo)
        const naturalFilipino = this.voices.find(v =>
          /(blessica|angelo)/i.test(v.name) ||
          (/(natural|online)/i.test(v.name) && /fil|tagalog/i.test(v.name + " " + v.lang))
        );
        if (naturalFilipino) return naturalFilipino;

        const filipinoVoice = this.voices.find(v =>
          /fil|tagalog|fil-ph|tl-ph/i.test(v.lang) || /filipino|tagalog/i.test(v.name)
        );
        if (filipinoVoice) return filipinoVoice;

        // Fallback for Filipino: Check for Philippine English (en-PH) which shares authentic phonology
        const phVoice = this.voices.find(v =>
          /en-ph/i.test(v.lang) || /philippines|filipina/i.test(v.name)
        );
        if (phVoice) return phVoice;
      }

      // 2. High-priority cheerful, warm female/natural educational voices
      // These names are standard across Chrome, Edge, Safari, iOS, Android, and Windows:
      const preferredNames = [
        "microsoft jenny online (natural)",
        "microsoft jenny",
        "microsoft aria online (natural)",
        "microsoft aria",
        "google us english",
        "google uk english female",
        "microsoft zira desktop",
        "microsoft zira",
        "samantha",
        "victoria",
        "karen",
        "moira",
        "fiona",
        "tessa"
      ];

      for (const pref of preferredNames) {
        const match = this.voices.find(v => v.name.toLowerCase().includes(pref));
        if (match) return match;
      }

      // 3. Look for any voice with "Natural", "Neural", "Female", or "Online" in English
      const naturalFemale = this.voices.find(v =>
        v.lang.startsWith("en") &&
        /(natural|neural|female|expressive|child|friendly)/i.test(v.name)
      );
      if (naturalFemale) return naturalFemale;

      // 4. Any English voice that is explicitly female or from Google/Apple
      const cheerfulEn = this.voices.find(v =>
        v.lang.startsWith("en") && /(google|apple|siri)/i.test(v.name)
      );
      if (cheerfulEn) return cheerfulEn;

      // 5. Exclude known monotonous robotic male voices (e.g. Microsoft David, Microsoft Mark, Microsoft George)
      const nonMonotonous = this.voices.find(v =>
        v.lang.startsWith("en") && !/(david|mark|george|robotic|monotone)/i.test(v.name)
      );
      if (nonMonotonous) return nonMonotonous;

      // 6. Return first voice as safe fallback
      return this.voices[0] || null;
    }

    /**
     * Play a friendly, subtle cheerful chime tone before speech begins
     */
    playChirp() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === "suspended") this.audioCtx.resume();

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Two cheerful upward notes (E5 to G#5)
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } catch (e) {}
    }

    /**
     * Engaging, authentic speech synthesis
     * Employs Native Tagalog Neural Audio when in Filipino for true native pronunciation,
     * or certified native Filipino voices with Tagalog phonetic fallback.
     */
    speak(text, onEnd) {
      this.stopSpeaking();

      const clean = String(text || "").replace(/<[^>]+>/g, " ").trim();
      if (!clean) return;

      // Soft cheerful chime intro
      this.playChirp();

      // CASE 1: FILIPINO / TAGALOG SPEECH
      if (this.currentLang === "fil") {
        // If the browser/device has a certified native Filipino voice (e.g. Edge with Microsoft Blessica/Angelo Online Natural, or Chrome on Android with Google Filipino)
        if (this.hasCertifiedNativeFilipinoVoice() && "speechSynthesis" in window) {
          const voice = this.pickBestLivelyVoice("fil");
          const utterance = new SpeechSynthesisUtterance(clean);
          if (voice) utterance.voice = voice;
          utterance.lang = (voice && voice.lang) || "fil-PH";
          utterance.pitch = 1.04;
          utterance.rate = 1.0;
          utterance.volume = 1.0;
          if (typeof onEnd === "function") {
            utterance.onend = onEnd;
            utterance.onerror = onEnd;
          }
          window.speechSynthesis.speak(utterance);
          return;
        }

        // Otherwise (e.g. Chrome or Brave on Windows without Filipino language pack),
        // stream authentic 100% native Tagalog neural audio to avoid terrible American accent butchering:
        this.tagalogAudio.playTagalogSpeech(
          clean,
          onEnd,
          /* On Network Error / Offline Fallback */
          () => {
            if (!("speechSynthesis" in window)) {
              if (typeof onEnd === "function") onEnd();
              return;
            }
            // Tagalog phonetic resynthesis fallback for English voice
            const phoneticText = this.tagalogToPhonetic(clean);
            const voice = this.pickBestLivelyVoice("en");
            const utterance = new SpeechSynthesisUtterance(phoneticText);
            if (voice) utterance.voice = voice;
            utterance.pitch = 1.1;
            utterance.rate = 0.95;
            utterance.volume = 1.0;
            if (typeof onEnd === "function") {
              utterance.onend = onEnd;
              utterance.onerror = onEnd;
            }
            window.speechSynthesis.speak(utterance);
          }
        );
        return;
      }

      // CASE 2: ENGLISH SPEECH
      if (!("speechSynthesis" in window)) {
        if (typeof onEnd === "function") onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      const voice = this.pickBestLivelyVoice("en");

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-US";
      } else {
        utterance.lang = "en-US";
      }

      // Friendly, cheerful teacher prosody for English
      utterance.pitch = 1.18;
      utterance.rate = 1.03;
      utterance.volume = 1.0;

      if (typeof onEnd === "function") {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    }

    stopSpeaking() {
      if (this.tagalogAudio) {
        this.tagalogAudio.stop();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    /**
     * Get string translation by key
     */
    t(key, params = {}) {
      const dict = DICTIONARY[this.currentLang] || DICTIONARY.en;
      let text = dict[key] || DICTIONARY.en[key] || key;
      for (const [pKey, pVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), pVal);
      }
      return text;
    }

    getLanguage() {
      return this.currentLang;
    }

    setLanguage(lang) {
      if (!DICTIONARY[lang]) return;
      this.currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      this.cachedVoice = this.pickBestLivelyVoice(lang);

      // Dispatch global event for all components
      if (typeof window.dispatchEvent === "function") {
        try {
          const evt = typeof CustomEvent !== "undefined"
            ? new CustomEvent("numeread:languagechange", { detail: { language: lang } })
            : { type: "numeread:languagechange", detail: { language: lang } };
          window.dispatchEvent(evt);
        } catch (e) {}
      }

      this.updateDOMTexts();
      this.updateToggleButtons();
    }

    toggleLanguage() {
      const nextLang = this.currentLang === "en" ? "fil" : "en";
      this.setLanguage(nextLang);
      return nextLang;
    }

    /**
     * Update standard game top-bar and UI texts on language switch
     */
    updateDOMTexts() {
      // 1. How to Play button
      const tutorialBtn = document.querySelector("[data-game-tutorial]");
      if (tutorialBtn) {
        tutorialBtn.innerHTML = `<i class="fas fa-circle-question"></i> ${this.t("howToPlay")}`;
      }

      // 2. Dashboard back button
      const backBtn = document.querySelector("#backDashboardBtn, .btn-dashboard");
      if (backBtn && !backBtn.dataset.noI18n) {
        backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${this.t("dashboard")}`;
      }

      // 3. Difficulty translation
      const diffDisplay = document.querySelector("#difficultyDisplay, [data-difficulty]");
      if (diffDisplay) {
        const currentDiff = (diffDisplay.getAttribute("data-raw-difficulty") || diffDisplay.textContent || "").toLowerCase();
        let localizedDiff = this.t("diffEasy");
        if (currentDiff.includes("aver") || currentDiff.includes("katamtaman")) localizedDiff = this.t("diffAverage");
        else if (currentDiff.includes("inter") || currentDiff.includes("panggitna")) localizedDiff = this.t("diffIntermediate");
        else if (currentDiff.includes("advan") || currentDiff.includes("mataas")) localizedDiff = this.t("diffAdvanced");
        diffDisplay.textContent = localizedDiff;
      }
    }

    /**
     * Install interactive Language Toggle Pill into .stats-pills or .top-bar
     */
    installLanguageToggle(containerSelector = ".stats-pills") {
      const container = document.querySelector(containerSelector) || document.querySelector(".top-bar");
      if (!container || container.querySelector("[data-numeread-lang-toggle]")) return;

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.dataset.numereadLangToggle = "";
      toggleBtn.className = "pill lang-toggle-pill";
      toggleBtn.setAttribute("aria-label", "Switch language between English and Filipino");
      toggleBtn.title = "Switch Language (English / Filipino)";

      this.renderToggleContent(toggleBtn);

      toggleBtn.addEventListener("click", () => {
        this.toggleLanguage();
      });

      // Insert at the beginning or before tutorial button
      container.insertBefore(toggleBtn, container.firstChild);
      this.updateDOMTexts();
    }

    renderToggleContent(btn) {
      const isFil = this.currentLang === "fil";
      btn.innerHTML = `
        <i class="fas fa-globe"></i>
        <span class="lang-code ${!isFil ? "is-active" : ""}">EN</span>
        <span class="lang-divider">/</span>
        <span class="lang-code ${isFil ? "is-active" : ""}">FIL</span>
      `;
    }

    updateToggleButtons() {
      document.querySelectorAll("[data-numeread-lang-toggle]").forEach(btn => {
        this.renderToggleContent(btn);
      });
    }
  }

  // Export singleton to window
  window.NumeReadI18n = new I18nManager();
})();
