// Detailed reference chapters are additive: old branch IDs and saved question keys stay stable.
const DEPTH_BY_ID=new Map(DEPTH_CHAPTERS.map(chapter=>[chapter.id,chapter]));
function topicDepth(topic){return DEPTH_CHAPTERS.filter(chapter=>chapter.topic===topic||chapter.related?.includes(topic));}
function depthMastered(chapter,s=state){return chapter.questions.filter(q=>s.academy?.earned.includes(q.id)).length/chapter.questions.length>=0.8;}
function depthTrackProgress(core,s=state){const chapters=DEPTH_CHAPTERS.filter(chapter=>studyTopic(chapter.topic).core===core);return {total:chapters.length,mastered:chapters.filter(chapter=>depthMastered(chapter,s)).length,read:chapters.filter(chapter=>s.academy?.readConcepts?.includes(chapter.id)).length};}
function depthRead(id){if(!DEPTH_BY_ID.has(id))return;ensureStudy();state.academy.readConcepts??=[];if(!state.academy.readConcepts.includes(id))state.academy.readConcepts.push(id);save();}
function depthLinks(topic){const chapters=topicDepth(topic);return chapters.length?`<section class="depth-index"><h2>Explore the details</h2><p>${chapters.length} focused chapters. Open a concept for its explanation, distinctions, worked example, diagram and practice. Concept checks require 80% of its unique questions correct.</p><div class="concept-buttons">${chapters.map(chapter=>`<button onclick="studyConcept('${chapter.id}')">${depthMastered(chapter)?'✓ ':''}${esc(chapter.title)} →</button>`).join('')}</div></section>`:'<p>Use the objective reference and practical task to identify the next details to study.</p>';}
function studyConcept(id){const chapter=DEPTH_BY_ID.get(id);if(!chapter)return;const topic=studyTopic(chapter.topic);focusStudyTopic(topic);route={view:'academy'};depthRead(id);app.innerHTML=`<section class="concept-reader"><button onclick="academyLore('${topic.id}')">← ${esc(topic.title)}</button><div class="eyebrow">${certificationName(topic.core)} · ${topic.objective}</div><h1>${esc(chapter.title)}</h1><p class="concept-intro">Read the mechanism, compare similar ideas, then apply it to a support decision.</p><article class="paper"><h2>How it works</h2>${chapter.explanation.split(/\n\n/).map(text=>`<p>${esc(text)}</p>`).join('')}<h3>Keep these distinctions clear</h3><ul>${chapter.distinctions.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>${chapter.reference?.length?`<div class="reference-scroll"><table><thead><tr><th>Term or mechanism</th><th>Meaning and boundary</th></tr></thead><tbody>${chapter.reference.map(row=>`<tr><th>${esc(row.term)}</th><td>${esc(row.meaning)}</td></tr>`).join('')}</tbody></table></div>`:''}<h3>Concept / decision map</h3><ul class="concept-map" aria-label="${esc(chapter.title)} relationship map">${chapter.diagram.map(node=>`<li>${esc(typeof node==='string'?node:node.label)}</li>`).join('')}</ul><h3>Worked example</h3><p><strong>Situation:</strong> ${esc(chapter.example.situation)}</p><p><strong>Reasoning:</strong> ${esc(chapter.example.reasoning)}</p><p><strong>Decision:</strong> ${esc(chapter.example.result)}</p></article><button class="primary" onclick="studyConceptPractice('${id}')">Apply this concept · ${chapter.questions.length} questions</button><article class="paper"><h2>Practical exercise</h2><ol>${chapter.lab.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><p>Keep evidence and notes in the parent branch’s lab record.</p><button onclick="studyCoverage(${topic.core})">Open lab notebook</button><h3>Primary references</h3>${chapter.sources.map(source=>`<p><a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)}</a></p>`).join('')}</article></section>`;window.scrollTo(0,0);}
function studyConceptPractice(id){const chapter=DEPTH_BY_ID.get(id);if(!chapter)return;studyNewSession('practice',STUDY_QUESTIONS.filter(question=>question.concept===id),chapter.topic,studyTopic(chapter.topic).core);}
function depthSearch(query,core=null){const term=String(query).toLowerCase();return DEPTH_CHAPTERS.filter(chapter=>(core===null||studyTopic(chapter.topic).core===core)&&(chapter.title+' '+chapter.explanation+' '+(chapter.reference||[]).map(row=>row.term+' '+row.meaning).join(' ')).toLowerCase().includes(term));}
let manualCore = null;
function studyBook(search=academySearch, core=manualCore, page=0) {
  academySearch=String(search).slice(0,120);
  manualCore=core===null || core==='all' ? null : Number(core);
  if (manualCore!==null && !Object.hasOwn(CERTIFICATIONS,manualCore)) manualCore=null;
  route={view:'academy'};
  const term=academySearch.trim().toLowerCase();
  const chapters=DEPTH_CHAPTERS.filter(chapter=>{
    const topic=studyTopic(chapter.topic);
    return (manualCore===null || topic.core===manualCore) &&
      (certificationName(topic.core)+' '+topic.objective+' '+chapter.title+' '+chapter.explanation+' '+(chapter.reference||[]).map(row=>row.term+' '+row.meaning).join(' ')).toLowerCase().includes(term);
  });
  const topics=STUDY_TOPICS.filter(topic=>(manualCore===null || topic.core===manualCore) &&
    (certificationName(topic.core)+' '+topic.title+' '+topic.lore+' '+topic.objective).toLowerCase().includes(term));
  const pages=Math.max(1,Math.ceil(chapters.length/12));
  page=Math.max(0,Math.min(pages-1,Number.isInteger(page)?page:0));
  const navigation=`<nav class="manual-pagination" aria-label="Chapter pages"><button onclick="studyBook(academySearch,manualCore,${page-1})" ${page===0?'disabled':''}>← Previous</button><span>Page ${page+1} of ${pages}</span><button onclick="studyBook(academySearch,manualCore,${page+1})" ${page===pages-1?'disabled':''}>Next →</button></nav>`;
  app.innerHTML=`<button onclick="academy()">← Academy</button><h1>Certification field manual</h1>
    <p>Find a concept, symptom, tool or objective. Choose a certification to narrow your search.</p>
    <form class="manual-search" onsubmit="event.preventDefault();studyBook(this.elements.search.value,this.elements.core.value)">
      <label>Search the manual<input name="search" value="${esc(academySearch)}" maxlength="120" placeholder="e.g. encryption, RAID, 1.1"></label>
      <label>Certification<select name="core"> <option value="all" ${manualCore===null?'selected':''}>All certifications</option>${Object.entries(CERTIFICATIONS).map(([id,cert])=>`<option value="${id}" ${Number(id)===manualCore?'selected':''}>${esc(cert.name)}</option>`).join('')}</select></label>
      <button class="primary">Search</button>
    </form>
    <h2>${chapters.length} detailed chapters</h2>
    ${chapters.length?navigation:'<p>No detailed chapters match. Try a broader term or choose All certifications.</p>'}
    <div class="manual-results">${chapters.slice(page*12,(page+1)*12).map(chapter=>`<article><small>${certificationName(studyTopic(chapter.topic).core)} · ${studyTopic(chapter.topic).objective}</small><h3>${esc(chapter.title)}</h3><p>${esc(chapter.explanation.slice(0,190))}…</p><button onclick="studyConcept('${chapter.id}')">Read chapter</button></article>`).join('')}</div>
    ${chapters.length>12?navigation:''}
    <details class="paper"><summary>${topics.length} matching branch summaries</summary><div class="manual-results">${topics.map(topic=>`<article><small>${certificationName(topic.core)} · ${topic.objective}</small><h3>${esc(topic.title)}</h3><p>${topicDepth(topic.id).length} detailed chapters · ${topic.questions.length} exercises</p><button onclick="academyLore('${topic.id}')">Open branch</button></article>`).join('')}</div></details>${studySources()}`;
  window.scrollTo(0,0);
}
