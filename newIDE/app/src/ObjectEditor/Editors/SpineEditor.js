// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type EditorProps } from './EditorProps.flow';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import useForceUpdate from '../../Utils/UseForceUpdate';
import Checkbox from '../../UI/Checkbox';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import IconButton from '../../UI/IconButton';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import { mapFor } from '../../Utils/MapFor';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import Add from '../../UI/CustomSvgIcons/Add';
import Trash from '../../UI/CustomSvgIcons/Trash';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import { DragHandleIcon } from '../../UI/DragHandle';
import DropIndicator from '../../UI/SortableVirtualizedItemList/DropIndicator';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import {
  PropertyResourceSelector,
  PropertyField,
  styles,
} from './Model3DEditor';
import { ISkeletonData } from 'pixi-spine';

const gd: libGDevelop = global.gd;

const DragSourceAndDropTarget = makeDragSourceAndDropTarget(
  'spine-animations-list'
);

const SpineEditor = ({
  objectConfiguration,
  project,
  layout,
  object,
  onSizeUpdated,
  onObjectUpdated,
  resourceManagementProps,
}: EditorProps) => {
  const scrollView = React.useRef<?ScrollViewInterface>(null);

  const getResource = (name) => {
    const resourcesManager = project.getResourcesManager();

    return resourcesManager.hasResource(name) ?
      resourcesManager.getResource(name) :
      null;
  };
  const getMetadata = (resource) => {
    const metadataString = resource.getMetadata();

   return !!metadataString ? JSON.parse(metadataString) : { };
  };
  const setMetadata = (resource, metadata) => resource?.setMetadata(JSON.stringify(metadata));
  const extendMetadata = (resourceName, metadata) => {
    const resource = getResource(resourceName);
    
    setMetadata(resource, Object.assign(getMetadata(resource), metadata));
  }
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
  const { showAlert } = useAlertDialog();

  const draggedAnimationIndex = React.useRef<number | null>(null);

  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const forceUpdate = useForceUpdate();

  const spineConfiguration = gd.asSpineConfiguration(objectConfiguration);
  const properties = objectConfiguration.getProperties();

  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );

  const [skeleton, setSkeleton] = React.useState<?ISkeletonData>(null);
  const getSkeleton = React.useCallback(
    (
      jsonResourceName: string,
      imageResourceName: string,
      atlasResourceName: string
    ) => {
      if (
        [jsonResourceName, imageResourceName, atlasResourceName].some(
          resName => !resName
        )
      ) {
        return Promise.resolve(undefined);
      }

      return PixiResourcesLoader.getSpineData(
        project,
        jsonResourceName,
        imageResourceName,
        atlasResourceName
      ).then(newSkeleton => {
        setSkeleton(newSkeleton);

        return newSkeleton;
      });
    },
    [project]
  );
  getSkeleton(
    properties.get('jsonResourceName').getValue(),
    properties.get('imageResourceName').getValue(),
    properties.get('atlasResourceName').getValue()
  );

  const onChangeJsonResourceName = React.useCallback(
    (jsonResourceName: string) => {
      const atlasResourceName = properties.get('atlasResourceName').getValue();

      if (atlasResourceName) {
        extendMetadata(jsonResourceName, { atlas: atlasResourceName });
      }

      getSkeleton(
        jsonResourceName,
        properties.get('imageResourceName').getValue(),
        atlasResourceName
      ).then(newSkeleton => {
        spineConfiguration.removeAllAnimations();
      });
    },
    [getSkeleton]
  );
  const onChangeAtlasResourceName = React.useCallback(
    (atlasResourceName: string) => {
      const jsonResourceName = properties.get('jsonResourceName').getValue();
      const imageResourceName = properties.get('imageResourceName').getValue();

      if (jsonResourceName) {
        extendMetadata(jsonResourceName, { atlas: atlasResourceName });
      }
      if (imageResourceName) {
        extendMetadata(atlasResourceName, { image: imageResourceName });
      }

      getSkeleton(
        properties.get('jsonResourceName').getValue(),
        imageResourceName,
        atlasResourceName
      ).then(newSkeleton => {
        spineConfiguration.removeAllAnimations();
      });
    },
    [getSkeleton]
  );
  const onChangeImageResourceName = React.useCallback(
    (imageResourceName: string) => {
      const atlasResourceName = properties.get('atlasResourceName').getValue();

      if (atlasResourceName) {
        extendMetadata(atlasResourceName, { image: imageResourceName });
      }

      getSkeleton(
        properties.get('jsonResourceName').getValue(),
        imageResourceName,
        atlasResourceName
      ).then(newSkeleton => {
        spineConfiguration.removeAllAnimations();
      });
    },
    [getSkeleton]
  );

  const scanNewAnimations = React.useCallback(
    () => {
      if (!skeleton) {
        return;
      }
      setNameErrors({});

      const animationSources = mapFor(
        0,
        spineConfiguration.getAnimationsCount(),
        animationIndex =>
          spineConfiguration.getAnimation(animationIndex).getSource()
      );

      let hasAddedAnimation = false;
      for (const resourceAnimation of skeleton.animations) {
        if (animationSources.includes(resourceAnimation.name)) {
          continue;
        }
        const newAnimationName = spineConfiguration.hasAnimationNamed(
          resourceAnimation.name
        )
          ? ''
          : resourceAnimation.name;

        const newAnimation = new gd.SpineAnimation();
        newAnimation.setName(newAnimationName);
        newAnimation.setSource(resourceAnimation.name);
        spineConfiguration.addAnimation(newAnimation);
        newAnimation.delete();
        hasAddedAnimation = true;
      }
      if (hasAddedAnimation) {
        forceUpdate();
        onSizeUpdated();
        if (onObjectUpdated) onObjectUpdated();

        // Scroll to the bottom of the list.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          if (scrollView.current) {
            scrollView.current.scrollToBottom();
          }
        }, 100); // A few ms is enough for a new render to be done.
      } else {
        showAlert({
          title: t`No new animation`,
          message: t`Every animation from the Spine file is already in the list.`,
        });
      }
    },
    [
      forceUpdate,
      skeleton,
      spineConfiguration,
      onObjectUpdated,
      onSizeUpdated,
      showAlert,
    ]
  );

  const addAnimation = React.useCallback(
    () => {
      setNameErrors({});

      const emptyAnimation = new gd.SpineAnimation();
      spineConfiguration.addAnimation(emptyAnimation);
      emptyAnimation.delete();
      forceUpdate();
      onSizeUpdated();
      if (onObjectUpdated) onObjectUpdated();

      // Scroll to the bottom of the list.
      // Ideally, we'd wait for the list to be updated to scroll, but
      // to simplify the code, we just wait a few ms for a new render
      // to be done.
      setTimeout(() => {
        if (scrollView.current) {
          scrollView.current.scrollToBottom();
        }
      }, 100); // A few ms is enough for a new render to be done.
    },
    [forceUpdate, onObjectUpdated, onSizeUpdated, spineConfiguration]
  );

  const removeAnimation = React.useCallback(
    animationIndex => {
      setNameErrors({});

      spineConfiguration.removeAnimation(animationIndex);
      forceUpdate();
      onSizeUpdated();
      if (onObjectUpdated) onObjectUpdated();
    },
    [forceUpdate, onObjectUpdated, onSizeUpdated, spineConfiguration]
  );

  const moveAnimation = React.useCallback(
    (targetIndex: number) => {
      const draggedIndex = draggedAnimationIndex.current;
      if (draggedIndex === null) return;

      setNameErrors({});

      spineConfiguration.moveAnimation(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
      forceUpdate();
    },
    [spineConfiguration, forceUpdate]
  );

  const changeAnimationName = React.useCallback(
    (animationIndex, newName) => {
      const currentName = spineConfiguration
        .getAnimation(animationIndex)
        .getName();
      if (currentName === newName) return;
      const animation = spineConfiguration.getAnimation(animationIndex);

      setNameErrors({});

      if (newName !== '' && spineConfiguration.hasAnimationNamed(newName)) {
        // The indexes can be used as a key because errors are cleared when
        // animations are moved.
        setNameErrors({
          ...nameErrors,
          [animationIndex]: (
            <Trans>The animation name {newName} is already taken</Trans>
          ),
        });
        return;
      }

      animation.setName(newName);
      if (layout && object) {
        gd.WholeProjectRefactorer.renameObjectAnimation(
          project,
          layout,
          object,
          currentName,
          newName
        );
      }
      forceUpdate();
      if (onObjectUpdated) onObjectUpdated();
    },
    [
      spineConfiguration,
      layout,
      object,
      forceUpdate,
      onObjectUpdated,
      nameErrors,
      project,
    ]
  );

  const sourceSelectOptions = skeleton
    ? skeleton.animations.map(animation => {
        return (
          <SelectOption
            key={animation.name}
            value={animation.name}
            label={animation.name}
            shouldNotTranslate
          />
        );
      })
    : [];

  return (
    <>
      <ScrollView ref={scrollView}>
        <ColumnStackLayout noMargin>
          <PropertyResourceSelector
            objectConfiguration={objectConfiguration}
            propertyName="jsonResourceName"
            project={project}
            resourceManagementProps={resourceManagementProps}
            onChange={onChangeJsonResourceName}
          />
          <PropertyResourceSelector
            objectConfiguration={objectConfiguration}
            propertyName="atlasResourceName"
            project={project}
            resourceManagementProps={resourceManagementProps}
            onChange={onChangeAtlasResourceName}
          />
          <PropertyResourceSelector
            objectConfiguration={objectConfiguration}
            propertyName="imageResourceName"
            project={project}
            resourceManagementProps={resourceManagementProps}
            onChange={onChangeImageResourceName}
          />
          <Text size="block-title" noMargin>
            <Trans>Appearance</Trans>
          </Text>
          <PropertyField
            objectConfiguration={objectConfiguration}
            propertyName="scale"
          />
          <PropertyField
            objectConfiguration={objectConfiguration}
            propertyName="opacity"
          />
          <Text size="block-title" noMargin>
            <Trans>Play</Trans>
          </Text>
          <PropertyField
            objectConfiguration={objectConfiguration}
            propertyName="timeScale"
          />
          {sourceSelectOptions.length && 
            <>
              <Text size="block-title">Animations</Text>
              <Column noMargin expand useFullHeight>
              {spineConfiguration.getAnimationsCount() === 0 ? (
                <Column noMargin expand justifyContent="center">
                  <EmptyPlaceholder
                    title={<Trans>Add your first animation</Trans>}
                    description={
                      <Trans>Animations are a sequence of images.</Trans>
                    }
                    actionLabel={<Trans>Add an animation</Trans>}
                    helpPagePath="/objects/sprite"
                    tutorialId="intermediate-changing-animations"
                    onAction={addAnimation}
                  />
                </Column>
              ) : (
                <React.Fragment>
                  {mapFor(
                    0,
                    spineConfiguration.getAnimationsCount(),
                    animationIndex => {
                      const animation = spineConfiguration.getAnimation(
                        animationIndex
                      );

                      const animationRef =
                        justAddedAnimationName === animation.getName()
                          ? justAddedAnimationElement
                          : null;

                      return (
                        <DragSourceAndDropTarget
                          key={animationIndex}
                          beginDrag={() => {
                            draggedAnimationIndex.current = animationIndex;
                            return {};
                          }}
                          canDrag={() => true}
                          canDrop={() => true}
                          drop={() => {
                            moveAnimation(animationIndex);
                          }}
                        >
                          {({
                            connectDragSource,
                            connectDropTarget,
                            isOver,
                            canDrop,
                          }) =>
                            connectDropTarget(
                              <div
                                key={animationIndex}
                                style={styles.rowContainer}
                              >
                                {isOver && <DropIndicator canDrop={canDrop} />}
                                <div
                                  ref={animationRef}
                                  style={{
                                    ...styles.rowContent,
                                    backgroundColor:
                                      gdevelopTheme.list.itemsBackgroundColor,
                                  }}
                                >
                                  <Line noMargin expand alignItems="center">
                                    {connectDragSource(
                                      <span>
                                        <Column>
                                          <DragHandleIcon />
                                        </Column>
                                      </span>
                                    )}
                                    <Text noMargin noShrink>
                                      <Trans>Animation #{animationIndex}</Trans>
                                    </Text>
                                    <Spacer />
                                    <SemiControlledTextField
                                      margin="none"
                                      commitOnBlur
                                      errorText={nameErrors[animationIndex]}
                                      translatableHintText={t`Optional animation name`}
                                      value={animation.getName()}
                                      onChange={text =>
                                        changeAnimationName(animationIndex, text)
                                      }
                                      fullWidth
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        removeAnimation(animationIndex)
                                      }
                                    >
                                      <Trash />
                                    </IconButton>
                                  </Line>
                                  <Spacer />
                                </div>
                                <Spacer />
                                <ColumnStackLayout expand>
                                  <SelectField
                                    id="animation-source-field"
                                    value={animation.getSource()}
                                    onChange={(event, value) => {
                                      animation.setSource(event.target.value);
                                      forceUpdate();
                                    }}
                                    margin="dense"
                                    fullWidth
                                    floatingLabelText={
                                      <Trans>Spine animation name</Trans>
                                    }
                                    translatableHintText={t`Choose an animation`}
                                  >
                                    {sourceSelectOptions}
                                  </SelectField>
                                  <Checkbox
                                    label={<Trans>Loop</Trans>}
                                    checked={animation.shouldLoop()}
                                    onCheck={(e, checked) => {
                                      animation.setShouldLoop(checked);
                                      forceUpdate();
                                    }}
                                  />
                                </ColumnStackLayout>
                              </div>
                            )
                          }
                        </DragSourceAndDropTarget>
                      );
                    }
                  )}
                </React.Fragment>
              )}
              </Column>
              <Column noMargin>
                <ResponsiveLineStackLayout
                  justifyContent="space-between"
                  noColumnMargin
                >
                  <FlatButton
                    label={<Trans>Scan missing animations</Trans>}
                    onClick={scanNewAnimations}
                  />
                  <RaisedButton
                    label={<Trans>Add an animation</Trans>}
                    primary
                    onClick={addAnimation}
                    icon={<Add />}
                  />
                </ResponsiveLineStackLayout>
              </Column>
            </>
          }
        </ColumnStackLayout>
      </ScrollView>
    </>
  );
};

export default SpineEditor;
