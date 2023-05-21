// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import React from 'react';
import { I18n } from '@lingui/react';
import Timer from '@material-ui/icons/Timer';
import TextButton from '../../../UI/TextButton';
import InlineCheckbox from '../../../UI/InlineCheckbox';
import TextField from '../../../UI/TextField';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import AnimationPreview from './AnimationPreview';
import ResourcesLoader from '../../../ResourcesLoader';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { isProjectImageResourceSmooth } from '../../../ResourcesList/ResourcePreview/ImagePreview';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import { Tooltip } from '@material-ui/core';
import Text from '../../../UI/Text';
import Edit from '../../../UI/CustomSvgIcons/Edit';
import Play from '../../../UI/CustomSvgIcons/Play';

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
  const windowWidth = useResponsiveWindowWidth();

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ResponsiveLineStackLayout
            alignItems="center"
            justifyContent="flex-end"
            noColumnMargin
          >
            <LineStackLayout noMargin>
              {!!imageResourceExternalEditors.length && (
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
              />
            </LineStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <Tooltip title={<Trans>Time between frames</Trans>}>
                <Timer style={styles.timeIcon} />
              </Tooltip>
              <TextField
                value={timeBetweenFrames}
                onChange={(e, text) =>
                  setTimeBetweenFrames(parseFloat(text) || 0)
                }
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
              <InlineCheckbox
                checked={direction.isLooping()}
                label={
                  <Text size="body-small">
                    <Trans>Loop</Trans>
                  </Text>
                }
                onCheck={(e, check) => setLooping(check)}
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
        </>
      )}
    </I18n>
  );
};

export default DirectionTools;
