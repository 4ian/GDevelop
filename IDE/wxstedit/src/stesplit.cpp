///////////////////////////////////////////////////////////////////////////////
// Name:        stesplit.cpp
// Purpose:     wxSTEditorSplitter
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// RCS-ID:
// Copyright:   (c) John Labenski, Otto Wyss
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
#include "wx/stedit/stesplit.h"
#include "wx/stedit/steprefs.h"
#include "wx/stedit/stedlgs.h"

//-----------------------------------------------------------------------------
// wxSTEditorScrollBar
//-----------------------------------------------------------------------------

class WXDLLIMPEXP_STEDIT wxSTEditorScrollBar : public wxScrollBar
{
public:
    wxSTEditorScrollBar(wxWindow *parent, wxWindowID id,
                        const wxPoint& pos = wxDefaultPosition,
                        const wxSize& size = wxDefaultSize,
                        long style = wxSB_HORIZONTAL,
                        const wxValidator& validator = wxDefaultValidator,
                        const wxString& name = wxScrollBarNameStr);

    virtual void SetThumbPosition(int viewStart);
    virtual void SetScrollbar(int position, int thumbSize, int range,
                              int pageSize, bool refresh = true);

    void HideOrShowOnRange();
};

//-----------------------------------------------------------------------------
// wxSTEditorScrollBar
//-----------------------------------------------------------------------------

wxSTEditorScrollBar::wxSTEditorScrollBar(wxWindow *parent, wxWindowID id,
                                         const wxPoint& pos, const wxSize& size,
                                         long style,
                                         const wxValidator& validator,
                                         const wxString& name)
{
    if (!wxScrollBar::Create(parent, id, pos, size, style, validator, name))
        return;
}

void wxSTEditorScrollBar::SetThumbPosition(int viewStart)
{
    wxScrollBar::SetThumbPosition(viewStart);

#if __WXGTK__
    Refresh(); // needs a little help
#endif // __WXGTK__
}

void wxSTEditorScrollBar::SetScrollbar(int position, int thumbSize, int range,
                                       int pageSize, bool refresh)
{
    wxScrollBar::SetScrollbar(position, thumbSize, range, pageSize, refresh);
    HideOrShowOnRange();
}

void wxSTEditorScrollBar::HideOrShowOnRange()
{
    int range     = GetRange();
    int thumbSize = GetThumbSize();

    wxSTEditorSplitter* splitter = wxDynamicCast(GetParent(), wxSTEditorSplitter);
    if (splitter)
    {
        if ((range <= thumbSize) && IsShown())
            Show(false);
        else if ((range > thumbSize) && !IsShown())
            Show(true);
        else
            return;

        splitter->DoSize();
    }
}

//-----------------------------------------------------------------------------
// wxSTEditorSplitter
//-----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditorSplitter, wxSplitterWindow)

BEGIN_EVENT_TABLE(wxSTEditorSplitter, wxSplitterWindow)
    EVT_RIGHT_UP      ( wxSTEditorSplitter::OnRightUp )
    EVT_MENU          ( ID_STS_UNSPLIT,     wxSTEditorSplitter::OnMenu )
    EVT_MENU          ( ID_STS_SPLIT_HORIZ, wxSTEditorSplitter::OnMenu )
    EVT_MENU          ( ID_STS_SPLIT_VERT,  wxSTEditorSplitter::OnMenu )

    EVT_STE_SET_FOCUS ( wxID_ANY,           wxSTEditorSplitter::OnSTEFocus )

    EVT_STS_SPLIT_BEGIN(wxID_ANY,           wxSTEditorSplitter::OnSplitBegin)

    EVT_FIND             (wxID_ANY, wxSTEditorSplitter::OnFindDialog)
    EVT_FIND_NEXT        (wxID_ANY, wxSTEditorSplitter::OnFindDialog)
    EVT_FIND_REPLACE     (wxID_ANY, wxSTEditorSplitter::OnFindDialog)
    EVT_FIND_REPLACE_ALL (wxID_ANY, wxSTEditorSplitter::OnFindDialog)
    EVT_FIND_CLOSE       (wxID_ANY, wxSTEditorSplitter::OnFindDialog)

    EVT_SCROLL           (wxSTEditorSplitter::OnScroll)
    EVT_PAINT            (wxSTEditorSplitter::OnPaint)
    EVT_SIZE             (wxSTEditorSplitter::OnSize)

    EVT_MOUSE_EVENTS     (wxSTEditorSplitter::OnMouse)
END_EVENT_TABLE()

void wxSTEditorSplitter::Init()
{
    m_is_resplitting = false;
    m_focus_one = true;
    m_editorOne = NULL;
    m_editorTwo = NULL;

    m_vScrollBar = NULL;
    m_hScrollBar = NULL;

    m_vSplitButton = NULL;
    m_hSplitButton = NULL;

    m_splitting_mode   = 0;
    m_lastSplittingPos = wxPoint(-10, -10);
    m_old_caret_period = -1;
}

bool wxSTEditorSplitter::Create( wxWindow *parent, wxWindowID id,
                                 const wxPoint& pos, const wxSize& size,
                                 long style, const wxString& name)
{
    if (!wxSplitterWindow::Create(parent, id, pos, size, style, name))
        return false;

    wxCommandEvent event(wxEVT_STS_CREATED, GetId());
    event.SetEventObject(this);
    GetParent()->GetEventHandler()->ProcessEvent(event);
    return true;
}

void wxSTEditorSplitter::CreateOptions(const wxSTEditorOptions& options)
{
    m_options = options;

    if (!GetOptions().HasSplitterOption(STS_NO_EDITOR))
        Initialize(CreateEditor());

    // create the popupmenu if desired
    wxSTEditorMenuManager *steMM = GetOptions().GetMenuManager();
    if (steMM && GetOptions().HasSplitterOption(STS_CREATE_POPUPMENU) &&
        !GetOptions().GetSplitterPopupMenu())
        GetOptions().SetSplitterPopupMenu(steMM->CreateSplitterPopupMenu(), false);
}

wxSTEditorSplitter::~wxSTEditorSplitter()
{
    if (GetEditor1() && m_vScrollBar)
        SetUseSplitScrollbars(false);

    SetSendSTEEvents(false);
}

bool wxSTEditorSplitter::Destroy()
{
    SetSendSTEEvents(false);
    return wxSplitterWindow::Destroy();
}
void wxSTEditorSplitter::SetSendSTEEvents(bool send)
{
    if (m_editorOne) m_editorOne->SetSendSTEEvents(send);
    if (m_editorTwo) m_editorTwo->SetSendSTEEvents(send);
}

wxSTEditor *wxSTEditorSplitter::CreateEditor(wxWindowID id)
{
    wxCommandEvent event(wxEVT_STS_CREATE_EDITOR, GetId());
    event.SetEventObject(this);
    event.SetInt((int)id);
    GetEventHandler()->ProcessEvent(event);

    wxSTEditor *newEditor = NULL;

    if ((event.GetEventObject() != NULL) &&
        (wxDynamicCast(event.GetEventObject(), wxSTEditor) != NULL))
    {
        newEditor = wxDynamicCast(event.GetEventObject(), wxSTEditor);
        if (newEditor->GetParent() != this)
        {
            wxFAIL_MSG(wxT("Invalid parent of editor in splitter"));
            return NULL;
        }
    }
    else if (!m_editorOne)
    {
        // Create a dummy editor if making editor 2, refing it fills it out
        newEditor = new wxSTEditor(this, id);
        newEditor->CreateOptions(GetOptions());
    }
    else
    {
        newEditor = m_editorOne->Clone(this, id);
        //newEditor->CreateOptions(m_editorOne->GetOptions());
    }

    return newEditor;
}

void wxSTEditorSplitter::SetUseSplitScrollbars(bool use_scrollbars)
{
    wxCHECK_RET(GetEditor1(), wxT("Invalid editor"));

    if (use_scrollbars && GetOptions().HasSplitterOption(STS_SPLITBUTTONS))
    {
        // Create our own scrollbars so we can draw the splitter buttons
        if (m_hScrollBar || m_vScrollBar ||
            GetEditor1()->GetHScrollBar() ||
            GetEditor1()->GetVScrollBar()) return;

        m_vScrollBar = new wxSTEditorScrollBar(this, ID_STE_VSCROLLBAR,
                                       wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL);
        m_hScrollBar = new wxSTEditorScrollBar(this, ID_STE_HSCROLLBAR,
                                       wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL);

        GetEditor1()->SetVScrollBar(m_vScrollBar);
        GetEditor1()->SetHScrollBar(m_hScrollBar);

        m_hSplitButton = new wxButton(this, ID_STS_HSPLITBUTTON);
        m_vSplitButton = new wxButton(this, ID_STS_VSPLITBUTTON);
        m_vSplitButton->SetCursor(wxCURSOR_SIZEWE);
        m_hSplitButton->SetCursor(wxCURSOR_SIZENS);

        m_vSplitButton->Connect(wxEVT_LEFT_DOWN,
            wxMouseEventHandler(wxSTEditorSplitter::OnSplitButtonLeftDown));
        m_hSplitButton->Connect(wxEVT_LEFT_DOWN,
            wxMouseEventHandler(wxSTEditorSplitter::OnSplitButtonLeftDown));
    }
    else
    {
        // Destroy our scrollbars and use the wxWindow's ones in Scintilla
        if (m_hScrollBar)
        {
            if (GetEditor1()->GetHScrollBar() == m_hScrollBar)
                GetEditor1()->SetHScrollBar(NULL);
            m_hScrollBar->Destroy();
            m_hScrollBar = NULL;
        }
        if (m_vScrollBar)
        {
            if (GetEditor1()->GetVScrollBar() == m_vScrollBar)
                GetEditor1()->SetVScrollBar(NULL);
            m_vScrollBar->Destroy();
            m_vScrollBar = NULL;
        }

        if (m_vSplitButton)
        {
            m_vSplitButton->Disconnect(wxEVT_LEFT_DOWN,
                wxMouseEventHandler(wxSTEditorSplitter::OnSplitButtonLeftDown));

            m_vSplitButton->Destroy();
            m_vSplitButton = NULL;
        }
        if (m_hSplitButton)
        {
            m_hSplitButton->Disconnect(wxEVT_LEFT_DOWN,
                wxMouseEventHandler(wxSTEditorSplitter::OnSplitButtonLeftDown));

            m_hSplitButton->Destroy();
            m_hSplitButton = NULL;
        }
    }
}

wxSTEditor *wxSTEditorSplitter::GetEditor()
{
    if (!m_focus_one && m_editorTwo)
        return m_editorTwo;

    return m_editorOne;
}

void wxSTEditorSplitter::Initialize(wxSTEditor* editor)
{
    wxCHECK_RET(editor && (editor->GetParent() == this), wxT("Invalid editor"));

    // get rid of other editor
    if (m_editorTwo)
        Unsplit();

    if (m_editorOne)
    {
        SetUseSplitScrollbars(false); // destroy our old scrollbars, if set
        m_editorOne->Destroy();
    }

    m_editorOne = editor;
    wxSplitterWindow::Initialize(m_editorOne);
    SetUseSplitScrollbars(true);
    DoSize();
}

void wxSTEditorSplitter::OnRightUp(wxMouseEvent &event)
{
    wxMenu* popupMenu = GetOptions().GetSplitterPopupMenu();
    if (popupMenu)
    {
        UpdateItems(popupMenu);
        PopupMenu(popupMenu, event.GetPosition());
    }
}

bool wxSTEditorSplitter::DoSplit(wxSplitMode mode, int sashPosition)
{
    wxCHECK_MSG(m_editorOne, false, wxT("Splitter has no children"));

    if (IsSplit())
    {
        m_is_resplitting = true;
        Unsplit();
        m_is_resplitting = false;
        m_editorTwo->Show(true);
    }

    if (!m_editorTwo)
    {
        m_editorTwo = CreateEditor();
        wxCHECK_MSG(m_editorTwo, false, wxT("Invalid editor in wxSTEditorSplitter::DoSplit"));

        if (m_editorTwo->GetParent() != this)
        {
            wxFAIL_MSG(wxT("Incorrect parent window for wxSTEditor, should be wxSTEditorSplitter"));
            delete m_editorTwo;
            m_editorTwo = NULL;
            return false;
        }

        m_editorTwo->RefEditor(GetEditor1());
    }

    int first_line = m_editorOne->GetFirstVisibleLine();
    SetUseSplitScrollbars(false);
    bool ret = wxSplitterWindow::DoSplit(mode, m_editorOne, m_editorTwo, sashPosition);
    UpdateAllItems();
    m_editorTwo->GotoPos(GetEditor1()->GetCurrentPos());
    //m_editorOne->EnsureCaretVisible(); // split position may hide cursor
    //m_editorTwo->EnsureCaretVisible();
    m_editorOne->ScrollToLine(first_line); // split position may hide cursor
    m_editorTwo->ScrollToLine(first_line);

    return ret;
}

void wxSTEditorSplitter::OnUnsplit( wxWindow *removed )
{
    int pos = GetEditor()->GetCurrentPos();
    wxSplitterWindow::OnUnsplit(removed);

    if (m_is_resplitting)
        return;

    // this is not normally run, normally only remove second
    if (removed == m_editorOne)
    {
        m_editorOne->Destroy();
        m_editorOne = m_editorTwo;
        m_editorTwo = NULL;
    }
    else
    {
        m_editorTwo->Destroy();
        m_editorTwo = NULL;
        m_focus_one = true;
    }

    // ensure the carets visible and in same place as last focused editor
    if (m_editorOne->GetCurrentPos() != pos)
        m_editorOne->GotoPos(pos);

    m_editorOne->SetSTCFocus(true);

    SetUseSplitScrollbars(true);
    DoSize();

    UpdateAllItems();
}

void wxSTEditorSplitter::UpdateAllItems()
{
    UpdateItems(GetOptions().GetEditorPopupMenu(), GetOptions().GetMenuBar(),
                                                   GetOptions().GetToolBar());
    UpdateItems(GetOptions().GetNotebookPopupMenu());
    UpdateItems(GetOptions().GetSplitterPopupMenu());
}
void wxSTEditorSplitter::UpdateItems(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar)
{
    if (!menu && !menuBar && !toolBar) return;

    if (!m_editorOne)
    {
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STS_UNSPLIT, false);
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STS_SPLIT_HORIZ, false);
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STS_SPLIT_VERT, false);
    }
    else
    {
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STS_UNSPLIT, true);
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STS_SPLIT_HORIZ, true);
        STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STS_SPLIT_VERT, true);

        int menu_id = !IsSplit() ? ID_STS_UNSPLIT : ((GetSplitMode() == wxSPLIT_VERTICAL) ? ID_STS_SPLIT_VERT : ID_STS_SPLIT_HORIZ);
        STE_MM::DoCheckItem(menu, menuBar, toolBar, menu_id, true);
    }
}

void wxSTEditorSplitter::OnMenu(wxCommandEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_OnMenu);
    if (guard.IsInside()) return;

    if (!HandleMenuEvent(event))
        event.Skip();
}
bool wxSTEditorSplitter::HandleMenuEvent(wxCommandEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_HandleMenuEvent);
    if (guard.IsInside()) return false;

    switch (event.GetId())
    {
        case ID_STS_UNSPLIT     : Unsplit();            return true;
        case ID_STS_SPLIT_HORIZ : SplitHorizontally(0); return true;
        case ID_STS_SPLIT_VERT  : SplitVertically(0);   return true;
        default : break;
    }

    return false;
}

void wxSTEditorSplitter::OnSTEFocus(wxSTEditorEvent &event)
{
    // Track the last focused window
    m_focus_one = (event.GetEditor() == m_editorOne) || (m_editorTwo == NULL);
    UpdateAllItems();

    event.Skip();
}

void wxSTEditorSplitter::OnFindDialog(wxFindDialogEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_OnFindDialog);
    if (guard.IsInside()) return;

    if (GetEditor())
        GetEditor()->OnFindDialog(event);
    else
        event.Skip();
}

void wxSTEditorSplitter::OnScroll(wxScrollEvent& event)
{
    wxSTERecursionGuard guard(m_rGuard_OnScroll);
    if (guard.IsInside()) return;

    // pass our scrollbar events to the editor
    if (GetEditor1() &&
        (event.GetEventObject() == m_hScrollBar) ||
        (event.GetEventObject() == m_vScrollBar))
    {
        GetEditor1()->GetEventHandler()->ProcessEvent(event);
    }
}

void wxSTEditorSplitter::OnPaint(wxPaintEvent& WXUNUSED(event))
{
    wxPaintDC dc(this);
    DoPaint(dc);
    DrawSash(dc);
}
void wxSTEditorSplitter::DoPaint(wxDC& dc)
{
    // Clear lower right block
    if (m_vScrollBar && m_vScrollBar->IsShown())
    {
        wxSize clientSize = GetClientSize();
        wxRect vsbRect = m_vScrollBar->GetRect();
        int top  = vsbRect.GetBottom();
        int left = vsbRect.GetLeft();
        wxRect rect(left-1, top, clientSize.x-left+1, clientSize.y-top+1);
        if (!rect.IsEmpty())
        {
            dc.SetBrush(wxBrush(GetBackgroundColour(), wxBRUSHSTYLE_SOLID));
            dc.SetPen(*wxTRANSPARENT_PEN);
            dc.DrawRectangle(rect);
        }
    }
}

void wxSTEditorSplitter::OnSize(wxSizeEvent& event)
{
    // let the splitter handle sizing unless we have our scrollbars
    // note: overriding SizeWindows is not enough.
    if ((m_vScrollBar || m_hScrollBar) && GetEditor1())
    {
        DoSize();
    }
    else
        event.Skip();
}
void wxSTEditorSplitter::SizeWindows()
{
    if ((m_vScrollBar || m_hScrollBar) && GetEditor1())
        DoSize();
    else
        wxSplitterWindow::SizeWindows();
}

void wxSTEditorSplitter::DoSize()
{
    wxCHECK_RET(GetEditor1(), wxT("Invalid Editor"));
    int SPLIT_BUTTON_WIDTH = 6;

    wxSize size    = GetClientSize();
    int border     = GetBorderSize();
    int vsb_width  = 0;
    int hsb_height = 0;

    // if we have our scrollbars and they're shown, get their sizes
    if (m_vScrollBar && m_vScrollBar->IsShown())
        vsb_width = m_vScrollBar->GetSize().GetWidth();
    if (m_hScrollBar && m_hScrollBar->IsShown())
        hsb_height = m_hScrollBar->GetSize().GetHeight();

    //bool horiz = GetEditor1()->GetUseHorizontalScrollBar(); FIXME use these?
    //bool vert  = GetEditor1()->GetUseVerticalScrollBar();

    // if the buttons exist, set their sizes
    int hsplitb_height = !m_hSplitButton ? 0 : SPLIT_BUTTON_WIDTH;
    int vsplitb_width  = !m_vSplitButton ? 0 : SPLIT_BUTTON_WIDTH;

    // calculate the rects to use for the scrollbars
    wxRect vsbRect(size.x - vsb_width - border,
                   hsplitb_height + border,
                   vsb_width,
                   size.y - hsb_height - hsplitb_height - 2*border);

    wxRect hsbRect(border,
                   size.y - hsb_height - border,
                   size.x - vsb_width - vsplitb_width - 2*border,
                   hsb_height);

    // set the scrollbar sizes
    if (m_vScrollBar && (vsb_width != 0))
        m_vScrollBar->SetSize(vsbRect);

    if (m_hScrollBar && (hsb_height != 0))
        m_hScrollBar->SetSize(hsbRect);

    // set the buttons to be shown and set their sizes if shown
    if (m_hSplitButton)
    {
        if (m_hSplitButton->IsShown() != (vsb_width != 0))
            m_hSplitButton->Show(vsb_width != 0);

        if (vsb_width != 0)
            m_hSplitButton->SetSize(vsbRect.GetLeft(), border,
                                    vsbRect.GetWidth(), hsplitb_height);
    }
    if (m_vSplitButton)
    {
        if (m_vSplitButton->IsShown() != (hsb_height != 0))
            m_vSplitButton->Show(hsb_height != 0);

        if (hsb_height != 0)
            m_vSplitButton->SetSize(hsbRect.GetRight(), hsbRect.GetTop(),
                                    vsplitb_width, hsbRect.GetHeight());
    }

    // finally set the editor size
    GetEditor1()->SetSize(border, border,
                          size.x - vsb_width - 2*border,
                          size.y - hsb_height - 2*border);

    // clear lower right rect
    if (vsb_width && hsb_height)
    {
        wxClientDC dc(this);
        DoPaint(dc);
    }
}

void wxSTEditorSplitter::OnSplitButtonLeftDown(wxMouseEvent& event)
{
    int splitting_mode = 0;
    if (event.GetId() == ID_STS_VSPLITBUTTON)
        splitting_mode = wxSPLIT_VERTICAL;
    else if (event.GetId() == ID_STS_HSPLITBUTTON)
        splitting_mode = wxSPLIT_HORIZONTAL;

    if (splitting_mode != 0)
    {
        wxCommandEvent splitEvent(wxEVT_STS_SPLIT_BEGIN, GetId());
        splitEvent.SetEventObject(this);
        splitEvent.SetInt(splitting_mode);
        GetEventHandler()->ProcessEvent(splitEvent);
    }
}

void wxSTEditorSplitter::OnSplitBegin(wxCommandEvent& event)
{
    wxCHECK_RET(GetEditor1(), wxT("Invalid editor"));
    m_lastSplittingPos = wxPoint(-10, -10);
    m_splitting_mode   = event.GetInt();
    m_old_caret_period = GetEditor1()->GetCaretPeriod();
    GetEditor1()->SetCaretPeriod(0); // don't let it redraw

    if (!HasCapture())
        CaptureMouse();
}

bool STE_SplitInsideRect(const wxPoint& pt, const wxRect& r, int split_mode)
{
    return ((split_mode == wxSPLIT_VERTICAL)   && (pt.x > r.x) && (pt.x < r.GetRight())) ||
           ((split_mode == wxSPLIT_HORIZONTAL) && (pt.y > r.y) && (pt.y < r.GetBottom()));
}

void wxSTEditorSplitter::OnMouse(wxMouseEvent& event)
{
    bool skip = true;
    wxPoint mousePos = event.GetPosition();

    if (event.LeftUp())
    {
        if ((m_splitting_mode != 0) && HasCapture())
        {
            wxCHECK_RET(GetEditor1(), wxT("Invalid editor"));
            ReleaseMouse();
            if (m_old_caret_period >= 0)
                GetEditor1()->SetCaretPeriod(m_old_caret_period);

            m_old_caret_period = -1;

            const wxRect r = GetEditor1()->GetRect();
            // make sure that we're not splitting too small
            if (!STE_SplitInsideRect(mousePos, r.Deflate(10,10), m_splitting_mode))
            {
                if (STE_SplitInsideRect(m_lastSplittingPos, r, m_splitting_mode))
                    DrawSashTracker(m_lastSplittingPos.x, m_lastSplittingPos.y);
            }
            else if (m_splitting_mode == wxSPLIT_VERTICAL)
                SplitVertically(mousePos.x);
            else if (m_splitting_mode == wxSPLIT_HORIZONTAL)
                SplitHorizontally(mousePos.y);

            m_splitting_mode = 0;
            skip = false;
        }
    }
    else if (event.LeftIsDown() && event.Dragging() && HasCapture() && (m_splitting_mode != 0))
    {
        wxCHECK_RET(GetEditor1(), wxT("Invalid editor"));
        m_splitMode = (wxSplitMode)m_splitting_mode;
        wxRect r = GetEditor1()->GetRect();

        if (STE_SplitInsideRect(m_lastSplittingPos, r, m_splitting_mode))
            DrawSashTracker(m_lastSplittingPos.x, m_lastSplittingPos.y);
        if (STE_SplitInsideRect(mousePos, r, m_splitting_mode))
        {
            DrawSashTracker(mousePos.x, mousePos.y);
            m_lastSplittingPos = mousePos;
        }
        else
            m_lastSplittingPos = wxPoint(-10, -10); // didn't draw it this time

        skip = false;
    }

    // oops, lost focus or something
    if (!HasCapture() && (m_splitting_mode != 0))
    {
        wxCHECK_RET(GetEditor1(), wxT("Invalid editor"));
        m_splitting_mode = 0;
        if (m_old_caret_period >= 0)
            GetEditor1()->SetCaretPeriod(m_old_caret_period);

        m_old_caret_period = -1;
    }

    event.Skip(skip);
}

