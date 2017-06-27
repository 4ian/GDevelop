const gd = global.gd;

export const project = gd.ProjectHelper.createNewGDJSProject();
const resource1 = new gd.ImageResource();
const resource2 = new gd.ImageResource();
const audioResource1 = new gd.AudioResource();
resource1.setName("fake-image1.png");
resource1.setFile("fake-image1.png");
resource2.setName("fake-image2.png");
resource2.setFile("fake-image2.png");
audioResource1.setName("fake-audio1.mp3");
audioResource1.setFile("fake-audio1.mp3");
project.getResourcesManager().addResource(resource1);
project.getResourcesManager().addResource(resource2);
project.getResourcesManager().addResource(audioResource1);

export const textObject = new gd.TextObject('MyTextObject');
export const tiledSpriteObject = new gd.TiledSpriteObject('MyTiledSpriteObject');
export const panelSpriteObject = new gd.PanelSpriteObject('MyPanelSpriteObject');

export const spriteObject = new gd.SpriteObject('MySpriteObject');

{
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite('fake-image1.png');
    sprite1.setImageName('fake-image1.png');
    const sprite2 = new gd.Sprite('fake-image2.png');
    sprite2.setImageName('fake-image2.png');
    const sprite3 = new gd.Sprite('fake-image1.png');
    sprite3.setImageName('fake-image1.png');
    animation.getDirection(0).addSprite(sprite1);
    animation.getDirection(0).addSprite(sprite2);
    animation.getDirection(0).addSprite(sprite3);
    spriteObject.addAnimation(animation);
}
{
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite('fake-image1.png');
    sprite1.setImageName('fake-image1.png');
    const sprite2 = new gd.Sprite('fake-image1.png');
    sprite2.setImageName('fake-image1.png');
    const sprite3 = new gd.Sprite('fake-image1.png');
    sprite3.setImageName('fake-image1.png');
    const sprite4 = new gd.Sprite('fake-image1.png');
    sprite4.setImageName('fake-image1.png');
    animation.getDirection(0).addSprite(sprite1);
    animation.getDirection(0).addSprite(sprite2);
    animation.getDirection(0).addSprite(sprite3);
    animation.getDirection(0).addSprite(sprite4);
    spriteObject.addAnimation(animation);
}
{
    const animation = new gd.Animation();
    animation.setDirectionsCount(1);
    const sprite1 = new gd.Sprite('fake-image2.png');
    sprite1.setImageName('fake-image2.png');
    animation.getDirection(0).addSprite(sprite1);
    spriteObject.addAnimation(animation);
}