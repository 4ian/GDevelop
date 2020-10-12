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
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type VariableOrigin } from './VariablesList.flow';

const gd: libGDevelop = global.gd;

const SortableVariableRow = SortableElement(VariableRow);
const SortableAddVariableRow = SortableElement(EditVariableRow);

class VariablesListBody extends React.Component<*, *> {
  render() {
    return <div>{this.props.children}</div>;
  }
}

const SortableVariablesListBody = SortableContainer(VariablesListBody);
SortableVariablesListBody.muiName = 'TableBody';

type VariableAndName = {| name: string, ptr: number, variable: gdVariable |};

type Props = {|
  variablesContainer: gdVariablesContainer,
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

    const variables = Clipboard.get(CLIPBOARD_KIND);
    variables.forEach(({ name, serializedVariable }) => {
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
    ancestorOnlyVariables.forEach(({ variable }: VariableAndName) =>
      variablesContainer.removeRecursively(variable)
    );
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

    if (inheritedVariablesContainer && origin === 'parent') {
      const serializedVariable = serializeToJSObject(
        inheritedVariablesContainer.get(name)
      );
      const newVariable = new gd.Variable();
      unserializeFromJSObject(newVariable, serializedVariable);
      variablesContainer.insert(name, newVariable, index);
      newVariable.delete();

      variablesContainer.get(name).setString(newValue);
    } else {
      variable.setString(newValue);
    }
  };

  _renderVariableChildren(
    name: string,
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
    parentOrigin: ?VariableOrigin = null
  ) {
    const { variablesContainer, commitVariableValueOnBlur } = this.props;
    const isStructure = variable.isStructure();

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
        onBlur={event => {
          const text = event.target.value;
          if (name === text) return;

          let success = true;
          if (!parentVariable) {
            success = variablesContainer.rename(name, text);
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
          } else {
            parentVariable.removeChild(name);
          }

          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        onAddChild={() => {
          const name = newNameGenerator('ChildVariable', name =>
            variable.hasChild(name)
          );
          variable.getChild(name).setString('');

          this.forceUpdate();
          if (this.props.onSizeUpdated) this.props.onSizeUpdated();
        }}
        children={
          isStructure
            ? this._renderVariableChildren(name, variable, depth, origin)
            : null
        }
        showHandle={this.state.mode === 'move'}
        showSelectionCheckbox={this.state.mode === 'select'}
        isSelected={!!this.state.selectedVariables[variable.ptr]}
        onSelect={select =>
          this._selectVariable({ name, ptr: variable.ptr, variable }, select)
        }
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
