import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import InstructionSelector from './InstructionOrExpressionSelector/InstructionSelector.js';
import InstructionParametersEditor from './InstructionParametersEditor.js';

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

export default class InstructionEditor extends Component {
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
    const { instruction, isCondition, project, layout } = this.props;

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
            isCondition={isCondition}
            instruction={instruction}
            resourceSources={this.props.resourceSources}
            onChooseResource={this.props.onChooseResource}
            resourceExternalEditors={this.props.resourceExternalEditors}
            ref={instructionParametersEditor =>
              (this._instructionParametersEditor = instructionParametersEditor)}
            focusOnMount={instruction.getType()}
          />
        </Paper>
      </div>
    );
  }
}
