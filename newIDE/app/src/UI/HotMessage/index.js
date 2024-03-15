// @flow
import * as React from 'react';
import { Line, Column } from '../Grid';
import Text from '../Text';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import DiscountFlame from './DiscountFlame';
import ChevronArrowRight from '../CustomSvgIcons/ChevronArrowRight';

const styles = {
  paper: {
    padding: 10,
    color: '#000',
    // TODO: Use a new attribute from the theme.
    backgroundColor: '#FF5E3B',
  },
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
  return (
    <Paper style={styles.paper}>
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
              <Typography color="inherit">{rightButtonLabel}</Typography>
            </Link>
            <ChevronArrowRight />
          </Line>
        )}
      </Line>
    </Paper>
  );
};

export default HotMessage;
