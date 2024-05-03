// @flow
import { type Achievement } from '../../Utils/GDevelopServices/Badge';

export const fakeAchievements: Array<Achievement> = [
  {
    name: 'First event',
    category: 'Trivial',
    id: 'trivial_first-event',
    description: "You added your first event, we're sure it won't be the last!",
  },
  {
    name: 'First behavior',
    category: 'Trivial',
    id: 'trivial_first-behavior',
    description:
      "You used a behavior for the first time, things are way simpler with them don't you think?",
  },
  {
    name: 'First preview',
    category: 'Trivial',
    id: 'trivial_first-preview',
    description:
      'Previewing your game is the first step towards a complete game!',
  },
  {
    name: 'First web export',
    category: 'Trivial',
    id: 'trivial_first-web-export',
    description:
      "Amazing, you just exported your first game! It's truly the quickest way to share it.",
  },
  {
    name: 'First effect',
    category: 'Trivial',
    id: 'trivial_first-effect',
    description:
      'Want to improve your game graphics? Select as many effects as you want from our list!',
  },
  {
    name: 'First debug',
    category: 'Trivial',
    id: 'trivial_first-debug',
    description:
      'Was it an unexpected animation, or were you just curious? Anyway, congrats on using the debugger for the first time!',
  },
  {
    name: 'First extension',
    category: 'Trivial',
    id: 'trivial_first-extension',
    description:
      'Extensions will speed up your project, so use as many as you can!',
  },
  {
    name: 'Insert a coin',
    category: 'Game Success',
    id: 'gs_10/1/y',
    description:
      'If 10 people played your game, it has to mean something right?',
  },
  {
    name: 'Into Space',
    category: 'Game Success',
    id: 'gs_100/1/y',
    description:
      "Wow! 100 people played your game, that's amazing, congratulations!",
  },
  {
    name: 'Millenium Falcon',
    category: 'Game Success',
    id: 'gs_1k/1/y',
    description:
      "1000 people played your game, you're on a whole new level. What is your secret?",
  },
  {
    name: "It's over 9000!",
    category: 'Game Success',
    id: 'gs_10k/1/y',
    description:
      "Can you imagine if 10k people came to visit you? They probably wouldn't all fit in your living room!",
  },
  {
    name: 'Fits in your house?',
    category: 'Game Success',
    id: 'gs_50k/1/y',
    description:
      '50k people playing your game must feel really rewarding, all of the time you put in to making it is paying off.',
  },
  {
    name: 'Fits in your yard?',
    category: 'Game Success',
    id: 'gs_100k/a/y',
    description:
      "100k people had a good time playing your games, isn't it the best feeling in the world? You must have come a long way to achieve that.",
  },
  {
    name: 'Solid Snake',
    category: 'Game Success',
    id: 'gs_10/2/y',
    description:
      'A second game with 10 players? Is it the same genre as the first?',
  },
  {
    name: 'Eevee',
    category: 'Game Success',
    id: 'gs_100/3/y',
    description:
      '3 games that each had 100 players! Have you found a name for your game studio?',
  },
  {
    name: 'Open-source love',
    category: 'Contributor',
    id: 'github-star',
    description: 'You put a star for GDevelop on GitHub - thank you!',
    rewardValueInCredits: 123,
  },
];
