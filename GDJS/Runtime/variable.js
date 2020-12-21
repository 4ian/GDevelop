// @ts-check

/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @typedef {"string" | "number" | "boolean" | "structure" | "array"} VariableType The type of a variable.
 */

/**
 * @typedef {Object} VariableData Data representation of a GDevelop variable.
 *
 * @property {string} [name] The name of the variable. Used if a child variable. Leave blank for Array children.
 * @property {string} [value] The value of the variable, either string or number. Leave blank for collections.
 * @property {Array<VariableData>} [children] The children of the structure. Leave blank if value is primitive.
 * @property {VariableType} type The type of the variable.
 */

/**
 * A Variable is an object storing a value (number or a string) or children variables.
 *
 * @memberOf gdjs
 * @class Variable
 * @param {VariableData} [varData] The optional initial content of the variable.
 */
gdjs.Variable = function (varData) {
  /** @type {VariableType} */
  this._type = 'number';
  /** @type {number} */
  this._value = 0;
  /** @type {string} */
  this._str = '0';
  /** @type {boolean} */
  this._bool = false;
  /** @type {Object.<string, gdjs.Variable>} */
  this._children = {};
  /** @type {gdjs.Variable[]} */
  this._childrenList = [];
  /** @type {boolean} */
  this._undefinedInContainer = false;

  if (varData !== undefined) {
    this._type = varData.type || 'number';
    if (this._type === 'number') {
      this._value = parseFloat(varData.value);
      if (this._value !== this._value) this._value = 0;
    } else if (this._type === 'string') {
      this._str = varData.value;
    } else if (this._type === 'boolean') {
      this._bool = !!varData.value;
    } else if (this._type === 'structure') {
      if (varData.children !== undefined) {
        for (var i = 0, len = varData.children.length; i < len; ++i) {
          var childData = varData.children[i];
          this._children[childData.name] = new gdjs.Variable(childData);
        }
      }
    } else if (this._type === 'array') {
      for (const childData of varData.children)
        this._childrenList.push(new gdjs.Variable(childData));
    }
  }
};

/**
 * Return true if the variable type is a primitive type.
 * @param {VariableType} type
 * @return {boolean}
 */
gdjs.Variable.isPrimitive = function (type) {
  return type === 'string' || type === 'number' || type === 'boolean';
};

/**
 * Used (usually by gdjs.VariablesContainer) to set that the variable must be
 * considered as not existing in the container.
 * @private
 */
gdjs.Variable.prototype.setUndefinedInContainer = function () {
  this._undefinedInContainer = true;
};

/**
 * Check if the variable must be considered as not existing in its container
 * (usually a gdjs.VariablesContainer).
 * @private
 * @return {boolean} true if the container must consider that the variable does not exist.
 */
gdjs.Variable.prototype.isUndefinedInContainer = function () {
  return this._undefinedInContainer;
};

/**
 * Get the child with the specified name.
 *
 * If the variable has not the specified child, an empty variable with the specified name
 * is added as child.
 * @returns {gdjs.Variable} The child variable
 */
gdjs.Variable.prototype.getChild = function (childName) {
  if (
    this._children.hasOwnProperty(childName) &&
    this._children[childName] !== undefined
  )
    return this._children[childName];

  this._type = 'structure';
  this._children[childName] = new gdjs.Variable();
  return this._children[childName];
};

/**
 * Add a child variable with the specified name.
 *
 * If there is an existing child variable with this name, it is erased.
 * @param {string} childName The name of the variable to add
 * @param {gdjs.Variable} childVariable The variable to add as a child
 * @returns {gdjs.Variable} The variable (for chaining calls)
 */
gdjs.Variable.prototype.addChild = function (childName, childVariable) {
  this._type = 'structure';
  this._children[childName] = childVariable;
  return this;
};

/**
 * Return the child in a variable.
 *
 * Check if the variable has the specified children
 * @return {boolean} true if variable has the children with the specified name
 */
gdjs.Variable.prototype.hasChild = function (childName) {
  return this._type === 'structure' && this._children.hasOwnProperty(childName);
};

/**
 * Remove the child with the specified name.
 *
 * If the variable has not the specified child, nothing is done.
 * @param {string} childName The name of the child to be removed
 */
gdjs.Variable.prototype.removeChild = function (childName) {
  if (this._type !== 'structure') return;
  delete this._children[childName];
};

/**
 * Remove all the children.
 *
 * If the variable is not a structure, nothing is done.
 */
gdjs.Variable.prototype.clearChildren = function () {
  if (this._type !== 'structure') return;

  for (var child in this._children) {
    if (this._children.hasOwnProperty(child)) {
      delete this._children[child];
    }
  }
};

/**
 * Replaces all the children with a new map of children.
 * @param {Object<string, gdjs.Variable>} newChildren The map of new children.
 */
gdjs.Variable.prototype.replaceChildren = function (newChildren) {
  this._type = 'structure';
  this._children = newChildren;
};

/**
 * Get the value of the variable, considered as a number
 * @return {number} The number stored in the variable
 */
gdjs.Variable.prototype.getAsNumber = function () {
  if (this._type !== 'number') {
    let number;
    if (this._type === 'string') number = parseFloat(this._str);
    else if (this._type === 'boolean') number = this._bool ? 1 : 0;

    if (typeof number === 'undefined') return 0;
    return number === number ? number : 0; //Ensure NaN is not returned as a value.
  }

  return this._value;
};

/**
 * Change the value of the variable, considered as a number
 * @param {number} newValue The new value to be set
 */
gdjs.Variable.prototype.setNumber = function (newValue) {
  this._type = 'number';
  this._value = newValue;
};

/**
 * Get the value of the variable, considered as a string
 * @return {string} The string stored in the variable
 */
gdjs.Variable.prototype.getAsString = function () {
  if (this._type !== 'string') {
    if (this._type === 'number') return this._value.toString();
    else if (this._type === 'boolean') return this._bool ? 'true' : 'false';
  }

  return this._str;
};

/**
 * Change the value of the variable, considered as a string
 * @param {string} newValue The new string to be set
 */
gdjs.Variable.prototype.setString = function (newValue) {
  this._type = 'string';
  this._str = newValue;
};

/**
 * Get the value of the variable, considered as a boolean
 * @return {boolean}
 */
gdjs.Variable.prototype.getAsBoolean = function () {
  if (this._type !== 'boolean') {
    if (this._type === 'number') return this._value !== 0;
    else if (this._type === 'string')
      return this._str !== '0' && this._str !== '' && this._str !== 'false';
  }

  return this._bool;
};

/**
 * Change the value of the variable, considered as a boolean
 * @param {boolean} newValue
 */
gdjs.Variable.prototype.setBoolean = function (newValue) {
  this._type = 'boolean';
  this._bool = newValue;
};

/**
 * Return true if the variable is a structure.
 * @return {boolean} true if the variable is a structure.
 * @deprecated Use {@link gdjs.Variable.getType} instead.
 */
gdjs.Variable.prototype.isStructure = function () {
  return this._type === 'structure';
};

/**
 * Return true if the variable is a number.
 * @return {boolean} true if the variable is a number.
 * @deprecated Use {@link gdjs.Variable.getType} instead.
 */
gdjs.Variable.prototype.isNumber = function () {
  return this._type === 'number';
};

/**
 * Return true if the variable type is a primitive.
 * @return {boolean}
 */
gdjs.Variable.prototype.isPrimitive = function () {
  return gdjs.Variable.isPrimitive(this._type);
};

/**
 * Returns the type of the variable.
 * @return {VariableType}
 */
gdjs.Variable.prototype.getType = function () {
  return this._type;
};

/**
 * Return the object containing all the children of the variable
 * @return {Object.<string, gdjs.Variable>} All the children of the variable
 */
gdjs.Variable.prototype.getAllChildren = function () {
  return this._children;
};

/**
 * Return an Array containing all the children of the variable
 * @return {?gdjs.Variable[]}
 */
gdjs.Variable.prototype.getAllChildrenList = function () {
  return this._type === 'structure'
    ? Object.values(this._children)
    : this._type === 'array'
    ? this._childrenList
    : null;
};

/**
 * Return the length of the
 * @return {number}
 */
gdjs.Variable.prototype.getChildrenCount = function () {
  if (this.isPrimitive()) return 0;
  //@ts-ignore This cannot return null as type isn't a primitive.
  return this.getAllChildrenList().length;
};

/**
 * Add the given number to the variable value
 * @param {number} val
 */
gdjs.Variable.prototype.add = function (val) {
  this.setNumber(this.getAsNumber() + val);
};

/**
 * Subtract the given number to the variable value
 * @param {number} val
 */
gdjs.Variable.prototype.sub = function (val) {
  this.setNumber(this.getAsNumber() - val);
};

/**
 * Multiply the variable value by the given number
 * @param {number} val
 */
gdjs.Variable.prototype.mul = function (val) {
  this.setNumber(this.getAsNumber() * val);
};

/**
 * Divide the variable value by the given number
 * @param {number} val
 */
gdjs.Variable.prototype.div = function (val) {
  this.setNumber(this.getAsNumber() / val);
};

/**
 * Concatenate the given string at the end of the variable value
 * @param {string} str
 */
gdjs.Variable.prototype.concatenateString = function (str) {
  this.setString(this.getAsString() + str);
};

/**
 * @deprecated
 * @private
 */
gdjs.Variable.prototype.concatenate = gdjs.Variable.prototype.concatenateString;

/**
 * Returns the variable at a specific index in the array.
 * If it doesn't yet exists, create it.
 * @param {number} index
 * @returns {gdjs.Variable}
 */
gdjs.Variable.prototype.getAtIndex = function (index) {
  if (this._childrenList[index] === undefined) {
    this._type = 'array';
    this._childrenList[index] = new gdjs.Variable();
  }
  return this._childrenList[index];
};

/**
 * Removes a variable at a given index of the variable.
 * @param {number} index
 */
gdjs.Variable.prototype.removeAtIndex = function (index) {
  if (this._type === 'array') this._childrenList.splice(index, 1);
};

/**
 * Pushes a variable onto the array.
 * @param {gdjs.Variable} variable
 */
gdjs.Variable.prototype.push = function (variable) {
  if (this._type === 'array' && variable instanceof gdjs.Variable)
    this._childrenList.push(variable);
};
