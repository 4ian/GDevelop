// @flow
import {
  type PreviewDebuggerServerCallbacks,
  type DebuggerId,
} from './PreviewLauncher.flow';
import { DEFAULT_GAME_RESPONSE_TIMEOUT_MS } from '../Debugger/DebuggerConstants';

export type PreviewDebuggerServerSubscribers = {|
  register: (callbacks: PreviewDebuggerServerCallbacks) => () => void,
  forEach: (
    notify: (callbacks: PreviewDebuggerServerCallbacks) => void | Promise<void>
  ) => void,
|};

export type PendingResponses = {|
  send: ({|
    message: Object,
    targetIds: Array<DebuggerId>,
    sendMessage: (id: DebuggerId, message: Object) => void,
    timeoutMs?: number,
  |}) => Promise<Object>,
  resolve: (parsedMessage: Object) => boolean,
  clear: () => void,
|};

/**
 * The subscribers of a preview debugger server, shared by the desktop and the
 * browser servers.
 */
export const makePreviewDebuggerServerSubscribers = (): PreviewDebuggerServerSubscribers => {
  const callbacksList: Array<PreviewDebuggerServerCallbacks> = [];

  return {
    /** Add a subscriber. Returns the function removing it. */
    register: (callbacks: PreviewDebuggerServerCallbacks) => {
      callbacksList.push(callbacks);

      return () => {
        const callbacksIndex = callbacksList.indexOf(callbacks);
        if (callbacksIndex !== -1) callbacksList.splice(callbacksIndex, 1);
      };
    },
    /**
     * Notify all the subscribers of the debugger server. One of them failing (a
     * bug in a panel of the editor) must never prevent the others from receiving
     * what the preview sent.
     */
    forEach: (
      // The callbacks can be asynchronous: what they return is not awaited.
      notify: (
        callbacks: PreviewDebuggerServerCallbacks
      ) => void | Promise<void>
    ) => {
      // Iterate on a copy: a subscriber can register or unregister while notified.
      [...callbacksList].forEach(callbacks => {
        try {
          notify(callbacks);
        } catch (error) {
          console.error(
            'Error while notifying a subscriber of the preview debugger server:',
            error
          );
        }
      });
    },
  };
};

/**
 * The messages sent to the games that wait for an answer, shared by the
 * desktop and the browser servers.
 */
export const makePendingResponses = (): PendingResponses => {
  const responseCallbacks = new Map<number, (value: Object) => void>();
  let nextMessageWithResponseId = 1;

  return {
    /**
     * Send the message to the given games, and resolve with the first answer,
     * or reject if none came in time.
     */
    send: ({ message, targetIds, sendMessage, timeoutMs }) => {
      const messageId = nextMessageWithResponseId;
      nextMessageWithResponseId++;
      for (const id of targetIds) {
        sendMessage(id, { ...message, messageId });
      }

      const timeout = timeoutMs || DEFAULT_GAME_RESPONSE_TIMEOUT_MS;
      const promise = new Promise<Object>((resolve, reject) => {
        responseCallbacks.set(messageId, resolve);
        setTimeout(() => {
          reject(
            new Error(
              `Timeout while waiting for response from the debugger(s) for message with id ${messageId}.`
            )
          );
          responseCallbacks.delete(messageId);
        }, timeout);
      });
      return promise;
    },
    /**
     * Give a message to the one waiting for it. Returns false if nobody was
     * (not an answer, already answered, or answered too late).
     */
    resolve: (parsedMessage: Object) => {
      const answerCallback = responseCallbacks.get(parsedMessage.messageId);
      if (!answerCallback) return false;

      answerCallback(parsedMessage);
      responseCallbacks.delete(parsedMessage.messageId);
      return true;
    },
    /** Forget the messages waiting for an answer: they will time out. */
    clear: () => {
      responseCallbacks.clear();
    },
  };
};
