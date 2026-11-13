/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * @category Core Engine > Captures
   */
  export type CaptureOptions = {
    screenshots?: Array<{
      delayTimeInSeconds: number;
      signedUrl: string;
      publicUrl: string;
    }>;
    previewVideo?: {
      signedUrl: string;
      publicUrl: string;
      /** If true, a toolbar lets the user record the video, instead of recording it automatically. */
      isRecordedByUser: boolean;
    };
  };

  /**
   * Helper function to convert a base64 string to a Blob, which can be uploaded to a server.
   */
  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  };

  const previewVideoMimeType = 'video/mp4;codecs=avc1';
  const previewVideoDelayBeforeRecordingInMs = 5000;
  const previewVideoSegmentDurationInMs = 5000;
  const previewVideoMaxSegmentsCount = 12;
  const previewVideoMaxSize = 480;
  const previewVideoFramesPerSecond = 30;
  const previewVideoBitsPerSecond = 300000;
  const previewVideoSampleIntervalInMs = 500;
  const motionSampleWidth = 32;
  const motionSampleHeight = 18;
  // Above this difference in a color channel, a pixel is considered changed.
  const motionSampleMinChannelDifference = 8;

  /**
   * A stream of a downscaled copy of the game canvas, to be recorded as a preview video.
   * @category Core Engine > Captures
   */
  export type PreviewVideoStream = {
    videoCanvas: HTMLCanvasElement;
    stream: MediaStream;
    stop: () => void;
  };

  /**
   * Start copying the game canvas into a small canvas streamed for recording, or return
   * null if the browser can't record preview videos.
   * @category Core Engine > Captures
   */
  export const createPreviewVideoStream = (
    game: gdjs.RuntimeGame
  ): PreviewVideoStream | null => {
    if (
      typeof MediaRecorder === 'undefined' ||
      !MediaRecorder.isTypeSupported(previewVideoMimeType)
    ) {
      return null;
    }
    const gameCanvas = game.getRenderer().getCanvas();
    if (!gameCanvas || !gameCanvas.width || !gameCanvas.height) return null;

    const scale = Math.min(
      1,
      previewVideoMaxSize / Math.max(gameCanvas.width, gameCanvas.height)
    );
    const videoCanvas = document.createElement('canvas');
    // Video encoders need even dimensions.
    videoCanvas.width = Math.round((gameCanvas.width * scale) / 2) * 2;
    videoCanvas.height = Math.round((gameCanvas.height * scale) / 2) * 2;
    const videoContext = videoCanvas.getContext('2d');
    if (!videoContext) return null;

    // The game canvas keeps its drawing buffer, so it can be copied at any time.
    let isStreaming = true;
    let lastFrameTime = 0;
    const drawFrame = (time: number) => {
      if (!isStreaming) return;
      if (time - lastFrameTime >= 1000 / previewVideoFramesPerSecond) {
        lastFrameTime = time;
        videoContext.drawImage(
          gameCanvas,
          0,
          0,
          videoCanvas.width,
          videoCanvas.height
        );
      }
      requestAnimationFrame(drawFrame);
    };
    requestAnimationFrame(drawFrame);

    const stream = videoCanvas.captureStream(previewVideoFramesPerSecond);
    return {
      videoCanvas,
      stream,
      stop: () => {
        isStreaming = false;
        stream.getTracks().forEach((track) => track.stop());
      },
    };
  };

  /**
   * Record the stream: call `start` then `stop` on the recorder, the video is the
   * concatenation of the data given to `ondataavailable`.
   * @category Core Engine > Captures
   */
  export const createPreviewVideoRecorder = (
    previewVideoStream: PreviewVideoStream
  ): MediaRecorder =>
    new MediaRecorder(previewVideoStream.stream, {
      mimeType: previewVideoMimeType,
      videoBitsPerSecond: previewVideoBitsPerSecond,
    });

  /**
   * Upload a recorded preview video. Return true if it was uploaded.
   * @category Core Engine > Captures
   */
  export const uploadPreviewVideo = async (
    signedUrl: string,
    blob: Blob
  ): Promise<boolean> => {
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'video/mp4',
        },
      });
      if (!response.ok) {
        console.error(
          `Error while uploading the preview video: status ${response.status}.`
        );
        return false;
      }
      console.info(
        `[Preview video] Uploaded (${Math.round(blob.size / 1024)} KB).`
      );
      return true;
    } catch (error) {
      console.error('Error while uploading the preview video:', error);
      return false;
    }
  };

  const hasAnyPixelChanged = (
    pixels: Uint8ClampedArray,
    previousPixels: Uint8ClampedArray
  ): boolean => {
    for (let i = 0; i < pixels.length; i++) {
      if (
        Math.abs(pixels[i] - previousPixels[i]) >
        motionSampleMinChannelDifference
      )
        return true;
    }
    return false;
  };

  const isAnyGamepadUsed = (): boolean => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads)
      return false;
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;
      for (let j = 0; j < gamepad.buttons.length; j++) {
        if (gamepad.buttons[j].pressed) return true;
      }
      for (let j = 0; j < gamepad.axes.length; j++) {
        if (Math.abs(gamepad.axes[j]) > 0.5) return true;
      }
    }
    return false;
  };

  /**
   * Record a few seconds of the preview, keeping the segment where the game is the most
   * animated while the player is playing, to be shown in game listings.
   *
   * Segments are recorded one after the other from a downscaled copy of the game canvas.
   * A segment is kept only if the player is playing and the image keeps changing (which
   * excludes menus, pauses and loading screens). Among them, the biggest encoded segment
   * is the one with the most motion.
   * @category Core Engine > Captures
   */
  class PreviewVideoRecorder {
    _game: gdjs.RuntimeGame;
    _signedUrl: string;
    _bestScore = 0;
    _pendingUploadBlob: Blob | null = null;
    _isUploading = false;
    _lastCursorX = 0;
    _lastCursorY = 0;

    constructor(game: gdjs.RuntimeGame, signedUrl: string) {
      this._game = game;
      this._signedUrl = signedUrl;
    }

    async record(): Promise<void> {
      const previewVideoStream = gdjs.createPreviewVideoStream(this._game);
      if (!previewVideoStream) return;

      const motionSampleCanvas = document.createElement('canvas');
      motionSampleCanvas.width = motionSampleWidth;
      motionSampleCanvas.height = motionSampleHeight;
      const motionSampleContext = motionSampleCanvas.getContext('2d', {
        willReadFrequently: true,
      });
      if (!motionSampleContext) {
        previewVideoStream.stop();
        return;
      }
      const sampleMotionPixels = (): Uint8ClampedArray => {
        motionSampleContext.drawImage(
          previewVideoStream.videoCanvas,
          0,
          0,
          motionSampleWidth,
          motionSampleHeight
        );
        return motionSampleContext.getImageData(
          0,
          0,
          motionSampleWidth,
          motionSampleHeight
        ).data;
      };

      try {
        for (let i = 0; i < previewVideoMaxSegmentsCount; i++) {
          const segment = await this._recordSegment(
            previewVideoStream,
            sampleMotionPixels
          );
          if (segment.score > this._bestScore) {
            this._bestScore = segment.score;
            this._upload(segment.blob);
          }
        }
      } catch (error) {
        console.error('Error while recording the preview video:', error);
      } finally {
        previewVideoStream.stop();
      }
    }

    _recordSegment(
      previewVideoStream: PreviewVideoStream,
      sampleMotionPixels: () => Uint8ClampedArray
    ): Promise<{ blob: Blob; score: number }> {
      return new Promise((resolve) => {
        const recorder = gdjs.createPreviewVideoRecorder(previewVideoStream);
        const sceneStack = this._game.getSceneStack();
        const sceneAtStart = sceneStack.getCurrentScene();
        const chunks: Blob[] = [];
        let hasPlayerInput = false;
        let hasSceneChanged = false;
        let samplesCount = 0;
        let samplesWithMotionCount = 0;
        let previousPixels = sampleMotionPixels();

        const samplingInterval = setInterval(() => {
          if (this._hasPlayerInput()) hasPlayerInput = true;
          if (sceneStack.getCurrentScene() !== sceneAtStart)
            hasSceneChanged = true;
          const pixels = sampleMotionPixels();
          samplesCount++;
          if (hasAnyPixelChanged(pixels, previousPixels))
            samplesWithMotionCount++;
          previousPixels = pixels;
        }, previewVideoSampleIntervalInMs);

        recorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
        recorder.onstop = () => {
          clearInterval(samplingInterval);
          const blob = new Blob(chunks, { type: 'video/mp4' });
          const isGameplay =
            hasPlayerInput &&
            !hasSceneChanged &&
            samplesWithMotionCount * 2 >= samplesCount;
          resolve({
            blob,
            score: isGameplay ? blob.size : 0,
          });
        };

        recorder.start();
        setTimeout(() => recorder.stop(), previewVideoSegmentDurationInMs);
      });
    }

    _hasPlayerInput(): boolean {
      const inputManager = this._game.getInputManager();
      const cursorX = inputManager.getCursorX();
      const cursorY = inputManager.getCursorY();
      const hasCursorMoved =
        cursorX !== this._lastCursorX || cursorY !== this._lastCursorY;
      this._lastCursorX = cursorX;
      this._lastCursorY = cursorY;

      return (
        hasCursorMoved ||
        inputManager.anyKeyPressed() ||
        inputManager.anyMouseButtonPressed() ||
        inputManager.getAllTouchIdentifiers().length > 0 ||
        isAnyGamepadUsed()
      );
    }

    /** Upload the blob, or the latest one given while an upload is running. */
    async _upload(blob: Blob): Promise<void> {
      this._pendingUploadBlob = blob;
      if (this._isUploading) return;

      this._isUploading = true;
      while (this._pendingUploadBlob) {
        const blobToUpload = this._pendingUploadBlob;
        this._pendingUploadBlob = null;
        await gdjs.uploadPreviewVideo(this._signedUrl, blobToUpload);
      }
      this._isUploading = false;
    }
  }

  /**
   * Manage the captures (screenshots, videos, etc...) that need to be taken during the game.
   * @category Core Engine > Captures
   */
  export class CaptureManager {
    _game: gdjs.RuntimeGame;
    _captureOptions: CaptureOptions;

    constructor(game: gdjs.RuntimeGame, captureOptions: CaptureOptions) {
      this._game = game;
      this._captureOptions = captureOptions;
    }

    /**
     * To be called when the scene has started rendering.
     */
    setupCaptureOptions(isPreview: boolean): void {
      if (!isPreview) {
        return;
      }

      if (this._captureOptions.screenshots) {
        for (const screenshotCaptureOption of this._captureOptions
          .screenshots) {
          setTimeout(async () => {
            await this.takeAndUploadScreenshot(
              screenshotCaptureOption.signedUrl
            );
          }, screenshotCaptureOption.delayTimeInSeconds);
        }
      }

      const previewVideo = this._captureOptions.previewVideo;
      if (previewVideo && previewVideo.isRecordedByUser) {
        new gdjs.PreviewVideoRecordingToolbar(
          this._game,
          previewVideo.signedUrl
        ).render();
      } else if (previewVideo) {
        setTimeout(() => {
          new PreviewVideoRecorder(this._game, previewVideo.signedUrl).record();
        }, previewVideoDelayBeforeRecordingInMs);
      }
    }

    /**
     * Take a screenshot and upload it to the server.
     */
    async takeAndUploadScreenshot(signedUrl: string) {
      const canvas = this._game.getRenderer().getCanvas();
      if (canvas) {
        try {
          const base64Data = canvas.toDataURL('image/png');
          const blobData = base64ToBlob(base64Data);

          await fetch(signedUrl, {
            method: 'PUT',
            body: blobData,
            headers: {
              'Content-Type': 'image/png',
            },
          });
        } catch (error) {
          console.error('Error while uploading screenshot:', error);
        }
      }
    }
  }
}
