// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PointsList from './PointsList';
import PointsPreview from './PointsPreview';
import ImagePreview from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import {
  getCurrentElements,
  allSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
} from '../Utils/SpriteObjectHelper';
import SpriteSelector from '../Utils/SpriteSelector';
import Window from '../../../../Utils/Window';
import every from 'lodash/every';
import ResourcesLoader from '../../../../ResourcesLoader';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import EditorMosaic, {
  type Editor,
  type EditorMosaicNode,
} from '../../../../UI/EditorMosaic';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Background from '../../../../UI/Background';
import ScrollView from '../../../../UI/ScrollView';
const gd: libGDevelop = global.gd;

const horizontalMosaicNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'preview',
  second: 'properties',
  splitPercentage: 50,
};

const verticalMosaicNodes: EditorMosaicNode = {
  direction: 'column',
  first: 'preview',
  second: 'properties',
  splitPercentage: 50,
};

type Props = {|
  object: gdSpriteObject,
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
|};

const PointsEditor = (props: Props) => {
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const [directionIndex, setDirectionIndex] = React.useState(0);
  const [spriteIndex, setSpriteIndex] = React.useState(0);
  const [selectedPointName, setSelectedPointName] = React.useState<?string>(
    null
  );
  const [
    highlightedPointName,
    setHighlightedPointName,
  ] = React.useState<?string>(null);

  // Note: these two booleans are set to false to avoid erasing points of other
  // animations/frames (and they will be updated by updateSamePointsToggles). In
  // theory, they should be set to the appropriate value at their initialization,
  // for consistency of the state.
  const [samePointsForAnimations, setSamePointsForAnimations] = React.useState(
    false
  );
  const [samePointsForSprites, setSamePointsForSprites] = React.useState(false);
  const forceUpdate = useForceUpdate();

  const spriteObject = gd.asSpriteObject(props.object);
  const { animation, sprite, hasValidSprite } = getCurrentElements(
    spriteObject,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  const updatePoints = React.useCallback(
    () => {
      if (animation && sprite) {
        if (samePointsForAnimations) {
          mapFor(0, spriteObject.getAnimationsCount(), i => {
            const otherAnimation = spriteObject.getAnimation(i);
            copyAnimationsSpritePoints(sprite, otherAnimation);
          });
        } else if (samePointsForSprites) {
          copyAnimationsSpritePoints(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview
    },
    [
      animation,
      sprite,
      spriteObject,
      samePointsForAnimations,
      samePointsForSprites,
      forceUpdate,
    ]
  );

  const chooseAnimation = index => {
    setAnimationIndex(index);
    setDirectionIndex(0);
    setSpriteIndex(0);
  };

  const chooseDirection = index => {
    setDirectionIndex(index);
    setSpriteIndex(0);
  };

  const chooseSprite = index => {
    setSpriteIndex(index);
  };

  const updateSamePointsToggles = () => {
    if (!animation || !sprite) return;

    setSamePointsForAnimations(
      every(
        mapFor(0, spriteObject.getAnimationsCount(), i => {
          const otherAnimation = spriteObject.getAnimation(i);
          return allSpritesHaveSamePointsAs(sprite, otherAnimation);
        })
      )
    );

    setSamePointsForSprites(allSpritesHaveSamePointsAs(sprite, animation));
  };

  const setSamePointsForAllAnimations = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all animations will erase and reset all the other animations points. This can't be undone. Are you sure you want to share these points amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    setSamePointsForAnimations(enable);
    setSamePointsForSprites(enable || samePointsForSprites);
  };

  const setSamePointsForAllSprites = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all frames will erase and reset all the other frames points. This can't be undone. Are you sure you want to share these points amongst all the frames of the animation?"
      );
      if (!answer) return;
    }

    setSamePointsForAnimations(enable && samePointsForAnimations);
    setSamePointsForSprites(enable);
  };

  // Note: might be worth fixing these warnings:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(updateSamePointsToggles, [animationIndex]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(updatePoints, [
    samePointsForAnimations,
    samePointsForSprites,
  ]);

  // Keep panes vertical for small screens, side-by-side for large screens
  const screenSize = useResponsiveWindowWidth();
  const editorNodes =
    screenSize === 'small' ? verticalMosaicNodes : horizontalMosaicNodes;

  if (!props.object.getAnimationsCount()) return null;

  const editors: { [string]: Editor } = {
    preview: {
      type: 'primary',
      noTitleBar: true,
      renderEditor: () => (
        <Background>
          <ImagePreview
            resourceName={hasValidSprite ? sprite.getImageName() : ''}
            resourcesLoader={props.resourcesLoader}
            project={props.project}
            renderOverlay={overlayProps =>
              hasValidSprite && (
                <PointsPreview
                  {...overlayProps}
                  pointsContainer={sprite}
                  onPointsUpdated={updatePoints}
                  selectedPointName={selectedPointName}
                  highlightedPointName={highlightedPointName}
                  onClickPoint={setSelectedPointName}
                />
              )
            }
          />
        </Background>
      ),
    },
    properties: {
      type: 'secondary',
      noTitleBar: true,
      renderEditor: () => (
        <Background>
          <ScrollView>
            <Line>
              <Column expand>
                <SpriteSelector
                  spriteObject={spriteObject}
                  animationIndex={animationIndex}
                  directionIndex={directionIndex}
                  spriteIndex={spriteIndex}
                  chooseAnimation={chooseAnimation}
                  chooseDirection={chooseDirection}
                  chooseSprite={chooseSprite}
                  sameForAllAnimations={samePointsForAnimations}
                  sameForAllSprites={samePointsForSprites}
                  setSameForAllAnimations={setSamePointsForAllAnimations}
                  setSameForAllSprites={setSamePointsForAllSprites}
                  setSameForAllAnimationsLabel={
                    <Trans>Share same points for all animations</Trans>
                  }
                  setSameForAllSpritesLabel={
                    <Trans>
                      Share same points for all sprites of this animation
                    </Trans>
                  }
                />
              </Column>
            </Line>
            {!!sprite && (
              <PointsList
                pointsContainer={sprite}
                onPointsUpdated={updatePoints}
                selectedPointName={selectedPointName}
                onHoverPoint={setHighlightedPointName}
                onSelectPoint={setSelectedPointName}
              />
            )}
            {!sprite && (
              <EmptyMessage>
                <Trans>Choose an animation and frame to edit the points</Trans>
              </EmptyMessage>
            )}
          </ScrollView>
        </Background>
      ),
    },
  };

  return (
    <div style={{ flex: 1 }}>
      <EditorMosaic editors={editors} initialNodes={editorNodes} />
    </div>
  );
};

export default PointsEditor;
