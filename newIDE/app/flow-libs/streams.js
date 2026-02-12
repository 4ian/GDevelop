/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type TextEncodeOptions = { options?: boolean, ... };

declare class TextEncoder {
  encode(buffer: string, options?: TextEncodeOptions): Uint8Array,
}

declare class ReadableStreamController {
  constructor(
    stream: ReadableStream,
    underlyingSource: UnderlyingSource,
    size: number,
    highWaterMark: number,
  ): void,

  desiredSize: number,

  close(): void,
  enqueue(chunk: any): void,
  error(error: Error): void,
}

declare class ReadableStreamBYOBRequest {
  constructor(controller: ReadableStreamController, view: $TypedArray): void,

  view: $TypedArray,

  respond(bytesWritten: number): ?any,
  respondWithNewView(view: $TypedArray): ?any,
}

declare class ReadableByteStreamController extends ReadableStreamController {
  constructor(
    stream: ReadableStream,
    underlyingSource: UnderlyingSource,
    highWaterMark: number,
  ): void,

  byobRequest: ReadableStreamBYOBRequest,
}

declare class ReadableStreamReader {
  constructor(stream: ReadableStream): void,

  closed: boolean,

  cancel(reason: string): void,
  read(): Promise<{
    value: ?any,
    done: boolean,
    ...
  }>,
  releaseLock(): void,
}

declare interface UnderlyingSource {
  autoAllocateChunkSize?: number,
  type?: string,

  start?: (controller: ReadableStreamController) => ?Promise<void>,
  pull?: (controller: ReadableStreamController) => ?Promise<void>,
  cancel?: (reason: string) => ?Promise<void>,
}

declare class TransformStream {
  readable: ReadableStream,
  writable: WritableStream,
};

type PipeToOptions = {
  preventClose?: boolean,
  preventAbort?: boolean,
  preventCancel?: boolean,
  ...
};

type QueuingStrategy  = {
  highWaterMark: number,
  size(chunk: ?any): number,
  ...
};

declare class ReadableStream {
  constructor(
    underlyingSource: ?UnderlyingSource,
    queuingStrategy: ?QueuingStrategy,
  ): void,

  locked: boolean,

  cancel(reason: string): void,
  getReader(): ReadableStreamReader,
  pipeThrough(transform: TransformStream, options: ?any): void,
  pipeTo(dest: WritableStream, options: ?PipeToOptions): Promise<void>,
  tee(): [ReadableStream, ReadableStream],
};

declare interface WritableStreamController {
  error(error: Error): void,
}

declare interface UnderlyingSink {
  autoAllocateChunkSize?: number,
  type?: string,

  abort?: (reason: string) => ?Promise<void>,
  close?: (controller: WritableStreamController) => ?Promise<void>,
  start?: (controller: WritableStreamController) => ?Promise<void>,
  write?: (chunk: any, controller: WritableStreamController) => ?Promise<void>,
}

declare interface WritableStreamWriter {
  closed: Promise<any>,
  desiredSize?: number,
  ready: Promise<any>,

  abort(reason: string): ?Promise<any>,
  close(): Promise<any>,
  releaseLock(): void,
  write(chunk: any): Promise<any>,
}

declare class WritableStream {
  constructor(
    underlyingSink: ?UnderlyingSink,
    queuingStrategy: QueuingStrategy,
  ): void,

  locked: boolean,

  abort(reason: string): void,
  getWriter(): WritableStreamWriter,
}
