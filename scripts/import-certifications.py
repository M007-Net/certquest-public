"""Adapt the user's MIT CertForge packs without changing their stable source IDs."""
import json,sys
from pathlib import Path
source=Path(sys.argv[1]);topics=[]
for core,name,kind in [(3,'network-plus','network'),(4,'security-plus','security')]:
 pack=json.loads((source/(name+'.json')).read_text(encoding='utf-8-sig'))
 for module in pack['modules']:
  previous=None
  for lesson in module['lessons']:
   objective=lesson['objectives'][0];key=f'cert{core}-{objective}';questions=[]
   for c in lesson['challenges']:
    base=dict(id=key+'-'+c['id'],prompt=c['prompt'],explanation=c['explanation'])
    if c['type']=='scenario':
     for i,step in enumerate(c['steps']):questions.append(dict(base,id=base['id']+'-'+str(i),prompt=c['context']+'\n\n'+step['prompt'],options=step['options'],answer=step['answer'],explanation=step['explanation'],tier=3))
    elif c['type']=='choice':questions.append(dict(base,options=c['options'],answer=c['answer'][0],tier=1))
    elif c['type']=='matching':questions.append(dict(base,left=c['left'],options=c['options'],answer=c['answer'],tier=2))
    elif c['type']=='order':questions.append(dict(base,left=['Step '+str(i+1) for i in range(len(c['answer']))],options=c['options'],answer=c['answer'],tier=3))
    elif c['type']=='multi':questions.append(dict(base,kind='multi',options=c['options'],answer=c['answer'],tier=3))
    else:raise ValueError(c['type'])
   topics.append(dict(id=key,title=lesson['title'],core=core,objective=objective,domain=int(objective.split('.')[0]),type=kind,requires=[previous] if previous else [],lore=lesson['body'].replace('\ufffd','—'),example=lesson.get('example',''),questions=questions,sources=pack['sources']))
   previous=key
out=Path(__file__).resolve().parents[1]/'dist/certification-data.js'
out.write_text('// MIT CertForge adaptations; see CERTFORGE-LICENSE.txt\nconst CERTIFICATION_COURSE='+json.dumps(topics,ensure_ascii=False)+';\n',encoding='utf-8')
print(len(topics),'branches;',sum(len(t['questions']) for t in topics),'exercises')
