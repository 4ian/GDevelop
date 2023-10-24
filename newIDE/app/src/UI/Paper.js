// @flow
import * as React from 'react';
import MuiPaper from '@material-ui/core/Paper';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { type GDevelopTheme } from './Theme';

type Props = {|
  id?: string,
  children: React.Node,
  elevation?: number,
  variant?: 'outlined',
  // The background property allows to create contrast between papers,
  // 'dark' corresponds to the darker background on Dark theme,
  // but it corresponds to the lighter background on Light theme.
  background: 'light' | 'medium' | 'dark',
  style?: Object,
  square?: boolean,
|};

export const getBackgroundColor = (
  gdevelopTheme: GDevelopTheme,
  backgroundColor: 'light' | 'medium' | 'dark'
) =>
  backgroundColor === 'dark'
    ? gdevelopTheme.paper.backgroundColor.dark
    : backgroundColor === 'medium'
    ? gdevelopTheme.paper.backgroundColor.medium
    : gdevelopTheme.paper.backgroundColor.light;

export type PaperInterface = {|
  scrollToBottom: (options: ?{| smooth?: boolean |}) => void,
|};

const Paper = React.forwardRef<Props, PaperInterface>(
  ({ id, children, background, elevation, variant, style, square }, ref) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const backgroundColor = getBackgroundColor(gdevelopTheme, background);
    const paperRef = React.useRef<?MuiPaper>(null);

    const scrollToBottom = React.useCallback(options => {
      if (paperRef.current) {
        paperRef.current.scroll({
          top: 1000000,
          behavior: options && options.smooth ? 'smooth' : 'auto',
        });
      }
    }, []);

    React.useImperativeHandle(ref, () => ({ scrollToBottom }));

    return (
      <MuiPaper
        id={id}
        ref={paperRef}
        variant={variant}
        elevation={elevation || 0}
        style={{
          backgroundColor,
          ...style,
        }}
        square={!!square}
      >
        {children}
      </MuiPaper>
    );
  }
);

export default Paper;
