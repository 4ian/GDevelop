///////////////////////////////////////////////////////////////////////////////
// File:        stedlgs.h
// Purpose:     Preferences dialog
// Maintainer:
// Created:     2003-04-28
// RCS-ID:      $Id: stedlgs.h,v 1.25 2007/02/15 02:20:41 jrl1 Exp $
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEDLGS_H_
#define _STEDLGS_H_

#include "wx/stedit/stedefs.h"
#include "wx/stedit/stedit.h"
#include <wx/wx.h>
#include <wx/colourdata.h>

class WXDLLEXPORT wxComboBox;
class WXDLLEXPORT wxSpinCtrl;
class WXDLLEXPORT wxSpinEvent;
class WXDLLEXPORT wxNotebook;
class WXDLLEXPORT wxNotebookEvent;

class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialog;

//-----------------------------------------------------------------------------
// wxSTEditorPrefPageData - data shared by multiple pages shown at once
//
// You should create this and send it to all the pages you create.
//  (see how the wxSTEditorPrefDialog handles it)
//-----------------------------------------------------------------------------

// What pages to show in the wxSTEditorPrefDialog
enum STE_PrefPageTypes
{
    STE_PREF_PAGE_SHOW_VIEW      = 0x0001, // view preferences
    STE_PREF_PAGE_SHOW_TABSEOL   = 0x0002, // tabs and eol preferences
    STE_PREF_PAGE_SHOW_FOLDWRAP  = 0x0004, // folding and wrapping preferences
    STE_PREF_PAGE_SHOW_PRINT     = 0x0008, // printing preferences
    STE_PREF_PAGE_SHOW_LOADSAVE  = 0x0010, // loading and saving preferences
    STE_PREF_PAGE_SHOW_HIGHLIGHT = 0x0020, // highlighting preferences
    STE_PREF_PAGE_SHOW_STYLES    = 0x0040, // styles colouring
    STE_PREF_PAGE_SHOW_LANGS     = 0x0080, // language selection

    STE_PREF_PAGE_SHOW_ALL       = 0x00FF
};

// Internal use ref data for the wxSTEditorPrefPageData (always created)
class WXDLLIMPEXP_STEDIT wxSTEditorPrefPageData_RefData : public wxObjectRefData
{
public:
    wxSTEditorPrefPageData_RefData() : m_languageId(0), m_editor(NULL), m_options(0) {}
    wxSTEditorPrefs  m_prefs;
    wxSTEditorStyles m_styles;
    wxSTEditorLangs  m_langs;
    int m_languageId;
    wxSTEditor* m_editor;
    int m_options;
};

class WXDLLIMPEXP_STEDIT wxSTEditorPrefPageData : public wxObject
{
public:
    wxSTEditorPrefPageData();
    wxSTEditorPrefPageData(const wxSTEditorPrefPageData& prefData)
        { Ref(prefData); }
    wxSTEditorPrefPageData(const wxSTEditorPrefs& prefs,
                           const wxSTEditorStyles& styles,
                           const wxSTEditorLangs& langs,
                           int m_languageId,
                           wxSTEditor* editor,
                           int options = STE_PREF_PAGE_SHOW_ALL);

    wxSTEditorPrefs&  GetPrefs() const;
    wxSTEditorStyles& GetStyles() const;
    wxSTEditorLangs&  GetLangs() const;

    // The language selection for the "current" editor
    int GetLanguageId() const;
    void SetLanguageId(int lang_id);
    // Get/Set the "current" editor to update the languange selection for
    wxSTEditor* GetEditor() const;
    void SetEditor(wxSTEditor* editor);
    // Get the options this was created with, enum STE_PrefPageTypes
    int  GetOptions() const;
    bool HasOption(int option) const { return (GetOptions() & option) != 0; }
    void SetOptions(int options);

    // operators
    wxSTEditorPrefPageData& operator = (const wxSTEditorPrefPageData& other)
    {
        if ( (*this) != other )
            Ref(other);
        return *this;
    }

    bool operator == (const wxSTEditorPrefPageData& other) const
        { return m_refData == other.m_refData; }
    bool operator != (const wxSTEditorPrefPageData& other) const
        { return m_refData != other.m_refData; }
};

//-----------------------------------------------------------------------------
// wxSTEditorPrefDialogPageBase - base class for prefs/styles/langs pages
//
// It has some generic functions that map from Ok, Apply, Reset buttons
// The data to be manipulated is GetPrefData(), the original is GetEditorPrefData()
// When Apply is called, the GetPrefData is pushed into the GetEditorPrefData
//-----------------------------------------------------------------------------
class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialogPageBase : public wxPanel
{
public:
    wxSTEditorPrefDialogPageBase( const wxSTEditorPrefPageData& editorPrefData,
                                  const wxSTEditorPrefPageData& prefData,
                                  wxWindow *parent,
                                  wxWindowID winid = wxID_ANY )
                            : wxPanel(parent, winid),
                              m_editorPrefData(editorPrefData),
                              m_prefData(prefData) {}

    virtual ~wxSTEditorPrefDialogPageBase() {}

    virtual void GetControlValues() = 0; // set pref values from GUI values
    virtual void SetControlValues() = 0; // set GUI values from pref values
    virtual void Apply() = 0;            // apply values from GUI to prefs
    virtual void Reset() = 0;            // reset GUI values to pref defaults

    virtual bool IsModified() { return true; } // is it currently modified

    // Get the pref data that will be modified by the GUI
    wxSTEditorPrefPageData GetPrefData() const { return m_prefData; }
    // Get the original pref data that was used to init with
    //   Typically when Apply is called, the GetPrefData() is pushed onto the
    //   GetEditorPrefData() setting the values for the editor.
    wxSTEditorPrefPageData GetEditorPrefData() const { return m_editorPrefData; }

    // implementation
    void OnApply(wxCommandEvent& ) { Apply(); } // wxID_APPLY, wxID_OK
    void OnReset(wxCommandEvent& ) { Reset(); } // wxID_RESET

protected:
    wxSTEditorPrefPageData m_editorPrefData;
    wxSTEditorPrefPageData m_prefData;

private:
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrefDialogPageBase);
    DECLARE_EVENT_TABLE();
};

//----------------------------------------------------------------------------
// wxSTEditorPrefDialogPagePrefs - blank page that maps control types
//  to enum STE_PrefType.
//  GetValue/SetValue is called on the control after determining type.
//  wxCheckBox = bool, wxSpinCtrl = int, wxComboBox/wxChoice/wxListBox = int
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialogPagePrefs : public wxSTEditorPrefDialogPageBase
{
public:
    wxSTEditorPrefDialogPagePrefs( const wxSTEditorPrefPageData& editorPrefData,
                                   const wxSTEditorPrefPageData& prefData,
                                   wxWindow *parent,
                                   wxWindowID winid = wxID_ANY );

    virtual ~wxSTEditorPrefDialogPagePrefs() {}

    virtual void GetControlValues();
    virtual void SetControlValues();
    virtual void Apply();
    virtual void Reset();
    virtual bool IsModified();

    // -----------------------------------------------------------------------
    // implementation
    wxArrayInt m_prefsToIds; // map GUI window IDs to enum STE_PrefType

private:
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrefDialogPagePrefs);
    DECLARE_EVENT_TABLE();
};

//----------------------------------------------------------------------------
// wxSTEditorPrefDialogPageStyles - adjust all the styles, including gui
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialogPageStyles : public wxSTEditorPrefDialogPageBase
{
public:
    wxSTEditorPrefDialogPageStyles( const wxSTEditorPrefPageData& editorPrefData,
                                    const wxSTEditorPrefPageData& prefData,
                                    wxWindow *parent,
                                    wxWindowID winid = wxID_ANY );

    virtual ~wxSTEditorPrefDialogPageStyles();

    virtual void GetControlValues();
    virtual void SetControlValues();
    virtual void Apply();
    virtual void Reset();
    virtual bool IsModified();

    // -----------------------------------------------------------------------
    // implementation
    void FillStyleEditor(wxSTEditor* editor);
    void SetupEditor(wxSTEditor* editor);
    void UpdateEditor(wxSTEditor* editor, wxArrayInt& lineArray);
    void OnEvent(wxCommandEvent &event);
    void OnSpinEvent(wxSpinEvent &event);
    void OnPageChanged(wxNotebookEvent &event);
    void OnMarginClick(wxStyledTextEvent &event);

    wxArrayInt m_styleArray;
    wxSTERecursionGuardFlag m_rGuard_setting_style;
    int m_style_max_len;
    int m_current_style;
    int m_last_language_ID;
    wxColourData *m_colourData;

    wxNotebook *m_styleNotebook;
    wxSTEditor *m_colourEditor;
    wxSTEditor *m_styleEditor;
    wxSTEditor *m_helpEditor;
    int m_colour_editor_marker_handle;
    int m_style_editor_marker_handle;
    wxArrayInt m_colourLineArray;
    wxArrayInt m_styleLineArray;

    wxChoice *m_langChoice;

    wxCheckBox *m_fontCheckBox;
        wxButton *m_fontButton;
        wxChoice *m_fontChoice;
    wxCheckBox *m_fontSizeCheckBox;
        wxSpinCtrl *m_fontSizeSpin;
    wxCheckBox *m_attribCheckBox;
        wxCheckBox *m_boldCheckBox;
        wxCheckBox *m_italicsCheckBox;
        wxCheckBox *m_underlineCheckBox;
        wxCheckBox *m_eolFillCheckBox;
    wxCheckBox *m_fontForeCheckBox;
        wxButton *m_fontForeButton;
    wxCheckBox *m_fontBackCheckBox;
        wxButton *m_fontBackButton;

    static wxString sm_helpString; // the text to show in the help editor

private:
    void Init();
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrefDialogPageStyles);
    DECLARE_EVENT_TABLE();
};

//----------------------------------------------------------------------------
// wxSTEditorPrefDialogPageLangs - show user languages
//----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialogPageLangs : public wxSTEditorPrefDialogPageBase
{
public:
    wxSTEditorPrefDialogPageLangs( const wxSTEditorPrefPageData& editorPrefData,
                                   const wxSTEditorPrefPageData& prefData,
                                   wxWindow *parent,
                                   wxWindowID winid = wxID_ANY );

    virtual ~wxSTEditorPrefDialogPageLangs() {}

    virtual void GetControlValues();
    virtual void SetControlValues();
    virtual void Apply();
    virtual void Reset();
    virtual bool IsModified();

    // -----------------------------------------------------------------------
    // implementation
    void OnChoice(wxCommandEvent &event);
    void OnMarginClick(wxStyledTextEvent &event);
    void SetStylesChoice();
    void SetKeywordTextCtrl();

    wxChoice*         m_languageChoice;
    wxTextCtrl*       m_filepatternTextCtrl;
    wxNotebook*       m_notebook;
    wxChoice*         m_styleChoice;
    wxSTEditor*       m_styleEditor;
    wxChoice*         m_keywordsChoice;
    wxTextCtrl*       m_keywordsTextCtrl;
    wxTextCtrl*       m_userKeywordsTextCtrl;
    wxSTEditor*       m_helpEditor;

    int               m_style_editor_marker_handle;
    int               m_current_lang;
    int               m_current_style_n;
    int               m_keyword_n;
    int               m_max_stylename_length;
    wxArrayInt        m_usedLangs;

    static wxString sm_helpString; // the text to show in the help editor

private:
    void Init();
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrefDialogPageLangs);
    DECLARE_EVENT_TABLE();
};

//-----------------------------------------------------------------------------
// wxSTEditorPrefDialog
//
// A dialog to show notebook pages for the prefs, styles, langs. They can be
// !Ok which will not make that page shown, but at least one must be valid.
//
// If the parent is derived from a wxSTEditor then you can change the
// language of the editor.
// The Apply/Ok button updates all editors attached to the prefs/styles/langs.
//-----------------------------------------------------------------------------
class WXDLLIMPEXP_STEDIT wxSTEditorPrefDialog : public wxDialog
{
public:
    wxSTEditorPrefDialog() : wxDialog() { Init(); }
    wxSTEditorPrefDialog( const wxSTEditorPrefPageData& editorPrefData,
                          wxWindow *parent, wxWindowID win_id,
                          const wxString& title = _("Editor Preferences"),
                          long style = wxDEFAULT_DIALOG_STYLE,
                          const wxString& name = wxT("wxSTEditorPrefDialog")) : wxDialog()
    {
        Init();
        Create(editorPrefData, parent, win_id, title, style, name);
    }
    bool Create( const wxSTEditorPrefPageData& editorPrefData,
                 wxWindow *parent, wxWindowID win_id = wxID_ANY,
                 const wxString& title = _("Editor Preferences"),
                 long style = wxDEFAULT_DIALOG_STYLE,
                 const wxString& name = wxT("wxSTEditorPrefDialog"));

    virtual ~wxSTEditorPrefDialog() {}

    // Get the data that they set
    wxSTEditorPrefPageData GetPrefData() const       { return m_prefData; }
    // Get the data originally sent in
    wxSTEditorPrefPageData GetEditorPrefData() const { return m_editorPrefData; }

    // -----------------------------------------------------------------------
    // implementation
    void OnApply(wxCommandEvent& event);
    void OnCancel(wxCommandEvent& event);
    void OnOk(wxCommandEvent& event);
    void OnReset(wxCommandEvent& event);
    void OnNotebookPageChanged(wxNotebookEvent &event);
    void OnUpdateUIApply(wxUpdateUIEvent& event);

    wxNotebook *m_noteBook;
    wxSTEditorPrefPageData m_prefData;       // local copy to modify
    wxSTEditorPrefPageData m_editorPrefData; // editor's original unmodified copy
    wxSTERecursionGuardFlag m_rGuard_inapply;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_ABSTRACT_CLASS(wxSTEditorPrefDialog)
};

//-----------------------------------------------------------------------------
// wxSTEditorPropertiesDialog - display info about editor session
//
// File name, size, modified time, language, # lines/chars/words/tabs, LF type
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorPropertiesDialog : public wxDialog
{
public:
    wxSTEditorPropertiesDialog(wxSTEditor *editor,
                               const wxString& title = wxT("Document Properties"),
                               long style = wxDEFAULT_DIALOG_STYLE);

private:
    DECLARE_ABSTRACT_CLASS(wxSTEditorPropertiesDialog);
};

//-----------------------------------------------------------------------------
// wxSTEditorWindowsDialog - dialog to manage opened windows in notebook
//   The user can activate, save, close notebook pages.
//   The dialog is shown modal and closes itself.
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorWindowsDialog : public wxDialog
{
public:
    wxSTEditorWindowsDialog(wxSTEditorNotebook *notebook,
                            const wxString& title = wxT("Windows"),
                            long style = wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER);

    // -----------------------------------------------------------------------
    // implementation
    void UpdateListBox();
    void UpdateButtons();
    void OnListBox(wxCommandEvent& event);
    void OnButton(wxCommandEvent& event);

    wxSTEditorNotebook* m_notebook;
    wxListBox* m_listBox;

private:
    DECLARE_EVENT_TABLE()
    DECLARE_ABSTRACT_CLASS(wxSTEditorWindowsDialog);
};

//-----------------------------------------------------------------------------
// wxSTEditorInsertTextDialog - get values from the user for the
//   wxSTEditor::InsertTextAtCol() function.
//
// You can then use the values from the dialog to call the
//   wxSTEditor::InsertTextAtCol yourself.
//-----------------------------------------------------------------------------

enum STE_InsertText_Type
{
    STE_INSERT_TEXT_PREPEND,
    STE_INSERT_TEXT_APPEND,
    STE_INSERT_TEXT_ATCOLUMN,
    STE_INSERT_TEXT_SURROUND
};

class WXDLLIMPEXP_STEDIT wxSTEditorInsertTextDialog: public wxDialog
{
public:
    wxSTEditorInsertTextDialog(wxWindow* parent,
                               const wxString& title = _("Insert Text"),
                               long style = wxDEFAULT_DIALOG_STYLE);

    virtual ~wxSTEditorInsertTextDialog();

    // Get the type of insert desired
    STE_InsertText_Type GetInsertType() const { return m_type; }
    // Get the column to insert the text at
    int GetColumn() const { return m_col-1; }
    // text to be inserted
    wxString GetPrependText() const { return m_prependString; }
    wxString GetAppendText() const  { return m_appendString; }

    // Set the text to display to the user to be formatted
    void SetText(const wxString& text);
    // Get the text in the editor currently (as user left it)
    wxString GetText();
    // format the text that you sent in with SetText using values in the gui
    void FormatText();

    // -----------------------------------------------------------------------
    // implementation
    void OnButton(wxCommandEvent& event);
    void OnMenu(wxCommandEvent& event);
    void OnRadioButton(wxCommandEvent& event);
    void OnIdle(wxIdleEvent& event);
    void OnText(wxCommandEvent& event);

    void UpdateControls();
    STE_InsertText_Type RadioIdToType( wxWindowID id ) const;
    wxWindowID GetSelectedRadioId() const;

    wxComboBox*   m_prependCombo;
    wxComboBox*   m_appendCombo;
    wxStaticText* m_prependText;
    wxMenu*       m_insertMenu;
    wxSTEditor*   m_testEditor;

    STE_InsertText_Type m_type;
    int      m_col;
    wxString m_prependString;
    wxString m_appendString;
    int      m_prepend_insert_pos;
    int      m_append_insert_pos;
    wxString m_initText;

    static int sm_radioID;                  // last set radio button Window ID
    static int sm_spinValue;                // last set column for spinctrl
    static wxArrayString sm_prependValues;  // last values to prepend/append
    static wxArrayString sm_appendValues;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_ABSTRACT_CLASS(wxSTEditorInsertTextDialog);
};

//-----------------------------------------------------------------------------
// wxSTEditorColumnizeDialog - insert text at specified col
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorColumnizeDialog : public wxDialog
{
public:
    wxSTEditorColumnizeDialog(wxWindow* parent,
                              const wxString& title = _("Columnize Text"),
                              long style = wxDEFAULT_DIALOG_STYLE|
                                           wxRESIZE_BORDER|wxMAXIMIZE_BOX);

    // Set the text to display to the user to be formatted
    void SetText(const wxString& text);
    // Get the text in the editor currently (as user left it)
    wxString GetText();
    // format the text that you sent in with SetText using values in the gui
    void FormatText();

    wxSTEditor* GetTestEditor() { return m_testEditor; }

    // -----------------------------------------------------------------------
    // implementation

    void OnButton(wxCommandEvent& event);
    void OnText(wxCommandEvent& event);

    wxComboBox*       m_splitBeforeCombo;
    wxComboBox*       m_splitAfterCombo;
    wxComboBox*       m_preserveCombo;
    wxComboBox*       m_ignoreCombo;
    wxCheckBox*       m_updateCheckBox;
    wxSTEditor*       m_testEditor;
    wxString          m_initText;

    static wxArrayString sm_splitBeforeArray; // remember previous settings
    static wxArrayString sm_splitAfterArray;
    static wxArrayString sm_preserveArray;
    static wxArrayString sm_ignoreArray;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_ABSTRACT_CLASS(wxSTEditorColumnizeDialog);
};

#endif // _STEDLGS_H_

