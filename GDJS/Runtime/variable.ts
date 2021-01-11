/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Children of a structure.
   */
  type Children = Record<string, gdjs.Variable>;

  /**
   * A Variable is an object storing a value (number or a string) or children variables.
   */
  export class Variable {
    _type: VariableType = 'number';
    _value: float = 0;
    _str: string = '0';
    _bool: boolean = false;
    _children: Children = {};
    _childrenList: gdjs.Variable[] = [];
    _undefinedInContainer: boolean = false;

    /**
     * @param {VariableData} [varData] The optional initial content of the variable.
     */
    constructor(varData?: VariableData) {
      this.reinitialize(varData);
    }

    reinitialize(varData?: VariableData | undefined) {
      this._type = 'number';
      this._value = 0;
      this._str = '0';
      this._bool = false;
      this._children = {};
      this._childrenList = [];
      this._undefinedInContainer = false;

      if (varData !== undefined) {
        this._type = varData.type || 'number';
        if (this._type === 'number') {
          this._value = parseFloat((varData.value as string) || '0');
          if (this._value !== this._value) this._value = 0;
        } else if (this._type === 'string') {
          this._str = '' + varData.value || '0';
        } else if (this._type === 'boolean') {
          this._bool = !!varData.value;
        } else if (this._type === 'structure') {
          if (varData.children !== undefined) {
            for (var i = 0, len = varData.children.length; i < len; ++i) {
              var childData = varData.children[i];
              if (childData.name === undefined) continue;
              this._children[childData.name] = new gdjs.Variable(childData);
            }
          }
        } else if (this._type === 'array' && varData.children) {
          for (const childData of varData.children)
            this._childrenList.push(new gdjs.Variable(childData));
        }
      }
    }

    /**
     * An internal JS object to variable function.
     * This is necessary for code generation.
     * @private
     */
    static _objectToVariable(obj: any, variable: gdjs.Variable) {
      if (obj === null) {
        variable.setString('null');
      } else if (
        (typeof obj === 'number' || typeof obj === 'string') &&
        !isNaN(obj as number)
      ) {
        variable.setNumber(obj as number);
      } else if (typeof obj === 'string') {
        variable.setString(obj);
      } else if (typeof obj === 'undefined') {
        // Do not modify the variable, as there is no value to set it to.
      } else if (typeof obj === 'boolean') {
        variable.setBoolean(obj);
      } else if (Array.isArray(obj)) {
        variable.castTo('array');
        variable.clearChildren();
        for (const i in obj) {
          gdjs.Variable._objectToVariable(obj[i], variable.getChild(i));
        }
      } else if (typeof obj === 'object') {
        variable.castTo('structure');
        variable.clearChildren();
        for (var p in obj) {
          if (obj.hasOwnProperty(p)) {
            gdjs.Variable._objectToVariable(
              obj[p],
              variable.getChild(p)
            );
          }
        }
      } else if (typeof obj === 'symbol') {
        variable.setString(obj.toString());
      } else if (typeof obj === 'number' && isNaN(obj)) {
        console.warn('Variables cannot be set to NaN, setting it to 0.');
        variable.setNumber(0);
      } else if (typeof obj === 'bigint') {
        if (obj > Number.MAX_SAFE_INTEGER)
          console.warn(
            'Integers bigger than ' +
              Number.MAX_SAFE_INTEGER +
              " aren't supported by variables, it will be reduced to that size."
          );
        // @ts-ignore
        variable.setNumber(parseInt(obj, 10));
      } else if (typeof obj === 'function') {
        console.error('Error: Impossible to set variable value to a function.');
      } else {
        console.error('Cannot identify type of object:', obj);
      }
      return variable;
    }

    /**
     * An internal JSON to variable function.
     * This is necessary for code generation.
     * @private
     */
    static _jsonToVariable(
      jsonStr: string,
      variable: gdjs.Variable
    ): gdjs.Variable {
      try {
        const obj = JSON.parse(jsonStr);
        return gdjs.Variable._objectToVariable(obj, variable);
      } catch (e) {
        // Return error message if JSON was not properly parsed.
        return gdjs.Variable._objectToVariable(
          'JSON parsing error:' + e,
          variable
        );
      }
    }

    /**
     * Creates a GDevelop variable from a JavaScript variable.
     * @param {any} obj
     * @return {gdjs.Variable}
     */
    static fromObject(obj: any): gdjs.Variable {
      return gdjs.Variable._objectToVariable(obj, new gdjs.Variable());
    }

    /**
     * Creates a GDevelop variable from a JSON string.
     * @param {string} jsonStr 
     */
    static fromJSON(jsonStr: string): gdjs.Variable {
      return gdjs.Variable._jsonToVariable(jsonStr, new gdjs.Variable())
    }

    /**
     * Convert a variable to JSON.
     * @param variable The variable to convert to JSON
     * @returns The JSON string representing the variable
     */
    static toJSON(variable: gdjs.Variable): string {
      if (variable.isPrimitive()) {
        return JSON.stringify(variable.getValue());
      } else if (variable.getType() === 'array') {
        let str = '[';
        let firstChild = true;
        const children = variable.getAllChildren();
        for (const p in children) {
          if (children.hasOwnProperty(p)) {
            if (!firstChild) {
              str += ',';
            }
            str += children[p].toJSON();
            firstChild = false;
          }
        }
        str += ']';
        return str;
      } else if (variable.getType() === 'structure') {
        let str = '{';
        let firstChild = true;
        const children = variable.getAllChildren();
        for (const p in children) {
          if (children.hasOwnProperty(p)) {
            if (!firstChild) {
              str += ',';
            }
            str +=
              JSON.stringify(p) +
              ': ' +
              children[p].toJSON();
            firstChild = false;
          }
        }
        str += '}';
        return str;
      }

      console.error('JSON conversion error: Variable type not recognized');
      return '';
    }

    /**
     * Return true if the variable type is a primitive type.
     * @param {VariableType} type
     * @return {boolean}
     */
    static isPrimitive(
      type: VariableType
    ): type is 'string' | 'number' | 'boolean' {
      return type === 'string' || type === 'number' || type === 'boolean';
    }

    /**
     * Convert this variable to JSON.
     * @returns The JSON string representing the variable
     */
    toJSON(): string {
      return gdjs.Variable.toJSON(this);
    }

    /**
     * Return true if the type of the variable is a primitive type.
     * @return {boolean}
     */
    isPrimitive() {
      return gdjs.Variable.isPrimitive(this._type);
    }

    /**
     * Used (usually by gdjs.VariablesContainer) to set that the variable must be
     * considered as not existing in the container.
     */
    setUndefinedInContainer() {
      this._undefinedInContainer = true;
    }

    /**
     * Check if the variable must be considered as not existing in its container
     * (usually a gdjs.VariablesContainer).
     * @return true if the container must consider that the variable does not exist.
     */
    isUndefinedInContainer(): boolean {
      return this._undefinedInContainer;
    }

    /**
     * Converts the variable into another type.
     * @param {VariableType} newType
     */
    castTo(newType: VariableType) {
      if (newType === 'string') this.setString(this.getAsString());
      else if (newType === 'number') this.setNumber(this.getAsNumber());
      else if (newType === 'boolean') this.setBoolean(this.getAsBoolean());
      else if (newType === 'structure') {
        if (this._type === 'structure') return;
        this._children = this.getAllChildren();
        this._type = 'structure';
      } else if (newType === 'array') {
        if (this._type === 'array') return;
        this._childrenList = this.getAllChildrenList();
        this._type = 'array';
      }
    }

    /**
     * Get the child with the specified name.
     *
     * If the variable has not the specified child, an empty variable with the specified name
     * is added as child.
     * @returns The child variable
     */
    getChild(childName: string | integer): gdjs.Variable {
      // Make sure the variable is a collection
      if (this.isPrimitive()) this.castTo('structure');

      if (this._type === 'array') {
        // Make sure the key is an integer for arrays
        childName = parseInt(childName as string, 10);
        // Prevent NaN to be used as key
        if (childName !== childName) childName = 0;

        if (this._childrenList[childName] === undefined)
          this._childrenList[childName] = new gdjs.Variable();
        return this._childrenList[childName];
      }

      if (this._children[childName] === undefined)
        this._children[childName] = new gdjs.Variable();
      return this._children[childName];
    }

    /**
     * Add a child variable with the specified name.
     *
     * If there is an existing child variable with this name, it is erased.
     * @param childName The name of the variable to add
     * @param childVariable The variable to add as a child
     * @returns The variable (for chaining calls)
     */
    addChild(childName: string, childVariable: gdjs.Variable): this {
      // Make sure this is a structure
      this.castTo('structure');
      this._children[childName] = childVariable;
      return this;
    }

    /**
     * Return the child in a variable.
     *
     * Check if the variable has the specified children
     * @return true if variable has the children with the specified name
     */
    hasChild(childName: string): boolean {
      return (
        this._type === 'structure' && this._children.hasOwnProperty(childName)
      );
    }

    /**
     * Remove the child with the specified name.
     *
     * If the variable has not the specified child, nothing is done.
     * @param childName The name of the child to be removed
     */
    removeChild(childName: string) {
      if (this._type !== 'structure') return;
      delete this._children[childName];
    }

    /**
     * Remove all the children.
     */
    clearChildren() {
      this._childrenList = [];
      this._children = {};
    }

    /**
     * Replaces all the children with a new map of children.
     * @param newChildren The map of new children.
     */
    replaceChildren(newChildren: Children) {
      this._type = 'structure';
      this._children = newChildren;
    }

    /**
     * Replaces all the children with a new array of children.
     * @param {gdjs.Variable[]} newChildren The array of new children.
     */
    replaceChildrenList(newChildren: gdjs.Variable[]) {
      this._type = 'array';
      this._childrenList = newChildren;
    }

    /**
     * Get the value of the variable, considered as a number
     * @return The number stored in the variable
     */
    getAsNumber(): float {
      if (this._type !== 'number') {
        let number = 0;
        if (this._type === 'string') number = parseFloat(this._str);
        else if (this._type === 'boolean') number = this._bool ? 1 : 0;

        return number === number ? number : 0; //Ensure NaN is not returned as a value.
      }

      return this._value;
    }

    /**
     * Change the value of the variable, considered as a number
     * @param newValue The new value to be set
     */
    setNumber(newValue: float) {
      this._type = 'number';
      //@ts-ignore parseFloat does accept numbers.
      newValue = parseFloat(newValue);
      this._value = newValue === newValue ? newValue : 0; // Prevent NaN
    }

    /**
     * Get the value of the variable, considered as a string
     * @return The string stored in the variable
     */
    getAsString(): string {
      if (this._type !== 'string') {
        if (this._type === 'number') return this._value.toString();
        else if (this._type === 'boolean') return this._bool ? 'true' : 'false';
        else if (this._type === 'structure') return '[Structure]';
        else if (this._type === 'array') return '[Array]';
        else return '';
      }

      return this._str;
    }

    /**
     * Change the value of the variable, considered as a string
     * @param newValue The new string to be set
     */
    setString(newValue: string): void {
      this._type = 'string';
      this._str = '' + newValue;
    }

    /**
     * Get the value of the variable, considered as a boolean
     * @return {boolean}
     */
    getAsBoolean(): boolean {
      if (this._type !== 'boolean') {
        if (this._type === 'number') return this._value !== 0;
        else if (this._type === 'string')
          return this._str !== '0' && this._str !== '' && this._str !== 'false';
        else return this.getChildrenCount() !== 0;
      }

      return this._bool;
    }

    /**
     * Change the value of the variable, considered as a boolean
     * @param {boolean} newValue
     */
    setBoolean(newValue: boolean) {
      this._type = 'boolean';
      this._bool = !!newValue;
    }

    /**
     * Gets the primitive value using the getter of the current type.
     * @param {any} newValue
     */
    getValue(): string | float | boolean {
      return this._type === 'number'
        ? this.getAsNumber()
        : this._type === 'boolean'
        ? this.getAsBoolean()
        : this.getAsString();
    }

    /**
     * Sets the primitive value using the setter of the current type.
     * @param {any} newValue
     */
    setValue(newValue: string | float | boolean) {
      if (this._type === 'string') this.setString(newValue as string);
      else if (this._type === 'number') this.setNumber(newValue as float);
      else if (this._type === 'boolean') this.setBoolean(newValue as boolean);
    }

    /**
     * Return true if the variable is a structure.
     * @return true if the variable is a structure.
     * @deprecated Use {@link gdjs.Variable.getType} instead.
     */
    isStructure(): boolean {
      return this._type === 'structure';
    }

    /**
     * Return true if the variable is a number.
     * @return true if the variable is a number.
     * @deprecated Use {@link gdjs.Variable.getType} instead.
     */
    isNumber(): boolean {
      return this._type === 'number';
    }

    /**
     * Returns the type of the variable.
     * @return {VariableType}
     */
    getType(): VariableType {
      return this._type;
    }

    /**
     * Return the object containing all the children of the variable
     * @return All the children of the variable
     */
    getAllChildren(): Children {
      return this._type === 'structure'
        ? this._children
        : this._type === 'array'
        ? ((Object.assign({}, this._childrenList) as unknown) as Children)
        : {};
    }

    /**
     * Return an Array containing all the children of the variable
     * @return {gdjs.Variable[]}
     */
    getAllChildrenList(): gdjs.Variable[] {
      return this._type === 'structure'
        ? Object.values(this._children)
        : this._type === 'array'
        ? this._childrenList
        : [];
    }

    /**
     * Return the length of the collection
     * @return {number}
     */
    getChildrenCount() {
      if (this.isPrimitive()) return 0;
      return this.getAllChildrenList().length;
    }

    /**
     * Add the given number to the variable value
     * @param val the number to add
     */
    add(val: float) {
      this.setNumber(this.getAsNumber() + val);
    }

    /**
     * Subtract the given number to the variable value
     * @param val the number to subtract
     */
    sub(val: float) {
      this.setNumber(this.getAsNumber() - val);
    }

    /**
     * Multiply the variable value by the given number
     * @param val the factor
     */
    mul(val: float) {
      this.setNumber(this.getAsNumber() * val);
    }

    /**
     * Divide the variable value by the given number
     * @param val the divisor
     */
    div(val: float) {
      this.setNumber(this.getAsNumber() / val);
    }

    /**
     * Concatenate the given string at the end of the variable value
     * @param str the string to append
     */
    concatenateString(str: string) {
      this.setString(this.getAsString() + str);
    }

    /**
     * @deprecated
     * @private
     * @alias concatenateString
     */
    concatenate = gdjs.Variable.prototype.concatenateString;

    /**
     * Removes a variable at a given index of the variable.
     * @param {number} index
     */
    removeAtIndex(index: integer) {
      this.castTo('array');
      this._childrenList.splice(index, 1);
    }

    /**
     * Pushes a variable onto the array.
     * @param {gdjs.Variable} variable
     */
    push(variable: gdjs.Variable) {
      this.castTo('array');
      this._childrenList.push(variable);
    }
  }
}
