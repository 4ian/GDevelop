// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import TranslateIcon from '@material-ui/icons/Translate';
import { Column, Line } from '../../../UI/Grid';
import { LineStackLayout } from '../../../UI/Layout';
import UserChip from '../../../UI/User/UserChip';
import IconButton from '../../../UI/IconButton';
import NotificationChip from '../../../UI/User/NotificationChip';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SaveProjectIcon from '../../SaveProjectIcon';
import HistoryIcon from '../../../UI/CustomSvgIcons/History';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '../../../ProjectsStorage';
import Text from '../../../UI/Text';
import LocalesMetadata from '../../../locales/LocalesMetadata';

const carrotsFontFamily =
  '"Cairo", "Noto Sans Arabic", "Noto Sans", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Segoe UI", "Ubuntu", sans-serif';

const normalizeLanguageCode = (languageCode: string): string =>
  languageCode.toLowerCase().replace('-', '_');

const getLanguageMetadata = (
  languageCode: string
): ?{
  languageCode: string,
  languageName: string,
  languageNativeName: string,
} => {
  const normalizedLanguageCode = normalizeLanguageCode(languageCode);
  return LocalesMetadata.find(localeMetadata => {
    const localeCode = normalizeLanguageCode(localeMetadata.languageCode);
    if (localeCode === normalizedLanguageCode) return true;
    return localeCode.split('_')[0] === normalizedLanguageCode.split('_')[0];
  });
};

const getLanguageDisplayLabel = (languageCode: string): string => {
  const metadata = getLanguageMetadata(languageCode);
  if (!metadata) return languageCode.toUpperCase();
  return metadata.languageNativeName || metadata.languageName;
};

const getLanguageDisplayCode = (languageCode: string): string => {
  const normalized = normalizeLanguageCode(languageCode);
  return normalized
    .split('_')
    .filter(Boolean)
    .map(part => part.toUpperCase())
    .join('-');
};

const styles = {
  container: {
    borderRadius: 16,
    padding: '8px 12px',
    background:
      'linear-gradient(135deg, rgba(24, 31, 27, 0.95), rgba(16, 20, 18, 0.95))',
    border: '1px solid rgba(124, 203, 143, 0.24)',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.2)',
  },
  leftActions: {
    borderRadius: 12,
    padding: '3px 6px',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  rightActions: {
    borderRadius: 12,
    padding: '2px 4px',
    background: 'rgba(255, 255, 255, 0.02)',
    gap: 6,
  },
  languageButton: {
    border: '1px solid rgba(255, 177, 92, 0.55)',
    borderRadius: 999,
    background:
      'linear-gradient(135deg, rgba(242, 140, 40, 0.2), rgba(46, 159, 91, 0.2))',
    color: '#f6f4ee',
    fontFamily: carrotsFontFamily,
    fontWeight: 700,
    letterSpacing: 0.4,
    padding: '6px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    outline: 'none',
    minHeight: 32,
  },
  languageButtonMobile: {
    border: '1px solid rgba(255, 177, 92, 0.55)',
    borderRadius: 10,
    background:
      'linear-gradient(135deg, rgba(242, 140, 40, 0.2), rgba(46, 159, 91, 0.2))',
    color: '#f6f4ee',
    padding: 5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    minHeight: 28,
    minWidth: 28,
  },
  languageLabel: {
    fontSize: 12,
    lineHeight: '14px',
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  languageCode: {
    fontSize: 10,
    lineHeight: '12px',
    opacity: 0.82,
  },
};

type Props = {|
  hasProject: boolean,
  onOpenVersionHistory: () => void,
  onOpenProfile: () => void,
  onOpenLanguageDialog: () => void,
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  canSave: boolean,
|};

export const HomePageHeader = ({
  hasProject,
  onOpenVersionHistory,
  onOpenProfile,
  onOpenLanguageDialog,
  onSave,
  canSave,
}: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  const { profile } = React.useContext(AuthenticatedUserContext);

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout
          justifyContent="space-between"
          alignItems="center"
          noMargin
          expand
          style={styles.container}
        >
          <Column noMargin>
            <Line noMargin style={styles.leftActions}>
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
            <LineStackLayout
              noMargin
              alignItems="center"
              style={styles.rightActions}
            >
              <UserChip onOpenProfile={onOpenProfile} />
              {profile && <NotificationChip />}
              {isMobile ? (
                <button
                  type="button"
                  style={styles.languageButtonMobile}
                  onClick={onOpenLanguageDialog}
                  aria-label={i18n._(t`Change language`)}
                >
                  <TranslateIcon fontSize="small" />
                </button>
              ) : (
                <button
                  type="button"
                  style={styles.languageButton}
                  onClick={onOpenLanguageDialog}
                >
                  <TranslateIcon fontSize="small" />
                  <Column noMargin>
                    <Text noMargin style={styles.languageLabel}>
                      {getLanguageDisplayLabel(i18n.language)}
                    </Text>
                    <Text noMargin style={styles.languageCode}>
                      {getLanguageDisplayCode(i18n.language)}
                    </Text>
                  </Column>
                </button>
              )}
            </LineStackLayout>
          </Column>
        </LineStackLayout>
      )}
    </I18n>
  );
};
