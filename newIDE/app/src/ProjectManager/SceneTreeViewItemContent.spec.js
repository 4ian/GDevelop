// @flow
import { SceneTreeViewItemContent } from './SceneTreeViewItemContent';

jest.mock('.', () => ({ scenesRootFolderId: 'scenes-root' }));

const scene: any = {
  ptr: 42,
  getName: () => 'Game',
};

describe('SceneTreeViewItemContent', () => {
  it('opens scene variables from the scene context menu', () => {
    const onOpenLayoutVariables = jest.fn();
    const content = new SceneTreeViewItemContent(
      scene,
      (({
        onOpenLayoutVariables,
        project: { getFirstLayout: () => 'OtherScene' },
      }: any): any)
    );
    const i18n: any = { _: message => message };

    const variablesMenuItem: any = content.buildMenuTemplate(i18n, 0)[4];
    variablesMenuItem.click();

    expect(onOpenLayoutVariables).toHaveBeenCalledWith(scene);
  });
});
