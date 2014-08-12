/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "RecursiveMkDir.h"
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/arrstr.h>
#include <iostream>

namespace gd
{

bool RecursiveMkDir::MkDir(wxString directory)
{
    wxFileName destinationDir = wxFileName::FileName(directory+"/");
    wxArrayString dirs = destinationDir.GetDirs();

    wxString currentDir = destinationDir.GetVolume()+destinationDir.GetVolumeSeparator();
    for (unsigned int i = 0;i<dirs.size();++i)
    {
        currentDir += destinationDir.GetPathSeparator()+dirs[i];

        if ( !wxDirExists(currentDir) )
        {
            wxMkDir(wxString(currentDir+"/"), 0777);
        }
    }

    return true;
}

}
#endif