///////////////////////////////////////////////////////////////////////////////
// Name:        steopts.h
// Purpose:     wxSTEditorOptions
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEOPTS_H_
#define _STEOPTS_H_

#include "wx/stedit/stedefs.h"
#include <wx/checkbox.h>
#include <wx/statusbr.h>
#include <wx/listbox.h>

class WXDLLEXPORT wxFileHistory;
class WXDLLEXPORT wxConfigBase;

//-----------------------------------------------------------------------------
// Editor and window options for wxSTEditor and friends
//-----------------------------------------------------------------------------

enum STE_OptionType
{
    STE_OPTION_EDITOR,           // STE_EditorOptionsType
    STE_OPTION_SPLITTER,         // STE_SplitterOptionsType
    STE_OPTION_NOTEBOOK,         // STE_NotebookOptionsType
    STE_OPTION_FRAME,            // STE_FrameOptionsType
    STE_OPTION_CONFIG,           // STE_ConfigOptionsType
    STE_OPTION_FINDREPLACE,      // STE_FindReplaceOptionsType

    STE_OPTION_DEFAULT_FILENAME, // default filename to use for new editor
    STE_OPTION_DEFAULT_FILEPATH, // default filepath to start with in filedlg
    STE_OPTION_DEFAULT_FILEEXTS, // default file extensions to show in filedlg

    // These are the paths to save the config data to. These are used if
    //  STE_ConfigOptionsType are set to save and the user has opted to
    //  save the preferences (eg. ID_STE_SAVE_PREFERENCES).

    // The base path (note leading '/' to specify from root) is prepended to
    //   the other paths unless they have a leading '/' to denote that
    //   they're absolute paths.
    // Use wxSTEditorOptions::GetConfigPath(size_t path_n) to get the
    //  full "base + other" path, else just GetOption to retrieve the
    //  actual value.
    STE_OPTION_CFGPATH_BASE,        // "/wxSTEditor"
    STE_OPTION_CFGPATH_PREFS,       // "Preferences"
    STE_OPTION_CFGPATH_STYLES,      // "Styles"
    STE_OPTION_CFGPATH_LANGS,       // "Languages"
    STE_OPTION_CFGPATH_FRAME,       // "Frame"
    STE_OPTION_CFGPATH_FILEHISTORY, // "RecentFiles"
    STE_OPTION_CFGPATH_FINDREPLACE, // "FindReplace"

    STE_OPTION__MAX,
};

// Options for the wxSTEditor
enum STE_EditorOptionsType
{
    STE_CREATE_POPUPMENU    = 0x0001, // create a rightclick popupmenu at startup
                                      // uses items in wxSTEditorMenuManager
                                      // only creates if one is not previously assigned
    STE_QUERY_SAVE_MODIFIED = 0x0002, // popup dialog to ask to save if modified
    STE_CREATE_ACCELTABLE   = 0x0004, // create and assign a wxAcceleratorTable
                                      // for the editor from the popup menu items
                                      // and any items in the wxMenubar that the
                                      // editor can handle
                                      // NOTE: this has problems so it's not enabled
                                      // by default

    STE_DEFAULT_OPTIONS     = STE_CREATE_POPUPMENU|STE_QUERY_SAVE_MODIFIED
};

// Options for the wxSTEditorSplitter
enum STE_SplitterOptionsType
{
    STS_CREATE_POPUPMENU = 0x0001, // right-click menu for setting splitting
                                   // only creates if one is not previously assigned
    STS_NO_EDITOR        = 0x0002, // don't initialize with an editor (you'll need to create one)

    STS_SPLITBUTTONS     = 0x0004, // when there is a single editor, show splitter buttons
                                   //  above and to the side of the scrollbars.

    STS_DEFAULT_OPTIONS  = STS_CREATE_POPUPMENU|STS_SPLITBUTTONS
};

// Options for the wxSTEditorNotebook
enum STE_NotebookOptionsType
{
    STN_CREATE_POPUPMENU  = 0x0001, // have a right-click tab menu
                                    // only creates if one is not previously assigned
    STN_ALPHABETICAL_TABS = 0x0002, // always sort tabs alphabetically
    STN_UPDATE_TITLES     = 0x0004, // update the titles of the pages
    STN_ALLOW_NO_PAGES    = 0x0008, // allow having no pages

    STN_DEFAULT_OPTIONS   = STN_CREATE_POPUPMENU|STN_UPDATE_TITLES|STN_ALPHABETICAL_TABS
};

// Options for the wxSTEditorFrame
enum STE_FrameOptionsType
{
    // if neither STF_CREATE_SINGLEPAGE|STF_CREATE_NOTEBOOK then don't create an editor, don't have both
    STF_CREATE_SINGLEPAGE  = 0x0001, // create a single text editor
    STF_CREATE_NOTEBOOK    = 0x0002, // create a wxSTEditorNotebook for editors
    STF_CREATE_SIDEBAR     = 0x0004, // create a wxNotebook side panel
                                     // first page is a wxListBox for listing files
                                     // you can add other pages in any order
    STF_CREATE_TOOLBAR     = 0x0010, // create and maintain a toolbar
    STF_CREATE_MENUBAR     = 0x0020, // create and maintain a menubar
    STF_CREATE_STATUSBAR   = 0x0040, // create and maintain a statusbar
    STF_CREATE_FILEHISTORY = 0x0080, // create and maintain a wxFileHistory if one doesn't already exist and you have wxID_OPEN
    STF_DEFAULT_OPTIONS = STF_CREATE_NOTEBOOK|STF_CREATE_TOOLBAR|STF_CREATE_MENUBAR|STF_CREATE_STATUSBAR|STF_CREATE_FILEHISTORY
};

enum STE_ConfigOptionsType
{
                                     // use wxConfigBase::Get(false) to save prefs
                                     // if config isn't created this is ignored
    STF_CONFIG             = 0x0002, // wxSTEditorFrame will save it's prefs if any
                                     // prefs saved only for menu item ID_STE_SAVE_PREFERENCES

    STE_CONFIG_FILEHISTORY = 0x0004, // wxSTEditorOption's wxFileHistory should be saved
    STE_CONFIG_FINDREPLACE = 0x0008, // wxSTEditorFindReplaceData should be saved

    STE_CONFIG_PREFS       = 0x0010, // wxSTEditorPrefs will save their prefs
    STE_CONFIG_STYLES      = 0x0020, // wxSTEditorStyles will save their prefs
    STE_CONFIG_LANGS       = 0x0040, // wxSTEditorLangs will save their prefs

    STE_CONFIG_SAVE_DIFFS  = 0x0100, // only save modified from default values
                                     // removing ones that are default

    STE_CONFIG_SAVE_ALWAYS = 0x0200, // always save the config
                                     // on pref dialog close, frame close...
                                     // you may want to remove the menu item
                                     //   ID_STE_SAVE_PREFERENCES

    STE_CONFIG_DEFAULT_OPTIONS = STF_CONFIG|STE_CONFIG_FILEHISTORY|STE_CONFIG_FINDREPLACE|STE_CONFIG_PREFS|STE_CONFIG_STYLES|STE_CONFIG_LANGS
};

enum STE_FindReplaceOptionsType // same as STEFindReplaceDialogStyles
{
    //STE_FR_REPLACEDIALOG = 0x001, // makes no sense as an option here

    //STE_FR_NOUPDOWN      = 0x002, //wxFR_NOUPDOWN      = 2, don't allow changing the search direction
    //STE_FR_NOMATCHCASE   = 0x004, //wxFR_NOMATCHCASE   = 4, don't allow case sensitive searching
    //STE_FR_NOWHOLEWORD   = 0x008, //wxFR_NOWHOLEWORD   = 8, don't allow whole word searching
    //STE_FR_NOWORDSTART   = 0x010, // don't allow word start searching
    //STE_FR_NOWRAPAROUND  = 0x020, // don't allow wrapping around
    //STE_FR_NOREGEX       = 0x040, // don't allow regex searching
    //STE_FR_NOALLDOCS     = 0x080  // don't allow search all docs option
                                   //    (for not having editor notebook)

    STE_FR_DEFAULT_OPTIONS = 0
};

//-----------------------------------------------------------------------------
// wxSTEditorOptions - ref counted options for the
//   wxSTEditor/Splitter/Notebook/Frame
//
// These options are passed and refed from parent to child. For example if you
// start with a frame and notebook the notebook->splitter->editor(s) share them.
// If you start with a splitter then the splitter shares them with editor(s).
//
// This is done so that you set one of these up and pass it to the frame/notebook
// splitter/editor and it tries to do as much as possible for you.
//
// For a wxSTEditorFrame you set the options with CreateOptions just after
// creation.
//
// The default filenames/paths are updated so that when you load/save a file
// the next time you load/save you'll go back to the same dir.
//
// If you don't want an Option - set it to 0, don't want prefs/styles/langs
// set with wxSTEditorPrefs/Styles/Langs(false) for an uncreated version,
// and for no menu manager set it to NULL. Remember that this class is refed so
// that if you change it for one editor it changes for all the others too. To
// "detach" an editor use SetOptions(some other options).
//
// The styles can be accessed using enum STE_OptionType for the predefined
//   options or you can use named options.
//
// Note: The prefs/styles/langs are ref counted so this class is not very big.
//-----------------------------------------------------------------------------

// A default filename to use wxT("untitled.txt"), change this if you want
WXDLLIMPEXP_DATA_STEDIT(extern wxString) STE_DefaultFileName;
// A default set of file extensions to use - change this if you want
// wxT("Any file (*)|*|") wxT("Text file (*.txt)|*.txt|")
// wxT("C/C++ file (*.c;*.cpp;*.cxx)|*.c;*.cpp;*.cxx|")
// wxT("H file (*.h)|*.h|") wxT("Html file (*.htm;*.html)|*.htm;*.html|")
// wxT("Lua file (*.lua)|*.lua|") wxT("Python file (*.py)|*.py"))
WXDLLIMPEXP_DATA_STEDIT(extern wxString) STE_DefaultFileExtensions;

class WXDLLIMPEXP_STEDIT wxSTEditorOptions : public wxObject
{
public:
    // Default with nothing set at all
    wxSTEditorOptions();

    // Everything setup, new menu manager and global prefs/styles/langs.
    //   globals refed from wxSTEditor::GetGlobalEditorPrefs/Styles/Langs
    wxSTEditorOptions( long editor_opt, //   = STE_DEFAULT_OPTIONS,
                       long splitter_opt = STS_DEFAULT_OPTIONS,
                       long notebook_opt = STN_DEFAULT_OPTIONS,
                       long frame_opt    = STF_DEFAULT_OPTIONS,
                       long config_opt   = STE_CONFIG_DEFAULT_OPTIONS,
                       const wxString& defaultFileName = GetGlobalDefaultFileName(),
                       const wxString& defaultFilePath = wxEmptyString,
                       const wxString& defaultFileExt  = GetGlobalDefaultExtensions() );

    // -----------------------------------------------------------------------
    // Get/Set/Has option values (option is enum STE_OptionType)

    size_t GetOptionCount() const;

    wxString GetOption(size_t option_n) const;
    int      GetOptionInt(size_t option_n) const { long n = 0; GetOption(option_n).ToLong(&n); return int(n); }
    bool     HasOptionIntFlag(size_t option_n, int flag) const { return STE_HASBIT(GetOptionInt(option_n), flag); }
    bool     GetOptionBool(size_t option_n) const  { return GetOptionInt(option_n) != 0; }

    void SetOption(size_t option_n, const wxString& value);
    void SetOptionInt(size_t option_n, int value) { SetOption(option_n, wxString::Format(wxT("%d"), value)); }
    void SetOptionIntFlag(size_t option_n, int flag, bool set) { SetOptionInt(option_n, STE_SETBIT(GetOptionInt(option_n), flag, set)); }
    void SetOptionBool(size_t option_n, bool value) { SetOptionInt(option_n, value ? 1 : 0); }

    // The options can also be accessed using named values
    //   The original values are the names of the enum STE_OptionType names
    wxString GetOptionName(size_t option_n) const;
    void SetOptionName(size_t option_n, const wxString& name);
    int FindOptionByName(const wxString& name) const;
    bool HasNamedOption(const wxString& name) const { return FindOptionByName(name) != wxNOT_FOUND; }

    // Add a new option with a given name, returning the index
    //  The name is useful when your derived class wants to store values,
    //    but you cannot be sure if the option may be set or what index
    //    it'll have.
    size_t AddOption(const wxString& name, const wxString& value);

    // -----------------------------------------------------------------------
    // Get/Set/Has integer option flags

    int GetEditorOptions() const   { return GetOptionInt(STE_OPTION_EDITOR); }   // STE_EditorOptionsType
    int GetSplitterOptions() const { return GetOptionInt(STE_OPTION_SPLITTER); } // STE_SplitterOptionsType
    int GetNotebookOptions() const { return GetOptionInt(STE_OPTION_NOTEBOOK); } // STE_NotebookOptionsType
    int GetFrameOptions() const    { return GetOptionInt(STE_OPTION_FRAME); }    // STE_FrameOptionsType
    int GetConfigOptions() const   { return GetOptionInt(STE_OPTION_CONFIG); }   // STE_ConfigOptionsType

    bool HasEditorOption(  int opt) const { return STE_HASBIT(opt, GetEditorOptions()); }
    bool HasSplitterOption(int opt) const { return STE_HASBIT(opt, GetSplitterOptions()); }
    bool HasNotebookOption(int opt) const { return STE_HASBIT(opt, GetNotebookOptions()); }
    bool HasFrameOption(   int opt) const { return STE_HASBIT(opt, GetFrameOptions()); }
    bool HasConfigOption(  int opt) const { return STE_HASBIT(opt, GetFrameOptions()); }

    void SetEditorOption(   int opt, bool val ) { SetEditorOptions(STE_SETBIT(GetEditorOptions(), opt, val)); }
    void SetSplitterOption( int opt, bool val ) { SetSplitterOptions(STE_SETBIT(GetSplitterOptions(), opt, val)); }
    void SetNotebookOption( int opt, bool val ) { SetNotebookOptions(STE_SETBIT(GetNotebookOptions(), opt, val)); }
    void SetFrameOption(    int opt, bool val ) { SetFrameOptions(STE_SETBIT(GetFrameOptions(), opt, val)); }
    void SetConfigOption(   int opt, bool val ) { SetConfigOptions(STE_SETBIT(GetConfigOptions(), opt, val)); }

    void SetEditorOptions(   int editOptions )     { SetOptionInt(STE_OPTION_EDITOR, editOptions); }       // STE_EditorOptionsType
    void SetSplitterOptions( int splitterOptions ) { SetOptionInt(STE_OPTION_SPLITTER, splitterOptions); } // STE_SplitterOptionsType
    void SetNotebookOptions( int notebookOptions ) { SetOptionInt(STE_OPTION_NOTEBOOK, notebookOptions); } // STE_NotebookOptionsType
    void SetFrameOptions(    int frameOptions )    { SetOptionInt(STE_OPTION_FRAME, frameOptions); }       // STE_FrameOptionsType
    void SetConfigOptions(   int configOptions )   { SetOptionInt(STE_OPTION_CONFIG, configOptions); }     // STE_ConfigOptionsType

    // -----------------------------------------------------------------------
    // The default filename to use when creating a new editor
    wxString GetDefaultFileName() const { return GetOption(STE_OPTION_DEFAULT_FILENAME); }
    // The default and (updated by filedialog) last path for the the load/save dialog
    wxString GetDefaultFilePath() const { return GetOption(STE_OPTION_DEFAULT_FILEPATH); }
    // The default extensions to use in the load/save dialog
    wxString GetDefaultFileExtensions() const { return GetOption(STE_OPTION_DEFAULT_FILEEXTS); }

    void SetDefaultFileName( const wxString& fileName ) { SetOption(STE_OPTION_DEFAULT_FILENAME, fileName); }
    void SetDefaultFilePath( const wxString& filePath ) { SetOption(STE_OPTION_DEFAULT_FILEPATH, filePath); }
    void SetDefaultFileExtensions( const wxString& fileExt ) { SetOption(STE_OPTION_DEFAULT_FILEEXTS, fileExt); }

    // -----------------------------------------------------------------------
    // Get the prefs/styles/langs to use in the editors (may be !Ok())
    wxSTEditorPrefs&  GetEditorPrefs() const;
    wxSTEditorStyles& GetEditorStyles() const;
    wxSTEditorLangs&  GetEditorLangs() const;

    // Set the prefs/styles/langs to use in the editors (may be !Ok())
    void SetEditorPrefs(const wxSTEditorPrefs& prefs);
    void SetEditorStyles(const wxSTEditorStyles& styles);
    void SetEditorLangs(const wxSTEditorLangs& langs);

    // Ref the global prefs/styles/langs see wxSTEditor::GetGlobalEditorXXX
    void SetUseGlobalPrefsStylesLangs();

    // -----------------------------------------------------------------------
    // Get/Set the find/replace data to use, by default use the global version
    wxSTEditorFindReplaceData* GetFindReplaceData() const;
    // Set a "new" find/replace data to use, if !is_static it'll be deleted, NULL for none
    void SetFindReplaceData(wxSTEditorFindReplaceData* frData, bool is_static);

    // -----------------------------------------------------------------------
    // Get the menu manager used to create the menu's (may be NULL)
    wxSTEditorMenuManager* GetMenuManager() const;
    // Set a "new" menu manager to use, if !is_static it'll be deleted, NULL for none
    void SetMenuManager(wxSTEditorMenuManager* steMM, bool is_static);

    // -----------------------------------------------------------------------
    // Get the wxFileHistory that stores recently opened files (may be NULL)
    wxFileHistory* GetFileHistory() const;
    // Set a "new" wxFileHistory to use, if !is_static it'll be deleted, NULL for none
    void SetFileHistory(wxFileHistory* fileHistory, bool is_static);

    // -----------------------------------------------------------------------
    // Get the wxMenuBar to be updated (or NULL for none)
    wxMenuBar* GetMenuBar() const;
    // Get the toolbar to be updated (or NULL for none)
    wxToolBar* GetToolBar() const;
    // Get the statusbar to be updated (or NULL for none)
    wxStatusBar* GetStatusBar() const;
    // Get the menu to popup in the editor(s), may be null for none
    wxMenu* GetEditorPopupMenu() const;
    // Get the menu to popup on the splitter(s) sash, may be null for none
    wxMenu* GetSplitterPopupMenu() const;
    // Get the menu to popup on the notebook tabs, maybe be null for none
    wxMenu* GetNotebookPopupMenu() const;

    // Set a menubar and toolbar to be updated as necessary (won't be deleted)
    void SetMenuBar(wxMenuBar* menuBar);
    void SetToolBar(wxToolBar* toolBar);
    void SetStatusBar(wxStatusBar* statusBar);
    // Set a "new" wxMenu to use as a popup menu, it'll be deleted if !is_static
    void SetEditorPopupMenu(wxMenu* menu, bool is_static);
    void SetSplitterPopupMenu(wxMenu* menu, bool is_static);
    void SetNotebookPopupMenu(wxMenu* menu, bool is_static);

    //-------------------------------------------------------------------------
    // Get/Set the ClientData in the ref data - see wxClientDataContainer
    //  You can store any extra info here, don't forget to delete void data.

    void SetClientObject( wxClientData *data );
    wxClientData *GetClientObject() const;

    void SetClientData( void *data );
    void *GetClientData() const;

    // -----------------------------------------------------------------------
    // Global settings, these are values that this class will be initialized with
    static wxString GetGlobalDefaultFileName() { return STE_DefaultFileName; }
    static void SetGlobalDefaultFileName(const wxString& fileName) { STE_DefaultFileName = fileName; }

    static wxString GetGlobalDefaultExtensions() { return STE_DefaultFileExtensions; }
    static void SetGlobalDefaultFileExtensions(const wxString& fileExt) { STE_DefaultFileExtensions = fileExt; }

    // -----------------------------------------------------------------------
    // Load/Save the config for the prefs/styles/langs, see CFGPATH options

    // Get the full path of the path_option_n STE_OPTION_CFGPATH_XXX where the
    //  full path is the basePath + optionPath.
    wxString GetConfigPath(size_t path_option_n) const;

    // Add or remove the trailing '/' use this liberally since sometimes you
    //  will want the trailing '/' sometimes not, just run this to be sure.
    static wxString FixConfigPath(const wxString& path, bool add_sep);

    void LoadConfig(wxConfigBase &config);
    void SaveConfig(wxConfigBase &config);

    // Load/Save the wxFileHistory files (recently opened files)
    void LoadFileConfig(wxConfigBase &config);
    void SaveFileConfig(wxConfigBase &config);

    // -----------------------------------------------------------------------
    // operators
    wxSTEditorOptions& operator = (const wxSTEditorOptions& steOpts)
    {
        if ( (*this) != steOpts )
            Ref(steOpts);
        return *this;
    }

    bool operator == (const wxSTEditorOptions& steOpts) const
        { return m_refData == steOpts.m_refData; }
    bool operator != (const wxSTEditorOptions& steOpts) const
        { return m_refData != steOpts.m_refData; }
};

#endif  // _STEOPTS_H_

