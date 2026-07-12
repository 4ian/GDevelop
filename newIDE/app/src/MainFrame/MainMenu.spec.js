// @flow
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import {
  adaptFromDeclarativeTemplate,
  buildMainMenuDeclarativeTemplate,
} from './MainMenu';

const i18n = ({
  _: value => (typeof value === 'string' ? value : value.id),
}: any);

const buildFileMenu = (project: ?gdProject): any => {
  const template = buildMainMenuDeclarativeTemplate({
    i18n,
    project,
    canSaveProjectAs: !!project,
    recentProjectFiles: [],
    shortcutMap: defaultShortcuts,
    isApplicationTopLevelMenu: false,
    hideAskAi: false,
  });

  return (template[0]: any);
};

describe('MainMenu', () => {
  it('enables reloading when a project is open', () => {
    const fileMenu = buildFileMenu(({}: any));
    const reloadProjectItem = fileMenu.submenu.find(
      item => item.label === 'Reload project'
    );

    expect(reloadProjectItem).toEqual(
      expect.objectContaining({
        enabled: true,
        onClickSendEvent: 'main-menu-reload',
      })
    );
  });

  it('disables reloading when no project is open', () => {
    const fileMenu = buildFileMenu(null);
    const reloadProjectItem = fileMenu.submenu.find(
      item => item.label === 'Reload project'
    );

    expect(reloadProjectItem).toEqual(
      expect.objectContaining({ enabled: false })
    );
  });

  it('runs the reload project callback from the in-app menu', () => {
    const onReloadProject: any = (jest.fn(): any);
    const adaptedMenu = adaptFromDeclarativeTemplate(
      [buildFileMenu(({}: any))],
      ({ onReloadProject }: any)
    );
    const fileMenu: any = adaptedMenu[0];
    const reloadProjectItem = fileMenu.submenu.find(
      item => item.label === 'Reload project'
    );

    if (!reloadProjectItem || !reloadProjectItem.click) {
      throw new Error('Reload project menu item is not clickable.');
    }
    reloadProjectItem.click();

    expect(onReloadProject).toHaveBeenCalledTimes(1);
  });
});
