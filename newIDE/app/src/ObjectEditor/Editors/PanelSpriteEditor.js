import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ResourceSelector from '../../ResourcesEditor/ResourceSelector';
const gd = global.gd;

export default class PanelSpriteEditor extends Component {
  render() {
    const { object, project, resourceSources } = this.props;
    const panelSpriteObject = gd.asPanelSpriteObject(object);

    return (
      <Column>
        <Line>
          <ResourceSelector
            project={project}
            resourceSources={resourceSources}
            resourceKind="image"
            initialResourceName={panelSpriteObject.getTexture()}
            onChange={resourceName => {
              panelSpriteObject.setTexture(resourceName);
            }}
          />
        </Line>
        <Line>
          <Checkbox
            label="Repeat the center area"
            checked={panelSpriteObject.isTiled()}
            onCheck={(e, checked) => {
              panelSpriteObject.setTiled(checked);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Top margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getTopMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setTopMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Bottom margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getBottomMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setBottomMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Left margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getLeftMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setLeftMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Right margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getRightMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setRightMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Default width (in pixels)"
            fullWidth
            type="number"
            value={panelSpriteObject.getWidth()}
            onChange={(e, value) => {
              panelSpriteObject.setWidth(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Default height (in pixels)"
            fullWidth
            type="number"
            value={panelSpriteObject.getHeight()}
            onChange={(e, value) => {
              panelSpriteObject.setHeight(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
      </Column>
    );
  }
}
