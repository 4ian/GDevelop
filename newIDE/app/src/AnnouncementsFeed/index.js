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
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const styles = {
  markdownContainer: {
    transition: 'transform 0.3s ease-in-out',
  },
};

const useStylesForClickableContainer = () =>
  makeStyles(theme =>
    createStyles({
      root: {
        '&:hover': {
          transform: 'scale(1.02)',
        },
        '&:focus': {
          transform: 'scale(1.02)',
          outline: 'none',
        },
      },
    })
  )();

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
  const { isMobile } = useResponsiveWindowSize();

  const classesForClickableContainer = useStylesForClickableContainer();

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
              {displayedAnnouncements.map((announcement, index) => {
                const { buttonLabelByLocale, buttonUrl } = announcement;
                const {
                  title,
                  desktopMessage,
                  mobileMessage,
                  desktopRouteNavigationParams,
                  mobileRouteNavigationParams,
                  isClickableContent,
                } = getAnnouncementContent(i18n, announcement);

                const onClick =
                  desktopRouteNavigationParams && !isMobile
                    ? () =>
                        navigateToRoute(
                          desktopRouteNavigationParams.route,
                          desktopRouteNavigationParams.params
                        )
                    : mobileRouteNavigationParams && isMobile
                    ? () =>
                        navigateToRoute(
                          mobileRouteNavigationParams.route,
                          mobileRouteNavigationParams.params
                        )
                    : undefined;

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
                    <div
                      onClick={onClick}
                      className={
                        isClickableContent
                          ? classesForClickableContainer.root
                          : undefined
                      }
                      style={styles.markdownContainer}
                    >
                      {isMobile ? (
                        <MarkdownText
                          source={mobileMessage}
                          allowParagraphs={false}
                        />
                      ) : (
                        <MarkdownText
                          source={desktopMessage}
                          allowParagraphs={false}
                        />
                      )}
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
