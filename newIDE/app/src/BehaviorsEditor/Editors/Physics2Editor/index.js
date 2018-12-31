// @flow
import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import ImagePreview from '../../../ResourcesList/ResourcePreview/ImagePreview';
import ResourceSelector from '../../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../../ResourcesLoader';
import ShapePreview from './ShapePreview.js';
import PolygonEditor from './PolygonEditor.js';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor.flow';

type Props = {|
  behavior: Object,
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

type State = {|
  image: string,
  imageWidth: number,
  imageHeight: number,
|};

export default class Physics2Editor extends React.Component<Props, State> {
  resourcesLoader: typeof ResourcesLoader;

  constructor(props: Props) {
    super(props);

    this.resourcesLoader = ResourcesLoader;

    this.state = {
      image: '',
      imageWidth: 9,
      imageHeight: 0,
    };
  }

  _setImageSize = (width: number, height: number) => {
    this.setState({
      imageWidth: width,
      imageHeight: height,
    });
  };

  _isPolygonConvex(properties: Object) {
    const vertices = JSON.parse(properties.get('vertices').getValue());
    // Get edges
    var edges = [];
    var v1 = null;
    var v2 = null;
    for (var i = 0; i < vertices.length; i++) {
      v1 = vertices[i];
      if (i + 1 >= vertices.length) v2 = vertices[0];
      else v2 = vertices[i + 1];
      edges.push({ x: v2.x - v1.x, y: v2.y - v1.y });
    }
    // Check convexity
    if (edges.length < 3) return false;

    const zProductIsPositive =
      edges[0].x * edges[0 + 1].y - edges[0].y * edges[0 + 1].x > 0;

    for (i = 1; i < edges.length - 1; ++i) {
      var zCrossProduct =
        edges[i].x * edges[i + 1].y - edges[i].y * edges[i + 1].x;
      if (zCrossProduct > 0 !== zProductIsPositive) return false;
    }

    var lastZCrossProduct =
      edges[edges.length - 1].x * edges[0].y -
      edges[edges.length - 1].y * edges[0].x;
    if (lastZCrossProduct > 0 !== zProductIsPositive) return false;

    return true;
  }

  _isBitEnabled(bitsValue: number, i: number) {
    return !!(bitsValue & (1 << i));
  }

  _enableBit(bitsValue: number, i: number, enable: boolean) {
    if (enable) bitsValue |= 1 << i;
    else bitsValue &= ~(1 << i);
    return bitsValue;
  }

  renderBitProperty(
    properties: Object,
    isLayer: boolean,
    pos: number,
    spacing: boolean
  ) {
    const bitValues = parseInt(
      properties.get(isLayer ? 'layers' : 'masks').getValue(),
      10
    );

    return (
      <div
        style={{ width: spacing ? '7.5%' : '5%' }}
        key={(isLayer ? 'layer' : 'mask') + `${pos}`}
      >
        {
          <Checkbox
            checked={this._isBitEnabled(bitValues, pos)}
            onCheck={(e, checked) => {
              const newValue = this._enableBit(bitValues, pos, checked);
              this.props.behavior.updateProperty(
                isLayer ? 'layers' : 'masks',
                newValue.toString(10),
                this.props.project
              );
              this.forceUpdate();
            }}
          />
        }
        {spacing && (
          <div
            style={{ width: '33%' }}
            key={(isLayer ? 'layers' : 'masks') + 'space' + pos.toString(10)}
          />
        )}
      </div>
    );
  }

  renderNumericProperty(
    properties: Object,
    name: string,
    limit: boolean,
    min: number,
    step: number
  ) {
    return (
      <SemiControlledTextField
        value={properties.get(name).getValue()}
        key={name}
        floatingLabelText={properties.get(name).getLabel()}
        floatingLabelFixed
        min={limit ? min : undefined}
        step={step}
        onChange={newValue => {
          this.props.behavior.updateProperty(
            name,
            newValue,
            this.props.project
          );
          this.forceUpdate();
        }}
        type="number"
      />
    );
  }

  render() {
    const { behavior, project } = this.props;

    // Parsing error temporary workaround
    if (
      !Array.isArray(
        JSON.parse(
          behavior
            .getProperties()
            .get('vertices')
            .getValue()
        )
      )
    ) {
      behavior.updateProperty('vertices', '[]', project);
    }

    const properties = behavior.getProperties(project);
    const bits = Array(16).fill(null);
    const shape = properties.get('shape').getValue();

    return (
      <Column>
        <Line>
          <SelectField
            key={'type'}
            floatingLabelText={properties.get('type').getLabel()}
            floatingLabelFixed
            value={properties.get('type').getValue()}
            onChange={(e, index, newValue) => {
              behavior.updateProperty('type', newValue, project);
              this.forceUpdate();
            }}
          >
            {[
              <MenuItem
                key={'dynamic'}
                value={'Dynamic'}
                primaryText={'Dynamic'}
              />,
              <MenuItem
                key={'static'}
                value={'Static'}
                primaryText={'Static'}
              />,
              <MenuItem
                key={'kinematic'}
                value={'Kinematic'}
                primaryText={'Kinematic'}
              />,
            ]}
          </SelectField>
        </Line>
        <Line>
          <div style={{ width: '33%' }}>
            <Checkbox
              label={properties.get('bullet').getLabel()}
              checked={properties.get('bullet').getValue() === 'true'}
              onCheck={(e, checked) => {
                behavior.updateProperty('bullet', checked ? '1' : '0', project);
                this.forceUpdate();
              }}
            />
          </div>
          <div style={{ width: '33%' }}>
            <Checkbox
              label={properties.get('fixedRotation').getLabel()}
              checked={properties.get('fixedRotation').getValue() === 'true'}
              onCheck={(e, checked) => {
                behavior.updateProperty(
                  'fixedRotation',
                  checked ? '1' : '0',
                  project
                );
                this.forceUpdate();
              }}
            />
          </div>
          <div style={{ width: '33%' }}>
            <Checkbox
              label={properties.get('canSleep').getLabel()}
              checked={properties.get('canSleep').getValue() === 'true'}
              onCheck={(e, checked) => {
                behavior.updateProperty(
                  'canSleep',
                  checked ? '1' : '0',
                  project
                );
                this.forceUpdate();
              }}
            />
          </div>
        </Line>
        <Line>
          <SelectField
            floatingLabelText={properties.get('shape').getLabel()}
            floatingLabelFixed
            value={properties.get('shape').getValue()}
            onChange={(e, index, newValue) => {
              behavior.updateProperty('shape', newValue, project);
              this.forceUpdate();
            }}
          >
            {[
              <MenuItem key={'box'} value={'Box'} primaryText={'Box'} />,
              <MenuItem
                key={'circle'}
                value={'Circle'}
                primaryText={'Circle'}
              />,
              <MenuItem key={'edge'} value={'Edge'} primaryText={'Edge'} />,
              <MenuItem
                key={'polygon'}
                value={'Polygon'}
                primaryText={'Polygon'}
              />,
            ]}
          </SelectField>
        </Line>
        <Line>
          {shape !== 'Polygon' && (
            <SemiControlledTextField
              value={properties
                .get(shape === 'Polygon' ? 'PolygonOriginX' : 'shapeDimensionA')
                .getValue()}
              key={'shapeDimensionA'}
              floatingLabelText={
                shape === 'Circle'
                  ? 'Radius'
                  : shape === 'Edge'
                  ? 'Length'
                  : 'Width'
              }
              floatingLabelFixed
              min={0}
              onChange={newValue => {
                behavior.updateProperty(
                  shape === 'Polygon' ? 'PolygonOriginX' : 'shapeDimensionA',
                  newValue,
                  project
                );
                this.forceUpdate();
              }}
              type="number"
            />
          )}
          {shape !== 'Polygon' && shape !== 'Circle' && (
            <SemiControlledTextField
              value={properties
                .get(shape === 'Polygon' ? 'PolygonOriginY' : 'shapeDimensionB')
                .getValue()}
              key={'shapeDimensionB'}
              floatingLabelText={shape === 'Edge' ? 'Angle' : 'Height'}
              floatingLabelFixed
              min={shape === 'Edge' ? undefined : 0}
              onChange={newValue => {
                behavior.updateProperty(
                  shape === 'Polygon' ? 'PolygonOriginY' : 'shapeDimensionB',
                  newValue,
                  project
                );
                this.forceUpdate();
              }}
              type="number"
            />
          )}
          {shape === 'Polygon' && (
            <SelectField
              floatingLabelText={properties.get('polygonOrigin').getLabel()}
              floatingLabelFixed
              value={properties.get('polygonOrigin').getValue()}
              onChange={(e, index, newValue) => {
                behavior.updateProperty('polygonOrigin', newValue, project);
                this.forceUpdate();
              }}
            >
              {[
                <MenuItem
                  key={'center'}
                  value={'Center'}
                  primaryText={'Center'}
                />,
                <MenuItem
                  key={'origin'}
                  value={'Origin'}
                  primaryText={'Origin'}
                />,
                <MenuItem
                  key={'topLeft'}
                  value={'TopLeft'}
                  primaryText={'Top-Left'}
                />,
              ]}
            </SelectField>
          )}
          {this.renderNumericProperty(properties, 'shapeOffsetX', false, 0, 1)}
          {this.renderNumericProperty(properties, 'shapeOffsetY', false, 0, 1)}
        </Line>
        <Line>
          <Column>
            <Line>
              <div style={{ width: '100%' }}>
                <ImagePreview
                  resourceName={this.state.image}
                  project={this.props.project}
                  resourcesLoader={this.resourcesLoader}
                  onSize={this._setImageSize}
                >
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
                    width={this.state.imageWidth}
                    height={this.state.imageHeight}
                    onMoveVertex={(index, newX, newY) => {
                      let vertices = JSON.parse(
                        properties.get('vertices').getValue()
                      );
                      vertices[index].x = newX;
                      vertices[index].y = newY;
                      behavior.updateProperty(
                        'vertices',
                        JSON.stringify(vertices),
                        project
                      );
                      this.forceUpdate();
                    }}
                  />
                </ImagePreview>
              </div>
            </Line>
            <Line>
              <ResourceSelector
                project={this.props.project}
                resourceSources={this.props.resourceSources}
                onChooseResource={this.props.onChooseResource}
                resourceExternalEditors={this.props.resourceExternalEditors}
                resourcesLoader={this.resourcesLoader}
                resourceKind={'image'}
                initialResourceName={''}
                fullWidth={false}
                onChange={resourceName => {
                  this.setState({ image: resourceName });
                  this.forceUpdate();
                }}
              />
            </Line>
          </Column>
          {shape === 'Polygon' && (
            <PolygonEditor
              vertices={JSON.parse(properties.get('vertices').getValue())}
              onChangeVertexX={(newValue, index) => {
                let vertices = JSON.parse(
                  properties.get('vertices').getValue()
                );
                vertices[index].x = newValue;
                behavior.updateProperty(
                  'vertices',
                  JSON.stringify(vertices),
                  project
                );
                this.forceUpdate();
              }}
              onChangeVertexY={(newValue, index) => {
                let vertices = JSON.parse(
                  properties.get('vertices').getValue()
                );
                vertices[index].y = newValue;
                behavior.updateProperty(
                  'vertices',
                  JSON.stringify(vertices),
                  project
                );
                this.forceUpdate();
              }}
              onAdd={() => {
                let vertices = JSON.parse(
                  properties.get('vertices').getValue()
                );
                vertices.push({ x: 0, y: 0 });
                behavior.updateProperty(
                  'vertices',
                  JSON.stringify(vertices),
                  project
                );
                this.forceUpdate();
              }}
              onRemove={index => {
                let vertices = JSON.parse(
                  properties.get('vertices').getValue()
                );
                vertices.splice(index, 1);
                behavior.updateProperty(
                  'vertices',
                  JSON.stringify(vertices),
                  project
                );
                this.forceUpdate();
              }}
              hasWarning={!this._isPolygonConvex(properties)}
            />
          )}
        </Line>
        <Line>
          <SemiControlledTextField // Debug vertices raw content
            value={properties.get('vertices').getValue()}
            key={'verticesText'}
            floatingLabelText={'Raw Vertices'}
            floatingLabelFixed
            onChange={newValue => {
              behavior.updateProperty('vertices', newValue, project);
              this.forceUpdate();
            }}
            type="text"
          />
        </Line>
        <Line>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'density', true, 0, 0.1)}
          </div>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(
              properties,
              'gravityScale',
              false,
              0,
              0.1
            )}
          </div>
        </Line>
        <Line>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'friction', true, 0, 0.1)}
          </div>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(
              properties,
              'restitution',
              true,
              0,
              0.1
            )}
          </div>
        </Line>
        <Line>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(
              properties,
              'linearDamping',
              false,
              0,
              0.05
            )}
          </div>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(
              properties,
              'angularDamping',
              false,
              0,
              0.05
            )}
          </div>
        </Line>
        <Line>
          <label style={{ width: '10%' }}>
            {properties.get('layers').getLabel()}
          </label>
          {bits.map((value, index) => {
            return this.renderBitProperty(properties, true, index, index === 7);
          })}
        </Line>
        <Line>
          <label style={{ width: '10%' }}>
            {properties.get('masks').getLabel()}
          </label>
          {bits.map((value, index) => {
            return this.renderBitProperty(
              properties,
              false,
              index,
              index === 7
            );
          })}
        </Line>
      </Column>
    );
  }
}
