// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../UI/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '../../../UI/IconButton';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import DoubleChevronArrowLeft from '../../../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import TuneIcon from '@material-ui/icons/Tune';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import HomePageMenuBar from './HomePageMenuBar';
import { type Limits } from '../../../Utils/GDevelopServices/Usage';

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
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    boxShadow: '0 18px 34px rgba(0, 0, 0, 0.3)',
  },
  drawerTopButtonsContainer: {
    flex: 1,
    marginTop: 'var(--safe-area-inset-top)',
  },
  drawerBottomButtonsContainer: {
    marginBottom: 'var(--safe-area-inset-bottom)',
  },
};

export type HomeTab = 'create';

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
  create: {
    label: <Trans>Create</Trans>,
    tab: 'create',
    id: 'home-create-tab',
    getIcon: ({ color, fontSize }) => (
      <DashboardIcon fontSize={fontSize} style={{ color }} />
    ),
  },
};

export const getTabsToDisplay = ({
  limits,
}: {|
  limits: ?Limits,
|}): HomePageMenuTab[] => {
  void limits;
  return [homePageMenuTabs.create];
};

type Props = {|
  setActiveTab: HomeTab => void,
  activeTab: HomeTab,
  onOpenTemplates: () => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,
|};

export const HomePageMenu = ({
  setActiveTab,
  activeTab,
  onOpenTemplates,
  onOpenPreferences,
  onOpenAbout,
}: Props): React.MixedElement => {
  const [
    isHomePageMenuDrawerOpen,
    setIsHomePageMenuDrawerOpen,
  ] = React.useState(false);

  const tabsToDisplay = getTabsToDisplay({ limits: null });

  const buttons: {
    label: React.Node,
    getIcon: ({ color: string, fontSize: 'inherit' | 'small' }) => React.Node,
    id: string,
    onClick: () => void,
  }[] = [
    {
      label: <Trans>Templates</Trans>,
      id: 'home-menu-templates',
      onClick: onOpenTemplates,
      getIcon: ({ color, fontSize }) => (
        <ViewQuiltIcon fontSize={fontSize} style={{ color }} />
      ),
    },
    {
      label: <Trans>Preferences</Trans>,
      id: 'settings',
      onClick: onOpenPreferences,
      getIcon: ({ color, fontSize }) => (
        <TuneIcon fontSize={fontSize} style={{ color }} />
      ),
    },
    {
      label: <Trans>About Carrots Engine</Trans>,
      id: 'about-carrots',
      onClick: onOpenAbout,
      getIcon: ({ color, fontSize }) => (
        <InfoOutlinedIcon fontSize={fontSize} style={{ color }} />
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
        onOpenTemplates={onOpenTemplates}
        setActiveTab={setActiveTab}
      />
      <Drawer
        open={isHomePageMenuDrawerOpen}
        PaperProps={{
          style: {
            ...styles.drawerContent,
            background:
              'linear-gradient(180deg, rgba(238, 238, 238, 0.96), #cfcfd3)',
            borderRight: `1px solid rgba(0, 0, 0, 0.1)`,
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
                {buttons.map(({ label, getIcon, onClick, id }) => (
                  <VerticalTabButton
                    key={id}
                    label={label}
                    onClick={() => {
                      onClick();
                      setIsHomePageMenuDrawerOpen(false);
                    }}
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
