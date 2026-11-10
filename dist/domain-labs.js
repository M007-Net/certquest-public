// Main-topic lab outlines and local, self-recorded notebook progress.
const DOMAIN_LAB_BY_ID=new Map(DOMAIN_LABS.map(lab=>[lab.id,lab]));
function validateDomainLabs(a){
 a.domainLabs??={};
 if(!a.domainLabs||typeof a.domainLabs!=='object'||Array.isArray(a.domainLabs))throw Error('Invalid lab notebook');
 for(const [id,record] of Object.entries(a.domainLabs)){
  const lab=DOMAIN_LAB_BY_ID.get(id);
  if(!lab||!record||typeof record!=='object'||typeof record.notes!=='string'||record.notes.length>4000||typeof record.complete!=='boolean'||!Array.isArray(record.steps)||record.steps.length!==lab.steps.length||record.steps.some(value=>typeof value!=='boolean'))throw Error('Invalid main-topic lab progress');
 }
}
function saveDomainLab(id,form){
 const lab=DOMAIN_LAB_BY_ID.get(id);if(!lab)return;
 const a=ensureStudy();
 const record={notes:String(form.elements.notes.value).slice(0,4000),complete:form.elements.complete.checked,steps:lab.steps.map((_,i)=>Boolean(form.elements['step'+i].checked))};
 if(!record.notes.trim()&&!record.complete&&!record.steps.some(Boolean))delete a.domainLabs[id];
 else a.domainLabs[id]=record;
 save();
}
function domainLabList(core=academyFilter){
 const a=ensureStudy(),labs=DOMAIN_LABS.filter(lab=>lab.core===core);
 return `<section class="domain-lab-list"><h2>Main-topic labs</h2><p>One practical outline per map topic. Checklists and notes save on this device. Completion is self-recorded and does not change quiz scores.</p><ul>${labs.map(lab=>`<li><button onclick="showDomainLab(${lab.core},${lab.domain})"><strong>${esc(CERTIFICATIONS[core].domains?.[lab.domain-1]||['Training camp','Workshop & crossing','Systems keep'][lab.domain-1])}</strong><span>${esc(lab.title)}</span><small>${a.domainLabs[lab.id]?.complete?'✓ Completed':a.domainLabs[lab.id]?.notes.trim()||a.domainLabs[lab.id]?.steps.some(Boolean)?'In progress':'Not started'} · ${lab.time}</small></button></li>`).join('')}</ul></section>`;
}
function showDomainLab(core,domain){
 const lab=DOMAIN_LAB_BY_ID.get(core+':'+domain);if(!lab)return;
 const a=ensureStudy(),record=a.domainLabs[lab.id]||{notes:'',steps:[],complete:false};
 academyFilter=core;questSelections.set(core,domain-1);route={view:'academy'};
 const topic=CERTIFICATIONS[core].domains?.[domain-1]||['Training camp','Workshop & crossing','Systems keep'][domain-1];
 const resource=core===5?'<a href="https://calculator.aws/" target="_blank" rel="noopener">Public AWS Pricing Calculator</a>':core===6?'<a href="https://azure.microsoft.com/pricing/calculator/" target="_blank" rel="noopener">Azure Pricing Calculator</a>':[3,7].includes(core)?'<a href="https://www.netacad.com/courses/getting-started-cisco-packet-tracer/1000" target="_blank" rel="noopener">Cisco Packet Tracer course and download</a>':'';
 app.innerHTML=`<section class="lab-reader"><button onclick="academy()">← ${esc(topic)} topic</button><p class="map-kicker">${certificationName(core)} · Practical lab · ${lab.time}</p><h1>${esc(lab.title)}</h1><p class="lab-goal">${esc(lab.goal)}</p>
 <article class="paper"><h2>What you need</h2><p>${esc(lab.setup)}</p>${resource?`<p>${resource}</p>`:''}<p>Use the setup described below. Paper and simulation work count as practice; the game does not connect to or verify your equipment.</p></article>
 <form class="lab-notebook" onsubmit="event.preventDefault();saveDomainLab('${lab.id}',this);toast('Lab notebook saved.')" onchange="saveDomainLab('${lab.id}',this)">
 <h2>Your task checklist</h2><p>Check off each step as you work. Record observations and any changes to the plan.</p><ol class="lab-steps">${lab.steps.map((step,i)=>`<li><label><input type="checkbox" name="step${i}" ${record.steps[i]?'checked':''}><span>${esc(step)}</span></label></li>`).join('')}</ol>
 <article class="paper"><h2>How to know it worked</h2><ul>${lab.checks.map(check=>`<li>${esc(check)}</li>`).join('')}</ul><h3>Evidence to keep</h3><p>Save your diagram, test results, configuration excerpts, or a short before/after explanation. Record what you actually observed and what remains untested. Use synthetic examples and omit passwords or tokens.</p><h3>Cleanup</h3><p>${esc(lab.cleanup)}</p><details><summary>Optional harder challenge</summary><p>${esc(lab.stretch)}</p></details></article>
 <label class="lab-notes-label">Your observations and results<textarea name="notes" maxlength="4000" rows="7" placeholder="Setup used, predictions, results, evidence, cleanup, and what you would try next…" oninput="saveDomainLab('${lab.id}',this.form)">${esc(record.notes)}</textarea></label>
 <label class="lab-complete"><input type="checkbox" name="complete" ${record.complete?'checked':''}> I completed this lab and reviewed the success checks.</label><p class="muted">Self-recorded progress. No automatic grading or certification credit.</p><button class="primary" type="submit">Save lab notebook</button></form><button onclick="studyCoverage(${core})">All ${certificationName(core)} labs →</button></section>`;
 window.scrollTo(0,0);save();
}
