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

const buildViewMenu = (project: gdProject): any => {
  const template = buildMainMenuDeclarativeTemplate({
    i18n,
    project,
    canSaveProjectAs: true,
    recentProjectFiles: [],
    shortcutMap: defaultShortcuts,
    isApplicationTopLevelMenu: false,
    hideAskAi: false,
  });

  return (template.find(item => item.label === 'View'): any);
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

  it('opens Sticky notes from the View menu', () => {
    const onOpenStickyNotes: any = (jest.fn(): any);
    const adaptedMenu = adaptFromDeclarativeTemplate(
      [buildViewMenu(({}: any))],
      ({ onOpenStickyNotes }: any)
    );
    const viewMenu: any = adaptedMenu[0];
    const stickyNotesItem = viewMenu.submenu.find(
      item => item.label === 'Sticky notes'
    );

    expect(stickyNotesItem).toEqual(
      expect.objectContaining({
        enabled: true,
        click: expect.any(Function),
      })
    );
    stickyNotesItem.click();

    expect(onOpenStickyNotes).toHaveBeenCalledTimes(1);
  });

  it('does not show a standalone gameplay tests item in the View menu', () => {
    const adaptedMenu = adaptFromDeclarativeTemplate(
      [buildViewMenu(({}: any))],
      ({}: any)
    );
    const viewMenu: any = adaptedMenu[0];
    const gameplayTestsItem = viewMenu.submenu.find(
      item => item.label === 'Show gameplay tests'
    );

    expect(gameplayTestsItem).toBeUndefined();
  });

  it('opens Recent editors from the View menu', () => {
    const onOpenRecentEditorSwitcher: any = (jest.fn(): any);
    const adaptedMenu = adaptFromDeclarativeTemplate(
      [buildViewMenu(({}: any))],
      ({ onOpenRecentEditorSwitcher }: any)
    );
    const viewMenu: any = adaptedMenu[0];
    const recentEditorsItem = viewMenu.submenu.find(
      item => item.label === 'Recent editors'
    );

    expect(recentEditorsItem).toEqual(
      expect.objectContaining({
        accelerator: expect.any(String),
        click: expect.any(Function),
      })
    );
    recentEditorsItem.click();

    expect(onOpenRecentEditorSwitcher).toHaveBeenCalledTimes(1);
  });
});
