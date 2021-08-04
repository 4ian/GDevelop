export class LoadingScreenCocosRenderer {
  setPercent(percent) {
    console.log('Loading ' + percent + '%');
  }

  unload() {
    return Promise.resolve();
  }
}

export const LoadingScreenRenderer = LoadingScreenCocosRenderer;
export type LoadingScreenRenderer = LoadingScreenCocosRenderer;
