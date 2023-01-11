namespace gdjs {
  const logger = new gdjs.Logger('Watermark');

  export namespace watermark {
    export class RuntimeWatermark {
      _gameRenderer: RuntimeGameRenderer;
      _isDevEnvironment: boolean;

      // Configuration
      _placement:
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'bottom'
        | 'top'
        | 'right'
        | 'left';
      _showAtStartup: boolean;
      _authorUsername: string | undefined;

      // Dom elements
      _watermarkContainerElement: HTMLDivElement | null = null;
      _watermarkBackgroundElement: HTMLDivElement | null = null;
      _svgElement: SVGElement | null = null;
      _usernameTextElement: HTMLSpanElement | null = null;
      _madeWithTextElement: HTMLSpanElement | null = null;

      _resizeObserver: ResizeObserver | null = null;

      // Durations in seconds
      _displayDuration: number = 20;
      _changeTextDelay: number = 7;
      _fadeInDelayAfterGameLoaded: number = 1;
      _fadeDuration: number = 0.3;

      // Timeout registration
      _fadeOutTimeout: NodeJS.Timeout | null = null;
      _hideTimeout: NodeJS.Timeout | null = null;
      _fadeOutFirstTextTimeout: NodeJS.Timeout | null = null;
      _fadeInSecondTextTimeout: NodeJS.Timeout | null = null;

      // Sizes
      _textFontSize: number = 14;
      _logoWidth: number = 56;
      _logoHeight: number = 45;
      _backgroundHeight: number = 150;
      _margin: number = 10;

      constructor(
        game: RuntimeGame,
        authorUsername: string | undefined,
        watermarkData: WatermarkData
      ) {
        this._gameRenderer = game.getRenderer();
        this._authorUsername = authorUsername;
        this._placement = watermarkData.placement;
        this._showAtStartup = watermarkData.showWatermark;
        this._isDevEnvironment = game.isUsingGDevelopDevelopmentEnvironment();
        this.addStyle();
      }

      displayAtStartup() {
        if (this._showAtStartup) {
          this.display();
        }
      }

      display() {
        logger.info('display');
        const gameContainer = this._gameRenderer.getDomElementContainer();
        if (gameContainer) {
          this.addWatermarkToGameContainer(gameContainer);
          this._resizeObserver = new ResizeObserver(() => {
            const gameContainerRectangle = gameContainer.getBoundingClientRect();
            const gameViewportLargestDimension = Math.max(
              gameContainerRectangle.height,
              gameContainerRectangle.width
            );
            this.onResizeGameContainer(
              gameViewportLargestDimension,
              gameContainerRectangle.height
            );
          });
          this._resizeObserver.observe(gameContainer);
        }
      }

      private updateFontSize(dimension: number) {
        this._textFontSize = 0.015 * dimension;
      }
      private updateLogoSize(dimension: number) {
        this._logoWidth = 0.04 * dimension;
        this._logoHeight = Math.round((45 / 56) * this._logoWidth);
      }
      private updateBackground(height: number) {
        this._backgroundHeight = 0.13 * height;
      }
      private updateMargin(height: number) {
        this._margin = 0.025 * height;
      }

      private onResizeGameContainer(
        newLargestDimension: number,
        height: number
      ) {
        this.updateFontSize(newLargestDimension);
        if (this._madeWithTextElement) {
          this._madeWithTextElement.style.fontSize = `${this._textFontSize}px`;
        }
        if (this._usernameTextElement) {
          this._usernameTextElement.style.fontSize = `${this._textFontSize}px`;
        }
        this.updateLogoSize(newLargestDimension);
        if (this._svgElement) {
          this._svgElement.setAttribute('height', this._logoHeight.toString());
          this._svgElement.setAttribute('width', this._logoWidth.toString());
        }
        this.updateBackground(height);
        if (this._watermarkBackgroundElement) {
          this._watermarkBackgroundElement.style.height = `${this._backgroundHeight}px`;
        }
        this.updateMargin(height);
        if (this._watermarkContainerElement) {
          this.updateElementMargins(this._watermarkContainerElement);
        }
      }

      private addWatermarkToGameContainer(container: HTMLElement) {
        const gameContainerRectangle = container.getBoundingClientRect();
        const gameViewportLargestDimension = Math.max(
          gameContainerRectangle.height,
          gameContainerRectangle.width
        );
        this.updateFontSize(gameViewportLargestDimension);
        this.updateLogoSize(gameViewportLargestDimension);
        this.updateBackground(gameContainerRectangle.height);

        this._watermarkContainerElement = this.createDivContainer();
        this.createBackground();
        const textContainer = document.createElement('div');

        this.generateSVGLogo(gameViewportLargestDimension);
        this.createMadeWithTextElement();
        this.createUsernameTextElement();
        if (this._svgElement)
          this._watermarkContainerElement.appendChild(this._svgElement);
        if (this._madeWithTextElement)
          textContainer.appendChild(this._madeWithTextElement);
        if (this._usernameTextElement)
          textContainer.appendChild(this._usernameTextElement);
        this._watermarkContainerElement.appendChild(textContainer);
        addTouchAndClickEventListeners(
          this._watermarkContainerElement,
          this.openCreatorProfile.bind(this)
        );
        if (this._watermarkBackgroundElement)
          container.appendChild(this._watermarkBackgroundElement);

        container.appendChild(this._watermarkContainerElement);

        this.setupAnimations();
      }

      private createBackground() {
        this._watermarkBackgroundElement = document.createElement('div');
        this._watermarkBackgroundElement.setAttribute(
          'id',
          'watermark-background'
        );
        this._watermarkBackgroundElement.style.height = `${this._backgroundHeight}px`;
        this._watermarkBackgroundElement.style.opacity = '0';
        if (this._placement.startsWith('top')) {
          this._watermarkBackgroundElement.style.top = '0';
          this._watermarkBackgroundElement.style.backgroundImage =
            'linear-gradient(180deg, rgba(38, 38, 38, .6) 0%, rgba(38, 38, 38, 0) 100% )';
        } else {
          this._watermarkBackgroundElement.style.bottom = '0';
          this._watermarkBackgroundElement.style.backgroundImage =
            'linear-gradient(0deg, rgba(38, 38, 38, .6) 0%, rgba(38, 38, 38, 0) 100% )';
        }
      }

      private setupAnimations() {
        // Necessary to trigger fade in transition
        requestAnimationFrame(() => {
          // Display the watermark
          setTimeout(() => {
            if (
              !this._watermarkContainerElement ||
              !this._watermarkBackgroundElement
            )
              return;
            this._watermarkContainerElement.style.opacity = '1';
            this._watermarkBackgroundElement.style.opacity = '1';
            this._watermarkContainerElement.style.pointerEvents = 'all';
            if (this._svgElement) this._svgElement.classList.add('spinning');
          }, this._fadeInDelayAfterGameLoaded * 1000);
        });

        // Hide the watermark
        this._fadeOutTimeout = setTimeout(() => {
          if (
            !this._watermarkContainerElement ||
            !this._watermarkBackgroundElement
          )
            return;
          this._watermarkContainerElement.style.opacity = '0';
          this._watermarkBackgroundElement.style.opacity = '0';
          this._hideTimeout = setTimeout(
            () => {
              if (
                !this._watermarkContainerElement ||
                !this._watermarkBackgroundElement
              )
                return;
              this._watermarkContainerElement.style.pointerEvents = 'none';
              this._watermarkContainerElement.style.display = 'none';
              this._watermarkBackgroundElement.style.display = 'none';
              if (this._resizeObserver) this._resizeObserver.disconnect();
            },
            // Deactivate all interaction possibilities with watermark at
            // the end of the animation to make sure it doesn't deactivate too early
            this._fadeDuration * 1000
          );
        }, (this._fadeInDelayAfterGameLoaded + this._displayDuration) * 1000);

        // Change text below watermark
        this._fadeOutFirstTextTimeout = setTimeout(() => {
          const { _madeWithTextElement, _usernameTextElement } = this;
          if (!_madeWithTextElement) return;

          // Do not hide madeWith text if there is no author username to display.
          if (_usernameTextElement) {
            _madeWithTextElement.style.opacity = '0';
            this._fadeInSecondTextTimeout = setTimeout(() => {
              _usernameTextElement.style.lineHeight = 'normal';
              _usernameTextElement.style.opacity = '1';
              _madeWithTextElement.style.lineHeight = '0';
            }, this._fadeDuration * 1000);
          }
        }, (this._fadeInDelayAfterGameLoaded + this._changeTextDelay) * 1000);
      }

      private openCreatorProfile() {
        let targetUrl = `https://liluo.io/${this._authorUsername}`;
        if (this._isDevEnvironment) targetUrl += '?dev=true';
        this._gameRenderer.openURL(targetUrl);
      }

      private createMadeWithTextElement() {
        this._madeWithTextElement = document.createElement('span');
        this._madeWithTextElement.innerText = 'Made with GDevelop';
        this._madeWithTextElement.style.fontSize = `${this._textFontSize}px`;
      }

      private createUsernameTextElement() {
        if (!this._authorUsername) return;
        this._usernameTextElement = document.createElement('span');
        this._usernameTextElement.innerText = `@${this._authorUsername}`;
        this._usernameTextElement.style.fontSize = `${this._textFontSize}px`;
        this._usernameTextElement.style.opacity = '0';
        this._usernameTextElement.style.lineHeight = '0';
      }

      private updateElementMargins(element: HTMLElement) {
        switch (this._placement) {
          case 'top-left':
            element.style.top = `${this._margin}px`;
            element.style.left = `${this._margin}px`;
            break;
          case 'top-right':
            element.style.top = `${this._margin}px`;
            element.style.right = `${this._margin}px`;
            break;
          case 'bottom-left':
            element.style.bottom = `${this._margin}px`;
            element.style.left = `${this._margin}px`;
            break;
          case 'bottom-right':
            element.style.bottom = `${this._margin}px`;
            element.style.right = `${this._margin}px`;
            break;
          case 'top':
            element.style.top = `${this._margin}px`;
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, 0)';
            break;
          case 'left':
            element.style.left = `${this._margin}px`;
            element.style.top = '50%';
            element.style.transform = 'translate(0, -50%)';
            break;
          case 'right':
            element.style.right = `${this._margin}px`;
            element.style.top = '50%';
            element.style.transform = 'translate(0, -50%)';
            break;
          case 'bottom':
          default:
            element.style.bottom = `${this._margin}px`;
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, 0)';
            break;
        }
      }

      private createDivContainer() {
        const divContainer = document.createElement('div');
        divContainer.setAttribute('id', 'watermark');

        divContainer.style.opacity = '0';
        this.updateElementMargins(divContainer);
        return divContainer;
      }

      /**
       * @param {number} dimension
       * @returns
       */
      private generateSVGLogo(dimension) {
        this._svgElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );

        this.updateLogoSize(dimension);
        this._svgElement.setAttribute('height', this._logoHeight.toString());
        this._svgElement.setAttribute('width', this._logoWidth.toString());
        this._svgElement.setAttribute('viewBox', '-2 -2 59 48');
        this._svgElement.setAttribute('fill', 'none');
        const path1 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        const path2 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        path1.setAttribute(
          'd',
          'M29.3447 33C25.1061 33 21.0255 31.8475 17.4207 29.3381C14.9081 27.5897 12 23.6418 12 16.9488C12 4.53178 18.3074 0 30.9827 0H53.8027L56 7.07232H32.7217C24.3558 7.07232 19.3813 7.72835 19.3813 16.9488C19.3813 19.9944 20.2354 22.1618 21.9933 23.574C24.9642 25.9612 30.7388 26.0628 34.2673 25.7208C34.2673 25.7208 35.715 21.0394 35.9534 20.2794C36.2327 19.3888 36.1104 19.1763 35.2392 19.1763C33.9808 19.1763 31.7185 19.1763 29.3175 19.1763C27.6349 19.1763 25.9818 18.3247 25.9818 16.2793C25.9818 14.3039 27.5198 13.1573 29.6281 13.1573C33.2786 13.1573 40.7969 13.1573 42.2041 13.1573C44.0489 13.1573 45.9315 13.4233 44.971 16.3601L39.8842 31.8734C39.8845 31.8738 35.7287 33 29.3447 33Z'
        );
        path2.setAttribute(
          'd',
          'M43.3039 35.3278C40.7894 37.1212 37.0648 38.1124 30.7449 38.1124C19.852 38.1124 11.8797 34.1251 8.62927 26.3952C7.0925 22.7415 7.24041 18.6005 7.24041 13H0.00129513C0.00129513 18.9056 -0.0984386 23.5361 1.45249 27.8011C5.51933 38.989 15.992 45 30.0606 45C43.6783 45 49.3213 41.0443 53 35.3278H43.3039Z'
        );
        this._svgElement.appendChild(path1);
        this._svgElement.appendChild(path2);
      }

      private addStyle() {
        const styleElement = document.createElement('style');
        const hoverTransitionDuration = 0.2;
        styleElement.innerHTML = `
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          5% {
            transform: rotate(-10deg);
            animation-timing-function: ease-out;
          }

          17% {
            transform: rotate(370deg);
            animation-timing-function: ease-in-out;
          }

          20% {
            transform: rotate(360deg);
            animation-timing-function: ease-in-out;
          }

          100% {
            transform: rotate(360deg);
          }
        }

        #watermark-background {
          position: absolute;
          pointer-events: none;
          width: 100%;
          transition-property: opacity;
          transition-duration: ${this._fadeDuration}s;
        }

        #watermark {
          position: absolute;
          pointer-events: none;
          display: flex;
          flex-direction: row;
          cursor: pointer;
          align-items: center;
          transition-property: opacity;
          transition-duration: ${this._fadeDuration}s;
          transition-timing-function: ease-out;
        }

        #watermark > div {
          display: flex;
          flex-direction: column;
          margin-left: 5px;
        }

        #watermark span {
          color: white;
          font-family: 'Tahoma', 'Gill sans', 'Helvetica', 'Arial';
          font-size: ${this._textFontSize}px;
          transition: opacity ${this._fadeDuration}s, text-decoration ${hoverTransitionDuration}s;
        }

        #watermark svg.spinning {
          animation-name: spin;
          animation-direction: normal;
          animation-duration: 5s;
          animation-iteration-count: 3;
          animation-delay: 1.5s;
        }

        #watermark svg path {
          fill: white;
        }

        @media (hover: hover) {
          #watermark span {
            text-decoration: underline solid transparent;
          }
          #watermark:hover span {
            text-decoration: underline solid white;
          }
        }
        `;
        document.head.appendChild(styleElement);
      }
    }

    /**
     * Helper to add event listeners on a pressable/clickable element
     * to work on both desktop and mobile.
     */
    export const addTouchAndClickEventListeners = function (
      element: HTMLElement,
      action: () => void
    ) {
      // Touch start event listener for mobile.
      element.addEventListener('touchstart', (event) => {
        action();
      });
      // Click event listener for desktop.
      element.addEventListener('click', (event) => {
        action();
      });
    };
  }
}
