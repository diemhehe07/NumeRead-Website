(function () {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = (index * 7 + copy.length) % (index + 1);
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  };
  const rotate = (items, cycle, count) => {
    if (!items.length) return [];
    return Array.from({ length: Math.min(count, items.length) }, (_, index) => ({ ...items[(cycle * count + index) % items.length] }));
  };

  const blendWords = {
    easy: [["bl", "blue"], ["tr", "train"], ["cl", "clock"], ["gr", "green"], ["sl", "slide"], ["sn", "snake"], ["pl", "plant"], ["fr", "frog"]],
    average: [["br", "brush"], ["dr", "drum"], ["fl", "flag"], ["cr", "crab"], ["gl", "globe"], ["pr", "prize"], ["sp", "spoon"], ["st", "star"]],
    intermediate: [["pl", "planet"], ["cr", "crunch"], ["fr", "friend"], ["sk", "skate"], ["sm", "smile"], ["sw", "swing"], ["tw", "twin"], ["ch", "chair"]],
    advanced: [["str", "street"], ["scr", "screen"], ["spl", "splash"], ["thr", "three"], ["spr", "spring"], ["squ", "square"], ["shr", "shrimp"], ["wr", "write"]]
  };

  const vocabulary = {
    easy: [["tiny", "very small", "The tiny ant walked on the leaf."], ["huge", "very big", "A huge kite flew above the field."], ["quiet", "not loud", "The library was quiet during reading."], ["quick", "fast", "The quick rabbit hopped away."], ["near", "close", "My pencil is near the notebook."], ["happy", "glad", "Mia felt happy after the game."]],
    average: [["brave", "not afraid", "The brave child tried the tall slide."], ["silent", "quiet", "The room was silent during the test."], ["reply", "answer", "Please reply to the question."], ["usual", "regular", "I sat in my usual chair."], ["careful", "not careless", "Be careful with the glass."], ["travel", "go from one place to another", "We travel to school by bus."]],
    intermediate: [["enormous", "very big", "The enormous box filled the room."], ["discover", "find", "They discover a new path."], ["select", "choose", "Select the best answer."], ["observe", "watch carefully", "Observe the plant each day."], ["predict", "tell what may happen", "Use clues to predict what happens next."], ["compare", "tell how things are alike or different", "Compare the two stories."]],
    advanced: [["evidence", "details that prove an answer", "Use evidence from the passage."], ["conclude", "decide using clues", "Conclude why the character left."], ["fortunate", "lucky", "It was fortunate that we found the map."], ["examine", "look at carefully", "Examine the chart before answering."], ["consequence", "what happens because of an action", "Every choice has a consequence."], ["contrast", "show differences", "Contrast the two characters."]]
  };

  const sentenceParts = {
    easy: [["The cat naps", "What naps?", "cat"], ["A frog jumps", "What does the frog do?", "jumps"], ["The sun shines", "What shines?", "sun"], ["My dog runs", "Who runs?", "dog"], ["Birds sing", "What do birds do?", "sing"], ["The fish swims", "What swims?", "fish"]],
    average: [["The small bird sings", "What does the bird do?", "sings"], ["My red ball bounces", "What color is the ball?", "red"], ["The happy girl dances", "How does the girl feel?", "happy"], ["A brown dog sleeps", "What color is the dog?", "brown"], ["The green plant grows", "What grows?", "plant"], ["Our class reads quietly", "How does the class read?", "quietly"]],
    intermediate: [["Rina reads a funny story", "What does Rina read?", "story"], ["The big elephant trumpets loudly", "How does the elephant trumpet?", "loudly"], ["Mom bakes delicious cookies", "Who bakes cookies?", "Mom"], ["Leo carries his heavy bag", "What does Leo carry?", "bag"], ["The children build a tall tower", "What do the children build?", "tower"], ["Maya paints a bright picture", "What does Maya paint?", "picture"]],
    advanced: [["After class Marco solves three puzzles", "When does Marco solve puzzles?", "After class"], ["Because of the rain we stay inside", "Why do we stay inside?", "rain"], ["The brave knight defeats the dragon", "Who defeats the dragon?", "knight"], ["Before lunch Ana finishes her project", "When does Ana finish her project?", "Before lunch"], ["Although tired Ben completes the challenge", "What does Ben complete?", "challenge"], ["During recess the team plans a play", "What does the team plan?", "play"]]
  };

  function choices(answer, alternatives) {
    return shuffle([answer, ...alternatives.filter((item) => item !== answer).slice(0, 2)]);
  }

  function readingBridge(difficulty, cycle) {
    const pool = blendWords[difficulty] || blendWords.easy;
    return rotate(pool, cycle, 4).map(([blend, answer]) => ({
      blend,
      answer,
      choices: choices(answer, ["apple", "sun", "map", "dog", "fish", "rain"]),
      lesson: `Listen for each sound in ${blend}, then blend them smoothly.`
    }));
  }

  function vocabQuest(difficulty, cycle) {
    const pool = vocabulary[difficulty] || vocabulary.easy;
    return rotate(pool, cycle, 4).map(([word, answer, sentence], index, set) => ({
      word, answer, sentence,
      choices: choices(answer, set.map((item) => item[1]).concat(["very sleepy", "not related to the sentence"]))
    }));
  }

  function sentenceBuilder(difficulty, cycle) {
    return rotate(sentenceParts[difficulty] || sentenceParts.easy, cycle, 3).map(([sentence, question, answer]) => ({
      words: sentence.split(" "), sentence, question, answer,
      hint: "Read the completed sentence again and look for the words that answer the question."
    }));
  }

  function comprehension(difficulty, cycle) {
    const names = ["Lito", "Mina", "Rico", "Ana", "Carla", "Marco", "Ella", "Niko"];
    const actions = ["watered a dry plant", "practiced reading every night", "packed an umbrella before the rain", "shared pencils with a classmate", "checked the map before a trip", "reread a tricky question"];
    const name = names[cycle % names.length];
    const action = actions[cycle % actions.length];
    const first = { passage: `${name} ${action}. Later, the teacher smiled at the careful work.`, question: `What did ${name} do?`, answer: action, choices: choices(action, ["forgot the work", "went to sleep", "lost a book"]) };
    const second = { passage: `Dark clouds gathered over the school. The children moved their games indoors.`, question: "Why did the children move indoors?", answer: "dark clouds gathered", choices: choices("dark clouds gathered", ["it was bedtime", "they lost their toys", "the sun was bright"]) };
    const third = difficulty === "advanced" ? { passage: `Although the puzzle was difficult, Sam tried two strategies and explained the answer clearly.`, question: "What does Sam's action show?", answer: "persistence", choices: choices("persistence", ["carelessness", "confusion", "haste"]) } : { passage: `The seeds received water and sunlight each day. Soon, green leaves appeared.`, question: "What happened after the seeds were cared for?", answer: "green leaves appeared", choices: choices("green leaves appeared", ["the seeds disappeared", "a book opened", "the room became dark"]) };
    return [first, second, third];
  }

  function bakery(difficulty, cycle) {
    const base = { easy: 6, average: 14, intermediate: 32, advanced: 75 }[difficulty] || 6;
    const addA = base + ((cycle * 3) % 9);
    const addB = Math.max(2, Math.floor(base / 2) + (cycle % 5));
    const subtractA = base * 2 + ((cycle * 5) % 15);
    const subtractB = Math.max(2, Math.floor(subtractA / 3));
    return [
      { story: `The bakery made ${addA} buns and ${addB} rolls. How many baked goods are there in all?`, correctOp: "add", answer: addA + addB },
      { story: `There were ${subtractA} cupcakes. The baker sold ${subtractB}. How many cupcakes are left?`, correctOp: "subtract", answer: subtractA - subtractB },
      { story: `A tray has ${addB + 2} donuts. The baker adds ${addA}. How many donuts are on the tray?`, correctOp: "add", answer: addA + addB + 2 }
    ];
  }

  function get(activityId, difficulty, cycle, fallback) {
    const safeCycle = clamp(Number(cycle) || 0, 0, 9999);
    if (activityId === "reading-bridge") return readingBridge(difficulty, safeCycle);
    if (activityId === "vocab-quest") return vocabQuest(difficulty, safeCycle);
    if (activityId === "sentence-builder") return sentenceBuilder(difficulty, safeCycle);
    if (activityId === "comprehension-trail") return comprehension(difficulty, safeCycle);
    if (activityId === "word-bakery") return bakery(difficulty, safeCycle);
    return rotate(fallback || [], safeCycle, (fallback || []).length);
  }

  window.NumeReadAdaptiveContent = { get };
})();
