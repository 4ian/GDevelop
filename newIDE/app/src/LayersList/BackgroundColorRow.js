// @flow
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import React from 'react';
import TextField from '../UI/TextField';
import ColorPicker from '../UI/ColorField/ColorPicker';
import { TreeTableCell, TreeTableRow } from '../UI/TreeTable';
import DragHandle from '../UI/DragHandle';

type Props = {|
  layout: gdLayout,
  onBackgroundColorChanged: () => void,
|};

const BackgroundColorRow = ({ layout, onBackgroundColorChanged }: Props) => (
  <I18n>
    {({ i18n }) => (
      <TreeTableRow>
        <TreeTableCell>
          <DragHandle disabled />
        </TreeTableCell>
        <TreeTableCell expand>
          <TextField
            fullWidth
            value={i18n._(t`Background color`)}
            margin="none"
            disabled
          />
        </TreeTableCell>
        <TreeTableCell>
          <ColorPicker
            disableAlpha
            color={{
              r: layout.getBackgroundColorRed(),
              g: layout.getBackgroundColorGreen(),
              b: layout.getBackgroundColorBlue(),
              a: 255,
            }}
            onChangeComplete={color => {
              layout.setBackgroundColor(color.rgb.r, color.rgb.g, color.rgb.b);
              onBackgroundColorChanged();
            }}
          />
        </TreeTableCell>
      </TreeTableRow>
    )}
  </I18n>
);

export default BackgroundColorRow;
