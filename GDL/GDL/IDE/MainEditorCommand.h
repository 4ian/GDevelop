/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef NEEDREFRESHCOMMAND_H
#define NEEDREFRESHCOMMAND_H
#include <algorithm>
#include <vector>
#include <wx/infobar.h> //Strangely needed
class wxTopLevelWindow;
class wxRibbonBar;
class wxRibbonButtonBar;
class BuildToolsPnl;
class MainFrame;
class BuildToolsPnl;
class wxAuiManager;
class wxAuiNotebook;
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
     * Constructor, only called by the IDE itself to construct the MainEditorCommand.
     */
    MainEditorCommand(wxRibbonBar * ribbon_,
                      wxRibbonButtonBar * ribbonSceneEditorButtonBar_,
                      wxTopLevelWindow * mainEditor_,
                      BuildToolsPnl * buildToolsPnl_,
                      wxAuiManager * paneManager_,
                      wxAuiNotebook * editorsNotebook_,
                      wxInfoBar * infoBar_,
                      std::vector<SceneCanvas*> * scenesLockingShortcuts_,
                      const wxString & workingDirectory_) :
        ribbon(ribbon_),
        ribbonSceneEditorButtonBar(ribbonSceneEditorButtonBar_),
        mainEditor(mainEditor_),
        buildToolsPnl(buildToolsPnl_),
        paneManager(paneManager_),
        editorsNotebook(editorsNotebook_),
        infoBar(infoBar_),
        scenesLockingShortcuts(scenesLockingShortcuts_),
        workingDirectory(workingDirectory_)
    {
    };

    virtual ~MainEditorCommand() {};

    /**
     * Return the pointer to the ribbon of the IDE.
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
     * Return the pointer to the IDE window.
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
     * Get pointer to the IDE infobar.
     */
    wxInfoBar * GetInfoBar() const { return infoBar; };

    /**
     * Return a pointer to the notebook holding editors
     */
    wxAuiNotebook * GetEditorsNotebook() { return editorsNotebook; }

    /**
     * Return the working directory of the IDE. ( i.e. IDE executable directory )
     */
    wxString GetIDEWorkingDirectory() const { return workingDirectory; }

    /**
     * Call this method when a scene is going to be previewed and others controls than the scene editor must be deactivated
     */
    void DisableControlsForScenePreviewing();

    /**
     * Call this method when a scene preview has ended.
     */
    void EnableControlsAfterScenePreviewing() { for (unsigned int i = 0;i<disableOnPreview.size();++i) disableOnPreview[i]->Enable(); };

    /**
     * Used by the IDE to setup controls to be disabled when a scene is previewed.
     */
    void AddControlToBeDisabledOnPreview(wxWindow * control) { disableOnPreview.push_back(control); }

private:

    wxRibbonBar * ribbon;
    wxRibbonButtonBar * ribbonSceneEditorButtonBar;
    wxTopLevelWindow * mainEditor;
    BuildToolsPnl * buildToolsPnl;
    wxAuiManager * paneManager;
    wxAuiNotebook * editorsNotebook;
    wxInfoBar * infoBar;
    std::vector<SceneCanvas*> * scenesLockingShortcuts; ///< When a scene is being previewed, it is added to this list to disable shortcuts.
    std::vector<wxWindow*> disableOnPreview; ///< To be filled with controls to be deactivated when a scene is previewed.
    wxString workingDirectory; ///< Contains the working directory of the IDE. ( i.e. IDE executable directory )
};

#endif // NEEDREFRESHCOMMAND_H
#endif
