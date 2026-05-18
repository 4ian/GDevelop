// @flow
import * as React from 'react';
import { type AiRequest } from '../Utils/GDevelopServices/Generation';
import { getAllSubAgentFunctionCalls } from './AiRequestUtils';
import { AiRequestContext } from './AiRequestContext';

// Number of attempts to fetch a sub-agent request before giving up.
// Without a cap, a re-render after a failure would retry indefinitely; with a
// cap of 1 (the previous behavior) a transient network error would permanently
// hide the sub-agent.
export const MAX_LOAD_SUB_AGENT_REQUEST_ATTEMPTS = 3;

/**
 * For every sub-agent function call in the selected AI request, ensures that
 * its AiRequest is loaded into the shared `aiRequests` storage so its details
 * can be displayed (e.g. for historical or suspended parents whose sub-agents
 * are no longer being polled by `useActivatePendingSubAgents`).
 *
 * Fetches each sub-agent up to MAX_LOAD_SUB_AGENT_REQUEST_ATTEMPTS times in
 * case of transient failures, then stops. The polling/activation pipeline
 * remains responsible for live updates of still-running sub-agents.
 */
export const useLoadSubAgentRequests = ({
  selectedAiRequest,
}: {|
  selectedAiRequest: ?AiRequest,
|}) => {
  const { aiRequestStorage } = React.useContext(AiRequestContext);
  const { aiRequests, refreshAiRequest } = aiRequestStorage;
  // Tracks fetches currently in flight, so a re-render mid-fetch does not
  // kick off a duplicate concurrent fetch for the same id.
  const inFlightFetchesRef = React.useRef<Set<string>>(new Set());
  // Counts failed attempts per id so we don't retry forever.
  const failedAttemptsRef = React.useRef<{ [id: string]: number }>({});
  // Bumped after a failure to re-run the effect (a failure does not mutate
  // `aiRequests`, so without this the effect would not re-run on its own).
  const [retryCounter, forceRetry] = React.useReducer(x => x + 1, 0);

  React.useEffect(
    () => {
      if (!selectedAiRequest) return;

      const subAgentCalls = getAllSubAgentFunctionCalls({
        aiRequest: selectedAiRequest,
      });
      for (const call of subAgentCalls) {
        const subAgentAiRequestId = call.subAgentAiRequestId;
        if (!subAgentAiRequestId) continue;
        if (aiRequests[subAgentAiRequestId]) continue;
        if (inFlightFetchesRef.current.has(subAgentAiRequestId)) continue;
        if (
          (failedAttemptsRef.current[subAgentAiRequestId] || 0) >=
          MAX_LOAD_SUB_AGENT_REQUEST_ATTEMPTS
        )
          continue;

        inFlightFetchesRef.current.add(subAgentAiRequestId);
        refreshAiRequest(subAgentAiRequestId).then(success => {
          inFlightFetchesRef.current.delete(subAgentAiRequestId);
          if (!success) {
            failedAttemptsRef.current[subAgentAiRequestId] =
              (failedAttemptsRef.current[subAgentAiRequestId] || 0) + 1;
            forceRetry();
          }
        });
      }
    },
    [selectedAiRequest, aiRequests, refreshAiRequest, retryCounter]
  );
};
