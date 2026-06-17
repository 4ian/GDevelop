// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { Line, Column, Spacer } from '../../../UI/Grid';
import Checkbox from '../../../UI/Checkbox';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import { type BehaviorEditorProps } from '../BehaviorEditorProps.flow';
import Text from '../../../UI/Text';
import DismissableAlertMessage from '../../../UI/DismissableAlertMessage';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
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

const BitGroupEditor = (props: {|
  bits: Array<boolean>,
  onChange: (index: number, value: boolean) => void,
  firstIndex: number,
  disabled: boolean,
|}) => {
  return (
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <ButtonGroup disableElevation fullWidth disabled={props.disabled}>
        {props.bits.map((bit, index) => (
          <Button
            key={props.firstIndex + index}
            variant={bit ? 'contained' : 'outlined'}
            color={bit ? 'primary' : 'default'}
            onClick={() => props.onChange(props.firstIndex + index, !bit)}
          >
            {props.firstIndex + index + 1}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

const isBitEnabled = (bitsValue: number, pos: number) => {
  return !!(bitsValue & (1 << pos));
};

const enableBit = (bitsValue: number, pos: number, enable: boolean) => {
  if (enable) bitsValue |= 1 << pos;
  else bitsValue &= ~(1 << pos);
  return bitsValue;
};

const Physics3DEditor = (props: Props): React.Node => {
  const {
    object,
    behavior,
    onBehaviorUpdated,
    project,
    projectScopedContainersAccessor,
    resourceManagementProps,
  } = props;
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
    // $FlowFixMe[missing-local-annot]
    (property, value) => {
      behavior.updateProperty(property, value);
      forceUpdate();
      onBehaviorUpdated();
    },
    [behavior, forceUpdate, onBehaviorUpdated]
  );

  const properties = behavior.getProperties();
  const staticBits = Array(4).fill(null);
  const dynamicBits = Array(4).fill(null);
  const shape = properties.get('shape').getValue();
  const layersValues = parseInt(properties.get('layers').getValue(), 10);
  const masksValues = parseInt(properties.get('masks').getValue(), 10);

  const isStatic = properties.get('bodyType').getValue() === 'Static';
  const isJointEditorSupportedObjectType =
    object.getType() === 'Scene3D::Model3DObject' ||
    object.getType() === 'Scene3D::Cube3DObject';
  const hasJointEditorProperties = properties.has('jointEditorEnabled');
  const hasRagdollRoleProperty = properties.has('ragdollRole');
  const hasRagdollGroupTagProperty = properties.has('ragdollGroupTag');
  const hasJointAutoWakeBodiesProperty = properties.has('jointAutoWakeBodies');
  const hasJointAutoStabilityPresetProperty = properties.has(
    'jointAutoStabilityPreset'
  );
  const hasJointAutoBreakForceProperty = properties.has('jointAutoBreakForce');
  const hasJointAutoBreakTorqueProperty = properties.has(
    'jointAutoBreakTorque'
  );
  const hasRagdollAndJointRealismProperties =
    hasRagdollRoleProperty ||
    hasRagdollGroupTagProperty ||
    hasJointAutoWakeBodiesProperty ||
    hasJointAutoStabilityPresetProperty ||
    hasJointAutoBreakForceProperty ||
    hasJointAutoBreakTorqueProperty;
  const isRagdollSectionExpandedByDefault =
    (hasRagdollRoleProperty &&
      properties.get('ragdollRole').getValue() !== 'None') ||
    (hasRagdollGroupTagProperty &&
      !!properties
        .get('ragdollGroupTag')
        .getValue()
        .trim());
  const isJointAutoWakeBodiesEnabled =
    hasJointAutoWakeBodiesProperty &&
    properties.get('jointAutoWakeBodies').getValue() === 'true';
  const isJointEditorEnabled =
    hasJointEditorProperties &&
    properties.get('jointEditorEnabled').getValue() === 'true';
  const isJointEditorPreviewEnabled =
    hasJointEditorProperties &&
    properties.has('jointEditorPreviewEnabled') &&
    properties.get('jointEditorPreviewEnabled').getValue() === 'true';
  const isJointEditorUsingCustomAxis =
    hasJointEditorProperties &&
    properties.has('jointEditorUseCustomAxis') &&
    properties.get('jointEditorUseCustomAxis').getValue() === 'true';

  const canShapeBeOriented =
    properties.get('shape').getValue() !== 'Sphere' &&
    properties.get('shape').getValue() !== 'Box';

  // $FlowFixMe[value-as-type]
  const [gltf, setGltf] = React.useState<GLTF | null>(null);
  const loadGltf = React.useCallback(
    async (modelResourceName: string) => {
      if (!modelResourceName && object.getType() === 'Scene3D::Model3DObject') {
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
      {shape === 'Mesh' && object.getType() !== 'Scene3D::Model3DObject' && (
        <Line>
          <AlertMessage kind="error">
            <Trans>Mesh shapes are only supported for 3D model objects.</Trans>
          </AlertMessage>
        </Line>
      )}
      {shape !== 'Mesh' && (
        <ResponsiveLineStackLayout>
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionA').getValue()}
            key={'shapeDimensionA'}
            floatingLabelText={
              shape === 'Box' ? <Trans>Width</Trans> : <Trans>Radius</Trans>
            }
            min={0}
            onChange={newValue =>
              updateBehaviorProperty('shapeDimensionA', newValue)
            }
            type="number"
            endAdornment={
              <UnitAdornment property={properties.get('shapeDimensionA')} />
            }
          />
          {shape !== 'Sphere' && (
            <SemiControlledTextField
              fullWidth
              value={properties.get('shapeDimensionB').getValue()}
              key={'shapeDimensionB'}
              floatingLabelText={
                shape === 'Box' ? <Trans>Height</Trans> : <Trans>Depth</Trans>
              }
              min={0}
              onChange={newValue =>
                updateBehaviorProperty('shapeDimensionB', newValue)
              }
              type="number"
              endAdornment={
                <UnitAdornment property={properties.get('shapeDimensionB')} />
              }
            />
          )}
          {shape === 'Box' && (
            <SemiControlledTextField
              fullWidth
              value={properties.get('shapeDimensionC').getValue()}
              key={'shapeDimensionC'}
              floatingLabelText={<Trans>Depth</Trans>}
              min={0}
              onChange={newValue =>
                updateBehaviorProperty('shapeDimensionC', newValue)
              }
              type="number"
              endAdornment={
                <UnitAdornment property={properties.get('shapeDimensionC')} />
              }
            />
          )}
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
      <Line>
        <Text style={{ marginRight: 10 }}>
          {properties.get('layers').getLabel()}
        </Text>
        <BitGroupEditor
          key={'static-layers'}
          firstIndex={0}
          bits={staticBits.map(
            (_, index) => isBitEnabled(layersValues, index) && isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(layersValues, index, value);
            updateBehaviorProperty('layers', newValue.toString(10));
          }}
          disabled={!isStatic}
        />
        <Spacer />
        <BitGroupEditor
          key={'dynamic-layers'}
          firstIndex={4}
          bits={dynamicBits.map(
            (_, index) => isBitEnabled(layersValues, index + 4) && !isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(layersValues, index, value);
            updateBehaviorProperty('layers', newValue.toString(10));
          }}
          disabled={isStatic}
        />
      </Line>
      <Line>
        <Text style={{ marginRight: 10 }}>
          {properties.get('masks').getLabel()}
        </Text>
        <BitGroupEditor
          key={'static-mask'}
          firstIndex={0}
          bits={staticBits.map(
            (_, index) => isBitEnabled(masksValues, index) || isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(masksValues, index, value);
            updateBehaviorProperty('masks', newValue.toString(10));
          }}
          disabled={isStatic}
        />
        <Spacer />
        <BitGroupEditor
          key={'dynamic-mask'}
          firstIndex={4}
          bits={dynamicBits.map(
            (_, index) => isBitEnabled(masksValues, index + 4) || isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(masksValues, index, value);
            updateBehaviorProperty('masks', newValue.toString(10));
          }}
          disabled={isStatic}
        />
      </Line>
      {hasRagdollAndJointRealismProperties && (
        <Accordion defaultExpanded={isRagdollSectionExpandedByDefault} noMargin>
          <AccordionHeader noMargin>
            <Text size="sub-title">
              <Trans>Ragdoll & Joint Realism</Trans>
            </Text>
          </AccordionHeader>
          <AccordionBody disableGutters>
            <Column expand noMargin>
              {hasRagdollRoleProperty && (
                <ResponsiveLineStackLayout>
                  <ChoiceProperty
                    id="physics3d-ragdoll-role"
                    properties={properties}
                    propertyName={'ragdollRole'}
                    onUpdate={(e, i, newValue: string) =>
                      updateBehaviorProperty('ragdollRole', newValue)
                    }
                  />
                </ResponsiveLineStackLayout>
              )}
              {hasRagdollGroupTagProperty && (
                <ResponsiveLineStackLayout>
                  <SemiControlledTextField
                    id="physics3d-ragdoll-group-tag"
                    fullWidth
                    value={properties.get('ragdollGroupTag').getValue()}
                    floatingLabelText={properties
                      .get('ragdollGroupTag')
                      .getLabel()}
                    onChange={newValue =>
                      updateBehaviorProperty('ragdollGroupTag', newValue)
                    }
                  />
                </ResponsiveLineStackLayout>
              )}
              {hasJointAutoWakeBodiesProperty && (
                <ResponsiveLineStackLayout>
                  <Checkbox
                    label={properties.get('jointAutoWakeBodies').getLabel()}
                    checked={isJointAutoWakeBodiesEnabled}
                    onCheck={(e, checked) =>
                      updateBehaviorProperty(
                        'jointAutoWakeBodies',
                        checked ? '1' : '0'
                      )
                    }
                  />
                </ResponsiveLineStackLayout>
              )}
              {hasJointAutoStabilityPresetProperty && (
                <ResponsiveLineStackLayout>
                  <ChoiceProperty
                    id="physics3d-joint-auto-stability-preset"
                    properties={properties}
                    propertyName={'jointAutoStabilityPreset'}
                    onUpdate={(e, i, newValue: string) =>
                      updateBehaviorProperty(
                        'jointAutoStabilityPreset',
                        newValue
                      )
                    }
                  />
                </ResponsiveLineStackLayout>
              )}
              {(hasJointAutoBreakForceProperty ||
                hasJointAutoBreakTorqueProperty) && (
                <ResponsiveLineStackLayout>
                  {hasJointAutoBreakForceProperty && (
                    <NumericProperty
                      id="physics3d-joint-auto-break-force"
                      properties={properties}
                      propertyName={'jointAutoBreakForce'}
                      step={0.1}
                      onUpdate={newValue =>
                        updateBehaviorProperty('jointAutoBreakForce', newValue)
                      }
                    />
                  )}
                  {hasJointAutoBreakTorqueProperty && (
                    <NumericProperty
                      id="physics3d-joint-auto-break-torque"
                      properties={properties}
                      propertyName={'jointAutoBreakTorque'}
                      step={0.1}
                      onUpdate={newValue =>
                        updateBehaviorProperty('jointAutoBreakTorque', newValue)
                      }
                    />
                  )}
                </ResponsiveLineStackLayout>
              )}
            </Column>
          </AccordionBody>
        </Accordion>
      )}
      {hasJointEditorProperties && !isJointEditorSupportedObjectType && (
        <Line>
          <AlertMessage kind="info">
            <Trans>
              Joint editor is available only for 3D Model and 3D Box objects.
            </Trans>
          </AlertMessage>
        </Line>
      )}
      {hasJointEditorProperties && isJointEditorSupportedObjectType && (
        <Accordion defaultExpanded={isJointEditorEnabled} noMargin>
          <AccordionHeader noMargin>
            <Text size="sub-title">
              <Trans>Joint Editor</Trans>
            </Text>
          </AccordionHeader>
          <AccordionBody disableGutters>
            <Column expand noMargin>
              <ResponsiveLineStackLayout>
                <Checkbox
                  label={properties.get('jointEditorEnabled').getLabel()}
                  checked={isJointEditorEnabled}
                  onCheck={(e, checked) =>
                    updateBehaviorProperty(
                      'jointEditorEnabled',
                      checked ? '1' : '0'
                    )
                  }
                />
                {properties.has('jointEditorPreviewEnabled') && (
                  <Checkbox
                    label={properties
                      .get('jointEditorPreviewEnabled')
                      .getLabel()}
                    checked={isJointEditorPreviewEnabled}
                    onCheck={(e, checked) =>
                      updateBehaviorProperty(
                        'jointEditorPreviewEnabled',
                        checked ? '1' : '0'
                      )
                    }
                  />
                )}
              </ResponsiveLineStackLayout>
              <ResponsiveLineStackLayout>
                <ChoiceProperty
                  id="physics3d-joint-editor-type"
                  properties={properties}
                  propertyName={'jointEditorType'}
                  onUpdate={(e, i, newValue: string) =>
                    updateBehaviorProperty('jointEditorType', newValue)
                  }
                />
                <SemiControlledTextField
                  id="physics3d-joint-editor-target-name"
                  fullWidth
                  value={properties
                    .get('jointEditorTargetObjectName')
                    .getValue()}
                  floatingLabelText={properties
                    .get('jointEditorTargetObjectName')
                    .getLabel()}
                  onChange={newValue =>
                    updateBehaviorProperty(
                      'jointEditorTargetObjectName',
                      newValue
                    )
                  }
                />
              </ResponsiveLineStackLayout>
              {properties.has('jointEditorPreviewSize') && (
                <ResponsiveLineStackLayout>
                  <NumericProperty
                    id="physics3d-joint-editor-preview-size"
                    properties={properties}
                    propertyName={'jointEditorPreviewSize'}
                    step={0.5}
                    onUpdate={newValue =>
                      updateBehaviorProperty('jointEditorPreviewSize', newValue)
                    }
                  />
                </ResponsiveLineStackLayout>
              )}
              <ResponsiveLineStackLayout>
                <NumericProperty
                  id="physics3d-joint-editor-anchor-offset-x"
                  properties={properties}
                  propertyName={'jointEditorAnchorOffsetX'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorAnchorOffsetX', newValue)
                  }
                />
                <NumericProperty
                  id="physics3d-joint-editor-anchor-offset-y"
                  properties={properties}
                  propertyName={'jointEditorAnchorOffsetY'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorAnchorOffsetY', newValue)
                  }
                />
                <NumericProperty
                  id="physics3d-joint-editor-anchor-offset-z"
                  properties={properties}
                  propertyName={'jointEditorAnchorOffsetZ'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorAnchorOffsetZ', newValue)
                  }
                />
              </ResponsiveLineStackLayout>
              <ResponsiveLineStackLayout>
                <NumericProperty
                  id="physics3d-joint-editor-target-anchor-offset-x"
                  properties={properties}
                  propertyName={'jointEditorTargetAnchorOffsetX'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty(
                      'jointEditorTargetAnchorOffsetX',
                      newValue
                    )
                  }
                />
                <NumericProperty
                  id="physics3d-joint-editor-target-anchor-offset-y"
                  properties={properties}
                  propertyName={'jointEditorTargetAnchorOffsetY'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty(
                      'jointEditorTargetAnchorOffsetY',
                      newValue
                    )
                  }
                />
                <NumericProperty
                  id="physics3d-joint-editor-target-anchor-offset-z"
                  properties={properties}
                  propertyName={'jointEditorTargetAnchorOffsetZ'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty(
                      'jointEditorTargetAnchorOffsetZ',
                      newValue
                    )
                  }
                />
              </ResponsiveLineStackLayout>
              <ResponsiveLineStackLayout>
                <Checkbox
                  label={properties.get('jointEditorUseCustomAxis').getLabel()}
                  checked={isJointEditorUsingCustomAxis}
                  onCheck={(e, checked) =>
                    updateBehaviorProperty(
                      'jointEditorUseCustomAxis',
                      checked ? '1' : '0'
                    )
                  }
                />
              </ResponsiveLineStackLayout>
              {isJointEditorUsingCustomAxis && (
                <ResponsiveLineStackLayout>
                  <NumericProperty
                    id="physics3d-joint-editor-axis-x"
                    properties={properties}
                    propertyName={'jointEditorAxisX'}
                    step={0.1}
                    onUpdate={newValue =>
                      updateBehaviorProperty('jointEditorAxisX', newValue)
                    }
                  />
                  <NumericProperty
                    id="physics3d-joint-editor-axis-y"
                    properties={properties}
                    propertyName={'jointEditorAxisY'}
                    step={0.1}
                    onUpdate={newValue =>
                      updateBehaviorProperty('jointEditorAxisY', newValue)
                    }
                  />
                  <NumericProperty
                    id="physics3d-joint-editor-axis-z"
                    properties={properties}
                    propertyName={'jointEditorAxisZ'}
                    step={0.1}
                    onUpdate={newValue =>
                      updateBehaviorProperty('jointEditorAxisZ', newValue)
                    }
                  />
                </ResponsiveLineStackLayout>
              )}
              <ResponsiveLineStackLayout>
                <NumericProperty
                  id="physics3d-joint-editor-hinge-min-angle"
                  properties={properties}
                  propertyName={'jointEditorHingeMinAngle'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorHingeMinAngle', newValue)
                  }
                />
                <NumericProperty
                  id="physics3d-joint-editor-hinge-max-angle"
                  properties={properties}
                  propertyName={'jointEditorHingeMaxAngle'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorHingeMaxAngle', newValue)
                  }
                />
              </ResponsiveLineStackLayout>
              <ResponsiveLineStackLayout>
                <NumericProperty
                  id="physics3d-joint-editor-distance-min"
                  properties={properties}
                  propertyName={'jointEditorDistanceMin'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorDistanceMin', newValue)
                  }
                />
                <NumericProperty
                  id="physics3d-joint-editor-distance-max"
                  properties={properties}
                  propertyName={'jointEditorDistanceMax'}
                  step={1}
                  onUpdate={newValue =>
                    updateBehaviorProperty('jointEditorDistanceMax', newValue)
                  }
                />
              </ResponsiveLineStackLayout>
            </Column>
          </AccordionBody>
        </Accordion>
      )}
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
