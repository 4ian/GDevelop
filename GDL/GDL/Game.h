/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
        int windowWidth;
        int windowHeight;
        int maxFPS;
        int minFPS;
        bool verticalSync;
        bool portable;
        bool fullscreen;

        //Extensions used
        vector < string > extensionsUsed;

        LoadingScreen loadingScreen;

        //Resources
        vector < Image >    images;
        vector < Dossier >  dossierImages;

        vector < boost::shared_ptr<Scene> >             scenes;
        vector < boost::shared_ptr<ExternalEvents> >    externalEvents;
        vector < boost::shared_ptr<Object> >            globalObjects;
        vector < ObjectGroup >                          objectGroups;

        //Initial
        ListVariable variables;

        #if defined(GDE)
        std::string gameFile; ///< File of the game
        bool imagesWereModified;
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
