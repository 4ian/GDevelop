namespace gdjs {
  interface BlurFilterNetworkSyncData {
    b: number;
    q: number;
    ks: number;
    res: number | null;
  }
  /**
   * `PIXI.BlurFilter` reads the pixels around the area it blurs without
   * clamping them. When this area is rendered in a bigger texture (which
   * PixiJS does when the resolution of the filter is not the one of the game),
   * it reads the empty part of the texture, which shows up as a seam on the
   * right and bottom edges of the screen. Repeat the pixels of the edges instead.
   */
  const clampBlurredPixels = (blurFilterPass: PIXI.Filter) => {
    const removeShaderName = (source: string) =>
      source.replace(/#define SHADER_NAME .*\n/, '');
    const { vertexSrc, fragmentSrc } = blurFilterPass.program;
    blurFilterPass.program = PIXI.Program.from(
      removeShaderName(vertexSrc),
      removeShaderName(fragmentSrc)
        .replace(
          'uniform sampler2D uSampler;',
          'uniform sampler2D uSampler;\nuniform vec4 inputClamp;'
        )
        .replace(
          /texture2D\(uSampler, (vBlurTexCoords\[\d+\])\)/g,
          'texture2D(uSampler, clamp($1, inputClamp.xy, inputClamp.zw))'
        )
    );
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Blur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const blur = new PIXI.BlurFilter();
        clampBlurredPixels(blur.blurXFilter);
        clampBlurredPixels(blur.blurYFilter);
        return blur;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        if (
          parameterName !== 'blur' &&
          parameterName !== 'quality' &&
          parameterName !== 'kernelSize' &&
          parameterName !== 'resolution'
        ) {
          return;
        }
        if (parameterName === 'kernelSize') {
          value = gdjs.PixiFiltersTools.clampKernelSize(value, 5, 15);
        }
        filter[parameterName] = value;
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        return filter[parameterName] || 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
      getNetworkSyncData(filter: PIXI.Filter): BlurFilterNetworkSyncData {
        return {
          b: filter['blur'],
          q: filter['quality'],
          ks: filter['kernelSize'],
          res: filter['resolution'],
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: BlurFilterNetworkSyncData
      ) {
        filter['blur'] = data.b;
        filter['quality'] = data.q;
        filter['kernelSize'] = data.ks;
        filter['resolution'] = data.res;
      }
    })()
  );
}
