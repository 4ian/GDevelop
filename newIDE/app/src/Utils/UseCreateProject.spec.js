// @flow

import { getProjectCreationErrorDetails } from './UseCreateProject';

describe('project creation errors', () => {
  test('formats the error type, code, message and cause chain for the dialog', () => {
    const rootCause: any = new Error('Instruction type was not found.');
    rootCause.name = 'ProjectInstructionCatalogError';
    rootCause.code = 'IFDO_CATALOG_UNKNOWN_INSTRUCTION';
    const outerError: any = new Error('Generated sources could not be saved.');
    outerError.name = 'MultiFileProjectError';
    outerError.code = 'MULTIFILE_GENERATION_FAILED';
    outerError.cause = rootCause;

    expect(getProjectCreationErrorDetails(outerError)).toBe(
      'MultiFileProjectError [MULTIFILE_GENERATION_FAILED]: Generated sources could not be saved.\n' +
        'Caused by: ProjectInstructionCatalogError [IFDO_CATALOG_UNKNOWN_INSTRUCTION]: Instruction type was not found.'
    );
  });

  test('keeps a thrown string readable', () => {
    expect(getProjectCreationErrorDetails('Disk is full.')).toBe(
      'Disk is full.'
    );
  });
});
