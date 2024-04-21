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
import AlertMessage from '../../UI/AlertMessage';
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
import { type GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';
import {
  PropertyCheckbox,
  PropertyField,
  PropertyResourceSelector,
} from './PropertyFields';

const gd: libGDevelop = global.gd;

const DragSourceAndDropTarget = makeDragSourceAndDropTarget(
  'model3d-animations-list'
);

const styles = {
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 5,
  },
  rowContent: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
};

const epsilon = 1 / (1 << 16);

const removeTrailingZeroes = (value: string) => {
  for (let index = value.length - 1; index > 0; index--) {
    if (value.charAt(index) === '.') {
      return value.substring(0, index);
    }
    if (value.charAt(index) !== '0') {
      return value;
    }
  }
  return value;
};

export const hasLight = (layout: ?gd.Layout) => {
  if (!layout) {
    return true;
  }
  for (let layerIndex = 0; layerIndex < layout.getLayersCount(); layerIndex++) {
    const layer = layout.getLayerAt(layerIndex);
    if (layer.getRenderingType() === '2d') {
      continue;
    }
    const effects = layer.getEffects();
    for (
      let effectIndex = 0;
      effectIndex < effects.getEffectsCount();
      effectIndex++
    ) {
      const effect = effects.getEffectAt(effectIndex);
      const type = effect.getEffectType();
      if (
        type === 'Scene3D::AmbientLight' ||
        type === 'Scene3D::DirectionalLight' ||
        type === 'Scene3D::HemisphereLight'
      ) {
        return true;
      }
    }
  }
  return false;
};

const Model3DEditor = ({
  objectConfiguration,
  project,
  layout,
  object,
  onSizeUpdated,
  onObjectUpdated,
  resourceManagementProps,
  renderObjectNameField,
}: EditorProps) => {
  const scrollView = React.useRef<?ScrollViewInterface>(null);

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

  const model3DConfiguration = gd.asModel3DConfiguration(objectConfiguration);
  const properties = objectConfiguration.getProperties();

  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const [gltf, setGltf] = React.useState<GLTF | null>(null);
  const loadGltf = React.useCallback(
    async (modelResourceName: string) => {
      const newModel3d = await PixiResourcesLoader.get3DModel(
        project,
        modelResourceName
      );
      setGltf(newModel3d);
    },
    [project]
  );
  if (!gltf) {
    loadGltf(properties.get('modelResourceName').getValue());
  }

  const model3D = React.useMemo<THREE.Object3D | null>(
    () => {
      if (!gltf) {
        return null;
      }
      const clonedModel3D = SkeletonUtils.clone(gltf.scene);
      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      threeObject.add(clonedModel3D);
      return threeObject;
    },
    [gltf]
  );

  const [originLocation, setOriginLocation] = React.useState<string>(() =>
    properties.get('originLocation').getValue()
  );
  const onOriginLocationChange = React.useCallback(
    (event, index: number, newValue: string) => {
      onChangeProperty('originLocation', newValue);
      setOriginLocation(newValue);
    },
    [onChangeProperty]
  );

  const [rotationX, setRotationX] = React.useState<number>(
    () => parseFloat(properties.get('rotationX').getValue()) || 0
  );
  const [rotationY, setRotationY] = React.useState<number>(
    () => parseFloat(properties.get('rotationY').getValue()) || 0
  );
  const [rotationZ, setRotationZ] = React.useState<number>(
    () => parseFloat(properties.get('rotationZ').getValue()) || 0
  );
  const onRotationChange = React.useCallback(
    () => {
      setRotationX(parseFloat(properties.get('rotationX').getValue()));
      setRotationY(parseFloat(properties.get('rotationY').getValue()));
      setRotationZ(parseFloat(properties.get('rotationZ').getValue()));
    },
    [properties]
  );
  const modelSize = React.useMemo<{ x: number, y: number, z: number } | null>(
    () => {
      if (!model3D) {
        return null;
      }
      // These formulas are also used in:
      // - gdjs.Model3DRuntimeObject3DRenderer._updateDefaultTransformation
      // - Model3DRendered2DInstance
      model3D.rotation.set(
        (rotationX * Math.PI) / 180,
        (rotationY * Math.PI) / 180,
        (rotationZ * Math.PI) / 180
      );
      model3D.updateMatrixWorld(true);
      const boundingBox = new THREE.Box3().setFromObject(model3D);
      if (originLocation === 'ModelOrigin') {
        // Keep the origin as part of the model.
        // For instance, a model can be 1 face of a cube and we want to keep the
        // inside as part of the object even if it's just void.
        // It also avoids to have the origin outside of the object box.
        boundingBox.expandByPoint(new THREE.Vector3(0, 0, 0));
      }
      const sizeX = boundingBox.max.x - boundingBox.min.x;
      const sizeY = boundingBox.max.y - boundingBox.min.y;
      const sizeZ = boundingBox.max.z - boundingBox.min.z;
      return {
        x: sizeX < epsilon ? 0 : sizeX,
        y: sizeY < epsilon ? 0 : sizeY,
        z: sizeZ < epsilon ? 0 : sizeZ,
      };
    },
    [model3D, originLocation, rotationX, rotationY, rotationZ]
  );

  const [width, setWidth] = React.useState<number>(
    () => parseFloat(properties.get('width').getValue()) || 0
  );
  const [height, setHeight] = React.useState<number>(
    () => parseFloat(properties.get('height').getValue()) || 0
  );
  const [depth, setDepth] = React.useState<number>(
    () => parseFloat(properties.get('depth').getValue()) || 0
  );
  const onDimensionChange = React.useCallback(
    () => {
      setWidth(parseFloat(properties.get('width').getValue()));
      setHeight(parseFloat(properties.get('height').getValue()));
      setDepth(parseFloat(properties.get('depth').getValue()));
    },
    [properties]
  );
  const scale = React.useMemo<number | null>(
    () => {
      if (!modelSize) {
        return null;
      }
      return Math.min(
        modelSize.x < epsilon ? Number.POSITIVE_INFINITY : width / modelSize.x,
        modelSize.y < epsilon ? Number.POSITIVE_INFINITY : height / modelSize.y,
        modelSize.z < epsilon ? Number.POSITIVE_INFINITY : depth / modelSize.z
      );
    },
    [depth, height, modelSize, width]
  );

  const setScale = React.useCallback(
    (scale: number) => {
      if (!modelSize) {
        return;
      }
      const width = scale * modelSize.x;
      const height = scale * modelSize.y;
      const depth = scale * modelSize.z;
      objectConfiguration.updateProperty('width', width.toString(10));
      objectConfiguration.updateProperty('height', height.toString(10));
      objectConfiguration.updateProperty('depth', depth.toString(10));
      onDimensionChange();
      forceUpdate();
    },
    [forceUpdate, modelSize, objectConfiguration, onDimensionChange]
  );

  const scanNewAnimations = React.useCallback(
    () => {
      if (!gltf) {
        return;
      }
      setNameErrors({});

      const animationSources = mapFor(
        0,
        model3DConfiguration.getAnimationsCount(),
        animationIndex =>
          model3DConfiguration.getAnimation(animationIndex).getSource()
      );

      let hasAddedAnimation = false;
      for (const resourceAnimation of gltf.animations) {
        if (animationSources.includes(resourceAnimation.name)) {
          continue;
        }
        const newAnimationName = model3DConfiguration.hasAnimationNamed(
          resourceAnimation.name
        )
          ? ''
          : resourceAnimation.name;

        const newAnimation = new gd.Model3DAnimation();
        newAnimation.setName(newAnimationName);
        newAnimation.setSource(resourceAnimation.name);
        model3DConfiguration.addAnimation(newAnimation);
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
          message: t`Every animation from the GLB file is already in the list.`,
        });
      }
    },
    [
      forceUpdate,
      gltf,
      model3DConfiguration,
      onObjectUpdated,
      onSizeUpdated,
      showAlert,
    ]
  );

  const addAnimation = React.useCallback(
    () => {
      setNameErrors({});

      const emptyAnimation = new gd.Model3DAnimation();
      model3DConfiguration.addAnimation(emptyAnimation);
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
    [forceUpdate, onObjectUpdated, onSizeUpdated, model3DConfiguration]
  );

  const removeAnimation = React.useCallback(
    animationIndex => {
      setNameErrors({});

      model3DConfiguration.removeAnimation(animationIndex);
      forceUpdate();
      onSizeUpdated();
      if (onObjectUpdated) onObjectUpdated();
    },
    [forceUpdate, onObjectUpdated, onSizeUpdated, model3DConfiguration]
  );

  const moveAnimation = React.useCallback(
    (targetIndex: number) => {
      const draggedIndex = draggedAnimationIndex.current;
      if (draggedIndex === null) return;

      setNameErrors({});

      model3DConfiguration.moveAnimation(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
      forceUpdate();
    },
    [model3DConfiguration, forceUpdate]
  );

  const changeAnimationName = React.useCallback(
    (animationIndex, newName) => {
      const currentName = model3DConfiguration
        .getAnimation(animationIndex)
        .getName();
      if (currentName === newName) return;
      const animation = model3DConfiguration.getAnimation(animationIndex);

      setNameErrors({});

      if (newName !== '' && model3DConfiguration.hasAnimationNamed(newName)) {
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
      // TODO EBO Refactor event-based object events when an animation is renamed.
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
      model3DConfiguration,
      layout,
      object,
      forceUpdate,
      onObjectUpdated,
      nameErrors,
      project,
    ]
  );

  const sourceSelectOptions = gltf
    ? gltf.animations.map(animation => {
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
          {renderObjectNameField && renderObjectNameField()}
          <PropertyResourceSelector
            objectConfiguration={objectConfiguration}
            propertyName="modelResourceName"
            project={project}
            resourceManagementProps={resourceManagementProps}
            onChange={resourceName => {
              loadGltf(resourceName);
            }}
          />
          <SelectField
            value={properties.get('materialType').getValue()}
            floatingLabelText={properties.get('materialType').getLabel()}
            helperMarkdownText={properties.get('materialType').getDescription()}
            onChange={(event, index, newValue) => {
              onChangeProperty('materialType', newValue);
            }}
          >
            <SelectOption
              label={t`No lighting effect`}
              value="Basic"
              key="Basic"
            />
            <SelectOption
              label={t`Emit all ambient light`}
              value="StandardWithoutMetalness"
              key="StandardWithoutMetalness"
            />
            <SelectOption
              label={t`Keep model material`}
              value="KeepOriginal"
              key="KeepOriginal"
            />
          </SelectField>
          {properties.get('materialType').getValue() !== 'Basic' &&
            !hasLight(layout) && (
              <AlertMessage kind="error">
                <Trans>
                  Make sure to set up a light in the effects of the layer or
                  chose "No lighting effect" - otherwise the object will appear
                  black.
                </Trans>
              </AlertMessage>
            )}
          <Text size="block-title" noMargin>
            <Trans>Default orientation</Trans>
          </Text>
          <ResponsiveLineStackLayout expand noColumnMargin>
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="rotationX"
              onChange={onRotationChange}
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="rotationY"
              onChange={onRotationChange}
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="rotationZ"
              onChange={onRotationChange}
            />
          </ResponsiveLineStackLayout>
          <Text size="block-title" noMargin>
            <Trans>Default size</Trans>
          </Text>
          <ResponsiveLineStackLayout expand noColumnMargin>
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="width"
              onChange={onDimensionChange}
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="height"
              onChange={onDimensionChange}
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="depth"
              onChange={onDimensionChange}
            />
          </ResponsiveLineStackLayout>
          <Column noMargin expand key={'ScalingRatio'}>
            <SemiControlledTextField
              floatingLabelFixed
              floatingLabelText={<Trans>Scaling factor</Trans>}
              onChange={value => setScale(parseFloat(value) || 0)}
              value={
                scale === null ? '' : removeTrailingZeroes(scale.toPrecision(5))
              }
            />
          </Column>
          <PropertyCheckbox
            objectConfiguration={objectConfiguration}
            propertyName="keepAspectRatio"
          />
          <Text size="block-title" noMargin>
            <Trans>Points</Trans>
          </Text>
          <ResponsiveLineStackLayout expand noColumnMargin>
            <SelectField
              value={originLocation}
              floatingLabelText={properties.get('originLocation').getLabel()}
              helperMarkdownText={properties
                .get('originLocation')
                .getDescription()}
              onChange={onOriginLocationChange}
              fullWidth
            >
              <SelectOption
                label={t`Model origin`}
                value="ModelOrigin"
                key="ModelOrigin"
              />
              <SelectOption
                label={t`Top-left corner`}
                value="TopLeft"
                key="TopLeftCorner"
              />
              <SelectOption
                label={t`Object center`}
                value="ObjectCenter"
                key="ObjectCenter"
              />
              <SelectOption
                label={t`Bottom center (on Z axis)`}
                value="BottomCenterZ"
                key="BottomCenterZ"
              />
              <SelectOption
                label={t`Bottom center (on Y axis)`}
                value="BottomCenterY"
                key="BottomCenterY"
              />
            </SelectField>
            <SelectField
              value={properties.get('centerLocation').getValue()}
              floatingLabelText={properties.get('centerLocation').getLabel()}
              helperMarkdownText={properties
                .get('centerLocation')
                .getDescription()}
              onChange={(event, index, newValue) => {
                onChangeProperty('centerLocation', newValue);
              }}
              fullWidth
            >
              <SelectOption
                label={t`Model origin`}
                value="ModelOrigin"
                key="ModelOrigin"
              />
              <SelectOption
                label={t`Object center`}
                value="ObjectCenter"
                key="ObjectCenter"
              />
              <SelectOption
                label={t`Bottom center (on Z axis)`}
                value="BottomCenterZ"
                key="BottomCenterZ"
              />
              <SelectOption
                label={t`Bottom center (on Y axis)`}
                value="BottomCenterY"
                key="BottomCenterY"
              />
            </SelectField>
          </ResponsiveLineStackLayout>
          <Text size="block-title">Animations</Text>
          <Column noMargin expand useFullHeight>
            {model3DConfiguration.getAnimationsCount() === 0 ? (
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
                  model3DConfiguration.getAnimationsCount(),
                  animationIndex => {
                    const animation = model3DConfiguration.getAnimation(
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
                                    <Trans>GLB animation name</Trans>
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
        </ColumnStackLayout>
      </ScrollView>
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
  );
};

export default Model3DEditor;
