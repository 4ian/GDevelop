/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RUNTIMEGAME_H
#define RUNTIMEGAME_H

#include <boost/shared_ptr.hpp>
class RuntimeScene;
class ImageManager;
class Object;
class ObjectGroup;
#include "GDL/ListVariable.h"
#include "GDL/Image.h"

/**
 * \brief Game class used at Runtime.
 */
class GD_API RuntimeGame
{
    public:
        /**
         * Create a new RuntimeGame, using a new Image manager.
         */
        RuntimeGame();
        RuntimeGame(const RuntimeGame&);
        RuntimeGame& operator=(const RuntimeGame & rhs);
        virtual ~RuntimeGame();

        boost::shared_ptr<ImageManager> imageManager; ///< Image manager is accessed thanks to a (smart) ptr as it can be shared across (Runtime) games

        int windowWidth; ///< Default window width
        int windowHeight; ///< Default window height
        int maxFPS; ///< Maximum Frame Per Seconds, -1 for unlimited
        int minFPS; ///< Minimum Frame Per Seconds ( slow down game if FPS are below this number )
        bool verticalSync; ///< If true, must activate vertical synchronization.
        bool portable; ///< True if the game was saved as a portable game file
        bool fullscreen; ///< True if the game is displayed full screen

        vector < string > extensionsUsed; ///< List of extensions used

        std::vector < Image >    images; ///< List of images available for the game
        std::vector < boost::shared_ptr<RuntimeScene> >             scenes; ///< List of all scenes
        std::vector < boost::shared_ptr<Object> >            globalObjects; ///< Global objects
        std::vector < ObjectGroup >                          objectGroups; ///< Global objects groups

        ListVariable initialVariables; ///< Initial global variables
        ListVariable variables; ///< Global variables

    private:

        void Init(const RuntimeGame & runtimeGame);
};

#endif // RUNTIMEGAME_H
