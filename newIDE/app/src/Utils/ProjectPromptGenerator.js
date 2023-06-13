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

const things = [
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

const generatePrompt = (): string => {
  const mainCharacter = sample(mainCharacters);
  const startWithVowel = ['a', 'e', 'i', 'o', 'u'].includes(
    mainCharacter[0].toLowerCase()
  );
  return `${startWithVowel ? 'an' : 'a'} ${mainCharacter} in a ${sample(
    places
  )} collecting ${sample(things)} and trying to reach ${sample(goals)}`;
};

export default generatePrompt;
