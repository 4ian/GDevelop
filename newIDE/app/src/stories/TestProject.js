const gd = global.gd;

export const project = gd.ProjectHelper.createNewGDJSProject();
const resource1 = new gd.ImageResource();
const resource2 = new gd.ImageResource();
const resource3 = new gd.ImageResource();
const resource4 = new gd.ImageResource();
const audioResource1 = new gd.AudioResource();
resource1.setName("fake-image1.png");
resource1.setFile("fake-image1.png");
resource2.setName("fake-image2.png");
resource2.setFile("fake-image2.png");
resource3.setName("icon128.png");
resource3.setFile("res/icon128.png");
resource4.setName("pixi");
resource4.setFile("res/powered-pixijs.png");
audioResource1.setName("fake-audio1.mp3");
audioResource1.setFile("fake-audio1.mp3");
project.getResourcesManager().addResource(resource1);
project.getResourcesManager().addResource(resource2);
project.getResourcesManager().addResource(resource3);
project.getResourcesManager().addResource(resource4);
project.getResourcesManager().addResource(audioResource1);

export const textObject = new gd.TextObject('MyTextObject');
export const tiledSpriteObject = new gd.TiledSpriteObject('MyTiledSpriteObject');
export const panelSpriteObject = new gd.PanelSpriteObject('MyPanelSpriteObject');

export const spriteObject = new gd.SpriteObject('MySpriteObject');

{
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('icon128.png');
    const sprite2 = new gd.Sprite();
    sprite2.setImageName('pixi');
    const sprite3 = new gd.Sprite();
    sprite3.setImageName('icon128.png');
    animation.getDirection(0).addSprite(sprite1);
    animation.getDirection(0).addSprite(sprite2);
    animation.getDirection(0).addSprite(sprite3);
    spriteObject.addAnimation(animation);
}
{
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('icon128.png');
    const sprite2 = new gd.Sprite();
    sprite2.setImageName('icon128.png');
    const sprite3 = new gd.Sprite();
    sprite3.setImageName('icon128.png');
    const sprite4 = new gd.Sprite();
    sprite4.setImageName('icon128.png');
    animation.getDirection(0).addSprite(sprite1);
    animation.getDirection(0).addSprite(sprite2);
    animation.getDirection(0).addSprite(sprite3);
    animation.getDirection(0).addSprite(sprite4);
    spriteObject.addAnimation(animation);
}
{
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite();
    sprite1.setImageName('pixi');
    animation.getDirection(0).addSprite(sprite1);
    spriteObject.addAnimation(animation);
}