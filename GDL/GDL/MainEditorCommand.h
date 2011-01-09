/**
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
        wxTopLevelWindow * GetMainEditor() { assert(mainEditor); return mainEditor; };
        /**
         * Set the pointer to the main editor.
         */
        void SetMainEditor(wxTopLevelWindow * mainEditor_) { mainEditor = mainEditor_; };

    private:

        wxRibbonBar * ribbon;
        wxRibbonButtonBar * ribbonSceneEditorButtonBar;
        wxTopLevelWindow * mainEditor;
};

#endif // NEEDREFRESHCOMMAND_H
#endif
