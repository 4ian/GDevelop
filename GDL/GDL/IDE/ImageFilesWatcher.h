/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef IMAGEFILESWATCHER_H
#define IMAGEFILESWATCHER_H

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <wx/fswatcher.h>
class Game;

/**
 * Watch images files and notify the game if they are modified, so as to reload them when.
 */
class GD_API ImageFilesWatcher : public wxFileSystemWatcher
{
public:
    ImageFilesWatcher(const Game & game_);

protected:
    void OnChange(wxFileSystemWatcherEvent& event);

private:
    const Game & game;
};

#endif // IMAGEFILESWATCHER_H

#endif

