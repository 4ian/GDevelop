// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../UI/Grid';
import SchoolIcon from '@material-ui/icons/School';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import LanguageIcon from '@material-ui/icons/Language';
import { Drawer, Paper } from '@material-ui/core';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import IconButton from '../../../UI/IconButton';
import DoubleChevronArrowRight from '../../../UI/CustomSvgIcons/DoubleChevronArrowRight';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import DoubleChevronArrowLeft from '../../../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import PickAxeIcon from '../../../UI/CustomSvgIcons/PickAxe';

export const styles = {
  drawerContent: {
    height: '100%',
    width: 250,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

export type HomeTab = 'Build' | 'Learn' | 'Play' | 'Community';

const tabs: {
  label: React.Node,
  tab: HomeTab,
  getIcon: (color: string) => React.Node,
}[] = [
  {
    label: <Trans>Build</Trans>,
    tab: 'Build',
    getIcon: color => <PickAxeIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Learn</Trans>,
    tab: 'Learn',
    getIcon: color => <SchoolIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Play</Trans>,
    tab: 'Play',
    getIcon: color => <SportsEsportsIcon fontSize="small" color={color} />,
  },
  {
    label: <Trans>Community</Trans>,
    tab: 'Community',
    getIcon: color => <LanguageIcon fontSize="small" color={color} />,
  },
];

type Props = {|
  setActiveTab: HomeTab => void,
  activeTab: HomeTab,
|};

export const HomePageMenu = ({ setActiveTab, activeTab }: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const [
    isHomePageMenuDrawerOpen,
    setIsHomePageMenuDrawerOpen,
  ] = React.useState(false);

  return (
    <>
      <Paper
        style={{
          paddingTop: windowWidth === 'large' ? 40 : 10,
          minWidth: windowWidth === 'large' && 200,
        }}
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
          {tabs.map(({ label, tab, getIcon }) => (
            <>
              <VerticalTabButton
                label={label}
                onClick={() => setActiveTab(tab)}
                getIcon={getIcon}
                isActive={activeTab === tab}
                hideLabel={windowWidth !== 'large'}
              />
            </>
          ))}
        </Column>
      </Paper>
      <Drawer
        open={isHomePageMenuDrawerOpen}
        PaperProps={{
          style: styles.drawerContent,
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
          {tabs.map(({ label, tab, getIcon }) => (
            <VerticalTabButton
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
