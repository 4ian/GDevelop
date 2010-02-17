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

class GD_API Game
{
    public:
        Game();
        virtual ~Game();

        //Quelques informations
        string name;
        string author;

        //Paramètres généraux
        int windowWidth;
        int windowHeight;
        int maxFPS;
        int minFPS;
        bool verticalSync;
        bool portable;
        bool fullscreen;

        //Noms des extensions utilisées
        vector < string > extensionsUsed;

        //Contenu du jeu
        LoadingScreen loadingScreen;

        vector < Image >    images;
        vector < Dossier >  dossierImages;

        vector < Scene >    m_scenes;
        vector < boost::shared_ptr<Object> >    globalObjects;

        //Variables globales
        ListVariable variables;

        #if defined(GDE)
        needReload nr;
        #endif
    protected:
    private:
};

#endif // GAME_H
