// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { delay } from '../Utils/Delay';
import {
  getAiGeneratedEvent,
  createAiGeneratedEvent,
} from '../Utils/GDevelopServices/Generation';

import { type EventsGenerationResult } from '../EditorFunctions';
import { getSimplifiedProject } from '../Utils/SimplifiedProjectJson';

export const useGenerateEvents = ({ project }: {| project: ?gdProject |}) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const generateEvents = React.useCallback(
    async ({
      sceneName,
      eventsDescription,
      extensionNamesList,
      objectsList,
      existingEventsAsText,
      placementHint,
      relatedAiRequestId,
    }: {|
      sceneName: string,
      eventsDescription: string,
      extensionNamesList: string,
      objectsList: string,
      existingEventsAsText: string,
      placementHint: string,
      relatedAiRequestId: string,
    |}): Promise<EventsGenerationResult> => {
      if (!project) throw new Error('No project is opened.');
      if (!profile) throw new Error('User should be authenticated.');

      const createResult = await retryIfFailed({ times: 2 }, () =>
        createAiGeneratedEvent(getAuthorizationHeader, {
          userId: profile.id,
          partialGameProjectJson: JSON.stringify(
            getSimplifiedProject(project, {
              scopeToScene: sceneName,
            }),
            null,
            2
          ),
          eventsDescription,
          extensionNamesList,
          objectsList,
          existingEventsAsText,
          placementHint,
          relatedAiRequestId,
        })
      );

      if (!createResult.creationSucceeded) {
        return {
          generationCompleted: false,
          errorMessage: createResult.errorMessage,
        };
      }

      let remainingAttempts = 50;
      let aiGeneratedEvent = createResult.aiGeneratedEvent;
      while (aiGeneratedEvent.status === 'working') {
        remainingAttempts--;
        await delay(1000);

        try {
          aiGeneratedEvent = await getAiGeneratedEvent(getAuthorizationHeader, {
            userId: profile.id,
            aiGeneratedEventId: aiGeneratedEvent.id,
          });
        } catch (error) {
          console.warn(
            'Error while checking status of AI generated event - continuing...',
            error
          );
        }
        if (remainingAttempts <= 0) {
          return {
            generationCompleted: false,
            errorMessage:
              'Event generation started but failed to complete in time.',
          };
        }
      }

      return { generationCompleted: true, aiGeneratedEvent };
    },
    [getAuthorizationHeader, project, profile]
  );

  return { generateEvents };
};
