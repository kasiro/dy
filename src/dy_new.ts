import * as fs from 'fs';
import { termColor, termColorLab } from './color'

// ===== Система цветов =====
const ANSI_COLORS = {
  magenta: termColorLab('#c466cc'),
  purple: termColorLab('#8966cc'),
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  lightGreen: '\x1b[92m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  white: '\x1b[0m',
  gray: '\x1b[90m',
  lightGray: '\x1b[37m',
  brightBlack: '\x1b[90m',
  reset: '\x1b[0m'
} as const;

const ansiBold = '\x1b[1m';

// на основе ключей ANSI_COLORS
type FullColorName = keyof typeof ANSI_COLORS;
// убераем reset
type ColorName = Exclude<FullColorName, 'reset'>


// ===== Настройки цветов =====
interface SyntaxColorScheme {
  keyword: ColorName; // class, if, else, const...
  variable: ColorName; // Имена переменных
  method: ColorName; // Имена методов
  argument: ColorName; // Аргументы функций
  class: ColorName;
  property: ColorName;
  operator: ColorName;
  bracket: ColorName;
  string: ColorName;
  number: ColorName;
  comment: ColorName;
  function: ColorName;
  arrow_func: ColorName;
  block_body: ColorName;
  DataType: ColorName;
  bool: ColorName;
  lineNum: ColorName;
}

const DEFAULT_COLORS: SyntaxColorScheme = {
  keyword: 'magenta',
  variable: 'white',
  method: 'purple',
  argument: 'red',
  class: 'yellow',
  property: 'white',
  operator: 'cyan',
  bracket: 'white',
  string: 'lightGreen',
  number: 'red',
  comment: 'brightBlack',
  function: 'blue',
  arrow_func: 'cyan',
  block_body: 'white',
  DataType: 'yellow',
  bool: 'red',
  lineNum: 'white'
};

class SyntaxHighlighter {
  private colors: Record<keyof SyntaxColorScheme, string>;
  
  constructor(colorScheme: Partial<SyntaxColorScheme> = {}) {
    const mergedColors = {...DEFAULT_COLORS, ...colorScheme};
    this.colors = Object.fromEntries(
      Object.entries(mergedColors).map(([key, colorName]) => 
        [key, ANSI_COLORS[colorName as ColorName]]
      )
    ) as Record<keyof SyntaxColorScheme, string>;
  }

  colorize(type: keyof SyntaxColorScheme, text: string): string {
    return `${this.colors[type]}${text}${ANSI_COLORS.reset}`;
  }

  getLineNumberColor(): string {
    return this.colors.lineNum;
  }
}

// ===== Типы и интерфейсы =====
type DetailedTokenType = keyof Omit<SyntaxColorScheme, 'lineNum'> | 'other';

interface DetailedToken {
  type: DetailedTokenType;
  value: string;
  line: number;
  col: number;
}

type TokenType =
  | 'arrow_func'
  | 'arrow_func_body'
  | 'block_arrow_func'
  | 'block_arrow_body'
  | 'ternary'
  | 'raw';

type TransformerFunc = (lines: string[]) => string[];

interface LexerRule {
  match(line: string): TokenType | null;
}

// ===== Класс токена =====
class Token {
  constructor(
    public type: TokenType,
    public value: string,
    public line: number,
    public children: Token[] = []
  ) {}
}

// ===== Правила лексера =====
class ArrowFunctionRule implements LexerRule {
  match(line: string): TokenType | null {
    const stripped = line.trim();
    return (stripped.includes('= (') && stripped.includes('=>')) ? 'arrow_func' : null;
  }
}

class BlockArrowFunctionRule implements LexerRule {
  match(line: string): TokenType | null {
    const stripped = line.trim();
    return stripped.startsWith('const ') && stripped.includes('=> {') ? 'block_arrow_func' : null;
  }
}

class TernaryRule implements LexerRule {
  match(line: string): TokenType | null {
    return (line.includes('(') && line.includes('?') && line.includes(':') && line.includes(')')) ? 'ternary' : null;
  }
}

// ===== Детальный лексер =====
function tokenizeLine(line: string, lineNum: number): DetailedToken[] {
  const tokens: DetailedToken[] = [];
  const keywords = [
    'const', 'return', 'for', 'while', 'if', 'else', 
    'function', 'class', 'in', 'not', 'and', 'or',
    'type', 'try', 'expect'
  ];
  const bool = ['True', 'False', 'None', 'self'];
  const types = [
    'str', 'int', 'bool', 'float', 'list',
    'dict', 'set', 'tuple', 'range'
  ];
  const operators = [
    '=>', '=', '?', ':', '+', '-',
    '*', '/', '==', '!=', '<', '>', '<=', '>='
  ];

  let current = line.trimStart() === line ? 0 : line.length - line.trimStart().length;
  let col = current;
  let inSpace = true;
  let spaceBuffer = '';
  
  // Состояния для отслеживания контекста
  let isInsideParams = false;
  let expectType = false;
  let inTypeAnnotation = false;

  while (current < line.length) {
    const char = line[current];
    
    if (/\s/.test(char)) {
      spaceBuffer += char;
      current++;
      col++;
      inSpace = true;
      continue;
    }
    
    if (spaceBuffer.length > 0) {
      tokens.push({ type: 'other', value: spaceBuffer, line: lineNum, col: col - spaceBuffer.length });
      spaceBuffer = '';
    }
    
    if (char === '#') {
      const value = line.slice(current);
      tokens.push({ type: 'comment', value, line: lineNum, col });
      break;
    }
    
    if (char === '"' || char === "'") {
      const quote = char;
      let value = quote;
      current++;
      col++;
      
      while (current < line.length && line[current] !== quote) {
        value += line[current];
        current++;
        col++;
      }
      
      if (current < line.length) {
        value += line[current];
        current++;
        col++;
      }
      
      tokens.push({ type: 'string', value, line: lineNum, col: col - value.length });
      continue;
    }
    
    if (/\d/.test(char)) {
      let value = '';
      while (current < line.length && /[\d.]/.test(line[current])) {
        value += line[current];
        current++;
        col++;
      }
      tokens.push({ type: 'number', value, line: lineNum, col: col - value.length });
      continue;
    }
    
    let operatorFound = false;
    for (const op of operators) {
      if (line.startsWith(op, current)) {
        // Специальная обработка двоеточия для аннотаций типов
        if (op === ':' && isInsideParams) {
          expectType = true;
        }
        tokens.push({ 
          type: 'operator', 
          value: op, 
          line: lineNum, 
          col 
        });
        current += op.length;
        col += op.length;
        operatorFound = true;
        break;
      }
    }
    if (operatorFound) continue;
    
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (current < line.length && /[a-zA-Z0-9_]/.test(line[current])) {
        value += line[current];
        current++;
        col++;
      }
      
      let type: DetailedTokenType;
      if (keywords.includes(value)) {
        type = 'keyword';
      } else if (value === 'function') {
        type = 'function';
      } else if (types.includes(value)) {
        type = 'DataType';
      } else if (bool.includes(value)) {
        type = 'bool';
      } else if (expectType) {
        type = 'DataType';
        expectType = false;
        inTypeAnnotation = true;
      } else if (isInsideParams && !inTypeAnnotation) {
        type = 'argument';
      } else if (line[current] === '(') {
        type = 'method';
      } else if (line[current] === '.') {
        type = 'property';
      } else if (/^[A-Z]/.test(value)) {
        type = 'class';
      } else {
        type = 'variable';
      }
      
      tokens.push({ type, value, line: lineNum, col: col - value.length });
      continue;
    }
    
    if (/[{}()[\]]/.test(char)) {
      if (char === '(') {
        // Проверяем, является ли это параметрами функции
        const prevToken = tokens[tokens.length - 1];
        if (prevToken && (prevToken.type === 'method' || 
                          prevToken.value === 'function' || 
                          prevToken.value === 'class')) {
          isInsideParams = true;
        }
      } else if (char === ')') {
        isInsideParams = false;
        expectType = false;
        inTypeAnnotation = false;
      }
      
      tokens.push({ type: 'bracket', value: char, line: lineNum, col });
      current++;
      col++;
      continue;
    }
    
    if (char === ',') {
      inTypeAnnotation = false;
      tokens.push({ type: 'other', value: char, line: lineNum, col });
      current++;
      col++;
      continue;
    }
    
    if (char === '.') {
      tokens.push({ type: 'property', value: char, line: lineNum, col });
      current++;
      col++;
      continue;
    }
    
    tokens.push({ type: 'other', value: char, line: lineNum, col });
    current++;
    col++;
  }
  
  if (spaceBuffer.length > 0) {
    tokens.push({ type: 'other', value: spaceBuffer, line: lineNum, col: col - spaceBuffer.length });
  }
  
  return tokens;
}

// ===== Основной лексер =====
class DyLexer {
  rules: LexerRule[];
  lines: string[];

  constructor(lines: string[], rules: LexerRule[]) {
    this.lines = lines;
    this.rules = rules;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    
    while (i < this.lines.length) {
      const line = this.lines[i];
      let matchedType: TokenType | null = null;
      
      for (const rule of this.rules) {
        matchedType = rule.match(line);
        if (matchedType) break;
      }
      
      if (!matchedType) matchedType = 'raw';

      if (matchedType === 'arrow_func' || matchedType === 'block_arrow_func') {
        const arrowIndex = line.indexOf('=>');
        if (arrowIndex !== -1) {
          const afterArrow = line.slice(arrowIndex + 2).trim();
          const isBlockArrow = afterArrow.startsWith('{') || 
                             (afterArrow === '' && i + 1 < this.lines.length && 
                              this.lines[i + 1].trim().startsWith('{'));

          if (isBlockArrow) {
            const parentToken = new Token('block_arrow_func', line, i, []);
            tokens.push(parentToken);
            i++;
            
            let bodyStart = i;
            while (bodyStart < this.lines.length && this.lines[bodyStart].trim() === '') {
              bodyStart++;
            }
            
            if (bodyStart < this.lines.length && this.lines[bodyStart].trim().startsWith('{')) {
              i = bodyStart + 1;
            }
            
            while (i < this.lines.length) {
              const bodyLine = this.lines[i];
              if (bodyLine.trim() === '}') {
                parentToken.children.push(new Token('block_arrow_body', bodyLine, i));
                i++;
                break;
              }
              parentToken.children.push(new Token('block_arrow_body', bodyLine, i));
              i++;
            }
            continue;
          } else {
            const leftPart = line.slice(0, arrowIndex + 2);
            const bodyPart = line.slice(arrowIndex + 2);
            const parentToken = new Token('arrow_func', leftPart, i, []);
            parentToken.children.push(new Token('arrow_func_body', bodyPart, i));
            tokens.push(parentToken);
            i++;
            continue;
          }
        }
      }

      tokens.push(new Token(matchedType, line, i));
      i++;
    }
    
    return tokens;
  }
}

// ===== Вывод с подсветкой =====
function printWithSyntaxHighlighting(tokens: Token[], highlighter: SyntaxHighlighter) {
  const maxLineNumber = tokens.reduce((max, token) => 
    Math.max(max, token.line + 1, ...token.children.map(c => c.line + 1)), 0);
  const lineNumberWidth = maxLineNumber.toString().length;

  const formatLineNumber = (line: number) => {
    return highlighter.colorize(
      'lineNum',
      (line + 1).toString().padEnd(lineNumberWidth)
    );
  };

  for (const token of tokens) {
    if (token.type === 'raw') continue;

    const detailedTokens = tokenizeLine(token.value, token.line);
    let highlightedLine = '';
    
    for (const dt of detailedTokens) {
      let colorType: keyof SyntaxColorScheme;
      
      if (dt.type === 'other') {
        colorType = /\s/.test(dt.value) ? 'block_body' : 'block_body';
      } else {
        colorType = dt.type as keyof SyntaxColorScheme;
      }
      
      if (token.type === 'arrow_func' && dt.type === 'operator' && dt.value === '=>') {
        colorType = 'arrow_func';
      }
      
      highlightedLine += highlighter.colorize(colorType, dt.value);
    }

    console.log(`${formatLineNumber(token.line)} | ${highlightedLine}`);

    if (token.type === 'block_arrow_func') {
      for (const child of token.children) {
        const originalIndent: number = child.value.length - child.value.trimLeft().length;
        const visualIndent: string = ' '.repeat(originalIndent);
        
        const childTokens = tokenizeLine(child.value, child.line);
        let childHighlighted = visualIndent;
        
        for (const dt of childTokens) {
          let childColorType: keyof SyntaxColorScheme;
          
          if (dt.type === 'other') {
            childColorType = 'block_body';
          } else {
            childColorType = dt.type as keyof SyntaxColorScheme;
          }
          
          childHighlighted += highlighter.colorize(childColorType, dt.value);
        }
        
        console.log(`${formatLineNumber(child.line)} | ${childHighlighted}`);
      }
      console.log('-'.repeat(50));
    }
  }
}


// ===== Препроцессор =====
class DyPreprocessor {
  filename: string;
  lines: string[];
  transformers: TransformerFunc[] = [];

  constructor(filename: string) {
    if (!filename.endsWith('.dy')) {
      throw new Error('File extension must be .dy');
    }
    this.filename = filename;
    this.lines = fs.readFileSync(filename, 'utf-8').split(/\r?\n/);
  }

  registerTransformer(transformer: TransformerFunc) {
    this.transformers.push(transformer);
  }

  preprocess(): string[] {
    return this.transformers.reduce((lines, transformer) => transformer(lines), this.lines);
  }

  writePy(lines: string[]) {
    const pyPath = this.filename.slice(0, -3) + '.py';
    fs.writeFileSync(pyPath, lines.join('\n'), 'utf-8');
  }
}

// ===== Главная функция =====
function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: ts-node dy_preprocessor.ts <file.dy> [-d] [-e]');
    process.exit(1);
  }

  const debugMode = args.includes('-d');
  const execMode = args.includes('-e');
  const fileArg = args[0];

  const preprocessor = new DyPreprocessor(fileArg);
  const highlighter = new SyntaxHighlighter();

  const lexerRules: LexerRule[] = [
    new ArrowFunctionRule(),
    new BlockArrowFunctionRule(),
    new TernaryRule()
  ];

  const lexer = new DyLexer(preprocessor.lines, lexerRules);

  if (debugMode) {
    const tokens = lexer.tokenize();
    console.log(ansiBold + 'Токены с подсветкой синтаксиса:' + ANSI_COLORS.reset);
    printWithSyntaxHighlighting(tokens, highlighter);

    if (!execMode) {
      process.exit(0);
    }
    console.log('\n--- Начинаем преобразование ---\n');
  }

  // Трансформеры
  preprocessor.registerTransformer(lines =>
    lines.map(line => {
      const stripped = line.trim();
      if (stripped.includes('= (') && stripped.includes('=>')) {
        const eqIndex = line.indexOf('=');
        const arrowIndex = line.indexOf('=>');
        if (eqIndex !== -1 && arrowIndex !== -1 && eqIndex < arrowIndex) {
          const varPart = line.substring(0, eqIndex).trim();
          let argsPart = line.substring(eqIndex + 1, arrowIndex).trim();
          const exprPart = line.substring(arrowIndex + 2).trim();
          if (argsPart.startsWith('(') && argsPart.endsWith(')')) {
            argsPart = argsPart.slice(1, -1).trim();
            return `${varPart} = lambda ${argsPart}: ${exprPart}`;
          }
        }
      }
      return line;
    })
  );

  preprocessor.registerTransformer(lines => {
    const result: string[] = [];
    let inBlock = false;
    let blockIndent = '';

    for (const line of lines) {
      const stripped = line.trim();

      if (!inBlock && stripped.startsWith('const ') && stripped.includes('=> {')) {
        const leftPart = stripped.substring('const '.length, stripped.indexOf('=>')).trim();
        if (leftPart.includes('=')) {
          const [name, argsRaw] = leftPart.split('=', 2).map(s => s.trim());
          let args = argsRaw;
          if (args.startsWith('(') && args.endsWith(')')) {
            args = args.slice(1, -1).trim();
          }
          result.push(`def ${name}(${args}):`);
          inBlock = true;
          blockIndent = ' '.repeat(line.length - line.trimLeft().length + 4);
          continue;
        }
      }

      if (inBlock) {
        if (stripped === '}') {
          inBlock = false;
          continue;
        }
        result.push(blockIndent + line.trimLeft());
        continue;
      }

      result.push(line);
    }

    return result;
  });

  preprocessor.registerTransformer(lines =>
    lines.map(line => {
      if (line.includes('(') && line.includes('?') && line.includes(':') && line.includes(')')) {
        const start = line.indexOf('(');
        const end = line.lastIndexOf(')');
        if (start !== -1 && end !== -1 && end > start) {
          const inner = line.substring(start + 1, end);
          if (inner.includes('?') && inner.includes(':')) {
            const [cond, rest] = inner.split('?', 2);
            const [thenPart, elsePart] = rest.split(':', 2);
            const pythonExpr = `${thenPart.trim()} if ${cond.trim()} else ${elsePart.trim()}`;
            return line.substring(0, start) + pythonExpr + line.substring(end + 1);
          }
        }
      }
      return line;
    })
  );

  const newLines = preprocessor.preprocess();
  preprocessor.writePy(newLines);

  if (debugMode) {
    console.log(ansiBold + '\nПреобразованный код (.py):\n' + ANSI_COLORS.reset);
    console.log(newLines.join('\n'));
  }

  console.log('Преобразование завершено.');
}

if (require.main === module) {
  main();
}
