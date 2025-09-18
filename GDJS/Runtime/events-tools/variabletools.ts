/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    /**
     * A namespace of functional equivalents to the gdjs.Variable methods, needed for events code generation.
     * @private
     * @namespace
     */
    export namespace variable {
      /**
       * Get the value of a variable. Equivalent to `variable.getAsNumber()`.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const getVariableNumber = function (
        variable: gdjs.Variable
      ): number {
        return variable.getAsNumber();
      };

      /**
       * Get the string of a variable. Equivalent to `variable.getAsString()`.
       * This shortcut function is needed for events code generation.
       * @private
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
       * @private
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
       * @private
       */
      export const setVariableBoolean = function (
        variable: gdjs.Variable,
        newValue: boolean
      ) {
        variable.setBoolean(newValue);
      };

      /**
       * Toggles the boolean value of a variable.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const toggleVariableBoolean = function (variable: gdjs.Variable) {
        variable.setBoolean(!variable.getAsBoolean());
      };

      /**
       * Check if a scene variable exists.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const sceneVariableExists = function (
        runtimeScene: gdjs.RuntimeScene,
        variableName: string
      ): boolean {
        return runtimeScene.getScene().getVariables().has(variableName);
      };

      /**
       * Check if a global variable exists.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const globalVariableExists = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        variableName: string
      ): boolean {
        return instanceContainer.getGame().getVariables().has(variableName);
      };

      /**
       * Check if a child exists in a variable.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const variableChildExists = function (
        variable: gdjs.Variable,
        childName: string
      ): boolean {
        return variable.hasChild(childName);
      };

      /**
       * Remove the child with the given name in a variable.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const variableRemoveChild = function (
        variable: gdjs.Variable,
        childName: string
      ): void {
        variable.removeChild(childName);
      };

      /**
       * Clear the children in a variable.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const variableClearChildren = function (variable: gdjs.Variable) {
        variable.clearChildren();
      };

      /**
       * Pushes a variable onto an array.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const variablePushCopy = function (
        array: gdjs.Variable,
        variable: gdjs.Variable
      ) {
        array.pushVariableCopy(variable);
      };

      /**
       * Pushes a value onto an array.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const valuePush = function (
        array: gdjs.Variable,
        value: string | float | boolean
      ) {
        array.pushValue(value);
      };

      /**
       * Removes an index from an array.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const variableRemoveAt = function (
        array: gdjs.Variable,
        index: number
      ) {
        array.removeAtIndex(index);
      };

      /**
       * Get the number of children in a variable.
       * This shortcut function is needed for events code generation.
       * @private
       */
      export const getVariableChildCount = function (
        variable: gdjs.Variable
      ): number {
        return variable.getChildrenCount();
      };

      /**
       * Shortcut to get the first value of an array variable as a number.
       */
      export const getFirstVariableNumber = function (
        array: gdjs.Variable
      ): number {
        if (array.getChildrenCount() === 0) {
          return 0;
        }
        return array.getAllChildrenArray()[0].getAsNumber();
      };

      /**
       * Shortcut to get the last value of an array variable as a string.
       */
      export const getFirstVariableString = function (
        array: gdjs.Variable
      ): string {
        if (array.getChildrenCount() === 0) {
          return '';
        }
        return array.getAllChildrenArray()[0].getAsString();
      };

      /**
       * Shortcut to get the last value of an array variable as a number.
       */
      export const getLastVariableNumber = function (
        array: gdjs.Variable
      ): number {
        const children = array.getAllChildrenArray();
        return children.length === 0
          ? 0
          : children[children.length - 1].getAsNumber();
      };

      /**
       * Shortcut to get the last value of an array variable as a string.
       */
      export const getLastVariableString = function (
        array: gdjs.Variable
      ): string {
        const children = array.getAllChildrenArray();
        return children.length === 0
          ? ''
          : children[children.length - 1].getAsString();
      };
    }

    export namespace common {
      /** @deprecated */
      export const getVariableNumber = gdjs.evtTools.variable.getVariableNumber;
      /** @deprecated */
      export const getVariableString = gdjs.evtTools.variable.getVariableString;
      /** @deprecated */
      export const getVariableBoolean =
        gdjs.evtTools.variable.getVariableBoolean;
      /** @deprecated */
      export const setVariableBoolean =
        gdjs.evtTools.variable.setVariableBoolean;
      /** @deprecated */
      export const toggleVariableBoolean =
        gdjs.evtTools.variable.toggleVariableBoolean;
      /** @deprecated */
      export const sceneVariableExists =
        gdjs.evtTools.variable.sceneVariableExists;
      /** @deprecated */
      export const globalVariableExists =
        gdjs.evtTools.variable.globalVariableExists;
      /** @deprecated */
      export const variableChildExists =
        gdjs.evtTools.variable.variableChildExists;
      /** @deprecated */
      export const variableRemoveChild =
        gdjs.evtTools.variable.variableRemoveChild;
      /** @deprecated */
      export const variableClearChildren =
        gdjs.evtTools.variable.variableClearChildren;
      /** @deprecated */
      export const variablePushCopy = gdjs.evtTools.variable.variablePushCopy;
      /** @deprecated */
      export const valuePush = gdjs.evtTools.variable.valuePush;
      /** @deprecated */
      export const variableRemoveAt = gdjs.evtTools.variable.variableRemoveAt;
      /** @deprecated */
      export const getVariableChildCount =
        gdjs.evtTools.variable.getVariableChildCount;
    }
  }
}
