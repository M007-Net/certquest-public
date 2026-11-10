"""Rebuild the bundled A+ foundation from the user's MIT-licensed CertForge packs."""
import json, sys
from pathlib import Path
source=Path(sys.argv[1])
topics=[]
for core in [1,2]:
 pack=json.loads((source/f'a-plus-core-{core}.json').read_text(encoding='utf-8-sig'))
 for module in pack['modules']:
  previous=None
  for lesson in module['lessons']:
   objective=lesson['objectives'][0];key=f'core{core}-{objective}'
   domain=int(objective.split('.')[0]);kind=('network' if core==1 and domain==2 else 'security' if core==2 and domain==2 else 'physical' if core==1 and domain in [1,3,5] else 'software')
   questions=[]
   for challenge in lesson['challenges']:
    qid=key+'-'+challenge['id']
    if challenge['type']=='choice':
     questions.append(dict(id=qid,prompt=challenge['prompt'],options=challenge['options'],answer=challenge['answer'][0],explanation=challenge['explanation'],tier=1))
    elif challenge['type']=='matching':
     questions.append(dict(id=qid,prompt=challenge['prompt'],left=challenge['left'],options=challenge['options'],answer=challenge['answer'],explanation=challenge['explanation'],tier=2))
    elif challenge['type']=='scenario':
     for i,step in enumerate(challenge['steps']):
      questions.append(dict(id=qid+'-'+str(i),prompt=challenge['context']+'\n\n'+step['prompt'],options=step['options'],answer=step['answer'],explanation=step['explanation'],tier=3))
   topics.append(dict(id=key,title=lesson['title'],core=core,objective=objective,domain=domain,type=kind,requires=[previous] if previous else [],lore=lesson['body'].replace('\ufffd','—'),example=lesson.get('example',''),questions=questions,sources=pack['sources']))
   previous=key
out=Path(__file__).resolve().parents[1]/'dist/aplus-data.js'
out.write_text('// Adapted from the user-owned CertForge foundation packs. See CERTFORGE-LICENSE.txt.\nconst APLUS_COURSE='+json.dumps(topics,ensure_ascii=False)+';\n',encoding='utf-8')
print(f'{len(topics)} objective lessons; {sum(len(t["questions"]) for t in topics)} exercises')
