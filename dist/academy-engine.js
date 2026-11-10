// One persisted learning engine for branches, practice, matching labs and both cores.
const DAMAGE_TYPES={physical:{label:'Hardware',color:'#e9b47a'},network:{label:'Network',color:'#7cc7f2'},software:{label:'Software',color:'#c4a1f1'},security:{label:'Security',color:'#f0a0ba'}};
const STUDY_TOPICS=[...APLUS_TOPICS.map((t,i)=>({...t,core:0,objective:'Foundation',domain:0,example:'',questions:t.cases.map((q,j)=>({id:`foundation:${i}:${j}`,prompt:q[0],options:q.slice(1,5),answer:0,explanation:q[5],tier:j+1})),sources:[]})),...[...APLUS_COURSE,...CERTIFICATION_COURSE,...CLOUD_COURSE,...ADVANCED_COURSE,...SPECIALIST_COURSE].map(t=>({...t,color:DAMAGE_TYPES[t.type].color,requires:t.requires.length?t.requires:['safety']}))];
for(const question of APPLIED_SCENARIOS){const topic=STUDY_TOPICS.find(t=>t.id===question.topic);if(!topic)throw Error('Unknown scenario topic');topic.questions.push(question);}
for(const chapter of DEPTH_CHAPTERS){const topic=STUDY_TOPICS.find(t=>t.id===chapter.topic);if(!topic)throw Error('Unknown detailed chapter topic');topic.questions.push(...chapter.questions);}
const STUDY_QUESTIONS=STUDY_TOPICS.flatMap(t=>t.questions.map(q=>({...q,topic:t.id,core:t.core,type:t.type,domain:t.domain})));
const STUDY_BY_ID=new Map(STUDY_QUESTIONS.map(q=>[q.id,q]));
let academyFilter=0,academySearch='';
function studyTopic(id){return STUDY_TOPICS.find(t=>t.id===id);}
function trainingArmorTier(s){const cleared=s.academy?.done||[];return [cleared.filter(k=>STUDY_TOPICS.some(t=>t.id===k&&t.core<=2)).length>=3,cleared.filter(k=>k.startsWith('core1-')).length>=14,APLUS_COURSE.every(t=>cleared.includes(t.id))];}
function studyRewardTiers(s,r){if(r===0)return trainingArmorTier(s);const core=r+2,all=STUDY_TOPICS.filter(t=>t.core===core),cleared=all.filter(t=>s.academy?.done?.includes(t.id)).length;return [1/3,2/3,1].map(f=>all.length>0&&cleared>=Math.ceil(all.length*f));}
function realmUnlocked(r,s=state){return s.done.includes(r+'-0')||studyRewardTiers(s,r)[0]||(r===1&&advancedItemEarned(itemById('study-7-0'),s));}
function openStudyCertification(r){showQuestMap(r===0?1:r+2);}
function studyArmorRewards(){grantAdvancedLoot();for(let r=0;r<5;r++)studyRewardTiers(state,r).forEach((earned,c)=>{if(earned)grantLoot(r,c);});}
function validateAcademy(s){
 if(!s.academy)s.academy={done:[],earned:[],session:null};const a=s.academy;
 if(!a||typeof a!=='object'||!Array.isArray(a.done)||!Array.isArray(a.earned))throw Error('Invalid academy');
 if(a.version!==2){a.earned=a.earned.map(k=>/^\d+:\d+$/.test(k)?'foundation:'+k:k);a.session=null;a.version=2;}
 if(a.done.some(k=>!studyTopic(k))||a.earned.some(k=>!STUDY_BY_ID.has(k)))throw Error('Invalid study progress');
 a.done=[...new Set(a.done)];a.earned=[...new Set(a.earned)];a.seen??=[];a.missed??=[];a.results??=[];a.mastery??={};a.readConcepts??=[];if(!Array.isArray(a.readConcepts)||a.readConcepts.some(id=>!DEPTH_CHAPTERS.some(chapter=>chapter.id===id)))throw Error('Invalid reading progress');a.labs??=[];a.notes??={};if(!Array.isArray(a.labs)||a.labs.some(k=>!studyTopic(k))||!a.notes||typeof a.notes!=='object'||Array.isArray(a.notes)||Object.entries(a.notes).some(([k,v])=>!studyTopic(k)||typeof v!=='string'||v.length>2000))throw Error('Invalid lab notes');
 for(const list of [a.seen,a.missed])if(!Array.isArray(list)||list.some(k=>!STUDY_BY_ID.has(k)))throw Error('Invalid study history');
 if(!Array.isArray(a.results)||a.results.length>20||a.results.some(r=>!r||!['exam','quest','practice'].includes(r.mode)||!Number.isInteger(r.correct)||!Number.isInteger(r.total)||r.total<1||r.correct<0||r.correct>r.total||!Object.hasOwn(CERTIFICATIONS,r.core)))throw Error('Invalid study results');
 if(!a.mastery||typeof a.mastery!=='object'||Array.isArray(a.mastery)||Object.entries(a.mastery).some(([k,v])=>!studyTopic(k)||!Number.isFinite(v)||v<0||v>100))throw Error('Invalid mastery');
 a.overviews ??= {};
 if(typeof a.overviews!=='object'||Array.isArray(a.overviews)||Object.entries(a.overviews).some(([key,score])=>{
  const [core,domain]=key.split(':').map(Number);
  return key!==core+':'+domain||!CERTIFICATIONS[core]?.domains?.[domain-1]||!Number.isInteger(score)||score<0||score>100;
 }))throw Error('Invalid overview progress');
 validateDomainLabs(a);
 const v=a.session;if(!v)return;
 if(v.topic!==null&&!studyTopic(v.topic)&&!(/^core[1-9]\d*$/.test(v.topic)&&CERTIFICATIONS[Number(v.topic.slice(4))]))throw Error('Invalid study topic');
 if(!['quest','practice','exam'].includes(v.mode)||!Array.isArray(v.deck)||!v.deck.length||v.deck.length>STUDY_QUESTIONS.length||new Set(v.deck).size!==v.deck.length||v.deck.some(k=>!STUDY_BY_ID.has(k))||!Number.isInteger(v.index)||v.index<0||v.index>=v.deck.length||!Array.isArray(v.answers)||v.answers.length!==v.deck.length||!Array.isArray(v.flags)||v.flags.some(i=>!Number.isInteger(i)||i<0||i>=v.deck.length)||typeof v.submitted!=='boolean'||!Object.hasOwn(CERTIFICATIONS,v.core)||!Number.isInteger(v.hp)||v.hp<0||v.hp>140)throw Error('Invalid study session');
 if(v.mode==='quest'&&(!studyTopic(v.topic)||!studyTopic(v.topic).requires.every(k=>a.done.includes(k))))throw Error('Invalid study branch');
 if(v.overview!==undefined&&(v.mode!=='practice'||v.topic!==null||!Number.isInteger(v.overview)||!CERTIFICATIONS[v.core]?.domains?.[v.overview-1]||v.deck.some(id=>{
  const question=STUDY_BY_ID.get(id);
  return question.core!==v.core||question.domain!==v.overview;
 })))throw Error('Invalid overview quiz');
 v.answers.forEach((answer,i)=>{const q=STUDY_BY_ID.get(v.deck[i]);if(answer===null)return;if(Array.isArray(q.answer)){if(!Array.isArray(answer)||answer.length!==q.answer.length||new Set(answer).size!==answer.length&&q.kind==='multi'||answer.some(n=>!Number.isInteger(n)||n<0||n>=q.options.length))throw Error('Invalid matching answer');}else if(!Number.isInteger(answer)||answer<0||answer>=q.options.length)throw Error('Invalid answer');});
 if(v.submitted&&v.answers.includes(null))throw Error('Incomplete submitted exam');
}
function learningBonuses(s=state){const earned=s.academy?.earned||[];const resistance={};for(const type of Object.keys(DAMAGE_TYPES))resistance[type]=Math.min(5,Math.floor(earned.filter(k=>STUDY_BY_ID.get(k)?.type===type).length/10));return {maxHp:100+Math.min(40,Math.floor(earned.length/3)),resistance};}
function ensureStudy(){validateAcademy(state);return state.academy;}
function studyMulti(form){const s=state.academy?.session;if(!s)return;const q=STUDY_BY_ID.get(s.deck[s.index]);if(q.kind!=='multi')return;const inputs=Array.from(form.querySelectorAll('input[name="pick"]:checked'));if(inputs.length!==q.answer.length)return toast(`Select ${q.answer.length} answers.`);studyCommit(inputs.map(input=>Number(input.value)));}
function studyLabSteps(t){return t.lab||[
 'Use an isolated test environment or a paper design; choose a specific requirement for '+t.title+'.',
 'Identify the components, permissions and dependencies involved. Record the expected result before changing anything.',
 'Demonstrate one successful configuration or decision, then describe a controlled failure and the evidence that distinguishes its cause.',
 'Verify the result, restore or clean up the test environment, and record the evidence plus one limitation. Do not include credentials or personal data.'
];}
function studyLabSave(topic,form){const a=ensureStudy();if(!studyTopic(topic))return;a.notes??={};a.labs??=[];a.notes[topic]=String(form.elements.notes.value).slice(0,2000);if(form.elements.complete.checked){if(!a.labs.includes(topic))a.labs.push(topic);}else a.labs=a.labs.filter(k=>k!==topic);save();toast('Lab notes saved.');}
function studyCoverage(core=academyFilter){const a=ensureStudy();route={view:'academy'};academyFilter=core;const topics=STUDY_TOPICS.filter(t=>t.core===core),completed=topics.filter(t=>a.done.includes(t.id)).length,advanced=topics.filter(t=>t.questions.some(q=>q.tier===3)).length;app.innerHTML=`<button onclick="academy()">← Academy</button><h1>${certificationName(core)} coverage & labs</h1>${CERTIFICATIONS[core].scope?`<p class="course-scope">${esc(CERTIFICATIONS[core].scope)}</p>`:''}<p>${completed}/${topics.length} branches cleared · ${advanced}/${topics.length} branches include scenario or decision exercises · ${topics.filter(t=>a.labs?.includes(t.id)).length} self-recorded labs.</p><p>Coverage means a topic is introduced and tested here. It does not prove every exam subtopic is covered or that the official exam will be passed. Lab completion is your self-report; no cloud account is connected or verified by this game.</p><label class="coverage-course-picker">Choose certification <select onchange="studyCoverage(Number(this.value))">${Object.keys(CERTIFICATIONS).map(Number).map(id=>`<option value="${id}" ${id===core?'selected':''}>${esc(certificationName(id))}</option>`).join('')}</select></label>${domainLabList(core)}<h2>Branch exercises &amp; notes</h2>${topics.map(t=>`<details class="paper"><summary>${t.objective} · ${esc(t.title)} · ${a.done.includes(t.id)?'✓ Cleared':'Study pending'}</summary><p>${topicDepth(t.id).length} focused reference chapters · ${t.questions.length} exercises · ${t.questions.filter(q=>q.tier===1).length} recall · ${t.questions.filter(q=>q.tier===2).length} matching/application · ${t.questions.filter(q=>q.tier===3).length} scenario decisions</p>${!t.questions.some(q=>q.tier===3)?'<p>Depth gap: this branch currently needs additional scenario questions. Use the source material and hands-on exercise below.</p>':''}<button onclick="academyLore('${t.id}')">Read chapter & explanations</button><button onclick="studyPractice('${t.id}')">Practice branch</button>${depthLinks(t.id)}<h3>Hands-on / design exercise</h3><ol>${studyLabSteps(t).map(step=>`<li>${esc(step)}</li>`).join('')}</ol><form onsubmit="event.preventDefault();studyLabSave('${t.id}',this)"><label>What you tested, observed and verified<textarea name="notes" maxlength="2000" rows="5">${esc(a.notes?.[t.id]||'')}</textarea></label><label><input type="checkbox" name="complete" ${a.labs?.includes(t.id)?'checked':''}> I completed this exercise and reviewed my evidence.</label><button>Save lab notes</button></form><p>${t.sources.map(source=>`<a href="${source.url}" target="_blank" rel="noopener">${esc(source.title.replace(/�/g,'—'))}</a>`).join(' · ')}</p></details>`).join('')}<h2>Before the final trial</h2><ul><li>Review low-scoring branches and the missed-question queue.</li><li>Explain the failure modes and alternatives in your own words.</li><li>Check the linked current objectives for subtopics not represented by a dedicated question here.</li><li>Complete practical work in an authorized test environment, without using production data or credentials.</li></ul>`;}
function studyShuffle(values){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function studyCorrect(q,answer){if(q.kind==='multi')return Array.isArray(answer)&&answer.length===q.answer.length&&q.answer.every(n=>answer.includes(n));return Array.isArray(q.answer)?Array.isArray(answer)&&q.answer.every((n,i)=>answer[i]===n):answer===q.answer;}
function studySources(){return `<details class="paper"><summary>Official objectives, free resources and scope</summary><p>Core course outlines were checked November 6, 2026; the six specialist starter guides were checked November 7, 2026. The coverage page shows the available exercises, scenario gaps and your lab records. Passing local trials is a learning target rather than an official scaled exam score.</p>${Object.entries(CERTIFICATIONS).filter(([id])=>Number(id)>0).map(([id,c])=>`<p><a href="${c.url}" target="_blank" rel="noopener">${c.name} · ${c.code} official guide</a></p>`).join('')}<p><a href="https://www.professormesser.com/" target="_blank" rel="noopener">Free CompTIA video courses and study groups</a> · <a href="https://learn.microsoft.com/training/azure/" target="_blank" rel="noopener">Microsoft Learn Azure training</a> · <a href="https://aws.amazon.com/training/" target="_blank" rel="noopener">AWS training resources</a></p><p>Original CertForge content is reused under MIT, alongside original cloud cases. Commercial question banks and actual exam questions have not been copied.</p></details>`;}
function renderQuestBranch(topic, progress) {
  const cleared = progress.done.includes(topic.id);
  const available = topic.requires.every(id => progress.done.includes(id));
  const chapters = topicDepth(topic.id);
  const mastered = chapters.filter(chapter => depthMastered(chapter)).length;
  const status = cleared ? '✓ Cleared' : available ? 'Available' : 'Locked';
  const missing = topic.requires.filter(id => !progress.done.includes(id));
  return `<li class="quest-branch" style="--topic:${topic.color}">
    <details class="quest-objective" name="quest-objective" data-topic="${topic.id}" ${questBranches.get(topic.core) === topic.id ? 'open' : ''} ontoggle="rememberQuestBranch(this)">
      <summary>
        <span class="quest-number">${esc(topic.objective)}</span>
        <span class="quest-objective-title">${esc(topic.title)}</span>
        <small class="quest-objective-status">${status}</small>
        <span class="quest-chevron" aria-hidden="true"></span>
      </summary>
      <div class="quest-objective-content">
      ${!available ? `<p>Requires ${missing.map(id => esc(studyTopic(id).title)).join(' and ')}.</p>` : ''}
      <div class="quest-actions">
        <button onclick="academyLore('${topic.id}')">Read lesson</button>
        <button onclick="studyPractice('${topic.id}')">Practice</button>
        ${available ? `<button class="primary" onclick="academyStart('${topic.id}','quest')">Topic challenge</button>` : ''}
      </div>
    ${chapters.length ? `<div class="quest-specialties">
      <p>${mastered}/${chapters.length} specialties mastered</p>
      <ul>${chapters.map((chapter, index) => `<li>
        <button onclick="studyConcept('${chapter.id}')">
          <span class="quest-number">${esc(topic.objective)}.${index + 1}</span>
          <span>${esc(chapter.title)}</span>
          ${depthMastered(chapter) ? '<small>✓ Mastered</small>' : ''}
        </button>
      </li>`).join('')}</ul>
    </div>` : ''}
      </div>
    </details>
  </li>`;
}

const questSelections = new Map();
const questBranches = new Map();
function rememberQuestBranch(row) {
  const topic = studyTopic(row.dataset.topic);
  if (!topic) return;
  if (row.open) questBranches.set(topic.core, topic.id);
  else if (questBranches.get(topic.core) === topic.id) questBranches.delete(topic.core);
}
function focusStudyTopic(topic) {
  if (!topic) return;
  academyFilter = topic.core;
  const foundationZones = [['safety'], ['memory','power','network','wireless','printers'], ['virtual','windows','security','operations']];
  questSelections.set(topic.core, topic.core ? topic.domain - 1 : foundationZones.findIndex(ids => ids.includes(topic.id)));
  questBranches.set(topic.core, topic.id);
}

function showQuestMap(core = academyFilter) {
  if (!Object.hasOwn(CERTIFICATIONS,core)) return;
  const previous = core === academyFilter ? questSelections.get(core) : undefined;
  academyFilter = core;
  questSelections.delete(core);
  academy();
  if (previous !== undefined) app.querySelector?.('[data-quest-stop="' + previous + '"]')?.focus({preventScroll:true});
}

async function selectQuestStop(index, landmark) {
  const core = academyFilter;
  const terrain = landmark?.closest('.overworld');
  if (terrain?.dataset.zooming) return;
  if (terrain?.animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    terrain.dataset.zooming = 'true';
    const origin = landmark.style.getPropertyValue('--x') + ' ' + landmark.style.getPropertyValue('--y');
    const zoom = terrain.animate(
      [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.65)', opacity: 0}],
      {duration: 210, easing: 'ease-in', fill: 'forwards'}
    );
    terrain.style.transformOrigin = origin;
    await zoom.finished.catch(() => {});
    if (!app.contains(terrain) || academyFilter !== core) return;
  }
  questSelections.set(core, index);
  academy();
  app.querySelector?.('.quest-focus-title')?.focus({preventScroll:true});
}

function certificationQuestMap(core, progress, topics, depth) {
  const foundationZones = [
    {title: 'Training camp', ids: ['safety']},
    {title: 'Workshop & crossing', ids: ['memory', 'power', 'network', 'wireless', 'printers']},
    {title: 'Systems keep', ids: ['virtual', 'windows', 'security', 'operations']}
  ];
  const zones = core
    ? CERTIFICATIONS[core].domains.map((title, index) => ({
      title,
      branches: topics.filter(topic => topic.domain === index + 1)
    }))
    : foundationZones.map(zone => ({
      title: zone.title,
      branches: topics.filter(topic => zone.ids.includes(topic.id))
    }));
  for (const zone of zones) {
    zone.cleared = zone.branches.filter(topic => progress.done.includes(topic.id)).length;
  }
  const next = zones.findIndex(zone => zone.cleared < zone.branches.length);
  const bossReady = next === -1 && depth.mastered === depth.total;
  const stops = core ? [...zones, {title: CERTIFICATIONS[core].starter ? 'Expedition boss' : 'Certification boss', boss: true}] : zones;
  const selected = questSelections.get(core);
  if (stops[selected]) {
    const zone = stops[selected];
    const best = progress.overviews[core + ':' + (selected + 1)];
    return `<section class="quest-map quest-focus" aria-label="${esc(zone.title)} quest tree">
      <button class="quest-back" onclick="showQuestMap()">← Back to map</button>
      ${zone.boss ? `<section class="quest-level quest-finale">
        <small>Final encounter</small><h2 class="quest-focus-title" tabindex="-1">${CERTIFICATIONS[core].starter ? 'Expedition boss' : 'Certification boss'}</h2>
        <p>${bossReady ? 'Your final trial is ready.' : 'Clear each topic challenge and master the detailed concept checks to unlock the boss.'}</p>
        <button class="primary" ${bossReady ? '' : 'disabled'} onclick="studyExam(${core})">Final ${Math.min(CERTIFICATIONS[core].examSize||60,STUDY_QUESTIONS.filter(q=>q.core===core).length)}-question ${CERTIFICATIONS[core].starter ? 'expedition trial' : 'trial'}</button>
      </section>` : `<section class="quest-level">
        <div class="quest-zone-heading">
          <small>Level ${selected + 1} · General topic</small><h2 class="quest-focus-title" tabindex="-1">${esc(zone.title)}</h2>
          ${core ? `<p>${best >= 80 ? '✓ General quiz cleared · Best ' + best + '%' : best !== undefined ? 'Best ' + best + '% · Target 80%' : 'Start with the general quiz, then explore the branches.'}</p>
          <button class="${best >= 80 ? '' : 'primary'}" onclick="studyOverview(${core},${selected + 1})">${best === undefined ? 'Start general quiz' : 'Retry general quiz'}</button>` : ''}
        </div>
        <div class="quest-lab-link"><button onclick="showDomainLab(${core},${selected+1})">Open practical lab →</button><small>${progress.domainLabs[core+':'+(selected+1)]?.complete?'✓ Lab completed':'Checklist, setup and success checks'}</small></div>
        <ul class="quest-branches" aria-label="${esc(zone.title)} subtopics">
          ${zone.branches.map(topic => renderQuestBranch(topic, progress)).join('')}
        </ul>
      </section>`}
    </section>`;
  }
  const rows = Math.ceil(stops.length / 3);
  const height = rows * 190;
  const positions = stops.map((_, index) => ({
    x: Math.floor(index / 3) % 2 ? 750 - (index % 3) * 300 : 150 + (index % 3) * 300,
    y: 92 + Math.floor(index / 3) * 190
  }));
  const trail = positions.map(({x, y}) => x + ',' + y).join(' ');
  return `<section class="quest-map" aria-label="${certificationName(core)} quest map">
    <div class="overworld" style="--map-rows:${rows}">
      <svg class="overworld-terrain" viewBox="0 0 900 ${height}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="overworld-grass" width="84" height="62" patternUnits="userSpaceOnUse">
            <path d="M7 35l3-5 3 5m43-20 2-4 2 4m13 38 3-4 2 4" fill="none" stroke="#86a764" stroke-width="2" opacity=".5"/>
            <path d="M24 49h6m36-23h7" stroke="#19382e" stroke-width="3" opacity=".5"/>
          </pattern>
          <g id="overworld-tree">
            <ellipse cx="1" cy="4" rx="16" ry="10" fill="#142f26" opacity=".65"/>
            <circle r="12" fill="#203b2d"/>
            <circle cx="-3" cy="-4" r="9" fill="#47684a"/>
            <circle cx="-6" cy="-7" r="4" fill="#6a8657"/>
          </g>
        </defs>
        <rect width="900" height="${height}" fill="#355742"/>
        <rect width="900" height="${height}" fill="url(#overworld-grass)"/>
        <path d="M-28 -30Q-4 90 38 142T40 290Q31 350 118 416" fill="none" stroke="#284a45" stroke-width="70"/>
        <path d="M-28 -30Q-4 90 38 142T40 290Q31 350 118 416" fill="none" stroke="#37666b" stroke-width="49"/>
        <path d="M-28 -30Q-4 90 38 142T40 290Q31 350 118 416" fill="none" stroke="#558283" stroke-width="2" stroke-dasharray="19 16"/>
        ${[[74,38],[96,27],[230,156],[257,145],[285,162],[345,31],[369,20],[532,154],[558,146],[588,163],[625,42],[648,31],[843,29],[868,48],[856,165],[819,211],[847,222],[591,337],[619,352],[646,337],[343,239],[320,221],[295,239],[83,339],[110,353]].map(([x,y]) => `<use href="#overworld-tree" x="${x}" y="${y}"/>`).join('')}
        <polyline points="${trail}" fill="none" stroke="#233d30" stroke-width="28" stroke-linejoin="round" stroke-linecap="round"/>
        <polyline points="${trail}" fill="none" stroke="#9b8656" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/>
        <polyline points="${trail}" fill="none" stroke="#d1b77d" stroke-width="2" stroke-dasharray="7 8"/>
      </svg>
      ${stops.map((stop, index) => {
        const {x, y} = positions[index];
        const status = stop.boss ? (bossReady ? 'Ready' : 'Locked') : stop.cleared + '/' + stop.branches.length + ' cleared';
        const icon = stop.boss ? '◆' : stop.cleared === stop.branches.length ? '✓' : index + 1;
        return `<button class="map-stop${stop.boss ? ' map-boss' : ''}${index === next ? ' map-next' : ''}" style="--x:${x / 9}%;--y:${y / height * 100}%"
          data-quest-stop="${index}" onclick="selectQuestStop(${index},this)">
          <span class="map-token" aria-hidden="true">${icon}</span>
          <span class="map-label"><strong>${esc(stop.title)}</strong><small>${status}</small></span>
        </button>`;
      }).join('')}
    </div>
  </section>`;

}

function academy() {
  const progress = ensureStudy();
  route = {view:'academy'};
  const bonus = learningBonuses();
  const core = academyFilter;
  const cert = CERTIFICATIONS[core];
  const topics = STUDY_TOPICS.filter(topic => topic.core === core);
  const depth = depthTrackProgress(core);
  const cleared = topics.filter(topic => progress.done.includes(topic.id)).length;
  const otherCore = core === 1 ? 2 : 1;
  app.innerHTML = `<div class="academy-map-header">
      <button onclick="go('home')">← Camp</button>
      <div><p class="map-kicker">Certification academy</p><h1>${cert.name}</h1></div>
      <span class="map-progress">${cleared}/${topics.length} challenges cleared</span>
    </div>
    <nav class="academy-tools" aria-label="Study tools">
      <button aria-current="${core === 0 ? 'page' : 'false'}" onclick="showQuestMap(0)">Foundations</button>
      <button onclick="studyBook()">Field manual</button>
      <button onclick="studyCoverage()">Coverage &amp; labs</button>
      <button onclick="studyPractice()">All-topic practice</button>
      <button onclick="studyPractice(null,true)">Review${progress.missed.length ? ' (' + progress.missed.length + ')' : ''}</button>
      <button class="primary" ${progress.session ? '' : 'disabled'} onclick="academyTrial()">Resume</button>
    </nav>
    ${questSelections.has(core) ? '' : `<div class="map-caption">
      <p>Select a landmark to explore its quests.${core && !progress.done.includes('safety') ? ' Clear Safe troubleshooting in Foundations to unlock topic challenges.' : ''}</p>
      ${core === 1 || core === 2 ? `<button onclick="showQuestMap(${otherCore})">Visit ${certificationName(otherCore)} →</button>` : ''}
    </div>`}
    ${cert.scope ? `<p class="course-scope">${esc(cert.scope)}</p><p class="muted">${STUDY_QUESTIONS.filter(q=>q.core===core).length} exercises · ${depth.total} detailed chapters · ${ITEMS.filter(i=>i.studyCore===core&&progress.done.length&&advancedItemEarned(i,state)).length}/3 expedition items earned</p>` : ''}
    ${cert.parent ? `<button onclick="showQuestMap(${cert.parent})">← ${certificationName(cert.parent)}</button>` : ''}
    ${Object.entries(CERTIFICATIONS).filter(([,c])=>c.parent===core).map(([id,c])=>`<button onclick="showQuestMap(${id})">Study path · ${c.name} →</button>`).join('')}
    ${certificationQuestMap(core, progress, topics, depth)}
    <details class="paper"><summary>Adventure progress &amp; results</summary>
      <p>♥ ${bonus.maxHp} base health · ${Object.entries(bonus.resistance).map(([key, value]) => DAMAGE_TYPES[key].label + ' resistance ' + value).join(' · ')}</p>
      <p>${depth.mastered}/${depth.total} concept checks mastered · ${progress.earned.length}/${STUDY_QUESTIONS.length} unique correct exercises</p>
      ${core ? `<button onclick="studyPractice('core${core}')">Practice this certification</button>` : ''}
      ${progress.results.slice().reverse().map(result => `<p>${esc(result.label || result.mode)} · ${result.correct}/${result.total} · ${Math.round(result.correct/result.total*100)}%</p>`).join('') || '<p>No completed sessions yet.</p>'}
    </details>${studySources()}`;
  window.scrollTo(0, 0);
  save();
}
function studyConstruct(t,size=90){const seed=STUDY_TOPICS.indexOf(t),eyes=seed%3,head=seed%2;return `<svg class="training-enemy" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${t.title} workshop guardian" style="--topic:${t.color}"><path d="M50 12V5M40 5h20M20 65L8 80M80 65l12 15M35 83v12m30-12v12" fill="none" stroke="currentColor" stroke-width="5"/><rect x="20" y="20" width="60" height="62" rx="${head?25:8}" fill="#24392f" stroke="currentColor" stroke-width="4"/><path d="M30 60h40M35 71h30" stroke="currentColor" stroke-width="4"/>${eyes===0?'<circle cx="38" cy="40" r="5" fill="currentColor"/><circle cx="62" cy="40" r="5" fill="currentColor"/>':eyes===1?'<path d="M30 40h40" stroke="currentColor" stroke-width="7"/>':'<circle cx="50" cy="40" r="10" fill="none" stroke="currentColor" stroke-width="4"/>'}<text x="50" y="77" text-anchor="middle" fill="currentColor" font-size="12">${seed+1}</text></svg>`;}
function academyNotes(t){const body=t.lore.split(/\n\n/);return `${body.map(p=>`<details class="lore-section" open><summary>${esc(p.split('\n')[0].slice(0,100))}</summary><p>${esc(p).replace(/\n/g,'<br>')}</p></details>`).join('')}<ol class="flow" aria-label="Study reasoning diagram">${(t.flow||['Read the requirement','Identify the component or layer','Compare evidence and alternatives','Test safely and verify']).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${t.example?`<article><h3>Worked case</h3><p>${esc(t.example)}</p></article>`:''}<details><summary>Explore the explanations</summary>${t.questions.map(q=>`<p><strong>${esc(q.prompt)}</strong><br>${esc(q.explanation)}</p>`).join('')}</details><p>${t.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener">${esc(s.title.replace(/�/g,'—'))}</a>`).join(' · ')}</p>`;}
function academyLore(key){const t=typeof key==='number'?STUDY_TOPICS[key]:studyTopic(key);if(!t)return;focusStudyTopic(t);route={view:'academy'};window.scrollTo(0,0);app.innerHTML=`<button onclick="academy()">← Skill tree</button><div class="eyebrow">${t.core?certificationName(t.core)+' · '+t.objective:'Foundation'}</div><h1>${t.title}</h1><article class="paper">${academyNotes(t)}</article>${depthLinks(t.id)}<button onclick="studyPractice('${t.id}')">Practice this topic</button><button onclick="studyCoverage(${t.core})">Coverage & hands-on work</button>`;}
function studyBook(search=academySearch){academySearch=String(search).slice(0,120);route={view:'academy'};const shown=STUDY_TOPICS.filter(t=>(certificationName(t.core)+' '+t.title+' '+t.lore+' '+t.objective).toLowerCase().includes(academySearch.toLowerCase()));app.innerHTML=`<button onclick="academy()">← Skill tree</button><h1>Certification field manual</h1><p>Search every certification by symptom, tool, concept or objective number.</p><form onsubmit="event.preventDefault();studyBook(this.elements.search.value)"><input name="search" aria-label="Search manual" value="${esc(academySearch)}" maxlength="120"><button>Search</button></form><p>${shown.length} chapters</p>${shown.map(t=>`<details class="paper"><summary>${t.core?certificationName(t.core)+' · '+t.objective+' · ':''}${t.title}</summary>${academyNotes(t)}<button onclick="studyPractice('${t.id}')">Practice</button></details>`).join('')}${studySources()}`;}
function studyNewSession(mode,questions,topic=null,core=0,overview=undefined){const a=ensureStudy();if(!questions.length)return toast('No matching questions.');if(a.session&&!a.session.submitted&&!window.confirm('Replace the saved learning session? Earned bonuses are kept.'))return;const deck=mode==='quest'?[...questions].sort((a,b)=>a.tier-b.tier):studyShuffle(questions);a.session={mode,topic,core,overview,contentRevision:'3.0',deck:deck.map(q=>q.id),answers:deck.map(()=>null),index:0,flags:[],submitted:false,hp:learningBonuses().maxHp};academyTrial();}
function academyStart(key,mode){const t=typeof key==='number'?STUDY_TOPICS[key]:studyTopic(key);if(!t)return;if(mode==='practice')return studyPractice(t.id);const a=ensureStudy();if(mode!=='quest'||!t.requires.every(k=>a.done.includes(k)))return;studyNewSession('quest',t.questions,t.id,t.core);}
function studyOverview(core, domain) {
  if (!Number.isInteger(core) || !Number.isInteger(domain) || !CERTIFICATIONS[core]?.domains?.[domain - 1]) return;
  const topics = STUDY_TOPICS.filter(topic => topic.core === core && topic.domain === domain);
  const pools = topics.map(topic => studyShuffle(STUDY_QUESTIONS.filter(question =>
    question.topic === topic.id && question.tier <= 2 && !question.concept && !Array.isArray(question.answer)
  )));
  const deck = pools.flatMap(pool => pool.slice(0, 1));
  const remaining = studyShuffle(pools.flatMap(pool => pool.slice(1)));
  deck.push(...remaining.slice(0, Math.max(0, 5 - deck.length)));
  studyNewSession('practice', deck, null, core, domain);
}
function studyPractice(key=null,missed=false){const a=ensureStudy();let questions=STUDY_QUESTIONS.filter(q=>(!key||key==='core'+q.core||q.topic===key)&&(!missed||a.missed.includes(q.id)));studyNewSession('practice',questions,key,studyTopic(key)?.core ?? (key&&/^core[1-9]\d*$/.test(key)?Number(key.slice(4)):0));}
function studyExam(core){const a=ensureStudy();if(!Number.isInteger(core)||core<1||!CERTIFICATIONS[core]||(!STUDY_TOPICS.filter(t=>t.core===core).every(t=>a.done.includes(t.id))||depthTrackProgress(core).mastered<depthTrackProgress(core).total))return toast('Clear every branch and its detailed concept checks in this certification first.');const weights=CERTIFICATIONS[core].weights,size=CERTIFICATIONS[core].examSize||60;let selected=[];weights.forEach((weight,i)=>{const pool=STUDY_QUESTIONS.filter(q=>q.core===core&&q.domain===i+1);selected.push(...studyShuffle(pool).slice(0,Math.round(weight*size/100)));});const rest=studyShuffle(STUDY_QUESTIONS.filter(q=>q.core===core&&!selected.some(x=>x.id===q.id)));selected=[...selected,...rest].slice(0,size);studyNewSession('exam',selected,null,core);}
function studyAnimation(kind){if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.querySelector('.training-enemy,.arena')?.animate?.(kind==='heal'?[{filter:'brightness(1)'},{filter:'brightness(1.8) hue-rotate(30deg)'},{filter:'brightness(1)'}]:[{transform:'translateX(0)'},{transform:`translateX(${kind==='spell'?'-12':'8'}px)`,filter:'brightness(1.7)'},{transform:'translateX(0)',filter:'brightness(1)'}],{duration:280});}
function academyTrial(){const a=ensureStudy(),s=a.session;if(!s)return academy();route={view:'academy'};if(s.topic && studyTopic(s.topic))focusStudyTopic(studyTopic(s.topic));if(s.overview){academyFilter=s.core;questSelections.set(s.core,s.overview-1);}if(s.submitted)return studyResults();const q=STUDY_BY_ID.get(s.deck[s.index]),t=studyTopic(q.topic),answer=s.answers[s.index],answered=answer!==null,show=answered&&s.mode!=='exam';const resistance=learningBonuses().resistance[t.type],damage=8+q.tier*4;app.innerHTML=`<section class="training" style="--topic:${t.color}"><div class="study-top"><button onclick="academy()">← Save & leave</button><strong>${s.mode==='exam'?certificationName(s.core)+' trial':s.overview?'General quiz':s.mode==='practice'?'Practice':'Assessment boss'}</strong><span>${s.index+1}/${s.deck.length}</span></div><div class="study-guardian">${studyConstruct(t,65)}<div><span style="color:${t.color}">${DAMAGE_TYPES[t.type].label} attack · ${damage} damage · resistance ${resistance}</span><p class="health">♥ ${s.hp}/${learningBonuses().maxHp} HP</p><small>${['','Recall','Match / apply','Scenario decision'][q.tier]} · ${certificationName(t.core)}</small></div></div><h2>${esc(t.title)}</h2><h3 class="study-prompt">${esc(q.prompt).replace(/\n/g,'<br>')}</h3>${q.kind==='multi'?`<form onsubmit="event.preventDefault();studyMulti(this)"><p>Select ${q.answer.length} answers.</p>${q.options.map((opt,i)=>`<label class="multi-choice"><input type="checkbox" name="pick" value="${i}" ${answered?'disabled':''} ${Array.isArray(answer)&&answer.includes(i)?'checked':''}> ${esc(opt)}</label>`).join('')}<button ${answered?'disabled':''}>Commit selection</button></form>`:Array.isArray(q.answer)?`<form onsubmit="event.preventDefault();academyMatch(this)"><div class="matching">${q.left.map((left,i)=>`<label>${esc(left)}<select name="m${i}" ${answered?'disabled':''} required><option value="">Choose a purpose…</option>${q.options.map((option,j)=>`<option value="${j}" ${Array.isArray(answer)&&answer[i]===j?'selected':''}>${esc(option)}</option>`).join('')}</select></label>`).join('')}</div><button ${answered?'disabled':''}>Commit matches</button></form>`:`<div class="answers">${studyOptions(q).map(i=>`<button ${answered?'disabled':''} aria-pressed="${answer===i}" onclick="academyAnswer(${i})">${esc(q.options[i])}</button>`).join('')}</div>`}<div class="training-feedback" aria-live="polite">${show?`<strong>${studyCorrect(q,answer)?'✓ Correct':'Review this decision'}</strong><p>${esc(q.explanation).replace(/\n/g,'<br>')}</p>`:`<p>${s.mode==='exam'?'Answers can be changed before submission. Explanations appear in the result review.':'Choose an answer to reveal the explanation. Each question appears once in this session.'}</p>`}<div class="actions">${s.mode==='exam'?`<button onclick="studyMove(-1)" ${s.index===0?'disabled':''}>Previous</button><button onclick="studyClear()">Change answer</button><button onclick="studyFlag()">${s.flags.includes(s.index)?'★ Flagged':'Flag for review'}</button><button onclick="studyMove(1)" ${s.index===s.deck.length-1?'disabled':''}>Next</button><button onclick="studySubmit()" ${s.answers.includes(null)?'disabled':''}>Submit trial</button>`:`<button class="primary" onclick="academyNext()" ${answered?'':'disabled'}>${s.index===s.deck.length-1?'Finish session':'Next question →'}</button>`}</div>${s.mode==='exam'?`<details><summary>Question navigator · ${s.answers.filter(x=>x!==null).length} answered</summary>${s.deck.map((_,i)=>`<button onclick="studyJump(${i})">${i+1}${s.answers[i]!==null?' ✓':''}${s.flags.includes(i)?' ★':''}</button>`).join('')}</details>`:''}</div></section>`;save();}
function studyOptions(q){const shift=[...q.id].reduce((n,c)=>n+c.charCodeAt(0),0)%q.options.length;return q.options.map((_,i)=>(i+shift)%q.options.length);}
function academyMatch(form){const s=state.academy?.session;if(!s)return;const q=STUDY_BY_ID.get(s.deck[s.index]);if(!Array.isArray(q.answer))return;const values=q.left.map((_,i)=>form.elements['m'+i].value);if(values.some(v=>v===''))return;studyCommit(values.map(Number));}
function academyAnswer(n){const s=state.academy?.session;if(!s)return;const q=STUDY_BY_ID.get(s.deck[s.index]);if(Array.isArray(q.answer)||!Number.isInteger(n)||n<0||n>=q.options.length)return;studyCommit(n);}
function studyCommit(answer){const a=ensureStudy(),s=a.session;if(!s||s.submitted||s.answers[s.index]!==null)return;const q=STUDY_BY_ID.get(s.deck[s.index]);s.answers[s.index]=answer;if(s.mode!=='exam'){if(!a.seen.includes(q.id))a.seen.push(q.id);if(studyCorrect(q,answer)){if(!a.earned.includes(q.id))a.earned.push(q.id);a.missed=a.missed.filter(k=>k!==q.id);}else{if(!a.missed.includes(q.id))a.missed.push(q.id);if(s.mode==='quest')s.hp=Math.max(0,s.hp-Math.max(1,8+q.tier*4-learningBonuses().resistance[q.type]));}}academyTrial();studyAnimation(studyCorrect(q,answer)?'spell':'attack');}
function academyNext(){const s=state.academy?.session;if(!s||s.submitted||s.answers[s.index]===null)return;if(s.index<s.deck.length-1){s.index++;return academyTrial();}studySubmit();}
function studyMove(delta){const s=state.academy?.session;if(!s||s.mode!=='exam'||![-1,1].includes(delta))return;studyJump(s.index+delta);}
function studyJump(index){const s=state.academy?.session;if(!s||s.mode!=='exam'||s.submitted||!Number.isInteger(index)||index<0||index>=s.deck.length)return;s.index=index;academyTrial();}
function studyClear(){const s=state.academy?.session;if(!s||s.mode!=='exam'||s.submitted)return;s.answers[s.index]=null;academyTrial();}
function studyFlag(){const s=state.academy?.session;if(!s||s.mode!=='exam'||s.submitted)return;s.flags=s.flags.includes(s.index)?s.flags.filter(i=>i!==s.index):[...s.flags,s.index];academyTrial();}
function studySubmit(){const a=ensureStudy(),s=a.session;if(!s||s.submitted||s.answers.includes(null))return;const correct=s.deck.reduce((n,k,i)=>n+Number(studyCorrect(STUDY_BY_ID.get(k),s.answers[i])),0),percent=Math.round(correct/s.deck.length*100);s.submitted=true;if(s.overview){const key=s.core+':'+s.overview;a.overviews[key]=Math.max(a.overviews[key]??0,Math.floor(correct/s.deck.length*100));}if(s.mode==='quest'){a.mastery[s.topic]=Math.max(a.mastery[s.topic]||0,percent);const applied=s.deck.map((k,i)=>({q:STUDY_BY_ID.get(k),answer:s.answers[i]})).filter(x=>x.q.tier===3);const appliedPassed=!applied.length||applied.filter(x=>studyCorrect(x.q,x.answer)).length/applied.length>=0.5;if(correct/s.deck.length>=0.8&&appliedPassed&&s.hp>0&&!a.done.includes(s.topic))a.done.push(s.topic);}if(s.mode==='exam')s.deck.forEach((k,i)=>{if(!studyCorrect(STUDY_BY_ID.get(k),s.answers[i])&&!a.missed.includes(k))a.missed.push(k);});studyArmorRewards();a.results.push({mode:s.mode,core:s.core,correct,total:s.deck.length,label:s.overview?CERTIFICATIONS[s.core].domains[s.overview-1]+' general quiz':s.mode==='exam'?certificationName(s.core)+' trial':studyTopic(s.topic)?.title||'Practice'});a.results=a.results.slice(-20);save();studyResults();}
function studyResults(){const a=ensureStudy(),s=a.session;if(!s?.submitted)return;route={view:'academy'};const correct=s.deck.reduce((n,k,i)=>n+Number(studyCorrect(STUDY_BY_ID.get(k),s.answers[i])),0);const domains={};s.deck.forEach((k,i)=>{const q=STUDY_BY_ID.get(k),d=domains[q.core+':'+q.domain]??={n:0,correct:0,core:q.core,domain:q.domain};d.n++;d.correct+=Number(studyCorrect(q,s.answers[i]));});app.innerHTML=`<button onclick="academy()">← Skill tree</button><h1>${Math.round(correct/s.deck.length*100)}% · ${correct}/${s.deck.length}</h1><p>${s.mode==='quest'?(a.done.includes(s.topic)?'Branch cleared. The next node is open.':'Review missed concepts and retry. Target: 80%, at least half of scenario decisions correct, and health remaining.'):s.overview?(correct/s.deck.length>=0.8?'General quiz cleared. Return to the map to explore its numbered branches.':'Review your answers and retry. Target: 80%.'):'Session complete. Review the explanations and use missed-question practice.'}</p>${s.overview?`<button onclick="studyOverview(${s.core},${s.overview})">Retry general quiz</button>`:`<button onclick="studyPractice(${s.topic?"'"+s.topic+"'":s.core?"'core"+s.core+"'":'null'})">Practice again</button>`}<button onclick="studyPractice(null,true)">Review missed questions</button><h2>By domain</h2>${Object.entries(domains).map(([d,v])=>`<p>${certificationName(v.core)+' · '+(CERTIFICATIONS[v.core]?.domains?.[v.domain-1]||'Foundations')}: ${v.correct}/${v.n}</p>`).join('')}<p>Attempt content version: ${esc(s.contentRevision||'Earlier course')}</p><h2>Answer review</h2>${s.deck.map((k,i)=>{const q=STUDY_BY_ID.get(k);return `<details class="paper"><summary>${i+1}. ${studyCorrect(q,s.answers[i])?'✓':'Review'} ${esc(q.prompt)}</summary><p>Your answer: ${esc(Array.isArray(s.answers[i])?s.answers[i].map((n,j)=>(q.left?.[j]?q.left[j]+' → ':'')+q.options[n]).join('; '):q.options[s.answers[i]])}</p><p>${esc(q.explanation).replace(/\n/g,'<br>')}</p><button onclick="academyLore('${q.topic}')">Read this topic</button>${q.concept?`<button onclick="studyConcept('${q.concept}')">Explore the worked explanation</button>`:''}</details>`;}).join('')}${CERTIFICATIONS[s.core]?.scope?`<p class="course-scope">${esc(CERTIFICATIONS[s.core].scope)}</p>`:''}<p>This is a local practice result. Use the coverage tracker to review remaining study and hands-on tasks.</p>`;}
