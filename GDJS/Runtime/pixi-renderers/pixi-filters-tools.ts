namespace gdjs {
  const logger = new gdjs.Logger('Filters');

  /**
   * @category Core Engine > Effects
   */
  export namespace PixiFiltersTools {
    export const clampValue = function (value, min, max) {
      return Math.max(min, Math.min(max, value));
    };

    export const clampKernelSize = function (value, min, max) {
      const len = Math.round((max - min) / 2 + 1);
      const arr = new Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = min + 2 * i;
      }
      return arr.indexOf(value) !== -1 ? value : min;
    };

    /**
     * Wrap a Three.js shader so that its output colors are never negative.
     * Negative colors become NaN in the sRGB conversion done by the output pass,
     * which is rendered as garbage by some mobile GPUs (e.g. Mali).
     */
    export const clampThreeShaderOutput = <
      T extends { fragmentShader: string },
    >(
      shader: T
    ): T => ({
      ...shader,
      fragmentShader:
        shader.fragmentShader.replace(
          /void\s+main\s*\(\s*\)/,
          'void unclampedMain()'
        ) +
        '\nvoid main() {\n' +
        '  unclampedMain();\n' +
        '  gl_FragColor.rgb = max(gl_FragColor.rgb, 0.0);\n' +
        '}\n',
    });

    /**
     * Compile the fragment shader of a filter in high precision, when the device
     * supports it.
     *
     * PixiJS uses medium precision by default on non-Apple devices, which is
     * 16-bit on most mobile GPUs. The random function used for the noise of
     * filters like `CRTFilter` and `OldFilmFilter` then returns almost always
     * the same value, and the noise disappears.
     */
    export const useHighPrecisionFragmentShader = (filter: PIXI.Filter) => {
      const removePrecisionAndShaderName = (source: string) =>
        source
          .replace(/precision \w+ float;\n/g, '')
          .replace(/#define SHADER_NAME .*\n/, '');
      const { vertexSrc, fragmentSrc } = filter.program;
      // PixiJS falls back to medium precision if high precision is not supported.
      const defaultFragmentPrecision = PIXI.Program.defaultFragmentPrecision;
      PIXI.Program.defaultFragmentPrecision = PIXI.PRECISION.HIGH;
      try {
        filter.program = PIXI.Program.from(
          removePrecisionAndShaderName(vertexSrc),
          removePrecisionAndShaderName(fragmentSrc)
        );
      } finally {
        PIXI.Program.defaultFragmentPrecision = defaultFragmentPrecision;
      }
    };

    /**
     * Make a filter only change the pixels inside the bounds of what it is
     * applied on, and use these bounds as its dimensions (for vignetting,
     * lines...).
     *
     * The effects of a scene layer are applied on the whole screen (see
     * `LayerPixiRenderer._updateFilterArea`), but some filters (like `CRTFilter`
     * and `OldFilmFilter`) add noise to every pixel, including transparent ones.
     * Without this, a layer that is empty or has its content only on a part of
     * the screen would show this noise on the whole screen.
     *
     * The fragment shader must use `vTextureCoord * filterArea.xy` for the pixel
     * coordinates and the `dimensions` uniform for the size of the filtered area.
     */
    export const applyFilterOnlyOnContentBounds = (filter: PIXI.Filter) => {
      const removeShaderName = (source: string) =>
        source.replace(/#define SHADER_NAME .*\n/, '');
      const { vertexSrc, fragmentSrc } = filter.program;
      filter.program = PIXI.Program.from(
        removeShaderName(vertexSrc),
        removeShaderName(fragmentSrc)
          .replace(
            /vTextureCoord(\.xy)? \* filterArea\.xy/g,
            '(vTextureCoord * filterArea.xy - contentFrame.xy)'
          )
          .replace(
            'uniform vec2 dimensions;',
            'uniform vec4 contentFrame;\n#define dimensions contentFrame.zw'
          )
          .replace(
            'gl_FragColor = texture2D(uSampler, vTextureCoord);',
            `gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec2 contentCoord = vTextureCoord * filterArea.xy - contentFrame.xy;
    if (
      contentCoord.x < 0.0 || contentCoord.y < 0.0 ||
      contentCoord.x >= contentFrame.z || contentCoord.y >= contentFrame.w
    ) {
      return;
    }`
          )
      );

      const contentFrame = new Float32Array(4);
      filter.uniforms.contentFrame = contentFrame;
      const contentBounds = new PIXI.Rectangle();
      const originalApply = filter.apply.bind(filter);
      filter.apply = (
        filterManager,
        input,
        output,
        clearMode,
        currentState
      ) => {
        if (currentState) {
          const { sourceFrame, target, filters } = currentState;
          // Same as the area that PixiJS computes when the filter area is not set.
          contentBounds.copyFrom(target.getBounds(true));
          if (contentBounds.width > 0 && contentBounds.height > 0) {
            let padding = 0;
            for (const filter of filters) padding += filter.padding;
            contentBounds.pad(padding);
            contentBounds.fit(sourceFrame);
          }
          contentFrame[0] = contentBounds.x - sourceFrame.x;
          contentFrame[1] = contentBounds.y - sourceFrame.y;
          contentFrame[2] = contentBounds.width;
          contentFrame[3] = contentBounds.height;
        } else {
          contentFrame[0] = 0;
          contentFrame[1] = 0;
          contentFrame[2] = input.filterFrame?.width || 0;
          contentFrame[3] = input.filterFrame?.height || 0;
        }
        originalApply(filterManager, input, output, clearMode, currentState);
      };
    };

    const _filterCreators: {
      [filterName: string]: FilterCreator;
    } = {};

    /**
     * Return the creator for the filter with the given name, if any.
     * @param filterName The name of the filter to get
     * @return The filter creator, if any (null otherwise).
     * @category Core Engine > Effects
     */
    export const getFilterCreator = function (
      filterName: string
    ): FilterCreator | null {
      if (_filterCreators.hasOwnProperty(filterName)) {
        return _filterCreators[filterName];
      }
      return null;
    };

    /**
     * Register a new PIXI filter creator, to be used by GDJS.
     * @param filterName The name of the filter to get
     * @param filterCreator The object used to create the filter.
     * @category Core Engine > Effects
     */
    export const registerFilterCreator = function (
      filterName: string,
      filterCreator: FilterCreator
    ) {
      if (_filterCreators.hasOwnProperty(filterName)) {
        logger.warn(
          'Filter "' +
            filterName +
            '" was already registered in gdjs.PixiFiltersTools. Replacing it with the new one.'
        );
      }
      _filterCreators[filterName] = filterCreator;
    };

    /** A wrapper allowing to create an effect. */
    export interface FilterCreator {
      /** Function to call to create the filter */
      makeFilter(target: EffectsTarget, effectData: EffectData): Filter;
    }

    /**
     * An effect.
     * @category Core Engine > Effects
     */
    export interface Filter {
      /**
       * Check if an effect is enabled.
       * @return true if the filter is enabled
       */
      isEnabled(target: EffectsTarget): boolean;
      /**
       * Enable an effect.
       * @param enabled Set to true to enable, false to disable
       */
      setEnabled(target: EffectsTarget, enabled: boolean): boolean;
      /**
       * Apply the effect on the PixiJS DisplayObject.
       * Called after the effect is initialized.
       */
      applyEffect(target: EffectsTarget): boolean;
      removeEffect(target: EffectsTarget): boolean;
      /** The function to be called to update the filter at every frame before the rendering. */
      updatePreRender(target: gdjs.EffectsTarget): any;
      /** The function to be called to update a parameter (with a number) */
      updateDoubleParameter(
        //filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void;
      /** The function to be called to update a parameter (with a string) */
      updateStringParameter(parameterName: string, value: string): void;
      /** The function to be called to update a parameter (with a boolean) */
      updateBooleanParameter(parameterName: string, value: boolean): void;
      updateColorParameter(parameterName: string, value: number): void;
      getDoubleParameter(parameterName: string): number;
      getColorParameter(parameterName: string): number;
      getNetworkSyncData(): any;
      updateFromNetworkSyncData(syncData: any): void;
    }

    /**
     * A wrapper allowing to create a PIXI filter and update it using a common interface
     * @category Effects > Filters
     */
    export abstract class PixiFilterCreator implements FilterCreator {
      /** Function to call to create the filter */
      makeFilter(target: EffectsTarget, effectData: EffectData): Filter {
        const pixiFilter = this.makePIXIFilter(target, effectData);
        if (target.isLightingLayer && target.isLightingLayer()) {
          pixiFilter.blendMode = PIXI.BLEND_MODES.ADD;
        }
        return new PixiFilter(pixiFilter, this);
      }
      /** Function to call to create the filter */
      abstract makePIXIFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): any;
      /** The function to be called to update the filter at every frame before the rendering. */
      abstract updatePreRender(
        filter: PIXI.Filter,
        target: gdjs.EffectsTarget
      ): any;
      /** The function to be called to update a parameter (with a number) */
      abstract updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void;
      /** The function to be called to update a parameter (with a string) */
      abstract updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ): void;
      /** The function to be called to update a parameter (with a boolean) */
      abstract updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ): void;
      abstract updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void;
      abstract getDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string
      ): number;
      abstract getColorParameter(
        filter: PIXI.Filter,
        parameterName: string
      ): number;
      abstract getNetworkSyncData(filter: PIXI.Filter): any;
      abstract updateFromNetworkSyncData(
        filter: PIXI.Filter,
        syncData: any
      ): void;
    }

    /**
     * An effect used to manipulate a Pixi filter.
     * @category Core Engine > Effects
     */
    export class PixiFilter implements Filter {
      /** The PIXI filter */
      pixiFilter: PIXI.Filter;
      filterCreator: gdjs.PixiFiltersTools.PixiFilterCreator;

      constructor(
        pixiFilter: PIXI.Filter,
        filterCreator: gdjs.PixiFiltersTools.PixiFilterCreator
      ) {
        this.pixiFilter = pixiFilter;
        this.filterCreator = filterCreator;
      }

      isEnabled(target: EffectsTarget): boolean {
        return this.pixiFilter.enabled;
      }

      setEnabled(target: EffectsTarget, enabled: boolean): boolean {
        return (this.pixiFilter.enabled = enabled);
      }

      applyEffect(target: EffectsTarget): boolean {
        const rendererObject = target.getRendererObject() as
          | PIXI.DisplayObject
          | null
          | undefined;
        if (!rendererObject) {
          return false;
        }
        rendererObject.filters = (rendererObject.filters || []).concat(
          this.pixiFilter
        );
        return true;
      }

      removeEffect(target: EffectsTarget): boolean {
        const rendererObject = target.getRendererObject() as
          | PIXI.DisplayObject
          | null
          | undefined;
        if (!rendererObject) {
          return false;
        }
        rendererObject.filters = (rendererObject.filters || []).filter(
          (pixiFilter) => pixiFilter !== this.pixiFilter
        );
        return true;
      }

      updatePreRender(target: gdjs.EffectsTarget): any {
        this.filterCreator.updatePreRender(this.pixiFilter, target);
      }

      updateDoubleParameter(parameterName: string, value: number): void {
        this.filterCreator.updateDoubleParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      updateStringParameter(parameterName: string, value: string): void {
        this.filterCreator.updateStringParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      updateBooleanParameter(parameterName: string, value: boolean): void {
        this.filterCreator.updateBooleanParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      updateColorParameter(parameterName: string, value: number): void {
        this.filterCreator.updateColorParameter(
          this.pixiFilter,
          parameterName,
          value
        );
      }

      getDoubleParameter(parameterName: string): number {
        return this.filterCreator.getDoubleParameter(
          this.pixiFilter,
          parameterName
        );
      }

      getColorParameter(parameterName: string): number {
        return this.filterCreator.getColorParameter(
          this.pixiFilter,
          parameterName
        );
      }

      getNetworkSyncData(): any {
        return {
          ena: this.pixiFilter.enabled,
          fc: this.filterCreator.getNetworkSyncData(this.pixiFilter),
        };
      }

      updateFromNetworkSyncData(syncData: any): void {
        this.pixiFilter.enabled = syncData.ena;
        this.filterCreator.updateFromNetworkSyncData(
          this.pixiFilter,
          syncData.fc
        );
      }
    }

    /**
     * @category Core Engine > Effects
     */
    export class EmptyFilter implements Filter {
      isEnabled(target: EffectsTarget): boolean {
        return false;
      }
      setEnabled(target: EffectsTarget, enabled: boolean): boolean {
        return false;
      }
      applyEffect(target: EffectsTarget): boolean {
        return false;
      }
      removeEffect(target: EffectsTarget): boolean {
        return false;
      }
      updatePreRender(target: gdjs.EffectsTarget): any {}
      updateDoubleParameter(parameterName: string, value: number): void {}
      updateStringParameter(parameterName: string, value: string): void {}
      updateBooleanParameter(parameterName: string, value: boolean): void {}
      updateColorParameter(parameterName: string, value: number): void {}
      getDoubleParameter(parameterName: string): number {
        return 0;
      }
      getColorParameter(parameterName: string): number {
        return 0;
      }
      getNetworkSyncData(): any {
        return {};
      }
      updateFromNetworkSyncData(syncData: any): void {}
    }
  }
}
