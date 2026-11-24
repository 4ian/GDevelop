namespace gdjs {
  type HChild = HTMLElement | string | null | false | undefined;

  /**
   * A minimal utility to define DOM elements.
   * Children can be arrays, and empty children (null, false) are skipped.
   * Also copied in InGameDebugger.tsx and InGameEditor.tsx.
   */
  function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: {
      style?: Partial<CSSStyleDeclaration>;
      onClick?: () => void;
    } | null,
    ...nodes: (HChild | HChild[])[]
  ): HTMLElement {
    const node = document.createElement(tag);
    const attributes = attrs || {};
    Object.keys(attributes).forEach((key) => {
      if (key === 'style') {
        for (const [styleName, value] of Object.entries(attributes.style!)) {
          node.style[styleName] = value;
        }
      } else if (key === 'onClick') {
        node.addEventListener('click', attributes[key]!);
      } else {
        node.setAttribute(key, '' + attributes[key]);
      }
    });

    for (const child of nodes) {
      for (const element of Array.isArray(child) ? child : [child]) {
        if (element) node.append(element);
      }
    }
    return node;
  }

  const maxRecordingDurationInMs = 5000;
  const minRecordingDurationInMs = 1000;
  const delayBeforeClosingInMs = 1500;

  const buttonStyle: Partial<CSSStyleDeclaration> = {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'system-ui',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };
  const styles: {
    container: Partial<CSSStyleDeclaration>;
    text: Partial<CSSStyleDeclaration>;
    buttons: Partial<CSSStyleDeclaration>;
    primaryButton: Partial<CSSStyleDeclaration>;
    recordButton: Partial<CSSStyleDeclaration>;
    secondaryButton: Partial<CSSStyleDeclaration>;
    video: Partial<CSSStyleDeclaration>;
  } = {
    container: {
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 14px',
      backgroundColor: '#1d1d26e6',
      borderRadius: '10px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      maxWidth: 'calc(100% - 20px)',
      pointerEvents: 'all',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    },
    text: {
      fontFamily: 'system-ui',
      fontSize: '14px',
      margin: '0',
      textAlign: 'center',
    },
    buttons: {
      display: 'flex',
      gap: '8px',
    },
    primaryButton: {
      ...buttonStyle,
      backgroundColor: '#7046ec',
      color: 'white',
    },
    recordButton: {
      ...buttonStyle,
      backgroundColor: '#e53935',
      color: 'white',
    },
    secondaryButton: {
      ...buttonStyle,
      backgroundColor: 'transparent',
      color: 'white',
      border: '1px solid #ffffff80',
    },
    video: {
      width: '320px',
      maxWidth: '100%',
      borderRadius: '6px',
      backgroundColor: 'black',
    },
  };

  type RecordingState =
    | { kind: 'ready' }
    | { kind: 'recording'; startTime: number }
    | { kind: 'review'; blob: Blob; videoUrl: string }
    | { kind: 'uploading' }
    | { kind: 'uploaded' }
    | { kind: 'upload-failed'; blob: Blob; videoUrl: string };

  /**
   * Displayed on top of a preview launched to record the preview video of the game:
   * lets the user record a few seconds of gameplay, review them, then upload them.
   * The preview is closed once uploaded, so that the editor saves the video for the game.
   * @category Core Engine > Captures
   */
  export class PreviewVideoRecordingToolbar {
    _game: gdjs.RuntimeGame;
    _signedUrl: string;
    _state: RecordingState = { kind: 'ready' };
    _element: HTMLElement | null = null;
    _recorder: MediaRecorder | null = null;
    _recordingTimer: ReturnType<typeof setInterval> | null = null;

    constructor(game: gdjs.RuntimeGame, signedUrl: string) {
      this._game = game;
      this._signedUrl = signedUrl;
    }

    _setState(state: RecordingState) {
      this._state = state;
      this.render();
    }

    _startRecording() {
      const previewVideoStream = gdjs.createPreviewVideoStream(this._game);
      if (!previewVideoStream) return;
      const recorder = gdjs.createPreviewVideoRecorder(previewVideoStream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        previewVideoStream.stop();
        // Paused while the video is reviewed, so the player doesn't miss anything.
        this._game.pause(true);
        const blob = new Blob(chunks, { type: 'video/mp4' });
        this._setState({
          kind: 'review',
          blob,
          videoUrl: URL.createObjectURL(blob),
        });
      };
      this._recorder = recorder;
      recorder.start();

      const startTime = Date.now();
      this._setState({ kind: 'recording', startTime });
      // Refresh the elapsed time, and stop at the maximum duration.
      this._recordingTimer = setInterval(() => {
        if (Date.now() - startTime >= maxRecordingDurationInMs) {
          this._stopRecording();
        } else {
          this.render();
        }
      }, 250);
    }

    _stopRecording() {
      if (this._recordingTimer) clearInterval(this._recordingTimer);
      this._recordingTimer = null;
      if (this._recorder && this._recorder.state === 'recording')
        this._recorder.stop();
      this._recorder = null;
    }

    _recordAgain(videoUrl: string) {
      URL.revokeObjectURL(videoUrl);
      this._game.pause(false);
      this._setState({ kind: 'ready' });
    }

    async _upload(blob: Blob, videoUrl: string) {
      this._setState({ kind: 'uploading' });
      const isUploaded = await gdjs.uploadPreviewVideo(this._signedUrl, blob);
      if (!isUploaded) {
        this._setState({ kind: 'upload-failed', blob, videoUrl });
        return;
      }
      URL.revokeObjectURL(videoUrl);
      this._setState({ kind: 'uploaded' });
      setTimeout(() => window.close(), delayBeforeClosingInMs);
    }

    _renderReviewVideo(videoUrl: string): HTMLElement {
      const video = (<video style={styles.video} />) as HTMLVideoElement;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.src = videoUrl;
      return video;
    }

    _renderContent(): HTMLElement[] {
      const state = this._state;
      if (state.kind === 'ready') {
        return [
          <p style={styles.text}>
            {`Record up to ${
              maxRecordingDurationInMs / 1000
            } seconds of gameplay, shown to players on gd.games.`}
          </p>,
          <div style={styles.buttons}>
            <button
              style={styles.recordButton}
              onClick={() => this._startRecording()}
            >
              ● Record
            </button>
          </div>,
        ];
      }
      if (state.kind === 'recording') {
        const elapsedTimeInMs = Date.now() - state.startTime;
        return [
          <p style={styles.text}>
            {`Recording... ${Math.floor(elapsedTimeInMs / 1000)}s / ${
              maxRecordingDurationInMs / 1000
            }s`}
          </p>,
          <div style={styles.buttons}>
            {elapsedTimeInMs >= minRecordingDurationInMs && (
              <button
                style={styles.recordButton}
                onClick={() => this._stopRecording()}
              >
                ■ Stop
              </button>
            )}
          </div>,
        ];
      }
      if (state.kind === 'review' || state.kind === 'upload-failed') {
        return [
          this._renderReviewVideo(state.videoUrl),
          state.kind === 'upload-failed' && (
            <p style={styles.text}>
              The video could not be uploaded. Verify your internet connection
              and try again.
            </p>
          ),
          <div style={styles.buttons}>
            <button
              style={styles.secondaryButton}
              onClick={() => this._recordAgain(state.videoUrl)}
            >
              Record again
            </button>
            <button
              style={styles.primaryButton}
              onClick={() => this._upload(state.blob, state.videoUrl)}
            >
              {state.kind === 'upload-failed' ? 'Retry' : 'Use this video'}
            </button>
          </div>,
        ].filter(Boolean) as HTMLElement[];
      }
      if (state.kind === 'uploading') {
        return [<p style={styles.text}>Uploading the video...</p>];
      }
      return [<p style={styles.text}>Video saved. Closing the preview...</p>];
    }

    render() {
      const domElementContainer = this._game
        .getRenderer()
        .getDomElementContainer();
      if (!domElementContainer) return;

      const newElement = (
        <div style={styles.container}>{this._renderContent()}</div>
      );
      if (this._element) domElementContainer.removeChild(this._element);
      this._element = newElement;
      domElementContainer.appendChild(newElement);
    }
  }
}
