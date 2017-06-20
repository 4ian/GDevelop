import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../../UI/Grid';
import ResourceSelector from '../../ResourcesEditor/ResourceSelector';
const gd = global.gd;

export default class TextEditor extends Component {
  render() {
    const { object, project } = this.props;
    const tiledSpriteObject = gd.asTiledSpriteObject(object);

    return (
      <Column>
        <Line>
          <TextField
            floatingLabelText="Default width (in pixels)"
            fullWidth
            type="number"
            value={tiledSpriteObject.getWidth()}
            onChange={(e, value) => {
              tiledSpriteObject.setWidth(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Default height (in pixels)"
            fullWidth
            type="number"
            value={tiledSpriteObject.getHeight()}
            onChange={(e, value) => {
              tiledSpriteObject.setHeight(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <ResourceSelector
            project={project}
            resourceKind="image"
            initialResourceName={tiledSpriteObject.getTexture()}
            onChange={resourceName => {
              tiledSpriteObject.setTexture(resourceName);
            }}
          />
        </Line>
      </Column>
    );
  }
}
