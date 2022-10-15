// @flow
import * as React from 'react';
import {
  enumerateLayouts,
  enumerateExternalEvents,
} from '../../../../ProjectManager/EnumerateProjectItems';
import SemiControlledAutoComplete, {
  type DataSource,
} from '../../../../UI/SemiControlledAutoComplete';

const getList = (
  currentSceneName: ?string,
  currentExternalEventName: ?string,
  project: ?gdProject
): DataSource => {
  if (!project || !currentSceneName) {
    return [];
  }

  const externalEvents = enumerateExternalEvents(project)
    .filter(
      externalEvents => externalEvents.getName() !== currentExternalEventName
    )
    .map(externalEvents => ({
      text: externalEvents.getName(),
      value: externalEvents.getName(),
    }));

  const layouts = enumerateLayouts(project)
    .filter(layout => layout.getName() !== currentSceneName)
    .map(layout => ({
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
  onApply?: () => void,
  sceneName?: string,
  externalEventsName?: string,
|};

export default class ExternalEventsAutoComplete extends React.Component<
  Props,
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
      onRequestClose,
      onApply,
      isInline,
      project,
      sceneName,
      externalEventsName,
    } = this.props;

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        fullWidth
        id="external-events-field"
        value={value}
        onChange={onChange}
        onRequestClose={onRequestClose}
        onApply={onApply}
        dataSource={getList(sceneName, externalEventsName, project)}
        openOnFocus={!isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
