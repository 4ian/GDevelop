// @ts-check

/**
 * Basic tests for gdjs.TextRuntimeObject
 */
describe('gdjs.TextRuntimeObject', () => {
  const makeTextObjectData = text => ({
    name: 'TextObject',
    type: 'TextObject::Text',
    variables: [],
    behaviors: [],
    effects: [],
    content: {
      characterSize: 20,
      font: '',
      bold: false,
      italic: false,
      underlined: false,
      color: '0;0;0',
      text,
      textAlignment: 'left',
      verticalTextAlignment: 'top',
      lineHeight: 0,
      isOutlineEnabled: false,
      outlineThickness: 2,
      outlineColor: '255;255;255',
      isShadowEnabled: false,
      shadowColor: '0;0;0',
      shadowOpacity: 127,
      shadowDistance: 4,
      shadowAngle: 90,
      shadowBlurRadius: 2,
    },
  });

  it('resolves global config placeholders in the initial text', () => {
    const originalRenderer = gdjs.TextRuntimeObjectRenderer;
    gdjs.TextRuntimeObjectRenderer = class TextRuntimeObjectTestRenderer {
      getRendererObject() {
        return null;
      }
      ensureUpToDate() {}
      updateStyle() {}
      updateAngle() {}
      updateOpacity() {}
      updateString() {}
      updatePosition() {}
      getWidth() {
        return 0;
      }
      getHeight() {
        return 0;
      }
      getScaleX() {
        return 1;
      }
      getScaleY() {
        return 1;
      }
      setScale() {}
      setScaleX() {}
      setScaleY() {}
      destroy() {}
    };

    const runtimeGame = gdjs.getPixiRuntimeGame();
    runtimeGame.setGlobalConfig({
      i18n: {
        'button1.label': {
          en: 'A button',
          cn: 'CN button',
        },
      },
    });
    runtimeGame.getVariables().get('locale').setString('en');

    try {
      const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
      const object = new gdjs.TextRuntimeObject(
        runtimeScene,
        makeTextObjectData('{{i18n["button1.label"].$locale}}')
      );

      expect(object.getText()).to.be('A button');

      runtimeGame.getVariables().get('locale').setString('cn');
      object.updateFromObjectData(
        makeTextObjectData('{{i18n["button1.label"].$locale}}'),
        makeTextObjectData('Label: {{i18n["button1.label"].$locale}}')
      );

      expect(object.getText()).to.be('Label: CN button');
    } finally {
      gdjs.TextRuntimeObjectRenderer = originalRenderer;
    }
  });
});
