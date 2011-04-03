///////////////////////////////////////////////////////////////////////////////
// Name:        steshell.cpp
// Purpose:     wxSTEditorShell
// Author:      John Labenski
// Modified by:
// Created:     11/05/2002
// RCS-ID:
// Copyright:   (c) John Labenski
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// For compilers that support precompilation, includes "wx/wx.h".
#include "wx/wxprec.h"

#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif // WX_PRECOMP

#include "wx/stedit/stedit.h"
#include "wx/stedit/steshell.h"

//-----------------------------------------------------------------------------
// wxSTEditorShell
//-----------------------------------------------------------------------------
IMPLEMENT_CLASS(wxSTEditorShell, wxSTEditor)

BEGIN_EVENT_TABLE(wxSTEditorShell, wxSTEditor)
    EVT_KEY_DOWN     (wxSTEditorShell::OnKeyDown)
    EVT_STC_UPDATEUI (wxID_ANY, wxSTEditorShell::OnSTCUpdateUI)
END_EVENT_TABLE()

void wxSTEditorShell::Init()
{
    m_line_history_index = 0;
    m_max_history_lines  = 100;

    m_max_lines          = 10000; // arbitrary, seems reasonable
    m_overflow_lines     = 2000;

    m_writeable_count    = 0;
}

bool wxSTEditorShell::Create(wxWindow *parent, wxWindowID id,
                             const wxPoint& pos, const wxSize& size,
                             long style, const wxString& name)
{
    if (!wxSTEditor::Create(parent, id, pos, size, style, name))
        return false;

    // set this up in case they don't want to bother with the preferences
    SetMarginWidth(STE_MARGIN_NUMBER,0);
    SetMarginWidth(STE_MARGIN_FOLD,0);
    SetMarginWidth(marginPrompt, 16);

    SetMarginType(marginPrompt, wxSTC_MARGIN_SYMBOL);
    SetMarginMask(marginPrompt, 1<<markerPrompt);
    // after creation you can change this to whatever prompt you prefer
    MarkerDefine(markerPrompt, wxSTC_MARK_ARROWS, *wxBLACK, wxColour(255,255,0));
    return true;
}

wxSTEditorShell::~wxSTEditorShell()
{
}

void wxSTEditorShell::AppendText(const wxString &text)
{
    BeginWriteable();                   // make it writeable

    wxSTEditor::AppendText(text);       // write the text
    SetMaxLines(m_max_lines, m_overflow_lines); // check for line count overflow
    GotoPos(GetLength());               // put cursor at end
    EmptyUndoBuffer();                  // don't let them undo what you wrote!
                                        //   but they can undo their own typing

    EndWriteable();                     // end the writeable state
}

void wxSTEditorShell::SetPromptText(const wxString& text)
{
    BeginWriteable();
    int length = GetLength();
    wxString promptText = GetPromptText();
    SetTargetStart(length - promptText.Length());
    SetTargetEnd(length);
    ReplaceTarget(text);
    GotoPos(GetLength());
    EndWriteable();
}

wxString wxSTEditorShell::GetPromptText()
{
    int prompt_line = GetPromptLine();
    wxString text = GetTextRange(PositionFromLine(prompt_line), GetLength());
    return text;
}

void wxSTEditorShell::BeginWriteable(bool make_writeable)
{
    m_writeable_count++;
    if (make_writeable && GetReadOnly())
        SetReadOnly(false);
}
void wxSTEditorShell::EndWriteable(bool check_ro)
{
    if (m_writeable_count > 0)
        m_writeable_count--;

    if (check_ro && (m_writeable_count == 0))
        CheckReadOnly(true);
}

int wxSTEditorShell::GetPromptLine()
{
    int total_lines = GetLineCount();
    return MarkerPrevious(total_lines+1, (1<<markerPrompt));

    // single line entry, return text on last line  FIXME - double check this
    // Scintilla doesn't complain if you enter a line greater than the length to get last prompt
    //int marker = MarkerGet(total_lines);
    //if (((marker & (1<<markerPrompt)) != 0)
    //{
    //    text = GetLineText(total_lines); //.Strip(wxString::both);
    //}
    //else
    //{
    //    int marker_line = MarkerPrevious(total_lines+1, (1<<markerPrompt));
    //}
}

bool wxSTEditorShell::CaretOnPromptLine(STE_CaretPos_Type option)
{
    int prompt_line = GetPromptLine();
    bool on_last    = GetCurrentLine() >= prompt_line;

    //wxPrintf(wxT("Caret on last line total %d current %d onlast %d\n"), total_lines, GetCurrentLine(), (int)on_last);

    if (!on_last && (option != STE_CARET_MOVE_NONE))
    {
        if ((option & STE_CARET_MOVE_LASTLINE) != 0)
            GotoLine(prompt_line);
        else if ((option & STE_CARET_MOVE_ENDTEXT) != 0)
            GotoPos(GetLength());
    }

    return GetCurrentLine() >= prompt_line;
}

bool wxSTEditorShell::CheckReadOnly(bool set)
{
    bool make_ro = !CaretOnPromptLine(STE_CARET_MOVE_NONE);

    if (!make_ro)
    {
        // also check selection and make ro so they can't cut text not on last line
        int prompt_line = GetPromptLine();
        make_ro |= ((LineFromPosition(GetSelectionStart()) < prompt_line) ||
                    (LineFromPosition(GetSelectionEnd())   < prompt_line));
    }

    if (set && (make_ro != GetReadOnly()))
        SetReadOnly(make_ro);

    return make_ro;
}

bool wxSTEditorShell::CheckPrompt(bool set)
{
    int total_lines = GetLineCount();
    total_lines     = wxMax(0, total_lines-1);
    bool has_prompt = (MarkerGet(total_lines) & (1<<markerPrompt)) != 0;

    if (set && !has_prompt)
    {
        MarkerAdd(total_lines, markerPrompt);
        return true;
    }

    return has_prompt;
}

void wxSTEditorShell::OnSTCUpdateUI(wxStyledTextEvent &event)
{
    event.Skip();
    if (m_writeable_count == 0)
        CheckReadOnly(true);
}

wxString wxSTEditorShell::GetNextHistoryLine(bool forwards, const wxString &line)
{
    int count = m_lineHistoryArray.GetCount();

    // no history, just return ""
    if (count == 0)
        return wxEmptyString;

    // return current one if it's different
    if ((m_line_history_index >= 0) && (m_line_history_index < count) &&
        (line != m_lineHistoryArray[m_line_history_index]))
        return m_lineHistoryArray[m_line_history_index];

    if (forwards)
    {
        if (m_line_history_index >= count - 1)
        {
            m_line_history_index = count - 1; // fix it up
            return wxEmptyString;
        }

        m_line_history_index++;
    }
    else // reverse
    {
        if (m_line_history_index < 1) // already checked for empty array
        {
            m_line_history_index = 0; // fix it up
            return wxEmptyString;
        }

        m_line_history_index--;
    }

    return m_lineHistoryArray[m_line_history_index];
}

void wxSTEditorShell::AddHistoryLine(const wxString& string, bool set_index_to_last)
{
    int count = m_lineHistoryArray.GetCount();

    // don't add same line twice
    if ((count > 0) && (string == m_lineHistoryArray[count-1]))
        return;

    m_lineHistoryArray.Add(string);
    if (set_index_to_last)
        m_line_history_index = m_lineHistoryArray.GetCount() - 1;

    SetMaxHistoryLines(GetMaxHistoryLines()); // remove any extra
}

void wxSTEditorShell::SetMaxHistoryLines(int max_lines)
{
    m_max_history_lines = max_lines;

    int extra = int(m_lineHistoryArray.GetCount()) - m_max_history_lines;
    if ((m_max_history_lines >= 0) && (extra > 0))
        m_lineHistoryArray.RemoveAt(0, extra);

    m_line_history_index = wxMin(m_line_history_index, int(m_lineHistoryArray.GetCount())-1);
}

bool wxSTEditorShell::SetMaxLines(int max_lines, int overflow_lines)
{
    m_max_lines = max_lines;
    m_overflow_lines = overflow_lines;
    if (m_max_lines < 0) return false;

    int total_lines = GetLineCount();
    total_lines     = wxMax(0, total_lines-1);

    // delete lines when more than m_max_lines, you'll eventually crash otherwise
    if (total_lines > m_max_lines + m_overflow_lines)
    {
        BeginWriteable();

        int marker = MarkerGet(total_lines - m_max_lines);

        SetTargetStart(0);
        SetTargetEnd(PositionFromLine(total_lines - m_max_lines));
        ReplaceTarget(wxEmptyString);

        // wipe marker that has moved up if there shouldn't be a marker
        if ((marker & (1<<markerPrompt)) == 0)
            MarkerDelete(0, markerPrompt);

        EndWriteable();
        return true;
    }

    return false;
}

void wxSTEditorShell::OnKeyDown(wxKeyEvent &event)
{
    event.Skip(false);
    CheckReadOnly(true);

    switch (event.GetKeyCode())
    {
        case WXK_UP : case WXK_NUMPAD_UP :
        {
            // you can scroll up through multiline entry
            int current_line = GetCurrentLine();
            int prompt_line = GetPromptLine();
            if ((current_line < prompt_line) || (current_line > prompt_line))
                break;

            // up/down arrows go through the history buffer
            wxString promptText = GetPromptText();
            SetPromptText(GetNextHistoryLine(false, promptText));
            return;
        }
        case WXK_DOWN : case WXK_NUMPAD_DOWN :
        {
            // you can scroll down through multiline entry
            int total_lines = GetLineCount();
            total_lines = wxMax(0, total_lines - 1);
            int current_line = GetCurrentLine();
            if (current_line < total_lines)
                break;

            // up/down arrows go through the history buffer
            wxString promptText = GetPromptText();
            SetPromptText(GetNextHistoryLine(true, promptText));
            return;
        }
        case WXK_LEFT : case WXK_NUMPAD_LEFT :
        {
            int current_line = GetCurrentLine();
            int prompt_line = GetPromptLine();
            if (current_line >= prompt_line)
            {
                int caret_pos = 0;
                GetCurLine(&caret_pos);
                if (caret_pos < 1)
                    return;
            }
            break;
        }

        case WXK_PAGEUP   : case WXK_NUMPAD_PAGEUP   : //case WXK_NUMPAD_PAGEUP :
        case WXK_PAGEDOWN : case WXK_NUMPAD_PAGEDOWN : //case WXK_NUMPAD_PAGEDOWN :
        case WXK_END      : case WXK_NUMPAD_END   :
        case WXK_HOME     : case WXK_NUMPAD_HOME  :
        case WXK_RIGHT    : case WXK_NUMPAD_RIGHT :

        case WXK_SHIFT :
        case WXK_CONTROL :
        case WXK_ALT :
        {
            // default processing for these keys
            event.Skip();
            return;
        }

        case WXK_RETURN : case WXK_NUMPAD_ENTER :
        {
            // put cursor at end if not already on the last line
            if (!CaretOnPromptLine(STE_CARET_MOVE_NONE))
            {
                GotoPos(GetLength());
                return;
            }

            int current_line = GetCurrentLine();
            int prompt_line  = GetPromptLine();

            // allow multiline entry for shift+enter
            if ((current_line >= prompt_line) && event.ShiftDown())
            {
                event.Skip();
                return;
            }

            wxString promptText = GetPromptText();

            // goto the end of the line and store the line for the history
            LineEnd();
            if (!promptText.IsEmpty())
                AddHistoryLine(promptText, true);

            // just send the event, the receiver can do what they like
            SendEvent(wxEVT_STESHELL_ENTER, 0, GetState(), promptText);
            return;
        }
        case WXK_BACK :
        {
            // go to the end of the last line if not on last line
            if (!CaretOnPromptLine(STE_CARET_MOVE_NONE))
            {
                GotoPos(GetLength());
                return;
            }
            // don't let them backspace into previous line
            int caret_pos = 0;
            GetCurLine(&caret_pos);
            if (caret_pos < 1)
                return;

            break;
        }
        default : // move cursor to end if not already there
        {
            // reset history to start at most recent again
            m_line_history_index = m_lineHistoryArray.GetCount() - 1;

            CaretOnPromptLine(STE_CARET_MOVE_ENDTEXT);
            break;
        }
    }

    event.Skip();
}
