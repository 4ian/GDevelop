// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import FlatButton from '../../../UI/FlatButton';
import { Column, Line } from '../../../UI/Grid';
import { LineStackLayout } from '../../../UI/Layout';
import UserChip from '../../../UI/User/UserChip';
import ProjectManagerIcon from '../../../UI/CustomSvgIcons/ProjectManager';
import Window from '../../../Utils/Window';
import optionalRequire from '../../../Utils/OptionalRequire';
import TextButton from '../../../UI/TextButton';
import IconButton from '../../../UI/IconButton';
import { isNativeMobileApp } from '../../../Utils/Platform';
import NotificationChip from '../../../UI/User/NotificationChip';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SaveProjectIcon from '../../SaveProjectIcon';
const electron = optionalRequire('electron');

type Props = {|
  hasProject: boolean,
  onOpenProjectManager: () => void,
  onOpenProfile: () => void,
  onOpenLanguageDialog: () => void,
  onSave: () => Promise<void>,
  canSave: boolean,
|};

export const HomePageHeader = ({
  hasProject,
  onOpenProjectManager,
  onOpenProfile,
  onOpenLanguageDialog,
  onSave,
  canSave,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout
          justifyContent="space-between"
          alignItems="center"
          noMargin
          expand
        >
          <Column noMargin>
            <Line noMargin>
              <IconButton
                size="small"
                id="main-toolbar-project-manager-button"
                onClick={onOpenProjectManager}
                tooltip={t`Project Manager`}
                color="default"
                disabled={!hasProject}
              >
                <ProjectManagerIcon />
              </IconButton>
              {!!hasProject && (
                <SaveProjectIcon
                  id="main-toolbar-save-button"
                  onSave={onSave}
                  canSave={canSave}
                />
              )}
            </Line>
          </Column>
          <Column>
            <LineStackLayout noMargin alignItems="center">
              {!electron && !isNativeMobileApp() && (
                <FlatButton
                  label={<Trans>Get the app</Trans>}
                  onClick={() =>
                    Window.openExternalURL('https://gdevelop.io/download')
                  }
                />
              )}
              <UserChip onOpenProfile={onOpenProfile} />
              <NotificationChip />
              {isMobile ? (
                <IconButton size="small" onClick={onOpenLanguageDialog}>
                  <TranslateIcon fontSize="small" />
                </IconButton>
              ) : (
                <TextButton
                  label={i18n.language.toUpperCase()}
                  onClick={onOpenLanguageDialog}
                  icon={<TranslateIcon fontSize="small" />}
                />
              )}
            </LineStackLayout>
          </Column>
        </LineStackLayout>
      )}
    </I18n>
  );
};
