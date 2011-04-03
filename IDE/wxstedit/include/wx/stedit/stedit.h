///////////////////////////////////////////////////////////////////////////////
// Name:        stedit.h
// Purpose:     wxSTEditor
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STEDIT_H_
#define _STEDIT_H_

#include "wx/defs.h"
#include "wx/datetime.h"
#include "wx/fdrepdlg.h"
#include "wx/treectrl.h"

class WXDLLEXPORT wxMenu;
class WXDLLEXPORT wxKeyEvent;
class WXDLLEXPORT wxFindDialogEvent;
class WXDLLEXPORT wxToolBar;
class WXDLLEXPORT wxConfigBase;
class WXDLLEXPORT wxFileHistory;

#include "wx/stedit/stedefs.h"
#include "wx/stedit/steprefs.h"
#include "wx/stedit/stestyls.h"
#include "wx/stedit/stelangs.h"
#include "wx/stedit/steopts.h"

//-----------------------------------------------------------------------------
// wxSTERecursionGuard - a simple recursion guard to block reentrant functions
//  We have our own version since it's used as a class member and wxWidgets may
//    change their implementation.
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTERecursionGuardFlag
{
public:
    wxSTERecursionGuardFlag() : m_flag(0) {}
    int m_flag;
};

class WXDLLIMPEXP_STEDIT wxSTERecursionGuard
{
public:
    wxSTERecursionGuard(wxSTERecursionGuardFlag& flag) : m_flag(flag)
    {
        m_isInside = (flag.m_flag++ != 0);
    }

    ~wxSTERecursionGuard()
    {
        wxASSERT_MSG(m_flag.m_flag > 0, wxT("unbalanced wxSTERecursionGuards!?"));
        m_flag.m_flag--;
    }

    bool IsInside() const { return m_isInside; }

private:
    wxSTERecursionGuardFlag& m_flag;
    bool m_isInside;     // true if m_flag had been already set when created
};

//-----------------------------------------------------------------------------
// STE_FindStringType - options of what to do when finding strings
//   see wxSTEditor::FindString
//-----------------------------------------------------------------------------

enum STE_FindStringType
{
    STE_FINDSTRING_NOTHING = 0,     // do nothing when finding a string

    STE_FINDSTRING_SELECT  = 0x01,  // select the string if found
    STE_FINDSTRING_GOTO    = 0x02   // goto the start pos of string
};

//-----------------------------------------------------------------------------
// STE_TranslatePosType - options of what to do for wxSTEditor::TranslateXXX
//-----------------------------------------------------------------------------

enum STE_TranslatePosType
{
    STE_TRANSLATE_NOTHING   = 0, // take input literally
    STE_TRANSLATE_SELECTION = 1, // use selection to translate
    STE_TRANSLATE_TARGET    = 2  // use target to translate
};

//-----------------------------------------------------------------------------
// wxSTEditorRefData - ref counted data to share with refed editors
//
//  You normally do not need to access any of this, use the member functions
//  in the wxSTEditor.
//-----------------------------------------------------------------------------
class WXDLLIMPEXP_STEDIT wxSTEditorRefData : public wxObjectRefData
{
public:
    wxSTEditorRefData();
    virtual ~wxSTEditorRefData() { m_editors.Clear(); }

    // Find/Add/Remove editors that share this data
    size_t GetEditorCount() const { return m_editors.GetCount(); }
    bool HasEditor(wxSTEditor* editor) const { return FindEditor(editor) != wxNOT_FOUND; }
    int FindEditor(wxSTEditor* editor) const { return m_editors.Index(editor); }
    wxSTEditor *GetEditor(size_t n) const { return (wxSTEditor*)m_editors.Item(n); }
    void AddEditor(wxSTEditor* editor) { if (!HasEditor(editor)) m_editors.Add(editor); }
    void RemoveEditor(wxSTEditor* editor) { int n = FindEditor(editor);
                                                  if (n != wxNOT_FOUND)
                                                      m_editors.RemoveAt(n); }

    // -----------------------------------------------------------------------
    // implementation
    wxArrayPtrVoid m_editors;       // editors that share this data

    wxString     m_fileName;        // current filename for the editor
    wxDateTime   m_modifiedTime;    // file modification time, else invalid
    wxTreeItemId m_treeItemId;      // the treeitem if tracked in a wxTreeCtrl

    int m_last_autoindent_line;     // last line that was auto indented
    int m_last_autoindent_len;      // the length of the line before auto indenting

    int m_steLang_id;                // index into the wxSTEditorLangs used

    wxSTEditorOptions m_options;    // options, always created

    // we have our own copy of prefs/styles/langs in addition to those in
    // the options so we can detach an editor, but use the rest of the options
    // they're ref counted so they're small
    wxSTEditorPrefs  m_stePrefs;
    wxSTEditorStyles m_steStyles;
    wxSTEditorLangs  m_steLangs;
};

//-----------------------------------------------------------------------------
// wxSTEditor
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditor : public wxStyledTextCtrl
{
public :

    // wxStyledTextCtrl doesn't have Create method in 2.4.x
#if wxCHECK_VERSION(2,5,0)
    wxSTEditor() : wxStyledTextCtrl() { Init(); }
#endif // wxCHECK_VERSION(2,5,0)

    wxSTEditor(wxWindow *parent, wxWindowID id,
               const wxPoint& pos = wxDefaultPosition,
               const wxSize& size = wxDefaultSize,
               long style = 0, // wxStyledTextCtrl ors this with defaults
               const wxString& name = wxT("wxSTEditor"));

    virtual ~wxSTEditor();
    virtual bool Destroy();

    bool Create( wxWindow *parent, wxWindowID id,
                 const wxPoint& pos = wxDefaultPosition,
                 const wxSize& size = wxDefaultSize,
                 long style = 0, // wxStyledTextCtrl ors this with defaults
                 const wxString& name = wxT("wxSTEditor"));

    // Clone this editor, uses wxClassInfo so derived classes should work.
    // Override if you want to create your own type for the splitter to use in
    //   wxSTEditorSplitter::CreateEditor.
    virtual wxSTEditor* Clone(wxWindow *parent, wxWindowID id,
                              const wxPoint& pos = wxDefaultPosition,
                              const wxSize& size = wxDefaultSize,
                              long style = 0, // wxStyledTextCtrl ors this with defaults
                              const wxString& name = wxT("wxSTEditor")) const;

    // Create any elements desired in the wxSTEditorOptions.
    //   This function is always called after creation by the parent splitter
    //     with it's options and would be a good function to override to setup
    //     the editor your own way.
    // This registers the prefs, styles, langs in the options,
    //   and creates any items set by the options.
    virtual void CreateOptions(const wxSTEditorOptions& options);
    // GetOptions, use this to change editor option values
    const wxSTEditorOptions& GetOptions() const;
    wxSTEditorOptions& GetOptions();
    // Set the options, the options will now be refed copies of the ones you send
    // in. This can be used to detach the options for a particular editor from
    // the rest of them. (See also CreateOptions)
    void SetOptions(const wxSTEditorOptions& options);

    // ************************************************************************
    // NOTE: This might not be necessary anymore since overriding Destroy()
    //
    // IMPORTANT! In your wxApp::OnExit or wxFrame's EVT_CLOSE handler
    // make sure you call this to ensure that any extraneous focus events
    // are blocked. GTK 2.0 for example sends them, MSW has been known to do it
    // as well (but that was for a different control)
    //
    // The problem occurs because focus events may be sent to the window if the
    // user closes it and immediately clicks on it before it's destroyed. This
    // is not typical, but can happen suprisingly easily.
    // The sequence of events is as follows, the focus event is created
    // from wxWidgets and the ste editor tries to update the menus and toolbars.
    // In GTK2, for example, the event loop is run when updating a
    // toolbar tool and so the ste editor can be destroyed before the toolbar
    // finishes updating. When the function returns the program crashes.
    void SetSendSTEEvents(bool send);
    // ************************************************************************

    // ------------------------------------------------------------------------
    // wxTextCtrl methods - this can be used as a replacement textctrl with
    //                      very few, if any, code changes.
    bool CanCopy()  { return GetSelectionEnd() != GetSelectionStart(); }
    bool CanCut()   { return CanCopy() && !GetReadOnly(); }

    // FIXME gtk runs evt loop during CanPaste check causing a crash in
    //   scintilla's drawing code, for now let's just assume you can always paste
#ifdef __WXGTK__
    bool CanPaste() { return !GetReadOnly(); }
#endif // __WXGTK__

    // void Clear() { ClearAll(); } // wxSTC uses Clear to clear selection
    void DiscardEdits()                   { SetSavePoint(); }
    int GetInsertionPoint()               { return GetCurrentPos(); }
    int GetLineLength(int iLine);         // excluding any cr/lf at end
    wxString GetLineText(int line);       // excluding any cr/lf at end
    long GetNumberOfLines()               { return GetLineCount(); }
    void GetSelection(long *iStart, long *iEnd) { int s=0,e=0; wxStyledTextCtrl::GetSelection(&s, &e); if (iStart) *iStart=s; if (iEnd) *iEnd=e; }
    wxString GetValue()                   { return GetText(); }
    bool IsModified()                     { return GetModify(); }
    void SetInsertionPoint(int pos)       { GotoPos(pos); }
    void SetInsertionPointEnd()           { GotoPos(GetLength()); }
    void ShowPosition(int pos)            { GotoPos(pos); }
    void WriteText(const wxString &text)  { InsertText(GetCurrentPos(), text); SetCurrentPos(GetCurrentPos() + text.Len()); }
    long XYToPosition(long x, long y)     { return x + PositionFromLine(y); }
    // Remove this section of text between markers
    void Remove(int iStart, int iEnd)     { SetTargetStart(iStart); SetTargetEnd(iEnd); ReplaceTarget(wxEmptyString); }

    // Get the row/col representation of the position
    bool PositionToXY(long pos, long *x, long *y);

    // ------------------------------------------------------------------------
    // Convenience functions - other useful functions

    // Translate the start and end positions in the document, returns if !empty
    //  If start_pos == end_pos == -1 use current selection/target
    //    or if none use cursor line
    //  To get the whole document use (0, GetLength()-1) or (0, -1).
    bool TranslatePos(int  start_pos,       int  end_pos,
                      int* trans_start_pos, int* trans_end_pos,
                      STE_TranslatePosType type = STE_TRANSLATE_SELECTION);
    // Translate the top and bottom lines in the document, returns true if they differ
    //  If top_line == bottom_line == -1 then use top/bottom line of selection/target
    //    or if no selection/target use the cursor line.
    //  If top_line = 0 and bottom_line = -1 use (0, GetLineCount()-1)
    bool TranslateLines(int  top_line,       int  bottom_line,
                        int* trans_top_line, int* trans_bottom_line,
                        STE_TranslatePosType type = STE_TRANSLATE_SELECTION);

    // Get the text between the GetTargetStart and GetTargetEnd
    wxString GetTargetText();

    // Paste the text from the clipboard into the text at the current cursor
    //  position preserving the linefeeds in the text using PasteRectangular
    bool PasteRectangular();
    // Paste the text into the document using the column of pos, -1 means
    //   current cursor position, as the leftmost side for linefeeds.
    void PasteRectangular(const wxString& str, int pos = -1);

    // Get the wxSTC_EOL_XXX string "\r", "\n", "\r\n" as appropriate for
    //  Mac, Unix, DOS. default (-1) gets EOL string for current doc settings
    wxString GetEOLString(int stc_eol_mode = -1);

    // AppendText to the document and if the cursor was already at the end of
    //   the document keep the cursor at the end. This is useful for scrolling
    //   logs so the user can click above the end and read the message without
    //   it scrolling off the screen as new text is added below.
    //   If goto_end then always put the cursor at the end.
    void AppendTextGotoEnd(const wxString &text, bool goto_end = false);

    // Write the text to the line, adding lines if necessary
    //   if inc_newline then also overwrite the newline char at end of line
    // See also GetLineText in wxTextCtrl compatibility functions
    //   which excludes any crlf at the end of the line
    void SetLineText(int line, const wxString& text, bool inc_newline = false);

    void GotoStartOfCurrentLine() { GotoLine(LineFromPosition(GetInsertionPoint())); }

    // Get the number of words in the string, counts words as contiguous isalnum
    size_t GetWordCount(const wxString& text) const;
    // Get the number of words, counts words as contiguous isalnum
    //  See TranslatePos(start_pos, end_pos) for start/end interpretation
    size_t GetWordCount(int start_pos = 0, int end_pos = -1,
                        STE_TranslatePosType type = STE_TRANSLATE_SELECTION);
    // Get the count of these "words", they may be single characters and
    // they may also be parts of other words. Returns total count.
    // The output int array contains the count in the same order as the words array.
    size_t GetWordArrayCount(const wxString& text,
                             const wxArrayString& words, wxArrayInt& count,
                             bool ignoreCase = false);
    // Get the EOL count for each EOL type (also tabs), each and all types can be NULL
    void GetEOLCount(int *crlf, int *cr, int *lf, int *tabs = NULL);

    // calls ToggleFold on the parent fold of the line (if any)
    //  if line = -1 then use the current line
    void ToggleFoldAtLine(int line = -1);
    // Expand or collapse all folds at and above or below the level
    void ExpandFoldsToLevel(int level, bool expand = true);
    void CollapseFoldsToLevel(int level) { ExpandFoldsToLevel(level, false); }
    // Expand or collapse all the folds in the document
    void ExpandAllFolds()   { ExpandFoldsToLevel(wxSTC_FOLDLEVELNUMBERMASK, true); }
    void CollapseAllFolds() { CollapseFoldsToLevel(0); }

    // Set the indentation of a line or set of lines, width is usually GetIndent()
    //  See TranslateLines(top_line, bottom_line) for top/bottom interpretation
    void SetIndentation(int width, int top_line = -1, int bottom_line = -1,
                        STE_TranslatePosType type = STE_TRANSLATE_SELECTION);

    // Convert tab characters to spaces uses GetTabWidth for # spaces to use
    //  returns the number of replacements.
    //  See TranslatePos(start_pos, end_pos) for start/end interpretation
    size_t ConvertTabsToSpaces(bool to_spaces, int start_pos = -1, int end_pos = -1,
                               STE_TranslatePosType type = STE_TRANSLATE_SELECTION);
    // Remove all trailing spaces and tabs from the document
    //  See TranslateLines(top_line, bottom_line) for top/bottom interpretation
    bool RemoveTrailingWhitespace(int top_line = -1, int bottom_line = -1);
    // Remove chars before and after the position until char not in remove found
    //  only works on a single line, if pos == -1 then use GetCurrentPos()
    bool RemoveCharsAroundPos(int pos = -1, const wxString& remove = wxT(" \t"));
    // Inserts specified text at the column (adding spaces as necessary)
    //  if col == 0, prepend text, < 0 then append text, else insert at column
    //  See TranslateLines(top_line, bottom_line) for top/bottom interpretation
    bool InsertTextAtCol(int col, const wxString& text,
                         int top_line = -1, int bottom_line = -1);

    // Put all the text in the lines in equally spaced columns using the chars
    //  to split in cols before, after and what chars will bound regions that
    //  you want to preserve (like strings).
    bool Columnize(int top_line = -1, int bottom_line = -1,
                   const wxString& splitBefore = wxT(")]{}"),
                   const wxString& splitAfter  = wxT(",;"),
                   const wxString& preserveChars = wxT("\""),
                   const wxString& ignoreAfterChars = wxT(""));

    // Show a dialog that allows the user to append, prepend, or insert text
    //  in the selected lines or the current line
    bool ShowInsertTextDialog();
    // Show a dialog to allow the user to turn the selected text into columns
    bool ShowColumnizeDialog();
    // Show a convert EOL dialog to allow the user to select one
    bool ShowConvertEOLModeDialog();
    // Show a dialog to allow the user to select a text size zoom to use
    bool ShowSetZoomDialog();
    // Simple dialog to goto a particular line in the text
    bool ShowGotoLineDialog();

    // ------------------------------------------------------------------------
    // Load/Save methods

    // Can/Should this document be saved (has valid filename and is modified)
    bool CanSave() { return GetModify() && !GetFileName().IsEmpty(); }

    // Load a file from the wxInputStream (probably a wxFileInputStream)
    //  The fileName is used only for the message on error
    //  flags is STE_LoadFileType
    bool LoadInputStream(wxInputStream& stream, const wxString &fileName,
                         int flags = STE_LOAD_QUERY_UNICODE);

    // Load a file, if filename is wxEmptyString then use wxFileSelector
    //   if using wxFileSelector then if extensions is wxEmptyString use
    //   GetOptions().GetDefaultFileExtensions() else the ones supplied
    virtual bool LoadFile( const wxString &filename = wxEmptyString,
                           const wxString &extensions = wxEmptyString );
    // Save current file, if use_dialog or GetFileName() is empty use wxFileSelector
    virtual bool SaveFile( bool use_dialog = true,
                           const wxString &extensions = wxEmptyString );
    // clear everything to a blank page
    //   if title is empty then pop up a dialog to ask the user what name to use
    virtual bool NewFile(const wxString &title = wxEmptyString);

    // Show a dialog to allow users to export the document
    //   See wxSTEditorExporter
    bool ShowExportDialog();

    // If IsModified show a message box asking if the user wants to save the file
    //   returns wxYES, wxNO, wxCANCEL, if the user does wxYES then file is
    //   automatically saved if save_file, wxCANCEL implies that the user wants
    //   to continue editing.
    //   note: use EVT_CLOSE in frame before hiding frame so this dialog
    //         check for wxCloseEvent::CanVeto and if it can't be vetoed use the
    //         style wxYES_NO only since it can't be canceled.
    virtual int QuerySaveIfModified(bool save_file, int style = wxYES_NO|wxCANCEL);

    // Get/Set the current filename, including path
    wxString GetFileName() const;
    void SetFileName(const wxString &fileName, bool send_event = false);

    // If there's a valid filename, return false if it's modification time is
    //   before the current doc's times if the time is valid.
    //   if show_reload_dialog then ask user if they want to reload
    //   if yes then the file is reloaded else modified time is set to an
    //   invalid time so that the user won't be asked again.
    bool IsAlteredOnDisk(bool show_reload_dialog);
    // Get/Set the last modification time of the file on the disk (internal use)
    //   doesn't read/write to/from disk and the time is invalid if it wasn't
    //   loaded from a file in the first place.
    void SetFileModificationTime(const wxDateTime &dt);
    wxDateTime GetFileModificationTime() const;

    // Show a modal dialog that displays the properties of this editor
    //   see wxSTEditorPropertiesDialog
    void ShowPropertiesDialog();

    // ------------------------------------------------------------------------
    // Find/Replace methods

    // A note about the find dialog system.
    //
    // When you create a find/replace dialog this checks if the grandparent is
    // a wxSTEditorNotebook and uses that as a parent. Else, if the parent is
    // a wxSTEditorSplitter then use that as a parent to avoid this being 2nd
    // window and user unsplits. Finally this is used as a parent.
    //
    // Find/Replace events from the dialog are sent to the parent (see above).
    // If in a notebook and STE_FR_ALLDOCS is set the notebook handles the event
    // and switches pages automatically to find the next occurance, else the
    // current editor handles the event. If the splitter is the parent, it does
    // nothing and passes the event to the current editor.
    //
    // ShowFindReplaceDialog(true...) will Destroy a previously made dialog by
    // checking if a window exists with the name
    // wxSTEditorFindReplaceDialogNameStr and create a new one.

    // Find the string using the flags (see STEFindReplaceFlags)
    //   start_pos is the starting position, -1 uses GetCursorPos()
    //   end_pos is the ending position, -1 uses GetTextLength or
    //     if flags doesn't have STE_FR_DOWN then 0.
    //   if flags = -1 uses GetFindFlags()
    //   action is of type STE_FindStringType selects, goto, or do nothing
    //   found_start_pos/end_pos if !NULL are set to the start/end pos of string
    //     note found_end_pos - found_start_pos might not be string.length for regexp
    //   returns starting position of the found string
    int FindString(const wxString &findString,
                   int start_pos = -1, int end_pos = -1,
                   int flags = -1,
                   int action = STE_FINDSTRING_SELECT|STE_FINDSTRING_GOTO,
                   int *found_start_pos = NULL, int *found_end_pos = NULL);
    // Does the current selection match the findString using the flags
    //   if flags = -1 uses GetFindFlags()
    bool SelectionIsFindString(const wxString &findString, int flags = -1);
    // Replace all occurances of the find string with the replace string
    //   if flags = -1 uses GetFindFlags()
    //   returns the number of replacements
    int ReplaceAllStrings(const wxString &findString,
                          const wxString &replaceString, int flags = -1);
    // Finds all occurances of the string and returns their starting positions
    //   if flags = -1 uses GetFindFlags()
    //   returns the number of strings found
    //   if startPositions is !NULL then fill with the starting positions
    //   if endPositions if !NULL then fill that with the ending positions
    //     note: for regexp end - start might not equal findString.length.
    size_t FindAllStrings(const wxString &findString, int flags = -1,
                          wxArrayInt* startPositions = NULL,
                          wxArrayInt* endPositions = NULL);

    // if show then show it, else hide it, if find then find dialog, else replace dialog
    void ShowFindReplaceDialog(bool show, bool find = true);

    // Get the find replace data from the options
    wxSTEditorFindReplaceData *GetFindReplaceData() const;
    // Get the current string to find
    wxString GetFindString() const;
    // Get the current replace string
    wxString GetReplaceString() const;
    // set the current string to find, only sends wxEVT_STE_CANFIND_CHANGED if value changes
    void SetFindString(const wxString &str, bool send_evt = false);
    // Get the flags used to find a string
    int GetFindFlags() const;
    // set the current find flags, only sends wxEVT_STE_CANFIND_CHANGED if flags change
    void SetFindFlags(long flags, bool send_evt = false);
    // get the direction of search
    bool GetFindDown() const { return (GetFindFlags() & wxFR_DOWN) != 0; }
    // false if the last search failed and the flags or findstr hasn't changed
    bool CanFind() const { return HasState(STE_CANFIND); }
    // reset the canfind variable in case you change something else
    void SetCanFind(bool can_find) { SetStateSingle(STE_CANFIND, can_find); }

    // ------------------------------------------------------------------------
    // Set/ClearIndicator methods

    // Indicate a section of text starting at pos to len, of indic type wxSTC_INDIC(0,1,2)_MASK
    void SetIndicator(int pos, int len, int indic);
    // Indicates all strings using indic type wxSTC_INDIC(0,1,2)_MASK
    //   if str = wxEmptyString use GetFindString(), if flags = -1 use GetFindFlags()|STE_FR_WHOLEDOC
    bool IndicateAllStrings(const wxString &str=wxEmptyString, int flags = -1, int indic=wxSTC_INDIC0_MASK);
    // clear a single character of indicated text of indic type wxSTC_INDIC(0,1,2)_MASK or -1 for all
    bool ClearIndicator(int pos, int indic = wxSTC_INDIC0_MASK);
    // clear an indicator starting at any position within the indicated text of
    //   indic type wxSTC_INDIC(0,1,2)_MASK or -1 for all
    //   returns position after last indicated text or -1 if nothing done
    int ClearIndication(int pos, int indic = wxSTC_INDIC0_MASK);
    // clears all the indicators of type wxSTC_INDIC(0,1,2)_MASK or -1 for all
    void ClearAllIndicators(int indic = -1);

    // ------------------------------------------------------------------------
    // Printing/Rendering methods

    // Show the wxWidgets print dialog
    bool ShowPrintDialog();
    // Show the wxWidgets print preview dialog
    bool ShowPrintPreviewDialog();
    // Show the wxWidgets printer setup dialog (papersize, orientation...)
    bool ShowPrintSetupDialog();
    // Show the wxWidgets print page setup dialog (papersize, margins...)
    bool ShowPrintPageSetupDialog();
    // Show a STC specific options dialog (Wrapmode, magnification, colourmode)
    bool ShowPrintOptionsDialog();

    // ------------------------------------------------------------------------
    // Menu/MenuBar/Toolbar management

    // Update all the menu/tool items in the wxSTEditorOptions for this editor
    virtual void UpdateAllItems();
    // Update all the known items for a menu, menubar, toolbar, if they're NULL
    //  then they're not updated
    virtual void UpdateItems(wxMenu *menu=NULL, wxMenuBar *menuBar=NULL, wxToolBar *toolBar=NULL);

    // ------------------------------------------------------------------------
    // Set Lexer Language - you must have set wxSTEditorLangs

    // Setup colouring and lexing based on wxSTEditorLangs type
    bool SetLanguage(int lang);
    // Setup colouring and lexing based on wxSTEditorLangs::GetFilePattern()
    bool SetLanguage(const wxString &filename);
    // What language are we using, the index into wxSTEditorLangs
    //   This may or may not match wxSTC::GetLexer since
    //   different languages may use the same lexer. (Java uses CPP lexer)
    int  GetLanguageId() const;

    // ------------------------------------------------------------------------
    // Editor preferences, styles, languages
    //
    // There are global versions that many editors can share and they're ref
    // counted so you don't need to keep any local versions around.
    // You should use the globals in at least one editor to not let them go
    // to waste. There's nothing special about them, it's just that if you're
    // bothering to use this class you'll probably want at least one of each.
    //
    // The prefs/styles/langs are initially not set for an editor, but can be
    // set by the function CreateOptions if you have set them in the options.
    // If however you wish to use different ones you may call RegisterXXX to
    // "detach" this editor from the others.
    //
    // example usage :
    //    editor->RegisterPreferences(wxSTEditorPrefs()); // no prefs
    //
    //    wxSTEditorPrefs myPrefs(true);                 // create
    //    myPrefs.SetPrefBool(STE_PREF_VIEWEOL, true);   // adjust as necessary
    //    editor->RegisterPreferences(myPrefs);          // assign to editor

    // register this editor to use these preferences
    //   the default is to use the prefs in the options (if set) which by
    //   default will be the static global wxSTEditorPrefs::GetGlobalEditorPrefs()
    //   RegisterPrefs(wxSTEditorPrefs(false)) to not use any preferences
    void RegisterPrefs(const wxSTEditorPrefs& prefs);
    const wxSTEditorPrefs& GetEditorPrefs() const;
    wxSTEditorPrefs& GetEditorPrefs();

    // register this editor to use these styles
    //   the default is to use the styles in the options (if set) which by
    //   default will be the static global wxSTEditorStyles::GetGlobalEditorStyles()
    //   RegisterStyles(wxSTEditorStyles(false)) to not use any styles
    void RegisterStyles(const wxSTEditorStyles& styles);
    const wxSTEditorStyles& GetEditorStyles() const;
    wxSTEditorStyles& GetEditorStyles();

    // register this editor to use these languages
    //   the default is to use the langs in the options (if set) which by
    //   default will be the static global wxSTEditorLangs::GetGlobalEditorLangs()
    //   RegisterLangs(wxSTEditorLangs(false)) to not use any languages
    void RegisterLangs(const wxSTEditorLangs& langs);
    const wxSTEditorLangs& GetEditorLangs() const;
    wxSTEditorLangs& GetEditorLangs();

    // -----------------------------------------------------------------------
    // implementation
    void OnKeyDown(wxKeyEvent& event);
    void OnKeyUp(wxKeyEvent& event);
    void OnRightUp(wxMouseEvent &event); // popup menu if one is set in options

    void OnMenu(wxCommandEvent &event);
    // handle menu events of known types, returns sucess, false for unknown id
    virtual bool HandleMenuEvent(wxCommandEvent &event);

    void OnFindDialog(wxFindDialogEvent& event);
    // handle the find dialog event
    virtual void HandleFindDialogEvent(wxFindDialogEvent& event);

    void OnSTCUpdateUI(wxStyledTextEvent &event);
    void OnSTCCharAdded(wxStyledTextEvent &event);
    void OnSTCMarginClick(wxStyledTextEvent &event);
    void OnSTCMarginDClick(wxStyledTextEvent &event); // we generate this event
    void OnSetFocus(wxFocusEvent &event);
    void OnSTEState(wxSTEditorEvent &event);
    void OnSTEFocus(wxSTEditorEvent &event);
    void OnEraseBackground(wxEraseEvent &event) { event.Skip(false); }
    void OnMouseWheel(wxMouseEvent& event); // FIXME - only for wxGTK 2.0
    void OnScroll(wxScrollEvent& event);
    void OnScrollWin(wxScrollWinEvent& event);

    // Access to the scrollbars in wxStyledTextCtrl
    wxScrollBar* GetHScrollBar() { return m_hScrollBar; }
    wxScrollBar* GetVScrollBar() { return m_vScrollBar; }

    // Get the width in pixels of the longest line between top_line and
    //  bottom_line takeing care of ctrl chars and tabs.
    //  if top_line = bottom_line = -1 then use the visible lines.
    int GetLongestLinePixelWidth(int top_line = -1, int bottom_line = -1);

    // Update all the CanSave, CanXXX functions to see if they've changed and
    //   and send appropriate events as to what has changed for updating UI
    //   this is called in OnSTCUpdateUI, but Saving doesn't generate an event
    //   but CanSave becomes false. Make sure to call this in odd cases like this.
    //   if send_event is false don't send events just update internal values
    void UpdateCanDo(bool send_event);

    // Get/Set combinations enum STE_StateType
    long GetState() const     { return m_state; }
    void SetState(long state) { m_state = state; }
    bool HasState(long ste_statetype) const { return (m_state & ste_statetype) != 0; }
    void SetStateSingle(long state, bool set) { if (set) SetState(m_state | state); else SetState(m_state & ~state); }

    // Check if we autoindented but the user didn't type anything and
    //   remove the space we added. (resets m_last_autoindent_line/len)
    bool ResetLastAutoIndentLine();

    // These are not currently used
    int  IsLinePreprocessorCondition(const wxString &line);
    bool FindMatchingPreprocessorCondition(int &curLine, int direction,
                                           int condEnd1, int condEnd2);
    bool FindMatchingPreprocCondPosition(bool isForward, int &mppcAtCaret,int &mppcMatch);

    // for brace matching and highlighting other brace
    bool DoFindMatchingBracePosition(int &braceAtCaret, int &braceOpposite, bool sloppy);
    void DoBraceMatch();

    // Get the position (col) of the caret in the line it's currently in
    int GetCaretInLine();

    // ------------------------------------------------------------------------
    // Autocomplete functions

    // Get keywords as a space separated list from the langs that begin with root
    virtual wxString GetAutoCompleteKeyWords(const wxString& root);
    // Add the matching keywords from the langs to the array string
    //   returns the number added
    size_t DoGetAutoCompleteKeyWords(const wxString& root, wxArrayString& words);

    // Show the autocompletion box if any keywords from the langs match the start
    //   of the current word
    bool StartAutoComplete();
    // Show the autocompletion box if any other words in the document match the start
    //   of the current word
    //   if onlyOneWord then if more than one word then don't show box
    //   if add_keywords then also add the keywords from the langs
    bool StartAutoCompleteWord(bool onlyOneWord, bool add_keywords);

    // ------------------------------------------------------------------------
    // Note for a wxEVT_STE_STATE_CHANGED event evt_int is the changed state and
    //   extra_long is the state values.
    //   Otherwise the int/long values are those in the wxCommandEvent
    bool SendEvent(wxEventType eventType, int evt_int = 0, long extra_long = 0,
                   const wxString &evtStr = wxEmptyString );

    // ------------------------------------------------------------------------
    // Get/Set a wxTreeItemId if this editor being tracked in a wxTreeCtrl
    //   used by the wxSTEditorFrame
    wxTreeItemId GetTreeItemId() const;
    void SetTreeItemId(const wxTreeItemId& id);

    // ------------------------------------------------------------------------
    // Get the ref counted data for the editor (ref counted for splitting)
    //  The ref data is ALWAYS expected to exist, do NOT call wxObject::UnRef
    wxSTEditorRefData* GetSTERefData() const { return (wxSTEditorRefData*)GetRefData(); }

    // If this editor is going to use a Refed document, run this after construction
    //  to have this mirror the original wxSTEditor, origEditor isn't modified
    //  See usage in wxSTEditorSplitter
    virtual void RefEditor(wxSTEditor *origEditor);

protected:
    bool m_sendEvents; // block sending events if false
    bool m_activating; // are we in EVT_ACTIVATE already
    long m_state;      // what state does this editor have, enum STE_StateType

    wxLongLong m_marginDClickTime;   // last time margin was clicked
    int        m_marginDClickLine;   // last line margin was clicked on
    int        m_marginDClickMargin; // last margin # clicked on

    wxSTERecursionGuardFlag m_rGuard_OnMenu;
    wxSTERecursionGuardFlag m_rGuard_HandleMenuEvent;
    wxSTERecursionGuardFlag m_rGuard_OnFindDialog;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_DYNAMIC_CLASS(wxSTEditor)
};

//-----------------------------------------------------------------------------
// wxSTEditorEvent
//
// helper events to update the gui only when items change (avoids UpdateUI overkill)
//-----------------------------------------------------------------------------
class WXDLLIMPEXP_STEDIT wxSTEditorEvent : public wxCommandEvent
{
public:
    wxSTEditorEvent() : wxCommandEvent() {}
    wxSTEditorEvent(const wxSTEditorEvent& event) : wxCommandEvent(event) {}
    wxSTEditorEvent( int id, wxEventType type, wxObject* obj,
                     int stateChange, int stateValues,
                     const wxString& fileName );

    // Has the state of the editor changed see STE_StateType for different states.
    //   can OR states together to see if any of them have changed
    bool HasStateChange(int stateChange) const { return (GetStateChange() & stateChange) != 0; }
    bool GetStateValue(STE_StateType stateValue) const { return (GetStateValues() & stateValue) != 0; }

    int  GetStateChange() const { return GetInt(); }
    int  GetStateValues() const { return int(GetExtraLong()); }
    void SetStateChange(int stateChange) { SetInt(stateChange); }
    void SetStateValues(int stateValues) { SetExtraLong(stateValues); }

    wxString GetFileName() const { return GetString(); }
    void SetFileName( const wxString& fileName ) { SetString( fileName ); }

    wxSTEditor* GetEditor() const { return wxDynamicCast(GetEventObject(), wxSTEditor); }

    // implementation
    virtual wxEvent *Clone() const { return new wxSTEditorEvent(*this); }

private:
    DECLARE_DYNAMIC_CLASS_NO_ASSIGN(wxSTEditorEvent)
};

BEGIN_DECLARE_EVENT_TYPES()
    // editor created, event.GetEventObject is the editor, use to setup after constructor
    //   (this is a wxCommandEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STE_CREATED, 0)
    // splitter created, event.GetEventObject is the splitter, use to setup after constructor
    //   (this is a wxCommandEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STS_CREATED, 0)
    // notebook created, event.GetEventObject is the notebook, use to setup after constructor
    //   (this is a wxCommandEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STN_CREATED, 0)

    // The state of the editor has changed see STE_StateType for the types of changes
    //   (this is a wxSTEditorEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STE_STATE_CHANGED, 0)
    // This editor has the focus now, (serves to pass EVT_SET_FOCUS to parents)
    //   (this is a wxSTEditorEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STE_SET_FOCUS, 0)
    // The popup menu for the wxSTEditor is about to be shown, maybe you want to update it?
    //   (this is a wxSTEditorEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STE_POPUPMENU, 0)

    // The margin has been double clicked in the same line
    //   (this is a wxStyledTextEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STE_MARGINDCLICK, 0)

    // A wxSTEditor is about to be created for the wxSTEditorSplitter.
    // event.GetEventObject is the parent wxSTEditorSplitter.
    // You can set the event.SetEventObject to a "new wxSTEditor" or a
    // subclassed one of your own and this editor will be used instead.
    // Make sure that the parent of your editor is the splitter
    //    (ie. the original event.GetEventObject)
    // event.GetInt is the preferred id (probably wxID_ANY)
    //   (this is a wxCommandEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STS_CREATE_EDITOR, 0)

    // A wxSTEditorSplitter is about to be created for the wxSTEditorNotebook.
    // event.GetEventObject is the parent wxSTEditorNotebook.
    // You can set the event.SetEventObject to a "new wxSTEditorSplitter" or a
    // subclassed one of your own and this splitter will be used instead.
    // Make sure that the parent of your splitter is the notebook
    //    (ie. the original event.GetEventObject)
    // event.GetInt is the preferred id (probably wxID_ANY)
    //   (this is a wxCommandEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STN_CREATE_SPLITTER, 0)

    // The user has clicked on one of the splitter buttons in the
    //   wxSTEditor. This event is received by the splitter and then
    //   the splitting occurs. The event.GetInt() is enum wxSPLIT_VERTICAL
    //   or wxSPLIT_HORIZONTAL.
    //   (this is a wxCommandEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STS_SPLIT_BEGIN,     0)

    // The wxNotebook doesn't always send enough events to follow it's state.
    //  This event is sent whenever the selection or page count changes
    //  eg. When all the pages are deleted, gtk doesn't notify you that the
    //  selection is now -1
    //   (this is a wxNotebookEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STN_PAGE_CHANGED,    0)

    // Enter has been pressed on the last line of the wxSTEditorShell
    //   GetString for the event contains the contents of the line.
    //   (this is a wxSTEditorEvent)
    DECLARE_EXPORTED_EVENT_TYPE(WXDLLIMPEXP_STEDIT, wxEVT_STESHELL_ENTER,      0)

END_DECLARE_EVENT_TYPES()

typedef void (wxEvtHandler::*wxSTEditorEventFunction)(wxSTEditorEvent&);

#define wxSTEditorEventHandler(func) \
    (wxObjectEventFunction)(wxEventFunction)wxStaticCastEvent(wxSTEditorEventFunction, &func)

#define wx__DECLARE_STEEVT(evt, id, fn)  wx__DECLARE_EVT1( evt, id, wxSTEditorEventHandler(fn))

#define StyledTextEventHandler(func) \
    (wxObjectEventFunction)(wxEventFunction)wxStaticCastEvent(wxStyledTextEventFunction, &func)
#define wx__DECLARE_STEVT(evt, id, fn)  wx__DECLARE_EVT1( evt, id, StyledTextEventHandler(fn))

#define EVT_STE_CREATED(id, fn)          EVT_COMMAND(id, wxEVT_STE_CREATED, fn)
#define EVT_STS_CREATED(id, fn)          EVT_COMMAND(id, wxEVT_STS_CREATED, fn)
#define EVT_STN_CREATED(id, fn)          EVT_COMMAND(id, wxEVT_STN_CREATED, fn)

#define EVT_STE_STATE_CHANGED(id, fn)    wx__DECLARE_STEEVT(wxEVT_STE_STATE_CHANGED, id, fn)
#define EVT_STE_SET_FOCUS(id, fn)        wx__DECLARE_STEEVT(wxEVT_STE_SET_FOCUS,     id, fn)
#define EVT_STE_POPUPMENU(id, fn)        wx__DECLARE_STEEVT(wxEVT_STE_POPUPMENU,     id, fn)

#define EVT_STE_MARGINDCLICK(id, fn)     wx__DECLARE_STEVT(wxEVT_STE_MARGINDCLICK,   id, fn)

#define EVT_STS_CREATE_EDITOR(id, fn)    EVT_COMMAND(id, wxEVT_STS_CREATE_EDITOR,   fn)
#define EVT_STN_CREATE_SPLITTER(id, fn)  EVT_COMMAND(id, wxEVT_STN_CREATE_SPLITTER, fn)

#define EVT_STN_PAGE_CHANGED(id, fn)     wx__DECLARE_EVT1(wxEVT_STN_PAGE_CHANGED, id, wxNotebookEventHandler(fn))

#define EVT_STS_SPLIT_BEGIN(id, fn)      wx__DECLARE_EVT1(wxEVT_STS_SPLIT_BEGIN, id, wxCommandEventHandler(fn))

#define EVT_STESHELL_ENTER(id, fn)       wx__DECLARE_STEEVT(wxEVT_STESHELL_ENTER, id, fn)

// include the others so that only this file needs to be included for everything
#include "wx/stedit/stenoteb.h"
#include "wx/stedit/steframe.h"
#include "wx/stedit/stesplit.h"
#include "wx/stedit/steprint.h"
#include "wx/stedit/stemenum.h"
#include "wx/stedit/stedlgs.h"
#include "wx/stedit/stefindr.h"

#endif  // _STEDIT_H_
