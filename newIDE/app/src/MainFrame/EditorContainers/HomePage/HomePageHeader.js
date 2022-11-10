// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import FlatButton from '../../../UI/FlatButton';
import { Line, Column } from '../../../UI/Grid';
import { LineStackLayout } from '../../../UI/Layout';
import UserChip from '../../../UI/User/UserChip';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { hasPendingNotifications } from '../../../Utils/Notification';
import Window from '../../../Utils/Window';
import optionalRequire from '../../../Utils/OptionalRequire';
import RaisedButton from '../../../UI/RaisedButton';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import TextButton from '../../../UI/TextButton';
const electron = optionalRequire('electron');

type Props = {|
  project: ?gdProject,
  onOpenProjectManager: () => void,
  onOpenProfile: () => void,
  onOpenLanguageDialog: () => void,
|};

export const HomePageHeader = ({
  project,
  onOpenProjectManager,
  onOpenProfile,
  onOpenLanguageDialog,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const GDevelopTheme = React.useContext(GDevelopThemeContext);
  const windowWidth = useResponsiveWindowWidth();

  return (
    <I18n>
      {({ i18n }) => (
        <div
          style={{
            borderBottom: `1px solid ${GDevelopTheme.home.separator.color}`,
            backgroundColor: GDevelopTheme.home.header.backgroundColor,
          }}
        >
          <Line expand>
            <LineStackLayout
              justifyContent="space-between"
              alignItems="center"
              noMargin
              expand
            >
              <Column>
                {!!project && windowWidth !== 'small' && (
                  <Line noMargin>
                    <RaisedButton
                      id="open-project-manager-button"
                      label={<Trans>Project Manager</Trans>}
                      onClick={onOpenProjectManager}
                      primary
                    />
                  </Line>
                )}
              </Column>
              <Column>
                <LineStackLayout noMargin alignItems="center">
                  {!electron && windowWidth !== 'small' && (
                    <FlatButton
                      label={<Trans>Download desktop app</Trans>}
                      onClick={() =>
                        Window.openExternalURL('https://gdevelop.io/download')
                      }
                    />
                  )}
                  <UserChip
                    profile={authenticatedUser.profile}
                    onClick={onOpenProfile}
                    displayNotificationBadge={hasPendingNotifications(
                      authenticatedUser
                    )}
                  />
                  <TextButton
                    label={i18n.language.toUpperCase()}
                    onClick={onOpenLanguageDialog}
                    icon={<TranslateIcon fontSize="small" />}
                  />
                </LineStackLayout>
              </Column>
            </LineStackLayout>
          </Line>
        </div>
      )}
    </I18n>
  );
};
