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
import Paper from '../UI/Paper';
import { getAnnouncementContent } from './AnnouncementFormatting';
import RouterContext from '../MainFrame/RouterContext';

type AnnouncementsFeedProps = {|
  level?: 'urgent' | 'normal',
  canClose?: boolean,
  addMargins?: boolean,
  hideLoader?: boolean,
|};

export const AnnouncementsFeed = ({
  level,
  canClose,
  addMargins,
  hideLoader,
}: AnnouncementsFeedProps) => {
  const {
    announcements,
    error,
    fetchAnnouncementsAndPromotions,
  } = React.useContext(AnnouncementsFeedContext);
  const { values, showAnnouncement } = React.useContext(PreferencesContext);
  const { navigateToRoute } = React.useContext(RouterContext);

  if (error) {
    return (
      <PlaceholderError onRetry={fetchAnnouncementsAndPromotions}>
        <Trans>
          Can't load the announcements. Verify your internet connection or try
          again later.
        </Trans>
      </PlaceholderError>
    );
  } else if (!announcements) {
    return hideLoader ? null : <PlaceholderLoader />;
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
        <Paper square background="dark">
          <Line noMargin={!addMargins}>
            <ColumnStackLayout noMargin={!addMargins} expand>
              {displayedAnnouncements.map(announcement => {
                const { buttonLabelByLocale, buttonUrl } = announcement;
                const {
                  title,
                  message,
                  routeNavigationParams,
                } = getAnnouncementContent(i18n, announcement);

                const onClick = routeNavigationParams
                  ? () =>
                      navigateToRoute(
                        routeNavigationParams.route,
                        routeNavigationParams.params
                      )
                  : null;

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
                    markdownImageOnly={!title}
                  >
                    {title ? <Text size="block-title">{title}</Text> : null}
                    <div onClick={onClick}>
                      <MarkdownText source={message} allowParagraphs={false} />
                    </div>
                  </AlertMessage>
                );
              })}
            </ColumnStackLayout>
          </Line>
        </Paper>
      )}
    </I18n>
  );
};
