/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "RecursiveMkDir.h"
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/arrstr.h>

namespace gd
{

bool RecursiveMkDir::MkDir(wxString directory)
{
    wxFileName destinationDir = wxFileName::FileName(directory);
    wxArrayString dirs = destinationDir.GetDirs();

    wxString currentDir = destinationDir.GetVolume();
    for (unsigned int i = 0;i<dirs.size();++i)
    {
        currentDir += destinationDir.GetPathSeparator()+dirs[i];

        if ( !wxDirExists(currentDir) )
        {
            if ( !wxMkDir(currentDir, 0777) ) return false;
        }
    }

    return true;
}

}
