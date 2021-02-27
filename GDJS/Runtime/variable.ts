/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A Variable is an object storing a value (number or a string) or children variables.
   */
  export class Variable {
    _value: float = 0;
    _str: string = '';
    _numberDirty: boolean = false;
    _stringDirty: boolean = true;
    _isStructure: boolean = false;
    _children: { [key: string]: gdjs.Variable } = {};
    _undefinedInContainer: boolean = false;

    /**
     * @param [varData] The optional initial content of the variable.
     */
    constructor(varData?: VariableData) {
      this.reinitialize(varData);
    }

    reinitialize(varData?: VariableData | undefined) {
      this._value = 0;
      this._str = '';
      this._numberDirty = false;
      this._stringDirty = true;
      this._isStructure = false;
      this._children = {};
      this._undefinedInContainer = false;

      if (varData !== undefined) {
        if (varData.value !== undefined) {
          //Variable is a string or a number
          const initialValue = varData.value;

          //Try to guess the type of the value, as GD has no way ( for now ) to specify
          //the type of a variable.
          const valueWhenConsideredAsNumber = parseFloat(initialValue);
          if (
            valueWhenConsideredAsNumber === valueWhenConsideredAsNumber &&
            //"Since NaN is the only JavaScript value that is treated as unequal to itself, you can always test if a value is NaN by checking it for equality to itself"
            valueWhenConsideredAsNumber.toString() === initialValue
          ) {
            this._value = parseFloat(initialValue);
          } else {
            //We have a string (Maybe empty).
            if (initialValue.length === 0) {
              this._value = 0;
            } else {
              this._str = initialValue;
              this._numberDirty = true;
              this._stringDirty = false;
            }
          }
        } else {
          //Variable is a structure
          this._isStructure = true;
          if (varData.children !== undefined) {
            for (let i = 0, len = varData.children.length; i < len; ++i) {
              const childData: VariableData = varData.children[i];
              this._children[childData.name] = new gdjs.Variable(childData);
            }
          }
        }
      }
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
     * Get the child with the specified name.
     *
     * If the variable has not the specified child, an empty variable with the specified name
     * is added as child.
     * @returns The child variable
     */
    getChild(childName): gdjs.Variable {
      if (
        this._children.hasOwnProperty(childName) &&
        this._children[childName] !== undefined
      ) {
        return this._children[childName];
      }
      this._isStructure = true;
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
    addChild(childName: string, childVariable: gdjs.Variable): gdjs.Variable {
      this._isStructure = true;
      this._children[childName] = childVariable;
      return this;
    }

    /**
     * Return the child in a variable.
     *
     * Check if the variable has the specified children
     * @return true if variable has the children with the specified name
     */
    hasChild(childName): boolean {
      return this._isStructure && this._children.hasOwnProperty(childName);
    }

    /**
     * Remove the child with the specified name.
     *
     * If the variable has not the specified child, nothing is done.
     * @param childName The name of the child to be removed
     */
    removeChild(childName: string) {
      if (!this._isStructure) {
        return;
      }
      delete this._children[childName];
    }

    /**
     * Remove all the children.
     *
     * If the variable is not a structure, nothing is done.
     */
    clearChildren() {
      if (!this._isStructure) {
        return;
      }
      for (const child in this._children) {
        if (this._children.hasOwnProperty(child)) {
          delete this._children[child];
        }
      }
    }

    /**
     * Replaces all the children with a new map of children.
     * @param newChildren The map of new children.
     */
    replaceChildren(newChildren: { [key: string]: gdjs.Variable }) {
      this._isStructure = true;
      this._children = newChildren;
    }

    /**
     * Get the value of the variable, considered as a number
     * @return The number stored in the variable
     */
    getAsNumber(): number {
      if (this._numberDirty) {
        this._value = parseFloat(this._str);
        if (this._value !== this._value) {
          this._value = 0;
        }

        //Ensure NaN is not returned as a value.
        this._numberDirty = false;
      }
      return this._value;
    }

    /**
     * Change the value of the variable, considered as a number
     * @param newValue The new value to be set
     */
    setNumber(newValue: float): void {
      this._value = newValue;
      this._stringDirty = true;
      this._numberDirty = false;
    }

    /**
     * Get the value of the variable, considered as a string
     * @return The string stored in the variable
     */
    getAsString(): string {
      if (this._stringDirty) {
        this._str = this._value.toString();
        this._stringDirty = false;
      }
      return this._str;
    }

    /**
     * Change the value of the variable, considered as a string
     * @param newValue The new string to be set
     */
    setString(newValue: string): void {
      this._str = newValue;
      this._numberDirty = true;
      this._stringDirty = false;
    }

    /**
     * Return true if the variable is a structure.
     * @return true if the variable is a structure.
     */
    isStructure(): boolean {
      return this._isStructure;
    }

    /**
     * Return true if the variable is a number.
     * @return true if the variable is a number.
     */
    isNumber(): boolean {
      return !this._isStructure && !this._numberDirty;
    }

    /**
     * Return the object containing all the children of the variable
     * @return All the children of the variable
     */
    getAllChildren(): { [key: string]: gdjs.Variable } {
      return this._children;
    }

    /**
     * Add the given number to the variable value
     * @param val the number to add
     */
    add(val: number) {
      this.setNumber(this.getAsNumber() + val);
    }

    /**
     * Subtract the given number to the variable value
     * @param val the number to subtract
     */
    sub(val: number) {
      this.setNumber(this.getAsNumber() - val);
    }

    /**
     * Multiply the variable value by the given number
     * @param val the factor
     */
    mul(val: number) {
      this.setNumber(this.getAsNumber() * val);
    }

    /**
     * Divide the variable value by the given number
     * @param val the divisor
     */
    div(val: number) {
      this.setNumber(this.getAsNumber() / val);
    }

    /**
     * Concatenate the given string at the end of the variable value
     * @param str the string to append
     */
    concatenate(str: string) {
      this.setString(this.getAsString() + str);
    }
  }
}
