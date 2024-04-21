namespace gdjs {
  /** The initial properties for {@link gdjs.VideoRuntimeObject} */
  export type VideoObjectDataType = {
    /** The base parameters of the video */
    content: {
      /** The opacity of the video */
      opacity: number;
      /** Does the video loops itself? */
      loop: boolean;
      /** The volume of the video */
      volume: number;
      /** Name of the resource corresponding to the video */
      videoResource: string;
    };
  };

  export type VideoObjectData = ObjectData & VideoObjectDataType;

  /**
   * An object displaying a video on screen.
   *
   * For the same video resource, only one video is being created in memory (
   * as a HTMLVideoElement). This means that two objects displaying the same
   * video will have the same state for this video (paused/playing, current time,
   * volume, etc...).
   */
  export class VideoRuntimeObject
    extends gdjs.RuntimeObject
    implements gdjs.OpacityHandler {
    _opacity: float;
    _loop: boolean;
    _volume: float;
    _videoResource: string;

    // Use a boolean to track if the video was paused because we
    // navigated to another scene, and so should resume if we're back.
    _pausedAsScenePaused: boolean = false;
    _renderer: gdjs.VideoRuntimeObjectRenderer;
    _playbackSpeed: any;

    /**
     * @param instanceContainer The scene the object belongs to.
     * @param videoObjectData The data defining the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      videoObjectData: VideoObjectData
    ) {
      super(instanceContainer, videoObjectData);
      this._opacity = videoObjectData.content.opacity;
      this._loop = videoObjectData.content.loop;
      this._volume = videoObjectData.content.volume;
      this._videoResource = videoObjectData.content.videoResource;
      this._renderer = new gdjs.VideoRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject() {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: VideoObjectData,
      newObjectData: VideoObjectData
    ): boolean {
      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (oldObjectData.content.loop !== newObjectData.content.loop) {
        this.setLoop(newObjectData.content.loop);
      }
      if (oldObjectData.content.volume !== newObjectData.content.volume) {
        this.setVolume(newObjectData.content.volume);
      }
      if (
        oldObjectData.content.videoResource !==
        newObjectData.content.videoResource
      ) {
        return false;
      }
      return true;
    }

    /**
     * Initialize the extra parameters that could be set for an instance.
     * @param initialInstanceData The initial instance data
     */
    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._renderer.ensureUpToDate();
    }

    /**
     * Set object position on X axis.
     * @param x The new position X of the object.
     */
    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    /**
     * Set object position on Y axis.
     * @param y The new position Y of the object.
     */
    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Set the angle of the object.
     * @param angle The new angle of the object.
     */
    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    /**
     * Set object opacity.
     * @param opacity The new opacity of the object (0-255).
     */
    setOpacity(opacity: float): void {
      this._opacity = opacity;
      this._renderer.updateOpacity();
    }

    /**
     * Get object opacity.
     * @returns The current opacity
     */
    getOpacity(): number {
      return this._opacity;
    }

    /**
     * Set the width of the video.
     * @param width The new width in pixels.
     */
    setWidth(width: float): void {
      if (this._renderer.getWidth() === width) return;

      this._renderer.setWidth(width);
      this.invalidateHitboxes();
    }

    /**
     * Set the height of the video.
     * @param height The new height in pixels.
     */
    setHeight(height: float): void {
      if (this._renderer.getHeight() === height) return;

      this._renderer.setHeight(height);
      this.invalidateHitboxes();
    }

    /**
     * Get the width of the video object.
     * @returns The current width of the object
     */
    getWidth(): float {
      return this._renderer.getWidth();
    }

    /**
     * Get the height of the video object.
     * @returns The current height of the object
     */
    getHeight(): float {
      return this._renderer.getHeight();
    }

    /**
     * Play the video.
     */
    play(): void {
      this._renderer.play();
    }

    /**
     * Pause the video.
     */
    pause(): void {
      this._renderer.pause();
    }

    /**
     * Set the state looped of the video.
     * @param enable true to loop the video
     */
    setLoop(enable: boolean): void {
      this._renderer.setLoop(enable);
    }

    /**
     * Set the state muted of the video.
     * @param enable The new state.
     */
    mute(enable: boolean) {
      this._renderer.setMute(enable);
    }

    /**
     * Return the state muted of video object.
     * @returns Is the video muted?
     */
    isMuted(): boolean {
      return this._renderer.isMuted();
    }

    /**
     * Set the volume of the video object.
     * @param volume The new volume, between 0 and 100.
     */
    setVolume(volume: number): void {
      this._volume =
        gdjs.evtTools.common.clamp(
          gdjs.evtTools.common.normalize(volume, 0, 100),
          0,
          1
        ) * 100;
      this._renderer.updateVolume();
    }

    /**
     * Get the volume of the video object.
     * @returns The current video's volume, between 0 and 100.
     */
    getVolume(): number {
      return (
        gdjs.evtTools.common.normalize(this._renderer.getVolume(), 0, 1) * 100
      );
    }

    /**
     * Check if the video is being played.
     * @returns Is the video being played?
     */
    isPlayed(): boolean {
      return this._renderer.isPlayed();
    }

    /**
     * Check if the video is paused.
     * @returns Is the video being paused?
     */
    isPaused(): boolean {
      return !this._renderer.isPlayed();
    }

    /**
     * Check if the video is looping.
     * @returns Is the video looping?
     */
    isLooped(): boolean {
      return this._renderer.isLooped();
    }

    /**
     * Return the total time of the video.
     * @returns The duration of the video
     */
    getDuration(): number {
      return this._renderer.getDuration();
    }

    /**
     * Check if the video has ended.
     * @returns Has the video ended?
     */
    isEnded(): boolean {
      return this._renderer.isEnded();
    }

    /**
     * Set the new time of the video object.
     * @param time The new time.
     */
    setCurrentTime(time: float): void {
      this._renderer.setCurrentTime(time);
    }

    /**
     * Get the current time of the video object.
     * @returns The current time of the video
     */
    getCurrentTime(): float {
      return this._renderer.getCurrentTime();
    }

    /**
     * Set the new playback speed of the video object.
     * @param playbackSpeed The new playback speed.
     */
    setPlaybackSpeed(playbackSpeed: number): void {
      this._playbackSpeed = gdjs.evtTools.common.clamp(playbackSpeed, 0.5, 2);
      this._renderer.setPlaybackSpeed(this._playbackSpeed);
    }

    /**
     * Get the playback speed of the video object.
     * @returns The current playback speed of the video.
     */
    getPlaybackSpeed(): number {
      return this._renderer.getPlaybackSpeed();
    }
  }
  gdjs.registerObject('Video::VideoObject', gdjs.VideoRuntimeObject);

  /**
   * When a scene is unloaded, pause any video being run.
   * TODO: Investigate how to dispose the video source?
   */
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    // Manually find all the gdjs.VideoRuntimeObject living on the scene,
    // and pause them.
    const instances = runtimeScene.getAdhocListOfAllInstances();
    for (let i = 0; i < instances.length; ++i) {
      const obj = instances[i];
      if (obj instanceof gdjs.VideoRuntimeObject) {
        if (obj.isPlayed()) {
          obj.pause();
        }
      }
    }
  });

  /**
   * When a scene is paused, pause any video being run.
   */
  gdjs.registerRuntimeScenePausedCallback(function (runtimeScene) {
    // Manually find all the gdjs.VideoRuntimeObject living on the scene,
    // and pause them.
    const instances = runtimeScene.getAdhocListOfAllInstances();
    for (let i = 0; i < instances.length; ++i) {
      const obj = instances[i];
      if (obj instanceof gdjs.VideoRuntimeObject) {
        if (obj.isPlayed()) {
          obj.pause();
          obj._pausedAsScenePaused = true;
        }
      }
    }
  });

  // Flag it to be started again when scene is resumed.

  /**
   * When a scene is resumed, resume any video previously paused.
   */
  gdjs.registerRuntimeSceneResumedCallback(function (runtimeScene) {
    // Manually find all the gdjs.VideoRuntimeObject living on the scene,
    // and play them if they have been previously paused.
    const instances = runtimeScene.getAdhocListOfAllInstances();
    for (let i = 0; i < instances.length; ++i) {
      const obj = instances[i];
      if (obj instanceof gdjs.VideoRuntimeObject) {
        if (obj._pausedAsScenePaused) {
          obj.play();
        }
      }
    }
  });
}
