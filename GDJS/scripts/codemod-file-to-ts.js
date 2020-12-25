const shell = require('shelljs');
const fs = require('fs').promises;
const path = require('path');
const { transform } = require('lebab');
const args = require('minimist')(process.argv.slice(2), {
  string: ['file'],
});

const sourcePath = path.resolve(__dirname, args['file'] || '');
if (path.extname(sourcePath) !== '.js') {
  shell.echo(`❌ Source file (--file) should be a .js file`);
  shell.exit(1);
}
const outPath = path.join(
  path.dirname(sourcePath),
  path.basename(sourcePath, '.js') + '.ts'
);

const nthIndexOf = (str, character, n) => {
  var i = -1;

  while (n-- && i++ < str.length) {
    i = str.indexOf(character, i);
    if (i < 0) break;
  }

  return i;
};

const translateTypedefs = (code) => {
  let transformedCode = code;
  while (true) {
    const objectTypedefRegex = /\/\*\s+\* @typedef \{Object\} (\w+) *(.*)/;
    const typedefStartPosition = transformedCode.search(objectTypedefRegex);
    if (typedefStartPosition === -1) break;

    const endMarker = '*/';
    const typedefEndPosition = transformedCode.indexOf(
      endMarker,
      typedefStartPosition
    );
    if (typedefEndPosition === -1) {
      throw new Error('Could not find a typedef ending');
    }

    transformedCode =
      transformedCode.slice(0, typedefEndPosition) +
      '};' +
      transformedCode.slice(typedefEndPosition + endMarker.length);
    transformedCode = transformedCode.replace(
      objectTypedefRegex,
      '/** $2 */ \nexport type $1 = {'
    );

    while (true) {
      const nextPropertyRegex = /\*\s+@property\s+\{([^\}]+)\}\s+(\[)?(\w+)(\])?\s*(.*)/;
      const nextPropertyPosition = transformedCode.search(nextPropertyRegex);
      if (
        nextPropertyPosition === -1 ||
        nextPropertyPosition > typedefEndPosition
      )
        break;

      // TODO: handle optional property
      transformedCode = transformedCode
        .replace(nextPropertyRegex, '/** $5 */\n $3: $1;')
        .replace(/(\w+)\: (\w+)\=\;\n/, '$1?: $2;\n');
    }
  }

  transformedCode = transformedCode.replace(
    /\/\*[\s\*]+ @typedef \{(.*)\} (\w+)[\s\*]+\*\//,
    'export type $2 = $1;\n'
  );

  return transformedCode;
};

const identifyClassNames = (code) => {
  var classNameRegex = /gdjs\.(\w+) = function ?\(/g;
  const classNames = [];
  let match;

  const isClass = (name) => {
    return name && name[0] === name[0].toUpperCase();
  }

  do {
    match = classNameRegex.exec(code);
    if (match && isClass(match[1])) {
      classNames.push(match[1]);
    }
  } while (match);

  return classNames;
};

(async () => {
  const fileContent = await fs.readFile(sourcePath, 'utf-8');
  let modifiedFileContent = fileContent;

  const classNames = identifyClassNames(fileContent);
  shell.echo(`ℹ️ Found classes: ${classNames.join(', ') || 'none'}`);

  // Replace "namespaced" gdjs class names so that they can be transformed
  classNames.forEach((className) => {
    modifiedFileContent = modifiedFileContent
      // Fix the constructor
      .replace(
        new RegExp(`gdjs\\.${className} = function`),
        `var ${className} = function`
      )
      // Fix the methods/statics/any property
      .replace(new RegExp(`gdjs\\.${className}\\.`, 'g'), className + '.');
  });

  // Run lebab to transform the classes
  let { code, warnings } = transform(modifiedFileContent, ['class', 'let']);
  console.log('ℹ️ Warnings:', warnings);

  // Identify the parameters of the constructor and move them to the constructor function
  // (not done by lebab).
  const constructorParametersRegex = new RegExp(
    /(?<parameters>( \* @param \{.*\}.*\s)+)[\S\s]+\*\/\s+class/,
    ''
  );
  const constructorParametersMatches = code.match(constructorParametersRegex);
  if (constructorParametersMatches) {
    const parameters = constructorParametersMatches.groups.parameters;
    shell.echo(`ℹ️ Found constructor parameters:\n` + parameters);
    code = code
      .replace(parameters, '')
      .replace(' constructor(', `/**\n${parameters} */\n constructor(`);
  } else {
    shell.echo(`ℹ️ Could not find any constructor parameters`);
  }

  // Change from [] to Array<> as it's not recognized properly otherwise by gents:
  code = code.replace(/ \{([\w.]+)\[\]\} /g, ' {Array<$1>} ');

  // Save typedefs from being erased when running gents:
  code = code.replace(/\/\*\*\s+\* @typedef /g, '/*\n * @typedef ');

  await fs.writeFile(outPath, code, 'utf-8');

  // Run gents to convert from JSDoc typings to TypeScript annotations:
  const fileName = path.basename(outPath);
  const output = shell.exec(
    `/Users/florian/Projects/F/clutz/build/install/clutz/bin/gents --convert "${fileName}"`,
    {
      cwd: path.dirname(outPath),
      silent: true,
    }
  );

  console.warn(output.stderr);

  // Skip the header:
  const typedCode = output.stdout;
  const headerEndPosition = nthIndexOf(typedCode, '\n', 3);
  if (headerEndPosition === -1) {
    shell.echo(
      `❌ Unable to find the header to skip in transformed ${sourcePath}.`
    );
    return;
  }
  const typedCodeWithoutHeader = output.stdout.slice(headerEndPosition + 1);

  // Export the classes
  let typedCodeWithExports = typedCodeWithoutHeader;
  classNames.forEach((className) => {
    typedCodeWithExports = typedCodeWithExports.replace(
      new RegExp(`\\nclass ${className}`),
      `\nexport class ${className}`
    );
  });

  // Add known types:
  let cleanedTypedCode = typedCodeWithExports
    .replace('// @ts-check', '')
    // Start with specific typings:
    .replace(/(runtimeScene): any/gi, '$1: gdjs.RuntimeScene')
    .replace(/(runtimeGame): any/gi, '$1: gdjs.RuntimeGame')
    .replace(/(runtimeBehavior): any/gi, '$1: gdjs.RuntimeBehavior')
    .replace(/(followBaseLayerCamera): any/gi, '$1: boolean')
    .replace(/(hotReloader): any/gi, '$1: gdjs.HotReloader')
    .replace(/Promise\<undefined\>/g, 'Promise<void>')
    // Fix wrong typings:
    .replace(/getClearColor\(\): number/g, 'getClearColor(): Array<integer>')
    // Fix (or add) getter function return types. Search for two spaces
    // at the beginning to avoid confusing with function calls.
    .replace(/(  get.*Name\(.*\))(: any)? {/g, '$1: string {')
    .replace(/(  get.*ZOrder\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*TimeScale\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*ElapsedTime\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*ZoomFactor\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*Zoom\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*Rotation\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*Angle\(.*\))(: (any|number))? {/gi, '$1: float {')
    .replace(/(  get.*Width\(.*\))(: (any|number))? {/g, '$1: float {')
    .replace(/(  get.*Height\(.*\))(: (any|number))? {/g, '$1: float {')
    .replace(/(  get.*Count\(.*\))(: (any|number))? {/g, '$1: integer {')
    .replace(/(  get.*X\(.*\))(: (any|number))? {/g, '$1: float {')
    .replace(/(  get.*Y\(.*\))(: (any|number))? {/g, '$1: float {')
    .replace(/(  get.*Id\(.*\))(: (any|number))? {/g, '$1: integer {')
    .replace(/(  get\w*String\(.*\))(: any)? {/g, '$1: string {')
    .replace(/(  get\w*Time\(.*\))(: (any|number))? {/g, '$1: float {')
    .replace(/(  return.*Variable\(.*\))(: any)? {/g, '$1: gdjs.Variable {')
    .replace(/(  is\w*\(.*\))(: any)? {/g, '$1: boolean {')
    .replace(/(  has\w*\(.*\))(: any)? {/g, '$1: boolean {')
    // Fix (or add) setter function return types. Search for two spaces
    // at the beginning to avoid confusing with function calls.
    .replace(/(  set\w*ZOrder\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*Width\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*Height\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*Angle\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*X\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*Y\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*String\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  set\w*Time\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  updateFromBehaviorData\(.*\))(: any)? {/g, '$1: boolean {')
    .replace(/(  updateFromObjectData\(.*\))(: any)? {/g, '$1: boolean {')
    .replace(/(  update.*\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  show\w*\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  hide\w*\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  reset\w*\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  deleteFromScene\w*\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  onDestroyFromScene\w*\(.*\))(: any)? {/g, '$1: void {')
    .replace(/(  enable\w*\(.*\))(: any)? {/g, '$1: void {')
    // Members:
    .replace(/(\w*): any = (\d)/g, '$1: number = $2')
    .replace(/(\w*): any = (true|false)/g, '$1: boolean = $2')
    // More generic parameters:
    .replace(/hidden: any/g, 'hidden: boolean')
    .replace(/enable: any/g, 'enable: boolean')
    .replace(/type: any/g, 'type: string')
    .replace(/nameId: any/g, 'nameId: integer')
    .replace(/(cameraId\??): (number|any)/gi, '$1: integer')
    .replace(/(clearColor): any/gi, '$1: Array<integer>')
    .replace(/(zOrder): (any|number)/gi, '$1: integer')
    .replace(/(timeScale): (any|number)/gi, '$1: float')
    .replace(/(elapsedTime): (any|number)/gi, '$1: float')
    .replace(/(zoomFactor): (any|number)/gi, '$1: float')
    .replace(/(zoom): (any|number)/gi, '$1: float')
    .replace(/(rotation): (any|number)/gi, '$1: float')
    .replace(/(angle): (any|number)/gi, '$1: float')
    .replace(/(resolutionWidth): (any|number)/gi, '$1: integer')
    .replace(/(resolutionHeight): (any|number)/gi, '$1: integer')
    .replace(/(cameraX): (any|number)/gi, '$1: float')
    .replace(/(cameraY): (any|number)/gi, '$1: float')
    .replace(/(r|g|b): number/g, '$1: integer')
    // The "less precise" replacements are done at the end:
    .replace(/(_\w*EffectsData): (any)/gi, '$1: Array<EffectsData>')
    .replace(/(width): (any|number)/gi, '$1: float')
    .replace(/(height): (any|number)/gi, '$1: float')
    .replace(/(time): (any|number)/gi, '$1: float')
    .replace(/(name): any/gi, '$1: string')
    .replace(/(_is.*): any/gi, '$1: boolean')
    .replace(/x: number/g, 'x: float')
    .replace(/y: number/g, 'y: float')
    .replace(/: String(( {)|,|\))/g, ': string$1')
    .replace(/(value): number/gi, '$1: float')
    // Add ": void" as the return type of setters, at the very end.
    .replace(/(  set\w*\(.*\)) {/g, '$1: void {');

  // Other adhoc generic fixes
  cleanedTypedCode = cleanedTypedCode.replace('const i = 0,', 'let i = 0,');

  if (fileName === 'runtimegame.ts') {
    cleanedTypedCode = cleanedTypedCode
      .replace(
        '_adaptGameResolutionAtRuntime: float',
        '_adaptGameResolutionAtRuntime: boolean'
      )
      .replace('options?: RuntimeGameOptions', 'options: RuntimeGameOptions')
      .replace('let sessionId = null;', 'let sessionId: string | null = null;');
  }
  if (fileName === 'variablescontainer.ts') {
    cleanedTypedCode = cleanedTypedCode
      .replace(
        `}
VariablesContainer._deletedVars = VariablesContainer._deletedVars || [];`,
        'static _deletedVars: Array<string | undefined> = [];'
      )
      .replace(
        `VariablesContainer.badVariablesContainer = {`,
        'static badVariablesContainer = {'
      )
      .replace(`VariablesContainer.badVariable = {`, 'static badVariable = {')
      .replace(
        /isUndefinedInContainer\:\s*function\(\) \{\s*return;\s*\}\};/,
        `isUndefinedInContainer : function() { return; }\n};\n}`
      );
  }

  // Add back the gdjs namespace:
  const classStartPosition = cleanedTypedCode.indexOf('class ');
  const exportClassStartPosition = cleanedTypedCode.indexOf('export class ');
  const firstCommentEndingPosition = cleanedTypedCode.indexOf('*/') + 3;
  const firstJsDocStartPosition = cleanedTypedCode.indexOf('/**');
  let namespacePosition = Math.min(
    classStartPosition !== -1 ? classStartPosition : Number.MAX_SAFE_INTEGER,
    exportClassStartPosition !== -1
      ? exportClassStartPosition
      : Number.MAX_SAFE_INTEGER,
    firstCommentEndingPosition !== -1
      ? firstCommentEndingPosition
      : Number.MAX_SAFE_INTEGER,
    firstJsDocStartPosition !== -1
      ? firstJsDocStartPosition
      : Number.MAX_SAFE_INTEGER
  );
  if (namespacePosition === -1) {
    shell.echo(
      `⚠️ Could not find where to start the namespace, assuming beginning of the file.`
    );
    namespacePosition = 0;
  }

  const cleanedNamespacedTypedCode =
    cleanedTypedCode.slice(0, namespacePosition) +
    '\nnamespace gdjs {\n' +
    cleanedTypedCode.slice(namespacePosition) +
    '\n}\n';

  const cleanedNamespacedTypedefsTypedCode = translateTypedefs(
    cleanedNamespacedTypedCode
  );

  await fs.writeFile(outPath, cleanedNamespacedTypedefsTypedCode, 'utf-8');
})();
