// @flow
import { Trans, t } from '@lingui/macro';
import React from 'react';
import TextField from '../UI/TextField';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
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
import SceneVariable from '../UI/CustomSvgIcons/SceneVariable';
import SelectOption from '../UI/SelectOption';
import SelectField from '../UI/SelectField';
import Text from '../UI/Text';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

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
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onBackgroundColorChanged: () => void,
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
  projectScopedContainersAccessor,
  onBackgroundColorChanged,
}: Props) => {
  const [windowTitle, setWindowTitle] = React.useState<string>(
    layout.getWindowDefaultTitle()
  );
  const [
    shouldStopSoundsOnStartup,
    setShouldStopSoundsOnStartup,
  ] = React.useState<boolean>(layout.stopSoundsOnStartup());

  const [resourcesPreloading, setResourcesPreloading] = React.useState<string>(
    layout.getResourcesPreloading()
  );
  const [resourcesUnloading, setResourcesUnloading] = React.useState<string>(
    layout.getResourcesUnloading()
  );

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
        setResourcesPreloading(layout.getResourcesPreloading());
        setResourcesUnloading(layout.getResourcesUnloading());
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
    layout.setResourcesPreloading(resourcesPreloading);
    layout.setResourcesUnloading(resourcesUnloading);
    const hasBackgroundColorChanged =
      backgroundColor &&
      layout.getBackgroundColorRed() !== backgroundColor.r &&
      layout.getBackgroundColorGreen() !== backgroundColor.g &&
      layout.getBackgroundColorBlue() !== backgroundColor.b;
    layout.setBackgroundColor(
      backgroundColor ? backgroundColor.r : 0,
      backgroundColor ? backgroundColor.g : 0,
      backgroundColor ? backgroundColor.b : 0
    );
    onApply();
    if (hasBackgroundColorChanged) {
      onBackgroundColorChanged();
    }
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

  const areAdvancedPropertiesModified =
    resourcesPreloading !== 'inherit' ||
    resourcesUnloading !== 'inherit' ||
    windowTitle !== '';

  const propertiesEditors = allBehaviorSharedDataNames
    .map(behaviorName => {
      const behaviorSharedData = layout.getBehaviorSharedData(behaviorName);

      if (isNullPtr(gd, behaviorSharedData)) return null;

      const behaviorTypeName = behaviorSharedData.getTypeName();

      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        gd.JsPlatform.get(),
        behaviorTypeName
      );

      const properties = behaviorSharedData.getProperties();
      const propertiesSchema = propertiesMapToSchema({
        properties,
        defaultValueProperties: behaviorMetadata
          ? behaviorMetadata.getSharedProperties()
          : null,
        getProperties: sharedDataContent => behaviorSharedData.getProperties(),
        onUpdateProperty: (sharedDataContent, name, value) => {
          behaviorSharedData.updateProperty(name, value);
        },
      });
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
            noMargin
          >
            <AccordionHeader
              actions={[
                <HelpIcon
                  key="help"
                  size="small"
                  helpPagePath={behaviorMetadata.getHelpPath()}
                />,
              ]}
              noMargin
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
            <AccordionBody disableGutters>
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
                    projectScopedContainersAccessor={
                      projectScopedContainersAccessor
                    }
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
          icon={<SceneVariable fontSize="small" />}
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
        <ColorField
          floatingLabelText={<Trans>Scene background color</Trans>}
          fullWidth
          disableAlpha
          color={rgbColorToRGBString(backgroundColor)}
          onChange={color =>
            setBackgroundColor(rgbStringAndAlphaToRGBColor(color))
          }
        />
        <Checkbox
          checked={shouldStopSoundsOnStartup}
          label={
            <Trans>Stop music and sounds at the beginning of this scene</Trans>
          }
          onCheck={(e, check) => setShouldStopSoundsOnStartup(check)}
        />
        {!some(propertiesEditors) && (
          <EmptyMessage>
            <Trans>
              Additional properties will appear here when you add behaviors to
              objects, such as the 2D or 3D Physics Engine.
            </Trans>
          </EmptyMessage>
        )}
        {propertiesEditors}
        <Accordion defaultExpanded={areAdvancedPropertiesModified} noMargin>
          <AccordionHeader noMargin>
            <Text size="sub-title">
              <Trans>Advanced settings</Trans>
            </Text>
          </AccordionHeader>
          <AccordionBody disableGutters>
            <ColumnStackLayout expand noMargin>
              <SelectField
                floatingLabelText={<Trans>Resources preloading</Trans>}
                fullWidth
                value={resourcesPreloading}
                onChange={e => setResourcesPreloading(e.target.value)}
              >
                <SelectOption
                  value="inherit"
                  label={t`Use the project setting`}
                />
                <SelectOption
                  value="at-startup"
                  label={t`Always preload at startup`}
                />
                <SelectOption value="never" label={t`Never preload`} />
              </SelectField>
              <SelectField
                floatingLabelText={<Trans>Resources unloading</Trans>}
                fullWidth
                value={resourcesUnloading}
                onChange={e => setResourcesUnloading(e.target.value)}
              >
                <SelectOption
                  value="inherit"
                  label={t`Use the project setting`}
                />
                <SelectOption
                  value="at-scene-exit"
                  label={t`Unload at scene exit`}
                />
                <SelectOption value="never" label={t`Never unload`} />
              </SelectField>
              <TextField
                floatingLabelText={<Trans>Window title</Trans>}
                fullWidth
                type="text"
                value={windowTitle}
                onChange={(e, value) => setWindowTitle(value)}
              />
            </ColumnStackLayout>
          </AccordionBody>
        </Accordion>
        {onOpenMoreSettings && (
          <FlatButton
            label={<Trans>Open more settings</Trans>}
            primary
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
