// @ts-check

/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @typedef {Object} VariableData Data representation of a GDevelop variable
 * @property {string} [name] The name of the variable. Used if a child variable.
 * @property {string} [value] The value of the variable, either string or number. Leave blank for structures.
 * @property {Array<VariableData>} [children] The children of the structure. Leave blank if value is defined.
 */

/**
 * A Variable is an object storing a value (number or a string) or children variables.
 *
 * @memberOf gdjs
 * @class Variable
 * @param {VariableData} [varData] The optional initial content of the variable.
 */
gdjs.Variable = function(varData)
{
	/** @type {number} */
	this._value = 0;
	/** @type {string} */
	this._str = "";
	/** @type {boolean} */
	this._numberDirty = false;
	/** @type {boolean} */
	this._stringDirty = true;
	/** @type {boolean} */
	this._isStructure = false;
	/** @type {Object.<string, gdjs.Variable>} */
	this._children = {};
	/** @type {boolean} */
    this._undefinedInContainer = false;

	if ( varData !== undefined ) {
		if ( varData.value !== undefined ) { //Variable is a string or a number
			var initialValue = varData.value;

			//Try to guess the type of the value, as GD has no way ( for now ) to specify
			//the type of a variable.
			var valueWhenConsideredAsNumber = parseFloat(initialValue);
			if(valueWhenConsideredAsNumber === valueWhenConsideredAsNumber && valueWhenConsideredAsNumber.toString() === initialValue) { //"Since NaN is the only JavaScript value that is treated as unequal to itself, you can always test if a value is NaN by checking it for equality to itself"
				this._value = parseFloat(initialValue);
			}
			else { //We have a string (Maybe empty).
				if ( initialValue.length === 0 )
					this._value = 0;
				else {
					this._str = initialValue;
					this._numberDirty = true;
					this._stringDirty = false;
				}
			}
		} else { //Variable is a structure
			this._isStructure = true;

			if (varData.children !== undefined) {
	        	for(var i = 0, len = varData.children.length;i<len;++i) {
					/** @type {VariableData} */
					var childData = varData.children[i];
					/** @type {gdjs.Variable} */
					this._children[childData.name] = new gdjs.Variable(childData);
				}
			}
		}
	}
};


/**
 * Used (usually by gdjs.VariablesContainer) to set that the variable must be
 * considered as not existing in the container.
 * @method
 * @private
 */
gdjs.Variable.prototype.setUndefinedInContainer = function() {
    this._undefinedInContainer = true;
};

/**
 * Check if the variable must be considered as not existing in its container
 * (usually a gdjs.VariablesContainer).
 * @private
 * @method
 * @return {boolean} true if the container must consider that the variable does not exist.
 */
gdjs.Variable.prototype.isUndefinedInContainer = function() {
    return this._undefinedInContainer;
};

/**
 * Get the child with the specified name.
 *
 * If the variable has not the specified child, an empty variable with the specified name
 * is added as child.
 * @method
 * @returns {gdjs.Variable} The child variable
 */
gdjs.Variable.prototype.getChild = function(childName) {
	if ( this._children.hasOwnProperty(childName) && this._children[childName] !== undefined )
		return this._children[childName];

	this._isStructure = true;
	this._children[childName] = new gdjs.Variable();
	return this._children[childName];
};

/**
 * Return the child in a variable.
 *
 * Check if the variable has the specified children
 * @method
 * @return {boolean} true if variable has the children with the specified name
 */
gdjs.Variable.prototype.hasChild = function(childName) {
	return (this._isStructure && this._children.hasOwnProperty(childName) );
};

/**
 * Remove the child with the specified name.
 *
 * If the variable has not the specified child, nothing is done.
 * @method
 * @param {string} childName The name of the child to be removed
 */
gdjs.Variable.prototype.removeChild = function(childName) {
	if ( !this._isStructure ) return;
	delete this._children[childName];
};

/**
 * Remove all the children.
 *
 * If the variable is not a structure, nothing is done.
 * @method
 */
gdjs.Variable.prototype.clearChildren = function() {
	if ( !this._isStructure ) return;

	for ( var child in this._children ) {
		if ( this._children.hasOwnProperty(child) ){
			delete this._children[child];
		}
	}
};

/**
 * Get the value of the variable, considered as a number
 * @method
 * @return {number} The number stored in the variable
 */
gdjs.Variable.prototype.getAsNumber = function() {
	if ( this._numberDirty ) {
		this._value = parseFloat(this._str);
		if ( this._value !== this._value ) this._value = 0; //Ensure NaN is not returned as a value.
		this._numberDirty = false;
	}

	return this._value;
};

/**
 * Change the value of the variable, considered as a number
 * @method
 * @param {number} newValue The new value to be set
 */
gdjs.Variable.prototype.setNumber = function(newValue) {
	this._value = newValue;
	this._stringDirty = true;
	this._numberDirty = false;
};

/**
 * Get the value of the variable, considered as a string
 * @method
 * @return {string} The string stored in the variable
 */
gdjs.Variable.prototype.getAsString = function() {
	if ( this._stringDirty ) {
		this._str = this._value.toString();
		this._stringDirty = false;
	}

	return this._str;
};

/**
 * Change the value of the variable, considered as a string
 * @method
 * @param {string} newValue The new string to be set
 */
gdjs.Variable.prototype.setString = function(newValue) {
	this._str = newValue;
	this._numberDirty = true;
	this._stringDirty = false;
};

/**
 * Return true if the variable is a structure.
 * @method
 * @return {boolean} true if the variable is a structure.
 */
gdjs.Variable.prototype.isStructure = function() {
	return this._isStructure;
};

/**
 * Return true if the variable is a number.
 * @method
 * @return {boolean} true if the variable is a number.
 */
gdjs.Variable.prototype.isNumber = function() {
	return !this._isStructure && !this._numberDirty;
};

/**
 * Return the object containing all the children of the variable
 * @method
 * @return {Object.<string, gdjs.Variable>} All the children of the variable
 */
gdjs.Variable.prototype.getAllChildren = function() {
	return this._children;
};

/**
 * Add the given number to the variable value
 * @method
 * @param {number} val the number to add
 */
gdjs.Variable.prototype.add = function(val) {
	this.setNumber(this.getAsNumber()+val);
};

/**
 * Subtract the given number to the variable value
 * @method
 * @param {number} val the number to subtract
 */
gdjs.Variable.prototype.sub = function(val) {
	this.setNumber(this.getAsNumber()-val);
};

/**
 * Multiply the variable value by the given number
 * @method
 * @param {number} val the factor
 */
gdjs.Variable.prototype.mul = function(val) {
	this.setNumber(this.getAsNumber()*val);
};

/**
 * Divide the variable value by the given number
 * @method
 * @param {number} val the divisor
 */
gdjs.Variable.prototype.div = function(val) {
	this.setNumber(this.getAsNumber()/val);
};

/**
 * Concatenate the given string at the end of the variable value
 * @method
 * @param {string} str the string to append
 */
gdjs.Variable.prototype.concatenate = function(str) {
	this.setString(this.getAsString()+str);
};
