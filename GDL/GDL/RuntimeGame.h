/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RUNTIMEGAME_H
#define RUNTIMEGAME_H

#include <boost/shared_ptr.hpp>
#include "GDL/Game.h"
#include "GDL/ImageManager.h"
class ShaderManager;

/**
 * \brief Game class used at Runtime.
 *
 * Used so as not to change the initial global variables
 * for example ( in Editor, it could be annoying to let
 * initial global variables be changed when testing a scene! ).
 * Can also contains runtime-specific members.
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeGame : public Game
{
    public:
        /**
         * Create a new RuntimeGame, using a new Image manager.
         */
        RuntimeGame();
        RuntimeGame(const RuntimeGame&);
        RuntimeGame& operator=(const RuntimeGame & rhs);
        virtual ~RuntimeGame() {};

        boost::shared_ptr<ImageManager> imageManager; ///< Image manager is accessed thanks to a (smart) ptr as it can be shared across (Runtime) games
        boost::shared_ptr<ShaderManager> shaderManager; ///< Shader manager is accessed thanks to a (smart) ptr as it can be shared across (Runtime) games

    private:

        void Init(const RuntimeGame & runtimeGame);
};

#endif // RUNTIMEGAME_H

