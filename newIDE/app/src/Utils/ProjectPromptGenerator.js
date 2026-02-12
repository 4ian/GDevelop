// @flow
import sample from 'lodash/sample';

const mainCharacters = [
  'knight',
  'warrior',
  'wizard',
  'mage',
  'rogue',
  'ninja',
  'bunny',
  'animal',
  'robot',
  'alien',
  'monster',
  'zombie',
  'ghost',
  'vampire',
  'werewolf',
  'clown',
  'pirate',
  'ninja',
  'elf',
  'dwarf',
  'orc',
  'goblin',
  'troll',
  'spider',
  'snake',
  'dragon',
  'demon',
  'angel',
  'god',
  'goddess',
  'hero',
  'heroine',
  'prince',
  'princess',
  'king',
  'queen',
  'knight',
  'warrior',
  'wizard',
  'mage',
  'rogue',
  'ninja',
  'bunny',
  'animal',
  'robot',
  'alien',
  'monster',
  'zombie',
  'ghost',
  'vampire',
  'werewolf',
  'clown',
  'pirate',
  'ninja',
  'elf',
  'dwarf',
  'orc',
  'goblin',
  'troll',
  'spider',
  'snake',
  'dragon',
  'demon',
  'angel',
  'god',
  'goddess',
  'hero',
  'heroine',
  'prince',
  'princess',
  'king',
  'queen',
];

const places = [
  'dungeon',
  'castle',
  'forest',
  'cave',
  'mountain',
  'desert',
  'swamp',
  'city',
  'village',
  'town',
  'island',
  'ship',
  'space station',
];

const collectables = [
  'coins',
  'treasure',
  'gems',
  'crystals',
  'artifacts',
  'weapons',
  'armor',
  'potions',
  'scrolls',
  'books',
  'runes',
  'orbs',
  'rings',
];

const goals = [
  'the exit',
  'the treasure',
  'the key',
  'the door',
  'the portal',
  'the artifact',
  'the weapon',
];

const gameTypes = [
  'platformer',
  'top-down',
  'side-shooter',
  'twinstick-shooter',
  'flappy-bird',
  'endless-runner',
  'megaman',
];

const startWithVowel = word =>
  ['a', 'e', 'i', 'o', 'u'].includes(word[0].toLowerCase());
const formatWordWithAdaptedDeterminer = (word: string) =>
  `${startWithVowel(word) ? 'an' : 'a'} ${word}`;

const generatePrompt = (): string => {
  const gameType = sample(gameTypes);
  const mainCharacter = sample(mainCharacters);
  const place = sample(places);
  const collectable = sample(collectables);
  const goal = sample(goals);
  return `${formatWordWithAdaptedDeterminer(
    gameType
  )} game with ${formatWordWithAdaptedDeterminer(
    mainCharacter
  )} in ${formatWordWithAdaptedDeterminer(
    place
  )} collecting ${collectable} and trying to reach ${goal}`;
};

export default generatePrompt;
