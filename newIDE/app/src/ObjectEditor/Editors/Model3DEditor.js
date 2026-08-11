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
import EmptyMessage from '../../UI/EmptyMessage';
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
import { PropertyCheckbox, PropertyField } from './PropertyFields';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { ChoiceProperty } from '../../BehaviorsEditor/Editors/Physics2Editor';
import Paper from '../../UI/Paper';
import CircularProgress from '../../UI/CircularProgress';
import SuccessFilled from '../../UI/CustomSvgIcons/SuccessFilled';
import ErrorFilled from '../../UI/CustomSvgIcons/ErrorFilled';
import ShieldChecked from '../../UI/CustomSvgIcons/ShieldChecked';
import { applyResourceDefaults } from '../../ResourcesList/ResourceUtils';
import { type ResourceSource } from '../../ResourcesList/ResourceSource';
import {
  validateModel3DRig,
  type Model3DRigValidationResult,
} from '../../ResourcesList/ResourcePreview/Model3DRigUtils';
import { Accordion, AccordionBody, AccordionHeader } from '../../UI/Accordion';

const gd: libGDevelop = global.gd;

// $FlowFixMe[underconstrained-implicit-instantiation]
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
  sharedAnimationModelsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sharedAnimationModelRow: {
    padding: '4px 8px',
  },
  sharedAnimationModelStatusIcon: {
    width: 20,
    height: 20,
  },
  animationNameFilter: {
    width: 320,
    maxWidth: '50%',
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

type SharedAnimationModelLoadState = {|
  gltf: GLTF | null,
  isLoading: boolean,
  hasError: boolean,
|};

const getAnimationSourceValue = (
  resourceName: string,
  animationName: string
): string => JSON.stringify([resourceName, animationName]);

const parseAnimationSourceValue = (
  value: string
): {| resourceName: string, animationName: string |} => {
  try {
    const parsedValue = JSON.parse(value);
    if (
      Array.isArray(parsedValue) &&
      parsedValue.length === 2 &&
      typeof parsedValue[0] === 'string' &&
      typeof parsedValue[1] === 'string'
    ) {
      return {
        resourceName: parsedValue[0],
        animationName: parsedValue[1],
      };
    }
  } catch (error) {
    // Values created before shared animation sources only contain a clip name.
  }
  return { resourceName: '', animationName: value };
};

const getRigMismatchDescription = (
  validation: Model3DRigValidationResult
): React.Node => {
  switch (validation.mismatchReason) {
    case 'missing-skeleton':
      return <Trans>No skeleton found</Trans>;
    case 'unnamed-bone':
      return <Trans>The rig has an unnamed bone</Trans>;
    case 'duplicate-bone-name':
      return <Trans>The rig has duplicate bone names</Trans>;
    case 'bone-count':
    case 'bone-names':
      return <Trans>{validation.differentBoneCount} bones differ</Trans>;
    case 'bone-hierarchy':
      return <Trans>Bone hierarchy differs</Trans>;
    case 'bind-pose':
      return <Trans>Bind pose differs</Trans>;
    default:
      return <Trans>The rigs are not compatible</Trans>;
  }
};

const SharedAnimationModelRow = ({
  resourceName,
  loadState,
  validation,
  onRemove,
}: {|
  resourceName: string,
  loadState: ?SharedAnimationModelLoadState,
  validation: ?Model3DRigValidationResult,
  onRemove: () => void,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const isLoading = !loadState || loadState.isLoading;
  const isValid = !!validation && validation.isMatching;
  const hasError = !!loadState && loadState.hasError;
  const animationCount =
    loadState && loadState.gltf ? loadState.gltf.animations.length : 0;

  return (
    <Paper
      variant="outlined"
      background="dark"
      style={styles.sharedAnimationModelRow}
    >
      <Line noMargin expand alignItems="center">
        <Column noMargin expand>
          <Text noMargin allowSelection allowBrowserAutoTranslate={false}>
            {resourceName}
          </Text>
          <Text noMargin size="body-small" color="secondary">
            {loadState && loadState.gltf ? (
              <React.Fragment>
                {animationCount} <Trans>animations</Trans>
              </React.Fragment>
            ) : isLoading ? (
              <Trans>Loading animations…</Trans>
            ) : (
              <Trans>Animations unavailable</Trans>
            )}
          </Text>
        </Column>
        <Line noMargin alignItems="center">
          {isLoading ? (
            <CircularProgress size={20} />
          ) : hasError ? (
            <React.Fragment>
              <ErrorFilled
                style={{
                  ...styles.sharedAnimationModelStatusIcon,
                  color: gdevelopTheme.message.error,
                }}
              />
              <Spacer />
              <Text noMargin color="error">
                <Trans>Unable to load model</Trans>
              </Text>
            </React.Fragment>
          ) : isValid ? (
            <React.Fragment>
              <SuccessFilled style={styles.sharedAnimationModelStatusIcon} />
              <Spacer />
              <Text noMargin>
                <Trans>Exact rig match</Trans>
              </Text>
            </React.Fragment>
          ) : validation ? (
            <React.Fragment>
              <ErrorFilled
                style={{
                  ...styles.sharedAnimationModelStatusIcon,
                  color: gdevelopTheme.message.error,
                }}
              />
              <Spacer />
              <Column noMargin>
                <Text noMargin color="error">
                  <Trans>Rig mismatch</Trans>
                </Text>
                <Text noMargin size="body-small" color="error">
                  {getRigMismatchDescription(validation)}
                </Text>
              </Column>
            </React.Fragment>
          ) : null}
          <Spacer />
          <IconButton size="small" onClick={onRemove}>
            <Trash />
          </IconButton>
        </Line>
      </Line>
    </Paper>
  );
};

export const hasLight = (layout: ?gd.Layout): boolean => {
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
  eventsFunctionsExtension,
  eventsBasedObject,
  object,
  onSizeUpdated,
  onObjectUpdated,
  resourceManagementProps,
  projectScopedContainersAccessor,
  renderObjectNameField,
}: EditorProps): React.Node => {
  const scrollView = React.useRef<?ScrollViewInterface>(null);

  const [
    justAddedAnimationName,
    setJustAddedAnimationName,
  ] = React.useState<?string>(null);
  const [animationNameFilter, setAnimationNameFilter] = React.useState<string>(
    ''
  );
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
  const sharedAnimationModelResourceNames = mapFor(
    0,
    model3DConfiguration.getSharedAnimationModelResourcesCount(),
    index => model3DConfiguration.getSharedAnimationModelResourceName(index)
  );
  const sharedAnimationModelResourcesKey = JSON.stringify(
    sharedAnimationModelResourceNames
  );

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

  // $FlowFixMe[value-as-type]
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

  const [
    sharedAnimationModelLoadStates,
    setSharedAnimationModelLoadStates,
  ] = React.useState<{
    [resourceName: string]: SharedAnimationModelLoadState,
  }>({});
  React.useEffect(
    () => {
      let isCancelled = false;
      const resourceNames: Array<string> = JSON.parse(
        sharedAnimationModelResourcesKey
      );
      setSharedAnimationModelLoadStates(previousStates => {
        const nextStates = {};
        for (const resourceName of resourceNames) {
          nextStates[resourceName] = previousStates[resourceName] || {
            gltf: null,
            isLoading: true,
            hasError: false,
          };
        }
        return nextStates;
      });

      resourceNames.forEach(resourceName => {
        PixiResourcesLoader.get3DModel(project, resourceName).then(
          loadedGltf => {
            if (isCancelled) return;
            setSharedAnimationModelLoadStates(previousStates => ({
              ...previousStates,
              [resourceName]: {
                gltf: loadedGltf,
                isLoading: false,
                hasError: false,
              },
            }));
          },
          () => {
            if (isCancelled) return;
            setSharedAnimationModelLoadStates(previousStates => ({
              ...previousStates,
              [resourceName]: {
                gltf: null,
                isLoading: false,
                hasError: true,
              },
            }));
          }
        );
      });
      return () => {
        isCancelled = true;
      };
    },
    [project, sharedAnimationModelResourcesKey]
  );

  const sharedAnimationModelRigValidations = React.useMemo<{
    [resourceName: string]: Model3DRigValidationResult,
  }>(
    () => {
      const validations = {};
      if (!gltf) return validations;

      const resourceNames: Array<string> = JSON.parse(
        sharedAnimationModelResourcesKey
      );
      for (const resourceName of resourceNames) {
        const loadState = sharedAnimationModelLoadStates[resourceName];
        if (loadState && loadState.gltf) {
          validations[resourceName] = validateModel3DRig(gltf, loadState.gltf);
        }
      }
      return validations;
    },
    [gltf, sharedAnimationModelLoadStates, sharedAnimationModelResourcesKey]
  );

  // $FlowFixMe[value-as-type]
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
    (event: any, index: number, newValue: string) => {
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
  const pendingScaleForReplacedModel = React.useRef<?number>(null);
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

  const setDimensionsFromModelSizeAndScale = React.useCallback(
    (newModelSize: { x: number, y: number, z: number }, scale: number) => {
      if (!Number.isFinite(scale)) {
        return;
      }
      const width = scale * newModelSize.x;
      const height = scale * newModelSize.y;
      const depth = scale * newModelSize.z;
      objectConfiguration.updateProperty('width', width.toString(10));
      objectConfiguration.updateProperty('height', height.toString(10));
      objectConfiguration.updateProperty('depth', depth.toString(10));
      onDimensionChange();
      forceUpdate();
    },
    [forceUpdate, objectConfiguration, onDimensionChange]
  );

  const setScale = React.useCallback(
    (scale: number) => {
      if (!modelSize) {
        return;
      }
      setDimensionsFromModelSizeAndScale(modelSize, scale);
    },
    [modelSize, setDimensionsFromModelSizeAndScale]
  );

  React.useEffect(
    () => {
      if (!modelSize || pendingScaleForReplacedModel.current === null) {
        return;
      }

      const scale = pendingScaleForReplacedModel.current;
      pendingScaleForReplacedModel.current = null;
      setDimensionsFromModelSizeAndScale(modelSize, scale);
    },
    [modelSize, setDimensionsFromModelSizeAndScale]
  );

  const modelResourceSources: Array<ResourceSource> = React.useMemo(
    () => {
      const storageProvider = resourceManagementProps.getStorageProvider();
      return resourceManagementProps.resourceSources
        .filter(source => source.kind === 'model3D')
        .filter(
          ({ onlyForStorageProvider }) =>
            !onlyForStorageProvider ||
            onlyForStorageProvider === storageProvider.internalName
        );
    },
    [resourceManagementProps]
  );

  const addSharedAnimationModels = React.useCallback(
    async () => {
      const initialResourceSource = modelResourceSources[0];
      if (!initialResourceSource) return;

      try {
        const {
          selectedResources,
          selectedSourceName,
        } = await resourceManagementProps.onChooseResource({
          initialSourceName: initialResourceSource.name,
          multiSelection: true,
          resourceKind: 'model3D',
        });
        if (!selectedResources.length) return;

        const selectedResourceSource = modelResourceSources.find(
          source => source.name === selectedSourceName
        );
        if (!selectedResourceSource) return;

        const selectedResourceNames = selectedResources.map(resource =>
          resource.getName()
        );
        let hasCreatedAnyResource = false;
        if (selectedResourceSource.shouldCreateResource) {
          selectedResources.forEach(resource => {
            applyResourceDefaults(project, resource);
            const hasCreatedResource = project
              .getResourcesManager()
              .addResource(resource);
            hasCreatedAnyResource = hasCreatedAnyResource || hasCreatedResource;
          });
          selectedResources.forEach(resource => resource.delete());
          if (hasCreatedAnyResource) {
            await resourceManagementProps.onFetchNewlyAddedResources();
            resourceManagementProps.onNewResourcesAdded();
          }
        }

        const primaryModelResourceName = properties
          .get('modelResourceName')
          .getValue();
        let hasAddedSharedModel = false;
        for (const resourceName of selectedResourceNames) {
          if (
            !resourceName ||
            resourceName === primaryModelResourceName ||
            model3DConfiguration.hasSharedAnimationModelResourceNamed(
              resourceName
            )
          ) {
            continue;
          }
          model3DConfiguration.addSharedAnimationModelResource(resourceName);
          hasAddedSharedModel = true;
        }
        if (!hasAddedSharedModel) return;

        forceUpdate();
        onSizeUpdated();
        if (onObjectUpdated) onObjectUpdated();
        resourceManagementProps.onResourceUsageChanged();
      } catch (error) {
        console.error('Unable to choose shared animation models', error);
      }
    },
    [
      forceUpdate,
      model3DConfiguration,
      modelResourceSources,
      onObjectUpdated,
      onSizeUpdated,
      project,
      properties,
      resourceManagementProps,
    ]
  );

  const removeSharedAnimationModel = React.useCallback(
    (resourceIndex: number, resourceName: string) => {
      model3DConfiguration.removeSharedAnimationModelResource(resourceIndex);
      for (
        let animationIndex = model3DConfiguration.getAnimationsCount() - 1;
        animationIndex >= 0;
        animationIndex--
      ) {
        if (
          model3DConfiguration
            .getAnimation(animationIndex)
            .getSourceModelResourceName() === resourceName
        ) {
          model3DConfiguration.removeAnimation(animationIndex);
        }
      }
      forceUpdate();
      onSizeUpdated();
      if (onObjectUpdated) onObjectUpdated();
      resourceManagementProps.onResourceUsageChanged();
    },
    [
      forceUpdate,
      model3DConfiguration,
      onObjectUpdated,
      onSizeUpdated,
      resourceManagementProps,
    ]
  );

  const animationSourceModels: Array<{|
    resourceName: string,
    resourceLabel: string,
    gltf: GLTF,
  |}> = React.useMemo(
    () => {
      if (!gltf) return [];
      const primaryModelResourceName = properties
        .get('modelResourceName')
        .getValue();
      const sourceModels = [
        {
          resourceName: '',
          resourceLabel: primaryModelResourceName,
          gltf,
        },
      ];
      const resourceNames: Array<string> = JSON.parse(
        sharedAnimationModelResourcesKey
      );
      for (const resourceName of resourceNames) {
        const loadState = sharedAnimationModelLoadStates[resourceName];
        const validation = sharedAnimationModelRigValidations[resourceName];
        if (
          loadState &&
          loadState.gltf &&
          validation &&
          validation.isMatching
        ) {
          sourceModels.push({
            resourceName,
            resourceLabel: resourceName,
            gltf: loadState.gltf,
          });
        }
      }
      return sourceModels;
    },
    [
      gltf,
      properties,
      sharedAnimationModelLoadStates,
      sharedAnimationModelResourcesKey,
      sharedAnimationModelRigValidations,
    ]
  );

  const scanNewAnimations = React.useCallback(
    () => {
      if (!animationSourceModels.length) {
        return;
      }
      setNameErrors({});

      const animationSources = mapFor(
        0,
        model3DConfiguration.getAnimationsCount(),
        animationIndex => {
          const animation = model3DConfiguration.getAnimation(animationIndex);
          return getAnimationSourceValue(
            animation.getSourceModelResourceName(),
            animation.getSource()
          );
        }
      );

      let hasAddedAnimation = false;
      for (const sourceModel of animationSourceModels) {
        for (const resourceAnimation of sourceModel.gltf.animations) {
          const animationSource = getAnimationSourceValue(
            sourceModel.resourceName,
            resourceAnimation.name
          );
          if (animationSources.includes(animationSource)) {
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
          newAnimation.setSourceModelResourceName(sourceModel.resourceName);
          model3DConfiguration.addAnimation(newAnimation);
          newAnimation.delete();
          animationSources.push(animationSource);
          hasAddedAnimation = true;
        }
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
          message: t`Every animation from the compatible GLB files is already in the list.`,
        });
      }
    },
    [
      forceUpdate,
      animationSourceModels,
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
    // $FlowFixMe[missing-local-annot]
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
    // $FlowFixMe[missing-local-annot]
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
      if (object) {
        if (layout) {
          gd.WholeProjectRefactorer.renameObjectAnimationInScene(
            project,
            layout,
            object,
            currentName,
            newName
          );
        } else if (eventsFunctionsExtension && eventsBasedObject) {
          gd.WholeProjectRefactorer.renameObjectAnimationInEventsBasedObject(
            project,
            eventsFunctionsExtension,
            eventsBasedObject,
            object,
            currentName,
            newName
          );
        }
      }
      forceUpdate();
      if (onObjectUpdated) onObjectUpdated();
    },
    [
      model3DConfiguration,
      layout,
      object,
      eventsFunctionsExtension,
      eventsBasedObject,
      forceUpdate,
      onObjectUpdated,
      nameErrors,
      project,
    ]
  );

  const sourceSelectOptions = [];
  const primaryModelResourceName = properties
    .get('modelResourceName')
    .getValue();
  for (const sourceModel of animationSourceModels) {
    sourceModel.gltf.animations.forEach((animation, animationIndex) => {
      const animationLabel =
        animation.name || `Animation ${animationIndex + 1}`;
      const value = getAnimationSourceValue(
        sourceModel.resourceName,
        animation.name
      );
      sourceSelectOptions.push(
        <SelectOption
          key={`${value}-${animationIndex}`}
          value={value}
          label={`${sourceModel.resourceLabel} · ${animationLabel}`}
          shouldNotTranslate
        />
      );
    });
  }

  const normalizedAnimationNameFilter = animationNameFilter
    .trim()
    .toLowerCase();
  const animationsCount = model3DConfiguration.getAnimationsCount();
  const filteredAnimationIndexes = mapFor(
    0,
    animationsCount,
    animationIndex => animationIndex
  ).filter(animationIndex =>
    model3DConfiguration
      .getAnimation(animationIndex)
      .getName()
      .toLowerCase()
      .includes(normalizedAnimationNameFilter)
  );

  return (
    <>
      <ScrollView ref={scrollView}>
        <ColumnStackLayout noMargin>
          {renderObjectNameField && renderObjectNameField()}
          <ResourceSelectorWithThumbnail
            project={project}
            resourceKind="model3D"
            floatingLabelText={properties.get('modelResourceName').getLabel()}
            resourceManagementProps={resourceManagementProps}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            resourceName={primaryModelResourceName}
            onChange={newValue => {
              pendingScaleForReplacedModel.current =
                scale !== null && Number.isFinite(scale) ? scale : 1;
              onChangeProperty('modelResourceName', newValue);
              for (
                let resourceIndex =
                  model3DConfiguration.getSharedAnimationModelResourcesCount() -
                  1;
                resourceIndex >= 0;
                resourceIndex--
              ) {
                if (
                  model3DConfiguration.getSharedAnimationModelResourceName(
                    resourceIndex
                  ) === newValue
                ) {
                  model3DConfiguration.removeSharedAnimationModelResource(
                    resourceIndex
                  );
                }
              }
              for (
                let animationIndex = 0;
                animationIndex < model3DConfiguration.getAnimationsCount();
                animationIndex++
              ) {
                const animation = model3DConfiguration.getAnimation(
                  animationIndex
                );
                if (animation.getSourceModelResourceName() === newValue) {
                  animation.setSourceModelResourceName('');
                }
              }
              loadGltf(newValue);
              forceUpdate();
            }}
            id={`model3d-object-modelResourceName`}
          />
          <Accordion noMargin costlyBody>
            <AccordionHeader
              noMargin
              actions={[
                <FlatButton
                  key="add-shared-animation-models"
                  label={<Trans>Add models</Trans>}
                  leftIcon={<Add />}
                  primary
                  disabled={!modelResourceSources.length}
                  onClick={addSharedAnimationModels}
                />,
              ]}
            >
              <Column noMargin expand>
                <Text size="block-title" noMargin>
                  <Trans>Share animations from models (optional)</Trans>
                </Text>
                <Text size="body-small" color="secondary" noMargin>
                  <Trans>
                    Reuse animations from GLB models with the same rig.
                  </Trans>
                </Text>
              </Column>
            </AccordionHeader>
            <AccordionBody disableGutters>
              <Column noMargin expand>
                {sharedAnimationModelResourceNames.length > 0 && (
                  <React.Fragment>
                    <div style={styles.sharedAnimationModelsList}>
                      {sharedAnimationModelResourceNames.map(
                        (resourceName, resourceIndex) => (
                          <SharedAnimationModelRow
                            key={resourceName}
                            resourceName={resourceName}
                            loadState={
                              sharedAnimationModelLoadStates[resourceName]
                            }
                            validation={
                              sharedAnimationModelRigValidations[resourceName]
                            }
                            onRemove={() =>
                              removeSharedAnimationModel(
                                resourceIndex,
                                resourceName
                              )
                            }
                          />
                        )
                      )}
                    </div>
                    <AlertMessage
                      kind="info"
                      renderLeftIcon={() => <ShieldChecked />}
                    >
                      <Trans>
                        Rig validation checks bone names, hierarchy, and bind
                        pose against
                      </Trans>{' '}
                      {primaryModelResourceName}.
                    </AlertMessage>
                  </React.Fragment>
                )}
              </Column>
            </AccordionBody>
          </Accordion>
          <Text size="block-title" noMargin>
            <Trans>Default orientation</Trans>
          </Text>
          <ResponsiveLineStackLayout
            noResponsiveLandscape
            expand
            noColumnMargin
          >
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
          <ResponsiveLineStackLayout
            noResponsiveLandscape
            expand
            noColumnMargin
          >
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
          <ResponsiveLineStackLayout
            noResponsiveLandscape
            expand
            noColumnMargin
          >
            <ChoiceProperty
              properties={properties}
              propertyName={'originLocation'}
              onUpdate={onOriginLocationChange}
            />
            <ChoiceProperty
              properties={properties}
              propertyName={'centerLocation'}
              onUpdate={(e, i, newValue: string) => {
                onChangeProperty('centerLocation', newValue);
              }}
            />
          </ResponsiveLineStackLayout>
          <Text size="block-title">Lighting</Text>
          <ChoiceProperty
            properties={properties}
            propertyName={'materialType'}
            onUpdate={(e, i, newValue: string) => {
              onChangeProperty('materialType', newValue);
            }}
          />
          {properties.get('materialType').getValue() !== 'Basic' &&
            !hasLight(layout) && (
              <AlertMessage kind="error">
                <Trans>
                  Make sure to set up a light in the effects of the layer or
                  choose "No lighting effect" - otherwise the object will appear
                  black.
                </Trans>
              </AlertMessage>
            )}
          <PropertyCheckbox
            objectConfiguration={objectConfiguration}
            propertyName="isCastingShadow"
          />
          <PropertyCheckbox
            objectConfiguration={objectConfiguration}
            propertyName="isReceivingShadow"
          />
          <Line noMargin alignItems="center">
            <Text size="block-title">
              <Trans>Animations</Trans> ({animationsCount})
            </Text>
            <Spacer />
            <SemiControlledTextField
              id="model3d-animation-name-filter"
              margin="none"
              value={animationNameFilter}
              onChange={setAnimationNameFilter}
              translatableHintText={t`Filter animations by name`}
              style={styles.animationNameFilter}
              disabled={animationsCount === 0}
            />
          </Line>
          <Column noMargin expand>
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="crossfadeDuration"
            />
          </Column>
          <Column noMargin expand useFullHeight>
            {animationsCount === 0 ? (
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
                {filteredAnimationIndexes.length === 0 ? (
                  <EmptyMessage>
                    <Trans>No animations match this filter.</Trans>
                  </EmptyMessage>
                ) : (
                  filteredAnimationIndexes.map(animationIndex => {
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
                                  value={getAnimationSourceValue(
                                    animation.getSourceModelResourceName(),
                                    animation.getSource()
                                  )}
                                  onChange={(event, value) => {
                                    const source = parseAnimationSourceValue(
                                      event.target.value
                                    );
                                    animation.setSource(source.animationName);
                                    animation.setSourceModelResourceName(
                                      source.resourceName
                                    );
                                    forceUpdate();
                                  }}
                                  margin="dense"
                                  fullWidth
                                  floatingLabelText={
                                    <Trans>GLB animation source</Trans>
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
                                <Checkbox
                                  label={<Trans>Root motion</Trans>}
                                  checked={animation.shouldUseRootMotion()}
                                  onCheck={(e, checked) => {
                                    animation.setShouldUseRootMotion(checked);
                                    forceUpdate();
                                  }}
                                />
                              </ColumnStackLayout>
                            </div>
                          )
                        }
                      </DragSourceAndDropTarget>
                    );
                  })
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
          noResponsiveLandscape
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
