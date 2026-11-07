// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { Column, Line } from '../../../UI/Grid';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import Text from '../../../UI/Text';
import Checkbox from '../../../UI/Checkbox';
import SelectField from '../../../UI/SelectField';
import SelectOption from '../../../UI/SelectOption';
import Slider from '../../../UI/Slider';
import ColorField from '../../../UI/ColorField';
import FlatButton from '../../../UI/FlatButton';
import IconButton from '../../../UI/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import UndoIcon from '../../../UI/CustomSvgIcons/Undo';
import ResourceSelectorWithThumbnail from '../../../ResourcesList/ResourceSelectorWithThumbnail';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../../../Utils/ColorTransformer';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import { type ProjectScopedContainersAccessor } from '../../../InstructionOrExpression/EventsScope';
import PBRMaterialPreview from './PBRMaterialPreview';
import {
  parsePBRConfig,
  serializePBRConfig,
  readFloatValue,
  writeFloatValue,
  readColorValue,
  writeColorValue,
  readBooleanValue,
  writeBooleanValue,
  readTextureValue,
  writeTextureValue,
  readUvTransformValue,
  writeUvTransformValue,
  resetProperty,
  applyPreset,
  getMergedSettingsWithDefaults,
  floatProperties,
  textureSlots,
  uvTransformProperties,
  presetNames,
  type PBRConfig,
} from './pbrConfig';

type Props = {|
  objectConfiguration: gdObjectConfiguration,
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  /**
   * The name of the target being edited: '' for the whole object, or the name
   * of a face (3D box) or of a mesh (3D model).
   */
  targetName: string,
  onObjectUpdated?: () => void,
|};

const styles = {
  // Keep the editor comfortable to read and use, even in very wide dialogs.
  container: {
    width: '100%',
    maxWidth: 780,
  },
  previewPanel: {
    padding: 8,
    borderRadius: 4,
    background: 'rgba(0, 0, 0, 0.2)',
  },
  propertyRow: {
    width: '100%',
    maxWidth: 380,
  },
  sliderLabel: {
    marginBottom: 0,
  },
  valueChip: {
    opacity: 0.8,
    fontVariantNumeric: 'tabular-nums',
    marginLeft: 8,
    minWidth: 42,
    textAlign: 'right',
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
  },
};

const getProperty = (key: string) =>
  floatProperties.find(property => property.key === key);

type ResetButtonProps = {|
  isOverridden: boolean,
  visible: boolean,
  onClick: () => void,
|};

const ResetButton = ({
  isOverridden,
  visible,
  onClick,
}: ResetButtonProps): React.Node => {
  if (!visible || !isOverridden) {
    // Keep the layout stable whether the button is shown or not.
    return <span style={{ width: 24 }} />;
  }
  return (
    <Tooltip title={<Trans>Reset to the value of the object</Trans>}>
      <IconButton onClick={onClick} edge="end">
        <UndoIcon />
      </IconButton>
    </Tooltip>
  );
};

type FloatSliderProps = {|
  label: string,
  value: number,
  isOverridden: boolean,
  min: number,
  max: number,
  step: number,
  visibleResetButton: boolean,
  onChange: (value: number) => void,
  onReset: () => void,
|};

const FloatSlider = ({
  label,
  value,
  isOverridden,
  min,
  max,
  step,
  visibleResetButton,
  onChange,
  onReset,
}: FloatSliderProps): React.Node => (
  <div
    style={{ ...styles.propertyRow, display: 'flex', flexDirection: 'column' }}
  >
    <Line noMargin justifyContent="space-between" alignItems="center">
      <Text size="body" style={styles.sliderLabel}>
        {label}
      </Text>
      <Line noMargin alignItems="center">
        <Text
          size="body"
          style={{ ...styles.sliderLabel, ...styles.valueChip }}
        >
          {value}
        </Text>
        <ResetButton
          isOverridden={isOverridden}
          visible={visibleResetButton}
          onClick={onReset}
        />
      </Line>
    </Line>
    <Slider
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={newValue => onChange(newValue)}
    />
  </div>
);

type ColorRowProps = {|
  label: string,
  value: string,
  isOverridden: boolean,
  visibleResetButton: boolean,
  onChange: (color: string) => void,
  onReset: () => void,
|};

const ColorRow = ({
  label,
  value,
  isOverridden,
  visibleResetButton,
  onChange,
  onReset,
}: ColorRowProps): React.Node => (
  <Line expand noMargin alignItems="flex-end">
    <div style={styles.propertyRow}>
      <ColorField
        fullWidth
        disableAlpha
        floatingLabelText={label}
        color={value}
        onChange={color => {
          const rgbColor = rgbStringAndAlphaToRGBColor(color);
          if (rgbColor) {
            onChange(rgbColorToRGBString(rgbColor));
          }
        }}
      />
    </div>
    <ResetButton
      isOverridden={isOverridden}
      visible={visibleResetButton}
      onClick={onReset}
    />
  </Line>
);

/**
 * The editor of the PBR material settings of an object (or of one of its
 * targets: a face of a 3D box or a mesh of a 3D model).
 */
const PBRMaterialEditor = ({
  objectConfiguration,
  project,
  resourceManagementProps,
  projectScopedContainersAccessor,
  targetName,
  onObjectUpdated,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();

  const pbrConfigJson = objectConfiguration
    .getProperties()
    .get('pbrConfig')
    .getValue();

  const updateConfig = React.useCallback(
    (config: PBRConfig) => {
      objectConfiguration.updateProperty(
        'pbrConfig',
        serializePBRConfig(config)
      );
      if (onObjectUpdated) onObjectUpdated();
      forceUpdate();
    },
    [objectConfiguration, onObjectUpdated, forceUpdate]
  );

  const config = parsePBRConfig(pbrConfigJson);
  const isTarget = !!targetName;
  const isTargetOverridden =
    !!targetName && !!(config.targets && config.targets[targetName]);
  const enabled =
    config.enabled !== false && !!(config.settings || config.targets);

  const onEnablePBR = (checked: boolean) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    newConfig.enabled = checked;
    if (checked) {
      if (!newConfig.settings) newConfig.settings = { preset: 'custom' };
      if (!newConfig.material) newConfig.material = 'standard';
    }
    updateConfig(newConfig);
  };

  const onChangeFloat = (key: string, value: number) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    writeFloatValue(newConfig, targetName, key, value);
    updateConfig(newConfig);
  };

  const onChangeColor = (key: string, color: string) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    writeColorValue(newConfig, targetName, key, color);
    updateConfig(newConfig);
  };

  const onChangeBoolean = (key: string, value: boolean) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    writeBooleanValue(newConfig, targetName, key, value);
    updateConfig(newConfig);
  };

  const onChangeUvTransform = (key: string, value: number) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    writeUvTransformValue(newConfig, targetName, key, value);
    updateConfig(newConfig);
  };

  const onChangeTexture = (slot: string, resourceName: string) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    writeTextureValue(newConfig, targetName, slot, resourceName);
    updateConfig(newConfig);
  };

  const onResetProperty = (key: string) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    resetProperty(newConfig, targetName, key);
    updateConfig(newConfig);
  };

  const onResetTarget = () => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    if (newConfig.targets) {
      delete newConfig.targets[targetName];
    }
    updateConfig(newConfig);
  };

  const onChangePreset = (presetName: string) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    applyPreset(newConfig, targetName, presetName);
    // The glass preset needs the physical material.
    if (
      presetName === 'glass' &&
      newConfig.material !== 'physical' &&
      !targetName
    ) {
      newConfig.material = 'physical';
    }
    updateConfig(newConfig);
  };

  const onChangeMaterial = (material: string) => {
    const newConfig = parsePBRConfig(pbrConfigJson);
    newConfig.material = material === 'physical' ? 'physical' : 'standard';
    updateConfig(newConfig);
  };

  const mergedSettings = getMergedSettingsWithDefaults(config, targetName);
  const presetName = (config.settings && config.settings.preset) || 'custom';

  const renderFloatSlider = (key: string) => {
    const property = getProperty(key);
    if (!property) return null;
    const { value, isOverridden } = readFloatValue(
      config,
      targetName,
      property.key,
      property.defaultValue
    );
    return (
      <FloatSlider
        key={property.key}
        label={property.label}
        value={value}
        isOverridden={isOverridden}
        min={property.min}
        max={property.max}
        step={property.step}
        visibleResetButton={isTarget}
        onChange={newValue => onChangeFloat(property.key, newValue)}
        onReset={() => onResetProperty(property.key)}
      />
    );
  };

  const renderColorRow = (key: string, label: string) => {
    const { value, isOverridden } = readColorValue(
      config,
      targetName,
      key,
      key === 'baseColor' ? '255;255;255' : '0;0;0'
    );
    return (
      <ColorRow
        label={label}
        value={value}
        isOverridden={isOverridden}
        visibleResetButton={isTarget}
        onChange={color => onChangeColor(key, color)}
        onReset={() => onResetProperty(key)}
      />
    );
  };

  const renderSliderRows = (rows: Array<Array<string>>) =>
    rows.map((rowKeys, rowIndex) => (
      <ResponsiveLineStackLayout
        key={rowIndex}
        expand
        noColumnMargin
        noResponsiveLandscape
      >
        {rowKeys.map(key => renderFloatSlider(key))}
      </ResponsiveLineStackLayout>
    ));

  const doubleSided = readBooleanValue(
    config,
    targetName,
    'doubleSided',
    false
  );
  const normalFlipY = readBooleanValue(
    config,
    targetName,
    'normalFlipY',
    false
  );

  const renderUvTransformSlider = (key: string) => {
    const property = uvTransformProperties.find(item => item.key === key);
    if (!property) return null;
    const { value, isOverridden } = readUvTransformValue(
      config,
      targetName,
      property.key,
      property.defaultValue
    );
    return (
      <FloatSlider
        key={property.key}
        label={property.label}
        value={value}
        isOverridden={isOverridden}
        min={property.min}
        max={property.max}
        step={property.step}
        visibleResetButton={isTarget}
        onChange={newValue => onChangeUvTransform(property.key, newValue)}
        onReset={() => onResetProperty('uvTransform:' + property.key)}
      />
    );
  };

  return (
    <ColumnStackLayout noMargin>
      <Checkbox
        checked={enabled}
        label={<Trans>Use PBR materials</Trans>}
        onCheck={(_, checked) => onEnablePBR(checked)}
      />
      {enabled ? (
        <div style={styles.container}>
          <ColumnStackLayout noMargin>
            <ResponsiveLineStackLayout
              expand
              noColumnMargin
              noResponsiveLandscape
            >
              <Column noMargin expand>
                <SelectField
                  value={presetName}
                  floatingLabelText={<Trans>Preset</Trans>}
                  onChange={(event, index, newValue) =>
                    onChangePreset(newValue)
                  }
                  fullWidth
                >
                  {presetNames.map(name => (
                    <SelectOption
                      key={name}
                      value={name}
                      label={
                        name === 'custom'
                          ? t`Custom`
                          : name.charAt(0).toUpperCase() + name.substring(1)
                      }
                    />
                  ))}
                </SelectField>
              </Column>
              {!isTarget && (
                <Column noMargin expand>
                  <SelectField
                    value={config.material || 'standard'}
                    floatingLabelText={<Trans>Material</Trans>}
                    helperMarkdownText={
                      'The "physical" material additionally supports transmission, index of refraction and clear coat, but is slower to render.'
                    }
                    onChange={(event, index, newValue) =>
                      onChangeMaterial(newValue)
                    }
                    fullWidth
                  >
                    <SelectOption value="standard" label={t`Standard`} />
                    <SelectOption value="physical" label={t`Physical`} />
                  </SelectField>
                </Column>
              )}
            </ResponsiveLineStackLayout>

            <div style={styles.previewPanel}>
              <PBRMaterialPreview project={project} settings={mergedSettings} />
            </div>

            {isTarget && (
              <Line justifyContent="flex-end" noMargin>
                <FlatButton
                  label={<Trans>Reset this override</Trans>}
                  onClick={onResetTarget}
                  disabled={!isTargetOverridden}
                />
              </Line>
            )}

            <Text size="block-title" style={styles.sectionTitle} noMargin>
              <Trans>Material</Trans>
            </Text>
            <ResponsiveLineStackLayout
              expand
              noColumnMargin
              noResponsiveLandscape
            >
              {renderColorRow('baseColor', 'Base color')}
            </ResponsiveLineStackLayout>
            {renderSliderRows([['metallic', 'roughness']])}

            <Text size="block-title" style={styles.sectionTitle} noMargin>
              <Trans>Emission and lighting</Trans>
            </Text>
            <ResponsiveLineStackLayout
              expand
              noColumnMargin
              noResponsiveLandscape
            >
              {renderColorRow('emissiveColor', 'Emissive color')}
            </ResponsiveLineStackLayout>
            {renderSliderRows([
              ['emissiveIntensity', 'normalScale'],
              ['aoIntensity', 'envMapIntensity'],
            ])}
            <Line noMargin alignItems="center">
              <Column expand noMargin>
                <Checkbox
                  checked={normalFlipY.value}
                  label={
                    <Trans>
                      Flip the normal map green channel (DirectX / Unreal)
                    </Trans>
                  }
                  onCheck={(_, checked) =>
                    onChangeBoolean('normalFlipY', checked)
                  }
                />
              </Column>
              <ResetButton
                isOverridden={normalFlipY.isOverridden}
                visible={isTarget}
                onClick={() => onResetProperty('normalFlipY')}
              />
            </Line>

            <Text size="block-title" style={styles.sectionTitle} noMargin>
              <Trans>Transparency</Trans>
            </Text>
            {renderSliderRows([
              ['opacity', 'alphaCutoff'],
              ['transmission', 'ior'],
              ['clearcoat', 'clearcoatRoughness'],
            ])}

            <Text size="block-title" style={styles.sectionTitle} noMargin>
              <Trans>Texture tiling</Trans>
            </Text>
            <Text size="body" noMargin>
              <Trans>
                Tiling, offset and rotation applied to the textures set above (a
                texture left untouched keeps its original mapping).
              </Trans>
            </Text>
            <ResponsiveLineStackLayout
              expand
              noColumnMargin
              noResponsiveLandscape
            >
              {['repeatX', 'repeatY'].map(key => renderUvTransformSlider(key))}
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout
              expand
              noColumnMargin
              noResponsiveLandscape
            >
              {['offsetX', 'offsetY'].map(key => renderUvTransformSlider(key))}
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout
              expand
              noColumnMargin
              noResponsiveLandscape
            >
              {renderUvTransformSlider('rotation')}
            </ResponsiveLineStackLayout>

            <Text size="block-title" style={styles.sectionTitle} noMargin>
              <Trans>Textures</Trans>
            </Text>
            <Text size="body" noMargin>
              <Trans>
                A texture that is not chosen keeps the texture of the original
                material (for 3D models).
              </Trans>
            </Text>
            <ColumnStackLayout noMargin>
              {textureSlots.map(slot => {
                const { value, isOverridden } = readTextureValue(
                  config,
                  targetName,
                  slot.key
                );
                return (
                  <Line key={slot.key} expand noMargin alignItems="flex-end">
                    <Column expand noMargin>
                      <ResourceSelectorWithThumbnail
                        project={project}
                        resourceKind="image"
                        floatingLabelText={slot.label}
                        resourceManagementProps={resourceManagementProps}
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        resourceName={value}
                        onChange={resourceName =>
                          onChangeTexture(slot.key, resourceName)
                        }
                      />
                    </Column>
                    <ResetButton
                      isOverridden={isOverridden}
                      visible={isTarget}
                      onClick={() => onResetProperty('texture:' + slot.key)}
                    />
                  </Line>
                );
              })}
            </ColumnStackLayout>

            <Text size="block-title" style={styles.sectionTitle} noMargin>
              <Trans>Advanced</Trans>
            </Text>
            {renderSliderRows([['displacementScale', 'displacementBias']])}
            <Line noMargin alignItems="center">
              <Column expand noMargin>
                <Checkbox
                  checked={doubleSided.value}
                  label={<Trans>Render both sides of the faces</Trans>}
                  onCheck={(_, checked) =>
                    onChangeBoolean('doubleSided', checked)
                  }
                />
              </Column>
              <ResetButton
                isOverridden={doubleSided.isOverridden}
                visible={isTarget}
                onClick={() => onResetProperty('doubleSided')}
              />
            </Line>
          </ColumnStackLayout>
        </div>
      ) : null}
    </ColumnStackLayout>
  );
};

export default PBRMaterialEditor;
