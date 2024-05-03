// @flow
import { t } from '@lingui/macro';
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
import Text from '../../../UI/Text';
import DismissableAlertMessage from '../../../UI/DismissableAlertMessage';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import EmptyMessage from '../../../UI/EmptyMessage';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';

type Props = BehaviorEditorProps;

const NumericProperty = (props: {|
  id?: string,
  properties: gdMapStringPropertyDescriptor,
  propertyName: string,
  step: number,
  onUpdate: (newValue: string) => void,
|}) => {
  const { properties, propertyName, step, onUpdate, id } = props;
  const property = properties.get(propertyName);

  return (
    <SemiControlledTextField
      id={id}
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

const UnitAdornment = (props: {| property: gdPropertyDescriptor |}) => {
  const { property } = props;
  const measurementUnit = property.getMeasurementUnit();
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

const BitGroupEditor = (props: {|
  bits: Array<boolean>,
  onChange: (index: number, value: boolean) => void,
|}) => {
  return (
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <ButtonGroup disableElevation fullWidth>
        {props.bits.map((bit, index) => (
          <Button
            key={index}
            variant={bit ? 'contained' : 'outlined'}
            color={bit ? 'primary' : 'default'}
            onClick={() => props.onChange(index, !bit)}
          >
            {index + 1}
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

const Physics2Editor = (props: Props) => {
  const { current: resourcesLoader } = React.useRef(ResourcesLoader);
  const [image, setImage] = React.useState('');
  const { behavior, onBehaviorUpdated } = props;
  const forceUpdate = useForceUpdate();

  const updateBehaviorProperty = React.useCallback(
    (property, value) => {
      behavior.updateProperty(property, value);
      forceUpdate();
      onBehaviorUpdated();
    },
    [behavior, forceUpdate, onBehaviorUpdated]
  );

  const properties = behavior.getProperties();
  const bits = Array(16).fill(null);
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
        <SelectField
          id="physics2-parameter-body-type"
          key={'bodyType'}
          fullWidth
          floatingLabelText={properties.get('bodyType').getLabel()}
          value={properties.get('bodyType').getValue()}
          onChange={(e, i, newValue: string) =>
            updateBehaviorProperty('bodyType', newValue)
          }
        >
          {[
            <SelectOption
              key={'dynamic'}
              value={'Dynamic'}
              label={t`Dynamic`}
            />,
            <SelectOption key={'static'} value={'Static'} label={t`Static`} />,
            <SelectOption
              key={'kinematic'}
              value={'Kinematic'}
              label={t`Kinematic`}
            />,
          ]}
        </SelectField>
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
        <SelectField
          id="physics2-parameter-shape"
          fullWidth
          floatingLabelText={properties.get('shape').getLabel()}
          value={properties.get('shape').getValue()}
          onChange={(e, i, newValue: string) =>
            updateBehaviorProperty('shape', newValue)
          }
        >
          <SelectOption key={'box'} value={'Box'} label={t`Box`} />
          <SelectOption key={'circle'} value={'Circle'} label={t`Circle`} />
          <SelectOption key={'edge'} value={'Edge'} label={t`Edge`} />
          <SelectOption key={'polygon'} value={'Polygon'} label={t`Polygon`} />
        </SelectField>
      </Line>
      <ResponsiveLineStackLayout>
        {shape !== 'Polygon' && (
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionA').getValue()}
            key={'shapeDimensionA'}
            floatingLabelText={
              shape === 'Circle'
                ? 'Radius'
                : shape === 'Edge'
                ? 'Length'
                : 'Width'
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
        )}
        {shape !== 'Polygon' && shape !== 'Circle' && (
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionB').getValue()}
            key={'shapeDimensionB'}
            floatingLabelText={shape === 'Edge' ? 'Angle' : 'Height'}
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
        {shape === 'Polygon' && (
          <SelectField
            fullWidth
            floatingLabelText={properties.get('polygonOrigin').getLabel()}
            value={properties.get('polygonOrigin').getValue()}
            onChange={(e, i, newValue: string) =>
              updateBehaviorProperty('polygonOrigin', newValue)
            }
          >
            {[
              <SelectOption
                key={'center'}
                value={'Center'}
                label={t`Center`}
              />,
              <SelectOption
                key={'origin'}
                value={'Origin'}
                label={t`Origin`}
              />,
              <SelectOption
                key={'topLeft'}
                value={'TopLeft'}
                label={t`Top-Left`}
              />,
            ]}
          </SelectField>
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
      <Line>
        <Text style={{ marginRight: 10 }}>
          {properties.get('layers').getLabel()}
        </Text>
        <BitGroupEditor
          bits={bits.map((_, idx) => isBitEnabled(layersValues, idx))}
          onChange={(index, value) => {
            const newValue = enableBit(layersValues, index, value);
            updateBehaviorProperty('layers', newValue.toString(10));
          }}
        />
      </Line>
      <Line>
        <Text style={{ marginRight: 10 }}>
          {properties.get('masks').getLabel()}
        </Text>
        <BitGroupEditor
          bits={bits.map((_, idx) => isBitEnabled(masksValues, idx))}
          onChange={(index, value) => {
            const newValue = enableBit(masksValues, index, value);
            updateBehaviorProperty('masks', newValue.toString(10));
          }}
        />
      </Line>
    </Column>
  );
};

export default Physics2Editor;
