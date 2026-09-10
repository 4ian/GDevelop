// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Checkbox from '../../../UI/Checkbox';
import SelectField from '../../../UI/SelectField';
import SelectOption from '../../../UI/SelectOption';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import ImagePreview, {
  isProjectImageResourceSmooth,
} from '../../../ResourcesList/ResourcePreview/ImagePreview';
import ResourceSelector from '../../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../../ResourcesLoader';
import { getMeasurementUnitShortLabel } from '../../../PropertiesEditor/PropertiesMapToSchema';
import MeasurementUnitDocumentation from '../../../PropertiesEditor/MeasurementUnitDocumentation';
import ShapePreview from './ShapePreview';
import PolygonEditor from './PolygonEditor';
import { type BehaviorEditorProps } from '../BehaviorEditorProps.flow';
import DismissableAlertMessage from '../../../UI/DismissableAlertMessage';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { CompactBitmaskField } from '../../../UI/CompactBitmaskField';
import EmptyMessage from '../../../UI/EmptyMessage';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import CircledInfo from '../../../UI/CustomSvgIcons/SmallCircledInfo';
import { mapVector } from '../../../Utils/MapFor';

type Props = BehaviorEditorProps;

export const NumericProperty = (props: {|
  id?: string,
  properties: gdMapStringPropertyDescriptor,
  propertyName: string,
  step: number,
  onUpdate: (newValue: string) => void,
|}): React.Node => {
  const { properties, propertyName, step, onUpdate, id } = props;
  const property = properties.get(propertyName);

  return (
    <SemiControlledTextField
      id={id || propertyName}
      fullWidth
      value={property.getValue()}
      key={propertyName}
      floatingLabelText={property.getLabel()}
      step={step}
      onChange={onUpdate}
      type="number"
      endAdornment={<UnitAdornment property={property} />}
    />
  );
};

export const ChoiceProperty = (props: {|
  id?: string,
  properties: gdMapStringPropertyDescriptor,
  propertyName: string,
  value?: string,
  onUpdate: (
    event: {| target: {| value: string |} |},
    index: number,
    text: string // Note that even for number values, a string is returned
  ) => void,
  disabled?: boolean,
|}): React.Node => {
  const { properties, propertyName, onUpdate, id, value, disabled } = props;
  const property = properties.get(propertyName);

  return (
    <SelectField
      id={id || propertyName}
      key={propertyName}
      fullWidth
      floatingLabelText={property.getLabel()}
      value={value === undefined ? property.getValue() : value}
      onChange={onUpdate}
      disabled={disabled}
    >
      {mapVector(property.getChoices(), choice => (
        <SelectOption
          key={choice.getValue().toLowerCase()}
          value={choice.getValue()}
          label={choice.getLabel()}
        />
      ))}
    </SelectField>
  );
};

export const UnitAdornment = (props: {|
  property: gdPropertyDescriptor,
|}): React.Node => {
  const { property } = props;
  const measurementUnit = property.getMeasurementUnit();
  if (measurementUnit.isUndefined() && property.getDescription()) {
    return (
      <Tooltip
        title={
          <MeasurementUnitDocumentation
            label={property.getLabel()}
            description={property.getDescription()}
            elementsWithWords={''}
          />
        }
      >
        <InputAdornment position="end">{<CircledInfo />}</InputAdornment>
      </Tooltip>
    );
  }
  return (
    <Tooltip
      title={
        <MeasurementUnitDocumentation
          label={measurementUnit.getLabel()}
          description={measurementUnit.getDescription()}
          elementsWithWords={measurementUnit.getElementsWithWords()}
        />
      }
    >
      <InputAdornment position="end">
        {getMeasurementUnitShortLabel(measurementUnit)}
      </InputAdornment>
    </Tooltip>
  );
};

const Physics2Editor = (props: Props): React.Node => {
  const { current: resourcesLoader } = React.useRef(ResourcesLoader);
  const [image, setImage] = React.useState('');
  const { behaviors, onBehaviorUpdated } = props;
  const behavior = behaviors[0];
  const forceUpdate = useForceUpdate();

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

  return (
    <Column
      expand
      // Avoid overflow on small screens
      noOverflowParent
    >
      <Line>
        <ChoiceProperty
          id="physics2-parameter-body-type"
          properties={properties}
          propertyName={'bodyType'}
          onUpdate={(e, i, newValue: string) =>
            updateBehaviorProperty('bodyType', newValue)
          }
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
        <Checkbox
          label={properties.get('canSleep').getLabel()}
          checked={properties.get('canSleep').getValue() === 'true'}
          onCheck={(e, checked) =>
            updateBehaviorProperty('canSleep', checked ? '1' : '0')
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
      <Line>
        <ChoiceProperty
          id="physics2-parameter-shape"
          properties={properties}
          propertyName={'shape'}
          onUpdate={(e, i, newValue: string) =>
            updateBehaviorProperty('shape', newValue)
          }
        />
      </Line>
      <ResponsiveLineStackLayout>
        {/* Labels and visibility are given by the properties themselves,
            as they depend on the shape. */}
        {!properties.get('shapeDimensionA').isHidden() && (
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionA').getValue()}
            key={'shapeDimensionA'}
            floatingLabelText={properties.get('shapeDimensionA').getLabel()}
            min={0}
            onChange={newValue =>
              updateBehaviorProperty('shapeDimensionA', newValue)
            }
            type="number"
            endAdornment={
              <UnitAdornment property={properties.get('shapeDimensionA')} />
            }
          />
        )}
        {!properties.get('shapeDimensionB').isHidden() && (
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionB').getValue()}
            key={'shapeDimensionB'}
            floatingLabelText={properties.get('shapeDimensionB').getLabel()}
            min={shape === 'Edge' ? undefined : 0}
            onChange={newValue =>
              updateBehaviorProperty('shapeDimensionB', newValue)
            }
            type="number"
            endAdornment={
              <UnitAdornment property={properties.get('shapeDimensionB')} />
            }
          />
        )}
        {!properties.get('polygonOrigin').isHidden() && (
          <ChoiceProperty
            properties={properties}
            propertyName={'polygonOrigin'}
            onUpdate={(e, i, newValue: string) =>
              updateBehaviorProperty('polygonOrigin', newValue)
            }
          />
        )}
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
      </ResponsiveLineStackLayout>
      <Line>
        <ResourceSelector
          floatingLabelText={
            <Trans>
              A temporary image to help you visualize the shape/polygon
            </Trans>
          }
          project={props.project}
          projectScopedContainersAccessor={
            props.projectScopedContainersAccessor
          }
          resourceManagementProps={props.resourceManagementProps}
          resourcesLoader={resourcesLoader}
          resourceKind={'image'}
          initialResourceName={''}
          fullWidth
          onChange={resourceName => {
            setImage(resourceName);
            onBehaviorUpdated();
            forceUpdate();
          }}
        />
      </Line>
      {!image && (
        <Line>
          <EmptyMessage>
            <Trans>
              To preview the shape that the Physics engine will use for this
              object, choose first a temporary image to use for the preview.
            </Trans>
          </EmptyMessage>
        </Line>
      )}
      {image && (
        <Line>
          <div
            style={{
              width:
                '100%' /* This div prevents ImagePreview to overflow outside the parent */,
            }}
          >
            <ImagePreview
              resourceName={image}
              imageResourceSource={resourcesLoader.getResourceFullUrl(
                props.project,
                image,
                {}
              )}
              isImageResourceSmooth={isProjectImageResourceSmooth(
                props.project,
                image
              )}
              fixedHeight={200}
              renderOverlay={overlayProps => {
                // The result from `getProperties` is temporary, and because this renderOverlay
                // function can be called outside of the render, we must get the properties again.
                const properties = behavior.getProperties();

                return (
                  <ShapePreview
                    {...overlayProps}
                    shape={properties.get('shape').getValue()}
                    dimensionA={parseFloat(
                      properties.get('shapeDimensionA').getValue()
                    )}
                    dimensionB={parseFloat(
                      properties.get('shapeDimensionB').getValue()
                    )}
                    offsetX={parseFloat(
                      properties.get('shapeOffsetX').getValue()
                    )}
                    offsetY={parseFloat(
                      properties.get('shapeOffsetY').getValue()
                    )}
                    polygonOrigin={properties.get('polygonOrigin').getValue()}
                    vertices={JSON.parse(properties.get('vertices').getValue())}
                    onMoveVertex={(index, newX, newY) => {
                      let vertices = JSON.parse(
                        properties.get('vertices').getValue()
                      );
                      vertices[index].x = newX;
                      vertices[index].y = newY;
                      behavior.updateProperty(
                        'vertices',
                        JSON.stringify(vertices)
                      );
                      forceUpdate();
                      onBehaviorUpdated();
                    }}
                  />
                );
              }}
            />
          </div>
        </Line>
      )}
      {shape === 'Polygon' && (
        <Line>
          <PolygonEditor
            vertices={JSON.parse(properties.get('vertices').getValue())}
            onChangeVertexX={(newValue, index) => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              vertices[index].x = newValue;
              updateBehaviorProperty('vertices', JSON.stringify(vertices));
            }}
            onChangeVertexY={(newValue, index) => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              vertices[index].y = newValue;
              updateBehaviorProperty('vertices', JSON.stringify(vertices));
            }}
            onAdd={() => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              if (vertices.length >= 8) return;
              vertices.push({ x: 0, y: 0 });
              updateBehaviorProperty('vertices', JSON.stringify(vertices));
            }}
            onRemove={index => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              vertices.splice(index, 1);
              updateBehaviorProperty('vertices', JSON.stringify(vertices));
            }}
          />
        </Line>
      )}
      <ResponsiveLineStackLayout>
        <NumericProperty
          id="physics2-parameter-density"
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
          id="physics2-parameter-angular-damping"
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
          <CompactBitmaskField
            label={properties.get('layers').getLabel()}
            markdownDescription={properties.get('layers').getDescription()}
            value={layersValues}
            bitCount={16}
            onChange={newValue =>
              updateBehaviorProperty('layers', newValue.toString(10))
            }
          />
          <CompactBitmaskField
            label={properties.get('masks').getLabel()}
            markdownDescription={properties.get('masks').getDescription()}
            value={masksValues}
            bitCount={16}
            onChange={newValue =>
              updateBehaviorProperty('masks', newValue.toString(10))
            }
          />
        </ColumnStackLayout>
      </Line>
    </Column>
  );
};

export default Physics2Editor;
