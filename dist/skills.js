const SKILL_COURSES = [{
  id: 'powershell',
  language: 'PowerShell',
  run: runWorkshopPowerShell,
  title: 'PowerShell Essentials',
  summary: 'Automate a help desk inventory with commands, object pipelines, reusable scripts, and a disk audit.',
  lessons: POWERSHELL_COURSE
}, {
  id: 'bash',
  language: 'Bash',
  run: runWorkshopBash,
  title: 'Bash Essentials',
  summary: 'Navigate a Linux lab, process logs, and automate a report with Bash scripts.',
  lessons: BASH_COURSE
}];
const SKILL_CODE_LIMIT = 12000;

function validateSkills(saveState) {
  if (!saveState.skills || typeof saveState.skills !== 'object') return delete saveState.skills;
  const clean = {};
  for (const course of SKILL_COURSES) {
    const progress = saveState.skills[course.id];
    if (!progress || typeof progress !== 'object') continue;
    const ids = course.lessons.map(lesson => lesson.id);
    clean[course.id] = {
      current: ids.includes(progress.current) ? progress.current : ids[0],
      done: ids.filter(id => Array.isArray(progress.done) && progress.done.includes(id)),
      drafts: Object.fromEntries(ids.filter(id => typeof progress.drafts?.[id] === 'string')
        .map(id => [id, progress.drafts[id].slice(0, SKILL_CODE_LIMIT)]))
    };
  }
  saveState.skills = clean;
}

function skillCatalog() {
  app.innerHTML = '<section class="lesson"><button class="back" onclick="go(\'home\')">← Camp</button>' +
    '<div class="eyebrow">Practical skills</div><h1>Skills workshop</h1>' +
    '<p>Learn a tool by writing code and checking it against realistic lab cases.</p>' +
    SKILL_COURSES.map(course => {
      const done = state.skills?.[course.id]?.done.length || 0;
      return '<article class="realm"><h2>' + esc(course.title) + '</h2><p>' + esc(course.summary) +
        '</p><p>' + done + ' / ' + course.lessons.length +
        ' complete</p><button class="primary" onclick="openSkillCourse(\'' + course.id + '\')">' +
        (state.skills?.[course.id] ? 'Resume course' : 'Open course') + ' →</button></article>';
    }).join('') + '</section>';
}

function openSkillCourse(courseId, lessonId) {
  const course = SKILL_COURSES.find(item => item.id === courseId);
  if (!course) return;
  state.skills ??= {};
  const progress = state.skills[courseId] ??= { current: course.lessons[0].id, done: [], drafts: {} };
  go('skill-lesson', courseId, lessonId ?? progress.current);
}

function skillLesson(courseId, lessonId) {
  const course = SKILL_COURSES.find(item => item.id === courseId);
  const lesson = course?.lessons.find(item => item.id === lessonId);
  if (!lesson) return go('skills');
  const progress = state.skills[courseId];
  const next = course.lessons[course.lessons.indexOf(lesson) + 1];
  progress.current = lessonId;
  save();
  const chapters = [...new Set(course.lessons.map(item => item.chapter))];
  app.innerHTML = `<section class="skill-page">
    <button class="back" onclick="go('skills')">← Skills workshop</button>
    <div class="eyebrow">Practical skills · ${esc(course.title)}</div>
    <h1>${esc(lesson.title)}</h1>
    <p class="muted">${progress.done.length} / ${course.lessons.length} complete · +25 hero XP per first pass</p>
    <div class="skill-layout">
      <nav class="skill-outline paper" aria-label="Course lessons">
        ${chapters.map(chapter => `<h3>${esc(chapter)}</h3>${course.lessons.filter(item => item.chapter === chapter)
          .map(item => `<button ${item === lesson ? 'aria-current="step"' : ''}
            onclick="openSkillCourse('${courseId}','${item.id}')">${progress.done.includes(item.id) ? '✓ ' : ''}${esc(item.title)}</button>`).join('')}`).join('')}
      </nav>
      <article class="paper skill-brief">
        <h2>Field notes</h2><p>${esc(lesson.concept)}</p><pre>${esc(lesson.example)}</pre>
        <h2>Your assignment</h2><p>${esc(lesson.task)}</p>
        <details><summary>Get a hint</summary><p>${esc(lesson.hint)}</p></details>
        <details><summary>Review a worked solution</summary><pre>${esc(lesson.solution)}</pre></details>
        <details><summary>See the test cases</summary>${lesson.cases.map(test => `<h3>${esc(test.label)}</h3>
          ${test.setup || test.invoke || test.args ? `<pre>${esc([test.setup, test.invoke, test.args].filter(Boolean).join('\n'))}</pre>` : ''}
          <p>Expected output values</p><pre>${esc(JSON.stringify(test.expected, null, 2))}</pre>`).join('')}</details>
      </article>
      <article class="paper skill-editor">
        <h2>Script bench</h2>
        <label for="skill-code">Your ${esc(course.language)} code</label>
        <textarea id="skill-code" spellcheck="false" maxlength="${SKILL_CODE_LIMIT}" rows="12">${esc('\n' + (progress.drafts[lessonId] ?? lesson.starter))}</textarea>
        <div class="skill-actions">
          <button id="skill-run">Run code</button>
          <button id="skill-check" class="primary">Check quest</button>
          <button id="skill-reset">Reset starter</button>
          ${next ? `<button onclick="openSkillCourse('${courseId}','${next.id}')">Next lesson →</button>` : ''}
        </div>
        <p class="muted">Run code previews the first case. Check quest runs every case. This browser simulation uses sample data and supports the commands taught in this course.</p>
        <div id="skill-feedback" class="skill-terminal" role="status" aria-live="polite"><strong>Workshop console</strong><p>${progress.done.includes(lessonId) ? '✓ Quest cleared. You can still practice.' : 'Ready to run.'}</p></div>
      </article>
    </div></section>`;

  const code = document.querySelector('#skill-code');
  const feedback = document.querySelector('#skill-feedback');
  function saveDraft() {
    progress.drafts[lessonId] = code.value;
    feedback.textContent = 'Script updated. Ready to run.';
    save();
  }
  code.oninput = saveDraft;
  document.querySelector('#skill-reset').onclick = () => {
    if (code.value !== lesson.starter && window.confirm('Replace your draft with the starter code?')) {
      code.value = lesson.starter;
      saveDraft();
    }
  };
  document.querySelector('#skill-run').onclick = () => {
    const test = lesson.cases[0];
    const result = course.run(code.value, test);
    const output = [...result.console, ...result.values.map(value => typeof value === 'string' ?
      value : JSON.stringify(value, null, 2))].join('\n');
    feedback.innerHTML = `<h3>Sample run · ${esc(test.label)}</h3>
      <pre>${esc(output || '(no output)')}</pre>${result.error ? `<p>${esc(result.error)}</p>` : ''}`;
  };
  document.querySelector('#skill-check').onclick = () => {
    const checks = lesson.cases.map(test => {
      const result = course.run(code.value, test);
      const fileMatches = !test.verifyFile || result.files?.get(test.verifyFile) === test.expectedFile;
      const pass = !result.error && fileMatches && sameSkillValue(result.values, test.expected);
      const detail = result.error || 'Expected ' + JSON.stringify(test.expected) +
        '\nReceived ' + JSON.stringify(result.values) +
        (fileMatches ? '' : '\nCheck the contents of ' + test.verifyFile + '.');
      return {label: test.label, pass, detail};
    });
    const passed = checks.every(check => check.pass);
    const first = passed && !progress.done.includes(lessonId);
    if (first) {
      progress.done.push(lessonId);
      state.xp += 25;
      save();
      const step = document.querySelector('.skill-outline [aria-current="step"]');
      step.textContent = '✓ ' + lesson.title;
      document.querySelector('.skill-page > .muted').textContent =
        progress.done.length + ' / ' + course.lessons.length + ' complete · +25 hero XP per first pass';
    }
    feedback.innerHTML = `<h3>${first ? 'Lesson cleared · +25 XP' : passed ? 'All tests passed' : 'Keep debugging'}</h3>
      <ul>${checks.map(check => `<li><strong>${check.pass ? '✓' : '✗'} ${esc(check.label)}</strong>
      ${check.pass ? '' : `<pre>${esc(check.detail)}</pre>`}</li>`).join('')}</ul>
      ${progress.done.length === course.lessons.length ? '<p>✦ '+esc(course.title)+' complete</p>' : ''}`;
  };
}

function sameSkillValue(actual, expected) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length &&
      expected.every((value, i) => sameSkillValue(actual[i], value));
  }
  if (expected && typeof expected === 'object') {
    return actual && typeof actual === 'object' && !Array.isArray(actual) &&
      Object.keys(actual).length === Object.keys(expected).length &&
      Object.entries(expected).every(([key, value]) => sameSkillValue(actual[key], value));
  }
  return actual === expected;
}
