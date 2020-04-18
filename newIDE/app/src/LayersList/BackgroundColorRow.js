// @flow
import { t } from '@lingui/macro';

import React from 'react';
import TextField from '../UI/TextField';

import styles from './styles';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import ColorPicker from '../UI/ColorField/ColorPicker';
import { TreeTableCell, TreeTableRow } from '../UI/TreeTable';

type Props = {|
  layout: gdLayout,
  onBackgroundColorChanged: () => void,
|};

export default ({ layout, onBackgroundColorChanged }: Props) => (
  <TreeTableRow>
    <TreeTableCell style={styles.handleColumn} />
    <TreeTableCell expand>
      <TextField
        fullWidth
        hintText={t`Background color`}
        margin="none"
        disabled
      />
    </TreeTableCell>
    <TreeTableCell style={styles.effectsColumn}>
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
    <TreeTableCell style={styles.toolColumn} />
  </TreeTableRow>
);
