// Browser-only training runtime. Parse source into data and dispatch supported
// operations explicitly. Each test has its own variables, functions and files.
class WorkshopPowerShell {
  constructor(source) {
    this.tokens = [];
    this.index = 0;
    let line = 1;
    const pattern = /[ \t\r]+|#[^\n]*|\n|"(?:`[\s\S]|""|[^"`])*"|'(?:''|[^'])*'|\$[\w]+|\d+(?:\.\d+)?|@\(|@\{|\$\(|-[a-z][\w-]*|[a-z_][\w-]*|[=+*/%,.()[\]{};|<>!?-]/giy;
    while (pattern.lastIndex < source.length) {
      const start = pattern.lastIndex;
      const match = pattern.exec(source);
      if (!match) throw Error('Line ' + line + ': unexpected character ' + source[start]);
      const text = match[0];
      if (!/^[ \t\r#]/.test(text)) this.tokens.push({text, line});
      line += (text.match(/\n/g) || []).length;
    }
    this.tokens.push({text: '', line});
  }

  peek() { return this.tokens[this.index].text.toLowerCase(); }
  take() { return this.tokens[this.index++].text; }
  accept(value) {
    if (this.peek() !== value) return false;
    this.take();
    return true;
  }
  fail(message) { throw Error('Line ' + this.tokens[this.index].line + ': ' + message); }
  expect(value) {
    if (!this.accept(value)) this.fail('expected ' + value + ', found ' + (this.peek() || 'end of script'));
  }
  skipLines() { while (this.accept('\n')) {} }
  separators() { while (this.accept('\n') || this.accept(';')) {} }
  variable() {
    if (!this.peek().startsWith('$') || this.peek() === '$(') this.fail('expected a variable');
    return this.take().toLowerCase();
  }
  name() {
    if (!/^[a-z_]/.test(this.peek())) this.fail('expected a name');
    return this.take();
  }

  program(end = '') {
    const nodes = [];
    this.separators();
    while (this.peek() !== end) {
      if (!this.peek()) this.fail('expected ' + end);
      nodes.push(this.statement());
      if (this.peek() !== end && !['\n', ';'].includes(this.peek())) this.fail('expected a new line or semicolon');
      this.separators();
    }
    return nodes;
  }

  block() {
    this.skipLines();
    this.expect('{');
    const nodes = this.program('}');
    this.expect('}');
    return nodes;
  }

  type() {
    this.expect('[');
    const type = this.name().toLowerCase();
    this.expect(']');
    return type;
  }

  parameters() {
    this.expect('(');
    this.skipLines();
    const params = [];
    while (this.peek() !== ')') {
      const type = this.peek() === '[' ? this.type() : '';
      const name = this.variable();
      const fallback = this.accept('=') ? this.expression() : null;
      params.push({type, name, fallback});
      this.skipLines();
      if (!this.accept(',')) break;
      this.skipLines();
    }
    this.expect(')');
    return params;
  }

  statement() {
    if (this.accept('param')) return ['param', this.parameters()];
    if (this.accept('function')) return ['function', this.name().toLowerCase(), this.block()];
    if (this.accept('if')) {
      this.expect('(');
      this.skipLines();
      const condition = this.pipeline();
      this.skipLines();
      this.expect(')');
      const yes = this.block();
      const checkpoint = this.index;
      this.skipLines();
      if (this.accept('else')) return ['if', condition, yes, this.block()];
      if (this.peek() === 'elseif') {
        this.tokens[this.index] = {...this.tokens[this.index], text: 'if'};
        return ['if', condition, yes, [this.statement()]];
      }
      this.index = checkpoint;
      return ['if', condition, yes, []];
    }
    if (this.accept('foreach')) {
      this.expect('(');
      const variable = this.variable();
      this.expect('in');
      const items = this.pipeline();
      this.expect(')');
      return ['foreach', variable, items, this.block()];
    }
    if (this.accept('try')) {
      const body = this.block();
      this.skipLines();
      this.expect('catch');
      return ['try', body, this.block()];
    }
    if (this.accept('return')) return ['return', this.atEnd() ? null : this.pipeline()];
    if (this.accept('throw')) return ['throw', this.pipeline()];
    if (this.peek().startsWith('$') && this.tokens[this.index + 1]?.text === '=') {
      const variable = this.variable();
      this.expect('=');
      return ['assign', variable, this.pipeline()];
    }
    return this.pipeline();
  }

  atEnd() { return ['', '\n', ';', '}', ')', '|'].includes(this.peek()); }

  pipeline() {
    const stage = () => /^[a-z_%?]/.test(this.peek()) ? this.command() : this.list();
    const first = stage();
    const stages = [];
    while (this.accept('|')) {
      this.skipLines();
      stages.push(this.command());
    }
    return stages.length ? ['pipe', first, stages] : first;
  }

  arguments() {
    const args = [];
    while (!this.atEnd()) {
      if (/^-[a-z]/.test(this.peek())) {
        args.push(['option', this.take().slice(1).toLowerCase()]);
      } else if (this.peek() === '{') {
        args.push(['script', this.block()]);
      } else {
        const values = [this.atom()];
        while (this.accept(',')) values.push(this.atom());
        args.push(values.length === 1 ? values[0] : ['array', values]);
      }
    }
    return args;
  }

  command() {
    const name = ['%', '?'].includes(this.peek()) ? this.take() : this.name();
    return ['command', name.toLowerCase(), this.arguments()];
  }

  list() {
    const values = [this.expression()];
    while (this.accept(',')) values.push(this.expression());
    return values.length === 1 ? values[0] : ['array', values];
  }

  expression(min = 0) {
    let left = this.atom();
    const levels = {'-or': 1, '-and': 2, '-eq': 3, '-ne': 3, '-lt': 3, '-le': 3,
      '-gt': 3, '-ge': 3, '+': 4, '-': 4, '*': 5, '/': 5, '%': 5};
    while (Object.hasOwn(levels, this.peek()) && levels[this.peek()] >= min) {
      const operator = this.take().toLowerCase();
      left = ['binary', operator, left, this.expression(levels[operator] + 1)];
    }
    return left;
  }

  atom() {
    let node;
    const token = this.peek();
    if (this.accept('(') || this.accept('$(')) {
      this.skipLines();
      node = this.pipeline();
      this.skipLines();
      this.expect(')');
    } else if (this.accept('@(')) {
      node = ['collect', this.program(')')];
      this.expect(')');
    } else if (this.accept('@{')) {
      const entries = [];
      this.separators();
      while (!this.accept('}')) {
        const key = this.name();
        this.expect('=');
        entries.push([key, this.expression()]);
        if (this.peek() !== '}' && !['\n', ';'].includes(this.peek())) this.fail('expected a separator between properties');
        this.separators();
      }
      node = ['record', entries];
    } else if (token === '[') {
      return ['cast', this.type(), this.atom()];
    } else if (['-', '+', '-not', '!'].includes(token)) {
      return ['unary', this.take().toLowerCase(), this.atom()];
    } else if (token.startsWith('$')) {
      node = ['variable', this.variable()];
    } else if (token.startsWith("'")) {
      node = ['literal', this.take().slice(1, -1).replace(/''/g, "'")];
    } else if (token.startsWith('"')) {
      node = ['string', this.take().slice(1, -1)];
    } else if (/^\d/.test(token)) {
      node = ['literal', Number(this.take())];
    } else if (/^[a-z_]/.test(token)) {
      node = ['literal', this.take()];
    } else {
      this.fail('expected a value, found ' + (token || 'end of script'));
    }
    while (true) {
      if (this.accept('.')) {
        node = ['property', node, this.name()];
      } else if (this.accept('[')) {
        node = ['index', node, this.expression()];
        this.expect(']');
      } else {
        return node;
      }
    }
  }
}

const workshopCommands = new Map([
  ['write-output', 'Emit values to the success stream.'],
  ['write-host', 'Print a message to the console.'],
  ['write-error', 'Report an error.'],
  ['get-command', 'Find commands by name.'],
  ['get-help', 'Show help for a command.'],
  ['get-member', 'List the properties of pipeline objects.'],
  ['get-date', 'Get the fictional lab date.'],
  ['get-service', 'List fictional services.'],
  ['get-childitem', 'List files in the virtual directory.'],
  ['where-object', 'Keep objects matching a condition.'],
  ['foreach-object', 'Run a script block for each input.'],
  ['select-object', 'Choose records or properties.'],
  ['sort-object', 'Sort records by property.'],
  ['measure-object', 'Count pipeline objects.'],
  ['join-path', 'Join virtual path components.'],
  ['get-content', 'Read lines from a virtual file.'],
  ['set-content', 'Write lines to a virtual file.'],
  ['test-path', 'Check whether a virtual file exists.'],
  ['import-csv', 'Read CSV rows as objects.'],
  ['export-csv', 'Write objects to a virtual CSV file.'],
  ['out-null', 'Discard pipeline output.']
]);
const workshopAliases = new Map(Object.entries({
  echo: 'write-output', where: 'where-object', '?': 'where-object',
  '%': 'foreach-object', select: 'select-object', sort: 'sort-object',
  dir: 'get-childitem', ls: 'get-childitem', cat: 'get-content', gc: 'get-content'
}));
const workshopSwitches = new Set(['descending', 'notypeinformation', 'examples', 'raw', 'nameonly']);
const workshopName = name => ({'get-childitem': 'Get-ChildItem', 'foreach-object': 'ForEach-Object'}[name] ??
  name.replace(/(^|-)([a-z])/g, (_, separator, letter) => separator + letter.toUpperCase()));

function workshopPath(value) {
  const parts = shellString(value).replace(/\\/g, '/').split('/');
  const normalized = [];
  for (const part of parts) {
    if (part === '..') normalized.pop();
    else if (part && part !== '.') normalized.push(part);
  }
  return '/' + normalized.join('/').toLowerCase();
}

function workshopCsvRows(lines) {
  const fields = line => [...(',' + line).matchAll(/,(?:"((?:[^"]|"")*)"|([^,]*))/g)]
    .map(match => match[1]?.replace(/""/g, '"') ?? match[2]);
  const keys = fields(lines[0] ?? '');
  return lines.slice(1).filter(line => line !== '').map(line => {
    const values = fields(line);
    return Object.fromEntries(keys.map((key, index) => [key, values[index] ?? '']));
  });
}

class WorkshopSession {
  constructor() {
    this.vars = new Map([['$labpath', '/lab'], ['$true', true], ['$false', false], ['$null', null]]);
    this.functions = new Map();
    this.files = new Map();
    this.errors = [];
    this.console = [];
    this.budget = 12000;
  }

  spend() {
    if (--this.budget < 0) throw Error('This run exceeded the training shell’s operation limit.');
  }

  collect(output, values) {
    if (output.length + values.length > 1000) throw Error('This run produced too many output values.');
    for (const value of values) output.push(value);
  }

  run(nodes, vars = this.vars, args = {named: new Map(), positional: []}, output = []) {
    for (const node of nodes) {
      const [kind, first, second, third] = node;
      this.spend();
      switch (kind) {
        case 'param':
          first.forEach(({type, name, fallback}, index) => {
            const value = args.named.has(name.slice(1)) ? args.named.get(name.slice(1)) :
              args.positional[index] ?? (fallback ? this.value(fallback, vars) : null);
            vars.set(name, type ? shellCast(type, value) : value);
          });
          break;
        case 'function':
          this.functions.set(first, second);
          break;
        case 'assign':
          vars.set(first, checkWorkshopValue(this.value(second, vars)));
          break;
        case 'if':
          this.run(shellTruth(this.value(first, vars)) ? second : third, vars, undefined, output);
          break;
        case 'foreach':
          for (const item of shellArray(this.value(second, vars))) {
            this.spend();
            vars.set(first, item);
            this.run(third, vars, undefined, output);
          }
          break;
        case 'try':
          try {
            this.run(first, vars, undefined, output);
          } catch (error) {
            if (error instanceof WorkshopReturn || this.budget < 0) throw error;
            const previous = vars.get('$_');
            vars.set('$_', {Exception: {Message: error.message}});
            try { this.run(second, vars, undefined, output); }
            finally { vars.set('$_', previous); }
          }
          break;
        case 'throw':
          throw Error(shellString(this.value(first, vars)));
        case 'return':
          if (first) this.collect(output, shellArray(this.value(first, vars)));
          throw new WorkshopReturn(output);
        default:
          this.collect(output, shellArray(this.value(node, vars)));
      }
    }
    return output;
  }

  execute(nodes, vars = this.vars, args) {
    try { return this.run(nodes, vars, args); }
    catch (error) {
      if (error instanceof WorkshopReturn) return error.values;
      throw error;
    }
  }

  value(node, vars) {
    const [kind, first, second, third] = node;
    this.spend();
    switch (kind) {
      case 'literal': return first;
      case 'variable': return vars.get(first) ?? null;
      case 'string': return this.interpolate(first, vars);
      case 'array': return checkWorkshopValue(first.map(item => this.value(item, vars)));
      case 'collect': return this.run(first, vars);
      case 'record': return checkWorkshopValue(Object.fromEntries(first.map(([key, item]) => [key, this.value(item, vars)])));
      case 'property': return shellProperty(this.value(first, vars), second);
      case 'index': {
        const source = this.value(first, vars);
        const index = this.value(second, vars);
        if (Array.isArray(source) || typeof source === 'string') {
          return Number.isInteger(index) ? source.at(index) ?? null : null;
        }
        return shellProperty(source, shellString(index));
      }
      case 'cast': return shellCast(first, this.value(second, vars));
      case 'unary': {
        const value = this.value(second, vars);
        return first === '-' ? -Number(value) : first === '+' ? Number(value) : !shellTruth(value);
      }
      case 'binary': {
        const left = this.value(second, vars);
        if (first === '-and') return shellTruth(left) && shellTruth(this.value(third, vars));
        if (first === '-or') return shellTruth(left) || shellTruth(this.value(third, vars));
        const value = shellBinary(first, left, this.value(third, vars));
        if (value?.length > (Array.isArray(value) ? 1000 : 24000)) throw Error('This run produced a value that is too large.');
        return value;
      }
      case 'command': return shellSingle(this.command(node, vars, []));
      case 'pipe': {
        let values = first[0] === 'command' ? this.command(first, vars, []) : shellArray(this.value(first, vars));
        for (const stage of second) values = this.command(stage, vars, values);
        return shellSingle(values);
      }
    }
    throw Error('This expression is unavailable in the training shell.');
  }

  interpolate(text, vars) {
    const escaped = new Map([['n', '\n'], ['r', '\r'], ['t', '\t']]);
    const matcher = /`.|""|\$\(|\$[\w]+/gs;
    let output = '', cursor = 0;
    for (let match; (match = matcher.exec(text));) {
      const token = match[0];
      output += text.slice(cursor, match.index);
      if (token === '""') output += '"';
      else if (token.startsWith('`')) output += escaped.get(token[1]) ?? token[1];
      else if (token === '$(') {
        const parser = new WorkshopPowerShell(text.slice(matcher.lastIndex));
        const node = parser.pipeline();
        parser.expect(')');
        let depth = 1;
        const start = matcher.lastIndex;
        while (depth && matcher.lastIndex < text.length) {
          const char = text[matcher.lastIndex++];
          if (char === '(') depth++;
          if (char === ')') depth--;
        }
        if (depth || matcher.lastIndex === start) throw Error('Unclosed string expression.');
        output += shellString(this.value(node, vars));
      } else {
        output += shellString(vars.get(token.toLowerCase()));
      }
      cursor = matcher.lastIndex;
      if (output.length > 24000) throw Error('Interpolated string is too large.');
    }
    return output + text.slice(cursor);
  }

  arguments(nodes, vars) {
    const named = new Map();
    const positional = [];
    const evaluate = node => node[0] === 'script' ? node : this.value(node, vars);
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (node[0] !== 'option') {
        positional.push(evaluate(node));
        continue;
      }
      const name = node[1];
      const next = nodes[index + 1];
      named.set(name, !workshopSwitches.has(name) && next && next[0] !== 'option' ?
        evaluate(nodes[++index]) : true);
    }
    return {named, positional};
  }

  command([, rawName, nodes], vars, input) {
    this.spend();
    const name = workshopAliases.get(rawName) ?? rawName;
    const args = this.arguments(nodes, vars);
    const {named, positional} = args;
    if (this.functions.has(name)) return this.execute(this.functions.get(name), new Map(vars), args);
    const option = (key, index = 0) => named.get(key) ?? positional[index];
    const path = () => workshopPath(named.get('literalpath') ?? option('path'));
    const items = () => positional.length ? positional.flatMap(shellArray) : input;
    const file = () => {
      const key = path();
      if (this.files.has(key)) return this.files.get(key);
      const message = 'Cannot find virtual file ' + key + '.';
      if (String(named.get('erroraction')).toLowerCase() === 'stop') throw Error(message);
      this.errors.push(message);
      return null;
    };
    const script = option(name === 'where-object' ? 'filterscript' : 'process');
    const each = (value, predicate = false) => {
      if (!Array.isArray(script) || script[0] !== 'script') throw Error('Expected a script block in braces.');
      const scope = new Map(vars);
      scope.set('$_', value);
      scope.set('$psitem', value);
      const output = this.run(script[1], scope);
      return predicate ? shellTruth(shellSingle(output)) : output;
    };
    switch (name) {
      case 'write-output': return named.has('inputobject') ? shellArray(named.get('inputobject')) : items();
      case 'write-host': this.collect(this.console, [items().map(shellString).join(' ')]); return [];
      case 'write-error': {
        const message = shellString(option('message'));
        if (String(named.get('erroraction')).toLowerCase() === 'stop') throw Error(message);
        this.collect(this.errors, [message]);
        return [];
      }
      case 'get-command': {
        const requested = option('name');
        const names = [...workshopCommands.keys(), ...this.functions.keys()];
        if (requested == null) return names.map(key => ({Name: workshopName(key)}));
        return names.filter(key => shellArray(requested).some(value => shellString(value).toLowerCase() === key))
          .map(key => ({Name: workshopName(key)}));
      }
      case 'get-help': {
        const key = shellString(option('name')).toLowerCase();
        return [workshopCommands.get(key) ?? 'Try Get-Command to list the training shell commands.'];
      }
      case 'get-member': return [...new Set(input.flatMap(value => value && typeof value === 'object' ? Object.keys(value) : []))]
        .map(Name => ({Name, MemberType: 'NoteProperty'}));
      case 'get-date': return ['2026-01-01T12:00:00'];
      case 'get-service': return [{Name: 'Print', Status: 'Stopped'}, {Name: 'DNS', Status: 'Running'}];
      case 'get-childitem': {
        const parent = path();
        const prefix = parent === '/' ? '/' : parent + '/';
        return [...this.files.keys()].filter(key => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
          .map(key => ({Name: key.slice(prefix.length), FullName: key}));
      }
      case 'where-object': return input.filter(value => Array.isArray(script) && script[0] === 'script' ?
        each(value, true) : shellTruth(shellProperty(value, shellString(option('property')))));
      case 'foreach-object': {
        const output = [];
        for (const value of input) this.collect(output, each(value));
        return output;
      }
      case 'select-object': {
        const count = named.get('first');
        const list = count === undefined ? input : input.slice(0, Math.max(0, Number(count)));
        if (named.has('expandproperty')) {
          return list.flatMap(value => shellArray(shellProperty(value, shellString(named.get('expandproperty')))));
        }
        const properties = shellArray(option('property'));
        return properties.length ? list.map(value => Object.fromEntries(properties.map(key => [key, shellProperty(value, key)]))) : list;
      }
      case 'sort-object': {
        const property = option('property');
        const key = value => property === undefined ? value : shellProperty(value, property);
        const direction = named.has('descending') ? -1 : 1;
        return [...input].sort((left, right) =>
          (shellBinary('-lt', key(left), key(right)) ? -1 : shellBinary('-gt', key(left), key(right)) ? 1 : 0) * direction);
      }
      case 'measure-object': return [{Count: input.length}];
      case 'join-path': return [workshopPath(shellString(option('path')) + '/' + shellString(option('childpath', 1)))];
      case 'test-path': return [this.files.has(path())];
      case 'set-content': this.write(path(), shellArray(option('value', 1) ?? input).map(shellString)); return [];
      case 'get-content': {
        const lines = file();
        return lines && named.has('raw') ? [lines.join('\n') + '\n'] : lines ?? [];
      }
      case 'import-csv': return workshopCsvRows(file() ?? []);
      case 'export-csv': {
        const keys = Object.keys(input[0] ?? {});
        const quote = value => '"' + shellString(value).replace(/"/g, '""') + '"';
        const lines = keys.length ? [keys.map(quote).join(','), ...input.map(value => keys.map(key => quote(shellProperty(value, key))).join(','))] : [];
        this.write(path(), lines);
        return [];
      }
      case 'out-null': return [];
      default: throw Error('Command ' + rawName + ' is unavailable in the training shell. Try Get-Command.');
    }
  }

  write(path, lines) {
    if (lines.join('\n').length > 48000 || this.files.size >= 64 && !this.files.has(path)) {
      throw Error('The virtual file limit was reached.');
    }
    this.files.set(path, lines);
  }
}

class WorkshopReturn {
  constructor(values) { this.values = values; }
}

function checkWorkshopValue(value) {
  const pending = [value];
  let remaining = 48000;
  while (pending.length) {
    const item = pending.pop();
    remaining -= typeof item === 'string' ? item.length + 1 : 1;
    if (remaining < 0) throw Error('This run produced a value that is too large.');
    if (item && typeof item === 'object') {
      for (const child of Object.values(item)) pending.push(child);
    }
  }
  return value;
}

function runWorkshopPowerShell(source, test) {
  const session = new WorkshopSession();
  try {
    const parse = code => new WorkshopPowerShell(code).program();
    session.execute(parse(test.setup));
    const args = test.args ? session.arguments(new WorkshopPowerShell(test.args).arguments(), session.vars) : undefined;
    const values = session.execute(parse(source), session.vars, args);
    if (test.invoke) session.collect(values, session.execute(parse(test.invoke)));
    return {values: checkWorkshopValue(values), console: checkWorkshopValue(session.console), error: checkWorkshopValue(session.errors).join('\n')};
  } catch (error) {
    return {values: [], console: session.console,
      error: error instanceof RangeError ? 'This script exceeded the training shell’s complexity limit.' : error.message};
  }
}

const shellArray = value => value == null ? [] : Array.isArray(value) ? value : [value];
const shellSingle = values => values.length === 0 ? null : values.length === 1 ? values[0] : values;
const shellString = value => value == null ? '' : Array.isArray(value) ? value.map(shellString).join(' ') :
  typeof value === 'boolean' ? (value ? 'True' : 'False') : String(value);
function shellProperty(value, name) {
  if (Array.isArray(value)) {
    if (['count', 'length'].includes(name.toLowerCase())) return value.length;
    return value.map(item => shellProperty(item, name));
  }
  if (typeof value === 'string' && name.toLowerCase() === 'length') return value.length;
  const key = value && typeof value === 'object' && Object.keys(value).find(key => key.toLowerCase() === name.toLowerCase());
  if (key) return value[key];
  return name.toLowerCase() === 'count' ? (value == null ? 0 : 1) : null;
}

function shellCast(type, value) {
  if (type === 'int') {
    const number = Number(value);
    if (!Number.isFinite(number)) throw Error('Cannot convert value to an integer.');
    const rounded = Math.abs(number % 1) === 0.5 ? Math.round(number / 2) * 2 : Math.round(number);
    if (rounded < -2147483648 || rounded > 2147483647) throw Error('Value is outside the Int32 range.');
    return rounded;
  }
  if (type === 'string') return shellString(value);
  if (type === 'bool') return shellTruth(value);
  if (type === 'pscustomobject' && value && typeof value === 'object') return value;
  throw Error('Type [' + type + '] is unavailable for this value in the training shell.');
}

function shellTruth(value) {
  return Array.isArray(value) ? value.length > 1 || (value.length === 1 && shellTruth(value[0])) : Boolean(value);
}

function shellBinary(operator, left, right) {
  switch (operator) {
    case '+': return Array.isArray(left) ? left.concat(shellArray(right)) :
      typeof left === 'string' ? left + shellString(right) : Number(left) + Number(right);
    case '-': return Number(left) - Number(right);
    case '*': return Number(left) * Number(right);
    case '%':
    case '/':
      if (Number(right) === 0) throw Error('Cannot divide by zero.');
      return operator === '/' ? Number(left) / Number(right) : Number(left) % Number(right);
  }
  if (Array.isArray(left)) return left.filter(value => shellBinary(operator, value, right));
  if (typeof left === 'string') {
    left = left.toLowerCase();
    right = shellString(right).toLowerCase();
  } else if (typeof left === 'number') {
    right = Number(right);
  } else if (typeof left === 'boolean') {
    right = shellTruth(right);
  }
  switch (operator) {
    case '-eq': return left === right;
    case '-ne': return left !== right;
    case '-lt': return left < right;
    case '-le': return left <= right;
    case '-gt': return left > right;
    case '-ge': return left >= right;
  }
}
