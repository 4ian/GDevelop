/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "DndResourcesEditor.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include <iostream>

bool DndTextResourcesEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    std::vector<std::string > command = gd::SplitString<std::string>(gd::ToString(text), ';');

    //"Normal" drop of one or more images.
    if (command.size() >= 2 && command[0] == "NORMAL")
    {
        std::vector<std::string > resources;
        for (unsigned int i = 1;i<command.size();++i)
            resources.push_back(command[i]);

        editor.TriggerDrop(x, y, resources);
    }
    //This is a "special" drop coming from the resource library dialog
    else if (command.size() >= 3 && command[0] == "COPYANDADDRESOURCES")
    {
        std::vector<std::string > files;
        for (unsigned int i = 2;i<command.size();++i)
            files.push_back(command[i]);

        editor.CopyAndAddResources(files, command[1]);
    }
    else
        std::cout << "Drop was triggered but the command was not understood" << std::endl;

    return true;
}
#endif

