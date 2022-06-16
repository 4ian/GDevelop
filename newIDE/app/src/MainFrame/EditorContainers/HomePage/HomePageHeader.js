// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import FlatButton from '../../../UI/FlatButton';
import { Column } from '../../../UI/Grid';
import { LineStackLayout } from '../../../UI/Layout';
import UserChip from '../../../UI/User/UserChip';
import Window from '../../../Utils/Window';
import optionalRequire from '../../../Utils/OptionalRequire';
import RaisedButton from '../../../UI/RaisedButton';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import TextButton from '../../../UI/TextButton';
import ProjectManagerIcon from '../../../UI/CustomSvgIcons/ProjectManager';
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
  const windowWidth = useResponsiveWindowWidth();

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout
          justifyContent="space-between"
          alignItems="center"
          noMargin
          expand
        >
          {!!project ? (
            <RaisedButton
              id="open-project-manager-button"
              label={<Trans>Project Manager</Trans>}
              onClick={onOpenProjectManager}
              icon={<ProjectManagerIcon />}
              primary
            />
          ) : (
            <div />
          )}
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
              <UserChip onOpenProfile={onOpenProfile} />
              <TextButton
                label={i18n.language.toUpperCase()}
                onClick={onOpenLanguageDialog}
                icon={<TranslateIcon fontSize="small" />}
              />
            </LineStackLayout>
          </Column>
        </LineStackLayout>
      )}
    </I18n>
  );
};
