// Interpret the course's Bash subset against a fresh, in-memory lab.
function runWorkshopBash(source, test) {
  const files = new Map(Object.entries(test.files || {}));
  const vars = new Map((test.argv || []).map((value, i) => [String(i + 1), value]));
  let cwd = '/lab', budget = 3000;
  const lines = value => value ? value.replace(/\n$/, '').split('\n') : [];
  function path(value) {
    if (!value) throw Error('A path is required.');
    const parts = [];
    for (const part of (value.startsWith('/') ? value : cwd + '/' + value).split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    return '/' + parts.join('/');
  }
  function read(value) {
    const key = path(value);
    if (!files.has(key)) throw Error('File not found: ' + key);
    return files.get(key);
  }
  const directory = key => key === '/' || key === '/lab' || [...files.keys()].some(file => file.startsWith(key + '/'));

  function expand(word) {
    return word.replace(/'[^']*'|"[^"]*"|\$\{[a-zA-Z_]\w*\}|\$(?:[a-zA-Z_]\w*|\d)|\\.|[^'"$\\]+|\$/g, part => {
      const variable = match => vars.get(match.replace(/[$\{\}]/g, '')) ?? '';
      if (part.startsWith("'")) return part.slice(1, -1);
      if (part.startsWith('"')) return part.slice(1, -1).replace(/\$\{[a-zA-Z_]\w*\}|\$(?:[a-zA-Z_]\w*|\d)/g, variable);
      if (part.startsWith('\\')) return part.slice(1);
      return part.startsWith('$') ? variable(part) : part;
    });
  }

  function command(words, input) {
    const [name, ...args] = words.map(expand);
    switch (name) {
      case 'echo': return args.join(' ') + '\n';
      case 'printf': {
        const [format, ...values] = args;
        if (format === undefined || format.replace(/%%|%s/g, '').includes('%')) throw Error('Use %s or %% in this lab.');
        const decoded = format.replace(/\\([nt\\])/g, (_, char) => ({n:'\n', t:'\t', '\\':'\\'}[char]));
        const count = (decoded.match(/%%|%s/g) || []).filter(spec => spec === '%s').length;
        let index = 0, result = '';
        do {
          result += decoded.replace(/%%|%s/g, spec => spec === '%%' ? '%' : values[index++] ?? '');
        } while (count && index < values.length);
        return result;
      }
      case 'pwd': return cwd + '\n';
      case 'cd': {
        const target = path(args[0]);
        if (!directory(target)) throw Error('Directory not found: ' + target);
        cwd = target;
        return '';
      }
      case 'ls': {
        const target = path(args[0] ?? '.');
        if (!directory(target)) throw Error('Directory not found: ' + target);
        const prefix = target === '/' ? '/' : target + '/';
        return [...new Set([...files.keys()].filter(key => key.startsWith(prefix))
          .map(key => key.slice(prefix.length).split('/')[0]))].sort().map(entry => entry + '\n').join('');
      }
      case 'cat': return args.length ? args.map(read).join('') : input;
      case 'grep': {
        if (args[0] !== '-F' || args.length < 2) throw Error('Use grep -F PATTERN [FILE] for literal searches.');
        const content = args.length > 2 ? args.slice(2).map(read).join('') : input;
        return lines(content).filter(line => line.includes(args[1])).map(line => line + '\n').join('');
      }
      case 'sort': return lines(args.length ? args.map(read).join('') : input).sort().map(line => line + '\n').join('');
      case 'uniq': return lines(args.length ? read(args[0]) : input).filter((line, i, list) => i === 0 || line !== list[i-1]).map(line => line + '\n').join('');
      case 'wc':
        if (args[0] !== '-l') throw Error('Use wc -l to count lines.');
        return String(((args[1] ? read(args[1]) : input).match(/\n/g) || []).length) + '\n';
      default: throw Error('Command unavailable in the Bash workshop: ' + name);
    }
  }

  function pipeline(tokens) {
    let output = '', stage = [];
    for (const token of [...tokens, '|']) {
      if (token !== '|') {
        stage.push(token);
        continue;
      }
      if (--budget < 0) throw Error('Script operation limit reached.');
      if (!stage.length) throw Error('Expected a command around the pipe.');
      const redirect = stage.findIndex(word => ['>', '>>'].includes(word));
      const words = redirect < 0 ? stage : stage.slice(0, redirect);
      if (!words.length) throw Error('Expected a command before redirection.');
      if (words.length === 1 && /^[a-zA-Z_]\w*=/.test(words[0])) {
        const equal = words[0].indexOf('=');
        vars.set(words[0].slice(0, equal), expand(words[0].slice(equal + 1)));
        output = '';
      } else {
        output = command(words, output);
      }
      if (redirect >= 0) {
        if (stage.length !== redirect + 2) throw Error('Expected a single output path.');
        const key = path(expand(stage[redirect + 1]));
        output = (stage[redirect] === '>>' ? files.get(key) ?? '' : '') + output;
        if (output.length > 32000 || files.size >= 100 && !files.has(key)) throw Error('Virtual file limit reached.');
        files.set(key, output);
        output = '';
      }
      if (output.length > 32000) throw Error('Output limit reached.');
      stage = [];
    }
    return output;
  }

  try {
    if (source.length > 12000) throw Error('Script length limit reached.');
    const tokenPattern = /[ \t\r]+|#[^\n]*|[\n;]|>>?|[|]|(?:'[^']*'|"[^"]*"|\\[^\n]|[^\s;|<>&()'"`\\])+/gy;
    const statements = [[]];
    while (tokenPattern.lastIndex < source.length) {
      const offset = tokenPattern.lastIndex;
      const match = tokenPattern.exec(source);
      if (!match) throw Error('Unsupported or incomplete syntax near ' + source.slice(offset, offset + 18));
      const token = match[0];
      if (token === ';' || token === '\n') statements.push([]);
      else if (!/^[ \t\r#]/.test(token)) statements.at(-1).push(token);
    }
    const rows = statements.filter(row => row.length);
    let cursor = 0;
    function parse(stops = [], depth = 0) {
      if (depth > 20) throw Error('Too many nested blocks.');
      const nodes = [];
      while (cursor < rows.length && !stops.includes(rows[cursor][0])) {
        const [keyword, ...args] = rows[cursor++];
        if (keyword === 'for') {
          if (!/^[a-zA-Z_]\w*$/.test(args[0]) || args[1] !== 'in') throw Error('Use for NAME in WORDS; do ...; done.');
          const opener = rows[cursor++];
          if (opener?.[0] !== 'do') throw Error('Expected do after for.');
          if (opener.length > 1) rows.splice(cursor, 0, opener.slice(1));
          const body = parse(['done'], depth + 1);
          if (rows[cursor++]?.length !== 1) throw Error('Expected done.');
          nodes.push({loop: args[0], items: args.slice(2), body});
        } else if (keyword === 'if') {
          if (args[0] !== '[' || args.at(-1) !== ']') throw Error('Use if [ CONDITION ]; then ...; fi.');
          const opener = rows[cursor++];
          if (opener?.[0] !== 'then') throw Error('Expected then.');
          if (opener.length > 1) rows.splice(cursor, 0, opener.slice(1));
          const yes = parse(['else', 'fi'], depth + 1);
          let no = [];
          if (rows[cursor]?.[0] === 'else') {
            const alternate = rows[cursor++];
            if (alternate.length > 1) rows.splice(cursor, 0, alternate.slice(1));
            no = parse(['fi'], depth + 1);
          }
          if (rows[cursor++]?.length !== 1) throw Error('Expected fi.');
          nodes.push({condition: args.slice(1,-1), yes, no});
        } else {
          nodes.push({tokens: [keyword, ...args]});
        }
      }
      return nodes;
    }
    function execute(nodes) {
      let output = '';
      for (const node of nodes) {
        if (--budget < 0) throw Error('Script operation limit reached.');
        if (node.loop) {
          for (const item of node.items.map(expand)) {
            if (--budget < 0) throw Error('Script operation limit reached.');
            vars.set(node.loop, item);
            output += execute(node.body);
            if (output.length > 32000) throw Error('Output limit reached.');
          }
        } else if (node.condition) {
          const [left, op, right] = node.condition.map(expand);
          let passed;
          if (node.condition.length === 2 && left === '-f') passed = files.has(path(op));
          else if (node.condition.length === 3 && op === '=') passed = left === right;
          else if (node.condition.length === 3 && op === '!=') passed = left !== right;
          else throw Error('Use -f for a file check, or = / != for a string comparison.');
          output += execute(passed ? node.yes : node.no);
        } else {
          output += pipeline(node.tokens);
        }
        if (output.length > 32000) throw Error('Output limit reached.');
      }
      return output;
    }
    const output = execute(parse());
    return {values: lines(output), console: [], error: '', files};
  } catch (error) {
    return {values: [], console: [], error: error.message};
  }
}
