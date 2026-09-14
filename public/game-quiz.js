(function(){
"use strict";
const params=new URLSearchParams(location.search);const activityId=params.get("activityId")||"";const quiz=window.NumeReadGameQuiz?.get(activityId);
let index=0,score=0,selected=null,answered=false,levelScores={easy:[0,0],average:[0,0],intermediate:[0,0],advanced:[0,0]};
const $=id=>document.getElementById(id);const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
function dashboard(){const q=params.toString();location.href=`student.html${q?"?"+q:""}`}
async function canOpenReview(){
  try{
    const stored=JSON.parse(sessionStorage.getItem('numeread_student')||'null');
    if(!stored?.name||!stored?.section||!stored?.studentId||!window.NumeReadData?.authenticateStudent)return false;
    const student=await window.NumeReadData.authenticateStudent(stored.name,stored.section,stored.studentId);
    const completed=student?.learningProgress?.[activityId]?.completedStages||[];
    return ["easy","average","intermediate","advanced"].every(level=>completed.includes(level));
  }catch(error){console.warn('Could not verify review-quiz access.',error);return false}
}
function renderTopics(){const skills=[quiz?.skill].filter(Boolean);$("reviewTopics").innerHTML=skills.map(s=>`<span class="topic"><i class="fas fa-check-circle"></i> ${s}</span>`).join("")+`<span class="topic">12 review questions: 3 from each level</span>`}
function render(){if(!quiz||!quiz.questions.length){$("quizArea").innerHTML='<div class="question-card"><h2>This review quiz is not available yet.</h2></div>';return}const item=quiz.questions[index];selected=null;answered=false;$('questionCounter').textContent=`Question ${index+1} of ${quiz.questions.length}`;$('scoreCounter').textContent=`${score} pts`;$('progressBar').style.width=`${((index+1)/quiz.questions.length)*100}%`;$('levelBadge').textContent=item.level.charAt(0).toUpperCase()+item.level.slice(1);$('feedback').textContent='';$('feedback').className='feedback';$('nextBtn').disabled=true;$('nextBtn').textContent='Check Answer';const opts=shuffle(item.options);$('quizArea').innerHTML=`<div class="question-card"><h2>${escapeHtml(item.question)}</h2><div class="options">${opts.map(o=>`<button type="button" class="option" data-option="${escapeAttr(o)}">${escapeHtml(o)}</button>`).join('')}</div></div>`;document.querySelectorAll('.option').forEach(b=>b.addEventListener('click',()=>{if(answered)return;selected=b.dataset.option;document.querySelectorAll('.option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('nextBtn').disabled=false;$('nextBtn').textContent='Submit Answer'}))}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeAttr(v){return escapeHtml(v)}
function check(){if(!quiz)return;if(!answered){const item=quiz.questions[index];answered=true;const ok=String(selected)===String(item.answer);if(ok){score++;levelScores[item.level][0]++;$('feedback').textContent='Great job! You remembered an important part of this game.';$('feedback').className='feedback good'}else{$('feedback').textContent=`Keep learning. The answer is ${item.answer}.`;$('feedback').className='feedback bad';levelScores[item.level][1]++}document.querySelectorAll('.option').forEach(b=>{b.disabled=true;if(String(b.dataset.option)===String(item.answer))b.classList.add('correct');else if(String(b.dataset.option)===String(selected))b.classList.add('wrong')});$('scoreCounter').textContent=`${score} pts`;$('nextBtn').textContent=index===quiz.questions.length-1?'Finish Review':'Next Question';return}if(index<quiz.questions.length-1){index++;render()}else finish()}
function finish(){ $('quizArea').innerHTML='';$('feedback').textContent='';$('nextBtn').classList.add('hidden');$('questionCounter').textContent='Complete';$('resultCard').classList.remove('hidden');const pct=Math.round(score/quiz.questions.length*100);$('resultMessage').textContent=`You scored ${score} out of ${quiz.questions.length} (${pct}%). This review summarized ${quiz.summary.toLowerCase()}`;$('levelBreakdown').innerHTML=Object.entries(levelScores).map(([l,v])=>`<div class="level-box"><span>${l[0].toUpperCase()+l.slice(1)}</span><strong>${v[0]}</strong><small>correct</small></div>`).join('');try{const stored=JSON.parse(sessionStorage.getItem('numeread_student')||'null');const key=`numeread_game_review_${stored?.id||stored?.studentId||'learner'}`;const history=JSON.parse(localStorage.getItem(key)||'{}');history[activityId]={score,total:quiz.questions.length,percent:pct,completedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(history));}catch(error){console.warn('Review result could not be saved locally.',error)}}
(async function init(){
  $('quizTitle').textContent=quiz?.title?`${quiz.title} Review Quiz`:'Game Review Quiz';
  $('quizSummary').textContent=quiz?.summary||'';
  $('backBtn').addEventListener('click',dashboard);$('dashboardBtn').addEventListener('click',dashboard);$('retryBtn').addEventListener('click',()=>location.reload());
  if(!quiz||!(await canOpenReview())){
    $('quizArea').innerHTML='<div class="question-card"><h2>Finish Easy, Average, Intermediate, and Advanced before opening this review quiz.</h2><p>Return to the dashboard to continue your game journey.</p></div>';
    $('nextBtn').classList.add('hidden');
    return;
  }
  renderTopics();render();$('nextBtn').addEventListener('click',check);
})();
})();
