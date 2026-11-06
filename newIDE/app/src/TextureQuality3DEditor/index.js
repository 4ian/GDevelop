// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';

import Text from '../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Checkbox from '../UI/Checkbox';
import Slider from '../UI/Slider';
import AlertMessage from '../UI/AlertMessage';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import {
  loadSettings,
  saveSettings,
  presets,
  getSettingsWarnings,
  type TextureQuality3DSettings,
  type TextureQuality3DPreset,
  type GpuCapabilities,
} from './settings';
import { detectGpuCapabilities } from './gpuDetection';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';

type Props = {|
  project: gdProject,
  onSettingsUpdated: () => void,
|};

const presetDescriptions: { [presetName: string]: () => string } = {
  classic: () =>
    t`Textures are left exactly like they are loaded: this is the behavior of games made before this system existed.`,
  performance: () =>
    t`Reduces the GPU memory usage and helps low-end devices: textures are limited to 1024 pixels and downscaled with a fast resampling.`,
  balanced: () =>
    t`Good trade-off for most games: textures are limited to 2048 pixels, with mipmaps and a medium anisotropic filtering.`,
  quality: () =>
    t`High quality rendering: textures are kept up to 4096 pixels, with mipmaps and a strong anisotropic filtering.`,
  ultra: () =>
    t`Best possible quality: textures are never downscaled and the maximum anisotropy supported by the GPU is used.`,
  custom: () => t`The settings below were manually customized.`,
};

const findMatchingPreset = (
  settings: TextureQuality3DSettings
): TextureQuality3DPreset => {
  for (const presetName in presets) {
    const preset: any = presets[presetName];
    const currentSettings: any = settings;
    let isMatching = true;
    for (const key in preset) {
      if (key === 'preset') continue;
      if (preset[key] !== currentSettings[key]) {
        isMatching = false;
        break;
      }
    }
    if (isMatching) return (presetName: any);
  }
  return 'custom';
};

const TextureQuality3DEditor = (props: Props): React.Node => {
  const { project } = props;
  const [settings, setSettings] = React.useState<TextureQuality3DSettings>(() =>
    loadSettings(project)
  );
  const [capabilities, setCapabilities] = React.useState<?GpuCapabilities>(
    null
  );

  React.useEffect(() => {
    setCapabilities(detectGpuCapabilities());
  }, []);

  const updateSettings = React.useCallback(
    (patch: Partial<TextureQuality3DSettings>) => {
      const newSettings = { ...settings, ...patch };
      newSettings.preset = findMatchingPreset(newSettings);
      saveSettings(project, newSettings);
      PixiResourcesLoader.refreshEditorTextureQualitySettings(project);
      props.onSettingsUpdated();
      setSettings(newSettings);
    },
    [project, props, settings]
  );

  const warnings = getSettingsWarnings(settings, capabilities);
  const editorReport = PixiResourcesLoader.getEditorTextureQualityReport();
  const isEnabled = settings.enabled;

  return (
    <I18n>
      {({ i18n }: { i18n: I18nType }) => (
        <ColumnStackLayout expand noMargin>
          <Text size="block-title">
            <Trans>Advanced Texture Quality for 3D</Trans>
          </Text>
          <AlertMessage kind="info">
            <Trans>
              Improve how 3D textures (images, cube textures and 3D model
              textures) are filtered and reduce the GPU memory they use. The GPU
              capabilities are detected automatically and the settings are
              clamped to what each device supports, so the same game keeps
              working everywhere.
            </Trans>
          </AlertMessage>
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Quality preset</Trans>}
            value={settings.preset}
            helperMarkdownText={i18n._(presetDescriptions[settings.preset]())}
            onChange={(e, i, newPreset: string) => {
              const presetSettings = presets[newPreset];
              if (!presetSettings) return;
              const newSettings = {
                ...presetSettings,
                preset: (newPreset: any),
              };
              saveSettings(project, newSettings);
              // Preset selection has its own save path (separate from the
              // individual controls below), so explicitly refresh the live
              // editor textures here as well.
              PixiResourcesLoader.refreshEditorTextureQualitySettings(project);
              props.onSettingsUpdated();
              setSettings(newSettings);
            }}
          >
            <SelectOption value="classic" label={t`Classic (no changes)`} />
            <SelectOption value="performance" label={t`Performance`} />
            <SelectOption value="balanced" label={t`Balanced`} />
            <SelectOption value="quality" label={t`Quality`} />
            <SelectOption value="ultra" label={t`Ultra`} />
            <SelectOption value="custom" label={t`Custom`} />
          </SelectField>
          <Checkbox
            label={<Trans>Enable the advanced texture quality system</Trans>}
            checked={isEnabled}
            onCheck={(e, checked) => updateSettings({ enabled: checked })}
          />
          {isEnabled && (
            <React.Fragment>
              <SelectField
                fullWidth
                floatingLabelText={<Trans>Texture filtering</Trans>}
                value={settings.filtering}
                helperMarkdownText={i18n._(
                  t`How textures are sampled when they are drawn on screen. "Keep" respects the smoothing setting of each image resource and the samplers of 3D models.`
                )}
                onChange={(e, i, newFiltering: string) =>
                  updateSettings({ filtering: (newFiltering: any) })
                }
              >
                <SelectOption
                  value="keep"
                  label={t`Keep the resource/model settings`}
                />
                <SelectOption
                  value="nearest"
                  label={t`Nearest (hard pixels)`}
                />
                <SelectOption value="bilinear" label={t`Bilinear (smooth)`} />
                <SelectOption
                  value="trilinear"
                  label={t`Trilinear (smooth with mipmaps)`}
                />
              </SelectField>
              <SelectField
                fullWidth
                floatingLabelText={<Trans>Mipmaps</Trans>}
                value={settings.mipmapMode}
                helperMarkdownText={i18n._(
                  t`Mipmaps are smaller versions of a texture, generated by the GPU. They make distant textures look better and can reduce the GPU memory usage in video memory... but take a third more memory. "Force off" can help for textures that must stay sharp like user interfaces.`
                )}
                onChange={(e, i, newMipmapMode: string) =>
                  updateSettings({ mipmapMode: (newMipmapMode: any) })
                }
              >
                <SelectOption
                  value="auto"
                  label={t`Automatic (based on the filtering)`}
                />
                <SelectOption
                  value="forceOn"
                  label={t`Force mipmaps generation`}
                />
                <SelectOption
                  value="forceOff"
                  label={t`Disable mipmaps generation`}
                />
              </SelectField>
              <Text size="block-title">
                <Trans>Anisotropic filtering</Trans>
              </Text>
              <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
                <Slider
                  value={settings.anisotropy}
                  min={0}
                  max={16}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={value =>
                    value === 0
                      ? i18n._(t`Automatic`)
                      : value === 1
                      ? i18n._(t`Disabled`)
                      : '' + value + 'x'
                  }
                  onChange={(value: number) =>
                    updateSettings({ anisotropy: Math.round(value) })
                  }
                />
                <Text>
                  {settings.anisotropy === 0 ? (
                    <Trans>
                      Automatic: use the maximum supported by the GPU.
                    </Trans>
                  ) : settings.anisotropy === 1 ? (
                    <Trans>Disabled.</Trans>
                  ) : (
                    <Trans>
                      Sharper textures when they are seen at an angle (the value
                      is clamped to what the GPU supports).
                    </Trans>
                  )}
                </Text>
              </ResponsiveLineStackLayout>
              <SelectField
                fullWidth
                floatingLabelText={<Trans>Maximum texture resolution</Trans>}
                value={'' + settings.maxTextureResolution}
                helperMarkdownText={i18n._(
                  t`Textures bigger than this are downscaled before being uploaded to the GPU, which greatly reduces the GPU memory usage. Textures bigger than what the GPU supports are always downscaled.`
                )}
                onChange={(e, i, newMaxTextureResolution: string) =>
                  updateSettings({
                    maxTextureResolution:
                      parseInt(newMaxTextureResolution, 10) || 0,
                  })
                }
              >
                <SelectOption value="0" label={t`Unlimited`} />
                <SelectOption value="4096" label={t`4096 pixels`} />
                <SelectOption value="2048" label={t`2048 pixels`} />
                <SelectOption value="1024" label={t`1024 pixels`} />
                <SelectOption value="512" label={t`512 pixels`} />
              </SelectField>
              <SelectField
                fullWidth
                floatingLabelText={
                  <Trans>Quality of the downscaling resampling</Trans>
                }
                value={settings.resamplingQuality}
                disabled={settings.maxTextureResolution === 0}
                helperMarkdownText={i18n._(
                  t`How textures are resized when they are bigger than the maximum texture resolution.`
                )}
                onChange={(e, i, newResamplingQuality: string) =>
                  updateSettings({
                    resamplingQuality: (newResamplingQuality: any),
                  })
                }
              >
                <SelectOption value="high" label={t`High (smoother, slower)`} />
                <SelectOption value="low" label={t`Low (faster)`} />
              </SelectField>
              <Checkbox
                label={
                  <Trans>
                    Force edge clamping on 3D textures (useful to avoid bleeding
                    at the edges of texture atlases)
                  </Trans>
                }
                checked={settings.forceClampWrapping}
                onCheck={(e, checked) =>
                  updateSettings({ forceClampWrapping: checked })
                }
              />
              <Checkbox
                label={
                  <Trans>
                    Also override the texture settings of 3D models (the
                    filtering defined by their samplers is then ignored)
                  </Trans>
                }
                checked={settings.overrideModelSamplers}
                onCheck={(e, checked) =>
                  updateSettings({ overrideModelSamplers: checked })
                }
              />
              <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
                <SemiControlledTextField
                  floatingLabelText={
                    <Trans>GPU memory budget (in MB, 0 to disable)</Trans>
                  }
                  fullWidth
                  type="number"
                  value={'' + settings.memoryBudgetMb}
                  onChange={value =>
                    updateSettings({
                      memoryBudgetMb: Math.max(0, parseInt(value, 10) || 0),
                    })
                  }
                />
                <Checkbox
                  label={<Trans>Keep detailed texture diagnostics</Trans>}
                  checked={settings.diagnostics}
                  onCheck={(e, checked) =>
                    updateSettings({ diagnostics: checked })
                  }
                />
              </ResponsiveLineStackLayout>
            </React.Fragment>
          )}

          <Text size="block-title">
            <Trans>GPU diagnostics</Trans>
          </Text>
          {capabilities ? (
            <ColumnStackLayout noMargin>
              <Text>
                <Trans>Graphics card</Trans>: <b>{capabilities.gpuName}</b>
              </Text>
              <Text>
                <Trans>WebGL 2 (required by the 3D engine)</Trans>:{' '}
                {capabilities.isWebGL2 ? (
                  <Trans>Supported</Trans>
                ) : (
                  <Trans>Not supported</Trans>
                )}
              </Text>
              <Text>
                <Trans>Maximum texture size</Trans>:{' '}
                {capabilities.maxTextureSize} x {capabilities.maxTextureSize}
              </Text>
              <Text>
                <Trans>Maximum cube texture size</Trans>:{' '}
                {capabilities.maxCubemapSize}
              </Text>
              <Text>
                <Trans>Maximum anisotropy</Trans>:{' '}
                {capabilities.maxAnisotropy > 0 ? (
                  capabilities.maxAnisotropy + 'x'
                ) : (
                  <Trans>Not supported</Trans>
                )}
              </Text>
              <Text>
                <Trans>Antialiasing samples</Trans>: {capabilities.maxSamples}
              </Text>
              <Text>
                <Trans>Shader precision</Trans>: {capabilities.precision}
              </Text>
              <Text>
                <Trans>Compressed texture formats</Trans>:{' '}
                {capabilities.supportedCompressedFormats.length > 0
                  ? capabilities.supportedCompressedFormats.join(', ')
                  : i18n._(t`None`)}
              </Text>
            </ColumnStackLayout>
          ) : (
            <AlertMessage kind="warning">
              <Trans>
                WebGL 2 is not available on this computer, so the GPU
                capabilities cannot be detected. The 3D games will not be able
                to render on this device.
              </Trans>
            </AlertMessage>
          )}
          {warnings.map((warning, index) => (
            <AlertMessage key={index} kind="warning">
              {warning}
            </AlertMessage>
          ))}
          {editorReport.trackedTextureCount > 0 && (
            <AlertMessage kind="info">
              <Trans>Editor viewport textures</Trans>:{' '}
              {editorReport.trackedTextureCount} (<Trans>resized</Trans>:{' '}
              {editorReport.resizedTextureCount}, <Trans>unique sources</Trans>:{' '}
              {editorReport.uniqueSourceCount}).{' '}
              <Trans>Estimated texture memory</Trans>:{' '}
              {(
                editorReport.estimatedUniqueSourceMemoryBytes /
                (1024 * 1024)
              ).toFixed(1)}{' '}
              MB.
            </AlertMessage>
          )}
          {editorReport.trackedTextureCount > 0 &&
            settings.memoryBudgetMb > 0 &&
            editorReport.estimatedUniqueSourceMemoryBytes >
              settings.memoryBudgetMb * 1024 * 1024 && (
              <AlertMessage kind="warning">
                <Trans>
                  The estimated editor viewport texture memory is above the
                  configured GPU memory budget. This is an estimate, not
                  measured GPU VRAM.
                </Trans>
              </AlertMessage>
            )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default TextureQuality3DEditor;
