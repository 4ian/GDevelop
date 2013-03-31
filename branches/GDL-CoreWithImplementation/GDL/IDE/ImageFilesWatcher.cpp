/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <iostream>
#include <wx/fswatcher.h>
#include "GDL/Game.h"
#include "GDL/IDE/ImageFilesWatcher.h"

ImageFilesWatcher::ImageFilesWatcher(const Game & game_) :
    wxFileSystemWatcher(),
    game(game_)
{
    Connect(wxEVT_FSWATCHER, wxFileSystemWatcherEventHandler(ImageFilesWatcher::OnChange));
    Connect(wxFSW_EVENT_MODIFY, wxFileSystemWatcherEventHandler(ImageFilesWatcher::OnChange));
}

void ImageFilesWatcher::OnChange(wxFileSystemWatcherEvent& event)
{
    //Do nothing for now
    //std::cout << "changed :" << event.GetNewPath().GetPath() << std::endl;
}

#endif

