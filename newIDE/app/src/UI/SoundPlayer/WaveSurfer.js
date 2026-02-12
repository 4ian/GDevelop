// @flow
/* eslint-disable react-hooks/exhaustive-deps */

/**
 * A React component for wavesurfer.js
 * Taken from https://github.com/katspaugh/wavesurfer-react/blob/main/src/index.tsx
 * and adapted to Flow.
 * This code is under  BSD 3-clause license.
 *
BSD 3-Clause License

Copyright (c) 2012-2023, katspaugh and contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import * as React from 'react';
import WaveSurfer, { type WaveSurferOptions } from 'wavesurfer.js';

/**
 * Use wavesurfer instance
 */
function useWavesurferInstance(
  containerRef: {| current: HTMLDivElement | null |},
  options: WaveSurferOptions
): WaveSurfer | null {
  const [wavesurfer, setWavesurfer] = React.useState<WaveSurfer | null>(null);
  // Flatten options object to an array of keys and values to compare them deeply in the hook deps
  const flatOptions = React.useMemo(() => Object.entries(options).flat(), [
    options,
  ]);

  // Create a wavesurfer instance
  React.useEffect(
    () => {
      if (!containerRef.current) return;

      const ws = WaveSurfer.create({
        ...options,
        container: containerRef.current,
      });

      setWavesurfer(ws);

      return () => {
        ws.destroy();
      };
    },
    [containerRef, ...flatOptions]
  );

  return wavesurfer;
}

/**
 * Use wavesurfer state
 */
function useWavesurferState(
  wavesurfer: WaveSurfer | null
): {|
  isReady: boolean,
  isPlaying: boolean,
  currentTime: number,
|} {
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  React.useEffect(
    () => {
      if (!wavesurfer) return;

      const unsubscribeFns = [
        wavesurfer.on('load', () => {
          setIsReady(false);
          setIsPlaying(false);
          setCurrentTime(0);
        }),

        wavesurfer.on('ready', () => {
          setIsReady(true);
          setIsPlaying(false);
          setCurrentTime(0);
        }),

        wavesurfer.on('play', () => {
          setIsPlaying(true);
        }),

        wavesurfer.on('pause', () => {
          setIsPlaying(false);
        }),

        wavesurfer.on('timeupdate', () => {
          setCurrentTime(wavesurfer.getCurrentTime());
        }),

        wavesurfer.on('destroy', () => {
          setIsReady(false);
          setIsPlaying(false);
        }),
      ];

      return () => {
        unsubscribeFns.forEach(fn => fn());
      };
    },
    [wavesurfer]
  );

  return React.useMemo(
    () => ({
      isReady,
      isPlaying,
      currentTime,
    }),
    [isPlaying, currentTime, isReady]
  );
}

const EVENT_PROP_RE = /^on([A-Z])/;
const isEventProp = (key: string) => EVENT_PROP_RE.test(key);
const getEventName = (key: string) =>
  key.replace(EVENT_PROP_RE, (_, $1) => $1.toLowerCase());

type Props = any;

/**
 * Parse props into wavesurfer options and events
 */
function useWavesurferProps(props: Props): [any, any] {
  // Props starting with `on` are wavesurfer events, e.g. `onReady`
  // The rest of the props are wavesurfer options
  return React.useMemo<[any, any]>(
    () => {
      const allOptions = { ...props };
      const allEvents = { ...props };

      for (const key in allOptions) {
        if (isEventProp(key)) {
          delete allOptions[key];
        } else {
          delete allEvents[key];
        }
      }
      return [allOptions, allEvents];
    },
    [props]
  );
}

/**
 * Subscribe to wavesurfer events
 */
function useWavesurferEvents(wavesurfer: WaveSurfer | null, events: any) {
  const flatEvents = React.useMemo(() => Object.entries(events).flat(), [
    events,
  ]);

  // Subscribe to events
  React.useEffect(
    () => {
      if (!wavesurfer) return;

      const eventEntries = Object.entries(events);
      if (!eventEntries.length) return;

      const unsubscribeFns = eventEntries.map(
        ([name, handler]: [string, mixed]) => {
          const event = getEventName(name);
          return wavesurfer.on(event, (...args) =>
            // $FlowIgnore
            handler(wavesurfer, ...args)
          );
        }
      );

      return () => {
        unsubscribeFns.forEach(fn => fn());
      };
    },
    [wavesurfer, ...flatEvents]
  );
}

/**
 * Wavesurfer player component
 * @see https://wavesurfer.xyz/docs/modules/wavesurfer
 * @public
 */
const WavesurferPlayer = React.memo<Props>(
  (props: Props): React$Element<any> => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [options, events] = useWavesurferProps(props);
    const wavesurfer = useWavesurferInstance(containerRef, options);
    useWavesurferEvents(wavesurfer, events);

    // Create a container div
    return <div ref={containerRef} />;
  }
);

/**
 * @public
 */
export default WavesurferPlayer;

/**
 * React hook for wavesurfer.js
 *
 * ```
 * import { useWavesurfer } from '@wavesurfer/react'
 *
 * const App = () => {
 *   const containerRef = useRef<HTMLDivElement | null>(null)
 *
 *   const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
 *     container: containerRef,
 *     url: '/my-server/audio.ogg',
 *     waveColor: 'purple',
 *     height: 100',
 *   })
 *
 *   return <div ref={containerRef} />
 * }
 * ```
 *
 * @public
 */
export function useWavesurfer({ container, ...options }: Props) {
  const wavesurfer = useWavesurferInstance(container, options);
  const state = useWavesurferState(wavesurfer);
  return React.useMemo(() => ({ ...state, wavesurfer }), [state, wavesurfer]);
}
