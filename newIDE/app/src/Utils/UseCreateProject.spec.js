// @flow

import {
  getProjectCreationErrorDetails,
  runProjectCreationStepWithTimeout,
} from './UseCreateProject';

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

  test('keeps the result of a project creation step', async () => {
    await expect(
      runProjectCreationStepWithTimeout({
        description: 'load the new project',
        operation: async () => 'created',
        timeoutMs: 100,
      })
    ).resolves.toBe('created');
  });

  test('reports a stalled project creation step as a timeout', async () => {
    jest.useFakeTimers();
    try {
      const stalledStep = runProjectCreationStepWithTimeout({
        description: 'save the new project',
        operation: () => new Promise(() => {}),
        timeoutMs: 1500,
      });

      jest.advanceTimersByTime(1500);

      await expect(stalledStep).rejects.toMatchObject({
        name: 'ProjectCreationTimeoutError',
        code: 'PROJECT_CREATION_TIMEOUT',
        message:
          'Creating the project timed out while trying to save the new project after 2 seconds.',
      });
    } finally {
      jest.useRealTimers();
    }
  });

  test('keeps the original error from a failed project creation step', async () => {
    const diskError = new Error('Disk is full.');
    await expect(
      runProjectCreationStepWithTimeout({
        description: 'save the new project',
        operation: async () => {
          throw diskError;
        },
        timeoutMs: 100,
      })
    ).rejects.toBe(diskError);
  });
});
