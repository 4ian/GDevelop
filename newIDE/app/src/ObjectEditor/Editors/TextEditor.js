import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../../UI/Grid';
import ColorField from '../../UI/ColorField';
const gd = global.gd;

export default class TextEditor extends Component {
  render() {
    const { object } = this.props;
    const textObject = gd.asTextObject(object);

    return (
      <Column>
        <Line>
          <TextField
            hintText="Enter the text to be displayed by the object"
            fullWidth
            multiLine={true}
            value={textObject.getString()}
            onChange={(e, value) => {
              textObject.setString(value);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Character size"
            fullWidth
            type="number"
            value={textObject.getCharacterSize()}
            onChange={(e, value) => {
              textObject.setCharacterSize(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <Checkbox
            label="Bold"
            checked={textObject.isBold()}
            onCheck={(e, checked) => {
              textObject.setBold(checked);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <Checkbox
            label="Italic"
            checked={textObject.isItalic()}
            onCheck={(e, checked) => {
              textObject.setItalic(checked);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <ColorField
            floatingLabelText="Text color"
            fullWidth
            disableAlpha
            color={{
              r: textObject.getColorR(),
              g: textObject.getColorG(),
              b: textObject.getColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              textObject.setColor(color.rgb.r, color.rgb.g, color.rgb.b);
              this.forceUpdate();
            }}
          />
        </Line>
      </Column>
    );
  }
}
