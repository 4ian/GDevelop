// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import { ColumnStackLayout } from '../UI/Layout';
import InlineCheckbox from '../UI/InlineCheckbox';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../Utils/ColorTransformer';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import Text from '../UI/Text';
import useForceUpdate from '../Utils/UseForceUpdate';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import HelpButton from '../UI/HelpButton';
import { Tab, Tabs } from '../UI/Tabs';
import EffectsList from '../EffectsList';
import { Column, Spacer } from '../UI/Grid';
const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  layer: gdLayer,
  initialInstances: gdInitialInstancesContainer,

  initialTab: 'properties' | 'effects',

  onClose: () => void,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

const LayerEditorDialog = (props: Props) => {
  const {
    initialTab,
    layer,
    initialInstances,
    onClose,
    hotReloadPreviewButtonProps,
  } = props;
  const forceUpdate = useForceUpdate();
  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: layer,
    onCancel: onClose,
  });
  const [currentTab, setCurrentTab] = React.useState(initialTab);
  const { instancesCount, highestZOrder } = React.useMemo(
    () => {
      const zOrderFinder = new gd.HighestZOrderFinder();
      zOrderFinder.restrictSearchToLayer(layer.getName());

      initialInstances.iterateOverInstances(zOrderFinder);
      const instancesCount = zOrderFinder.getInstancesCount();
      const highestZOrder = zOrderFinder.getHighestZOrder();
      zOrderFinder.delete();
      return { instancesCount, highestZOrder };
    },
    [layer, initialInstances]
  );

  return (
    <Dialog
      onApply={onClose}
      noMargin
      open
      title={<Trans>Edit Layer Properties</Trans>}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath={'/interface/scene-editor/layer-effects' /* TODO */}
        />,
        <HotReloadPreviewButton
          key="hot-reload-preview-button"
          {...hotReloadPreviewButtonProps}
        />,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
          key={'Cancel'}
        />,
        <FlatButton
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onClose}
          key={'Apply'}
        />,
      ]}
      onRequestClose={onCancelChanges}
      fullHeight
      flexBody
    >
      <Column expand noMargin useFullHeight>
        <Tabs value={currentTab} onChange={setCurrentTab}>
          <Tab label={<Trans>Properties</Trans>} value="properties" />
          <Tab label={<Trans>Effects</Trans>} value="effects" />
        </Tabs>
        {currentTab === 'properties' && (
          <ColumnStackLayout>
            {layer.isLightingLayer() ? (
              <DismissableAlertMessage
                kind="info"
                identifier="lighting-layer-usage"
              >
                <Trans>
                  The lighting layer renders an ambient light on the scene. All
                  lights should be placed on this layer so that shadows are
                  properly rendered. By default, the layer follows the base
                  layer camera. Uncheck this if you want to manually move the
                  camera using events.
                </Trans>
              </DismissableAlertMessage>
            ) : null}
            <Text>
              There are {instancesCount} instances of objects on this layer.
            </Text>
            {!props.project.getUseDeprecatedZeroAsDefaultZOrder() && (
              <Text>
                Objects created using events on this layer will be given a "Z
                order" of {highestZOrder + 1}, so that they appear in front of
                all objects of this layer. You can change this using the action
                to change an object Z order, after using an action to create it.
              </Text>
            )}
            <InlineCheckbox
              label={<Trans>Layer visible</Trans>}
              checked={layer.getVisibility()}
              onCheck={(e, checked) => {
                layer.setVisibility(checked);
                forceUpdate();
              }}
            />
            {layer.isLightingLayer() ? (
              <React.Fragment>
                <Text size="title">
                  <Trans>Lighting settings</Trans>
                </Text>
                <InlineCheckbox
                  label={<Trans>Automatically follow the base layer.</Trans>}
                  checked={layer.isFollowingBaseLayerCamera()}
                  onCheck={(e, checked) => {
                    layer.setFollowBaseLayerCamera(checked);
                    forceUpdate();
                  }}
                />
                <ColorField
                  fullWidth
                  floatingLabelText={<Trans>Ambient light color</Trans>}
                  disableAlpha
                  color={rgbColorToRGBString({
                    r: layer.getAmbientLightColorRed(),
                    g: layer.getAmbientLightColorGreen(),
                    b: layer.getAmbientLightColorBlue(),
                  })}
                  onChange={color => {
                    const rgbColor = rgbStringAndAlphaToRGBColor(color);
                    if (rgbColor) {
                      layer.setAmbientLightColor(
                        rgbColor.r,
                        rgbColor.g,
                        rgbColor.b
                      );
                      forceUpdate();
                    }
                  }}
                />
              </React.Fragment>
            ) : (
              // Add some space to avoid a dialog to short that would show scrollbars
              <React.Fragment>
                <Spacer />
                <Spacer />
              </React.Fragment>
            )}
          </ColumnStackLayout>
        )}
        {currentTab === 'effects' && (
          <EffectsList
            target="layer"
            project={props.project}
            resourceSources={props.resourceSources}
            onChooseResource={props.onChooseResource}
            resourceExternalEditors={props.resourceExternalEditors}
            effectsContainer={layer.getEffects()}
            onEffectsUpdated={
              forceUpdate /*Force update to ensure dialog is properly positioned*/
            }
          />
        )}
      </Column>
    </Dialog>
  );
};

export default LayerEditorDialog;
