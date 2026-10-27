/* NumeRead Pre-test Bank
 * Three organized sections: Reading, Mathematics, Reading & Mathematics.
 * Items within each section are organized in strict ascending order of difficulty:
 * - Simple (Easy): Foundational recognition & 1-digit skills
 * - Moderate (Average): Context clozes, 2-digit regrouping, 1-step problems
 * - Intermediate: Word meaning in context, place value, repeated groups
 * - Challenging: Cause & effect, fractions, difference comparisons
 * - Advanced: Main idea synthesis, character inference, multi-step problem solving
 */
(function(){
  "use strict";
  const reading = [
    {id:"r1",area:"reading",topic:"Blends",difficulty:"easy",difficultyLabel:"Simple",question:"Which word begins with the blend 'br'?",options:["brush","cat","moon"],answer:"brush"},
    {id:"r2",area:"reading",topic:"Blends",difficulty:"easy",difficultyLabel:"Simple",question:"Which word begins with the blend 'st'?",options:["star","fish","apple"],answer:"star"},
    {id:"r3",area:"reading",topic:"Reading fluency",difficulty:"average",difficultyLabel:"Moderate",question:"Which sentence is complete and makes sense?",options:["The girl reads a book.","Reads girl the.","The happy."],answer:"The girl reads a book."},
    {id:"r4",area:"reading",topic:"Reading fluency",difficulty:"average",difficultyLabel:"Moderate",question:"Choose the word that correctly completes the sentence: The blue bird can ____ high in the sky.",options:["fly","table","sleepy"],answer:"fly"},
    {id:"r5",area:"reading",topic:"Vocabulary",difficulty:"intermediate",difficultyLabel:"Intermediate",question:"What does the word 'tiny' mean in: 'The tiny puppy could easily fit in a shoe.'?",options:["very small","very loud","very fast"],answer:"very small"},
    {id:"r6",area:"reading",topic:"Vocabulary",difficulty:"intermediate",difficultyLabel:"Intermediate",question:"What does 'thrilled' mean in: 'Lina was thrilled to receive the reading prize.'?",options:["very happy and excited","sleepy and tired","scared and worried"],answer:"very happy and excited"},
    {id:"r7",area:"reading",topic:"Comprehension",difficulty:"intermediate",difficultyLabel:"Challenging",question:"Read: 'Mia packed her backpack, zipped it closed, and walked to the bus stop.' What did Mia do immediately before walking to the bus stop?",options:["Zipped her backpack closed","Read a storybook","Ate breakfast"],answer:"Zipped her backpack closed"},
    {id:"r8",area:"reading",topic:"Comprehension",difficulty:"advanced",difficultyLabel:"Challenging",question:"Read: 'Lina was tired after soccer practice, so she rested on the bench.' Why did Lina rest?",options:["She was tired","She was hungry","She lost her ball"],answer:"She was tired"},
    {id:"r9",area:"reading",topic:"Comprehension",difficulty:"advanced",difficultyLabel:"Advanced",question:"Read: 'The sun gives bright light, warms the soil, and helps plants produce food.' What is the main idea?",options:["The sun is essential for living things on Earth","Plants only grow in the cold rain","Dogs enjoy running in the park"],answer:"The sun is essential for living things on Earth"},
    {id:"r10",area:"reading",topic:"Comprehension",difficulty:"advanced",difficultyLabel:"Advanced",question:"Read: 'Even though Leo struggled with spelling words, he practiced thirty minutes every night until he mastered each one.' What trait does Leo show?",options:["Persistence and dedication","Careless rushing","Fear of learning"],answer:"Persistence and dedication"}
  ];

  const mathematics = [
    {id:"m1",area:"math",topic:"Addition facts",difficulty:"easy",difficultyLabel:"Simple",question:"What is 4 + 3?",options:["7","6","8"],answer:"7"},
    {id:"m2",area:"math",topic:"Subtraction",difficulty:"easy",difficultyLabel:"Simple",question:"What is 9 - 4?",options:["5","4","6"],answer:"5"},
    {id:"m3",area:"math",topic:"Addition facts",difficulty:"average",difficultyLabel:"Moderate",question:"What is 8 + 7?",options:["15","14","16"],answer:"15"},
    {id:"m4",area:"math",topic:"Subtraction",difficulty:"average",difficultyLabel:"Moderate",question:"What is 21 - 8?",options:["13","12","14"],answer:"13"},
    {id:"m5",area:"math",topic:"Place value",difficulty:"intermediate",difficultyLabel:"Intermediate",question:"Which number is made of 5 tens and 3 ones?",options:["53","35","503"],answer:"53"},
    {id:"m6",area:"math",topic:"Place value",difficulty:"intermediate",difficultyLabel:"Intermediate",question:"Which number has a 7 in the tens place and is greater than 74?",options:["78","47","69"],answer:"78"},
    {id:"m7",area:"math",topic:"Fractions",difficulty:"intermediate",difficultyLabel:"Challenging",question:"A pancake is cut into 3 equal pieces. You take 1 piece. What fraction did you take?",options:["1/3","1/2","3/1"],answer:"1/3"},
    {id:"m8",area:"math",topic:"Fractions",difficulty:"advanced",difficultyLabel:"Challenging",question:"Which fraction is equal to 1/2?",options:["2/4","1/4","3/4"],answer:"2/4"},
    {id:"m9",area:"math",topic:"Word problems",difficulty:"advanced",difficultyLabel:"Advanced",question:"Kiko had 28 shells on Saturday and collected 15 more on Sunday. How many shells does Kiko have now?",options:["43","41","33"],answer:"43"},
    {id:"m10",area:"math",topic:"Word problems",difficulty:"advanced",difficultyLabel:"Advanced",question:"A teacher shares 24 crayons equally among 4 art tables. How many crayons does each table receive?",options:["6","5","8"],answer:"6"}
  ];

  const combined = [
    {id:"c1",area:"combined",topic:"Read-and-Solve",difficulty:"easy",difficultyLabel:"Simple",question:"Read: 'Ana has 6 stickers. Ben gives her 3 more.' Which operation tells how many stickers Ana has altogether?",options:["Addition","Subtraction","Division"],answer:"Addition"},
    {id:"c2",area:"combined",topic:"Read-and-Solve",difficulty:"easy",difficultyLabel:"Simple",question:"Read: 'There were 10 birds on a wire. 3 flew away.' Which operation tells how many birds stayed?",options:["Subtraction","Addition","Fractions"],answer:"Subtraction"},
    {id:"c3",area:"combined",topic:"Read-and-Solve",difficulty:"average",difficultyLabel:"Moderate",question:"Read: 'A baker made 14 chocolate muffins and 11 blueberry muffins.' How many muffins did the baker make in all?",options:["25","23","18"],answer:"25"},
    {id:"c4",area:"combined",topic:"Read-and-Solve",difficulty:"average",difficultyLabel:"Moderate",question:"Read: 'A bus had 24 passengers. At the library stop, 7 passengers stepped off.' How many passengers remained on the bus?",options:["17","16","31"],answer:"17"},
    {id:"c5",area:"combined",topic:"Read-and-Solve",difficulty:"intermediate",difficultyLabel:"Intermediate",question:"Read: 'The school garden has 5 rows of flowers. Each row has 4 yellow sunflowers.' How many sunflowers are in the garden in all?",options:["20","9","25"],answer:"20"},
    {id:"c6",area:"combined",topic:"Comprehension + Math",difficulty:"intermediate",difficultyLabel:"Intermediate",question:"Read: 'The librarian counted 48 mystery books on the display shelf.' Which description correctly breaks down the number 48?",options:["4 tens and 8 ones","8 tens and 4 ones","4 hundreds and 8 ones"],answer:"4 tens and 8 ones"},
    {id:"c7",area:"combined",topic:"Comprehension + Math",difficulty:"intermediate",difficultyLabel:"Challenging",question:"Read: 'A round pizza was sliced into 4 equal pieces. Carlos ate 1 piece.' What fraction of the pizza did Carlos eat?",options:["1/4","1/2","3/4"],answer:"1/4"},
    {id:"c8",area:"combined",topic:"Comprehension + Math",difficulty:"advanced",difficultyLabel:"Challenging",question:"Read: 'In a math game, Maya scored 18 points and Liam scored 27 points.' How many more points did Liam score than Maya?",options:["9","11","45"],answer:"9"},
    {id:"c9",area:"combined",topic:"Comprehension + Math",difficulty:"advanced",difficultyLabel:"Advanced",question:"Read: 'Sam brought 30 cookies to a party. He gave 12 cookies to table A and 8 cookies to table B.' How many cookies does Sam have left?",options:["10","12","18"],answer:"10"},
    {id:"c10",area:"combined",topic:"Comprehension + Math",difficulty:"advanced",difficultyLabel:"Advanced",question:"Read: 'A box contained 24 color pencils. The teacher gave half (1/2) of the pencils to table A, and 4 pencils to table B.' How many pencils remain in the box?",options:["8","12","16"],answer:"8"}
  ];

  const BANKS=Object.freeze({reading,mathematics,combined});
  // Keep the diagnostic journey ordered by section with items progressively escalating in difficulty
  function all(){return [...reading,...mathematics,...combined];}
  function get(section){return BANKS[section] ? [...BANKS[section]] : [];}
  window.NumeReadPretestBank=Object.freeze({BANKS,SECTIONS:["reading","mathematics","combined"],get,all});
})();
