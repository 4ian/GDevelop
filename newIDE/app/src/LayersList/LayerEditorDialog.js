// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import InlineCheckbox from '../UI/InlineCheckbox';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../Utils/ColorTransformer';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import Text from '../UI/Text';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import EffectsList from '../EffectsList';
import { Spacer } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  layout: gdLayout,
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
  const {
    onCancelChanges,
    notifyOfChange,
  } = useSerializableObjectCancelableEditor({
    serializableObject: layer,
    onCancel: onClose,
  });
  const [
    camera3DFieldOfViewError,
    setCamera3DFieldOfViewError,
  ] = React.useState<?React.Node>(null);
  const [
    camera3DFarPlaneDistanceError,
    setCamera3DFarPlaneDistanceError,
  ] = React.useState<?React.Node>(null);
  const [
    camera3DNearPlaneDistanceError,
    setCamera3DNearPlaneDistanceError,
  ] = React.useState<?React.Node>(null);
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

  const onChangeCamera3DFieldOfView = React.useCallback(
    value => {
      setCamera3DFieldOfViewError(null);
      const newValue = parseFloat(value) || 0;
      if (newValue <= 0 || newValue > 180) {
        setCamera3DFieldOfViewError(
          <Trans>
            The field of view cannot be lower than 0° or greater than 180°.
          </Trans>
        );
        return;
      }
      if (newValue === layer.getCamera3DFieldOfView()) return;
      layer.setCamera3DFieldOfView(newValue);
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, layer, notifyOfChange]
  );

  const checkNearPlaneDistanceError = React.useCallback(
    value => {
      setCamera3DNearPlaneDistanceError(null);
      const hasError =
        (value <= 0 && layer.getCameraType() !== 'orthographic') ||
        value >= layer.getCamera3DFarPlaneDistance();
      if (hasError) {
        setCamera3DNearPlaneDistanceError(
          <Trans>
            The near plane distance must be strictly greater than 0 and lower
            than the far plan distance.
          </Trans>
        );
      }
      return hasError;
    },
    [layer]
  );

  const onChangeCamera3DNearPlaneDistance = React.useCallback(
    value => {
      const newValue = parseFloat(value) || 0;
      const hasError = checkNearPlaneDistanceError(newValue);
      if (hasError) {
        return;
      }
      if (newValue === layer.getCamera3DNearPlaneDistance()) return;
      layer.setCamera3DNearPlaneDistance(newValue);
      forceUpdate();
      notifyOfChange();
    },
    [checkNearPlaneDistanceError, forceUpdate, layer, notifyOfChange]
  );

  const onChangeCamera3DFarPlaneDistance = React.useCallback(
    value => {
      setCamera3DFarPlaneDistanceError(null);
      const newValue = parseFloat(value) || 0;
      if (newValue <= layer.getCamera3DNearPlaneDistance()) {
        setCamera3DFarPlaneDistanceError(
          <Trans>
            The far plane distance must be greater than the near plan distance.
          </Trans>
        );

        return;
      }
      if (newValue === layer.getCamera3DFarPlaneDistance()) return;
      layer.setCamera3DFarPlaneDistance(newValue);
      forceUpdate();
      notifyOfChange();
    },
    [forceUpdate, layer, notifyOfChange]
  );

  return (
    <Dialog
      title={
        layer.getName() ? (
          <Trans>{layer.getName()} properties</Trans>
        ) : (
          <Trans>Base layer properties</Trans>
        )
      }
      open
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
        <DialogPrimaryButton
          label={<Trans>Apply</Trans>}
          primary
          onClick={onClose}
          key={'Apply'}
        />,
      ]}
      onRequestClose={onCancelChanges}
      onApply={onClose}
      fullHeight
      flexColumnBody
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              value: 'properties',
              label: <Trans>Properties</Trans>,
            },
            {
              value: 'effects',
              label: <Trans>Effects</Trans>,
            },
          ]}
        />
      }
    >
      {currentTab === 'properties' && (
        <ColumnStackLayout noMargin>
          {layer.isLightingLayer() ? (
            <DismissableAlertMessage
              kind="info"
              identifier="lighting-layer-usage"
            >
              <Trans>
                The lighting layer renders an ambient light on the scene. All
                lights should be placed on this layer so that shadows are
                properly rendered. By default, the layer follows the base layer
                camera. Uncheck this if you want to manually move the camera
                using events.
              </Trans>
            </DismissableAlertMessage>
          ) : null}
          <Text>
            <Trans>
              There are {instancesCount} instances of objects on this layer.
            </Trans>
          </Text>
          {!props.project.getUseDeprecatedZeroAsDefaultZOrder() && (
            <Text>
              <Trans>
                Objects created using events on this layer will be given a "Z
                order" of {highestZOrder + 1}, so that they appear in front of
                all objects of this layer. You can change this using the action
                to change an object Z order, after using an action to create it.
              </Trans>
            </Text>
          )}
          <InlineCheckbox
            label={<Trans>Hide the layer</Trans>}
            checked={!layer.getVisibility()}
            onCheck={(e, checked) => {
              layer.setVisibility(!checked);
              forceUpdate();
              notifyOfChange();
            }}
            tooltipOrHelperText={
              <Trans>
                This setting changes the visibility of the entire layer. Objects
                on the layer will not be treated as "hidden" for event
                conditions or actions.
              </Trans>
            }
          />
          {!layer.isLightingLayer() && (
            <ColumnStackLayout noMargin>
              <Text size="block-title">
                <Trans>3D settings</Trans>
              </Text>
              <SelectField
                fullWidth
                floatingLabelText={<Trans>Rendering type</Trans>}
                value={layer.getRenderingType()}
                onChange={(e, i, newValue: string) => {
                  layer.setRenderingType(newValue);
                  forceUpdate();
                }}
              >
                <SelectOption
                  value={''}
                  label={t`Display both 2D and 3D objects (default)`}
                />
                <SelectOption
                  value={'2d'}
                  label={t`Force display only 2D objects`}
                />
                <SelectOption
                  value={'3d'}
                  label={t`Force display only 3D objects`}
                  disabled={layer.isLightingLayer()}
                />
                <SelectOption
                  value={'2d+3d'}
                  label={t`Force display both 2D and 3D objects`}
                  disabled={layer.isLightingLayer()}
                />
              </SelectField>
              {layer.getRenderingType() !== '2d' && (
                <ColumnStackLayout noMargin>
                  <ResponsiveLineStackLayout noMargin>
                    <SelectField
                      fullWidth
                      floatingLabelText={<Trans>Camera type</Trans>}
                      value={layer.getCameraType()}
                      onChange={(e, i, newValue: string) => {
                        layer.setCameraType(newValue);
                        checkNearPlaneDistanceError(
                          layer.getCamera3DNearPlaneDistance()
                        );
                        forceUpdate();
                      }}
                    >
                      <SelectOption
                        value={'perspective'}
                        label={t`Perspective camera`}
                      />
                      <SelectOption
                        value={'orthographic'}
                        label={t`Orthographic camera`}
                      />
                    </SelectField>
                    <SemiControlledTextField
                      commitOnBlur
                      fullWidth
                      errorText={camera3DFieldOfViewError}
                      onChange={onChangeCamera3DFieldOfView}
                      value={layer.getCamera3DFieldOfView().toString(10)}
                      floatingLabelText={
                        <Trans>Field of view (in degrees)</Trans>
                      }
                      floatingLabelFixed
                      disabled={layer.getCameraType() !== 'perspective'}
                    />
                  </ResponsiveLineStackLayout>
                  <ResponsiveLineStackLayout noMargin>
                    <SemiControlledTextField
                      commitOnBlur
                      fullWidth
                      errorText={camera3DNearPlaneDistanceError}
                      onChange={onChangeCamera3DNearPlaneDistance}
                      value={layer.getCamera3DNearPlaneDistance().toString(10)}
                      floatingLabelText={<Trans>Near plane distance</Trans>}
                      floatingLabelFixed
                    />
                    <SemiControlledTextField
                      commitOnBlur
                      fullWidth
                      errorText={camera3DFarPlaneDistanceError}
                      onChange={onChangeCamera3DFarPlaneDistance}
                      value={layer.getCamera3DFarPlaneDistance().toString(10)}
                      floatingLabelText={<Trans>Far plane distance</Trans>}
                      floatingLabelFixed
                    />
                  </ResponsiveLineStackLayout>
                </ColumnStackLayout>
              )}
            </ColumnStackLayout>
          )}
          {layer.isLightingLayer() ? (
            <React.Fragment>
              <Text size="block-title">
                <Trans>Lighting settings</Trans>
              </Text>
              <InlineCheckbox
                label={<Trans>Automatically follow the base layer.</Trans>}
                checked={layer.isFollowingBaseLayerCamera()}
                onCheck={(e, checked) => {
                  layer.setFollowBaseLayerCamera(checked);
                  forceUpdate();
                  notifyOfChange();
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
                onChange={newColor => {
                  const currentRgbColor = {
                    r: layer.getAmbientLightColorRed(),
                    g: layer.getAmbientLightColorGreen(),
                    b: layer.getAmbientLightColorBlue(),
                  };
                  const newRgbColor = rgbStringAndAlphaToRGBColor(newColor);
                  if (
                    newRgbColor &&
                    (newRgbColor.r !== currentRgbColor.r ||
                      newRgbColor.g !== currentRgbColor.g ||
                      newRgbColor.b !== currentRgbColor.b)
                  ) {
                    layer.setAmbientLightColor(
                      newRgbColor.r,
                      newRgbColor.g,
                      newRgbColor.b
                    );
                    forceUpdate();
                    notifyOfChange();
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
          layerRenderingType={layer.getRenderingType()}
          project={props.project}
          resourceManagementProps={props.resourceManagementProps}
          effectsContainer={layer.getEffects()}
          onEffectsRenamed={(oldName, newName) =>
            gd.WholeProjectRefactorer.renameLayerEffect(
              props.project,
              props.layout,
              props.layer,
              oldName,
              newName
            )
          }
          onEffectsUpdated={() => {
            forceUpdate(); /*Force update to ensure dialog is properly positioned*/
            notifyOfChange();
          }}
        />
      )}
    </Dialog>
  );
};

export default LayerEditorDialog;
