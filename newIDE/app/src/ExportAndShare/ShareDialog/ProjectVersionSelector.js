// @flow

import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import inc from 'semver/functions/inc';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { getBuilds } from '../../Utils/GDevelopServices/Build';
import SelectOption from '../../UI/SelectOption';
import SelectField from '../../UI/SelectField';
import TextField from '../../UI/TextField';
import { Column, Line } from '../../UI/Grid';
import FlatButton from '../../UI/FlatButton';
import HelpIcon from '../../UI/HelpIcon';

const gd: libGDevelop = global.gd;

const styles = {
  buttonStyle: {
    flexShrink: 0,
    marginTop: 17,
  },
  container: {
    maxWidth: 400,
  },
};

const getIncrementedVersionNumber = (project: gdProject) => {
  return inc(project.getVersion(), 'patch', { loose: true });
};

type Props = {|
  project: gdProject,
  disabled: boolean,
  versionNumber: string,
  onVersionNumberChanged: string => void,
|};

const ProjectVersionSelector = ({
  project,
  disabled,
  versionNumber,
  onVersionNumberChanged,
}: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [recentBuildGameVersions, setRecentBuildGameVersions] = React.useState<
    string[]
  >([project.getVersion()]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchRecentBuildGameVersions = React.useCallback(
    async () => {
      try {
        const gameId = project.getProjectUuid();
        if (!gameId) {
          return;
        }

        const userId = profile ? profile.id : null;
        if (!userId) {
          return;
        }

        const recentBuilds = await getBuilds(
          getAuthorizationHeader,
          userId,
          gameId
        );
        const allVersions = recentBuilds
          .map(build => build.gameVersion)
          .filter(Boolean)
          .concat([project.getVersion()]);
        const sortedVersions = allVersions.sort((a, b) => {
          return a.localeCompare(b);
        });
        const uniqueVersions = Array.from(new Set(sortedVersions));
        setRecentBuildGameVersions(uniqueVersions);
      } catch (error) {
        console.error('Unable to fetch recent build versions:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthorizationHeader, profile, project]
  );

  const isMultiplayerExtensionUsed = React.useMemo(
    () =>
      gd.UsedExtensionsFinder.scanProject(project)
        .getUsedExtensions()
        .toNewVectorString()
        .toJSArray()
        .some(extensionName => extensionName === 'Multiplayer'),
    [project]
  );

  React.useEffect(
    () => {
      fetchRecentBuildGameVersions();
    },
    [fetchRecentBuildGameVersions]
  );

  const isCurrentValueInGameVersionsList =
    !!recentBuildGameVersions &&
    recentBuildGameVersions.find(
      recentGameVersion => recentGameVersion === versionNumber
    );

  const [isFreeTextField, setIsFreeTextField] = React.useState(false);

  const switchFieldType = () => {
    if (isFreeTextField && !isCurrentValueInGameVersionsList) {
      // If the current value is not in the list of versions when switching to the select field,
      // go back to the current project version, to ensure a value is always selected.
      onVersionNumberChanged(project.getVersion());
    } else {
      // If switching to the free text field, increment the current project version,
      // as we expect the user to enter a new version.
      onVersionNumberChanged(getIncrementedVersionNumber(project));
    }
    setIsFreeTextField(!isFreeTextField);
  };

  const onChangeSelectValue = (event, value) => {
    onVersionNumberChanged(event.target.value);
  };

  const onChangeTextValue = (e, value) => {
    onVersionNumberChanged(value);
  };

  const isDisabled = disabled || isLoading;

  const selectOptions = recentBuildGameVersions.map(buildVersion => (
    <SelectOption
      key={buildVersion}
      value={buildVersion}
      label={buildVersion}
      shouldNotTranslate
      disabled={isDisabled}
    />
  ));

  return (
    <I18n>
      {({ i18n }) => (
        <div style={styles.container}>
          <Column noMargin expand>
            <ResponsiveLineStackLayout
              justifyContent="center"
              alignItems="start"
            >
              {!isFreeTextField ? (
                <SelectField
                  id="game-version-select-field"
                  value={versionNumber}
                  onChange={onChangeSelectValue}
                  margin="dense"
                  floatingLabelText={<Trans>Game version</Trans>}
                  floatingLabelFixed
                  translatableHintText={t`Choose a game version`}
                  fullWidth
                  helperMarkdownText={
                    isMultiplayerExtensionUsed
                      ? i18n._(
                          t`Bump the version if you want your players to join different lobbies.`
                        )
                      : null
                  }
                  disabled={isDisabled}
                >
                  {selectOptions}
                </SelectField>
              ) : (
                <TextField
                  id="game-version-text-field"
                  onChange={onChangeTextValue}
                  floatingLabelText={<Trans>Game version</Trans>}
                  value={versionNumber}
                  floatingLabelFixed
                  fullWidth
                  helperMarkdownText={
                    isMultiplayerExtensionUsed
                      ? i18n._(
                          t`Bump the version if you want your players to join different lobbies.`
                        )
                      : null
                  }
                  disabled={isDisabled}
                />
              )}
              <FlatButton
                id="switch-game-version-text-select"
                label={
                  isFreeTextField ? (
                    <Trans>Select version</Trans>
                  ) : (
                    <Trans>Bump version</Trans>
                  )
                }
                onClick={switchFieldType}
                style={styles.buttonStyle}
                disabled={isDisabled}
              />
            </ResponsiveLineStackLayout>
          </Column>
        </div>
      )}
    </I18n>
  );
};

export default ProjectVersionSelector;
