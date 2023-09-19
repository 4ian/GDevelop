/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Font manager');

  /**
   * FontFaceObserverFontManager loads fonts (using `FontFace` or `fontfaceobserver` library)
   * from the game resources (see `loadFonts`), and allow to access to
   * the font families of the loaded fonts during the game (see `getFontFamily`).
   */
  export class FontFaceObserverFontManager {
    _resourcesLoader: RuntimeGameResourcesLoader;
    _resources: Map<string, ResourceData>;
    // Associate font resource names to the loaded font family
    _loadedFontFamily: { [key: string]: string } = {};
    // Associate font resource names to the resources, for faster access
    _loadedFonts: { [key: string]: ResourceData } = {};
    _filenameToFontFamily: { [key: string]: string } = {};

    /**
     * @param resources The resources data of the game.
     * @param resourcesLoader The resources loader of the game.
     */
    constructor(
      resourceDataArray: ResourceData[],
      resourcesLoader: RuntimeGameResourcesLoader
    ) {
      this._resources = new Map<string, ResourceData>();
      this.setResources(resourceDataArray);
      this._resourcesLoader = resourcesLoader;
    }

    // Cache the result of transforming a filename to a font family - useful to avoid duplicates.
    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resources The resources data of the game.
     */
    setResources(resourceDataArray: ResourceData[]): void {
      this._resources.clear();
      for (const resourceData of resourceDataArray) {
        if (resourceData.kind === 'font') {
          this._resources.set(resourceData.name, resourceData);
        }
      }
    }

    /**
     * Return the font family associated to the specified font resource name.
     * The font resource must have been loaded before. If that's not the case,
     * a default font family will be returned ("Arial").
     *
     * @param resourceName The name of the resource to get.
     * @returns The font family to be used for this font resource,
     * or "Arial" if not loaded.
     */
    getFontFamily(resourceName: string): string {
      if (this._loadedFontFamily[resourceName]) {
        return this._loadedFontFamily[resourceName];
      }
      return 'Arial';
    }

    /**
     * Return the font file associated to the specified font resource name.
     * The font resource must have been loaded before. If that's not the case,
     * the resource name will be returned (to
     * keep compatibility with GDevelop 5.0-beta56 and previous).
     *
     * Should only be useful for renderers running on a non HTML5/non browser environment.
     *
     * @param resourceName The name of the resource to get.
     * @returns The file of the font resource.
     */
    getFontFile(resourceName: string): string {
      if (this._loadedFonts[resourceName]) {
        return this._loadedFonts[resourceName].file || '';
      }
      return resourceName;
    }

    /**
     * Return the font family to use for a given filename.
     * Each filename is guaranteed to have a unique font family. You should not rely
     * on the font family formatting (consider it as an "opaque string") - it's slugified
     * (no spaces, no dots, no non-alphanumeric characters) to avoid issues when using the
     * font family in various contexts.
     *
     * @param filename The filename of the font.
     * @returns The font family to be used for this font resource.
     */
    _getFontFamilyFromFilename(filename: string): string {
      if (this._filenameToFontFamily[filename]) {
        return this._filenameToFontFamily[filename];
      }

      // Replaces all non-alphanumeric characters with dashes to ensure no issues when
      // referring to this font family (see https://github.com/4ian/GDevelop/issues/1521).
      let baseSlugifiedName =
        'gdjs_font_' + filename.toLowerCase().replace(/[^\w]/gi, '-');

      // Ensure the generated font family is unique.
      const slugifiedName = baseSlugifiedName;
      let uniqueSuffix = 2;
      while (!!this._filenameToFontFamily[baseSlugifiedName]) {
        baseSlugifiedName = baseSlugifiedName + '-' + uniqueSuffix;
        uniqueSuffix++;
      }

      // Cache the result to avoid collision with a similar slugified name for another filename.
      return (this._filenameToFontFamily[filename] = slugifiedName);
    }

    /**
     * Load the font at the given `src` location (relative to the project), giving
     * it the specified `fontFamily` name.
     *
     * This uses FontFace (if supported) or @font-face + FontFaceObserver
     * to load a font from an url and be notified when loading is done (or failed).
     *
     * @param fontFamily The font
     * @returns The font family to be used for this font resource.
     */
    private _loadFont(fontFamily: string, src: string): Promise<void> {
      const descriptors = {};
      const srcWithUrl = 'url(' + encodeURI(src) + ')';

      // @ts-ignore
      if (typeof FontFace !== 'undefined') {
        // Load the given font using CSS Font Loading API.
        return fetch(this._resourcesLoader.getFullUrl(src), {
          credentials: this._resourcesLoader.checkIfCredentialsRequired(src)
            ? // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
              // i.e: its gdevelop.io cookie, to be passed.
              'include'
            : // For other resources, use "same-origin" as done by default by fetch.
              'same-origin',
        })
          .then((response) => {
            if (!response.ok) {
              const errorMessage =
                'Unable to fetch ' +
                src +
                ' to be loaded as a font. HTTP status is: ' +
                response.status +
                '.';
              logger.error(errorMessage);
              throw new Error(errorMessage);
            }

            return response.arrayBuffer();
          })
          .then((arrayBuffer) => {
            // @ts-ignore
            const fontFace = new FontFace(fontFamily, arrayBuffer, descriptors);

            // @ts-ignore
            document.fonts.add(fontFace);
          });
      } else {
        // TODO: this method of loading font should be removed as old and not allowing
        // to handle loading with credentials. All moderns and not-so-modern browsers
        // that we support also support FontFace API.

        // Add @font-face and use FontFaceObserver to be notified when the
        // font is ready.
        const newStyle = document.createElement('style');
        newStyle.appendChild(
          document.createTextNode(
            "@font-face { font-family: '" +
              fontFamily +
              "'; src: " +
              srcWithUrl +
              '; }'
          )
        );
        document.head.appendChild(newStyle);

        // @ts-ignore
        return new FontFaceObserver(fontFamily, descriptors).load();
      }
    }

    /**
     * Load the specified resources, so that fonts are loaded and can then be
     * used by using the font family returned by getFontFamily.
     * @param onProgress Callback called each time a new file is loaded.
     */
    async loadFonts(
      onProgress: (loadedCount: integer, totalCount: integer) => void
    ): Promise<integer> {
      // Construct the list of files to be loaded.
      // For one loaded file, it can have one or more resources
      // that use it.
      const filesResources: { [key: string]: ResourceData[] } = {};
      for (const res of this._resources.values()) {
        if (res.file) {
          if (!!this._loadedFonts[res.name]) {
            continue;
          }
          filesResources[res.file] = filesResources[res.file]
            ? filesResources[res.file].concat(res)
            : [res];
        }
      }
      const totalCount = Object.keys(filesResources).length;
      if (totalCount === 0) {
        return 0;
      }

      let loadingCount = 0;
      await Promise.all(
        Object.keys(filesResources).map(async (file) => {
          const fontFamily = this._getFontFamilyFromFilename(file);
          const fontResources = filesResources[file];
          try {
            await this._loadFont(fontFamily, file);
          } catch (error) {
            logger.error(
              'Error loading font resource "' +
                fontResources[0].name +
                '" (file: ' +
                file +
                '): ' +
                (error.message || 'Unknown error')
            );
          }
          fontResources.forEach((resource) => {
            this._loadedFontFamily[resource.name] = fontFamily;
            this._loadedFonts[resource.name] = resource;
          });
          loadingCount++;
          onProgress(loadingCount, totalCount);
        })
      );
      return totalCount;
    }
  }

  //Register the class to let the engine use it.
  export type FontManager = FontFaceObserverFontManager | undefined;
  type FontManagerClass = typeof FontFaceObserverFontManager | undefined;
  export const FontManager: FontManagerClass = FontFaceObserverFontManager;
}
