/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "DndResourcesEditor.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
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

