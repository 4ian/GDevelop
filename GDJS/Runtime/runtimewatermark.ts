namespace gdjs {
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
        | 'top';
      _showAtStartup: boolean;
      _authorUsername: string | undefined;
      _gameId: string | undefined;

      // Dom elements
      _linkElement: HTMLAnchorElement | null = null;
      _containerElement: HTMLDivElement | null = null;
      _backgroundElement: HTMLDivElement | null = null;
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
        authorUsernames: Array<string>,
        watermarkData: WatermarkData
      ) {
        this._gameId = game._data.properties.projectUuid;
        this._gameRenderer = game.getRenderer();
        this._authorUsername = authorUsernames[0];
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
        const gameContainer = this._gameRenderer.getDomElementContainer();
        if (gameContainer) {
          this.addWatermarkToGameContainer(gameContainer);
          this._resizeObserver = new ResizeObserver(() => {
            const gameContainerRectangle = gameContainer.getBoundingClientRect();
            this.onResizeGameContainer(gameContainerRectangle.height);
          });
          this._resizeObserver.observe(gameContainer);
        }
      }

      private updateFontSize(height: number) {
        this._textFontSize = Math.max(0.025 * height, 12);
      }
      private updateLogoSize(height: number) {
        this._logoWidth = Math.max(0.06 * height, 25);
        this._logoHeight = Math.round((45 / 56) * this._logoWidth);
      }
      private updateBackgroundHeight(height: number) {
        this._backgroundHeight = Math.max(0.13 * height, 45);
      }
      private updateMargin(height: number) {
        this._margin = Math.max(0.025 * height, 8);
      }

      private onResizeGameContainer(height: number) {
        this.updateFontSize(height);
        if (this._madeWithTextElement) {
          this._madeWithTextElement.style.fontSize = `${this._textFontSize}px`;
        }
        if (this._usernameTextElement) {
          this._usernameTextElement.style.fontSize = `${this._textFontSize}px`;
        }
        this.updateLogoSize(height);
        if (this._svgElement) {
          this._svgElement.setAttribute('height', this._logoHeight.toString());
          this._svgElement.setAttribute('width', this._logoWidth.toString());
        }
        this.updateBackgroundHeight(height);
        if (this._backgroundElement) {
          this._backgroundElement.style.height = `${this._backgroundHeight}px`;
        }
        this.updateMargin(height);
        if (this._linkElement) {
          this.updateElementMargins(this._linkElement);
        }
      }

      private addWatermarkToGameContainer(container: HTMLElement) {
        const gameContainerRectangle = container.getBoundingClientRect();
        this.updateFontSize(gameContainerRectangle.height);
        this.updateLogoSize(gameContainerRectangle.height);
        this.updateBackgroundHeight(gameContainerRectangle.height);

        this._containerElement = this.createDivContainer();
        this.createBackground();
        const textContainer = document.createElement('div');

        this.generateSVGLogo(gameContainerRectangle.height);
        this.createMadeWithTextElement();
        this.createUsernameTextElement();

        this._linkElement = this.createLinkElement();

        if (this._svgElement)
          this._containerElement.appendChild(this._svgElement);
        if (this._madeWithTextElement)
          textContainer.appendChild(this._madeWithTextElement);
        if (this._usernameTextElement)
          textContainer.appendChild(this._usernameTextElement);
        this._containerElement.appendChild(textContainer);
        if (this._backgroundElement)
          container.appendChild(this._backgroundElement);

        this._linkElement.append(this._containerElement);
        container.appendChild(this._linkElement);

        this.setupAnimations();
      }

      private createBackground() {
        this._backgroundElement = document.createElement('div');
        this._backgroundElement.setAttribute('id', 'watermark-background');
        this._backgroundElement.style.height = `${this._backgroundHeight}px`;
        this._backgroundElement.style.opacity = '0';
        if (this._placement.startsWith('top')) {
          this._backgroundElement.style.top = '0';
          this._backgroundElement.style.backgroundImage =
            'linear-gradient(180deg, rgba(38, 38, 38, .6) 0%, rgba(38, 38, 38, 0) 100% )';
        } else {
          this._backgroundElement.style.bottom = '0';
          this._backgroundElement.style.backgroundImage =
            'linear-gradient(0deg, rgba(38, 38, 38, .6) 0%, rgba(38, 38, 38, 0) 100% )';
        }
      }

      private setupAnimations() {
        // Necessary to trigger fade in transition
        requestAnimationFrame(() => {
          // Display the watermark
          setTimeout(() => {
            if (
              !this._containerElement ||
              !this._backgroundElement ||
              !this._linkElement
            )
              return;
            this._containerElement.style.opacity = '1';
            this._backgroundElement.style.opacity = '1';
            this._linkElement.style.pointerEvents = 'all';
            if (this._svgElement) this._svgElement.classList.add('spinning');
          }, this._fadeInDelayAfterGameLoaded * 1000);
        });

        // Hide the watermark
        this._fadeOutTimeout = setTimeout(() => {
          if (!this._containerElement || !this._backgroundElement) {
            return;
          }
          this._containerElement.style.opacity = '0';
          this._backgroundElement.style.opacity = '0';

          // Completely remove the watermark once the fade out duration has ended.
          this._hideTimeout = setTimeout(
            () => {
              if (
                !this._containerElement ||
                !this._backgroundElement ||
                !this._linkElement
              )
                return;
              this._linkElement.style.pointerEvents = 'none';
              this._containerElement.style.display = 'none';
              this._backgroundElement.style.display = 'none';
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
          case 'bottom':
          default:
            element.style.bottom = `${this._margin}px`;
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, 0)';
            break;
        }
      }

      private createLinkElement(): HTMLAnchorElement {
        const linkElement = document.createElement('a');
        linkElement.id = 'watermark-link';

        let targetUrl = this._authorUsername
          ? new URL(`https://gd.games/${this._authorUsername}`)
          : new URL('https://gd.games');

        if (this._isDevEnvironment) {
          targetUrl.searchParams.set('dev', 'true');
        } else {
          targetUrl.searchParams.set('utm_source', 'gdevelop-game');
          targetUrl.searchParams.set('utm_medium', 'game-watermark');

          if (this._gameId) {
            targetUrl.searchParams.set('utm_campaign', this._gameId);
          }
        }
        linkElement.href = targetUrl.href;
        linkElement.target = '_blank';

        this.updateElementMargins(linkElement);

        return linkElement;
      }

      private createDivContainer(): HTMLDivElement {
        const divContainer = document.createElement('div');
        divContainer.setAttribute('id', 'watermark');

        divContainer.style.opacity = '0';
        return divContainer;
      }

      private generateSVGLogo(height: number) {
        this._svgElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );

        this.updateLogoSize(height);
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

        #watermark-link {
          all: unset;
          position: absolute;
          cursor: pointer;
          pointer-events: none;
          user-select: none;

          /* For Safari */
          -webkit-user-select: none;
        }

        #watermark {
          display: flex;
          flex-direction: row;
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
          transition: opacity;
          transition-duration: ${this._fadeDuration}s;

          /* For Safari */
          -webkit-transition: opacity;
          -webkit-transition-duration: ${this._fadeDuration}s;
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
            text-decoration: underline;
            text-decoration-style: solid;
            text-decoration-color: transparent;
          }

          #watermark:hover span {
            text-decoration-color: white;

            /* For Safari */
            -webkit-text-decoration-color: white;
          }
        }
        `;
        document.head.appendChild(styleElement);
      }
    }
  }
}
