// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import AlertMessage from '../../../UI/AlertMessage';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import Checkbox from '../../../UI/Checkbox';
import PixiResourcesLoader from '../../../ObjectsRendering/PixiResourcesLoader';
import { type SpritesheetOrLoadingError } from '../../../ObjectsRendering/PixiResourcesLoader';
import { CorsAwareImage } from '../../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import CheckeredBackground from '../../../ResourcesList/CheckeredBackground';
import ScrollView from '../../../UI/ScrollView';
import { List, ListItem } from '../../../UI/List';

const FRAME_SIZE = 80;

const styles = {
  framesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  frameThumbnail: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
    width: FRAME_SIZE,
    height: FRAME_SIZE + 24, // Extra space for the label
    flexDirection: 'column',
    cursor: 'pointer',
  },
  frameImageContainer: {
    position: 'relative',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  frameImage: {
    position: 'relative',
    pointerEvents: 'none',
    maxWidth: FRAME_SIZE,
    maxHeight: FRAME_SIZE,
  },
  frameLabel: {
    fontSize: 10,
    marginTop: 4,
    maxWidth: FRAME_SIZE,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  checkboxContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
};

type FrameThumbnailProps = {|
  frameName: string,
  texture: any, // PIXI.Texture
  selected: boolean,
  onSelect: (selected: boolean) => void,
|};

const FrameThumbnail = ({
  frameName,
  texture,
  selected,
  onSelect,
}: FrameThumbnailProps) => {
  const theme = React.useContext(GDevelopThemeContext);
  const borderColor = selected
    ? theme.palette.secondary
    : theme.imagePreview.borderColor;

  // Get the image source from the texture
  const imageSrc = React.useMemo(
    () => {
      if (!texture || !texture.baseTexture || !texture.baseTexture.resource) {
        return '';
      }
      const source = texture.baseTexture.resource.source;
      if (source instanceof HTMLImageElement) {
        return source.src;
      }
      return '';
    },
    [texture]
  );

  // Calculate the crop for this frame
  const frameStyle = React.useMemo(
    () => {
      if (!texture || !texture.frame) {
        return {};
      }
      const frame = texture.frame;
      const orig = texture.orig;
      return {
        objectFit: 'none',
        objectPosition: `-${frame.x}px -${frame.y}px`,
        width: orig.width,
        height: orig.height,
        maxWidth: 'none',
        maxHeight: 'none',
        transform: `scale(${Math.min(
          FRAME_SIZE / orig.width,
          FRAME_SIZE / orig.height,
          1
        )})`,
      };
    },
    [texture]
  );

  return (
    <div
      style={styles.frameThumbnail}
      onClick={() => onSelect(!selected)}
      title={frameName}
    >
      <div
        style={{
          ...styles.frameImageContainer,
          border: `1px solid ${borderColor}`,
        }}
      >
        <CheckeredBackground borderRadius={4} />
        {imageSrc && (
          <CorsAwareImage
            style={{ ...styles.frameImage, ...frameStyle }}
            alt={frameName}
            src={imageSrc}
          />
        )}
        <div
          style={styles.checkboxContainer}
          onClick={e => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheck={(e, checked) => {
              onSelect(checked);
            }}
          />
        </div>
      </div>
      <span style={styles.frameLabel}>{frameName}</span>
    </div>
  );
};

export type SpritesheetSelectionResult = {|
  frameNames: string[],
|};

type Props = {|
  project: gdProject,
  spritesheetResourceName: string,
  onSelect: (selection: SpritesheetSelectionResult) => void,
  onRequestClose: () => void,
|};

const SpritesheetFramesSelectorDialog = ({
  project,
  spritesheetResourceName,
  onSelect,
  onRequestClose,
}: Props) => {
  const [
    spritesheetData,
    setSpritesheetData,
  ] = React.useState<SpritesheetOrLoadingError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedFrames, setSelectedFrames] = React.useState<Array<string>>([]);
  const [selectedAnimation, setSelectedAnimation] = React.useState<
    string | null
  >(null);

  React.useEffect(
    () => {
      (async () => {
        setIsLoading(true);
        const result = await PixiResourcesLoader.getSpritesheet(
          project,
          spritesheetResourceName
        );
        setSpritesheetData(result);
        setIsLoading(false);
      })();
    },
    [project, spritesheetResourceName]
  );

  const handleFrameSelect = React.useCallback(
    (frameName: string, selected: boolean) => {
      // When selecting frames, clear any selected animation
      setSelectedAnimation(null);
      setSelectedFrames(prevSelected => {
        if (selected) {
          return [...prevSelected, frameName];
        } else {
          return prevSelected.filter(name => name !== frameName);
        }
      });
    },
    []
  );

  const handleAnimationSelect = React.useCallback((animationName: string) => {
    // When selecting an animation, clear any selected frames
    setSelectedFrames([]);
    setSelectedAnimation(prevAnimation =>
      prevAnimation === animationName ? null : animationName
    );
  }, []);

  const hasSelection = selectedFrames.length > 0 || selectedAnimation !== null;

  // Get frames and animations from the spritesheet
  const frames = React.useMemo(
    () => {
      if (!spritesheetData || !spritesheetData.spritesheet) return {};
      return spritesheetData.spritesheet.textures || {};
    },
    [spritesheetData]
  );

  const animations = React.useMemo(
    () => {
      if (
        !spritesheetData ||
        !spritesheetData.spritesheet ||
        !spritesheetData.spritesheet.data
      )
        return {};
      return spritesheetData.spritesheet.data.animations || {};
    },
    [spritesheetData]
  );

  const handleConfirm = React.useCallback(
    () => {
      const frameNames =
        selectedFrames.length > 0
          ? selectedFrames
          : animations[selectedAnimation || ''] || [];

      onSelect({
        frameNames,
      });
    },
    [onSelect, selectedFrames, animations, selectedAnimation]
  );

  const frameNames = Object.keys(frames);
  const animationNames = Object.keys(animations);

  const renderError = () => {
    if (!spritesheetData) return null;

    const { loadingError, loadingErrorReason } = spritesheetData;

    if (loadingErrorReason) {
      let errorMessage;
      switch (loadingErrorReason) {
        case 'invalid-spritesheet-resource':
          errorMessage = (
            <Trans>The spritesheet resource could not be found.</Trans>
          );
          break;
        case 'spritesheet-json-loading-error':
          errorMessage = (
            <Trans>
              Failed to load the spritesheet JSON file. Verify if it a proper
              PixiJS spritesheet file in JSON format.
            </Trans>
          );
          break;
        case 'missing-spritesheet-image-field':
          errorMessage = (
            <Trans>The spritesheet JSON is missing the image reference.</Trans>
          );
          break;
        case 'invalid-spritesheet-image-resource':
          errorMessage = (
            <Trans>The spritesheet image could not be loaded.</Trans>
          );
          break;
        case 'spritesheet-pixi-loading-error':
          errorMessage = (
            <Trans>
              An error occurred while parsing the spritesheet.
              {loadingError ? ` ${loadingError.message}` : ''}
            </Trans>
          );
          break;
        default:
          errorMessage = (
            <Trans>
              An unknown error occurred.
              {loadingError ? ` ${loadingError.message}` : ''}
            </Trans>
          );
      }

      return <AlertMessage kind="error">{errorMessage}</AlertMessage>;
    }

    return null;
  };

  return (
    <Dialog
      title={<Trans>Select frames from spritesheet</Trans>}
      open
      maxWidth="md"
      fullHeight
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onRequestClose}
        />,
        <DialogPrimaryButton
          key="select"
          label={<Trans>Select</Trans>}
          primary
          onClick={handleConfirm}
          disabled={!hasSelection}
        />,
      ]}
      onRequestClose={onRequestClose}
      onApply={hasSelection ? handleConfirm : undefined}
    >
      <ColumnStackLayout noMargin expand>
        {isLoading && (
          <Text>
            <Trans>Loading spritesheet...</Trans>
          </Text>
        )}

        {!isLoading && renderError()}

        {!isLoading && spritesheetData && spritesheetData.spritesheet && (
          <ScrollView>
            <ColumnStackLayout noMargin>
              {animationNames.length > 0 && (
                <>
                  <Text size="sub-title">
                    <Trans>Animations</Trans>
                  </Text>
                  <List>
                    {animationNames.map(animationName => (
                      <ListItem
                        key={animationName}
                        primaryText={`${animationName} (${
                          animations[animationName].length
                        } frames)`}
                        onClick={() => handleAnimationSelect(animationName)}
                        selected={selectedAnimation === animationName}
                      />
                    ))}
                  </List>
                </>
              )}

              {frameNames.length > 0 && (
                <>
                  <Text size="sub-title">
                    <Trans>Frames</Trans>
                  </Text>
                  <div style={styles.framesGrid}>
                    {frameNames.map(frameName => (
                      <FrameThumbnail
                        key={frameName}
                        frameName={frameName}
                        texture={frames[frameName]}
                        selected={selectedFrames.includes(frameName)}
                        onSelect={selected =>
                          handleFrameSelect(frameName, selected)
                        }
                      />
                    ))}
                  </div>
                </>
              )}

              {frameNames.length === 0 && animationNames.length === 0 && (
                <AlertMessage kind="info">
                  <Trans>
                    No frames or animations found in this spritesheet.
                  </Trans>
                </AlertMessage>
              )}
            </ColumnStackLayout>
          </ScrollView>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default SpritesheetFramesSelectorDialog;
