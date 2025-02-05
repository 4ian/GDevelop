// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../UI/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '../../../UI/IconButton';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import DoubleChevronArrowLeft from '../../../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import HammerIcon from '../../../UI/CustomSvgIcons/Hammer';
import SchoolIcon from '../../../UI/CustomSvgIcons/School';
import ControllerIcon from '../../../UI/CustomSvgIcons/Controller';
import BookLeafIcon from '../../../UI/CustomSvgIcons/BookLeaf';
import SunIcon from '../../../UI/CustomSvgIcons/Sun';
import StoreIcon from '../../../UI/CustomSvgIcons/Store';
import Preferences from '../../../UI/CustomSvgIcons/Preferences';
import GDevelopGLogo from '../../../UI/CustomSvgIcons/GDevelopGLogo';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import HomePageMenuBar from './HomePageMenuBar';
import {
  shouldHideClassroomTab,
  type Limits,
} from '../../../Utils/GDevelopServices/Usage';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { isNativeMobileApp } from '../../../Utils/Platform';

export const styles = {
  // Ensure it's always interactive, even when another iframe disable pointer events.
  container: { pointerEvents: 'all', display: 'flex' },
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
  | 'create'
  | 'learn'
  | 'play'
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

const homePageMenuTabs: { [tab: HomeTab]: HomePageMenuTab } = {
  'get-started': {
    label: <Trans>Start</Trans>,
    tab: 'get-started',
    id: 'home-get-started-tab',
    getIcon: ({ color, fontSize }) => (
      <SunIcon fontSize={fontSize} color={color} />
    ),
  },
  create: {
    label: <Trans>Create</Trans>,
    tab: 'create',
    id: 'home-create-tab',
    getIcon: ({ color, fontSize }) => (
      <HammerIcon fontSize={fontSize} color={color} />
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
      <ControllerIcon fontSize={fontSize} color={color} />
    ),
  },
  'team-view': {
    label: <Trans>Teach</Trans>,
    tab: 'team-view',
    id: 'team-view-tab',
    getIcon: ({ color, fontSize }) => (
      <BookLeafIcon fontSize={fontSize} color={color} />
    ),
  },
};

export const getTabsToDisplay = ({
  limits,
}: {|
  limits: ?Limits,
|}): HomePageMenuTab[] => {
  const displayPlayTab =
    !limits ||
    !(
      limits.capabilities.classrooms &&
      limits.capabilities.classrooms.hidePlayTab
    );
  const displayShopTab =
    !limits ||
    !(
      limits.capabilities.classrooms &&
      limits.capabilities.classrooms.hidePremiumProducts
    );
  const tabs: HomeTab[] = [
    'get-started',
    'create',
    !shouldHideClassroomTab(limits) && !isNativeMobileApp()
      ? 'team-view'
      : null,
    displayShopTab ? 'shop' : null,
    'learn',
    displayPlayTab ? 'play' : null,
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
  const { limits } = React.useContext(AuthenticatedUserContext);
  const [
    isHomePageMenuDrawerOpen,
    setIsHomePageMenuDrawerOpen,
  ] = React.useState(false);

  const tabsToDisplay = getTabsToDisplay({ limits });

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
    <div style={styles.container}>
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
    </div>
  );
};
