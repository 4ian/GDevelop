// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { differenceInCalendarDays, format } from 'date-fns';

import { Line, LargeSpacer, Spacer, Column } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import Text from '../../UI/Text';
import InfoBar from '../../UI/Messages/InfoBar';
import IconButton from '../../UI/IconButton';
import Copy from '../../UI/CustomSvgIcons/Copy';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import TextField, { type TextFieldInterface } from '../../UI/TextField';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import BackgroundText from '../../UI/BackgroundText';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../../UI/KeyboardShortcuts/InteractionKeys';
import { LineStackLayout } from '../../UI/Layout';
import Card from '../../UI/Card';

import BuildProgressAndActions from './BuildProgressAndActions';

import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  deleteBuild,
  updateBuild,
  type Build,
} from '../../Utils/GDevelopServices/Build';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import Window from '../../Utils/Window';
import CircularProgress from '../../UI/CircularProgress';
import ThreeDotsMenu from '../../UI/CustomSvgIcons/ThreeDotsMenu';
import Desktop from '../../UI/CustomSvgIcons/Desktop';
import Apple from '../../UI/CustomSvgIcons/Apple';
import Android from '../../UI/CustomSvgIcons/Android';

const styles = {
  icon: {
    height: 16,
    width: 16,
    marginRight: 4,
  },
  buildButtonIcon: { height: 16, width: 16, opacity: 0.6 },
  openForFeedbackIndicator: { height: 4, width: 4, borderRadius: 4 },
  cardContent: { flex: 1 },
  textField: { width: '70%' },
  circularProgress: { height: 20, width: 20 },
};

const formatBuildText = (
  buildType:
    | 'cordova-build'
    | 'cordova-ios-build'
    | 'electron-build'
    | 'web-build'
) => {
  switch (buildType) {
    case 'cordova-build':
      return <Trans>Android Build</Trans>;
    case 'cordova-ios-build':
      return <Trans>iOS Build</Trans>;
    case 'electron-build':
      return <Trans>Windows/macOS/Linux Build</Trans>;
    case 'web-build':
      return <Trans>Web Build</Trans>;
    default:
      return buildType;
  }
};

const getIcon = (
  buildType:
    | 'cordova-build'
    | 'cordova-ios-build'
    | 'electron-build'
    | 'web-build'
) => {
  switch (buildType) {
    case 'cordova-build':
      return <Android style={styles.icon} />;
    case 'cordova-ios-build':
      return <Apple style={styles.icon} />;
    case 'electron-build':
      return <Desktop style={styles.icon} />;
    case 'web-build':
      return <Chrome style={styles.icon} />;
    default:
      return <Chrome style={styles.icon} />;
  }
};

const BuildAndCreatedAt = ({ build }: { build: Build }) => (
  <Line alignItems="end">
    <Line noMargin alignItems="center">
      {getIcon(build.type)}
      <Text noMargin>
        <Trans>{formatBuildText(build.type)}</Trans>
      </Text>
    </Line>
    <Spacer />
    <BackgroundText>
      <Trans>{format(build.updatedAt, 'yyyy-MM-dd HH:mm:ss')}</Trans>
    </BackgroundText>
  </Line>
);

const BUILD_NAME_MAX_LENGTH = 50;
const BUILD_DEFAULT_NAME_TIME_FORMAT = 'yyyy-MM-dd-HH-mm-ss';

type Props = {|
  build: Build,
  game: Game,
  onGameUpdated?: () => Promise<void>,
  gameUpdating: boolean,
  setGameUpdating: boolean => void,
  onBuildUpdated: Build => void,
  onBuildDeleted: Build => void,
  authenticatedUser: AuthenticatedUser,
|};

export const BuildCard = ({
  build,
  game,
  onGameUpdated,
  gameUpdating,
  setGameUpdating,
  onBuildUpdated,
  onBuildDeleted,
  authenticatedUser,
}: Props) => {
  const { getAuthorizationHeader, profile } = authenticatedUser;
  const defaultBuildName = `${game.gameName
    .toLowerCase()
    .replace(/ /g, '-')
    .slice(
      0,
      BUILD_NAME_MAX_LENGTH - BUILD_DEFAULT_NAME_TIME_FORMAT.length - 1
    )}-${format(build.updatedAt, BUILD_DEFAULT_NAME_TIME_FORMAT)}`;
  const buildName = build.name ? build.name : defaultBuildName;
  const isOnlineBuild = game.publicWebBuildId === build.id;
  const isOld =
    build &&
    build.type !== 'web-build' &&
    differenceInCalendarDays(Date.now(), build.updatedAt) > 6;

  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const nameInput = React.useRef<?TextFieldInterface>(null);
  const { isMobile } = useResponsiveWindowSize();

  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [name, setName] = React.useState(buildName);

  const onCopyUuid = () => {
    navigator.clipboard.writeText(build.id);
    setShowCopiedInfoBar(true);
  };

  const onEditName = () => {
    setIsEditingName(true);
    nameInput.current && nameInput.current.focus();
  };
  const onBlurEditName = async (i18n: I18nType) => {
    if (!profile) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setName(build.name || '');
    } else if (trimmedName === buildName) {
      setName(name.trim());
    } else {
      try {
        setGameUpdating(true);
        const updatedBuild = await updateBuild(
          getAuthorizationHeader,
          profile.id,
          build.id,
          {
            name: name,
          }
        );
        onBuildUpdated({
          ...build,
          name: updatedBuild.name,
        });
      } catch (error) {
        setName(build.name || '');
        showErrorBox({
          message: i18n._(
            t`Could not update the build name. Verify your internet connection or try again later.`
          ),
          rawError: error,
          errorId: 'build-name-update-error',
        });
      } finally {
        setGameUpdating(false);
      }
    }
    setIsEditingName(false);
  };

  const onDeleteBuild = async (i18n: I18nType) => {
    if (!profile) return;
    const answer = Window.showConfirmDialog(
      'You are about to delete this build. Continue?'
    );
    if (!answer) return;
    try {
      setGameUpdating(true);
      await deleteBuild(getAuthorizationHeader, profile.id, build.id);
      setGameUpdating(false);
      onBuildDeleted(build);
    } catch (error) {
      showErrorBox({
        message: i18n._(
          t`Could not delete the build. Verify your internet connection or try again later.`
        ),
        rawError: error,
        errorId: 'build-delete-error',
      });
      setGameUpdating(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Card
            isHighlighted={isOnlineBuild}
            cardCornerAction={
              <ElementWithMenu
                element={
                  <IconButton size="small" disabled={gameUpdating}>
                    <ThreeDotsMenu />
                  </IconButton>
                }
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: i18n._(t`Edit build name`),
                    click: onEditName,
                  },
                  { type: 'separator' },
                  {
                    label: i18n._(t`Delete build`),
                    click: () => onDeleteBuild(i18n),
                  },
                ]}
              />
            }
            header={
              <Line noMargin alignItems="start" justifyContent="space-between">
                {!isMobile && <BuildAndCreatedAt build={build} />}
                <Column expand noMargin justifyContent="center">
                  <Line noMargin justifyContent="end">
                    {isOnlineBuild ? (
                      <Text size="body2">
                        <Trans>Current build online</Trans>
                      </Text>
                    ) : (
                      game.acceptsBuildComments &&
                      build.type === 'web-build' && (
                        <LineStackLayout alignItems="center" noMargin>
                          <div
                            style={{
                              ...styles.openForFeedbackIndicator,
                              backgroundColor: gdevelopTheme.message.valid,
                            }}
                          />
                          <Text size="body2">
                            <Trans>Build open for feedbacks</Trans>
                          </Text>
                        </LineStackLayout>
                      )
                    )}
                  </Line>
                </Column>
              </Line>
            }
          >
            <Column expand noMargin>
              {isMobile && <BuildAndCreatedAt build={build} />}
              <Spacer />
              <Line noMargin>
                {isEditingName ? (
                  <Line noMargin expand>
                    <TextField
                      ref={nameInput}
                      style={styles.textField}
                      value={name}
                      margin="none"
                      onChange={(_, value) => setName(value)}
                      onBlur={() => {
                        onBlurEditName(i18n);
                      }}
                      hintText={buildName}
                      disabled={gameUpdating}
                      onKeyPress={event => {
                        if (shouldValidate(event) && nameInput.current)
                          nameInput.current.blur();
                      }}
                      onKeyDown={event => {
                        if (shouldCloseOrCancel(event)) {
                          event.stopPropagation();
                          setIsEditingName(false);
                          setName(buildName);
                        }
                      }}
                      maxLength={BUILD_NAME_MAX_LENGTH}
                    />
                    {gameUpdating && (
                      <>
                        <Spacer />
                        <CircularProgress style={styles.circularProgress} />
                      </>
                    )}
                  </Line>
                ) : (
                  <Line noMargin alignItems="baseline">
                    <Text noMargin>{buildName}</Text>
                  </Line>
                )}
              </Line>
              <Line noMargin alignItems="center">
                <BackgroundText style={{ textAlign: 'left' }}>
                  {build.id}
                </BackgroundText>
                <Spacer />
                <IconButton size="small" onClick={onCopyUuid}>
                  <Copy style={styles.buildButtonIcon} />
                </IconButton>
              </Line>
              <LargeSpacer />
              <Line expand noMargin justifyContent="space-between">
                {!isOld && (
                  <BuildProgressAndActions
                    build={build}
                    game={game}
                    onGameUpdated={onGameUpdated}
                    gameUpdating={gameUpdating}
                    setGameUpdating={setGameUpdating}
                    onCopyToClipboard={() => setShowCopiedInfoBar(true)}
                  />
                )}
                {isOld && (
                  <EmptyMessage>
                    <Trans>
                      This build is old and the generated games can't be
                      downloaded anymore.
                    </Trans>
                  </EmptyMessage>
                )}
              </Line>
            </Column>
          </Card>
          <InfoBar
            visible={showCopiedInfoBar}
            hide={() => setShowCopiedInfoBar(false)}
            message={<Trans>Copied to clipboard!</Trans>}
          />
        </>
      )}
    </I18n>
  );
};
