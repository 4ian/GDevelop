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
import { Column, Line, Spacer } from '../../UI/Grid';
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
import IconButton from '../../UI/IconButton';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import { mapFor } from '../../Utils/MapFor';
import { showWarningBox } from '../../UI/Messages/MessageBox';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import Add from '../../UI/CustomSvgIcons/Add';
import Trash from '../../UI/CustomSvgIcons/Trash';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import { DragHandleIcon } from '../../UI/DragHandle';
import DropIndicator from '../../UI/SortableVirtualizedItemList/DropIndicator';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

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

const Model3DEditor = ({
  objectConfiguration,
  project,
  layout,
  object,
  onSizeUpdated,
  onObjectUpdated,
  resourceManagementProps,
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

  const draggedAnimationIndex = React.useRef<?number>(null);

  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const forceUpdate = useForceUpdate();

  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );

  const model3DConfiguration = gd.asModel3DConfiguration(objectConfiguration);
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const scanNewAnimation = React.useCallback(() => {
    // TODO
  }, []);

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

  const removeAnimation = React.useCallback(
    animationIndex => {
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
      if (!draggedIndex) return;

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
      if (nameErrors[animation.ptr]) {
        const newNameErrors = { ...nameErrors };
        delete newNameErrors[animation.ptr];
        setNameErrors(newNameErrors);
      }

      if (newName !== '' && model3DConfiguration.hasAnimationNamed(newName)) {
        setNameErrors({
          ...nameErrors,
          [animation.ptr]: (
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
                        key={animation.ptr}
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
                              key={animation.ptr}
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
                                      <Spacer />
                                      <DragHandleIcon />
                                      <Spacer />
                                    </span>
                                  )}
                                  <Text noMargin noShrink>
                                    <Trans>Animation #{animationIndex}</Trans>
                                  </Text>
                                  <Spacer />
                                  <SemiControlledTextField
                                    margin="none"
                                    commitOnBlur
                                    errorText={nameErrors[animation.ptr]}
                                    translatableHintText={t`Optional animation name`}
                                    value={animation.getName()}
                                    onChange={text =>
                                      changeAnimationName(animationIndex, text)
                                    }
                                    fullWidth
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={removeAnimation}
                                  >
                                    <Trash />
                                  </IconButton>
                                </Line>
                                <Spacer />
                              </div>
                              <Line expand>
                                <Column expand>
                                  <SemiControlledTextField
                                    commitOnBlur
                                    floatingLabelFixed
                                    floatingLabelText={
                                      <Trans>GLB animation name</Trans>
                                    }
                                    onChange={value => {
                                      animation.setSource(value);
                                      forceUpdate();
                                    }}
                                    value={animation.getSource()}
                                  />
                                </Column>
                              </Line>
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
            onClick={scanNewAnimation}
            icon={<Add />}
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
