// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
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
import FlatButton from '../../../UI/FlatButton';
import IconButton from '../../../UI/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import UndoIcon from '../../../UI/CustomSvgIcons/Undo';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '../../../UI/Accordion';
import Paper from '../../../UI/Paper';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import CompactSearchBar from '../../../UI/CompactSearchBar';
import { CompactColorField } from '../../../UI/CompactColorField';
import CompactSemiControlledNumberField from '../../../UI/CompactSemiControlledNumberField';
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
  container: {
    width: '100%',
  },
  headerPaper: {
    padding: 12,
    marginBottom: 8,
  },
  previewPanel: {
    padding: 8,
    borderRadius: 4,
    background: 'rgba(0, 0, 0, 0.2)',
  },
  searchRow: {
    marginBottom: 8,
  },
  sectionWrapper: {
    marginBottom: 6,
  },
  sectionBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 20,
    paddingLeft: 6,
    paddingRight: 6,
    marginRight: 10,
    borderRadius: 4,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  // A property row wraps when the panel is narrow so that nothing ever
  // overflows or overlaps: the label stays on the first line and the control
  // (with its reset button) moves to the next line.
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    rowGap: 4,
  },
  labelColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: '0 1 150px',
    minWidth: 0,
    paddingRight: 12,
  },
  controlColumn: {
    flex: '1 1 200px',
    minWidth: 0,
  },
  sliderRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
  },
  sliderFlex: {
    flex: '1 1 120px',
    minWidth: 0,
  },
  valueField: {
    flex: '0 0 84px',
    minWidth: 64,
    marginLeft: 10,
  },
  resetSlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: '0 0 32px',
  },
  colorFieldWidth: {
    width: 180,
    maxWidth: '100%',
  },
  emptyState: {
    padding: 16,
  },
};

const getProperty = (key: string) =>
  floatProperties.find(property => property.key === key);

const getStepDecimals = (step: number): number => {
  const string = String(step);
  const dotIndex = string.indexOf('.');
  return dotIndex === -1 ? 0 : string.length - dotIndex - 1;
};

const formatNumber = (value: number, step: number): string =>
  isFinite(value) ? value.toFixed(getStepDecimals(step)) : '0';

const roundToStep = (value: number, step: number): number =>
  parseFloat(value.toFixed(getStepDecimals(step)));

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

type RowLayoutProps = {|
  label?: React.Node,
  control: React.Node,
  reset: React.Node,
|};

/**
 * The layout of a property row: label on the left, control in the middle and
 * the reset button on the right. It wraps on narrow panels.
 */
const RowLayout = ({ label, control, reset }: RowLayoutProps): React.Node => (
  <div style={styles.row}>
    <div style={styles.labelColumn}>{label}</div>
    <div style={styles.controlColumn}>{control}</div>
    <div style={styles.resetSlot}>{reset}</div>
  </div>
);

type SectionProps = {|
  index: string,
  title: string,
  expanded: boolean,
  onToggle: (event: any, open: boolean) => void,
  children: React.Node,
|};

/**
 * A numbered, collapsible group of properties, used to give the editor a clear
 * hierarchy (like the parameter groups of a material tool).
 */
const Section = ({
  index,
  title,
  expanded,
  onToggle,
  children,
}: SectionProps): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div style={styles.sectionWrapper}>
      <Accordion noMargin expanded={expanded} onChange={onToggle}>
        <AccordionHeader>
          <Line noMargin expand alignItems="center">
            <div
              style={{
                ...styles.sectionBadge,
                border: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
              }}
            >
              <Text size="body-small" color="secondary" noMargin>
                {index}
              </Text>
            </div>
            <Text noMargin>{title}</Text>
          </Line>
        </AccordionHeader>
        <AccordionBody>
          <div style={styles.rows}>{children}</div>
        </AccordionBody>
      </Accordion>
    </div>
  );
};

const defaultExpandedSections = {
  surface: true,
  'metallic-roughness': true,
  emission: true,
  normal: false,
  physical: false,
  textures: true,
  tiling: false,
};

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
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [expandedSections, setExpandedSections] = React.useState<{
    [string]: boolean,
  }>(() => ({ ...defaultExpandedSections }));

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

  // The slider and its editable value, wrapped so that they never overflow.
  const renderSliderControl = (
    value: number,
    property: Object,
    onValueChange: number => void
  ): React.Node => (
    <div style={styles.sliderRow}>
      <div style={styles.sliderFlex}>
        <Slider
          value={value}
          min={property.min}
          max={property.max}
          step={property.step}
          onChange={onValueChange}
        />
      </div>
      <div style={styles.valueField}>
        <CompactSemiControlledNumberField
          value={value}
          commitOnBlur
          getDisplayedValueFromValue={displayedValue =>
            formatNumber(parseFloat(displayedValue), property.step)
          }
          onChange={newValue =>
            onValueChange(roundToStep(newValue, property.step))
          }
        />
      </div>
    </div>
  );

  const renderResetButton = (
    isOverridden: boolean,
    resetKey: string
  ): React.Node => (
    <ResetButton
      isOverridden={isOverridden}
      visible={isTarget}
      onClick={() => onResetProperty(resetKey)}
    />
  );

  const renderFloatRow = (key: string): React.Node => {
    const property = getProperty(key);
    if (!property) return null;
    const { value, isOverridden } = readFloatValue(
      config,
      targetName,
      property.key,
      property.defaultValue
    );
    return (
      <RowLayout
        label={<Text noMargin>{property.label}</Text>}
        control={renderSliderControl(value, property, newValue =>
          onChangeFloat(property.key, newValue)
        )}
        reset={renderResetButton(isOverridden, property.key)}
      />
    );
  };

  const renderColorRow = (key: string, label: string): React.Node => {
    const { value, isOverridden } = readColorValue(
      config,
      targetName,
      key,
      key === 'baseColor' ? '255;255;255' : '0;0;0'
    );
    return (
      <RowLayout
        label={<Text noMargin>{label}</Text>}
        control={
          <div style={styles.colorFieldWidth}>
            <CompactColorField
              color={value}
              disableAlpha
              onChange={color => {
                const rgbColor = rgbStringAndAlphaToRGBColor(color);
                if (rgbColor) onChangeColor(key, rgbColorToRGBString(rgbColor));
              }}
            />
          </div>
        }
        reset={renderResetButton(isOverridden, key)}
      />
    );
  };

  const renderBooleanRow = (key: string, label: string): React.Node => {
    const { value, isOverridden } = readBooleanValue(
      config,
      targetName,
      key,
      false
    );
    return (
      <RowLayout
        label={<Text noMargin>{label}</Text>}
        control={
          <Checkbox
            checked={value}
            onCheck={(_, checked) => onChangeBoolean(key, checked)}
          />
        }
        reset={renderResetButton(isOverridden, key)}
      />
    );
  };

  const renderTextureRow = (slot: Object): React.Node => {
    const { value, isOverridden } = readTextureValue(
      config,
      targetName,
      slot.key
    );
    return (
      <RowLayout
        label={<Text noMargin>{slot.label}</Text>}
        control={
          <ResourceSelectorWithThumbnail
            project={project}
            resourceKind="image"
            resourceManagementProps={resourceManagementProps}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            resourceName={value}
            onChange={resourceName => onChangeTexture(slot.key, resourceName)}
          />
        }
        reset={renderResetButton(isOverridden, 'texture:' + slot.key)}
      />
    );
  };

  const renderUvTransformRow = (property: Object): React.Node => {
    const { value, isOverridden } = readUvTransformValue(
      config,
      targetName,
      property.key,
      property.defaultValue
    );
    return (
      <RowLayout
        label={<Text noMargin>{property.label}</Text>}
        control={renderSliderControl(value, property, newValue =>
          onChangeUvTransform(property.key, newValue)
        )}
        reset={renderResetButton(isOverridden, 'uvTransform:' + property.key)}
      />
    );
  };

  // The numbered parameter groups shown by the editor. Each row keeps a label
  // so that the search bar can filter the properties.
  const sections = [
    {
      id: 'surface',
      index: '00',
      title: 'Surface',
      rows: [
        {
          key: 'baseColor',
          label: 'Base color',
          node: renderColorRow('baseColor', 'Base color'),
        },
        { key: 'opacity', label: 'Opacity', node: renderFloatRow('opacity') },
        {
          key: 'doubleSided',
          label: 'Both sides',
          node: renderBooleanRow(
            'doubleSided',
            'Render both sides of the faces'
          ),
        },
        {
          key: 'alphaCutoff',
          label: 'Alpha cutoff',
          node: renderFloatRow('alphaCutoff'),
        },
      ],
    },
    {
      id: 'metallic-roughness',
      index: '01',
      title: 'Metallic & roughness',
      rows: [
        {
          key: 'metallic',
          label: 'Metallic',
          node: renderFloatRow('metallic'),
        },
        {
          key: 'roughness',
          label: 'Roughness',
          node: renderFloatRow('roughness'),
        },
      ],
    },
    {
      id: 'emission',
      index: '02',
      title: 'Emission & ambient',
      rows: [
        {
          key: 'emissiveColor',
          label: 'Emissive color',
          node: renderColorRow('emissiveColor', 'Emissive color'),
        },
        {
          key: 'emissiveIntensity',
          label: 'Emissive intensity',
          node: renderFloatRow('emissiveIntensity'),
        },
        {
          key: 'envMapIntensity',
          label: 'Environment lighting',
          node: renderFloatRow('envMapIntensity'),
        },
        {
          key: 'aoIntensity',
          label: 'Ambient occlusion',
          node: renderFloatRow('aoIntensity'),
        },
      ],
    },
    {
      id: 'normal',
      index: '03',
      title: 'Normal & height',
      rows: [
        {
          key: 'normalScale',
          label: 'Normal strength',
          node: renderFloatRow('normalScale'),
        },
        {
          key: 'normalFlipY',
          label: 'Flip green channel',
          node: renderBooleanRow(
            'normalFlipY',
            'Flip the normal map green channel (DirectX / Unreal)'
          ),
        },
        {
          key: 'displacementScale',
          label: 'Displacement strength',
          node: renderFloatRow('displacementScale'),
        },
        {
          key: 'displacementBias',
          label: 'Displacement offset',
          node: renderFloatRow('displacementBias'),
        },
      ],
    },
    {
      id: 'physical',
      index: '04',
      title: 'Physical (glass & clear coat)',
      rows: [
        {
          key: 'ior',
          label: 'Index of refraction',
          node: renderFloatRow('ior'),
        },
        {
          key: 'transmission',
          label: 'Transmission',
          node: renderFloatRow('transmission'),
        },
        {
          key: 'clearcoat',
          label: 'Clear coat',
          node: renderFloatRow('clearcoat'),
        },
        {
          key: 'clearcoatRoughness',
          label: 'Clear coat roughness',
          node: renderFloatRow('clearcoatRoughness'),
        },
      ],
    },
    {
      id: 'textures',
      index: '05',
      title: 'Textures',
      rows: textureSlots.map(slot => ({
        key: 'texture:' + slot.key,
        label: slot.label,
        node: renderTextureRow(slot),
      })),
    },
    {
      id: 'tiling',
      index: '06',
      title: 'Texture tiling (UV)',
      rows: uvTransformProperties.map(property => ({
        key: 'uv:' + property.key,
        label: property.label,
        node: renderUvTransformRow(property),
      })),
    },
  ];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = !!normalizedSearch;
  const filteredSections = sections
    .map(section => {
      const sectionMatches = section.title
        .toLowerCase()
        .includes(normalizedSearch);
      const rows =
        isSearching && !sectionMatches
          ? section.rows.filter(row =>
              row.label.toLowerCase().includes(normalizedSearch)
            )
          : section.rows;
      return { ...section, visibleRows: rows };
    })
    .filter(section => section.visibleRows.length > 0);

  return (
    <div style={styles.container}>
      <Paper background="dark" style={styles.headerPaper}>
        <ColumnStackLayout noMargin>
          <Checkbox
            checked={enabled}
            label={<Trans>Use PBR materials</Trans>}
            onCheck={(_, checked) => onEnablePBR(checked)}
          />
          {enabled ? (
            <React.Fragment>
              {isTarget ? (
                <Text size="body-small" color="secondary" noMargin>
                  <Trans>Overriding the material of '{targetName}'</Trans>
                </Text>
              ) : null}
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
                <PBRMaterialPreview
                  project={project}
                  settings={mergedSettings}
                />
              </div>
              {isTarget && (
                <Line noMargin justifyContent="flex-end">
                  <FlatButton
                    label={<Trans>Reset this override</Trans>}
                    onClick={onResetTarget}
                    disabled={!isTargetOverridden}
                  />
                </Line>
              )}
            </React.Fragment>
          ) : null}
        </ColumnStackLayout>
      </Paper>

      {enabled ? (
        <React.Fragment>
          <div style={styles.searchRow}>
            <CompactSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t`Search a property`}
            />
          </div>
          {filteredSections.length === 0 ? (
            <div style={styles.emptyState}>
              <Text color="secondary" noMargin>
                <Trans>No property matches your search.</Trans>
              </Text>
            </div>
          ) : (
            filteredSections.map(section => (
              <Section
                key={section.id}
                index={section.index}
                title={section.title}
                expanded={isSearching ? true : !!expandedSections[section.id]}
                onToggle={(event, open) =>
                  setExpandedSections(previous => ({
                    ...previous,
                    [section.id]: open,
                  }))
                }
              >
                {section.visibleRows.map(row => (
                  <React.Fragment key={row.key}>{row.node}</React.Fragment>
                ))}
              </Section>
            ))
          )}
        </React.Fragment>
      ) : null}
    </div>
  );
};

export default PBRMaterialEditor;
