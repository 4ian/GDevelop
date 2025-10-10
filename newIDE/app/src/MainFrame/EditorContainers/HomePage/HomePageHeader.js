// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import FlatButton from '../../../UI/FlatButton';
import { Column, Line } from '../../../UI/Grid';
import { LineStackLayout } from '../../../UI/Layout';
import UserChip from '../../../UI/User/UserChip';
import Window from '../../../Utils/Window';
import optionalRequire from '../../../Utils/OptionalRequire';
import TextButton from '../../../UI/TextButton';
import IconButton from '../../../UI/IconButton';
import { isNativeMobileApp } from '../../../Utils/Platform';
import NotificationChip from '../../../UI/User/NotificationChip';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SaveProjectIcon from '../../SaveProjectIcon';
import Mobile from '../../../UI/CustomSvgIcons/Mobile';
import Desktop from '../../../UI/CustomSvgIcons/Desktop';
import HistoryIcon from '../../../UI/CustomSvgIcons/History';
import SunIcon from '../../../UI/CustomSvgIcons/Sun';
import Brightness3Icon from '@material-ui/icons/Brightness3';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import PreferencesContext from '../../Preferences/PreferencesContext';
const electron = optionalRequire('electron');

type Props = {|
  hasProject: boolean,
  onOpenVersionHistory: () => void,
  onOpenProfile: () => void,
  onOpenLanguageDialog: () => void,
  onSave: () => Promise<void>,
  canSave: boolean,
|};

export const HomePageHeader = ({
  hasProject,
  onOpenVersionHistory,
  onOpenProfile,
  onOpenLanguageDialog,
  onSave,
  canSave,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const { profile } = React.useContext(AuthenticatedUserContext);
  const preferences = React.useContext(PreferencesContext);
  const isDarkTheme = preferences.values.themeName.includes('Dark');

  const toggleTheme = React.useCallback(
    () => {
      const newTheme = isDarkTheme
        ? 'GDevelop default Light'
        : 'GDevelop default Dark';
      preferences.setThemeName(newTheme);
    },
    [isDarkTheme, preferences]
  );

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
              {!!hasProject && (
                <>
                  <IconButton
                    size="small"
                    id="main-toolbar-history-button"
                    onClick={onOpenVersionHistory}
                    tooltip={t`Open version history`}
                    color="default"
                  >
                    <HistoryIcon />
                  </IconButton>
                  <SaveProjectIcon
                    id="main-toolbar-save-button"
                    onSave={onSave}
                    canSave={canSave}
                  />
                </>
              )}
            </Line>
          </Column>
          <Column>
            <LineStackLayout noMargin alignItems="center">
              {!electron &&
                !isNativeMobileApp() &&
                (isMobile ? (
                  <IconButton
                    size="small"
                    onClick={() =>
                      Window.openExternalURL('https://gdevelop.io/download')
                    }
                  >
                    <Mobile />
                  </IconButton>
                ) : (
                  <FlatButton
                    label={<Trans>Get the app</Trans>}
                    onClick={() =>
                      Window.openExternalURL('https://gdevelop.io/download')
                    }
                    leftIcon={<Desktop />}
                  />
                ))}
              <UserChip onOpenProfile={onOpenProfile} />
              {profile && <NotificationChip />}
              <IconButton
                size="small"
                id="homepage-theme-toggle-button"
                onClick={toggleTheme}
                tooltip={
                  isDarkTheme ? t`Switch to light mode` : t`Switch to dark mode`
                }
                color="default"
              >
                {isDarkTheme ? (
                  <SunIcon style={{ fontSize: 20 }} />
                ) : (
                  <Brightness3Icon style={{ fontSize: 20 }} />
                )}
              </IconButton>
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
