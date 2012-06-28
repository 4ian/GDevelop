/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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

#include "GDL/CodeExecutionEngine.h"
#include <llvm/Support/DynamicLibrary.h>

#include "MainFrame.h"
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
#include "LogFileManager.h"
#include "ExtensionBugReportDlg.h"

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

    wxLogStatus( wxString(pourcent + _( " pourcents du chargement (" ) + message + _(" ).")) );
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
    cout << "* Language loaded" << endl;

    wxInitAllImageHandlers();

    cout << "* Image Handlers loaded" << endl;

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

    cout << "* Single instance checked" << endl;
    //Safety check for gdl.dll
    bool sameGDLdllAsDuringCompilation = CompilationChecker::EnsureCorrectGDLVersion();
    if ( !sameGDLdllAsDuringCompilation )
    {
        wxLogError(_("La version du fichier GDL.dll ( ou GDL.so ) semble être incorrecte. Veuillez réinstaller Game Develop afin que le programme fonctionne correctement.\n"
                     "Si le problème persiste, assurez vous qu'il n'existe pas une nouvelle version de Game Develop sur le site officiel : http://www.compilgames.net\n"
                     "Si non, prenez contact avec l'auteur."));
    }
    cout << "* GDL checked" << endl;

    //Set help file
    {
        gd::HelpFileAccess * helpFileAccess = gd::HelpFileAccess::GetInstance();
        if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_ENGLISH )
            helpFileAccess->InitWithHelpFile("help.chm");
        else if ( GDpriv::LocaleManager::GetInstance()->locale->GetLanguage() == wxLANGUAGE_FRENCH )
            helpFileAccess->InitWithHelpFile("aide.chm");
    }
    cout << "* Help file set" << endl;

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
    cout << "* Initializing LLVM/Clang..." << endl;
    CodeExecutionEngine::EnsureLLVMTargetsInitialization();
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
    extensionsLoader->SetExtensionsDir("./Extensions/");
    if ( loadExtensions ) extensionsLoader->LoadAllStaticExtensionsAvailable();

    #if defined(RELEASE)
    wxSetAssertHandler(NULL); //Don't want to have annoying assert dialogs in release
    #endif

    cout << "* Extensions loading ended." << endl;
    wxFileSystem::AddHandler( new wxZipFSHandler );

    //Welcome window
    {
        wxString result;
        Config->Read( "Startup/GettingStartedWindow", &result );
        if ( result != "false" )
        {
            Demarrage bienvenue( NULL );
            if ( bienvenue.ShowModal() == 1 )
            {
                wxFileDialog open( NULL, _( "Ouvrir un exemple" ), wxGetCwd()+"/Examples/", "", "\"Game Develop\" Game (*.gdg;*.jgd)|*.jgd;*.gdg" );
                open.ShowModal();

                if ( !open.GetPath().empty() ) filesToOpen.push_back( string(open.GetPath().mb_str()) );
            }
            Config->Write( "Startup/GettingStartedWindow", "false" );
        }
    }

    //Creating main window
    cout << "* Creating main window" << endl;
    mainEditor = new MainFrame( 0, filesToOpen.empty() && !openRecupFiles );
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

    //wxLogWarning("Cette version de Game Develop n'est pas finalisée et n'est utilisable qu'à des fins de tests. Merci de ne pas la redistribuer et d'utiliser la version disponible sur notre site pour toute autre utilisation.");

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
    gd::HelpFileAccess * helpFileAccess = gd::HelpFileAccess::GetInstance();
    helpFileAccess->DestroySingleton();

    #if defined(LINUX) || defined(MAC)
    if ( singleInstanceChecker ) delete singleInstanceChecker;
    singleInstanceChecker = NULL;
    #endif

    wxRemoveFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log");

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
