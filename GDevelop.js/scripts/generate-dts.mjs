// @ts-check
import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
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
  static i = 0;
  /** @private */
  static str = '';
  /** @private */
  static l = 0;

  /** @param {string} str */
  static set target(str) {
    this.i = 0;
    this.str = str;
    this.l = str.length;
  }
  static get done() {
    return this.i >= this.l;
  }
  static get c() {
    return this.str.charAt(this.i);
  }
  static get cc() {
    return this.str.charCodeAt(this.i);
  }
  static skipWhitespaces() {
    while (this.cc <= 32) this.i++;
    // Comments go everywhere whitespaces go and must be skipped as if it were whitespace
    if (this.c === '/') {
      this.i++;
      if (this.c === '/') {
        // //-style comments
        this.skipUntil('\n');
      } else if (this.c === '*') {
        // /* */-style comments
        do {
          this.skipUntil('*');
        } while (this.c !== '/');
        this.i++;
      } else console.warn(`Unexpected slash!`);
      this.skipWhitespaces();
    }
  }
  /** @param {string} thisCharacter */
  static skipUntil(thisCharacter, skipOverIt = true) {
    while (this.c !== thisCharacter && !this.done) this.i++;
    if (skipOverIt) this.i++;
  }
  /** @param {string} thisCharacter */
  static readUntil(thisCharacter, skipOverIt = true) {
    let token = '';
    while (this.c !== thisCharacter) {
      token += this.c;
      this.i++;
    }
    if (skipOverIt) this.i++;
    return token;
  }

  static readType() {
    // Ignore [Const] and such annotations
    Parser.skipWhitespaces();
    if (Parser.c === '[') Parser.skipUntil(']');
    Parser.skipWhitespaces();

    // Read the type
    let type = Parser.readUntil(' ');
    let optional = false;
    if (type === 'optional') optional = true;
    while (type === 'unsigned' || type === 'optional') {
      // Re-read the type since unsigned is an unnecessary prefix for typescript
      Parser.skipWhitespaces();
      type = Parser.readUntil(' ');
    }
    Parser.skipWhitespaces();

    return { type, optional };
  }

  static readIdentifier() {
    let name = '';
    while (
      (Parser.cc >= 97 && Parser.cc <= 122) || // [a-z]
      (Parser.cc >= 65 && Parser.cc <= 90) || // [A-Z]
      (Parser.cc >= 48 && Parser.cc <= 57) || // [1-9]
      Parser.c === '_'
    ) {
      name += Parser.c;
      Parser.i++;
    }
    return name;
  }

  static readNumber() {
    let number = '';
    while (
      Parser.cc >= 48 &&
      Parser.cc <= 57 // [1-9]
    ) {
      number += Parser.c;
      Parser.i++;
    }
    return parseInt(number, 10);
  }
}

const interfaces = [];
for (const [a, interfaceName, interfaceCode] of bindingsFile.matchAll(
  /interface ([a-zA-Z]+) {\r?\n?([^}]*)\r?\n}/gm
)) {
  const methods = [];

  Parser.target = interfaceCode;
  while (!Parser.done) {
    const { type: returnType, optional: optionalReturn } = Parser.readType();
    const methodName = Parser.readUntil('(');
    const isConstructor = returnType === 'void' && methodName === interfaceName;

    /** @type {Array<{name:string, type:string, optional:boolean, defaultValue:(number | typeof none)}>} */
    const parameters = [];
    Parser.skipWhitespaces();
    if (Parser.c !== ')')
      do {
        if (Parser.c === ',') Parser.i++;
        const { type, optional } = Parser.readType();
        Parser.skipWhitespaces();
        const name = Parser.readIdentifier();
        Parser.skipWhitespaces();

        let defaultValue = none;
        if (Parser.c === '=') {
          Parser.i++;
          Parser.skipWhitespaces();
          defaultValue = Parser.readNumber();
          Parser.skipWhitespaces();
        }

        parameters.push({ name, type, optional, defaultValue });
      } while (Parser.c === ',');

    // Health checks
    if (!(Parser.c === ')')) console.warn('Expected closing paranthesis!');
    Parser.i++;
    Parser.skipWhitespaces();
    if (!(Parser.c === ';')) console.warn('Expected semicolon!');
    Parser.i++;
    Parser.skipWhitespaces();

    methods.push(
      `${isConstructor ? `constructor` : methodName}(${parameters
        .map(
          ({ name, type, optional, defaultValue }) =>
            `${name}${optional ? '?' : ''}: ${
              PrimitiveTypes.has(type) ? PrimitiveTypes.get(type) : type
            }${defaultValue !== none ? ` = ${defaultValue}` : ''}`
        )
        .join(', ')}): ${
        PrimitiveTypes.has(returnType)
          ? PrimitiveTypes.get(returnType)
          : returnType
      };`
    );
  }

  interfaces.push(
    `export class ${interfaceName} extends EmObject {
  ${methods.join('\n  ')}
}`
  );
}

const dts = `// Automatically generated by GDevelop.js/scripts/generate-dts.js

class EmObject {
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
   * WIth that said, be careful to do call this method when adequate, as otherwise the memory will 
   * never be freed, causing a memory leak, which is to be avoided.
   */
  destroy(): void;
}

${interfaces.join('\n\n')}

export as namespace gd;
`;

writeFileSync(__dirname + '/../types.d.ts', dts);
