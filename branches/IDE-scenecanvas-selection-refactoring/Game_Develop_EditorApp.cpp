/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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

#include "GDL/CodeExecutionEngine.h"

#include "MainFrame.h"
#include "Game_Develop_EditorApp.h"
#include "CheckMAJ.h"
#include "MAJ.h"
#include "SplashScreen.h"
#include "ConsoleManager.h"
#include "BugReport.h"
#include "CompilationChecker.h"
#include "GDCore/IDE/Clipboard.h"
#include "LogFileManager.h"
#include "PlatformManager.h"
#include "ExtensionBugReportDlg.h"
#include "Dialogs/HelpViewerDlg.h"

#include "GDL/Game.h"
#include "GDL/Log.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/SoundManager.h"
#include "GDL/FontManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/VersionWrapper.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDL/IDE/CodeCompiler.h"

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

    wxLogStatus( wxString(pourcent + _( " percents of loading (" ) + message + _(" ).")) );
}


/**
 * Program entry point
 */
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
    wxString exeDirectory = argv[0]; //Make sure current working directory is executable directory.
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
    ("Files to open"),
    wxCMD_LINE_VAL_STRING,
    wxCMD_LINE_PARAM_MULTIPLE | wxCMD_LINE_PARAM_OPTIONAL
    },

    {wxCMD_LINE_SWITCH, ("help"), NULL, ("Display help about launching Game Develop using command line") },
    {wxCMD_LINE_SWITCH, ("version"), NULL, ("Display Game Develop version and quit"), wxCMD_LINE_VAL_NONE, wxCMD_LINE_OPTION_HELP },
    {wxCMD_LINE_OPTION, ("lang"), NULL, ("Force loading a specific language ( Example : /lang=en_GB )"), wxCMD_LINE_VAL_STRING, wxCMD_LINE_PARAM_OPTIONAL },
    {wxCMD_LINE_SWITCH, ("allowMultipleInstances"), NULL, ("Allow to launch Game Develop even if it is already opened") },
    {wxCMD_LINE_SWITCH, ("noCrashCheck"), NULL, ("Don't check if Game Develop crashed during last use.") },

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

    cout << "Game Develop initialization started:" << endl;
    SetAppName("GDIDE");
    SetAppDisplayName("Game Develop IDE");

    std::vector<std::string> filesToOpen;
    for (unsigned int i = 0;i<parser.GetParamCount();++i)
    {
        filesToOpen.push_back(string(parser.GetParam(i).mb_str()));
    }

    //Load configuration
    #if defined(LINUX)
    wxString ConfigPath = wxFileName::GetHomeDir() + "/.config/Game Develop/";
    #else
    wxString ConfigPath = wxFileName::GetHomeDir() + "/.Game Develop/";
    #endif
    if ( !wxDirExists( ConfigPath ) )
        wxMkdir( ConfigPath );

    wxFileConfig *Config = new wxFileConfig( _T( "Game Develop" ), _T( "Compil Games" ), ConfigPath + "options.cfg" );
    wxConfigBase::Set( Config );
    cout << "* Config file set." << endl;

    //Set language
    {
        wxString wantedLanguage;
        if ( !parser.Found( wxT("lang") ))
            Config->Read("/Lang", &wantedLanguage);
        else
            parser.Found( wxT("lang"), &wantedLanguage);

        //If SelectLanguage.cfg file exists, then read the language from it
        if ( wxFileExists(ConfigPath+"SelectLanguage.cfg") )
        {
            wxTextFile languageFile;
            languageFile.Open(ConfigPath+"SelectLanguage.cfg");

            wantedLanguage = languageFile.GetFirstLine();
            languageFile.Close();

            wxRemoveFile(ConfigPath+"SelectLanguage.cfg");
        }

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

        gd::LocaleManager::GetInstance()->SetLanguage(languageId);

    }
    cout << "* Language loaded" << endl;

    wxInitAllImageHandlers();

    cout << "* Image Handlers loaded" << endl;

    #ifdef RELEASE
    singleInstanceChecker = new wxSingleInstanceChecker;
    if ( singleInstanceChecker->IsAnotherRunning() && !parser.Found( wxT("allowMultipleInstances") ) )
    {
        wxLogMessage(_("Another instance of Game Develop is already running. Drag and drop a file on it to open it."));

        delete singleInstanceChecker;
        singleInstanceChecker = NULL;

        return false; // OnExit() won't be called if we return false
    }
    #endif

    cout << "* Single instance checked" << endl;
    //Safety check for gdl.dll
    bool sameGDLdllAsDuringCompilation = CompilationChecker::EnsureCorrectGDLVersion();
    if ( !sameGDLdllAsDuringCompilation )
    {
        wxLogError(_("The version of GDL.dll ( or GDL.so ) seems to be incorrect. Try to reinstall Game Develop.\nIf the problem is still present, check for new version of Game Develop : http://www.compilgames.net\nIf there isn't any new version available, contact the author."));
    }
    cout << "* GDL checked" << endl;

    //Test si le programme n'aurait pas planté la dernière fois
    //En vérifiant si un fichier existe toujours
    bool openRecupFiles = false;
    #if defined(RELEASE)
    if ( !parser.Found( wxT("noCrashCheck") ) && wxFileExists(wxFileName::GetTempDir()+"/GameDevelopRunning.log") && !wxFileExists(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log") )
    {
        BugReport dialog(NULL);
        if ( dialog.ShowModal() == 1 ) openRecupFiles = true;
    }
    #endif
    cout << "* Crash management ended" << endl;

    //Creating the console Manager
    /* Deactivated, as the compilation thread can output messages at any time, resulting in the wxTextCtrl of console frame to be updated at any time
       which is dangerous ( GUI must be only updated from main thread )
    #if defined(RELEASE) && defined(WINDOWS)
    ConsoleManager * consoleManager;
    consoleManager = ConsoleManager::GetInstance();
    cout << "ConsoleManager created" << endl;
    #endif
    */

    //Splash screen
    wxBitmap bitmap;
    bitmap.LoadFile( wxString("res/GD-Splashscreen.png"), wxBITMAP_TYPE_PNG );
    SplashScreen * splash = new SplashScreen(bitmap, 2, 0, -1, wxNO_BORDER | wxFRAME_SHAPED);
    cout << "* Splash Screen created" << endl;

    //Création du fichier de détection des erreurs
    wxFile errorDetectFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log", wxFile::write);
    errorDetectFile.Write(" ");

    //Les log
    cout << "* Displaying Game Develop version information :" << endl;
    //GDLogBanner();

    //LLVM stuff
    cout << "* Loading required dynamic libraries..." << endl;
    CodeExecutionEngine::LoadDynamicLibraries();

    //Events compiler setup
    cout << "* Setting up events compiler..." << endl;
    CodeCompiler::GetInstance()->SetBaseDirectory(ToString(wxGetCwd()));
    wxString eventsCompilerTempDir;
    if ( Config->Read("/Dossier/EventsCompilerTempDir", &eventsCompilerTempDir) && !eventsCompilerTempDir.empty() )
        CodeCompiler::GetInstance()->SetOutputDirectory(ToString(eventsCompilerTempDir));
    else
        CodeCompiler::GetInstance()->SetOutputDirectory(ToString(wxFileName::GetTempDir()+"/GDTemporaries"));
    int eventsCompilerMaxThread = 0;
    if ( Config->Read("/CodeCompiler/MaxThread", &eventsCompilerMaxThread, 0) && eventsCompilerMaxThread >= 0 )
        CodeCompiler::GetInstance()->AllowMultithread(eventsCompilerMaxThread > 1, eventsCompilerMaxThread);
    else
        CodeCompiler::GetInstance()->AllowMultithread(false);

    //Load extensions
    cout << "* Loading extensions:" << endl;
    bool loadExtensions = true;

    #if defined(RELEASE)
    if ( !parser.Found( wxT("noCrashCheck") ) && wxFileExists(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log") )
    {
        int whattodo = 0;
        {
            wxTextFile extensionErrorDetectFile;
            extensionErrorDetectFile.Open(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");

            ExtensionBugReportDlg dialog(NULL, extensionErrorDetectFile.GetFirstLine());
            whattodo = dialog.ShowModal();
        }
        wxRemoveFile(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log");

        if ( whattodo == 0 ) return false;
        else if ( whattodo == 1 ) loadExtensions = false;
    }
    #endif

    GDpriv::ExtensionsLoader * extensionsLoader = GDpriv::ExtensionsLoader::GetInstance();
    extensionsLoader->SetExtensionsDir("./CppPlatform/Extensions/");
    if ( loadExtensions ) extensionsLoader->LoadAllStaticExtensionsAvailable();

    #if defined(RELEASE)
    wxSetAssertHandler(NULL); //Don't want to have annoying assert dialogs in release
    #endif

    cout << "* Extensions loading ended." << endl;
    wxFileSystem::AddHandler( new wxZipFSHandler );

    //Creating main window
    cout << "* Creating main window" << endl;
    mainEditor = new MainFrame( 0 );
    SetTopWindow( mainEditor );

    //Open files
    for (unsigned int i = 0;i<filesToOpen.size();++i)
        mainEditor->Open(filesToOpen[i]);

    //Open dumped files
    if ( openRecupFiles )
    {
        unsigned int i = 0;
        while( wxFileExists(wxFileName::GetTempDir()+"/GDGamesDump/"+"gameDump"+ToString(i)+".gdg") )
        {
            mainEditor->Open(ToString(wxFileName::GetTempDir()+"/GDGamesDump/"+"gameDump"+ToString(i)+".gdg"));
            ++i;
        }
    }

    cout << "* Connecting shortcuts" << endl;
    Connect(wxID_ANY,wxEVT_KEY_DOWN, wxKeyEventHandler(Game_Develop_EditorApp::OnKeyPressed));

    //Set help provider
    {
        gd::HelpFileAccess::GetInstance()->SetHelpProvider(HelpProvider::GetInstance());
        HelpProvider::GetInstance()->SetParentWindow(mainEditor);
    }
    cout << "* Help provider set" << endl;

    cout << "* Loading events editor configuration" << endl;
    gd::ActionSentenceFormatter::GetInstance()->LoadTypesFormattingFromConfig();

    cout << "* Loading events code compiler configuration" << endl;
    bool deleteTemporaries;
    if ( Config->Read( _T( "/Dossier/EventsCompilerDeleteTemp" ), &deleteTemporaries, true) )
        CodeCompiler::GetInstance()->SetMustDeleteTemporaries(deleteTemporaries);

    //Save the event to log file
    cout << "* Creating log file (if activated)" << endl;
    LogFileManager::GetInstance()->InitalizeFromConfig();
    LogFileManager::GetInstance()->WriteToLogFile("Game Develop initialization ended"),

    //Fin du splash screen, affichage de la fenêtre
    splash->Destroy();
    mainEditor->Show();
    cout << "* Initializing platforms..." << endl;

    PlatformManager::GetInstance()->NotifyPlatformIDEInitialized();

    cout << "* Initialization ended." << endl;

    //Checking for updates
    {
        wxString result;
        Config->Read( "Startup/CheckUpdate", &result );
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

    return true;

}

int Game_Develop_EditorApp::OnExit()
{
    cout << "\nGame Develop shutdown started:" << endl;
    cout << "* Closing the configuration and destroying singletons";
    delete wxConfigBase::Set(( wxConfigBase* )NULL );
    cout << ".";
    gd::Clipboard::GetInstance()->DestroySingleton();
    cout << ".";
    gd::HelpFileAccess::GetInstance()->DestroySingleton();
    cout << ".";
    HelpProvider::GetInstance()->DestroySingleton();
    cout << "." << endl;

    cout << "* Closing the platforms..." << endl;
    PlatformManager::GetInstance()->DestroySingleton();

    cout << "* Deleting single instance checker..." << endl;
    #if defined(LINUX) || defined(MAC)
    if ( singleInstanceChecker ) delete singleInstanceChecker;
    singleInstanceChecker = NULL;
    #endif

    cout << "* Deleting the crash detection file..." << endl;
    wxRemoveFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log");

    cout << "* Shutdown process finished." << endl;
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
            mainEditor->games[i]->SaveToFile("gameDump"+ToString(i)+".gdg");
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
            mainEditor->games[i]->SaveToFile("gameDump"+ToString(i)+".gdg");
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

