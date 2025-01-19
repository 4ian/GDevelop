// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import TextField from '../UI/TextField';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import { ColumnStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
import Checkbox from '../UI/Checkbox';
import HelpButton from '../UI/HelpButton';
import { Line } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';

const gd: libGDevelop = global.gd;

const isDev = Window.isDev();

type Props = {|
  eventsBasedObject: gdEventsBasedObject,
  onOpenCustomObjectEditor: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onEventsBasedObjectChildrenEdited: () => void,
|};

export default function EventsBasedObjectEditor({
  eventsBasedObject,
  onOpenCustomObjectEditor,
  unsavedChanges,
  onEventsBasedObjectChildrenEdited,
}: Props) {
  const forceUpdate = useForceUpdate();

  const onChange = React.useCallback(
    () => {
      if (unsavedChanges) {
        unsavedChanges.triggerUnsavedChanges();
      }
      forceUpdate();
    },
    [forceUpdate, unsavedChanges]
  );

  return (
    <ColumnStackLayout expand noMargin>
      <DismissableAlertMessage
        identifier="events-based-object-explanation"
        kind="info"
      >
        <Trans>
          This is the configuration of your object. Make sure to choose a proper
          internal name as it's hard to change it later.
        </Trans>
      </DismissableAlertMessage>
      <TextField
        floatingLabelText={<Trans>Internal Name</Trans>}
        value={eventsBasedObject.getName()}
        disabled
        fullWidth
      />
      <SemiControlledTextField
        commitOnBlur
        floatingLabelText={<Trans>Name displayed in editor</Trans>}
        value={eventsBasedObject.getFullName()}
        onChange={text => {
          eventsBasedObject.setFullName(text);
          onChange();
        }}
        fullWidth
      />
      <SemiControlledTextField
        commitOnBlur
        floatingLabelText={<Trans>Description</Trans>}
        floatingLabelFixed
        translatableHintText={t`The description of the object should explain what the object is doing, and, briefly, how to use it.`}
        value={eventsBasedObject.getDescription()}
        onChange={text => {
          eventsBasedObject.setDescription(text);
          onChange();
        }}
        multiline
        fullWidth
        rows={3}
      />
      <SemiControlledTextField
        commitOnBlur
        floatingLabelText={<Trans>Default name for created objects</Trans>}
        value={
          eventsBasedObject.getDefaultName() || eventsBasedObject.getName()
        }
        onChange={newName => {
          eventsBasedObject.setDefaultName(gd.Project.getSafeName(newName));
          onChange();
        }}
        fullWidth
      />
      <Checkbox
        label={<Trans>Use 3D rendering</Trans>}
        checked={eventsBasedObject.isRenderedIn3D()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsRenderedIn3D(checked);
          onChange();
        }}
      />
      <Checkbox
        label={<Trans>Has animations</Trans>}
        checked={eventsBasedObject.isAnimatable()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsAnimatable(checked);
          onChange();
        }}
      />
      <Checkbox
        label={<Trans>Contains text</Trans>}
        checked={eventsBasedObject.isTextContainer()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsTextContainer(checked);
          onChange();
        }}
      />
      <Checkbox
        label={<Trans>Expand inner area with parent</Trans>}
        checked={eventsBasedObject.isInnerAreaFollowingParentSize()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsInnerAreaFollowingParentSize(checked);
          onChange();
          onEventsBasedObjectChildrenEdited();
        }}
      />
      {isDev && (
        <Checkbox
          label={<Trans>Use legacy renderer</Trans>}
          checked={eventsBasedObject.isUsingLegacyInstancesRenderer()}
          onCheck={(e, checked) => {
            eventsBasedObject.makAsUsingLegacyInstancesRenderer(checked);
            onChange();
            onEventsBasedObjectChildrenEdited();
          }}
        />
      )}
      <Checkbox
        label={<Trans>Private</Trans>}
        checked={eventsBasedObject.isPrivate()}
        onCheck={(e, checked) => {
          eventsBasedObject.setPrivate(checked);
          onChange();
          onEventsBasedObjectChildrenEdited();
        }}
        tooltipOrHelperText={
          eventsBasedObject.isPrivate() ? (
            <Trans>
              This object won't be visible in the scene and events editors.
            </Trans>
          ) : (
            <Trans>
              This object will be visible in the scene and events editors.
            </Trans>
          )
        }
      />
      <Line noMargin justifyContent="center">
        <RaisedButton
          label={<Trans>Open visual editor for the object</Trans>}
          primary
          onClick={onOpenCustomObjectEditor}
        />
      </Line>
      <Line noMargin>
        <HelpButton
          key="help"
          helpPagePath="/objects/custom-objects-prefab-template"
        />
      </Line>
    </ColumnStackLayout>
  );
}
