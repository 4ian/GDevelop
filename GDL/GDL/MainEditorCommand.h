/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#ifndef NEEDREFRESHCOMMAND_H
#define NEEDREFRESHCOMMAND_H

#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <iostream>

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

        int sceneID;
        wxRibbonBar * ribbon;
        wxRibbonButtonBar * ribbonSceneEditorButtonBar;
        wxWindow * mainEditor;
};

#endif // NEEDREFRESHCOMMAND_H
#endif
