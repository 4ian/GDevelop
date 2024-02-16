// @flow
import * as React from 'react';
import { AnnouncementsFeedContext } from '../AnnouncementsFeed/AnnouncementsFeedContext';
import RouterContext from '../MainFrame/RouterContext';
import { getOnClick } from './PromotionHelper';
import Slideshow from '../UI/Slideshow/Slideshow';

const promotionDesktopRatio = 5038 / 459;
const promotionMobileRatio = 18 / 7;

type PromotionsSlideshowProps = {|
  type?: 'game' | 'asset-pack' | 'game-template',
|};

const PromotionsSlideshow = ({ type }: PromotionsSlideshowProps) => {
  const { promotions, error } = React.useContext(AnnouncementsFeedContext);
  const { navigateToRoute } = React.useContext(RouterContext);

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
    />
  );
};

export default PromotionsSlideshow;
