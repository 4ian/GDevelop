/***************************************************************
 * Name:      Game_Develop_EditorApp.cpp
 * Purpose:   Code for Application Class
 * Author:    Florian "4ian" Rival ()
 * Created:   2008-03-01
 * Copyright: Florian "4ian" Rival ()
 * License:
 **************************************************************/

#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

//(*AppHeaders
#include <wx/image.h>
//*)

#include <wx/fileconf.h>
#include <wx/log.h>
#include <wx/msgdlg.h>
#include <wx/fileconf.h>
#include <wx/filename.h>
#include <wx/config.h>
#include <wx/help.h>
#include <wx/fs_zip.h>
#include <wx/url.h>
#include <wx/splash.h>
#include <wx/app.h>
#include <string>
#include <unistd.h>
#include <stdexcept>
#include <wx/stdpaths.h>
#include <wx/filename.h>
#include <boost/python.hpp>
#include <SFML/System.hpp>
#include "CppUnitLite/TestHarness.h"

#include "Game_Develop_EditorMain.h"
#include "Game_Develop_EditorApp.h"
#include "Log.h"
#include "MemTrace.h"
#include "Demarrage.h"
#include "CheckMAJ.h"
#include "SplashScreen.h"
#include "ConsoleManager.h"
#include "BugReport.h"

#include "TranslateAction.h"
#include "TranslateCondition.h"
#include "CompilationChecker.h"
#include "Clipboard.h"

#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/SoundManager.h"
#include "GDL/FontManager.h"

#include "GDL/ExtensionsManager.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsLoader.h"

IMPLEMENT_APP( Game_Develop_EditorApp );

MemTrace MemTracer;

void MessageLoading( string message, float avancement )
{
    // utiliser un flux de sortie pour créer la chaîne
    std::ostringstream oss;
    // écrire la valeur dans le flux
    oss << avancement;
    // renvoyer une string
    string pourcent =  oss.str();

    wxLogStatus( wxString(pourcent + _( " pourcents du chargement (" ) + message + _(" ).")) );
}


////////////////////////////////////////////////////////////
/// Démarrage
///
/// Démarrage du programme
////////////////////////////////////////////////////////////
bool Game_Develop_EditorApp::OnInit()
{
    // On définit le chemin d'execution du programme par rapport a la localisation de son executable
    // Utile surtout sous linux
#ifdef LINUX
    cout << "Build pour linux";
    string tmp;
    if ( *argv[0] != '/' )
    {
        char buffer[1024];
        tmp += ( getcwd( buffer, 1024 ) );
        tmp += "/";
    }
    tmp += argv[0];
    tmp = tmp.substr( 0, tmp.find_last_of( "/" ) );
    chdir( tmp.c_str() );
#endif

    //(*AppInitialize
    bool wxsOK = true;
    wxInitAllImageHandlers();
    //*)
    string fileToOpen;

    if ( wxApp::argc > 1 )
        fileToOpen = wxApp::argv[1];

    CompilationChecker::EnsureCorrectGDLVersion();

    //Test si le programme n'aurait pas planté la dernière fois
    //En vérifiant si un fichier existe toujours
    if ( wxFileExists("errordetect.dat") )
    {
        BugReport dialog(NULL);
        if ( dialog.ShowModal() == 1 && wxFileExists("recup.jgd"))
            fileToOpen = "recup.jgd";
    }

    //Creating the console Manager
    #ifdef RELEASE
    ConsoleManager * consoleManager;
    consoleManager = ConsoleManager::getInstance();
    #endif

    //Splash screen
    wxBitmap bitmap;
    bitmap.LoadFile( wxString("res/splash.png"), wxBITMAP_TYPE_PNG );
    SplashScreen * splash = new SplashScreen(bitmap, 2, 0, -1, wxNO_BORDER | wxFRAME_SHAPED);

    Py_Initialize();

    //Création du fichier de détection des erreurs
    wxFile errorDetectFile("errordetect.dat", wxFile::write);
    errorDetectFile.Write(" ");

    //Les log
    log = new wxLogGui(); // Affichage des messages d'erreurs
    InitLog(); // Log sous forme de fichier détaillé

    FILE * stderr_ = fopen( "log.txt", "a" );
    log_stderr_ = new wxLogStderr( stderr_ ); //Ecriture en plus des messages d'erreurs

    logChain = new wxLogChain( log_stderr_ );
    logChain2 = new wxLogChain( log );

    // Gestion de la langue
    // Ajout des préfixes possibles de chemins d'accès aux catalogues
    wxLocale::AddCatalogLookupPathPrefix(wxT("."));
    wxLocale::AddCatalogLookupPathPrefix(wxT(".."));
    wxLocale::AddCatalogLookupPathPrefix(_T("locale"));
    // Mise en place de la langue par défaut du système
    //m_locale.Init(wxLANGUAGE_ENGLISH);
    m_locale.Init(wxLANGUAGE_DEFAULT);
    {
        wxLogNull noLog;  // Supprime les erreurs si les catalogues n'existent pas
        // Catalogue de l'application
        m_locale.AddCatalog(_T("GD"));
        // Catalogue de wxWidgets
        m_locale.AddCatalog(_T("wxstd"));
    }
    // This sets the decimal point to be '.', whatever the language defined !
    wxSetlocale(LC_NUMERIC, "C");        // didn't understand why "C"...

    ExtensionsLoader * extensionsLoader = ExtensionsLoader::getInstance();
    extensionsLoader->SetExtensionsDir("./Extensions/");
    extensionsLoader->LoadAllExtensionsAvailable();

    #ifdef RELEASE
    wxSetAssertHandler(NULL); //Don't want to have annoying assert dialogs in release
    #endif

    //Les préférences de Game Develop
    wxString ConfigPath = wxFileName::GetHomeDir() + "/.Game Develop/";
    if ( !wxDirExists( ConfigPath ) )
        wxMkdir( ConfigPath );

    wxFileConfig *Config = new wxFileConfig( _T( "Game Develop" ), _T( "Compil Games" ), ConfigPath + "options.cfg" );
    wxConfigBase::Set( Config );

    wxFileSystem::AddHandler( new wxZipFSHandler );

    //Fenêtre de bienvenue
    wxString result;
    Config->Read( "Démarrage/Guide", &result );
    if ( result != "false" )
    {
        Demarrage bienvenue( NULL );
        if ( bienvenue.ShowModal() == 1 )
        {
            wxFileDialog open( NULL, _( "Ouvrir un exemple" ), "Exemples/", "", "Jeu Game Develop (*.jgd)|*.jgd" );
            open.ShowModal();

            fileToOpen = static_cast<string>( open.GetPath() );
        }
        Config->Write( "Démarrage/Guide", "false" );
    }


    //Création de la fenêtre
    if ( wxsOK )
    {
        Frame = new Game_Develop_EditorFrame( 0, Jeu, fileToOpen );
        SetTopWindow( Frame );
    }

    result = "";
    Config->Read( "Démarrage/MAJ", &result );
    if ( result != "false" )
    {
        CheckMAJ verif;
        verif.Check();
    }

    //Fin du splash screen, affichage de la fenêtre
    //while(!splash->timeUp) wxSafeYield(); //TODO : Seems to block with wx 2.9
    splash->Destroy();
    Frame->Show();


    //wxLogWarning("Cette version de Game Develop n'est utilisable qu'à des fins de tests. Merci d'utiliser la version disponible sur notre site pour toute autre utilisation.");
#ifndef SFMLTEST
#ifndef RELEASE
    /*TestResult tr;
    TestRegistry::runAllTests( tr );*/
#endif
#endif
    return wxsOK;

}

int Game_Develop_EditorApp::OnExit()
{

    delete wxConfigBase::Set(( wxConfigBase* )NULL );

    SoundManager * soundManager = SoundManager::getInstance();
    soundManager->kill();
    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->kill();
    FontManager * fontManager = FontManager::getInstance();
    fontManager->kill();

#ifndef RELEASE
    MemTracer.Rapport();
#endif

    wxRemoveFile("errordetect.dat");

    return 0;
}

void Game_Develop_EditorApp::OnUnhandledException()
{
    wxSafeShowMessage( "Erreur fatale", "Game Develop a rencontré une erreur fatale : (01) Fatal error.\nLe programme va devoir se fermer." );

    wxFile dataErrorFile("errordata.txt", wxFile::write);
    dataErrorFile.Write("Game Develop - Trace de l'erreur.\n");
    dataErrorFile.Write("\n");
    dataErrorFile.Write("Code erreur GD : (02) Segmentation Fault\n");

    try
    {
        OpenSaveGame save(Frame->game);
        save.SaveToFile("recup.jgd");
    }
    catch(...)
    {
        wxSafeShowMessage("Impossible de sauver le jeu","Le jeu n'a pas pu être sauvegardé !");
    }

    terminate();
}

bool Game_Develop_EditorApp::OnExceptionInMainLoop()
{
    wxSafeShowMessage( "Erreur fatale", "Game Develop a rencontré une erreur fatale : (02) Segmentation fault.\nLe programme va devoir se fermer.\n\nAu prochain lancement, il vous sera proposé de charger la copie de sauvegarde de votre jeu, et de nous envoyer un rapport d'erreur." );

    wxFile dataErrorFile("errordata.txt", wxFile::write);
    dataErrorFile.Write("Game Develop - Trace de l'erreur.\n");
    dataErrorFile.Write("\n");
    dataErrorFile.Write("Code erreur GD : (02) Segmentation Fault\n");

    try
    {
        OpenSaveGame save(Frame->game);
        save.SaveToFile("recup.jgd");
    }
    catch(...)
    {
        wxSafeShowMessage("Impossible de sauver le jeu","Le jeu n'a pas pu être sauvegardé !");
    }

    terminate();
}
