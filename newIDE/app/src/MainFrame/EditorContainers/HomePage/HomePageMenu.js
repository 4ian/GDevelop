// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, Line, Spacer } from '../../../UI/Grid';
import SchoolIcon from '@material-ui/icons/School';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import LanguageIcon from '@material-ui/icons/Language';
import BuildIcon from '@material-ui/icons/Build';
import { Drawer, Paper } from '@material-ui/core';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import IconButton from '../../../UI/IconButton';
import DoubleChevronArrowRight from '../../../UI/CustomSvgIcons/DoubleChevronArrowRight';
import VerticalTabButton from '../../../UI/VerticalTabButton';
import DoubleChevronArrowLeft from '../../../UI/CustomSvgIcons/DoubleChevronArrowLeft';

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
  icon: React.Node,
}[] = [
  {
    label: <Trans>Build</Trans>,
    tab: 'Build',
    icon: <BuildIcon fontSize="small" color="primary" />,
  },
  {
    label: <Trans>Learn</Trans>,
    tab: 'Learn',
    icon: <SchoolIcon fontSize="small" color="primary" />,
  },
  {
    label: <Trans>Play</Trans>,
    tab: 'Play',
    icon: <SportsEsportsIcon fontSize="small" color="primary" />,
  },
  {
    label: <Trans>Community</Trans>,
    tab: 'Community',
    icon: <LanguageIcon fontSize="small" color="primary" />,
  },
];

const largeMenuWidthType: WidthType = 'large';

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
          paddingTop: windowWidth === largeMenuWidthType ? 30 : 10,
          minWidth: windowWidth === largeMenuWidthType && 200,
        }}
        square
      >
        <Column alignItems="start" expand>
          {windowWidth !== largeMenuWidthType && (
            <IconButton
              onClick={() => setIsHomePageMenuDrawerOpen(true)}
              size="small"
            >
              <DoubleChevronArrowRight />
            </IconButton>
          )}
          {tabs.map(({ label, tab, icon }) => (
            <>
              <Spacer />
              <VerticalTabButton
                label={label}
                onClick={() => setActiveTab(tab)}
                icon={icon}
                isActive={activeTab === tab}
                hideLabel={windowWidth !== largeMenuWidthType}
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
          {tabs.map(({ label, tab, icon }) => (
            <VerticalTabButton
              label={label}
              onClick={() => {
                setActiveTab(tab);
                setIsHomePageMenuDrawerOpen(false);
              }}
              icon={icon}
              isActive={activeTab === tab}
            />
          ))}
        </Column>
      </Drawer>
    </>
  );
};
