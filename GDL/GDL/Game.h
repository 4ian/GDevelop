/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Classe qui contient un jeu
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
#if defined(GDE)
#include "GDL/needReload.h"
#endif

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

        vector < boost::shared_ptr<Scene> >     scenes;
        vector < boost::shared_ptr<Object> >    globalObjects;

        //Initial
        ListVariable variables;

        #if defined(GDE)
        needReload      nr;
        string          gameFile; ///< File of the game
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
