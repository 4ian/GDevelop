// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../UI/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '../../../UI/IconButton';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import DoubleChevronArrowLeft from '../../../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import PickAxeIcon from '../../../UI/CustomSvgIcons/PickAxe';
import SchoolIcon from '../../../UI/CustomSvgIcons/School';
import GoogleControllerIcon from '../../../UI/CustomSvgIcons/GoogleController';
import WebIcon from '../../../UI/CustomSvgIcons/Web';
import BookLeafIcon from '../../../UI/CustomSvgIcons/BookLeaf';
import SunIcon from '../../../UI/CustomSvgIcons/Sun';
import StoreIcon from '../../../UI/CustomSvgIcons/Store';
import Preferences from '../../../UI/CustomSvgIcons/Preferences';
import GDevelopGLogo from '../../../UI/CustomSvgIcons/GDevelopGLogo';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import HomePageMenuBar from './HomePageMenuBar';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export const styles = {
  drawerContent: {
    height: '100%',
    width: 250,
    paddingBottom: 10,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerTopButtonsContainer: {
    flex: 1,
    marginTop: 'env(safe-area-inset-top)',
  },
  drawerBottomButtonsContainer: {
    marginBottom: 'env(safe-area-inset-bottom)',
  },
};

export type HomeTab =
  | 'get-started'
  | 'build'
  | 'learn'
  | 'play'
  | 'community'
  | 'shop'
  | 'team-view';

export const homePageMenuTabs: {
  label: React.Node,
  tab: HomeTab,
  getIcon: (color: string) => React.Node,
  id: string,
}[] = [
  {
    label: <Trans>Get Started</Trans>,
    tab: 'get-started',
    id: 'home-get-started-tab',
    getIcon: color => <SunIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Build</Trans>,
    tab: 'build',
    id: 'home-build-tab',
    getIcon: color => <PickAxeIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Shop</Trans>,
    tab: 'shop',
    id: 'home-shop-tab',
    getIcon: color => <StoreIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Learn</Trans>,
    tab: 'learn',
    id: 'home-learn-tab',
    getIcon: color => <SchoolIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Play</Trans>,
    tab: 'play',
    id: 'home-play-tab',
    getIcon: color => <GoogleControllerIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Community</Trans>,
    tab: 'community',
    id: 'home-community-tab',
    getIcon: color => <WebIcon fontSize="small" color={color} />,
  },
];

export const teamViewTab = {
  label: <Trans>Classrooms</Trans>,
  tab: 'team-view',
  id: 'team-view-tab',
  getIcon: (color: string) => <BookLeafIcon fontSize="small" color={color} />,
};

type Props = {|
  setActiveTab: HomeTab => void,
  activeTab: HomeTab,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,
|};

export const HomePageMenu = ({
  setActiveTab,
  activeTab,
  onOpenPreferences,
  onOpenAbout,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { profile } = React.useContext(AuthenticatedUserContext);
  const displayTeamViewTab = profile && profile.isTeacher;
  const [
    isHomePageMenuDrawerOpen,
    setIsHomePageMenuDrawerOpen,
  ] = React.useState(false);

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

  return (
    <>
      <HomePageMenuBar
        activeTab={activeTab}
        onOpenAbout={onOpenAbout}
        onOpenHomePageMenuDrawer={() => setIsHomePageMenuDrawerOpen(true)}
        onOpenPreferences={onOpenPreferences}
        setActiveTab={setActiveTab}
      />
      <Drawer
        open={isHomePageMenuDrawerOpen}
        PaperProps={{
          style: {
            ...styles.drawerContent,
            backgroundColor: gdevelopTheme.home.header.backgroundColor,
          },
          className: 'safe-area-aware-left-container',
        }}
        onClose={() => {
          setIsHomePageMenuDrawerOpen(false);
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Line expand>
          <Column expand>
            <div style={styles.drawerTopButtonsContainer}>
              <Column noMargin expand>
                <Line noMargin justifyContent="flex-end">
                  <IconButton
                    onClick={() => {
                      setIsHomePageMenuDrawerOpen(false);
                    }}
                    size="small"
                  >
                    <DoubleChevronArrowLeft />
                  </IconButton>
                </Line>
                {tabsToDisplay.map(({ label, tab, getIcon }, index) => (
                  <VerticalTabButton
                    key={index}
                    label={label}
                    onClick={() => {
                      setActiveTab(tab);
                      setIsHomePageMenuDrawerOpen(false);
                    }}
                    getIcon={getIcon}
                    isActive={activeTab === tab}
                  />
                ))}
              </Column>
            </div>
            <div style={styles.drawerBottomButtonsContainer}>
              <Column noMargin>
                {buttons.map(({ label, getIcon, onClick, id }) => (
                  <VerticalTabButton
                    key={id}
                    label={label}
                    onClick={onClick}
                    getIcon={getIcon}
                    isActive={false}
                  />
                ))}
              </Column>
            </div>
          </Column>
        </Line>
      </Drawer>
    </>
  );
};
