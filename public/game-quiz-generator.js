/* NumeRead Game Review Quiz Generator
 * Generates a short review quiz from the completed game's central test bank.
 */
(function(){
  "use strict";
  const activityMeta={
    "reading-bridge":{title:"Reading Bridge",skill:"Blends",summary:"Beginning blends and smooth word reading."},
    "sentence-builder":{title:"Sentence Builder",skill:"Reading fluency",summary:"Sentence order, complete sentences, and reading for meaning."},
    "vocab-quest":{title:"Vocabulary Quest",skill:"Vocabulary",summary:"Using context clues to understand word meanings."},
    "comprehension-trail":{title:"Comprehension Trail",skill:"Comprehension",summary:"Finding details, main ideas, sequence, and evidence."},
    "pronunciation-practice":{title:"Pronunciation Practice",skill:"Pronunciation",summary:"Listening carefully and saying words clearly and smoothly."},
    "spelling-sprint":{title:"Spelling Sprint",skill:"Spelling",summary:"Listening for sounds and building words in the correct order."},
    "math-ninja":{title:"Math Ninja",skill:"Addition facts",summary:"Addition facts and combining quantities."},
    "subtraction-sprint":{title:"Subtraction Sprint",skill:"Subtraction",summary:"Taking away and finding differences."},
    "division-dash":{title:"Division Dash",skill:"Division",summary:"Sharing equal groups and finding quotients."},
    "place-value-builder":{title:"Place Value Builder",skill:"Place value",summary:"Hundreds, tens, ones, and number structure."},
    "fraction-pizza":{title:"Fraction Pizza Chef",skill:"Fractions",summary:"Equal parts, fractions, comparison, and equivalent fractions."},
    "word-bakery":{title:"Word Problem Bakery",skill:"Word problems",summary:"Reading a story, choosing an operation, and solving."}
  };
  const levels=["easy","average","intermediate","advanced"];
  function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function cloneItem(item,level,index){return {...item,level,reviewId:`review-${level}-${index}`};}
  function makeQuestions(activityId){
    const bank=window.NumeReadTestBanks?.getForActivity;
    if(typeof bank!=="function") return [];
    const result=[];
    levels.forEach(level=>{
      const source=bank(activityId,level,{seed:0});
      // Three items per level gives an even 12-question recap across the
      // complete Easy-to-Advanced journey.
      shuffle(source).slice(0,3).forEach((item,index)=>result.push(cloneItem(item,level,index)));
    });
    return shuffle(result);
  }
  function toQuizQuestion(item,index){
    let question=item.prompt||item.question||item.story||"Choose the best answer.";
    let options=Array.isArray(item.choices)?item.choices.map(choice=>String(choice?.value ?? choice?.label ?? choice)):[];
    let answer=String(item.answer ?? "");
    if(item.activityId==="word-bakery") question=item.story||question;
    if(!options.length && item.answer!==undefined){options=[answer,"Try again","Not enough information"]}
    if(!options.includes(answer)) options.unshift(answer);
    return {id:`gq-${index+1}`,question,options,answer,level:item.level,skill:activityMeta[item.activityId]?.skill||"Practice"};
  }
  function get(activityId){
    const meta=activityMeta[activityId];
    if(!meta)return null;
    const items=makeQuestions(activityId).map((item,i)=>toQuizQuestion({...item,activityId},i));
    return {activityId,title:meta.title,skill:meta.skill,summary:meta.summary,questions:items};
  }
  window.NumeReadGameQuiz=Object.freeze({activityMeta,levels,get});
})();
