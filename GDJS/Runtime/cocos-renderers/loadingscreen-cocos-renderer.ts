/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class LoadingScreenCocosRenderer {
    setPercent(percent) {
      console.log('Loading ' + percent + '%');
    }

    unload() {
      return Promise.resolve();
    }
  }

  // Nothing to do
  gdjs.LoadingScreenRenderer = gdjs.LoadingScreenCocosRenderer;

  //Register the class to let the engine use it.
}
