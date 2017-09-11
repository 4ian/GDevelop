import React, { Component } from 'react';
import VariableField from './VariableField';

export default class ObjectVariableField extends Component {
  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { project, layout } = this.props;

    let variablesContainer = null;
    if (this.props.instruction.getParametersCount() > 0) {
      const objectName = this.props.instruction.getParameter(0);
      if (layout.hasObjectNamed(objectName)) {
        variablesContainer = layout.getObject(objectName).getVariables();
      } else if (project.hasObjectNamed(objectName)) {
        variablesContainer = project.getObject(objectName).getVariables();
      }
    }

    return (
      <VariableField
        variablesContainer={variablesContainer}
        value={this.props.value}
        onChange={this.props.onChange}
        isInline={this.props.isInline}
        ref={field => this._field = field}
      />
    );
  }
}
