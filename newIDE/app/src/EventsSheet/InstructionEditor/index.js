import React, { Component } from 'react';
import InstructionTypeSelector from './InstructionTypeSelector.js';
import InstructionParametersEditor from './InstructionParametersEditor.js';

const styles = {
  container: {
    display: 'flex',
  },
  typeSelector: {
    flex: 1,
    maxHeight: 500, /* TODO */
  },
  parametersEditor: {
    flex: 2,
  },
};

export default class InstructionEditor extends Component {
  render() {
    const { instruction, isCondition, project, layout } = this.props;

    return (
      <div style={styles.container}>
        <InstructionTypeSelector
          style={styles.typeSelector}
          isCondition={isCondition}
          onChoose={type => {
            instruction.setType(type);
            this.forceUpdate();
          }}
        />
        <InstructionParametersEditor
          style={styles.parametersEditor}
          project={project}
          layout={layout}
          isCondition={isCondition}
          instruction={instruction}
        />
      </div>
    );
  }
}
