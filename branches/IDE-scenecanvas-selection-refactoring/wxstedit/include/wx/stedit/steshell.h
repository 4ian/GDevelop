///////////////////////////////////////////////////////////////////////////////
// Name:        steshell.h
// Purpose:     wxSTEditorShell
// Author:      John Labenski
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STESHELL_H_
#define _STESHELL_H_

#include "wx/stedit/stedefs.h"

//-----------------------------------------------------------------------------
// wxSTEditorShell - A basic console type interactive shell widget,
//                   like a DOS prompt.
//
// The editor shows a caret marker in the STE_MARGIN_MARKER and is readonly
//   whenever the cursor is not on the last line. When the user presses enter
//   a wxEVT_STESHELL_ENTER event is generated, where the event.GetString()
//   containins the text of the last line.
// Since the control updates it's readonly state internally you should
//   surround modifications with BeginWriteable() and EndWriteable() so that
//   while you're in the middle of changing things it won't set set readonly on you.
//-----------------------------------------------------------------------------

enum STE_ShellStyle_Type
{
    STE_SHELL_SINGLELINE = wxCB_SIMPLE // make the shell single line only
                                       // pass this to the constructor as the style
                                       // use Get/SetWindowStyleFlag to access
};

// Set what to do with the cursor for the function wxSTEShell::CaretOnPromptLine
enum STE_CaretPos_Type
{
    STE_CARET_MOVE_NONE     = 0, // don't move cursor
    STE_CARET_MOVE_LASTLINE = 1, // move cursor to the beginning of last line
    STE_CARET_MOVE_ENDTEXT  = 2, // move cursor to the end of text
};

class WXDLLIMPEXP_STEDIT wxSTEditorShell : public wxSTEditor
{
public :
    wxSTEditorShell() : wxSTEditor() { Init(); }

    wxSTEditorShell( wxWindow *parent, wxWindowID id,
                     const wxPoint& pos = wxDefaultPosition,
                     const wxSize& size = wxDefaultSize,
                     long style = 0,
                     const wxString& name = wxT("wxSTEditorShell") )
    {
        Init();
        Create(parent, id, pos, size, style, name);
    }

    virtual ~wxSTEditorShell();

    bool Create( wxWindow *parent, wxWindowID id,
                 const wxPoint& pos = wxDefaultPosition,
                 const wxSize& size = wxDefaultSize,
                 long style = 0,
                 const wxString& name = wxT("wxSTEditorShell") );

    enum margin_markerType
    {
        marginPrompt = STE_MARGIN_MARKER,
        markerPrompt = STE_MARKER__MAX
    };

    // The preferred method to append text to the shell.
    //   If you wish to write to the shell in your own routine be sure to
    //   take note of the code in this function.
    virtual void AppendText(const wxString &text);

    // Set the text currently at the prompt, may be multiline
    virtual void SetPromptText(const wxString& text);

    // Get the text currently on the "cursor" line. The text may be multiline
    //   if the user has pasted multiline text into the shell
    virtual wxString GetPromptText();

    // Block internal updates to the readonly state, surround all cursor
    //   movements or programmatic writes with a begin and endwriteable and
    //   the readonly state will not be updated during your work.
    // For BeginWriteable(make_writeable=true) the editor will be made writeable,
    //   else left in the current state if make_writeable=false.
    void BeginWriteable(bool make_writeable = true);
    // For EndWriteable(check_ro=true) the editor will be set back to readonly
    //   if appropriate or left as is if check_ro = false.
    void EndWriteable(bool check_ro = true);

    // Get the last line with a prompt on it. It may not be the actual last
    //  line for multiline entries
    int GetPromptLine();

    // Is the caret on the last line with a prompt marker?
    //   option sets what to do with it if not already on the last line.
    //   returns if it is on the last line after any changes due to option
    bool CaretOnPromptLine(STE_CaretPos_Type option = STE_CARET_MOVE_NONE);

    // Get the previous/next string last typed in, for up/dn arrows
    //   line is the current string at the cursor for comparison
    wxString GetNextHistoryLine(bool fowards, const wxString &line);
    // Get the current index into the prompt history
    size_t GetHistoryIndex() const { return m_line_history_index; }
    // Get the total number of history items
    size_t GetHistoryCount() const { return m_lineHistoryArray.GetCount(); }
    // Get/Set the maximum number of history lines to store
    //   set to < 0 for unlimited.
    int  GetMaxHistoryLines() const { return m_max_history_lines; }
    void SetMaxHistoryLines(int max_lines);
    // Add a line to the history lines, checks for duplicates and if
    //  set_index_to_last put current history index at end
    void AddHistoryLine(const wxString& string, bool set_index_to_last);

    // Get/Set the maximum number of lines to store.
    //   < 0 for no max number (don't let it get out of hand) default is 10000
    //   overflow_lines allows extra lines to be added beyond max_lines
    //     before deleting a chunk to get back down to max lines.
    //     If overflow_lines = 0 then only max_lines are allowed which can make
    //     continuously appending lines once you reach max_lines slow.
    int  GetMaxLines() const { return m_max_lines; }
    int  GetOverflowLines() const { return m_overflow_lines; }
    bool SetMaxLines(int max_lines, int overflow_lines = 2000);

    // implementation

    // returns if the editor should be readonly (is on last line)
    //    if set then set the proper readonly state
    virtual bool CheckReadOnly(bool set);

    // returns if the last line needs a prompt (margin marker)
    //   if set then set the marker if needed
    virtual bool CheckPrompt(bool set);

    void OnKeyDown(wxKeyEvent &event);
    void OnSTCUpdateUI(wxStyledTextEvent &event);

protected:
    wxArrayString m_lineHistoryArray;
    int m_line_history_index;
    int m_max_history_lines;

    int m_max_lines;
    int m_overflow_lines;

    int m_writeable_count;

private:
    void Init();
    DECLARE_EVENT_TABLE();
    DECLARE_CLASS(wxSTEditorShell);
};

#endif  // _STESHELL_H_

