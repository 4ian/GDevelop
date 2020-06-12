import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';
import Window from './Window';

const RECOMMENDED_IMAGE_SIZE = 2048;

export const checkImageElementSize = (imageElement: HTMLImageElement) => {
  if (!imageElement) return;
  const image = imageElement.target;

  return image.naturalWidth > RECOMMENDED_IMAGE_SIZE ||
    image.naturalHeight > RECOMMENDED_IMAGE_SIZE
    ? true
    : false;
};

export const confirmationImportImage = () => {
  const answer = Window.showConfirmDialog(
    i18n._(
      t`The selected image is more than 2048 pixels wide. The image may not be displayed on some devices. Do you really want to import the image?`
    )
  );

  return answer ? true : false;
};
