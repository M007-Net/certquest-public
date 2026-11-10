const fs=require('fs'),vm=require('vm'),assert=require('assert');
const scripts=['cloud.js','gear.js','exam.js','aplus-data.js','academy.js','certification-registry.js','specialist-registry.js','certification-data.js','cloud-course-data.js','advanced-course-data.js','specialist-course-data.js','applied-scenarios.js','depth-data.js','domain-lab-data.js','academy-engine.js','depth.js','domain-labs.js','powershell-course.js','powershell-runtime.js','bash-course.js','bash-runtime.js','skills.js','game.js'].map(f=>fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'));let stored={};
function setup(){const nodes=new Map(),node=()=>({innerHTML:'',textContent:'',style:{},scrollIntoView(){},close(){},showModal(){},classList:{toggle(){}}});const c={document:{querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return[]}},localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},window:{scrollTo(){},confirm(){return true}},setTimeout(){}};vm.createContext(c);scripts.forEach(s=>vm.runInContext(s,c));return {run:s=>vm.runInContext(s,c),nodes};}
let {run,nodes}=setup();const win=(r,c)=>run(`begin(${r},${c});for(let turns=0;state.battle;turns++){if(turns>30)throw Error('Stuck');ask();answer(realms[${r}].chapters[${c}][4][pending.index][2]);resolveAnswer();}`);
assert.equal(run('state.inventory.length'),0);win(0,0);assert.equal(run('state.inventory[0]'),'leather-armor');assert.equal(run('state.equipment.armor'),'leather-armor');assert.ok(nodes.get('#app').innerHTML.includes('Equipped automatically'));
win(2,0);win(0,1);assert.equal(run('state.equipment.weapon'),'wooden-sword');assert.equal(run('state.equipment.armor'),'chainmail-armor');
for(const [r,c] of [[0,2],[1,0],[1,1],[1,2],[2,1],[2,2]])win(r,c);
assert.equal(run('state.done.length'),9);assert.equal(run('state.inventory.length'),9);assert.equal(run('state.xp'),900);assert.equal(run('state.gold'),600);assert.deepEqual(JSON.parse(run('JSON.stringify(gearStats())')),{attack:16,knowledge:28,guard:3,heal:60});
win(0,0);assert.equal(run('state.inventory.length'),9);assert.equal(run('state.xp'),900);assert.equal(run('lastReward.first'),false);assert.ok(nodes.get('#app').innerHTML.includes('no duplicate item'));
run("go('hero');equipItem('steel-sword')");assert.equal(run('gearStats().attack'),14);run("begin(2,2);equipItem('runic-sword')");assert.equal(run('gearStats().attack'),14);run('attack()');assert.equal(run('state.battle.enemy'),146);assert.equal(run('state.battle.hp'),92);
run('save()');({run,nodes}=setup());assert.equal(run('state.battle.loadout.attack'),14);assert.equal(run('state.battle.enemy'),146);assert.equal(run('state.inventory.length'),9);run('chooseHero(5)');assert.equal(run('state.equipment.weapon'),'steel-sword');assert.equal(run('state.battle.enemy'),146);run('flee()');run("equipItem('runic-sword');unequipItem('armor')");assert.equal(run('gearStats().guard'),0);run("equipItem('plate-armor');equipItem('not-an-item')");assert.equal(run('gearStats().guard'),3);
// Previous-version saves receive earned gear, and active battles remain resumable.
let old=JSON.parse(stored['certquest.v1']);delete old.inventory;delete old.equipment;old.done=['0-0','1-2'];old.battle={r:2,c:0,hp:70,enemy:60,shield:0,round:2,used:[],log:[]};stored['certquest.v1']=JSON.stringify(old);({run,nodes}=setup());assert.equal(run('state.inventory.length'),2);assert.equal(run('state.equipment.potion'),'restoration-elixir');assert.equal(run('state.battle.hp'),70);assert.equal(run('state.battle.loadout.attack'),10);run('flee();begin(2,2);while(state.battle)turn(0,"test")');assert.equal(run('state.inventory.length'),2);assert.equal(run('state.done.length'),2);
stored={};({run,nodes}=setup());run('begin(0,0);ask();answer((realms[0].chapters[0][4][pending.index][2]+1)%4);resolveAnswer()');assert.equal(run('state.battle.enemy'),85);assert.equal(run('state.battle.hp'),93);run('flee()');win(0,0);run('begin(1,0);ability(0)');assert.equal(run('state.battle.used.includes(0)'),true);assert.equal(run('state.battle.hp'),94);run('ability(0)');assert.equal(run('state.battle.hp'),94);run('save()');({run,nodes}=setup());assert.equal(run('state.battle.loadout.guard'),1);assert.equal(run('state.battle.used.includes(0)'),true);
console.log('PASS: nine unique quest items, automatic upgrades, weaker loot retained, stat bonuses in combat, duplicate protection, gear locking during combat, equipment and hero persistence, legacy save migration, defeat retention, wrong answers and spell usage.');

// Pending answers survive reload and cannot be changed after revealing the solution.
stored={};({run,nodes}=setup());run('chooseHero(0);begin(0,0);ask();answer((realms[0].chapters[0][4][pending.index][2]+1)%4)');
({run,nodes}=setup());run("go('battle')");assert.equal(run('pending.answered'),true);assert.equal(run('pending.right'),false);
run('answer(0);resolveAnswer()');assert.equal(run('state.correct'),0);assert.equal(run('state.answered'),1);assert.equal(run('state.battle.enemy'),85);
({run,nodes}=setup());run("go('battle')");assert.equal(run('pending'),null);
// Navigation does not rewrite identical state. Backup recovers the last good state.
const primary=stored['certquest.v1'],backup=stored['certquest.v1.backup'];run("go('home');go('hero')");assert.equal(stored['certquest.v1'],primary);assert.equal(stored['certquest.v1.backup'],backup);
stored['certquest.v1']='broken';({run,nodes}=setup());assert.equal(run('recoveredSave'),true);assert.equal(run('state.heroChosen'),true);
stored={'certquest.v1':'broken'};({run,nodes}=setup());assert.equal(stored['certquest.v1'],'broken');assert.equal(run('route.view'),'recovery');run("go('home')");assert.equal(stored['certquest.v1'],'broken');assert.ok(nodes.get('#app').innerHTML.includes('left untouched'));
console.log('PASS: quiz refresh, unchanged-save deduplication, automatic backup recovery, corrupt-save preservation.');

// Each path upgrades only its corresponding slot. Old gear migrates by completed quest.
stored={};({run,nodes}=setup());win(2,0);assert.equal(run('state.equipment.weapon'),'wooden-sword');win(2,1);assert.equal(run('state.equipment.weapon'),'steel-sword');win(2,2);assert.equal(run('state.equipment.weapon'),'runic-sword');assert.equal(run('state.equipment.armor'),null);
win(1,0);assert.equal(run('state.equipment.potion'),'minor-potion');win(1,1);assert.equal(run('state.equipment.potion'),'greater-potion');win(1,2);assert.equal(run('state.equipment.potion'),'restoration-elixir');
let legacy=JSON.parse(stored['certquest.v1']);delete legacy.gearRevision;legacy.equipment={weapon:'storm-staff',armor:'citadel-plate',charm:'cipher-sigil'};stored['certquest.v1']=JSON.stringify(legacy);({run,nodes}=setup());assert.equal(run('state.equipment.weapon'),'runic-sword');assert.equal(run('state.equipment.potion'),'restoration-elixir');assert.equal(run('state.equipment.armor'),null);
// Exam requires reading and clearing all three Security+ modules.
assert.equal(run('examUnlocked()'),false);run('openExam()');assert.equal(run('state.securityExam'),undefined);
run("state.read=['2-0','2-1','2-2'];save();openExam();examAnswer(1);examMove(1);examAnswer(2)");
({run,nodes}=setup());run('openExam()');assert.equal(run('state.securityExam.index'),1);assert.equal(run('state.securityExam.answers[0]'),1);assert.ok(!nodes.get('#app').innerHTML.includes('Correct answer:'));
run('submitExam()');assert.equal(run('state.securityExam.submitted'),false);
run('for(let i=0;i<SECURITY_EXAM.length;i++){examMove(i);examAnswer(SECURITY_EXAM[i][2]);}submitExam()');assert.equal(run('state.securityExam.submitted'),true);assert.ok(nodes.get('#app').innerHTML.includes('100%'));assert.ok(nodes.get('#app').innerHTML.includes('Trial passed!'));
run('examAnswer(0)');assert.equal(run('state.securityExam.answers[11]'),3);
({run,nodes}=setup());run('openExam()');assert.ok(nodes.get('#app').innerHTML.includes('100%'));run('retryExam()');assert.equal(run('state.securityExam.answers.every(a=>a===null)'),true);
run('for(let i=0;i<SECURITY_EXAM.length;i++){examMove(i);examAnswer((SECURITY_EXAM[i][2]+1)%4);}submitExam()');assert.ok(nodes.get('#app').innerHTML.includes('0%'));assert.ok(nodes.get('#app').innerHTML.includes('Review, then try again.'));
console.log('PASS: certification gear ladders, legacy gear conversion, locked exam, exam resume, scoring, review and retake.');

stored={};({run,nodes}=setup());win(1,0);assert.equal(run('gearStats().heal'),25);win(1,1);assert.equal(run('gearStats().heal'),40);win(1,2);assert.equal(run('gearStats().heal'),60);
run('begin(2,0);ability(1)');assert.equal(run('state.battle.used.includes(1)'),false);run('state.battle.hp=20;ability(1)');assert.equal(run('state.battle.hp'),80);assert.equal(run('state.battle.round'),0);assert.equal(run('state.battle.enemy'),90);
({run,nodes}=setup());run('ability(1)');assert.equal(run('state.battle.hp'),80);run('flee();begin(2,0);attack();ask();ability(1)');assert.equal(run('state.battle.hp'),93);assert.equal(run('state.battle.used.includes(1)'),false);run('answer(1);resolveAnswer();ability(1)');assert.equal(run('state.battle.hp'),100);assert.equal(run('state.battle.used.includes(1)'),true);
run('flee();begin(2,0)');assert.equal(run('state.battle.used.includes(1)'),false);
const shieldSave=JSON.parse(stored['certquest.v1']);shieldSave.gearRevision=2;shieldSave.equipment={weapon:null,armor:null,shield:'aegis-shield'};delete shieldSave.battle.loadout.heal;shieldSave.battle.used=[1];stored['certquest.v1']=JSON.stringify(shieldSave);({run,nodes}=setup());assert.equal(run('state.equipment.potion'),'restoration-elixir');assert.equal(run('state.battle.used.includes(1)'),true);assert.equal(run('storageOK'),true);
console.log('PASS: potion upgrades, capped healing, no counterattack, once-per-battle persistence, refill, quiz guard, shield-save migration.');

// Both cloud realms are playable from a fresh save and reward distinct equipment.
stored={};({run,nodes}=setup());
assert.equal(run('realms.length'),5);assert.equal(run('questCount()'),15);
for(const r of [3,4]){
 run(`go('realm',${r});openExam(${r})`);assert.notEqual(run('route.view'),'exam');
 for(let c=0;c<3;c++){
  run(`go('lesson',${r},${c})`);assert.ok(nodes.get('#app').innerHTML.includes('Official'));
  win(r,c);assert.equal(run(`state.equipment.${r===3?'charm':'shield'}`),r===3?['cloud-spark','storm-crystal','sky-core'][c]:['mist-shield','azure-shield','skyward-aegis'][c]);
  ({run,nodes}=setup());assert.equal(run('storageOK'),true);
 }
 assert.equal(run(`examUnlocked(state,${r})`),true);
 run(`openExam(${r});examAnswer(1);examMove(1)`);
 ({run,nodes}=setup());run(`openExam(${r})`);assert.equal(run(`examState(${r}).index`),1);assert.equal(run(`examState(${r}).answers[0]`),1);
 run(`for(let i=0;i<examConfig(${r}).bank.length;i++){examMove(i);examAnswer(examConfig(${r}).bank[i][2]);}submitExam()`);
 assert.ok(nodes.get('#app').innerHTML.includes('100%'));
 assert.ok(nodes.get('#app').innerHTML.includes('Trial passed!'));
}
assert.equal(run('state.cloudExams[3].submitted'),true);assert.equal(run('state.cloudExams[4].submitted'),true);assert.equal(run('state.securityExam'),undefined);
run('openExam(3);retryExam()');assert.equal(run('state.cloudExams[3].submitted'),false);assert.equal(run('state.cloudExams[4].submitted'),true);
({run,nodes}=setup());assert.equal(run('state.cloudExams[4].submitted'),true);
// Each new spell is usable once, survives reload, and has a real combat effect.
run('begin(4,2);ability(3)');assert.equal(run('state.battle.enemy'),120);assert.equal(run('state.battle.hp'),92);assert.equal(run('state.battle.used.includes(3)'),true);
({run,nodes}=setup());run('ability(3)');assert.equal(run('state.battle.enemy'),120);run('ability(4)');assert.equal(run('state.battle.hp'),92);assert.equal(run('state.battle.shield'),16);
({run,nodes}=setup());run('ability(4)');assert.equal(run('state.battle.shield'),16);run('attack()');assert.equal(run('state.battle.hp'),92);
// Inventory totals, navigation and old saves work beyond the original three realms.
run('flee()');for(let r=0;r<3;r++)for(let c=0;c<3;c++)win(r,c);
assert.equal(run('state.inventory.length'),15);assert.equal(run('state.xp'),1500);assert.equal(run('state.gold'),1000);
assert.deepEqual(JSON.parse(run('JSON.stringify(gearStats())')),{attack:16,knowledge:34,guard:6,heal:60});
run("go('home')");assert.ok(nodes.get('#app').innerHTML.includes('15/15 quests'));run("go('hero')");assert.ok(nodes.get('#app').innerHTML.includes('15/39 items'));
for(const r of [3,4]){const earned=run('state.xp');win(r,2);assert.equal(run('state.xp'),earned);}
let preCloud=JSON.parse(stored['certquest.v1']);preCloud.done=preCloud.done.filter(k=>+k[0]<3);preCloud.read=preCloud.read.filter(k=>+k[0]<3);delete preCloud.cloudExams;delete preCloud.equipment.charm;delete preCloud.equipment.shield;preCloud.equipment.weapon='wooden-sword';preCloud.equipment.armor=null;stored['certquest.v1']=JSON.stringify(preCloud);
({run,nodes}=setup());assert.equal(run('state.equipment.weapon'),'wooden-sword');assert.equal(run('state.equipment.armor'),null);assert.equal(run('state.equipment.charm'),null);assert.equal(run('state.equipment.shield'),null);assert.equal(run('state.inventory.length'),9);run('continueQuest()');assert.equal(run('route.view'),'academy');assert.ok(nodes.get('#app').innerHTML.includes('Safe troubleshooting'));
// Content and packaged HTML cover every new encounter and script dependency.
run(`for(const realm of realms)for(const chapter of realm.chapters)for(const q of chapter[4]){if(q[1].length<3||!Number.isInteger(q[2])||q[2]<0||q[2]>=q[1].length||!q[3])throw Error('Invalid lesson question');}`);
const html=fs.readFileSync(require('path').join(__dirname,'../dist/index.html'),'utf8');
assert.ok(html.indexOf('src="cloud.js"')<html.indexOf('src="gear.js"'));
for(const r of [3,4]){const art=run(`realms[${r}].enemyArt`);assert.ok(fs.existsSync(require('path').join(__dirname,'../dist/assets',art+'.png')));}
console.log('PASS: five realms, cloud lessons/rewards, both saved practice trials, cross-realm spells, 15-quest totals, older-save continuity and packaged cloud assets.');

// Learning branches, matching labs, saved answers, unique rewards and core trials.
stored={};({run,nodes}=setup());run('academy();studyExam(1)');assert.equal(run('state.academy.session'),null);
assert.equal(run('APLUS_COURSE.length'),63);assert.equal(run('STUDY_TOPICS.filter(t=>t.core<=2).length'),73);assert.equal(run('STUDY_QUESTIONS.filter(t=>t.core<=2&&!t.id.startsWith("detail:")).length'),294);
run("academyStart('memory','quest')");assert.equal(run('state.academy.session'),null);
run("academyStart('safety','quest');academyAnswer(0)");assert.equal(run('state.academy.earned.length'),1);
({run,nodes}=setup());assert.equal(run('state.academy.session.answers[0]'),0);run('academyAnswer(0)');assert.equal(run('state.academy.earned.length'),1);
run('academyNext();academyAnswer(0);academyNext();academyAnswer(0);academyNext()');assert.equal(run('state.academy.done.includes("safety")'),true);
// Clear every branch using its actual key, including matching arrays and scenario steps.
for(let i=0;i<73;i++){
 run(`academyStart(STUDY_TOPICS[${i}].id,'quest');while(state.academy.session&&!state.academy.session.submitted){const s=state.academy.session,q=STUDY_BY_ID.get(s.deck[s.index]);studyCommit(q.answer);academyNext();}`);
 assert.equal(run(`state.academy.done.includes(STUDY_TOPICS[${i}].id)`),true);
 ({run,nodes}=setup());assert.equal(run('storageOK'),true);
}
assert.equal(run('state.academy.earned.length'),run('STUDY_QUESTIONS.filter(q=>q.core<=2).length'));assert.equal(run('learningBonuses().maxHp'),140);
run('studyPractice()');assert.equal(run('state.academy.session.deck.length'),run('STUDY_QUESTIONS.length'));assert.equal(run('new Set(state.academy.session.deck).size'),run('STUDY_QUESTIONS.length'));
run('state.academy.session.index=state.academy.session.deck.findIndex(k=>state.academy.earned.includes(k));studyCommit(STUDY_BY_ID.get(state.academy.session.deck[state.academy.session.index]).answer)');assert.equal(run('state.academy.earned.length'),run('STUDY_QUESTIONS.filter(q=>q.core<=2).length'));
// Both core trials persist answer changes, flag state, navigation and independent results.
for(const core of [1,2]){
 run(`studyExam(${core});studyCommit(STUDY_BY_ID.get(state.academy.session.deck[0]).answer);studyFlag();studyMove(1)`);
 assert.equal(run('state.academy.session.deck.length'),60);assert.equal(run('new Set(state.academy.session.deck).size'),60);
 assert.ok(!nodes.get('#app').innerHTML.includes('Review this decision'));
 ({run,nodes}=setup());assert.equal(run('state.academy.session.index'),1);assert.equal(run('state.academy.session.flags[0]'),0);
 run(`for(let i=0;i<60;i++){studyJump(i);const s=state.academy.session;if(s.answers[i]===null)studyCommit(STUDY_BY_ID.get(s.deck[i]).answer);}studySubmit()`);
 assert.equal(run('state.academy.session.submitted'),true);assert.ok(nodes.get('#app').innerHTML.includes('100%'));
 assert.equal(run('state.academy.results.at(-1).core'),core);
}
run('begin(0,2)');assert.equal(run('state.battle.hp'),140);assert.equal(run('state.battle.maxHp'),140);assert.ok(run('state.battle.resistance')>0);run('attack()');assert.equal(run('state.battle.enemy'),150);
({run,nodes}=setup());assert.equal(run('state.battle.maxHp'),140);assert.equal(run('storageOK'),true);run('flee()');
// A damaged learning answer is rejected without replacing the valid live state.
run('studyPractice()');const invalid=JSON.parse(stored['certquest.v1']);invalid.academy.session.answers[0]=999;
assert.throws(()=>run(`validate(${JSON.stringify(invalid)})`));
run("studyBook('BitLocker')");assert.ok(nodes.get('#app').innerHTML.includes('BitLocker'));
console.log('PASS: all 73 branches, 294 exercises, matching/scenario grading, core trials, learning saves and campaign-wide health/resistance.');

// Every requested certification uses the same complete learning workflow.
assert.equal(run('STUDY_TOPICS.filter(t=>t.core<=6).length'),156);assert.equal(run('STUDY_QUESTIONS.filter(q=>q.core<=6&&!q.id.startsWith("detail:")).length'),733);
assert.equal(run('new Set(STUDY_QUESTIONS.map(q=>q.id)).size'),run('STUDY_QUESTIONS.length'));
run(`for(const t of STUDY_TOPICS){if(!CERTIFICATIONS[t.core]||!t.questions.some(q=>q.tier===3)||!t.questions.length||t.requires.some(k=>!studyTopic(k)))throw Error('Invalid course');for(const q of t.questions){if(!q.prompt||!q.explanation||q.options.length<3)throw Error('Invalid content');const answers=Array.isArray(q.answer)?q.answer:[q.answer];if(answers.some(n=>!Number.isInteger(n)||n<0||n>=q.options.length))throw Error('Invalid key');if(Array.isArray(q.answer)&&q.kind!=='multi'&&q.left.length!==q.answer.length)throw Error('Invalid matching');}}`);
// Keep old earned progress and sessions intact as new courses are introduced.
const priorEarned=run('state.academy.earned.length');({run,nodes}=setup());assert.equal(run('state.academy.earned.length'),priorEarned);
for(const core of [3,4,5,6]){
 run(`state.academy.session=null;studyExam(${core})`);assert.equal(run('state.academy.session'),null);
 const count=run(`STUDY_TOPICS.filter(t=>t.core===${core}).length`);
 for(let index=0;index<count;index++){
  run(`academyStart(STUDY_TOPICS.filter(t=>t.core===${core})[${index}].id,'quest');while(!state.academy.session.submitted){const s=state.academy.session;studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);academyNext();}`);
  assert.equal(run(`state.academy.done.includes(STUDY_TOPICS.filter(t=>t.core===${core})[${index}].id)`),true);
  ({run,nodes}=setup());assert.equal(run('storageOK'),true);
 }
 const slot={3:'potion',4:'weapon',5:'charm',6:'shield'}[core],reward={3:'restoration-elixir',4:'runic-sword',5:'sky-core',6:'skyward-aegis'}[core];
 assert.equal(run(`state.equipment.${slot}`),reward);
 assert.equal(run(`realmUnlocked(${core-2})`),true);
 run(`studyPractice('core${core}')`);assert.equal(run(`state.academy.session.deck.every(k=>STUDY_BY_ID.get(k).core===${core})`),true);
 run(`studyExam(${core});studyFlag();studyMove(1)`);assert.equal(run('state.academy.session.deck.length'),60);
 ({run,nodes}=setup());assert.equal(run('state.academy.session.core'),core);assert.equal(run('state.academy.session.index'),1);
 run(`for(let i=0;i<60;i++){studyJump(i);studyCommit(STUDY_BY_ID.get(state.academy.session.deck[i]).answer);}studySubmit()`);
 assert.ok(nodes.get('#app').innerHTML.includes('100%'));assert.equal(run('state.academy.results.at(-1).core'),core);
}
assert.equal(run('state.academy.done.length'),156);assert.equal(run('state.academy.earned.length'),run('STUDY_QUESTIONS.filter(q=>q.core<=6).length'));
// Multi-select set grading and practical notes are saved and validated.
assert.equal(run(`studyCorrect(STUDY_QUESTIONS.find(q=>q.kind==='multi'),[1,0])`),true);
assert.equal(run(`studyCorrect(STUDY_QUESTIONS.find(q=>q.kind==='multi'),[0,2])`),false);
run(`studyCoverage(5);studyLabSave('cert5-1.1',{elements:{notes:{value:'Compared normal and peak demand; reviewed scale-in behavior.'},complete:{checked:true}}})`);
({run,nodes}=setup());assert.equal(run(`state.academy.labs.includes('cert5-1.1')`),true);assert.ok(run(`state.academy.notes['cert5-1.1'].includes('scale-in')`));
run("studyBook('Azure')");assert.ok(nodes.get('#app').innerHTML.includes('Azure'));
console.log('PASS: six exam tracks, all 156 branches/733 exercises, unique decks, every final trial, class rewards, multi-select grading, lab notes and legacy persistence.');

// Expanding a campaign bank must not invalidate an older saved deck or revealed answer.
run("state.academy.session=null;begin(0,0);state.battle.questionOrder=[0,1,2];state.battle.questionCursor=0;ask();answer(0);save()");
({run,nodes}=setup());assert.equal(run('storageOK'),true);assert.equal(run('state.battle.questionOrder.length'),3);assert.equal(run('state.battle.question.answered'),true);run("go('battle');resolveAnswer()");assert.equal(run('state.battle.questionCursor'),1);
run(`for(let c=0;c<3;c++){const old=STUDY_QUESTIONS.filter(q=>!Array.isArray(q.answer)&&!q.id.endsWith('-applied-case-v2')&&!q.id.startsWith('detail:')&&(c===0?q.core===1&&q.domain<4:c===1?q.core===2&&q.domain===1:q.core===1&&q.domain===5||q.core===2&&q.domain>1));old.forEach((q,i)=>{if(realms[0].chapters[c][4][i+3][0]!==q.prompt)throw Error('Legacy question index changed');});}`);
console.log('PASS: older campaign decks and pending answers remain compatible after scenario expansion.');

// New detail material cannot silently count as mastered in an older completed course.
assert.equal(run('STUDY_TOPICS.filter(t=>t.core>0&&topicDepth(t.id).length===0).length'),0);
run(`state.academy.session=null;const chapter=DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1);state.academy.earned=state.academy.earned.filter(id=>!chapter.questions.some(q=>q.id===id));studyExam(studyTopic(chapter.topic).core)`);
assert.equal(run('state.academy.session'),null);
assert.equal(run('depthMastered(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1))'),false);
run('academyFilter=studyTopic(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).topic).core;selectQuestStop(CERTIFICATIONS[academyFilter].domains.length)');
assert.match(nodes.get('#app').innerHTML, /disabled onclick="studyExam/);
run(`studyConcept(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).id)`);
assert.ok(nodes.get('#app').innerHTML.includes('Worked example'));
assert.ok(nodes.get('#app').innerHTML.includes('Concept / decision map'));
({run,nodes}=setup());
assert.equal(run('state.academy.readConcepts.includes(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).id)'),true);
run(`studyConceptPractice(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).id)`);
assert.equal(run('state.academy.session.deck.every(id=>STUDY_BY_ID.get(id).concept===DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).id)'),true);
run(`studyCommit((STUDY_BY_ID.get(state.academy.session.deck[0]).answer+1)%3)`);
assert.equal(run('depthMastered(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1))'),false);
run(`state.academy.session=null;studyConceptPractice(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).id);while(!state.academy.session.submitted){const s=state.academy.session;studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);academyNext();}`);
assert.equal(run('depthMastered(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1))'),true);
assert.ok(nodes.get('#app').innerHTML.includes('Attempt content version: 3.0'));
run(`state.academy.session=null;studyExam(studyTopic(DEPTH_CHAPTERS.find(c=>studyTopic(c.topic).core===1).topic).core)`);
assert.equal(run('state.academy.session.mode'),'exam');
assert.ok(run('depthSearch("RAID").length')>0);
console.log('PASS: focused readers, concept search, saved read progress, targeted practice, wrong-answer mastery and new-content exam gates.');

// Grouping by domain must preserve a route to every existing topic and its final trial.
for (let core = 0; core <= 6; core++) {
  run(`showQuestMap(${core})`);
  const html = nodes.get('#app').innerHTML;
  const toolbar = html.match(/<nav class="academy-tools"[^>]*>([\s\S]*?)<\/nav>/)[1];
  assert.equal((toolbar.match(/<button/g) || []).length, 6);
  assert.ok(!toolbar.includes('academyFilter=1'));
  const topics = JSON.parse(run(`JSON.stringify(STUDY_TOPICS.filter(t=>t.core===${core}).map(t=>t.id))`));
  assert.ok(!html.includes('class="quest-branch"'));
  const zoneCount = run(`CERTIFICATIONS[${core}].domains?.length || 3`);
  const trees = [];
  for (let index = 0; index < zoneCount; index++) {
    run(`selectQuestStop(${index})`);
    const tree = nodes.get('#app').innerHTML;
    assert.ok(tree.includes('Back to map'));
    assert.ok(!tree.includes('class="overworld"'));
    trees.push(tree);
  }
  const branches = trees.join('');
  assert.equal((branches.match(/class="quest-branch"/g) || []).length, topics.length);
  for (const id of topics) assert.ok(branches.includes(`academyLore('${id}')`));
  if (core) {
    assert.ok(branches.includes('class="quest-specialties"'));
    run(`selectQuestStop(${zoneCount})`);
    const boss = nodes.get('#app').innerHTML;
    assert.ok(boss.includes(`onclick="studyExam(${core})"`));
    assert.ok(!boss.includes(`disabled onclick="studyExam(${core})"`));
  }
  run('showQuestMap()');
  assert.ok(nodes.get('#app').innerHTML.includes('class="overworld"'));
}
console.log('PASS: all seven maps retain every topic, and each certification route ends at its unlocked boss.');

// A domain quiz must sample its own objectives and keep its result across reloads.
run('state.academy.session=null;academyFilter=2;studyOverview(2,1)');
assert.equal(run('state.academy.session.overview'), 1);
assert.equal(run(`state.academy.session.deck.every(id=>{
  const q=STUDY_BY_ID.get(id);
  return q.core===2 && q.domain===1 && q.tier<=2 && !q.concept;
})`), true);
assert.equal(run(`new Set(state.academy.session.deck.map(id=>STUDY_BY_ID.get(id).topic)).size`), run('STUDY_TOPICS.filter(t=>t.core===2 && t.domain===1).length'));
({run,nodes}=setup());
assert.equal(run('state.academy.session.overview'), 1);
run(`while(!state.academy.session.submitted){
  const s=state.academy.session;
  studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);
  academyNext();
}`);
({run,nodes}=setup());
assert.equal(run("state.academy.overviews['2:1']"), 100);
run('academyFilter=2;selectQuestStop(0)');
assert.match(nodes.get('#app').innerHTML, /General quiz cleared/);
assert.match(nodes.get('#app').innerHTML, />1\.1\.2</);
console.log('PASS: general quiz coverage, resume, saved score, and numbered specialties.');

// Review regressions: topic context, resume and cross-certification reporting.
stored={};({run,nodes}=setup());
run("studyPractice('core1-mobile-hardware')");
// Select an actual numbered objective instead of relying on a content slug.
run("studyPractice(STUDY_TOPICS.find(t=>t.core===3).id)");
assert.equal(run('state.academy.session.core'),3);
const resumeDeck=run('JSON.stringify(state.academy.session.deck)');
run("go('home');continueQuest()");
assert.equal(run('JSON.stringify(state.academy.session.deck)'),resumeDeck);
assert.ok(nodes.get('#app').innerHTML.includes('Save & leave'));
({run,nodes}=setup());run('continueQuest()');
assert.equal(run('academyFilter'),3);
assert.equal(run('questSelections.get(3)'),0);
run('academy()');assert.ok(nodes.get('#app').innerHTML.includes(' open ontoggle='));
run("studyPractice();state.academy.session.answers=state.academy.session.deck.map(id=>STUDY_BY_ID.get(id).answer);studySubmit()");
assert.ok(nodes.get('#app').innerHTML.includes('Network+ ·'));
assert.ok(nodes.get('#app').innerHTML.includes('Security+ ·'));
run("studyBook('',3)");
assert.equal((nodes.get('#app').innerHTML.match(/>Read chapter<\/button>/g)||[]).length,12);
assert.ok(nodes.get('#app').innerHTML.includes('Page 1 of'));
assert.ok(!nodes.get('#app').innerHTML.includes('<small>A+ Core 1'));
run("studyBook('no-such-concept-xyz',3)");
assert.ok(nodes.get('#app').innerHTML.includes('No detailed chapters match'));
run("studyBook('3.1',3)");
assert.ok(!nodes.get('#app').innerHTML.includes('No detailed chapters match'));
console.log('PASS: study resume after reload, focused branch return, per-topic certification labels, mixed results, filtered and paginated manual.');

// Starter tracks are playable, isolated from old rewards, and resumable after reload.
stored={};({run,nodes}=setup());
assert.equal(run('ADVANCED_COURSE.length'),10);
assert.equal(run('STUDY_QUESTIONS.filter(q=>q.core>=7&&q.core<=8).length'),80);
run("go('home')");assert.ok(nodes.get('#app').innerHTML.includes('Advanced path · CCNA'));
assert.ok(nodes.get('#app').innerHTML.includes('Advanced path · CySA+'));
run("academyStart('safety','quest');while(!state.academy.session.submitted){const s=state.academy.session;studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);academyNext();}");
for(const core of [7,8]){
 run(`state.academy.session=null;showQuestMap(${core})`);
 const map=nodes.get('#app').innerHTML;
 assert.ok(map.includes('Starter expedition'));
 assert.ok(!map.includes('undefined')&&!map.includes('NaN'));
 assert.equal((map.match(/data-quest-stop=/g)||[]).length,core===7?7:5);
 run(`studyExam(${core})`);assert.equal(run('state.academy.session'),null);
 run(`studyPractice('core${core}');studyCommit(STUDY_BY_ID.get(state.academy.session.deck[0]).answer);academyNext()`);
 ({run,nodes}=setup());assert.equal(run('storageOK'),true);assert.equal(run('state.academy.session.core'),core);assert.equal(run('state.academy.session.index'),1);
 const count=run(`STUDY_TOPICS.filter(t=>t.core===${core}).length`);
 for(let i=0;i<count;i++){
  run(`academyStart(STUDY_TOPICS.filter(t=>t.core===${core})[${i}].id,'quest');while(!state.academy.session.submitted){const s=state.academy.session;studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);academyNext();}`);
  assert.equal(run(`state.academy.done.includes(STUDY_TOPICS.filter(t=>t.core===${core})[${i}].id)`),true);
  ({run,nodes}=setup());assert.equal(run('storageOK'),true);
 }
 assert.equal(run(`state.inventory.filter(id=>itemById(id).studyCore===${core}).length`),3);
 assert.equal(run(`state.equipment.${core===7?'potion':'shield'}`),`study-${core}-2`);
 run('heroSheet()');assert.ok(nodes.get('#app').innerHTML.includes(core===7?'Convergence Elixir':'Recovery Aegis'));
 run(`studyExam(${core})`);assert.equal(run('state.academy.session.deck.length'),core===7?48:32);
 assert.equal(run('new Set(state.academy.session.deck).size'),core===7?48:32);
 run('studyFlag();studyMove(1)');({run,nodes}=setup());assert.equal(run('state.academy.session.index'),1);
 run('for(let i=0;i<state.academy.session.deck.length;i++){studyJump(i);studyCommit(STUDY_BY_ID.get(state.academy.session.deck[i]).answer);}studySubmit()');
 assert.ok(nodes.get('#app').innerHTML.includes('100%'));
 assert.ok(nodes.get('#app').innerHTML.includes('not full exam preparation'));
 const earned=run('state.inventory.length');run('studySubmit();studyArmorRewards()');assert.equal(run('state.inventory.length'),earned);
}
assert.equal(run("state.inventory.includes('runic-sword')"),false);
assert.equal(run("state.inventory.includes('restoration-elixir')"),false);
run('begin(2,0);attack();ability(1);save()');({run,nodes}=setup());assert.equal(run('storageOK'),true);assert.equal(run('state.battle.loadout.heal'),60);assert.equal(run('state.battle.loadout.guard'),3);assert.equal(run('state.battle.used.includes(1)'),true);
console.log('PASS: CCNA and CySA+ starter maps, 80 exercises, unlocks, gear tiers, exam sizes, saved sessions, battle compatibility and reward isolation.');

// Every main map topic has a distinct practical outline and a persistent notebook.
stored={};({run,nodes}=setup());
assert.equal(run('DOMAIN_LABS.length'),68);
assert.equal(run('new Set(DOMAIN_LABS.map(l=>l.id)).size'),68);
for(let core=0;core<=14;core++){
 const domains=run(`CERTIFICATIONS[${core}].domains?.length||3`);
 for(let domain=1;domain<=domains;domain++){
  run(`showDomainLab(${core},${domain})`);
  assert.ok(nodes.get('#app').innerHTML.includes('How to know it worked'));
  assert.ok(nodes.get('#app').innerHTML.includes('Cleanup'));
  assert.ok(nodes.get('#app').innerHTML.includes('Optional harder challenge'));
  run('academy()');assert.ok(nodes.get('#app').innerHTML.includes(`showDomainLab(${core},${domain})`));
 }
 run(`studyCoverage(${core})`);assert.ok(nodes.get('#app').innerHTML.includes('Main-topic labs'));
}
run("studyPractice('core7');const labSession=JSON.stringify(state.academy.session);showDomainLab(7,1);saveDomainLab('7:1',{elements:{notes:{value:'Predicted /26 range; verified boundaries. <script>test</script>'},complete:{checked:true},step0:{checked:true},step1:{checked:false},step2:{checked:true},step3:{checked:false}}})");
assert.equal(run('JSON.stringify(state.academy.session)===labSession'),true);
({run,nodes}=setup());assert.equal(run('storageOK'),true);
assert.equal(run("state.academy.domainLabs['7:1'].complete"),true);
assert.equal(run("state.academy.domainLabs['7:1'].steps[1]"),false);
run('showDomainLab(7,1)');assert.ok(nodes.get('#app').innerHTML.includes('&lt;script&gt;test&lt;/script&gt;'));
assert.equal(run('state.academy.done.length'),0);
assert.equal(run('state.inventory.length'),0);
assert.throws(()=>run("validateDomainLabs({domainLabs:{'99:1':{notes:'',complete:false,steps:[]}}})"));
assert.throws(()=>run("validateDomainLabs({domainLabs:{'7:1':{notes:'',complete:false,steps:[true]}}})"));
console.log('PASS: 68 main-topic labs, complete map coverage, saved notes/checklists, escaped evidence and unchanged assessment progress.');

// New two-digit course IDs must survive reload, unlock their own challenge, and earn only their own gear.
for(const core of [9,10,11,12,13,14]){
 stored={};({run,nodes}=setup());
 run(`showQuestMap(${core})`);
 assert.ok(nodes.get('#app').innerHTML.includes('Expanded course'));
 assert.equal((nodes.get('#app').innerHTML.match(/data-quest-stop=/g)||[]).length,run(`CERTIFICATIONS[${core}].domains.length+1`));
 run(`state.academy.session=null;studyExam(${core})`);
 assert.equal(run('state.academy.session'),null);
 run(`studyPractice('core${core}');studyCommit(STUDY_BY_ID.get(state.academy.session.deck[0]).answer);academyNext()`);
 ({run,nodes}=setup());
 assert.equal(run('storageOK'),true);
 assert.equal(run('state.academy.session.core'),core);
 assert.equal(run('state.academy.session.index'),1);
 run("academyStart('safety','quest');while(!state.academy.session.submitted){const s=state.academy.session;studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);academyNext();}");
 for(let i=0;i<run(`STUDY_TOPICS.filter(t=>t.core===${core}).length`);i++){
  run(`academyStart(STUDY_TOPICS.filter(t=>t.core===${core})[${i}].id,'quest');while(!state.academy.session.submitted){const s=state.academy.session;studyCommit(STUDY_BY_ID.get(s.deck[s.index]).answer);academyNext();}`);
  assert.equal(run(`state.inventory.filter(id=>itemById(id).studyCore===${core}).length`),Math.min(3,i+1));
  ({run,nodes}=setup());assert.equal(run('storageOK'),true);
 }
 assert.equal(run('state.inventory.filter(id=>itemById(id).quest).length'),0);
 run(`studyExam(${core})`);
 assert.equal(run('state.academy.session.deck.length'),run(`CERTIFICATIONS[${core}].examSize`));
 assert.equal(run('new Set(state.academy.session.deck).size'),run(`CERTIFICATIONS[${core}].examSize`));
 run('for(let i=0;i<state.academy.session.deck.length;i++){studyJump(i);studyCommit(STUDY_BY_ID.get(state.academy.session.deck[i]).answer);}studySubmit()');
 assert.ok(nodes.get('#app').innerHTML.includes('100%'));
 assert.ok(nodes.get('#app').innerHTML.includes('some exam subtopics still need further study'));
 run('save()');({run,nodes}=setup());assert.equal(run('storageOK'),true);
 run(`studyBook('',${core})`);assert.ok(!nodes.get('#app').innerHTML.includes('No detailed chapters match'));
}
assert.equal(run('SPECIALIST_COURSE.length'),47);
assert.equal(run('STUDY_QUESTIONS.filter(q=>q.core>=9).length'),224);
assert.equal(run('new Set(STUDY_QUESTIONS.filter(q=>q.core>=9).map(q=>q.prompt)).size'),224);
console.log('PASS: six new course maps, 224 unique exercises, two-digit saved IDs, isolated gear milestones, gated final challenges, and manual chapters.');

stored={};({run,nodes}=setup());
run("go('skills'); openSkillCourse('powershell')");
assert.match(nodes.get('#app').innerHTML,/Your first command/);
const skillCode = nodes.get('#skill-code');
skillCode.value = "Write-Output 'Inventory online'";
skillCode.oninput();
({run,nodes}=setup());
run("openSkillCourse('powershell')");
assert.match(nodes.get('#app').innerHTML,/Write-Output &#39;Inventory online&#39;/);
const skillEditor = nodes.get('#skill-code');
skillEditor.value = skillCode.value;
nodes.get('#skill-run').onclick();
assert.match(nodes.get('#skill-feedback').innerHTML,/Inventory online/);
assert.equal(run('state.xp'),0);
skillEditor.value = "Write-Output 'wrong'";
nodes.get('#skill-check').onclick();
assert.match(nodes.get('#skill-feedback').innerHTML,/Keep debugging/);
assert.equal(run('state.xp'),0);
skillEditor.value = skillCode.value;
nodes.get('#skill-check').onclick();
nodes.get('#skill-check').onclick();
assert.equal(run('state.xp'),25);
({run,nodes}=setup());
run("openSkillCourse('powershell')");
assert.equal(run("state.skills.powershell.done[0]"),'first-command');
assert.equal(run('state.xp'),25);
assert.match(nodes.get('#app').innerHTML,/Quest cleared/);
assert.equal(run("POWERSHELL_COURSE.flatMap(lesson => lesson.cases.filter(test => { const result = runWorkshopPowerShell(lesson.solution, test); return result.error || !sameSkillValue(result.values, test.expected); })).length"),0);
assert.match(run("runWorkshopPowerShell('if (', {setup:''}).error"),/Line 1/);
assert.match(run("runWorkshopPowerShell('Start-Process calc', {setup:''}).error"),/unavailable/);
assert.match(run("runWorkshopPowerShell('Get-Content -LiteralPath C', {setup:''}).error"),/Cannot find virtual file/);
assert.equal(run("runWorkshopPowerShell(\"Set-Content -Path '/lab/file' -Value test; Test-Path '/lab/file'\", {setup:''}).values[0]"),true);
assert.equal(run("runWorkshopPowerShell(\"Test-Path '/lab/file'\", {setup:''}).values[0]"),false);
console.log('PASS: in-game PowerShell runs every lesson case, isolates virtual files, and preserves drafts and first-clear XP.');

run("go('skills')");
assert.match(nodes.get('#app').innerHTML, /Bash Essentials/);
run("openSkillCourse('bash','audit')");
nodes.get('#skill-code').value = run("BASH_COURSE.find(lesson => lesson.id === 'audit').solution");
nodes.get('#skill-check').onclick();
assert.match(nodes.get('#skill-feedback').innerHTML, /25 XP/);
assert.equal(run('state.xp'), 50);
assert.equal(run(`BASH_COURSE.flatMap(lesson => lesson.cases.filter(test => {
  const result = runWorkshopBash(lesson.solution, test);
  return result.error || !sameSkillValue(result.values, test.expected) ||
    (test.verifyFile && result.files.get(test.verifyFile) !== test.expectedFile);
})).length`), 0);
assert.match(run("runWorkshopBash('curl example.com', {}).error"), /unavailable/);
console.log('PASS: every Bash case, virtual reports, workshop navigation and XP.');
