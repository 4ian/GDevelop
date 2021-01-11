namespace gdjs {
  export namespace evtTools {
    /**
     * Functions to interact with variables used by events.
     * @private
     */
    export namespace variable {
      /**
       * Get the value of a variable. Equivalent to `variable.getAsNumber()`.
       * This method is necessary for code generation.
       * 
       * @param {gdjs.Variable} variable Variable.
       * @returns The content of the variable, as a number.
       */
      export const getVariableNumber = function (
        variable: gdjs.Variable
      ): float {
        return variable.getAsNumber();
      };

      /**
       * Get the string of a variable. Equivalent to `variable.getAsString()`.
       * This method is necessary for code generation.
       * 
       * @param {gdjs.Variable} variable Variable.
       * @returns The content of the variable, as a string.
       */
      export const getVariableString = function (
        variable: gdjs.Variable
      ): string {
        return variable.getAsString();
      };

      /**
       * Compares the boolean value of a variable.
       * Equivalent to `variable.getAsBoolean() === boolean`.
       * This shortcut function is needed for events code generation.
       *
       * @param {gdjs.Variable} variable
       * @param {boolean} compareWith
       * @returns {boolean}
       */
      export const getVariableBoolean = function (
        variable: gdjs.Variable,
        compareWith: boolean
      ): boolean {
        return variable.getAsBoolean() === compareWith;
      };

      /**
       * Set the boolean value of a variable. Equivalent to `variable.setBoolean()`.
       * This shortcut function is needed for events code generation.
       *
       * @param {gdjs.Variable} variable
       * @param {boolean} bool The new boolean value of the variable.
       */
      export const setVariableBoolean = function (
        variable: gdjs.Variable,
        newValue: boolean
      ) {
        variable.setBoolean(newValue);
      };

      /**
       * Toggles the boolean value of a variable.
       * This method is necessary for code generation.
       * 
       * @param {gdjs.Variable} variable Variable.
       */
      export const toggleVariableBoolean = function (variable: gdjs.Variable) {
        variable.setBoolean(!variable.getAsBoolean());
      };

      /**
       * Check if a scene variable exists.
       * This method is necessary for code generation.
       * 
       * @param runtimeScene The scene.
       * @param variableName Name of the scene variable.
       * @returns true if the scene variable exits, false otherwise.
       */
      export const sceneVariableExists = function (
        runtimeScene: gdjs.RuntimeScene,
        variableName: string
      ): boolean {
        return runtimeScene.getVariables().has(variableName);
      };

      /**
       * Check if a global variable exists.
       * This method is necessary for code generation.
       * 
       * @param runtimeScene The scene.
       * @param variableName Name of the global variable.
       * @returns true if the global variable exits, false otherwise.
       */
      export const globalVariableExists = function (
        runtimeScene: gdjs.RuntimeScene,
        variableName: string
      ): boolean {
        return runtimeScene.getGame().getVariables().has(variableName);
      };

      /**
       * Check if a child exists in a variable.
       * This method is necessary for code generation.
       * 
       * @param variable Variable.
       * @param childName Name of the child.
       * @returns true if child exist in the variable, false otherwise.
       */
      export const variableChildExists = function (
        variable: gdjs.Variable,
        childName: string
      ): boolean {
        return variable.hasChild(childName);
      };

      /**
       * Remove the child with the given name in a variable.
       * This method is necessary for code generation.
       * 
       * @param variable Variable.
       * @param childName Name of the child.
       * @returns The new variable, with the child removed.
       */
      export const variableRemoveChild = function (
        variable: gdjs.Variable,
        childName: string
      ): void {
        variable.removeChild(childName);
      };

      /**
       * Clear the children in a variable.
       * This method is necessary for code generation.
       * 
       * @param {gdjs.Variable} variable Variable.
       */
      export const variableClearChildren = function (variable: gdjs.Variable) {
        variable.clearChildren();
      };

      /**
       * Pushes a variable onto an array.
       * This method is necessary for code generation.
       * 
       * @param {gdjs.Variable} array
       * @param {gdjs.Variable} variable
       */
      export const variablePush = function (
        array: gdjs.Variable,
        variable: gdjs.Variable
      ) {
        array.push(variable);
      };

      /**
       * Removes an index from an array.
       * This method is necessary for code generation.
       *
       * @param {gdjs.Variable} array
       * @param {number} index
       */
      export const variableRemoveAt = function (
        array: gdjs.Variable,
        index: number
      ) {
        array.removeAtIndex(index);
      };

      /**
       * Get the number of children in a variable.
       * This method is necessary for code generation.
       * 
       * @param variable Variable.
       * @returns The number of children in the variable.
       */
      export const getVariableChildCount = function (
        variable: gdjs.Variable
      ): number {
        return variable.getChildrenCount();
      };

      /**
       * This method is necessary for code generation.
       */
      export const variableStructureToJSON = function (variable) {
        return variable.toJSON();
      };

      /**
       * This method is necessary for code generation.
       * @param {gdjs.RuntimeObject} [object]
       * @param {gdjs.Variable} variable
       */
      export const objectVariableStructureToJSON = function (object, variable) {
        return variable.toJSON();
      };

      /**
       * Converts a json string to a GDevelop variable.
       * This method is useful for code generation, 
       * but if you are using JavaScript events you 
       * probably want to use {@link gdjs.Variable.fromJSON}.
       * 
       * @param {any} obj
       * @param {gdjs.Variable} variable
       */
      export const jsonToVariableStructure = gdjs.Variable._jsonToVariable;

      /**
       * Converts a js object to a GDevelop variable.
       * This method is useful for code generation, 
       * but if you are using JavaScript events you 
       * probably want to use {@link gdjs.Variable.fromJSON}.
       * 
       * @param {any} obj
       * @param {gdjs.Variable} variable
       */
      export const objectToVariable = gdjs.Variable._objectToVariable;

      /**
       * This method is necessary for code generation.
       * @param {string} jsonStr
       * @param {gdjs.RuntimeObject} [object]
       * @param {gdjs.Variable} variable
       */
      export const jsonToObjectVariableStructure = function (
        jsonStr: string,
        object: gdjs.RuntimeObject,
        variable: gdjs.Variable
      ) {
        return gdjs.Variable._jsonToVariable(jsonStr, variable);
      };
    }
  }
}
