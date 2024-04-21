namespace gdjs {
  const logger = new gdjs.Logger('Video object PIXI renderer');

  /**
   * The PIXI.js renderer for the VideoRuntimeObject.
   */
  export class VideoRuntimeObjectPixiRenderer {
    _object: gdjs.VideoRuntimeObject;

    // Load (or reset) the video
    _pixiObject: any;
    _textureWasValid: boolean = false;

    /**
     * @param runtimeObject The object to render
     * @param instanceContainer The gdjs.RuntimeScene in which the object is
     */
    constructor(
      runtimeObject: gdjs.VideoRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._pixiObject = new PIXI.Sprite(
        instanceContainer
          .getGame()
          .getImageManager()
          .getPIXIVideoTexture(this._object._videoResource)
      );

      // Will be set to true when video texture is loaded.
      instanceContainer
        .getLayer('')
        .getRenderer()
        .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

      // Set the anchor in the center, so that the object rotates around
      // its center
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this.updatePosition();
      this.updateAngle();
      this.updateOpacity();
      this.updateVolume();
      this.updateLoop();
    }

    getRendererObject() {
      return this._pixiObject;
    }

    /**
     * To be called when the object is removed from the scene: will stop the video
     * (goes back to beginning).
     */
    onDestroy() {
      this.stop();
      this._pixiObject.destroy(false);
    }

    ensureUpToDate() {
      // Make sure that the video is repositioned after the texture was loaded
      // (as width and height will change).
      if (
        !this._textureWasValid &&
        this._pixiObject.texture &&
        this._pixiObject.texture.valid
      ) {
        this.updatePosition();
        this._textureWasValid = true;
      }
    }

    updatePosition(): void {
      this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._object.y + this._pixiObject.height / 2;
    }

    updateLoop(): void {
      this._pixiObject._texture.baseTexture.resource.source.loop = this._object._loop;
    }

    updateVolume(): void {
      this._pixiObject._texture.baseTexture.resource.source.volume =
        this._object._volume / 100;
    }

    updateAngle(): void {
      this._pixiObject.rotation = gdjs.toRad(this._object.angle);
    }

    updateOpacity(): void {
      this._pixiObject.alpha = this._object._opacity / 255;
    }

    getWidth(): float {
      return this._pixiObject.width;
    }

    getHeight(): float {
      return this._pixiObject.height;
    }

    /**
     * Set the rendered video width
     * @param width The new width, in pixels.
     */
    setWidth(width: float): void {
      this._pixiObject.width = width;

      // Position needs to be updated, as position in the center of the PIXI Sprite.
      this.updatePosition();
    }

    /**
     * Set the rendered video height
     * @param height The new height, in pixels.
     */
    setHeight(height: float): void {
      this._pixiObject.height = height;

      // Position needs to be updated, as position in the center of the PIXI Sprite.
      this.updatePosition();
    }

    /**
     * Get the internal HTMLVideoElement used for the video source.
     * @returns The video element, if any.
     */
    _getHTMLVideoElementSource(): HTMLVideoElement | null {
      if (
        !this._pixiObject.texture ||
        !this._pixiObject.texture.baseTexture.resource.source
      ) {
        return null;
      }
      const source = this._pixiObject.texture.baseTexture.resource.source;
      if (!(source instanceof HTMLVideoElement)) {
        return null;
      }
      return source;
    }

    /**
     * Start the video
     */
    play() {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      const promise = source.play();
      if (promise !== undefined) {
        // Autoplay started
        promise
          .then(() => {})
          .catch(() => {
            // Autoplay was prevented.
            logger.warn(
              'The video did not start because: video is invalid or no interaction with the game has been captured before (this is blocked by the navigator: https://goo.gl/xX8pDD)'
            );
          });
      }
    }

    /**
     * Pause the video
     */
    pause() {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      source.pause();
    }

    /**
     * Stops the video and comes back to first frame.
     */
    stop() {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      source.pause();
      source.currentTime = 0;
    }

    // Autoplay was prevented.
    /**
     * Set the loop on video in renderer
     * @param enable true to loop the video
     */
    setLoop(enable: boolean): void {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      source.loop = enable;
    }

    /**
     * Set or unset mute on the video.
     * @param enable true to mute
     */
    setMute(enable: boolean): void {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      this._pixiObject._texture.baseTexture.resource.source.muted = enable;
    }

    /**
     * Return true if the video is muted.
     */
    isMuted(): boolean {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return false;
      }
      return source.muted;
    }

    /**
     * Set the current time of the video.
     */
    setCurrentTime(number): void {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      source.currentTime = number;
    }

    /**
     * Set the volume of the video, between 0 and 1.
     * @param volume The new volume.
     */
    setVolume(volume: number): void {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      source.volume = volume;
    }

    /**
     * Get the volume on video, between 0 and 1.
     */
    getVolume() {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return 0;
      }
      return source.volume;
    }

    /**
     * Return true if the video is playing
     */
    isPlayed(): boolean {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return false;
      }
      return !source.paused && !source.ended;
    }

    /**
     * Return true if the video is looping
     */
    isLooped(): boolean {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return false;
      }
      return source.loop;
    }

    /**
     * Get the current time of the playback.
     */
    getCurrentTime(): float {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return 0;
      }
      return source.currentTime;
    }

    /**
     * Get the duration of the video.
     */
    getDuration() {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return 0;
      }
      return source.duration;
    }

    /**
     * Return true if the video has ended.
     */
    isEnded(): boolean {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return false;
      }
      return source.ended;
    }

    /**
     * Set the playback speed (1 = 100%)
     */
    setPlaybackSpeed(playbackRate): void {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return;
      }
      source.playbackRate = playbackRate;
    }

    /**
     * Return the playback speed (1 = 100%)
     */
    getPlaybackSpeed() {
      const source = this._getHTMLVideoElementSource();
      if (!source) {
        return 0;
      }
      return source.playbackRate;
    }
  }

  export const VideoRuntimeObjectRenderer = VideoRuntimeObjectPixiRenderer;
  export type VideoRuntimeObjectRenderer = VideoRuntimeObjectPixiRenderer;
}
