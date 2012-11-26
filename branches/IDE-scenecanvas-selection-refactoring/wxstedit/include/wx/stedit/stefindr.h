///////////////////////////////////////////////////////////////////////////////
// Name:        stefindr.h
// Purpose:     wxSTEditorFindReplaceData
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEFINDR_H_
#define _STEFINDR_H_

#include "wx/fdrepdlg.h"

#include "wx/stedit/stedefs.h"

class WXDLLEXPORT wxConfigBase;

//-----------------------------------------------------------------------------
// Static functions for prepending strings to wxArrayString and wxComboBoxes
//-----------------------------------------------------------------------------

// add a string to the array at the top and remove any to keep the count
//  if count <= 0 then don't remove any
void wxSTEPrependArrayString(const wxString &str, wxArrayString &strArray, int count);

// Prepend a string to a wxComboBox, removing any copies of it appearing after
//   if max_strings > 0 then ensure that there are only max_strings in the combo
void wxSTEPrependComboBoxString(const wxString &str, int max_strings, wxComboBox *combo);

// Initialize the combo to have these strings and select first
void wxSTEInitComboBoxStrings(const wxArrayString& values, wxComboBox* combo);

//-----------------------------------------------------------------------------
// wxSTEditorFindReplaceData - extended find/replace data class
//-----------------------------------------------------------------------------
enum STEFindReplaceFlags
{
    STE_FR_DOWN          = 0x001, // wxFR_DOWN       = 1,
    STE_FR_WHOLEWORD     = 0x002, // wxFR_WHOLEWORD  = 2,
    STE_FR_MATCHCASE     = 0x004, // wxFR_MATCHCASE  = 4

    STE_FR_WORDSTART     = 0x010, // find if string is whole or start of word
    STE_FR_WRAPAROUND    = 0x020, // wrap around the doc if not found
    STE_FR_REGEXP        = 0x040, // use wxSTC regexp
    STE_FR_POSIX         = 0x080, // use wxSTC regexp posix () not \(\) to tagged
    STE_FR_FINDALL       = 0x100, // Find all occurances in document
    STE_FR_BOOKMARKALL   = 0x200, // Bookmark all occurances in document
    // Choose only one of these
    STE_FR_WHOLEDOC      = 0x1000, // search the whole doc starting from top
    STE_FR_FROMCURSOR    = 0x2000, // search starting at cursor
    STE_FR_ALLDOCS       = 0x4000, // for notebook, starts at current page and goes forward

    STE_FR_SEARCH_MASK   = (STE_FR_WHOLEDOC|STE_FR_FROMCURSOR|STE_FR_ALLDOCS)
};

// these flags can be specified in wxFindReplaceDialog ctor or Create()
enum STEFindReplaceDialogStyles
{
    STE_FR_REPLACEDIALOG = 0x001, //wxFR_REPLACEDIALOG = 1, replace dialog (otherwise find dialog)
    STE_FR_NOUPDOWN      = 0x002, //wxFR_NOUPDOWN      = 2, don't allow changing the search direction
    STE_FR_NOMATCHCASE   = 0x004, //wxFR_NOMATCHCASE   = 4, don't allow case sensitive searching
    STE_FR_NOWHOLEWORD   = 0x008, //wxFR_NOWHOLEWORD   = 8, don't allow whole word searching
    STE_FR_NOWORDSTART   = 0x010, // don't allow word start searching
    STE_FR_NOWRAPAROUND  = 0x020, // don't allow wrapping around
    STE_FR_NOREGEXP      = 0x040, // don't allow regexp searching
    STE_FR_NOALLDOCS     = 0x080  // don't allow search all docs option
                                 //    (for not having editor notebook)
};

class WXDLLIMPEXP_STEDIT wxSTEditorFindReplaceData : public wxFindReplaceData
{
public:
    wxSTEditorFindReplaceData(wxUint32 flags=wxFR_DOWN|STE_FR_WRAPAROUND)
               : wxFindReplaceData(), m_max_strings(10), m_loaded_config(false),
                 m_dialogSize(wxDefaultSize)
        { SetFlags(flags); }

    virtual ~wxSTEditorFindReplaceData() {}

    // These are in wxFindReplaceData
    //int GetFlags() const
    //void SetFlags(wxUint32 flags)
    //const wxString& GetFindString() { return m_FindWhat; }
    //const wxString& GetReplaceString() { return m_ReplaceWith; }
    //void SetFindString(const wxString& str) { m_FindWhat = str; }
    //void SetReplaceString(const wxString& str) { m_ReplaceWith = str; }

    bool HasFlag(int flag) const { return (GetFlags() & flag) != 0; }

    // Convert the STE flags to Scintilla flags and back
    static int STEToScintillaFlags(int ste_flags);
    static int ScintillaToSTEFlags(int sci_flags);

    // Add find/replace strings at top of list removing old ones if > GetMaxStrings
    void AddFindString(const wxString& str) { wxSTEPrependArrayString(str, m_findStrings, m_max_strings); }
    void AddReplaceString(const wxString& str) { wxSTEPrependArrayString(str, m_replaceStrings, m_max_strings); }

    wxArrayString* GetFindStrings()    { return &m_findStrings; }
    wxArrayString* GetReplaceStrings() { return &m_replaceStrings; }

    // Get/Set max number of search strings to save
    int GetMaxStrings() const { return m_max_strings; }
    void SetMaxStrings(int count) { m_max_strings = count; }

    // Get the find all strings, set from a previous call to find all
    //   format is "%ld|%s|%d|line text", &editor, filename, line#, text
    wxArrayString* GetFindAllStrings() { return &m_findAllStrings; }

    // compare the strings with flags = -1 for internal flags or use own flags
    // only compares the strings with or without case, returns true if the same
    bool StringCmp(const wxString& a, const wxString& b, int flags = -1) const
    {
        if (flags == -1) flags = GetFlags();
        return ((flags & wxFR_MATCHCASE) != 0) ? (a.Cmp(b) == 0) : (a.CmpNoCase(b) == 0);
    }

    // Get/Set the size of the dialog. This size is only set if the user
    //   expands it, otherwise it's equal to wxDefaultSize.
    //   Also, it does not size the current dialog and only sets the size
    //   of the dialog when first created.
    wxSize GetDialogSize() const { return m_dialogSize; }
    void SetDialogSize(const wxSize& size) { m_dialogSize = size; }

    // Load/Save config for find flags
    //   See also wxSTEditorOptions for paths and internal saving config.
    bool LoadConfig(wxConfigBase &config,
                    const wxString &configPath = wxT("/wxSTEditor/FindReplace/"));
    void SaveConfig(wxConfigBase &config,
                    const wxString &configPath = wxT("/wxSTEditor/FindReplace/")) const;

    // HasLoadedConfig returns true after calling LoadConfig
    bool HasLoadedConfig() const { return m_loaded_config; }
    void SetLoadedConfig(bool loaded) { m_loaded_config = loaded; }

protected:
    int m_max_strings;
    bool m_loaded_config;
    wxArrayString m_findStrings;
    wxArrayString m_replaceStrings;
    wxArrayString m_findAllStrings;
    wxSize        m_dialogSize;
};

// all editors share the same find/replace data
WXDLLIMPEXP_DATA_STEDIT(extern wxSTEditorFindReplaceData) s_wxSTEditor_FindData;

//-----------------------------------------------------------------------------
// wxSTEditorFindReplacePanel - enhanced wxFindReplaceDialog panel
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorFindReplacePanel : public wxPanel
{
public:
    wxSTEditorFindReplacePanel() : wxPanel() { Init(); }

    wxSTEditorFindReplacePanel(wxWindow *parent, wxWindowID winid,
                               wxSTEditorFindReplaceData *data,
                               const wxPoint& pos = wxDefaultPosition,
                               const wxSize& size = wxDefaultSize,
                               long style = wxTAB_TRAVERSAL | wxNO_BORDER,
                               const wxString& name = wxT("wxSTEditorFindReplacePanel"))
    {
        Init();
        (void)Create(parent, winid, data, pos, size, style, name);
    }

    bool Create(wxWindow *parent, wxWindowID winid,
                wxSTEditorFindReplaceData *data,
                const wxPoint& pos = wxDefaultPosition,
                const wxSize& size = wxDefaultSize,
                long style = wxTAB_TRAVERSAL | wxNO_BORDER,
                const wxString& name = wxT("wxSTEditorFindReplacePanel"));

    virtual ~wxSTEditorFindReplacePanel();

    // find dialog data access, data should never be NULL
    wxSTEditorFindReplaceData *GetData() { return m_findReplaceData; }
    void  SetData(wxSTEditorFindReplaceData *data);

    // Set the window to send the events to, if NULL then send to the parent
    wxWindow* GetTargetWindow() const;
    void SetTargetWindow( wxWindow* win ) { m_targetWin = win; }

    // Try to get an editor for this dialog. It uses the target window and
    //   checks if it is a wxSTEditor, wxSTEditorSplitter, wxSTEditorNotebook
    //   and gets their editor
    wxSTEditor* GetEditor() const;

    // implementation
    void UpdateButtons();            // enable/disable buttons as appropriate
    void SelectFindString();         // select the find string in the combo
    int  GetFindFlags() const { return m_flags; }
    void UpdateFindFlags();

    // -----------------------------------------------------------------------
    // implementation
    void SendEvent(const wxEventType& evtType);
    void Send(wxFindDialogEvent& event);

    void OnButton(wxCommandEvent& event);
    void OnMenu(wxCommandEvent& event);
    void OnFindComboText(wxCommandEvent &event);
    void OnCheckBox(wxCommandEvent &event);
    void OnMarginClick(wxStyledTextEvent &event);
    void OnActivate(wxActivateEvent &event);
    void OnCloseWindow(wxCloseEvent& event);
    void OnIdle(wxIdleEvent& event);

//protected:
    wxSTEditorFindReplaceData *m_findReplaceData;

    wxWindow *m_targetWin;

    int m_flags;
    wxString m_lastSearch;

    int m_find_insert_pos;
    int m_replace_insert_pos;

    wxComboBox *m_findCombo;
    wxComboBox *m_replaceCombo;

    wxCheckBox *m_wholewordCheckBox;
    wxCheckBox *m_matchcaseCheckBox;
    wxCheckBox *m_backwardsCheckBox;
    wxCheckBox *m_wordstartCheckBox;
    wxCheckBox *m_regexpFindCheckBox;
    wxCheckBox *m_wraparoundCheckBox;
    wxCheckBox *m_findallCheckBox;
    wxCheckBox *m_bookmarkallCheckBox;

    wxRadioButton *m_scopewholeRadioButton;
    wxRadioButton *m_scopecursorRadioButton;
    wxRadioButton *m_scopealldocsRadioButton;

    wxButton *m_findButton;
    wxButton *m_replaceButton;
    wxButton *m_replaceFindButton;
    wxButton *m_replaceAllButton;

    wxMenu   *m_insertMenu;

    wxSTEditor *m_resultEditor;

private:
    void Init();
    DECLARE_DYNAMIC_CLASS(wxSTEditorFindReplacePanel)
    DECLARE_EVENT_TABLE()
};

//-----------------------------------------------------------------------------
// wxSTEditorFindReplaceDialog - enhanced wxFindReplaceDialog
//-----------------------------------------------------------------------------
#include "wx/minifram.h"

WXDLLIMPEXP_DATA_STEDIT(extern const wxString) wxSTEditorFindReplaceDialogNameStr;

class WXDLLIMPEXP_STEDIT wxSTEditorFindReplaceDialog : public wxDialog
{
public:
    wxSTEditorFindReplaceDialog() : wxDialog() { Init(); }

    wxSTEditorFindReplaceDialog( wxWindow *parent,
                                 wxSTEditorFindReplaceData *data,
                                 const wxString& title,
                                 int style = 0,
                                 const wxString &name = wxSTEditorFindReplaceDialogNameStr)
    {
        Init();
        (void)Create(parent, data, title, style, name);
    }

    bool Create( wxWindow *parent,
                 wxSTEditorFindReplaceData *data,
                 const wxString& title,
                 int style = 0,
                 const wxString &name = wxSTEditorFindReplaceDialogNameStr );

    virtual ~wxSTEditorFindReplaceDialog();

    // Get/Set values for this dialog
    wxSTEditorFindReplacePanel* GetFindReplacePanel() const { return m_findReplacePanel; }

    // -----------------------------------------------------------------------
    // implementation
    void OnButton(wxCommandEvent& event);
    void OnSize(wxSizeEvent &event);
    void OnActivate(wxActivateEvent &event);
    void OnCloseWindow(wxCloseEvent& event);

protected:
    wxSTEditorFindReplacePanel *m_findReplacePanel;

private:
    void Init();
    DECLARE_DYNAMIC_CLASS(wxSTEditorFindReplaceDialog)
    DECLARE_EVENT_TABLE()
};

#endif  // _STEFINDR_H_

