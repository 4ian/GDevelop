// @flow
import * as React from 'react';
import RobotFace from '../UI/CustomSvgIcons/RobotFace';
import { makeStyles } from '@material-ui/core';

const useClasses = (rotating, size) =>
  makeStyles(theme => ({
    container: {
      position: 'relative',
      overflow: 'hidden',
      padding: size / 3.4,
      borderRadius: size / 3.4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '&::before': {
        content: "''",
        display: 'block',
        background: `conic-gradient(from -18deg at 59.52% 50%, #FFBC57 0deg, #F6945B 157.5deg, #DFA9E4 257.88461208343506deg, rgba(201, 182, 252, 0.00) 360deg)`,
        width: 'calc(100% * 1.41421356237)',
        paddingBottom: 'calc(100% * 1.41421356237)',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '100%',
        zIndex: 0,
        animation: 'spin-background 3s linear infinite',
        animationPlayState: rotating ? 'running' : 'paused',
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: `${(size / 3.4 - size / 4.5) * 2}px`,
        background: theme.palette.background.alternate,
        zIndex: 1,
        borderRadius: `${size / 4.5}px`,
      },
    },
    svgContainer: {
      display: 'flex',
      zIndex: 2,
    },
  }))();

type Props = {| rotating?: boolean, size?: number |};

export default function RobotIcon({ rotating, size }: Props) {
  const sizeOrDefaultSize = size || 34;

  const classes = useClasses(rotating, sizeOrDefaultSize);
  return (
    <div className={classes.container}>
      <div className={classes.svgContainer}>
        <RobotFace
          style={{
            width: Math.floor(sizeOrDefaultSize / 2.42),
            height: Math.floor(sizeOrDefaultSize / 2.42),
          }}
        />
      </div>
    </div>
  );
}
