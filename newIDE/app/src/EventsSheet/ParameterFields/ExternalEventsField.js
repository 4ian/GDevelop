// @flow
import * as React from 'react';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete, {
  type DataSource,
} from '../../UI/SemiControlledAutoComplete';

const getList = (project: ?gdProject): DataSource => {
  if (!project) {
    return [];
  }

  const externalEvents = enumerateExternalEvents(project).map(
    externalEvents => ({
      text: externalEvents.getName(),
      value: externalEvents.getName(),
    })
  );
  const layouts = enumerateLayouts(project).map(layout => ({
    text: layout.getName(),
    value: layout.getName(),
  }));
  return [...externalEvents, { type: 'separator' }, ...layouts];
};

export default class ExternalEventsField extends React.Component<
  ParameterFieldProps,
  {||}
> {
  _field: ?any;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      value,
      onChange,
      isInline,
      project,
      parameterMetadata,
    } = this.props;

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
        fullWidth
        id="external-events-field"
        value={value}
        onChange={onChange}
        dataSource={getList(project)}
        openOnFocus={!isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
