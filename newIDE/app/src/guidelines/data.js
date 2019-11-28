/*
- Mettre une popup avec la description sur le conteneur,
et mettre en surbrillance le bouton avec l'id clickTarget

- Comment mettre a disposition les bonne ressources lorsque l'utilisateur importe une image.
Il faut le mettre dans le bon dossier avec les images disponible.
*/

export default [
  {
    title: 'Create my first game',
    positionBind: 'createANewProject',
    forceArrowOrientation: 'right',
    description: [
      'Welcome in GDevelop 5 ! We will create your first game.',
      'You will create a very simple platformer game where the ',
      'player can jump on platforms and collect coins.',
      'First at all let to create a new project for your game!',
    ],
    clickTargetBind:'createANewProject',
  },
  {
    clickTargetBind:'createEmptyGame',
  },
  {
    //ProjectStructureItem
    positionBind: 'projectStructureScenes',
    forceArrowOrientation: 'left',
    title: 'Project manager and scenes',
    description: [
      'Add a new scene.\n',
      'You can also get more action by right click/click on 3 dots icons.\n',
      'for continue open it by double click on your scene.\n',
    ],
    clickTargetBind:'addScene',
  },
  {
    type: 'clickTarget',
    positionBind: 'objectsList',
    //forceArrowOrientation: 'right',
    //title: 'Objects',
    //description: [
    //  'Click on the + button to add an object.',
    //],
  },
  {
    //
    type: 'text',
    positionBind: 'objectsList',
    title: 'Objects',
    description: [
      'You can see different type of object.\n',
      'Start with a "Sprite" object.\n',
      'The others are useful for display: text, video, shape, and other thing.',
    ],
  },
  {
    //
    type: 'text',
    positionBind: 'objectsList',
    title: 'Objects',
    description: [
      'You are now in the properties of the object, you can give him a name, call it "Player".\n',
      "Sprite objects are composed of animations, each animation can contain one or more images.\n",
      "Let's add an animation!\n",
      "Click on the + button.",
    ],
  },
  {
    //
    type: 'text',
    positionBind: 'objectsList',
    title: 'Object',
    description: [
      'To add an image, click on the + in the blank thumbnail.',
      'Choose the image called p1_stand in the project folder.',
    ],
  },
  {
    //
    type: 'clickTarget',
    positionBind: 'applyObjectSprite',
  },
  {
    //
    type: 'text',
    positionBind: 'objectsList',
    title: 'Object',
    description: [
      "Drag'n'drop the player object on scene",      
    ],
    imageSource: 'res/Guideline/drag_n_drop_object.gif',
  },
  {
    //RaisedButton
    type: 'clickTarget',
    positionBind: 'createANewProject',
  },
  {
    //AddListItem
    type: 'clickTarget',
    positionBind: 'addScene',
  },
  {
    type: 'clickTarget',
    positionBind: 'createEmptyGame',
  },
  {
    title: 'Create a new project',
    type: 'text',
    positionBind: 'Toolbar',
    description: 'Your first game is now finish, you can launch the preview !',
    imageSource: 'res/GD-logo-big.png',
  },
  {
    title: 'Finish',
    type: 'text',
    positionBind: 'socialNetwork',
    description: [
      'Your first game is now finish You can find more informations',
      'and tutorials on wikipage. \n\n Have fun with GDevelop5!',
    ],
  },
];
