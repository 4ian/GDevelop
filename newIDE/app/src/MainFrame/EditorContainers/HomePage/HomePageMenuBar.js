// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, marginsSize } from '../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import IconButton from '../../../UI/IconButton';
import DoubleChevronArrowRight from '../../../UI/CustomSvgIcons/DoubleChevronArrowRight';
import VerticalTabButton, {
  verticalTabButtonSize,
} from '../../../UI/VerticalTabButton';
import Preferences from '../../../UI/CustomSvgIcons/Preferences';
import GDevelopGLogo from '../../../UI/CustomSvgIcons/GDevelopGLogo';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import Paper from '../../../UI/Paper';
import {
  type HomeTab,
  type GetIconFunction,
  getTabsToDisplay,
} from './HomePageMenu';
import { Toolbar, ToolbarGroup } from '../../../UI/Toolbar';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

const iconSize = 20;
const iconButtonPaddingVertical = 8;
const iconButtonPaddingHorizontal = 5;
const iconButtonLabelPadding = 6;
const toolbarHeight =
  iconSize + 2 * iconButtonLabelPadding + 2 * iconButtonPaddingVertical;
export const homepageDesktopMenuBarWidth = 230;
export const homepageMediumMenuBarWidth =
  verticalTabButtonSize + 2 * marginsSize;

export const styles = {
  desktopMenu: {
    paddingTop: 40,
    paddingBottom: 10,
    minWidth: homepageDesktopMenuBarWidth,
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
    fontSize: iconSize,
    height: toolbarHeight,
  },
  bottomButtonsContainer: {
    marginBottom: 'env(safe-area-inset-bottom)',
  },
  mobileButton: {
    padding: `${iconButtonPaddingVertical}px ${iconButtonPaddingHorizontal}px`,
    fontSize: 'inherit',
  },
  buttonLabel: { padding: iconButtonLabelPadding, display: 'flex' },
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
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();
  const isMobileOrSmallScreen = isMobile || isMediumScreen;
  const theme = React.useContext(GDevelopThemeContext);
  const { profile } = React.useContext(AuthenticatedUserContext);
  const tabsToDisplay = getTabsToDisplay({ profile });
  const largeScreenOnlyButtons: {
    label: React.Node,
    getIcon: GetIconFunction,
    id: string,
    onClick: () => void,
  }[] = [
    {
      label: <Trans>Preferences</Trans>,
      id: 'settings',
      onClick: onOpenPreferences,
      getIcon: ({ color, fontSize }) => (
        <Preferences fontSize={fontSize} color={color} />
      ),
    },
    {
      label: <Trans>About GDevelop</Trans>,
      id: 'about-gdevelop',
      onClick: onOpenAbout,
      getIcon: ({ color, fontSize }) => (
        <GDevelopGLogo fontSize={fontSize} color={color} />
      ),
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
        <Toolbar height={toolbarHeight}>
          <ToolbarGroup>
            {tabsToDisplay.map(({ label, tab, getIcon, id }) => {
              const isActive = activeTab === tab;
              return (
                <IconButton
                  color="default"
                  key={id}
                  disableRipple
                  disableFocusRipple
                  style={styles.mobileButton}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  selected={isActive}
                  id={id}
                >
                  <span style={styles.buttonLabel}>
                    {getIcon({
                      color: isActive ? 'inherit' : 'secondary',
                      fontSize: 'inherit',
                    })}
                  </span>
                </IconButton>
              );
            })}
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
          {largeScreenOnlyButtons.map(({ label, getIcon, onClick, id }) => (
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
