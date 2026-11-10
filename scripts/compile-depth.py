"""Validate and bundle substantive concept chapters; preserve all existing exercise IDs."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
topics={}
for filename,name in [('aplus-data.js','APLUS_COURSE'),('certification-data.js','CERTIFICATION_COURSE'),('cloud-course-data.js','CLOUD_COURSE'),('advanced-course-data.js','ADVANCED_COURSE'),('specialist-course-data.js','SPECIALIST_COURSE')]:
 text=(root/'dist'/filename).read_text(encoding='utf-8')
 entries=json.loads(text.split('const '+name+'=',1)[1].rsplit(';',1)[0])
 topics.update({topic['id']:topic for topic in entries})
chapters=[];keys=set();question_ids=set()
for source in sorted((root/'content').glob('*-depth.json')):
 for entry in json.loads(source.read_text(encoding='utf-8-sig')):
  if entry['topic'] not in topics:raise ValueError(f'Unknown topic: {entry["topic"]}')
  key=entry['topic']+':'+entry['key']
  if key in keys:raise ValueError('Duplicate concept '+key)
  keys.add(key)
  for field in ['title','explanation']:
   if not isinstance(entry.get(field),str) or len(entry[field])<8:raise ValueError((key,field))
  if len(entry['explanation'].split())<100:raise ValueError('Explanation too short: '+key)
  if not all(isinstance(entry.get(field),list) and len(entry[field])>=2 for field in ['distinctions','diagram','lab','questions','sources'] if field!='sources'):raise ValueError('Incomplete chapter '+key)
  if not entry.get('sources') or any(not source['url'].startswith('https://') for source in entry['sources']):raise ValueError('Missing primary references '+key)
  if not all(isinstance(entry.get('example',{}).get(field),str) for field in ['situation','reasoning','result']):raise ValueError('Missing worked case '+key)
  entry['id']=key
  for i,question in enumerate(entry['questions']):
   question['id']='detail:'+key+':'+str(i+1)
   if question['id'] in question_ids:raise ValueError('Duplicate question')
   question_ids.add(question['id'])
   answers=question['answer'] if question.get('kind')=='multi' else [question['answer']]
   if not isinstance(answers,list) or not answers or len(set(answers))!=len(answers) or any(type(answer) is not int or not 0<=answer<len(question['options']) for answer in answers) or len(question['options'])<3 or not question.get('explanation') or question['tier'] not in [2,3]:raise ValueError('Invalid exercise '+question['id'])
   if question.get('kind')=='multi' and not 1<len(answers)<len(question['options']):raise ValueError('Invalid multiple-response key '+question['id'])
   question['concept']=key
  if any(topic not in topics for topic in entry.get('related',[])):raise ValueError('Unknown related topic '+key)
  chapters.append(entry)
(root/'dist/depth-data.js').write_text('// Compiled original concept chapters. See content/*-depth.json for editable sources.\nconst DEPTH_CHAPTERS='+json.dumps(chapters,ensure_ascii=False)+';\n',encoding='utf-8')
report={str(core):dict(chapters=sum(topics[c['topic']]['core']==core for c in chapters),explanationWords=sum(len(c['explanation'].split()) for c in chapters if topics[c['topic']]['core']==core),exercises=sum(len(c['questions']) for c in chapters if topics[c['topic']]['core']==core)) for core in sorted({t['core'] for t in topics.values()})}
(root/'content/depth-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(chapters=len(chapters),questions=len(question_ids),byTrack=report)))
inventory={'reviewed':'2026-11-06','scope':'Authored chapter mapping to numbered objectives and task areas; not an independent audit of every exam bullet.', 'objectives':[]}
for topic in topics.values():
 mapped=[c for c in chapters if c['topic']==topic['id'] or topic['id'] in c.get('related',[])]
 inventory['objectives'].append({'topic':topic['id'],'core':topic['core'],'objective':topic['objective'],'title':topic['title'],'chapters':[c['id'] for c in mapped],'directConceptQuestions':sum(len(c['questions']) for c in mapped if c['topic']==topic['id'])})
(root/'content/coverage-inventory.json').write_text(json.dumps(inventory,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
