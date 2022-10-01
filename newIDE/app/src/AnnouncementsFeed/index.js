// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import Window from '../Utils/Window';
import { AnnouncementsFeedContext } from './AnnouncementsFeedContext';
import Text from '../UI/Text';
import { Line } from '../UI/Grid';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { MarkdownText } from '../UI/MarkdownText';

type AnnouncementsFeedProps = {|
  level?: 'urgent' | 'normal',
  canClose?: boolean,
  addMargins?: boolean,
|};

export const AnnouncementsFeed = ({
  level,
  canClose,
  addMargins,
}: AnnouncementsFeedProps) => {
  const { announcements, error, fetchAnnouncements } = React.useContext(
    AnnouncementsFeedContext
  );
  const { values, showAnnouncement } = React.useContext(PreferencesContext);

  if (error) {
    return (
      <PlaceholderError onRetry={fetchAnnouncements}>
        <Trans>
          Can't load the announcements. Verify your internet connection or try
          again later.
        </Trans>
      </PlaceholderError>
    );
  } else if (!announcements) {
    return <PlaceholderLoader />;
  }

  const properLevelAnnouncements = level
    ? announcements.filter(announcement => announcement.level === level)
    : announcements;

  const displayedAnnouncements = canClose
    ? properLevelAnnouncements.filter(announcement => {
        return !values.hiddenAnnouncements[announcement.id];
      })
    : properLevelAnnouncements;

  if (!displayedAnnouncements.length) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <Line noMargin={!addMargins}>
          <ColumnStackLayout noMargin={!addMargins} expand>
            {displayedAnnouncements.map(announcement => {
              const { buttonLabelByLocale, buttonUrl } = announcement;

              return (
                <AlertMessage
                  kind={announcement.type === 'warning' ? 'warning' : 'info'}
                  renderRightButton={
                    buttonLabelByLocale && buttonUrl
                      ? () => (
                          <RaisedButton
                            label={selectMessageByLocale(
                              i18n,
                              buttonLabelByLocale
                            )}
                            onClick={() => Window.openExternalURL(buttonUrl)}
                          />
                        )
                      : null
                  }
                  onHide={
                    canClose
                      ? () => {
                          showAnnouncement(announcement.id, false);
                        }
                      : null
                  }
                >
                  <Text size="block-title">
                    <Trans>
                      {selectMessageByLocale(i18n, announcement.titleByLocale)}
                    </Trans>
                  </Text>
                  <MarkdownText
                    source={selectMessageByLocale(
                      i18n,
                      announcement.markdownMessageByLocale
                    )}
                    allowParagraphs={false}
                  />
                </AlertMessage>
              );
            })}
          </ColumnStackLayout>
        </Line>
      )}
    </I18n>
  );
};
