export default [
  {
    title: 'Create my first game',
    type: 'text',
    positionBind: 'socialNetwork',
    description: [
      'Welcome in GDevelop 5 ! We will create your first game.',
      'You will create a very simple platformer game where the ',
      'player can jump on platforms and collect coins.',
      'First at all let to create a new project for your game!',
    ],
  },
  {
    type: 'clickTarget',
    positionBind: 'createANewProject',
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
