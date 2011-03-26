#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <iostream>
#include <sstream>
#include <fstream>
#if defined(__GNUC__)
#include <unistd.h>
#endif

#include "GDL/CommonTools.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/MemTrace.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ImageManager.h"
#include "GDL/RessourcesLoader.h"
#include "GDL/FontManager.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/DynamicExtensionsManager.h"
#include "CompilationChecker.h"
#include "GDL/AES.h"

#include <time.h>
#include <stdlib.h>
#include <stdio.h>

using namespace std;

#ifndef RELEASE
MemTrace MemTracer;
#endif

int main( int argc, char *p_argv[] )
{
    InitLog();

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

    GDpriv::DynamicExtensionsManager::GetInstance()->LoadDynamicExtension("dynext.dxgd");

    RessourcesLoader * exeGD = RessourcesLoader::GetInstance();
    exeGD->SetExeGD( "gam.egd" );
    string srcString = exeGD->LoadPlainText( "src" );

    //Le jeu
    RuntimeGame game;

    //Chargement du fichier contenant les info sur le loading screen
    OpenSaveLoadingScreen openLS(game.loadingScreen);
    openLS.OpenFromString(exeGD->LoadPlainText( "loadingscreen" ));

    // Display loading window
    unsigned long style = 0;
    if ( game.loadingScreen.border ) style |= sf::Style::Titlebar;
    sf::RenderWindow loadingApp( sf::VideoMode( game.loadingScreen.width, game.loadingScreen.height, 32 ), "Chargement en cours...", style );
    loadingApp.Show(game.loadingScreen.afficher);
    loadingApp.Clear( sf::Color( 100, 100, 100 ) );

    boost::shared_ptr<sf::Image> image = boost::shared_ptr<sf::Image>(exeGD->LoadImage( game.loadingScreen.imageFichier ));
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

    //Open game
#ifdef RELEASE

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
    OpenSaveGame openGame( game );
    //openGame.OpenFromFile("D:/Florian/Programmation/Jeux Game Develop/SA4/Game.gdg" );
    openGame.OpenFromFile("D:/Florian/Desktop/Temporaire/ResolutionTEst/Game.gdg" );
    //openGame.OpenFromFile("D:/Florian/Programmation/Jeux Game Develop/Ecce Deus/EcceDeus.gdg" );
    //openGame.OpenFromFile("D:/Florian/Programmation/Jeu de test Game Develop/TestPhysicNew.gdg" );
    //openGame.OpenFromFile("D:/Florian/Programmation/Jeu de test Game Develop/testTextFont.gdg" );
    //openGame.OpenFromFile("D:/Florian/Programmation/Jeu de test Game Develop/testCrashVariableString.gdg" );

#endif

    if ( game.scenes.empty() ) return EXIT_FAILURE;

    //Initialize image manager and load always loaded images
    game.imageManager->SetGame( &game );
    game.imageManager->LoadPermanentImages();

    //Fenêtre de jeu
    sf::RenderWindow window;
    window.SetFramerateLimit( game.maxFPS );
    window.UseVerticalSync( game.verticalSync );

    RuntimeScene scenePlayed(&window, &game);
    if ( !scenePlayed.LoadFromScene( *game.scenes[0] ) )
        EcrireLog( "Chargement", "Erreur lors du chargement de la scène initiale" );

    loadingApp.Close();
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
        int retour = scenePlayed.RenderAndStep(1);

        if ( retour == -2 ) //Quitter le jeu
            scenePlayed.running = false;
        else if ( retour != -1 ) //Changer de scènes
        {
            RuntimeScene newScenePlayed(&window, &game);
            scenePlayed = newScenePlayed; //On vide la scène
            if ( !scenePlayed.LoadFromScene( *game.scenes.at( retour ) ) )
            {
                EcrireLog( "Chargement", "Erreur lors du chargement" );
            }
        }
    }

    SoundManager * soundManager = SoundManager::GetInstance();
    soundManager->DestroySingleton();
    FontManager * fontManager = FontManager::GetInstance();
    fontManager->DestroySingleton();

    return EXIT_SUCCESS;
}
