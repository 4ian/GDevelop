// @flow
import * as React from 'react';
import { AnnouncementsFeedContext } from '../AnnouncementsFeed/AnnouncementsFeedContext';
import RouterContext from '../MainFrame/RouterContext';
import { getOnClick } from './PromotionHelper';
import Slideshow from '../UI/Slideshow/Slideshow';
import {
  homepageDesktopMenuBarWidth,
  homepageMediumMenuBarWidth,
} from '../MainFrame/EditorContainers/HomePage/HomePageMenuBar';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { SECTION_PADDING } from '../MainFrame/EditorContainers/HomePage/SectionContainer';

const promotionDesktopRatio = 5038 / 459;
const promotionMobileRatio = 18 / 7;

type PromotionsSlideshowProps = {|
  type?: 'game' | 'asset-pack' | 'game-template',
|};

const PromotionsSlideshow = ({ type }: PromotionsSlideshowProps) => {
  const { promotions, error } = React.useContext(AnnouncementsFeedContext);
  const { navigateToRoute } = React.useContext(RouterContext);
  const { isMobile, isMediumScreen } = useResponsiveWindowSize();

  const filteredPromotions =
    promotions && type
      ? promotions.filter(promotion => promotion.type === type)
      : promotions;

  const slideShowItems = filteredPromotions
    ? filteredPromotions.map(promotion => ({
        id: promotion.id,
        imageUrl: promotion.imageUrl,
        mobileImageUrl: promotion.mobileImageUrl,
        onClick: getOnClick({ promotion, navigateToRoute }),
      }))
    : null;

  if (error) {
    // In case of error, just don't display the promotions.
    return null;
  }

  return (
    <Slideshow
      items={slideShowItems}
      itemDesktopRatio={promotionDesktopRatio}
      itemMobileRatio={promotionMobileRatio}
      additionalMarginForWidthCalculation={
        isMobile
          ? 0
          : isMediumScreen
          ? homepageMediumMenuBarWidth + 2 * SECTION_PADDING
          : homepageDesktopMenuBarWidth + 2 * SECTION_PADDING
      }
    />
  );
};

export default PromotionsSlideshow;
