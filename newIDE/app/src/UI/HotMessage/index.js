// @flow
import * as React from 'react';
import { Line, Column } from '../Grid';
import Text from '../Text';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import DiscountFlame from './DiscountFlame';
import ChevronArrowRight from '../CustomSvgIcons/ChevronArrowRight';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

const styles = {
  paper: { padding: 10 },
  buttonLabel: { fontWeight: 'bold', cursor: 'default' },
};

type Props = {|
  title: React.Node,
  message: React.Node,
  onClickRightButton?: () => void,
  rightButtonLabel?: React.Node,
|};

const HotMessage = ({
  title,
  message,
  onClickRightButton,
  rightButtonLabel,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Paper
      style={{
        ...styles.paper,
        backgroundColor: gdevelopTheme.message.hot.backgroundColor,
        color: gdevelopTheme.message.hot.color,
      }}
    >
      <Line noMargin alignItems="center">
        <DiscountFlame fontSize="large" />
        <Column expand>
          <Text noMargin color="inherit" size="sub-title">
            {title}
          </Text>
          <Text noMargin color="inherit">
            {message}
          </Text>
        </Column>
        {onClickRightButton && rightButtonLabel && (
          <Line alignItems="center">
            <Link onClick={onClickRightButton} color="inherit">
              <Typography color="inherit" style={styles.buttonLabel}>
                {rightButtonLabel}
              </Typography>
            </Link>
            <ChevronArrowRight />
          </Line>
        )}
      </Line>
    </Paper>
  );
};

export default HotMessage;
