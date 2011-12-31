/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/SceneNameMangler.h"
#include "GDL/Game.h"
#include "GDL/RuntimeGame.h"
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

std::string GetCurrentWorkingDirectory();

int main( int argc, char *p_argv[] )
{
    GDLogBanner();

    //Get executable location
    string fullExecutablePath;
    if ( *p_argv[0] != '/' )
    {
        fullExecutablePath += GetCurrentWorkingDirectory();
        fullExecutablePath += "/";
    }
    fullExecutablePath += p_argv[0];
    string executablePath = fullExecutablePath.substr( 0, fullExecutablePath.find_last_of( "/" ) );
    string executableFilename = fullExecutablePath.find_last_of( "/" ) < fullExecutablePath.length() ? fullExecutablePath.substr( fullExecutablePath.find_last_of( "/" ), fullExecutablePath.length() ) : "";

    // For linux, make the executable dir the current working directory
#ifdef LINUX
    chdir( executablePath.c_str() );
#endif

    //Check GDL version
    CompilationChecker::EnsureCorrectGDLVersion();

    //Load extensions
    GDpriv::ExtensionsLoader * extensionsLoader = GDpriv::ExtensionsLoader::GetInstance();
    extensionsLoader->SetExtensionsDir("./");
    extensionsLoader->LoadAllStaticExtensionsAvailable();

    #if !defined(GD_NO_DYNAMIC_EXTENSIONS)
    GDpriv::DynamicExtensionsManager::GetInstance()->LoadDynamicExtension("dynext.dxgd");
    #endif

    //Load game
    RessourcesLoader * exeGD = RessourcesLoader::GetInstance();
    if ( !exeGD->SetExeGD( executablePath+"/"+executableFilename.substr(0, executableFilename.length()-4)+".egd" ) && !exeGD->SetExeGD( executablePath+"/gam.egd" ) )
    {
        std::cout << "Failed to properly load executable." << std::endl;
        return EXIT_FAILURE;
    }

    RuntimeGame game;

    //Display optional loading screen
    OpenSaveLoadingScreen openLS(game.loadingScreen);
    openLS.OpenFromString(exeGD->LoadPlainText( "loadingscreen" ));

    unsigned long style = 0;
    if ( game.loadingScreen.border ) style |= sf::Style::Titlebar;
    sf::RenderWindow loadingApp( sf::VideoMode( game.loadingScreen.width, game.loadingScreen.height, 32 ), "Chargement en cours...", style );
    loadingApp.Show(game.loadingScreen.afficher);
    loadingApp.Clear( sf::Color( 100, 100, 100 ) );

    boost::shared_ptr<sf::Texture> image = boost::shared_ptr<sf::Texture>(exeGD->LoadSFMLTexture( game.loadingScreen.imageFichier ));
    if ( !game.loadingScreen.smooth ) image->SetSmooth(false);

    sf::Sprite sprite( *image );
    if ( game.loadingScreen.image )
    {
        loadingApp.Draw( sprite );
    }
    if ( game.loadingScreen.texte )
    {
        sf::Text Chargement( game.loadingScreen.texteChargement, *FontManager::GetInstance()->GetFont("") );
        Chargement.SetPosition( game.loadingScreen.texteXPos, game.loadingScreen.texteYPos );
        loadingApp.Draw( Chargement );
    }
    loadingApp.Display();

    OpenSaveGame openGame( game );
    {
        cout << "Getting src file size..." << endl;
        int fsize = exeGD->GetBinaryFileSize( "src" );

        // round up (ignore pad for here)
        int size = (fsize+15)&(~15);

        cout << "Getting src raw data..." << endl;
        char * ibuffer = exeGD->LoadBinaryFile( "src" );
        char * obuffer = new char[size];

        AES crypt;
        crypt.SetParameters(192);

        unsigned char key[] = "-P:j$4t&OHIUVM/Z+u4DeDP.";

        crypt.StartDecryption(key);
        crypt.Decrypt(reinterpret_cast<const unsigned char*>(ibuffer),reinterpret_cast<unsigned char*>(obuffer),size/16);

        string uncryptedSrc = obuffer;
        delete [] obuffer;

        cout << "Loading game info..." << endl;
        openGame.OpenFromString(uncryptedSrc);
	}

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
    if ( !game.scenes[0]->compiledEventsExecutionEngine->LoadFromLLVMBitCode(exeGD->LoadBinaryFile( "GDpriv"+SceneNameMangler::GetMangledSceneName(game.scenes[0]->GetName())+".ir" ),
                                                                             exeGD->GetBinaryFileSize( "GDpriv"+SceneNameMangler::GetMangledSceneName(game.scenes[0]->GetName())+".ir" )) )
    {
        std::cout << "Unable to load bitcode from " << "GDpriv"+SceneNameMangler::GetMangledSceneName(game.scenes[0]->GetName())+".ir" << std::endl;
        return EXIT_FAILURE;
    }

    #if defined(WINDOWS)
    //Handle special argument to change working directory
    if ( argc >= 2 && std::string(p_argv[1]).size() > 5 && std::string(p_argv[1]).substr(0, 5) == "-cwd=" )
    {
        std::string newWorkingDir = std::string(p_argv[1]).substr(5, std::string::npos);
        cout << "Changing working directory to " << newWorkingDir << endl;
        chdir(newWorkingDir.c_str());
    }
    #endif

    //Initialize image manager and load always loaded images
    game.imageManager->SetGame( &game );
    game.imageManager->LoadPermanentImages();

    loadingApp.Close();

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
                 !game.scenes[returnCode]->compiledEventsExecutionEngine->LoadFromLLVMBitCode(exeGD->LoadBinaryFile( "GDpriv"+SceneNameMangler::GetMangledSceneName(game.scenes[returnCode]->GetName())+".ir" ),
                                                                                              exeGD->GetBinaryFileSize( "GDpriv"+SceneNameMangler::GetMangledSceneName(game.scenes[returnCode]->GetName())+".ir" )) )
            {
                std::cout << "Unable to load bitcode from " << "GDpriv"+SceneNameMangler::GetMangledSceneName(game.scenes[returnCode]->GetName())+".ir" << std::endl;
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

/**
 * Retrieve current working directory
 */
std::string GetCurrentWorkingDirectory()
{
    char path[2048];
    getcwd(path, 2048);

    if ( path == NULL ) return "";
    return path;
}
