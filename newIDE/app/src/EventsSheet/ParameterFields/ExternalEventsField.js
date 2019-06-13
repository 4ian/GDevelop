// @flow
import * as React from 'react';
import Divider from 'material-ui/Divider';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

type DataSourceType = Array<{| text: string, value: React.Node |}>;

const getList = (project: ?gdProject): DataSourceType => {
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
  return [...externalEvents, { text: '', value: <Divider /> }, ...layouts];
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
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
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
