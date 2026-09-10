// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Checkbox from '../../../UI/Checkbox';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import { type BehaviorEditorProps } from '../BehaviorEditorProps.flow';
import Text from '../../../UI/Text';
import DismissableAlertMessage from '../../../UI/DismissableAlertMessage';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { CompactBitmaskField } from '../../../UI/CompactBitmaskField';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import {
  NumericProperty,
  UnitAdornment,
  ChoiceProperty,
} from '../Physics2Editor';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '../../../UI/Accordion';
import { mapFor } from '../../../Utils/MapFor';
import ResourceSelectorWithThumbnail from '../../../ResourcesList/ResourceSelectorWithThumbnail';
import PixiResourcesLoader from '../../../ObjectsRendering/PixiResourcesLoader';
import { type GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import AlertMessage from '../../../UI/AlertMessage';

const gd: libGDevelop = global.gd;

type Props = BehaviorEditorProps;

const areAdvancedPropertiesModified = (
  propertiesValues: gdMapStringPropertyDescriptor,
  getPropertyDefaultValue: (propertyName: string) => string
) => {
  const propertyNames = propertiesValues.keys();
  let hasFoundModifiedAdvancedProperty = false;
  mapFor(0, propertyNames.size(), i => {
    const name = propertyNames.at(i);
    const property = propertiesValues.get(name);
    const currentValue = property.getValue();
    const defaultValue = getPropertyDefaultValue(name);

    // Some boolean properties can be set to an empty string to mean false.
    const hasDefaultValue =
      property.getType().toLowerCase() === 'boolean'
        ? (currentValue === 'true') === (defaultValue === 'true')
        : currentValue === defaultValue;
    if (property.isAdvanced() && !hasDefaultValue) {
      hasFoundModifiedAdvancedProperty = true;
    }
  });
  return hasFoundModifiedAdvancedProperty;
};

const Physics3DEditor = (props: Props): React.Node => {
  const {
    object,
    behaviors,
    onBehaviorUpdated,
    project,
    projectScopedContainersAccessor,
    resourceManagementProps,
  } = props;
  const behavior = behaviors[0];
  const forceUpdate = useForceUpdate();

  const areAdvancedPropertiesExpandedByDefault = React.useMemo(
    () => {
      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        gd.JsPlatform.get(),
        behavior.getTypeName()
      );
      return areAdvancedPropertiesModified(
        behavior.getProperties(),
        propertyName => {
          const properties = behaviorMetadata.getProperties();
          return properties.has(propertyName)
            ? properties.get(propertyName).getValue()
            : '';
        }
      );
    },
    [behavior]
  );

  const updateBehaviorProperty = React.useCallback(
    (property: string, value: string) => {
      behavior.updateProperty(property, value);
      forceUpdate();
      onBehaviorUpdated();
    },
    [behavior, forceUpdate, onBehaviorUpdated]
  );

  const properties = behavior.getProperties();
  const shape = properties.get('shape').getValue();
  const layersValues = parseInt(properties.get('layers').getValue(), 10);
  const masksValues = parseInt(properties.get('masks').getValue(), 10);

  const isStatic = properties.get('bodyType').getValue() === 'Static';

  // The property is hidden for the shapes that can't be oriented.
  const canShapeBeOriented = !properties.get('shapeOrientation').isHidden();

  // $FlowFixMe[value-as-type]
  const [gltf, setGltf] = React.useState<GLTF | null>(null);
  const loadGltf = React.useCallback(
    async (modelResourceName: string) => {
      if (
        !modelResourceName &&
        object &&
        object.getType() === 'Scene3D::Model3DObject'
      ) {
        const model3DConfiguration = gd.asModel3DConfiguration(
          object.getConfiguration()
        );
        modelResourceName = model3DConfiguration
          .getProperties()
          .get('modelResourceName')
          .getValue();
      }
      const newModel3d = await PixiResourcesLoader.get3DModel(
        project,
        modelResourceName
      );
      setGltf(newModel3d);
    },
    [object, project]
  );
  if (!gltf) {
    loadGltf(properties.get('meshShapeResourceName').getValue());
  }

  const meshShapeTrianglesCount = React.useMemo<number>(
    () => {
      if (!gltf) {
        return 0;
      }
      let triangleCount = 0;
      gltf.scene.traverse(object3d => {
        // $FlowFixMe[value-as-type]
        const mesh = (object3d: THREE.Mesh);
        if (!mesh.isMesh) {
          return;
        }
        const index = mesh.geometry.getIndex();
        const positionAttribute = mesh.geometry.getAttribute('position');
        triangleCount += Math.floor(
          (index ? index : positionAttribute).count / 3
        );
      });
      return triangleCount;
    },
    [gltf]
  );

  return (
    <Column
      expand
      // Avoid overflow on small screens
      noOverflowParent
    >
      <Line>
        <ChoiceProperty
          id="physics3d-parameter-body-type"
          properties={properties}
          propertyName={'bodyType'}
          onUpdate={(e, i, newValue: string) => {
            updateBehaviorProperty('bodyType', newValue);
          }}
        />
      </Line>
      <ResponsiveLineStackLayout>
        <Checkbox
          label={properties.get('bullet').getLabel()}
          checked={properties.get('bullet').getValue() === 'true'}
          onCheck={(e, checked) =>
            updateBehaviorProperty('bullet', checked ? '1' : '0')
          }
        />
        <Checkbox
          label={properties.get('fixedRotation').getLabel()}
          checked={properties.get('fixedRotation').getValue() === 'true'}
          onCheck={(e, checked) =>
            updateBehaviorProperty('fixedRotation', checked ? '1' : '0')
          }
        />
      </ResponsiveLineStackLayout>
      <Line>
        <DismissableAlertMessage
          identifier="physics2-shape-collisions"
          kind="info"
        >
          <Trans>
            The shape used in the Physics behavior is independent from the
            collision mask of the object. Be sure to use the "Collision"
            condition provided by the Physics behavior in the events. The usual
            "Collision" condition won't take into account the shape that you've
            set up here.
          </Trans>
        </DismissableAlertMessage>
      </Line>
      <ResponsiveLineStackLayout>
        <ChoiceProperty
          id="physics3d-parameter-shape"
          properties={properties}
          propertyName={'shape'}
          onUpdate={(e, i, newValue: string) => {
            updateBehaviorProperty('shape', newValue);
          }}
        />
        {shape !== 'Mesh' && (
          <ChoiceProperty
            id="physics3d-parameter-shape-orientation"
            properties={properties}
            propertyName={'shapeOrientation'}
            value={
              canShapeBeOriented
                ? properties.get('shapeOrientation').getValue()
                : 'Z'
            }
            onUpdate={(e, i, newValue: string) =>
              updateBehaviorProperty('shapeOrientation', newValue)
            }
            disabled={!canShapeBeOriented}
          />
        )}
      </ResponsiveLineStackLayout>
      {shape === 'Mesh' &&
        object &&
        object.getType() !== 'Scene3D::Model3DObject' && (
          <Line>
            <AlertMessage kind="error">
              <Trans>
                Mesh shapes are only supported for 3D model objects.
              </Trans>
            </AlertMessage>
          </Line>
        )}
      {shape !== 'Mesh' && (
        <ResponsiveLineStackLayout>
          {/* Labels and visibility are given by the properties themselves,
              as they depend on the shape. */}
          {['shapeDimensionA', 'shapeDimensionB', 'shapeDimensionC']
            .filter(propertyName => !properties.get(propertyName).isHidden())
            .map(propertyName => (
              <SemiControlledTextField
                fullWidth
                value={properties.get(propertyName).getValue()}
                key={propertyName}
                floatingLabelText={properties.get(propertyName).getLabel()}
                min={0}
                onChange={newValue =>
                  updateBehaviorProperty(propertyName, newValue)
                }
                type="number"
                endAdornment={
                  <UnitAdornment property={properties.get(propertyName)} />
                }
              />
            ))}
        </ResponsiveLineStackLayout>
      )}
      {shape === 'Mesh' && (
        <React.Fragment>
          <ResourceSelectorWithThumbnail
            project={project}
            resourceKind="model3D"
            floatingLabelText={properties
              .get('meshShapeResourceName')
              .getLabel()}
            resourceManagementProps={resourceManagementProps}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            resourceName={properties.get('meshShapeResourceName').getValue()}
            onChange={newValue => {
              updateBehaviorProperty('meshShapeResourceName', newValue);
              loadGltf(newValue);
              forceUpdate();
            }}
            id={`physics3d-parameter-mesh-shape-resource-name`}
          />
          {meshShapeTrianglesCount > 10000 && (
            <Line>
              <AlertMessage kind="warning">
                <Trans>
                  The model has {meshShapeTrianglesCount} triangles. To keep
                  good performance, consider making a simplified model with a
                  modeling tool.
                </Trans>
              </AlertMessage>
            </Line>
          )}
        </React.Fragment>
      )}
      <ResponsiveLineStackLayout>
        <NumericProperty
          id="physics3d-parameter-density"
          properties={properties}
          propertyName={'density'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'density',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
        <NumericProperty
          id="physics3d-parameter-mass-override"
          properties={properties}
          propertyName={'massOverride'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'massOverride',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
        <NumericProperty
          properties={properties}
          propertyName={'gravityScale'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty('gravityScale', newValue)
          }
        />
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'friction'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'friction',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
        <NumericProperty
          properties={properties}
          propertyName={'restitution'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'restitution',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'linearDamping'}
          step={0.05}
          onUpdate={newValue =>
            updateBehaviorProperty('linearDamping', newValue)
          }
        />
        <NumericProperty
          id="physics3d-parameter-angular-damping"
          properties={properties}
          propertyName={'angularDamping'}
          step={0.05}
          onUpdate={newValue =>
            updateBehaviorProperty('angularDamping', newValue)
          }
        />
      </ResponsiveLineStackLayout>
      <Line expand>
        <ColumnStackLayout expand noMargin>
          {/* Static and moving objects don't use the same layers, so only
              the ones of the current body type are shown. */}
          <CompactBitmaskField
            label={properties.get('layers').getLabel()}
            markdownDescription={properties.get('layers').getDescription()}
            value={layersValues}
            firstBit={isStatic ? 0 : 4}
            bitCount={4}
            onChange={newValue =>
              updateBehaviorProperty('layers', newValue.toString(10))
            }
          />
          {!properties.get('masks').isHidden() && (
            <CompactBitmaskField
              label={properties.get('masks').getLabel()}
              markdownDescription={properties.get('masks').getDescription()}
              value={masksValues}
              bitCount={8}
              onChange={newValue =>
                updateBehaviorProperty('masks', newValue.toString(10))
              }
            />
          )}
        </ColumnStackLayout>
      </Line>
      <Accordion
        defaultExpanded={areAdvancedPropertiesExpandedByDefault}
        noMargin
      >
        <AccordionHeader noMargin>
          <Text size="sub-title">
            <Trans>Advanced properties</Trans>
          </Text>
        </AccordionHeader>
        <AccordionBody disableGutters>
          <Column expand noMargin>
            <ResponsiveLineStackLayout>
              <NumericProperty
                properties={properties}
                propertyName={'shapeOffsetX'}
                step={1}
                onUpdate={newValue =>
                  updateBehaviorProperty('shapeOffsetX', newValue)
                }
              />
              <NumericProperty
                properties={properties}
                propertyName={'shapeOffsetY'}
                step={1}
                onUpdate={newValue =>
                  updateBehaviorProperty('shapeOffsetY', newValue)
                }
              />
              <NumericProperty
                properties={properties}
                propertyName={'shapeOffsetZ'}
                step={1}
                onUpdate={newValue =>
                  updateBehaviorProperty('shapeOffsetZ', newValue)
                }
              />
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout>
              <NumericProperty
                properties={properties}
                propertyName={'massCenterOffsetX'}
                step={1}
                onUpdate={newValue =>
                  updateBehaviorProperty('massCenterOffsetX', newValue)
                }
              />
              <NumericProperty
                properties={properties}
                propertyName={'massCenterOffsetY'}
                step={1}
                onUpdate={newValue =>
                  updateBehaviorProperty('massCenterOffsetY', newValue)
                }
              />
              <NumericProperty
                properties={properties}
                propertyName={'massCenterOffsetZ'}
                step={1}
                onUpdate={newValue =>
                  updateBehaviorProperty('massCenterOffsetZ', newValue)
                }
              />
            </ResponsiveLineStackLayout>
          </Column>
        </AccordionBody>
      </Accordion>
    </Column>
  );
};

export default Physics3DEditor;
