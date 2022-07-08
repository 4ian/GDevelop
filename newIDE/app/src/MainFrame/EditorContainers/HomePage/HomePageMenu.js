// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../UI/Grid';
import { Drawer, Paper } from '@material-ui/core';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import IconButton from '../../../UI/IconButton';
import DoubleChevronArrowRight from '../../../UI/CustomSvgIcons/DoubleChevronArrowRight';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import DoubleChevronArrowLeft from '../../../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import PickAxeIcon from '../../../UI/CustomSvgIcons/PickAxe';
import SchoolIcon from '../../../UI/CustomSvgIcons/School';
import GoogleControllerIcon from '../../../UI/CustomSvgIcons/GoogleController';
import WebIcon from '../../../UI/CustomSvgIcons/Web';
import Sun from '../../../UI/CustomSvgIcons/Sun';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';

export const styles = {
  desktopMenu: {
    paddingTop: 40,
    minWidth: 230,
  },
  mobileMenu: {
    paddingTop: 10,
  },
  drawerContent: {
    height: '100%',
    width: 250,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

export type HomeTab = 'get-started' | 'build' | 'learn' | 'play' | 'community';

const tabs: {
  label: React.Node,
  tab: HomeTab,
  getIcon: (color: string) => React.Node,
}[] = [
  {
    label: <Trans>Get Started</Trans>,
    tab: 'get-started',
    getIcon: color => <Sun fontSize="small" color={color} />,
  },
  {
    label: <Trans>Build</Trans>,
    tab: 'build',
    getIcon: color => <PickAxeIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Learn</Trans>,
    tab: 'learn',
    getIcon: color => <SchoolIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Play</Trans>,
    tab: 'play',
    getIcon: color => <GoogleControllerIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Community</Trans>,
    tab: 'community',
    getIcon: color => <WebIcon fontSize="small" color={color} />,
  },
];

type Props = {|
  setActiveTab: HomeTab => void,
  activeTab: HomeTab,
|};

export const HomePageMenu = ({ setActiveTab, activeTab }: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const GDevelopTheme = React.useContext(GDevelopThemeContext);
  const [
    isHomePageMenuDrawerOpen,
    setIsHomePageMenuDrawerOpen,
  ] = React.useState(false);

  return (
    <>
      <Paper
        style={windowWidth === 'large' ? styles.desktopMenu : styles.mobileMenu}
        square
      >
        <Column alignItems="start" expand>
          {windowWidth !== 'large' && (
            <IconButton
              onClick={() => setIsHomePageMenuDrawerOpen(true)}
              size="small"
            >
              <DoubleChevronArrowRight />
            </IconButton>
          )}
          {tabs.map(({ label, tab, getIcon }, index) => (
            <VerticalTabButton
              key={index}
              label={label}
              onClick={() => setActiveTab(tab)}
              getIcon={getIcon}
              isActive={activeTab === tab}
              hideLabel={windowWidth !== 'large'}
            />
          ))}
        </Column>
      </Paper>
      <Drawer
        open={isHomePageMenuDrawerOpen}
        PaperProps={{
          style: {
            ...styles.drawerContent,
            backgroundColor: GDevelopTheme.home.header.backgroundColor,
          },
          className: 'safe-area-aware-left-container',
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Column>
          <Line justifyContent="flex-end">
            <IconButton
              onClick={() => {
                setIsHomePageMenuDrawerOpen(false);
              }}
              size="small"
            >
              <DoubleChevronArrowLeft />
            </IconButton>
          </Line>
          {tabs.map(({ label, tab, getIcon }, index) => (
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
      </Drawer>
    </>
  );
};
