const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..'),context={};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/depth-data.js'),'utf8')+';this.chapters=DEPTH_CHAPTERS;',context);
const authored=fs.readdirSync(path.join(root,'content')).filter(f=>f.endsWith('-depth.json')).sort().flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'content',f),'utf8').replace(/^\uFEFF/,'')));
const expected=authored.map(c=>({...c,id:c.topic+':'+c.key,questions:c.questions.map((q,i)=>({...q,id:'detail:'+c.topic+':'+c.key+':'+(i+1),concept:c.topic+':'+c.key}))}));
assert.deepEqual(JSON.parse(JSON.stringify(context.chapters)),expected,'Run compile-depth.py after editing content');
const ids=new Set(),prompts=new Set();for(const c of expected){
 assert.ok(!ids.has(c.id));ids.add(c.id);assert.ok(c.explanation.split(/\s+/).length>=100);
 assert.ok(c.diagram.length>=2&&c.distinctions.length>=2&&c.lab.length>=2&&c.questions.length>=2);
 assert.ok(c.sources.length&&c.sources.every(s=>/^https:\/\//.test(s.url)));
 for(const q of c.questions){assert.ok(!prompts.has(q.prompt),'Repeated detail prompt: '+q.prompt);prompts.add(q.prompt);const answers=q.kind==='multi'?q.answer:[q.answer];assert.ok(Array.isArray(answers)&&answers.length&&new Set(answers).size===answers.length&&answers.every(answer=>Number.isInteger(answer)&&answer>=0&&answer<q.options.length));if(q.kind==='multi')assert.ok(answers.length>1&&answers.length<q.options.length);}
}
console.log(`PASS: ${expected.length} original detail chapters match editable sources; ${prompts.size} distinct questions have valid keys and primary-reference links.`);

const labContext={};vm.createContext(labContext);vm.runInContext(fs.readFileSync(path.join(root,'dist/domain-lab-data.js'),'utf8')+';this.labs=DOMAIN_LABS;',labContext);
const authoredLabs=JSON.parse(fs.readFileSync(path.join(root,'content/domain-labs.json'),'utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(labContext.labs)),authoredLabs);
for(const lab of authoredLabs){assert.ok(lab.title&&lab.goal&&lab.setup&&lab.cleanup&&lab.stretch);assert.ok(lab.steps.length>=3&&lab.checks.length>=2);}
console.log('PASS: practical lab data matches editable source and includes setup, tasks, success checks, cleanup and a stretch task.');
