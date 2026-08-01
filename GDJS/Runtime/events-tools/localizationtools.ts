/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace localization {
      /**
       * Return the locale selected for the game.
       */
      export const getLocale = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): string => instanceContainer.getGame().getLocale();

      /**
       * Change the locale selected for the game.
       */
      export const setLocale = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        locale: string
      ): void => instanceContainer.getGame().setLocale(locale);
    }
  }
}
