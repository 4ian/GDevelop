/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef IMAGEFILESWATCHER_H
#define IMAGEFILESWATCHER_H

#if defined(DESACTIVATED_FOR_WX290)
#include <wx/fswatcher.h>
class Game;

/**
 * Watch images file and notify the game to reload them when they are modified.
 */
class GD_API ImageFilesWatcher : public wxFileSystemWatcher
{
public:
    ImageFilesWatcher(const Game & game_);

protected:
    void OnChange(int changeType, const wxFileName& path, const wxFileName& newPath);

private:
    const Game & game;
};

#endif

#endif // IMAGEFILESWATCHER_H

#endif
