// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import React from 'react';
import { I18n } from '@lingui/react';
import Timer from '@material-ui/icons/Timer';
import TextButton from '../../../UI/TextButton';
import InlineCheckbox from '../../../UI/InlineCheckbox';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import AnimationPreview from './AnimationPreview';
import ResourcesLoader from '../../../ResourcesLoader';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  isProjectImageResourceSmooth,
  type SpritesheetFrameForPreview,
} from '../../../ResourcesList/ResourcePreview/ImagePreview';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import PixiResourcesLoader from '../../../ObjectsRendering/PixiResourcesLoader';
import { mapFor } from '../../../Utils/MapFor';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import Tooltip from '@material-ui/core/Tooltip';
import Text from '../../../UI/Text';
import Edit from '../../../UI/CustomSvgIcons/Edit';
import Play from '../../../UI/CustomSvgIcons/Play';
import { toFixedWithoutTrailingZeros } from '../../../Utils/Mathematics';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';

const styles = {
  container: {
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
  },
  timeField: {
    width: 75,
    fontSize: 14,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  spacer: {
    width: 16,
  },
};

type Props = {|
  animationName: string,
  direction: gdDirection,
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onEditWith: (i18n: I18nType, ResourceExternalEditor) => Promise<void>,
  onDirectionUpdated?: () => void,
|};

const DirectionTools = ({
  animationName,
  direction,
  resourcesLoader,
  project,
  resourceExternalEditors,
  onEditWith,
  onDirectionUpdated,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const currentTimeBetweenFrames = direction.getTimeBetweenFrames();
  const timeBetweenFramesFormatted = toFixedWithoutTrailingZeros(
    direction.getTimeBetweenFrames(),
    6
  );
  const hasNoSprites = direction.getSpritesCount() === 0;
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  // State for caching loaded spritesheet frame data
  const [spritesheetFrameCache, setSpritesheetFrameCache] = React.useState<{
    [key: string]: {|
      frameData: SpritesheetFrameForPreview,
      imageSrc: string,
    |},
  }>({});

  // Build sprite info for the animation preview
  // We create a list of "resource identifiers" that can be either:
  // - Regular image resource names
  // - Spritesheet frame identifiers in format "spritesheetName:frameName"
  // TODO: entirely remove the need for this "spriteInfo". Use "direction" directly instead.
  const spriteInfo = React.useMemo(
    () =>
      mapFor(0, direction.getSpritesCount(), i => {
        const sprite = direction.getSprite(i);
        const isSpritesheetFrame = sprite.usesSpritesheetFrame();
        const spritesheetResourceName = isSpritesheetFrame
          ? sprite.getSpritesheetResourceName()
          : '';
        return {
          identifier: isSpritesheetFrame
            ? `${spritesheetResourceName}:${sprite.getSpritesheetFrameName()}`
            : sprite.getImageName(),
          isSpritesheetFrame,
          spritesheetResourceName,
        };
      }),
    [direction, direction.getSpritesCount()]
  );

  // Load spritesheet data when preview opens
  React.useEffect(
    () => {
      if (!previewOpen) return;

      // Find all unique spritesheets that need to be loaded
      const spritesheetsToLoad = new Set<string>();
      spriteInfo.forEach(info => {
        if (info.isSpritesheetFrame) {
          spritesheetsToLoad.add(info.spritesheetResourceName);
        }
      });

      if (spritesheetsToLoad.size === 0) return;

      let cancelled = false;

      (async () => {
        const newCache: {
          [key: string]: {|
            frameData: SpritesheetFrameForPreview,
            imageSrc: string,
          |},
        } = {};

        for (const spritesheetName of spritesheetsToLoad) {
          const spritesheetOrLoadingError = await PixiResourcesLoader.getSpritesheet(
            project,
            spritesheetName
          );
          if (cancelled) return;

          const spritesheet = spritesheetOrLoadingError.spritesheet;
          if (!spritesheet) continue;

          // Get the image source
          let imageSrc = '';
          const firstTexture = Object.values(spritesheet.textures)[0];
          if (
            firstTexture &&
            firstTexture.baseTexture &&
            firstTexture.baseTexture.resource &&
            firstTexture.baseTexture.resource.source instanceof HTMLImageElement
          ) {
            imageSrc = firstTexture.baseTexture.resource.source.src;
          }

          // Cache all frames from this spritesheet
          Object.keys(spritesheet.textures).forEach(frameName => {
            const texture = spritesheet.textures[frameName];
            if (texture && texture.frame) {
              const key = `${spritesheetName}:${frameName}`;
              newCache[key] = {
                frameData: {
                  x: texture.frame.x,
                  y: texture.frame.y,
                  width: texture.frame.width,
                  height: texture.frame.height,
                },
                imageSrc,
              };
            }
          });
        }

        if (!cancelled) {
          setSpritesheetFrameCache(prevCache => ({
            ...prevCache,
            ...newCache,
          }));
        }
      })();

      return () => {
        cancelled = true;
      };
    },
    [previewOpen, spriteInfo, project]
  );

  // Callbacks for AnimationPreview
  const resourceNames = spriteInfo.map(info => info.identifier);

  const getImageResourceSource = React.useCallback(
    (identifier: string) => {
      // Check if this is a spritesheet frame
      const cached = spritesheetFrameCache[identifier];
      if (cached) {
        return cached.imageSrc;
      }
      // Regular image resource
      return resourcesLoader.getResourceFullUrl(project, identifier, {});
    },
    [spritesheetFrameCache, resourcesLoader, project]
  );

  const getSpritesheetFrame = React.useCallback(
    (identifier: string): ?SpritesheetFrameForPreview => {
      const cached = spritesheetFrameCache[identifier];
      return cached ? cached.frameData : null;
    },
    [spritesheetFrameCache]
  );

  const isImageResourceSmoothCallback = React.useCallback(
    (identifier: string) => {
      // For spritesheet frames, check the spritesheet resource
      const info = spriteInfo.find(i => i.identifier === identifier);
      if (info && info.isSpritesheetFrame) {
        return isProjectImageResourceSmooth(
          project,
          info.spritesheetResourceName
        );
      }
      // Regular image
      return isProjectImageResourceSmooth(project, identifier);
    },
    [spriteInfo, project]
  );

  const saveTimeBetweenFrames = newTimeBetweenFramesString => {
    if (!newTimeBetweenFramesString) return;
    const newTimeBetweenFrames = Math.max(
      parseFloat(newTimeBetweenFramesString),
      0.00001
    );
    if (currentTimeBetweenFrames === newTimeBetweenFrames) return;

    const newTimeIsValid = !isNaN(newTimeBetweenFrames);

    if (newTimeIsValid) {
      direction.setTimeBetweenFrames(newTimeBetweenFrames);
      if (onDirectionUpdated) onDirectionUpdated();
      forceUpdate();
    }
  };

  const setLooping = (check: boolean) => {
    direction.setLoop(!!check);
    forceUpdate();

    if (onDirectionUpdated) onDirectionUpdated();
  };

  const openPreview = (open: boolean) => {
    setPreviewOpen(open);
  };

  const imageResourceExternalEditors = resourceExternalEditors.filter(
    ({ kind }) => kind === 'image'
  );

  const hasSprites = direction.getSpritesCount();
  const { isMobile } = useResponsiveWindowSize();

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ResponsiveLineStackLayout
            alignItems="center"
            justifyContent="flex-end"
            noColumnMargin
            noResponsiveLandscape
          >
            <LineStackLayout noMargin>
              {!!imageResourceExternalEditors.length && (
                <TextButton
                  label={i18n._(
                    isMobile
                      ? hasSprites
                        ? t`Edit`
                        : t`Create`
                      : hasSprites
                      ? imageResourceExternalEditors[0].editDisplayName
                      : imageResourceExternalEditors[0].createDisplayName
                  )}
                  icon={<Edit />}
                  onClick={() =>
                    onEditWith(i18n, imageResourceExternalEditors[0])
                  }
                />
              )}
              <TextButton
                label={<Trans>Preview</Trans>}
                icon={<Play />}
                onClick={() => openPreview(true)}
                disabled={hasNoSprites}
              />
            </LineStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <Tooltip title={<Trans>Time between frames</Trans>}>
                <Timer
                  style={{
                    ...styles.timeIcon,
                    color: hasNoSprites
                      ? gdevelopTheme.text.color.disabled
                      : gdevelopTheme.text.color.primary,
                  }}
                />
              </Tooltip>
              <SemiControlledTextField
                id="direction-time-between-frames"
                margin="none"
                style={styles.timeField}
                type="number"
                step={0.005}
                precision={2}
                min={0.01}
                max={5}
                commitOnBlur
                value={timeBetweenFramesFormatted}
                onChange={saveTimeBetweenFrames}
                disabled={hasNoSprites}
              />
              <InlineCheckbox
                checked={direction.isLooping()}
                label={
                  <Text
                    size="body-small"
                    color="primary"
                    style={{
                      opacity: hasNoSprites ? 0.5 : 1,
                    }}
                  >
                    <Trans>Loop</Trans>
                  </Text>
                }
                onCheck={(e, check) => setLooping(check)}
                disabled={hasNoSprites}
              />
            </LineStackLayout>
          </ResponsiveLineStackLayout>
          {previewOpen && (
            <Dialog
              title={<Trans>Preview {animationName}</Trans>}
              actions={[
                <DialogPrimaryButton
                  label={<Trans>Ok</Trans>}
                  primary
                  onClick={() => openPreview(false)}
                  key="ok"
                />,
              ]}
              onRequestClose={() => openPreview(false)}
              onApply={() => openPreview(false)}
              open={previewOpen}
              fullHeight
              flexBody
            >
              <AnimationPreview
                animationName={animationName}
                resourceNames={resourceNames}
                getImageResourceSource={getImageResourceSource}
                isImageResourceSmooth={isImageResourceSmoothCallback}
                getSpritesheetFrame={getSpritesheetFrame}
                timeBetweenFrames={currentTimeBetweenFrames}
                onChangeTimeBetweenFrames={saveTimeBetweenFrames}
                isLooping={direction.isLooping()}
                hideAnimationLoader // No need to show a loader in the Direction Tools.
              />
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
};

export default DirectionTools;
