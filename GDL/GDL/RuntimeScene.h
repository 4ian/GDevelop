/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENEIG_H
#define SCENEIG_H

#include "GDL/MemTrace.h"

#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>

#include "GDL/Scene.h"
#include "GDL/RuntimeGame.h"
#include "GDL/ImageManager.h"
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/Son.h"
#include "GDL/Music.h"
#include "GDL/constantes.h"
#include "GDL/RuntimeLayer.h"
#include "GDL/Text.h"
#include "GDL/SoundManager.h"
#include "GDL/Layer.h"
#include "GDL/ManualTimer.h"
#include "GDL/ObjInstancesHolder.h"

#ifdef GDE
#include "GDL/BaseDebugger.h"
#endif

#ifndef RELEASE
#include "GDL/profile.h"
#endif

/**
 * A Runtime Scene is used when a game is played.
 * It contains everything a scene provide, but also specific
 * functions and members for runtime ( Render functions, objects instances, variables... )
 */
class GD_API RuntimeScene : public Scene
{
    public:
        RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_);
        virtual ~RuntimeScene();

        RuntimeScene& operator=(const RuntimeScene & scene);
        RuntimeScene(const RuntimeScene & scene);

        //Pointeurs vers divers élements utilisés par la scène
        sf::RenderWindow *  renderWindow;
        RuntimeGame *       game;
        SoundManager *      soundManager;
        const sf::Input *   input;
        #ifdef GDE
        BaseDebugger *      debugger;
        #endif

        bool running;

        //Données supplémentaires pour une RuntimeScene
        ObjInstancesHolder                      objectsInstances;
        ListVariable                            variables;
        vector < RuntimeLayer >                 layers;
        vector < Text >                         textes;
        vector < ManualTimer >                  timers;
        float                                   pauseTime;
        int                                     backgroundColorR;
        int                                     backgroundColorG;
        int                                     backgroundColorB;
        ErrorReport                             errors;

        //Fonctions supplémentaires pour une RuntimeScene
        //-> Chargement à partir d'une scène
        bool LoadFromScene( const Scene & scene );
        void PreprocessScene( const Game & Jeu );
        void PreprocessEventList( const Game & Jeu, vector < BaseEventSPtr > & listEvent );

        void ChangeRenderWindow(sf::RenderWindow * window);
        void GotoSceneWhenEventsAreFinished(int scene);

        //-> Gestion de la boucle de jeu
        int RenderAndStep(unsigned int nbStep);
        void RenderWithoutStep();

        //Calques
        const RuntimeLayer & GetLayer(string name) const;
        RuntimeLayer & GetLayer(string name);

        //Accès au temps
        inline void SetTimeScale(float timeScale_) { timeScale = timeScale_; };
        inline float GetTimeScale() const { return timeScale; };
        inline float GetElapsedTime() const { return realElapsedTime*timeScale; };
        inline float GetTimeFromStart() const { return timeFromStart; };
        inline bool IsFirstLoop() const { return firstLoop; };


        bool StopMusic();

    protected:

        void Init(const RuntimeScene & scene);

        //Fonctions supplémentaires pour une RuntimeScene
        //-> Gestion de la boucle de jeu
        void Render();
        bool DisplayLegacyTexts(string layer = "");
        bool OrderObjectsByZOrder( ObjList & objList );
        void GestionObjets();
        void ManageRenderTargetEvents();
        bool UpdateMousePos();
        bool UpdateTime();
        void GestionMusique();
        #ifndef RELEASE
        void DisplayProfile(CProfileIterator * iter, int x, int & y);
        #endif

        //Données supplémentaires pour une RuntimeScene
        bool firstLoop;
        bool isFullScreen;
        float realElapsedTime;
        float elapsedTime;
        float timeScale;
        float timeFromStart;
        int   specialAction; ///< -1 for doing nothing, -2 to quit the game, another number to change the scene

        static RuntimeLayer badLayer;
};

#endif // SCENEIG_H
