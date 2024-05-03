// @flow
import * as React from 'react';
import RobotFace from '../UI/CustomSvgIcons/RobotFace';
import { makeStyles } from '@material-ui/core';

const useClasses = rotating =>
  makeStyles(theme => ({
    container: {
      position: 'relative',
      overflow: 'hidden',
      padding: '0.75rem',
      borderRadius: '0.75rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '&::before': {
        content: "''",
        display: 'block',
        background: `conic-gradient(${
          theme.palette.type === 'light' ? '#f0f0f0' : '#262231'
        }, #b07bf7)`,
        width: 'calc(100% * 1.41421356237)',
        paddingBottom: 'calc(100% * 1.41421356237)',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '100%',
        zIndex: 0,
        animation: rotating ? 'spin-background 3s linear infinite' : 'none',
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: '0.35rem',
        background: theme.palette.background.alternate,
        zIndex: 1,
        borderRadius: '0.5rem',
      },
    },
    svgContainer: {
      display: 'flex',
      zIndex: 2,
    },
  }))();

type Props = {| rotating?: boolean |};

export default function RobotIcon({ rotating }: Props) {
  const classes = useClasses(rotating);
  return (
    <div className={classes.container}>
      <div className={classes.svgContainer}>
        <RobotFace />
      </div>
    </div>
  );
}
