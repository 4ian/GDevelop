/**
 * End-to-end checks of the scene editor undo/redo, run in a headless Chrome
 * against a running development server (`npm start`).
 *
 * Usage:
 *   node scripts/undo-redo-e2e.js [--url=http://localhost:3000]
 *     [--only=name1,name2] [--headed] [--list]
 *
 * Chrome is found with the CHROME_PATH environment variable (or at its
 * default location). Each scenario runs in a fresh browser context, on a
 * fresh copy of the fixture project served by this script.
 */
const http = require('http');
const puppeteer = require('puppeteer-core');

const args = process.argv.slice(2);
const getArg = name => {
  const arg = args.find(arg => arg.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : null;
};
const appUrl = getArg('url') || 'http://localhost:3000';
const only = getArg('only') ? getArg('only').split(',') : null;
const headed = args.includes('--headed');
// The scenarios of the 3D editor need the game engine to be served by the
// development server: `ln -s ../resources/GDJS public/GDJS`, and an url
// which is not "localhost" (like http://127.0.0.1:3000).
const with3D = args.includes('--3d');

const chromePath =
  process.env.CHROME_PATH ||
  {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  }[process.platform] ||
  '/usr/bin/google-chrome';

const INSTANCE_UUID = '11111111-1111-1111-1111-111111111111';
const INSTANCE_X = 297;

const makeObject = name => ({
  name,
  type: 'Sprite',
  updateIfNotVisible: false,
  variables: [],
  behaviors: [],
  effects: [],
  animations: [],
});
const makeLayer = name => ({
  name,
  visibility: true,
  cameras: [
    {
      defaultSize: true,
      defaultViewport: true,
      height: 0,
      viewportBottom: 1,
      viewportLeft: 0,
      viewportRight: 1,
      viewportTop: 0,
      width: 0,
    },
  ],
  effects: [],
});

const makeVariables = () => [
  { name: 'VarA', type: 'number', value: 1 },
  { name: 'VarB', type: 'number', value: 2 },
];

const fixtureProject = {
  firstLayout: '',
  gdVersion: { build: 96, major: 4, minor: 0, revision: 89 },
  properties: {
    folderProject: false,
    packageName: '',
    projectFile: '',
    useExternalSourceFiles: false,
    name: 'UndoRedoE2E',
    author: '',
    windowWidth: 800,
    windowHeight: 600,
    latestCompilationDirectory: '',
    maxFPS: 60,
    minFPS: 10,
    verticalSync: false,
    extensions: [{ name: 'BuiltinObject' }, { name: 'Sprite' }],
    platforms: [{ name: 'GDevelop JS platform' }],
    currentPlatform: 'GDevelop JS platform',
  },
  resources: { resources: [], resourceFolders: [] },
  objects: [],
  objectsGroups: [],
  variables: [],
  layouts: [
    {
      b: 209,
      disableInputWhenNotFocused: true,
      mangledName: 'Scene',
      name: 'Scene',
      r: 209,
      standardSortMethod: true,
      stopSoundsOnStartup: true,
      title: '',
      v: 209,
      uiSettings: {
        grid: false,
        gridB: 255,
        gridG: 180,
        gridHeight: 32,
        gridOffsetX: 0,
        gridOffsetY: 0,
        gridR: 158,
        gridWidth: 32,
        snap: true,
        windowMask: true,
        zoomFactor: 1,
      },
      objectsGroups: [{ name: 'MyGroup', objects: [{ name: 'MyObject' }] }],
      variables: makeVariables(),
      instances: [
        {
          persistentUuid: INSTANCE_UUID,
          angle: 0,
          customSize: false,
          height: 0,
          layer: '',
          locked: false,
          name: 'MyObject',
          width: 0,
          x: INSTANCE_X,
          y: 245,
          zOrder: 1,
          numberProperties: [],
          stringProperties: [],
          initialVariables: makeVariables(),
        },
        {
          persistentUuid: '22222222-2222-2222-2222-222222222222',
          angle: 0,
          customSize: false,
          height: 0,
          layer: '',
          locked: false,
          name: 'MyCube',
          width: 0,
          x: 500,
          y: 300,
          zOrder: 2,
          numberProperties: [],
          stringProperties: [],
          initialVariables: [],
        },
      ],
      objects: [
        makeObject('MyObject'),
        makeObject('OtherObject'),
        { ...makeObject('VariablesObject'), variables: makeVariables() },
        {
          name: 'MyCube',
          type: 'Scene3D::Cube3DObject',
          variables: [],
          behaviors: [],
          effects: [],
          content: {
            width: 100,
            height: 100,
            depth: 100,
            enableTextureTransparency: false,
            facesOrientation: 'Y',
            frontFaceResourceName: '',
            backFaceResourceName: '',
            backFaceUpThroughWhichAxisRotation: 'X',
            leftFaceResourceName: '',
            rightFaceResourceName: '',
            topFaceResourceName: '',
            bottomFaceResourceName: '',
            frontFaceVisible: true,
            backFaceVisible: true,
            leftFaceVisible: true,
            rightFaceVisible: true,
            topFaceVisible: true,
            bottomFaceVisible: true,
            frontFaceResourceRepeat: false,
            backFaceResourceRepeat: false,
            leftFaceResourceRepeat: false,
            rightFaceResourceRepeat: false,
            topFaceResourceRepeat: false,
            bottomFaceResourceRepeat: false,
            tileScale: 1,
            materialType: 'StandardWithoutMetalness',
            tint: '255;255;255',
            isCastingShadow: true,
            isReceivingShadow: true,
          },
        },
      ],
      events: [],
      layers: [makeLayer(''), makeLayer('Background')],
      behaviorsSharedData: [],
    },
  ],
  externalEvents: [],
  externalLayouts: [],
  externalSourceFiles: [],
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Longer than the debounce grouping the panel modifications in a single
// history step (see `_flushPendingPanelHistorySaveDebounced`).
const HISTORY_SAVE_DELAY = 800;

class Editor {
  constructor(page) {
    this.page = page;
  }

  async open(projectUrl) {
    const { page } = this;
    // Native confirmation dialogs (like when removing a behavior) block the
    // page until answered.
    page.on('dialog', dialog => dialog.accept());
    // Crashes of the engine (like an access to a deleted object) must fail
    // any scenario.
    this.fatalErrors = [];
    const recordIfFatal = text => {
      if (
        /memory access out of bounds|RuntimeError|is not a function|Aborted\(/.test(
          text
        )
      )
        this.fatalErrors.push(text.slice(0, 300));
    };
    page.on('pageerror', error =>
      recordIfFatal(String(error.message || error))
    );
    page.on('console', message => {
      if (message.type() === 'error') recordIfFatal(message.text());
    });
    await page.evaluateOnNewDocument(() => {
      // Give access to the game running in the frame of the 3D editor.
      const captureGame = setInterval(() => {
        if (!window.gdjs || !window.gdjs.RuntimeGame) return;
        clearInterval(captureGame);
        const { startGameLoop } = window.gdjs.RuntimeGame.prototype;
        window.gdjs.RuntimeGame.prototype.startGameLoop = function() {
          window.__game = this;
          return startGameLoop.apply(this, arguments);
        };
      }, 5);
      localStorage.setItem(
        'gd-preferences',
        JSON.stringify({ language: 'en' })
      );
      // The development server shows an overlay catching all the clicks
      // for any uncaught error (like a failed request to an API).
      setInterval(() => {
        const overlay = document.getElementById(
          'webpack-dev-server-client-overlay'
        );
        if (overlay) overlay.remove();
      }, 50);
    });
    await page.goto(`${appUrl}/?project=${encodeURIComponent(projectUrl)}`, {
      // Not "networkidle": the requests to the online services keep the
      // network busy for a while, and the editor is what's waited for below.
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await page.waitForSelector('#scene-editor', { timeout: 60000 });
    await page.waitForSelector('#objects-list [data-object-name="MyObject"]');
    await sleep(500);
  }

  async waitUntil(description, predicate, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await predicate()) return;
      await sleep(100);
    }
    throw new Error(`Timeout waiting for: ${description}`);
  }

  async clickMenuItem(regex) {
    const { page } = this;
    await this.waitUntil(`menu item ${regex}`, async () => {
      const items = await page.$$('li[role="menuitem"], li');
      for (const item of items) {
        const text = await page.evaluate(el => el.textContent || '', item);
        if (regex.test(text)) {
          await item.click();
          return true;
        }
      }
      return false;
    });
  }

  async clickButtonWithText(rootSelector, regex) {
    const clicked = await this.page.evaluate(
      (rootSelector, source) => {
        const root = document.querySelector(rootSelector);
        if (!root) return false;
        const regex = new RegExp(source, 'i');
        // The last one: a dialog has its own buttons after the ones of its
        // content (which can have the same label).
        const buttons = Array.from(root.querySelectorAll('button')).filter(
          button => regex.test(button.textContent || '')
        );
        if (!buttons.length) return false;
        buttons[buttons.length - 1].click();
        return true;
      },
      rootSelector,
      regex.source
    );
    if (!clicked)
      throw new Error(`No button matching ${regex} in ${rootSelector}`);
  }

  /** Same as `clickSectionHeaderButton`, with a real click (moving the focus). */
  async realClickSectionHeaderButton(sectionId, which) {
    const handle = await this.page.evaluateHandle(
      (sectionId, which) => {
        const buttons = document
          .getElementById(sectionId)
          .querySelectorAll('button');
        return which === 'add' ? buttons[buttons.length - 1] : buttons[1];
      },
      sectionId,
      which
    );
    await handle.asElement().click();
  }

  /** Same as `clickButtonWithText`, with a real click (moving the focus). */
  async realClickButtonWithText(rootSelector, regex) {
    const handle = await this.page.evaluateHandle(
      (rootSelector, source) => {
        const regex = new RegExp(source, 'i');
        const buttons = Array.from(
          document.querySelector(rootSelector).querySelectorAll('button')
        ).filter(button => regex.test(button.textContent || ''));
        return buttons[buttons.length - 1];
      },
      rootSelector,
      regex.source
    );
    await handle.asElement().click();
  }

  /** Click a button of the header of a section: fold, [open editor], [add]. */
  async clickSectionHeaderButton(sectionId, which) {
    const result = await this.page.evaluate(
      (sectionId, which) => {
        const section = document.getElementById(sectionId);
        if (!section) return 'section not found';
        const buttons = section.querySelectorAll('button');
        const button =
          which === 'add' ? buttons[buttons.length - 1] : buttons[1];
        if (!button) return 'button not found';
        button.click();
        return null;
      },
      sectionId,
      which
    );
    if (result) throw new Error(`${sectionId} (${which}): ${result}`);
  }

  async unfoldVariablesSection(panelSelector, sectionId) {
    const isUnfolded = await this.page.evaluate(panelSelector => {
      const field = document.querySelector(
        `${panelSelector} input[id^="variable-"]`
      );
      return !!field && field.getClientRects().length > 0;
    }, panelSelector);
    if (isUnfolded) return;
    await this.page.evaluate(sectionId => {
      document
        .getElementById(sectionId)
        .querySelector('button')
        .click();
    }, sectionId);
    await sleep(300);
  }

  async selectInstancesOf(objectName) {
    const row = await this.page.$(
      `#objects-list [data-object-name="${objectName}"]`
    );
    await row.click({ button: 'right' });
    await this.clickMenuItem(/select instances on scene/i);
    await this.waitUntil('instance panel', async () =>
      (await this.getPanel()).startsWith('instance')
    );
  }

  async selectObjectInList(objectName) {
    await (await this.page.$(
      `#objects-list [data-object-name="${objectName}"]`
    )).click();
    await this.waitUntil(
      'object panel',
      async () => (await this.getPanel()) === `object:${objectName}`
    );
  }

  async openPanel(name) {
    const { listId, buttonId } = {
      layers: {
        listId: 'layers-list',
        buttonId: 'toolbar-open-layers-panel-button',
      },
      groups: {
        listId: 'objects-groups-list',
        buttonId: 'toolbar-open-object-groups-panel-button',
      },
    }[name];
    if (await this.page.$(`#${listId}`)) return;
    await (await this.page.$(`#${buttonId}`)).click();
    await this.page.waitForSelector(`#${listId}`);
  }

  async selectGroup(groupName) {
    await this.openPanel('groups');
    await this.waitUntil(`group ${groupName} in the list`, () =>
      this.page.evaluate(groupName => {
        const list = document.getElementById('objects-groups-list');
        const label = Array.from(list.querySelectorAll('span, p')).find(
          element => element.textContent === groupName
        );
        if (!label) return false;
        label.click();
        return true;
      }, groupName)
    );
    await this.waitUntil(
      'group panel',
      async () => (await this.getPanel()) === 'group'
    );
  }

  async selectLayer(layerName) {
    await this.openPanel('layers');
    await (await this.page.waitForSelector(
      `#layers-list [data-scene="${layerName}"]`
    )).click();
    await this.waitUntil(
      'layer panel',
      async () => (await this.getPanel()) === 'layer'
    );
  }

  async deselectAll() {
    await this.focusEditor();
    await this.page.keyboard.press('Escape');
    await this.waitUntil(
      'scene panel',
      async () => (await this.getPanel()) === 'scene'
    );
  }

  /**
   * What the properties panel shows: "scene", "layer", "group",
   * "instance" or "object:ObjectName".
   */
  getPanel() {
    return this.page.evaluate(() => {
      if (document.getElementById('instance-properties-editor'))
        return 'instance';
      if (document.getElementById('layer-properties-editor')) return 'layer';
      if (document.getElementById('object-group-properties-editor'))
        return 'group';
      if (document.getElementById('scene-properties-editor')) return 'scene';
      const objectPanel = document.getElementById('object-properties-editor');
      if (objectPanel) {
        const nameInput = objectPanel.querySelector('input');
        return `object:${nameInput ? nameInput.value : '?'}`;
      }
      return 'none';
    });
  }

  /** The names of the variables listed inside the given element. */
  getVariableNames(rootSelector) {
    return this.page.evaluate(rootSelector => {
      const root = document.querySelector(rootSelector);
      if (!root) return null;
      return Array.from(root.querySelectorAll('input[id$="-name"]'))
        .filter(input => /^variable-\d+-name$/.test(input.id))
        .map(input => input.value);
    }, rootSelector);
  }

  async setFieldValue(selector, value) {
    const field = await this.page.waitForSelector(selector);
    await field.click({ clickCount: 3 });
    await this.page.keyboard.type(value);
    await this.page.keyboard.press('Tab');
    await sleep(HISTORY_SAVE_DELAY);
  }

  getFieldValue(selector) {
    return this.page.$eval(selector, el => el.value);
  }

  async focusEditor() {
    await this.page.evaluate(() => {
      if (document.activeElement) document.activeElement.blur();
      document.getElementById('scene-editor').focus();
    });
  }

  async pressUndoRedo(withShift) {
    const { keyboard } = this.page;
    await this.focusEditor();
    await keyboard.down('Control');
    if (withShift) await keyboard.down('Shift');
    await keyboard.press('z');
    if (withShift) await keyboard.up('Shift');
    await keyboard.up('Control');
    // The 3D editor applies the change in its next (slow) frames.
    await sleep(this.is3D ? 700 : 350);
  }

  /** Press the undo shortcut wherever the focus is, like a user would. */
  async pressRawUndo() {
    const { keyboard } = this.page;
    await keyboard.down('Control');
    await keyboard.press('z');
    await keyboard.up('Control');
    await sleep(700);
  }

  /** Press the undo shortcut twice, without releasing Control in between. */
  async pressRawUndoTwiceHoldingControl() {
    const { keyboard } = this.page;
    await keyboard.down('Control');
    for (let i = 0; i < 2; i++) {
      // Held for a while: the 3D editor reads the keyboard once per frame.
      await keyboard.down('KeyZ');
      await sleep(1500);
      await keyboard.up('KeyZ');
      await sleep(700);
    }
    await keyboard.up('Control');
  }

  async switchTo3D() {
    this.is3D = true;
    const handle = await this.page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('#game-editor-toggle button')).find(
        button => button.textContent === '3D'
      )
    );
    await handle.asElement().click();
    await this.waitUntil(
      '3D editor frame',
      () =>
        this.page
          .frames()
          .some(frame => /in-game-editor-preview/.test(frame.url())),
      // The first start of the 3D editor of a session can be slow.
      180000
    );
    await sleep(5000);
  }

  /** The names of the objects selected in the 3D editor. */
  async getSelectionIn3DEditor() {
    const frame = this.page
      .frames()
      .find(frame => /in-game-editor-preview/.test(frame.url()));
    return frame.evaluate(() => {
      const game = window.__game;
      if (!game || !game._inGameEditor) return 'no game';
      return game._inGameEditor._selection
        .getSelectedObjects()
        .map(object => object.getName());
    });
  }

  async deleteObjectInList(objectName) {
    const row = await this.page.$(
      `#objects-list [data-object-name="${objectName}"]`
    );
    await row.click({ button: 'right' });
    // The label is followed by the shortcut.
    await this.clickMenuItem(/^delete(?! folder)/i);
    // Confirm the deletion of the instances too, if asked.
    await sleep(500);
    if (await this.page.$('[role="dialog"]'))
      await this.clickButtonWithText(
        '[role="dialog"]',
        /^(confirm|delete|yes)/
      );
    await this.waitUntil(
      `${objectName} removed from the list`,
      async () =>
        !(await this.page.$(`#objects-list [data-object-name="${objectName}"]`))
    );
    await sleep(500);
  }

  /** The width of the first instance of an object, in the 3D editor. */
  async getWidthIn3DEditor(objectName) {
    const frame = this.page
      .frames()
      .find(frame => /in-game-editor-preview/.test(frame.url()));
    return frame.evaluate(objectName => {
      const game = window.__game;
      if (!game || !game._inGameEditor) return 'no game';
      const scene = game._inGameEditor._currentScene;
      if (!scene) return 'no scene';
      const objects = scene.getObjects(objectName);
      return objects && objects.length ? objects[0].getWidth() : 'no object';
    }, objectName);
  }

  /** Start recording the elements getting the undo/redo highlight. */
  recordHighlights() {
    return this.page.evaluate(() => {
      window.__recordedHighlights = new Set();
      if (window.__highlightsObserver) return;
      window.__highlightsObserver = new MutationObserver(mutations => {
        mutations.forEach(({ target }) => {
          if (!target.classList.contains('undo-redo-property-flash')) return;
          const objectRow = target.closest('[data-object-name]');
          const groupRow = target.closest('[data-group-name]');
          window.__recordedHighlights.add(
            target.id ||
              target.getAttribute('data-variable-node-id') ||
              (objectRow
                ? `object-row:${objectRow.getAttribute('data-object-name')}`
                : groupRow
                ? `group-row:${groupRow.getAttribute('data-group-name')}`
                : '?')
          );
        });
      });
      window.__highlightsObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    });
  }

  async getHighlights() {
    await sleep(1200);
    return this.page.evaluate(() => [...window.__recordedHighlights]);
  }

  /** Where the keyboard focus is: "editor", "body" or "outside". */
  getFocusLocation() {
    return this.page.evaluate(() => {
      const { activeElement } = document;
      if (!activeElement || activeElement === document.body) return 'body';
      return document.getElementById('scene-editor').contains(activeElement)
        ? 'editor'
        : 'outside';
    });
  }

  undo() {
    return this.pressUndoRedo(false);
  }

  redo() {
    return this.pressUndoRedo(true);
  }
}

const expectEqual = (actual, expected, description) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(
      `${description}: expected ${JSON.stringify(
        expected
      )}, got ${JSON.stringify(actual)}`
    );
};

const X_FIELD = '#instance-properties-editor [id="X"]';

const scenarios = {
  'instance edit is revealed after deselecting': async editor => {
    await editor.selectInstancesOf('MyObject');
    await editor.setFieldValue(X_FIELD, '555');
    await editor.deselectAll();

    await editor.undo();
    expectEqual(await editor.getPanel(), 'instance', 'panel after undo');
    expectEqual(await editor.getFieldValue(X_FIELD), '297', 'X after undo');

    await editor.deselectAll();
    await editor.redo();
    expectEqual(await editor.getPanel(), 'instance', 'panel after redo');
    expectEqual(await editor.getFieldValue(X_FIELD), '555', 'X after redo');
  },

  'object change is revealed even if an instance gets selected': async editor => {
    await editor.selectObjectInList('OtherObject');
    await editor.clickSectionHeaderButton('object-variables-section', 'add');
    await sleep(HISTORY_SAVE_DELAY);
    await editor.selectInstancesOf('MyObject');

    await editor.undo();
    expectEqual(await editor.getPanel(), 'object:OtherObject', 'after undo');
    expectEqual(
      await editor.getVariableNames('#object-properties-editor'),
      [],
      'variables after undo'
    );

    await editor.selectInstancesOf('MyObject');
    await editor.redo();
    expectEqual(await editor.getPanel(), 'object:OtherObject', 'after redo');
    expectEqual(
      await editor.getVariableNames('#object-properties-editor'),
      ['Variable'],
      'variables after redo'
    );
  },

  'object change stays revealed when an instance was selected first': async editor => {
    await editor.selectInstancesOf('MyObject');
    await editor.selectObjectInList('OtherObject');
    await editor.clickSectionHeaderButton('object-variables-section', 'add');
    await sleep(HISTORY_SAVE_DELAY);

    await editor.undo();
    expectEqual(await editor.getPanel(), 'object:OtherObject', 'after undo');
    await editor.redo();
    expectEqual(await editor.getPanel(), 'object:OtherObject', 'after redo');
  },

  'scene variable change deselects to show the scene panel': async editor => {
    await editor.clickSectionHeaderButton('scene-variables-section', 'add');
    await sleep(HISTORY_SAVE_DELAY);
    expectEqual(
      (await editor.getVariableNames('#scene-properties-editor')).length,
      3,
      'variables after adding'
    );
    await editor.selectInstancesOf('MyObject');

    await editor.undo();
    expectEqual(await editor.getPanel(), 'scene', 'panel after undo');
    expectEqual(
      (await editor.getVariableNames('#scene-properties-editor')).length,
      2,
      'variables after undo'
    );

    await editor.redo();
    expectEqual(
      (await editor.getVariableNames('#scene-properties-editor')).length,
      3,
      'variables after redo'
    );
  },

  'scene variables dialog makes one step per variable': async editor => {
    await editor.clickSectionHeaderButton(
      'scene-variables-section',
      'open-editor'
    );
    await editor.page.waitForSelector('#scene-variables-dialog');
    const dialog = '[role="dialog"]';
    await editor.clickButtonWithText(dialog, /add variable/);
    await sleep(300);
    await editor.clickButtonWithText(dialog, /add variable/);
    await sleep(300);
    expectEqual(
      (await editor.getVariableNames(dialog)).length,
      4,
      'variables in the dialog'
    );
    await editor.clickButtonWithText(dialog, /^apply$/);
    await editor.waitUntil(
      'dialog closed',
      async () => !(await editor.page.$('#scene-variables-dialog'))
    );
    await sleep(300);

    const panel = '#scene-properties-editor';
    expectEqual((await editor.getVariableNames(panel)).length, 4, 'applied');
    await editor.undo();
    expectEqual((await editor.getVariableNames(panel)).length, 3, 'undo 1');
    await editor.undo();
    expectEqual((await editor.getVariableNames(panel)).length, 2, 'undo 2');
    await editor.redo();
    await editor.redo();
    expectEqual((await editor.getVariableNames(panel)).length, 4, 'redo 2');
  },

  'layer change is revealed even if an instance gets selected': async editor => {
    await editor.selectLayer('Background');
    await editor.clickSectionHeaderButton('layer-2d-effects-section', 'add');
    await sleep(HISTORY_SAVE_DELAY);
    await editor.selectInstancesOf('MyObject');

    await editor.undo();
    expectEqual(await editor.getPanel(), 'layer', 'panel after undo');
  },
};

Object.assign(scenarios, {
  'instance variables dialog makes one step per variable': async editor => {
    await editor.selectInstancesOf('MyObject');
    await editor.clickSectionHeaderButton(
      'instance-variables-section',
      'open-editor'
    );
    const dialog = '#instance-variables-dialog';
    await editor.page.waitForSelector(dialog);
    await editor.setFieldValue(`${dialog} #variable-0-text-value`, '100');
    await editor.setFieldValue(`${dialog} #variable-1-text-value`, '200');
    await editor.clickButtonWithText('[role="dialog"]', /^apply$/);
    await editor.waitUntil(
      'dialog closed',
      async () => !(await editor.page.$(dialog))
    );
    await sleep(300);

    const getValues = async () => [
      await editor.getFieldValue(
        '#instance-properties-editor #variable-0-text-value'
      ),
      await editor.getFieldValue(
        '#instance-properties-editor #variable-1-text-value'
      ),
    ];
    expectEqual(await getValues(), ['100', '200'], 'applied');
    await editor.undo();
    expectEqual(
      (await getValues()).filter(value => ['1', '2'].includes(value)).length,
      1,
      'variables reverted by the first undo'
    );
    await editor.undo();
    expectEqual(await getValues(), ['1', '2'], 'undo 2');
    await editor.redo();
    await editor.redo();
    expectEqual(await getValues(), ['100', '200'], 'redo 2');
  },

  'object editor dialog makes one step per variable': async editor => {
    await editor.selectObjectInList('OtherObject');
    await editor.clickSectionHeaderButton(
      'object-variables-section',
      'open-editor'
    );
    const dialog = '#object-editor-dialog';
    await editor.page.waitForSelector(dialog);
    await editor.clickButtonWithText('[role="dialog"]', /add variable/);
    await sleep(300);
    await editor.clickButtonWithText('[role="dialog"]', /add variable/);
    await sleep(300);
    await editor.clickButtonWithText('[role="dialog"]', /^apply$/);
    await editor.waitUntil(
      'dialog closed',
      async () => !(await editor.page.$(dialog))
    );
    await sleep(300);

    const getCount = async () =>
      (await editor.getVariableNames('#object-properties-editor')).length;
    expectEqual(await getCount(), 2, 'applied');
    await editor.selectInstancesOf('MyObject');
    await editor.undo();
    expectEqual(await editor.getPanel(), 'object:OtherObject', 'after undo');
    expectEqual(await getCount(), 1, 'undo 1');
    await editor.undo();
    expectEqual(await getCount(), 0, 'undo 2');
    await editor.redo();
    await editor.redo();
    expectEqual(await getCount(), 2, 'redo 2');
  },

  'group change is revealed even if an instance gets selected': async editor => {
    const panel = '#object-group-properties-editor';
    await editor.selectGroup('MyGroup');
    await editor.clickSectionHeaderButton('group-variables-section', 'add');
    await sleep(HISTORY_SAVE_DELAY);
    expectEqual(await editor.getVariableNames(panel), ['Variable'], 'added');
    await editor.selectInstancesOf('MyObject');

    await editor.undo();
    expectEqual(await editor.getPanel(), 'group', 'panel after undo');
    expectEqual(await editor.getVariableNames(panel), [], 'after undo');

    await editor.selectInstancesOf('MyObject');
    await editor.redo();
    expectEqual(await editor.getPanel(), 'group', 'panel after redo');
    expectEqual(await editor.getVariableNames(panel), ['Variable'], 'redo');
  },

  'undo shortcut inside a dialog leaves the scene history alone': async editor => {
    await editor.clickSectionHeaderButton('scene-variables-section', 'add');
    await sleep(HISTORY_SAVE_DELAY);
    await editor.clickSectionHeaderButton(
      'scene-variables-section',
      'open-editor'
    );
    await editor.page.waitForSelector('#scene-variables-dialog');
    await (await editor.page.$(
      '[role="dialog"] #variable-0-text-value'
    )).click();
    await editor.page.keyboard.down('Control');
    await editor.page.keyboard.press('z');
    await editor.page.keyboard.up('Control');
    await sleep(500);
    await editor.clickButtonWithText('[role="dialog"]', /^cancel$/);
    await editor.waitUntil(
      'dialog closed',
      async () => !(await editor.page.$('#scene-variables-dialog'))
    );

    expectEqual(
      (await editor.getVariableNames('#scene-properties-editor')).length,
      3,
      'variables after the shortcut in the dialog'
    );
  },
});

const makeKeyboardOnlyUndoScenario = ({
  select,
  panel,
  section,
}) => async editor => {
  await select(editor);
  await editor.unfoldVariablesSection(panel, section);
  const field = index => `${panel} #variable-${index}-text-value`;
  await editor.setFieldValue(field(0), '100');
  await editor.setFieldValue(field(1), '200');
  // Edit again, and stay in the field - like a user would.
  const lastField = await editor.page.$(field(1));
  await lastField.click({ clickCount: 3 });
  await editor.page.keyboard.type('300');
  await sleep(HISTORY_SAVE_DELAY);

  const expectedValues = [['100', '200'], ['100', '2'], ['1', '2']];
  for (const [index, expected] of expectedValues.entries()) {
    await editor.pressRawUndo();
    expectEqual(
      await editor.getFocusLocation(),
      'editor',
      `focus after undo ${index + 1}`
    );
    expectEqual(
      [
        await editor.getFieldValue(field(0)),
        await editor.getFieldValue(field(1)),
      ],
      expected,
      `values after undo ${index + 1}`
    );
  }
};

const makeKeyboardOnlyUndoOfAdditionsScenario = ({
  select,
  panel,
  section,
}) => async editor => {
  await select(editor);
  const getCount = async () => (await editor.getVariableNames(panel)).length;
  const initialCount = await getCount();
  // Adding a variable gives the focus to its name field.
  await editor.clickSectionHeaderButton(section, 'add');
  await sleep(HISTORY_SAVE_DELAY);
  await editor.clickSectionHeaderButton(section, 'add');
  await sleep(HISTORY_SAVE_DELAY);
  expectEqual(await getCount(), initialCount + 2, 'variables added');

  for (const index of [1, 2]) {
    await editor.pressRawUndo();
    expectEqual(
      await editor.getFocusLocation(),
      'editor',
      `focus after undo ${index}`
    );
    expectEqual(await getCount(), initialCount + 2 - index, `undo ${index}`);
  }
};

const variablesPanels = {
  object: {
    select: editor => editor.selectObjectInList('VariablesObject'),
    panel: '#object-properties-editor',
    section: 'object-variables-section',
  },
  scene: {
    select: async () => {},
    panel: '#scene-properties-editor',
    section: 'scene-variables-section',
  },
};
Object.keys(variablesPanels).forEach(name => {
  scenarios[
    `${name} variables additions can be undone with the keyboard only`
  ] = makeKeyboardOnlyUndoOfAdditionsScenario(variablesPanels[name]);
});

const makeKeyboardOnlyUndoAfterDialogScenario = ({
  select,
  panel,
  section,
  dialog,
}) => async editor => {
  await select(editor);
  await editor.unfoldVariablesSection(panel, section);
  await editor.realClickSectionHeaderButton(section, 'open-editor');
  await editor.page.waitForSelector(dialog);
  await sleep(500);
  await editor.setFieldValue(`${dialog} #variable-0-text-value`, '100');
  await editor.setFieldValue(`${dialog} #variable-1-text-value`, '200');
  await editor.realClickButtonWithText('[role="dialog"]', /^apply$/);
  await editor.waitUntil(
    'dialog closed',
    async () => !(await editor.page.$(dialog))
  );
  await sleep(500);

  const getValues = async () => [
    await editor.getFieldValue(`${panel} #variable-0-text-value`),
    await editor.getFieldValue(`${panel} #variable-1-text-value`),
  ];
  expectEqual(await getValues(), ['100', '200'], 'applied');
  for (const index of [1, 2]) {
    await editor.pressRawUndo();
    expectEqual(
      await editor.getFocusLocation(),
      'editor',
      `focus after undo ${index}`
    );
    expectEqual(
      (await getValues()).filter(value => ['1', '2'].includes(value)).length,
      index,
      `variables reverted after undo ${index}`
    );
  }
};

scenarios[
  'instance variables dialog changes can be undone with the keyboard only'
] = makeKeyboardOnlyUndoAfterDialogScenario({
  select: editor => editor.selectInstancesOf('MyObject'),
  panel: '#instance-properties-editor',
  section: 'instance-variables-section',
  dialog: '#instance-variables-dialog',
});
scenarios[
  'object variables dialog changes can be undone with the keyboard only'
] = makeKeyboardOnlyUndoAfterDialogScenario({
  select: editor => editor.selectObjectInList('VariablesObject'),
  panel: '#object-properties-editor',
  section: 'object-variables-section',
  dialog: '#object-editor-dialog',
});
scenarios[
  'scene variables dialog changes can be undone with the keyboard only'
] = makeKeyboardOnlyUndoAfterDialogScenario({
  select: async () => {},
  panel: '#scene-properties-editor',
  section: 'scene-variables-section',
  dialog: '#scene-variables-dialog',
});

const makeUndoTwiceHoldingControlScenario = is3D => async editor => {
  if (is3D) await editor.switchTo3D();
  const panel = '#scene-properties-editor';
  await editor.unfoldVariablesSection(panel, 'scene-variables-section');
  await editor.setFieldValue(`${panel} #variable-0-text-value`, '100');
  const lastField = await editor.page.$(`${panel} #variable-1-text-value`);
  await lastField.click({ clickCount: 3 });
  await editor.page.keyboard.type('200');
  await sleep(HISTORY_SAVE_DELAY);

  await editor.pressRawUndoTwiceHoldingControl();
  expectEqual(
    [
      await editor.getFieldValue(`${panel} #variable-0-text-value`),
      await editor.getFieldValue(`${panel} #variable-1-text-value`),
    ],
    ['1', '2'],
    'values after undoing twice'
  );
};
scenarios[
  'undo twice while holding Control (2D editor)'
] = makeUndoTwiceHoldingControlScenario(false);
if (with3D)
  scenarios[
    'undo twice while holding Control (3D editor)'
  ] = makeUndoTwiceHoldingControlScenario(true);

const makeDimensionsScenario = is3D => async editor => {
  if (is3D) await editor.switchTo3D();
  await editor.selectInstancesOf('MyCube');
  const field = name => `#instance-properties-editor [id="${name}"]`;
  const getDimensions = async () => [
    await editor.getFieldValue(field('Width')),
    await editor.getFieldValue(field('Height')),
    await editor.getFieldValue(field('Depth')),
  ];
  try {
    await editor.waitUntil(
      'default dimensions to be known',
      async () => (await getDimensions()).join() === '100,100,100',
      20000
    );
  } catch (error) {
    throw new Error(
      `Default dimensions never known: ${(await getDimensions()).join()}`
    );
  }

  // Undo a change not related to the dimensions: they must never show 0.
  await editor.setFieldValue(field('X'), '450');
  await editor.focusEditor();
  const { keyboard } = editor.page;
  await keyboard.down('Control');
  await keyboard.down('KeyZ');
  const seenDimensions = new Set();
  for (let i = 0; i < 40; i++) {
    seenDimensions.add((await getDimensions()).join());
    await sleep(40);
  }
  await keyboard.up('KeyZ');
  await keyboard.up('Control');
  expectEqual(await editor.getFieldValue(field('X')), '500', 'X after undo');
  expectEqual(
    [...seenDimensions],
    ['100,100,100'],
    'dimensions seen while undoing a position change'
  );

  // Undo a change of a dimension.
  const expectWidthIn3DEditor = async (expected, description) => {
    if (!is3D) return;
    let width = null;
    try {
      await editor.waitUntil(
        description,
        async () =>
          (width = await editor.getWidthIn3DEditor('MyCube')) === expected,
        15000
      );
    } catch (error) {
      expectEqual(width, expected, `width in the 3D editor ${description}`);
    }
  };
  await editor.setFieldValue(field('Width'), '150');
  expectEqual(await getDimensions(), ['150', '100', '100'], 'width changed');
  await expectWidthIn3DEditor(150, 'after the change');
  await editor.undo();
  expectEqual(await getDimensions(), ['100', '100', '100'], 'after undo');
  await expectWidthIn3DEditor(100, 'after undo');
  await editor.redo();
  expectEqual(await getDimensions(), ['150', '100', '100'], 'after redo');
  await expectWidthIn3DEditor(150, 'after redo');
};
scenarios[
  'instance dimensions survive undo/redo (2D editor)'
] = makeDimensionsScenario(false);
if (with3D)
  scenarios[
    'instance dimensions survive undo/redo (3D editor)'
  ] = makeDimensionsScenario(true);

// Changes made to the fixture project for a scenario, by scenario name.
const fixtureSetups = {};

const arrayScenarioName =
  'children of a scene array variable are never duplicated or lost';
fixtureSetups[arrayScenarioName] = project => {
  project.layouts[0].variables.push({
    name: 'MyArray',
    type: 'array',
    folded: false,
    children: [{ type: 'number', value: 10 }, { type: 'number', value: 20 }],
  });
};
scenarios[arrayScenarioName] = async editor => {
  const panel = '#scene-properties-editor';
  await editor.unfoldVariablesSection(panel, 'scene-variables-section');
  const getValueFields = () =>
    editor.page.evaluate(panel => {
      return Array.from(
        document.querySelectorAll(`${panel} input[id$="-text-value"]`)
      )
        .filter(input => !input.disabled)
        .map(input => ({ id: input.id, value: input.value }));
    }, panel);
  const getValues = async () =>
    (await getValueFields()).map(field => field.value);
  const initialValues = ['1', '2', '10', '20'];
  expectEqual(await getValues(), initialValues, 'initial values');

  // The ids of the fields are not unique (children restart at 0): use the
  // position of the field.
  const firstChildField = (await editor.page.evaluateHandle(
    panel =>
      Array.from(
        document.querySelectorAll(`${panel} input[id$="-text-value"]`)
      ).filter(input => !input.disabled)[2],
    panel
  )).asElement();
  await firstChildField.click({ clickCount: 3 });
  await editor.page.keyboard.type('99');
  await editor.page.keyboard.press('Tab');
  await sleep(HISTORY_SAVE_DELAY);
  const changedValues = ['1', '2', '99', '20'];
  expectEqual(await getValues(), changedValues, 'after the change');

  for (let i = 0; i < 3; i++) {
    await editor.undo();
    expectEqual(await getValues(), initialValues, `undo (round ${i + 1})`);
    await editor.redo();
    expectEqual(await getValues(), changedValues, `redo (round ${i + 1})`);
  }

  // A change to another variable must not touch the array either.
  await editor.setFieldValue(`${panel} #variable-0-text-value`, '555');
  const otherChangedValues = ['555', '2', '99', '20'];
  expectEqual(await getValues(), otherChangedValues, 'other variable changed');
  for (let i = 0; i < 2; i++) {
    await editor.undo();
    expectEqual(await getValues(), changedValues, `other undo ${i + 1}`);
    await editor.redo();
    expectEqual(await getValues(), otherChangedValues, `other redo ${i + 1}`);
  }
};

const structureScenarioName =
  'renaming a child of a scene structure variable can be undone';
fixtureSetups[structureScenarioName] = project => {
  project.layouts[0].variables.push({
    name: 'MyStructure',
    type: 'structure',
    folded: false,
    children: [{ name: 'Child', type: 'number', value: 5 }],
  });
};
scenarios[structureScenarioName] = async editor => {
  const panel = '#scene-properties-editor';
  await editor.unfoldVariablesSection(panel, 'scene-variables-section');
  const getNames = () =>
    editor.page.evaluate(
      panel =>
        Array.from(
          document.querySelectorAll(`${panel} input[id$="-name"]`)
        ).map(input => input.value),
      panel
    );
  const initialNames = ['VarA', 'VarB', 'MyStructure', 'Child'];
  expectEqual(await getNames(), initialNames, 'initial names');

  const childNameField = (await editor.page.evaluateHandle(
    panel =>
      Array.from(document.querySelectorAll(`${panel} input[id$="-name"]`)).find(
        input => input.value === 'Child'
      ),
    panel
  )).asElement();
  await childNameField.click({ clickCount: 3 });
  await editor.page.keyboard.type('Renamed');
  await editor.page.keyboard.press('Tab');
  await sleep(HISTORY_SAVE_DELAY);
  const renamedNames = ['VarA', 'VarB', 'MyStructure', 'Renamed'];
  expectEqual(await getNames(), renamedNames, 'after renaming');

  for (let i = 0; i < 2; i++) {
    await editor.undo();
    expectEqual(await getNames(), initialNames, `undo (round ${i + 1})`);
    await editor.redo();
    expectEqual(await getNames(), renamedNames, `redo (round ${i + 1})`);
  }

  // Renaming a top level variable is a single step too (not one per letter).
  const rootNameField = (await editor.page.evaluateHandle(
    panel =>
      Array.from(document.querySelectorAll(`${panel} input[id$="-name"]`)).find(
        input => input.value === 'VarA'
      ),
    panel
  )).asElement();
  await rootNameField.click({ clickCount: 3 });
  await editor.page.keyboard.type('Score');
  await editor.page.keyboard.press('Tab');
  await sleep(HISTORY_SAVE_DELAY);
  expectEqual(
    await getNames(),
    ['Score', 'VarB', 'MyStructure', 'Renamed'],
    'after renaming the top level variable'
  );
  await editor.undo();
  expectEqual(await getNames(), renamedNames, 'undo of the top level rename');
};

const makeEffectHighlightScenario = (
  effectName,
  fieldId,
  { closeLayersList } = {}
) => async editor => {
  await editor.selectLayer('Background');
  // Unfold the section of the effect if needed.
  const sectionId =
    effectName === 'My3DEffect'
      ? 'layer-3d-effects-section'
      : 'layer-2d-effects-section';
  const field = `#layer-properties-editor [id="effect-panel-${effectName}"] [id="${fieldId}"]`;
  const isFieldVisible = () =>
    editor.page.evaluate(field => {
      const element = document.querySelector(field);
      return !!element && element.getClientRects().length > 0;
    }, field);
  if (!(await isFieldVisible())) {
    await editor.page.evaluate(sectionId => {
      document
        .getElementById(sectionId)
        .querySelector('button')
        .click();
    }, sectionId);
    await editor.waitUntil('effect field visible', isFieldVisible);
  }
  await editor.setFieldValue(field, '0.5');
  if (closeLayersList) {
    // The effects are shown in the properties panel: the layers list is
    // not needed to see them.
    await (await editor.page.$('#toolbar-open-layers-panel-button')).click();
    await editor.waitUntil(
      'layers list closed',
      async () => !(await editor.page.$('#layers-list'))
    );
    expectEqual(await editor.getPanel(), 'layer', 'panel with the list closed');
  }

  // Record every element highlighted from now on.
  await editor.page.evaluate(() => {
    window.__highlighted = new Set();
    new MutationObserver(mutations => {
      mutations.forEach(({ target }) => {
        if (target.classList.contains('undo-redo-property-flash'))
          window.__highlighted.add(
            target.id || target.textContent.slice(0, 30)
          );
      });
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  });
  await editor.undo();
  await sleep(1500);
  expectEqual(
    await editor.page.evaluate(() => [...window.__highlighted]),
    [`effect-panel-${effectName}`],
    'highlighted elements'
  );
};
const effectsFixtureSetup = project => {
  project.layouts[0].layers[1].effects = [
    {
      name: 'My2DEffect',
      effectType: 'Sepia',
      doubleParameters: { opacity: 1 },
      stringParameters: {},
      booleanParameters: {},
    },
    {
      name: 'My3DEffect',
      effectType: 'Scene3D::Exposure',
      doubleParameters: { exposure: 1 },
      stringParameters: {},
      booleanParameters: {},
    },
  ];
};
[
  [
    'undoing a 2D layer effect change highlights this effect',
    'My2DEffect',
    'opacity',
  ],
  [
    'undoing a 3D layer effect change highlights this effect',
    'My3DEffect',
    'exposure',
  ],
].forEach(([name, effectName, fieldId]) => {
  fixtureSetups[name] = effectsFixtureSetup;
  scenarios[name] = makeEffectHighlightScenario(effectName, fieldId);
});
{
  const name =
    'undoing a layer effect change highlights it with the layers list closed';
  fixtureSetups[name] = effectsFixtureSetup;
  scenarios[name] = makeEffectHighlightScenario('My2DEffect', 'opacity', {
    closeLayersList: true,
  });
}

const makeFoldedSectionScenario = ({
  select,
  panel,
  section,
}) => async editor => {
  await select(editor);
  await editor.unfoldVariablesSection(panel, section);
  const field = `${panel} #variable-0-text-value`;
  await editor.setFieldValue(field, '100');

  // Fold the section: the change to undo is now hidden.
  await editor.page.evaluate(section => {
    document
      .getElementById(section)
      .querySelector('button')
      .click();
  }, section);
  const isFieldVisible = () =>
    editor.page.evaluate(field => {
      const element = document.querySelector(field);
      return !!element && element.getClientRects().length > 0;
    }, field);
  await editor.waitUntil(
    'section folded',
    async () => !(await isFieldVisible())
  );

  // Record the rows of variables highlighted from now on.
  await editor.page.evaluate(() => {
    window.__highlightedVariables = new Set();
    new MutationObserver(mutations => {
      mutations.forEach(({ target }) => {
        const nodeId = target.getAttribute('data-variable-node-id');
        if (nodeId && target.classList.contains('undo-redo-property-flash'))
          window.__highlightedVariables.add(nodeId);
      });
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  });
  await editor.undo();
  await sleep(1500);
  expectEqual(await isFieldVisible(), true, 'changed variable visible');
  expectEqual(await editor.getFieldValue(field), '1', 'value after undo');
  expectEqual(
    (await editor.page.evaluate(() => [...window.__highlightedVariables]))
      .length,
    1,
    'highlighted variables'
  );
};
const foldedSectionPanels = {
  instance: {
    select: editor => editor.selectInstancesOf('MyObject'),
    panel: '#instance-properties-editor',
    section: 'instance-variables-section',
  },
  ...variablesPanels,
};
Object.keys(foldedSectionPanels).forEach(name => {
  scenarios[
    `undo unfolds the section of a changed ${name} variable`
  ] = makeFoldedSectionScenario(foldedSectionPanels[name]);
});

scenarios[
  'undo unfolds the properties section of a changed object'
] = async editor => {
  await editor.selectObjectInList('MyCube');
  const field = '#object-properties-editor [id="width"]';
  const isFieldVisible = () =>
    editor.page.evaluate(field => {
      const element = document.querySelector(field);
      return !!element && element.getClientRects().length > 0;
    }, field);
  const clickIfPresent = id =>
    editor.page.evaluate(id => {
      const button = document.getElementById(id);
      if (button) button.click();
    }, id);
  await clickIfPresent('object-properties-section-unfold-button');
  await editor.waitUntil('properties unfolded', isFieldVisible);
  await editor.setFieldValue(field, '200');
  await clickIfPresent('object-properties-section-fold-button');
  await editor.waitUntil(
    'properties folded',
    async () => !(await isFieldVisible())
  );

  await editor.page.evaluate(() => {
    window.__highlighted = new Set();
    new MutationObserver(mutations => {
      mutations.forEach(({ target }) => {
        if (target.classList.contains('undo-redo-property-flash'))
          window.__highlighted.add(target.id);
      });
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  });
  await editor.undo();
  await sleep(1200);
  expectEqual(await isFieldVisible(), true, 'changed field visible');
  expectEqual(await editor.getFieldValue(field), '100', 'width after undo');
  expectEqual(
    await editor.page.evaluate(() => [...window.__highlighted]),
    ['width'],
    'highlighted elements'
  );
};

const behaviorFixtureSetup = project => {
  project.layouts[0].objects[0].behaviors = [
    {
      name: 'DestroyOutside',
      type: 'DestroyOutsideBehavior::DestroyOutside',
      extraBorder: 0,
    },
  ];
};
const makeBehaviorScenario = ({
  select,
  panel,
  expectedPanel,
  action,
}) => async editor => {
  await select(editor);
  const isVisible = selector =>
    editor.page.evaluate(selector => {
      const element = document.querySelector(selector);
      return !!element && element.getClientRects().length > 0;
    }, selector);
  const clickIfPresent = selector =>
    editor.page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (element) element.click();
    }, selector);
  const behaviorPanel = `${panel} [id="behavior-panel-DestroyOutside"]`;
  const field = `${behaviorPanel} [id="extraBorder"]`;
  await clickIfPresent(`${panel} #behaviors-section-unfold-button`);
  await editor.waitUntil('behavior listed', () => isVisible(behaviorPanel));
  if (!(await isVisible(field))) {
    // Unfold the behavior itself.
    await clickIfPresent(`${behaviorPanel} button`);
    await editor.waitUntil('behavior unfolded', () => isVisible(field));
  }

  if (action === 'edit') {
    await editor.setFieldValue(field, '50');
    await editor.undo();
    expectEqual(await editor.getPanel(), expectedPanel, 'panel after undo');
    expectEqual(await editor.getFieldValue(field), '0', 'after undo');
    await editor.redo();
    expectEqual(await editor.getFieldValue(field), '50', 'after redo');
  } else {
    await clickIfPresent(`${behaviorPanel} #remove-behavior`);
    await sleep(500);
    if (await editor.page.$('[role="dialog"]'))
      await editor.clickButtonWithText(
        '[role="dialog"]',
        /^(confirm|remove|yes|delete)/
      );
    await editor.waitUntil(
      'behavior removed',
      async () => !(await isVisible(behaviorPanel))
    );
    await sleep(HISTORY_SAVE_DELAY);
    await editor.undo();
    expectEqual(await editor.getPanel(), expectedPanel, 'panel after undo');
    expectEqual(await isVisible(behaviorPanel), true, 'behavior is back');
    await editor.redo();
    expectEqual(await isVisible(behaviorPanel), false, 'removed after redo');
  }
};
[
  [
    'group',
    editor => editor.selectGroup('MyGroup'),
    '#object-group-properties-editor',
    'group',
  ],
  [
    'object',
    editor => editor.selectObjectInList('MyObject'),
    '#object-properties-editor',
    'object:MyObject',
  ],
].forEach(([kind, select, panel, expectedPanel]) => {
  [['edit', 'change'], ['remove', 'removal']].forEach(([action, label]) => {
    const name = `${kind} behavior ${label} can be undone`;
    fixtureSetups[name] = behaviorFixtureSetup;
    scenarios[name] = makeBehaviorScenario({
      select,
      panel,
      expectedPanel,
      action,
    });
  });
});

// Two variables edited as fast as possible must still be two undo steps.
const makeFastVariableEditsScenario = ({
  select,
  panel,
  section,
}) => async editor => {
  await select(editor);
  await editor.unfoldVariablesSection(panel, section);
  const fields = [0, 1].map(index => `${panel} #variable-${index}-text-value`);
  const getValues = async () => [
    await editor.getFieldValue(fields[0]),
    await editor.getFieldValue(fields[1]),
  ];
  expectEqual(await getValues(), ['1', '2'], 'initial values');

  const { page } = editor;
  await (await page.$(fields[0])).click({ clickCount: 3 });
  await page.keyboard.type('134');
  await (await page.$(fields[1])).click({ clickCount: 3 });
  await page.keyboard.type('5');
  await sleep(HISTORY_SAVE_DELAY + 500);
  expectEqual(await getValues(), ['134', '5'], 'after the edits');

  await editor.undo();
  expectEqual(await getValues(), ['134', '2'], 'after the first undo');
  await editor.undo();
  expectEqual(await getValues(), ['1', '2'], 'after the second undo');
  await editor.redo();
  expectEqual(await getValues(), ['134', '2'], 'after the first redo');
  await editor.redo();
  expectEqual(await getValues(), ['134', '5'], 'after the second redo');
};
const fastEditsPanels = {
  ...foldedSectionPanels,
  group: {
    select: editor => editor.selectGroup('VariablesGroup'),
    panel: '#object-group-properties-editor',
    section: 'group-variables-section',
  },
};
Object.keys(fastEditsPanels).forEach(name => {
  const scenarioName = `fast edits of two ${name} variables are two undo steps`;
  fixtureSetups[scenarioName] = project => {
    project.layouts[0].objectsGroups.push({
      name: 'VariablesGroup',
      objects: [{ name: 'VariablesObject' }],
    });
  };
  scenarios[scenarioName] = makeFastVariableEditsScenario(
    fastEditsPanels[name]
  );
});

scenarios[
  'undo of a layer property change shows and highlights the property'
] = async editor => {
  await editor.selectLayer('Background');
  const field = '#layer-properties-editor [id="Near plane distance"]';
  const isFieldVisible = () =>
    editor.page.evaluate(field => {
      const element = document.querySelector(field);
      return !!element && element.getClientRects().length > 0;
    }, field);
  await editor.page.evaluate(() => {
    const button = document.getElementById(
      'layer-properties-section-unfold-button'
    );
    if (button) button.click();
  });
  try {
    await editor.waitUntil('layer properties unfolded', isFieldVisible);
  } catch (error) {
    const ids = await editor.page.evaluate(() =>
      Array.from(
        document.querySelectorAll('#layer-properties-editor [id]')
      ).map(element => element.id)
    );
    throw new Error(`Field not found. Ids in the panel: ${ids.join(', ')}`);
  }
  const initialValue = await editor.getFieldValue(field);
  await editor.setFieldValue(field, '7');

  await editor.page.evaluate(() => {
    window.__highlighted = new Set();
    new MutationObserver(mutations => {
      mutations.forEach(({ target }) => {
        if (target.classList.contains('undo-redo-property-flash'))
          window.__highlighted.add(target.id);
      });
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  });
  await editor.undo();
  await sleep(1200);
  expectEqual(await editor.getPanel(), 'layer', 'panel after undo');
  expectEqual(await isFieldVisible(), true, 'changed property visible');
  expectEqual(await editor.getFieldValue(field), initialValue, 'after undo');
  expectEqual(
    await editor.page.evaluate(() => [...window.__highlighted]),
    ['Near plane distance'],
    'highlighted elements'
  );
};

if (with3D) {
  const getHiddenMarkersCount = editor => {
    const frame = editor.page
      .frames()
      .find(frame => /in-game-editor-preview/.test(frame.url()));
    return frame.evaluate(() => {
      const game = window.__game;
      if (!game || !game._inGameEditor) return 'no game';
      let visibleMarkers = 0;
      game._inGameEditor._hiddenInstanceMarkers.forEach(marker => {
        // The material only gets visible once the icon is loaded.
        if (marker.parent && marker.visible && marker.material.visible)
          visibleMarkers++;
      });
      return visibleMarkers;
    });
  };
  const expectHiddenMarkersCount = async (editor, expected, description) => {
    let count = null;
    try {
      await editor.waitUntil(
        description,
        async () => (count = await getHiddenMarkersCount(editor)) === expected,
        15000
      );
    } catch (error) {
      expectEqual(count, expected, `hidden markers ${description}`);
    }
  };

  const startsHiddenName =
    'an instance hidden at start has its marker in the 3D editor';
  fixtureSetups[startsHiddenName] = project => {
    project.layouts[0].instances[1].hidden = true;
  };
  scenarios[startsHiddenName] = async editor => {
    await editor.switchTo3D();
    await expectHiddenMarkersCount(editor, 1, 'after opening the 3D editor');
  };

  scenarios[
    'hiding an instance shows its marker in the 3D editor, with undo/redo'
  ] = async editor => {
    await editor.switchTo3D();
    await editor.selectInstancesOf('MyCube');
    await expectHiddenMarkersCount(editor, 0, 'before hiding');
    const toggle = await editor.page.waitForSelector(
      '#instance-properties-editor [id="Hide instance"]'
    );
    await toggle.click();
    await sleep(HISTORY_SAVE_DELAY);
    await expectHiddenMarkersCount(editor, 1, 'after hiding');
    await editor.undo();
    await expectHiddenMarkersCount(editor, 0, 'after undo');
    await editor.redo();
    await expectHiddenMarkersCount(editor, 1, 'after redo');
  };
}

scenarios[
  'fast edits of two instance fields are two undo steps'
] = async editor => {
  await editor.selectInstancesOf('MyObject');
  const x = '#instance-properties-editor [id="X"]';
  const y = '#instance-properties-editor [id="Y"]';
  const getValues = async () => [
    await editor.getFieldValue(x),
    await editor.getFieldValue(y),
  ];
  const { page } = editor;
  await (await page.$(x)).click({ clickCount: 3 });
  await page.keyboard.type('450');
  await (await page.$(y)).click({ clickCount: 3 });
  await page.keyboard.type('260');
  await page.keyboard.press('Tab');
  await sleep(HISTORY_SAVE_DELAY);
  expectEqual(await getValues(), ['450', '260'], 'after the edits');

  await editor.undo();
  expectEqual(await getValues(), ['450', '245'], 'after the first undo');
  await editor.undo();
  expectEqual(await getValues(), ['297', '245'], 'after the second undo');
  await editor.redo();
  await editor.redo();
  expectEqual(await getValues(), ['450', '260'], 'after two redos');
};

{
  const name = 'instance behavior change can be undone and is revealed';
  fixtureSetups[name] = behaviorFixtureSetup;
  scenarios[name] = async editor => {
    await editor.selectInstancesOf('MyObject');
    const panel = '#instance-properties-editor';
    const behaviorPanel = `${panel} [id="behavior-panel-DestroyOutside"]`;
    const field = `${behaviorPanel} [id="extraBorder"]`;
    const isVisible = selector =>
      editor.page.evaluate(selector => {
        const element = document.querySelector(selector);
        return !!element && element.getClientRects().length > 0;
      }, selector);
    const clickIfPresent = selector =>
      editor.page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
      }, selector);
    await clickIfPresent(`${panel} #behaviors-section-unfold-button`);
    await editor.waitUntil('behavior listed', () => isVisible(behaviorPanel));
    if (!(await isVisible(field))) {
      await clickIfPresent(`${behaviorPanel} button`);
      await editor.waitUntil('behavior unfolded', () => isVisible(field));
    }
    await editor.setFieldValue(field, '50');
    // Fold the section: the undo must reopen it.
    await clickIfPresent(`${panel} #behaviors-section-fold-button`);
    await editor.waitUntil(
      'behaviors folded',
      async () => !(await isVisible(field))
    );
    await editor.deselectAll();

    await editor.undo();
    await sleep(800);
    expectEqual(await editor.getPanel(), 'instance', 'panel after undo');
    // The section is unfolded and the behavior highlighted (its own panel
    // keeps its folded state, like the behaviors and effects of objects).
    expectEqual(await isVisible(behaviorPanel), true, 'behavior visible');
    expectEqual(
      await editor.page.evaluate(
        () =>
          !!document.querySelector(
            '[id="behavior-panel-DestroyOutside"].undo-redo-property-flash'
          )
      ),
      true,
      'behavior highlighted'
    );
    const readValue = async () => {
      if (!(await isVisible(field))) {
        await clickIfPresent(`${behaviorPanel} button`);
        await editor.waitUntil('behavior unfolded', () => isVisible(field));
      }
      return editor.getFieldValue(field);
    };
    expectEqual(await readValue(), '0', 'value after undo');
    await editor.redo();
    expectEqual(await readValue(), '50', 'value after redo');
  };
}

scenarios['renaming an object can be undone'] = async editor => {
  const { page } = editor;
  const hasObject = name =>
    page.evaluate(
      name =>
        !!document.querySelector(`#objects-list [data-object-name="${name}"]`),
      name
    );
  // A real click, to give the focus to the list for the rename shortcut.
  await (await page.$('#objects-list [data-object-name="MyObject"]')).click();
  await sleep(300);
  await page.keyboard.press('F2');
  await sleep(300);
  await page.keyboard.type('RenamedObject');
  await page.keyboard.press('Enter');
  await editor.waitUntil('object renamed', () => hasObject('RenamedObject'));
  await sleep(HISTORY_SAVE_DELAY);

  await editor.undo();
  await editor.waitUntil('name restored', () => hasObject('MyObject'));
  expectEqual(await hasObject('RenamedObject'), false, 'new name after undo');
  // Its instance follows.
  await editor.selectInstancesOf('MyObject');
  await editor.redo();
  await editor.waitUntil('renamed again', () => hasObject('RenamedObject'));
  expectEqual(await hasObject('MyObject'), false, 'old name after redo');
};

scenarios[
  'history is kept when going to the events and back'
] = async editor => {
  const x = '#instance-properties-editor [id="X"]';
  await editor.selectInstancesOf('MyObject');
  await editor.setFieldValue(x, '450');

  const clickTab = async label => {
    const handle = await editor.page.evaluateHandle(label => {
      const elements = Array.from(document.querySelectorAll('span, p, div'));
      return elements.find(
        element =>
          element.children.length === 0 && element.textContent === label
      );
    }, label);
    await handle.asElement().click();
    await sleep(1500);
  };
  await clickTab('Scene (Events)');
  expectEqual(
    await editor.page.evaluate(
      () => !!document.querySelector('#scene-editor[data-active]')
    ),
    false,
    'scene editor active while on the events'
  );
  await clickTab('Scene');
  await editor.waitUntil('scene editor active again', () =>
    editor.page.evaluate(
      () => !!document.querySelector('#scene-editor[data-active]')
    )
  );

  await editor.undo();
  expectEqual(await editor.getPanel(), 'instance', 'panel after undo');
  expectEqual(await editor.getFieldValue(x), '297', 'X after undo');
};

const isPropertiesPanelOpen = editor =>
  editor.page.evaluate(
    () =>
      !!document.querySelector(
        '#instance-properties-editor, #scene-properties-editor, #object-properties-editor'
      )
  );
const togglePropertiesPanel = async editor => {
  await (await editor.page.$('#toolbar-open-properties-panel-button')).click();
  await sleep(500);
};

scenarios[
  'undo of a canvas drag does not open the properties panel'
] = async editor => {
  const { page } = editor;
  await togglePropertiesPanel(editor);
  expectEqual(await isPropertiesPanelOpen(editor), false, 'panel closed');

  // Center the view on the middle of the scene, at a known zoom.
  const canvas = await page.$('#scene-editor canvas');
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + 20, box.y + 20);
  await page.keyboard.down('Shift');
  await page.keyboard.press('Digit2');
  await page.keyboard.up('Shift');
  await sleep(500);
  const zoom = 700 / 800;
  const toScreen = (sceneX, sceneY) => [
    box.x + box.width / 2 + (sceneX - 400) * zoom,
    box.y + box.height / 2 + (sceneY - 300) * zoom,
  ];
  // Drag the instance of MyObject (at 297;245).
  const [startX, startY] = toScreen(297 + 10, 245 + 10);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 40, startY + 20, { steps: 5 });
  await page.mouse.move(startX + 100, startY + 50, { steps: 10 });
  await sleep(200);
  await page.mouse.up();
  await sleep(HISTORY_SAVE_DELAY);

  // Check the instance was moved (opening a panel is not a change).
  const x = '#instance-properties-editor [id="X"]';
  await togglePropertiesPanel(editor);
  await page.waitForSelector(x);
  const movedX = await editor.getFieldValue(x);
  if (movedX === '297') throw new Error('The instance was not dragged.');
  await togglePropertiesPanel(editor);
  expectEqual(await isPropertiesPanelOpen(editor), false, 'panel closed again');

  await editor.undo();
  expectEqual(
    await isPropertiesPanelOpen(editor),
    false,
    'panel open after undoing a canvas change'
  );
  await togglePropertiesPanel(editor);
  await page.waitForSelector(x);
  expectEqual(await editor.getFieldValue(x), '297', 'X after undo');
};

scenarios[
  'undo of a change made in a closed panel opens this panel again'
] = async editor => {
  const x = '#instance-properties-editor [id="X"]';
  await editor.selectInstancesOf('MyObject');
  await editor.setFieldValue(x, '450');
  await togglePropertiesPanel(editor);
  expectEqual(await isPropertiesPanelOpen(editor), false, 'panel closed');

  await editor.undo();
  await editor.waitUntil('panel open again', () =>
    isPropertiesPanelOpen(editor)
  );
  expectEqual(await editor.getFieldValue(x), '297', 'X after undo');
};

scenarios[
  'scrolling a number field is one step, undoable without leaving the field'
] = async editor => {
  const x = '#instance-properties-editor [id="X"]';
  await editor.selectInstancesOf('MyObject');
  await (await editor.page.$(x)).click();
  for (let i = 0; i < 4; i++) {
    await editor.page.evaluate(x => {
      document.querySelector(x).dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -100,
          bubbles: true,
          cancelable: true,
        })
      );
    }, x);
    await sleep(60);
  }
  await sleep(HISTORY_SAVE_DELAY);
  const scrolledX = await editor.getFieldValue(x);
  if (scrolledX === '297') throw new Error('The field was not scrolled.');

  // Still in the field.
  await editor.pressRawUndo();
  expectEqual(await editor.getFieldValue(x), '297', 'X after a single undo');
};

const rightClickAndChoose = async (editor, selector, menuItemRegex) => {
  const row = await editor.page.waitForSelector(selector);
  await row.click({ button: 'right' });
  await editor.clickMenuItem(menuItemRegex);
  await sleep(500);
  // Confirm, if asked.
  if (await editor.page.$('[role="dialog"]')) {
    try {
      await editor.clickButtonWithText(
        '[role="dialog"]',
        /^(confirm|delete|yes|remove|continue)/
      );
    } catch (error) {
      // Not a confirmation dialog.
    }
    await sleep(500);
  }
};
const exists = (editor, selector) =>
  editor.page.evaluate(
    selector => !!document.querySelector(selector),
    selector
  );

scenarios['duplicating an object can be undone'] = async editor => {
  const copy = '#objects-list [data-object-name="MyObject2"]';
  await rightClickAndChoose(
    editor,
    '#objects-list [data-object-name="MyObject"]',
    /^duplicate/i
  );
  await editor.waitUntil('object duplicated', () => exists(editor, copy));
  await editor.undo();
  await editor.waitUntil(
    'duplicate removed',
    async () => !(await exists(editor, copy))
  );
  await editor.redo();
  await editor.waitUntil('duplicate back', () => exists(editor, copy));
};

{
  const name = 'deleting a folder can be undone, with its objects inside';
  fixtureSetups[name] = project => {
    project.layouts[0].objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        { folderName: 'MyFolder', children: [{ objectName: 'OtherObject' }] },
        { objectName: 'MyObject' },
        { objectName: 'VariablesObject' },
        { objectName: 'MyCube' },
      ],
    };
  };
  scenarios[name] = async editor => {
    const folder = '#objects-list [data-folder-name="MyFolder"]';
    const inFolder = '#objects-list [data-object-name="OtherObject"]';
    const atRoot = '#objects-list [data-object-name="MyObject"]';
    // An object inside the folder is more indented than one at the root.
    const getIndentation = selector =>
      editor.page.evaluate(selector => {
        const label = Array.from(
          document.querySelector(selector).querySelectorAll('span, p')
        ).find(element => element.children.length === 0);
        return Math.round(label.getBoundingClientRect().left);
      }, selector);
    // Expand the folder.
    await editor.page.waitForSelector(folder);
    if (!(await exists(editor, inFolder))) {
      await editor.page.evaluate(folder => {
        document
          .querySelector(folder)
          .querySelector('button')
          .click();
      }, folder);
    }
    await editor.page.waitForSelector(inFolder);
    const indentationInFolder = await getIndentation(inFolder);
    const indentationAtRoot = await getIndentation(atRoot);
    if (indentationInFolder <= indentationAtRoot)
      throw new Error('The object is not displayed inside the folder.');

    await rightClickAndChoose(editor, folder, /^delete/i);
    await editor.waitUntil(
      'folder deleted',
      async () => !(await exists(editor, folder))
    );

    await editor.undo();
    await editor.waitUntil('folder back', () => exists(editor, folder));
    if (!(await exists(editor, inFolder))) {
      // Expand the folder again.
      await editor.page.evaluate(folder => {
        document
          .querySelector(folder)
          .querySelector('button')
          .click();
      }, folder);
    }
    await editor.waitUntil('object back', () => exists(editor, inFolder));
    expectEqual(
      await getIndentation(inFolder),
      indentationInFolder,
      'indentation of the object of the folder after undo'
    );
    await editor.redo();
    await editor.waitUntil(
      'folder deleted again',
      async () => !(await exists(editor, folder))
    );
  };
}

scenarios['deleting and renaming a group can be undone'] = async editor => {
  await editor.openPanel('groups');
  const hasGroup = name =>
    editor.page.evaluate(name => {
      const list = document.getElementById('objects-groups-list');
      return Array.from(list.querySelectorAll('span, p')).some(
        element => element.textContent === name
      );
    }, name);
  const groupRow = name =>
    editor.page.evaluateHandle(name => {
      const list = document.getElementById('objects-groups-list');
      return Array.from(list.querySelectorAll('span, p')).find(
        element => element.textContent === name
      );
    }, name);
  await editor.waitUntil('group listed', () => hasGroup('MyGroup'));

  // Rename.
  await (await groupRow('MyGroup')).asElement().click();
  await sleep(300);
  await editor.page.keyboard.press('F2');
  await sleep(300);
  await editor.page.keyboard.type('RenamedGroup');
  await editor.page.keyboard.press('Enter');
  await editor.waitUntil('group renamed', () => hasGroup('RenamedGroup'));
  await sleep(HISTORY_SAVE_DELAY);
  await editor.undo();
  await editor.waitUntil('group name restored', () => hasGroup('MyGroup'));
  expectEqual(await hasGroup('RenamedGroup'), false, 'new name after undo');

  // Delete.
  await (await groupRow('MyGroup')).asElement().click({ button: 'right' });
  await editor.clickMenuItem(/^delete/i);
  await sleep(500);
  if (await editor.page.$('[role="dialog"]'))
    await editor.clickButtonWithText(
      '[role="dialog"]',
      /^(confirm|delete|yes|remove)/
    );
  await editor.waitUntil(
    'group deleted',
    async () => !(await hasGroup('MyGroup'))
  );
  await editor.undo();
  await editor.waitUntil('group back', () => hasGroup('MyGroup'));
};

scenarios['layers list changes can be undone'] = async editor => {
  await editor.openPanel('layers');
  const layerRow = name => `#layers-list [data-scene="${name}"]`;
  const countLayers = () =>
    editor.page.evaluate(
      () => document.querySelectorAll('#layers-list [data-scene]').length
    );
  await editor.page.waitForSelector(layerRow('Background'));
  const initialCount = await countLayers();

  // Add.
  await editor.page.evaluate(() => {
    document.getElementById('add-layer-button').click();
  });
  await editor.waitUntil(
    'layer added',
    async () => (await countLayers()) === initialCount + 1
  );
  await sleep(HISTORY_SAVE_DELAY);
  await editor.undo();
  await editor.waitUntil(
    'added layer removed',
    async () => (await countLayers()) === initialCount
  );

  // Visibility.
  const getVisibilityIcon = () =>
    editor.page.evaluate(selector => {
      const button = document.querySelector(
        `${selector} [id="layer-visibility"]`
      );
      return button ? button.querySelector('svg').innerHTML : null;
    }, layerRow('Background'));
  const visibleIcon = await getVisibilityIcon();
  await editor.page.evaluate(selector => {
    document.querySelector(`${selector} [id="layer-visibility"]`).click();
  }, layerRow('Background'));
  await editor.waitUntil(
    'layer hidden',
    async () => (await getVisibilityIcon()) !== visibleIcon
  );
  await sleep(HISTORY_SAVE_DELAY);
  await editor.undo();
  await editor.waitUntil(
    'layer visible again',
    async () => (await getVisibilityIcon()) === visibleIcon
  );

  // Delete.
  await rightClickAndChoose(editor, layerRow('Background'), /^delete/i);
  await editor.waitUntil(
    'layer deleted',
    async () => !(await exists(editor, layerRow('Background')))
  );
  await editor.undo();
  await editor.waitUntil('layer back', () =>
    exists(editor, layerRow('Background'))
  );
};

scenarios[
  'locking an instance from the instances list can be undone'
] = async editor => {
  await (await editor.page.$(
    '#toolbar-open-instances-list-panel-button'
  )).click();
  await editor.page.waitForSelector('.ReactVirtualized__Table__row');
  const getLockIcon = () =>
    editor.page.evaluate(() => {
      const row = document.querySelector('.ReactVirtualized__Table__row');
      const buttons = row.querySelectorAll('button');
      // Only the icon (the button also contains the click ripples).
      return buttons[buttons.length - 1].querySelector('svg').innerHTML;
    });
  const unlockedIcon = await getLockIcon();
  await editor.page.evaluate(() => {
    const row = document.querySelector('.ReactVirtualized__Table__row');
    const buttons = row.querySelectorAll('button');
    buttons[buttons.length - 1].click();
  });
  await editor.waitUntil(
    'instance locked',
    async () => (await getLockIcon()) !== unlockedIcon
  );
  await sleep(HISTORY_SAVE_DELAY);
  await editor.undo();
  await editor.waitUntil(
    'instance unlocked again',
    async () => (await getLockIcon()) === unlockedIcon
  );
};

scenarios['undo highlights the flip buttons of an instance'] = async editor => {
  await editor.selectInstancesOf('MyObject');
  await editor.page.evaluate(() => {
    document
      .querySelector('#instance-properties-editor [id="Flip"]')
      .querySelector('button')
      .click();
  });
  await sleep(HISTORY_SAVE_DELAY);
  await editor.recordHighlights();
  await editor.undo();
  expectEqual(await editor.getHighlights(), ['Flip'], 'highlighted elements');
};

scenarios['undo highlights a select field of an instance'] = async editor => {
  await editor.selectInstancesOf('MyObject');
  const layerField = '#instance-properties-editor select[id="Layer"]';
  await editor.page.waitForSelector(layerField);
  await editor.page.select(layerField, 'Background');
  await sleep(HISTORY_SAVE_DELAY);
  expectEqual(await editor.getFieldValue(layerField), 'Background', 'changed');
  await editor.recordHighlights();
  await editor.undo();
  expectEqual(await editor.getFieldValue(layerField), '', 'layer after undo');
  expectEqual(await editor.getHighlights(), ['Layer'], 'highlighted elements');
};

{
  const name = 'undo highlights the changed behavior of an object';
  fixtureSetups[name] = behaviorFixtureSetup;
  scenarios[name] = async editor => {
    await editor.selectObjectInList('MyObject');
    const panel = '#object-properties-editor';
    const behaviorPanel = `${panel} [id="behavior-panel-DestroyOutside"]`;
    const field = `${behaviorPanel} [id="extraBorder"]`;
    const isVisible = selector =>
      editor.page.evaluate(selector => {
        const element = document.querySelector(selector);
        return !!element && element.getClientRects().length > 0;
      }, selector);
    const clickIfPresent = selector =>
      editor.page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (element) element.click();
      }, selector);
    await clickIfPresent(`${panel} #behaviors-section-unfold-button`);
    await editor.waitUntil('behavior listed', () => isVisible(behaviorPanel));
    if (!(await isVisible(field))) {
      await clickIfPresent(`${behaviorPanel} button`);
      await editor.waitUntil('behavior unfolded', () => isVisible(field));
    }
    await editor.setFieldValue(field, '50');
    await editor.recordHighlights();
    await editor.undo();
    expectEqual(
      await editor.getHighlights(),
      ['behavior-panel-DestroyOutside'],
      'highlighted elements'
    );
  };
}

{
  const name =
    'removing an object from a group can be undone and is highlighted';
  fixtureSetups[name] = project => {
    project.layouts[0].objectsGroups[0].objects.push({ name: 'OtherObject' });
  };
  scenarios[name] = async editor => {
    await editor.selectGroup('MyGroup');
    await editor.page.evaluate(() => {
      const button = document.getElementById(
        'group-objects-section-unfold-button'
      );
      if (button) button.click();
    });
    const content = '#group-objects-section-content';
    // One remove button per object of the group.
    const getMembersCount = () =>
      editor.page.evaluate(
        content =>
          document
            .querySelector(content)
            .querySelectorAll('button[aria-label="remove"]').length,
        content
      );
    await editor.waitUntil(
      'members listed',
      async () => (await getMembersCount()) === 2
    );
    // Remove the last object of the group.
    await editor.page.evaluate(content => {
      const buttons = document
        .querySelector(content)
        .querySelectorAll('button[aria-label="remove"]');
      buttons[buttons.length - 1].click();
    }, content);
    await editor.waitUntil(
      'member removed',
      async () => (await getMembersCount()) === 1
    );
    await sleep(HISTORY_SAVE_DELAY);

    await editor.recordHighlights();
    await editor.undo();
    expectEqual(await editor.getPanel(), 'group', 'panel after undo');
    expectEqual(await getMembersCount(), 2, 'members after undo');
    expectEqual(
      (await editor.getHighlights()).sort(),
      ['group-objects-section', 'group-row:MyGroup'],
      'highlighted elements'
    );
  };
}

scenarios[
  'undo of an object rename highlights its row in the list'
] = async editor => {
  const { page } = editor;
  await (await page.$('#objects-list [data-object-name="MyObject"]')).click();
  await sleep(300);
  await page.keyboard.press('F2');
  await sleep(300);
  await page.keyboard.type('RenamedObject');
  await page.keyboard.press('Enter');
  await editor.waitUntil('object renamed', () =>
    exists(editor, '#objects-list [data-object-name="RenamedObject"]')
  );
  await sleep(HISTORY_SAVE_DELAY);
  await editor.recordHighlights();
  await editor.undo();
  const highlights = await editor.getHighlights();
  if (!highlights.includes('object-row:MyObject'))
    throw new Error(
      `The row of the object was not highlighted: ${JSON.stringify(highlights)}`
    );
};

{
  const name = 'undo scrolls a long variables list to the changed variable';
  fixtureSetups[name] = project => {
    project.layouts[0].variables = [];
    for (let i = 0; i < 80; i++)
      project.layouts[0].variables.push({
        name: `Variable${String(i).padStart(2, '0')}`,
        type: 'number',
        value: i,
      });
  };
  scenarios[name] = async editor => {
    const panel = '#scene-properties-editor';
    await editor.unfoldVariablesSection(panel, 'scene-variables-section');
    await editor.setFieldValue(`${panel} #variable-0-text-value`, '999');

    // Scroll everything that can be scrolled in the panel to the bottom.
    const scrollToBottom = () =>
      editor.page.evaluate(panel => {
        let scrolled = 0;
        document.querySelectorAll(`${panel}, ${panel} *`).forEach(element => {
          if (element.scrollHeight > element.clientHeight + 10) {
            element.scrollTop = element.scrollHeight;
            if (element.scrollTop > 0) scrolled++;
          }
        });
        let parent = document.querySelector(panel).parentElement;
        while (parent) {
          if (parent.scrollHeight > parent.clientHeight + 10) {
            parent.scrollTop = parent.scrollHeight;
            if (parent.scrollTop > 0) scrolled++;
          }
          parent = parent.parentElement;
        }
        return scrolled;
      }, panel);
    if (!(await scrollToBottom())) throw new Error('Nothing was scrolled.');
    await sleep(500);
    const isFirstVariableOnScreen = () =>
      editor.page.evaluate(panel => {
        const field = Array.from(
          document.querySelectorAll(`${panel} input[id$="-name"]`)
        ).find(input => input.value === 'Variable00');
        if (!field) return false;
        const rect = field.getBoundingClientRect();
        const element = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        return !!element && (element === field || field.contains(element));
      }, panel);
    expectEqual(
      await isFirstVariableOnScreen(),
      false,
      'visible when scrolled'
    );

    await editor.recordHighlights();
    await editor.undo();
    const highlights = await editor.getHighlights();
    expectEqual(
      await isFirstVariableOnScreen(),
      true,
      'changed variable on screen'
    );
    expectEqual(highlights.length, 1, 'highlighted variables');
  };
}

const applyDialog = async editor => {
  await editor.clickButtonWithText('[role="dialog"]', /^apply$/);
  await editor.waitUntil(
    'dialog closed',
    async () => !(await editor.page.$('[role="dialog"]'))
  );
  await sleep(500);
};
const isSelectorVisible = (editor, selector) =>
  editor.page.evaluate(selector => {
    const element = document.querySelector(selector);
    return !!element && element.getClientRects().length > 0;
  }, selector);
const clickSelectorIfPresent = (editor, selector) =>
  editor.page.evaluate(selector => {
    const element = document.querySelector(selector);
    if (element) element.click();
  }, selector);

{
  const name = 'layer editor dialog makes one step per effect';
  fixtureSetups[name] = effectsFixtureSetup;
  scenarios[name] = async editor => {
    await editor.selectLayer('Background');
    const panel = '#layer-properties-editor';
    const fields = {
      opacity: `${panel} [id="effect-panel-My2DEffect"] [id="opacity"]`,
      exposure: `${panel} [id="effect-panel-My3DEffect"] [id="exposure"]`,
    };
    await clickSelectorIfPresent(
      editor,
      '#layer-2d-effects-section-unfold-button'
    );
    await clickSelectorIfPresent(
      editor,
      '#layer-3d-effects-section-unfold-button'
    );
    await editor.waitUntil(
      'effects visible',
      async () =>
        (await isSelectorVisible(editor, fields.opacity)) &&
        (await isSelectorVisible(editor, fields.exposure))
    );

    await editor.clickSectionHeaderButton(
      'layer-2d-effects-section',
      'open-editor'
    );
    await editor.page.waitForSelector('[role="dialog"] [id="opacity"]');
    await editor.setFieldValue('[role="dialog"] [id="opacity"]', '0.5');
    await editor.setFieldValue('[role="dialog"] [id="exposure"]', '0.5');
    await applyDialog(editor);

    const getValues = async () => [
      await editor.getFieldValue(fields.opacity),
      await editor.getFieldValue(fields.exposure),
    ];
    expectEqual(await getValues(), ['0.5', '0.5'], 'applied');
    await editor.undo();
    expectEqual(
      (await getValues()).filter(value => value === '1').length,
      1,
      'effects reverted by the first undo'
    );
    await editor.undo();
    expectEqual(await getValues(), ['1', '1'], 'after the second undo');
    await editor.redo();
    await editor.redo();
    expectEqual(await getValues(), ['0.5', '0.5'], 'after two redos');
  };
}

{
  const name = 'group editor dialog makes one step per object';
  fixtureSetups[name] = project => {
    project.layouts[0].objectsGroups[0].objects.push(
      { name: 'OtherObject' },
      { name: 'VariablesObject' }
    );
  };
  scenarios[name] = async editor => {
    await editor.selectGroup('MyGroup');
    await clickSelectorIfPresent(
      editor,
      '#group-objects-section-unfold-button'
    );
    const countRemoveButtons = root =>
      editor.page.evaluate(
        root =>
          document
            .querySelector(root)
            .querySelectorAll('button[aria-label="remove"]').length,
        root
      );
    const content = '#group-objects-section-content';
    await editor.waitUntil(
      'members listed',
      async () => (await countRemoveButtons(content)) === 3
    );

    await editor.clickSectionHeaderButton(
      'group-objects-section',
      'open-editor'
    );
    await editor.page.waitForSelector('[role="dialog"]');
    await editor.waitUntil(
      'members listed in the dialog',
      async () => (await countRemoveButtons('[role="dialog"]')) === 3
    );
    for (const expectedCount of [2, 1]) {
      await editor.page.evaluate(() => {
        const buttons = document
          .querySelector('[role="dialog"]')
          .querySelectorAll('button[aria-label="remove"]');
        buttons[buttons.length - 1].click();
      });
      await editor.waitUntil(
        'member removed in the dialog',
        async () =>
          (await countRemoveButtons('[role="dialog"]')) === expectedCount
      );
    }
    await applyDialog(editor);

    expectEqual(await countRemoveButtons(content), 1, 'applied');
    await editor.undo();
    expectEqual(await countRemoveButtons(content), 2, 'after the first undo');
    await editor.undo();
    expectEqual(await countRemoveButtons(content), 3, 'after the second undo');
    await editor.redo();
    await editor.redo();
    expectEqual(await countRemoveButtons(content), 1, 'after two redos');
  };
}

{
  const name = 'object editor dialog makes one step per behavior and effect';
  fixtureSetups[name] = project => {
    behaviorFixtureSetup(project);
    project.layouts[0].objects[0].effects = [
      {
        name: 'MyEffect',
        effectType: 'Sepia',
        doubleParameters: { opacity: 1 },
        stringParameters: {},
        booleanParameters: {},
      },
    ];
  };
  scenarios[name] = async editor => {
    await editor.selectObjectInList('MyObject');
    const panel = '#object-properties-editor';
    const fields = {
      extraBorder: `${panel} [id="behavior-panel-DestroyOutside"] [id="extraBorder"]`,
      opacity: `${panel} [id="effect-panel-MyEffect"] [id="opacity"]`,
    };
    await clickSelectorIfPresent(editor, '#behaviors-section-unfold-button');
    await clickSelectorIfPresent(
      editor,
      '#object-effects-section-unfold-button'
    );
    await editor.waitUntil(
      'behavior and effect visible',
      async () =>
        (await isSelectorVisible(editor, fields.extraBorder)) &&
        (await isSelectorVisible(editor, fields.opacity))
    );

    const clickDialogTab = async label => {
      await editor.page.evaluate(label => {
        Array.from(
          document.querySelectorAll(
            '[role="dialog"] [role="tab"], [role="dialog"] button'
          )
        )
          .find(element => element.textContent === label)
          .click();
      }, label);
      await sleep(500);
    };
    await editor.clickSectionHeaderButton('behaviors-section', 'open-editor');
    await editor.page.waitForSelector('#object-editor-dialog');
    await clickDialogTab('Behaviors');
    await editor.setFieldValue('[role="dialog"] [id="extraBorder"]', '50');
    await clickDialogTab('Effects');
    await editor.setFieldValue('[role="dialog"] [id="opacity"]', '0.5');
    await applyDialog(editor);

    const getValues = async () => [
      await editor.getFieldValue(fields.extraBorder),
      await editor.getFieldValue(fields.opacity),
    ];
    expectEqual(await getValues(), ['50', '0.5'], 'applied');
    await editor.undo();
    const afterFirstUndo = await getValues();
    expectEqual(
      [afterFirstUndo[0] === '0', afterFirstUndo[1] === '1'].filter(Boolean)
        .length,
      1,
      `changes reverted by the first undo (${afterFirstUndo.join()})`
    );
    await editor.undo();
    expectEqual(await getValues(), ['0', '1'], 'after the second undo');
  };
}

scenarios[
  'project manager: scenes and external layouts can be undone, without crash'
] = async editor => {
  const { page } = editor;
  await (await page.$('#main-toolbar-project-manager-button')).click();
  await page.waitForSelector('#project-manager');
  await sleep(800);
  const hasItem = name =>
    page.evaluate(name => {
      const root = document.getElementById('project-manager');
      return Array.from(root.querySelectorAll('span, p, input')).some(
        element => (element.value || element.textContent) === name
      );
    }, name);
  const pressUndo = async withShift => {
    await page.keyboard.down('Control');
    if (withShift) await page.keyboard.down('Shift');
    await page.keyboard.press('z');
    if (withShift) await page.keyboard.up('Shift');
    await page.keyboard.up('Control');
    await sleep(600);
  };

  for (const [buttonId, newName] of [
    ['add-new-scene-button', 'MyNewScene'],
    ['add-new-external-layout-button', 'MyNewExternalLayout'],
  ]) {
    await page.evaluate(buttonId => {
      document.getElementById(buttonId).click();
    }, buttonId);
    await sleep(800);
    // The new item is being renamed.
    await page.keyboard.type(newName);
    await page.keyboard.press('Enter');
    await editor.waitUntil(`${newName} created`, () => hasItem(newName));
    await sleep(500);

    // The undo shortcut is used right away, from the project manager.
    await pressUndo(false);
    expectEqual(await hasItem(newName), false, `${newName} after undo 1`);
    await pressUndo(false);
    await pressUndo(true);
    await pressUndo(true);
    await editor.waitUntil(`${newName} back after the redos`, () =>
      hasItem(newName)
    );
  }

  // With the focus in the search bar (where it is when the project manager
  // is opened), the shortcuts must work too.
  const searchBar = await page.$('input[placeholder="Search in project"]');
  await searchBar.click();
  await pressUndo(false);
  expectEqual(
    await hasItem('MyNewExternalLayout'),
    false,
    'external layout name after an undo from the search bar'
  );
  await pressUndo(true);
  await editor.waitUntil('redo from the search bar', () =>
    hasItem('MyNewExternalLayout')
  );

  // Close the project manager and open the events: used to crash the engine.
  await page.keyboard.press('Escape');
  await sleep(800);
  const eventsTab = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll('span, p, div')).find(
      element =>
        element.children.length === 0 &&
        element.textContent === 'Scene (Events)'
    )
  );
  await eventsTab.asElement().click();
  await sleep(2500);
  expectEqual(
    await page.evaluate(
      () => !!document.querySelector('#scene-editor[data-active]')
    ),
    false,
    'scene editor still active'
  );
};

scenarios[
  'a pasted instance keeps its position after undo and redo'
] = async editor => {
  const { page } = editor;
  const canvas = await page.$('#scene-editor canvas');
  const box = await canvas.boundingBox();
  // Center the view on the middle of the scene, at a known zoom.
  await page.mouse.click(box.x + 20, box.y + 20);
  await page.keyboard.down('Shift');
  await page.keyboard.press('Digit2');
  await page.keyboard.up('Shift');
  await sleep(500);
  const zoom = 700 / 800;
  const toScreen = (sceneX, sceneY) => [
    box.x + box.width / 2 + (sceneX - 400) * zoom,
    box.y + box.height / 2 + (sceneY - 300) * zoom,
  ];
  // Select the instance of MyObject by clicking it, then copy it.
  await page.mouse.click(...toScreen(297 + 10, 245 + 10));
  await editor.waitUntil(
    'instance selected',
    async () => (await editor.getPanel()) === 'instance'
  );
  await page.keyboard.down('Control');
  await page.keyboard.press('c');
  await page.keyboard.up('Control');
  // Paste it under the cursor, elsewhere on the canvas.
  const [pasteX, pasteY] = toScreen(600, 450);
  await page.mouse.move(pasteX, pasteY);
  await sleep(200);
  await page.keyboard.down('Control');
  await page.keyboard.press('v');
  await page.keyboard.up('Control');
  await sleep(HISTORY_SAVE_DELAY);

  const getInstances = () =>
    editor.page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll('.ReactVirtualized__Table__row')
      );
      return rows.map(row =>
        Array.from(row.querySelectorAll('.tableColumn'))
          .slice(0, 3)
          .map(cell => cell.textContent.trim())
          .join(' ')
      );
    });
  await (await page.$('#toolbar-open-instances-list-panel-button')).click();
  await page.waitForSelector('.ReactVirtualized__Table__row');
  const findPasted = instances =>
    instances.find(row => row.startsWith('MyObject') && !row.includes('297'));
  const pasted = findPasted(await getInstances());
  if (!pasted) throw new Error(`No pasted instance: ${await getInstances()}`);
  if (pasted.includes(' 0 0'))
    throw new Error(`The pasted instance is at the origin: ${pasted}`);

  await editor.undo();
  expectEqual(findPasted(await getInstances()), undefined, 'after undo');
  await editor.redo();
  expectEqual(findPasted(await getInstances()), pasted, 'after redo');
};

{
  const name =
    'undo/redo of moving an object to a folder reveals it, reopening the folder';
  fixtureSetups[name] = project => {
    project.layouts[0].objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        { folderName: 'MyFolder', children: [{ objectName: 'OtherObject' }] },
        { objectName: 'MyObject' },
        { objectName: 'VariablesObject' },
        { objectName: 'MyCube' },
      ],
    };
  };
  scenarios[name] = async editor => {
    const { page } = editor;
    const folder = '#objects-list [data-folder-name="MyFolder"]';
    const object = '#objects-list [data-object-name="MyObject"]';
    const toggleFolder = () =>
      page.evaluate(folder => {
        document
          .querySelector(folder)
          .querySelector('button')
          .click();
      }, folder);
    const getIndentation = selector =>
      page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const label = Array.from(element.querySelectorAll('span, p')).find(
          element => element.children.length === 0
        );
        return Math.round(label.getBoundingClientRect().left);
      }, selector);
    const rootIndentation = await getIndentation(object);
    const other = '#objects-list [data-object-name="OtherObject"]';
    if (!(await exists(editor, other))) await toggleFolder();
    await editor.waitUntil('folder open', () => exists(editor, other));

    // Move the object to the folder.
    await (await page.$(object)).click({ button: 'right' });
    await editor.clickMenuItem(/^move to folder/i);
    await editor.clickMenuItem(/^MyFolder$/);
    await sleep(HISTORY_SAVE_DELAY);
    await editor.waitUntil(
      'object moved in the (open) folder',
      async () => (await getIndentation(object)) > rootIndentation
    );
    // Fold the folder: the object is not shown anymore.
    await toggleFolder();
    await editor.waitUntil(
      'folder folded',
      async () => !(await exists(editor, object))
    );

    await editor.undo();
    await editor.waitUntil('object shown after undo', () =>
      exists(editor, object)
    );
    expectEqual(
      await getIndentation(object),
      rootIndentation,
      'object back at the root after undo'
    );

    // Fold the folder again (if it was reopened by the undo).
    if (await exists(editor, '#objects-list [data-object-name="OtherObject"]'))
      await toggleFolder();
    await editor.waitUntil(
      'folder folded again',
      async () =>
        !(await exists(
          editor,
          '#objects-list [data-object-name="OtherObject"]'
        ))
    );
    await editor.redo();
    await editor.waitUntil('object shown after redo', () =>
      exists(editor, object)
    );
    expectEqual(
      (await getIndentation(object)) > rootIndentation,
      true,
      'object shown inside the reopened folder after redo'
    );
  };
}

scenarios[
  'undo of scene property changes highlights the properties'
] = async editor => {
  const panel = '#scene-properties-editor';
  await clickSelectorIfPresent(
    editor,
    '#scene-properties-section-unfold-button'
  );
  const color = `${panel} [id="BackgroundColor"]`;
  const title = `${panel} [id="WindowTitle"]`;
  await editor.page.waitForSelector(color);
  const initialColor = await editor.getFieldValue(color);
  // The title is an "advanced" field, hidden by default.
  await clickSelectorIfPresent(
    editor,
    `${panel} #show-advanced-properties-button`
  );
  await editor.page.waitForSelector(title);
  await editor.setFieldValue(color, '10;20;30');
  await editor.setFieldValue(title, 'My title');
  expectEqual(await editor.getFieldValue(color), '10;20;30', 'color changed');

  // Fold the section: the undo must reopen it - and show the advanced
  // fields again, as the section is rendered again from scratch.
  await clickSelectorIfPresent(editor, '#scene-properties-section-fold-button');
  await editor.waitUntil(
    'section folded',
    async () => !(await isSelectorVisible(editor, color))
  );
  await editor.recordHighlights();
  await editor.undo();
  expectEqual(await editor.getHighlights(), ['WindowTitle'], 'first undo');
  expectEqual(await isSelectorVisible(editor, title), true, 'title shown');
  expectEqual(await editor.getFieldValue(title), '', 'title after undo');

  await editor.recordHighlights();
  await editor.undo();
  expectEqual(await editor.getHighlights(), ['BackgroundColor'], 'second undo');
  expectEqual(
    await editor.getFieldValue(color),
    initialColor,
    'color after undo'
  );
};

scenarios[
  'undo of group changes selects the group and highlights its row'
] = async editor => {
  const { page } = editor;
  await editor.openPanel('groups');
  const groupRow = name => `#objects-groups-list [data-group-name="${name}"]`;
  await page.waitForSelector(groupRow('MyGroup'));

  // Rename from the list.
  await (await page.$(groupRow('MyGroup'))).click();
  await sleep(300);
  await page.keyboard.press('F2');
  await sleep(300);
  await page.keyboard.type('RenamedGroup');
  await page.keyboard.press('Enter');
  await page.waitForSelector(groupRow('RenamedGroup'));
  await sleep(HISTORY_SAVE_DELAY);
  await editor.deselectAll();

  await editor.recordHighlights();
  await editor.undo();
  await page.waitForSelector(groupRow('MyGroup'));
  expectEqual(await editor.getPanel(), 'group', 'panel after the rename undo');
  const highlightsAfterRename = await editor.getHighlights();
  expectEqual(
    highlightsAfterRename.includes('group-row:MyGroup'),
    true,
    `group row highlighted after the rename undo (${highlightsAfterRename})`
  );

  // Add an object from the group panel.
  await clickSelectorIfPresent(editor, '#group-objects-section-unfold-button');
  const content = '#group-objects-section-content';
  const countMembers = () =>
    page.evaluate(
      content =>
        document
          .querySelector(content)
          .querySelectorAll('button[aria-label="remove"]').length,
      content
    );
  await editor.waitUntil(
    'members listed',
    async () => (await countMembers()) === 1
  );
  await page.select(`${content} select`, 'OtherObject');
  await editor.waitUntil(
    'member added',
    async () => (await countMembers()) === 2
  );
  await sleep(HISTORY_SAVE_DELAY);
  await editor.deselectAll();

  await editor.recordHighlights();
  await editor.undo();
  expectEqual(await editor.getPanel(), 'group', 'panel after the add undo');
  expectEqual(await countMembers(), 1, 'members after undo');
  const highlights = await editor.getHighlights();
  expectEqual(
    highlights.includes('group-row:MyGroup') &&
      highlights.includes('group-objects-section'),
    true,
    `row and objects section highlighted after the add undo (${highlights})`
  );
};

const makeUndoObjectDeletionScenario = is3D => async editor => {
  if (is3D) await editor.switchTo3D();
  await editor.deleteObjectInList('MyCube');

  await editor.undo();
  await editor.waitUntil(
    'MyCube back in the list',
    async () =>
      !!(await editor.page.$('#objects-list [data-object-name="MyCube"]'))
  );
  expectEqual(await editor.getPanel(), 'instance', 'panel after undo');
  if (!is3D) return;
  let selection = null;
  try {
    await editor.waitUntil(
      'instance selected in the 3D editor',
      async () =>
        (selection = await editor.getSelectionIn3DEditor()).join() === 'MyCube',
      15000
    );
  } catch (error) {
    expectEqual(selection, ['MyCube'], 'selection in the 3D editor');
  }
};
scenarios[
  'undoing an object deletion selects its instances (2D editor)'
] = makeUndoObjectDeletionScenario(false);
if (with3D)
  scenarios[
    'undoing an object deletion selects its instances (3D editor)'
  ] = makeUndoObjectDeletionScenario(true);

scenarios[
  'variables of different panels can be undone with the keyboard only'
] = async editor => {
  const editFirstVariable = async ({ panel, section }, value) => {
    await editor.unfoldVariablesSection(panel, section);
    // Stay in the field after typing - like a user would.
    const field = await editor.page.$(`${panel} #variable-0-text-value`);
    await field.click({ clickCount: 3 });
    await editor.page.keyboard.type(value);
    await sleep(HISTORY_SAVE_DELAY);
  };
  const scenePanel = {
    panel: '#scene-properties-editor',
    section: 'scene-variables-section',
  };
  const objectPanel = {
    panel: '#object-properties-editor',
    section: 'object-variables-section',
  };
  const instancePanel = {
    panel: '#instance-properties-editor',
    section: 'instance-variables-section',
  };
  await editFirstVariable(scenePanel, '100');
  await editor.selectObjectInList('VariablesObject');
  await editFirstVariable(objectPanel, '200');
  await editor.selectInstancesOf('MyObject');
  await editFirstVariable(instancePanel, '300');

  const expectedPanels = ['instance', 'object:VariablesObject', 'scene'];
  for (const [index, expectedPanel] of expectedPanels.entries()) {
    await editor.pressRawUndo();
    expectEqual(
      await editor.getPanel(),
      expectedPanel,
      `panel after undo ${index + 1}`
    );
    expectEqual(
      await editor.getFocusLocation(),
      'editor',
      `focus after undo ${index + 1}`
    );
  }
  expectEqual(
    await editor.getFieldValue(`${scenePanel.panel} #variable-0-text-value`),
    '1',
    'scene variable after the undos'
  );
};

Object.assign(scenarios, {
  'instance variables can be undone with the keyboard only': makeKeyboardOnlyUndoScenario(
    {
      select: editor => editor.selectInstancesOf('MyObject'),
      panel: '#instance-properties-editor',
      section: 'instance-variables-section',
    }
  ),
  'object variables can be undone with the keyboard only': makeKeyboardOnlyUndoScenario(
    {
      select: editor => editor.selectObjectInList('VariablesObject'),
      panel: '#object-properties-editor',
      section: 'object-variables-section',
    }
  ),
  'scene variables can be undone with the keyboard only': makeKeyboardOnlyUndoScenario(
    {
      select: async () => {},
      panel: '#scene-properties-editor',
      section: 'scene-variables-section',
    }
  ),
});

const serveFixture = () =>
  new Promise(resolve => {
    const server = http.createServer((request, response) => {
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      // A scenario can adapt the project to its needs: see `fixtureSetups`.
      const scenarioName = decodeURIComponent(
        request.url.replace(/^\//, '').replace(/\.json$/, '')
      );
      const project = JSON.parse(JSON.stringify(fixtureProject));
      if (fixtureSetups[scenarioName]) fixtureSetups[scenarioName](project);
      response.end(JSON.stringify(project));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

const main = async () => {
  if (args.includes('--list')) {
    Object.keys(scenarios).forEach(name => console.log(name));
    return;
  }

  const server = await serveFixture();
  const getProjectUrl = name =>
    `http://127.0.0.1:${server.address().port}/${encodeURIComponent(
      name
    )}.json`;
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: !headed,
    args: [
      '--use-gl=swiftshader',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1600,1000',
    ],
    defaultViewport: { width: 1600, height: 1000 },
  });

  const names = Object.keys(scenarios).filter(
    name => !only || only.some(filter => name.includes(filter))
  );
  const failures = [];
  for (const name of names) {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    try {
      const editor = new Editor(page);
      const startTime = Date.now();
      await editor.open(getProjectUrl(name));
      const loadedTime = Date.now();
      await scenarios[name](editor);
      if (editor.fatalErrors.length)
        throw new Error(`Fatal error(s): ${editor.fatalErrors.join(' | ')}`);
      const seconds = ms => `${(ms / 1000).toFixed(1)}s`;
      console.log(
        `PASS  ${name} (load ${seconds(loadedTime - startTime)}, run ${seconds(
          Date.now() - loadedTime
        )})`
      );
    } catch (error) {
      failures.push(name);
      console.log(`FAIL  ${name}\n      ${error.message}`);
    }
    await context.close();
  }

  await browser.close();
  server.close();
  console.log(
    `\n${names.length - failures.length}/${names.length} scenarios passed.`
  );
  if (failures.length) process.exit(1);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
