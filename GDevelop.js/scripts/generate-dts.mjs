// @ts-check
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const bindingsFile = readFileSync(
  __dirname + '/../Bindings/Bindings.idl',
  'utf-8'
);

const PrimitiveTypes = new Map([
  ['DOMString', 'string'],
  ['long', 'number'],
  ['double', 'number'],
  ['void', 'void'],
  ['boolean', 'boolean'],
]);

const none = Symbol('No default value');
class Parser {
  static parserPosition = 0;
  /** @private */
  static sourceString = '';
  /** @private */
  static sourceLength = 0;

  /** @param {string} str */
  static setSource(str) {
    this.parserPosition = 0;
    this.sourceString = str;
    this.sourceLength = str.length;
  }
  static get isDone() {
    return this.parserPosition >= this.sourceLength;
  }
  static get currentCharacter() {
    return this.sourceString.charAt(this.parserPosition);
  }
  static get currentCharacterCode() {
    return this.sourceString.charCodeAt(this.parserPosition);
  }

  static skipWhitespaces() {
    while (this.currentCharacterCode <= 32) this.parserPosition++;
    // Comments go everywhere whitespaces go and must be skipped as if it were whitespace
    if (this.currentCharacter === '/') {
      this.parserPosition++;
      if (this.currentCharacter === '/') {
        // //-style comments
        this.skipUntil('\n');
      } else if (this.currentCharacter === '*') {
        // /* */-style comments
        do {
          this.skipUntil('*');
        } while (this.currentCharacter !== '/');
        this.parserPosition++;
      } else console.warn(`Unexpected slash.`);
      this.skipWhitespaces();
    }
  }
  /** @param {string} thisCharacter */
  static skipUntil(thisCharacter, skipOverIt = true) {
    while (this.currentCharacter !== thisCharacter && !this.isDone)
      this.parserPosition++;
    if (skipOverIt) this.parserPosition++;
  }
  /** @param {string} thisCharacter */
  static readUntil(thisCharacter, skipOverIt = true) {
    let token = '';
    while (this.currentCharacter !== thisCharacter) {
      if (this.isDone)
        throw new Error(`Never reached character '${thisCharacter}'!`);
      token += this.currentCharacter;
      this.parserPosition++;
    }
    if (skipOverIt) this.parserPosition++;
    return token;
  }

  static readType() {
    // Ignore [Const] and such annotations
    Parser.skipWhitespaces();
    if (Parser.currentCharacter === '[') Parser.skipUntil(']');
    Parser.skipWhitespaces();

    // Read the type
    /** @type {string} */
    let type;
    let optional = false;
    let attribute = false;
    do {
      Parser.skipWhitespaces();
      type = Parser.readUntil(' ');
      if (type === 'optional') optional = true;
      if (type === 'attribute') attribute = true;
    } while (
      type === 'unsigned' ||
      type === 'optional' ||
      type === 'attribute'
    );
    Parser.skipWhitespaces();

    return { type, optional, attribute };
  }

  static readIdentifier() {
    let name = '';
    while (
      (Parser.currentCharacterCode >= 97 &&
        Parser.currentCharacterCode <= 122) || // [a-z]
      (Parser.currentCharacterCode >= 65 &&
        Parser.currentCharacterCode <= 90) || // [A-Z]
      (Parser.currentCharacterCode >= 48 &&
        Parser.currentCharacterCode <= 57) || // [1-9]
      Parser.currentCharacter === '_'
    ) {
      name += Parser.currentCharacter;
      Parser.parserPosition++;
    }
    return name;
  }

  static readNumber() {
    let number = '';
    while (
      Parser.currentCharacterCode >= 48 &&
      Parser.currentCharacterCode <= 57 // [1-9]
    ) {
      number += Parser.currentCharacter;
      Parser.parserPosition++;
    }
    return parseInt(number, 10);
  }
}

const enums = [];
for (const [_, enumName, enumCode] of bindingsFile.matchAll(
  /enum\s+([a-zA-Z_]+)\s+{\r?\n?([^}]*)\r?\n}/gm
)) {
  const members = [];
  let i = 0;
  for (const enumMemberString of enumCode.split('\n')) {
    const [_, memberName] = enumMemberString.match(/"[a-zA-Z]*::([a-zA-Z]*)"/);
    members.push(`  ${memberName} = ${i++},`);
  }
  enums.push(
    `export enum ${enumName} {
${members.join('\n')}
}`
  );
}

const interfaces = [];
for (const [_, interfaceName, interfaceCode] of bindingsFile.matchAll(
  /interface\s+([a-zA-Z0-9]+)\s+{(?:}|(?:\r?\n?([^}]*)\r?\n}))/gm
)) {
  if (!interfaceCode) {
    interfaces.push(
      `export class ${interfaceName} extends EmscriptenObject {}`
    );
    continue;
  }

  const methods = [];
  const attributes = [];

  Parser.setSource(interfaceCode);
  while (!Parser.isDone) {
    const {
      type: returnType,
      optional: optionalReturn,
      attribute: isAttribute,
    } = Parser.readType();

    if (isAttribute) {
      const attributeName = Parser.readUntil(';');
      attributes.push(
        `${attributeName}${optionalReturn ? '?' : ''}: ${returnType};`
      );
      continue;
    }

    let methodName = Parser.readUntil('(');
    const isStatic = methodName.includes('STATIC_');
    const isConstructor = returnType === 'void' && methodName === interfaceName;
    // Remove prefixes which are not part of the actual function name
    methodName = methodName
      .replace('WRAPPED_', '')
      .replace('MAP_', '')
      .replace('FREE_', '')
      .replace('CLONE_', '')
      .replace('STATIC_', '');
    // Convert PascalCase to camelCase
    methodName = methodName[0].toLowerCase() + methodName.slice(1);

    /** @type {Array<{name:string, type:string, optional:boolean, defaultValue:(number | typeof none)}>} */
    const parameters = [];
    Parser.skipWhitespaces();
    if (Parser.currentCharacter !== ')')
      do {
        if (Parser.currentCharacter === ',') Parser.parserPosition++;
        const { type, optional } = Parser.readType();
        Parser.skipWhitespaces();
        const name = Parser.readIdentifier();
        Parser.skipWhitespaces();

        let defaultValue = none;
        if (Parser.currentCharacter === '=') {
          Parser.parserPosition++;
          Parser.skipWhitespaces();
          defaultValue = Parser.readNumber();
          Parser.skipWhitespaces();
        }

        parameters.push({ name, type, optional, defaultValue });
      } while (Parser.currentCharacter === ',');

    // Health checks
    if (Parser.currentCharacter !== ')')
      console.warn('Expected closing paranthesis.');
    Parser.parserPosition++;
    Parser.skipWhitespaces();
    if (Parser.currentCharacter !== ';') console.warn('Expected semicolon.');
    Parser.parserPosition++;
    Parser.skipWhitespaces();

    methods.push(
      `${isStatic ? 'static ' : ''}${
        isConstructor ? `constructor` : methodName
      }(${parameters
        .map(
          ({ name, type, optional, defaultValue }) =>
            `${name}${optional ? '?' : ''}: ${
              PrimitiveTypes.has(type) ? PrimitiveTypes.get(type) : type
            }`
        )
        .join(', ')})${
        isConstructor
          ? ''
          : `: ${
              PrimitiveTypes.has(returnType)
                ? PrimitiveTypes.get(returnType)
                : returnType
            }`
      };`
    );
  }

  const inheritedClass = bindingsFile.match(
    new RegExp(`(?<![a-zA-Z0-9])${interfaceName} implements ([a-zA-Z0-9]+)`)
  );

  interfaces.push(
    `export class ${interfaceName} extends ${
      inheritedClass ? inheritedClass[1] : 'EmscriptenObject'
    } {${methods.length ? '\n  ' + methods.join('\n  ') : ''}${
      attributes.length ? '\n  ' + attributes.join('\n  ') : ''
    }
}`
  );
}

const dts = `// Automatically generated by GDevelop.js/scripts/generate-dts.js

declare class EmscriptenObject {
  /** The object's index in the WASM memory, and thus its unique identifier. */
  ptr: number;

  /** 
   * Call this to free the object's underlying memory. It may not be used afterwards. 
   * 
   * **Call with care** - if the object owns some other objects, those will also be destroyed, 
   * or if this object is owned by another object that does not expect it to be externally deleted 
   * (e.g. it is a child of a map), objects will be put in an invalid state that will most likely
   * crash the app.
   * 
   * If the object is owned by your code, you should still call this method when adequate, as 
   * otherwise the memory will never be freed, causing a memory leak, which is to be avoided.
   */
  destroy(): void;
}

${enums.join('\n\n')}

${interfaces.join('\n\n')}

export as namespace gd;

declare global {
  const gd: typeof gd;
}
`;

writeFileSync(__dirname + '/../types.d.ts', dts);
