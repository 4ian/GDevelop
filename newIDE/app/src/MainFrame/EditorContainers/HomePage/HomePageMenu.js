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
import type { Profile } from '../../../Utils/GDevelopServices/Authentication';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import GraphsIcon from '../../../UI/CustomSvgIcons/Graphs';

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
  | 'manage'
  | 'build'
  | 'learn'
  | 'play'
  | 'community'
  | 'shop'
  | 'team-view';

export type GetIconFunction = ({
  color: string,
  fontSize: 'inherit' | 'small',
}) => React.Node;

export type HomePageMenuTab = {|
  label: React.Node,
  tab: HomeTab,
  getIcon: GetIconFunction,
  id: string,
|};

const homePageMenuTabs: { [tab: string]: HomePageMenuTab } = {
  'get-started': {
    label: <Trans>Get Started</Trans>,
    tab: 'get-started',
    id: 'home-get-started-tab',
    getIcon: ({ color, fontSize }) => (
      <SunIcon fontSize={fontSize} color={color} />
    ),
  },
  build: {
    label: <Trans>Build</Trans>,
    tab: 'build',
    id: 'home-build-tab',
    getIcon: ({ color, fontSize }) => (
      <PickAxeIcon fontSize={fontSize} color={color} />
    ),
  },
  manage: {
    label: <Trans>Manage</Trans>,
    tab: 'manage',
    id: 'home-manage-tab',
    getIcon: ({ color, fontSize }) => (
      <GraphsIcon fontSize={fontSize} color={color} />
    ),
  },
  shop: {
    label: <Trans>Shop</Trans>,
    tab: 'shop',
    id: 'home-shop-tab',
    getIcon: ({ color, fontSize }) => (
      <StoreIcon fontSize={fontSize} color={color} />
    ),
  },
  learn: {
    label: <Trans>Learn</Trans>,
    tab: 'learn',
    id: 'home-learn-tab',
    getIcon: ({ color, fontSize }) => (
      <SchoolIcon fontSize={fontSize} color={color} />
    ),
  },
  play: {
    label: <Trans>Play</Trans>,
    tab: 'play',
    id: 'home-play-tab',
    getIcon: ({ color, fontSize }) => (
      <GoogleControllerIcon fontSize={fontSize} color={color} />
    ),
  },
  community: {
    label: <Trans>Community</Trans>,
    tab: 'community',
    id: 'home-community-tab',
    getIcon: ({ color, fontSize }) => (
      <WebIcon fontSize={fontSize} color={color} />
    ),
  },
  'team-view': {
    label: <Trans>Classrooms</Trans>,
    tab: 'team-view',
    id: 'team-view-tab',
    getIcon: ({ color, fontSize }) => (
      <BookLeafIcon fontSize={fontSize} color={color} />
    ),
  },
};

export const getTabsToDisplay = ({
  profile,
}: {|
  profile: ?Profile,
|}): HomePageMenuTab[] => {
  const displayTeamViewTab = profile && profile.isTeacher;
  const displayPlayTab = !profile || !profile.isStudent;
  const tabs = [
    'get-started',
    'build',
    displayTeamViewTab ? 'team-view' : null,
    'manage',
    'shop',
    'learn',
    displayPlayTab ? 'play' : null,
    'community',
  ].filter(Boolean);
  return tabs.map(tab => homePageMenuTabs[tab]);
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
  const [
    isHomePageMenuDrawerOpen,
    setIsHomePageMenuDrawerOpen,
  ] = React.useState(false);

  const tabsToDisplay = getTabsToDisplay({ profile });

  const buttons: {
    label: React.Node,
    getIcon: ({ color: string, fontSize: 'inherit' | 'small' }) => React.Node,
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
                {tabsToDisplay.map(({ label, tab, getIcon, id }) => (
                  <VerticalTabButton
                    key={id}
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
