// @flow

/**
 * Replaces the icons of some object types by the new designs.
 * Icons are SVG files stored in `public/res/object-icons/`.
 */

/**
 * The icons style being tested (one per branch):
 * - 'Fill': each icon (`name.svg`) is displayed as is, in every theme.
 * - 'MonoFil' and 'OutlineMono': each icon is a single-color file (`name.svg`),
 *   recolored with the theme primary text color.
 * - 'FillOutline': each icon has a file for light themes (`name.svg`) and a
 *   file for dark themes (`name-dark.svg`). Both are displayed as is.
 */
export type ObjectTypeIconsStyle =
  | 'Fill'
  | 'MonoFil'
  | 'OutlineMono'
  | 'FillOutline';
export const OBJECT_TYPE_ICONS_STYLE: ObjectTypeIconsStyle = 'FillOutline';

export const isObjectTypeIconsStyleTinted = (
  style: ObjectTypeIconsStyle
): boolean => style === 'MonoFil' || style === 'OutlineMono';

const objectTypeIconsFolder = 'res/object-icons/';

const iconNamesByObjectType: { [objectType: string]: string } = {
  Sprite: 'sprite',
  'TiledSpriteObject::TiledSprite': 'tiled_sprite',
  'PanelSpriteObject::PanelSprite': 'panel_sprite',
  'Scene3D::Cube3DObject': '3d_box',
  'Scene3D::Model3DObject': '3d_model',
  'TileMap::TileMap': 'tile_map',
  'TileMap::SimpleTileMap': 'tile_map',
  'TextObject::Text': 'text',
  'BBText::BBText': 'bbtext',
  'BitmapText::BitmapTextObject': 'bitmap_text',
  'TextInput::TextInputObject': 'text_input',
  'Video::VideoObject': 'video',
  // Objects from the extension store:
  'PanelSpriteButton::PanelSpriteButton': 'labeled_button',
  'PanelSpriteContinuousBar::PanelSpriteContinuousBar':
    'resource_bar_continuous',
  'TiledUnitsBar::TiledUnitsBar': 'resource_bar_units',
  'PanelSpriteSlider::PanelSpriteSlider': 'slider',
};

/**
 * Return the new icon of the object type, or `fallbackSrc` if the object type
 * has no new icon.
 */
export const getObjectTypeIcon = (
  objectType: string,
  fallbackSrc: string
): string => {
  const iconName = iconNamesByObjectType[objectType];
  return iconName ? `${objectTypeIconsFolder}${iconName}.svg` : fallbackSrc;
};

export const isObjectTypeIcon = (src: string): boolean =>
  src.startsWith(objectTypeIconsFolder);

/**
 * Return the file to display for the current theme.
 */
export const getObjectTypeIconForPaletteType = (
  src: string,
  paletteType: string
): string =>
  OBJECT_TYPE_ICONS_STYLE === 'FillOutline' && paletteType === 'dark'
    ? src.replace(/\.svg$/, '-dark.svg')
    : src;

/**
 * Return true if the thumbnail is an icon bundled with the app (a generic
 * object type icon), and not an image from the project resources.
 */
export const isAppBundledIcon = (src: string): boolean =>
  !src ||
  src.startsWith('res/') ||
  src.startsWith('JsPlatform/') ||
  src.startsWith('CppPlatform/');
