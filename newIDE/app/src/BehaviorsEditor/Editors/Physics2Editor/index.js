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
  properties: gdMapStringPropertyDescriptor,
  propertyName: string,
  step: number,
  onUpdate: (newValue: string) => void,
|}) => {
  const { properties, propertyName, step, onUpdate } = props;
  const property = properties.get(propertyName);
  return (
    <SemiControlledTextField
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

const Physics2Editor = (props: Props) => {
  const { current: resourcesLoader } = React.useRef(ResourcesLoader);
  const [image, setImage] = React.useState('');
  const { behavior } = props;
  const forceUpdate = useForceUpdate();

  const isBitEnabled = (bitsValue: number, pos: number) => {
    return !!(bitsValue & (1 << pos));
  };

  const enableBit = (bitsValue: number, pos: number, enable: boolean) => {
    if (enable) bitsValue |= 1 << pos;
    else bitsValue &= ~(1 << pos);
    return bitsValue;
  };

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
          key={'bodyType'}
          fullWidth
          floatingLabelText={properties.get('bodyType').getLabel()}
          value={properties.get('bodyType').getValue()}
          onChange={(e, i, newValue: string) => {
            behavior.updateProperty('bodyType', newValue);
            forceUpdate();
          }}
        >
          {[
            <SelectOption
              key={'dynamic'}
              value={'Dynamic'}
              primaryText={t`Dynamic`}
            />,
            <SelectOption
              key={'static'}
              value={'Static'}
              primaryText={t`Static`}
            />,
            <SelectOption
              key={'kinematic'}
              value={'Kinematic'}
              primaryText={t`Kinematic`}
            />,
          ]}
        </SelectField>
      </Line>
      <ResponsiveLineStackLayout>
        <Checkbox
          label={properties.get('bullet').getLabel()}
          checked={properties.get('bullet').getValue() === 'true'}
          onCheck={(e, checked) => {
            behavior.updateProperty('bullet', checked ? '1' : '0');
            forceUpdate();
          }}
        />
        <Checkbox
          label={properties.get('fixedRotation').getLabel()}
          checked={properties.get('fixedRotation').getValue() === 'true'}
          onCheck={(e, checked) => {
            behavior.updateProperty('fixedRotation', checked ? '1' : '0');
            forceUpdate();
          }}
        />
        <Checkbox
          label={properties.get('canSleep').getLabel()}
          checked={properties.get('canSleep').getValue() === 'true'}
          onCheck={(e, checked) => {
            behavior.updateProperty('canSleep', checked ? '1' : '0');
            forceUpdate();
          }}
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
          fullWidth
          floatingLabelText={properties.get('shape').getLabel()}
          value={properties.get('shape').getValue()}
          onChange={(e, i, newValue: string) => {
            behavior.updateProperty('shape', newValue);
            forceUpdate();
          }}
        >
          <SelectOption key={'box'} value={'Box'} primaryText={t`Box`} />
          <SelectOption
            key={'circle'}
            value={'Circle'}
            primaryText={t`Circle`}
          />
          <SelectOption key={'edge'} value={'Edge'} primaryText={t`Edge`} />
          <SelectOption
            key={'polygon'}
            value={'Polygon'}
            primaryText={t`Polygon`}
          />
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
            onChange={newValue => {
              behavior.updateProperty('shapeDimensionA', newValue);
              forceUpdate();
            }}
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
            onChange={newValue => {
              behavior.updateProperty('shapeDimensionB', newValue);
              forceUpdate();
            }}
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
            onChange={(e, i, newValue: string) => {
              behavior.updateProperty('polygonOrigin', newValue);
              forceUpdate();
            }}
          >
            {[
              <SelectOption
                key={'center'}
                value={'Center'}
                primaryText={t`Center`}
              />,
              <SelectOption
                key={'origin'}
                value={'Origin'}
                primaryText={t`Origin`}
              />,
              <SelectOption
                key={'topLeft'}
                value={'TopLeft'}
                primaryText={t`Top-Left`}
              />,
            ]}
          </SelectField>
        )}
        <NumericProperty
          properties={properties}
          propertyName={'shapeOffsetX'}
          step={1}
          onUpdate={newValue => {
            behavior.updateProperty('shapeOffsetX', newValue);
            forceUpdate();
          }}
        />
        <NumericProperty
          properties={properties}
          propertyName={'shapeOffsetY'}
          step={1}
          onUpdate={newValue => {
            behavior.updateProperty('shapeOffsetY', newValue);
            forceUpdate();
          }}
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
              project={props.project}
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
                    width={overlayProps.imageWidth}
                    height={overlayProps.imageHeight}
                    frameOffsetTop={overlayProps.offsetTop}
                    frameOffsetLeft={overlayProps.offsetLeft}
                    zoomFactor={overlayProps.imageZoomFactor}
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
              behavior.updateProperty('vertices', JSON.stringify(vertices));
              forceUpdate();
            }}
            onChangeVertexY={(newValue, index) => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              vertices[index].y = newValue;
              behavior.updateProperty('vertices', JSON.stringify(vertices));
              forceUpdate();
            }}
            onAdd={() => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              if (vertices.length >= 8) return;
              vertices.push({ x: 0, y: 0 });
              behavior.updateProperty('vertices', JSON.stringify(vertices));
              forceUpdate();
            }}
            onRemove={index => {
              let vertices = JSON.parse(properties.get('vertices').getValue());
              vertices.splice(index, 1);
              behavior.updateProperty('vertices', JSON.stringify(vertices));
              forceUpdate();
            }}
          />
        </Line>
      )}
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'density'}
          step={0.1}
          onUpdate={newValue => {
            behavior.updateProperty(
              'density',
              parseFloat(newValue) > 0 ? newValue : '0'
            );
            forceUpdate();
          }}
        />
        <NumericProperty
          properties={properties}
          propertyName={'gravityScale'}
          step={0.1}
          onUpdate={newValue => {
            behavior.updateProperty('gravityScale', newValue);
            forceUpdate();
          }}
        />
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'friction'}
          step={0.1}
          onUpdate={newValue => {
            behavior.updateProperty(
              'friction',
              parseFloat(newValue) > 0 ? newValue : '0'
            );
            forceUpdate();
          }}
        />
        <NumericProperty
          properties={properties}
          propertyName={'restitution'}
          step={0.1}
          onUpdate={newValue => {
            behavior.updateProperty(
              'restitution',
              parseFloat(newValue) > 0 ? newValue : '0'
            );
            forceUpdate();
          }}
        />
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'linearDamping'}
          step={0.05}
          onUpdate={newValue => {
            behavior.updateProperty('linearDamping', newValue);
            forceUpdate();
          }}
        />
        <NumericProperty
          properties={properties}
          propertyName={'angularDamping'}
          step={0.05}
          onUpdate={newValue => {
            behavior.updateProperty('angularDamping', newValue);
            forceUpdate();
          }}
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
            behavior.updateProperty('layers', newValue.toString(10));
            forceUpdate();
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
            behavior.updateProperty('masks', newValue.toString(10));
            forceUpdate();
          }}
        />
      </Line>
    </Column>
  );
};

export default Physics2Editor;
