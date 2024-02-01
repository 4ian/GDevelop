// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Line } from '../../../../UI/Grid';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../../../UI/Text';
import Add from '../../../../UI/CustomSvgIcons/Add';
import { ColumnStackLayout } from '../../../../UI/Layout';

const styles = {
  button: {
    border: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    height: '100%',
    display: 'flex',
  },
  buttonBackground: { width: '100%', height: '100%', padding: 20 },
};

const useStyles = () =>
  makeStyles(theme =>
    createStyles({
      root: {
        '&:hover': {
          filter:
            theme.palette.type === 'dark'
              ? 'brightness(130%)'
              : 'brightness(90%)',
        },
        transition: 'filter 100ms ease',
      },
    })
  )();

type Props = {|
  onClick: () => void,
  fullWidth?: boolean,
|};

const CreateNewProjectButton = (props: Props) => {
  const muiTheme = useTheme();

  const classes = useStyles();
  return (
    <ButtonBase
      style={{
        ...styles.button,
        width: props.fullWidth ? '100%' : undefined,
        borderColor: muiTheme.palette.text.primary,
      }}
      classes={classes}
      onClick={props.onClick}
    >
      <Paper square={false} background="medium" style={styles.buttonBackground}>
        <Line justifyContent="center" noMargin>
          <ColumnStackLayout
            noMargin
            justifyContent="center"
            alignItems="center"
          >
            <Add fontSize="large" />
            <Text noMargin>
              <Trans>Create a project</Trans>
            </Text>
          </ColumnStackLayout>
        </Line>
      </Paper>
    </ButtonBase>
  );
};

export default CreateNewProjectButton;
