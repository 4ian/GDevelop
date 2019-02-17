// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Line, Column, Spacer } from '../../UI/Grid';
import ColorField from '../../UI/ColorField';
import { type EditorProps } from './EditorProps.flow';
const gd = global.gd;

export default class PanelSpriteEditor extends React.Component<
  EditorProps,
  void
> {
  render() {
    const { object } = this.props;
    const shapePainterObject = gd.asShapePainterObject(object);

    return (
      <Column>
        <Line>
          <Checkbox
            label={
              <Trans>
                Draw the shapes relative to the object position on the scene
              </Trans>
            }
            checked={!shapePainterObject.areCoordinatesAbsolute()}
            onCheck={(e, checked) => {
              if (!checked) shapePainterObject.setCoordinatesAbsolute();
              else shapePainterObject.setCoordinatesRelative();
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <ColorField
            floatingLabelText={<Trans>Outline color</Trans>}
            disableAlpha
            fullWidth
            color={{
              r: shapePainterObject.getOutlineColorR(),
              g: shapePainterObject.getOutlineColorG(),
              b: shapePainterObject.getOutlineColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              shapePainterObject.setOutlineColor(
                color.rgb.r,
                color.rgb.g,
                color.rgb.b
              );
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText={<Trans>Outline opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={shapePainterObject.getOutlineOpacity()}
            onChange={(e, value) => {
              shapePainterObject.setOutlineOpacity(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText={<Trans>Outline size (in pixels)</Trans>}
            fullWidth
            type="number"
            value={shapePainterObject.getOutlineSize()}
            onChange={(e, value) => {
              shapePainterObject.setOutlineSize(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <ColorField
            floatingLabelText={<Trans>Fill color</Trans>}
            disableAlpha
            fullWidth
            color={{
              r: shapePainterObject.getFillColorR(),
              g: shapePainterObject.getFillColorG(),
              b: shapePainterObject.getFillColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              shapePainterObject.setFillColor(
                color.rgb.r,
                color.rgb.g,
                color.rgb.b
              );
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText={<Trans>Fill opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={shapePainterObject.getFillOpacity()}
            onChange={(e, value) => {
              shapePainterObject.setFillOpacity(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <Spacer expand />
        </Line>
      </Column>
    );
  }
}
