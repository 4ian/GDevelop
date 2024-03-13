// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import Apple from '../../UI/CustomSvgIcons/Apple';
import Desktop from '../../UI/CustomSvgIcons/Desktop';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import {
  type Exporter,
  type ExporterSection,
  type ExporterSubSection,
} from '.';
import Text from '../../UI/Text';
import { Column, Line, marginsSize } from '../../UI/Grid';
import ExportLauncher from './ExportLauncher';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import AlertMessage from '../../UI/AlertMessage';
import { ButtonBase, createStyles, makeStyles } from '@material-ui/core';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';
import TextButton from '../../UI/TextButton';
import ChevronArrowLeft from '../../UI/CustomSvgIcons/ChevronArrowLeft';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import GdGames from '../../UI/CustomSvgIcons/GdGames';
import ItchIo from '../../UI/CustomSvgIcons/ItchIo';
import CloudDownload from '../../UI/CustomSvgIcons/CloudDownload';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { getBuilds, type Build } from '../../Utils/GDevelopServices/Build';
import Wrench from '../../UI/CustomSvgIcons/Wrench';
import EventsFunctionsExtensionsContext from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Android from '../../UI/CustomSvgIcons/Android';
import { isNativeMobileApp } from '../../Utils/Platform';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { type GameAvailabilityError } from '../../GameDashboard/GameRegistration';

const styles = {
  buttonBase: {
    borderRadius: 8,
    padding: 8,
    flex: 1,
    cursor: 'default',
  },
  titleContainer: {
    marginLeft: marginsSize,
    marginRight: marginsSize,
    display: 'flex',
    alignItems: 'center',
    flex: 3, // Give more space to the title, to ensure it doesn't wrap.
  },
  iconContainer: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 36,
    height: 36,
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
  highlightedTag: {
    padding: '2px 6px',
    borderRadius: 4,
  },
};

const getSectionLabel = ({ section }: { section: ExporterSection }) => {
  switch (section) {
    case 'browser':
      return <Trans>Browser</Trans>;
    case 'desktop':
      return <Trans>Desktop</Trans>;
    case 'android':
      return <Trans>Android</Trans>;
    case 'ios':
      return <Trans>iOS</Trans>;
    default:
      return null;
  }
};

const getSectionIcon = ({
  section,
  small,
}: {
  section: ExporterSection,
  small?: boolean,
}) => {
  switch (section) {
    case 'browser':
      return <Chrome style={small ? styles.iconSmall : styles.icon} />;
    case 'desktop':
      return <Desktop style={small ? styles.iconSmall : styles.icon} />;
    case 'android':
      return <Android style={small ? styles.iconSmall : styles.icon} />;
    case 'ios':
      return <Apple style={small ? styles.iconSmall : styles.icon} />;
    default:
      return null;
  }
};

const getSubSectionIcon = (
  section: ExporterSection,
  subSection: ExporterSubSection
) => {
  switch (section) {
    case 'browser':
      switch (subSection) {
        case 'online':
          return <GdGames style={styles.icon} />;
        case 'offline':
          return <ItchIo style={styles.icon} />;
        case 'facebook':
          return <Facebook style={styles.icon} />;
        default:
          return null;
      }
    case 'desktop':
    case 'android':
      switch (subSection) {
        case 'online':
          return <CloudDownload style={styles.icon} />;
        case 'offline':
          return <Wrench style={styles.iconSmall} />;
        default:
          return null;
      }
    case 'ios':
      switch (subSection) {
        case 'online':
          return <CloudDownload style={styles.icon} />;
        case 'offline':
          return <Wrench style={styles.iconSmall} />;
        default:
          return null;
      }
    default:
      return null;
  }
};

// Styles to improve the interaction with the button.
const useStylesForWidget = () =>
  makeStyles(theme => {
    return createStyles({
      root: {
        border: `1px solid ${theme.palette.text.disabled}`,
        '&:focus': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:disabled': {
          opacity: theme.palette.action.disabledOpacity,
        },
      },
    });
  })();

const SectionLine = ({
  icon,
  label,
  onClick,
  description,
  disabled,
  small,
  highlighted,
  id,
}: {|
  icon: React.Node,
  label: React.Node,
  onClick: () => void,
  description: React.Node,
  disabled?: boolean,
  small?: boolean,
  highlighted?: boolean,
  id: string,
|}) => {
  const classes = useStylesForWidget();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();
  return (
    <ButtonBase
      onClick={onClick}
      focusRipple
      elevation={2}
      style={styles.buttonBase}
      classes={classes}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onClick();
        }
      }}
      disabled={disabled}
      id={id}
    >
      <ResponsiveLineStackLayout
        expand
        justifyContent="space-between"
        alignItems="center"
        noColumnMargin
      >
        <Column alignItems="flex-start">
          <LineStackLayout expand noMargin alignItems="center">
            <div style={styles.iconContainer}>{icon}</div>
            <Text
              noMargin
              size={small ? 'sub-title' : 'block-title'}
              align="left"
              color="primary"
            >
              {label}
            </Text>
            {highlighted && (
              <div
                style={{
                  ...styles.highlightedTag,
                  color: gdevelopTheme.statusIndicator.success,
                  border: `1px solid ${gdevelopTheme.statusIndicator.success}`,
                }}
              >
                <Text color="inherit" noMargin>
                  <Trans>Easiest</Trans>
                </Text>
              </div>
            )}
          </LineStackLayout>
        </Column>
        <Column>
          <LineStackLayout
            expand
            noMargin
            alignItems="center"
            justifyContent={isMobile ? 'space-between' : 'flex-end'}
          >
            <Text
              color="secondary"
              size="body2"
              align={isMobile ? 'left' : 'right'}
              noMargin
            >
              {description}
            </Text>
            <ChevronArrowRight color="secondary" />
          </LineStackLayout>
        </Column>
      </ResponsiveLineStackLayout>
    </ButtonBase>
  );
};

type PublishHomeProps = {|
  project: gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  onGameUpdated: () => Promise<void>,
  onChangeSubscription: () => void,
  isNavigationDisabled: boolean,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  selectedExporter: ?Exporter,
  onChooseSection: (section: ?ExporterSection) => void,
  onChooseSubSection: (subSection: ?ExporterSubSection) => void,
  chosenSection: ?ExporterSection,
  chosenSubSection: ?ExporterSubSection,
  game: ?Game,
  gameAvailabilityError: ?GameAvailabilityError,
  allExportersRequireOnline?: boolean,
  showOnlineWebExporterOnly?: boolean,
|};

const PublishHome = ({
  project,
  onSaveProject,
  isSavingProject,
  onChangeSubscription,
  isNavigationDisabled,
  setIsNavigationDisabled,
  onGameUpdated,
  selectedExporter,
  onChooseSection,
  onChooseSubSection,
  chosenSection,
  chosenSubSection,
  game,
  gameAvailabilityError,
  allExportersRequireOnline,
  showOnlineWebExporterOnly,
}: PublishHomeProps) => {
  const { isMobile } = useResponsiveWindowSize();
  const isOnline = useOnlineStatus();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const [
    hasSkippedSubSectionSelection,
    setHasSkippedSubSectionSelection,
  ] = React.useState<boolean>(false);
  const [builds, setBuilds] = React.useState<?Array<Build>>(null);

  const { showAlert } = useAlertDialog();

  const onBack = () => {
    if (chosenSubSection) {
      onChooseSubSection(null);
      // In case the user navigated directly to the sub-section, we need to
      // reset the section too.
      if (hasSkippedSubSectionSelection) {
        onChooseSection(null);
        setHasSkippedSubSectionSelection(false);
      }
    } else if (chosenSection) {
      onChooseSection(null);
    }
  };

  const refreshBuilds = React.useCallback(
    async () => {
      if (!profile) return;

      try {
        const userBuilds = await getBuilds(getAuthorizationHeader, profile.id);
        setBuilds(userBuilds);
      } catch (error) {
        console.error('Error while loading builds:', error);
        showAlert({
          title: t`Error while loading builds`,
          message: t`An error occurred while loading your builds. Verify your internet connection and try again.`,
        });
      }
    },
    [profile, getAuthorizationHeader, showAlert]
  );

  React.useEffect(
    () => {
      refreshBuilds();
    },
    [refreshBuilds]
  );

  const shouldShowBackButton = !!(chosenSection || chosenSubSection);

  return (
    <ColumnStackLayout expand noMargin>
      {!showOnlineWebExporterOnly && (
        <Line justifyContent="space-between" alignItems="center">
          <Column
            expand={!isMobile} // To give space to the title on mobile.
            alignItems="flex-start"
            justifyContent="center"
            noMargin
          >
            {shouldShowBackButton && (
              <TextButton
                icon={<ChevronArrowLeft />}
                label={<Trans>Back</Trans>}
                onClick={onBack}
                disabled={isNavigationDisabled}
              />
            )}
          </Column>
          <div
            style={{
              ...styles.titleContainer,
              justifyContent:
                isMobile && shouldShowBackButton ? 'flex-end' : 'center',
            }}
          >
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="center"
            >
              {!chosenSection
                ? undefined
                : getSectionIcon({
                    section: chosenSection,
                    small: true,
                  })}
              <Text size="block-title">
                {selectedExporter ? (
                  selectedExporter.name
                ) : chosenSection ? (
                  getSectionLabel({
                    section: chosenSection,
                  })
                ) : (
                  <Trans>Export your game</Trans>
                )}
              </Text>
            </LineStackLayout>
          </div>
          {/** Keep empty column to have title centered on desktop */}
          {!isMobile && <Column expand alignItems="flex-end" noMargin />}
        </Line>
      )}
      {!isOnline && (
        <AlertMessage kind="warning">
          <Trans>You must be connected to use online export services.</Trans>
        </AlertMessage>
      )}
      {!chosenSection && (
        <ColumnStackLayout noMargin>
          <SectionLine
            label={<Trans>gd.games</Trans>}
            icon={getSubSectionIcon('browser', 'online')}
            description={<Trans>Generate a shareable link to your game.</Trans>}
            onClick={() => {
              setHasSkippedSubSectionSelection(true);
              onChooseSection('browser');
              onChooseSubSection('online');
            }}
            highlighted
            disabled={!isOnline}
            id="publish-gd-games"
          />
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={getSectionLabel({ section: 'browser' })}
              icon={getSectionIcon({ section: 'browser' })}
              description={
                <Trans>Gaming portals (Itch.io, Poki, Facebook...)</Trans>
              }
              onClick={() => onChooseSection('browser')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-browser"
            />
          )}
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={getSectionLabel({ section: 'desktop' })}
              icon={getSectionIcon({ section: 'desktop' })}
              description={
                <Trans>Windows, MacOS, Linux (Steam, MS Store...)</Trans>
              }
              onClick={() => onChooseSection('desktop')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-desktop"
            />
          )}
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={getSectionLabel({ section: 'android' })}
              icon={getSectionIcon({ section: 'android' })}
              description={<Trans>Google Play (or other stores)</Trans>}
              onClick={() => onChooseSection('android')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-mobile"
            />
          )}
          {!showOnlineWebExporterOnly && !isNativeMobileApp() && (
            <SectionLine
              label={getSectionLabel({ section: 'ios' })}
              icon={getSectionIcon({ section: 'ios' })}
              description={<Trans>Apple App Store</Trans>}
              onClick={() => onChooseSection('ios')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-mobile-ios"
            />
          )}
        </ColumnStackLayout>
      )}
      {chosenSection === 'browser' && !chosenSubSection && (
        <ColumnStackLayout noMargin>
          <SectionLine
            label={<Trans>gd.games</Trans>}
            icon={getSubSectionIcon('browser', 'online')}
            description={<Trans>Generate a shareable link to your game.</Trans>}
            onClick={() => onChooseSubSection('online')}
            highlighted
            disabled={!isOnline}
            id="publish-gd-games"
          />
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={<Trans>HTML5 (external websites)</Trans>}
              icon={getSubSectionIcon('browser', 'offline')}
              description={<Trans>Itch.io, Poki, CrazyGames...</Trans>}
              onClick={() => onChooseSubSection('offline')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-external-websites"
            />
          )}
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={<Trans>Facebook Games</Trans>}
              icon={getSubSectionIcon('browser', 'facebook')}
              description={<Trans>Instant Games</Trans>}
              onClick={() => onChooseSubSection('facebook')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-facebook"
            />
          )}
        </ColumnStackLayout>
      )}
      {chosenSection === 'desktop' && !chosenSubSection && (
        <ColumnStackLayout noMargin>
          <SectionLine
            label={<Trans>One-click packaging</Trans>}
            icon={getSubSectionIcon('desktop', 'online')}
            description={<Trans>Windows, MacOS and Linux</Trans>}
            onClick={() => onChooseSubSection('online')}
            highlighted
            disabled={!isOnline}
            id="publish-desktop-cloud"
          />
          <SectionLine
            label={<Trans>Manual build</Trans>}
            icon={getSubSectionIcon('desktop', 'offline')}
            description={<Trans>Development tools required</Trans>}
            onClick={() => onChooseSubSection('offline')}
            disabled={allExportersRequireOnline && !isOnline}
            small
            id="publish-desktop-manual"
          />
        </ColumnStackLayout>
      )}
      {chosenSection === 'android' && !chosenSubSection && (
        <ColumnStackLayout noMargin>
          <SectionLine
            label={<Trans>One-click packaging</Trans>}
            icon={getSubSectionIcon('android', 'online')}
            description={<Trans>Automated</Trans>}
            onClick={() => onChooseSubSection('online')}
            highlighted
            disabled={!isOnline}
            id="publish-mobile-cloud"
          />
          <SectionLine
            label={<Trans>Manual build</Trans>}
            icon={getSubSectionIcon('desktop', 'offline')}
            description={<Trans>Development tools required</Trans>}
            onClick={() => onChooseSubSection('offline')}
            small
            disabled={allExportersRequireOnline && !isOnline}
            id="publish-mobile-manual"
          />
        </ColumnStackLayout>
      )}
      {chosenSection === 'ios' && !chosenSubSection && (
        <ColumnStackLayout noMargin>
          <SectionLine
            label={<Trans>One-click packaging</Trans>}
            icon={getSubSectionIcon('ios', 'online')}
            description={<Trans>Automated</Trans>}
            onClick={() => onChooseSubSection('online')}
            highlighted
            disabled={!isOnline}
            id="publish-ios-cloud"
          />
          <SectionLine
            label={<Trans>Manual build</Trans>}
            icon={getSubSectionIcon('desktop', 'offline')}
            description={<Trans>Development tools required</Trans>}
            onClick={() => onChooseSubSection('offline')}
            small
            disabled={allExportersRequireOnline && !isOnline}
            id="publish-ios-manual"
          />
        </ColumnStackLayout>
      )}
      {chosenSection && chosenSubSection && selectedExporter && (
        <ExportLauncher
          authenticatedUser={authenticatedUser}
          eventsFunctionsExtensionsState={eventsFunctionsExtensionsState}
          exportPipeline={selectedExporter.exportPipeline}
          project={project}
          onSaveProject={onSaveProject}
          isSavingProject={isSavingProject}
          onGameUpdated={onGameUpdated}
          onChangeSubscription={onChangeSubscription}
          setIsNavigationDisabled={setIsNavigationDisabled}
          game={game}
          gameAvailabilityError={gameAvailabilityError}
          builds={builds}
          onRefreshBuilds={refreshBuilds}
        />
      )}
    </ColumnStackLayout>
  );
};

export default PublishHome;
