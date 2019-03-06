// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';
import InstructionSelector from './InstructionOrExpressionSelector/InstructionSelector.js';
import InstructionParametersEditor from './InstructionParametersEditor.js';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
  typeSelector: {
    flex: 1,
    overflowY: 'scroll',
  },
  parametersEditor: {
    flex: 2,
    display: 'flex',
    paddingLeft: 16,
    paddingRight: 16,
    zIndex: 1, // Put the Paper shadow on the type selector
  },
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  instruction: gdInstruction,
  isCondition: boolean,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  style?: Object,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
|};
type State = {||};

export default class InstructionEditor extends React.Component<Props, State> {
  _instructionParametersEditor: ?InstructionParametersEditor;

  chooseType = (type: string) => {
    const { instruction } = this.props;
    instruction.setType(type);
    this.forceUpdate(() => {
      if (this._instructionParametersEditor) {
        this._instructionParametersEditor.focus();
      }
    });
  };

  render() {
    const {
      instruction,
      isCondition,
      project,
      layout,
      globalObjectsContainer,
      objectsContainer,
    } = this.props;

    return (
      <div style={styles.container}>
        <InstructionSelector
          style={styles.typeSelector}
          isCondition={isCondition}
          selectedType={instruction.getType()}
          onChoose={this.chooseType}
          focusOnMount={!instruction.getType()}
        />
        <Paper style={styles.parametersEditor} rounded={false} zDepth={2}>
          <InstructionParametersEditor
            project={project}
            layout={layout}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            isCondition={isCondition}
            instruction={instruction}
            resourceSources={this.props.resourceSources}
            onChooseResource={this.props.onChooseResource}
            resourceExternalEditors={this.props.resourceExternalEditors}
            openInstructionOrExpression={this.props.openInstructionOrExpression}
            ref={instructionParametersEditor =>
              (this._instructionParametersEditor = instructionParametersEditor)
            }
            focusOnMount={instruction.getType()}
          />
        </Paper>
      </div>
    );
  }
}
