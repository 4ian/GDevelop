#ifndef RUNTIMEGAME_H
#define RUNTIMEGAME_H

#include "GDL/Game.h"
#include "GDL/ImageManager.h"

/**
 * Game class used at Runtime
 * Used so as not to change the initial global variables
 * for example ( in Editor, it could be annoying to let
 * initial global variables be changed when testing a scene! ).
 * Can also contains runtime-specific members.
 */
class GD_API RuntimeGame : public Game
{
    public:
        RuntimeGame();
        virtual ~RuntimeGame();

        bool LoadFromGame(const Game & game);

        ImageManager imageManager;

    protected:
    private:
};

#endif // RUNTIMEGAME_H
