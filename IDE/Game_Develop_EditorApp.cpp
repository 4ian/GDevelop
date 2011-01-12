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
#include <wx/filename.h>
#include <wx/config.h>
#include <wx/help.h>
#include <wx/fs_zip.h>
#include <wx/url.h>
#include <wx/splash.h>
#include <wx/app.h>
#include <wx/dir.h>
#include <string>
#include <unistd.h>
#include <stdexcept>
#include <wx/stdpaths.h>
#include <wx/filename.h>
#include <SFML/System.hpp>
#include "CppUnitLite/TestHarness.h"
#include "LocaleManager.h"

#include "Game_Develop_EditorMain.h"
#include "Game_Develop_EditorApp.h"
#include "Log.h"
#include "MemTrace.h"
#include "Demarrage.h"
#include "CheckMAJ.h"
#include "MAJ.h"
#include "SplashScreen.h"
#include "ConsoleManager.h"
#include "BugReport.h"

#include "CompilationChecker.h"
#include "Clipboard.h"

#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/SoundManager.h"
#include "GDL/FontManager.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/TranslateAction.h"
#include "GDL/TranslateCondition.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsLoader.h"

// archives Boost
#include <fstream>
#include <boost/archive/xml_oarchive.hpp>
#include <boost/serialization/shared_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include "GDL/Event.h"
#include "GDL/StandardEvent.h"
#include "GDL/CommentEvent.h"
#include <boost/archive/xml_iarchive.hpp>

IMPLEMENT_APP(Game_Develop_EditorApp)

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
    cout << "OnInitCalled" << endl;

    //Get file to open from first argument.
    string fileToOpen;
    if ( wxApp::argc > 1 )
    {
        fileToOpen = wxApp::argv[1]; //Make sure the filename is absolute.
        wxFileName filename(fileToOpen);
        filename.MakeAbsolute();
        fileToOpen = filename.GetFullPath();
    }
    cout << "CommandLineParsed" << endl;

#ifdef LINUX
    string tmp; //Make sure current working directory is executable directory.
    if ( string(argv[0]) != "/" )
    {
        char buffer[1024];
        tmp += ( getcwd( buffer, 1024 ) );
        tmp += "/";
    }
    tmp += argv[0];
    tmp = tmp.substr( 0, tmp.find_last_of( "/" ) );
    chdir( tmp.c_str() );
#endif
#ifdef WINDOWS
#if defined(NOT_FOR_WX290)
    string exeDirectory = string(argv[0].mb_str()); //Make sure current working directory is executable directory.
#endif
    string exeDirectory = argv[0]; //Make sure current working directory is executable directory.
    unsigned int backslashpos = exeDirectory.find_last_of( "\\" );
    if ( backslashpos > exeDirectory.length() ) backslashpos = 0;
    unsigned int slashpos = exeDirectory.find_last_of( "/" );
    if ( slashpos > exeDirectory.length() ) slashpos = 0;

    exeDirectory = exeDirectory.substr( 0, slashpos > backslashpos ? slashpos : backslashpos );
    chdir( exeDirectory.c_str() );
#endif
    cout << "CwdSetted" << endl;

    wxInitAllImageHandlers();
    cout << "ImageHandlersInit" << endl;

    //Load configuration
    wxString ConfigPath = wxFileName::GetHomeDir() + "/.Game Develop/";
    if ( !wxDirExists( ConfigPath ) )
        wxMkdir( ConfigPath );

    wxFileConfig *Config = new wxFileConfig( _T( "Game Develop" ), _T( "Compil Games" ), ConfigPath + "options.cfg" );
    wxConfigBase::Set( Config );
    cout << "Config file setted" << endl;

    //Set language
    {
        wxString wantedLanguage;
        Config->Read("/Lang", &wantedLanguage);

        //Retrieve languages files
        std::vector <std::string> languagesAvailables;
        wxDir dir(wxGetCwd()+"/locale/");
        wxString filename;

        bool cont = dir.GetFirst(&filename, "", wxDIR_DIRS);
        while ( cont )
        {
            languagesAvailables.push_back(string(filename.mb_str()));
            cont = dir.GetNext(&filename);
        }

        //Retrieve selected language
        int languageId = wxLANGUAGE_DEFAULT;
        for (unsigned int i = 0;i<languagesAvailables.size();++i)
        {
            if ( wxLocale::FindLanguageInfo(languagesAvailables[i])->CanonicalName == wantedLanguage )
                languageId = wxLocale::FindLanguageInfo(languagesAvailables[i])->Language;
        }

        LocaleManager::getInstance()->SetLanguage(languageId);

    }
    cout << "Language loaded" << endl;

    #ifdef RELEASE
    singleInstanceChecker = new wxSingleInstanceChecker;
    if ( singleInstanceChecker->IsAnotherRunning() )
    {
        wxLogMessage(_("Une autre instance de Game Develop est actuellement ouverte. Glissez-déposez dessus un fichier pour l'ouvrir."));

        delete singleInstanceChecker;
        singleInstanceChecker = NULL;

        return false; // OnExit() won't be called if we return false
    }
    #endif

    cout << "Single instance checked" << endl;
    //Safety check for gdl.dll
    bool sameGDLdllAsDuringCompilation = CompilationChecker::EnsureCorrectGDLVersion();
    if ( !sameGDLdllAsDuringCompilation )
    {
        wxLogError(_("La version du fichier GDL.dll ( ou GDL.so ) semble être incorrecte. Veuillez réinstaller Game Develop afin que le programme fonctionne correctement.\n"
                     "Si le problème persiste, assurez vous qu'il n'existe pas une nouvelle version de Game Develop sur le site officiel : http://www.compilgames.net\n"
                     "Si non, prenez contact avec l'auteur."));
    }
    cout << "GDL checked" << endl;

    //Set help file
    {
        HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
        if ( LocaleManager::getInstance()->locale->GetLanguage() == wxLANGUAGE_ENGLISH )
            helpFileAccess->InitWithHelpFile("help.chm");
        else if ( LocaleManager::getInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
            helpFileAccess->InitWithHelpFile("aide.chm");
    }
    cout << "Help file setted" << endl;

    //Test si le programme n'aurait pas planté la dernière fois
    //En vérifiant si un fichier existe toujours
    bool openRecupFiles = false;
    if ( wxFileExists("errordetect.dat") )
    {
        BugReport dialog(NULL);
        if ( dialog.ShowModal() == 1 ) openRecupFiles = true;
    }
    cout << "Crash management ended" << endl;

    //Creating the console Manager
    #ifdef RELEASE
    ConsoleManager * consoleManager;
    consoleManager = ConsoleManager::getInstance();
    #endif

    cout << "ConsoleManager created" << endl;
    //Splash screen
    wxBitmap bitmap;
    bitmap.LoadFile( wxString("res/splash.png"), wxBITMAP_TYPE_PNG );
    SplashScreen * splash = new SplashScreen(bitmap, 2, 0, -1, wxNO_BORDER | wxFRAME_SHAPED);

    cout << "Splash Screen created" << endl;
    //Création du fichier de détection des erreurs
    wxFile errorDetectFile("errordetect.dat", wxFile::write);
    errorDetectFile.Write(" ");

    //Les log
    log = new wxLogGui(); // Affichage des messages d'erreurs
    InitLog(); // Log sous forme de fichier détaillé
    logChain = new wxLogChain( log );

    cout << "Loading extensions" << endl;
    //Load extensions
    GDpriv::ExtensionsLoader * extensionsLoader = GDpriv::ExtensionsLoader::getInstance();
    extensionsLoader->SetExtensionsDir("./Extensions/");
    extensionsLoader->LoadAllStaticExtensionsAvailable();

    #ifdef RELEASE
    wxSetAssertHandler(NULL); //Don't want to have annoying assert dialogs in release
    #endif

    cout << "Loading extensions : End" << endl;
    wxFileSystem::AddHandler( new wxZipFSHandler );

    //Welcome window
    {
        wxString result;
        Config->Read( "Démarrage/Guide", &result );
        if ( result != "false" )
        {
            Demarrage bienvenue( NULL );
            if ( bienvenue.ShowModal() == 1 )
            {
                wxFileDialog open( NULL, _( "Ouvrir un exemple" ), wxGetCwd()+"/Exemples/", "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
                open.ShowModal();

                if ( !open.GetPath().empty() ) fileToOpen = static_cast<string>( open.GetPath() );
            }
            Config->Write( "Démarrage/Guide", "false" );
        }
    }


    cout << "Creating main window" << endl;
    //Creating main window
    mainEditor = new Game_Develop_EditorFrame( 0, fileToOpen );
    SetTopWindow( mainEditor );

    //Open dumped files
    if ( openRecupFiles )
    {
        unsigned int i = 0;
        while( wxFileExists("gameDump"+ToString(i)+".gdg") )
        {
            mainEditor->Open("gameDump"+ToString(i)+".gdg");
            ++i;
        }
    }


    //Fin du splash screen, affichage de la fenêtre
    splash->Destroy();
    mainEditor->Show();

    //Checking for updates
    {
        wxString result;
        Config->Read( "Démarrage/MAJ", &result );
        if ( result != "false" )
        {
            CheckMAJ verif;
            verif.DownloadInformation();
            if ( verif.newVersionAvailable )
            {
                MAJ dialog(mainEditor, true);
                if ( dialog.ShowModal() == 2 )
                {
                    mainEditor->Destroy();
                    return true;
                }
            }
        }
    }

    //wxLogWarning("Cette version de Game Develop n'est utilisable qu'à des fins de tests. Merci d'utiliser la version disponible sur notre site pour toute autre utilisation.");

#ifndef RELEASE
    TestResult tr;
    TestRegistry::runAllTests( tr );
#endif

    return true;

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
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->kill();

#ifndef RELEASE
    MemTracer.Rapport();
#endif

    wxRemoveFile("errordetect.dat");

    return 0;
}

#ifndef DEBUG //So as to let the debugger catch exceptions in debug build
void Game_Develop_EditorApp::OnUnhandledException()
{
    wxSafeShowMessage( "Erreur fatale", "Game Develop a rencontré une erreur fatale : (01) Fatal error.\nLe programme va devoir se fermer." );

    wxFile dataErrorFile("errordata.txt", wxFile::write);
    dataErrorFile.Write("Game Develop - Trace de l'erreur.\n");
    dataErrorFile.Write("\n");
    dataErrorFile.Write("GD Error code : (01) Fatal error\n");

    try
    {
        for (unsigned int i = 0;i<mainEditor->games.size();++i)
        {
            OpenSaveGame save(*mainEditor->games[i]);
            save.SaveToFile("gameDump"+ToString(i)+".gdg");
        }
    }
    catch(...)
    {
        wxSafeShowMessage("Unable to save game", "A game could not be saved");
    }
    terminate();
}
#endif

bool Game_Develop_EditorApp::OnExceptionInMainLoop()
{
    #ifndef DEBUG //So as to let the debugger catch exceptions in debug build
    wxSafeShowMessage( "Erreur fatale", "Game Develop a rencontré une erreur fatale : (02) Segmentation fault.\nLe programme va devoir se fermer.\n\nAu prochain lancement, il vous sera proposé de charger la copie de sauvegarde de votre jeu, et de nous envoyer un rapport d'erreur." );

    wxFile dataErrorFile("errordata.txt", wxFile::write);
    dataErrorFile.Write("Game Develop - Trace de l'erreur.\n");
    dataErrorFile.Write("\n");
    dataErrorFile.Write("GD Error code : (02) Segmentation Fault\n");

    try
    {
        for (unsigned int i = 0;i<mainEditor->games.size();++i)
        {
            OpenSaveGame save(*mainEditor->games[i]);
            save.SaveToFile("gameDump"+ToString(i)+".gdg");
        }
    }
    catch(...)
    {
        wxSafeShowMessage("Unable to save game", "A game could not be saved");
    }

    terminate();
    #else
    throw;
    return false;
    #endif
}
