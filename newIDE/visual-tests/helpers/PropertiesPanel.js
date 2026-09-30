// @ts-check

/**
 * The properties panel of the Scene editor (the "side bar"): it shows the
 * properties, behaviors and variables of the object selected in the objects
 * list, without opening the object editor dialog.
 */

const { click, waitFor, wait } = require('../lib/PageDriver');
const { NEW_BEHAVIOR_DIALOG } = require('./BehaviorsEditor');

const PANEL = { selector: '#object-properties-editor' };

/**
 * Finds the sections of the panel ("Properties", "Behaviors"...) and what they
 * contain. Targets are `{ propertiesPanel: { section, kind: 'add' } }`: the
 * button adding to a section, in its title bar.
 */
const installPropertiesPanelPageHelpers = function() {
  const { isLeaf, textOf, addTargetResolver } = window.gdVisualTests;

  const getPanel = () => document.querySelector('#object-properties-editor');

  // The title bar of a section: its title, and next to it the icon buttons to
  // open the full editor and to add to the section (the last one).
  const getSectionTitleBar = sectionTitle => {
    const panel = getPanel();
    if (!panel) return null;
    const title = Array.from(panel.querySelectorAll('*')).find(
      element => isLeaf(element) && textOf(element) === sectionTitle
    );
    let titleBar = title ? title.parentElement : null;
    while (titleBar && titleBar.querySelectorAll('button').length < 2)
      titleBar = titleBar.parentElement;
    return titleBar;
  };

  addTargetResolver('propertiesPanel', target => {
    const titleBar = getSectionTitleBar(target.section);
    if (!titleBar) return null;
    if (target.kind === 'add') {
      const buttons = Array.from(titleBar.querySelectorAll('button'));
      return buttons[buttons.length - 1] || null;
    }
    return null;
  });

  /**
   * The names of the behaviors of the "Behaviors" section: each one is a
   * sub-panel whose title bar has a "remove behavior" button. The name is the
   * first text next to that button, walking up to the title bar (no CSS
   * classes: the production build minifies them all away).
   */
  const listBehaviors = () => {
    const panel = getPanel();
    if (!panel) return [];
    return Array.from(panel.querySelectorAll('#remove-behavior'))
      .map(removeButton => {
        for (
          let ancestor = removeButton.parentElement;
          ancestor && panel.contains(ancestor);
          ancestor = ancestor.parentElement
        ) {
          const title = Array.from(ancestor.querySelectorAll('*')).find(
            element =>
              isLeaf(element) &&
              textOf(element) &&
              !removeButton.contains(element)
          );
          if (title) return textOf(title);
        }
        return null;
      })
      .filter(Boolean);
  };

  window.gdVisualTests.propertiesPanel = { listBehaviors };
};

/**
 * Select an object in the objects list of the scene, so that the panel shows
 * its properties.
 */
const selectObject = async (page, objectName) => {
  const row = await page.$(`[data-object-name="${objectName}"]`);
  if (!row) return false;
  await row.click();
  if (!(await waitFor(page, PANEL, 15000))) return false;
  await wait(1000);
  return true;
};

/** The names of the behaviors shown in the "Behaviors" section. */
const listBehaviors = page =>
  page.evaluate(() => window.gdVisualTests.propertiesPanel.listBehaviors());

/**
 * Open the dialog to add a behavior from the "Behaviors" section of the panel
 * (the same dialog as in the object editor: see `chooseBehaviorInDialog` of
 * the BehaviorsEditor helper). Returns null, or what went wrong.
 */
const openAddBehaviorDialog = async page => {
  const addButton = { propertiesPanel: { section: 'Behaviors', kind: 'add' } };
  if (!(await click(page, addButton)))
    return 'there is no button to add a behavior on the "Behaviors" section';
  if (!(await waitFor(page, NEW_BEHAVIOR_DIALOG, 20000)))
    return 'the dialog to add a behavior did not open';
  await wait(1500);
  return null;
};

module.exports = {
  name: 'properties-panel',
  paths: [
    'newIDE/app/src/ObjectEditor/CompactObjectPropertiesEditor/',
    'newIDE/app/src/CompactPropertiesEditor/',
    'newIDE/app/src/SceneEditor/InstanceOrObjectPropertiesEditorContainer.js',
  ],
  PANEL,
  installPageHelpers: installPropertiesPanelPageHelpers,
  selectObject,
  listBehaviors,
  openAddBehaviorDialog,
};
