namespace gdjs {
  /**
   * The Cocos2D-JS renderer for the VideoRuntimeObject.
   *
   * The implementation is empty as the object is not supported in Cocos2D-JS for now.
   */
  export class VideoRuntimeObjectCocosRenderer {
    getRendererObject() {}

    /**
     * To be called when the object is removed from the scene: will pause the video.
     */
    onDestroy() {}

    ensureUpToDate() {}

    updatePosition(): void {}

    updateLoop(): void {}

    updateVolume(): void {}

    updateAngle(): void {}

    updateOpacity(): void {}

    getWidth(): float {
      return 0;
    }

    getHeight(): float {
      return 0;
    }

    /**
     * Set the rendered video width
     * @param width The new width, in pixels.
     */
    setWidth(width: float): void {}

    /**
     * Set the rendered video height
     * @param height The new height, in pixels.
     */
    setHeight(height: float): void {}

    /**
     * Start the video
     */
    play() {}

    /**
     * Pause the video
     */
    pause() {}

    /**
     * Set the loop on video in renderer
     * @param enable true to loop the video
     */
    setLoop(enable: boolean): void {}

    /**
     * Set or unset mute on the video.
     * @param enable true to mute
     */
    setMute(enable: boolean): void {}

    /**
     * Return true if the video is muted.
     */
    isMuted(): boolean {
      return true;
    }

    /**
     * Set the current time of the video.
     */
    setCurrentTime(number): void {}

    /**
     * Set the volume of the video, between 0 and 1.
     * @param volume The new volume.
     */
    setVolume(volume: number): void {}

    /**
     * Get the volume on video, between 0 and 1.
     */
    getVolume() {
      return 1;
    }

    /**
     * Return true if the video is playing
     */
    isPlayed(): boolean {
      return false;
    }

    /**
     * Return true if the video is looping
     */
    isLooped(): boolean {
      return false;
    }

    /**
     * Get the current time of the playback.
     */
    getCurrentTime(): float {
      return 0;
    }

    /**
     * Get the duration of the video.
     */
    getDuration() {
      return 0;
    }

    /**
     * Return true if the video has ended.
     */
    isEnded(): boolean {
      return false;
    }

    /**
     * Set the playback speed (1 = 100%)
     */
    setPlaybackSpeed(playbackRate): void {}

    /**
     * Return the playback speed (1 = 100%)
     */
    getPlaybackSpeed() {
      return 0;
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const VideoRuntimeObjectRenderer = VideoRuntimeObjectCocosRenderer;
}
