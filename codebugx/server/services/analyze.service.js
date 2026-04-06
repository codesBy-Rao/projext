const detectLoopBoundaryError = (code) => {
  const pattern = /for\s*\([^;]*;\s*[^;]*<=\s*([a-zA-Z_$][\w$]*)\.length\s*;/m;
  if (pattern.test(code)) {
    return {
      type: 'loop boundary error',
      severity: 'high',
      topic: 'arrays & loops',
    };
  }
  return null;
};

const detectInfiniteLoop = (code) => {
  const patterns = [
    /while\s*\(\s*true\s*\)/m,
    /for\s*\(\s*;\s*;\s*\)/m,
    /for\s*\([^;]*;\s*[^;]+;\s*\)\s*\{?[\s\S]{0,220}?\}/m,
  ];

  if (patterns[0].test(code) || patterns[1].test(code)) {
    return {
      type: 'infinite loop',
      severity: 'high',
      topic: 'loop control',
    };
  }

  const genericForLoopMatch = code.match(patterns[2]);
  if (genericForLoopMatch) {
    const loopBody = genericForLoopMatch[0];
    const hasIncrement = /(\+\+|--|\+=|-=|=\s*[a-zA-Z_$][\w$]*\s*[+\-]\s*\d+)/m.test(loopBody);
    if (!hasIncrement) {
      return {
        type: 'infinite loop',
        severity: 'high',
        topic: 'loop control',
      };
    }
  }

  return null;
};

const getLikelyNonNullVariables = (code, language = 'javascript') => {
  const normalizedLanguage = String(language || '').toLowerCase();
  const names = new Set();

  // JavaScript/TypeScript declarations with concrete initializers.
  const jsDeclarationPattern = /\b(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:\[|\{|"|'|`|new\s+[a-zA-Z_$][\w$]*\s*\(|\d+|true|false|function\b|\([^)]*\)\s*=>)/g;
  let match;
  while ((match = jsDeclarationPattern.exec(code)) !== null) {
    names.add(match[1]);
  }

  // Java declarations with obvious non-null initializers.
  if (normalizedLanguage === 'java') {
    const javaDeclarationPattern = /\b(?:[A-Z][\w$<>]*|int|long|double|float|boolean|char|byte|short|String)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:new\b|"|'|\d+|true|false|\{|\[)/g;
    while ((match = javaDeclarationPattern.exec(code)) !== null) {
      names.add(match[1]);
    }
  }

  return names;
};

const detectNullAccessRisk = (code, language = 'javascript') => {
  const normalizedLanguage = String(language || '').toLowerCase();
  const accessPattern = /\b([a-zA-Z_$][\w$]*)\s*\.\s*([a-zA-Z_$][\w$]*)\b/g;
  const likelyNonNullVariables = getLikelyNonNullVariables(code, language);
  const ignoredReceivers = new Set([
    'this',
    'super',
    'console',
    'json',
    'math',
    'number',
    'string',
    'boolean',
    'array',
    'object',
    'date',
    'regexp',
    'process',
  ]);

  let match;
  while ((match = accessPattern.exec(code)) !== null) {
    const receiver = match[1];
    const property = match[2];
    const receiverLower = receiver.toLowerCase();

    if (ignoredReceivers.has(receiverLower)) {
      continue;
    }

    // Skip very common safe property reads on variables initialized with concrete values.
    if (likelyNonNullVariables.has(receiver)) {
      continue;
    }

    // Length is often used in loops; avoid noise unless receiver clearly looks nullable elsewhere.
    if (property === 'length' && !new RegExp(`\b${receiver}\s*=\s*null\b`, 'm').test(code)) {
      continue;
    }

    // In Java, class/static members usually begin with uppercase (e.g., System.out).
    if (normalizedLanguage === 'java' && /^[A-Z]/.test(receiver)) {
      continue;
    }

    const hasOptionalChaining = new RegExp(`\\b${receiver}\\?\\.`, 'm').test(code);
    const hasNullGuard = new RegExp(
      `\\bif\\s*\\(\\s*${receiver}\\s*(?:!==?|!=)\\s*null|\\bif\\s*\\(\\s*${receiver}\\s*\\)|\\bObjects\\.nonNull\\s*\\(\\s*${receiver}\\s*\\)`,
      'm',
    ).test(code);

    if (!hasOptionalChaining && !hasNullGuard) {
      return {
        type: 'null access risk',
        severity: 'medium',
        topic: 'null safety',
      };
    }
  }

  return null;
};

const detectMissingRecursionBaseCase = (code) => {
  const functionPattern = /function\s+([a-zA-Z_$][\w$]*)\s*\([^)]*\)\s*\{([\s\S]*?)\}/gm;
  let match;

  while ((match = functionPattern.exec(code)) !== null) {
    const functionName = match[1];
    const body = match[2];

    const recursiveCallPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'm');
    const hasRecursiveCall = recursiveCallPattern.test(body);
    if (!hasRecursiveCall) {
      continue;
    }

    const hasBaseCase = /(if\s*\(|return\s+[^;]+;)/m.test(body);
    if (!hasBaseCase) {
      return {
        type: 'recursion base case missing',
        severity: 'high',
        topic: 'recursion',
      };
    }
  }

  return null;
};

const analyzeCodeRules = (codeSnippet, language = 'javascript') => {
  const detections = [
    detectLoopBoundaryError(codeSnippet),
    detectInfiniteLoop(codeSnippet),
    detectNullAccessRisk(codeSnippet, language),
    detectMissingRecursionBaseCase(codeSnippet),
  ].filter(Boolean);

  return detections;
};

module.exports = {
  analyzeCodeRules,
};
