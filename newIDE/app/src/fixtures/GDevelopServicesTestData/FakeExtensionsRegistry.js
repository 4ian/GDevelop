// @flow
import { type ExtensionsRegistry } from '../../Utils/GDevelopServices/Extension';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';

export const fakeExtensionsRegistry: ExtensionsRegistry & {
  // The service gives CSV but it's converted on the fly to an array.
  headers: Array<ExtensionShortHeader & { tags: any }>,
} = {
  version: '0.0.1',
  views: {
    default: {
      firstIds: ['SomeAlreadyInstalledExtension', 'Bounce', 'BoidsMovement'],
    },
  },
  headers: [
    {
      tier: 'reviewed',
      authorIds: ['this-is-a-fake-id', 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2'],
      shortDescription:
        'Some fake extension that is already installed in the test project',
      extensionNamespace: '',
      fullName: 'Some fake extension',
      name: 'SomeAlreadyInstalledExtension',
      version: '0.0.3',
      url:
        'https://resources.gdevelop-app.com/extensions/SomeAlreadyInstalledExtension.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/SomeAlreadyInstalledExtension-header.json',
      tags: 'ledge tolerance,jump,platform',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/Sports and Fitness/Sports and Fitness_training_running_run.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'this-is-a-fake-id',
          username: 'Fake author',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['this-is-a-fake-id', 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2'],
      shortDescription:
        'Platformer character jump enhancements like coyote time (allows to jump shortly after leaving a platform).',
      extensionNamespace: '',
      fullName: 'Advanced jump ("Coyote time")',
      name: 'AdvancedJump',
      version: '0.0.3',
      url: 'https://resources.gdevelop-app.com/extensions/AdvancedJump.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/AdvancedJump-header.json',
      tags: 'ledge tolerance,jump,platform',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/Sports and Fitness/Sports and Fitness_training_running_run.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'this-is-a-fake-id',
          username: 'Fake author',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['ZgrsWuRTAkXgeuPV9bo0zuEcA2w1'],
      shortDescription:
        'Allows handling all received P2P events at once instead of one per frame. It is more complex but also potentially more performant.',
      extensionNamespace: '',
      fullName: 'Advanced p2p event handling',
      name: 'AdvancedP2PEventHandling',
      version: '1.0.0',
      url:
        'https://resources.gdevelop-app.com/extensions/AdvancedP2PEventHandling.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/AdvancedP2PEventHandling-header.json',
      tags: 'p2p,performance,advanced',
      category: 'Network',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/Applications and Programming/Applications and Programming_sitemap_map_ux_application.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 1,
      authors: [
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['I0kdjvsICFML0APq45CZjZ6PyEQ2'],
      shortDescription:
        'Align objects on the scene relatively to the window (or screen size).',
      extensionNamespace: '',
      fullName: 'Align object on the screen',
      name: 'AlignObject',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/AlignObject.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/AlignObject-header.json',
      tags: 'align,alignment,center',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/format-vertical-align-center.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 14,
      authors: [
        {
          id: 'I0kdjvsICFML0APq45CZjZ6PyEQ2',
          username: 'Fake user #EQ2',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['wWP8BSlAW0UP4NeaHa2LcmmDzmH2'],
      shortDescription:
        'Make the object go on the left, then when some distance is reached, flip and go back to the right. Make sure that your object has two animations called "GoLeft" and "TurnLeft".',
      extensionNamespace: '',
      fullName: 'Animated Back and Forth Movement',
      name: 'AnimatedBackAndForthMovement',
      version: '0.0.1',
      url:
        'https://resources.gdevelop-app.com/extensions/AnimatedBackAndForthMovement.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/AnimatedBackAndForthMovement-header.json',
      tags: 'back,forth,movement',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/repeat.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'wWP8BSlAW0UP4NeaHa2LcmmDzmH2',
          username: '4ian',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['ZgrsWuRTAkXgeuPV9bo0zuEcA2w1'],
      shortDescription:
        'A collection of utilities and tools for working with arrays.',
      extensionNamespace: '',
      fullName: 'Array tools',
      name: 'ArrayTools',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/ArrayTools.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/ArrayTools-header.json',
      tags:
        'array,variable,index,tool,math,string,sort,find,slice,cut,random,copy,combine,concat,append,insert',
      category: 'General',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/code-array.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 31,
      authors: [
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['2OwwM8ToR9dx9RJ2sAKTcrLmCB92'],
      shortDescription:
        'Animate the text to simulate it being written character by character (also called "typewriter" effect), with a customizable time between each character. Useful for dialogue scenes or visual novels.',
      extensionNamespace: '',
      fullName: 'Auto typing animation for texts ("typewriter" effect)',
      name: 'AutoTyping',
      version: '1.0.2',
      url: 'https://resources.gdevelop-app.com/extensions/AutoTyping.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/AutoTyping-header.json',
      tags: 'text,bbtext,dialogue,visual novel,autotyping,bitmap',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/typewriter.svg',
      eventsBasedBehaviorsCount: 3,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
          username: 'Bouh',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['ZgrsWuRTAkXgeuPV9bo0zuEcA2w1'],
      shortDescription: 'Adds interactions with the back button.',
      extensionNamespace: '',
      fullName: 'Back button',
      name: 'BackButton',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/BackButton.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/BackButton-header.json',
      tags: 'back,mobile,button,input',
      category: 'Input',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/keyboard-backspace.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 4,
      authors: [
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['onPsboRtDkUHNOsx7OPr8R8G1oj2'],
      shortDescription:
        'Provides conversion expressions for numbers in different bases.',
      extensionNamespace: '',
      fullName: 'Base conversion',
      name: 'BaseConversion',
      version: '1.0.1',
      url: 'https://resources.gdevelop-app.com/extensions/BaseConversion.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/BaseConversion-header.json',
      tags: 'binary,numbers,number,base,hex,decimal',
      category: 'Advanced',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/hexadecimal.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 2,
      authors: [
        {
          id: 'onPsboRtDkUHNOsx7OPr8R8G1oj2',
          username: 'Fake user #oj2',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['AlZ3D1xkH0QDao7T37VZZUeYNpn1'],
      shortDescription: 'Quickly remap Behavior controls to different keys. ',
      extensionNamespace: '',
      fullName: 'Behavior Remapper',
      name: 'BehaviorRemapper',
      version: '1.0.0',
      url:
        'https://resources.gdevelop-app.com/extensions/BehaviorRemapper.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/BehaviorRemapper-header.json',
      tags: 'remapper,key,bindings,presets,platformer,top-down',
      category: 'Input',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/alpha-w-box-outline.svg',
      eventsBasedBehaviorsCount: 2,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'AlZ3D1xkH0QDao7T37VZZUeYNpn1',
          username: 'Fake user #pn1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: [
        'rotBq28wITdtfsrE7McHQri4k2w2',
        'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
      ],
      shortDescription: 'Simulates flocks movement.',
      extensionNamespace: '',
      fullName: 'Boids movement (experimental)',
      name: 'BoidsMovement',
      version: '0.1.0',
      url: 'https://resources.gdevelop-app.com/extensions/BoidsMovement.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/BoidsMovement-header.json',
      tags: 'flock,swarm,boids,crowd,horde',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Glyphster Pack/Master/SVG/Restaurant/Restaurant_restaurant_seafood_animal_fish.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 1,
      authors: [
        {
          id: 'rotBq28wITdtfsrE7McHQri4k2w2',
          username: 'Fake user #2w2',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['this-is-a-fake-id', 'gqDaZjCfevOOxBYkK6zlhtZnXCg1'],
      shortDescription:
        'Throw an object that returns to the thrower like a boomerang.',
      extensionNamespace: '',
      fullName: 'Boomerang',
      name: 'Boomerang',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/Boomerang.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Boomerang-header.json',
      tags: 'boomerang,throw,attack,projectile,ricochet,rebound,launch',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/boomerang.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'this-is-a-fake-id',
          username: 'Fake author',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['wWP8BSlAW0UP4NeaHa2LcmmDzmH2'],
      shortDescription:
        'Provides an action to make the object bounce from another object it just touched. Add a permanent force to the object and, when in collision with another one, use the action to make it bounce realistically.',
      extensionNamespace: '',
      fullName: 'Bounce (using forces)',
      name: 'Bounce',
      version: '0.2.0',
      url: 'https://resources.gdevelop-app.com/extensions/Bounce.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Bounce-header.json',
      tags: 'bounce,bullet',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/volleyball.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'wWP8BSlAW0UP4NeaHa2LcmmDzmH2',
          username: '4ian',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: [
        'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
        'm4hBMBTUilft4s1V4FQQPakVDGx1',
      ],
      shortDescription:
        'Shake the camera on the specified layer using one or more methods of shaking (position, angle, zoom).',
      extensionNamespace: '',
      fullName: 'Camera Shake',
      name: 'CameraShake',
      version: '2.6.6',
      url: 'https://resources.gdevelop-app.com/extensions/CameraShake.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CameraShake-header.json',
      tags: 'shaking,camera,effect,screen,shake,zoom,position,rotate',
      category: 'Camera',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/vector-difference-ab.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 4,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'm4hBMBTUilft4s1V4FQQPakVDGx1',
          username: 'Fake user #Gx1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: [
        'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
        '30b1QQoYi1gQQHzIjMlNY8aLyYV2',
      ],
      shortDescription:
        'Allows to zoom camera on a layer with a speed (factor per second).',
      extensionNamespace: '',
      fullName: 'Camera Zoom',
      name: 'CameraZoom',
      version: '0.2.0',
      url: 'https://resources.gdevelop-app.com/extensions/CameraZoom.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CameraZoom-header.json',
      tags: 'Camera,Layer,Zoom',
      category: 'Camera',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/UI Essentials/UI Essentials_zoom_in_plus.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: '30b1QQoYi1gQQHzIjMlNY8aLyYV2',
          username: 'Fake user #YV2',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['IWykYNRvhCZBN3vEgKEbBPOR3Oc2'],
      shortDescription:
        'Allow to cancel the drag of an object (having the Draggable behavior) and return it smoothly to its previous position.',
      extensionNamespace: '',
      fullName: 'Cancellable draggable object',
      name: 'CancellableDraggable',
      version: '0.1.1',
      url:
        'https://resources.gdevelop-app.com/extensions/CancellableDraggable.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CancellableDraggable-header.json',
      tags: 'drag,drop',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/step-backward.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['gqDaZjCfevOOxBYkK6zlhtZnXCg1'],
      shortDescription:
        'Checkbox that can be toggled by a left-click or touch.',
      extensionNamespace: '',
      fullName: 'Checkbox',
      name: 'Checkbox',
      version: '0.0.4',
      url: 'https://resources.gdevelop-app.com/extensions/Checkbox.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Checkbox-header.json',
      tags: 'checkbox,ui,widget,shape painter,toggle,checkmark',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/checkbox-marked.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: [
        '30b1QQoYi1gQQHzIjMlNY8aLyYV2',
        '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
      ],
      shortDescription: 'A position checkpoint for instances.',
      extensionNamespace: '',
      fullName: 'Checkpoints',
      name: 'Checkpoints',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/Checkpoints.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Checkpoints-header.json',
      tags: 'position,checkpoint',
      category: 'Game mechanic',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/flag-variant.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: '30b1QQoYi1gQQHzIjMlNY8aLyYV2',
          username: 'Fake user #YV2',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
          username: 'Bouh',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['ZShmW1xkW7WWl9AkB78VITJMiTw1'],
      shortDescription:
        'Choose a random value in a list of strings or numbers.',
      extensionNamespace: '',
      fullName: 'Choose a random value',
      name: 'Choose',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/Choose.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Choose-header.json',
      tags: 'choose,random',
      category: 'General',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/dice-multiple.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 2,
      authors: [
        {
          id: 'ZShmW1xkW7WWl9AkB78VITJMiTw1',
          username: 'Fake user #Tw1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: [
        '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
        'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
      ],
      shortDescription: 'Read and write the clipboard.',
      extensionNamespace: '',
      fullName: 'Clipboard',
      name: 'Clipboard',
      version: '1.0.0',
      url: 'https://resources.gdevelop-app.com/extensions/Clipboard.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Clipboard-header.json',
      tags: 'clipboard,pasteboard,paste,copy,write',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/clipboard-text-multiple-outline.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
          username: 'Bouh',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: [
        'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
        'AlZ3D1xkH0QDao7T37VZZUeYNpn1',
        'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
      ],
      shortDescription:
        'Expressions to convert color values between various formats (RGB, HSV, HSL, named colors) and get colors between 2 others.',
      extensionNamespace: '',
      fullName: 'Color Conversion',
      name: 'ColorConversion',
      version: '1.2.0',
      url: 'https://resources.gdevelop-app.com/extensions/ColorConversion.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/ColorConversion-header.json',
      tags: 'color,conversion,hexadecimal,rgb,hsl,hsv,hsb',
      category: 'Advanced',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/invert-colors.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 9,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'AlZ3D1xkH0QDao7T37VZZUeYNpn1',
          username: 'Fake user #pn1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['ZgrsWuRTAkXgeuPV9bo0zuEcA2w1'],
      shortDescription: 'Compress and decompress strings.',
      extensionNamespace: '',
      fullName: 'Compressor',
      name: 'Compressor',
      version: '1.0.1',
      url: 'https://resources.gdevelop-app.com/extensions/Compressor.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/Compressor-header.json',
      tags: 'string,compression,zip',
      category: 'Advanced',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/folder-zip-outline.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['gqDaZjCfevOOxBYkK6zlhtZnXCg1'],
      shortDescription:
        'Copy the camera settings of a layer and apply them to another layer.',
      extensionNamespace: '',
      fullName: 'Copy camera settings',
      name: 'CopyCameraSettings',
      version: '1.0.0',
      url:
        'https://resources.gdevelop-app.com/extensions/CopyCameraSettings.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CopyCameraSettings-header.json',
      tags: 'camera,clone,zoom,position,layer,angle,copy',
      category: 'Camera',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/layers-triple-outline.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 1,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['gqDaZjCfevOOxBYkK6zlhtZnXCg1'],
      shortDescription:
        'Select the object, choose the number of rows and columns, the spacing between rows and columns, the top left starting point, the layer to create the objects on, and the z-order of the objects.',
      extensionNamespace: '',
      fullName: 'Create multiple copies of an object',
      name: 'CreateMultipleCopiesOfObject',
      version: '0.2.3',
      url:
        'https://resources.gdevelop-app.com/extensions/CreateMultipleCopiesOfObject.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CreateMultipleCopiesOfObject-header.json',
      tags: 'create,multiple,object,grid,row,column',
      category: 'Visual effect',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/grid.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 1,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['ZShmW1xkW7WWl9AkB78VITJMiTw1'],
      shortDescription:
        'Get the current game version from GDevelop game properties.',
      extensionNamespace: '',
      fullName: 'Current game version',
      name: 'CurrentGameVersion',
      version: '1.0.0',
      url:
        'https://resources.gdevelop-app.com/extensions/CurrentGameVersion.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CurrentGameVersion-header.json',
      tags: 'version',
      category: 'Advanced',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/numeric.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 1,
      authors: [
        {
          id: 'ZShmW1xkW7WWl9AkB78VITJMiTw1',
          username: 'Fake user #Tw1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['IWykYNRvhCZBN3vEgKEbBPOR3Oc2'],
      shortDescription:
        'Conditions to check the cursor movement (still or moving).',
      extensionNamespace: '',
      fullName: 'Cursor movement conditions',
      name: 'CursorMovement',
      version: '1.0.1',
      url: 'https://resources.gdevelop-app.com/extensions/CursorMovement.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CursorMovement-header.json',
      tags: 'mouse,pointer,cursor',
      category: 'Input',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/Computers and Hardware/Computers and Hardware_mouse_pc.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: [
        'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
        '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
      ],
      shortDescription:
        'Provides an action to change the type of the cursor, and a behavior to change the cursor when an object is hovered.',
      extensionNamespace: '',
      fullName: 'Cursor type',
      name: 'CursorType',
      version: '0.0.5',
      url: 'https://resources.gdevelop-app.com/extensions/CursorType.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/CursorType-header.json',
      tags: 'cursor,javascript,desktop',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/cursor-default-outline.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 2,
      authors: [
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: '2OwwM8ToR9dx9RJ2sAKTcrLmCB92',
          username: 'Bouh',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['gqDaZjCfevOOxBYkK6zlhtZnXCg1'],
      shortDescription:
        'Change scale based on Y position to simulate depth of field.',
      extensionNamespace: '',
      fullName: 'Depth effect',
      name: 'DepthEffect',
      version: '0.0.4',
      url: 'https://resources.gdevelop-app.com/extensions/DepthEffect.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DepthEffect-header.json',
      tags: 'depth,effect,scale,y,text,sprite',
      category: 'Visual effect',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/Virtual Reality/Virtual Reality_vr_computer_3d_cube_screen_tv.svg',
      eventsBasedBehaviorsCount: 2,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'community',
      authorIds: ['ZgrsWuRTAkXgeuPV9bo0zuEcA2w1'],
      shortDescription: 'Adds discord rich presence to your games.',
      extensionNamespace: '',
      fullName: 'Discord rich presence (Windows, Mac, Linux)',
      name: 'DiscordRichPresence',
      version: '1.0.1',
      url:
        'https://resources.gdevelop-app.com/extensions/DiscordRichPresence.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DiscordRichPresence-header.json',
      tags: 'discord,rich,presence,integration,status',
      category: 'Third-party',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/discord.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: 'ZgrsWuRTAkXgeuPV9bo0zuEcA2w1',
          username: 'arthuro555',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['8Ih1aa8f5gWUp4UB2BdhQ2iXWxJ3'],
      shortDescription:
        'Check for a double-click with a mouse, or a double-tap on a touchscreen.',
      extensionNamespace: '',
      fullName: 'Double-click',
      name: 'DoubleClick',
      version: '1.0.2',
      url: 'https://resources.gdevelop-app.com/extensions/DoubleClick.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DoubleClick-header.json',
      tags: 'double-click,double-tap',
      category: 'Input',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/Computers and Hardware/Computers and Hardware_mouse_wireless_pc.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 3,
      authors: [
        {
          id: '8Ih1aa8f5gWUp4UB2BdhQ2iXWxJ3',
          username: 'Fake user #xJ3',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: [
        'GfzRsieyUFVnsRR8OZThsPR29oq2',
        'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
      ],
      shortDescription: 'Move a camera by dragging the mouse (or touchscreen).',
      extensionNamespace: '',
      fullName: 'Drag camera with the mouse (or touchscreen)',
      name: 'DragCameraWithPointer',
      version: '1.1.0',
      url:
        'https://resources.gdevelop-app.com/extensions/DragCameraWithPointer.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DragCameraWithPointer-header.json',
      tags: 'pointer,drag,camera,scroll,gestures',
      category: 'Camera',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/drag-variant.svg',
      eventsBasedBehaviorsCount: 0,
      eventsFunctionsCount: 1,
      authors: [
        {
          id: 'GfzRsieyUFVnsRR8OZThsPR29oq2',
          username: 'Fake user #oq2',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['gqDaZjCfevOOxBYkK6zlhtZnXCg1'],
      shortDescription: 'Drag a physics object with the mouse (or touch).',
      extensionNamespace: '',
      fullName: 'Draggable (for physics objects)',
      name: 'DraggablePhysics',
      version: '1.0.0',
      url:
        'https://resources.gdevelop-app.com/extensions/DraggablePhysics.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DraggablePhysics-header.json',
      tags: 'draggable,mouse,touch,physics,object,joint,fling',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Glyphster Pack/Master/SVG/Virtual Reality/Virtual Reality_hand_vr_ar_360.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: [
        'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
        'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
      ],
      shortDescription:
        'A draggable slider that users can move to select a numerical value.',
      extensionNamespace: '',
      fullName: 'Draggable slider',
      name: 'DraggableSliderControl',
      version: '1.0.3',
      url:
        'https://resources.gdevelop-app.com/extensions/DraggableSliderControl.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DraggableSliderControl-header.json',
      tags: 'draggable,slider,shape painter,ui,widget',
      category: 'User interface',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/Line Hero Pack/Master/SVG/UI Essentials/UI Essentials_sliders_options.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'IWykYNRvhCZBN3vEgKEbBPOR3Oc2',
          username: 'D8H',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
        {
          id: 'gqDaZjCfevOOxBYkK6zlhtZnXCg1',
          username: 'Fake user #Cg1',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
    {
      tier: 'reviewed',
      authorIds: ['this-is-a-fake-id'],
      shortDescription:
        'Draw the pathfinding of an object using a shape painter.',
      extensionNamespace: '',
      fullName: 'Draw pathfinding',
      name: 'DrawPathfinding',
      version: '0.1.2',
      url: 'https://resources.gdevelop-app.com/extensions/DrawPathfinding.json',
      headerUrl:
        'https://resources.gdevelop-app.com/extensions/DrawPathfinding-header.json',
      tags: 'pathfinding,debug,shape painter,draw',
      category: 'Movement',
      previewIconUrl:
        'https://resources.gdevelop-app.com/assets/Icons/resistor-nodes.svg',
      eventsBasedBehaviorsCount: 1,
      eventsFunctionsCount: 0,
      authors: [
        {
          id: 'this-is-a-fake-id',
          username: 'Fake author',
          description: '',
          donateLink: null,
          discordUsername: null,
          communityLinks: {},
          iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
        },
      ],
    },
  ],
};
