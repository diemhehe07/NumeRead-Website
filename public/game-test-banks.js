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

  const choices = (answer, distractors) => shuffle([String(answer), ...distractors.map(String)], String(answer).length + distractors.length);

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
        ["spl", "split"], ["thr", "three"], ["shr", "shrimp"], ["squ", "squeeze"], ["scr", "scratch"],
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
      const d1 = `${Math.max(1, num - 1)}/${den}`;
      const d2 = `${Math.min(den, num + 1)}/${den}`;
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
      "fraction-pizza": makeFractionLevel
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
    const seed = Number(options.seed || 0);
    const ordered = seed ? shuffle(source, seed) : [...source];
    return ordered.map((item) => ({ ...item, choices: Array.isArray(item.choices) ? item.choices.map((c) => typeof c === "object" ? { ...c } : String(c)) : [] }));
  }

  // A teacher can assign a learner a narrowly targeted set.  The calculations
  // below intentionally create fresh values (rather than merely reordering a
  // stock bank), while retaining the exact data shape each game expects.
  function personalizedSeed(value) {
    return String(value || "").split("").reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 17);
  }

  function numericChoices(answer) {
    return choices(answer, [Math.max(0, answer - 1), answer + 1, answer + 2]);
  }

  function createPersonalizedSet(activityId, level, profile = {}) {
    const normalized = normalizeLevel(level);
    const count = COUNTS[normalized];
    const subtopic = String(profile.subtopic || "").toLowerCase();
    const seed = personalizedSeed(`${profile.itemSetId || profile.seed || "new"}-${activityId}-${subtopic}`);
    const offset = seed % 19;

    if (activityId === "math-ninja") {
      return Array.from({ length: count }, (_, index) => {
        let a = 2 + ((index + offset) % 8), b = 1 + ((index * 3 + offset) % 8);
        if (subtopic.includes("double")) { a = 2 + ((index + offset) % 9); b = a; }
        else if (subtopic.includes("make ten")) { a = 2 + ((index + offset) % 8); b = 10 - a; }
        else if (subtopic.includes("regroup")) { a = 16 + ((index * 3 + offset) % 34); b = 15 + ((index * 5 + offset) % 24); }
        else if (subtopic.includes("count on")) { a = 4 + ((index + offset) % 6); b = 1 + (index % 3); }
        const answer = a + b;
        return { id: `personal-mn-${seed}-${index}`, prompt: `${a} + ${b}`, a, b, answer, choices: numericChoices(answer), tip: `Target skill: ${profile.subtopic || "addition facts"}.` };
      });
    }
    if (activityId === "subtraction-sprint") {
      return Array.from({ length: count }, (_, index) => {
        let b = 1 + ((index * 2 + offset) % 9), a = b + 6 + ((index * 4 + offset) % 18);
        if (subtopic.includes("across ten") || subtopic.includes("regroup")) { a = 21 + ((index * 7 + offset) % 45); b = 6 + ((index * 5 + offset) % 9); }
        const answer = a - b;
        return { id: `personal-ss-${seed}-${index}`, prompt: `${a} - ${b}`, a, b, answer, choices: numericChoices(answer) };
      });
    }
    if (activityId === "place-value-builder") {
      return Array.from({ length: count }, (_, index) => {
        const hundreds = subtopic.includes("hundred") ? 1 + ((index + offset) % 8) : (normalized === "easy" ? 0 : 1 + ((index + offset) % 4));
        const tens = 1 + ((index * 3 + offset) % 9), ones = (index * 7 + offset) % 10;
        const answer = hundreds * 100 + tens * 10 + ones;
        const description = hundreds ? `${hundreds} hundred${hundreds === 1 ? "" : "s"}, ${tens} ten${tens === 1 ? "" : "s"}, and ${ones} one${ones === 1 ? "" : "s"}` : `${tens} ten${tens === 1 ? "" : "s"} and ${ones} one${ones === 1 ? "" : "s"}`;
        return { id: `personal-pv-${seed}-${index}`, answer, hundreds, tens, ones, description, prompt: `Build the number with ${description}.`, choices: numericChoices(answer) };
      });
    }
    if (activityId === "fraction-pizza") {
      return Array.from({ length: count }, (_, index) => {
        const den = 2 + ((index + offset) % 8);
        const num = 1 + ((index * 3 + offset) % (den - 1));
        const answer = `${num}/${den}`;
        const nearby = `${Math.min(den - 1, num + 1)}/${den}`;
        const lower = `${Math.max(1, num - 1)}/${den}`;
        return { id: `personal-fp-${seed}-${index}`, type: "visual", num, den, prompt: `Which fraction shows ${num} out of ${den} equal slices?`, subPrompt: `Target skill: ${profile.subtopic || "equal parts"}.`, answer, choices: [{ value: answer, label: answer, sub: "Correct fraction" }, { value: nearby, label: nearby, sub: "Check the numerator" }, { value: lower, label: lower, sub: "Check the numerator" }], tip: `Count ${num} selected slices out of ${den} equal slices.` };
      });
    }
    if (activityId === "division-dash") {
      return Array.from({ length: count }, (_, index) => {
        const b = 2 + ((index + offset) % 7), answer = 2 + ((index * 2 + offset) % 10), a = b * answer;
        return { id: `personal-dd-${seed}-${index}`, prompt: `${a} ÷ ${b}`, a, b, answer, choices: numericChoices(answer), tip: `Target skill: ${profile.subtopic || "equal groups"}.` };
      });
    }
    if (activityId === "word-bakery") {
      return Array.from({ length: count }, (_, index) => {
        const subtract = subtopic.includes("subtract") || subtopic.includes("take away") ? true : subtopic.includes("add") || subtopic.includes("join") ? false : index % 2 === 1;
        const num1 = 8 + ((index * 7 + offset) % 40), num2 = 2 + ((index * 3 + offset) % Math.max(3, Math.floor(num1 / 2)));
        const answer = subtract ? num1 - num2 : num1 + num2;
        const item = ["cookies", "rolls", "cupcakes", "donuts"][index % 4];
        const story = subtract ? `The bakery had ${num1} ${item}. It sold ${num2}. How many ${item} are left?` : `The bakery made ${num1} ${item} and then made ${num2} more. How many ${item} are there in all?`;
        return { id: `personal-wb-${seed}-${index}`, story, num1, num2, item, correctOp: subtract ? "subtract" : "add", answer, choices: numericChoices(answer) };
      });
    }
    // Reading activities preserve their proven activity-specific item shapes.
    // The assignment seed produces a learner-specific rotation and each item
    // carries its assessed focus for analytics and future refinement.
    return getForActivity(activityId, normalized, { seed }).map((item, index) => ({ ...item, id: `personal-${activityId}-${seed}-${index}`, targetSubtopic: profile.subtopic || "" }));
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
    getSubjectBank,
    normalizeLevel,
    validate
  });
})();
