// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from '../UI/TextField';

import styles from './styles';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import ColorPicker from '../UI/ColorField/ColorPicker';

type Props = {|
  layout: gdLayout,
  onBackgroundColorChanged: () => void,
|};

export default ({ layout, onBackgroundColorChanged }: Props) => (
  <ThemeConsumer>
    {muiTheme => (
      <TableRow
        style={{
          backgroundColor: muiTheme.list.itemsBackgroundColor,
        }}
      >
        <TableRowColumn style={styles.handleColumn} />
        <TableRowColumn>
          <TextField hintText={<Trans>Background color</Trans>} disabled />
        </TableRowColumn>
        <TableRowColumn style={styles.effectsColumn}>
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
        </TableRowColumn>
        <TableRowColumn style={styles.toolColumn} />
      </TableRow>
    )}
  </ThemeConsumer>
);
