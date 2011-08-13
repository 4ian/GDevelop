/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

//This file was created 2008-03-01

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
#include <wx/stdpaths.h>
#include <wx/filename.h>
#include <wx/cmdline.h>
#include <string>
#include <unistd.h>
#include <stdexcept>
#include <SFML/System.hpp>
#include "CppUnitLite/TestHarness.h"

#include "GDL/EventsExecutionEngine.h"
#include <llvm/Support/DynamicLibrary.h>

#include "Game_Develop_EditorMain.h"
#include "Game_Develop_EditorApp.h"
#include "Log.h"
#include "Demarrage.h"
#include "CheckMAJ.h"
#include "MAJ.h"
#include "SplashScreen.h"
#include "ConsoleManager.h"
#include "BugReport.h"
#include "CompilationChecker.h"
#include "Clipboard.h"
#include "ExtensionBugReportDlg.h"

#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/SoundManager.h"
#include "GDL/FontManager.h"
#include "GDL/HelpFileAccess.h"
#include "GDL/TranslateAction.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/VersionWrapper.h"
#include "GDL/LocaleManager.h"

#include <fstream>
#include <boost/shared_ptr.hpp>

IMPLEMENT_APP(Game_Develop_EditorApp)

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

    wxCmdLineEntryDesc cmdLineDesc[] = {

    {wxCMD_LINE_PARAM,
    NULL,
    NULL,
    wxT("Files to open"),
    wxCMD_LINE_VAL_STRING,
    wxCMD_LINE_PARAM_MULTIPLE | wxCMD_LINE_PARAM_OPTIONAL
    },

    {wxCMD_LINE_SWITCH, wxT("help"), NULL, wxT("Display help about launching Game Develop using command line") },
    {wxCMD_LINE_SWITCH, wxT("version"), NULL, wxT("Display Game Develop version and quit"), wxCMD_LINE_VAL_NONE, wxCMD_LINE_OPTION_HELP },
    {wxCMD_LINE_OPTION, wxT("lang"), NULL, wxT("Force loading a specific language ( Example : /lang=en_GB )"), wxCMD_LINE_VAL_STRING, wxCMD_LINE_PARAM_OPTIONAL },
    {wxCMD_LINE_SWITCH, wxT("allowMultipleInstances"), NULL, wxT("Allow to launch Game Develop even if it is already opened") },
    {wxCMD_LINE_SWITCH, wxT("noCrashCheck"), NULL, wxT("Don't check if Game Develop crashed during last use.") },

    {wxCMD_LINE_NONE}
    };

    wxCmdLineParser parser (cmdLineDesc, argc, argv);
    parser.AddUsageText("For more information about using Game Develop, please refer to the help file.");
    if ( parser.Parse(false) > 0 )
        ;
    else if ( parser.Found( wxT("version") ) )
    {
        cout << GDLVersionWrapper::FullString() << endl;
        return false;
    }
    else if ( parser.Found( wxT("help") ) )
    {
        cout << parser.GetUsageString();
        return false;
    }

    std::vector<std::string> filesToOpen;
    for (unsigned int i = 0;i<parser.GetParamCount();++i)
    {
        filesToOpen.push_back(parser.GetParam(i).mb_str());
    }

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
        if ( !parser.Found( wxT("lang") ))
            Config->Read("/Lang", &wantedLanguage);
        else
            parser.Found( wxT("lang"), &wantedLanguage);

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

        GDpriv::LocaleManager::GetInstance()->SetLanguage(languageId);

    }
    cout << "Language loaded" << endl;

    wxInitAllImageHandlers();

    cout << "Image Handlers loaded" << endl;

    #ifdef RELEASE
    singleInstanceChecker = new wxSingleInstanceChecker;
    if ( singleInstanceChecker->IsAnotherRunning() && !parser.Found( wxT("allowMultipleInstances") ) )
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
        HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
        if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_ENGLISH )
            helpFileAccess->InitWithHelpFile("help.chm");
        else if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
            helpFileAccess->InitWithHelpFile("aide.chm");
    }
    cout << "Help file setted" << endl;

    //Test si le programme n'aurait pas planté la dernière fois
    //En vérifiant si un fichier existe toujours
    bool openRecupFiles = false;
    #if defined(RELEASE)
    if ( !parser.Found( wxT("noCrashCheck") ) && wxFileExists("GameDevelopRunning.log") && !wxFileExists("ExtensionBeingLoaded.log") )
    {
        BugReport dialog(NULL);
        if ( dialog.ShowModal() == 1 ) openRecupFiles = true;
    }
    #endif
    cout << "Crash management ended" << endl;

    //Creating the console Manager
    #ifdef RELEASE
    ConsoleManager * consoleManager;
    consoleManager = ConsoleManager::GetInstance();
    cout << "ConsoleManager created" << endl;
    #endif

    //Splash screen
    wxBitmap bitmap;
    bitmap.LoadFile( wxString("res/GD-Splashscreen.png"), wxBITMAP_TYPE_PNG );
    SplashScreen * splash = new SplashScreen(bitmap, 2, 0, -1, wxNO_BORDER | wxFRAME_SHAPED);
    cout << "Splash Screen created" << endl;

    //Création du fichier de détection des erreurs
    wxFile errorDetectFile("GameDevelopRunning.log", wxFile::write);
    errorDetectFile.Write(" ");

    //Les log
    log = new wxLogGui(); // Affichage des messages d'erreurs
    InitLog(); // Log sous forme de fichier détaillé
    logChain = new wxLogChain( log );

    //LLVM stuff
    cout << "Initializing LLVM/Clang..." << endl;
    EventsExecutionEngine::EnsureLLVMTargetsInitialization();

    cout << "Loading libstdc++..." << std::endl;
    std::string error;
    llvm::sys::DynamicLibrary::LoadLibraryPermanently("libstdc++-6.dll", &error);
    cout << error;

    //Load extensions
    cout << "Loading extensions" << endl;
    bool loadExtensions = true;

    #if defined(RELEASE)
    if ( !parser.Found( wxT("noCrashCheck") ) && wxFileExists("ExtensionBeingLoaded.log") )
    {
        int whattodo = 0;
        {
            wxTextFile extensionErrorDetectFile;
            extensionErrorDetectFile.Open("ExtensionBeingLoaded.log");

            ExtensionBugReportDlg dialog(NULL, extensionErrorDetectFile.GetFirstLine());
            whattodo = dialog.ShowModal();
        }
        wxRemoveFile("ExtensionBeingLoaded.log");

        if ( whattodo == 0 ) return false;
        else if ( whattodo == 1 ) loadExtensions = false;
    }
    #endif

    GDpriv::ExtensionsLoader * extensionsLoader = GDpriv::ExtensionsLoader::GetInstance();
    extensionsLoader->SetExtensionsDir("./Extensions/");
    if ( loadExtensions ) extensionsLoader->LoadAllStaticExtensionsAvailable();

    #if defined(RELEASE)
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

                if ( !open.GetPath().empty() ) filesToOpen.push_back( string(open.GetPath().mb_str()) );
            }
            Config->Write( "Démarrage/Guide", "false" );
        }
    }

    //Creating main window
    cout << "Creating main window" << endl;
    mainEditor = new Game_Develop_EditorFrame( 0, filesToOpen.empty() && !openRecupFiles );
    SetTopWindow( mainEditor );

    //Open files
    for (unsigned int i = 0;i<filesToOpen.size();++i)
        mainEditor->Open(filesToOpen[i]);

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

    cout << "Connecting shortcuts" << endl;
    Connect(wxID_ANY,wxEVT_KEY_DOWN, wxKeyEventHandler(Game_Develop_EditorApp::OnKeyPressed));

    cout << "Loading events editor configuration" << endl;
    TranslateAction::GetInstance()->LoadTypesFormattingFromConfig();

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

    wxLogWarning("Cette version de Game Develop n'est pas finalisée et n'est utilisable qu'à des fins de tests. Merci de ne pas la redistribuer et d'utiliser la version disponible sur notre site pour toute autre utilisation.");

#ifndef RELEASE
    TestResult tr;
    TestRegistry::runAllTests( tr );
#endif

    return true;

}

int Game_Develop_EditorApp::OnExit()
{

    delete wxConfigBase::Set(( wxConfigBase* )NULL );

    SoundManager * soundManager = SoundManager::GetInstance();
    soundManager->DestroySingleton();
    Clipboard * clipboard = Clipboard::GetInstance();
    clipboard->DestroySingleton();
    FontManager * fontManager = FontManager::GetInstance();
    fontManager->DestroySingleton();
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
    helpFileAccess->DestroySingleton();

    wxRemoveFile("GameDevelopRunning.log");

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
