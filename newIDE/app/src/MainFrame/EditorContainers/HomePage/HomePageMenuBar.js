// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column, marginsSize } from '../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import IconButton from '../../../UI/IconButton';
import DoubleChevronArrowRight from '../../../UI/CustomSvgIcons/DoubleChevronArrowRight';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import TuneIcon from '@material-ui/icons/Tune';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Paper from '../../../UI/Paper';
import {
  type HomeTab,
  type GetIconFunction,
  getTabsToDisplay,
} from './HomePageMenu';
import { SECTION_DESKTOP_SPACING } from './SectionContainer';
import Text from '../../../UI/Text';

const iconSize = 24;
const iconButtonPadding = 4;
/**
 * Padding bottom is bigger than padding top to leave space for the Android/iOS
 * bottom navigation bar.
 */
const iconButtonMarginBottom = 12;
const iconButtonLabelSize = 20;
export const homepageMobileMenuHeight =
  iconSize +
  iconButtonLabelSize +
  2 * iconButtonPadding +
  iconButtonMarginBottom;
export const homepageDesktopMenuBarWidth = 230;
export const homepageMediumMenuBarWidth = 42 + 2 * marginsSize;

const carrotsFontFamily =
  '"Cairo", "Noto Sans Arabic", "Noto Sans", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Segoe UI", "Ubuntu", sans-serif';

export const styles = {
  desktopMenu: {
    paddingTop: SECTION_DESKTOP_SPACING, // To align with the top of the sections
    paddingBottom: 12,
    minWidth: homepageDesktopMenuBarWidth,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 8,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
    background: 'linear-gradient(180deg, rgba(238, 238, 238, 0.95), #cfcfd3)',
  },
  mobileMenu: {
    paddingTop: 8,
    paddingBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 8,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
    background: 'linear-gradient(180deg, rgba(238, 238, 238, 0.95), #cfcfd3)',
  },
  mobileContainer: {
    width: '100%',
    fontSize: iconSize,
    height: homepageMobileMenuHeight + 10,
    borderRadius: '14px 14px 0 0',
    overflow: 'hidden',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 -8px 22px rgba(0, 0, 0, 0.14)',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
    paddingLeft: 4,
    paddingRight: 4,
  },
  bottomButtonsContainer: {
    marginBottom: 'var(--safe-area-inset-bottom)',
  },
  navButtonsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  navButton: {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 11,
    minHeight: 42,
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-start',
    cursor: 'pointer',
    outline: 'none',
    background: 'rgba(251, 251, 250, 0.94)',
    color: '#2f2f2f',
    fontFamily: carrotsFontFamily,
    fontWeight: 600,
    letterSpacing: 0.12,
    transition:
      'background 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
  },
  navButtonCompact: {
    justifyContent: 'center',
    padding: '8px 6px',
    minHeight: 42,
  },
  navButtonActive: {
    color: '#1f1f1f',
    borderColor: 'rgba(0, 0, 0, 0.25)',
    background:
      'linear-gradient(130deg, rgba(225, 181, 84, 0.92), rgba(156, 203, 146, 0.9))',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.16)',
  },
  navButtonInactive: {
    background: 'rgba(249, 249, 247, 0.94)',
  },
  navButtonIcon: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 18,
  },
  navButtonLabel: {
    fontSize: 12.5,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mobileNavButton: {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 10,
    padding: `${iconButtonPadding}px`,
    marginBottom: iconButtonMarginBottom,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 56,
    cursor: 'pointer',
    outline: 'none',
    color: '#2d2d2d',
    fontFamily: carrotsFontFamily,
    fontWeight: 600,
    background: 'rgba(248, 248, 246, 0.95)',
    transition:
      'background 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
  },
  mobileNavButtonActive: {
    color: '#1d1d1d',
    borderColor: 'rgba(0, 0, 0, 0.24)',
    background:
      'linear-gradient(130deg, rgba(225, 181, 84, 0.92), rgba(156, 203, 146, 0.9))',
    boxShadow: '0 8px 14px rgba(0, 0, 0, 0.16)',
  },
  mobileNavButtonInactive: {
    background: 'rgba(248, 248, 246, 0.95)',
  },
  icon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 1,
  },
  drawerTrigger: {
    marginBottom: 8,
  },
};

type CarrotsMenuButtonProps = {|
  label: React.Node,
  getIcon: GetIconFunction,
  onClick: () => void,
  isActive: boolean,
  compact: boolean,
  id: string,
|};

const CarrotsMenuButton = ({
  label,
  getIcon,
  onClick,
  isActive,
  compact,
  id,
}: CarrotsMenuButtonProps): React.Node => {
  const buttonStyle = {
    ...styles.navButton,
    ...(compact ? styles.navButtonCompact : {}),
    ...(isActive ? styles.navButtonActive : styles.navButtonInactive),
  };

  return (
    <button type="button" style={buttonStyle} onClick={onClick} id={id}>
      <span style={styles.navButtonIcon}>
        {getIcon({
          color: 'inherit',
          fontSize: 'small',
        })}
      </span>
      {!compact && <span style={styles.navButtonLabel}>{label}</span>}
    </button>
  );
};

type CarrotsMobileMenuButtonProps = {|
  label: React.Node,
  getIcon: GetIconFunction,
  onClick: () => void,
  isActive: boolean,
  id: string,
|};

const CarrotsMobileMenuButton = ({
  label,
  getIcon,
  onClick,
  isActive,
  id,
}: CarrotsMobileMenuButtonProps): React.Node => {
  const buttonStyle = {
    ...styles.mobileNavButton,
    ...(isActive
      ? styles.mobileNavButtonActive
      : styles.mobileNavButtonInactive),
  };

  return (
    <button type="button" style={buttonStyle} onClick={onClick} id={id}>
      <span style={styles.icon}>
        {getIcon({
          color: 'inherit',
          fontSize: 'inherit',
        })}
      </span>
      <Text size="body-small" color="inherit" noMargin>
        {label}
      </Text>
    </button>
  );
};

type Props = {|
  setActiveTab: HomeTab => void,
  activeTab: HomeTab,
  onOpenTemplates: () => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,
  onOpenHomePageMenuDrawer: () => void,
|};

const HomePageMenuBar = ({
  setActiveTab,
  activeTab,
  onOpenTemplates,
  onOpenPreferences,
  onOpenAbout,
  onOpenHomePageMenuDrawer,
}: Props): React.Node => {
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();
  const isMobileOrSmallScreen = isMobile || isMediumScreen;
  const tabsToDisplay = getTabsToDisplay({ limits: null });
  const largeScreenOnlyButtons: {
    label: React.Node,
    getIcon: GetIconFunction,
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

  if (isMobile) {
    return (
      <Paper
        background="dark"
        square={false}
        style={{
          ...styles.mobileContainer,
          background:
            'linear-gradient(180deg, rgba(238, 238, 238, 0.97), #d0d0d4)',
          borderTop: `1px solid rgba(0, 0, 0, 0.1)`,
        }}
      >
        <div style={{ display: 'flex', height: homepageMobileMenuHeight + 8 }}>
          {tabsToDisplay.map(({ label, tab, getIcon, id }) => (
            <div style={styles.buttonContainer} key={id}>
              <CarrotsMobileMenuButton
                label={label}
                getIcon={getIcon}
                onClick={() => {
                  setActiveTab(tab);
                }}
                isActive={activeTab === tab}
                id={id}
              />
            </div>
          ))}
        </div>
      </Paper>
    );
  }

  return (
    <Paper
      style={{
        ...(isMobileOrSmallScreen ? styles.mobileMenu : styles.desktopMenu),
        borderRight: `1px solid rgba(0, 0, 0, 0.1)`,
      }}
      square={false}
      background="dark"
    >
      <Column expand>
        {isMobileOrSmallScreen && (
          <div style={styles.drawerTrigger}>
            <IconButton onClick={onOpenHomePageMenuDrawer} size="small">
              <DoubleChevronArrowRight />
            </IconButton>
          </div>
        )}
        <div style={styles.navButtonsColumn}>
          {tabsToDisplay.map(({ label, tab, getIcon, id }) => (
            <CarrotsMenuButton
              key={id}
              label={label}
              onClick={() => setActiveTab(tab)}
              getIcon={getIcon}
              isActive={activeTab === tab}
              compact={isMobileOrSmallScreen}
              id={id}
            />
          ))}
          {largeScreenOnlyButtons.map(({ label, getIcon, onClick, id }) => (
            <CarrotsMenuButton
              key={id}
              label={label}
              onClick={onClick}
              getIcon={getIcon}
              isActive={false}
              compact={isMobileOrSmallScreen}
              id={id}
            />
          ))}
        </div>
      </Column>
    </Paper>
  );
};

export default HomePageMenuBar;
