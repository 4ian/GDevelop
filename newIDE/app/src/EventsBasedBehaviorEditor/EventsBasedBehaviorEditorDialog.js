// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import EventsBasedBehaviorEditor from './index';
import HelpButton from '../UI/HelpButton';

const gd: libGDevelop = global.gd;

type Props = {|
  onApply: () => void,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onRenameProperty: (oldName: string, newName: string) => void,
|};

export default class EventsBasedBehaviorEditorDialog extends React.Component<
  Props,
  {||}
> {
  render() {
    const {
      onApply,
      eventsBasedBehavior,
      eventsFunctionsExtension,
      project,
    } = this.props;

    const onApplyAndFixIssues = () => {
      onApply();
      fillRequiredBehaviorProperties(this.props.project);
    };

    return (
      <Dialog
        onApply={onApplyAndFixIssues}
        noMargin
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/behaviors/events-based-behaviors"
          />,
        ]}
        actions={[
          <FlatButton
            label={<Trans>Apply</Trans>}
            primary
            keyboardFocused
            onClick={onApplyAndFixIssues}
            key={'Apply'}
          />,
        ]}
        cannotBeDismissed={true}
        open
        onRequestClose={onApplyAndFixIssues}
        title={<Trans>Edit the behavior</Trans>}
      >
        <EventsBasedBehaviorEditor
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedBehavior={eventsBasedBehavior}
          onTabChanged={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
          onPropertiesUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
          onRenameProperty={this.props.onRenameProperty}
        />
      </Dialog>
    );
  }
}

/**
 * Try to find a default value for any required behavior property that is set
 * with an invalid value.
 * @param {*} project
 */
const fillRequiredBehaviorProperties = (project: gdProject): void => {
  const problems = gd.WholeProjectRefactorer.findInvalidRequiredBehaviorProperties(
    project
  );
  for (let index = 0; index < problems.size(); index++) {
    const problem = problems.at(index);

    const suggestedBehaviorNames = gd.WholeProjectRefactorer.getBehaviorsWithType(
      problem.getSourceObject(),
      problem.getExpectedBehaviorTypeName()
    ).toJSArray();

    if (suggestedBehaviorNames.length > 0) {
      // There is a matching behavior on the object use it by default.
      const behaviorContent = problem.getSourceBehaviorContent();
      const behavior = gd.MetadataProvider.getBehaviorMetadata(
        project.getCurrentPlatform(),
        behaviorContent.getTypeName()
      ).get();
      behavior.updateProperty(
        behaviorContent.getContent(),
        problem.getSourcePropertyName(),
        // It's unlikely the object has 2 behaviors of the same type.
        suggestedBehaviorNames[0]
      );
    }
  }
};
