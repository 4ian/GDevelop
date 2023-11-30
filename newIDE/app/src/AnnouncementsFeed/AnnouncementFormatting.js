// @flow
import { type Announcement } from '../Utils/GDevelopServices/Announcement';
import { type I18n as I18nType } from '@lingui/core';
import { type Route, type RouteArguments } from '../MainFrame/RouterContext';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';

export const getAnnouncementContent = (
  i18n: I18nType,
  announcement: Announcement
): {|
  title: string,
  message: string,
  routeNavigationParams?: { route: Route, params: RouteArguments },
|} => {
  const title = selectMessageByLocale(i18n, announcement.titleByLocale);
  const message = selectMessageByLocale(
    i18n,
    announcement.markdownMessageByLocale
  );

  if (!title) {
    const markdownClickableImageRegex = /\[!\[(?<alt>[^\][]*)\]\((?<imageSource>[^\s]*)\)\]\((?<linkHref>[^\s]*)\)/;
    let matches = message.match(markdownClickableImageRegex);
    let groups = matches && matches.groups;
    if (groups && groups.alt && groups.imageSource && groups.linkHref) {
      // If the href is pointing to the editor, this can be an internal link,
      // so we don't open a new link, and instead use the internal router
      // to navigate to the right page/dialog.
      if (groups.linkHref.startsWith('https://editor.gdevelop.io')) {
        const urlParams = new URLSearchParams(
          groups.linkHref.replace(/.*\?/, '')
        );
        // $FlowFixMe - Assume that the arguments are always valid.
        const route: ?Route = urlParams.get('initial-dialog');
        const otherParams = {};
        urlParams.forEach((value, key) => {
          if (key !== 'initial-dialog') otherParams[key] = value;
        });
        if (route) {
          const messageWithoutHref = message.replace(
            markdownClickableImageRegex,
            `![${groups.alt}](${groups.imageSource})`
          );
          return {
            title,
            message: messageWithoutHref,
            routeNavigationParams: { route, params: otherParams },
          };
        }
      }

      return {
        title,
        message,
      };
    }
    const markdownImageRegex = /!\[(?<alt>[^\][]*)\]\((?<imageSource>[^\s]*)\)/;
    matches = message.match(markdownImageRegex);
    groups = matches && matches.groups;
    if (groups && groups.alt && groups.imageSource) {
      return { title, message };
    }
  }
  return { title, message };
};
