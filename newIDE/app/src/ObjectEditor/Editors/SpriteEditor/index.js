// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import AnimationList, { type AnimationListInterface } from './AnimationList';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import Dialog from '../../../UI/Dialog';
import HelpButton from '../../../UI/HelpButton';
import ResourcesLoader from '../../../ResourcesLoader';
import PointsEditor from './PointsEditor';
import CollisionMasksEditor from './CollisionMasksEditor';
import { type EditorProps } from '../EditorProps.flow';
import { Column } from '../../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import Checkbox from '../../../UI/Checkbox';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import SpacedDismissableTutorialMessage from './SpacedDismissableTutorialMessage';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import FlatButtonWithSplitMenu from '../../../UI/FlatButtonWithSplitMenu';
import Add from '../../../UI/CustomSvgIcons/Add';
import { getMatchingCollisionMask } from './CollisionMasksEditor/CollisionMaskHelper';
import {
  hasAnyFrame,
  getFirstAnimationFrame,
  setCollisionMaskOnAllFrames,
} from './Utils/SpriteObjectHelper';

const gd: libGDevelop = global.gd;

type SpriteEditorProps = {|
  ...EditorProps,
  isAnimationListLocked?: boolean,
|};

export default function SpriteEditor({
  objectConfiguration,
  project,
  layout,
  object,
  objectName,
  resourceManagementProps,
  onSizeUpdated,
  onObjectUpdated,
  isChildObject,
  renderObjectNameField,
}: SpriteEditorProps) {
  const [pointsEditorOpen, setPointsEditorOpen] = React.useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = React.useState(false);
  const [
    collisionMasksEditorOpen,
    setCollisionMasksEditorOpen,
  ] = React.useState(false);
  const forceUpdate = useForceUpdate();
  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
  const animations = spriteConfiguration.getAnimations();
  const { isMobile } = useResponsiveWindowSize();

  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const animationList = React.useRef<?AnimationListInterface>(null);

  const [
    justAddedAnimationName,
    setJustAddedAnimationName,
  ] = React.useState<?string>(null);
  const justAddedAnimationElement = React.useRef<?any>(null);

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedAnimationElement.current &&
        justAddedAnimationName
      ) {
        scrollView.current.scrollTo(justAddedAnimationElement.current);
        setJustAddedAnimationName(null);
        justAddedAnimationElement.current = null;
      }
    },
    [justAddedAnimationName]
  );

  // The matching collision mask only takes the first sprite of the first
  // animation of the object. We consider this is enough to start with, and
  // the user can then edit the collision mask for further needs.
  const onCreateMatchingSpriteCollisionMask = React.useCallback(
    async () => {
      const firstSprite = getFirstAnimationFrame(animations);
      if (!firstSprite) {
        return;
      }
      const firstSpriteResourceName = firstSprite.getImageName();
      const firstAnimationResourceSource = ResourcesLoader.getResourceFullUrl(
        project,
        firstSpriteResourceName,
        {}
      );
      let matchingCollisionMask = null;
      try {
        matchingCollisionMask = await getMatchingCollisionMask(
          firstAnimationResourceSource
        );
      } catch (e) {
        console.error(
          'Unable to create a matching collision mask for the sprite, fallback to full image collision mask.',
          e
        );
      }
      setCollisionMaskOnAllFrames(animations, matchingCollisionMask);
      forceUpdate();
    },
    [animations, project, forceUpdate]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ScrollView ref={scrollView}>
            <>
              {renderObjectNameField && renderObjectNameField()}
              <SpacedDismissableTutorialMessage />
              <AnimationList
                ref={animationList}
                animations={animations}
                project={project}
                layout={layout}
                object={object}
                objectName={objectName}
                resourceManagementProps={resourceManagementProps}
                onSizeUpdated={onSizeUpdated}
                onObjectUpdated={onObjectUpdated}
                isAnimationListLocked={isChildObject}
                scrollView={scrollView}
                onCreateMatchingSpriteCollisionMask={
                  onCreateMatchingSpriteCollisionMask
                }
              />
            </>
          </ScrollView>
          <Column noMargin>
            <ResponsiveLineStackLayout
              justifyContent="space-between"
              noColumnMargin
            >
              {!isMobile ? ( // On mobile, use only 1 button to gain space.
                <ResponsiveLineStackLayout noMargin noColumnMargin>
                  <FlatButton
                    label={<Trans>Edit collision masks</Trans>}
                    onClick={() => setCollisionMasksEditorOpen(true)}
                    disabled={!hasAnyFrame(animations)}
                  />
                  <FlatButton
                    label={<Trans>Edit points</Trans>}
                    onClick={() => setPointsEditorOpen(true)}
                    disabled={!hasAnyFrame(animations)}
                  />
                  {!isChildObject && (
                    <FlatButton
                      label={<Trans>Advanced options</Trans>}
                      onClick={() => setAdvancedOptionsOpen(true)}
                      disabled={!hasAnyFrame(animations)}
                    />
                  )}
                </ResponsiveLineStackLayout>
              ) : (
                <FlatButtonWithSplitMenu
                  label={<Trans>Edit collision masks</Trans>}
                  onClick={() => setCollisionMasksEditorOpen(true)}
                  disabled={!hasAnyFrame(animations)}
                  buildMenuTemplate={i18n =>
                    [
                      {
                        label: i18n._(t`Edit points`),
                        disabled: !hasAnyFrame(animations),
                        click: () => setPointsEditorOpen(true),
                      },
                      isChildObject
                        ? {
                            label: i18n._(t`Advanced options`),
                            disabled: !hasAnyFrame(animations),
                            click: () => setAdvancedOptionsOpen(true),
                          }
                        : null,
                    ].filter(Boolean)
                  }
                />
              )}
              {!isChildObject && (
                <RaisedButton
                  label={<Trans>Add an animation</Trans>}
                  primary
                  onClick={() => {
                    if (!animationList.current) {
                      return;
                    }
                    animationList.current.addAnimation();
                  }}
                  icon={<Add />}
                />
              )}
            </ResponsiveLineStackLayout>
          </Column>
          {advancedOptionsOpen && (
            <Dialog
              title={<Trans>Advanced options</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setAdvancedOptionsOpen(false)}
                />,
              ]}
              maxWidth="sm"
              flexBody
              onRequestClose={() => setAdvancedOptionsOpen(false)}
              open
            >
              <Column noMargin>
                <Checkbox
                  label={
                    <Trans>
                      Don't play the animation when the object is far from the
                      camera or hidden (recommended for performance)
                    </Trans>
                  }
                  checked={!spriteConfiguration.getUpdateIfNotVisible()}
                  onCheck={(_, value) => {
                    spriteConfiguration.setUpdateIfNotVisible(!value);

                    forceUpdate();
                    if (onObjectUpdated) onObjectUpdated();
                  }}
                />
              </Column>
            </Dialog>
          )}
          {pointsEditorOpen && (
            <Dialog
              title={<Trans>Edit points</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setPointsEditorOpen(false)}
                />,
              ]}
              secondaryActions={[
                <HelpButton
                  helpPagePath="/objects/sprite/edit-points"
                  key="help"
                />,
              ]}
              onRequestClose={() => setPointsEditorOpen(false)}
              maxWidth="lg"
              flexBody
              fullHeight
              open={pointsEditorOpen}
            >
              <PointsEditor
                animations={animations}
                resourcesLoader={ResourcesLoader}
                project={project}
                onPointsUpdated={onObjectUpdated}
                onRenamedPoint={(oldName, newName) =>
                  // TODO EBO Refactor event-based object events when a point is renamed.
                  layout &&
                  object &&
                  gd.WholeProjectRefactorer.renameObjectPoint(
                    project,
                    layout,
                    object,
                    oldName,
                    newName
                  )
                }
              />
            </Dialog>
          )}
          {collisionMasksEditorOpen && (
            <Dialog
              title={<Trans>Edit collision masks</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setCollisionMasksEditorOpen(false)}
                />,
              ]}
              secondaryActions={[
                <HelpButton
                  helpPagePath="/objects/sprite/collision-mask"
                  key="help"
                />,
              ]}
              maxWidth="lg"
              flexBody
              fullHeight
              onRequestClose={() => setCollisionMasksEditorOpen(false)}
              open={collisionMasksEditorOpen}
            >
              <CollisionMasksEditor
                animations={animations}
                resourcesLoader={ResourcesLoader}
                project={project}
                onMasksUpdated={onObjectUpdated}
                onCreateMatchingSpriteCollisionMask={
                  onCreateMatchingSpriteCollisionMask
                }
              />
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
}
