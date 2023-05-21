// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
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
import { type Announcement } from '../Utils/GDevelopServices/Announcement';
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

  const getAnnouncementContent = (
    i18n: I18nType,
    announcement: Announcement
  ): {|
    title: string,
    message: string,
    isMarkdownImageOnly?: boolean,
  |} => {
    const title = selectMessageByLocale(i18n, announcement.titleByLocale);
    const message = selectMessageByLocale(
      i18n,
      announcement.markdownMessageByLocale
    );

    if (!title) {
      const markdownClickableImageRegex = /\[!\[(?<alt>[^\][]*)\]\((?<imageSource>[^\s]*)\)\]\((?<linkHref>[^\s]*)\)/;
      let matches = message.match(markdownClickableImageRegex);
      if (
        matches &&
        matches.groups &&
        matches.groups.alt &&
        matches.groups.imageSource &&
        matches.groups.linkHref
      ) {
        return { title, message, isMarkdownImageOnly: true };
      }
      const markdownImageRegex = /!\[(?<alt>[^\][]*)\]\((?<imageSource>[^\s]*)\)/;
      matches = message.match(markdownImageRegex);
      if (
        matches &&
        matches.groups &&
        matches.groups.alt &&
        matches.groups.imageSource
      ) {
        return { title, message, isMarkdownImageOnly: true };
      }
    }
    return { title, message };
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Line noMargin={!addMargins}>
          <ColumnStackLayout noMargin={!addMargins} expand>
            {displayedAnnouncements.map(announcement => {
              const { buttonLabelByLocale, buttonUrl } = announcement;
              const {
                title,
                message,
                isMarkdownImageOnly,
              } = getAnnouncementContent(i18n, announcement);

              return (
                <AlertMessage
                  kind={announcement.type}
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
                  hideButtonSize="small"
                  key={announcement.id}
                  markdownImageOnly={isMarkdownImageOnly}
                >
                  {title ? <Text size="block-title">{title}</Text> : null}
                  <MarkdownText source={message} allowParagraphs={false} />
                </AlertMessage>
              );
            })}
          </ColumnStackLayout>
        </Line>
      )}
    </I18n>
  );
};
