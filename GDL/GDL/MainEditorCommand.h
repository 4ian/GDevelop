/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef NEEDREFRESHCOMMAND_H
#define NEEDREFRESHCOMMAND_H

#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/toplevel.h>
#include <iostream>
#include <algorithm>
#include <vector>
class BuildToolsPnl;
class wxAuiManager;
class SceneCanvas;

/**
 *  MainEditorCommand is used to give access to some members of the mainEditor
 *  to editors
 */
class GD_API MainEditorCommand
{
    public:
        MainEditorCommand();
        virtual ~MainEditorCommand();

        /**
         * Return the pointer to the ribbon of the main editor.
         * Assert if no ribbon has been set.
         */
        wxRibbonBar * GetRibbon() { assert(ribbon); return ribbon; };
        /**
         * Set the pointer to the ribbon of the main editor.
         */
        void SetRibbon(wxRibbonBar * ribbon_) { ribbon = ribbon_; };

        /**
         * Return the pointer to the Scene ribbon's wxRibbonButtonBar of the main editor.
         * Assert if no pointer has been set.
         */
        wxRibbonButtonBar * GetRibbonSceneEditorButtonBar() { assert(ribbonSceneEditorButtonBar); return ribbonSceneEditorButtonBar; };
        /**
         * Set the pointer to the Scene ribbon's wxRibbonButtonBar.
         */
        void SetRibbonSceneEditorButtonBar(wxRibbonButtonBar * ribbonSEBBar_) { ribbonSceneEditorButtonBar = ribbonSEBBar_; };

        /**
         * Get pointer to the build tools panel.
         */
        BuildToolsPnl * GetBuildToolsPanel() { assert(buildToolsPnl); return buildToolsPnl; };

        /**
         * Change pointer to the build tools panel.
         */
        void SetBuildToolsPanel(BuildToolsPnl * buildToolsPnl_) { buildToolsPnl = buildToolsPnl_; };

        /**
         * Get pointer to the pane manager
         */
        wxAuiManager * GetPaneManager() { assert(paneManager); return paneManager; };

        /**
         * Change pointer to the pane manager
         */
        void SetPaneManager(wxAuiManager * paneManager_) { paneManager = paneManager_; };

        /**
         * Return the pointer to the Main Editor.
         * Assert if no pointer has been set.
         */
        wxTopLevelWindow * GetMainEditor() { assert(mainEditor); return mainEditor; };

        /**
         * Set the pointer to the main editor.
         */
        void SetMainEditor(wxTopLevelWindow * mainEditor_) { mainEditor = mainEditor_; };

        /**
         * Set the pointer to the list managing scene locking shortcuts.
         */
        void SetScenesLockingShortcutsList(std::vector<SceneCanvas*> * scenesLockingShortcuts_) { scenesLockingShortcuts = scenesLockingShortcuts_; };

        /**
         * Add a scene to the list of scenes being previewed and so locking shortcuts
         */
        void LockShortcuts(SceneCanvas * sceneCanvas) { assert(scenesLockingShortcuts); scenesLockingShortcuts->push_back(sceneCanvas); }

        /**
         * Remove a scene from the list of scenes locking shortcuts.
         */
        void UnLockShortcuts(SceneCanvas * sceneCanvas)
        {
            assert(scenesLockingShortcuts);
            scenesLockingShortcuts->erase(std::remove(scenesLockingShortcuts->begin(), scenesLockingShortcuts->end(), sceneCanvas), scenesLockingShortcuts->end());
        }

    private:

        wxRibbonBar * ribbon;
        wxRibbonButtonBar * ribbonSceneEditorButtonBar;
        wxTopLevelWindow * mainEditor;
        BuildToolsPnl * buildToolsPnl;
        wxAuiManager * paneManager;
        std::vector<SceneCanvas*> * scenesLockingShortcuts; ///< When a scene is being previewed, it is add to this list to disable shortcuts.
};

#endif // NEEDREFRESHCOMMAND_H
#endif
