// SPDX-License-Identifier: MIT
// Contact listener writing the contacts into a buffer of the WebAssembly memory,
// instead of calling the game objects.
// With the multithreaded build of Jolt, the listener is called by the worker
// threads during the step, where the JavaScript objects of the game don't exist.
// The main thread reads the buffer after the step instead.
// This module is loaded by the main thread and by each worker thread
// (see `Jolt.configureWorkerScripts`).

export const contactAddedEventType = 1;
export const contactRemovedEventType = 2;
export const eventIntegersCount = 3;

/**
 * The buffer starts with the number of events, followed by the events:
 * the event type and the IDs of the 2 bodies.
 * @param {any} Jolt
 * @param {{ bufferAddress: number, capacity: number }} buffer
 */
export const createBufferedContactListenerMethods = (Jolt, buffer) => {
  const countIndex = buffer.bufferAddress >> 2;
  const pushEvent = (eventType, bodyIdA, bodyIdB) => {
    // The view is read each time because it's replaced when the memory grows.
    const heap = Jolt.HEAP32;
    const eventIndex = Atomics.add(heap, countIndex, 1);
    if (eventIndex >= buffer.capacity) {
      return;
    }
    const eventStart = countIndex + 1 + eventIndex * eventIntegersCount;
    heap[eventStart] = eventType;
    heap[eventStart + 1] = bodyIdA;
    heap[eventStart + 2] = bodyIdB;
  };
  return {
    OnContactValidate: () =>
      Jolt.ValidateResult_AcceptAllContactsForThisBodyPair,
    OnContactAdded: (bodyPointerA, bodyPointerB) => {
      pushEvent(
        contactAddedEventType,
        Jolt.wrapPointer(bodyPointerA, Jolt.Body)
          .GetID()
          .GetIndexAndSequenceNumber(),
        Jolt.wrapPointer(bodyPointerB, Jolt.Body)
          .GetID()
          .GetIndexAndSequenceNumber()
      );
    },
    OnContactPersisted: () => {},
    OnContactRemoved: (subShapePairPointer) => {
      const subShapePair = Jolt.wrapPointer(
        subShapePairPointer,
        Jolt.SubShapeIDPair
      );
      pushEvent(
        contactRemovedEventType,
        subShapePair.GetBody1ID().GetIndexAndSequenceNumber(),
        subShapePair.GetBody2ID().GetIndexAndSequenceNumber()
      );
    },
  };
};

/**
 * Entry point of the worker threads: the listener created by the main thread
 * is given the same methods in this thread.
 * @param {any} Jolt
 * @param {{ contactListenerAddress: number, bufferAddress: number, capacity: number }} parameters
 */
export default async (Jolt, parameters) => {
  Jolt.getCache(Jolt.ContactListenerJS)[parameters.contactListenerAddress] =
    createBufferedContactListenerMethods(Jolt, parameters);
};
