/* NumeRead Game Test Banks
 * Single source of truth for all game question content.
 * Reading, Mathematics, and Reading & Mathematics are kept separate.
 * Each game/level has exactly: Easy 10, Average 15, Intermediate 20, Advanced 25.
 */
(function () {
  "use strict";

  const COUNTS = Object.freeze({ easy: 10, average: 15, intermediate: 20, advanced: 25 });
  const LEVELS = Object.freeze(["easy", "average", "intermediate", "advanced"]);

  const shuffle = (items, seed = 1) => {
    const out = [...items];
    let s = Math.abs(Number(seed) || 1) + 17;
    for (let i = out.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const choices = (answer, distractors) => {
    const list = [String(answer)];
    for (const d of distractors) {
      const s = String(d);
      if (!list.includes(s)) list.push(s);
    }
    return shuffle(list.slice(0, 4), list.length + 7);
  };

  // Every item receives its own deterministic answer order.  It is stable
  // while a learner is answering a round, but varies across questions so the
  // correct answer cannot become predictably "A".
  function hashText(value) {
    let hash = 2166136261;
    for (const char of String(value || "")) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function choiceValue(choice) {
    return String(choice && typeof choice === "object" ? choice.value : choice);
  }

  function cloneChoices(list) {
    return Array.isArray(list) ? list.map((choice) => typeof choice === "object" ? { ...choice } : String(choice)) : [];
  }

  function fractionDistractors(num, den, count = 2) {
    const answer = `${num}/${den}`;
    const values = [];
    const add = (numerator, denominator) => {
      if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || numerator < 1 || numerator >= denominator) return;
      const value = `${numerator}/${denominator}`;
      if (value !== answer && !values.includes(value)) values.push(value);
    };
    add(num - 1, den);
    add(num + 1, den);
    add(num + 2, den);
    add(1, den);
    add(num, den + 1);
    add(num === 1 ? 2 : 1, den + 1);
    return values.slice(0, count);
  }

  function itemComplexity(item) {
    if (Number.isFinite(Number(item.difficultyRank))) return Number(item.difficultyRank);
    if (Number.isFinite(Number(item.length)) && Number.isFinite(Number(item.width)) && Number.isFinite(Number(item.height))) return Number(item.length) * Number(item.width) * Number(item.height);
    if (Number.isFinite(Number(item.width)) && Number.isFinite(Number(item.height)) && Number.isFinite(Number(item.cutWidth))) return (Number(item.width) * Number(item.height)) + (Number(item.cutWidth) * Number(item.cutHeight || 0));
    if (Number.isFinite(Number(item.den))) return Number(item.den) * 100 + Number(item.num || 0);
    if (Number.isFinite(Number(item.a)) && Number.isFinite(Number(item.b))) return Math.max(Number(item.a), Number(item.b)) * 100 + Math.min(Number(item.a), Number(item.b));
    const expression = String(item.expression || item.prompt || item.story || item.sentence || item.passage || item.word || "");
    const numbers = expression.match(/\d+/g) || [];
    return (numbers.reduce((total, value) => total + Number(value), 0) * 10) + expression.length;
  }

  function itemSignature(item) {
    const text = String(
      item.expression || item.story || item.sentence || item.passage || item.word || item.prompt || item.question || ""
    ).replace(/\s+/g, " ").trim().toLowerCase();
    const math = text.match(/^(\d+)\s*([+×*])\s*(\d+)$/);
    // Addition and multiplication facts are the same learning item when their
    // factors are merely reversed (for example, 3 × 4 and 4 × 3).
    if (math) {
      const [left, right] = [Number(math[1]), Number(math[3])].sort((a, b) => a - b);
      return `math:${math[2]}:${left}:${right}`;
    }
    return `${text}|${String(item.answer ?? "").toLowerCase()}`;
  }

  function uniqueProgressivePersonalizedItems(activityId, level, items, studentId, profile = {}) {
    const stageIndex = Math.max(0, LEVELS.indexOf(level));
    const used = new Set();
    const subject = Object.keys(BANKS).find((key) => BANKS[key][activityId]);

    // A personalized level must not recycle an item from an earlier completed
    // level, whether that earlier set was standard or teacher-personalized.
    if (subject) {
      LEVELS.slice(0, stageIndex).forEach((earlierLevel) => {
        (BANKS[subject][activityId][earlierLevel] || []).forEach((item) => used.add(itemSignature(item)));
      });
    }
    LEVELS.slice(0, stageIndex).forEach((earlierLevel) => {
      (PERSONALIZED_BANKS.get(bankKey(activityId, earlierLevel, studentId)) || []).forEach((item) => used.add(itemSignature(item)));
    });

    const selected = [];
    const add = (item) => {
      const signature = itemSignature(item);
      if (!signature || used.has(signature) || selected.some((candidate) => itemSignature(candidate) === signature)) return;
      used.add(signature);
      selected.push(item);
    };
    // Generated support items may have a small source pool. Complete the set
    // with unused items from this level's deliberately harder bank rather
    // than cycling earlier questions.
    const fallback = subject ? (BANKS[subject][activityId][level] || []) : [];
    const levelSpecificFallback = fallback.map((item) => ({
      ...item,
      id: `personal-${item.id}-${personalizedSeed(studentId)}`,
      tip: profile.subtopic ? `Target skill: ${profile.subtopic}. ${item.tip || ""}`.trim() : item.tip,
      targetSubtopic: profile.subtopic || item.targetSubtopic || "",
      isPersonalized: true
    }));

    // From Average onward, lead with the level's curated band. This guarantees
    // the learner moves to genuinely harder material even while receiving
    // targeted support for a specific gap.
    (stageIndex > 0 ? levelSpecificFallback : items).forEach(add);
    (stageIndex > 0 ? items : levelSpecificFallback).forEach(add);
    return selected.slice(0, COUNTS[level]);
  }

  function needsProgressiveRefresh(activityId, level, items) {
    const normalized = normalizeLevel(level);
    if (!Array.isArray(items) || items.length !== COUNTS[normalized]) return true;
    const signatures = items.map(itemSignature);
    if (new Set(signatures).size !== signatures.length) return true;
    if (normalized === "easy") return false;

    const subject = Object.keys(BANKS).find((key) => BANKS[key][activityId]);
    const currentBand = subject ? (BANKS[subject][activityId][normalized] || []) : [];
    if (!currentBand.length) return false;
    const currentFloor = Math.min(...currentBand.map(itemComplexity));
    // A later level must not be populated with an earlier level's problems.
    // This catches stale/API items such as 3 + 2 being shown in Average.
    return items.some((item) => itemComplexity(item) < currentFloor);
  }

  function prepareActivityItems(items, activityId, level, variation = 0) {
    const ranked = [...items].sort((left, right) => itemComplexity(left) - itemComplexity(right));
    const offset = hashText(`${activityId}:${level}:${variation}`);
    return ranked.map((source, index) => {
      const item = { ...source, choices: cloneChoices(source.choices) };
      if (item.choices.length < 2) return item;
      const correctChoice = item.choices.find((choice) => choiceValue(choice) === String(item.answer));
      if (!correctChoice) return item;
      // Bad or generated data can accidentally repeat the correct value. Keep
      // just one copy so an answer is never represented by two buttons.
      const seen = new Set([String(item.answer)]);
      const distractors = item.choices.filter((choice) => {
        const value = choiceValue(choice);
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
      item.choices = [correctChoice, ...distractors];
      if (item.choices.length < 2) return item;
      // Distribute the correct answer evenly through all available positions.
      const targetIndex = (index + offset) % item.choices.length;
      const [answerChoice] = item.choices.splice(0, 1);
      item.choices.splice(targetIndex, 0, answerChoice);
      return item;
    });
  }

  function makeReadingBridgeLevel(level, count) {
    const pools = {
      easy: [
        ["bl", "blue"], ["br", "brush"], ["cl", "clap"], ["cr", "crab"], ["dr", "drum"],
        ["fl", "flag"], ["fr", "frog"], ["gl", "glad"], ["gr", "green"], ["pl", "plane"]
      ],
      average: [
        ["pr", "prize"], ["sl", "slide"], ["sm", "smile"], ["sn", "snow"], ["sp", "spoon"],
        ["st", "star"], ["sw", "swing"], ["tr", "train"], ["tw", "twin"], ["ch", "chair"],
        ["sh", "ship"], ["th", "three"], ["wh", "whale"], ["sk", "skate"], ["sc", "school"]
      ],
      intermediate: [
        ["str", "street"], ["scr", "screen"], ["spl", "splash"], ["spr", "spring"], ["thr", "throw"],
        ["shr", "shrink"], ["squ", "square"], ["scr", "scrub"], ["str", "strong"], ["spr", "sprout"],
        ["spl", "split"], ["thr", "thread"], ["shr", "shrimp"], ["squ", "squeeze"], ["scr", "scratch"],
        ["str", "stripe"], ["spr", "spread"], ["spl", "splendid"], ["thr", "throat"], ["shr", "shred"]
      ],
      advanced: [
        ["strat", "strategy"], ["scram", "scramble"], ["splen", "splendid"], ["sprin", "sprinkle"], ["thril", "thriller"],
        ["shrew", "shrewd"], ["squir", "squirrel"], ["struc", "structure"], ["scrut", "scrutinize"], ["sprint", "sprinter"],
        ["splint", "splinter"], ["thresh", "threshold"], ["shrink", "shrinkage"], ["squad", "squadron"], ["stream", "streamline"],
        ["scrib", "scribble"], ["sprout", "sprouting"], ["splashe", "splashes"], ["threat", "threaten"], ["shru", "shrug"],
        ["squabb", "squabble"], ["stretch", "stretches"], ["screeni", "screening"], ["sproute", "sprouted"], ["splitti", "splitting"]
      ]
    };
    const pool = pools[level];
    return pool.slice(0, count).map(([blend, word], i) => {
      const distractors = pool.filter(([, w]) => w !== word).slice((i + 2) % Math.max(1, pool.length), (i + 2) % Math.max(1, pool.length) + 3).map(([, w]) => w);
      while (distractors.length < 3) distractors.push(["sun", "cat", "book", "fish"][distractors.length]);
      return { id: `rb-${level}-${i + 1}`, blend, prompt: blend, answer: word, choices: choices(word, distractors.slice(0, 3)), lesson: `Blend ${blend} smoothly to read ${word}.` };
    });
  }

  function makeSentenceLevel(level, count) {
    const subjects = {
      easy: ["The cat", "A dog", "The sun", "Fish", "Birds", "My kite", "The boy", "A girl", "The frog", "Our teacher"],
      average: ["The small bird", "My red ball", "The happy girl", "Green frogs", "Bright yellow stars", "The young puppy", "A careful child", "The blue boat", "Our friendly neighbor", "The noisy class", "The little rabbit", "A brave boy", "The warm soup", "Three bright flowers", "The playful kitten"],
      intermediate: ["The curious student", "A careful scientist", "The friendly librarian", "Our young athletes", "The colorful kite", "A patient gardener", "The excited children", "The helpful teacher", "A quiet reader", "The creative artist", "The busy farmer", "A thoughtful friend", "The tiny bird", "The strong swimmer", "A cheerful family", "The new student", "The careful baker", "The smiling nurse", "A curious explorer", "The kind coach"],
      advanced: ["During the rainy afternoon, the careful student", "After the science lesson, the curious class", "Before the school program, the young performers", "During the weekend, the helpful family", "After reading the story, the thoughtful learner", "Before sunrise, the patient gardener", "During the competition, the determined runner", "After the storm, the careful neighbors", "Before the trip, the prepared children", "During the experiment, the careful scientist", "After lunch, the responsible monitor", "Before bedtime, the young reader", "During the celebration, the cheerful students", "After practice, the hardworking team", "Before class, the organized teacher", "During the field trip, the curious explorers", "After the rain, the happy children", "Before the test, the focused learner", "During recess, the friendly classmates", "After the project, the proud group", "Before the concert, the young singers", "During the garden activity, the careful pupils", "After the lesson, the active learners", "Before dismissal, the responsible student", "During the reading hour, the quiet class"]
    };
    const verbs = {
      easy: ["runs fast", "barks loudly", "shines bright", "swim in water", "sing sweet songs", "flies high", "reads a book", "plays outside", "jumps over the log", "helps a friend"],
      average: ["sings sweetly", "bounces high", "dances joyfully", "leap into ponds", "light the sky", "sleeps peacefully", "shares the crayons", "sails across the lake", "greets everyone kindly", "works quietly", "hops near the garden", "helps the class", "smells delicious", "grow beside the path", "plays with a ball"],
      intermediate: ["carefully reads the science book", "patiently studies the map", "quickly organizes the materials", "happily practices the new skill", "quietly observes the birds", "carefully waters the plants", "excitedly prepares for the game", "kindly explains the answer", "smoothly reads the paragraph", "creatively paints the poster", "carefully checks the crops", "thoughtfully writes a note", "quickly flies toward the nest", "strongly swims across the pool", "cheerfully visits the library", "carefully welcomes the newcomer", "gently mixes the ingredients", "happily helps the patient", "curiously explores the trail", "kindly encourages the team"],
      advanced: ["carefully organized the research notes before the presentation", "worked together to complete the science investigation", "practiced the difficult passage until every sentence sounded smooth", "prepared the materials before the class activity began", "used the map to choose the safest route", "recorded each observation in the notebook", "checked the evidence before writing a conclusion", "reviewed the instructions before starting the project", "explained the solution using clear details", "sorted the materials according to their purpose", "compared the results before sharing them", "planned the garden schedule around the weather", "read the directions twice before answering", "helped younger pupils understand the activity", "organized the books by topic and level", "revised the paragraph to improve its meaning", "measured the ingredients before mixing them", "checked the team list before the event", "described the experiment in complete sentences", "explained why the answer was reasonable", "summarized the story after reading it", "followed the safety steps during the activity", "identified the main idea before writing", "reviewed the final work for missing details", "shared the evidence during the discussion"]
    };
    return subjects[level].slice(0, count).map((subject, i) => {
      const tail = verbs[level][i];
      const sentence = `${subject} ${tail}`;
      const answer = i % 3 === 0 ? subject : i % 3 === 1 ? tail.split(" ").slice(-1)[0].replace(/[.!?]/g, "") : subject.split(" ").slice(-1)[0];
      const distractors = ["A different person", "Something else", "The other group", "No one"];
      return { id: `sb-${level}-${i + 1}`, words: sentence.split(" "), sentence, question: `What is one important detail in the sentence?`, answer, choices: choices(answer, distractors.slice(0, 3)), hint: "Read the sentence again and look for the detail asked about." };
    });
  }

  function situationalVocabSentence(word, clue, index) {
    const scenarios = [
      `At the school fair, the class used this clue: ${clue}. They chose the word "${word}".`,
      `During group work, a context card read: ${clue}. One student matched it with "${word}".`,
      `When the bell rang, the teacher wrote a clue on the board: ${clue}. The best word for it was "${word}".`,
      `In the library, a reading partner found this evidence: ${clue}. That helped the pair understand "${word}".`,
      `For the science notebook, the team recorded the detail "${clue}" and labelled it "${word}".`,
      `At recess, friends discussed an event with this important clue: ${clue}. Their word choice was "${word}".`,
      `While preparing a class poster, the group highlighted ${clue} as evidence for the word "${word}".`,
      `On a community walk, the guide gave the clue "${clue}." The students matched it with "${word}".`,
      `During the challenge, the learner collected a detail: ${clue}. That detail pointed to "${word}".`,
      `In a home-and-school journal, the writer included the clue "${clue}" and used the word "${word}".`,
      `Before the presentation, the team placed ${clue} on a vocabulary card titled "${word}".`,
      `At the museum exhibit, the caption offered this context clue: ${clue}. Visitors connected it to "${word}".`,
      `While solving a mystery, the detectives underlined ${clue} and selected "${word}" for their report.`,
      `In the garden project, the students noted this clue: ${clue}. They used "${word}" to describe it.`,
      `During a class debate, the strongest supporting detail was ${clue}. It explained the word "${word}".`,
      `On the field trip, the guide shared a clue—${clue}. The group identified the precise word "${word}".`,
      `For a peer-feedback note, the writer chose ${clue} as context for the vocabulary word "${word}".`,
      `At the reading station, the context card showed ${clue}. The reader connected that evidence to "${word}".`,
      `While planning a solution, the group returned to one fact: ${clue}. That made "${word}" the clearest choice.`,
      `In the school news report, the reporter highlighted ${clue} before using the word "${word}".`,
      `During an art critique, the class used the detail ${clue} and added "${word}" to the caption.`,
      `At the help desk, a student brought this clue: ${clue}. The mentor suggested the word "${word}".`,
      `For the final scavenger-hunt clue, the message was ${clue}. The winning team identified it as "${word}".`,
      `In a reflection circle, the group discussed ${clue}. They agreed that "${word}" described the situation best.`,
      `While reviewing a real-life problem, the team found this evidence: ${clue}. Their conclusion used the academic word "${word}".`
    ];
    return scenarios[index % scenarios.length];
  }

  function makeVocabLevel(level, count) {
    const sets = {
      easy: [
        ["tiny", "Very small", "hard to see"], ["glad", "Full of joy", "smiled happily"], ["swift", "Moving fast", "raced quickly"], ["cozy", "Snug and comfortable", "warm blanket"], ["gigantic", "Extremely huge", "as big as a ship"], ["silent", "Making no sound", "could not hear a noise"], ["bright", "Full of light", "shone strongly"], ["hungry", "Wanting food", "asked for a snack"], ["neat", "Clean and orderly", "everything was arranged"], ["brave", "Not afraid", "faced the challenge"]
      ],
      average: [
        ["courageous", "Brave and bold", "without fear"], ["tranquil", "Quiet and calm", "calm and peaceful"], ["ancient", "From long ago", "thousands of years ago"], ["generous", "Willing to share", "shared extra"], ["peculiar", "Strange or unusual", "unusual whistling sound"], ["fortunate", "Lucky", "received good news"], ["eager", "Very excited to do something", "could not wait"], ["fragile", "Easily broken", "handled carefully"], ["observe", "Watch carefully", "look closely"], ["rapid", "Very quick", "moved quickly"], ["patient", "Able to wait calmly", "waited without complaining"], ["scarce", "Hard to find", "only a few remained"], ["valuable", "Worth a lot or very useful", "important to protect"], ["confident", "Sure of yourself", "spoke clearly"], ["curious", "Wanting to know more", "asked many questions"]
      ],
      intermediate: [
        ["reluctant", "Unwilling or hesitant", "was not sure about joining"], ["persistent", "Continuing despite difficulty", "kept trying"], ["efficient", "Working well without waste", "finished quickly and carefully"], ["essential", "Very necessary", "needed for the task"], ["altruistic", "Caring about helping others", "shared resources"], ["diligent", "Hardworking and careful", "checked every detail"], ["adapt", "Change to fit a new situation", "adjusted to the new rule"], ["predict", "Say what may happen", "used clues about the future"], ["contrast", "Show differences", "compared two unlike ideas"], ["precise", "Exact and accurate", "gave the exact measurement"], ["reliable", "Can be trusted", "always completed the task"], ["significant", "Important or meaningful", "had a major effect"], ["preserve", "Keep safe from harm or loss", "protected the water"], ["serendipitous", "Happening by a lucky chance", "found the missing item"], ["expand", "Make larger or wider", "added more details"], ["complex", "Having many connected parts", "included several steps"], ["assess", "Judge the quality or value", "checked the choices"], ["identify", "Recognize or name", "named the object"], ["require", "Need something", "must have a pass"], ["accurate", "Correct and free from errors", "matched the answer"]
      ],
      advanced: [
        ["analyze", "Examine carefully to understand", "studied each part"], ["infer", "Reach a conclusion from clues", "the evidence suggested"], ["substantial", "Large or important in amount", "a large improvement"], ["consequence", "A result that follows an action", "what happened afterward"], ["perspective", "A particular way of viewing something", "from her point of view"], ["justify", "Give reasons or evidence", "explained why the answer was correct"], ["interpret", "Explain the meaning", "explained the message"], ["relevant", "Closely connected to the topic", "directly related to the question"], ["formulate", "Develop a plan or idea", "created a careful plan"], ["distinguish", "Recognize the difference", "told two ideas apart"], ["demonstrate", "Show clearly by action or evidence", "showed how it worked"], ["synthesize", "Combine ideas into a whole", "connected information from sources"], ["hypothesis", "A testable explanation or prediction", "a possible explanation"], ["appraise", "Judge using evidence", "compared strengths and weaknesses"], ["adaptation", "A change that helps something fit conditions", "a useful change"], ["innovation", "A new idea or method", "introduced a new approach"], ["principle", "A basic rule or idea", "a guiding rule"], ["phenomenon", "An observable event or fact", "a natural event"], ["stewardship", "Careful responsibility for resources", "used resources carefully"], ["credible", "Believable and trustworthy", "supported by evidence"], ["sequence", "The order in which things happen", "first, next, and last"], ["objective", "A goal or intended result", "the target of the activity"], ["clarify", "Make something easier to understand", "explained the confusing part"], ["accurately", "In a correct way", "without errors"], ["resourceful", "Able to solve problems with available resources", "found a practical solution"]
      ]
    };
    const dailySituations = {
      courageous: ["When the power went out during a storm, Paolo was courageous and walked with his little sister to find their mother.", "walked with his little sister"],
      tranquil: ["Early Sunday morning, the street was tranquil; only soft birdsong could be heard outside the window.", "only soft birdsong could be heard"],
      ancient: ["Grandpa showed Liza an ancient coin that had been kept in the family for hundreds of years.", "kept in the family for hundreds of years"],
      generous: ["At lunch, Bea was generous and shared her extra sandwiches with two classmates who forgot theirs.", "shared her extra sandwiches"],
      peculiar: ["On the walk home, Nico heard a peculiar sound from the bushes—an unusual whistling sound that did not sound like any bird.", "an unusual whistling sound"],
      fortunate: ["Mika felt fortunate when her lost bus card was returned by a kind neighbor.", "was returned by a kind neighbor"],
      eager: ["The children were eager to visit their cousins and could not wait for Saturday to arrive.", "could not wait for Saturday"],
      fragile: ["Before moving house, Ana wrapped the fragile glass picture frame in towels so it would not break.", "so it would not break"],
      observe: ["While riding the bus, Carlo stopped to observe the workers carefully planting new trees by the road.", "carefully planting new trees"],
      rapid: ["When the rain started, the river rose at a rapid pace and quickly covered the stepping stones.", "quickly covered the stepping stones"],
      patient: ["At the clinic, Jay was patient and waited without complaining until it was his turn.", "waited without complaining"],
      scarce: ["After the neighborhood sale, clean drinking water was scarce because only a few bottles remained.", "only a few bottles remained"],
      valuable: ["Rina keeps her grandmother's handwritten recipe in a valuable box because it is important to protect.", "important to protect"],
      confident: ["At her cousin's birthday dinner, Ella sounded confident when she stood up and spoke clearly to thank everyone.", "spoke clearly"],
      curious: ["During a family visit to the zoo, Ben was curious and asked many questions about every animal he saw.", "asked many questions"]
    };
    return sets[level].slice(0, count).map(([word, answer, clue], i) => {
      const situation = dailySituations[word];
      const sentence = situation ? situation[0] : situationalVocabSentence(word, clue, i);
      const contextClue = situation ? situation[1] : clue;
      return {
      id: `vq-${level}-${i + 1}`,
      word,
      phonics: `[${word}]`,
      sentence,
      clue: contextClue,
      answer,
      choices: choices(answer, ["Something unrelated", "The opposite idea", "A random guess"])
      };
    });
  }

  function makeComprehensionLevel(level, count) {
    const subjects = {
      easy: ["Lito", "Mia", "Ana", "Rico", "Mina", "Leo", "Sara", "Noah", "Ella", "Ben"],
      average: ["Ana", "Rico", "Mina", "Lucas", "The baker", "The class", "Nina", "Carlo", "Jessa", "Paolo", "Mara", "Toby", "Lina", "Mark", "Sofia"],
      intermediate: ["Carla", "Marco", "Elena", "The sorting robot", "The school team", "Jonah", "Grace", "Milo", "The gardener", "The young scientist", "The librarian", "The coach", "Ava", "Daniel", "The class monitor", "The explorer", "The baker", "The researcher", "The artist", "The farmer"],
      advanced: ["The research team", "The student council", "The environmental club", "The science class", "The community garden group", "The young historian", "The library committee", "The robotics team", "The school newspaper", "The debate team", "The conservation group", "The art club", "The student researcher", "The health committee", "The reading circle", "The mathematics team", "The campus volunteers", "The museum guide", "The community planners", "The technology class", "The garden project", "The local history group", "The science fair team", "The school leaders", "The reading club"]
    };
    // Each band practises a different comprehension move rather than merely
    // changing the character names in the same passages.
    const actions = {
      easy: ["named the main character", "found a color word", "put events in order", "noticed a setting detail", "matched a picture clue", "retold the first event", "identified a feeling", "found a number detail", "described an object", "chose the story ending"],
      average: ["explained a cause", "identified an effect", "compared two details", "used a context clue", "described a character trait", "found the problem", "located the solution", "identified the main idea", "ordered the key events", "selected supporting evidence", "explained a sequence", "summarized a paragraph", "recognized a transition word", "distinguished fact from opinion", "made a simple prediction"],
      intermediate: ["made an inference", "identified the author’s purpose", "compared points of view", "drew a conclusion", "connected two pieces of evidence", "explained a character change", "recognized cause and effect", "summarized important details", "interpreted a figurative clue", "predicted from evidence", "evaluated a solution", "identified a conflict", "distinguished central and minor ideas", "explained a text structure", "supported an opinion with evidence", "determined a theme", "analyzed a character choice", "compared sources", "clarified a reference", "synthesized a conclusion"],
      advanced: ["evaluated multiple sources", "analyzed an author’s claim", "synthesized supporting evidence", "distinguished bias from fact", "inferred an implicit theme", "critiqued a reasoning pattern", "compared conflicting perspectives", "justified a conclusion", "analyzed a text structure", "evaluated the strength of evidence", "interpreted nuanced language", "identified an unstated assumption", "traced a complex cause", "assessed source credibility", "synthesized a central argument", "explained a rhetorical choice", "compared historical viewpoints", "evaluated a counterclaim", "inferred a speaker’s purpose", "analyzed a logical connection", "determined relevance of evidence", "explained a shift in tone", "integrated ideas across paragraphs", "judged a proposed solution", "formulated an evidence-based conclusion"]
    };
    return subjects[level].slice(0, count).map((subject, i) => {
      const action = actions[level][i];
      const detail = ["before class began", "after finding a clue", "during the morning activity", "because the task was important", "so the group could finish on time"][i % 5];
      const answer = `${action}`;
      const passage = `${subject} ${action} ${detail}. The group then checked the work and continued with the activity.`;
      return { id: `ct-${level}-${i + 1}`, passage, question: `What did ${subject.toLowerCase()} do?`, answer, choices: choices(answer, ["left the activity", "ignored the task", "forgot the materials"]), evidence: `${subject} ${action} ${detail}.` };
    });
  }

  function makePronunciationLevel(level, count) {
    const wordPools = {
      easy: ["cat", "dog", "sun", "map", "fish", "book", "milk", "frog", "tree", "star"],
      average: ["apple", "basket", "button", "garden", "happy", "little", "pencil", "rabbit", "window", "yellow", "family", "morning", "picture", "teacher", "playing"],
      intermediate: ["beautiful", "calendar", "community", "delicious", "elephant", "favorite", "hospital", "important", "library", "medicine", "paragraph", "question", "remember", "together", "umbrella", "vacation", "wonderful", "yesterday", "adventure", "celebrate"],
      advanced: ["accurately", "appropriate", "communication", "concentration", "conversation", "curiosity", "destination", "education", "environment", "explanation", "information", "imagination", "independent", "introduction", "mathematics", "opportunity", "organization", "pronunciation", "responsibility", "temperature", "understanding", "vocabulary", "wonderfully", "collaboration", "determination"]
    };
    return wordPools[level].slice(0, count).map((word, index) => ({
      id: `pp-${level}-${index + 1}`,
      word,
      prompt: word,
      answer: word,
      choices: [],
      tip: "Listen first, then say every sound clearly and smoothly."
    }));
  }

  function makeSpellingLevel(level, count) {
    const words = {
      easy: ["cat", "sun", "fish", "book", "frog", "star", "train", "brush", "plant", "smile"],
      average: ["basket", "garden", "window", "rabbit", "yellow", "picture", "teacher", "morning", "playing", "library", "country", "because", "different", "favorite", "together"],
      intermediate: ["beautiful", "calendar", "community", "delicious", "elephant", "important", "paragraph", "question", "remember", "umbrella", "vacation", "wonderful", "yesterday", "adventure", "celebrate", "dictionary", "exercise", "friendship", "knowledge", "language"],
      advanced: ["accurately", "appropriate", "communication", "concentration", "conversation", "curiosity", "destination", "education", "environment", "explanation", "information", "imagination", "independent", "introduction", "mathematics", "opportunity", "organization", "pronunciation", "responsibility", "temperature", "understanding", "vocabulary", "collaboration", "determination", "investigation"]
    };
    return words[level].slice(0, count).map((word, index) => ({ id: `sp-${level}-${index + 1}`, word, prompt: `Spell the word: ${word}`, answer: word, choices: [] }));
  }

  function makeAdditionLevel(level, count) {
    const levelRules = {
      // Stage 1: one-digit facts, all totals at or below 10.
      easy: {
        values: [[1, 3], [2, 4], [3, 5], [4, 5], [5, 2], [6, 3], [7, 1], [2, 6], [3, 4], [1, 8]],
        tip: "Easy facts: count on from the bigger number. Every total is 10 or less."
      },
      // Stage 2: two-digit addition without regrouping in the ones place.
      average: {
        values: Array.from({ length: 15 }, (_, i) => [12 + i, 21 + (i % 5) * 10]),
        tip: "Average: add the tens and ones separately. These problems do not need regrouping."
      },
      // Stage 3: two-digit addition that requires making a new ten.
      intermediate: {
        values: Array.from({ length: 20 }, (_, i) => [27 + i * 2, 18 + (i % 6) * 3]),
        tip: "Intermediate: regroup when the ones make 10 or more, then add the tens."
      },
      // Stage 4: three-digit sums with carrying across place values.
      advanced: {
        values: Array.from({ length: 25 }, (_, i) => [125 + i * 13, 168 + i * 17]),
        tip: "Advanced: align hundreds, tens, and ones; regroup carefully across place values."
      }
    };
    const rule = levelRules[level];
    return rule.values.slice(0, count).map(([a, b], i) => {
      const answer = a + b;
      return { id: `mn-${level}-${i + 1}`, prompt: `${a} + ${b}`, answer, choices: choices(answer, [answer - 1, answer + 1, answer + 2]), a, b, tip: rule.tip };
    });
  }

  function makeSubtractionLevel(level, count) {
    const ranges = { easy: [6, 20], average: [30, 60], intermediate: [75, 140], advanced: [180, 320] };
    const [min, max] = ranges[level];
    return Array.from({ length: count }, (_, i) => {
      const a = min + ((i * 7) % (max - min + 1));
      const b = 1 + ((i * 4 + 1) % Math.max(1, a));
      const answer = a - b;
      return { id: `ss-${level}-${i + 1}`, prompt: `${a} - ${b}`, answer, choices: choices(answer, [Math.max(0, answer - 1), answer + 1, answer + 2]), a, b };
    });
  }

  function makeDivisionLevel(level, count) {
    const settings = {
      easy: { divisors: [2, 3, 4, 5], quotients: [1, 2, 3, 4, 5] },
      average: { divisors: [3, 4, 5, 6, 8], quotients: [4, 5, 6, 7, 8] },
      intermediate: { divisors: [4, 5, 6, 8, 9, 10], quotients: [7, 8, 9, 10, 11, 12] },
      advanced: { divisors: [6, 7, 8, 9, 10, 11, 12], quotients: [12, 13, 14, 15, 16, 18, 20] }
    }[level];
    return Array.from({ length: count }, (_, i) => {
      const b = settings.divisors[i % settings.divisors.length];
      // Move through each quotient band only after using every divisor. This
      // keeps every division fact unique within and across the level banks.
      const answer = settings.quotients[Math.floor(i / settings.divisors.length) % settings.quotients.length];
      const a = b * answer;
      return {
        id: `dd-${level}-${i + 1}`,
        prompt: `${a} ÷ ${b}`,
        a,
        b,
        answer,
        choices: choices(answer, [Math.max(1, answer - 1), answer + 1, answer + 2]),
        tip: `${a} shared equally into ${b} groups gives the same amount in each group.`
      };
    });
  }

  function makePlaceValueLevel(level, count) {
    const ranges = { easy: [11, 99], average: [120, 299], intermediate: [350, 649], advanced: [700, 999] };
    const [min, max] = ranges[level];
    return Array.from({ length: count }, (_, i) => {
      const answer = min + ((i * 17) % (max - min + 1));
      const hundreds = Math.floor(answer / 100);
      const tens = Math.floor((answer % 100) / 10);
      const ones = answer % 10;
      const description = hundreds ? `${hundreds} hundred${hundreds > 1 ? "s" : ""}, ${tens} ten${tens !== 1 ? "s" : ""}, and ${ones} one${ones !== 1 ? "s" : ""}` : `${tens} ten${tens !== 1 ? "s" : ""} and ${ones} one${ones !== 1 ? "s" : ""}`;
      return { id: `pv-${level}-${i + 1}`, answer, hundreds, tens, ones, description, prompt: `Build the number with ${description}.`, choices: choices(answer, [answer + 10, Math.max(1, answer - 10), Number(String(answer).split("").reverse().join(""))]) };
    });
  }

  function makeFractionLevel(level, count) {
    const denomRanges = { easy: [2, 5], average: [6, 8], intermediate: [9, 11], advanced: [12, 15] };
    const [start, end] = denomRanges[level];
    const pairs = [];
    for (let den = start; den <= end; den += 1) {
      for (let num = 1; num < den; num += 1) pairs.push({ num, den });
    }
    return pairs.slice(0, count).map(({ num, den }, i) => {
      const answer = `${num}/${den}`;
      const [d1, d2] = fractionDistractors(num, den);
      return { id: `fp-${level}-${i + 1}`, type: "visual", num, den, prompt: `Which fraction shows ${num} out of ${den} equal slices?`, subPrompt: `The numerator is ${num} and the denominator is ${den}.`, answer, choices: [{ value: answer, label: answer, sub: "Correct fraction" }, { value: d1, label: d1, sub: "Check the numerator" }, { value: d2, label: d2, sub: "Check the numerator" }], tip: `Count ${num} selected slices out of ${den} equal slices.` };
    });
  }

  function makeBakeryLevel(level, count) {
    const ranges = { easy: [3, 12], average: [8, 30], intermediate: [20, 80], advanced: [50, 250] };
    const [min, max] = ranges[level];
    const items = ["🥐", "🧁", "🍩", "🍪", "🥨", "🥖", "🥧", "🍞"];
    return Array.from({ length: count }, (_, i) => {
      const n1 = min + ((i * 7) % (max - min + 1));
      const n2 = 1 + ((i * 5 + 2) % Math.max(1, Math.floor(n1 * 0.65)));
      const subtract = i % 2 === 1;
      const answer = subtract ? n1 - n2 : n1 + n2;
      const item = items[i % items.length];
      const story = subtract
        ? `The bakery had ${n1} ${item} items. The baker sold ${n2}. How many ${item} items are left?`
        : `The bakery made ${n1} ${item} items and then made ${n2} more. How many ${item} items are there in all?`;
      return { id: `wb-${level}-${i + 1}`, story, num1: n1, num2: n2, item, correctOp: subtract ? "subtract" : "add", answer, choices: choices(answer, [Math.max(0, answer - 1), answer + 1, answer + 2]) };
    });
  }

  // =========================================================================
  // MULTIPLICATION MOUNTAIN BANK BUILDER
  // =========================================================================
  function makeMultiplicationLevel(level, count) {
    const configs = {
      // Easy: small friendly factors (2s, 5s, 10s, 1s, 3s) with skip-counting support
      easy: {
        pairs: [
          [2, 1], [2, 2], [2, 3], [2, 4], [5, 1], [5, 2], [10, 1], [10, 2],
          [3, 1], [3, 2]
        ],
        tip: "Easy: Skip count! 2 × 4 means count by 2s, four times: 2, 4, 6, 8."
      },
      // Average: tables 2-6 with mixed factors
      average: {
        pairs: [
          [2, 6], [2, 7], [3, 3], [3, 4], [3, 5], [4, 2], [4, 3], [4, 4],
          [5, 3], [5, 4], [6, 2], [6, 3], [2, 8], [3, 6], [4, 5]
        ],
        tip: "Average: Think equal groups. 4 × 5 = 4 groups of 5 = count by 5s four times."
      },
      // Intermediate: tables 6-9 requiring recall or strategic decomposition
      intermediate: {
        pairs: [
          [6, 4], [6, 5], [6, 6], [6, 7], [7, 4], [7, 5], [7, 6], [7, 7],
          [8, 4], [8, 5], [8, 6], [8, 7], [9, 4], [9, 5], [9, 6],
          [9, 7], [6, 8], [7, 8], [8, 8], [9, 8]
        ],
        tip: "Intermediate: Break apart. 7 × 8 = (7 × 5) + (7 × 3) = 35 + 21 = 56."
      },
      // Advanced: larger facts (10–12 tables), mixed 2-digit × 1-digit
      advanced: {
        pairs: [
          [9, 9], [10, 7], [10, 8], [10, 9], [11, 4], [11, 5], [11, 6],
          [11, 7], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9],
          [11, 8], [11, 9], [12, 10], [12, 11], [12, 12], [9, 12],
          [8, 12], [7, 12], [13, 4], [13, 5], [15, 4]
        ],
        tip: "Advanced: Use known anchors. 12 × 8 = (10 × 8) + (2 × 8) = 80 + 16 = 96."
      }
    };
    const cfg = configs[level] || configs.easy;
    return cfg.pairs.slice(0, count).map(([a, b], i) => {
      const answer = a * b;
      const d1 = a * b + b;   // off-by-one group
      const d2 = Math.max(0, a * b - a); // minus a row
      const d3 = a + b;       // common misconception (add instead of multiply)
      return {
        id: `mm-${level}-${i + 1}`,
        a,
        b,
        prompt: `${a} \u00d7 ${b}`,
        answer,
        choices: choices(answer, [d1, d2, d3]),
        tip: cfg.tip
      };
    });
  }

  function makeVolumeLevel(level, count) {
    const configs = {
      easy: { dims: [[2,2,2],[3,2,2],[4,2,1],[3,3,2],[5,2,2],[4,3,1],[6,2,1],[3,2,3],[5,3,1],[4,2,2]], tip: "Volume is the space inside a solid. Multiply length × width × height and write cubic units." },
      average: { dims: [[4,3,2],[5,2,3],[6,3,2],[4,4,3],[7,2,3],[5,4,2],[6,5,2],[8,3,2],[7,4,2],[5,3,4],[9,2,3],[6,4,3],[8,2,4],[7,3,3],[5,5,2]], tip: "Multiply all three dimensions. The answer is measured in cubic units, such as cm³." },
      intermediate: { dims: [[12,4,3],[15,3,4],[10,6,5],[14,5,3],[16,4,4],[18,3,5],[12,7,3],[20,4,3],[15,5,4],[18,4,3],[16,6,3],[24,3,4],[14,5,5],[21,4,3],[12,8,3],[25,4,3],[18,5,4],[16,7,3],[22,3,5],[20,6,3]], tip: "Use parentheses to multiply two dimensions first, then multiply by the remaining dimension." },
      advanced: { dims: [[25,8,4],[30,6,5],[24,9,3],[18,12,4],[35,4,6],[28,5,5],[32,6,4],[45,3,8],[20,15,3],[36,7,4],[40,5,6],[27,8,5],[22,10,4],[48,4,5],[30,9,4],[42,5,4],[24,12,3],[50,4,6],[33,6,5],[28,9,4],[45,6,3],[32,8,5],[36,5,7],[25,12,4],[40,7,5]], tip: "Volume uses three dimensions. Check that every measurement uses the same unit before multiplying." }
    };
    const cfg = configs[level] || configs.easy;
    return cfg.dims.slice(0, count).map(([length, width, height], index) => {
      const answer = length * width * height;
      return { id: `vol-${level}-${index + 1}`, length, width, height, unit: "cm", prompt: `A rectangular prism is ${length} cm long, ${width} cm wide, and ${height} cm high. What is its volume?`, answer, choices: choices(answer, [length * width + height, length * width * (height + 1), Math.max(1, length + width + height)]), tip: cfg.tip, label: `${length} × ${width} × ${height} = ? cm³` };
    });
  }

  function makeGemdasLevel(level, count) {
    const expressions = {
      easy: ["3 + 4 × 2","5 + 2 × 3","10 - 2 × 3","6 + 3 × 2","12 - 4 ÷ 2","8 ÷ 2 + 5","7 + 8 ÷ 2","4 × 3 + 2","9 - 6 ÷ 3","2 + 5 × 2"],
      average: ["(3 + 4) × 2","18 ÷ (3 + 3)","5 × (6 - 2)","24 ÷ 3 + 5","7 + 3 × 4 - 2","(10 - 4) ÷ 2","8 + 12 ÷ 3","4 × (5 + 2)","30 - 4 × 5","(9 + 6) ÷ 3","6 × 3 - 8","20 ÷ 4 + 7","(12 + 8) ÷ 4","9 + 2 × 6","(15 - 3) ÷ 2"],
      intermediate: ["(8 + 4) × 3 - 6","36 ÷ (4 + 2) × 3","5 × (9 - 3) + 4","48 ÷ 6 + 7 × 2","(18 - 6) ÷ 3 + 9","7 + 4 × (6 - 2)","60 ÷ 5 - 3 × 2","(15 + 9) ÷ 4 + 8","9 × 3 - (12 ÷ 2)","(20 - 8) × 2 + 5","72 ÷ (3 × 2) + 7","6 × (5 + 3) - 9","(24 ÷ 4) × (7 - 2)","45 - 5 × (6 + 2)","(16 + 8) ÷ 3 × 2","8 × 4 - 18 ÷ 3","(30 - 12) ÷ 3 + 11","4 × (9 - 4) + 6","54 ÷ 6 + 3 × 5","(14 + 10) ÷ 2 - 3"],
      advanced: ["(24 ÷ 4 + 5) × 3","72 ÷ (6 + 3) × 4","5 × (14 - 6) + 18 ÷ 3","(36 - 12) ÷ 4 + 7 × 3","8 + 3 × (12 - 5) - 4","(48 ÷ 6) × (9 - 4)","90 ÷ 5 - 2 × (7 - 3)","(18 + 30) ÷ 6 × 5","7 × (10 - 4) + 24 ÷ 3","64 ÷ (4 × 2) + 9","(45 - 15) ÷ 5 + 6 × 4","12 × (8 - 3) - 30 ÷ 5","(56 ÷ 7 + 4) × 2","100 - 6 × (9 + 2)","(36 + 24) ÷ 5 + 8","9 × (7 - 2) + 42 ÷ 6","(80 - 32) ÷ 6 × 4","5 × (16 - 7) - 18","(63 ÷ 9 + 8) × 3","96 ÷ (8 + 4) + 11","4 × (15 - 6) + 54 ÷ 9","(72 - 24) ÷ 8 + 9 × 2","11 × (6 + 2) - 36 ÷ 4","(50 + 22) ÷ 8 × 3","120 ÷ (10 - 4) + 7"]
    };
    const evaluate = (expression) => Function(`"use strict"; return (${expression.replace(/×/g, "*").replace(/÷/g, "/")});`)();
    const tip = level === "easy" ? "Do multiplication and division before addition and subtraction." : "GEMDAS: Grouping symbols, Exponents, Multiplication/Division left to right, Addition/Subtraction left to right.";
    return expressions[level].slice(0, count).map((expression, index) => {
      const answer = evaluate(expression);
      return { id: `gem-${level}-${index + 1}`, expression, prompt: `Solve: ${expression}`, answer, choices: choices(answer, [answer + 1, Math.max(0, answer - 1), Math.round(answer / 2) + 2]), tip, label: expression };
    });
  }

  function makeCompositeAreaLevel(level, count) {
    const configs = {
      easy: [[4,3,2,2],[5,4,3,2],[6,3,2,3],[7,2,3,2],[5,5,2,2],[8,3,3,2],[6,4,2,3],[7,4,2,2],[9,2,3,3],[6,5,3,2]],
      average: [[8,5,3,2],[9,4,4,3],[10,6,3,4],[7,8,2,3],[12,5,4,2],[11,6,3,3],[9,7,4,2],[13,4,5,3],[10,8,3,2],[14,5,4,3],[12,7,3,4],[11,8,4,2],[15,4,5,2],[9,9,3,3],[13,6,4,3]],
      intermediate: [[14,8,5,3],[16,7,6,4],[18,6,5,4],[15,10,4,5],[20,7,6,3],[17,9,5,4],[22,6,7,3],[19,8,6,4],[16,11,5,3],[21,7,4,5],[18,9,6,3],[24,5,7,4],[20,10,5,4],[23,6,8,3],[17,12,4,5],[25,7,6,4],[22,9,5,3],[19,11,6,4],[26,6,7,5],[21,10,4,6]],
      advanced: [[28,12,9,5],[30,14,8,6],[32,10,11,4],[27,15,7,8],[35,12,10,5],[31,13,9,6],[38,10,12,5],[34,14,8,7],[29,16,9,5],[40,11,13,4],[36,12,7,8],[33,15,10,6],[42,10,14,5],[37,13,8,7],[30,18,9,6],[45,12,11,5],[39,14,10,6],[35,16,8,7],[44,11,13,6],[41,13,9,8],[32,17,10,5],[48,10,15,6],[38,15,11,7],[43,12,8,9],[36,18,9,7]]
    };
    const tip = "Split the L-shape into two non-overlapping rectangles. Find each area, then add them together.";
    return configs[level].slice(0, count).map(([width, height, cutWidth, cutHeight], index) => {
      const answer = width * height - cutWidth * cutHeight;
      return { id: `ca-${level}-${index + 1}`, width, height, cutWidth, cutHeight, prompt: `An L-shaped floor fits inside a ${width} m by ${height} m rectangle, with a ${cutWidth} m by ${cutHeight} m corner removed. What is its area?`, answer, choices: choices(answer, [width * height, answer + cutWidth * cutHeight, Math.max(1, answer - cutWidth)]), tip, label: `Whole: ${width} × ${height}; removed corner: ${cutWidth} × ${cutHeight}` };
    });
  }

  const BANK_BUILDERS = {
    reading: {
      "reading-bridge": makeReadingBridgeLevel,
      "sentence-builder": makeSentenceLevel,
      "vocab-quest": makeVocabLevel,
      "comprehension-trail": makeComprehensionLevel,
      "pronunciation-practice": makePronunciationLevel,
      "spelling-sprint": makeSpellingLevel
    },
    mathematics: {
      "math-ninja": makeAdditionLevel,
      "subtraction-sprint": makeSubtractionLevel,
      "division-dash": makeDivisionLevel,
      "place-value-builder": makePlaceValueLevel,
      "fraction-pizza": makeFractionLevel,
      "multiplication-mountain": makeMultiplicationLevel,
      "volume-voyage": makeVolumeLevel,
      "gemdas-galaxy": makeGemdasLevel,
      "composite-area-architect": makeCompositeAreaLevel
    },
    combined: {
      "word-bakery": makeBakeryLevel
    }
  };

  const BANKS = { reading: {}, mathematics: {}, combined: {} };
  Object.entries(BANK_BUILDERS).forEach(([subject, activities]) => {
    Object.entries(activities).forEach(([activityId, builder]) => {
      BANKS[subject][activityId] = {};
      LEVELS.forEach((level) => {
        BANKS[subject][activityId][level] = builder(level, COUNTS[level]);
      });
    });
  });

  function normalizeLevel(level) {
    const value = String(level || "easy").toLowerCase();
    if (value === "starter" || value === "support") return "easy";
    if (value === "practice") return "intermediate";
    if (value === "challenge") return "advanced";
    return LEVELS.includes(value) ? value : "easy";
  }

  function getForActivity(activityId, level, options = {}) {
    const normalized = normalizeLevel(level);
    const subject = Object.keys(BANKS).find((key) => BANKS[key][activityId]);
    const source = subject ? BANKS[subject][activityId][normalized] : [];
    // Preserve the bank's deliberate easy-to-hard progression.  `seed` only
    // varies answer placement, never the progression of the questions.
    return prepareActivityItems(source, activityId, normalized, Number(options.seed || 0));
  }

  // =========================================================================
  // TEST BANK STORAGE REPOSITORY
  // =========================================================================
  // Versioned so learners do not continue using the older cached banks that
  // could contain repeated generated questions.
  const STORAGE_KEY = "numeread_personalized_test_banks_v2";
  const PERSONALIZED_BANKS = new Map();

  function loadCachedBanks() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        Object.entries(parsed).forEach(([key, val]) => {
          if (Array.isArray(val) && val.length) PERSONALIZED_BANKS.set(key, val);
        });
      }
    } catch (e) {
      console.warn("Could not load cached personalized test banks", e);
    }
  }
  loadCachedBanks();

  function persistBanks() {
    try {
      if (typeof localStorage === "undefined") return;
      const obj = {};
      PERSONALIZED_BANKS.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn("Could not persist personalized test banks", e);
    }
  }

  function bankKey(activityId, level, studentId) {
    const normLevel = normalizeLevel(level);
    const sId = String(studentId || "default").trim().toLowerCase();
    return `${activityId}:${normLevel}:${sId}`;
  }

  function storePersonalizedItems(activityId, level, items, studentId, metadata = {}) {
    if (!Array.isArray(items) || !items.length) return false;
    const key = bankKey(activityId, level, studentId);
    PERSONALIZED_BANKS.set(key, items);
    persistBanks();
    if (window.NumeReadAI?.storeTestBankItems) {
      window.NumeReadAI.storeTestBankItems(activityId, normalizeLevel(level), items, studentId).catch(() => {});
    }
    return true;
  }

  function getPersonalizedItems(activityId, level, studentId) {
    const key = bankKey(activityId, level, studentId);
    if (PERSONALIZED_BANKS.has(key)) {
      const normalized = normalizeLevel(level);
      let stored = PERSONALIZED_BANKS.get(key);
      const expectedCount = COUNTS[normalized];
      // Repair generated/API sets from earlier versions if they have duplicate
      // prompts, are incomplete, or did not follow the current level band.
      if (stored.length !== expectedCount || needsProgressiveRefresh(activityId, normalized, stored)) {
        const repaired = uniqueProgressivePersonalizedItems(activityId, normalized, stored, studentId, {});
        if (repaired.length === expectedCount) {
          PERSONALIZED_BANKS.set(key, repaired);
          persistBanks();
          stored = repaired;
        }
      }
      return prepareActivityItems(stored, activityId, normalized, personalizedSeed(studentId));
    }
    return null;
  }

  function hasPersonalizedBank(activityId, level, studentId) {
    const key = bankKey(activityId, level, studentId);
    return PERSONALIZED_BANKS.has(key) && PERSONALIZED_BANKS.get(key).length > 0;
  }

  function clearPersonalizedBank(activityId, level, studentId) {
    const key = bankKey(activityId, level, studentId);
    PERSONALIZED_BANKS.delete(key);
    persistBanks();
  }

  function personalizedSeed(value) {
    return String(value || "").split("").reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 17);
  }

  function numericChoices(answer, extraDistractors = []) {
    const distractors = [Math.max(0, answer - 1), answer + 1, answer + 2, ...extraDistractors];
    return choices(answer, distractors);
  }

  function createPersonalizedSet(activityId, level, profile = {}) {
    const normalized = normalizeLevel(level);
    const count = COUNTS[normalized];
    const subtopic = String(profile.subtopic || "").toLowerCase();
    const seed = personalizedSeed(`${profile.itemSetId || profile.seed || "new"}-${activityId}-${subtopic}`);
    const offset = seed % 19;
    const studentId = profile.studentId || profile.id || "default";

    let items = [];

    if (activityId === "math-ninja") {
      items = Array.from({ length: count }, (_, index) => {
        const rules = {
          easy: { a: 1, b: 1, aStep: 1, bStep: 2, tip: "Count on from the bigger number." },
          average: { a: 12, b: 11, aStep: 2, bStep: 3, tip: "Add tens and ones without regrouping." },
          intermediate: { a: 27, b: 18, aStep: 3, bStep: 2, tip: "Regroup when the ones make a new ten." },
          advanced: { a: 125, b: 168, aStep: 13, bStep: 17, tip: "Add hundreds, tens, and ones; regroup carefully." }
        }[normalized];
        let a = rules.a + (index * rules.aStep);
        let b = rules.b + ((index * rules.bStep) % (normalized === "advanced" ? 80 : normalized === "intermediate" ? 25 : 9));
        let tip = rules.tip;
        if (subtopic.includes("double")) {
          a = rules.a + (index * Math.max(1, rules.aStep));
          b = a;
          tip = `Doubles fact: ${a} + ${a} = ${a * 2}.`;
        } else if (subtopic.includes("make ten") || subtopic.includes("ten")) {
          const baseTen = normalized === "easy" ? 10 : normalized === "average" ? 20 : normalized === "intermediate" ? 50 : 200;
          a = Math.max(2, baseTen - (2 + ((index + offset) % 8)));
          b = baseTen - a;
          tip = `Make ${baseTen}: ${a} + ${b} = ${baseTen}.`;
        } else if (subtopic.includes("regroup")) {
          const base = normalized === "easy" ? 8 : normalized === "average" ? 16 : normalized === "intermediate" ? 36 : 146;
          a = base + (index * (normalized === "advanced" ? 11 : 3));
          b = base + 7 + ((index * 5) % (normalized === "advanced" ? 70 : 24));
          tip = "Regroup when ones add up to 10 or more.";
        } else if (subtopic.includes("count on")) {
          a = rules.a + (index * rules.aStep);
          b = 1 + (index % (normalized === "easy" ? 3 : 6));
          tip = `Count on ${b} more from ${a}.`;
        }
        const answer = a + b;
        return {
          id: `personal-mn-${seed}-${index}`,
          prompt: `${a} + ${b}`,
          a,
          b,
          answer,
          choices: numericChoices(answer),
          tip,
          targetSubtopic: profile.subtopic || "addition facts",
          isPersonalized: true
        };
      });
    } else if (activityId === "subtraction-sprint") {
      // Subtraction sprint personalized items
      // Targets specific difficulty: counting back vs subtracting across ten vs regrouping
      const subMastery = Number(profile.mastery?.Subtraction ?? 50);
      const isAcrossTen = subtopic.includes("across ten") || subtopic.includes("bridge") || (normalized !== "easy" && subMastery < 70);
      const isCountingBack = subtopic.includes("count back") || (!isAcrossTen && (normalized === "easy" || subMastery < 45));

      items = Array.from({ length: count }, (_, index) => {
        let a, b, tip, distractors = [];
        if (isCountingBack) {
          // Basic subtraction facts within 12, friendly subtrahend 1-4
          a = 5 + ((index + offset) % 8);
          b = 1 + ((index * 2 + offset) % Math.min(4, a));
          const answer = a - b;
          tip = `Hop backward ${b} steps on the number line: start at ${a}, count back ${b} to land on ${answer}.`;
          distractors = [a + b, Math.max(0, answer - 1), answer + 1];
          return {
            id: `personal-ss-${seed}-${index}`,
            prompt: `${a} - ${b}`,
            a,
            b,
            answer,
            choices: numericChoices(answer, distractors),
            tip,
            targetSubtopic: profile.subtopic || "Counting back on number line",
            isPersonalized: true
          };
        } else if (isAcrossTen) {
          // Bridging through 10: a is 11-18, b crosses 10
          const ones = 1 + ((index + offset) % 6);
          a = 10 + ones;
          const jumpOver = 2 + ((index * 3 + offset) % 4);
          b = Math.min(9, ones + jumpOver);
          const answer = a - b;
          const step2 = b - ones;
          tip = `Bridge through 10: ${a} - ${ones} = 10, then take away ${step2} more to get ${answer}!`;
          // Misconception distractor: subtracting smaller from larger digit
          distractors = [10 + Math.abs(ones - step2), a + b, Math.max(0, answer - 1)];
          return {
            id: `personal-ss-${seed}-${index}`,
            prompt: `${a} - ${b}`,
            a,
            b,
            answer,
            choices: numericChoices(answer, distractors),
            tip,
            targetSubtopic: profile.subtopic || "Subtracting across ten",
            isPersonalized: true
          };
        } else {
          // Regrouping / 2-digit subtraction
          b = 6 + ((index * 5 + offset) % 15);
          a = b + 12 + ((index * 7 + offset) % 30);
          const answer = a - b;
          tip = `Decompose into tens and ones: borrow 1 ten to make subtracting ones easier, leaving ${answer}.`;
          distractors = [answer - 1, answer + 1, a - b + 10];
          return {
            id: `personal-ss-${seed}-${index}`,
            prompt: `${a} - ${b}`,
            a,
            b,
            answer,
            choices: numericChoices(answer, distractors),
            tip,
            targetSubtopic: profile.subtopic || "Subtraction with regrouping",
            isPersonalized: true
          };
        }
      });
    } else if (activityId === "division-dash") {
      // Division dash personalized items
      // Targets equal groups, friendly divisors, and multiplication connection
      const divMastery = Number(profile.mastery?.Division ?? 50);
      const isFactFamily = subtopic.includes("fact") || subtopic.includes("mult") || (normalized !== "easy" && divMastery >= 50);

      items = Array.from({ length: count }, (_, index) => {
        let a, b, answer, tip, distractors = [];
        if (!isFactFamily || normalized === "easy") {
          // Friendly divisors 2, 3, 4, 5 with small quotients 2-6
          const divisors = [2, 3, 4, 5];
          b = divisors[(index + offset) % divisors.length];
          answer = 2 + ((index * 2 + offset) % 5);
          a = b * answer;
          tip = `Equal sharing: ${a} items shared equally into ${b} groups leaves ${answer} in each group.`;
          distractors = [Math.max(1, a - b), answer + 1, Math.max(1, answer - 1)];
        } else {
          // Fact families connecting multiplication to division
          const divisors = [3, 4, 5, 6, 8];
          b = divisors[(index + offset) % divisors.length];
          answer = 3 + ((index * 3 + offset) % 7);
          a = b * answer;
          tip = `Think multiplication: ${b} × ? = ${a}. Because ${b} × ${answer} = ${a}, ${a} ÷ ${b} = ${answer}!`;
          distractors = [answer + 1, Math.max(1, answer - 1), answer + 2];
        }
        return {
          id: `personal-dd-${seed}-${index}`,
          prompt: `${a} ÷ ${b}`,
          a,
          b,
          answer,
          choices: numericChoices(answer, distractors),
          tip,
          targetSubtopic: profile.subtopic || (isFactFamily ? "Fact families & multiplication connection" : "Equal groups and sharing"),
          isPersonalized: true
        };
      });
    } else if (activityId === "place-value-builder") {
      items = Array.from({ length: count }, (_, index) => {
        const [minimum] = { easy: [11, 99], average: [120, 299], intermediate: [350, 649], advanced: [700, 999] }[normalized];
        const answer = minimum + (index * 17);
        const hundreds = Math.floor(answer / 100);
        const tens = Math.floor((answer % 100) / 10), ones = answer % 10;
        const description = hundreds ? `${hundreds} hundred${hundreds === 1 ? "" : "s"}, ${tens} ten${tens === 1 ? "" : "s"}, and ${ones} one${ones === 1 ? "" : "s"}` : `${tens} ten${tens === 1 ? "" : "s"} and ${ones} one${ones === 1 ? "" : "s"}`;
        return {
          id: `personal-pv-${seed}-${index}`,
          answer,
          hundreds,
          tens,
          ones,
          description,
          prompt: `Build the number with ${description}.`,
          choices: numericChoices(answer),
          tip: `${tens} tens has a value of ${tens * 10}.`,
          targetSubtopic: profile.subtopic || "Place value representation",
          isPersonalized: true
        };
      });
    } else if (activityId === "fraction-pizza") {
      items = Array.from({ length: count }, (_, index) => {
        const [minimumDenominator, maximumDenominator] = { easy: [2, 5], average: [6, 8], intermediate: [9, 11], advanced: [12, 15] }[normalized];
        const den = minimumDenominator + ((index + offset) % (maximumDenominator - minimumDenominator + 1));
        const num = 1 + ((index * 3 + offset) % (den - 1));
        const answer = `${num}/${den}`;
        const [nearby, lower] = fractionDistractors(num, den);
        return {
          id: `personal-fp-${seed}-${index}`,
          type: "visual",
          num,
          den,
          prompt: `Which fraction shows ${num} out of ${den} equal slices?`,
          subPrompt: `Target skill: ${profile.subtopic || "equal parts"}.`,
          answer,
          choices: [{ value: answer, label: answer, sub: "Correct fraction" }, { value: nearby, label: nearby, sub: "Check numerator" }, { value: lower, label: lower, sub: "Check numerator" }],
          tip: `Count ${num} selected slices out of ${den} total equal slices.`,
          targetSubtopic: profile.subtopic || "Fractions of a whole",
          isPersonalized: true
        };
      });
    } else if (activityId === "word-bakery") {
      items = Array.from({ length: count }, (_, index) => {
        const subtract = subtopic.includes("subtract") || subtopic.includes("take away") ? true : subtopic.includes("add") || subtopic.includes("join") ? false : index % 2 === 1;
        const [minimum] = { easy: [3, 12], average: [18, 45], intermediate: [55, 120], advanced: [180, 350] }[normalized];
        const num1 = minimum + (index * (normalized === "advanced" ? 11 : 7));
        const num2 = 2 + ((index * 3 + offset) % Math.max(3, Math.floor(num1 / 2)));
        const answer = subtract ? num1 - num2 : num1 + num2;
        const item = ["cookies", "rolls", "cupcakes", "donuts"][index % 4];
        const story = subtract ? `The bakery had ${num1} ${item}. It sold ${num2}. How many ${item} are left?` : `The bakery made ${num1} ${item} and then made ${num2} more. How many ${item} are there in all?`;
        return {
          id: `personal-wb-${seed}-${index}`,
          story,
          prompt: story,
          num1,
          num2,
          item,
          correctOp: subtract ? "subtract" : "add",
          answer,
          choices: numericChoices(answer),
          tip: subtract ? "Look for takeaway clues: 'sold', 'gave away', 'left'." : "Look for joining clues: 'more', 'in all', 'total'.",
          targetSubtopic: profile.subtopic || "Choosing math operation in word problems",
          isPersonalized: true
        };
      });
    } else if (activityId === "multiplication-mountain" || activityId === "multiplication") {
      const multMastery = Number(profile.mastery?.Multiplication ?? 50);
      const isSkipCounting = normalized === "easy" && (subtopic.includes("skip") || subtopic.includes("repeated") || multMastery < 55);
      const isSquare = subtopic.includes("square");
      items = Array.from({ length: count }, (_, index) => {
        let a, b, tip, distractors = [];
        if (isSkipCounting) {
          const friendly = [2, 5, 10];
          b = friendly[(index + offset) % friendly.length];
          a = 2 + ((index * 2 + offset) % 8);
          tip = `Skip counting: count by ${b}s ${a} times to reach ${a * b}.`;
          distractors = [Math.max(2, a * b - b), a * b + b, a * b + 1];
        } else if (isSquare) {
          a = 3 + ((index + offset) % 7);
          b = a;
          tip = `Square number fact: ${a} groups of ${a} equals ${a * a}.`;
          distractors = [a * a - a, a * a + a, a + b];
        } else {
          const minimumFactor = normalized === "average" ? 4 : normalized === "intermediate" ? 7 : 12;
          a = minimumFactor + index;
          b = minimumFactor - 1 + (index % (normalized === "advanced" ? 9 : 7));
          tip = `Break apart: ${a} × ${b} = (${a - 2} × ${b}) + (2 × ${b}) = ${a * b}.`;
          distractors = [a * b - b, a * b + b, a * b + 2];
        }
        const answer = a * b;
        return {
          id: `personal-mm-${seed}-${index}`,
          prompt: `${a} × ${b}`,
          a,
          b,
          answer,
          choices: numericChoices(answer, distractors),
          tip,
          targetSubtopic: profile.subtopic || (isSkipCounting ? "Skip counting and friendly factors" : "Multiplication facts"),
          isPersonalized: true
        };
      });
    } else if (activityId === "reading-bridge") {
      const blendMastery = Number(profile.mastery?.Blends ?? 50);
      const isComplex = subtopic.includes("complex") || subtopic.includes("three-letter") || (normalized !== "easy" && blendMastery >= 65);
      const beginningPool = [
        ["bl", "blue", ["sun", "cat", "dog"]], ["br", "brush", ["fish", "pen", "cup"]],
        ["cl", "clap", ["hat", "ball", "tree"]], ["cr", "crab", ["star", "milk", "book"]],
        ["dr", "drum", ["bird", "frog", "ship"]], ["fl", "flag", ["moon", "cake", "ring"]],
        ["fr", "frog", ["bell", "nest", "rock"]], ["gl", "glad", ["leaf", "wind", "rain"]],
        ["gr", "green", ["snow", "fire", "gold"]], ["pl", "plane", ["bear", "duck", "kite"]],
        ["sl", "slide", ["ride", "hide", "wide"]], ["sm", "smile", ["mile", "pile", "tile"]],
        ["sn", "snap", ["trap", "map", "clap"]], ["sp", "spin", ["tin", "win", "bin"]],
        ["st", "star", ["car", "jar", "far"]], ["sw", "swim", ["dim", "him", "trim"]],
        ["tr", "train", ["rain", "pain", "main"]], ["tw", "twin", ["thin", "chin", "win"]],
        ["ch", "chair", ["hair", "pair", "fair"]], ["sh", "shop", ["top", "pop", "cop"]]
      ];
      const complexPool = [
        ["str", "street", ["block", "house", "road"]], ["scr", "screen", ["paper", "glass", "board"]],
        ["spl", "splash", ["water", "wave", "drop"]], ["spr", "spring", ["summer", "fall", "winter"]],
        ["thr", "three", ["four", "five", "six"]], ["shr", "shrink", ["grow", "rise", "expand"]],
        ["squ", "square", ["circle", "triangle", "line"]], ["str", "strong", ["wrong", "long", "song"]],
        ["scr", "scrub", ["grub", "club", "stub"]], ["spr", "spread", ["bread", "thread", "dread"]],
        ["thr", "throat", ["float", "coat", "boat"]], ["spl", "split", ["grit", "knit", "sit"]],
        ["squ", "squash", ["wash", "gash", "clash"]], ["scr", "scratch", ["catch", "patch", "match"]],
        ["str", "stripe", ["gripe", "type", "pipe"]], ["str", "string", ["ring", "sing", "wing"]],
        ["scr", "scroll", ["roll", "doll", "poll"]], ["spl", "splurge", ["merge", "surge", "purge"]],
        ["spr", "sprig", ["twig", "fig", "pig"]], ["thr", "thrive", ["drive", "five", "hive"]],
        ["shr", "shrub", ["club", "tub", "rub"]], ["squ", "squint", ["print", "hint", "mint"]],
        ["str", "stride", ["ride", "side", "wide"]], ["scr", "script", ["grip", "trip", "ship"]],
        ["spl", "splinter", ["winter", "printer", "center"]]
      ];
      const intermediatePool = [
        ["sk", "skate", ["plate", "late", "gate"]], ["sc", "scold", ["bold", "told", "gold"]],
        ["pr", "prize", ["rise", "wise", "size"]], ["wh", "whale", ["tale", "pale", "sale"]],
        ["th", "think", ["drink", "blink", "shrink"]], ["ph", "phone", ["stone", "bone", "zone"]],
        ["wr", "write", ["white", "bright", "kite"]]
      ];
      const advancedPool = [
        ["strat", "strategy", ["energy", "battery", "mystery"]], ["scram", "scramble", ["tremble", "stumble", "humble"]],
        ["splen", "splendid", ["blended", "ended", "defended"]], ["thril", "thriller", ["filler", "miller", "tiller"]],
        ["squirm", "squirming", ["stirring", "purring", "blurring"]], ["struc", "structure", ["rupture", "capture", "culture"]]
      ];
      // Keep the phonics pattern itself moving forward with each level. A
      // learner receiving support should not be sent back to beginning blends
      // after already completing a later stage.
      const pool = normalized === "easy"
        ? (isComplex ? complexPool : beginningPool)
        : normalized === "average"
          ? intermediatePool
          : normalized === "intermediate"
            ? complexPool
            : advancedPool;
      items = Array.from({ length: count }, (_, index) => {
        const [blend, word, distractors] = pool[(index + offset) % pool.length];
        return {
          id: `personal-rb-${seed}-${index}`,
          blend,
          prompt: blend,
          answer: word,
          choices: choices(word, distractors),
          lesson: `Slide the blend '${blend}' smoothly: ${blend} → ${word}.`,
          tip: `Listen to the beginning sounds: '${blend}'. Which word starts with ${blend}?`,
          targetSubtopic: profile.subtopic || (isComplex ? "Complex and three-letter blends" : "Beginning consonant blends"),
          isPersonalized: true
        };
      });
    } else if (activityId === "sentence-builder") {
      const pairsSimple = [
        ["The cat", "runs fast outside", "The cat"],
        ["The happy girl", "reads a colorful book", "reads a colorful book"],
        ["A curious dog", "barks at the friendly puppy", "A curious dog"],
        ["The young student", "writes a thoughtful note", "writes a thoughtful note"],
        ["Our teacher", "shares an interesting story", "Our teacher"],
        ["The bright sun", "shines warm in the sky", "shines warm in the sky"],
        ["The little frog", "jumps over the log quickly", "jumps over the log quickly"],
        ["My red backpack", "holds all my school things", "My red backpack"],
        ["The new student", "answered the question clearly", "answered the question clearly"],
        ["A helpful friend", "shared the last pencil", "A helpful friend"]
      ];
      const pairsAdvanced = [
        ["During the storm, the brave team", "worked together to finish the project", "worked together to finish the project"],
        ["After the lesson, the curious student", "reviewed the notes carefully", "the curious student"],
        ["Before breakfast, the responsible child", "packed the school bag neatly", "the responsible child"],
        ["Although the task was difficult, the group", "never gave up on their goal", "never gave up on their goal"],
        ["Because she studied every night, Maria", "earned the highest score on the test", "Maria"],
        ["While the rain poured outside, the class", "continued reading in silence", "continued reading in silence"]
      ];
      const pairs = (normalized === "advanced" || normalized === "intermediate") ? pairsAdvanced : pairsSimple;
      items = Array.from({ length: count }, (_, index) => {
        const [subj, verb, ans] = pairs[(index + offset) % pairs.length];
        const sentence = `${subj} ${verb}.`;
        return {
          id: `personal-sb-${seed}-${index}`,
          words: sentence.replace(/[.!?]$/, "").split(" "),
          sentence,
          prompt: `Identify the key part in: '${sentence}'`,
          question: "What is the key detail in this sentence?",
          answer: ans,
          choices: choices(ans, ["A different detail", "Something else", "No one mentioned"]),
          hint: "Read the complete sentence and look for who or what is performing the action.",
          tip: "Good readers pause at the end of each phrase to check meaning.",
          targetSubtopic: profile.subtopic || "Sentence parts & key detail comprehension",
          isPersonalized: true
        };
      });
    } else if (activityId === "vocab-quest") {
      const vocabPool = [
        ["tiny", "Very small", "The puppy was tiny and could easily fit in a basket.", "fit in a basket"],
        ["courageous", "Brave and bold", "Paolo was courageous and spoke up when his friend needed help.", "spoke up to help"],
        ["ancient", "From long ago", "Grandpa showed us an ancient coin kept for hundreds of years.", "kept for hundreds of years"],
        ["generous", "Willing to share", "Lina was generous and shared her markers with the class.", "shared her markers"],
        ["rapid", "Very quick", "The river had a rapid current that moved fast.", "moved fast"],
        ["patient", "Able to wait calmly", "Mark was patient and waited without complaining.", "waited without complaining"],
        ["eager", "Very excited to start", "The children were eager and could not wait for the trip.", "could not wait for the trip"],
        ["fragile", "Easily broken", "She wrapped the fragile glass carefully in cloth.", "wrapped carefully in cloth"],
        ["persistent", "Continuing despite difficulty", "The persistent student kept trying until he understood.", "kept trying until he understood"],
        ["efficient", "Working without waste", "The team was efficient and finished early with no mistakes.", "finished early with no mistakes"],
        ["tranquil", "Quiet and calm", "The park was tranquil on Sunday morning with only birdsong.", "only birdsong"],
        ["peculiar", "Strange or unusual", "Nico heard a peculiar sound like no bird he had ever heard.", "like no bird he had heard"],
        ["fortunate", "Lucky", "Mika felt fortunate when a neighbor returned her lost card.", "a neighbor returned her card"],
        ["scarce", "Hard to find", "Clean water was scarce after the long dry season.", "after the long dry season"],
        ["confident", "Sure of yourself", "The speaker was confident and spoke clearly to the audience.", "spoke clearly to the audience"],
        ["observe", "Watch carefully", "Scientists observe the weather every day for patterns.", "every day for patterns"],
        ["significant", "Important or meaningful", "The discovery was significant because it changed how people understood history.", "changed how people understood history"],
        ["consequence", "A result of an action", "Forgetting to study had a consequence: she failed the quiz.", "she failed the quiz"],
        ["analyze", "Examine to understand", "The detective analyzed each clue before giving an answer.", "before giving an answer"],
        ["infer", "Reach a conclusion from clues", "From the wet shoes, we could infer it had rained outside.", "from the wet shoes"]
      ];
      items = Array.from({ length: count }, (_, index) => {
        const [word, answer, sentence, clue] = vocabPool[(index + offset) % vocabPool.length];
        return {
          id: `personal-vq-${seed}-${index}`,
          word,
          phonics: `[${word}]`,
          sentence,
          prompt: `What does '${word}' mean in: '${sentence}'?`,
          clue,
          answer,
          choices: choices(answer, ["Very noisy", "Something strange", "The opposite idea"]),
          tip: `Context clue alert: Look around the sentence. The clue '${clue}' tells you what '${word}' means.`,
          targetSubtopic: profile.subtopic || "Using context clues for word meaning",
          isPersonalized: true
        };
      });
    } else if (activityId === "comprehension-trail") {
      const passages = [
        ["Lito found a dry leaf on his desk before class began. He put it gently in his science folder.", "What did Lito do with the leaf?", "put it in his science folder", ["threw it away", "lost it outside", "ignored it"]],
        ["Mia watered the seedling every morning so the flowers would bloom brightly.", "Why did Mia water the seedling?", "so the flowers would bloom", ["because it rained", "to wash the pot", "to make mud"]],
        ["Ana carefully organized her research notes after finding a new library book.", "What did Ana do after finding a new book?", "organized her research notes", ["went home early", "forgot her pencils", "closed the library"]],
        ["Rico shared his umbrella with Noah when the afternoon rain started.", "What shows Rico was kind?", "shared his umbrella", ["walked alone", "stayed indoors", "ran away"]],
        ["Before the school program, Maya practiced her speech ten times. When she stood on stage, she did not forget a single line.", "Why did Maya speak without forgetting a line?", "she practiced ten times", ["she was lucky", "she read from a card", "she skipped parts"]],
        ["Carlo noticed that his classmate was crying during recess. He sat beside her and offered to share his snack.", "What did Carlo do when he saw his classmate upset?", "sat beside her and shared his snack", ["ignored her and played", "called the teacher right away", "went back to his seat"]],
        ["After the flood, the volunteers sorted donated clothes by size and packed them into labeled boxes for the families.", "How did the volunteers organize the donations?", "sorted by size and packed into labeled boxes", ["gave them away randomly", "kept them for the school", "put them all in one bag"]],
        ["The garden club planted seeds in the morning. By afternoon, they watered each row and put up labels so they would remember which plants were which.", "Why did the club put up labels?", "to remember which plants were which", ["to decorate the garden", "because the teacher required it", "to keep birds away"]],
        ["The young scientist compared her results three times. She changed her conclusion only after checking the data twice more.", "Why did she change her conclusion?", "after checking the data again", ["because her partner disagreed", "because she ran out of time", "because the teacher corrected her"]],
        ["During the community cleanup, the team collected trash in separate bags: one for plastic, one for paper, and one for food waste.", "How did the team sort the trash?", "by material type into separate bags", ["by color", "by weight", "randomly into one bag"]]
      ];
      items = Array.from({ length: count }, (_, index) => {
        const [passage, question, answer, distractors] = passages[(index + offset) % passages.length];
        return {
          id: `personal-ct-${seed}-${index}`,
          passage,
          question,
          prompt: `${passage}\n\n${question}`,
          answer,
          choices: choices(answer, distractors),
          evidence: passage,
          tip: "Reread the sentences to find exact evidence before choosing your answer.",
          targetSubtopic: profile.subtopic || "Locating direct story evidence",
          isPersonalized: true
        };
      });
    } else if (activityId === "spelling-sprint") {
      const spellingByLevel = {
        easy: ["cat", "sun", "fish", "book", "frog", "star", "train", "brush", "plant", "smile", "nest", "jump", "clap", "drum", "flag"],
        average: ["garden", "window", "basket", "rabbit", "yellow", "picture", "teacher", "morning", "playing", "library", "country", "because", "different", "favorite", "together", "pencil", "button", "circle", "number", "follow"],
        intermediate: ["beautiful", "calendar", "community", "delicious", "elephant", "important", "paragraph", "question", "remember", "umbrella", "vacation", "wonderful", "yesterday", "adventure", "celebrate", "dictionary", "exercise", "friendship", "knowledge", "language", "measure", "neighbor", "original", "practice", "separate"],
        advanced: ["accurately", "appropriate", "communication", "concentration", "conversation", "curiosity", "destination", "education", "environment", "explanation", "information", "imagination", "independent", "introduction", "mathematics", "opportunity", "organization", "pronunciation", "responsibility", "temperature", "understanding", "vocabulary", "collaboration", "determination", "investigation"]
      };
      const spellingWords = spellingByLevel[normalized] || spellingByLevel.easy;
      items = Array.from({ length: count }, (_, index) => {
        const word = spellingWords[(index + offset) % spellingWords.length];
        return {
          id: `personal-sp-${seed}-${index}`,
          word,
          prompt: `Spell the word: ${word}`,
          answer: word,
          choices: [word],
          tip: `Say the sounds in '${word}' slowly from left to right, then write each sound.`,
          targetSubtopic: profile.subtopic || "Phonics and spelling accuracy",
          isPersonalized: true
        };
      });
    } else if (activityId === "pronunciation-practice") {
      const pronByLevel = {
        easy: ["sun", "cat", "dog", "fish", "map", "frog", "star", "milk", "tree", "book", "clap", "drum", "flag", "nest", "swim"],
        average: ["apple", "basket", "button", "garden", "happy", "little", "pencil", "rabbit", "window", "yellow", "family", "morning", "picture", "teacher", "playing"],
        intermediate: ["beautiful", "calendar", "community", "delicious", "elephant", "favorite", "hospital", "important", "library", "medicine", "paragraph", "question", "remember", "together", "umbrella", "vacation", "wonderful", "yesterday", "adventure", "celebrate"],
        advanced: ["accurately", "appropriate", "communication", "concentration", "conversation", "curiosity", "destination", "education", "environment", "explanation", "information", "imagination", "independent", "introduction", "mathematics", "opportunity", "organization", "pronunciation", "responsibility", "temperature", "understanding", "vocabulary", "wonderfully", "collaboration", "determination"]
      };
      const pronWords = pronByLevel[normalized] || pronByLevel.easy;
      items = Array.from({ length: count }, (_, index) => {
        const word = pronWords[(index + offset) % pronWords.length];
        return {
          id: `personal-pp-${seed}-${index}`,
          word,
          prompt: word,
          answer: word,
          choices: [word],
          tip: `Listen closely to '${word}', then pronounce every syllable clearly.`,
          targetSubtopic: profile.subtopic || "Clear pronunciation and phoneme accuracy",
          isPersonalized: true
        };
      });
    } else if (activityId === "multiplication-mountain") {
      const multMastery = Number(profile.mastery?.Multiplication ?? 50);
      const isSkipCounting = subtopic.includes("skip") || subtopic.includes("count") || subtopic.includes("repeated") || (normalized === "easy" || multMastery < 45);
      const isSquare = subtopic.includes("square");
      const isBreakApart = subtopic.includes("break") || subtopic.includes("decompose") || normalized === "intermediate";
      const isLargeFacts = subtopic.includes("large") || subtopic.includes("12") || normalized === "advanced";

      items = Array.from({ length: count }, (_, index) => {
        let a, b, tip, distractors = [];
        if (isSkipCounting) {
          const friendly = [2, 5, 10, 3];
          b = friendly[(index + offset) % friendly.length];
          a = 1 + ((index * 2 + offset) % 9);
          tip = `Skip count by ${b}s, ${a} times: ${Array.from({ length: a }, (_, k) => (k + 1) * b).join(", ")} = ${a * b}.`;
          distractors = [a * b + b, Math.max(0, a * b - b), a + b];
        } else if (isSquare) {
          a = 2 + ((index + offset) % 9);
          b = a;
          tip = `Square fact: ${a} × ${a} = ${a * a}. Think of a ${a}-by-${a} array.`;
          distractors = [a * a + a, Math.max(0, a * a - a), a * 2];
        } else if (isBreakApart) {
          a = 6 + ((index + offset) % 7);
          b = 3 + ((index * 3 + offset) % 7);
          const part1 = 5 * b;
          const part2 = (a - 5) * b;
          tip = `Break apart: ${a} × ${b} = (5 × ${b}) + (${a - 5} × ${b}) = ${part1} + ${part2} = ${a * b}.`;
          distractors = [a * b + b, Math.max(0, a * b - a), a + b];
        } else if (isLargeFacts) {
          a = 10 + ((index + offset) % 6);
          b = 6 + ((index * 2 + offset) % 7);
          const anchor = 10 * b;
          const extra = (a - 10) * b;
          tip = `Use 10s: ${a} × ${b} = (10 × ${b}) + (${a - 10} × ${b}) = ${anchor} + ${extra} = ${a * b}.`;
          distractors = [a * b + b, a * b + a, a * b - b];
        } else {
          a = 3 + ((index * 3 + offset) % 7);
          b = 3 + ((index * 5 + offset) % 7);
          tip = `Think: ${a} groups of ${b} = ${a * b}.`;
          distractors = [a * b + b, Math.max(0, a * b - a), a + b];
        }
        const answer = a * b;
        return {
          id: `personal-mm-${seed}-${index}`,
          a,
          b,
          prompt: `${a} \u00d7 ${b}`,
          answer,
          choices: numericChoices(answer, distractors),
          tip,
          targetSubtopic: profile.subtopic || (isSkipCounting ? "Skip counting" : isSquare ? "Square numbers" : isBreakApart ? "Break-apart strategy" : "Multiplication facts"),
          isPersonalized: true
        };
      });
    } else {
      items = getForActivity(activityId, normalized, { seed }).map((item, index) => ({
        ...item,
        id: `personal-${activityId}-${seed}-${index}`,
        targetSubtopic: profile.subtopic || "",
        isPersonalized: true
      }));
    }

    // Never cycle a smaller personalized source pool. Fill from this level's
    // unused bank instead, and exclude items already used at earlier levels.
    items = uniqueProgressivePersonalizedItems(activityId, normalized, items, studentId, profile);

    // Automatically store the generated set in the test bank repository
    storePersonalizedItems(activityId, normalized, items, studentId, { subtopic: profile.subtopic || "" });
    // Return through the same preparation step as standard banks: ordered from
    // accessible to more demanding and with answer positions distributed.
    return getPersonalizedItems(activityId, normalized, studentId) || items;
  }

  async function prepareAdaptiveItems(activityId, level, studentProfile, options = {}) {
    const studentId = studentProfile?.id || studentProfile?.studentId || "default";
    const normLevel = normalizeLevel(level);

    // 1. Check if test bank storage already holds personalized items for this learner
    if (hasPersonalizedBank(activityId, normLevel, studentId)) {
      return getPersonalizedItems(activityId, normLevel, studentId);
    }

    // 2. Request from Python FastAPI Adaptive Learning API if available
    if (window.NumeReadAI?.generatePersonalizedGameItems) {
      try {
        const apiResult = await window.NumeReadAI.generatePersonalizedGameItems({
          student: studentProfile,
          studentId: studentId,
          activityId: activityId,
          difficulty: normLevel,
          struggling: Boolean(options.struggling),
          skill: options.skill || "",
          subtopic: options.subtopic || null,
          recentPerformance: options.recentPerformance,
          failedAttempts: options.failedAttempts,
          count: COUNTS[normLevel]
        });
        if (apiResult && Array.isArray(apiResult.items) && apiResult.items.length) {
          storePersonalizedItems(activityId, normLevel, apiResult.items, studentId, {
            subtopic: apiResult.target_subtopic,
            reason: apiResult.reason,
            source: "api"
          });
          return getPersonalizedItems(activityId, normLevel, studentId);
        }
      } catch (err) {
        console.warn("API adaptive item call failed, generating in client test bank storage.", err);
      }
    }

    // 3. Fallback: Generate locally and store into test bank
    const generated = createPersonalizedSet(activityId, normLevel, {
      ...studentProfile,
      subtopic: options.subtopic,
      studentId: studentId
    });
    return generated;
  }

  function getSubjectBank(subject) {
    return BANKS[subject] || {};
  }

  function validate() {
    const errors = [];
    Object.entries(BANKS).forEach(([subject, activities]) => Object.entries(activities).forEach(([activityId, levels]) => {
      const seenContent = new Map();
      LEVELS.forEach((level) => {
        const items = levels[level] || [];
        if (items.length !== COUNTS[level]) errors.push(`${subject}/${activityId}/${level}: expected ${COUNTS[level]}, got ${items.length}`);
        items.forEach((item, index) => {
          if (!item.id || item.answer === undefined) errors.push(`${subject}/${activityId}/${level}/${index + 1}: missing id or answer`);
          const key = [item.word || "", item.sentence || item.passage || item.story || item.prompt || "", String(item.answer)].join("|").toLowerCase();
          if (seenContent.has(key)) {
            errors.push(`${subject}/${activityId}/${level}/${index + 1}: repeats content from ${seenContent.get(key)}`);
          } else {
            seenContent.set(key, `${level}/${index + 1}`);
          }
        });
      });
    }));
    return { valid: errors.length === 0, errors };
  }

  window.NumeReadTestBanks = Object.freeze({
    COUNTS,
    LEVELS,
    banks: BANKS,
    getForActivity,
    createPersonalizedSet,
    prepareAdaptiveItems,
    storePersonalizedItems,
    getPersonalizedItems,
    hasPersonalizedBank,
    clearPersonalizedBank,
    getSubjectBank,
    normalizeLevel,
    validate
  });
})();
