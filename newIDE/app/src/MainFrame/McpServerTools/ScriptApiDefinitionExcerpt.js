// @flow

/**
 * The script API definition is about 140 KB: an agent writing a script
 * usually needs only the functions it calls. The definition starts with the
 * types shared by the functions, then each function is declared after its
 * result type and its documentation.
 */

type FunctionDeclaration = {| name: string, text: string |};

type SplitScriptApiDefinition = {|
  sharedTypes: string,
  functionDeclarations: Array<FunctionDeclaration>,
|};

const declarationStartRegex = /^declare function (\w+)\(/;

// A function is declared right after its result type and its documentation,
// with no blank line between them.
const getDeclarationFirstLineIndex = (
  lines: Array<string>,
  declarationLineIndex: number
): number => {
  let firstLineIndex = declarationLineIndex;
  while (firstLineIndex > 0 && lines[firstLineIndex - 1].trim() !== '')
    firstLineIndex--;
  return firstLineIndex;
};

export const splitScriptApiDefinition = (
  scriptApiDefinition: string
): SplitScriptApiDefinition => {
  const lines = scriptApiDefinition.split('\n');
  const functionDeclarations: Array<FunctionDeclaration> = [];
  let sharedTypesLineCount: number | null = null;
  lines.forEach((line, lineIndex) => {
    const match = line.match(declarationStartRegex);
    if (!match) return;
    const firstLineIndex = getDeclarationFirstLineIndex(lines, lineIndex);
    if (sharedTypesLineCount === null) sharedTypesLineCount = firstLineIndex;
    let lastLineIndex = lineIndex;
    while (
      lastLineIndex < lines.length - 1 &&
      !lines[lastLineIndex].startsWith('})')
    )
      lastLineIndex++;
    functionDeclarations.push({
      name: match[1],
      text: lines.slice(firstLineIndex, lastLineIndex + 1).join('\n'),
    });
  });
  return {
    sharedTypes: lines
      .slice(
        0,
        sharedTypesLineCount === null ? lines.length : sharedTypesLineCount
      )
      .join('\n')
      .trim(),
    functionDeclarations,
  };
};

/**
 * The shared types and the declarations of the given functions, or the whole
 * definition when no function is given.
 */
export const getScriptApiDefinitionExcerpt = (
  scriptApiDefinition: string,
  functionNamesList: string
): string => {
  const functionNames = functionNamesList
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
  if (!functionNames.length) return scriptApiDefinition;
  const { sharedTypes, functionDeclarations } = splitScriptApiDefinition(
    scriptApiDefinition
  );
  const declarations = functionDeclarations.filter(({ name }) =>
    functionNames.includes(name)
  );
  const unknownFunctionNames = functionNames.filter(
    functionName =>
      !functionDeclarations.some(({ name }) => name === functionName)
  );
  return [
    sharedTypes,
    ...declarations.map(({ text }) => text),
    ...(unknownFunctionNames.length
      ? [
          `// No function named ${unknownFunctionNames.join(
            ', '
          )}. The functions a script can call are: ${functionDeclarations
            .map(({ name }) => name)
            .join(', ')}.`,
        ]
      : []),
  ].join('\n\n');
};
