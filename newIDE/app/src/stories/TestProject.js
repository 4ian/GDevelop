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