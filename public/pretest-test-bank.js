/* NumeRead Pre-test Bank
 * Three organized sections: Reading, Mathematics, Reading & Mathematics.
 * Each section contains 10 diagnostic items covering the main system topics.
 */
(function(){
  "use strict";
  const reading = [
    {id:"r1",area:"reading",topic:"Blends",question:"Which word begins with the blend br?",options:["brush","cat","moon"],answer:"brush"},
    {id:"r2",area:"reading",topic:"Blends",question:"Which word begins with the blend st?",options:["star","fish","apple"],answer:"star"},
    {id:"r3",area:"reading",topic:"Reading fluency",question:"Which sentence is complete and makes sense?",options:["The girl reads a book.","Reads girl the.","The happy."],answer:"The girl reads a book."},
    {id:"r4",area:"reading",topic:"Reading fluency",question:"Choose the word that completes the sentence: The bird can ____. ",options:["fly","table","blue"],answer:"fly"},
    {id:"r5",area:"reading",topic:"Vocabulary",question:"What does tiny mean in: 'The tiny seed was hard to see.'?",options:["very small","very loud","very late"],answer:"very small"},
    {id:"r6",area:"reading",topic:"Vocabulary",question:"What does thrilled mean in: 'Lina was thrilled to receive the prize.'?",options:["very happy","very sleepy","very cold"],answer:"very happy"},
    {id:"r7",area:"reading",topic:"Comprehension",question:"Mia opened her book. Then she read a story. What happened first?",options:["Mia opened her book","Mia read a story","Mia went to sleep"],answer:"Mia opened her book"},
    {id:"r8",area:"reading",topic:"Comprehension",question:"The sun gives light and helps plants grow. What is the main idea?",options:["The sun helps Earth","Dogs like food","Rain is cold"],answer:"The sun helps Earth"},
    {id:"r9",area:"reading",topic:"Comprehension",question:"Lina was tired, so she rested. Why did Lina rest?",options:["She was tired","She was hungry","She was outside"],answer:"She was tired"},
    {id:"r10",area:"reading",topic:"Reading fluency",question:"Which word has the same ending sound as cake?",options:["make","cat","sun"],answer:"make"}
  ];
  const mathematics = [
    {id:"m1",area:"math",topic:"Addition facts",question:"What is 7 + 5?",options:["11","12","13"],answer:"12"},
    {id:"m2",area:"math",topic:"Addition facts",question:"What is 14 + 8?",options:["20","22","24"],answer:"22"},
    {id:"m3",area:"math",topic:"Subtraction",question:"What is 20 - 9?",options:["9","11","12"],answer:"11"},
    {id:"m4",area:"math",topic:"Subtraction",question:"Ben had 18 mangoes and gave away 6. How many are left?",options:["12","14","24"],answer:"12"},
    {id:"m5",area:"math",topic:"Place value",question:"Which number shows 3 tens and 4 ones?",options:["34","43","304"],answer:"34"},
    {id:"m6",area:"math",topic:"Place value",question:"Which number has 6 tens and 7 ones?",options:["67","76","607"],answer:"67"},
    {id:"m7",area:"math",topic:"Fractions",question:"Which fraction means 1 part out of 2 equal parts?",options:["1/2","1/3","2/1"],answer:"1/2"},
    {id:"m8",area:"math",topic:"Fractions",question:"Which fraction is equivalent to 1/2?",options:["2/4","1/4","3/4"],answer:"2/4"},
    {id:"m9",area:"math",topic:"Word problems",question:"Ana has 7 pencils. Leo gives her 5 more. How many pencils does Ana have now?",options:["12","10","2"],answer:"12"},
    {id:"m10",area:"math",topic:"Word problems",question:"A class has 23 books and receives 14 more. How many books are there?",options:["37","36","39"],answer:"37"}
  ];
  const combined = [
    {id:"c1",area:"combined",topic:"Read-and-Solve",question:"Read: 'Mia has 8 apples. She gets 5 more.' Which operation should you use to find how many apples Mia has in all?",options:["Addition","Subtraction","Fractions"],answer:"Addition"},
    {id:"c2",area:"combined",topic:"Read-and-Solve",question:"Read: 'There are 15 books. Six are borrowed.' Which operation finds how many books remain?",options:["Addition","Subtraction","Place value"],answer:"Subtraction"},
    {id:"c3",area:"combined",topic:"Read-and-Solve",question:"A tray has 12 cookies and 7 more are added. How many cookies are there?",options:["19","17","5"],answer:"19"},
    {id:"c4",area:"combined",topic:"Read-and-Solve",question:"A baker made 20 buns and sold 8. How many buns are left?",options:["12","28","18"],answer:"12"},
    {id:"c5",area:"combined",topic:"Read-and-Solve",question:"Lia read that a box has 4 groups of 5 pencils. How many pencils are there altogether?",options:["9","20","25"],answer:"20"},
    {id:"c6",area:"combined",topic:"Comprehension + Math",question:"The class has 18 red blocks and 6 blue blocks. What is the total number of blocks?",options:["12","24","28"],answer:"24"},
    {id:"c7",area:"combined",topic:"Comprehension + Math",question:"There are 30 stickers. Sam gives 9 away. What number tells how many stickers remain?",options:["21","39","29"],answer:"21"},
    {id:"c8",area:"combined",topic:"Comprehension + Math",question:"Read: 'A shelf has 34 books.' Which description matches 34?",options:["3 tens and 4 ones","4 tens and 3 ones","3 hundreds and 4 ones"],answer:"3 tens and 4 ones"},
    {id:"c9",area:"combined",topic:"Comprehension + Math",question:"A pizza is cut into 4 equal slices. Carlo eats 1 slice. What fraction did Carlo eat?",options:["1/4","1/2","4/1"],answer:"1/4"},
    {id:"c10",area:"combined",topic:"Comprehension + Math",question:"Nina reads a problem: 'There are 9 birds. 4 fly away.' Which answer matches the story?",options:["5 birds remain","13 birds remain","4 birds remain"],answer:"5 birds remain"}
  ];
  const BANKS=Object.freeze({reading,mathematics,combined});
  // Keep the diagnostic journey ordered by section while shuffling items
  // inside each section. This prevents the visual section tracker from
  // jumping between subjects during the pre-test.
  function all(){return [...reading,...mathematics,...combined];}
  function get(section){return BANKS[section] ? [...BANKS[section]] : [];}
  window.NumeReadPretestBank=Object.freeze({BANKS,SECTIONS:["reading","mathematics","combined"],get,all});
})();
