// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ButtonBase from '@material-ui/core/ButtonBase';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import { type GDevelopTheme } from '../UI/Theme';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Options from '../UI/CustomSvgIcons/Options';
import Check from '../UI/CustomSvgIcons/Check';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import { type GamesDashboardOrderBy } from './GamesList';

export type GamesListFilter = 'active' | 'deleted';

type Props = {|
  filter: GamesListFilter,
  onFilterChange: (filter: GamesListFilter) => void,
  orderBy: GamesDashboardOrderBy,
  onOrderByChange: (orderBy: GamesDashboardOrderBy) => void,
|};

// Match the design of the search bar displayed next to the selector
// (see SearchBarContainer): same border, with the same hover and
// open ("focused") colors.
const usePaperStyles = ({
  theme,
  isMenuOpen,
}: {|
  theme: GDevelopTheme,
  isMenuOpen: boolean,
|}) =>
  makeStyles({
    root: {
      border: `1px solid ${
        isMenuOpen ? theme.searchBar.borderColor.focused : 'transparent'
      }`,
      '&:hover': {
        border:
          !isMenuOpen && `1px solid ${theme.searchBar.borderColor.hovered}`,
      },
    },
  })();

const styles = {
  // Match the design of the search bar displayed next to the selector
  // (see SearchBarContainer): same height, radius and background color.
  paper: {
    height: 30,
    borderRadius: 4,
    display: 'flex',
  },
  button: {
    padding: '4px 4px 4px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  optionsIcon: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'var(--gdevelop-modern-font-family)',
    whiteSpace: 'nowrap',
    margin: '0 4px 0 8px',
  },
  chevronIcon: {
    fontSize: 20,
  },
  subheader: {
    // The default ListSubheader line-height (48px) makes the header taller than
    // the items themselves - shrink it so it reads as a compact label.
    lineHeight: '20px',
    fontSize: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
  },
  // Reserved spot on the left of each selectable item, where a check is
  // displayed for the selected item of each group.
  checkContainer: {
    display: 'flex',
    alignItems: 'center',
    width: 24,
    flexShrink: 0,
  },
  checkIcon: {
    fontSize: 16,
  },
};

const GamesListFilterSelector = ({
  filter,
  onFilterChange,
  orderBy,
  onOrderByChange,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const paperStyles = usePaperStyles({ theme: gdevelopTheme, isMenuOpen });

  const subheaderStyle = {
    ...styles.subheader,
    color: gdevelopTheme.text.color.disabled,
  };

  const renderItemContent = (label: React.Node, selected: boolean) => (
    <div style={styles.menuItemContent}>
      <div style={styles.checkContainer}>
        {selected && <Check style={styles.checkIcon} />}
      </div>
      {label}
    </div>
  );

  return (
    <>
      <Paper
        classes={paperStyles}
        style={{
          ...styles.paper,
          backgroundColor: gdevelopTheme.searchBar.backgroundColor.default,
        }}
      >
        <ButtonBase
          onClick={e => setAnchorEl(e.currentTarget)}
          style={styles.button}
        >
          <Options style={styles.optionsIcon} />
          <span style={styles.label}>
            {filter === 'deleted' ? (
              <Trans>Deleted projects</Trans>
            ) : (
              <Trans>Active projects</Trans>
            )}
          </span>
          <ChevronArrowBottom style={styles.chevronIcon} />
        </ButtonBase>
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ dense: true }}
      >
        <ListSubheader disableSticky style={subheaderStyle}>
          <Trans>Show:</Trans>
        </ListSubheader>
        <MenuItem
          onClick={() => {
            onFilterChange('active');
            setAnchorEl(null);
          }}
        >
          {renderItemContent(
            <Trans>Active projects</Trans>,
            filter === 'active'
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onFilterChange('deleted');
            setAnchorEl(null);
          }}
        >
          {renderItemContent(<Trans>Deleted</Trans>, filter === 'deleted')}
        </MenuItem>
        <ListSubheader disableSticky style={subheaderStyle}>
          <Trans>Order:</Trans>
        </ListSubheader>
        <MenuItem
          onClick={() => {
            onOrderByChange('lastModifiedAt');
            setAnchorEl(null);
          }}
        >
          {renderItemContent(
            <Trans>Last modified</Trans>,
            orderBy === 'lastModifiedAt'
          )}
        </MenuItem>
        <MenuItem
          disabled={filter === 'deleted'}
          onClick={() => {
            onOrderByChange('totalSessions');
            setAnchorEl(null);
          }}
        >
          {renderItemContent(
            <Trans>Most sessions (all time)</Trans>,
            orderBy === 'totalSessions'
          )}
        </MenuItem>
        <MenuItem
          disabled={filter === 'deleted'}
          onClick={() => {
            onOrderByChange('weeklySessions');
            setAnchorEl(null);
          }}
        >
          {renderItemContent(
            <Trans>Most sessions (past 7 days)</Trans>,
            orderBy === 'weeklySessions'
          )}
        </MenuItem>
      </Menu>
    </>
  );
};

export default GamesListFilterSelector;
