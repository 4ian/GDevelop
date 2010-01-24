/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Main.cpp
 *
 *  Contient entre autre la boucle principale du jeu.
 */

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
#include <unistd.h>

#ifdef PYSUPPORT
#include <boost/python.hpp>
using namespace boost::python;
#endif

#include "GDL/algo.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/MemTrace.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ImageManager.h"
#include "GDL/crypter.h"
#include "GDL/RessourcesLoader.h"
#include "GDL/FontManager.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/Modules.h"
#include "CompilationChecker.h"

#include "profile.h"

#include <time.h>
#include <stdlib.h>
#include <stdio.h>

//Cryptage
#include "dlib/compress_stream.h"
#include "dlib/base64.h"

using namespace std;
using namespace dlib;

#ifndef RELEASE
MemTrace MemTracer;
#endif
/*
void MessageLoading( string message, float avancement )
{
    EcrireLog( "Chargement", message );
}*/

int main( int argc, char *p_argv[] )
{
    BT_PROFILE("Main");

    InitLog();
#ifdef PYSUPPORT
    using namespace gdp;
    InitializePythonModule();
#endif

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

    ExtensionsLoader * extensionsLoader = ExtensionsLoader::getInstance();
    extensionsLoader->SetExtensionsDir("./");
    extensionsLoader->LoadAllExtensionsAvailable();

    RessourcesLoader * exeGD = RessourcesLoader::getInstance();
    exeGD->SetExeGD( "gam.egd" );
    string contenu = exeGD->LoadPlainText( "src" );

    //Le jeu
    RuntimeGame game;

    //Chargement du fichier contenant les info sur le loading screen
    OpenSaveLoadingScreen openLS(game.loadingScreen);
    openLS.OpenFromString(exeGD->LoadPlainText( "loadingscreen" ));

    // Fenêtre de chargement
    unsigned long style = 0;
    if ( game.loadingScreen.border ) style |= sf::Style::Titlebar;
    //sf::RenderWindow loadingApp( sf::VideoMode( game.loadingScreen.width, game.loadingScreen.height, 32 ), "Chargement en cours...", style );
    //if ( !game.loadingScreen.afficher ) loadingApp.Show(false);
    //loadingApp.Clear( sf::Color( 100, 100, 100 ) );

    sf::Image image;
    image = exeGD->LoadImage( game.loadingScreen.imageFichier );
    if ( !game.loadingScreen.smooth ) image.SetSmooth(false);

    sf::Sprite sprite( image );
    if ( game.loadingScreen.image )
    {
        //loadingApp.Draw( sprite );
    }
    if ( game.loadingScreen.texte )
    {
        sf::Text Chargement( game.loadingScreen.texteChargement );
        Chargement.SetPosition( game.loadingScreen.texteXPos, game.loadingScreen.texteYPos );
        //loadingApp.Draw( Chargement );
    }
    //loadingApp.Display();

    //Ouverture du jeu
#ifdef RELEASE

    if ( contenu == "" )
    {
        cout << endl << "N'a pas pu charger src. Fermeture." << endl;
        return EXIT_FAILURE;
    }

    // this is the object we will use to do the base64 encoding
    base64::kernel_1a base64_coder;
    // this is the object we will use to do the data compression
    compress_stream::kernel_1ea compressor;

    ostringstream sout;
    istringstream sin;

    // compress the contents of the file and store the results in the string stream sou
    sin.str( contenu );
    sout.clear();
    sout.str( "" );
    try
    {
        // now base64 encode the compressed data
        base64_coder.decode( sin, sout );
    }
    catch ( std::ios_base::failure & e )
    {
        cout << "std::ios_base::failure";
    }
    catch ( ... )
    {
        cout << "\nUne exception a été lancée.\n";
    }


    sin.clear();
    sin.str( sout.str() );
    sout.str( "" );

    compressor.decompress( sin, sout );

    string crypte = sout.str();
    OpenSaveGame openGame( game );
    openGame.OpenFromString(crypte);
#else
    OpenSaveGame openGame( game );
    //openGame.OpenFromFile("C:/Program Files/Compil Games/Game Develop/Exemples/CourseAdvanced.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/Game Develop Player/test2.txt" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/Game Develop Player/BZmod.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/BenchC2.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Desktop/shoot.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/SO4/SO4.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/Course/CourseTest.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/Game Develop Player/test2.txt" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/testCPPExtension2.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/testFont.jgd" );
    openGame.OpenFromFile("C:/Users/Florian/Programmation/3DEngine.jgd" );
    //openGame.OpenFromFile("C:/Users/Florian/Programmation/Course3D/Course3D.jgd" );
#endif

    if ( game.m_scenes.empty() )
        return EXIT_FAILURE;

    game.imageManager.LoadImagesFromFile( game );
    //loadingApp.SetActive(false);
    //loadingApp.Close();

    //Fenêtre de jeu
    sf::RenderWindow window;
    window.SetFramerateLimit( game.maxFPS );
    window.UseVerticalSync( game.verticalSync );

    RuntimeScene scenePlayed(&window, &game);
    if ( !scenePlayed.LoadFromScene( game.m_scenes.at( 0 ) ) )
        EcrireLog( "Chargement", "Erreur lors du chargement de la scène initiale" );

    window.Create( sf::VideoMode( game.windowWidth, game.windowHeight, 32 ), scenePlayed.title, sf::Style::Close );
    window.SetActive(true);

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    double windowRatio = static_cast<double>(window.GetWidth())/static_cast<double>(window.GetHeight());
    gluPerspective(90.f, windowRatio, 1.f, 500.f);

    //Boucle de jeu
    while ( scenePlayed.running )
    {
        int retour = scenePlayed.RenderAndStep(1);

        if ( retour == -2 ) //Quitter le jeu
            scenePlayed.running = false;
        else if ( retour != -1 ) //Changer de scènes
        {
            scenePlayed.StopMusic();

            RuntimeScene NewScenePlayed(&window, &game);
            scenePlayed = NewScenePlayed; //On vide la scène
            if ( !scenePlayed.LoadFromScene( game.m_scenes.at( retour ) ) )
            {
                EcrireLog( "Chargement", "Erreur lors du chargement" );
            }
        }
    }

    SoundManager * soundManager = SoundManager::getInstance();
    soundManager->kill();
    FontManager * fontManager = FontManager::getInstance();
    fontManager->kill();

    return EXIT_SUCCESS;
}
