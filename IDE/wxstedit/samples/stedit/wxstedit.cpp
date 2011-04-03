///////////////////////////////////////////////////////////////////////////////
// Name:        wxstedit.cpp
// Purpose:     Simple wxSTEditor app
// Author:      John Labenski
// Modified by:
// Created:     04/01/98
// RCS-ID:      $Id: wxstedit.cpp,v 1.17 2007/02/15 02:20:42 jrl1 Exp $
// Copyright:   (c) John Labenski
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

// ----------------------------------------------------------------------------
// This nearly the absolute minimum of code to get an editor
/*
    // Create the options and tweak them as necessary
    wxSTEditorOptions steOptions(STE_DEFAULT_OPTIONS);
    steOptions.GetMenuManager()->SetMenuOptionType(STE_MENU_NOTEBOOK, true);
    // Create the frame for the editor
    wxSTEditorFrame *editor = new wxSTEditorFrame(NULL, wxID_ANY, wxT("Editor"));
    // Have the frame create the children and menus from the options
    // or you can do this part by hand
    editor->CreateOptions(steOptions);
    // optionally start with a file you load from disk or memory and show the frame
    editor->GetEditor()->LoadFile(wxT("textfile.txt"));
    editor->Show(true);
*/
// ----------------------------------------------------------------------------


// For compilers that support precompilation, includes "wx/wx.h".
#include "wx/wxprec.h"

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// for all others, include the necessary headers
#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif

#include "wx/stedit/stedit.h"
#include "wx/stedit/steshell.h"

#include "wx/cmdline.h"
#include "wx/config.h"
#include "wx/fileconf.h"
#include "wx/dir.h"
#include "wx/filename.h"
#include "wx/html/htmlwin.h"

#include "wxstedit_htm.hpp" // include docs 
#include "readme_htm.hpp"

// ----------------------------------------------------------------------------

enum Menu_IDs
{
    ID_SHOW_HELP      = ID_STE__LAST, // IDs greater than this won't conflict
    ID_SHOW_README,
    ID_TEST_STESHELL
};

// ----------------------------------------------------------------------------
// wxCmdLineParser functions
// ----------------------------------------------------------------------------

static const wxCmdLineEntryDesc cmdLineDesc[] =
{
    { wxCMD_LINE_SWITCH, wxT("h"), wxT("help"),   _("help on command line switches"),
        wxCMD_LINE_VAL_NONE, wxCMD_LINE_PARAM_OPTIONAL|wxCMD_LINE_OPTION_HELP },

    { wxCMD_LINE_SWITCH, wxT("1"), wxT("single"), _("single file mode"),
        wxCMD_LINE_VAL_NONE, wxCMD_LINE_PARAM_OPTIONAL },

    { wxCMD_LINE_SWITCH, wxT("r"), wxT("recurse"), _("open the given filespecs recursively, quote values \"*.txt\""),
        wxCMD_LINE_VAL_NONE, wxCMD_LINE_PARAM_OPTIONAL },

    { wxCMD_LINE_OPTION, wxT("c"), wxT("config"), _("use config file"),
        wxCMD_LINE_VAL_STRING, wxCMD_LINE_PARAM_OPTIONAL|wxCMD_LINE_NEEDS_SEPARATOR },

    { wxCMD_LINE_PARAM,  wxT(""),  wxT(""),       _("input filenames(s)"),
        wxCMD_LINE_VAL_STRING, wxCMD_LINE_PARAM_OPTIONAL|wxCMD_LINE_PARAM_MULTIPLE },

    { wxCMD_LINE_NONE }
};

// ----------------------------------------------------------------------------
// wxStEditApp - the application class
// ----------------------------------------------------------------------------
class wxStEditApp : public wxApp
{
public:
    wxStEditApp() : wxApp(), m_frame(NULL) {}
    virtual bool OnInit();
    virtual int OnExit();

    void CreateShell();
    void OnMenuEvent(wxCommandEvent& event);
    void OnSTEShellEvent(wxSTEditorEvent& event);

    wxSTEditorFrame* m_frame;
};

IMPLEMENT_APP(wxStEditApp)

bool wxStEditApp::OnInit()
{
    // Create a set of options for your editing "system."
    //  These options control what components will be automatically
    //  created and/or managed for you. For every window created the
    //  virtual function CreateOptions will be called.
    //  You can start with all the options "turned off" by using
    //  the default constructor.

    // For this simple editor we'll basicly use the defaults for everything
    //  (we reset it in cmd line parser to use either a single editor or notebook)
    wxSTEditorOptions steOptions(STE_DEFAULT_OPTIONS);

    // =======================================================================
    // A sample of things that you might do to change the behavior

    // no bookmark items in menus or toolbar
    //steOptions.GetMenuManager().SetMenuItemType(STE_MENU_BOOKMARK, false);
    //steOptions.GetMenuManager().SetToolbarToolType(STE_MENU_BOOKMARK, false);

    // don't create a toolbar
    //steOptions.SetFrameOption(STF_TOOLBAR, false);
    // allow notebook to not have any pages
    //steOptions.SetNotebookOption(STN_ALLOW_NO_PAGES, true);
    // don't ask the user to save a modified document, close silently
    //steOptions.SetEditorOption(STE_QUERY_SAVE_MODIFIED, false);

    // Maybe we're editing only python files, set global initializers
    // wxSTEditorOptions::SetGlobalDefaultFileName(wxT("newfile.py"));
    // wxSTEditorOptions::SetGlobalDefaultFileExtensions(wxT("Python file (*.py)|*.py"));

    // maybe the editors that use these options are only for your ini files
    // steOptions.SetDefaultFileName(wxT("MyProgram.ini"));

    // Maybe you want your own special menu for the splitter?
    //  it'll delete the old one (if there was one) and replace it with yours.
    // steOptions.SetSplitterPopupMenu(myMenu, false);

    // Maybe you want this editor to not use the global preferences,
    //  create a new one, set it up the way you like it and push it onto the
    //  options so that every new editor sharing these options will use it.
    //  Remember, you can later detach a single editors to have them
    //  use some other prefs/styles/langs with STE::RegisterXXX(otherXXX)
    // wxSTEditorPrefs myPrefs(true);
    // myPrefs.SetPrefBool(STE_PREF_VIEW_EOL, true);
    // steOptions.SetEditorPrefs(myPrefs);

    // You can do the same for the styles and langs, though the languages
    //  are pretty generic and it probably won't be necessary.

    // Remember, the global versions are created to be used by a set of editors
    //  they are created because if a user likes their editor a
    //  certain way, you might as well make all of them look that way.
    //  There is nothing special about them and if you want to see what the
    //  defaults are just create a wxSTEditorPrefs/Styles/Langs(true).

    // etc... Ok, we set things up the way we like.

    // end sample code
    // =======================================================================

    // ------------------------------------------------------------------------
    // Read the command line and get the filenames/options, if any

    wxArrayString fileNames;
    wxCmdLineParser parser(cmdLineDesc, argc, argv);
    bool recurse = false;

/*
    // test code for looking at the args passed in
    for (int k = 0; k < argc; k++)
    {
        wxArrayString a = parser.ConvertStringToArgs(argv[k]);
        for (int n=0; n < a.GetCount(); n++)
        {
            wxPrintf(wxT("Arg %d #%d '%s'\n"), k, n, a[n].c_str()); fflush(stdout);
        }
    }
*/

    switch ( parser.Parse() )
    {
        case -1 :
        {
            // help should be given by the wxCmdLineParser, exit program
            return false;
        }
        case 0:
        {
            // use single page, else use a notebook of editors
            if (parser.Found(wxT("1")))
            {
                steOptions.SetFrameOption(STF_CREATE_NOTEBOOK, false);
                steOptions.SetFrameOption(STF_CREATE_SINGLEPAGE, true);
                steOptions.GetMenuManager()->CreateForSinglePage();
            }
            else
            {
                steOptions.SetFrameOption(STF_CREATE_SIDEBAR, true);
                steOptions.GetMenuManager()->CreateForNotebook();
            }

            // use specified config file to load saved prefs, styles, langs
            wxString configFile;
            if (parser.Found(wxT("c"), &configFile))
            {
                wxFileName fN(configFile);

                if ( !fN.FileExists() )
                {
                    //wxLogMessage(wxT("Config file '")+configFile+wxT("' does not exist."));
                    if (configFile.IsEmpty() || !fN.IsOk() || wxIsWild(configFile))
                    {
                        int ret = wxMessageBox(_("Config file '")+configFile+_("' has an invalid name.\nContinue without using a config file?"),
                                               _("Invalid config file name"),
                                               wxICON_QUESTION|wxYES_NO);
                        if (ret == wxNO)
                            return false;

                        configFile = wxEmptyString;
                    }
                    else // file doesn't exist, ask if they want to create a new one
                    {
                        int ret = wxMessageBox(_("Config file '")+configFile+_("' does not exist.\nWould you like to create a new one?"),
                                               _("Invalid config file"),
                                               wxICON_QUESTION|wxYES_NO|wxCANCEL);
                        if (ret == wxCANCEL)
                            return false;
                        else if (ret == wxNO)
                            configFile = wxEmptyString;
                    }
                }

                // use the specified config file, if it's still set
                if ( !configFile.IsEmpty() )
                {
                    wxFileConfig *config = new wxFileConfig(wxT("wxStEdit"), wxT("wxWidgets"),
                                                            configFile, wxEmptyString,
                                                            wxCONFIG_USE_RELATIVE_PATH);
                    wxConfigBase::Set((wxConfigBase*)config);
                }
                else // don't use any config file at all, disable saving
                {
                    steOptions.GetMenuManager()->SetMenuItemType(STE_MENU_PREFS_MENU, STE_MENU_PREFS_SAVE, false);
                }
            }
            else
            {
                // Always use a wxFileConfig since I don't care for registry entries.
                wxFileConfig *config = new wxFileConfig(wxT("wxStEdit"), wxT("wxWidgets"));
                wxConfigBase::Set((wxConfigBase*)config);
            }

            // they want to open the files recursively
            if (parser.Found(wxT("r")))
                recurse = true;

            // gather up all the filenames to load
            size_t n, count = parser.GetParamCount();
            for (n = 0; n < count; n++)
                fileNames.Add(parser.GetParam(n));

            break;
        }
        default:
        {
            wxLogMessage(wxT("Unknown command line option, aborting."));
            return false;
        }
    }

    // create with the readonly menuitem, not set by default since I don't think
    //  it's generally useful, but good for debugging.
    steOptions.GetMenuManager()->SetMenuItemType(STE_MENU_EDIT_MENU, STE_MENU_EDIT_READONLY, true);

    // ------------------------------------------------------------------------
    // load the prefs/style/langs from the config, if we're using one
    if (wxConfigBase::Get(false))
        steOptions.LoadConfig(*wxConfigBase::Get(false));

    // ------------------------------------------------------------------------
    m_frame = new wxSTEditorFrame( NULL, wxID_ANY, wxT("wxStEditor"),
                                   wxDefaultPosition, wxSize(500,400));

    // must call this if you want any of the options, else blank frame
    m_frame->CreateOptions(steOptions);

    // Get the "Help" menu
    wxMenu* menu = m_frame->GetMenuBar()->GetMenu(m_frame->GetMenuBar()->GetMenuCount()-1);

    // Add our help dialogs
    menu->Append(ID_SHOW_HELP, _("Help..."), _("Show help on using wxStEdit"));
    menu->Append(ID_SHOW_README, _("Programming help..."), _("Show help on the wxStEdit library"));
    // just use connect here, we could also use static event tables, but this
    //  is easy enough to do.
    m_frame->Connect(ID_SHOW_HELP, wxEVT_COMMAND_MENU_SELECTED,
                     wxCommandEventHandler(wxStEditApp::OnMenuEvent));
    m_frame->Connect(ID_SHOW_README, wxEVT_COMMAND_MENU_SELECTED,
                     wxCommandEventHandler(wxStEditApp::OnMenuEvent));

    // add menu item for testing the shell
    menu->AppendSeparator();
    menu->Append(ID_TEST_STESHELL, _("Test STE shell..."), _("Test the STE shell component"));
    m_frame->Connect(ID_TEST_STESHELL, wxEVT_COMMAND_MENU_SELECTED,
                     wxCommandEventHandler(wxStEditApp::OnMenuEvent));

    // ------------------------------------------------------------------------
    // handle loading the files
    size_t n;
    wxArrayString badFileNames;

    // handle recursive file loading
    if (recurse && m_frame->GetEditorNotebook())
    {
        int max_page_count = m_frame->GetEditorNotebook()->GetMaxPageCount();

        wxArrayString recurseFileNames;
        for (n = 0; n < fileNames.GetCount(); n++)
        {
            wxFileName fN(fileNames[n]);
            fN.MakeAbsolute();
            //wxPrintf(wxT("Loading file '%s' to '%s'\n"), fileNames[n].c_str(), fN.GetFullPath().c_str()); fflush(stdout);
            wxDir::GetAllFiles(fN.GetPath(), &recurseFileNames, fN.GetFullName());

            // if they did wxstedit /r c:\*.* stop the insanity...
            if ((int)recurseFileNames.GetCount() >= max_page_count)
            {
                wxString msg = wxString::Format(_("Opening %d files, unable to open any more."), max_page_count);
                wxMessageBox(msg, _("Maximum number of files"), wxOK|wxICON_ERROR, m_frame);
                recurseFileNames.RemoveAt(max_page_count - 1, recurseFileNames.GetCount() - max_page_count);
                break;
            }
        }

        //for (n=0; n < recurseFileNames.GetCount(); n++)
        //  { wxPrintf(wxT("Loading file '%s'\n"), recurseFileNames[n].c_str()); fflush(stdout); }

        fileNames = recurseFileNames; // these are really the files to open
    }

    // if the files have *, ? or are directories, don't try to load them
    for (n=0; n < fileNames.GetCount(); n++)
    {
        if (wxIsWild(fileNames[n]))
        {
            badFileNames.Add(fileNames[n]);
            fileNames.RemoveAt(n);
            n--;
        }
        else if (wxDirExists(fileNames[n]))
        {
            fileNames.RemoveAt(n);
            n--;
        }
    }

    // If there are any good files left, try to load them
    if (fileNames.GetCount() > 0u)
    {
        if (wxFileExists(fileNames[0]))
            m_frame->GetEditor()->LoadFile( fileNames[0] );
        else
        {
            // fix the path to the new file using the command line path
            wxFileName fn(fileNames[0]);
            fn.Normalize();
            m_frame->GetEditor()->NewFile( fn.GetFullPath() );
        }

        fileNames.RemoveAt(0);
        if (steOptions.HasFrameOption(STF_CREATE_NOTEBOOK) && fileNames.GetCount())
            m_frame->GetEditorNotebook()->LoadFiles( &fileNames );
    }

    m_frame->Show(true);

    // filenames had *, ? or other junk so we didn't load them
    if (badFileNames.GetCount())
    {
        wxString msg(_("There was a problem trying to load file(s):\n"));
        for (n=0; n < badFileNames.GetCount(); n++)
            msg += wxT("'") + badFileNames[n] + wxT("'\n");

        wxMessageBox(msg, _("Unable to load file(s)"), wxOK|wxICON_ERROR,
                     m_frame);
    }

    return true;
}

int wxStEditApp::OnExit()
{
    delete wxConfigBase::Set(NULL);
    return wxApp::OnExit();
}

void wxStEditApp::CreateShell()
{
    wxDialog dialog(m_frame, wxID_ANY, wxT("wxSTEditorShell"),
                    wxDefaultPosition, wxDefaultSize,
                    wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER);
    wxSTEditorShell* shell = new wxSTEditorShell(&dialog, wxID_ANY);
    // Set the styles and langs to those of the frame (not necessary, but nice)
    // The prefs aren't shared since we want to control the look and feel.
    wxSTEditorPrefs prefs(true);
    prefs.SetPrefInt(STE_PREF_INDENT_GUIDES, 0);
    prefs.SetPrefInt(STE_PREF_EDGE_MODE, wxSTC_EDGE_NONE);
    prefs.SetPrefInt(STE_PREF_VIEW_LINEMARGIN, 0);
    prefs.SetPrefInt(STE_PREF_VIEW_MARKERMARGIN, 1);
    prefs.SetPrefInt(STE_PREF_VIEW_FOLDMARGIN, 0);
    shell->RegisterPrefs(prefs);
    shell->RegisterStyles(m_frame->GetOptions().GetEditorStyles());
    shell->RegisterLangs(m_frame->GetOptions().GetEditorLangs());
    shell->SetLanguage(STE_LANG_PYTHON); // arbitrarily set to python

    shell->BeginWriteable();
    shell->AppendText(_("Welcome to a test of the wxSTEditorShell.\n\n"));
    shell->AppendText(_("This simple test merely responds to the wxEVT_STESHELL_ENTER\n"));
    shell->AppendText(_("events and prints the contents of the line when you press enter.\n\n"));
    shell->AppendText(_("For demo purposes, the shell understands these simple commands.\n"));
    shell->AppendText(_(" SetMaxHistoryLines num : set the number of lines in history buffer\n"));
    shell->AppendText(_(" SetMaxLines num [overflow=2000] : set the number of lines displayed\n"));
    shell->AppendText(_("   and optionally the number of lines to overflow before deleting\n"));
    shell->AppendText(_(" Quit : quit the wxSTEditorShell demo\n"));
    shell->CheckPrompt(true); // add prompt
    shell->EndWriteable();

    shell->Connect(wxID_ANY, wxEVT_STESHELL_ENTER,
                   wxSTEditorEventHandler(wxStEditApp::OnSTEShellEvent));

    int width = shell->TextWidth(wxSTC_STYLE_DEFAULT,
                                 wxT(" SetMaxHistoryLines num : set the number of lines in history buffer  "));
    dialog.SetSize(width + 30, -1);

    wxBoxSizer *topSizer = new wxBoxSizer( wxVERTICAL );
    topSizer->Add(shell, 1, wxEXPAND);
    dialog.SetSizer(topSizer);
    dialog.ShowModal();
}

void wxStEditApp::OnMenuEvent(wxCommandEvent& event)
{
    // note: use wxGetApp().CreateShell() and wxGetApp().m_frame because
    //       we're called from a handler Connected from the frame to the
    //       app and you'll crash otherwise.

    switch (event.GetId())
    {
        case ID_SHOW_HELP :
        {
            wxFrame *helpFrame = new wxFrame(wxGetApp().m_frame, wxID_ANY, _("Help for wxStEdit"), wxDefaultPosition, wxSize(600,400));
            wxHtmlWindow *htmlWin = new wxHtmlWindow(helpFrame);
            if (htmlWin->SetPage(stc2wx((const char*)wxstedit_htm)))
            {
                helpFrame->Centre();
                helpFrame->Show(true);
            }
            else
                delete helpFrame;

            break;
        }
        case ID_SHOW_README :
        {
            wxFrame *helpFrame = new wxFrame(wxGetApp().m_frame, wxID_ANY, _("Programming help for wxStEdit"), wxDefaultPosition, wxSize(600,400));
            wxHtmlWindow *htmlWin = new wxHtmlWindow(helpFrame);
            if (htmlWin->SetPage(stc2wx((const char*)readme_htm)))
            {
                helpFrame->Centre();
                helpFrame->Show(true);
            }
            else
                delete helpFrame;

            break;
        }
        case ID_TEST_STESHELL : wxGetApp().CreateShell(); break;
        default : break;
    }
    event.Skip();
}

void wxStEditApp::OnSTEShellEvent(wxSTEditorEvent& event)
{
    // handle the event and for this example we just write it back
    wxSTEditorShell* shell = wxDynamicCast(event.GetEventObject(), wxSTEditorShell);
    wxString val = event.GetString();
    shell->AppendText(_("\nText Entered : '") + val + wxT("'\n"));

    // very simple mechanism to parse the line to do things, you may prefer
    //   using wxPython or wxLua and running the string as is.
    wxString token(val.BeforeFirst(wxT(' ')).Lower());

    if (val.Lower().Strip(wxString::both) == wxT("quit"))
    {
        wxCommandEvent quitEvent(wxEVT_COMMAND_BUTTON_CLICKED, wxID_OK);
        event.SetEventObject(shell);
        shell->GetEventHandler()->ProcessEvent(quitEvent);
    }
    else if (token == wxT("setmaxhistorylines"))
    {
        wxString num = val.AfterFirst(wxT(' '));
        long n = 0;
        if (num.ToLong(&n))
        {
            shell->SetMaxHistoryLines(n);
            shell->AppendText(wxString::Format(_("The maximum number of history lines is set to %d.\n"), n));
        }
        else
            shell->AppendText(_("ERR: Expected number, eg. SetMaxHistoryLines 10\n"));
    }
    else if (token == wxT("setmaxlines"))
    {
        wxString num1 = val.AfterFirst(wxT(' ')).Strip(wxString::both);
        wxString num2 = num1.AfterFirst(wxT(' ')).Strip(wxString::both);
        num1 = num1.BeforeFirst(wxT(' ')).Strip(wxString::both);

        long n1 = 0, n2 = 2000;
        if (num1.ToLong(&n1) && (num2.IsEmpty() || num2.ToLong(&n2)))
        {

            shell->SetMaxLines(n1, n2);
            shell->AppendText(wxString::Format(_("The maximum number of displayed lines is set to\n  %d with an overflow of %d lines before deleting up to max lines.\n"), n1, n2));
        }
        else
            shell->AppendText(_("ERR: Expected number, eg. SetMaxLines 10 [2000]\n"));
    }

    shell->CheckPrompt(true);
}
