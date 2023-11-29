// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column } from '../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import IconButton from '../../../UI/IconButton';
import DoubleChevronArrowRight from '../../../UI/CustomSvgIcons/DoubleChevronArrowRight';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import Preferences from '../../../UI/CustomSvgIcons/Preferences';
import GDevelopGLogo from '../../../UI/CustomSvgIcons/GDevelopGLogo';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import Paper from '../../../UI/Paper';
import { homePageMenuTabs, teamViewTab, type HomeTab } from './HomePageMenu';
import { Toolbar, ToolbarGroup } from '../../../UI/Toolbar';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export const styles = {
  desktopMenu: {
    paddingTop: 40,
    paddingBottom: 10,
    minWidth: 230,
    display: 'flex',
    flexDirection: 'column',
  },
  mobileMenu: {
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  mobileContainer: {
    width: '100%',
  },
  bottomButtonsContainer: {
    marginBottom: 'env(safe-area-inset-bottom)',
  },
  button: { padding: 6 },
  buttonLabel: { padding: '0 6px' },
};

type Props = {|
  setActiveTab: HomeTab => void,
  activeTab: HomeTab,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,
  onOpenHomePageMenuDrawer: () => void,
|};

const HomePageMenuBar = ({
  setActiveTab,
  activeTab,
  onOpenPreferences,
  onOpenAbout,
  onOpenHomePageMenuDrawer,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const isMobileOrSmallScreen = isMobile || windowWidth === 'medium';
  const theme = React.useContext(GDevelopThemeContext);
  const { profile } = React.useContext(AuthenticatedUserContext);
  const displayTeamViewTab = profile && profile.isTeacher;
  const tabsToDisplay = displayTeamViewTab
    ? [
        ...homePageMenuTabs.slice(0, 2),
        teamViewTab,
        ...homePageMenuTabs.slice(2),
      ]
    : homePageMenuTabs;

  const buttons: {
    label: React.Node,
    getIcon: (color: string) => React.Node,
    id: string,
    onClick: () => void,
  }[] = [
    {
      label: <Trans>Preferences</Trans>,
      id: 'settings',
      onClick: onOpenPreferences,
      getIcon: color => <Preferences fontSize="small" color={color} />,
    },
    {
      label: <Trans>About GDevelop</Trans>,
      id: 'about-gdevelop',
      onClick: onOpenAbout,
      getIcon: color => <GDevelopGLogo fontSize="small" color={color} />,
    },
  ];

  if (isMobile) {
    return (
      <Paper
        background="medium"
        square
        style={{
          ...styles.mobileContainer,
          borderTop: `1px solid ${theme.home.separator.color}`,
        }}
      >
        <Toolbar>
          <ToolbarGroup>
            {tabsToDisplay.map(({ label, tab, getIcon, id }) => {
              const isActive = activeTab === tab;
              return (
                <IconButton
                  color="default"
                  key={id}
                  disableRipple
                  disableFocusRipple
                  style={styles.button}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  selected={isActive}
                  id={id}
                >
                  <span style={styles.buttonLabel}>
                    {getIcon(isActive ? 'inherit' : 'secondary')}
                  </span>
                </IconButton>
              );
            })}
            <span
              style={{
                width: 1,
                backgroundColor: theme.home.separator.color,
                height: '70%',
                margin: '0 3px',
              }}
            />
            {buttons.map(({ label, onClick, getIcon, id }) => (
              <IconButton
                color="default"
                key={id}
                disableRipple
                disableFocusRipple
                style={styles.button}
                onClick={onClick}
                id={id}
              >
                <span style={styles.buttonLabel}>{getIcon('secondary')}</span>
              </IconButton>
            ))}
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    );
  }

  return (
    <Paper
      style={{
        ...(isMobileOrSmallScreen ? styles.mobileMenu : styles.desktopMenu),
        borderRight: `1px solid ${theme.home.separator.color}`,
      }}
      square
      background="dark"
    >
      <Column expand>
        {isMobileOrSmallScreen && (
          <IconButton onClick={onOpenHomePageMenuDrawer} size="small">
            <DoubleChevronArrowRight />
          </IconButton>
        )}
        {tabsToDisplay.map(({ label, tab, getIcon, id }) => (
          <VerticalTabButton
            key={id}
            label={label}
            onClick={() => setActiveTab(tab)}
            getIcon={getIcon}
            isActive={activeTab === tab}
            hideLabel={isMobileOrSmallScreen}
            id={id}
          />
        ))}
      </Column>

      <div style={styles.bottomButtonsContainer}>
        <Column>
          {buttons.map(({ label, getIcon, onClick, id }) => (
            <VerticalTabButton
              key={id}
              label={label}
              onClick={onClick}
              getIcon={getIcon}
              isActive={false}
              hideLabel={isMobileOrSmallScreen}
              id={id}
            />
          ))}
        </Column>
      </div>
    </Paper>
  );
};

export default HomePageMenuBar;
