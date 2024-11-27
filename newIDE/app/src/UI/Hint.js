// @flow

import * as React from 'react';
import { useTheme } from '@material-ui/styles';
import LampBulb from './CustomSvgIcons/LampBulb';
import Paper from './Paper';
import { MarkdownText } from './MarkdownText';

const styles = {
  container: {
    borderRadius: 4,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
  },
};

type Props = {|
  text: string,
|};

const Hint = ({ text }: Props) => {
  const muiTheme = useTheme();

  return (
    <Paper
      variant="outlined"
      background="dark"
      style={{
        ...styles.container,
        color: muiTheme.palette.warning.light,
      }}
    >
      <span
        style={{
          color: muiTheme.palette.warning.medium,
        }}
      >
        <LampBulb />
      </span>
      <MarkdownText source={text} />
    </Paper>
  );
};

export default Hint;
