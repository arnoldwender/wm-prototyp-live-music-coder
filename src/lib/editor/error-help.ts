/* ──────────────────────────────────────────────────────────
   Beginner-friendly error messages — translates cryptic JS errors
   into actionable explanations with fix suggestions.
   ────────────────────────────────────────────────────────── */

interface FriendlyError {
  title: string;
  explanation: string;
  fix: string;
}

/* Pattern-based error translations */
const ERROR_PATTERNS: { pattern: RegExp; handler: (match: RegExpMatchArray, raw: string) => FriendlyError }[] = [
  {
    pattern: /Identifier '(\w+)' has already been declared/,
    handler: (m) => ({
      title: `"${m[1]}" already exists`,
      explanation: `You already created a variable called "${m[1]}" above. Each "const" or "let" can only be used once per name.`,
      fix: `Remove the "const" or "let" and just use "${m[1]} = ..." to update it, or give it a new name like "${m[1]}2".`,
    }),
  },
  {
    pattern: /(\w+) is not defined/,
    handler: (m) => ({
      title: `"${m[1]}" doesn't exist`,
      explanation: `The code uses "${m[1]}" but it hasn't been created yet. Check the spelling or make sure you defined it first.`,
      fix: m[1] === 'Tone' ? 'Switch to the Synths (Tone.js) engine to use Tone.'
        : m[1] === 'ctx' ? 'Switch to the Raw Audio (WebAudio) engine to use ctx.'
        : `Make sure "${m[1]}" is defined before you use it (e.g., const ${m[1]} = ...).`,
    }),
  },
  {
    pattern: /Unexpected token '?:?([^']*)'?/,
    handler: (m) => ({
      title: 'Syntax error',
      explanation: `There's a typo or wrong character "${m[1] || '?'}" in your code. JavaScript doesn't understand this part.`,
      fix: 'Check for missing quotes, brackets, or semicolons near the error.',
    }),
  },
  {
    pattern: /Cannot read propert(?:y|ies) of (undefined|null)/,
    handler: () => ({
      title: 'Missing value',
      explanation: 'The code tries to use something that doesn\'t exist yet. A variable might be empty or a function didn\'t return what you expected.',
      fix: 'Check that all variables are created before you use them, and that function calls are correct.',
    }),
  },
  {
    pattern: /is not a function/,
    handler: (_m) => ({
      title: 'Not a function',
      explanation: `The code tries to call something as a function, but it isn't one. Check the spelling and the engine you're using.`,
      fix: 'Make sure you\'re using the right syntax for your selected engine (Strudel/Tone.js/WebAudio).',
    }),
  },
  {
    pattern: /Assignment to constant variable/,
    handler: () => ({
      title: 'Can\'t change a constant',
      explanation: 'You declared a variable with "const" which means it can\'t be changed. ',
      fix: 'Use "let" instead of "const" if you need to change the value later.',
    }),
  },
  {
    pattern: /Missing initializer in const declaration/,
    handler: () => ({
      title: 'Missing value',
      explanation: 'You wrote "const" without giving it a value.',
      fix: 'Add "= value" after your variable name, e.g., const myVar = 42;',
    }),
  },
  {
    pattern: /Unexpected end of input/,
    handler: () => ({
      title: 'Code is incomplete',
      explanation: 'The code ends too early. You\'re probably missing a closing bracket, parenthesis, or quote.',
      fix: 'Check that every { has a }, every ( has a ), and every " has a matching ".',
    }),
  },
  {
    pattern: /Invalid or unexpected token/,
    handler: () => ({
      title: 'Invalid character',
      explanation: 'There\'s a character in your code that JavaScript doesn\'t recognize. This often happens when pasting text from a word processor.',
      fix: 'Check for "smart quotes" (curly quotes), special dashes, or invisible characters. Delete and retype the problematic area.',
    }),
  },
];

/**
 * Translate a raw JS error message into a beginner-friendly explanation.
 * Returns null if no friendly translation is available.
 */
export function getFriendlyError(rawError: string): FriendlyError | null {
  for (const { pattern, handler } of ERROR_PATTERNS) {
    const match = rawError.match(pattern);
    if (match) return handler(match, rawError);
  }
  return null;
}
