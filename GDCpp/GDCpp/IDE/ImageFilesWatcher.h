/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef IMAGEFILESWATCHER_H
#define IMAGEFILESWATCHER_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <wx/fswatcher.h>
namespace gd { class Project; }

/**
 * Watch images files and notify the game if they are modified, so as to reload them when.
 */
class GD_API ImageFilesWatcher : public wxFileSystemWatcher
{
public:
    ImageFilesWatcher(const gd::Project & game_);

protected:
    void OnChange(wxFileSystemWatcherEvent& event);

private:
    const gd::Project & game;
};

#endif // IMAGEFILESWATCHER_H

#endif

