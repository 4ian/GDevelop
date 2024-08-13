// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import ExportLauncher from '../ExportAndShare/ShareDialog/ExportLauncher';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import { I18n } from '@lingui/react';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import Text from '../UI/Text';
import { type GameAndBuilds } from '../Utils/UseGameAndBuilds';

const styles = {
  illustrationImage: {
    width: 100,
    aspectRatio: '117 / 162',
  },
};

type Props = {|
  project: gdProject,
  gameAndBuilds: GameAndBuilds,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  shouldAutomaticallyStartExport: boolean,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
|};

export const QuickPublish = ({
  project,
  gameAndBuilds,
  setIsNavigationDisabled,
  shouldAutomaticallyStartExport,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
  } = authenticatedUser;
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return (
    <ColumnStackLayout noMargin expand alignItems="center">
      <img
        alt="Publish your game with GDevelop"
        src="res/quick_publish.svg"
        style={styles.illustrationImage}
      />
      {profile ? (
        <I18n>
          {({ i18n }) => (
            <ExportLauncher
              i18n={i18n}
              project={project}
              onSaveProject={onSaveProject}
              isSavingProject={isSavingProject}
              onChangeSubscription={() => {
                // Nothing to do.
              }}
              authenticatedUser={authenticatedUser}
              eventsFunctionsExtensionsState={eventsFunctionsExtensionsState}
              exportPipeline={onlineWebExporter.exportPipeline}
              setIsNavigationDisabled={setIsNavigationDisabled}
              gameAndBuilds={gameAndBuilds}
              shouldAutomaticallyStartExport={shouldAutomaticallyStartExport}
              uiMode="minimal"
            />
          )}
        </I18n>
      ) : (
        <ColumnStackLayout noMargin>
          <Text size="body" align="center">
            <Trans>
              Create a GDevelop account to share your game in a few seconds.
            </Trans>
          </Text>
          <RaisedButton
            primary
            label={<Trans>Create an account</Trans>}
            onClick={onOpenCreateAccountDialog}
            keyboardFocused
          />
        </ColumnStackLayout>
      )}
    </ColumnStackLayout>
  );
};
