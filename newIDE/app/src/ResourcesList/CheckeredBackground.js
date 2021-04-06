// @flow
import { type GDevelopTheme } from '../UI/Theme';

/**
 * Creates a checkered background using CSS gradients,
 * using colors from provided theme.
 */
const getCheckeredBackgroundStyle = (theme: GDevelopTheme) => {
  const light = theme.imagePreview.backgroundLightCell;
  const dark = theme.imagePreview.backgroundDarkCell;
  const borderColor = theme.imagePreview.borderColor;

  return {
    backgroundColor: light,
    backgroundImage: `
    linear-gradient(45deg, ${dark} 25%, transparent 25%),
    linear-gradient(-45deg, ${dark} 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, ${dark} 75%),
    linear-gradient(-45deg, transparent 75%, ${dark} 75%)
    `,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
    border: `1px solid ${borderColor}`,
  };
};

export default getCheckeredBackgroundStyle;
