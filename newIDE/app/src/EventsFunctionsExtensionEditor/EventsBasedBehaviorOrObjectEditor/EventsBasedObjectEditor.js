// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import AlertMessage from '../../UI/AlertMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import useForceUpdate from '../../Utils/UseForceUpdate';
import HelpButton from '../../UI/HelpButton';
import { Line } from '../../UI/Grid';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import { CompactTextAreaField } from '../../UI/CompactTextAreaField';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import { CompactToggleField } from '../../UI/CompactToggleField';

const gd: libGDevelop = global.gd;

const isDev = Window.isDev();

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onOpenCustomObjectEditor: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
|};

export default function EventsBasedObjectEditor({
  eventsFunctionsExtension,
  eventsBasedObject,
  onOpenCustomObjectEditor,
  unsavedChanges,
  onEventsBasedObjectChildrenEdited,
}: Props): React.Node {
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
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout expand noMargin>
          <DismissableAlertMessage
            identifier="events-based-object-explanation"
            kind="info"
          >
            <Trans>
              This is the configuration of your object. Make sure to choose a
              proper internal name as it's hard to change it later.
            </Trans>
          </DismissableAlertMessage>
          <CompactPropertiesEditorRowField
            label={i18n._(t`Internal Name`)}
            field={
              <CompactSemiControlledTextField
                value={eventsBasedObject.getName()}
                disabled
                onChange={() => {}}
              />
            }
          />
          <CompactPropertiesEditorRowField
            label={i18n._(t`Name displayed in editor`)}
            field={
              <CompactSemiControlledTextField
                commitOnBlur
                value={eventsBasedObject.getFullName()}
                onChange={text => {
                  eventsBasedObject.setFullName(text);
                  onChange();
                }}
              />
            }
          />
          <CompactTextAreaField
            label={i18n._(t`Description`)}
            placeholder={i18n._(
              t`The description of the object should explain what the object is doing, and, briefly, how to use it.`
            )}
            value={eventsBasedObject.getDescription()}
            onChange={text => {
              eventsBasedObject.setDescription(text);
              onChange();
            }}
          />
          <CompactPropertiesEditorRowField
            label={i18n._(t`Default name for created objects`)}
            field={
              <CompactSemiControlledTextField
                commitOnBlur
                value={
                  eventsBasedObject.getDefaultName() ||
                  eventsBasedObject.getName()
                }
                onChange={newName => {
                  eventsBasedObject.setDefaultName(
                    gd.Project.getSafeName(newName)
                  );
                  onChange();
                }}
              />
            }
          />
          {isDev && (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Asset store tag`)}
              field={
                <CompactSemiControlledTextField
                  commitOnBlur
                  value={eventsBasedObject.getAssetStoreTag()}
                  onChange={value => {
                    eventsBasedObject.setAssetStoreTag(value);
                    onChange();
                  }}
                />
              }
            />
          )}
          <CompactToggleField
            label={i18n._(t`Use 3D rendering`)}
            checked={eventsBasedObject.isRenderedIn3D()}
            onCheck={checked => {
              eventsBasedObject.markAsRenderedIn3D(checked);
              onChange();
            }}
          />
          <CompactToggleField
            label={i18n._(t`Expand inner area with parent`)}
            checked={eventsBasedObject.isInnerAreaFollowingParentSize()}
            onCheck={checked => {
              eventsBasedObject.markAsInnerAreaFollowingParentSize(checked);
              onChange();
              onEventsBasedObjectChildrenEdited(eventsBasedObject);
            }}
          />
          <CompactToggleField
            label={i18n._(t`Contains text`)}
            checked={eventsBasedObject.isTextContainer()}
            onCheck={checked => {
              eventsBasedObject.markAsTextContainer(checked);
              onChange();
            }}
          />
          <CompactToggleField
            label={i18n._(t`Has animations (JavaScript only)`)}
            checked={eventsBasedObject.isAnimatable()}
            onCheck={checked => {
              eventsBasedObject.markAsAnimatable(checked);
              onChange();
            }}
          />
          {isDev && (
            <CompactToggleField
              label={i18n._(t`Use legacy renderer`)}
              checked={eventsBasedObject.isUsingLegacyInstancesRenderer()}
              onCheck={checked => {
                eventsBasedObject.makAsUsingLegacyInstancesRenderer(checked);
                onChange();
                onEventsBasedObjectChildrenEdited(eventsBasedObject);
              }}
            />
          )}
          <CompactToggleField
            label={i18n._(t`Private`)}
            checked={eventsBasedObject.isPrivate()}
            onCheck={checked => {
              eventsBasedObject.setPrivate(checked);
              onChange();
              onEventsBasedObjectChildrenEdited(eventsBasedObject);
            }}
            markdownDescription={
              eventsBasedObject.isPrivate()
                ? i18n._(
                    t`This object won't be visible in the scene and events editors.`
                  )
                : i18n._(
                    t`This object will be visible in the scene and events editors.`
                  )
            }
          />
          {eventsFunctionsExtension.getOriginName() ===
          'gdevelop-extension-store' ? (
            <AlertMessage
              kind="error"
              renderRightButton={() => (
                <RaisedButton
                  label={<Trans>Edit the default variant</Trans>}
                  primary
                  onClick={onOpenCustomObjectEditor}
                />
              )}
            >
              <Trans>
                The default variant is erased when the extension is updated.
              </Trans>
            </AlertMessage>
          ) : (
            <Line noMargin justifyContent="center">
              <RaisedButton
                label={<Trans>Open visual editor for the object</Trans>}
                primary
                onClick={onOpenCustomObjectEditor}
              />
            </Line>
          )}
          <Line noMargin>
            <HelpButton
              key="help"
              helpPagePath="/objects/custom-objects-prefab-template"
            />
          </Line>
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
