// @flow
import * as React from 'react';
import { I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import { AnnouncementsFeedContext } from '../AnnouncementsFeed/AnnouncementsFeedContext';
import RouterContext from '../MainFrame/RouterContext';
import { getOnClick } from './PromotionHelper';
import Slideshow, { type SlideShowItem } from '../UI/Slideshow/Slideshow';
import {
  homepageDesktopMenuBarWidth,
  homepageMediumMenuBarWidth,
} from '../MainFrame/EditorContainers/HomePage/HomePageMenuBar';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { SECTION_DESKTOP_SPACING } from '../MainFrame/EditorContainers/HomePage/SectionContainer';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import { type Promotion } from '../Utils/GDevelopServices/Announcement';

const promotionDesktopRatio = 5038 / 459;
const promotionMobileRatio = 18 / 7;

type PromotionsSlideshowProps = {|
  type?: 'game' | 'asset-pack' | 'game-template',
|};

const PromotionsSlideshow = ({ type }: PromotionsSlideshowProps) => {
  const { promotions, error } = React.useContext(AnnouncementsFeedContext);
  const { navigateToRoute } = React.useContext(RouterContext);
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();

  const getSlideShowItems = (i18n: I18nType): SlideShowItem[] | null => {
    const filteredPromotions =
      promotions && type
        ? promotions.filter(promotion => promotion.type === type)
        : promotions;

    const slideShowItems = filteredPromotions
      ? filteredPromotions
          .map((promotion: Promotion) => {
            const imageUrl = promotion.imageUrlByLocale
              ? selectMessageByLocale(i18n, promotion.imageUrlByLocale)
              : promotion.imageUrl;
            const mobileImageUrl = promotion.mobileImageUrlByLocale
              ? selectMessageByLocale(i18n, promotion.mobileImageUrlByLocale)
              : promotion.mobileImageUrl;
            if (!imageUrl || !mobileImageUrl) return null;

            return {
              id: promotion.id,
              imageUrl,
              mobileImageUrl,
              onClick: getOnClick({ promotion, navigateToRoute }),
            };
          })
          .filter(Boolean)
      : null;

    return slideShowItems;
  };

  if (error) {
    // In case of error, just don't display the promotions.
    return null;
  }

  return (
    <I18n>
      {({ i18n }) => {
        const slideShowItems = getSlideShowItems(i18n);
        return (
          <Slideshow
            items={slideShowItems}
            itemDesktopRatio={promotionDesktopRatio}
            itemMobileRatio={promotionMobileRatio}
            additionalMarginForWidthCalculation={
              isMobile
                ? 0
                : isMediumScreen
                ? homepageMediumMenuBarWidth + 2 * SECTION_DESKTOP_SPACING
                : homepageDesktopMenuBarWidth + 2 * SECTION_DESKTOP_SPACING
            }
          />
        );
      }}
    </I18n>
  );
};

export default PromotionsSlideshow;
