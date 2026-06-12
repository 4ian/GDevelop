// @ts-check
/**
 * Tests for gdjs.TextRuntimeObject using the Pixi renderer.
 */

describe('gdjs.TextRuntimeObject', () => {
  /** @type {gdjs.RuntimeGame} */
  let runtimeGame;
  /** @type {gdjs.TestRuntimeScene} */
  let runtimeScene;

  beforeEach(() => {
    runtimeGame = gdjs.getPixiRuntimeGame();
    runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
  });

  const makeTextObjectData = (text) => ({
    name: 'Score',
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
      outlineThickness: 0,
      outlineColor: '0;0;0',
      isShadowEnabled: false,
      shadowColor: '0;0;0',
      shadowOpacity: 127,
      shadowDistance: 0,
      shadowAngle: 0,
      shadowBlurRadius: 0,
    },
  });

  it('keeps rotated text anchored when its content changes', () => {
    const textObject = new gdjs.TextRuntimeObject(
      runtimeScene,
      makeTextObjectData('Score: 9')
    );
    textObject.setPosition(10, 20);
    textObject.setAngle(90);
    textObject.updatePreRender(runtimeScene);

    const rendererObject = textObject.getRendererObject();
    expect(textObject.getCenterX()).to.be(0);
    expect(textObject.getCenterY()).to.be(0);
    expect(rendererObject.position.x).to.be(10);
    expect(rendererObject.position.y).to.be(20);
    expect(rendererObject.anchor.x).to.be(0);
    expect(rendererObject.anchor.y).to.be(0);

    textObject.setText('Score: 100');
    textObject.updatePreRender(runtimeScene);

    expect(rendererObject.position.x).to.be(10);
    expect(rendererObject.position.y).to.be(20);
    expect(rendererObject.anchor.x).to.be(0);
    expect(rendererObject.anchor.y).to.be(0);
  });
});
