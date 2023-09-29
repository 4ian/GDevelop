// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import Mobile from '../../UI/CustomSvgIcons/Mobile';
import Desktop from '../../UI/CustomSvgIcons/Desktop';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import {
  type Exporter,
  type ExporterSection,
  type ExporterSubSection,
} from '.';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import ExportLauncher from './ExportLauncher';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import AlertMessage from '../../UI/AlertMessage';
import { ButtonBase, createStyles, makeStyles } from '@material-ui/core';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';
import TextButton from '../../UI/TextButton';
import ChevronArrowLeft from '../../UI/CustomSvgIcons/ChevronArrowLeft';
import { capitalize } from 'lodash';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import GdGames from '../../UI/CustomSvgIcons/GdGames';
import ItchIo from '../../UI/CustomSvgIcons/ItchIo';
import CloudDownload from '../../UI/CustomSvgIcons/CloudDownload';
import { type Game } from '../../Utils/GDevelopServices/Game';
import Wrench from '../../UI/CustomSvgIcons/Wrench';

const styles = {
  buttonBase: {
    borderRadius: 8,
    padding: 2,
    flex: 1,
    cursor: 'default',
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
    case 'mobile':
      return <Mobile style={small ? styles.iconSmall : styles.icon} />;
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
    case 'mobile':
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
const useStylesForWidget = (highlighted: boolean) =>
  makeStyles(theme =>
    createStyles({
      root: {
        border: highlighted
          ? `1px solid ${theme.palette.text.primary}`
          : `1px solid ${theme.palette.text.disabled}`,
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
    })
  )();

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
  const classes = useStylesForWidget(!!highlighted);
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
      <LineStackLayout
        expand
        justifyContent="space-between"
        alignItems="center"
        noMargin={!!small}
      >
        <Column>
          <LineStackLayout expand noMargin alignItems="center">
            <div style={styles.iconContainer}>{icon}</div>
            <Text
              noMargin
              size={small ? 'sub-title' : 'block-title'}
              align="left"
            >
              {label}
            </Text>
          </LineStackLayout>
        </Column>
        <Column noMargin>
          <LineStackLayout expand noMargin alignItems="center">
            <Text color="secondary" size="body2" align="right">
              {description}
            </Text>
            <ChevronArrowRight color="secondary" />
          </LineStackLayout>
        </Column>
      </LineStackLayout>
    </ButtonBase>
  );
};

type PublishHomeProps = {|
  project: gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  onGameUpdated: () => void,
  onChangeSubscription: () => void,
  isNavigationDisabled: boolean,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  selectedExporter: ?Exporter,
  onChooseSection: (section: ?ExporterSection) => void,
  onChooseSubSection: (subSection: ?ExporterSubSection) => void,
  chosenSection: ?ExporterSection,
  chosenSubSection: ?ExporterSubSection,
  game: ?Game,
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
  allExportersRequireOnline,
  showOnlineWebExporterOnly,
}: PublishHomeProps) => {
  const isOnline = useOnlineStatus();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [
    hasSkippedSubSectionSelection,
    setHasSkippedSubSectionSelection,
  ] = React.useState<boolean>(false);

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

  const shouldShowBackButton = !!(chosenSection || chosenSubSection);

  return (
    <ColumnStackLayout expand noMargin>
      {!showOnlineWebExporterOnly && (
        <Line noMargin justifyContent="space-between" alignItems="center">
          <Column
            expand
            alignItems="flex-start"
            justifyContent="center"
            noMargin
          >
            {shouldShowBackButton && (
              <TextButton
                icon={<ChevronArrowLeft />}
                label={<Trans>Back</Trans>}
                primary={false}
                onClick={onBack}
                disabled={isNavigationDisabled}
              />
            )}
          </Column>
          <Column expand alignItems="center">
            {!!chosenSection && !selectedExporter && (
              <LineStackLayout
                noMargin
                alignItems="center"
                justifyContent="center"
              >
                {getSectionIcon({
                  section: chosenSection,
                  small: true,
                })}
                <Text size="block-title" noMargin>
                  {capitalize(chosenSection)}
                </Text>
              </LineStackLayout>
            )}
          </Column>
          {/** Keep empty column to have title centered */}
          <Column expand alignItems="flex-end" noMargin />
        </Line>
      )}
      {!isOnline && (
        <AlertMessage kind="warning">
          <Trans>You must be connected to use online export services.</Trans>
        </AlertMessage>
      )}
      {!chosenSection && !showOnlineWebExporterOnly && (
        <ColumnStackLayout expand noMargin>
          <SectionLine
            label={<Trans>gd.games</Trans>}
            icon={getSubSectionIcon('browser', 'online')}
            description={<Trans>Free link on GDevelop gaming platform</Trans>}
            onClick={() => {
              setHasSkippedSubSectionSelection(true);
              onChooseSection('browser');
              onChooseSubSection('online');
            }}
            highlighted
            disabled={!isOnline}
            id="publish-gd-games"
          />
          <SectionLine
            label={<Trans>Browser</Trans>}
            icon={getSectionIcon({ section: 'browser' })}
            description={
              <Trans>Gaming portals (Itch.io, Poki, Facebook...)</Trans>
            }
            onClick={() => onChooseSection('browser')}
            disabled={allExportersRequireOnline && !isOnline}
            id="publish-browser"
          />
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={<Trans>Desktop</Trans>}
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
              label={<Trans>Mobile</Trans>}
              icon={getSectionIcon({ section: 'mobile' })}
              description={<Trans>Android and iOS (App stores)</Trans>}
              onClick={() => onChooseSection('mobile')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-mobile"
            />
          )}
        </ColumnStackLayout>
      )}
      {chosenSection === 'browser' && !chosenSubSection && (
        <ColumnStackLayout expand noMargin>
          <SectionLine
            label={<Trans>gd.games</Trans>}
            icon={getSubSectionIcon('browser', 'online')}
            description={<Trans>Free link on GDevelop gaming platform</Trans>}
            onClick={() => onChooseSubSection('online')}
            highlighted
            disabled={!isOnline}
            id="publish-gd-games"
          />
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={<Trans>External websites</Trans>}
              icon={getSubSectionIcon('browser', 'offline')}
              description={<Trans>Itch.io, Poki, CrazyGames...</Trans>}
              onClick={() => onChooseSubSection('offline')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-external-websites"
            />
          )}
          {!showOnlineWebExporterOnly && (
            <SectionLine
              label={<Trans>Facebook</Trans>}
              icon={getSubSectionIcon('browser', 'facebook')}
              description={<Trans>Facebook Instant Games</Trans>}
              onClick={() => onChooseSubSection('facebook')}
              disabled={allExportersRequireOnline && !isOnline}
              id="publish-facebook"
            />
          )}
        </ColumnStackLayout>
      )}
      {chosenSection === 'desktop' && !chosenSubSection && (
        <ColumnStackLayout expand noMargin>
          <SectionLine
            label={<Trans>Cloud build</Trans>}
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
            description={<Trans>Advanced usage for manual packaging</Trans>}
            onClick={() => onChooseSubSection('offline')}
            disabled={allExportersRequireOnline && !isOnline}
            small
            id="publish-desktop-manual"
          />
        </ColumnStackLayout>
      )}
      {chosenSection === 'mobile' && !chosenSubSection && (
        <ColumnStackLayout expand noMargin>
          <SectionLine
            label={<Trans>Cloud build</Trans>}
            icon={getSubSectionIcon('mobile', 'online')}
            description={<Trans>Android only</Trans>}
            onClick={() => onChooseSubSection('online')}
            highlighted
            disabled={!isOnline}
            id="publish-mobile-cloud"
          />
          <SectionLine
            label={<Trans>Manual build</Trans>}
            icon={getSubSectionIcon('desktop', 'offline')}
            description={<Trans>Advanced usage for manual packaging</Trans>}
            onClick={() => onChooseSubSection('offline')}
            small
            disabled={allExportersRequireOnline && !isOnline}
            id="publish-mobile-manual"
          />
        </ColumnStackLayout>
      )}
      {chosenSection && chosenSubSection && selectedExporter && (
        <ExportLauncher
          authenticatedUser={authenticatedUser}
          exportPipeline={selectedExporter.exportPipeline}
          project={project}
          onSaveProject={onSaveProject}
          isSavingProject={isSavingProject}
          onGameUpdated={onGameUpdated}
          onChangeSubscription={onChangeSubscription}
          setIsNavigationDisabled={setIsNavigationDisabled}
          game={game}
        />
      )}
    </ColumnStackLayout>
  );
};

export default PublishHome;
