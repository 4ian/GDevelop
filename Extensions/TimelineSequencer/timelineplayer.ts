namespace gdjs {
  export namespace evtTools {
    export namespace timeline {
      type TargetMode = 'sceneInstance' | 'objectName' | 'runtimeBinding';
      type SelectionMode = 'first' | 'all';

      export type TimelineTarget = {
        mode?: TargetMode;
        objectName?: string;
        instancePersistentUuid?: string;
        selection?: SelectionMode;
        bindingName?: string;
      };

      export type TimelineKeyframe = {
        id?: string;
        time: number;
        value: TimelineValue;
        ease?: EaseDefinition;
        curve?: EaseDefinition;
      };

      export type TimelinePropertyTrack = {
        property: string;
        interpolationMode?: 'continuous' | 'step' | 'hold' | 'keyframe';
        initialValue?: TimelineValue;
        initialEase?: EaseDefinition;
        initialCurve?: EaseDefinition;
        keyframes: Array<TimelineKeyframe>;
        pathSegments?: Array<PathSegment>;
      };

      export type TimelineTrack = {
        id?: string;
        type?: 'object' | 'camera' | 'layer' | 'variable' | 'marker';
        target?: TimelineTarget;
        propertyTracks?: Array<TimelinePropertyTrack>;
      };

      export type TimelineMarker = {
        time: number;
        name: string;
      };

      export type TimelineData = {
        name: string;
        duration: number;
        loop?: boolean;
        speed?: number;
        tracks?: Array<TimelineTrack>;
        markers?: Array<TimelineMarker>;
      };

      const isScalable = (
        object: gdjs.RuntimeObject
      ): object is gdjs.RuntimeObject & gdjs.Scalable =>
        // @ts-ignore - Runtime objects expose capabilities dynamically.
        !!object.setScaleX && !!object.setScaleY;

      const isOpaque = (
        object: gdjs.RuntimeObject
      ): object is gdjs.RuntimeObject & gdjs.OpacityHandler =>
        // @ts-ignore - Runtime objects expose capabilities dynamically.
        !!object.setOpacity && !!object.getOpacity;

      const clampNumber = (value: number, min: number, max: number): number =>
        Math.max(min, Math.min(max, value));

      const discreteTimelineProperties = new Set<string>([
        'animation',
        'animationindex',
        'animationname',
      ]);
      const timelineFrameRate = 60;

      const isDiscreteTimelineProperty = (propertyName: string): boolean =>
        discreteTimelineProperties.has(propertyName.toLowerCase());

      const getKeyframeCurve = (
        keyframe: TimelineKeyframe
      ): EaseDefinition | null | undefined =>
        keyframe.curve !== undefined && keyframe.curve !== null
          ? keyframe.curve
          : keyframe.ease;

      const createImplicitInitialKeyframe = (
        propertyTrack: TimelinePropertyTrack
      ): TimelineKeyframe | null => {
        if (
          propertyTrack.initialValue === undefined ||
          propertyTrack.initialValue === null
        ) {
          return null;
        }

        return {
          id: `${propertyTrack.property}-initial`,
          time: 0,
          value: propertyTrack.initialValue,
          ease:
            propertyTrack.initialEase !== undefined
              ? propertyTrack.initialEase
              : isDiscreteTimelineProperty(propertyTrack.property)
                ? 'hold'
                : 'linear',
          curve:
            propertyTrack.initialCurve !== undefined
              ? propertyTrack.initialCurve
              : isDiscreteTimelineProperty(propertyTrack.property)
                ? 'stepped'
                : 'linear',
        };
      };

      const hasRuntimeMethod = (
        object: gdjs.RuntimeObject,
        methodName: string
      ): boolean => typeof (object as any)[methodName] === 'function';

      const getRuntimeObjectNumber = (
        object: gdjs.RuntimeObject,
        getterName: string,
        fallback: number
      ): number => {
        const getter = (object as any)[getterName];
        if (typeof getter !== 'function') {
          return fallback;
        }

        const value = getter.call(object);
        return typeof value === 'number' && isFinite(value) ? value : fallback;
      };

      const setRuntimeObjectNumber = (
        object: gdjs.RuntimeObject,
        setterName: string,
        value: number
      ): void => {
        if (!isFinite(value)) {
          return;
        }
        const setter = (object as any)[setterName];
        if (typeof setter === 'function') {
          setter.call(object, value);
        }
      };

      const normalizeKeyframes = (propertyTrack: TimelinePropertyTrack) => {
        const keyframes = propertyTrack.keyframes || [];
        const keyframeByFrame = new Map<string, TimelineKeyframe>();
        for (const keyframe of keyframes) {
          const frame = Math.round((keyframe.time || 0) * timelineFrameRate);
          keyframeByFrame.set(String(frame), {
            ...keyframe,
            time: frame / timelineFrameRate,
          });
        }
        propertyTrack.keyframes = Array.from(keyframeByFrame.values()).sort(
          (a, b) => a.time - b.time
        );
      };

      export class TimelinePlayer {
        private _runtimeScene: gdjs.RuntimeScene;
        private _timeline: TimelineData;
        private _currentTime: number = 0;
        private _speed: number = 1;
        private _loop: boolean = false;
        private _isPlaying: boolean = false;
        private _isPaused: boolean = false;
        private _hasFinished: boolean = false;
        private _reachedMarkers: Set<string> = new Set();
        private _bindings: Map<string, Array<gdjs.RuntimeObject>>;

        constructor(
          runtimeScene: gdjs.RuntimeScene,
          timeline: TimelineData,
          bindings: Map<string, Array<gdjs.RuntimeObject>>
        ) {
          this._runtimeScene = runtimeScene;
          this._timeline = timeline;
          this._bindings = bindings;
          this._loop = !!timeline.loop;
          this._speed = timeline.speed || 1;

          for (const track of timeline.tracks || []) {
            for (const propertyTrack of track.propertyTracks || []) {
              normalizeKeyframes(propertyTrack);
            }
          }
        }

        play(fromTime: number = 0): void {
          this._currentTime = this._clampTime(fromTime);
          this._isPlaying = true;
          this._isPaused = false;
          this._hasFinished = false;
          this._reachedMarkers.clear();
          this._apply();
        }

        pause(): void {
          if (!this._isPlaying || this._hasFinished) {
            return;
          }
          this._isPaused = true;
        }

        resume(): void {
          if (!this._isPlaying || this._hasFinished) {
            return;
          }
          this._isPaused = false;
        }

        stop(): void {
          this._isPlaying = false;
          this._isPaused = false;
          this._hasFinished = true;
          this._reachedMarkers.clear();
        }

        seek(time: number): void {
          this._currentTime = this._clampTime(time);
          this._hasFinished = false;
          this._reachedMarkers.clear();
          this._apply();
        }

        update(deltaTime: number): void {
          this._reachedMarkers.clear();
          if (!this._isPlaying || this._isPaused || this._hasFinished) {
            return;
          }

          const previousTime = this._currentTime;
          this._currentTime += deltaTime * this._speed;

          const duration = Math.max(0, this._timeline.duration || 0);
          if (duration <= 0) {
            this._currentTime = 0;
            this._hasFinished = true;
            this._isPlaying = false;
          } else if (this._loop) {
            if (this._currentTime >= duration || this._currentTime < 0) {
              this._collectMarkers(previousTime, duration);
              this._currentTime =
                ((this._currentTime % duration) + duration) % duration;
              this._collectMarkers(0, this._currentTime);
            } else {
              this._collectMarkers(previousTime, this._currentTime);
            }
          } else {
            if (this._currentTime >= duration) {
              this._currentTime = duration;
              this._collectMarkers(previousTime, this._currentTime);
              this._hasFinished = true;
              this._isPlaying = false;
            } else if (this._currentTime <= 0) {
              this._currentTime = 0;
              this._collectMarkers(previousTime, this._currentTime);
              this._hasFinished = true;
              this._isPlaying = false;
            } else {
              this._collectMarkers(previousTime, this._currentTime);
            }
          }

          this._apply();
        }

        isPlaying(): boolean {
          return this._isPlaying && !this._isPaused && !this._hasFinished;
        }

        isPaused(): boolean {
          return this._isPlaying && this._isPaused && !this._hasFinished;
        }

        hasFinished(): boolean {
          return this._hasFinished;
        }

        reachedMarker(markerName: string): boolean {
          return this._reachedMarkers.has(markerName);
        }

        getCurrentTime(): number {
          return this._currentTime;
        }

        getDuration(): number {
          return this._timeline.duration || 0;
        }

        getProgress(): number {
          const duration = this.getDuration();
          return duration > 0 ? this._currentTime / duration : 0;
        }

        setSpeed(speed: number): void {
          this._speed = speed;
        }

        getSpeed(): number {
          return this._speed;
        }

        setLoop(loop: boolean): void {
          this._loop = loop;
        }

        private _clampTime(time: number): number {
          return Math.max(0, Math.min(this._timeline.duration || 0, time || 0));
        }

        private _collectMarkers(
          previousTime: number,
          currentTime: number
        ): void {
          const markers = this._timeline.markers || [];
          const min = Math.min(previousTime, currentTime);
          const max = Math.max(previousTime, currentTime);
          for (const marker of markers) {
            if (marker.time > min && marker.time <= max) {
              this._reachedMarkers.add(marker.name);
            }
          }
        }

        private _findKeyframePair(
          propertyTrack: TimelinePropertyTrack,
          time: number
        ): {
          from: TimelineKeyframe;
          to: TimelineKeyframe;
          localT: number;
        } | null {
          const keyframes = propertyTrack.keyframes || [];
          const implicitInitialKeyframe =
            createImplicitInitialKeyframe(propertyTrack);
          if (!keyframes.length) {
            return implicitInitialKeyframe
              ? {
                  from: implicitInitialKeyframe,
                  to: implicitInitialKeyframe,
                  localT: 0,
                }
              : null;
          }
          if (implicitInitialKeyframe && keyframes[0].time > 0) {
            if (time <= 0) {
              return {
                from: implicitInitialKeyframe,
                to: implicitInitialKeyframe,
                localT: 0,
              };
            }

            if (time < keyframes[0].time) {
              return {
                from: implicitInitialKeyframe,
                to: keyframes[0],
                localT: keyframes[0].time > 0 ? time / keyframes[0].time : 1,
              };
            }
          }
          if (keyframes.length === 1 || time <= keyframes[0].time) {
            return {
              from: keyframes[0],
              to: keyframes[0],
              localT: 0,
            };
          }
          const lastKeyframe = keyframes[keyframes.length - 1];
          if (time >= lastKeyframe.time) {
            return {
              from: lastKeyframe,
              to: lastKeyframe,
              localT: 1,
            };
          }

          let low = 0;
          let high = keyframes.length - 2;
          while (low <= high) {
            const index = Math.floor((low + high) / 2);
            const from = keyframes[index];
            const to = keyframes[index + 1];

            if (time < from.time) {
              high = index - 1;
              continue;
            }

            if (time > to.time) {
              low = index + 1;
              continue;
            }

            const duration = to.time - from.time;
            return {
              from,
              to,
              localT: duration > 0 ? (time - from.time) / duration : 1,
            };
          }
          return null;
        }

        private _evaluateTrack(
          propertyTrack: TimelinePropertyTrack,
          time: number
        ): TimelineValue | null {
          const pair = this._findKeyframePair(propertyTrack, time);
          if (!pair) {
            return null;
          }

          const mode = propertyTrack.interpolationMode || 'continuous';
          if (
            pair.from === pair.to ||
            isDiscreteTimelineProperty(propertyTrack.property) ||
            mode === 'step' ||
            mode === 'hold' ||
            mode === 'keyframe'
          ) {
            return pair.localT >= 1 ? pair.to.value : pair.from.value;
          }

          const easedT = gdjs.evtTools.timeline.evaluateEase(
            getKeyframeCurve(pair.from),
            pair.localT
          );
          if (propertyTrack.property === 'position') {
            const from = pair.from.value as TimelinePoint;
            const to = pair.to.value as TimelinePoint;
            const pathSegment = (propertyTrack.pathSegments || []).find(
              (segment) =>
                segment.fromKeyframeId === pair.from.id &&
                segment.toKeyframeId === pair.to.id
            );
            return gdjs.evtTools.timeline.evaluatePathSegment(
              from,
              to,
              pathSegment,
              easedT
            );
          }

          return gdjs.evtTools.timeline.interpolateValue(
            pair.from.value,
            pair.to.value,
            easedT,
            propertyTrack.property
          );
        }

        private _resolveObjects(
          target: TimelineTarget | null | undefined
        ): Array<gdjs.RuntimeObject> {
          if (!target) {
            return [];
          }

          if (target.mode === 'runtimeBinding' && target.bindingName) {
            return this._bindings.get(target.bindingName) || [];
          }

          const objectName = target.objectName;
          if (!objectName) {
            return [];
          }
          const objects = this._runtimeScene.getObjects(objectName);

          if (
            target.mode === 'sceneInstance' &&
            target.instancePersistentUuid
          ) {
            const matchedObjects = objects.filter(
              (object) =>
                object.persistentUuid === target.instancePersistentUuid
            );
            if (matchedObjects.length) {
              return matchedObjects;
            }
          }

          return target.selection === 'all' ? objects : objects.slice(0, 1);
        }

        private _applyValueToObject(
          object: gdjs.RuntimeObject,
          propertyName: string,
          value: TimelineValue
        ): void {
          switch (propertyName) {
            case 'position':
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                object.setPosition(
                  typeof value.x === 'number' ? value.x : object.getX(),
                  typeof value.y === 'number' ? value.y : object.getY()
                );
                if (typeof value.z === 'number') {
                  setRuntimeObjectNumber(object, 'setZ', value.z);
                }
              }
              break;
            case 'x':
            case 'X':
              object.setX(
                gdjs.evtTools.timeline.valueAsNumber(value, object.getX())
              );
              break;
            case 'y':
            case 'Y':
              object.setY(
                gdjs.evtTools.timeline.valueAsNumber(value, object.getY())
              );
              break;
            case 'z':
            case 'Z':
              setRuntimeObjectNumber(
                object,
                'setZ',
                gdjs.evtTools.timeline.valueAsNumber(
                  value,
                  getRuntimeObjectNumber(object, 'getZ', 0)
                )
              );
              break;
            case 'angle':
            case 'Angle':
            case 'rotationZ':
            case 'RotationZ':
              object.setAngle(
                gdjs.evtTools.timeline.valueAsNumber(value, object.getAngle())
              );
              break;
            case 'rotationX':
            case 'RotationX':
              setRuntimeObjectNumber(
                object,
                'setRotationX',
                gdjs.evtTools.timeline.valueAsNumber(
                  value,
                  getRuntimeObjectNumber(object, 'getRotationX', 0)
                )
              );
              break;
            case 'rotationY':
            case 'RotationY':
              setRuntimeObjectNumber(
                object,
                'setRotationY',
                gdjs.evtTools.timeline.valueAsNumber(
                  value,
                  getRuntimeObjectNumber(object, 'getRotationY', 0)
                )
              );
              break;
            case 'scaleX':
            case 'ScaleX':
              if (isScalable(object)) {
                object.setScaleX(
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    object.getScaleX()
                  )
                );
              }
              break;
            case 'scaleY':
            case 'ScaleY':
              if (isScalable(object)) {
                object.setScaleY(
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    object.getScaleY()
                  )
                );
              }
              break;
            case 'scaleZ':
            case 'ScaleZ':
              setRuntimeObjectNumber(
                object,
                'setScaleZ',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getScaleZ', 1)
                  )
                )
              );
              break;
            case 'scale':
            case 'Scale':
              if (isScalable(object)) {
                if (
                  value &&
                  typeof value === 'object' &&
                  !Array.isArray(value)
                ) {
                  object.setScaleX(
                    typeof value.x === 'number' ? value.x : object.getScaleX()
                  );
                  object.setScaleY(
                    typeof value.y === 'number' ? value.y : object.getScaleY()
                  );
                  if (typeof value.z === 'number') {
                    setRuntimeObjectNumber(object, 'setScaleZ', value.z);
                  }
                } else {
                  const scale = gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    object.getScaleX()
                  );
                  object.setScaleX(scale);
                  object.setScaleY(scale);
                  setRuntimeObjectNumber(object, 'setScaleZ', scale);
                }
              }
              break;
            case 'opacity':
            case 'Opacity':
              if (isOpaque(object)) {
                object.setOpacity(
                  clampNumber(
                    gdjs.evtTools.timeline.valueAsNumber(
                      value,
                      object.getOpacity()
                    ),
                    0,
                    255
                  )
                );
              }
              break;
            case 'width':
            case 'Width':
              setRuntimeObjectNumber(
                object,
                'setWidth',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getWidth', 0)
                  )
                )
              );
              break;
            case 'height':
            case 'Height':
              setRuntimeObjectNumber(
                object,
                'setHeight',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getHeight', 0)
                  )
                )
              );
              break;
            case 'depth':
            case 'Depth':
              setRuntimeObjectNumber(
                object,
                'setDepth',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getDepth', 0)
                  )
                )
              );
              break;
            case 'animation':
            case 'Animation':
            case 'animationIndex':
            case 'AnimationIndex': {
              const currentAnimationIndex = hasRuntimeMethod(
                object,
                'getAnimationIndex'
              )
                ? getRuntimeObjectNumber(object, 'getAnimationIndex', 0)
                : getRuntimeObjectNumber(object, 'getAnimation', 0);
              const animationIndex = Math.max(
                0,
                Math.round(
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    currentAnimationIndex
                  )
                )
              );
              if (hasRuntimeMethod(object, 'setAnimationIndex')) {
                setRuntimeObjectNumber(
                  object,
                  'setAnimationIndex',
                  animationIndex
                );
              } else {
                setRuntimeObjectNumber(object, 'setAnimation', animationIndex);
              }
              break;
            }
            case 'animationFrame':
            case 'AnimationFrame': {
              const animationFrame = Math.max(
                0,
                Math.round(
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getAnimationFrame', 0)
                  )
                )
              );
              setRuntimeObjectNumber(
                object,
                'setAnimationFrame',
                animationFrame
              );
              break;
            }
            case 'animationSpeed':
            case 'AnimationSpeed':
            case 'animationSpeedScale':
            case 'AnimationSpeedScale':
              setRuntimeObjectNumber(
                object,
                'setAnimationSpeedScale',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getAnimationSpeedScale', 1)
                  )
                )
              );
              break;
            case 'fontSize':
            case 'FontSize':
            case 'characterSize':
            case 'CharacterSize':
              setRuntimeObjectNumber(
                object,
                'setCharacterSize',
                Math.max(
                  1,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getCharacterSize', 20)
                  )
                )
              );
              break;
            case 'lineHeight':
            case 'LineHeight':
              setRuntimeObjectNumber(
                object,
                'setLineHeight',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getLineHeight', 1)
                  )
                )
              );
              break;
            case 'volume':
            case 'Volume':
              setRuntimeObjectNumber(
                object,
                'setVolume',
                clampNumber(
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getVolume', 100)
                  ),
                  0,
                  100
                )
              );
              break;
            case 'playbackSpeed':
            case 'PlaybackSpeed':
              setRuntimeObjectNumber(
                object,
                'setPlaybackSpeed',
                clampNumber(
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getPlaybackSpeed', 1)
                  ),
                  0.5,
                  2
                )
              );
              break;
            case 'currentTime':
            case 'CurrentTime':
              setRuntimeObjectNumber(
                object,
                'setCurrentTime',
                Math.max(
                  0,
                  gdjs.evtTools.timeline.valueAsNumber(
                    value,
                    getRuntimeObjectNumber(object, 'getCurrentTime', 0)
                  )
                )
              );
              break;
          }
        }

        private _apply(): void {
          for (const track of this._timeline.tracks || []) {
            if (track.type && track.type !== 'object') {
              continue;
            }
            const objects = this._resolveObjects(track.target);
            if (!objects.length) {
              continue;
            }
            for (const propertyTrack of track.propertyTracks || []) {
              const value = this._evaluateTrack(
                propertyTrack,
                this._currentTime
              );
              if (value === null) {
                continue;
              }
              for (const object of objects) {
                this._applyValueToObject(object, propertyTrack.property, value);
              }
            }
          }
        }
      }
    }
  }
}
