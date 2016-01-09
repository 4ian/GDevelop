///////////////////////////////////////////////////////////////////////////////
// Name:        stedit.cpp
// Purpose:     wxSTEditor
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// RCS-ID:
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

/**
 * Updated by Florian Rival to use wxWidgets 2.9.x
 * ( ProcessEvent(..) -> GetEventHandler()->ProcessEvent(..) )
 * and (quick and dirty changes) to compile on linux ( wx2stc/utf stuff at the end of file )
 */

/*
Updated to SciTE 1.73, 3/14/05

Code below marked with this copyright is under this license.
"Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>"

License for Scintilla and SciTE

Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>

All Rights Reserved

Permission to use, copy, modify, and distribute this software and its
documentation for any purpose and without fee is hereby granted,
provided that the above copyright notice appear in all copies and that
both that copyright notice and this permission notice appear in
supporting documentation.

NEIL HODGSON DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
SOFTWARE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS, IN NO EVENT SHALL NEIL HODGSON BE LIABLE FOR ANY
SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE
OR PERFORMANCE OF THIS SOFTWARE.
*/

#ifdef __BORLANDC__
    #pragma hdrstop
#endif

// For compilers that support precompilation, includes "wx/wx.h".
#include "wx/wxprec.h"

#ifndef WX_PRECOMP
    #include "wx/wx.h"
    #include "wx/spinctrl.h"
#endif // WX_PRECOMP

#include "wx/stedit/stedit.h"
#include "wx/stedit/steexprt.h"

#include "wx/file.h"
#include "wx/filename.h"
#include "wx/filefn.h"          // wxStat for filesize check
#include "wx/config.h"          // wxConfigBase
#include "wx/docview.h"         // wxFileHistory
#include "wx/printdlg.h"        // wxPageSetupDialog
#include "wx/fileconf.h"        // wxFileConfig
#include "wx/clipbrd.h"         // wxClipboard
#include "wx/tokenzr.h"         // wxStringTokenizer
#include "wx/html/htmprint.h"   // wxHtmlEasyPrint
#include "wx/wfstream.h"        // wxFileInputStream

#include <sys/stat.h>           // to get file size
#include <ctype.h>              // for isprint

//-----------------------------------------------------------------------------
#if wxCHECK_VERSION(2,5,0)
    #include "wx/numdlg.h"
#else

    // This is copied straight from 2.4.2's wxWidgets/src/generic/numdlgg.cpp
    // Note: it sets the spinctrl value using "%lu" so you must reset it
    //       see wxSTEditor::ShowSetZoomDialog
    class WXDLLEXPORT wxNumberEntryDialog : public wxDialog
    {
    public:
        wxNumberEntryDialog(wxWindow *parent,
                            const wxString& message,
                            const wxString& prompt,
                            const wxString& caption,
                            long value, long min, long max,
                            const wxPoint& pos);

        long GetValue() const { return m_value; }

        // implementation only
        void OnOK(wxCommandEvent& event);
        void OnCancel(wxCommandEvent& event);

        //protected: make it public to reset value
        wxSpinCtrl *m_spinctrl;

        long m_value, m_min, m_max;

    private:
        DECLARE_EVENT_TABLE()
    };

#endif // wxCHECK_VERSION(2,5,0)

//-----------------------------------------------------------------------------
// Global data

wxSTEditorFindReplaceData s_wxSTEditor_FindData(wxFR_DOWN|STE_FR_WRAPAROUND);
wxString s_findString; // for sending wxEVT_STE_FIND_CHANGED to update GUI
long s_findFlags = wxFR_DOWN|STE_FR_WRAPAROUND;

const wxString EOLModeStrings[] =
{
    wxT("CRLF (Dos/MS Windows)"),
    wxT("CR (Mac)"),
    wxT("LF (Unix)")
};

wxString STE_DefaultFileName( wxT("untitled.txt") );
wxString STE_DefaultFileExtensions( wxT("Any file (*)|*|")
                                    wxT("Text file (*.txt)|*.txt|")
                                    wxT("C/C++ file (*.c;*.cpp;*.cxx)|*.c;*.cpp;*.cxx|")
                                    wxT("H file (*.h)|*.h|")
                                    wxT("Html file (*.htm;*.html)|*.htm;*.html|")
                                    wxT("Lua file (*.lua)|*.lua|")
                                    wxT("Python file (*.py)|*.py") );

//-----------------------------------------------------------------------------
// wxSTEditorData - data that the styled text editor shares with refed ones
//-----------------------------------------------------------------------------
wxSTEditorRefData::wxSTEditorRefData()
                  :wxObjectRefData(), m_last_autoindent_line(-1),
                                      m_last_autoindent_len(0),
                                      m_steLang_id(STE_LANG_NULL)
{
}

//-----------------------------------------------------------------------------
// wxSTEditor
//-----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditor, wxStyledTextCtrl)

BEGIN_EVENT_TABLE(wxSTEditor, wxStyledTextCtrl)
    EVT_SET_FOCUS            (wxSTEditor::OnSetFocus)

    EVT_RIGHT_UP             (wxSTEditor::OnRightUp)
    EVT_KEY_DOWN             (wxSTEditor::OnKeyDown)
    //EVT_KEY_UP               (wxSTEditor::OnKeyUp)
    EVT_MOUSEWHEEL           (wxSTEditor::OnMouseWheel)
    EVT_SCROLL               (wxSTEditor::OnScroll)
    EVT_SCROLLWIN            (wxSTEditor::OnScrollWin)

    EVT_MENU                 (wxID_ANY, wxSTEditor::OnMenu)

    EVT_STC_CHARADDED        (wxID_ANY, wxSTEditor::OnSTCCharAdded)
    EVT_STC_UPDATEUI         (wxID_ANY, wxSTEditor::OnSTCUpdateUI)
    EVT_STC_MARGINCLICK      (wxID_ANY, wxSTEditor::OnSTCMarginClick)
    EVT_STE_MARGINDCLICK     (wxID_ANY, wxSTEditor::OnSTCMarginDClick)

    EVT_STE_STATE_CHANGED    (wxID_ANY, wxSTEditor::OnSTEState)
    EVT_STE_SET_FOCUS        (wxID_ANY, wxSTEditor::OnSTEFocus)

    EVT_FIND                 (wxID_ANY, wxSTEditor::OnFindDialog)
    EVT_FIND_NEXT            (wxID_ANY, wxSTEditor::OnFindDialog)
    EVT_FIND_REPLACE         (wxID_ANY, wxSTEditor::OnFindDialog)
    EVT_FIND_REPLACE_ALL     (wxID_ANY, wxSTEditor::OnFindDialog)
    EVT_FIND_CLOSE           (wxID_ANY, wxSTEditor::OnFindDialog)
END_EVENT_TABLE()

// This is for wxWin 2.4 which doesn't have a Create function so you can't
//   init the vars before wxSTC starts sending events.
#define STE_INITNAME wxT("*~DuMmY_No-NaMe~*") // not 1337 speak, just unique :)
#define STE_INITRETURN if (!m_sendEvents || IsBeingDeleted() || (GetName() == STE_INITNAME)) return;
#define STE_INITRETURNVAL(a) if (!m_sendEvents || IsBeingDeleted() || (GetName() == STE_INITNAME)) return a;

void wxSTEditor::Init()
{
    m_refData = new wxSTEditorRefData;
    m_sendEvents = false;
    m_activating = false;
    m_state = 0;

    m_marginDClickTime   =  0;
    m_marginDClickLine   = -1;
    m_marginDClickMargin = -1;
}

wxSTEditor::wxSTEditor( wxWindow *parent, wxWindowID id,
                        const wxPoint& pos, const wxSize& size,
                        long style, const wxString &name )
#if !wxCHECK_VERSION(2,5,0)
                 : wxStyledTextCtrl( parent, id, pos, size, style, STE_INITNAME )
#endif // wxCHECK_VERSION(2,5,0)
{
    Init();
    Create(parent, id, pos, size, style, name);
}

#if wxCHECK_VERSION(2,5,0)
bool wxSTEditor::Create( wxWindow *parent, wxWindowID id,
                         const wxPoint& pos, const wxSize& size,
                         long style, const wxString& name )
{
    wxStyledTextCtrl::Create(parent, id, pos, size, style, name);
#else
bool wxSTEditor::Create( wxWindow *WXUNUSED(parent), wxWindowID WXUNUSED(id),
                         const wxPoint& WXUNUSED(pos), const wxSize& size,
                         long WXUNUSED(style), const wxString& name )
{
#endif // wxCHECK_VERSION(2,5,0)

    if ((size.x > 0) && (size.y > 0))
        SetInitialSize(size);

    if (CanPaste())
        m_state |= STE_CANPASTE;

    //SetMarginWidth(0, 0); // for some reason margin 1 is not set to 0
    //SetMarginWidth(1, 0);
    //SetMarginWidth(2, 0);

    SetProperty(wxT("fold"), wxT("1")); // might as well turn them on even if unused

    GetSTERefData()->AddEditor(this);

    // turn on sending events - AFTER vars initialized (for wx2.4)
    SetName(name);
    m_sendEvents = true;

    return true;
}

wxSTEditor* wxSTEditor::Clone(wxWindow *parent, wxWindowID id,
                              const wxPoint& pos, const wxSize& size,
                              long style, const wxString& name) const
{
    wxSTEditor *editor = (wxSTEditor*)GetClassInfo()->CreateObject();
    editor->Create(parent, id, pos, size, style, name);
    return editor;
}

void wxSTEditor::CreateOptions(const wxSTEditorOptions& options)
{
    GetSTERefData()->m_options = options;

    // Ok if they're invalid since that's how we clear them
    RegisterStyles(GetOptions().GetEditorStyles());
    RegisterPrefs(GetOptions().GetEditorPrefs());
    RegisterLangs(GetOptions().GetEditorLangs());

    wxSTEditorMenuManager *steMM = GetOptions().GetMenuManager();

    // create the editor popup menu
    if (steMM && GetOptions().HasEditorOption(STE_CREATE_POPUPMENU) &&
        !GetOptions().GetEditorPopupMenu())
    {
        GetOptions().SetEditorPopupMenu(steMM->CreateEditorPopupMenu(), false);
    }

    // create the accelerator table
    if (steMM && GetOptions().HasEditorOption(STE_CREATE_ACCELTABLE) &&
        (GetOptions().GetEditorPopupMenu() || GetOptions().GetMenuBar()))
    {
        wxAcceleratorTable table(steMM->CreateAcceleratorTable(GetOptions().GetEditorPopupMenu(),
                                                               GetOptions().GetMenuBar()));
        SetAcceleratorTable(table);
    }

    wxCommandEvent event(wxEVT_STE_CREATED, GetId());
    event.SetEventObject(this);
    GetParent()->GetEventHandler()->ProcessEvent(event);
}

wxSTEditor::~wxSTEditor()
{
    // Kill all these so that an extraneous focus event won't make us segfault
    // Yes we're in the destructor... strange things happen
    m_sendEvents = false;

    GetSTERefData()->RemoveEditor(this);

    // don't destroy prefs since we may be a refed editor, remove us though
    if (GetEditorPrefs().Ok())  GetEditorPrefs().RemoveEditor(this);
    if (GetEditorStyles().Ok()) GetEditorStyles().RemoveEditor(this);
    if (GetEditorLangs().Ok())  GetEditorLangs().RemoveEditor(this);

    // if we're a refed editor, release the document
    if (GetRefData()->GetRefCount() > 1)
        ReleaseDocument(GetDocPointer());
}

bool wxSTEditor::Destroy()
{
    // Kill all these so that an extraneous focus event won't make us segfault
    m_sendEvents = false;

    // remove us from everything so nothing can "get at us"
    GetSTERefData()->RemoveEditor(this);

    // don't destroy prefs since we may be a refed editor, remove us though
    if (GetEditorPrefs().Ok())  GetEditorPrefs().RemoveEditor(this);
    if (GetEditorStyles().Ok()) GetEditorStyles().RemoveEditor(this);
    if (GetEditorLangs().Ok())  GetEditorLangs().RemoveEditor(this);

    return wxStyledTextCtrl::Destroy();
}

void wxSTEditor::SetSendSTEEvents(bool send)
{
    m_sendEvents = send;
}

void wxSTEditor::RefEditor(wxSTEditor *origEditor)
{
    wxCHECK_RET(origEditor && (origEditor != this) &&
                (origEditor->GetRefData() != GetRefData()), wxT("Invalid editor to ref"));

    // remove us from the prefs, if any
    if (GetEditorPrefs().Ok())  GetEditorPrefs().RemoveEditor(this);
    if (GetEditorStyles().Ok()) GetEditorStyles().RemoveEditor(this);
    if (GetEditorLangs().Ok())  GetEditorLangs().RemoveEditor(this);

    // remove us from current refData
    GetSTERefData()->RemoveEditor(this);

    // Ref our new data
    Ref(*origEditor);
    // Ref scintilla's editor
    AddRefDocument(origEditor->GetDocPointer());
    SetDocPointer(origEditor->GetDocPointer());

    GetSTERefData()->AddEditor(this);

    // register us into the prefs, if any
    if (GetEditorStyles().Ok()) GetEditorStyles().RegisterEditor(this);
    if (GetEditorPrefs().Ok())  GetEditorPrefs().RegisterEditor(this);
    if (GetEditorLangs().Ok())  GetEditorLangs().RegisterEditor(this);
}

void wxSTEditor::OnSTCUpdateUI(wxStyledTextEvent &event)
{
    STE_INITRETURN

    if (GetEditorPrefs().Ok())
    {
        if (GetEditorPrefs().GetPrefBool(STE_PREF_HIGHLIGHT_BRACES))
            DoBraceMatch();
    }

    UpdateCanDo(true);
    event.Skip(true);
}

void wxSTEditor::UpdateCanDo(bool send_event)
{
    STE_INITRETURN

    long state_change = 0;

    if (HasState(STE_MODIFIED) != GetModify())
    {
        SetStateSingle(STE_MODIFIED, !HasState(STE_MODIFIED));
        state_change |= STE_MODIFIED;
    }
    if (HasState(STE_CANCUT) != CanCut())
    {
        SetStateSingle(STE_CANCUT, !HasState(STE_CANCUT));
        state_change |= STE_CANCUT;
    }
    if (HasState(STE_CANCOPY) != CanCopy())
    {
        SetStateSingle(STE_CANCOPY, !HasState(STE_CANCOPY));
        state_change |= STE_CANCOPY;
    }
    if (HasState(STE_CANPASTE) != (!GetReadOnly() || CanPaste())) // FIXME CanPaste()
    {
        // You get 2 UpdateUI events per key press, the first CanPaste
        // returns false since SelectionContainsProtected->RangeContainsProtected
        // returns true which is a bug in scintilla I think
        //printf("m_canpaste %d %d %d\n", m_canpaste, CanPaste(), GetReadOnly());

        SetStateSingle(STE_CANPASTE, !HasState(STE_CANPASTE));
        state_change |= STE_CANPASTE;
    }
    if (HasState(STE_CANUNDO) != CanUndo())
    {
        SetStateSingle(STE_CANUNDO, !HasState(STE_CANUNDO));
        state_change |= STE_CANUNDO;
    }
    if (HasState(STE_CANREDO) != CanRedo())
    {
        SetStateSingle(STE_CANREDO, !HasState(STE_CANREDO));
        state_change |= STE_CANREDO;
    }
    if (HasState(STE_CANSAVE) != CanSave())
    {
        SetStateSingle(STE_CANSAVE, !HasState(STE_CANSAVE));
        state_change |= STE_CANSAVE;
    }
    if (CanFind() != (GetFindReplaceData() && !GetFindString().IsEmpty()))
    {
        // just reset it to unknown
        SetStateSingle(STE_CANFIND, GetFindReplaceData() && !GetFindString().IsEmpty());
        state_change |= STE_CANFIND;
    }

    if (send_event && (state_change != 0))
        SendEvent(wxEVT_STE_STATE_CHANGED, state_change, GetState(), GetFileName());
}

void wxSTEditor::OnMouseWheel(wxMouseEvent& event)
{
    // FIXME this should be fixed in GTK soon and can be removed in wx > 2.4.2
    //       harmless otherwise.
    if (event.m_linesPerAction == 0)
        event.m_linesPerAction = 3;

    event.Skip();
}

// This is in scintilla/src/Editor.cxx
// const char *ControlCharacterString(unsigned char ch);

// "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL",
// "BS", "HT", "LF", "VT", "FF", "CR", "SO", "SI",
// "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB",
// "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US"

static int ste_ctrlCharLengths[32] = { 3, 3, 3, 3, 3, 3, 3, 3,
                                       2, 2, 2, 2, 2, 2, 2, 2,
                                       3, 3, 3, 3, 3, 3, 3, 3,
                                       3, 2, 3, 3, 2, 2, 2, 2 };

int wxSTEditor::GetLongestLinePixelWidth(int top_line, int bottom_line)
{
    int longest_len   = 0;
    int first_line    = top_line < 0 ? GetFirstVisibleLine() : top_line;
    int line_count    = GetLineCount();
    int lines_visible = LinesOnScreen();
    int last_line     = bottom_line < 0 ? wxMin(line_count, first_line + lines_visible) : bottom_line;
    int tab_width     = GetTabWidth();
    int ctrl_char_symbol = GetControlCharSymbol();

    if (last_line < first_line)
    {
        int tmp = first_line; first_line = last_line; last_line = tmp;
    }

    // FIXME this is not the best solution, but with some luck it'll work
    //       Scintilla should provide this info from its LayoutCache
    for (int n = first_line; n <= last_line; n++)
    {
        int len = LineLength(n);

        int tabs = 0;
        if ((tab_width > 1) && (len*tab_width > longest_len))
        {
            // need to sum up only how much of the tab is used
            wxCharBuffer buf = GetLineRaw(n);
            const char* c = buf.data();
            for (int i = 0; i < len; i++, c++)
            {
                if (*c == '\t')
                    tabs += tab_width - ((i + tabs) % tab_width);
                else if ((ctrl_char_symbol >= 32) && (size_t(*c) < 32))
                {
                    // scintilla writes name of char
                    tabs += ste_ctrlCharLengths[size_t(*c)] - 1;
                }
            }

            //wxPrintf(wxT("line %d len %d pos %d\n"), n, len, len+tabs); fflush(stdout);
        }
        len += tabs + 3; // add a little extra if showing line endings
        if (longest_len < len) longest_len = len;
    }
    return TextWidth(wxSTC_STYLE_DEFAULT, wxString(longest_len, wxT('D')));
}

void wxSTEditor::OnScroll( wxScrollEvent& event )
{
    // this event is from user set wxScrollBars
    event.Skip();
    if (event.GetOrientation() == wxVERTICAL) return;

    wxScrollBar *sb = (wxScrollBar*)event.GetEventObject();
    int pos   = event.GetPosition();
    int thumb = sb->GetThumbSize();
    //int range = sb->GetRange();
    int scroll_width = GetScrollWidth();

    // only check if at scroll end, wxEVT_SCROLL(WIN)_BOTTOM is not reliable
    if (pos + thumb >= scroll_width)
    {
        int longest_len = GetLongestLinePixelWidth();
        if (longest_len > scroll_width)
            SetScrollWidth(longest_len);
            //sb->SetScrollbar(pos, thumb, text_width, true);

        sb->Refresh();
    }
}
void wxSTEditor::OnScrollWin( wxScrollWinEvent& event )
{
    // this event is from this window's builtin scrollbars
    event.Skip();
    if (event.GetOrientation() == wxVERTICAL) return;

    int pos   = event.GetPosition(); //GetScrollPos(wxHORIZONTAL);
    int thumb = GetScrollThumb(wxHORIZONTAL);
    //int range = GetScrollRange(wxHORIZONTAL);
    int scroll_width = GetScrollWidth();

    // only check if at scroll end, wxEVT_SCROLL(WIN)_BOTTOM is not reliable
    if (pos + thumb >= scroll_width)
    {
        int longest_len = GetLongestLinePixelWidth();
        if (longest_len > scroll_width)
            SetScrollWidth(longest_len);
            //SetScrollbar(wxHORIZONTAL, pos, thumb, text_width, true);
    }
}

void wxSTEditor::OnKeyDown(wxKeyEvent& event)
{
    //wxPrintf(wxT("Char %d %d %d\n"), int('c'), event.GetKeyCode(), event.AltDown());

    switch ( event.GetKeyCode() )
    {
        case WXK_RETURN:
        {
            if (event.ControlDown())
            {
                //StartAutoComplete();
                StartAutoCompleteWord(false, true);
                return;
            }
            event.Skip();
            break;
        }
        case WXK_ESCAPE:
        {
            bool has_sel = GetSelectionStart() != GetSelectionEnd();

            // note: Clear() actually deletes the selected text
            if (has_sel)
                SetSelection(GetCurrentPos() , GetCurrentPos());

            event.Skip(); // always allow default processing
            break;
        }
        case WXK_INSERT : // already have ID_STE_SELECT_RECT for Alt-Shift-P
        {
            if (event.AltDown() && event.ShiftDown())
                PasteRectangular();
            else
                event.Skip();

            break;
        }
        case int('y') :
        case int('Y') : // FIXME GTK2 generates 'C' for the key c
        {
            if (event.AltDown())
                RemoveCharsAroundPos();
            else
                event.Skip();

            break;
        }
        default : event.Skip(); break;
    }
}

void wxSTEditor::OnKeyUp(wxKeyEvent& event)
{
    event.Skip();
}

void wxSTEditor_SplitLines(wxSTEditor* editor, int pos, int line_n)
{
    int line_len = editor->LineLength(line_n);
    int edge_col = editor->GetEdgeColumn();

    //wxPrintf(wxT("wxSTEditor_SplitLines\n"));

    if (line_len > edge_col)
    {
        wxString s = editor->GetLineText(line_n);
        size_t n, len = s.Length();

        //wxPrintf(wxT("%d %d '%s'\n"), line_n, len, s.c_str());

        for ( n = edge_col-1; n >= 0; n--)
        {
            if ((s[n] == wxT(' ')) || (s[n] == wxT('\t')))
            {
                wxString keep = s.Mid(0, n);
                wxString split = s.Mid(n+1, len-1);
                //wxPrintf(wxT("'%s' '%s'\n"), keep.c_str(), split.c_str());
                editor->SetLineText(line_n, keep);
                editor->MarkerAdd(line_n, STE_MARKER_BOOKMARK);

                int line_count = editor->GetLineCount();
                wxString next;
                int marker = 0;

                if (line_n + 1 < line_count)
                {
                    marker = editor->MarkerGet(line_n+1);

                    if (marker & (1<<STE_MARKER_BOOKMARK))
                    {
                        next = editor->GetLineText(line_n+1);
                    }
                    else
                    {
                        editor->InsertText(editor->PositionFromLine(line_n+1), wxT("\n"));
                    }
                }

                editor->SetLineText(line_n+1, split+next);
                editor->MarkerAdd(line_n+1, STE_MARKER_BOOKMARK);
                wxSTEditor_SplitLines(editor, pos, line_n+1);


                break;
            }
        }
    }
}

void wxSTEditor::OnSTCCharAdded(wxStyledTextEvent &event)
{
    //ResetLastAutoIndentLine();
    event.Skip();

    const wxChar c = event.GetKey();

    //wxPrintf(wxT("Char added %d '%c'\n"), int(c), c);

    // Change this if support for mac files with \r is needed
    if ((c == wxT('\n')) && GetEditorPrefs().Ok() &&
         GetEditorPrefs().GetPrefBool(STE_PREF_AUTOINDENT))
    {
        const int line = GetCurrentLine();
        const int indent = line < 1 ? 0 : GetLineIndentation(line - 1);

        if (indent != 0)
        {
            // store previous line settings
            GetSTERefData()->m_last_autoindent_line = line;
            GetSTERefData()->m_last_autoindent_len  = GetLineLength(line);

            SetLineIndentation(line, indent);
            GotoPos(GetLineIndentPosition(line));
        }
    }
    else if (0)
    {
        int pos = GetCurrentPos();
        int line_n = LineFromPosition(pos);
        wxSTEditor_SplitLines(this, pos, line_n);
        GotoPos(pos);
    }
}

bool wxSTEditor::ResetLastAutoIndentLine()
{
    int last_autoindent_line = GetSTERefData()->m_last_autoindent_line;
    int last_autoindent_len  = GetSTERefData()->m_last_autoindent_len;

    if (last_autoindent_line < 0)
        return false;
    if (last_autoindent_line > GetLineCount())
    {
        GetSTERefData()->m_last_autoindent_line = -1;
        return false;
    }

    // we're still on the same line
    if (last_autoindent_line == LineFromPosition(GetCurrentPos()))
        return false;

    const int line_len = GetLineLength(last_autoindent_line);
    if (line_len < last_autoindent_len)
    {
        GetSTERefData()->m_last_autoindent_line = -1;
        return false;
    }

    wxString lineString = GetLine(last_autoindent_line);
    if (lineString.Mid(last_autoindent_len).Strip(wxString::both).IsEmpty())
    {
        int line_start = PositionFromLine(last_autoindent_line);
        SetTargetStart(line_start + last_autoindent_len);
        SetTargetEnd(line_start + line_len);
        ReplaceTarget(wxEmptyString);

        GetSTERefData()->m_last_autoindent_line = -1;
        return true;
    }

    return false;
}

void wxSTEditor::OnSTCMarginClick(wxStyledTextEvent &event)
{
    const int line   = LineFromPosition(event.GetPosition());
    const int margin = event.GetMargin();

    wxLongLong t = wxGetLocalTimeMillis();

    wxLongLong last_time   = m_marginDClickTime;
    int        last_line   = m_marginDClickLine;
    int        last_margin = m_marginDClickMargin;

    m_marginDClickTime   = t;
    m_marginDClickLine   = line;
    m_marginDClickMargin = margin;

    if ((t < last_time + 600) && (line   == last_line) &&
                                 (margin == last_margin))
    {
        wxStyledTextEvent dClickEvent(event);
        dClickEvent.SetEventType(wxEVT_STE_MARGINDCLICK);
        // let dclick override this event if not skipped
        if (GetEventHandler()->ProcessEvent( dClickEvent ))
            return;
    }

    // let others process this first
    if ( GetParent()->GetEventHandler()->ProcessEvent( event ) )
        return;

    if (margin == STE_MARGIN_FOLD)
    {
        const int level = GetFoldLevel(line);
        if (STE_HASBIT(level, wxSTC_FOLDLEVELHEADERFLAG))
            ToggleFold(line);
    }
    else
        event.Skip();
}

void wxSTEditor::OnSTCMarginDClick(wxStyledTextEvent &event)
{
    // let others process this first
    if ( GetParent()->GetEventHandler()->ProcessEvent( event ) )
        return;

    const int line = LineFromPosition(event.GetPosition());

    if ((event.GetMargin() == STE_MARGIN_MARKER) &&
        GetEditorPrefs().Ok() &&
        GetEditorPrefs().GetPrefBoolByID(ID_STE_PREF_BOOKMARK_DCLICK))
    {
        // See similiar code for ID_STE_BOOKMARK_TOGGLE
        if ((MarkerGet(line) & (1<<STE_MARKER_BOOKMARK)) != 0)
            MarkerDelete(line, STE_MARKER_BOOKMARK);
        else
            MarkerAdd(line, STE_MARKER_BOOKMARK);
    }
    else
        event.Skip();
}

void wxSTEditor::OnSetFocus(wxFocusEvent &event)
{
    event.Skip();
    STE_INITRETURN
    // in GTK2 you can get a focus event when not shown
    if (!IsShown())
        return;

    // check to make sure that the parent is not being deleted
    wxWindow *parent = GetParent();
    while (parent)
    {
        if (parent->IsBeingDeleted())
        {
            SetSendSTEEvents(false);
            return;
        }

        parent = parent->GetParent();
    }

    SendEvent(wxEVT_STE_SET_FOCUS, 0, GetState(), GetFileName());
}
void wxSTEditor::OnSTEFocus(wxSTEditorEvent &event)
{
    STE_INITRETURN
    if (m_activating)
        return;

    event.Skip();

    UpdateCanDo(false); // no events since nothing happened
    UpdateAllItems();

    // block recursive isaltered, show/close dialog, focus event, isaltered...
    m_activating = true;
    IsAlteredOnDisk(true);
    m_activating = false;
}

bool wxSTEditor::PositionToXY(long pos, long *col, long *row)
{
    if ((pos < 0) || (pos > GetLength()))
    {
        if (col) *col = 0;
        if (row) *row = 0;
        return false;
    }

    int r = LineFromPosition(pos);
    if (row) *row = r;
    if (col) *col = pos - PositionFromLine(r);
    return true;
}

bool wxSTEditor::TranslatePos(int  start_pos,       int  end_pos,
                              int* trans_start_pos, int* trans_end_pos,
                              STE_TranslatePosType type)
{
    int length = GetLength();

    if ((start_pos == 0) && (end_pos == -1))        // do whole document
    {
        end_pos = length;
    }
    else                                            // do selection
    {
        int sel_start = (type == STE_TRANSLATE_SELECTION) ? GetSelectionStart() :
                        (type == STE_TRANSLATE_SELECTION) ? GetTargetStart()    : start_pos;
        int sel_end   = (type == STE_TRANSLATE_SELECTION) ? GetSelectionEnd()   :
                        (type == STE_TRANSLATE_SELECTION) ? GetTargetEnd()      : end_pos;

        if (start_pos < 0) start_pos = sel_start;
        if (end_pos   < 0) end_pos   = sel_end;
    }

    if (start_pos == end_pos)                       // do current line
    {
        int pos   = GetCurrentPos();
        int line  = LineFromPosition(pos);
        start_pos = PositionFromLine(line);
        end_pos   = GetLineEndPosition(line);
    }

    // ensure valid
    start_pos = wxMin(start_pos, length);
    end_pos   = wxMin(end_pos,   length);
    start_pos = wxMax(start_pos, 0);
    end_pos   = wxMax(end_pos,   0);

    // reorder to go from min to max
    if (trans_start_pos) *trans_start_pos = wxMin(start_pos, end_pos);
    if (trans_end_pos  ) *trans_end_pos   = wxMax(start_pos, end_pos);

    return start_pos < end_pos;
}

bool wxSTEditor::TranslateLines(int  top_line,       int  bottom_line,
                                int* trans_top_line, int* trans_bottom_line,
                                STE_TranslatePosType type)
{
    int line_count = GetLineCount() - 1;
    line_count = wxMax(0, line_count);

    if ((top_line == 0) && (bottom_line == -1))     // do whole document
    {
        bottom_line = line_count;
    }
    else                                            // do selection
    {
        int sel_start = (type == STE_TRANSLATE_SELECTION) ? GetSelectionStart() :
                        (type == STE_TRANSLATE_SELECTION) ? GetTargetStart()    : GetCurrentPos();
        int sel_end   = (type == STE_TRANSLATE_SELECTION) ? GetSelectionEnd()   :
                        (type == STE_TRANSLATE_SELECTION) ? GetTargetEnd()      : GetCurrentPos();

        if (top_line < 0)
            top_line = LineFromPosition(sel_start);
        if (bottom_line < 0)
            bottom_line = LineFromPosition(sel_end);
    }

    // ensure valid
    top_line    = wxMin(top_line,    line_count);
    bottom_line = wxMin(bottom_line, line_count);
    top_line    = wxMax(top_line,    0);
    bottom_line = wxMax(bottom_line, 0);

    // reorder to go from min to max
    if (trans_top_line   ) *trans_top_line    = wxMin(top_line, bottom_line);
    if (trans_bottom_line) *trans_bottom_line = wxMax(top_line, bottom_line);

    return top_line < bottom_line;
}

wxString wxSTEditor::GetTargetText()
{
    int target_start = GetTargetStart();
    int target_end   = GetTargetEnd();
    if (target_start == target_end) return wxEmptyString;
    return GetTextRange(wxMin(target_start, target_end), wxMax(target_start, target_end));
}

// function defined in ScintillaWX.cpp
#if wxUSE_DATAOBJ
static wxTextFileType wxSTEConvertEOLMode(int scintillaMode)
{
    wxTextFileType type;

    switch (scintillaMode) {
        case wxSTC_EOL_CRLF:
            type = wxTextFileType_Dos;
            break;

        case wxSTC_EOL_CR:
            type = wxTextFileType_Mac;
            break;

        case wxSTC_EOL_LF:
            type = wxTextFileType_Unix;
            break;

        default:
            type = wxTextBuffer::typeDefault;
            break;
    }
    return type;
}

#endif // wxUSE_DATAOBJ

bool wxSTEditor::PasteRectangular()
{
#if wxUSE_DATAOBJ
    wxTextDataObject data;
    bool gotData = false;

    if (wxTheClipboard->Open()) {
        wxTheClipboard->UsePrimarySelection(false);
        gotData = wxTheClipboard->GetData(data);
        wxTheClipboard->Close();
    }
    if (gotData) {
        wxString text = wxTextBuffer::Translate(data.GetText(),
                                                wxSTEConvertEOLMode(GetEOLMode()));
        PasteRectangular(text, -1);
        return true;
    }
#endif // wxUSE_DATAOBJ
    return false;
}
void wxSTEditor::PasteRectangular(const wxString& str, int pos)
{
    BeginUndoAction();
    //ClearSelection(); // we don't paste into selection for this

    pos = pos > -1 ? pos : GetCurrentPos();

    int line           = LineFromPosition(pos);
    int line_start_pos = PositionFromLine(line);
    int line_end_pos   = GetLineEndPosition(line);
    int line_pos       = pos - line_start_pos;

    wxString eolStr = GetEOLString();

    wxStringTokenizer tkz(str, wxT("\r\n"), wxTOKEN_STRTOK);
    while (tkz.HasMoreTokens())
    {
        if (line >= GetLineCount())
            AppendText(eolStr);

        line_start_pos = PositionFromLine(line);
        line_end_pos   = GetLineEndPosition(line);

        wxString token = tkz.GetNextToken();
        if (line_end_pos < line_start_pos + line_pos)
            InsertText(line_end_pos, wxString(wxT(' '), line_start_pos + line_pos - line_end_pos));

        InsertText(line_start_pos + line_pos, token);
        line = line + 1;
    }

    EndUndoAction();
    NotifyChange();
}

wxString wxSTEditor::GetEOLString(int stc_eol_mode)
{
    if (stc_eol_mode < 0) stc_eol_mode = GetEOLMode();

    switch (stc_eol_mode)
    {
        case wxSTC_EOL_CRLF : return wxT("\r\n");
        case wxSTC_EOL_CR   : return wxT("\r");
        case wxSTC_EOL_LF   : return wxT("\n");
    }

    wxFAIL_MSG(wxT("Invalid EOL mode"));
    return wxT("\n");
}

void wxSTEditor::AppendTextGotoEnd(const wxString &text, bool goto_end)
{
    // stay at end if already there
    if (!goto_end)
        goto_end = (GetCurrentLine() == GetLineCount());

    AppendText(text);
    if (goto_end)
        GotoPos(GetLength());
}

int wxSTEditor::GetLineLength(int line)
{
    return GetLineText(line).Length();
}

wxString wxSTEditor::GetLineText(int line)
{
    wxString lineText = GetLine(line);
    size_t len = lineText.Length();

    if (len > 0)
    {
        if (lineText[len-1] == wxT('\n'))
        {
            if ((len > 1) && (lineText[len-2] == wxT('\r'))) // remove \r\n for DOS
                return lineText.Mid(0, len-2);
            else
                return lineText.Mid(0, len-1);               // remove \n for Unix
        }
        else if (lineText[len-1] == wxT('\r'))               // remove \r for mac
            return lineText.Mid(0, len-1);
    }

    return lineText; // shouldn't happen, but maybe?
}

void wxSTEditor::SetLineText(int line, const wxString& text, bool inc_newline)
{
    wxString prepend;
    int line_count = GetLineCount();

    // add lines if necessary
    if (line >= line_count)
    {
        wxString eolStr = GetEOLString();
        size_t n, count = line - line_count;
        for (n = 0; n <= count; n++)
            prepend += eolStr;

        AppendText(prepend);
    }

    int pos = PositionFromLine(line);
    int line_len = inc_newline ? GetLine(line).Length() : GetLineEndPosition(line) - pos;

    //wxPrintf(wxT("SetLineText l %d lc %d added %d len %d end %d '%s'\n"), line, line_count, line-line_count, GetLine(line).Length() , GetLineEndPosition(line)-pos, text.c_str()); fflush(stdout);

    int target_start = GetTargetStart();
    int target_end   = GetTargetEnd();

    SetTargetStart(pos);
    SetTargetEnd(pos + line_len);
    ReplaceTarget(text);

    int diff = prepend.Length() + text.Length() - line_len;
    SetTargetStart(target_start < pos            ? target_start : target_start + diff);
    SetTargetEnd(  target_end   < pos + line_len ? target_end   : target_end   + diff);
}

size_t wxSTEditor::GetWordCount(const wxString& text) const
{
    size_t n, len = text.Length();
    const wxChar *c = text.GetData();
    size_t count = 0;
    bool new_word = false;

    // a word is a series of wxIsalnum
    for (n = 0; n < len; ++n, ++c)
    {
        if (wxIsalnum(*c))
        {
            if (!new_word)
            {
                new_word = true;
                count++;
            }
        }
        else
            new_word = false;
    }

    return count;
}
size_t wxSTEditor::GetWordCount(int start_pos, int end_pos, STE_TranslatePosType type)
{
    wxString text;
    if (TranslatePos(start_pos, end_pos, &start_pos, &end_pos, type))
        text = GetTextRange(start_pos, end_pos);

    return GetWordCount(text);
}

size_t wxSTEditor::GetWordArrayCount(const wxString& text,
                                     const wxArrayString& words,
                                     wxArrayInt& count,
                                     bool ignoreCase)
{
    size_t total_count = 0;

    count.Clear();
    const size_t word_count = words.GetCount();
    if (word_count == 0)
        return total_count;

    count.Add(0, word_count);
    const wxChar *c = text.GetData();
    size_t n, i, len = text.Length();

    for (n = 0; n < len; ++n, ++c)
    {
        for (i = 0; i < word_count; i++)
        {
            size_t word_len = words[i].Length();
            if (word_len && (len - n >= word_len))
            {
                const wxChar *word_c = words[i].GetData();
                if ((ignoreCase && (wxStrnicmp(c, word_c, word_len) == 0)) ||
                    (wxStrncmp(c, word_c, word_len) == 0))
                {
                    count[i]++;
                    total_count++;
                }
            }
        }
    }
    return total_count;
}

void wxSTEditor::GetEOLCount(int *crlf_, int *cr_, int *lf_, int *tabs_)
{
    int crlf = 0, cr = 0, lf = 0, tabs = 0;
    const wxString text = GetText();
    const wxChar *c = text.GetData();
    size_t n, len = text.Length();

    for (n = 0; n < len; ++n, ++c)
    {
        if ((*c) == wxT('\r'))
        {
            if ((n < len-1) && (c[1] == wxT('\n')))
            {
                ++crlf;
                ++n;
                ++c;
            }
            else
                ++cr;
        }
        else if ((*c) == wxT('\n'))
            ++lf;
        else if ((*c) == wxT('\t'))
            ++tabs;
    }

    if (crlf_) *crlf_ = crlf;
    if (cr_)   *cr_   = cr;
    if (lf_)   *lf_   = lf;
    if (tabs_) *tabs_ = tabs;
}

void wxSTEditor::SetIndentation(int width, int top_line, int bottom_line,
                                STE_TranslatePosType type)
{
    TranslateLines(top_line, bottom_line, &top_line, &bottom_line, type);

    BeginUndoAction();
    for (int n = top_line; n <= bottom_line; n++)
    {
        int indent = GetLineIndentation(n) + width;
        SetLineIndentation(n, wxMax( indent, 0));
    }
    EndUndoAction();
}

size_t wxSTEditor::ConvertTabsToSpaces(bool to_spaces, int start_pos, int end_pos,
                                       STE_TranslatePosType type)
{
    if (!TranslatePos(start_pos, end_pos, &start_pos, &end_pos, type))
        return 0;

    int pos = GetCurrentPos();

    int orig_sel_start = GetSelectionStart();
    int orig_sel_end   = GetSelectionEnd();

    SetTargetStart(start_pos);
    SetTargetEnd(end_pos);
    wxString spaceString;
    if (GetTabWidth() > 0) spaceString = wxString(wxT(' '), GetTabWidth());
    wxString findString    = !to_spaces ? spaceString : wxString(wxT("\t"));
    wxString replaceString =  to_spaces ? spaceString : wxString(wxT("\t"));
    int diff = (int)replaceString.Length() - (int)findString.Length();

    SetSearchFlags(0);
    size_t count = 0;

    BeginUndoAction();
    int find_pos = SearchInTarget(findString);
    while (find_pos >= 0)
    {
        count++;
        ReplaceTarget(replaceString);
        SetTargetStart(find_pos);
        end_pos += diff;
        SetTargetEnd(end_pos);
        find_pos = SearchInTarget(findString);
    }
    EndUndoAction();

    int len = GetTextLength();
    // return cursor to last position
    GotoPos(wxMin(pos, len));
    // reselect what they had
    if (orig_sel_start != orig_sel_end)
    {
        orig_sel_end += int(count)*diff;
        SetSelection(orig_sel_start, orig_sel_end);
    }

    return count;
}

bool wxSTEditor::RemoveTrailingWhitespace(int top_line, int bottom_line)
{
    TranslateLines(top_line, bottom_line, &top_line, &bottom_line);

    bool done = false;
    BeginUndoAction();
    for (int n = top_line; n <= bottom_line; n++)
    {
        const int line_start = PositionFromLine(n);
        const int line_end = GetLineEndPosition(n);
        int pos;
        for (pos = line_end; pos > line_start; pos--)
        {
            const char chr = (char)GetCharAt(pos-1);
            if ((chr != ' ') && (chr != '\t')) break;
        }
        if (pos < line_end)
        {
            done = true;
            SetTargetStart(pos);
            SetTargetEnd(line_end);
            ReplaceTarget(wxEmptyString);
        }
    }
    EndUndoAction();
    return done;
}

bool wxSTEditor::RemoveCharsAroundPos(int pos, const wxString& remove)
{
    if (pos < 0)
        pos = GetCurrentPos();

    if (pos > GetLength()) // yep not >=
        return false;

    int n, line = LineFromPosition(pos);
    int line_start = LineFromPosition(line);
    int line_end   = GetLineEndPosition(line);

    int space_start = pos;
    int space_end   = pos;

    for (n = pos; n > line_start; n--)
    {
        wxChar chr = (wxChar)GetCharAt(n-1);
        if (remove.Find(chr) != wxNOT_FOUND)
            space_start = n-1;
        else
            break;
    }
    for (n = pos; n < line_end; n++)
    {
        wxChar chr = (wxChar)GetCharAt(n);
        if (remove.Find(chr) != wxNOT_FOUND)
            space_end = n+1;
        else
            break;
    }

    if (space_start != space_end)
    {
        SetTargetStart(space_start);
        SetTargetEnd(space_end);
        ReplaceTarget(wxEmptyString);
        return true;
    }
    return false;
}

bool wxSTEditor::InsertTextAtCol(int col, const wxString& text,
                                 int top_line, int bottom_line)
{
    if (text.IsEmpty())
        return false;

    int sel_start = GetSelectionStart();
    int sel_end   = GetSelectionEnd();

    TranslateLines(top_line, bottom_line, &top_line, &bottom_line);

    bool done = false;
    BeginUndoAction();
    for (int n = top_line; n <= bottom_line; n++)
    {
        const int line_start = PositionFromLine(n);
        const int line_end   = GetLineEndPosition(n);
        int pos = col >= 0 ? line_start + col : line_end;
        wxString s(text);

        // if inserting before end of line then pad it
        if (pos > line_end)
        {
            s = wxString(wxT(' '), size_t(pos - line_end)) + text;
            pos = line_end;
        }

        // make sure that the selection stays in same place
        if (pos <= sel_start)
        {
            sel_start += s.Length();
            sel_end   += s.Length();
        }
        else if ((pos >= sel_start) && (pos < sel_end))
            sel_end += s.Length();

        InsertText(pos, s);
    }
    EndUndoAction();

    SetSelection(sel_start, sel_end);
    return done;
}

int wxString_FindFromPos(const wxString& str, const wxString& chars,
                         size_t start_pos = 0)
{
    const wxChar *c = str.GetData() + start_pos;
    size_t len      = str.Length();
    size_t n        = start_pos;

    while (n < len)
    {
        int idx = chars.Find(*c);

        // char in str is in chars and is not a " preceeded by a \, eg. \"
        if ((idx != wxNOT_FOUND) &&
            ( (n == 0) || (*c != wxT('\"')) || (*(c-1) != wxT('\\')) ) )
        {
            return n;
        }

        n++;
        c++;
    }

    return wxNOT_FOUND;
}

bool wxSTEditor::Columnize(int top_line, int bottom_line,
                           const wxString& splitBefore_,
                           const wxString& splitAfter_,
                           const wxString& preserveChars,
                           const wxString& ignoreAfterChars_)
{
    TranslateLines(top_line, bottom_line, &top_line, &bottom_line);

    // only one or no lines
    if (top_line > bottom_line - 1)
        return false;

    // fix up the splitBefore/After by removing any extra whitespace
    wxString splitBefore = splitBefore_;
    splitBefore.Replace(wxT(" "),  wxT(""), true);
    splitBefore.Replace(wxT("\t"), wxT(""), true);
    splitBefore += wxT(" \t");

    wxString splitAfter = splitAfter_;
    splitAfter.Replace(wxT(" "),  wxT(""), true);
    splitAfter.Replace(wxT("\t"), wxT(""), true);

    wxString ignoreAfterChars = ignoreAfterChars_;
    ignoreAfterChars.Replace(wxT(" "),  wxT(""), true);
    ignoreAfterChars.Replace(wxT("\t"), wxT(""), true);

    // parse preserveChars '"" () []' and fill preserveStart with the first
    //   char to start preserving and fill preserveArray with the chars to
    //   end with, eg. preserveStart = '"([', preserveArray = " ) ]
    //   this allows for multiple endings to a single start char
    wxArrayString preserveEndArray;
    wxString preserveStart;

    wxStringTokenizer tkz(preserveChars, wxT(" "), wxTOKEN_STRTOK);
    while ( tkz.HasMoreTokens() )
    {
        wxString token = tkz.GetNextToken();
        preserveStart += token[0];
        preserveEndArray.Add((token.Length() < 2) ? token : token.Mid(1));
    }

    int line, max_start_pos = 0;
    wxArrayInt maxLenArray;
    wxArrayInt *matchStartArray = new wxArrayInt[bottom_line - top_line + 1];
    wxArrayInt *matchLenArray   = new wxArrayInt[bottom_line - top_line + 1];

    for (line = top_line; line <= bottom_line; line++)
    {
        wxString lineText(GetLine(line).Strip(wxString::trailing));
        int n = 0, col = 0, len = lineText.Length();
        const wxChar *c = lineText.GetData();
        bool ignore = false;

        while (n < len)
        {
            // skip whitespace always
            while ((n < len) && ((*c == wxT(' ')) || (*c == wxT('\t')))) { c++; n++; }
            if (n == len) break;
            int match_start = n;

            bool split_before = false;
            bool split_after  = false;

            // iterate through "words" until separator is found
            while (n < len)
            {
                if (!ignore)
                {
                    // if last was split_before, c is not incremented and n == match_start
                    split_before = (n > match_start) && (splitBefore.Find(wxChar(*c)) != wxNOT_FOUND);
                    if (split_before)
                        break;

                    ignore = (ignoreAfterChars.Find(wxChar(*c)) != wxNOT_FOUND);

                    split_after = splitAfter.Find(wxChar(*c)) != wxNOT_FOUND;
                    if (split_after)
                    {
                        c++; n++;
                        break;
                    }
                }

                // second time through, just exit
                if (ignore)
                {
                    c += len - n;
                    n = len;
                    break;
                }


                // leave text between preserve chars alone
                int pre_start = preserveStart.Find(wxChar(*c));
                if (!ignore && (pre_start != wxNOT_FOUND))
                {
                    int ppos = wxString_FindFromPos(lineText, preserveEndArray[pre_start], n+1);
                    if (ppos != wxNOT_FOUND)
                    {
                        c += (ppos - n) + 1;
                        n = ppos + 1;
                        break;
                    }
                }

                c++; n++;
            }

            int match_len = n - match_start;

            // don't drop any chars - case for whitespace then split_before
            if (match_len == 0)
            {
                if (n == len) break; // all done - perhaps whitespace?

                match_len++;
                c++; n++;
            }

            matchStartArray[line-top_line].Add(match_start);
            matchLenArray[line-top_line].Add(match_len);

            //wxPrintf(wxT("line %d col %d start %d len %d\n"), line, col, match_start, match_len);

            // save the max starting position
            if ((col == 0) && (max_start_pos < match_start))
                max_start_pos = match_start;

            // save the max lengths
            if (col >= int(maxLenArray.GetCount()))
                maxLenArray.Add(match_len);
            else if (maxLenArray[col] < match_len)
                maxLenArray[col] = match_len;

            col++;
        }
    }

    for (line = top_line; line <= bottom_line; line++)
    {
        wxString lineText(GetLine(line));
        wxString newLine;
        if (max_start_pos > 0)
            newLine = wxString(wxT(' '), max_start_pos);

        int col, num_cols = matchStartArray[line-top_line].GetCount();
        for (col = 0; col < num_cols; col++)
        {
            int match_start = matchStartArray[line-top_line][col];
            int match_len   = matchLenArray[line-top_line][col];
            newLine += lineText.Mid(match_start, match_len);
            if ((col < num_cols - 1) && (match_len < 1+maxLenArray[col]))
                newLine += wxString(wxT(' '), 1+maxLenArray[col]-match_len);

            //wxPrintf(wxT("'%s' '%s'\n"), lineText.c_str(), newLine.c_str()); fflush(stdout);
        }

        SetLineText(line, newLine, false);
    }

    delete []matchStartArray;
    delete []matchLenArray;

    return true;
}

bool wxSTEditor::ShowInsertTextDialog()
{
    int sel_start  = GetSelectionStart();
    int sel_end    = GetSelectionEnd();
    int line_start = LineFromPosition(sel_start);
    int line_end   = LineFromPosition(sel_end);

    if (line_start != line_end)
    {
        sel_start = PositionFromLine(line_start);
        sel_end   = GetLineEndPosition(line_end);
        SetSelection(sel_start, sel_end);
    }

    wxString initText = GetSelectedText();

    wxSTEditorInsertTextDialog dialog(this);
    dialog.SetText(initText);

    if ( dialog.ShowModal() != wxID_OK )
        return false;

    switch (dialog.GetInsertType())
    {
        case STE_INSERT_TEXT_PREPEND  : return InsertTextAtCol(0, dialog.GetPrependText());
        case STE_INSERT_TEXT_APPEND   : return InsertTextAtCol(-1, dialog.GetAppendText());
        case STE_INSERT_TEXT_ATCOLUMN : return InsertTextAtCol(dialog.GetColumn(), dialog.GetPrependText());
        case STE_INSERT_TEXT_SURROUND :
        {
            wxString prependText = dialog.GetPrependText();
            wxString appendText  = dialog.GetAppendText();

            if (appendText.Length() > 0u)
                InsertText(sel_end, appendText);
            if (prependText.Length() > 0u)
                InsertText(sel_start, prependText);

            sel_start -= prependText.Length();
            sel_end   += prependText.Length();
            SetSelection(sel_start, sel_end);
            return true;
        }
        default : break;
    }

    return false;
}

bool wxSTEditor::ShowColumnizeDialog()
{
    wxString text = GetSelectedText();
    if (text.IsEmpty()) return false;

    wxSTEditorColumnizeDialog dialog(this);
    dialog.GetTestEditor()->RegisterStyles(GetEditorStyles());
    dialog.GetTestEditor()->RegisterLangs(GetEditorLangs());
    dialog.GetTestEditor()->SetLanguage(GetLanguageId());
    dialog.SetText(text);
    dialog.FormatText();
    if ( dialog.ShowModal() != wxID_OK )
        return false;

    ReplaceSelection(dialog.GetText());
    return true;
}

bool wxSTEditor::ShowConvertEOLModeDialog()
{
    int eol_mode = GetEOLMode();

    wxSingleChoiceDialog dialog(this,
                      wxString(_("Current EOL : "))+EOLModeStrings[eol_mode],
                      _("Convert End of Line chars"), 3, EOLModeStrings);
    dialog.SetSelection(eol_mode);

    if ( dialog.ShowModal() != wxID_OK )
        return false;

    int choice = dialog.GetSelection();

    if (GetEditorPrefs().Ok())
        GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_EOL_MODE, choice);
    else
        SetEOLMode(choice);

    ConvertEOLs(choice);
    return true;
}

bool wxSTEditor::ShowSetZoomDialog()
{
    wxNumberEntryDialog numDlg(this,
                               _("Scale font sizes : -10...20 (not all fonts supported)"),
                               wxEmptyString,
                               _("Change text font size"),
                               GetZoom(), -10, 20, wxDefaultPosition);
#if !wxCHECK_VERSION(2,5,0)
    // fix the spinctrl value since src/generic/numdlgg.cpp in 2.4 uses "%lu"
    if (GetZoom() < 0)
        numDlg.m_spinctrl->SetValue(GetZoom());
#endif // wxCHECK_VERSION(2,5,0)

    if (numDlg.ShowModal() == wxID_CANCEL)
        return false;

    int val = numDlg.GetValue();
    if (GetEditorPrefs().Ok())
        GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_ZOOM, val);
    else
        SetZoom(val);

    return true;
}

// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
enum { noPPC, ppcStart, ppcMiddle, ppcEnd, ppcDummy };

int wxSTEditor::IsLinePreprocessorCondition(const wxString &line)
{
    if (!GetEditorLangs().Ok() || line.IsEmpty())
        return noPPC;

    const wxString preprocessorSymbol = GetEditorLangs().GetPreprocessorSymbol(GetLanguageId());
    const wxString preprocCondStart   = GetEditorLangs().GetPreprocessorStart(GetLanguageId());
    const wxString preprocCondMiddle  = GetEditorLangs().GetPreprocessorMid(GetLanguageId());
    const wxString preprocCondEnd     = GetEditorLangs().GetPreprocessorEnd(GetLanguageId());

    const wxChar *currChar = line.GetData();
    wxString word;

    if (!currChar) {
        return false;
    }

    while (wxIsspace(*currChar) && *currChar)
        currChar++;

    if (/*preprocessorSymbol &&*/ (*currChar == preprocessorSymbol))
    {
        currChar++;
        while (wxIsspace(*currChar) && *currChar)
            currChar++;

        while (!wxIsspace(*currChar) && *currChar)
            word += wxString(*currChar++);

        if (preprocCondStart.Contains(word))
            return ppcStart;

        if (preprocCondMiddle.Contains(word))
            return ppcMiddle;

        if (preprocCondEnd.Contains(word))
            return ppcEnd;
    }
    return noPPC;
}

// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
bool wxSTEditor::FindMatchingPreprocessorCondition(
    int &curLine,               ///< Number of the line where to start the search
    int direction,              ///< Direction of search: 1 = forward, -1 = backward
    int condEnd1,               ///< First status of line for which the search is OK
    int condEnd2)               ///< Second one

{
    bool isInside = false;
    wxString line;
    int status, level = 0;
    int maxLines = GetLineCount()-1;

    while ((curLine < maxLines) && (curLine > 0) && !isInside)
    {
        curLine += direction;   // Increment or decrement
        line = GetLine(curLine);
        status = IsLinePreprocessorCondition(line);

        if (((direction == 1) && (status == ppcStart)) || ((direction == -1) && (status == ppcEnd)))
            level++;
        else if ((level > 0) && (((direction == 1) && (status == ppcEnd)) || ((direction == -1) && (status == ppcStart))))
            level--;
        else if ((level == 0) && ((status == condEnd1) || (status == condEnd2)))
            isInside = true;
    }

    return isInside;
}

// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
bool wxSTEditor::FindMatchingPreprocCondPosition(
    bool isForward,             ///< @c true if search forward
    int &mppcAtCaret,           ///< Matching preproc. cond.: current position of caret
    int &mppcMatch)             ///< Matching preproc. cond.: matching position
{
    bool isInside = false;
    int curLine;
    wxString line;
    int status;

    if (!GetEditorLangs().Ok())
        return false;

    // Get current line
    curLine = LineFromPosition(mppcAtCaret);
    line = GetLine(curLine);
    status = IsLinePreprocessorCondition(line);

    switch (status)
    {
        case ppcStart:
        {
            if (isForward)
                isInside = FindMatchingPreprocessorCondition(curLine, 1, ppcMiddle, ppcEnd);
            else
            {
                mppcMatch = mppcAtCaret;
                return true;
            }
            break;
        }
        case ppcMiddle:
        {
            if (isForward)
                isInside = FindMatchingPreprocessorCondition(curLine, 1, ppcMiddle, ppcEnd);
            else
                isInside = FindMatchingPreprocessorCondition(curLine, -1, ppcStart, ppcMiddle);

            break;
        }
        case ppcEnd:
        {
            if (isForward)
            {
                mppcMatch = mppcAtCaret;
                return true;
            }
            else
                isInside = FindMatchingPreprocessorCondition(curLine, -1, ppcStart, ppcMiddle);

            break;
        }
        default:        // Should be noPPC
        {
            if (isForward)
                isInside = FindMatchingPreprocessorCondition(curLine, 1, ppcMiddle, ppcEnd);
            else
                isInside = FindMatchingPreprocessorCondition(curLine, -1, ppcStart, ppcMiddle);

            break;
        }
    }

    if (isInside)
        mppcMatch = PositionFromLine(curLine); //SendEditor(SCI_POSITIONFROMLINE, curLine);

    return isInside;
}

static bool IsBrace(char ch) {
    return ch == '[' || ch == ']' || ch == '(' || ch == ')' || ch == '{' || ch == '}';
}

// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
bool wxSTEditor::DoFindMatchingBracePosition(int &braceAtCaret, int &braceOpposite, bool sloppy)
{
    int maskStyle = (1 << GetStyleBitsNeeded()) - 1;
    bool isInside = false;

    int ste_languageID = GetLanguageId();

    int bracesStyle = GetEditorLangs().Ok() && GetEditorLangs().HasLanguage(ste_languageID)
                         ? GetEditorLangs().GetBracesStyle(ste_languageID) : 10;
    int lexLanguage = GetLexer();
    int bracesStyleCheck = bracesStyle; // FIXME what is this?
    int caretPos = GetCurrentPos();
    braceAtCaret = -1;
    braceOpposite = -1;
    char charBefore = '\0';
    char styleBefore = '\0';
    int lengthDoc = GetLength();
    if ((lengthDoc > 0) && (caretPos > 0))
    {
        // Check to ensure not matching brace that is part of a multibyte character
        if (PositionBefore(caretPos) == (caretPos - 1))
        {
            charBefore = GetCharAt(caretPos-1);
            styleBefore = static_cast<char>(GetStyleAt(caretPos-1)&maskStyle);
        }
    }
    // Priority goes to character before caret
    if (charBefore && IsBrace(charBefore) &&
        ((styleBefore == bracesStyleCheck) || (!bracesStyle)))
    {
        braceAtCaret = caretPos - 1;
    }

    bool colonMode = false;
    if ((lexLanguage == wxSTC_LEX_PYTHON) &&
        (':' == charBefore) && (wxSTC_P_OPERATOR == styleBefore))
    {
        braceAtCaret = caretPos - 1;
        colonMode = true;
    }
    bool isAfter = true;
    if ((lengthDoc > 0) && sloppy && (braceAtCaret < 0) && (caretPos < lengthDoc))
    {
        // No brace found so check other side
        // Check to ensure not matching brace that is part of a multibyte character
        if (PositionAfter(caretPos) == (caretPos + 1))
        {
            char charAfter = GetCharAt(caretPos);
            char styleAfter = static_cast<char>(GetStyleAt(caretPos-1)&maskStyle);
            if (charAfter && IsBrace(charAfter) && ((styleAfter == bracesStyleCheck) || (!bracesStyle)))
            {
                braceAtCaret = caretPos;
                isAfter = false;
            }
            if ((lexLanguage == wxSTC_LEX_PYTHON) &&
                (':' == charAfter) && (wxSTC_P_OPERATOR == styleAfter))
            {
                braceAtCaret = caretPos;
                colonMode = true;
            }
        }
    }
    if (braceAtCaret >= 0)
    {
        if (colonMode)
        {
            int lineStart = LineFromPosition(braceAtCaret);
            int lineMaxSubord = GetLastChild(lineStart, -1);
            braceOpposite = GetLineEndPosition(lineMaxSubord);
        }
        else
            braceOpposite = BraceMatch(braceAtCaret);

        if (braceOpposite > braceAtCaret)
            isInside = isAfter;
        else
            isInside = !isAfter;
    }
    return isInside;
}
// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
void wxSTEditor::DoBraceMatch() {
    //if (!bracesCheck)
    //        return;
    int braceAtCaret = -1;
    int braceOpposite = -1;
    bool bracesSloppy = false; // FIXME added
    DoFindMatchingBracePosition(braceAtCaret, braceOpposite, bracesSloppy);

    //wxPrintf(wxT("Found brace %d, at %d opp %d\n"), int(found), braceAtCaret, braceOpposite);

    if ((braceAtCaret != -1) && (braceOpposite == -1))
    {
        BraceBadLight(braceAtCaret);
        SetHighlightGuide(0);
    }
    else // must run this to unhighlight last hilighted brace
    {
        char chBrace = 0;
		if (braceAtCaret >= 0)
			chBrace = static_cast<char>(GetCharAt(braceAtCaret));

        BraceHighlight(braceAtCaret, braceOpposite);
        int columnAtCaret = GetColumn(braceAtCaret);
        int columnOpposite = GetColumn(braceOpposite);
        if (chBrace == ':')
        {
            int lineStart = LineFromPosition(braceAtCaret);
            int indentPos = GetLineIndentPosition(lineStart);
            int indentPosNext = GetLineIndentPosition(lineStart + 1);
            columnAtCaret = GetColumn(indentPos);
            int columnAtCaretNext = GetColumn(indentPosNext);
            int indentSize = GetIndent();
            if (columnAtCaretNext - indentSize > 1)
                columnAtCaret = columnAtCaretNext - indentSize;
            //Platform::DebugPrintf(": %d %d %d\n", lineStart, indentPos, columnAtCaret);
            if (columnOpposite == 0)        // If the final line of the structure is empty
                columnOpposite = columnAtCaret;
        }

        // they only get hilighted when SetIndentationGuides is set true
        if (GetEditorPrefs().Ok() && GetEditorPrefs().GetPrefInt(STE_PREF_INDENT_GUIDES))
            SetHighlightGuide(wxMin(columnAtCaret, columnOpposite));
    }
}

// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
int wxSTEditor::GetCaretInLine() {
        int caret = GetCurrentPos();            //SendEditor(SCI_GETCURRENTPOS);
        int line = LineFromPosition(caret);     //SendEditor(SCI_LINEFROMPOSITION, caret);
        int lineStart = PositionFromLine(line); //SendEditor(SCI_POSITIONFROMLINE, line);
        return caret - lineStart;
}

wxString wxSTEditor::GetAutoCompleteKeyWords(const wxString& root)
{
    wxString words;
    if (root.IsEmpty()) return words;

    wxArrayString wordArray;
    DoGetAutoCompleteKeyWords(root, wordArray);

    size_t n, word_count = wordArray.GetCount();
    if (word_count > 0)
    {
        words += wordArray[0];

        for (n = 1; n < word_count; n++)
            words += wxT(" ") + wordArray[n];
    }

    return words;
}

size_t wxSTEditor::DoGetAutoCompleteKeyWords(const wxString& root, wxArrayString& wordArray)
{
    wxSTEditorLangs langs(GetEditorLangs());
    int lang_n = GetLanguageId();
    if (!langs.Ok() || !langs.HasLanguage(lang_n)) return 0;

    size_t n, count = 0, keyword_count = langs.GetKeyWordsCount(lang_n);
    for (n = 0; n < keyword_count; n++)
    {
        wxStringTokenizer tkz(langs.GetKeyWords(lang_n, n));
        while ( tkz.HasMoreTokens() )
        {
            wxString token = tkz.GetNextToken();

            if (token.StartsWith(root) && (wordArray.Index(token) == wxNOT_FOUND))
            {
                count++;
                wordArray.Add(token);
            }
        }
    }

    return count;
}

wxString calltipWordCharacters(wxT("_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"));
wxString autoCompleteStartCharacters(calltipWordCharacters);
wxString wordCharacters(wxT("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#")); // FIXME add to langs

// This code copied from SciTEBase.cxx
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
bool wxSTEditor::StartAutoComplete() {
        wxString line = GetLine(GetCurrentLine());
        int current = GetCaretInLine();

        int startword = current;

        startword = WordStartPosition(current, true); // FIXME good enough?

        //while ((startword > 0) &&
        //        ((calltipWordCharacters.Find(line[startword - 1]) != wxNOT_FOUND) ||
        //         (autoCompleteStartCharacters.Find(line[startword - 1]) != wxNOT_FOUND))) {
        //       startword--;
        //}

        wxString root = line.Mid(startword, current - startword);

        if (!root.IsEmpty()) {
                //wxString words; //= apis.GetNearestWords(root.c_str(), root.length(),
                                  //  autoCompleteIgnoreCase, calltipParametersStart[0]);
                wxString words = GetAutoCompleteKeyWords(root);
                if (!words.IsEmpty()) {
                        //EliminateDuplicateWords(words);
                        AutoCompShow(root.Length(), words);
                }
                return true;
        }
        return false;
}

/*
int wxCMPFUNC_CONV wxSTE_StringSort(const wxString& first, const wxString& second)
{
    return first.Cmp(second);
}
int wxCMPFUNC_CONV wxSTE_StringSortNoCase(const wxString& first, const wxString& second)
{
    return first.CmpNoCase(second);
}
*/

// Default characters that can appear in a word
static bool iswordcharforsel(wxChar ch) {
        return !wxStrchr(wxT("\t\n\r !\"#$%&'()*+,-./:;<=>?@[\\]^`{|}~"), ch);
}

// This code copied from SciTEBase.cxx - NOT updated to 1.73
// Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
bool wxSTEditor::StartAutoCompleteWord(bool onlyOneWord, bool add_keywords) {
        bool autoCompleteIgnoreCase = false; // FIXME added

        wxString line = GetLine(GetCurrentLine());
        int current = GetCaretInLine();
//~     if (current >= line.size())
//~             return false;

        int startword = current;
        // Autocompletion of pure numbers is mostly an annoyance
        bool allNumber = true;
        while (startword > 0 && (wordCharacters.Find(line[startword - 1]) != wxNOT_FOUND)) {
                startword--;
                if (line[startword] < wxT('0') || line[startword] > wxT('9')) {
                        allNumber = false;
                }
        }
        if (startword == current || allNumber)
                return true;
        wxString root = line.Mid(startword, current - startword);

        int doclen = GetLength();
        //TextToFind ft = {{0, 0}, 0, {0, 0}};
        //ft.lpstrText = const_cast<char*>(root.c_str());
        //ft.chrg.cpMin = 0;
        //ft.chrg.cpMax = doclen;
        //ft.chrgText.cpMin = 0;
        //ft.chrgText.cpMax = 0;
        int ft_chrg_cpMin = 0;
        const int flags = wxSTC_FIND_WORDSTART | (autoCompleteIgnoreCase ? 0 : wxSTC_FIND_MATCHCASE);
        int posCurrentWord = GetCurrentPos() - root.length();
        unsigned int minWordLength = 0;
        unsigned int nwords = 0;

        // wordsNear contains a list of words separated by single spaces and with a space
        // at the start and end. This makes it easy to search for words.
        wxArrayString wordsNear; //(autoCompleteIgnoreCase ? wxSTE_StringSortNoCase : wxSTE_StringSort);

        if (add_keywords)
            DoGetAutoCompleteKeyWords(root, wordsNear);

        for (;;) {      // search all the document
                //ft.chrg.cpMax = doclen;
                int posFind = FindText(ft_chrg_cpMin, doclen, root, flags);
                if (posFind == -1 || posFind >= doclen)
                        break;
                if (posFind == posCurrentWord) {
                        ft_chrg_cpMin = posFind + root.length();
                        continue;
                }
                // Grab the word and put spaces around it
                const int wordMaxSize = 800;
                wxString wordstart;
                wordstart = GetTextRange(posFind, wxMin(posFind + wordMaxSize - 3, doclen));
                int wordstart_len = wordstart.length();
                int wordend = root.length();
                while ((wordend < wordstart_len) && iswordcharforsel(wordstart[wordend]))
                        wordend++;
                wordstart = wordstart.Mid(0, wordend);
                //wxPrintf(wxT("%d %d '%s'\n"), posFind, wordstart.Find(wxT("current")), wordstart.c_str());
                unsigned int wordlen = wordstart.length();
                if (wordlen > root.length()) {
                        if (wordsNear.Index(wordstart) == wxNOT_FOUND) {   // add a new entry
                                wordsNear.Add(wordstart);
                                if (minWordLength < wordlen)
                                        minWordLength = wordlen;

                                nwords++;
                                if (onlyOneWord && nwords > 1) {
                                        return true;
                                }
                        }
                }
                ft_chrg_cpMin = posFind + wordlen;
        }

        size_t length = wordsNear.GetCount();
        if ((length > 0) && (!onlyOneWord || (minWordLength > root.length()))) {
                wxString words(wordsNear[0]);
                for (size_t n = 1; n < length; n++)
                    words += wxT(" ") + wordsNear[n];

                AutoCompShow(root.length(), words);
        } else {
                AutoCompCancel();
        }
        return true;
}

wxString wxSTEditor::GetFileName() const
{
    return GetSTERefData()->m_fileName;
}

void wxSTEditor::SetFileName(const wxString &fileName, bool send_event)
{
    if (GetSTERefData()->m_fileName != fileName)
    {
        GetSTERefData()->m_fileName = fileName;
        if (send_event)
            SendEvent(wxEVT_STE_STATE_CHANGED, STE_FILENAME, GetState(), fileName);
    }
}

bool wxSTEditor::LoadInputStream(wxInputStream& stream,
                                 const wxString &fileName,
                                 int flags)
{
    wxWindow* parent = this;

    bool noerrdlg = STE_HASBIT(flags, STE_LOAD_NOERRDLG);
    flags = flags & (~STE_LOAD_NOERRDLG); // strip this to match flag

    // We only need to find a suitable parent for the dialog if we may show one
    //  Note: If the dialog parent is not shown, the dialog isn't modal in MSW.
    //        This may happen when loading files before showing this.
    if ((flags == STE_LOAD_QUERY_UNICODE) || !noerrdlg)
    {
        while (parent && !parent->IsShown())
            parent = parent->GetParent();

        // didn't find a suitable parent, use toplevel window of app
        if (!parent)
            parent = wxTheApp->GetTopWindow();
    }

    const wxFileOffset stream_len = stream.GetLength();
    bool ok = (stream_len <= 40000000);
    if (ok)
    {
        ClearAll();
        if (GetEditorPrefs().Ok() && GetEditorPrefs().GetPrefBool(STE_PREF_LOAD_INIT_LANG))
            SetLanguage(fileName);

        const size_t buf_len = wxMin(1024*1024, (size_t)stream_len);
        wxCharBuffer charBuf(buf_len + 2); // add room for terminators
        bool unicode     = false;
        bool has_unicode = false;

        for (int i = 0; ok && !stream.Eof(); i++)
        {
            stream.Read(charBuf.data(), buf_len);
            const size_t last_read = stream.LastRead();
            if (last_read == 0) break;

            charBuf.data()[last_read+0] = 0; // zeroterminate
            charBuf.data()[last_read+1] = 0; // zeroterminate again, could be unicode

            if (i == 0)
            {
                // check for unicode
                has_unicode = ((unsigned char)(charBuf.data()[0]) == 0xff) &&
                              ((unsigned char)(charBuf.data()[1]) == 0xfe);

                // the default is to use unicode if it has it
                unicode = has_unicode;

                if (unicode && (flags == STE_LOAD_QUERY_UNICODE))
                {
                    int ret = wxMessageBox(_("Unicode text file. Convert to Ansi text\?"),
                                           _("Load Unicode\?"),
                                           wxYES_NO | wxCANCEL | wxCENTRE | wxICON_QUESTION,
                                           parent);
                    switch (ret)
                    {
                        case wxYES    : unicode = true;  break;
                        case wxNO     : unicode = false; break;
                        case wxCANCEL :
                        default       : ok = false; break;
                    }
                }
                else if (flags == STE_LOAD_ASCII)
                    unicode = false;
                else if (flags == STE_LOAD_UNICODE)
                    unicode = false;
            }

            if (!ok) break;

            if (unicode)
            {
                // Skip first 2 chars specifying that it's unicode at start,
                //   but only it it really has them.
                const size_t skip = (i == 0) && has_unicode ? 2 : 0;
                const wxString str((wchar_t*)(charBuf.data() + skip), *wxConvCurrent, (last_read - skip)/sizeof(wchar_t));
                AddText(str);

                // this garbles text when compiled in unicode
                //#ifdef wxUSE_UNICODE
                //    AddTextRaw(wxConvertWX2MB(str).data());
                //#else
                //    AddTextRaw(str.GetData());
                //#endif
            }
            else // not unicode text, set it as is
            {
                const wxString str((char*)(charBuf.data()), *wxConvCurrent, last_read);
                AddText(str);

                //AddTextRaw(charBuf.data());
            }

            // at end or it was read all at once
            if (last_read == (size_t)stream_len)
                break;
        }

        if (ok)
        {
            UpdateCanDo(true);
            EmptyUndoBuffer();
            SetSavePoint();
            GotoPos(0);
            ScrollToColumn(0); // extra help to ensure scrolled to 0
                               // otherwise scrolled halfway thru 1st char
            SetFileName(fileName, true);
        }
    }
    else if (!noerrdlg)
    {
        wxMessageBox(_("This file is too large for this editor, sorry."),
            _("Error loading file"), wxOK|wxICON_EXCLAMATION, parent);
    }

    return ok;
}

bool wxSTEditor::LoadFile( const wxString &fileName_,
                           const wxString &extensions_ )
{
    if (GetOptions().HasEditorOption(STE_QUERY_SAVE_MODIFIED) &&
         (QuerySaveIfModified(true) == wxCANCEL))
        return false;

    wxString fileName = fileName_;
    wxString extensions = !extensions_.IsEmpty() ? extensions_ : GetOptions().GetDefaultFileExtensions();

    if (fileName.IsEmpty())
    {
        fileName = GetFileName();
        wxString path;

        if (!fileName.IsEmpty())
        {
            wxFileName fn(fileName);
            path     = fn.GetPath();
            fileName = fn.GetFullName();
        }
        else
            path = GetOptions().GetDefaultFilePath();

        fileName = wxFileSelector(_("Open file"), path, fileName,
                                  wxEmptyString, extensions,
                                  wxFD_OPEN|wxFD_FILE_MUST_EXIST, this);

        if (fileName.IsEmpty())
            return false;
    }

    if (!wxFileExists(fileName))
        return false;

    wxFileName fName(fileName);
    if (!fName.IsAbsolute())
        fName.MakeAbsolute();

    fileName = fName.GetFullPath();
    GetOptions().SetDefaultFilePath(fName.GetPath(wxPATH_GET_VOLUME));

    wxStructStat statstr;
    wxStat( fileName, &statstr );

    if (statstr.st_size > 40000000)
    {
        wxMessageBox(_("This file is too large for this editor, sorry."),
                     _("Error loading file"), wxOK|wxICON_EXCLAMATION, this);

        return false;
    }

    ClearAll();
    if (GetEditorPrefs().Ok() && GetEditorPrefs().GetPrefBool(STE_PREF_LOAD_INIT_LANG))
        SetLanguage( fileName );

    // use streams method to allow loading unicode files
    wxFileInputStream stream(fileName);
    bool ok = stream.IsOk();
    int load_flags = GetEditorPrefs().Ok() ? GetEditorPrefs().GetPrefInt(STE_PREF_LOAD_UNICODE) : STE_LOAD_DEFAULT;
    if (ok)
        ok = LoadInputStream(stream, fileName, load_flags);

    if (!ok)
        return false;

    SetFileModificationTime(fName.GetModificationTime());
    SetFileName(fileName, true);
    UpdateCanDo(true);

    return ok;
}

bool wxSTEditor::SaveFile( bool use_dialog, const wxString &extensions_ )
{
    wxString fileName = GetFileName();
    wxString extensions = !extensions_.IsEmpty() ? extensions_ : GetOptions().GetDefaultFileExtensions();

    // if not a valid filename or it wasn't loaded from disk - force dialog
    if (!fileName.IsEmpty())
    {
        wxFileName fName(fileName);
        if (!fName.IsOk())
            use_dialog = true;
        // make them specify if file wasn't actually loaded from disk
        else if (!GetFileModificationTime().IsValid())
            use_dialog = true;
    }

    if (fileName.IsEmpty() || use_dialog)
    {
        wxString path = GetOptions().GetDefaultFilePath();

        if (!fileName.IsEmpty())
        {
            wxFileName fn(fileName);
            fileName = fn.GetFullName();
            wxString fileNamePath = fn.GetPath();
            if (!fileNamePath.IsEmpty())
                path = fileNamePath;
        }

        fileName = wxFileSelector( _("Save file"), path, fileName,
                                   wxEmptyString, extensions,
                                   wxFD_SAVE|wxFD_OVERWRITE_PROMPT, this );

        if (fileName.IsEmpty()) return false;
    }

    // FIXME check for write permission wxAccess - access

    wxFile file(fileName, wxFile::write);
    if (!file.IsOpened())
    {
        wxMessageBox(_("Error opening file :'") + fileName + wxT("'"),
                     _("Save file error"), wxOK|wxICON_ERROR , this);
        return false;
    }

    if (GetEditorPrefs().Ok())
    {
        if (GetEditorPrefs().GetPrefBool(STE_PREF_SAVE_REMOVE_WHITESP))
            RemoveTrailingWhitespace(0, -1);
        if (GetEditorPrefs().GetPrefBool(STE_PREF_SAVE_CONVERT_EOL))
            ConvertEOLs(GetEditorPrefs().GetPrefInt(STE_PREF_EOL_MODE));
    }

    const wxString st = GetText();

    if (file.Write(st, *wxConvCurrent))
    {
        file.Close();
        wxFileName fName(fileName);
        SetFileModificationTime(fName.GetModificationTime());
        if (use_dialog)
            GetOptions().SetDefaultFilePath(fName.GetPath(wxPATH_GET_VOLUME));

        SetSavePoint();
        SetFileName(fileName, true);
        UpdateCanDo(true);
        return true;
    }

    return false;
}

bool wxSTEditor::NewFile( const wxString &title_ )
{
    if (GetOptions().HasEditorOption(STE_QUERY_SAVE_MODIFIED) &&
         (QuerySaveIfModified(true) == wxCANCEL))
        return false;

    wxString title = title_;

    while (title.IsEmpty())
    {
        title = wxGetTextFromUser(_("New file name"), _("New file"),
                                  GetOptions().GetDefaultFileName(), this);

        if (title.IsEmpty())
            return false;

        if (wxIsWild(title))
        {
            int ret = wxMessageBox(_("The filename contains wildcard characters."),
                                   _("Invalid filename"),
                                   wxOK|wxCANCEL|wxCENTRE|wxICON_ERROR, this);

            if (ret == wxCANCEL)
                return false;
        }
    }

    SetFileModificationTime(wxDateTime()); // set invalid time

    ClearAll();
    EmptyUndoBuffer();
    if (GetEditorPrefs().Ok() && GetEditorPrefs().GetPrefBool(STE_PREF_LOAD_INIT_LANG))
        SetLanguage( title );

    SetFileName(title, true);
    UpdateCanDo(true);
    return true;
}

bool wxSTEditor::ShowExportDialog()
{
    wxSTEditorExportDialog dialog(this);
    wxString fileName = GetFileName();
    int file_format   = dialog.GetFileFormat();
    fileName = dialog.FileNameExtChange(fileName, file_format);
    dialog.SetFileName(fileName);
    if ( dialog.ShowModal() != wxID_OK )
        return false;

    fileName    = dialog.GetFileName();
    file_format = dialog.GetFileFormat();

    wxSTEditorExporter steExport(this);

    return steExport.ExportToFile(file_format, fileName, true, true);
}

int wxSTEditor::QuerySaveIfModified(bool save_file, int style)
{
    if (!IsModified())
        return wxNO;

    bool sendEvents = m_sendEvents;
    m_sendEvents = false; // block focus when dialog closes

    int ret = wxMessageBox(GetFileName()+_("\nHas unsaved changes.\nWould you like to save your file before closing\?"),
                           _("Unsaved changes"),
                           style|wxCENTRE|wxICON_QUESTION, this);

    m_sendEvents = sendEvents;

    if (save_file && (ret == wxYES))
    {
        // use dialog if it wasn't originally loaded from disk
        SaveFile(!GetFileModificationTime().IsValid());
    }

    return ret;
}

bool wxSTEditor::IsAlteredOnDisk(bool show_reload_dialog)
{
    // do we currently have a valid filename and datetime from loading?
    if (GetFileName().IsEmpty()) return false;
    if (!GetFileModificationTime().IsValid()) return false;

    wxLogNull nullLog; // no errors, we handle them ourselves

    wxDateTime fileDT;
    wxFileName fName(GetFileName());

    // The file should exist, unless they moved/deleted it
    if (fName.FileExists())
        fileDT = fName.GetModificationTime();

    if (!fileDT.IsValid())
    {
        // oops, file is gone, just tell them
        if (show_reload_dialog)
        {
            wxMessageBox( GetFileName()+_("\nDoesn't exist on disk anymore."),
                          _("File removed from disk"),
                          wxOK | wxICON_EXCLAMATION, this);
        }

        // reset to unknown, assume they know what they're doing
        SetFileModificationTime(wxDateTime());
        return true;
    }

    bool altered = GetFileModificationTime() != fileDT;

    if (altered && show_reload_dialog)
    {
        int ret = wxMessageBox( _("The file '")+GetFileName()+_("' has been modified externally.\nWould you like to reload the file\?"),
                                _("File changed on disk"),
                                wxYES_NO | wxICON_QUESTION, this);
        if (ret == wxYES)
        {
            // try to put the editor back on the same line after loading
            int visibleLine = GetFirstVisibleLine() + LinesOnScreen();
            int currentPos = GetCurrentPos();
            LoadFile(GetFileName());
            GotoLine(wxMin(visibleLine, GetNumberOfLines()));
            LineScroll(0, -2);
            GotoPos(wxMin(currentPos, GetLength()));
        }
        else
        {
            // reset to unknown, they don't care so don't ask again
            SetFileModificationTime(wxDateTime());
        }
    }

    return altered;
}

wxDateTime wxSTEditor::GetFileModificationTime() const
{
    return GetSTERefData()->m_modifiedTime;
}
void wxSTEditor::SetFileModificationTime(const wxDateTime &dt)
{
    GetSTERefData()->m_modifiedTime = dt;
}

void wxSTEditor::ShowPropertiesDialog()
{
    wxSTEditorPropertiesDialog dlg(this);
    dlg.ShowModal();
}

void wxSTEditor::OnRightUp(wxMouseEvent &event)
{
    wxMenu* popupMenu = GetOptions().GetEditorPopupMenu();
    if (popupMenu)
    {
        UpdateItems(popupMenu);
        if (!SendEvent(wxEVT_STE_POPUPMENU, 0, GetState(), GetFileName()))
            PopupMenu(popupMenu, event.GetPosition());
    }
    else
        event.Skip();
}

void wxSTEditor::OnSTEState(wxSTEditorEvent &event)
{
    STE_INITRETURN
    event.Skip();

    wxMenu    *menu    = GetOptions().GetEditorPopupMenu();
    wxMenuBar *menuBar = GetOptions().GetMenuBar();
    wxToolBar *toolBar = GetOptions().GetToolBar();

    if (!menu && !menuBar && !toolBar)
        return;

    if (event.HasStateChange(STE_CANSAVE))
        STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_SAVE, event.GetStateValue(STE_CANSAVE));

    if (event.HasStateChange(STE_CANCUT))
        STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_CUT, event.GetStateValue(STE_CANCUT));
    if (event.HasStateChange(STE_CANCOPY))
    {
        STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_COPY, event.GetStateValue(STE_CANCOPY));
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_COPY_PRIMARY, event.GetStateValue(STE_CANCOPY));
    }
    if (event.HasStateChange(STE_CANPASTE))
    {
        STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_PASTE, event.GetStateValue(STE_CANPASTE));
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_PASTE_RECT, event.GetStateValue(STE_CANPASTE));
    }
    if (event.HasStateChange(STE_CANUNDO))
        STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_UNDO, event.GetStateValue(STE_CANUNDO));
    if (event.HasStateChange(STE_CANREDO))
        STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_REDO, event.GetStateValue(STE_CANREDO));

    if (event.HasStateChange(STE_CANFIND))
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_FIND_NEXT, event.GetStateValue(STE_CANFIND));
}

void wxSTEditor::UpdateAllItems()
{
    UpdateItems(GetOptions().GetEditorPopupMenu(), GetOptions().GetMenuBar(),
                                                   GetOptions().GetToolBar());
    UpdateItems(GetOptions().GetNotebookPopupMenu());
    UpdateItems(GetOptions().GetSplitterPopupMenu());
}
void wxSTEditor::UpdateItems(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar)
{
    if (!menu && !menuBar && !toolBar) return;

    const bool readonly = GetReadOnly();
    const bool fold = GetMarginWidth(STE_MARGIN_FOLD) > 0;
    const bool sel = GetSelectionStart() != GetSelectionEnd();
    const bool sel_lines = !sel ? false : (LineFromPosition(GetSelectionStart()) !=
                                          (LineFromPosition(GetSelectionEnd())));

    // Edit menu items
    STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_SAVE,  CanSave());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_CUT,   CanCut());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_COPY,  CanCopy());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_COPY_PRIMARY,  CanCopy());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_PASTE, CanPaste());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_PASTE_RECT, CanPaste());

    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LINE_CUT,       !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LINE_DELETE,    !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LINE_TRANSPOSE, !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LINE_DUPLICATE, !readonly);

    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_FIND_NEXT, CanFind());
    STE_MM::DoCheckItem( menu, menuBar, toolBar, ID_STE_FIND_DOWN, GetFindDown());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_REPLACE,   !readonly);

    STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_UNDO, CanUndo());
    STE_MM::DoEnableItem(menu, menuBar, toolBar, wxID_REDO, CanRedo());

    STE_MM::DoCheckItem(menu, menuBar, toolBar, ID_STE_READONLY, readonly);

    // Tool menu items
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_UPPERCASE,       !readonly && sel);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LOWERCASE,       !readonly && sel);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_INCREASE_INDENT, !readonly && sel);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_DECREASE_INDENT, !readonly && sel);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LINES_JOIN,      !readonly && sel_lines);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_LINES_SPLIT,     !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_TABS_TO_SPACES,  !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_SPACES_TO_TABS,  !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_CONVERT_EOL,     !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_TRAILING_WHITESPACE, !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_INSERT_TEXT,     !readonly);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STE_COLUMNIZE,       !readonly && sel_lines);

    // View menu items
    STE_MM::DoSetTextItem(menu, menuBar, ID_STE_PREF_EDGE_COLUMN,
                          wxString::Format(_("Long l&ine guide column (%d)..."), GetEdgeColumn()));

    STE_MM::DoEnableItem(menu,  menuBar, toolBar, ID_STE_FOLDS_TOGGLE_CURRENT, fold);
    STE_MM::DoEnableItem(menu,  menuBar, toolBar, ID_STE_FOLDS_COLLAPSE_LEVEL, fold);
    STE_MM::DoEnableItem(menu,  menuBar, toolBar, ID_STE_FOLDS_EXPAND_LEVEL,   fold);
    STE_MM::DoEnableItem(menu,  menuBar, toolBar, ID_STE_FOLDS_COLLAPSE_ALL,   fold);
    STE_MM::DoEnableItem(menu,  menuBar, toolBar, ID_STE_FOLDS_EXPAND_ALL,     fold);

    STE_MM::DoSetTextItem(menu, menuBar, ID_STE_PREF_ZOOM,
                          wxString::Format(_("&Scale font size (%d)..."), GetZoom()));

    // Pref menu items
    STE_MM::DoSetTextItem(menu, menuBar, ID_STE_PREF_TAB_WIDTH,    wxString::Format(_("Set tab &width (%d)..."), GetTabWidth()));
    STE_MM::DoSetTextItem(menu, menuBar, ID_STE_PREF_INDENT_WIDTH, wxString::Format(_("Set indent wi&dth (%d)..."), GetIndent()));
    STE_MM::DoSetTextItem(menu, menuBar, ID_STE_PREF_EOL_MODE,     _("&EOL Mode (")+EOLModeStrings[GetEOLMode()].BeforeFirst(wxT(' '))+wxT(")..."));

    if (GetEditorPrefs().Ok())
        GetEditorPrefs().UpdateMenuToolItems(menu, menuBar, toolBar);
}

void wxSTEditor::OnMenu(wxCommandEvent& event)
{
    wxSTERecursionGuard guard(m_rGuard_OnMenu);
    if (guard.IsInside()) return;

    if (!HandleMenuEvent(event))
        event.Skip();
}

bool wxSTEditor::HandleMenuEvent(wxCommandEvent& event)
{
    wxSTERecursionGuard guard(m_rGuard_HandleMenuEvent);
    if (guard.IsInside()) return false;

    int win_id = event.GetId();

    switch (win_id)
    {
        // File menu items ----------------------------------------------------
        case wxID_NEW    : NewFile(wxEmptyString); return true;
        case wxID_OPEN   : LoadFile(); return true;
        case wxID_SAVE   : SaveFile(false); return true;
        case wxID_SAVEAS : SaveFile(true); return true;

        case ID_STE_EXPORT : ShowExportDialog(); return true;

        case ID_STE_PROPERTIES : ShowPropertiesDialog(); return true;

        case wxID_PRINT              : ShowPrintDialog(); return true;
        case wxID_PREVIEW            : ShowPrintPreviewDialog(); return true;
        case wxID_PRINT_SETUP        : ShowPrintSetupDialog(); return true;
        case ID_STE_PRINT_PAGE_SETUP : ShowPrintPageSetupDialog(); return true;
        case ID_STE_PRINT_OPTIONS    : ShowPrintOptionsDialog(); return true;
        // Edit menu items ----------------------------------------------------
        case wxID_CUT            : Cut();   return true;
        case wxID_COPY           : Copy();  return true;
        case ID_STE_COPY_PRIMARY :
        {
            if (wxTheClipboard->Open())
            {
                wxString text(GetSelectedText());
                wxTheClipboard->UsePrimarySelection(true);
                wxTheClipboard->SetData(new wxTextDataObject(text));
                wxTheClipboard->Close();
            }
            return true;
        }
        case wxID_PASTE            : Paste(); return true;
        case ID_STE_PASTE_RECT     : PasteRectangular(); return true;
        case ID_STE_PREF_SELECTION_MODE    :
        {
            if (GetEditorPrefs().Ok())
            {
                GetEditorPrefs().SetPrefInt(STE_PREF_SELECTION_MODE,
                    event.IsChecked() ? wxSTC_SEL_RECTANGLE : wxSTC_SEL_STREAM);
            }

            if (event.IsChecked())
                SetSelectionMode(wxSTC_SEL_RECTANGLE);
            else
                Cancel();

            return true;
        }
        case wxID_SELECTALL        : SelectAll(); return true;

        case ID_STE_LINE_CUT       : LineCut(); return true;
        case ID_STE_LINE_COPY      : LineCopy(); return true;
        case ID_STE_LINE_DELETE    : LineDelete(); return true;
        case ID_STE_LINE_TRANSPOSE : LineTranspose(); return true;
        case ID_STE_LINE_DUPLICATE : LineDuplicate(); return true;

        case wxID_FIND        : ShowFindReplaceDialog(true, true); return true;
        case ID_STE_FIND_NEXT :
        {
            // try our parents (stenotebook) to see if they can handle it
            // we need to use a wxFindDialogEvent to set string and flags
            wxFindDialogEvent event(wxEVT_COMMAND_FIND_NEXT, GetId());
            event.SetEventObject(this);
            event.SetFindString(GetFindString());
            int orig_flags = GetFindFlags();
            int flags = orig_flags & ~(STE_FR_FINDALL | STE_FR_BOOKMARKALL);
            event.SetFlags(flags);
            if (!GetParent()->GetEventHandler()->ProcessEvent(event))
                FindString(GetFindString(), GetCurrentPos(), -1, flags);

            // restore flags to how they were before
            SetFindFlags(orig_flags, true);

            return true;
        }
        case ID_STE_FIND_DOWN :
        {
            int flags = GetFindFlags();
            flags = event.IsChecked() ? flags|wxFR_DOWN : flags&(~wxFR_DOWN);
            SetFindFlags(flags, true);
            UpdateAllItems(); // help toolbar get updated
            return true;
        }
        case ID_STE_REPLACE   : ShowFindReplaceDialog(true, false); return true;

        case ID_STE_GOTO_LINE : ShowGotoLineDialog(); return true;

        case wxID_REDO : Redo(); return true;
        case wxID_UNDO : Undo(); return true;

        case ID_STE_READONLY : SetReadOnly(event.IsChecked()); return true;
        // Tools menu items ---------------------------------------------------
        case ID_STE_UPPERCASE   : UpperCase(); /* CmdKeyExecute(wxSTC_CMD_UPPERCASE); */ return true;
        case ID_STE_LOWERCASE   : LowerCase(); /* CmdKeyExecute(wxSTC_CMD_LOWERCASE); */ return true;
        case ID_STE_LINES_JOIN  :
        case ID_STE_LINES_SPLIT :
        {
            SetTargetStart(GetSelectionStart());
            SetTargetEnd(GetSelectionEnd());
            if (win_id == ID_STE_LINES_JOIN)
                LinesJoin();
            else
                LinesSplit(TextWidth(wxSTC_STYLE_DEFAULT, wxString(wxT('W'), GetEdgeColumn())));
            return true;
        }
        case ID_STE_INCREASE_INDENT : SetIndentation(GetIndent()); return true;
        case ID_STE_DECREASE_INDENT : SetIndentation(-GetIndent()); return true;

        case ID_STE_TABS_TO_SPACES  : ConvertTabsToSpaces(true); return true;
        case ID_STE_SPACES_TO_TABS  : ConvertTabsToSpaces(false); return true;
        case ID_STE_CONVERT_EOL     : ShowConvertEOLModeDialog(); return true;

        case ID_STE_TRAILING_WHITESPACE : RemoveTrailingWhitespace(); return true;

        case ID_STE_INSERT_TEXT : ShowInsertTextDialog(); return true;

        case ID_STE_COLUMNIZE : ShowColumnizeDialog(); return true;

        // View menu items ----------------------------------------------------
        case ID_STE_FOLDS_TOGGLE_CURRENT : ToggleFoldAtLine(); return true;

        case ID_STE_FOLDS_COLLAPSE_LEVEL :
        {
            int num = wxGetNumberFromUser(_("Level to collapse all folds to"),
                                          wxEmptyString, _("Collapse folds to level"),
                                          (GetFoldLevel(GetCurrentLine())&wxSTC_FOLDLEVELNUMBERMASK)-wxSTC_FOLDLEVELBASE,
                                          0, wxSTC_FOLDLEVELNUMBERMASK-wxSTC_FOLDLEVELBASE, this);
            if (num >= 0)
                CollapseFoldsToLevel(num);
            return true;
        }
        case ID_STE_FOLDS_EXPAND_LEVEL   :
        {
            int num = wxGetNumberFromUser(_("Level to expand all folds to"),
                                          wxEmptyString, _("Expand folds to level"),
                                          (GetFoldLevel(GetCurrentLine())&wxSTC_FOLDLEVELNUMBERMASK)-wxSTC_FOLDLEVELBASE,
                                          0, wxSTC_FOLDLEVELNUMBERMASK-wxSTC_FOLDLEVELBASE, this);
            if (num >= 0)
                ExpandFoldsToLevel(num);
            return true;
        }
        case ID_STE_FOLDS_COLLAPSE_ALL : CollapseAllFolds();  return true;
        case ID_STE_FOLDS_EXPAND_ALL   : ExpandAllFolds();    return true;
        case ID_STE_PREF_ZOOM          : ShowSetZoomDialog(); return true;
        // Bookmark menu items ------------------------------------------------
        case ID_STE_BOOKMARK_TOGGLE :
        {
            if ((MarkerGet(GetCurrentLine()) & (1<<STE_MARKER_BOOKMARK)) != 0)
                MarkerDelete(GetCurrentLine(), STE_MARKER_BOOKMARK);
            else
                MarkerAdd(GetCurrentLine(), STE_MARKER_BOOKMARK);
            return true;
        }
        case ID_STE_BOOKMARK_FIRST :
        {
            int line = MarkerNext(0, 1<<STE_MARKER_BOOKMARK);
            if (line != -1)
                GotoLine(line);
            return true;
        }
        case ID_STE_BOOKMARK_PREVIOUS :
        {
            // Note: Scintilla is forgiving about invalid line nums (at least for now)
            int line = MarkerPrevious(GetCurrentLine()-1, 1<<STE_MARKER_BOOKMARK);
            if (line != -1)
                GotoLine(line);
            return true;
        }
        case ID_STE_BOOKMARK_NEXT :
        {
            int line = MarkerNext(GetCurrentLine()+1, 1<<STE_MARKER_BOOKMARK);
            if (line != -1)
                GotoLine(line);
            return true;
        }
        case ID_STE_BOOKMARK_LAST :
        {
            int line = MarkerPrevious(GetLineCount(), 1<<STE_MARKER_BOOKMARK);
            if (line != -1)
                GotoLine(line);
            return true;
        }
        case ID_STE_BOOKMARK_CLEAR :
        {
            MarkerDeleteAll(STE_MARKER_BOOKMARK);
            return true;
        }
        // Preference menu items ----------------------------------------------
        case ID_STE_PREFERENCES :
        {
            if (GetEditorPrefs().Ok() || GetEditorStyles().Ok() || GetEditorLangs().Ok())
            {
                wxSTEditorPrefPageData editorData(GetEditorPrefs(),
                                                  GetEditorStyles(),
                                                  GetEditorLangs(),
                                                  GetLanguageId(),
                                                  this);

                wxSTEditorPrefDialog prefDialog(editorData, this, wxID_ANY, _("Editor Preferences"),
                                                wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER);

                prefDialog.ShowModal();
            }

            return true;
        }
        case ID_STE_PREF_EDGE_COLUMN :
        {
            int val = wxGetNumberFromUser(_("Column to show long line marker"),
                                          wxEmptyString, _("Set long line marker"),
                                          GetEdgeColumn(),
                                          0, 255, this);
            if (val >= 0)
            {
                if (GetEditorPrefs().Ok())
                    GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_EDGE_COLUMN, val);
                else
                    SetEdgeColumn(val);
            }

            return true;
        }
        case ID_STE_PREF_TAB_WIDTH :
        {
            int val = wxGetNumberFromUser(_("Characters to expand tabs"),
                                          wxEmptyString, _("Set tab width"),
                                          GetTabWidth(),
                                          0, 255, this);
            if (val >= 0)
            {
                if (GetEditorPrefs().Ok())
                    GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_TAB_WIDTH, val);
                else
                    SetTabWidth(val);
            }

            return true;
        }
        case ID_STE_PREF_INDENT_WIDTH :
        {
            int val = wxGetNumberFromUser(_("Characters to indent"), wxT(""), _("Set indentation width"),
                                          GetIndent(),
                                          0, 255, this);
            if (val >= 0)
            {
                if (GetEditorPrefs().Ok())
                    GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_INDENT_WIDTH, val);
                else
                    SetIndent(val);
            }

            return true;
        }
        case ID_STE_PREF_EOL_MODE :
        {
            int eol_mode = GetEOLMode();
            int val = wxGetSingleChoiceIndex(wxString(_("Current EOL : "))+EOLModeStrings[eol_mode],
                                             _("Select EOL mode"), 3, EOLModeStrings, this);

            if ((val != -1) && (val != eol_mode))
            {
                if (GetEditorPrefs().Ok())
                    GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_EOL_MODE, val);
                else
                    SetEOLMode(val);
            }
            return true;
        }
        case ID_STE_SAVE_PREFERENCES :
        {
            if (wxConfigBase::Get(false))
                GetOptions().SaveConfig(*wxConfigBase::Get(false));

            return true;
        }

        default : break;
    }

    // check if wxSTEditorPref knows this id
    if ( GetEditorPrefs().Ok() && (win_id >= ID_STE_PREF__FIRST) &&
                                  (win_id <= ID_STE_PREF__LAST))
    {
        GetEditorPrefs().SetPrefBoolByID(win_id, event.IsChecked());
        return true;
    }

    return false;
}

void wxSTEditor::ToggleFoldAtLine(int line)
{
    Colourise(0, -1);
    if (line < 0) line = GetCurrentLine();

    if (!STE_HASBIT(GetFoldLevel(line), wxSTC_FOLDLEVELHEADERFLAG))
        line = GetFoldParent(line);
    if (line >= 0)
        ToggleFold(line);
}
void wxSTEditor::ExpandFoldsToLevel(int level, bool expand)
{
    // Help STC figure where folds are, else you need to scroll to bottom before this works
    Colourise(0, -1);

    const int line_n = GetLineCount();
    for (int n = 0; n < line_n; n++)
    {
        int line_level = GetFoldLevel(n);
        if (STE_HASBIT(line_level, wxSTC_FOLDLEVELHEADERFLAG))
        {
            line_level -= wxSTC_FOLDLEVELBASE;
            line_level &= wxSTC_FOLDLEVELNUMBERMASK;

            if ((( expand && (line_level <= level)) ||
                 (!expand && (line_level >= level))) && (GetFoldExpanded(n) != expand))
                ToggleFold(n);
        }
    }

    EnsureCaretVisible(); // seems to keep it in nearly the same place
}

wxSTEditorFindReplaceData *wxSTEditor::GetFindReplaceData() const
{
    return GetOptions().GetFindReplaceData();
}

wxString wxSTEditor::GetFindString() const
{
    wxCHECK_MSG(GetFindReplaceData(), wxEmptyString, wxT("Invalid find/replace data"));
    return GetFindReplaceData()->GetFindString();
}

wxString wxSTEditor::GetReplaceString() const
{
    wxCHECK_MSG(GetFindReplaceData(), wxEmptyString, wxT("Invalid find/replace data"));
    return GetFindReplaceData()->GetReplaceString();
}

int wxSTEditor::GetFindFlags() const
{
    wxCHECK_MSG(GetFindReplaceData(), 0, wxT("Invalid find/replace data"));
    return GetFindReplaceData()->GetFlags();
}

void wxSTEditor::ShowFindReplaceDialog(bool show, bool find)
{
    wxCHECK_RET(GetFindReplaceData(), wxT("Invalid find/replace data"));
    wxSTEditorFindReplaceDialog *oldDialog = wxDynamicCast(wxWindow::FindWindowByName(wxSTEditorFindReplaceDialogNameStr), wxSTEditorFindReplaceDialog);

    if (oldDialog)
    {
        oldDialog->Show(false);
        oldDialog->Destroy();
        oldDialog = NULL;
        wxSafeYield();
    }

    if (show)
    {
        int style = STE_FR_NOALLDOCS;

        wxWindow *parent = GetParent();

        // try to set parent to notebook if possible
        while (parent && (wxDynamicCast(parent, wxSTEditorNotebook) == NULL))
            parent = parent->GetParent();

        // if we found a notebook then use it
        if (parent && wxDynamicCast(parent, wxSTEditorNotebook))
        {
            style = 0;
        }
        else
        {
            parent = GetParent();
            // try to set parent to splitter if possible
            if (wxDynamicCast(parent, wxSTEditorSplitter) == NULL)
                parent = this;
        }

        //style |= wxSTAY_ON_TOP; // it's annoying when it gets hidden
        SetStateSingle(STE_CANFIND, !GetFindString().IsEmpty());

        wxString selectedText = GetSelectedText();
        if (!selectedText.IsEmpty() && (selectedText.Length() < 100u))
            SetFindString(selectedText, true);

        wxSTEditorFindReplaceDialog *frDialog = NULL;

        if (find)
        {
            frDialog = new wxSTEditorFindReplaceDialog(parent,
                               GetFindReplaceData(), _("Find dialog"),
                               style);
        }
        else // replace
        {
            style |= wxFR_REPLACEDIALOG;
            frDialog = new wxSTEditorFindReplaceDialog(parent,
                               GetFindReplaceData(), _("Replace dialog"),
                               style);
        }

        frDialog->Show(true);
    }
}

void wxSTEditor::OnFindDialog(wxFindDialogEvent& event)
{
    wxSTERecursionGuard guard(m_rGuard_OnFindDialog);
    if (guard.IsInside()) return;

    // deal with this event if not all docs, else grandparent notebook will do it
    if (!STE_HASBIT(event.GetFlags(), STE_FR_ALLDOCS))
        HandleFindDialogEvent(event);
    else
        event.Skip(true);
}

void wxSTEditor::HandleFindDialogEvent(wxFindDialogEvent& event)
{
    wxCHECK_RET(GetFindReplaceData(), wxT("Invalid find/replace data"));

    wxEventType eventType = event.GetEventType();
    wxString findString   = event.GetFindString();
    long flags            = event.GetFlags();

    SetStateSingle(STE_CANFIND, !findString.IsEmpty());
    SetFindString(findString, true);
    SetFindFlags(flags, true);

    int pos = GetCurrentPos();
    if ((eventType == wxEVT_COMMAND_FIND) && STE_HASBIT(flags, STE_FR_WHOLEDOC))
        pos = -1;

    // we have to move cursor to start of word if last backwards search suceeded
    //   note cmp is ok since regexp doesn't handle searching backwards
    if ((eventType == wxEVT_COMMAND_FIND_NEXT) && !STE_HASBIT(flags, wxFR_DOWN))
    {
        if ((labs(GetSelectionEnd() - GetSelectionStart()) == long(findString.Length()))
            && (GetFindReplaceData()->StringCmp(findString, GetSelectedText(), flags)))
                pos -= findString.Length() + 1; // doesn't matter if it matches or not, skip it
    }

    if ((eventType == wxEVT_COMMAND_FIND) || (eventType == wxEVT_COMMAND_FIND_NEXT))
    {
        // ExtraLong is the line number pressed in the find all editor
        //  when -1 it means that we want a new find all search
        if (STE_HASBIT(flags, STE_FR_FINDALL) && (event.GetExtraLong() > -1))
        {
            wxString str = GetFindReplaceData()->GetFindAllStrings()->Item(event.GetExtraLong());
            long editor = 0;
            wxCHECK_RET(str.BeforeFirst(wxT('@')).ToLong(&editor), wxT("Invalid editor in find all str"));
            // just a sanity check to make sure we're good
            if (editor == (long)this)
            {
                long start_pos = 0;
                long end_pos = 0;
                wxString s = str.AfterFirst(wxT('@'));
                wxCHECK_RET(s.BeforeFirst(wxT(',')).ToLong(&start_pos), wxT("Invalid start pos in find all str"));
                s = str.AfterFirst(wxT(','));
                wxCHECK_RET(s.BeforeFirst(wxT('|')).ToLong(&end_pos), wxT("Invalid end pos in find all str"));
                GotoPos(start_pos);
                SetSelection(start_pos, end_pos);
            }
        }
        else if (STE_HASBIT(flags, STE_FR_FINDALL|STE_FR_BOOKMARKALL))
        {
            wxArrayString* findAllStrings = GetFindReplaceData()->GetFindAllStrings();
            wxArrayInt startPositions;
            wxArrayInt endPositions;
            size_t n, count = FindAllStrings(findString, flags,
                                             &startPositions, &endPositions);

            wxString name = wxFileName(GetFileName()).GetFullName();

            for (n = 0; n < count; n++)
            {
                int line = LineFromPosition(startPositions[n]);
                if (STE_HASBIT(flags, STE_FR_BOOKMARKALL))
                    MarkerAdd(line, STE_MARKER_BOOKMARK);

                if (STE_HASBIT(flags, STE_FR_FINDALL))
                {
                    wxString str;
                    str += wxString::Format(wxT("%ld@%d,%d|%s (%4d) "),
                            (long)this, startPositions[n], endPositions[n],
                            name.c_str(), line+1);
                    str += GetLine(line);
                    findAllStrings->Add(str);
                }
            }
        }
        else
        {
            pos = FindString(findString, pos, -1, flags, STE_FINDSTRING_SELECT|STE_FINDSTRING_GOTO);

        /*
            // alternate way to do this, but our method is more flexible
            SearchAnchor();
            if (STE_HASBIT(flags, wxFR_DOWN))
                pos = SearchNext(flags, findString);
            else
                pos = SearchPrev(flags, findString);
        */

        // FIXME - dialog for find no more occurances is annoying
        // if (pos < 0)
        // wxMessageBox(_("No more occurances of: \"") + findString + _("\""),
        //              _("Find string"), wxOK | wxICON_EXCLAMATION, this);

            if (pos >= 0)
            {
                //SetFocus(); FIXME
            }
            else
            {
                wxBell(); // bell ok to signify no more occurances?
                SetStateSingle(STE_CANFIND, false);
            }
        }
    }
    else if (eventType == wxEVT_COMMAND_FIND_REPLACE)
    {
        if (!SelectionIsFindString(findString, flags))
        {
            wxBell();
            return;
        }

        pos = GetSelectionStart();
        wxString replaceString = event.GetReplaceString();
        ReplaceSelection(replaceString);
        GotoPos(pos); // makes first part of selection visible
        SetSelection(pos, pos + replaceString.Length());
        //SetFocus();
    }
    else if (eventType == wxEVT_COMMAND_FIND_REPLACE_ALL)
    {
        wxString replaceString = event.GetReplaceString();
        if (findString == replaceString)
            return;

        int count = 0;

        {
            wxBusyCursor busy;
            count = ReplaceAllStrings(findString, replaceString, flags);
        }

        wxString msg = wxString::Format(_("Replaced %d occurances of\n'%s' with '%s'."),
                             count, findString.c_str(), replaceString.c_str());

        wxWindow* parent = wxDynamicCast(event.GetEventObject(), wxWindow);
        wxMessageBox( msg, _("Finished replacing"),
                      wxOK|wxICON_INFORMATION,
                      parent ? parent : this);

        SetStateSingle(STE_CANFIND, false);
    }
    else if (eventType == wxEVT_COMMAND_FIND_CLOSE)
    {
        //if (wxDynamicCast(event.GetEventObject(), wxDialog))
        //    ((wxDialog*)event.GetEventObject())->Destroy();
    }
}

void wxSTEditor::SetFindString(const wxString &findString, bool send_evt)
{
    GetFindReplaceData()->SetFindString(findString);
    if (!findString.IsEmpty())
        GetFindReplaceData()->AddFindString(findString);

    if (send_evt && (s_findString != findString))
    {
        SetStateSingle(STE_CANFIND, !findString.IsEmpty());

        s_findString = findString;
        SendEvent(wxEVT_STE_STATE_CHANGED, STE_CANFIND, GetState(), findString);
    }
}
void wxSTEditor::SetFindFlags(long flags, bool send_evt)
{
    GetFindReplaceData()->SetFlags(flags);

    if (send_evt && (s_findFlags != flags))
    {
        s_findFlags = flags;
        SendEvent(wxEVT_STE_STATE_CHANGED, STE_CANFIND, GetState(), GetFileName());
    }
}

int wxSTEditor::FindString(const wxString &findString,
                           int start_pos, int end_pos,
                           int flags,
                           int action,
                           int *found_start_pos, int *found_end_pos)
{
    if (findString.IsEmpty())
        return wxNOT_FOUND;

    SetFindString(findString, true);

    if (flags == -1) flags = GetFindFlags();
    int sci_flags = wxSTEditorFindReplaceData::STEToScintillaFlags(flags);
    SetSearchFlags(sci_flags);

    int textLength = GetTextLength();

    if (STE_HASBIT(flags, wxFR_DOWN))
    {
        start_pos = (start_pos == -1) ? GetCurrentPos() : wxMax(0, wxMin(start_pos, textLength));
        end_pos   = (end_pos   == -1) ? textLength      : wxMax(0, wxMin(end_pos,   textLength));
        int s_pos = wxMin(start_pos, end_pos);
        int e_pos = wxMax(start_pos, end_pos);
        start_pos = s_pos;
        end_pos   = e_pos;
    }
    else
    {
        start_pos = (start_pos == -1) ? GetCurrentPos() : wxMax(0, wxMin(start_pos, textLength));
        end_pos   = (end_pos   == -1) ? 0               : wxMax(0, wxMin(end_pos,   textLength));
        int s_pos = wxMax(start_pos, end_pos);
        int e_pos = wxMin(start_pos, end_pos);
        start_pos = s_pos;
        end_pos   = e_pos;
    }

    // set the target to search within
    int target_start = GetTargetStart();
    int target_end   = GetTargetEnd();
    SetTargetStart(start_pos);
    SetTargetEnd(end_pos);

    // search for the string in target, target is changed to surround string
    int pos = SearchInTarget(findString);
    int search_target_start = GetTargetStart();
    int search_target_end   = GetTargetEnd();
    if (found_start_pos) *found_start_pos = search_target_start;
    if (found_end_pos  ) *found_end_pos   = search_target_end;

    // replace target to what it used to be
    SetTargetStart(target_start);
    SetTargetEnd(target_end);

    //wxPrintf(wxT("Find start %d end %d pos %d\n"), start_pos, end_pos, pos); fflush(stdout);

    if (pos >= 0)
    {
        if (STE_HASBIT(action, STE_FINDSTRING_GOTO))
            GotoPos(pos); // makes first part of selection visible
        if (STE_HASBIT(action, STE_FINDSTRING_SELECT))
            SetSelection(search_target_start, search_target_end);
    }
    else if (STE_HASBIT(flags, STE_FR_WRAPAROUND))
    {
        flags &= (~STE_FR_WRAPAROUND); // don't allow another recursion
        if (STE_HASBIT(flags, wxFR_DOWN))
        {
            pos = FindString(findString, 0, -1, flags, action,
                             found_start_pos, found_end_pos);
        }
        else
        {
            pos = FindString(findString, textLength, -1, flags, action,
                             found_start_pos, found_end_pos);
        }
    }

    return pos;
}

bool wxSTEditor::SelectionIsFindString(const wxString &findString, int flags)
{
    if (findString.IsEmpty()) return false;
    if (flags == -1) flags = GetFindFlags();
    bool is_found = false;

    flags &= (~STE_FR_WRAPAROUND); // just search selected text

    int sel_start = GetSelectionStart();
    int sel_end   = GetSelectionEnd();

    if (sel_start == sel_end) return false;

    int found_start_pos = 0;
    int found_end_pos   = 0;

    int find_pos = FindString(findString, sel_start, sel_end, flags, STE_FINDSTRING_NOTHING,
                              &found_start_pos, &found_end_pos);

    if ((find_pos != -1) && (found_start_pos == sel_start) && (found_end_pos == sel_end))
        is_found = true;

    return is_found;
}

int wxSTEditor::ReplaceAllStrings(const wxString &findString,
                                  const wxString &replaceString,
                                  int flags)
{
    if (findString.IsEmpty() || (findString == replaceString))
        return 0;

    int count = 0;
    int replace_len = replaceString.Length();
    if (flags == -1) flags = GetFindFlags();
    flags = (flags | wxFR_DOWN) & (~STE_FR_WRAPAROUND); // do it in a single pass
    int cursor_pos = GetCurrentPos();  // return here when done

    int found_start_pos = 0;
    int found_end_pos   = 0;
    int pos = FindString(findString, 0, -1, flags, STE_FINDSTRING_NOTHING,
                         &found_start_pos, &found_end_pos);

    while (pos != -1)
    {
        ++count;
        SetTargetStart(found_start_pos);
        SetTargetEnd(found_end_pos);
        if (STE_HASBIT(flags, STE_FR_REGEXP))
            replace_len = ReplaceTargetRE(replaceString);
        else
            replace_len = ReplaceTarget(replaceString);

        // back up original cursor position to the "same" place
        if (pos < cursor_pos)
            cursor_pos += (replace_len - (found_end_pos-found_start_pos));

        pos = FindString(findString, pos + replace_len, -1, flags, STE_FINDSTRING_NOTHING,
                         &found_start_pos, &found_end_pos);
    }

    // return to starting pos or as close as possible
    //GotoPos(wxMin(cursor_pos, GetLength()));

    SetStateSingle(STE_CANFIND, findString != GetFindString());

    // extra check here since we've modified it, but it might not get an UI event
    if (count > 0)
        UpdateCanDo(true);

    return count;
}

size_t wxSTEditor::FindAllStrings(const wxString &str, int flags,
                                  wxArrayInt* startPositions,
                                  wxArrayInt* endPositions)
{
    // just start at beginning and look forward
    if (flags == -1) flags = GetFindFlags();
    flags = (flags | wxFR_DOWN) & (~STE_FR_WRAPAROUND); // do it in a single pass

    int found_start_pos = 0;
    int found_end_pos   = 0;
    size_t count = 0;

    int pos = FindString(str, 0, -1, flags, STE_FINDSTRING_NOTHING, &found_start_pos, &found_end_pos);
    wxArrayInt positions;

    while (pos != -1)
    {
        count++;
        if (startPositions) startPositions->Add(found_start_pos);
        if (endPositions  ) endPositions->Add(found_end_pos);
        pos = FindString(str, found_end_pos, -1, flags, STE_FINDSTRING_NOTHING, &found_start_pos, &found_end_pos);
    }

    return count;
}

void wxSTEditor::SetIndicator(int pos, int len, int indic)
{
    StartStyling(pos, wxSTC_INDICS_MASK);
    SetStyling(len, indic);
}

bool wxSTEditor::IndicateAllStrings(const wxString &str,
                                    int flags, int indic)
{
    wxString findString = str.IsEmpty() ? GetFindString() : str;
    if (flags == -1) flags = GetFindFlags();

    wxArrayInt startPositions;
    wxArrayInt endPositions;
    size_t count = FindAllStrings(findString, flags,
                                  &startPositions, &endPositions);

    for (size_t n = 0; n < count; n++)
    {
        SetIndicator(startPositions[n],
                     endPositions[n] - startPositions[n], indic);
    }

    return count != 0;
}

bool wxSTEditor::ClearIndicator(int pos, int indic)
{
    int sty = GetStyleAt(pos);

    if (STE_HASBIT(sty, indic))
    {
        sty &= (~indic);
        StartStyling(pos, wxSTC_INDICS_MASK);
        SetStyling(1, sty);
        return true;
    }
    else
        return false;
}

int wxSTEditor::ClearIndication(int pos, int indic)
{
    int len = GetLength();
    int n = pos;

    for (n = pos; n > 0; n--)
    {
        if (!ClearIndicator(n, indic))
            break;
    }

    for (n = pos; n < len; n++)
    {
        if (!ClearIndicator(n, indic))
            break;
    }

    return n-1;
}

void wxSTEditor::ClearAllIndicators(int indic)
{
    int n, len = GetLength();
    for (n = 0; n < len; n++)
        ClearIndicator(n, indic);
}

bool wxSTEditor::ShowGotoLineDialog()
{
    wxString msg = wxString::Format(_("Line number : 1...%d"), GetLineCount());
    long line = wxGetNumberFromUser(msg, wxEmptyString, _("Goto line"),
                                    GetCurrentLine()+1, 1, GetLineCount(), this);

    if (line > 0)
    {
        GotoLine(line-1);
        return true;
    }
    return false;
}

bool wxSTEditor::ShowPrintDialog()
{
#if STE_USE_HTML_PRINT
    wxHtmlEasyPrinting htmlPrint(_("Print document"));
    *htmlPrint.GetPrintData()     = *wxSTEditorPrintout::GetPrintData(true);
    *htmlPrint.GetPageSetupData() = *wxSTEditorPrintout::GetPageSetupData(true);
    wxSTEditorExporter steExport(this);
    bool ret = htmlPrint.PrintText(steExport.RenderAsHTML());
    if (ret)
    {
        *wxSTEditorPrintout::GetPrintData(true)     = *htmlPrint.GetPrintData();
        *wxSTEditorPrintout::GetPageSetupData(true) = *htmlPrint.GetPageSetupData();
    }
    return ret;

#else //!STE_USE_HTML_PRINT
    wxPrintData *printData = wxSTEditorPrintout::GetPrintData(true);

    wxPrintDialogData printDialogData( *printData );
    wxPrinter printer(&printDialogData);
    wxSTEditorPrintout printout(this);

    if (!printer.Print(this, &printout, true))
    {
        if (wxPrinter::GetLastError() == wxPRINTER_ERROR)
        {
            wxMessageBox( _("A print error occurred, perhaps your printer is not correctly setup\?"),
                          _("Print error"), wxOK|wxICON_ERROR, this);
            return false;
        }
    }

    *printData = printer.GetPrintDialogData().GetPrintData();
    return true;
#endif //STE_USE_HTML_PRINT
}

bool wxSTEditor::ShowPrintPreviewDialog()
{
#if STE_USE_HTML_PRINT
    wxHtmlEasyPrinting htmlPrint(_("Preview document"));
    *htmlPrint.GetPrintData()     = *wxSTEditorPrintout::GetPrintData(true);
    *htmlPrint.GetPageSetupData() = *wxSTEditorPrintout::GetPageSetupData(true);
    wxSTEditorExporter steExport(this);
    bool ret = htmlPrint.PreviewText(steExport.RenderAsHTML());
    if (ret)
    {
        *wxSTEditorPrintout::GetPrintData(true)     = *htmlPrint.GetPrintData();
        *wxSTEditorPrintout::GetPageSetupData(true) = *htmlPrint.GetPageSetupData();
    }
    return ret;

#else //!STE_USE_HTML_PRINT
    wxPrintData *printData = wxSTEditorPrintout::GetPrintData(true);

    wxPrintDialogData printDialogData( *printData );
    wxPrintPreview *preview = new wxPrintPreview(new wxSTEditorPrintout(this),
                                                 new wxSTEditorPrintout(this),
                                                 &printDialogData);
    if (!preview->Ok())
    {
        delete preview;

        wxMessageBox(_("A print error occurred, perhaps your printer is not correctly setup\?"),
                     _("Print preview error"), wxOK|wxICON_ERROR, this);
        return false;
    }

#if wxCHECK_VERSION(2,5,0)
    wxPreviewFrame *frame = new wxPreviewFrame(preview, this, _("Print Preview"));
#else
    // The wxPreviewFrame wants a wxFrame as a parent in 2.4.x
    wxFrame *previewParent = NULL;
    wxWindow *parent = GetParent();

    while (parent)
    {
        if (wxDynamicCast(parent, wxFrame) != NULL)
        {
            previewParent = wxDynamicCast(parent, wxFrame);
            break;
        }

        if (parent->IsTopLevel()) break;
        parent = parent->GetParent();
    }

    wxPreviewFrame *frame = new wxPreviewFrame(preview, previewParent, _("Print Preview"));
#endif // wxCHECK_VERSION(2,5,0)

    wxRect rect = wxGetClientDisplayRect();
    rect.Intersect(wxRect(rect.x, rect.y, 600, 700));
    rect.Deflate(20,20);
    frame->SetSize(rect);

    frame->Centre(wxBOTH);
    frame->Initialize();
    frame->Show(true);
    return true;
#endif //STE_USE_HTML_PRINT
}

bool wxSTEditor::ShowPrintSetupDialog()
{
    wxPrintData *printData = wxSTEditorPrintout::GetPrintData(true);

    // Nah, these are separate things
    //if (GetEditorPrefs().Ok())
    //    printData->SetColour(GetEditorPrefs().GetPrefInt(STE_PREF_PRINTCOLOURMODE) != wxSTC_PRINT_BLACKONWHITE);

    wxPrintDialogData printDialogData(*printData);
    wxPrintDialog printerDialog(this, &printDialogData);

#if !wxCHECK_VERSION(2,7,0)
    printerDialog.GetPrintDialogData().SetSetupDialog(true);
#endif //!wxCHECK_VERSION(2,7,0)

    int ret = printerDialog.ShowModal();

    if (ret != wxID_CANCEL)
    {
        *printData = printerDialog.GetPrintDialogData().GetPrintData();
    }

    return ret != wxID_CANCEL;
}

bool wxSTEditor::ShowPrintPageSetupDialog()
{
    wxPageSetupData *pageSetupData = wxSTEditorPrintout::GetPageSetupData(true);
    wxPrintData *printData = wxSTEditorPrintout::GetPrintData(true);
    *pageSetupData = *printData;

    wxPageSetupDialog pageSetupDialog(this, pageSetupData);
    int ret = pageSetupDialog.ShowModal();

    if (ret != wxID_CANCEL)
    {
        *printData = pageSetupDialog.GetPageSetupData().GetPrintData();
        *pageSetupData = pageSetupDialog.GetPageSetupData();
    }
    return ret != wxID_CANCEL;
}

bool wxSTEditor::ShowPrintOptionsDialog()
{
    wxSTEditorPrintOptionsDialog dialog(this);

    if (dialog.ShowModal() == wxID_OK)
    {
        if (GetEditorPrefs().Ok())
        {
            GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_PRINT_COLOURMODE,    dialog.GetPrintColourMode(), false);
            GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_PRINT_MAGNIFICATION, dialog.GetPrintMagnification(), false);
            GetEditorPrefs().SetPrefBoolByID(ID_STE_PREF_PRINT_WRAPMODE,     dialog.GetPrintWrapMode(), false);
            GetEditorPrefs().SetPrefIntByID(ID_STE_PREF_PRINT_LINENUMBERS,   dialog.GetPrintLinenumbers(), true);
        }
        else
        {
            SetPrintColourMode(dialog.GetPrintColourMode());
            SetPrintMagnification(dialog.GetPrintMagnification());
            SetPrintWrapMode(dialog.GetPrintWrapMode());
            // oops no way to set this
        }

        return true;
    }

    return false;
}

const wxSTEditorOptions& wxSTEditor::GetOptions() const
{
    return GetSTERefData()->m_options;
}
wxSTEditorOptions& wxSTEditor::GetOptions()
{
    return GetSTERefData()->m_options;
}
void wxSTEditor::SetOptions(const wxSTEditorOptions& options)
{
    GetSTERefData()->m_options = options;
}

bool wxSTEditor::SetLanguage(int lang)
{
    wxCHECK_MSG(lang >= 0, false, wxT("Invalid language ID"));

    GetSTERefData()->m_steLang_id = lang;

    int n, editRefCount = GetSTERefData()->GetEditorCount();

    if (GetEditorStyles().Ok())
    {
        for (n = 0; n < editRefCount; n++)
            GetEditorStyles().UpdateEditor(GetSTERefData()->GetEditor(n));
    }
    if (GetEditorPrefs().Ok())
    {
        for (n = 0; n < editRefCount; n++)
            GetEditorPrefs().UpdateEditor(GetSTERefData()->GetEditor(n));
    }
    if (GetEditorLangs().Ok())
    {
        for (n = 0; n < editRefCount; n++)
            GetEditorLangs().UpdateEditor(GetSTERefData()->GetEditor(n));
    }

    Colourise(0, -1);
    return true;
}

bool wxSTEditor::SetLanguage(const wxString &filePath)
{
    int lang = -1;

    // use current langs or default if none
    if (GetEditorLangs().Ok())
        lang = GetEditorLangs().FindLanguageByFilename(filePath);
    else
        lang = wxSTEditorLangs(true).FindLanguageByFilename(filePath);

    if (lang != -1)
        return SetLanguage(lang);

    return false;
}

int wxSTEditor::GetLanguageId() const
{
    return GetSTERefData()->m_steLang_id;
}

const wxSTEditorPrefs& wxSTEditor::GetEditorPrefs() const
{
    return GetSTERefData()->m_stePrefs;
}
wxSTEditorPrefs& wxSTEditor::GetEditorPrefs()
{
    return GetSTERefData()->m_stePrefs;
}
void wxSTEditor::RegisterPrefs(const wxSTEditorPrefs& prefs)
{
    if (GetEditorPrefs().Ok())
    {
        GetEditorPrefs().RemoveEditor(this);
        GetEditorPrefs().Destroy();
    }
    if (!prefs.Ok())
        return;

    GetEditorPrefs().Create(prefs);
    GetEditorPrefs().RegisterEditor(this);
}

const wxSTEditorStyles& wxSTEditor::GetEditorStyles() const
{
    return GetSTERefData()->m_steStyles;
}
wxSTEditorStyles& wxSTEditor::GetEditorStyles()
{
    return GetSTERefData()->m_steStyles;
}
void wxSTEditor::RegisterStyles(const wxSTEditorStyles& styles)
{
    if (GetEditorStyles().Ok())
    {
        GetEditorStyles().RemoveEditor(this);
        GetEditorStyles().Destroy();
    }
    if (!styles.Ok())
        return;

    GetEditorStyles().Create(styles);
    GetEditorStyles().RegisterEditor(this);
}

const wxSTEditorLangs& wxSTEditor::GetEditorLangs() const
{
    return GetSTERefData()->m_steLangs;
}
wxSTEditorLangs& wxSTEditor::GetEditorLangs()
{
    return GetSTERefData()->m_steLangs;
}
void wxSTEditor::RegisterLangs(const wxSTEditorLangs& langs)
{
    if (GetEditorLangs().Ok())
    {
        GetEditorLangs().RemoveEditor(this);
        GetEditorLangs().Destroy();
    }
    if (!langs.Ok())
        return;

    GetEditorLangs().Create(langs);
    GetEditorLangs().RegisterEditor(this);
}

bool wxSTEditor::SendEvent(wxEventType eventType, int evt_int, long extra_long,
                           const wxString &evtStr )
{
    STE_INITRETURNVAL(false)

    //wxPrintf(wxT("Send event %d, %d %ld '%s'\n"), long(eventType), evt_int, extra_long, evtStr.c_str());

    if ((eventType == wxEVT_STE_STATE_CHANGED) ||
        (eventType == wxEVT_STE_SET_FOCUS) ||
        (eventType == wxEVT_STESHELL_ENTER))
    {
        wxSTEditorEvent event(GetId(), eventType, this,
                              evt_int, extra_long, evtStr);
        return GetEventHandler()->ProcessEvent(event);
    }

    wxCommandEvent event(eventType, GetId());
    event.SetInt(evt_int);
    event.SetExtraLong(extra_long);
    event.SetString(evtStr);
    event.SetEventObject(this);
    return GetEventHandler()->ProcessEvent(event);
}

wxTreeItemId wxSTEditor::GetTreeItemId() const
{
    return GetSTERefData()->m_treeItemId;
}
void wxSTEditor::SetTreeItemId(const wxTreeItemId& id)
{
    GetSTERefData()->m_treeItemId = id;
}

//-----------------------------------------------------------------------------
// wxSTEditorEvent
//-----------------------------------------------------------------------------

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STE_CREATED)
DEFINE_LOCAL_EVENT_TYPE(wxEVT_STS_CREATED)
DEFINE_LOCAL_EVENT_TYPE(wxEVT_STN_CREATED)

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STE_STATE_CHANGED)
DEFINE_LOCAL_EVENT_TYPE(wxEVT_STE_SET_FOCUS)
DEFINE_LOCAL_EVENT_TYPE(wxEVT_STE_POPUPMENU)

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STE_MARGINDCLICK)

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STS_CREATE_EDITOR)
DEFINE_LOCAL_EVENT_TYPE(wxEVT_STN_CREATE_SPLITTER)

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STS_SPLIT_BEGIN)

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STN_PAGE_CHANGED)

DEFINE_LOCAL_EVENT_TYPE(wxEVT_STESHELL_ENTER)

//-----------------------------------------------------------------------------
// wxSTEditorEvent
//-----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditorEvent, wxCommandEvent)

wxSTEditorEvent::wxSTEditorEvent( int id, wxEventType type, wxObject* obj,
                                  int stateChange, int stateValues,
                                  const wxString& fileName )
                :wxCommandEvent(type, id)
{
    SetEventObject(obj);
    SetInt(stateChange);
    SetExtraLong(stateValues);
    SetString(fileName);
}


#if !defined(WINDOWS)

enum { SURROGATE_LEAD_FIRST = 0xD800 };
enum { SURROGATE_TRAIL_FIRST = 0xDC00 };
enum { SURROGATE_TRAIL_LAST = 0xDFFF };

unsigned int UTF8Length(const wchar_t *uptr, unsigned int tlen) {
	unsigned int len = 0;
	for (unsigned int i = 0; i < tlen && uptr[i];) {
		unsigned int uch = uptr[i];
		if (uch < 0x80) {
			len++;
		} else if (uch < 0x800) {
			len += 2;
		} else if ((uch >= SURROGATE_LEAD_FIRST) &&
			(uch <= SURROGATE_TRAIL_LAST)) {
			len += 4;
			i++;
		} else {
			len += 3;
		}
		i++;
	}
	return len;
}

void UTF8FromUTF16(const wchar_t *uptr, unsigned int tlen, char *putf, unsigned int len) {
	int k = 0;
	for (unsigned int i = 0; i < tlen && uptr[i];) {
		unsigned int uch = uptr[i];
		if (uch < 0x80) {
			putf[k++] = static_cast<char>(uch);
		} else if (uch < 0x800) {
			putf[k++] = static_cast<char>(0xC0 | (uch >> 6));
			putf[k++] = static_cast<char>(0x80 | (uch & 0x3f));
		} else if ((uch >= SURROGATE_LEAD_FIRST) &&
			(uch <= SURROGATE_TRAIL_LAST)) {
			// Half a surrogate pair
			i++;
			unsigned int xch = 0x10000 + ((uch & 0x3ff) << 10) + (uptr[i] & 0x3ff);
			putf[k++] = static_cast<char>(0xF0 | (xch >> 18));
			putf[k++] = static_cast<char>(0x80 | ((xch >> 12) & 0x3f));
			putf[k++] = static_cast<char>(0x80 | ((xch >> 6) & 0x3f));
			putf[k++] = static_cast<char>(0x80 | (xch & 0x3f));
		} else {
			putf[k++] = static_cast<char>(0xE0 | (uch >> 12));
			putf[k++] = static_cast<char>(0x80 | ((uch >> 6) & 0x3f));
			putf[k++] = static_cast<char>(0x80 | (uch & 0x3f));
		}
		i++;
	}
	putf[len] = '\0';
}

unsigned int UTF16Length(const char *s, unsigned int len) {
	unsigned int ulen = 0;
	unsigned int charLen;
	for (unsigned int i=0;i<len;) {
		unsigned char ch = static_cast<unsigned char>(s[i]);
		if (ch < 0x80) {
			charLen = 1;
		} else if (ch < 0x80 + 0x40 + 0x20) {
			charLen = 2;
		} else if (ch < 0x80 + 0x40 + 0x20 + 0x10) {
			charLen = 3;
		} else {
			charLen = 4;
			ulen++;
		}
		i += charLen;
		ulen++;
	}
	return ulen;
}

unsigned int UTF16FromUTF8(const char *s, unsigned int len, wchar_t *tbuf, unsigned int tlen) {
	unsigned int ui=0;
	const unsigned char *us = reinterpret_cast<const unsigned char *>(s);
	unsigned int i=0;
	while ((i<len) && (ui<tlen)) {
		unsigned char ch = us[i++];
		if (ch < 0x80) {
			tbuf[ui] = ch;
		} else if (ch < 0x80 + 0x40 + 0x20) {
			tbuf[ui] = static_cast<wchar_t>((ch & 0x1F) << 6);
			ch = us[i++];
			tbuf[ui] = static_cast<wchar_t>(tbuf[ui] + (ch & 0x7F));
		} else if (ch < 0x80 + 0x40 + 0x20 + 0x10) {
			tbuf[ui] = static_cast<wchar_t>((ch & 0xF) << 12);
			ch = us[i++];
			tbuf[ui] = static_cast<wchar_t>(tbuf[ui] + ((ch & 0x7F) << 6));
			ch = us[i++];
			tbuf[ui] = static_cast<wchar_t>(tbuf[ui] + (ch & 0x7F));
		} else {
			// Outside the BMP so need two surrogates
			int val = (ch & 0x7) << 18;
			ch = us[i++];
			val += (ch & 0x3F) << 12;
			ch = us[i++];
			val += (ch & 0x3F) << 6;
			ch = us[i++];
			val += (ch & 0x3F);
			tbuf[ui] = static_cast<wchar_t>(((val - 0x10000) >> 10) + SURROGATE_LEAD_FIRST);
			ui++;
			tbuf[ui] = static_cast<wchar_t>((val & 0x3ff) + SURROGATE_TRAIL_FIRST);
		}
		ui++;
	}
	return ui;
}


// Convert using Scintilla's functions instead of wx's, Scintilla's are more
// forgiving and won't assert...

wxString stc2wx(const char* str, size_t len)
{
    if (!len)
        return wxEmptyString;

    size_t wclen = UTF16Length(str, len);
    wxWCharBuffer buffer(wclen+1);

    size_t actualLen = UTF16FromUTF8(str, len, buffer.data(), wclen+1);
    return wxString(buffer.data(), actualLen);
}
wxString stc2wx(const char* str)
{
    return stc2wx(str, strlen(str));
}


const wxWX2MBbuf wx2stc(const wxString& str)
{
    const wchar_t* wcstr = str.c_str();
    size_t wclen         = str.length();
    size_t len           = UTF8Length(wcstr, wclen);

    wxCharBuffer buffer(len+1);
    UTF8FromUTF16(wcstr, wclen, buffer.data(), len);

    // TODO check NULL termination!!

    return buffer;
}
#endif

