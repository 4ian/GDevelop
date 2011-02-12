/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#if defined(DESACTIVATED_FOR_WX290)
#include <iostream>
#include <wx/fswatcher.h>
#include "GDL/Game.h"
#include "GDL/ImageFilesWatcher.h"

ImageFilesWatcher::ImageFilesWatcher(const Game & game_) :
    wxFileSystemWatcher(),
    game(game_)
{
}

void ImageFilesWatcher::OnChange(int changeType, const wxFileName& path, const wxFileName& newPath)
{
    std::cout << "changed :" << path.GetFullName() << std::endl;
}

#endif

#endif
