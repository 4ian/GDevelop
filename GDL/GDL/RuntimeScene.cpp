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
 *  Contient des fonctions propres aux scènes In game ( mises à jour de données... )
 */

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include <exception>
#include <stdexcept>
#include <sstream>
#include "GDL/RuntimeScene.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/ImageManager.h"
#include "GDL/SortByPlan.h"
#include "GDL/Chercher.h"
#include "GDL/ChercherScene.h"
#include "GDL/AppelEvent.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Layer.h"
#include "GDL/EventsPreprocessor.h"
#include "GDL/profile.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Position.h"

void MessageLoading( string message, float avancement ); //Prototype de la fonction pour renvoyer un message
//La fonction est implémenté différemment en fonction du player ou de l'éditeur

Layer RuntimeScene::badLayer;

RuntimeScene::RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_) :
renderWindow(renderWindow_),
game(game_),
input(&renderWindow->GetInput()),
#ifdef GDE
debugger(NULL),
#endif
running(true),
pauseTime(0),
backgroundColorR(125),
backgroundColorG(125),
backgroundColorB(125),
firstLoop(true),
realElapsedTime(0),
elapsedTime(0),
timeScale(1),
timeFromStart(0)
{
    //ctor
    soundManager = SoundManager::getInstance();
    renderWindow->ShowMouseCursor( true );

    //Calque par défaut
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->windowWidth, game->windowHeight ) );
    layers.push_back(Layer());
    layers[0].SetView(defaultView);

    ChangeRenderWindow(renderWindow);
}

RuntimeScene::~RuntimeScene()
{
    //dtor
}

RuntimeScene::RuntimeScene(const RuntimeScene & scene) : Scene(scene)
{
    renderWindow = scene.renderWindow;
    game = scene.game;
    soundManager = scene.soundManager;
    input = scene.input;
    #ifdef GDE
    debugger = scene.debugger;
    #endif
    running = scene.running;

    objectsInstances = scene.objectsInstances.CopyAndCloneAllObjects();

    variables = scene.variables;
    textes = scene.textes;
    timers = scene.timers;
    pauseTime = scene.pauseTime;
    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    errors = scene.errors;

    firstLoop = scene.firstLoop;
    isFullScreen = scene.isFullScreen;
    realElapsedTime = scene.realElapsedTime;
    elapsedTime = scene.elapsedTime;
    timeScale = scene.timeScale;
    timeFromStart = scene.timeFromStart;
}

RuntimeScene& RuntimeScene::operator=(const RuntimeScene & scene)
{
    if( (this) != &scene )
    {

        this->renderWindow = scene.renderWindow;
        this->game = scene.game;
        this->soundManager = scene.soundManager;
        this->input = scene.input;
        #ifdef GDE
        this->debugger = scene.debugger;
        #endif
        this->running = scene.running;

        this->objectsInstances = scene.objectsInstances.CopyAndCloneAllObjects();

        this->variables = scene.variables;
        this->textes = scene.textes;
        this->timers = scene.timers;
        this->pauseTime = scene.pauseTime;
        this->backgroundColorR = scene.backgroundColorR;
        this->backgroundColorG = scene.backgroundColorG;
        this->backgroundColorB = scene.backgroundColorB;
        this->errors = scene.errors;

        this->firstLoop = scene.firstLoop;
        this->isFullScreen = scene.isFullScreen;
        this->realElapsedTime = scene.realElapsedTime;
        this->elapsedTime = scene.elapsedTime;
        this->timeScale = scene.timeScale;
        this->timeFromStart = scene.timeFromStart;
    }

    return *this;
}

void RuntimeScene::ChangeRenderWindow(sf::RenderWindow * newWindow)
{
    if ( newWindow == NULL )
        cout << "Try to change renderWindow to a NULL window.";

    renderWindow = newWindow;
    input = &renderWindow->GetInput();

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    double windowRatio = static_cast<double>(renderWindow->GetWidth())/static_cast<double>(renderWindow->GetHeight());
    gluPerspective(90.f, windowRatio, 1.f, 500.f);
    glViewport(0, 0, renderWindow->GetWidth(), renderWindow->GetHeight());
}

////////////////////////////////////////////////////////////
/// Avancer l'état de la scène et la dessiner
/// Appelé habituellement à chaque tour de boucle de jeu
////////////////////////////////////////////////////////////
int RuntimeScene::RenderAndStep(unsigned int nbStep)
{
    BT_PROFILE("RenderAndStep");
    for (unsigned int step = 0;step<nbStep;++step)
    {
        //Gestion pré-évènements
        ManageRenderTargetEvents();
        UpdateTime();
        GestionMusique();

        //Gestions des évènements
        //TODO : Optimisation
        EventsExecutor eventsExecutor(this);
        int NouvelleScene = eventsExecutor.ExecuteEventsScene();
        if ( NouvelleScene != -1 )
            return NouvelleScene; //La scène veut autre chose que continuer.

        //Gestions post-évènements
        GestionObjets();

        #ifdef GDE
        if( debugger )
            debugger->Update();
        #endif
        Render();

        textes.clear();

        if ( firstLoop ) firstLoop = false; //On n'est plus la première fois
    }

    return -1;
}

////////////////////////////////////////////////////////////
/// Gestion des évènements basiques de la fenêtre
////////////////////////////////////////////////////////////
void RuntimeScene::ManageRenderTargetEvents()
{
    sf::Event event;
    while ( renderWindow->GetEvent( event ) )
    {
        // Close window : exit
        if ( event.Type == sf::Event::Closed )
        {
            running = false;
            #if defined(GDE)
            renderWindow->Close();
            #endif
        }
        else if (event.Type == sf::Event::Resized)
        {
            //Resetup OpenGL
            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();

            double windowRatio = static_cast<double>(event.Size.Width)/static_cast<double>(event.Size.Height);
            gluPerspective(90.f, windowRatio, 1.f, 500.f);
            glViewport(0, 0, event.Size.Width, event.Size.Height);
        }
    }
}

////////////////////////////////////////////////////////////
/// Affichage simple
////////////////////////////////////////////////////////////
void RuntimeScene::RenderWithoutStep()
{
    ManageRenderTargetEvents();

    Render();

    #ifdef GDE
    if( debugger )
        debugger->Update();
    #endif
}

#ifndef RELEASE
void RuntimeScene::DisplayProfile(CProfileIterator * iter, int x, int & y)
{
    y += 15;
    while ( !iter->Is_Done() )
    {
        sf::Text text;
        text.SetCharacterSize(12);
        ostringstream texte;
        if ( CProfileManager::Get_Frame_Count_Since_Reset() != 0 )
            texte << iter->Get_Current_Name()   << " Calls/Frame:" << iter->Get_Current_Total_Calls()/CProfileManager::Get_Frame_Count_Since_Reset()
                                                << " Time/Frame:" << iter->Get_Current_Total_Time()/CProfileManager::Get_Frame_Count_Since_Reset();
        text.SetString(texte.str());
        text.SetPosition(x,y);
        renderWindow->Draw(text);

        //Childs
        CProfileIterator * childIter = CProfileManager::Get_Iterator();
        *childIter = *iter;
        childIter->Enter_Child(0);
        DisplayProfile(childIter, x+15, y);
        CProfileManager::Release_Iterator(childIter);

        y += 15;
        iter->Next();
    }
}
#endif

////////////////////////////////////////////////////////////
/// Affichage dans une sf::RenderWindow
////////////////////////////////////////////////////////////
void RuntimeScene::Render()
{
    renderWindow->Clear( sf::Color( backgroundColorR, backgroundColorG, backgroundColorB ) );

    //Sort object by order to rendering them
    ObjList allObjects = objectsInstances.GetAllObjects();
    OrderObjectsByZOrder( allObjects );

    //To allow using OpenGL to draw :
    glClear(GL_DEPTH_BUFFER_BIT); // Clear the depth buffer
    renderWindow->SaveGLStates();
    renderWindow->SetActive();

    //Draw layer by layer
    for (unsigned int layerIndex =0;layerIndex<layers.size();++layerIndex)
    {
        renderWindow->SetView(layers.at(layerIndex).ModView());
        if ( layers.at(layerIndex).GetVisibility() )
        {
            for (unsigned int id = 0;id < allObjects.size();++id)
            {
                //Affichage de l'objet si il appartient au calque
                if ( allObjects[id]->GetLayer() == layers[layerIndex].GetName() )
                {
                    //Calcul des coordonnées en fonction des forces.
                    allObjects[id]->SetX( allObjects[id]->GetX() + ( allObjects[id]->TotalForceX() * GetElapsedTime() ));
                    allObjects[id]->SetY( allObjects[id]->GetY() + ( allObjects[id]->TotalForceY() * GetElapsedTime() ));

                    allObjects[id]->UpdateTime( GetElapsedTime() );
                    allObjects[id]->Draw( *renderWindow );

                    //Fin des forces
                    allObjects[id]->UpdateForce( GetElapsedTime() );
                }
            }

            //Texts
            AfficheTexte(layers.at(layerIndex).GetName());
        }
    }

    //Résultats du profiler
    #ifndef RELEASE
    if ( renderWindow->GetInput().IsKeyDown(sf::Key::F2))
        CProfileManager::Reset();

    renderWindow->SetView(renderWindow->GetDefaultView());

    CProfileIterator * iter = CProfileManager::Get_Iterator();
    int y = 0;
    DisplayProfile(iter, 0,y);
    CProfileManager::Increment_Frame_Counter();
    #endif

    // Display window contents on screen
    renderWindow->RestoreGLStates();
    renderWindow->Display();
}

////////////////////////////////////////////////////////////
/// Renvoie le calque avec le nom indiqué
////////////////////////////////////////////////////////////
Layer & RuntimeScene::ModLayer(string name)
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
    	if( layers[i].GetName() == name )
            return layers[i];
    }

    cout << "Impossible de trouver le calque \""+name+"\".";
    return badLayer;
}

////////////////////////////////////////////////////////////
/// Renvoie le calque avec le nom indiqué
////////////////////////////////////////////////////////////
const Layer & RuntimeScene::GetLayer(string name) const
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
    	if( layers[i].GetName() == name )
            return layers[i];
    }

    cout << "Impossible de trouver le calque \""+name+"\".";
    return badLayer;
}

////////////////////////////////////////////////////////////
/// Met à jour le temps
////////////////////////////////////////////////////////////
bool RuntimeScene::UpdateTime()
{
    //Temps écoulé depuis la dernière frame
    realElapsedTime = renderWindow->GetFrameTime();
    realElapsedTime -= pauseTime; //On enlève le temps de pause

    //On modifie ce temps écoulé si il est trop bas.
    if ( game->minFPS != 0 && realElapsedTime > 1.f/static_cast<float>(game->minFPS) )
        realElapsedTime = 1.f/static_cast<float>(game->minFPS); //On ralentit le jeu si les FPS sont trop bas.

    elapsedTime = realElapsedTime*timeScale; //Le temps écoulé par le jeu est modifié suivant l'échelle du temps

    timeFromStart += elapsedTime;
    pauseTime = 0;

    for (unsigned int i =0;i<timers.size();++i)
        timers[i].UpdateTime(elapsedTime);

    return true;
}

////////////////////////////////////////////////////////////
/// Met à jour un tableau contenant l'ordre d'affichage des objets
////////////////////////////////////////////////////////////
bool RuntimeScene::OrderObjectsByZOrder( ObjList & objList )
{
    if ( standardSortMethod )
        std::sort( objList.begin(), objList.end(), SortByZOrder() );
    else
        std::stable_sort( objList.begin(), objList.end(), SortByZOrder() );

    return true;
}

////////////////////////////////////////////////////////////
/// Affiche le texte
////////////////////////////////////////////////////////////
bool RuntimeScene::AfficheTexte(string layer)
{
    for ( unsigned int i = 0;i < textes.size();i++ )
    {
        if ( textes[i].layer == layer )
            textes[i].Draw(*renderWindow);
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Stoppe toutes les musiques de la scène
////////////////////////////////////////////////////////////
bool RuntimeScene::StopMusic()
{
    SoundManager * soundManager;
    soundManager = SoundManager::getInstance();

    //Arrêt des musiques : simples musiques
    for ( unsigned int i = 0;i < soundManager->musics.size();i++ )
    {
        soundManager->musics.at( i )->Stop();
    }
    soundManager->musics.clear();

    //Arrêt des musiques : musiques sur channels
    for ( unsigned int i = 0;i < MAX_CANAUX_MUSIC;i++ )
    {
        soundManager->GetMusicOnChannel(i)->Stop();
    }

    //Arrêt des sons
    for ( unsigned int i = 0;i < soundManager->sounds.size();i++ )
    {
        soundManager->sounds.at( i )->sound.Stop();
    }
    soundManager->sounds.clear();

    //Arrêt des sons : sons sur channels
    for ( unsigned int i = 0;i < MAX_CANAUX_SON;i++ )
    {
        soundManager->GetSoundOnChannel(i)->sound.Stop();
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Efface les musiques et sons terminés
////////////////////////////////////////////////////////////
void RuntimeScene::GestionMusique()
{
    //Bruitages sans canaux. On les détruits si besoin est.
    for ( int i = soundManager->sounds.size() - 1;i >= 0;i-- )
    {
        if ( soundManager->sounds.at( i )->sound.GetStatus() == sf::Sound::Stopped )
        {
            delete soundManager->sounds.at( i ); //Les sounds sont gerés par pointeurs
            soundManager->sounds.erase( soundManager->sounds.begin() + i );
        }
    }


    //Musiques sans canaux.
    for ( unsigned int i = 0;i < soundManager->musics.size();i++ )
    {
        if ( soundManager->musics.at( i )->GetStatus() == sf::Music::Stopped )
        {
            soundManager->musics.erase( soundManager->musics.begin() + i );
        }
    }
}

////////////////////////////////////////////////////////////
/// Efface les objets à effacer ( nom vide )
////////////////////////////////////////////////////////////
void RuntimeScene::GestionObjets()
{
    //Sort object by order to rendering them
    ObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
    	if ( allObjects[id]->GetName() == "" )
    	{
            objectsInstances.RemoveObject(allObjects[id]); //Remove from objects Instances, not from the temporary list !
    	}
    }
}


////////////////////////////////////////////////////////////
/// Ouvre un jeu, et stocke dans les tableaux passés en paramétres.
////////////////////////////////////////////////////////////
bool RuntimeScene::LoadFromScene( const Scene & scene )
{
    //Clear RuntimeScene datas
    variables.variables.clear();
    objectsInstances.Clear();
    textes.clear();
    timers.clear();
    layers.clear();
    firstLoop = true;
    elapsedTime = 0;
    realElapsedTime = 0;
    pauseTime = 0;
    timeFromStart = 0;

    //Copy inherited datas
    objetsInitiaux = scene.objetsInitiaux;
    objectGroups = scene.objectGroups;
    layers = scene.layers;
    variables = scene.variables;
    events = scene.events;
    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    title = scene.title;
    standardSortMethod = scene.standardSortMethod;

    //Initialize layers
    for (unsigned int i = 0;i<layers.size();++i)
    {
        sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->windowWidth, game->windowHeight ) );
        layers[i].SetView(defaultView);
    }

    //Load resources of initial objects
    try
    {
        for (unsigned int i = 0; i < scene.objetsInitiaux.size();++i)
        {
            MessageLoading( "Chargement des images de l'objet : " + scene.objetsInitiaux.at( i )->GetName(), i + 1 / scene.objetsInitiaux.size()*100 / 3 + 33 );
            scene.objetsInitiaux[i]->LoadResources(game->imageManager);
        }
    }
    catch ( std::out_of_range& e )
    {
        std::cout << "Out of range: " << e.what() << "\n";
    }

    //Load resources of global objects
    //TODO : Make this only one time during game
    try
    {
        for (unsigned int i = 0; i < game->globalObjects.size();++i)
        {
            MessageLoading( "Chargement des images de l'objet : " + game->globalObjects[i]->GetName(), i + 1 /  game->globalObjects.size()*100 / 3 + 33 );
            game->globalObjects[i]->LoadResources(game->imageManager);
        }
    }
    catch ( std::out_of_range& e )
    {
        std::cout << "Out of range: " << e.what() << "\n";
    }

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //Create object instances which are originally positionned on scene
    for(unsigned int i = 0;i < scene.positionsInitiales.size();++i)
    {
        MessageLoading( "Positionnement de l'objet : " + scene.positionsInitiales[i].objectName, i + 1 / scene.positionsInitiales.size()*100 / 3 + 33 );

        int IDsceneObject = Picker::PickOneObject( &objetsInitiaux, scene.positionsInitiales[i].objectName );
        int IDglobalObject = Picker::PickOneObject( &game->globalObjects, scene.positionsInitiales[i].objectName );

        ObjSPtr newObject = boost::shared_ptr<Object> ();

        if ( IDsceneObject != -1 ) //We check first scene's objects' list.
            newObject = extensionManager->CreateObject(objetsInitiaux[IDsceneObject]);
        else if ( IDglobalObject != -1 ) //Then the global object list
            newObject = extensionManager->CreateObject(game->globalObjects.at( IDglobalObject ));
        else
        {
            string nom = scene.positionsInitiales[i].objectName;
            errors.Add( "N'a pas pu trouver et positionner l'objet nommé " + nom + " ( N'existe pas dans la liste des objets de la scène ou globale )", "", nom, -1, 2 );
        }

        if ( newObject != boost::shared_ptr<Object> () )
        {
            newObject->errors = &errors;
            newObject->SetX( scene.positionsInitiales[i].x );
            newObject->SetY( scene.positionsInitiales[i].y );
            newObject->SetZOrder( scene.positionsInitiales[i].zOrder );
            newObject->SetLayer( scene.positionsInitiales[i].layer );
            newObject->SetAngle( scene.positionsInitiales[i].angle );

            if ( scene.positionsInitiales[i].personalizedSize )
            {
                newObject->SetWidth(scene.positionsInitiales[i].width);
                newObject->SetHeight(scene.positionsInitiales[i].height);
            }

            newObject->InitializeFromInitialPosition(scene.positionsInitiales[i]);

            objectsInstances.AddObject(newObject);
        }
    }

    //Preprocess events
    PreprocessScene( *game );

    MessageLoading( "Chargement de la scène terminé", 100 );

    return true;
}

////////////////////////////////////////////////////////////
/// Opération sur les évènements pendant le chargement de la scène
////////////////////////////////////////////////////////////
void RuntimeScene::PreprocessScene( const Game & Jeu )
{
    //Inclusion des liens
    PreprocessEventList( Jeu, events );

    EventsPreprocessor::DeleteUselessEvents(events);

    //Optimisation des appels aux fonctions des évènements
    EventsPreprocessor::PreprocessEvents(*this, events);

}

////////////////////////////////////////////////////////////
/// Insertion des liens
////////////////////////////////////////////////////////////
void RuntimeScene::PreprocessEventList( const Game & Jeu, vector < Event > & listEvent )
{
    for ( unsigned int i = 0;i < listEvent.size();i++ )
    {
        if ( listEvent.at( i ).type == "Link" )
        {
            //On récupère la scène à insérer
            int sceneID = ChercherScene( Jeu.m_scenes, listEvent.at( i ).sceneLinked );
            if ( sceneID == -1 ) return;

            int start = listEvent.at( i ).start;
            int end = listEvent.at( i ).end;

            if ( start == -1 && end == -1 ) //Doit on inclure tous les évènements ?
            {
                start = 0;
                end = Jeu.m_scenes.at( sceneID ).events.size() - 1;
            }
            else //Ou inclure juste certains évènements
            {
                start--; //On réduit les numéros car l'éditeur de scènes commence à 1
                end--;
            }

            //On teste la validité de l'insertion
            if ( start < 0 || static_cast<unsigned>(start) >= Jeu.m_scenes.at( sceneID ).events.size() )
            {
                errors.Add( "Impossible d'insérer les évènements du lien", "", "", i, 2 );
                return;
            }
            if ( end < 0 || static_cast<unsigned>(end) >= Jeu.m_scenes.at( sceneID ).events.size() )
            {
                errors.Add( "Impossible d'insérer les évènements du lien", "", "", i, 2 );
                return;
            }
            if ( start > end )
            {
                errors.Add( "Impossible d'insérer les évènements du lien ( la fin est avant le départ )", "", "", i, 2 );
                return;
            }

            listEvent.erase( listEvent.begin() + i ); //Suppression du lien
            for ( int insertion = start ; insertion <= end ;insertion++ ) //Insertion des évènements du lien
            {
                if ( i+insertion < listEvent.size() )
                    listEvent.insert( listEvent.begin() + i+insertion, Jeu.m_scenes.at( sceneID ).events.at( insertion ) );
                else
                    listEvent.push_back( Jeu.m_scenes.at( sceneID ).events.at( insertion ) );
            }
        }
        else if ( !listEvent.at( i ).events.empty() )
        {
            PreprocessEventList( Jeu, listEvent.at( i ).events);
        }
    }
}
