// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import TextField from '../UI/TextField';
import RaisedButton from '../UI/RaisedButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import EmptyMessage from '../UI/EmptyMessage';
import BehaviorSharedPropertiesEditor from './BehaviorSharedPropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import some from 'lodash/some';
import Checkbox from '../UI/Checkbox';
import { isNullPtr } from '../Utils/IsNullPtr';
import { ColumnStackLayout } from '../UI/Layout';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
  type RGBColor,
} from '../Utils/ColorTransformer';
import HelpIcon from '../UI/HelpIcon';
import { Column, Line } from '../UI/Grid';
import DismissableTutorialMessage from '../Hints/DismissableTutorialMessage';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import { IconContainer } from '../UI/IconContainer';
import { getBehaviorTutorialIds } from '../Utils/GDevelopServices/Tutorial';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

const gd: libGDevelop = global.gd;

type Props = {|
  open: boolean,
  layout: gdLayout,
  project: gdProject,
  onApply: () => void,
  onClose: () => void,
  onOpenMoreSettings?: ?() => void,
  onEditVariables: () => void,
  resourceManagementProps: ResourceManagementProps,
|};

const ScenePropertiesDialog = ({
  open,
  layout,
  project,
  onApply,
  onClose,
  onOpenMoreSettings,
  onEditVariables,
  resourceManagementProps,
}: Props) => {
  const [windowTitle, setWindowTitle] = React.useState<string>(
    layout.getWindowDefaultTitle()
  );
  const [
    shouldStopSoundsOnStartup,
    setShouldStopSoundsOnStartup,
  ] = React.useState<boolean>(layout.stopSoundsOnStartup());
  const [backgroundColor, setBackgroundColor] = React.useState<?RGBColor>({
    r: layout.getBackgroundColorRed(),
    g: layout.getBackgroundColorGreen(),
    b: layout.getBackgroundColorBlue(),
    a: 1,
  });

  React.useEffect(
    () => {
      if (open && layout) {
        setWindowTitle(layout.getWindowDefaultTitle());
        setShouldStopSoundsOnStartup(layout.stopSoundsOnStartup());
        setBackgroundColor({
          r: layout.getBackgroundColorRed(),
          g: layout.getBackgroundColorGreen(),
          b: layout.getBackgroundColorBlue(),
          a: 1,
        });
      }
    },
    [open, layout]
  );

  const onSubmit = () => {
    layout.setWindowDefaultTitle(windowTitle);
    layout.setStopSoundsOnStartup(shouldStopSoundsOnStartup);
    layout.setBackgroundColor(
      backgroundColor ? backgroundColor.r : 0,
      backgroundColor ? backgroundColor.g : 0,
      backgroundColor ? backgroundColor.b : 0
    );
    onApply();
  };

  const actions = [
    // TODO: Add support for cancelling modifications made to BehaviorSharedData
    // (either by enhancing a function like propertiesMapToSchema or using copies)
    // and then re-enable cancel button.
    // <FlatButton
    //   label={<Trans>Cancel</Trans>}
    //   primary={false}
    //   onClick={onClose}
    // />,
    <DialogPrimaryButton
      label={<Trans>Ok</Trans>}
      key="ok"
      primary={true}
      onClick={onSubmit}
    />,
  ];

  const allBehaviorSharedDataNames = layout
    .getAllBehaviorSharedDataNames()
    .toJSArray();

  const propertiesEditors = allBehaviorSharedDataNames
    .map(behaviorName => {
      const behaviorSharedData = layout.getBehaviorSharedData(behaviorName);

      if (isNullPtr(gd, behaviorSharedData)) return null;

      const properties = behaviorSharedData.getProperties();
      const propertiesSchema = propertiesMapToSchema(
        properties,
        sharedDataContent => behaviorSharedData.getProperties(),
        (sharedDataContent, name, value) => {
          behaviorSharedData.updateProperty(name, value);
        }
      );
      const behaviorTypeName = behaviorSharedData.getTypeName();

      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        gd.JsPlatform.get(),
        behaviorTypeName
      );
      const tutorialIds = getBehaviorTutorialIds(behaviorTypeName);
      // TODO Make this a functional component to use PreferencesContext
      const enabledTutorialIds = [];
      const iconUrl = behaviorMetadata.getIconFilename();

      return (
        !!propertiesSchema.length && (
          <Accordion
            key={behaviorName}
            defaultExpanded
            id={`behavior-parameters-${behaviorName}`}
          >
            <AccordionHeader
              actions={[
                <HelpIcon
                  key="help"
                  size="small"
                  helpPagePath={behaviorMetadata.getHelpPath()}
                />,
              ]}
            >
              {iconUrl ? (
                <IconContainer
                  src={iconUrl}
                  alt={behaviorMetadata.getFullName()}
                  size={20}
                />
              ) : null}
              <Column expand>
                <TextField
                  value={behaviorName}
                  margin="none"
                  fullWidth
                  disabled
                  onChange={(e, text) => {}}
                  id={`behavior-${behaviorName}-name-text-field`}
                />
              </Column>
            </AccordionHeader>
            <AccordionBody>
              <Column
                expand
                noMargin
                // Avoid Physics2 behavior overflow on small screens
                noOverflowParent
              >
                {enabledTutorialIds.length ? (
                  <Line>
                    <ColumnStackLayout expand>
                      {tutorialIds.map(tutorialId => (
                        <DismissableTutorialMessage
                          key={tutorialId}
                          tutorialId={tutorialId}
                        />
                      ))}
                    </ColumnStackLayout>
                  </Line>
                ) : null}
                <Line>
                  <BehaviorSharedPropertiesEditor
                    key={behaviorName}
                    behaviorSharedData={behaviorSharedData}
                    project={project}
                    resourceManagementProps={resourceManagementProps}
                  />
                </Line>
              </Column>
            </AccordionBody>
          </Accordion>
        )
      );
    })
    .filter(Boolean);

  return (
    <Dialog
      title={<Trans>{layout.getName()} properties</Trans>}
      actions={actions}
      secondaryActions={[
        <RaisedButton
          key="edit-scene-variables"
          label={<Trans>Edit scene variables</Trans>}
          fullWidth
          onClick={() => {
            onEditVariables();
            onClose();
          }}
        />,
      ]}
      onRequestClose={onClose}
      onApply={onSubmit}
      open={open}
      maxWidth="sm"
    >
      <ColumnStackLayout expand noMargin>
        <TextField
          floatingLabelText={<Trans>Window title</Trans>}
          fullWidth
          type="text"
          value={windowTitle}
          onChange={(e, value) => setWindowTitle(value)}
        />
        <Checkbox
          checked={shouldStopSoundsOnStartup}
          label={
            <Trans>Stop music and sounds at the beginning of this scene</Trans>
          }
          onCheck={(e, check) => setShouldStopSoundsOnStartup(check)}
        />
        <ColorField
          floatingLabelText={<Trans>Scene background color</Trans>}
          fullWidth
          disableAlpha
          color={rgbColorToRGBString(backgroundColor)}
          onChange={color =>
            setBackgroundColor(rgbStringAndAlphaToRGBColor(color))
          }
        />
        {!some(propertiesEditors) && (
          <EmptyMessage>
            <Trans>
              Any additional properties will appear here if you add behaviors to
              objects, like Physics behavior.
            </Trans>
          </EmptyMessage>
        )}
        {propertiesEditors}
        {onOpenMoreSettings && (
          <RaisedButton
            label={<Trans>Open advanced settings</Trans>}
            fullWidth
            onClick={() => {
              if (onOpenMoreSettings) onOpenMoreSettings();
              onClose();
            }}
          />
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ScenePropertiesDialog;
