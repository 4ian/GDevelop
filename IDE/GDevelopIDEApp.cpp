/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */

//This file was created 2008-03-01

//(*AppHeaders
#include <wx/image.h>
//*)

#include <wx/fileconf.h>
#include "GDCore/Tools/Log.h"
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
#include <fstream>
#include <memory>
#include "GDCore/Tools/Localization.h"
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/InstructionSentenceFormatter.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/IDE/Dialogs/ParameterControlsHelper.h"
#include "GDCore/IDE/PlatformLoader.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/Analytics/AnalyticsSender.h"
#include "GDCore/IDE/wxTools/GUIContentScaleFactor.h"
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/CommonTools.h"
#include "MainFrame.h"
#include "GDevelopIDEApp.h"
#include "UpdateChecker.h"
#include "MAJ.h"
#include "SplashScreen.h"
#include "BugReport.h"
#include "CompilationChecker.h"
#include "LogFileManager.h"
#include "ExtensionBugReportDlg.h"
#include "Dialogs/HelpProvider.h"
#include "Dialogs/ReminderDialog.h"
#include "Dialogs/ParameterEditorLauncher.h"

using namespace gd;

IMPLEMENT_APP(GDevelopIDEApp)

/**
 * Program entry point
 */
bool GDevelopIDEApp::OnInit()
{
    //Disable assertions
    wxDisableAsserts();

    //Setting up working directory:
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

    //Parse command line:
    wxCmdLineEntryDesc cmdLineDesc[] = {
        {wxCMD_LINE_PARAM, NULL, NULL, ("Files to open"), wxCMD_LINE_VAL_STRING, wxCMD_LINE_PARAM_MULTIPLE | wxCMD_LINE_PARAM_OPTIONAL},
        {wxCMD_LINE_SWITCH, "h", "help", ("Display help about launching GDevelop using command line") },
        {wxCMD_LINE_SWITCH, "v", "version", ("Display GDevelop version and quit"), wxCMD_LINE_VAL_NONE, wxCMD_LINE_OPTION_HELP },
        {wxCMD_LINE_OPTION, NULL, ("lang"), ("Force loading a specific language ( Example : /lang=en_GB )"), wxCMD_LINE_VAL_STRING, wxCMD_LINE_PARAM_OPTIONAL },
        {wxCMD_LINE_SWITCH, NULL, ("allowMultipleInstances"), ("Allow to launch GDevelop even if it is already opened") },
        {wxCMD_LINE_SWITCH, NULL, ("noCrashCheck"), ("Don't check if GDevelop crashed during last use.") },
        {wxCMD_LINE_NONE}
    };

    wxCmdLineParser parser (cmdLineDesc, argc, argv);
    parser.AddUsageText("For more information about using GDevelop, please refer to the online help.");
    if ( parser.Parse(false) > 0 )
        ;
    else if ( parser.Found( wxT("version") ) )
    {
        cout << gd::VersionWrapper::FullString() << endl;
        return false;
    }
    else if ( parser.Found( wxT("help") ) )
    {
        cout << parser.GetUsageString();
        return false;
    }

    cout << "GDevelop initialization started:" << endl;
    SetAppName("GDIDE");
    SetAppDisplayName("GDevelop IDE");

    std::vector<gd::String> filesToOpen;
    for (unsigned int i = 0;i<parser.GetParamCount();++i)
    {
        filesToOpen.push_back(parser.GetParam(i));
    }

    //Load configuration
    #if defined(LINUX)
    wxString ConfigPath = wxFileName::GetHomeDir() + "/.config/GDevelop/";
    #else
    wxString ConfigPath = wxFileName::GetHomeDir() + "/.GDevelop/";
    #endif
    if ( !wxDirExists( ConfigPath ) )
        wxMkdir( ConfigPath );

    wxFileConfig *config = new wxFileConfig( _T( "GDevelop" ), _T( "Compil Games" ), ConfigPath + "options.cfg" );
    wxConfigBase::Set( config );
    cout << "* Config file set." << endl;

    //Set language
    {
        wxString wantedLanguage;
        if ( !parser.Found( wxT("lang") ))
            config->Read("/Lang", &wantedLanguage);
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
        std::vector <gd::String> languagesAvailables;
        wxDir dir(wxGetCwd()+"/locale/");
        wxString filename;

        bool cont = dir.GetFirst(&filename, "", wxDIR_DIRS);
        while ( cont )
        {
            languagesAvailables.push_back(filename);
            cont = dir.GetNext(&filename);
        }

        //Retrieve selected language
        int languageId = wxLANGUAGE_DEFAULT;
        for (unsigned int i = 0;i<languagesAvailables.size();++i)
        {
            if ( wxLocale::FindLanguageInfo(languagesAvailables[i])->CanonicalName == wantedLanguage )
                languageId = wxLocale::FindLanguageInfo(languagesAvailables[i])->Language;
        }

        gd::LocaleManager::Get()->SetLanguage(languageId);

    }
    cout << "* Language loaded" << endl;

    #ifdef RELEASE
    {
        wxLogNull noLogPlease;
        singleInstanceChecker = new wxSingleInstanceChecker;
        if ( singleInstanceChecker->IsAnotherRunning() && !parser.Found( wxT("allowMultipleInstances") ) )
        {
            //There is already another instance running: Ask it to open the requested files.
            cout << "* Instance already existing: Redirecting the file to open to it." << endl;

            STClient * client = new STClient;
            wxString hostName = "localhost"; //Mandatory to provide the host ( for TCP/IP based implementations ).
            wxConnectionBase * connection = client->MakeConnection(hostName, "GDIDE", "GDevelop IDE");

            if ( connection )
            {
                for (unsigned int i = 0; i < filesToOpen.size(); ++i)
                    connection->Execute(filesToOpen[i]);

                connection->Disconnect();
                delete connection;
            }
            else
            {
                if ( !filesToOpen.empty() )
                    wxMessageBox(_("It seems that GDevelop is busy and can't open the requested file.\nPlease close any open dialogs and retry."),
                        _("Sorry! :/"), wxICON_INFORMATION|wxOK);
            }

            delete client;
            delete singleInstanceChecker;

            cout << "* Bye!" << endl;
            return false; // OnExit() won't be called if we return false
        }
        else
        {
            //No other instance running: Set this instance as the main one, creating a server that will
            //be called by other instance if necessary.
            server = new STServer;
            if ( !server->Create("GDIDE") )
                cout << " * FAILED to create an IPC service.";
        }
    }
    #endif

    cout << "* Single instance handling done" << endl;

    wxInitAllImageHandlers();

    cout << "* Image handlers loaded" << endl;

    //Check if the last session terminated not normally.
    bool recoveringFromBug = false;
    #if defined(RELEASE)
    if ( !parser.Found( wxT("noCrashCheck") )
        && wxFileExists(wxFileName::GetTempDir()+"/GameDevelopRunning.log")
        && !wxFileExists(wxFileName::GetTempDir()+"/ExtensionBeingLoaded.log") )
    {
        recoveringFromBug = true;

        //Get the files opened during the last crash
        std::vector<gd::String> openedFiles;
        wxTextFile projectsLogFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log");
        if (projectsLogFile.Open())
        {
            for (wxString str = projectsLogFile.GetFirstLine(); !projectsLogFile.Eof(); str = projectsLogFile.GetNextLine())
                openedFiles.push_back(str);
        }

        projectsLogFile.Close();

        //Show an explanation window and offer the user to load the autosaves.
        BugReport dialog(NULL, openedFiles);
        if ( dialog.ShowModal() == 1 )
        {
            for (unsigned int i = 0; i < openedFiles.size(); ++i)
            {
                if ( wxFileExists(openedFiles[i]+".autosave") )
                    filesToOpen.push_back(openedFiles[i]+".autosave");
            }

        }
    }
    #endif
    cout << "* Crash management ended" << endl;

    //Splash screen
    wxBitmap bitmap;
    bitmap.LoadFile( wxString("res/GD-Splashscreen.png"), wxBITMAP_TYPE_PNG );
    SplashScreen * splash = new SplashScreen(bitmap, 2, 0, -1, wxNO_BORDER | wxFRAME_SHAPED);
    cout << "* Splash Screen created" << endl;

    //Create the file logging the opened projects
    wxFile errorDetectFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log", wxFile::write);
    errorDetectFile.Write(" ");
    errorDetectFile.Close();

    cout << "* Displaying GDevelop version information :" << endl;
    cout << "GDevelop " << gd::VersionWrapper::FullString() << ", built "
         << gd::VersionWrapper::Date() << "/" << gd::VersionWrapper::Month() << "/" << gd::VersionWrapper::Year() << endl;

    cout << "* Creating useless SFML objects" << endl;
    sf::RenderWindow window;
    sf::Window window2;

    //Load platforms and extensions
    cout << "* Loading platforms and extensions:" << endl;
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

    if ( loadExtensions ) gd::PlatformLoader::LoadAllPlatformsInManager(".");

    #if defined(RELEASE)
    wxSetAssertHandler(NULL); //Don't want to have annoying assert dialogs in release
    #endif

    cout << "* Platform and extensions loading ended." << endl;
    wxFileSystem::AddHandler( new wxZipFSHandler );

    //Creating main window
    cout << "* Creating main window" << endl;
    mainEditor = new MainFrame( 0 );
    SetTopWindow( mainEditor );

    //Open files
    for (unsigned int i = 0;i<filesToOpen.size();++i)
        mainEditor->Open(filesToOpen[i]);

    cout << "* Connecting shortcuts" << endl;
    Connect(wxID_ANY,wxEVT_KEY_DOWN, wxKeyEventHandler(GDevelopIDEApp::OnKeyPressed));

    //Set help provider
    cout << "* Setting help provider" << endl;
    gd::HelpFileAccess::Get()->SetHelpProvider(::HelpProvider::Get());

    cout << "* Loading events editor configuration" << endl;
    gd::InstructionSentenceFormatter::Get()->LoadTypesFormattingFromConfig();

    cout << "* Connecting parameters editors" << endl;
    gd::ParameterControlsHelper::SetEditParameterFunction(&ParameterEditorLauncher::LaunchEditor);

    //Save the event to log file
    cout << "* Creating log file (if activated)" << endl;
    LogFileManager::Get()->InitalizeFromConfig();
    LogFileManager::Get()->WriteToLogFile("GDevelop initialization ended"),

    splash->Destroy();
    mainEditor->Show();
    cout << "* Initializing platforms..." << endl;

    gd::PlatformManager::Get()->NotifyPlatformIDEInitialized();

    cout << "* Initialization ended." << endl;

    #if defined(MACOS)
    gd::LogWarning(_("This is a beta version of GDevelop for Mac OS X.\n\nBugs may be present and only HTML5 games will work. Please report any feedback on www.forum.compilgames.net.\nThanks!"));
    #endif

    //Checking for updates
    {

        wxString result;
        config->Read( "Startup/CheckUpdate", &result );
        if ( result != "false" )
        {
            UpdateChecker * checker = UpdateChecker::Get();
            checker->DownloadInformation();
#ifndef GD_NO_UPDATE_CHECKER
            if ( checker->newVersionAvailable )
            {
                MAJ dialog(mainEditor, true);
                if ( dialog.ShowModal() == 2 )
                {
                    mainEditor->Destroy();
                    return true;
                }
            }
#endif
        }
        mainEditor->RefreshNews();
    }

    //Notify opening of the program.
    config->Write("Startup/OpeningCount", config->ReadDouble("Startup/OpeningCount", 0) + 1);
    gd::AnalyticsSender::Get()->SendProgramOpening();

    //Feedback reminder
    if (!recoveringFromBug)
    {
        int result = 3;
        config->Read( "Startup/Reminder", &result );

        //Decrement the counter and show the reminder only after 3 launch in a row.
        if ( result > 0 )
        {
            result--;
            config->Write( "Startup/Reminder", result);
        }
        if ( result == 0 )
        {
            ReminderDialog dialog(mainEditor);
            dialog.ShowModal();
        }

    }


    return true;

}

int GDevelopIDEApp::OnExit()
{
    cout << "\nGDevelop shutdown started:" << endl;
    cout << "* Closing the configuration and destroying singletons";
    delete wxConfigBase::Set(( wxConfigBase* )NULL );
    cout << ".";
    gd::Clipboard::Get()->DestroySingleton();
    cout << ".";
    ::HelpProvider::Get()->DestroySingleton();
    cout << "." << endl;
    gd::HelpFileAccess::Get()->DestroySingleton();
    cout << "." << endl;

    cout << "* Closing the platforms..." << endl;
    gd::PlatformManager::DestroySingleton();

    cout << "* Deleting single instance checker..." << endl;
    #if defined(LINUX) || defined(MACOS)
    if ( singleInstanceChecker ) delete singleInstanceChecker;
    singleInstanceChecker = NULL;
    #endif

    cout << "* Clearing icon cache..." << endl;
    SkinHelper::ClearIconCache();

    cout << "* Deleting the crash detection file..." << endl;
    wxRemoveFile(wxFileName::GetTempDir()+"/GameDevelopRunning.log");

    cout << "* Shutdown process finished." << endl;
    return 0;
}

#ifndef DEBUG //So as to let the debugger catch exceptions in debug build
void GDevelopIDEApp::OnUnhandledException()
{
    wxSafeShowMessage( "Fatal error", "A fatal error occurred (01).\nGDevelop has to be shutdown." );

    wxFile dataErrorFile("errordata.txt", wxFile::write);
    dataErrorFile.Write("GDevelop - Error log.\n");
    dataErrorFile.Write("\n");
    dataErrorFile.Write("GD Error code : (01) Fatal error\n");

    try
    {
        for (unsigned int i = 0;i<mainEditor->games.size();++i)
            mainEditor->games[i]->SaveToFile("gameDump"+gd::String::From(i)+".gdg");
    }
    catch(...)
    {
        wxSafeShowMessage("Unable to save game", "A game could not be saved");
    }
    terminate();
}
#endif

bool GDevelopIDEApp::OnExceptionInMainLoop()
{
    #ifndef DEBUG //So as to let the debugger catch exceptions in debug build
    wxSafeShowMessage( "Fatal error", "A fatal error occurred: (02) Segmentation Fault.\nGDevelop has to be shutdown." );

    wxFile dataErrorFile("errordata.txt", wxFile::write);
    dataErrorFile.Write("GDevelop - Error log.\n");
    dataErrorFile.Write("\n");
    dataErrorFile.Write("GD Error code : (02) Segmentation Fault\n");

    try
    {
        for (unsigned int i = 0;i<mainEditor->games.size();++i)
            mainEditor->games[i]->SaveToFile("gameDump"+gd::String::From(i)+".gdg");
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

bool STConnection::OnExec(const wxString & topic, const wxString &filename)
{
    MainFrame * frame = wxDynamicCast(wxGetApp().mainEditor, MainFrame);
    if (!frame) return true;

    cout << "Received request for opening file \"" << filename << "\"" << std::endl;
    if ( filename.empty() )
        frame->Raise();
    else
        frame->Open(filename);

    return true;
}
