/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include "DndResourcesEditor.h"
#include "GDCpp/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/CommonTools.h"
#include <iostream>

bool DndTextResourcesEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    std::vector<std::string > command = gd::SplitString<std::string>(gd::ToString(text), ';');

    if ( command.size() < 3 ) return true; //The resource editor is expecting a specifically formatted string
    if ( command[0] == "COPYANDADDRESOURCES")
    {
        std::vector<std::string > files;
        for (unsigned int i = 2;i<command.size();++i)
        {
            files.push_back(command[i]);
        }

        editor.CopyAndAddResources(files, command[1]);
    }
    else if (command[0] == "DRAG")
    {
        editor.TriggerDrop(x, y);
    }

    return true;
}
#endif

