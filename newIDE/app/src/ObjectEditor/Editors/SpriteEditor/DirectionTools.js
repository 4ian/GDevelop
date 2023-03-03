// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import React from 'react';
import { I18n } from '@lingui/react';
import Timer from '@material-ui/icons/Timer';
import TextButton from '../../../UI/TextButton';
import Checkbox from '../../../UI/Checkbox';
import Brush from '@material-ui/icons/Brush';
import PlayArrow from '@material-ui/icons/PlayArrow';
import TextField from '../../../UI/TextField';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import AnimationPreview from './AnimationPreview';
import ResourcesLoader from '../../../ResourcesLoader';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor';
import { ResponsiveWindowMeasurer } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { isProjectImageResourceSmooth } from '../../../ResourcesList/ResourcePreview/ImagePreview';
import useForceUpdate from '../../../Utils/UseForceUpdate';

const styles = {
  container: {
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
  },
  timeField: {
    width: 75,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  spacer: {
    width: 16,
  },
};

const formatTime = (time: number) => Number(time.toFixed(6));

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
  const [timeBetweenFrames, setTimeBetweenFrames] = React.useState(
    formatTime(direction.getTimeBetweenFrames())
  );
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(
    () => {
      setTimeBetweenFrames(formatTime(direction.getTimeBetweenFrames()));
    },
    [direction]
  );

  const saveTimeBetweenFrames = () => {
    const currentTimeBetweenFrames = direction.getTimeBetweenFrames();
    const newTimeBetweenFrames = Math.max(
      parseFloat(timeBetweenFrames),
      0.00001
    );
    if (currentTimeBetweenFrames === newTimeBetweenFrames) return;

    const newTimeIsValid = !isNaN(newTimeBetweenFrames);

    if (newTimeIsValid) {
      direction.setTimeBetweenFrames(newTimeBetweenFrames);
      setTimeBetweenFrames(formatTime(newTimeBetweenFrames));
      if (onDirectionUpdated) onDirectionUpdated();
    }
  };

  const setLooping = (check: boolean) => {
    direction.setLoop(!!check);
    forceUpdate();

    if (onDirectionUpdated) onDirectionUpdated();
  };

  const openPreview = (open: boolean) => {
    setPreviewOpen(open);
    if (!open) {
      saveTimeBetweenFrames();
    }
  };

  const imageResourceExternalEditors = resourceExternalEditors.filter(
    ({ kind }) => kind === 'image'
  );

  const hasSprites = direction.getSpritesCount();

  return (
    <I18n>
      {({ i18n }) => (
        <div style={styles.container}>
          <ResponsiveWindowMeasurer>
            {windowWidth =>
              !!imageResourceExternalEditors.length && (
                <TextButton
                  label={i18n._(
                    windowWidth === 'small'
                      ? hasSprites
                        ? t`Edit`
                        : t`Create`
                      : hasSprites
                      ? imageResourceExternalEditors[0].editDisplayName
                      : imageResourceExternalEditors[0].createDisplayName
                  )}
                  icon={<Brush />}
                  onClick={() =>
                    onEditWith(i18n, imageResourceExternalEditors[0])
                  }
                />
              )
            }
          </ResponsiveWindowMeasurer>
          <TextButton
            label={<Trans>Preview</Trans>}
            icon={<PlayArrow />}
            onClick={() => openPreview(true)}
          />
          <Timer style={styles.timeIcon} />
          <TextField
            value={timeBetweenFrames}
            onChange={(e, text) => setTimeBetweenFrames(parseFloat(text) || 0)}
            onBlur={() => saveTimeBetweenFrames()}
            id="direction-time-between-frames"
            margin="none"
            style={styles.timeField}
            type="number"
            step={0.005}
            precision={2}
            min={0.01}
            max={5}
          />
          <span style={styles.spacer} />
          <Checkbox
            checked={direction.isLooping()}
            label={<Trans>Loop</Trans>}
            onCheck={(e, check) => setLooping(check)}
          />
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
                resourceNames={direction.getSpriteNames().toJSArray()}
                getImageResourceSource={(name: string) =>
                  resourcesLoader.getResourceFullUrl(project, name, {})
                }
                isImageResourceSmooth={(name: string) =>
                  isProjectImageResourceSmooth(project, name)
                }
                timeBetweenFrames={timeBetweenFrames}
                onChangeTimeBetweenFrames={text => setTimeBetweenFrames(text)}
                isLooping={direction.isLooping()}
                hideAnimationLoader // No need to show a loader in the Direction Tools.
              />
            </Dialog>
          )}
        </div>
      )}
    </I18n>
  );
};

export default DirectionTools;
