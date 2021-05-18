// @flow
import * as React from 'react';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

const getList = (project: ?gdProject): Array<ExpressionAutocompletion> => {
  if (!project) {
    return [];
  }

  const externalEvents = enumerateExternalEvents(project).map(
    externalEvents => ({
      kind: 'Text',
      completion: `"${externalEvents.getName()}"`,
    })
  );
  const layouts = enumerateLayouts(project).map(layout => ({
    kind: 'Text',
    completion: `"${layout.getName()}"`,
  }));

  return externalEvents.concat(layouts);
};

export default class ExternalEventsField extends React.Component<
  ParameterFieldProps,
  {||}
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        additionalAutocompletions={expression =>
          getList(this.props.project).filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
