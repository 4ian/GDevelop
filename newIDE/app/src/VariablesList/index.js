// @flow
import * as React from 'react';
import flatten from 'lodash/flatten';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../Utils/MapFor';
import EmptyMessage from '../UI/EmptyMessage';
import newNameGenerator from '../Utils/NewNameGenerator';
import VariableRow from './VariableRow';
import EditVariableRow from './EditVariableRow';
import styles from './styles';
import {
  getInitialSelection,
  hasSelection,
  addToSelection,
  getSelection,
} from '../Utils/SelectionHandler';
import { CLIPBOARD_KIND } from './ClipboardKind';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type VariableOrigin } from './VariablesList.flow';

const gd: libGDevelop = global.gd;

const SortableVariableRow = SortableElement(VariableRow);
const SortableAddVariableRow = SortableElement(EditVariableRow);
const SortableVariablesListBody = SortableContainer(({ children }) => (
  <div>{children}</div>
));
SortableVariablesListBody.muiName = 'TableBody';

type VariableAndName = {| name: string, ptr: number, variable: gdVariable |};

type Props = {|
  variablesContainer: gdVariablesContainer,
  onComputeAllVariableNames: () => Array<string>,
  inheritedVariablesContainer?: ?gdVariablesContainer,
  emptyExplanationMessage?: React.Node,
  emptyExplanationSecondMessage?: React.Node,
  onSizeUpdated?: () => void,
  commitVariableValueOnBlur?: boolean,
|};
type State = {|
  nameErrors: { [string]: string },
  selectedVariables: { [number]: ?VariableAndName },
  mode: 'select' | 'move',
|};

export default class VariablesList extends React.Component<Props, State> {
  state = {
    nameErrors: {},
    selectedVariables: getInitialSelection(),
    mode: 'select',
  };

  _allVariableNamesSet: ?Set<string> = null;
  _undefinedVariableNames: ?Set<string> = null;

  _selectVariable = (variableAndName: VariableAndName, select: boolean) => {
    this.setState({
      selectedVariables: addToSelection(
        this.state.selectedVariables,
        variableAndName,
        select
      ),
    });
  };

  copySelection = () => {
    Clipboard.set(
      CLIPBOARD_KIND,
      getSelection(this.state.selectedVariables).map(({ name, variable }) => ({
        name,
        serializedVariable: serializeToJSObject(variable),
      }))
    );
  };

  paste = () => {
    const { variablesContainer, inheritedVariablesContainer } = this.props;
    if (!Clipboard.has(CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    const variablesContent = SafeExtractor.extractArray(clipboardContent);
    if (!variablesContent) return;

    variablesContent.forEach(variableContent => {
      const name = SafeExtractor.extractStringProperty(variableContent, 'name');
      const serializedVariable = SafeExtractor.extractObjectProperty(
        variableContent,
        'serializedVariable'
      );
      if (!name || !serializedVariable) return;

      const newName = newNameGenerator(
        name,
        name =>
          inheritedVariablesContainer
            ? inheritedVariablesContainer.has(name) ||
              variablesContainer.has(name)
            : variablesContainer.has(name),
        'CopyOf'
      );
      const newVariable = new gd.Variable();
      unserializeFromJSObject(newVariable, serializedVariable);
      variablesContainer.insert(
        newName,
        newVariable,
        variablesContainer.count()
      );
      newVariable.delete();
    });
    this.forceUpdate();
  };

  deleteSelection = () => {
    const { variablesContainer } = this.props;
    const selection: Array<VariableAndName> = getSelection(
      this.state.selectedVariables
    );

    // Only delete ancestor variables, as selection can be composed of variables
    // that are contained inside others.
    const ancestorOnlyVariables = selection.filter(variableAndName => {
      // Make sure that the variable has no ancestor containing it
      return !selection.find(
        otherVariableAndName =>
          variableAndName !== otherVariableAndName &&
          otherVariableAndName.variable.contains(
            variableAndName.variable,
            /*recursive=*/ true
          )
      );
    });

    // We don't want to ever manipulate/access to variables that have been deleted (by removeRecursively):
    // that's why it's important to only delete ancestor variables.
    ancestorOnlyVariables.forEach(({ name, variable }: VariableAndName) => {
      variablesContainer.removeRecursively(variable);

      if (this._allVariableNamesSet && this._allVariableNamesSet.has(name)) {
        this._undefinedVariableNames && this._undefinedVariableNames.add(name);
      }
    });
    this.clearSelection();
  };

  clearSelection = () => {
    this.setState({
      selectedVariables: getInitialSelection(),
    });
  };

  _updateOrDefineVariable = (
    name: string,
    variable: gdVariable,
    newValue: string,
    index: number,
    origin: ?VariableOrigin
  ) => {
    const { variablesContainer, inheritedVariablesContainer } = this.props;

    // If editing a variable from the parent container, clone it
    // inside this container, before updating its value.
    if (inheritedVariablesContainer && origin === 'parent') {
      const serializedVariable = serializeToJSObject(
        inheritedVariablesContainer.get(name)
      );
      const newVariable = new gd.Variable();
      unserializeFromJSObject(newVariable, serializedVariable);
      variablesContainer.insert(name, newVariable, index);
      newVariable.delete();

      variable = variablesContainer.get(name);
    }

    switch (variable.getType()) {
      case gd.Variable.String:
        variable.setString(newValue);
        break;
      case gd.Variable.Number:
        variable.setValue(parseFloat(newValue));
        break;
      case gd.Variable.Boolean:
        variable.setBool(newValue === 'true');
        break;
      default:
        console.error(
          `Cannot set variable with type ${variable.getType()} - are you sure it's a primitive type?`
        );
    }
  };

  _renderStructureChildren(
    parentVariable: gdVariable,
    depth: number,
    origin: VariableOrigin
  ): Array<React.Node> {
    const names = parentVariable.getAllChildrenNames().toJSArray();

    return flatten(
      names.map((name, index) => {
        const variable = parentVariable.getChild(name);
        return this._renderVariableAndChildrenRows(
          name,
          variable,
          depth + 1,
          index,
          parentVariable,
          origin
        );
      })
    );
  }

  _renderArrayChildren(
    parentVariable: gdVariable,
    depth: number,
    origin: VariableOrigin
  ): Array<React.Node> {
    return mapFor(0, parentVariable.getChildrenCount(), index => {
      const variable = parentVariable.getAtIndex(index);
      return this._renderVariableAndChildrenRows(
        '' + index,
        variable,
        depth + 1,
        index,
        parentVariable,
        origin,
        /* arrayElement= */ true
      );
    });
  }

  _getVariableOrigin = (name: string) => {
    const { variablesContainer, inheritedVariablesContainer } = this.props;

    if (!inheritedVariablesContainer || !inheritedVariablesContainer.has(name))
      return '';
    return variablesContainer.has(name) ? 'inherited' : 'parent';
  };

  _renderVariableAndChildrenRows(
    name: string,
    variable: gdVariable,
    depth: number,
    index: number,
    parentVariable: ?gdVariable,
    parentOrigin: ?VariableOrigin = null,
    arrayElement: ?boolean = false
  ) {
    const { variablesContainer, commitVariableValueOnBlur } = this.props;
    const type = variable.getType();
    const isCollection = !gd.Variable.isPrimitive(variable.getType());

    const origin = parentOrigin ? parentOrigin : this._getVariableOrigin(name);

    return (
      <SortableVariableRow
        name={name}
        index={index}
        key={'variable-' + name}
        variable={variable}
        disabled={depth !== 0}
        depth={depth}
        origin={origin}
        arrayElement={!!arrayElement}
        commitVariableValueOnBlur={commitVariableValueOnBlur}
        errorText={
          this.state.nameErrors[variable.ptr.toString()]
            ? 'This name is already taken'
            : undefined
        }
        onChangeValue={text => {
          this._updateOrDefineVariable(name, variable, text, index, origin);

          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        onResetToDefaultValue={() => {
          variablesContainer.removeRecursively(variable);
          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        onChangeType={newType => {
          variable.castTo(newType);
          this.forceUpdate();
        }}
        onChangeName={text => {
          if (name === text) return;

          let success = true;
          if (!parentVariable) {
            success = variablesContainer.rename(name, text);
            if (
              this._allVariableNamesSet &&
              this._allVariableNamesSet.has(name)
            ) {
              this._undefinedVariableNames &&
                this._undefinedVariableNames.add(name);
            }
            this._undefinedVariableNames &&
              this._undefinedVariableNames.delete(text);
          } else {
            success = parentVariable.renameChild(name, text);
          }

          this.setState({
            nameErrors: {
              ...this.state.nameErrors,
              [variable.ptr]: !success,
            },
          });
        }}
        onRemove={() => {
          if (!parentVariable) {
            variablesContainer.remove(name);

            if (
              this._allVariableNamesSet &&
              this._allVariableNamesSet.has(name)
            ) {
              this._undefinedVariableNames &&
                this._undefinedVariableNames.add(name);
            }
          } else {
            if (parentVariable.getType() === gd.Variable.Structure)
              parentVariable.removeChild(name);
            else if (parentVariable.getType() === gd.Variable.Array)
              parentVariable.removeAtIndex(index);
          }

          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        onAddChild={() => {
          // Primitive types should be converted via onChangeType before getting children added.
          if (!isCollection) return;

          if (type === gd.Variable.Structure) {
            const name = newNameGenerator('ChildVariable', name =>
              variable.hasChild(name)
            );
            variable.getChild(name).setString('');
          } else if (type === gd.Variable.Array) variable.pushNew();

          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        children={
          type === gd.Variable.Structure
            ? this._renderStructureChildren(variable, depth, origin)
            : type === gd.Variable.Array
            ? this._renderArrayChildren(variable, depth, origin)
            : null
        }
        showHandle={this.state.mode === 'move'}
        showSelectionCheckbox={this.state.mode === 'select'}
        isSelected={!!this.state.selectedVariables[variable.ptr]}
        onSelect={select =>
          this._selectVariable({ name, ptr: variable.ptr, variable }, select)
        }
        undefinedVariableNames={this._undefinedVariableNames}
      />
    );
  }

  _renderEmpty() {
    return (
      !!this.props.emptyExplanationMessage && (
        <div>
          <EmptyMessage
            style={styles.emptyExplanation}
            messageStyle={styles.emptyExplanationMessage}
          >
            {this.props.emptyExplanationMessage}
          </EmptyMessage>
          <EmptyMessage
            style={styles.emptyExplanation}
            messageStyle={styles.emptyExplanationMessage}
          >
            {this.props.emptyExplanationSecondMessage}
          </EmptyMessage>
        </div>
      )
    );
  }

  render() {
    const { variablesContainer, inheritedVariablesContainer } = this.props;
    if (!variablesContainer) return null;

    if (this._allVariableNamesSet === null) {
      const allVariableNames = this.props.onComputeAllVariableNames();
      this._allVariableNamesSet = new Set<string>(allVariableNames);
      this._undefinedVariableNames = new Set<string>(
        allVariableNames.filter(
          variableName => !this.props.variablesContainer.has(variableName)
        )
      );
    }

    // Display inherited variables, if any
    const containerInheritedVariablesTree = inheritedVariablesContainer
      ? mapFor(0, inheritedVariablesContainer.count(), index => {
          const name = inheritedVariablesContainer.getNameAt(index);
          if (!variablesContainer.has(name)) {
            // Show only variables from parent container that are not redefined
            const variable = inheritedVariablesContainer.getAt(index);
            return this._renderVariableAndChildrenRows(
              name,
              variable,
              0,
              index,
              undefined,
              'parent'
            );
          }
        })
      : [];

    const containerVariablesTree = mapFor(
      0,
      variablesContainer.count(),
      index => {
        const variable = variablesContainer.getAt(index);
        const name = variablesContainer.getNameAt(index);

        return this._renderVariableAndChildrenRows(
          name,
          variable,
          0,
          index,
          undefined
        );
      }
    );

    const editRow = (
      <SortableAddVariableRow
        index={0}
        key={'add-variable-row'}
        disabled
        onAdd={() => {
          const variable = new gd.Variable();
          variable.setString('');
          const name = newNameGenerator('Variable', name =>
            inheritedVariablesContainer
              ? inheritedVariablesContainer.has(name) ||
                variablesContainer.has(name)
              : variablesContainer.has(name)
          );
          variablesContainer.insert(name, variable, variablesContainer.count());
          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        onCopy={this.copySelection}
        onPaste={this.paste}
        onDeleteSelection={this.deleteSelection}
        hasSelection={hasSelection(this.state.selectedVariables)}
        hasClipboard={Clipboard.has(CLIPBOARD_KIND)}
      />
    );

    // Put all variables in the **same** array so that if a variable that was shown
    // as inherited is redefined by the user, React can reconcile the variable rows
    // (VariableRow going from containerInheritedVariablesTree array to
    // containerVariablesTree array) and the **focus** won't be lost.
    const allVariables = [
      ...containerInheritedVariablesTree,
      ...containerVariablesTree,
    ];

    return (
      <SortableVariablesListBody
        variablesContainer={this.props.variablesContainer}
        onSortEnd={({ oldIndex, newIndex }) => {
          this.props.variablesContainer.move(oldIndex, newIndex);
          this.forceUpdate();
        }}
        helperClass="sortable-helper"
        useDragHandle
        lockToContainerEdges
      >
        {allVariables}
        {!allVariables.length && this._renderEmpty()}
        {editRow}
      </SortableVariablesListBody>
    );
  }
}
