// @flow
import { displayBlackLoadingScreenOrThrow } from '../../../Utils/BrowserExternalWindowUtils';

let nextPreviewWindowId = 0;

/**
 * Open a window showing a black "loading..." screen. It's important this is done
 * NOT in an asynchronous way but JUST after a click. Otherwise, browsers like Safari
 * will block the window opening.
 */
export const immediatelyOpenNewPreviewWindow = (
  project: gdProject
): WindowProxy => {
  const width = project.getGameResolutionWidth();
  const height = project.getGameResolutionHeight();
  const left = window.screenX + window.innerWidth / 2 - width / 2;
  const top = window.screenY + window.innerHeight / 2 - height / 2;

  const targetId = 'GDevelopPreview' + nextPreviewWindowId++;
  const previewWindow = window.open(
    'about:blank',
    targetId,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  if (!previewWindow) {
    throw new Error(
      "Can't open the preview window because of browser restrictions."
    );
  }

  displayBlackLoadingScreenOrThrow(previewWindow);

  return previewWindow;
};
