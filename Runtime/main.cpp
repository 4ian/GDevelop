/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#if defined(__GNUC__)
#include <unistd.h>
#endif

#include "GDL/CommonTools.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/RuntimeScene.h"
#include "GDL/RessourcesLoader.h"
#include "GDL/FontManager.h"
#include "GDL/SoundManager.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/Game.h"
#include "GDL/EventsExecutionEngine.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/DynamicExtensionsManager.h"
#include "CompilationChecker.h"
#include "GDL/Log.h"
#include "GDL/AES.h"

#include <time.h>
#include <stdlib.h>
#include <stdio.h>

using namespace std;

int main( int argc, char *p_argv[] )
{
    GDLogBanner();

    // On définit le chemin d'execution du programme par rapport a la localisation de son executable
    // Utile surtout sous linux
#ifdef LINUX
    string tmp;
    if ( *p_argv[0] != '/' )
    {
        char buffer[1024];
        tmp += ( getcwd( buffer, 1024 ) );
        tmp += "/";
    }
    tmp += p_argv[0];
    tmp = tmp.substr( 0, tmp.find_last_of( "/" ) );
    chdir( tmp.c_str() );
#endif

    CompilationChecker::EnsureCorrectGDLVersion();

    GDpriv::ExtensionsLoader * extensionsLoader = GDpriv::ExtensionsLoader::GetInstance();
    extensionsLoader->SetExtensionsDir("./");
    extensionsLoader->LoadAllStaticExtensionsAvailable();

    #if !defined(GD_NO_DYNAMIC_EXTENSIONS)
    GDpriv::DynamicExtensionsManager::GetInstance()->LoadDynamicExtension("dynext.dxgd");
    #endif

    RessourcesLoader * exeGD = RessourcesLoader::GetInstance();
    exeGD->SetExeGD( "gam.egd" );
    string srcString = exeGD->LoadPlainText( "src" );

    //Le jeu
    RuntimeGame game;

    //Open game
#ifndef RELEASE

    if ( srcString.empty() )
    {
        cout << endl << "Unable to initialize game." << endl;
        return EXIT_FAILURE;
    }

    OpenSaveGame openGame( game );
    {
        int fsize = exeGD->GetBinaryFileSize( "src" );

        // round up (ignore pad for here)
        int size = (fsize+15)&(~15);

        char * ibuffer = exeGD->LoadBinaryFile( "src" );
        char * obuffer = new char[size];

        AES crypt;
        crypt.SetParameters(192);

        unsigned char key[] = "-P:j$4t&OHIUVM/Z+u4DeDP.";

        crypt.StartDecryption(key);
        crypt.Decrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

        string uncryptedSrc = obuffer;
        delete [] obuffer;

        openGame.OpenFromString(uncryptedSrc);
	}

#else

#endif

    if ( game.scenes.empty() )
    {
        std::cout << "No scene to be loaded." << std::endl;
        return EXIT_FAILURE;
    }

    //LLVM stuff
    cout << "Initializing LLVM/Clang..." << endl;
    EventsExecutionEngine::EnsureLLVMTargetsInitialization();
    cout << "Loading required dynamic libraries..." << endl;
    EventsExecutionEngine::LoadDynamicLibraries();

    //Loading first scene bitcode
    if ( !game.scenes[0]->compiledEventsExecutionEngine->LoadFromLLVMBitCode(exeGD->LoadBinaryFile( "GDpriv"+game.scenes[0]->GetName()+".ir" ), exeGD->GetBinaryFileSize( "GDpriv"+game.scenes[0]->GetName()+".ir" )) )
    {
        std::cout << "Unable to load bitcode from " << "GDpriv"+game.scenes[0]->GetName()+".ir" << std::endl;
        return EXIT_FAILURE;
    }

    //Initialize image manager and load always loaded images
    game.imageManager->SetGame( &game );
    game.imageManager->LoadPermanentImages();

    //Fenêtre de jeu
    sf::RenderWindow window;
    window.SetFramerateLimit( game.maxFPS );
    window.EnableVerticalSync( game.verticalSync );

    RuntimeScene scenePlayed(&window, &game);
    if ( !scenePlayed.LoadFromScene( *game.scenes[0] ) )
        std::cout << "Unable to load first scene." << std::endl;

    window.Create( sf::VideoMode( game.windowWidth, game.windowHeight, 32 ), scenePlayed.title, sf::Style::Close );
    window.SetActive(true);

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    double windowRatio = static_cast<double>(window.GetWidth())/static_cast<double>(window.GetHeight());
    gluPerspective(scenePlayed.oglFOV, windowRatio, scenePlayed.oglZNear, scenePlayed.oglZFar);

    //Boucle de jeu
    while ( scenePlayed.running )
    {
        int returnCode = scenePlayed.RenderAndStep(1);

        if ( returnCode == -2 ) //Quitter le jeu
            scenePlayed.running = false;
        else if ( returnCode != -1 ) //Changer de scènes
        {
            RuntimeScene newScenePlayed(&window, &game);
            scenePlayed = newScenePlayed; //Clear the scene

            if ( !game.scenes[returnCode]->compiledEventsExecutionEngine->Ready() &&
                 !game.scenes[returnCode]->compiledEventsExecutionEngine->LoadFromLLVMBitCode(exeGD->LoadBinaryFile( "GDpriv"+game.scenes[returnCode]->GetName()+".ir" ), exeGD->GetBinaryFileSize( "GDpriv"+game.scenes[returnCode]->GetName()+".ir" )) )
            {
                std::cout << "Unable to load bitcode from " << "GDpriv"+game.scenes[returnCode]->GetName()+".ir" << std::endl;
                return EXIT_FAILURE;
            }

            if ( !scenePlayed.LoadFromScene( *game.scenes[returnCode] ) )
                std::cout << "Scene loading failed!" << std::endl;
        }
    }

    SoundManager * soundManager = SoundManager::GetInstance();
    soundManager->DestroySingleton();
    FontManager * fontManager = FontManager::GetInstance();
    fontManager->DestroySingleton();

    return EXIT_SUCCESS;
}
