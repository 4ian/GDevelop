// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Column, Line } from './Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { textEllipsisStyle } from './TextEllipsis';
import { type GDevelopTheme } from './Theme';
import Search from './CustomSvgIcons/Search';
import { dataObjectToProps } from '../Utils/HTMLDataset';
import Filter from './CustomSvgIcons/Filter';
import HelpIcon from './HelpIcon';
import IconButton from './IconButton';
import Cross from './CustomSvgIcons/Cross';
import ElementWithMenu from './Menu/ElementWithMenu';
import { type MenuItemTemplate } from './Menu/Menu.flow';

// We override the style of paper for the border, as we need access
// to the hover/focus status of the paper to change the border color.
const usePaperStyles = ({
  theme,
  disabled,
  nonEmpty,
  focused,
}: {|
  nonEmpty: boolean,
  disabled: boolean,
  theme: GDevelopTheme,
  focused: boolean,
|}) =>
  makeStyles({
    root: {
      border: `1px solid ${
        focused ? theme.searchBar.borderColor.focused : 'transparent'
      }`,
      '&:hover': {
        border:
          !focused &&
          !disabled &&
          `1px solid ${theme.searchBar.borderColor.hovered}`,
      },
    },
  })();

// Defines the space an icon takes with a button, to place the popper accordingly.
const leftIconSpace = 43;
const rightIconSpace = 33;

const getStyles = ({
  nonEmpty,
  disabled,
  theme,
  aspect,
  focused,
  hasHelpPage,
}: {|
  nonEmpty: boolean,
  disabled: boolean,
  theme: GDevelopTheme,
  aspect?: 'integrated-search-bar',
  focused: boolean,
  hasHelpPage: boolean,
|}) => {
  const iconOpacity = !disabled ? 1 : 0.38;
  const iconSize = 30;
  return {
    root: {
      height: 30,
      display: 'flex',
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: disabled
        ? theme.searchBar.backgroundColor.disabled
        : theme.searchBar.backgroundColor.default,
      borderRadius: aspect === 'integrated-search-bar' ? 0 : 4,
    },
    iconButtonClose: {
      style: {
        opacity: iconOpacity,
        visibility: nonEmpty && !disabled ? 'visible' : 'hidden',
        transition: 'visibility 0s linear 0.1s',
      },
    },
    iconButtonSearch: {
      container: {
        padding: '5px 10px',
      },
      iconStyle: {
        fontSize: 18,
        opacity: focused ? 1 : 0.5,
        transition: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    iconButtonFilter: {
      style: {
        opacity: iconOpacity,
        transform: nonEmpty ? 'translateX(0)' : `translateX(${iconSize}px)`,
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    iconButtonHelp: {
      style: {
        opacity: iconOpacity,
        transform: nonEmpty ? 'translateX(0)' : `translateX(${iconSize}px)`,
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
    inputStyle: {
      padding: 0,
      color: disabled
        ? theme.searchBar.textColor.disabled
        : nonEmpty && focused
        ? theme.searchBar.textColor.focused
        : theme.searchBar.textColor.default,
      ...textEllipsisStyle,
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      width: '100%',
    },
    inputContainer: {
      margin: 'auto 4px',
      flex: 1,
    },
    popperContainer: {
      left: `-${leftIconSpace}px`,
      right: hasHelpPage ? `-${2 * rightIconSpace}px` : `-${rightIconSpace}px`,
      position: 'absolute',
      zIndex: 1, // Make sure the Popper is above the search bar.
    },
  };
};

type Props = {|
  renderContent: ({|
    inputStyle: Object,
    popperContainerStyle: Object,
  |}) => React.Node,
  disabled?: boolean,
  isSearchBarEmpty: boolean,
  isFocused: boolean,
  helpPagePath?: ?string,
  aspect?: 'integrated-search-bar',
  buildMenuTemplate?: (i18n: I18nType) => Array<MenuItemTemplate>,
  onCancel: () => void,
  renderSubLine?: ?() => React.Node,
|};

const SearchBarContainer = ({
  renderContent,
  disabled,
  isSearchBarEmpty,
  isFocused,
  helpPagePath,
  aspect,
  buildMenuTemplate,
  onCancel,
  renderSubLine,
}: Props) => {
  const GDevelopTheme = React.useContext(GDevelopThemeContext);

  const styles = getStyles({
    nonEmpty: !isSearchBarEmpty,
    disabled: !!disabled,
    theme: GDevelopTheme,
    aspect,
    focused: isFocused,
    hasHelpPage: !!helpPagePath,
  });

  const paperStyles = usePaperStyles({
    theme: GDevelopTheme,
    disabled: !!disabled,
    nonEmpty: !isSearchBarEmpty,
    focused: isFocused,
  });

  const content = React.useMemo(
    () =>
      renderContent({
        inputStyle: styles.inputStyle,
        popperContainerStyle: styles.popperContainer,
      }),
    [renderContent, styles.inputStyle, styles.popperContainer]
  );

  return (
    <Column noMargin>
      <Line noMargin>
        <Paper classes={paperStyles} style={styles.root}>
          <div style={styles.iconButtonSearch.container}>
            <Search
              style={styles.iconButtonSearch.iconStyle}
              viewBox="2 2 12 12"
            />
          </div>
          <div
            style={styles.searchContainer}
            {...dataObjectToProps({ searchBarContainer: 'true' })}
          >
            <div style={styles.inputContainer}>{content}</div>
          </div>
          {buildMenuTemplate && (
            <ElementWithMenu
              element={
                <IconButton
                  style={styles.iconButtonFilter.style}
                  disabled={disabled}
                  size="small"
                >
                  <Filter />
                </IconButton>
              }
              buildMenuTemplate={buildMenuTemplate}
            />
          )}
          {helpPagePath && (
            <HelpIcon
              disabled={disabled}
              helpPagePath={helpPagePath}
              style={styles.iconButtonHelp.style}
              size="small"
            />
          )}
          <IconButton
            onClick={onCancel}
            style={styles.iconButtonClose.style}
            disabled={disabled}
            size="small"
          >
            <Cross />
          </IconButton>
        </Paper>
      </Line>
      {renderSubLine && renderSubLine()}
    </Column>
  );
};

export default SearchBarContainer;
