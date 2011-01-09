/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GAME_H
#define GAME_H

#include "GDL/Object.h"
#include "GDL/Scene.h"
#include "GDL/ListVariable.h"
#include "GDL/Dossier.h"
#include <string>
#include <vector>
#include "GDL/Image.h"
#include "GDL/LoadingScreen.h"
class ExternalEvents;

using namespace std;

/**
 * Game contains all data of a game, from scenes
 * to properties like game's name.
 */
class GD_API Game
{
    public:
        Game();
        Game(const Game&);
        virtual ~Game() {};

        Game& operator=(const Game & rhs);

        //Some properties
        string name;
        string author;
        int windowWidth; ///< Default window width
        int windowHeight; ///< Default window height
        int maxFPS; ///< Maximum Frame Per Seconds, -1 for unlimited
        int minFPS; ///< Minimum Frame Per Seconds ( slow down game if FPS are below this number )
        bool verticalSync; ///< If true, must activate vertical synchronization.
        bool portable; ///< True if the game was saved as a portable game file
        bool fullscreen; ///< True if the game is displayed full screen

        vector < string > extensionsUsed; ///< List of extensions used

        LoadingScreen loadingScreen; ///< Data concerning the loading screen

        vector < Image >    images; ///< List of images available for the game
        vector < Dossier >  imagesFolders; ///< Folder used to organize images

        vector < boost::shared_ptr<Scene> >             scenes; ///< List of all scenes
        vector < boost::shared_ptr<ExternalEvents> >    externalEvents; ///< List of all externals events
        vector < boost::shared_ptr<Object> >            globalObjects; ///< Global objects
        vector < ObjectGroup >                          objectGroups; ///< Global objects groups

        ListVariable variables; ///< Initial global variables

        #if defined(GD_IDE_ONLY)
        std::string gameFile; ///< File of the game
        vector < string > imagesChanged; ///< Images that have been changed and which have to be reloaded

        std::string winExecutableFilename; ///< Windows executable name
        std::string winExecutableIconFile; ///< Icon for Windows executable
        std::string linuxExecutableFilename;  ///< Linux executable name
        #endif

    protected:
    private:

        /**
         * Initialize from another game. Used by copy-ctor and assign-op.
         * Don't forget to update me if members were changed !
         */
        void Init(const Game & game);
};

#endif // GAME_H
