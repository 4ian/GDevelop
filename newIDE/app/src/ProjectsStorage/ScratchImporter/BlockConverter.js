// @flow
/**
 * Scratch Block Converter
 * Based on Leopard.js block execution model
 * Converts Scratch blocks to GDevelop events and actions
 */

import type { ScratchSprite } from './ScratchParser';

export type ConvertedEvent = {|
  type: string,
  conditions: Array<any>,
  actions: Array<any>,
  subEvents?: Array<ConvertedEvent>,
|};

/**
 * Scratch block opcodes to GDevelop action mappings
 */
const BLOCK_MAPPINGS = {
  // Motion blocks
  motion_movesteps: 'moveInDirection',
  motion_gotoxy: 'setPosition',
  motion_changexby: 'addToX',
  motion_changeyby: 'addToY',
  motion_setx: 'setX',
  motion_sety: 'setY',
  motion_turnright: 'rotateTowardAngle',
  motion_turnleft: 'rotateTowardAngle',
  motion_pointindirection: 'setAngle',

  // Looks blocks
  looks_say: 'showText',
  looks_sayforsecs: 'showTextForDuration',
  looks_think: 'showText',
  looks_thinkforsecs: 'showTextForDuration',
  looks_show: 'show',
  looks_hide: 'hide',
  looks_switchcostumeto: 'setAnimation',
  looks_changesizeby: 'changeScale',
  looks_setsizeto: 'setScale',

  // Sound blocks
  sound_play: 'playSound',
  sound_playuntildone: 'playSoundAndWait',
  sound_stopallsounds: 'stopAllSounds',
  sound_setvolumeto: 'setSoundVolume',
  sound_changevolumeby: 'changeSoundVolume',

  // Events blocks
  event_whenflagclicked: 'sceneStart',
  event_whenkeypressed: 'keyPressed',
  event_whenthisspriteclicked: 'objectClicked',
  event_whenbroadcastreceived: 'customEvent',

  // Control blocks
  control_wait: 'wait',
  control_repeat: 'repeat',
  control_forever: 'while',
  control_if: 'if',
  control_if_else: 'ifElse',
  control_stop: 'stopAll',

  // Sensing blocks
  sensing_touchingobject: 'collision',
  sensing_askandwait: 'askUserInput',

  // Operators
  operator_add: 'add',
  operator_subtract: 'subtract',
  operator_multiply: 'multiply',
  operator_divide: 'divide',
  operator_random: 'random',
  operator_gt: 'greaterThan',
  operator_lt: 'lessThan',
  operator_equals: 'equals',
  operator_and: 'and',
  operator_or: 'or',
  operator_not: 'not',

  // Variables
  data_setvariableto: 'setVariable',
  data_changevariableby: 'addToVariable',
};

/**
 * Convert Scratch blocks to GDevelop events
 */
export const convertScratchBlocks = (
  blocks: { [key: string]: any },
  topLevelBlocks: Array<string>
): Array<ConvertedEvent> => {
  const events: Array<ConvertedEvent> = [];

  for (const blockId of topLevelBlocks) {
    const event = convertBlock(blocks, blockId);
    if (event) {
      events.push(event);
    }
  }

  return events;
};

/**
 * Convert a single block to a GDevelop event
 */
const convertBlock = (
  blocks: { [key: string]: any },
  blockId: string
): ?ConvertedEvent => {
  const block = blocks[blockId];
  if (!block) return null;

  const opcode = block.opcode;
  const mapping = BLOCK_MAPPINGS[opcode];

  if (!mapping) {
    console.warn(`Unsupported Scratch block: ${opcode}`);
    return null;
  }

  // Check if it's an event block (hat block)
  if (opcode.startsWith('event_')) {
    return convertEventBlock(blocks, block);
  }

  // Check if it's a control block
  if (opcode.startsWith('control_')) {
    return convertControlBlock(blocks, block);
  }

  // Regular action block
  return {
    type: 'Standard',
    conditions: [],
    actions: [convertToAction(block, mapping)],
  };
};

/**
 * Convert event block (hat block)
 */
const convertEventBlock = (
  blocks: { [key: string]: any },
  block: any
): ConvertedEvent => {
  const event: ConvertedEvent = {
    type: 'Standard',
    conditions: [],
    actions: [],
    subEvents: [],
  };

  switch (block.opcode) {
    case 'event_whenflagclicked':
      event.conditions.push({
        type: 'BuiltinCommonInstructions::Standard',
        parameters: ['SceneJustBegins'],
      });
      break;

    case 'event_whenkeypressed':
      event.conditions.push({
        type: 'KeyPressed',
        parameters: [block.fields.KEY_OPTION[0]],
      });
      break;

    case 'event_whenthisspriteclicked':
      event.conditions.push({
        type: 'SourisNPress',
        parameters: ['Left', 'Object', ''],
      });
      break;

    case 'event_whenbroadcastreceived':
      event.conditions.push({
        type: 'CustomEvent',
        parameters: [block.fields.BROADCAST_OPTION[0]],
      });
      break;
  }

  // Convert all blocks in the chain
  let nextBlockId = block.next;
  while (nextBlockId) {
    const nextBlock = blocks[nextBlockId];
    if (!nextBlock) break;

    const action = convertBlockToAction(blocks, nextBlock);
    if (action) {
      event.actions.push(action);
    }

    nextBlockId = nextBlock.next;
  }

  return event;
};

/**
 * Convert control block (loops, conditionals)
 */
const convertControlBlock = (
  blocks: { [key: string]: any },
  block: any
): ConvertedEvent => {
  const event: ConvertedEvent = {
    type: 'Standard',
    conditions: [],
    actions: [],
    subEvents: [],
  };

  switch (block.opcode) {
    case 'control_repeat':
      event.type = 'Repeat';
      event.conditions.push({
        type: 'Repeat',
        parameters: [getInputValue(blocks, block.inputs.TIMES)],
      });
      break;

    case 'control_forever':
      event.type = 'While';
      event.conditions.push({
        type: 'Always',
        parameters: [],
      });
      break;

    case 'control_if':
      event.conditions.push(convertCondition(blocks, block.inputs.CONDITION));
      break;

    case 'control_if_else':
      event.conditions.push(convertCondition(blocks, block.inputs.CONDITION));
      // TODO: Handle else branch
      break;

    case 'control_wait':
      event.actions.push({
        type: 'Wait',
        parameters: [getInputValue(blocks, block.inputs.DURATION)],
      });
      break;
  }

  return event;
};

/**
 * Convert block to action
 */
const convertBlockToAction = (
  blocks: { [key: string]: any },
  block: any
): ?any => {
  const opcode = block.opcode;
  const mapping = BLOCK_MAPPINGS[opcode];

  if (!mapping) {
    return null;
  }

  return convertToAction(block, mapping);
};

/**
 * Convert to GDevelop action format
 */
const convertToAction = (block: any, actionType: string): any => {
  const action = {
    type: actionType,
    parameters: [],
  };

  // Extract parameters based on block inputs
  if (block.inputs) {
    Object.keys(block.inputs).forEach(key => {
      const value = getInputValue(null, block.inputs[key]);
      action.parameters.push(value);
    });
  }

  return action;
};

/**
 * Convert condition
 */
const convertCondition = (blocks: { [key: string]: any }, input: any): any => {
  // Simplified condition conversion
  return {
    type: 'Condition',
    parameters: [getInputValue(blocks, input)],
  };
};

/**
 * Get input value from block
 */
const getInputValue = (blocks: ?{ [key: string]: any }, input: any): string => {
  if (!input) return '';

  // If it's a direct value
  if (input[0] === 1 && input[1]) {
    if (Array.isArray(input[1])) {
      return String(input[1][1]);
    }
    return String(input[1]);
  }

  // If it's a block reference
  if (input[0] === 2 && blocks && input[1]) {
    const block = blocks[input[1]];
    if (block) {
      return evaluateBlock(blocks, block);
    }
  }

  // If it's a block reference
  if (input[0] === 3 && input[1]) {
    return String(input[1][1]);
  }

  return '';
};

/**
 * Evaluate a block value
 */
const evaluateBlock = (blocks: { [key: string]: any }, block: any): string => {
  // Simplified block evaluation
  if (block.opcode === 'operator_add') {
    const num1 = getInputValue(blocks, block.inputs.NUM1);
    const num2 = getInputValue(blocks, block.inputs.NUM2);
    return `${num1} + ${num2}`;
  }

  if (block.opcode === 'data_variable') {
    return block.fields.VARIABLE[0];
  }

  return '';
};

/**
 * Get top-level block IDs (hat blocks)
 */
export const getTopLevelBlocks = (blocks: {
  [key: string]: any,
}): Array<string> => {
  const topLevel: Array<string> = [];

  Object.keys(blocks).forEach(blockId => {
    const block = blocks[blockId];
    if (block.topLevel === true) {
      topLevel.push(blockId);
    }
  });

  return topLevel;
};
