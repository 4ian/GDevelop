// @ts-check

/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * VariablesContainer stores variables, usually for a a RuntimeGame, a RuntimeScene
 * or a RuntimeObject.
 *
 * @memberof gdjs
 * @class VariablesContainer
 * @param {Array<VariableData>} [initialVariablesData] Optional array containing representations of the base variables.
 */
gdjs.VariablesContainer = function(initialVariablesData)
{
    if ( this._variables === undefined ) this._variables = new Hashtable();
    if ( this._variablesArray === undefined ) this._variablesArray = [];

    if ( initialVariablesData !== undefined ) this.initFrom(initialVariablesData);
};

gdjs.VariablesContainer._deletedVars = gdjs.VariablesContainer._deletedVars || [];

/**
 * Initialize variables from a container data.<br>
 * If `keepOldVariables` is set to false (by default), all already existing variables will be
 * erased, but the new variables will be accessible thanks to getFromIndex. <br>
 * if `keepOldVariables` is set to true, already existing variables won't be erased and will be
 * still accessible thanks to getFromIndex.
 *
 * @param {Array<VariableData>} data The array containing data used to initialize variables.
 * @param {Boolean} [keepOldVariables] If set to true, already existing variables won't be erased.
 */
gdjs.VariablesContainer.prototype.initFrom = function(data, keepOldVariables) {
    if ( keepOldVariables === undefined ) keepOldVariables = false;
    if ( !keepOldVariables ) {
        gdjs.VariablesContainer._deletedVars = gdjs.VariablesContainer._deletedVars || [];
        this._variables.keys(gdjs.VariablesContainer._deletedVars);
    }

    var that = this;
    var i = 0;
    for(var j = 0;j<data.length;++j) {
        var varData = data[j];

        //Get the variable:
        var variable = that.get(varData.name);
        gdjs.Variable.call(variable, varData);

        if ( !keepOldVariables ) {
            //Register the variable in the extra array to ensure a fast lookup using getFromIndex.
            if ( i < that._variablesArray.length )
                that._variablesArray[i] = variable;
            else
                that._variablesArray.push(variable);

            ++i;

            //Remove the variable from the list of variables to be deleted.
            var idx = gdjs.VariablesContainer._deletedVars.indexOf(varData.name);
            if (idx !== -1) gdjs.VariablesContainer._deletedVars[idx] = undefined;
        }
	}

    if ( !keepOldVariables ) {
        this._variablesArray.length = i;

        //If we do not want to keep the already existing variables,
        //remove all the variables not assigned above.
        //(Here, remove means flag the variable as not existing, to avoid garbage creation ).
        for(var i =0, len = gdjs.VariablesContainer._deletedVars.length;i<len;++i) {
            var variableName = gdjs.VariablesContainer._deletedVars[i];
            if ( variableName !== undefined )
                this._variables.get(variableName).setUndefinedInContainer();
        }
    }
};

/**
 * Add a new variable.
 * @param {string} name Variable name
 * @param {gdjs.Variable} variable The variable to be added
 */
gdjs.VariablesContainer.prototype.add = function(name, variable) {
	this._variables.put(name, variable);
};

/**
 * Remove a variable.
 * (the variable is not really removed from the container to avoid creating garbage, but marked as undefined)
 * @param {string} name Variable to be removed
 */
gdjs.VariablesContainer.prototype.remove = function(name) {
    var variable = this._variables.get(name);
	if (variable) {
        variable.setUndefinedInContainer();
    }
};

/**
 * Get a variable.
 * @param {string} name The variable's name
 * @return {gdjs.Variable} The specified variable. If not found, an empty variable is added to the container.
 */
gdjs.VariablesContainer.prototype.get = function(name) {
    var variable = this._variables.get(name);
	if (!variable) { //Add automatically inexisting variables.
        variable = new gdjs.Variable();
        this._variables.put(name, variable);
	} else {
        if ( variable.isUndefinedInContainer() ) { //Reuse variables removed before.
            gdjs.Variable.call(variable);
        }
    }

	return variable;
};

/**
 * Get a variable using its index. If you're unsure about how to use this method, prefer to use `get`.
 * The index of a variable is its index in the data passed to initFrom.
 *
 * This method is generally used by events generated code to increase lookup speed for variables.
 *
 * @param {number} id The variable index
 * @return {gdjs.Variable} The specified variable. If not found, an empty variable is added to the container, but it
 * should not happen.
 */
gdjs.VariablesContainer.prototype.getFromIndex = function(id) {
	if ( id >= this._variablesArray.length ) { //Add automatically non-existing variables.
        var variable = new gdjs.Variable();
        this._variables.put(name, variable);
        return variable;
	} else {
        /** @type {gdjs.Variable} */
        var variable = this._variablesArray[id];
        if ( variable.isUndefinedInContainer() ) { //Reuse variables removed before.
            gdjs.Variable.call(variable);
        }
        return variable;
    }
};

/**
 * Check if a variable exists in the container.
 * @param {string} name The variable's name
 * @return {boolean} true if the variable exists.
 */
gdjs.VariablesContainer.prototype.has = function(name) {
    var variable = this._variables.get(name);
	return variable && !variable.isUndefinedInContainer();
};


/**
 * "Bad" variable container, used by events when no other valid container can be found.
 * This container has no state and always returns the bad variable ( see gdjs.VariablesContainer.badVariable ).
 * @static
 * @private
 */
gdjs.VariablesContainer.badVariablesContainer = {
    has: function() {return false;},
    getFromIndex : function() { return gdjs.VariablesContainer.badVariable; },
    get : function() { return gdjs.VariablesContainer.badVariable; },
    remove : function() { return; },
    add : function() { return; },
    initFrom : function() { return; }
};

/**
 * "Bad" variable, used by events when no other valid variable can be found.
 * This variable has no state and always return 0 or the empty string.
 * @static
 * @private
 */
gdjs.VariablesContainer.badVariable = {
    getChild : function() { return gdjs.VariablesContainer.badVariable; },
    hasChild: function() {return false;},
    isStructure: function() {return false;},
    isNumber: function() {return true;},
    removeChild : function() { return; },
    setNumber : function() { return; },
    setString : function() { return; },
    getAsString : function() { return ""; },
    getAsNumber : function() { return 0; },
    getAllChildren : function() { return {}; },
    add : function() { return; },
    sub : function() { return; },
    mul : function() { return; },
    div : function() { return; },
    concatenate : function() { return; },
    setUndefinedInContainer : function() { return; },
    isUndefinedInContainer : function() { return; }
};
