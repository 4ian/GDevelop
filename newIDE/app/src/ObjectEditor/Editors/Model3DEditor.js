// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type EditorProps } from './EditorProps.flow';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import Checkbox from '../../UI/Checkbox';
import { Column, Line } from '../../UI/Grid';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import { MarkdownText } from '../../UI/MarkdownText';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import MeasurementUnitDocumentation from '../../PropertiesEditor/MeasurementUnitDocumentation';
import { getMeasurementUnitShortLabel } from '../../PropertiesEditor/PropertiesMapToSchema';
import AlertMessage from '../../UI/AlertMessage';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import ResourcesLoader from '../../ResourcesLoader';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import IconButton from '../../UI/IconButton';
import RaisedButton from '../../UI/RaisedButton';
import { mapFor } from '../../Utils/MapFor';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import DragHandle from '../../UI/DragHandle';
import { showWarningBox } from '../../UI/Messages/MessageBox';
import Window from '../../Utils/Window';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import Add from '../../UI/CustomSvgIcons/Add';
import Trash from '../../UI/CustomSvgIcons/Trash';

const gd: libGDevelop = global.gd;

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

type PropertyFieldProps = {|
  objectConfiguration: gdObjectConfiguration,
  propertyName: string,
|};

const PropertyField = ({
  objectConfiguration,
  propertyName,
}: PropertyFieldProps) => {
  const forceUpdate = useForceUpdate();
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const property = properties.get(propertyName);
  const measurementUnit = property.getMeasurementUnit();
  const endAdornment = {
    label: getMeasurementUnitShortLabel(measurementUnit),
    tooltipContent: (
      <MeasurementUnitDocumentation
        label={measurementUnit.getLabel()}
        description={measurementUnit.getDescription()}
        elementsWithWords={measurementUnit.getElementsWithWords()}
      />
    ),
  };
  return (
    <Column noMargin expand key={propertyName}>
      <SemiControlledTextField
        commitOnBlur
        floatingLabelFixed
        floatingLabelText={property.getLabel()}
        onChange={value => onChangeProperty(propertyName, value)}
        value={property.getValue()}
        endAdornment={
          <Tooltip title={endAdornment.tooltipContent}>
            <InputAdornment position="end">{endAdornment.label}</InputAdornment>
          </Tooltip>
        }
      />
    </Column>
  );
};

const PropertyCheckbox = ({
  objectConfiguration,
  propertyName,
}: PropertyFieldProps) => {
  const forceUpdate = useForceUpdate();
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const property = properties.get(propertyName);
  return (
    <Checkbox
      checked={property.getValue() === 'true'}
      label={
        <React.Fragment>
          <Line noMargin>{property.getLabel()}</Line>
          <FormHelperText style={{ display: 'inline' }}>
            <MarkdownText source={property.getDescription()} />
          </FormHelperText>
        </React.Fragment>
      }
      onCheck={(_, value) => {
        onChangeProperty(propertyName, value ? '1' : '0');
      }}
    />
  );
};

type PropertyResourceSelectorProps = {|
  objectConfiguration: gdObjectConfiguration,
  propertyName: string,
  project: gd.Project,
  resourceManagementProps: ResourceManagementProps,
|};

const PropertyResourceSelector = ({
  objectConfiguration,
  propertyName,
  project,
  resourceManagementProps,
}: PropertyResourceSelectorProps) => {
  const forceUpdate = useForceUpdate();
  const { current: resourcesLoader } = React.useRef(ResourcesLoader);
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const property = properties.get(propertyName);
  const extraInfos = property.getExtraInfo();
  return (
    <ResourceSelector
      project={project}
      // $FlowExpectedError
      resourceKind={extraInfos.size() > 0 ? extraInfos.at(0) : ''}
      floatingLabelText={property.getLabel()}
      resourceManagementProps={resourceManagementProps}
      initialResourceName={property.getValue()}
      onChange={value => onChangeProperty(propertyName, value)}
      resourcesLoader={resourcesLoader}
      fullWidth
    />
  );
};

const styles = {
  animationLine: {
    // Use a non standard spacing because:
    // - The SortableAnimationsList won't work with <Spacer /> or <LargeSpacer /> between elements.
    // - We need to visually show a difference between animations.
    marginBottom: 16,
  },
};

type AnimationProps = {|
  animation: gdModel3DAnimation,
  id: number,
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onRemove: () => void,
  resourcesLoader: typeof ResourcesLoader,
  onChangeName: string => void,
|};

const Animation = ({
  animation,
  id,
  project,
  onRemove,
  resourceManagementProps,
  resourcesLoader,
  onChangeName,
}: AnimationProps) => {
  const forceUpdate = useForceUpdate();

  return (
    <div style={styles.animationLine}>
      <Column expand noMargin>
        <MiniToolbar noPadding>
          <DragHandle />
          <MiniToolbarText>{<Trans>Animation #{id}</Trans>}</MiniToolbarText>
          <Column expand>
            <SemiControlledTextField
              commitOnBlur
              margin="none"
              value={animation.getName()}
              translatableHintText={t`Optional animation name`}
              onChange={text => onChangeName(text)}
              fullWidth
            />
          </Column>
          <IconButton size="small" onClick={onRemove}>
            <Trash />
          </IconButton>
        </MiniToolbar>
        <Column noMargin expand key="animation-source">
          <SemiControlledTextField
            commitOnBlur
            floatingLabelFixed
            floatingLabelText={<Trans>LGB animation name</Trans>}
            onChange={value => {
              animation.setSource(value);
              forceUpdate();
            }}
            value={animation.getSource()}
          />
        </Column>
      </Column>
    </div>
  );
};

const SortableAnimation = SortableElement(Animation);

const SortableAnimationsList = SortableContainer(
  ({
    objectConfiguration,
    onAddAnimation,
    onRemoveAnimation,
    onChangeAnimationName,
    project,
    resourcesLoader,
    resourceManagementProps,
    extraBottomTools,
  }) => {
    // TODO Fix drag and drop

    // Note that it's important to have <ScrollView> *inside* this
    // component, otherwise the sortable list won't work (because the
    // SortableContainer would not find a root div to use).
    return mapFor(0, objectConfiguration.getAnimationsCount(), i => {
      const animation = objectConfiguration.getAnimation(i);
      return (
        <SortableAnimation
          key={i}
          index={i}
          id={i}
          animation={animation}
          project={project}
          resourcesLoader={resourcesLoader}
          resourceManagementProps={resourceManagementProps}
          onRemove={() => onRemoveAnimation(i)}
          onChangeName={newName => onChangeAnimationName(i, newName)}
        />
      );
    });
  }
);

type AnimationsListContainerProps = {|
  objectConfiguration: gdModel3DObjectConfiguration,
  project: gdProject,
  layout?: gdLayout,
  object?: gdObject,
  resourceManagementProps: ResourceManagementProps,
  resourcesLoader: typeof ResourcesLoader,
  onSizeUpdated: () => void,
  onObjectUpdated?: () => void,
  addAnimation: () => void,
|};

const AnimationsListContainer = ({
  objectConfiguration,
  project,
  layout,
  object,
  resourceManagementProps,
  resourcesLoader,
  onSizeUpdated,
  onObjectUpdated,
  addAnimation,
}: AnimationsListContainerProps) => {
  const forceUpdate = useForceUpdate();

  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }) => {
      objectConfiguration.moveAnimation(oldIndex, newIndex);
      forceUpdate();
    },
    [forceUpdate, objectConfiguration]
  );

  const removeAnimation = React.useCallback(
    i => {
      const answer = Window.showConfirmDialog(
        'Are you sure you want to remove this animation?'
      );

      if (answer) {
        objectConfiguration.removeAnimation(i);
        forceUpdate();
        onSizeUpdated();
        if (onObjectUpdated) onObjectUpdated();
      }
    },
    [forceUpdate, onObjectUpdated, onSizeUpdated, objectConfiguration]
  );

  const changeAnimationName = React.useCallback(
    (i, newName) => {
      const currentName = objectConfiguration.getAnimation(i).getName();
      if (currentName === newName) return;

      const otherNames = mapFor(
        0,
        objectConfiguration.getAnimationsCount(),
        index => {
          return index === i
            ? undefined // Don't check the current animation name as we're changing it.
            : currentName;
        }
      );

      if (
        newName !== '' &&
        otherNames.filter(name => name === newName).length
      ) {
        showWarningBox(
          'Another animation with this name already exists. Please use another name.',
          { delayToNextTick: true }
        );
        return;
      }

      const animation = objectConfiguration.getAnimation(i);
      const oldName = animation.getName();
      animation.setName(newName);
      // TODO EBO Refactor event-based object events when an animation is renamed.
      if (layout && object) {
        gd.WholeProjectRefactorer.renameObjectAnimation(
          project,
          layout,
          object,
          oldName,
          newName
        );
      }
      forceUpdate();
      if (onObjectUpdated) onObjectUpdated();
    },
    [forceUpdate, layout, object, onObjectUpdated, project, objectConfiguration]
  );

  return (
    <Column noMargin expand useFullHeight>
      {objectConfiguration.getAnimationsCount() === 0 ? (
        <Column noMargin expand justifyContent="center">
          <EmptyPlaceholder
            title={<Trans>Add your first animation</Trans>}
            description={<Trans>Animations are a sequence of images.</Trans>}
            actionLabel={<Trans>Add an animation</Trans>}
            helpPagePath="/objects/sprite"
            tutorialId="intermediate-changing-animations"
            onAction={addAnimation}
          />
        </Column>
      ) : (
        <React.Fragment>
          <SortableAnimationsList
            objectConfiguration={objectConfiguration}
            helperClass="sortable-helper"
            project={project}
            onSortEnd={onSortEnd}
            onChangeAnimationName={changeAnimationName}
            onRemoveAnimation={removeAnimation}
            resourcesLoader={resourcesLoader}
            resourceManagementProps={resourceManagementProps}
            useDragHandle
            lockAxis="y"
            axis="y"
            onSpriteUpdated={onObjectUpdated}
          />
        </React.Fragment>
      )}
    </Column>
  );
};

const Model3DEditor = ({
  objectConfiguration,
  project,
  layout,
  object,
  onSizeUpdated,
  onObjectUpdated,
  resourceManagementProps,
}: EditorProps) => {
  const forceUpdate = useForceUpdate();
  const model3DConfiguration = gd.asModel3DConfiguration(objectConfiguration);
  const properties = objectConfiguration.getProperties();

  const scrollView = React.useRef<?ScrollViewInterface>(null);

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const addAnimation = React.useCallback(
    () => {
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

  return (
    <>
      <ScrollView ref={scrollView}>
        <ColumnStackLayout noMargin>
          <PropertyResourceSelector
            objectConfiguration={objectConfiguration}
            propertyName="modelResourceName"
            project={project}
            resourceManagementProps={resourceManagementProps}
          />
          <Text size="block-title" noMargin>
            <Trans>Default orientation</Trans>
          </Text>
          <ResponsiveLineStackLayout expand noColumnMargin>
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="rotationX"
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="rotationY"
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="rotationZ"
            />
          </ResponsiveLineStackLayout>
          <Text size="block-title" noMargin>
            <Trans>Default size</Trans>
          </Text>
          <ResponsiveLineStackLayout expand noColumnMargin>
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="width"
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="height"
            />
            <PropertyField
              objectConfiguration={objectConfiguration}
              propertyName="depth"
            />
          </ResponsiveLineStackLayout>
          <ColumnStackLayout noMargin expand>
            <PropertyCheckbox
              objectConfiguration={objectConfiguration}
              propertyName="keepAspectRatio"
            />
            <SelectField
              value={properties.get('materialType').getValue()}
              floatingLabelText={properties.get('materialType').getLabel()}
              helperMarkdownText={properties
                .get('materialType')
                .getDescription()}
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
                    chose "No lighting effect" - otherwise the object will
                    appear black.
                  </Trans>
                </AlertMessage>
              )}
          </ColumnStackLayout>
          <Text size="block-title">Animations</Text>
          <AnimationsListContainer
            objectConfiguration={model3DConfiguration}
            resourcesLoader={ResourcesLoader}
            resourceManagementProps={resourceManagementProps}
            project={project}
            layout={layout}
            object={object}
            onSizeUpdated={onSizeUpdated}
            onObjectUpdated={onObjectUpdated}
            addAnimation={addAnimation}
          />
        </ColumnStackLayout>
      </ScrollView>
      <Column noMargin>
        <ResponsiveLineStackLayout
          justifyContent="space-between"
          noColumnMargin
        >
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
