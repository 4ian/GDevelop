// @flow
import { type Announcement } from '../Utils/GDevelopServices/Announcement';
import { type I18n as I18nType } from '@lingui/core';
import { type Route, type RouteArguments } from '../MainFrame/RouterContext';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';

const getAdapatedMessageAndRouteNavigationParams = (
  message: string
): {|
  message: string,
  routeNavigationParams?: { route: Route, params: RouteArguments },
  isClickableContent?: boolean,
|} => {
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
          message: messageWithoutHref,
          routeNavigationParams: { route, params: otherParams },
          isClickableContent: true,
        };
      }
    }

    return {
      message,
      isClickableContent: true,
    };
  }

  const markdownImageRegex = /!\[(?<alt>[^\][]*)\]\((?<imageSource>[^\s]*)\)/;
  matches = message.match(markdownImageRegex);
  groups = matches && matches.groups;
  if (groups && groups.alt && groups.imageSource) {
    return { message };
  }

  return { message };
};

export const getAnnouncementContent = (
  i18n: I18nType,
  announcement: Announcement
): {|
  title: string,
  desktopMessage: string,
  mobileMessage: string,
  desktopRouteNavigationParams?: { route: Route, params: RouteArguments },
  mobileRouteNavigationParams?: { route: Route, params: RouteArguments },
  isClickableContent: boolean,
|} => {
  const title = selectMessageByLocale(i18n, announcement.titleByLocale);
  const message = selectMessageByLocale(
    i18n,
    announcement.markdownMessageByLocale
  );
  const mobileMessage = announcement.mobileMarkdownMessageByLocale
    ? selectMessageByLocale(i18n, announcement.mobileMarkdownMessageByLocale)
    : message;

  const {
    message: adaptedDesktopMessage,
    routeNavigationParams: desktopRouteNavigationParams,
    isClickableContent: isDesktopClickableContent,
  } = getAdapatedMessageAndRouteNavigationParams(message);
  const {
    message: adaptedMobileMessage,
    routeNavigationParams: mobileRouteNavigationParams,
    isClickableContent: isMobileClickableContent,
  } = getAdapatedMessageAndRouteNavigationParams(mobileMessage);

  return {
    title,
    desktopMessage: adaptedDesktopMessage,
    mobileMessage: adaptedMobileMessage,
    desktopRouteNavigationParams,
    mobileRouteNavigationParams,
    isClickableContent:
      !!isDesktopClickableContent || !!isMobileClickableContent,
  };
};
