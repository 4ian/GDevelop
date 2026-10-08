// @flow
import {
  makePendingResponses,
  makePreviewDebuggerServerSubscribers,
} from './PreviewDebuggerServerUtils';

describe('PreviewDebuggerServerUtils', () => {
  it('notifies every subscriber, even when one of them fails', () => {
    const subscribers = makePreviewDebuggerServerSubscribers();
    const notifiedNames = [];
    const makeCallbacks = (name: string): any => ({ name });
    const unregisterFirst = subscribers.register(makeCallbacks('first'));
    subscribers.register(makeCallbacks('second'));

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    subscribers.forEach((callbacks: any) => {
      if (callbacks.name === 'first') throw new Error('A bug in a panel.');
      notifiedNames.push(callbacks.name);
    });
    consoleError.mockRestore();
    expect(notifiedNames).toEqual(['second']);

    unregisterFirst();
    notifiedNames.length = 0;
    subscribers.forEach((callbacks: any) => notifiedNames.push(callbacks.name));
    expect(notifiedNames).toEqual(['second']);
  });

  it('resolves with the answer to the message', async () => {
    const pendingResponses = makePendingResponses();
    const sentMessages = [];
    const answerPromise = pendingResponses.send({
      message: { command: 'inspector.dump' },
      targetIds: ['1', '2'],
      sendMessage: (id, message) => sentMessages.push({ id, message }),
    });
    expect(sentMessages.map(({ id }) => id)).toEqual(['1', '2']);
    const { messageId } = sentMessages[0].message;
    expect(sentMessages[1].message.messageId).toBe(messageId);

    expect(pendingResponses.resolve({ messageId, payload: 42 })).toBe(true);
    // Answered once only.
    expect(pendingResponses.resolve({ messageId, payload: 43 })).toBe(false);
    expect(pendingResponses.resolve({ command: 'status' })).toBe(false);
    await expect(answerPromise).resolves.toEqual({ messageId, payload: 42 });
  });

  it('rejects when no answer came in time', async () => {
    jest.useFakeTimers();
    const pendingResponses = makePendingResponses();
    const answerPromise = pendingResponses.send({
      message: { command: 'resources.dump' },
      targetIds: ['1'],
      sendMessage: () => {},
      timeoutMs: 10000,
    });
    jest.advanceTimersByTime(10000);
    await expect(answerPromise).rejects.toThrow('Timeout');
    jest.useRealTimers();
  });
});
