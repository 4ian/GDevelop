// @flow
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import uniq from 'lodash/uniq';
import GenericExpressionField from './GenericExpressionField';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import { getLastObjectParameterValue } from './ParameterMetadataTools';

const gd: libGDevelop = global.gd;

type Props = {
  ...ParameterFieldProps,
};

type State = {|
  autocompletionIdentifierNames: ExpressionAutocompletion,
|};
export default class IdentifierField extends Component<
  ParameterFieldProps,
  {||}
> {
  _field: ?GenericExpressionField;

  constructor(props: Props) {
    super(props);
    this.state = {
      autocompletionIdentifierNames: [],
    };
  }

  componentDidMount() {
    this.updateAutocompletions();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.variablesContainer !== this.props.variablesContainer) {
      this.updateAutocompletions();
    }
  }

  /**
   * Can be called to set up or force updating the variables list.
   */
  updateAutocompletions() {
    const {
      project,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = this.props;

    const { layout } = scope;

    const objectName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    }) || "";
    const parameterMetadata = instructionMetadata ? instructionMetadata.getParameter(parameterIndex) : expressionMetadata ? expressionMetadata.getParameter(parameterIndex) : null;
    const identifierName = parameterMetadata ? parameterMetadata.getExtraInfo() : "";

    const allIdentifierExpressions =
      project && layout
        ? gd.EventsIdentifiersFinder.findAllIdentifiers(
              project.getCurrentPlatform(),
              project,
              layout,
              identifierName,
              objectName
            ).toNewVectorString()
            .toJSArray()
        : [];

    console.log("identifierName: " + identifierName);
    console.log("objectName: " + objectName);
    console.log(allIdentifierExpressions);

    this.setState({
      autocompletionIdentifierNames: allIdentifierExpressions.map(expression => ({
        kind: 'FullExpression',
        completion: expression,
        shouldConvertToString: false,
      })),
    });
  }

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          this.state.autocompletionIdentifierNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
