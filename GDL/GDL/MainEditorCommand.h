#if defined(GDE)

#ifndef NEEDREFRESHCOMMAND_H
#define NEEDREFRESHCOMMAND_H

#include "GDL/needReload.h"
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <iostream>

/**
 *  MainEditorCommand is used by editors to transmit and receive commands,
 *  such as the need of reloading a scene.
 */
class GD_API MainEditorCommand
{
    public:
        MainEditorCommand(needReload & nr_, int sceneID_);
        virtual ~MainEditorCommand();

        /**
         * Indicate that the scene edited need refreshing
         */
        void NeedRefreshScene() { nr.SetASceneMustBeReloaded(sceneID); };

        /**
         * Indicate that all scenes need refreshing
         */
        void NeedRefreshAllScenes() { nr.SetAllScenesMustBeReloaded(); };

        /**
         * Indicate that images have to be reloaded
         */
        void NeedRefreshAllImages() { nr.SetImagesMustBeReloaded(); };

        /**
         * Indicate that the scene edited doesn't need refresh anymore.
         */
        void SceneDontNeedRefresh() { nr.SetASceneIsUpToDate(sceneID); };
        /**
         * Indicate that the images don't need refresh anymore.
         */
        void ImagesDontNeedRefresh() { nr.SetImagesAreUpToDate(); };

        /**
         * Return true if Scene must be refreshed.
         */
        bool QuerySceneNeedRefresh() const { return nr.MustTheSceneBeReloaded(sceneID); };
        /**
         * Return true if images must be reloaded
         */
        bool QueryImagesNeedRefresh() const { return nr.GetImagesMustBeReloaded(); };

        /**
         * Change the number of the scene which will be transmit to needReload
         */
        void SetScene(int nb) { sceneID = nb; };

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
         * Return the pointer to the Main Editor.
         * Assert if no pointer has been set.
         */
        wxWindow * GetMainEditor() { assert(mainEditor); return mainEditor; };
        /**
         * Set the pointer to the main editor.
         */
        void SetMainEditor(wxWindow * mainEditor_) { mainEditor = mainEditor_; };

    protected:
    private:

        needReload & nr;
        int sceneID;
        wxRibbonBar * ribbon;
        wxRibbonButtonBar * ribbonSceneEditorButtonBar;
        wxWindow * mainEditor;
};

#endif // NEEDREFRESHCOMMAND_H
#endif
