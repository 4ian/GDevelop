// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { createStyles, makeStyles } from '@material-ui/core';
import ChevronArrowLeft from '../../UI/CustomSvgIcons/ChevronArrowLeft';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';

const arrowWidth = 30;

const styles = {
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: 4,
  },
};

const useStylesForArrowButtons = () =>
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

type SlideshowArrowProps = {|
  onClick: () => void,
  position: 'left' | 'right',
|};

const SlideshowArrow = ({ onClick, position }: SlideshowArrowProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const classesForArrowButtons = useStylesForArrowButtons();

  return (
    <div
      className={classesForArrowButtons.root}
      style={{
        ...styles.arrowContainer,
        backgroundColor: gdevelopTheme.paper.backgroundColor.light,
        width: arrowWidth,
        height: arrowWidth,
        ...(position === 'left' ? { left: 5 } : { right: 5 }),
        zIndex: 3,
        top: `calc(50% - ${Math.floor(arrowWidth / 2)}px)`,
      }}
      onClick={onClick}
    >
      {position === 'left' ? <ChevronArrowLeft /> : <ChevronArrowRight />}
    </div>
  );
};

export default SlideshowArrow;
