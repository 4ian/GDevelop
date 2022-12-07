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
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import TextButton from '../../../UI/TextButton';
const electron = optionalRequire('electron');

type Props = {|
  onOpenProjectManager: () => void,
  onOpenProfile: () => void,
  onOpenLanguageDialog: () => void,
|};

export const HomePageHeader = ({
  onOpenProjectManager,
  onOpenProfile,
  onOpenLanguageDialog,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout
          justifyContent="flex-end"
          alignItems="center"
          noMargin
          expand
        >
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
