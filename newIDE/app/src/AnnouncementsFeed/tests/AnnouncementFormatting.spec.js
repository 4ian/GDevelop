// @flow
import { type I18n as I18nType } from '@lingui/core';
import { getAnnouncementContent } from '../AnnouncementFormatting';
import { type Announcement } from '../../Utils/GDevelopServices/Announcement';

// $FlowExpectedError
const makeFakeI18n = (): I18nType => ({
  _: message => message.id,
  language: 'en',
});

describe('getAnnouncementContent', () => {
  it('should return an object with title and message when announcement has a title', () => {
    const announcement: Announcement = {
      id: 'fantasy-dreamland-mega-pack',
      level: 'normal',
      titleByLocale: {
        en: 'Announcement title',
      },
      markdownMessageByLocale: {
        en: 'This is the announcement message.',
      },
    };
    const result = getAnnouncementContent(makeFakeI18n(), announcement);
    expect(result).toEqual({
      title: 'Announcement title',
      message: 'This is the announcement message.',
    });
  });

  it('should return an object with message only when announcement has no title and no link', () => {
    const imageMessage = '![Big Game Jam 4](https://example.com/image.png)';
    const announcement = {
      id: 'big-game-jam-4',
      level: 'urgent',
      titleByLocale: {
        en: '',
      },
      markdownMessageByLocale: {
        en: imageMessage,
      },
    };
    const result = getAnnouncementContent(makeFakeI18n(), announcement);
    expect(result).toEqual({
      title: '',
      message: imageMessage,
    });
  });

  it('should return an object with message only when announcement has no title and an external link', () => {
    const imageWithLinkMessage =
      '[![Big Game Jam 4](https://resources.gdevelop.io/announcements/Big_Game_Jam_4.png)](https://itch.io/jam/gdevelop-game-jam-4)';
    const announcement = {
      id: 'big-game-jam-4',
      level: 'urgent',
      titleByLocale: {
        en: '',
      },
      markdownMessageByLocale: {
        en: imageWithLinkMessage,
      },
    };
    const result = getAnnouncementContent(makeFakeI18n(), announcement);
    expect(result).toEqual({
      title: '',
      message: imageWithLinkMessage,
    });
  });

  it('should return an object with message only and routeNavigationParams when announcement has no title and an internal link', () => {
    const imageMarkdown =
      '![GDevelop Mega Pack on GDevelop asset store](https://resources.gdevelop.io/announcements/GDevelops_Mega_Pack_Updated.png)';
    const imageWithInternalLinkMessage = `[${imageMarkdown}](https://editor.gdevelop.io/?initial-dialog=asset-store&asset-pack=gdevelop-mega-bundle-43994a30-c54b-4f5d-baf5-6e1f99b13824)`;
    const announcement = {
      id: 'gdevelop-mega-pack',
      level: 'urgent',
      titleByLocale: {
        en: '',
      },
      markdownMessageByLocale: {
        en: imageWithInternalLinkMessage,
      },
    };
    const result = getAnnouncementContent(makeFakeI18n(), announcement);
    expect(result).toEqual({
      title: '',
      message: imageMarkdown, // The link is removed from the message.
      routeNavigationParams: {
        route: 'asset-store',
        params: {
          'asset-pack':
            'gdevelop-mega-bundle-43994a30-c54b-4f5d-baf5-6e1f99b13824',
        },
      },
    });
  });
});
