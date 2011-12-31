/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef NEEDREFRESHCOMMAND_H
#define NEEDREFRESHCOMMAND_H

#include <iostream>
#include <algorithm>
#include <vector>
#include <wx/infobar.h> //Strangely needed
class wxTopLevelWindow;
class wxRibbonBar;
class wxRibbonButtonBar;
class BuildToolsPnl;
class Game_Develop_EditorFrame;
class BuildToolsPnl;
class wxAuiManager;
class SceneCanvas;

/**
 *  \brief Internal class used to provide easy and lightweight access to some members of the main editor frame.
 *
 * This class also allows
 */
class GD_API MainEditorCommand
{
    public:
        /**
         * Constructor, only called by the main editor itself to construct the MainEditorCommand.
         */
        MainEditorCommand(wxRibbonBar * ribbon_,
                          wxRibbonButtonBar * ribbonSceneEditorButtonBar_,
                          wxTopLevelWindow * mainEditor_,
                          BuildToolsPnl * buildToolsPnl_,
                          wxAuiManager * paneManager_,
                          wxInfoBar * infoBar_,
                          std::vector<SceneCanvas*> * scenesLockingShortcuts_) :
            ribbon(ribbon_),
            ribbonSceneEditorButtonBar(ribbonSceneEditorButtonBar_),
            mainEditor(mainEditor_),
            buildToolsPnl(buildToolsPnl_),
            paneManager(paneManager_),
            infoBar(infoBar_),
            scenesLockingShortcuts(scenesLockingShortcuts_)
        {
        };

        virtual ~MainEditorCommand() {};

        /**
         * Return the pointer to the ribbon of the main editor.
         */
        wxRibbonBar * GetRibbon() const { return ribbon; };

        /**
         * Return the pointer to the Scene ribbon's wxRibbonButtonBar of the main editor.
         */
        wxRibbonButtonBar * GetRibbonSceneEditorButtonBar() const { return ribbonSceneEditorButtonBar; };

        /**
         * Get pointer to the build tools panel.
         */
        BuildToolsPnl * GetBuildToolsPanel() const { return buildToolsPnl; };

        /**
         * Get pointer to the wxAUI pane manager
         */
        wxAuiManager & GetPaneManager() const { return *paneManager; };

        /**
         * Return the pointer to the Main Editor window.
         */
        wxTopLevelWindow * GetMainEditor() const { return mainEditor; };

        /**
         * Add a scene to the list of scenes being previewed and so locking shortcuts
         */
        void LockShortcuts(SceneCanvas * sceneCanvas) { scenesLockingShortcuts->push_back(sceneCanvas); }

        /**
         * Remove a scene from the list of scenes locking shortcuts.
         */
        void UnLockShortcuts(SceneCanvas * sceneCanvas)
        {
            scenesLockingShortcuts->erase(std::remove(scenesLockingShortcuts->begin(), scenesLockingShortcuts->end(), sceneCanvas), scenesLockingShortcuts->end());
        }

        /**
         * Get pointer to the main editor infobar.
         */
        wxInfoBar * GetInfoBar() const { return infoBar; };

    private:

        wxRibbonBar * ribbon;
        wxRibbonButtonBar * ribbonSceneEditorButtonBar;
        wxTopLevelWindow * mainEditor;
        BuildToolsPnl * buildToolsPnl;
        wxAuiManager * paneManager;
        wxInfoBar * infoBar;
        std::vector<SceneCanvas*> * scenesLockingShortcuts; ///< When a scene is being previewed, it is added to this list to disable shortcuts.
};

#endif // NEEDREFRESHCOMMAND_H
#endif
