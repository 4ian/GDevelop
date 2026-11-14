// The 2D layers of a GDevelop game (texts of the interface: score, speed, messages) as ThreeRT's HUD, which the app
// draws over the traced picture (ThreeRT draws no 2D). Each visible text object of a layer that is not 3D becomes
// a HUD text, anchored to the area of the screen it is in.
type HudAnchor = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

const anchorOf = (x: number, y: number, width: number, height: number): HudAnchor => {
  const column = x < width / 3 ? 0 : x < (2 * width) / 3 ? 1 : 2;
  const row = y < height / 3 ? 0 : y < (2 * height) / 3 ? 1 : 2;
  return (
    [
      ['top-left', 'top', 'top-right'],
      ['left', 'center', 'right'],
      ['bottom-left', 'bottom', 'bottom-right'],
    ] as HudAnchor[][]
  )[row][column];
};

const isTextObject = (object: any) =>
  typeof object.getText === 'function' && typeof object.getCharacterSize === 'function';

export const updateHud = (game: any, hud: { set(state: any): boolean }) => {
  const scene = game.getSceneStack && game.getSceneStack().getCurrentScene();
  if (!scene) return;
  const width = game.getGameResolutionWidth();
  const height = game.getGameResolutionHeight();
  const items: Array<{ y: number; x: number; item: any }> = [];
  const layers: any[] = scene._orderedLayers || [];
  for (const layer of layers) {
    if (!layer.isVisible()) continue;
    const renderingType = layer.getRenderingType ? layer.getRenderingType() : '2d';
    if (renderingType === 'THREE_D' || renderingType === '3d') continue;
    const layerName = layer.getName();
    for (const object of scene.getAdhocListOfAllInstances()) {
      if (object.getLayer() !== layerName || !isTextObject(object) || object.isHidden()) continue;
      if (typeof object.getOpacity === 'function' && object.getOpacity() <= 0) continue;
      const text = String(object.getText() || '').trim();
      if (!text) continue;
      const centerX = layer.convertInverseCoords
        ? layer.convertInverseCoords(object.getCenterXInScene(), object.getCenterYInScene())[0]
        : object.getCenterXInScene();
      const centerY = layer.convertInverseCoords
        ? layer.convertInverseCoords(object.getCenterXInScene(), object.getCenterYInScene())[1]
        : object.getCenterYInScene();
      const size = object.getCharacterSize();
      items.push({
        x: centerX,
        y: centerY,
        item: {
          type: 'text',
          anchor: anchorOf(centerX, centerY, width, height),
          text: text.length > 200 ? text.substring(0, 200) : text,
          size: size >= 40 ? 'large' : size <= 18 ? 'small' : 'normal',
        },
      });
    }
  }
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  hud.set({ items: items.map((i) => i.item) });
};
