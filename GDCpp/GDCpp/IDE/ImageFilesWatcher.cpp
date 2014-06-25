/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <iostream>
#include <wx/fswatcher.h>
#include "GDCpp/Project.h"
#include "GDCpp/IDE/ImageFilesWatcher.h"

ImageFilesWatcher::ImageFilesWatcher(const gd::Project & game_) :
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

