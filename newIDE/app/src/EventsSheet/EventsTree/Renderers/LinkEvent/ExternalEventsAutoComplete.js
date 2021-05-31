// @flow
import * as React from 'react';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../../../ProjectManager/EnumerateProjectItems';
import SemiControlledAutoComplete, {
  type DataSource,
} from '../../../../UI/SemiControlledAutoComplete';

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

type Props = {|
  onChange: string => void,
  value: string,
  project?: gdProject,
  isInline?: boolean,
  onRequestClose?: () => void,
|};

export default class ExternalEventsAutoComplete extends React.Component<
  Props,
  {||}
> {
  _field: ?any;

  focus() {
    if (this._field) this._field.focus();
  }

  render(): React.Node {
    const { value, onChange, onRequestClose, isInline, project } = this.props;

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        fullWidth
        id="external-events-field"
        value={value}
        onChange={onChange}
        onRequestClose={onRequestClose}
        dataSource={getList(project)}
        openOnFocus={!isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
