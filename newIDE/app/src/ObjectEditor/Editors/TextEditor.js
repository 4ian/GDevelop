import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import MiniToolbar from '../../UI/MiniToolbar';
const gd = global.gd;

export default class TextEditor extends Component {
  render() {
    const { object } = this.props;
    const textObject = gd.asTextObject(object);

    return (
      <Column>
        <MiniToolbar>
          <p>Size:</p>
          <TextField
            type="number"
            value={textObject.getCharacterSize()}
            onChange={(e, value) => {
              textObject.setCharacterSize(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <ColorPicker
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
          <Checkbox
            label="Bold"
            checked={textObject.isBold()}
            onCheck={(e, checked) => {
              textObject.setBold(checked);
              this.forceUpdate();
            }}
            style={{width: 'auto'}}
          />
          <Checkbox
            label="Italic"
            checked={textObject.isItalic()}
            onCheck={(e, checked) => {
              textObject.setItalic(checked);
              this.forceUpdate();
            }}
            style={{width: 'auto'}}
          />
        </MiniToolbar>
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
      </Column>
    );
  }
}
