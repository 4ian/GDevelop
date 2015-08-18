/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef MAINFRAMEWRAPPER_H
#define MAINFRAMEWRAPPER_H
#include <algorithm>
#include <vector>
#include <wx/infobar.h> //Strangely needed
class wxTopLevelWindow;
class wxWindow;
class wxRibbonBar;
class wxRibbonButtonBar;
class wxAuiManager;
class wxAuiNotebook;

namespace gd
{

/**
 *  \brief Provides access to some specific features or members of the IDE.
 */
class GD_CORE_API MainFrameWrapper
{
public:
    /**
     * Constructor, only called by the IDE itself to construct the MainFrameWrapper.
     */
    MainFrameWrapper(wxRibbonBar * ribbon_,
                      wxRibbonButtonBar * ribbonSceneEditorButtonBar_,
                      wxTopLevelWindow * mainEditor_,
                      wxAuiManager * paneManager_,
                      wxAuiNotebook * editorsNotebook_,
                      wxInfoBar * infoBar_,
                      std::vector<wxWindow*> * scenesLockingShortcuts_,
                      const wxString & workingDirectory_) :
        ribbon(ribbon_),
        ribbonSceneEditorButtonBar(ribbonSceneEditorButtonBar_),
        mainEditor(mainEditor_),
        paneManager(paneManager_),
        editorsNotebook(editorsNotebook_),
        infoBar(infoBar_),
        scenesLockingShortcuts(scenesLockingShortcuts_),
        workingDirectory(workingDirectory_)
    {
    };

    virtual ~MainFrameWrapper() {};

    /**
     * Return the pointer to the ribbon of the IDE.
     */
    wxRibbonBar * GetRibbon() const { return ribbon; };

    /**
     * Return the pointer to the Scene ribbon's wxRibbonButtonBar of the main editor.
     */
    wxRibbonButtonBar * GetRibbonSceneEditorButtonBar() const { return ribbonSceneEditorButtonBar; };

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
    void LockShortcuts(wxWindow * window) { scenesLockingShortcuts->push_back(window); }

    /**
     * Remove a scene from the list of scenes locking shortcuts.
     */
    void UnLockShortcuts(wxWindow * window)
    {
        scenesLockingShortcuts->erase(std::remove(scenesLockingShortcuts->begin(), scenesLockingShortcuts->end(), window), scenesLockingShortcuts->end());
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
    void EnableControlsAfterScenePreviewing() { for (std::size_t i = 0;i<disableOnPreview.size();++i) disableOnPreview[i]->Enable(); };

    /**
     * Used by the IDE to setup controls to be disabled when a scene is previewed.
     */
    void AddControlToBeDisabledOnPreview(wxWindow * control) { if ( find(disableOnPreview.begin(), disableOnPreview.end(), control) == disableOnPreview.end() ) disableOnPreview.push_back(control); }

    /**
     * Remove a control to the list of controls to be disabled on preview
     */
    void RemoveControlToBeDisabledOnPreview(wxWindow * control);

private:

    wxRibbonBar * ribbon;
    wxRibbonButtonBar * ribbonSceneEditorButtonBar;
    wxTopLevelWindow * mainEditor;
    wxAuiManager * paneManager;
    wxAuiNotebook * editorsNotebook;
    wxInfoBar * infoBar;
    std::vector<wxWindow*> * scenesLockingShortcuts; ///< When a scene is being previewed, it is added to this list to disable shortcuts.
    std::vector<wxWindow*> disableOnPreview; ///< To be filled with controls to be deactivated when a scene is previewed.
    wxString workingDirectory; ///< Contains the working directory of the IDE. ( i.e. IDE executable directory )
};

}

#endif // MAINFRAMEWRAPPER_H
#endif
