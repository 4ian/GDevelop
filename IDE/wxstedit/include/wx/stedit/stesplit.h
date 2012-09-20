///////////////////////////////////////////////////////////////////////////////
// Name:        stesplit.h
// Purpose:     wxSTEditorSplitter
// Author:      John Labenski, parts taken from wxGuide by Otto Wyss
// Modified by:
// Created:     11/05/2002
// Copyright:   (c) John Labenski, Otto Wyss
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef _STESPLIT_H_
#define _STESPLIT_H_

#include "wx/splitter.h"

#include "wx/stedit/stedefs.h"

//-----------------------------------------------------------------------------
// wxSTEditorSplitter - allows for two different views of the same doc
//                      the first editor is always valid, can split vertically
//                      or horizontally.
//
//                      Do not call wxSplitterWindow::Unsplit/Split methods
//                      as this control has it's own customized methods.
//                      If the function isn't below, use at your own risk.
//
// note: having the STC in another window seems to solve this problem when switching notebook pages
// Gtk-CRITICAL **: file gtkstyle.c: line 2308 (gtk_default_draw_flat_box): assertion `window != NULL' failed.
// Gdk-CRITICAL **: file gdkgc.c: line 713 (gdk_gc_set_clip_region): assertion `gc != NULL' failed.
//-----------------------------------------------------------------------------
class WXDLLIMPEXP_STEDIT wxSTEditorSplitter : public wxSplitterWindow
{
public:
    wxSTEditorSplitter() : wxSplitterWindow() { Init(); }
    wxSTEditorSplitter( wxWindow *parent, wxWindowID id = wxID_ANY,
                        const wxPoint& pos = wxDefaultPosition,
                        const wxSize& size = wxDefaultSize,
                        long style = wxSP_3DSASH|wxNO_BORDER,
                        const wxString& name = wxT("wxSTEditorSplitter") )
    {
        Init();
        Create(parent, id, pos, size, style, name);
    }

    virtual ~wxSTEditorSplitter();
    virtual bool Destroy();

    bool Create( wxWindow *parent, wxWindowID id = wxID_ANY,
                 const wxPoint& pos = wxDefaultPosition,
                 const wxSize& size = wxDefaultSize,
                 long style = wxSP_3DSASH|wxNO_BORDER,
                 const wxString& name = wxT("wxSTEditorSplitter"));

    // Create and set the wxSTEditorOptions, call this after creation.
    virtual void CreateOptions(const wxSTEditorOptions& options);
    // GetOptions, use this to change editor option values
    const wxSTEditorOptions& GetOptions() const { return m_options; }
    wxSTEditorOptions& GetOptions() { return m_options; }
    // Set the options, the options will now be refed copies of the ones you send
    // in. This can be used to detach the options for a particular editor from
    // the rest of them.
    void SetOptions(const wxSTEditorOptions& options) { m_options = options; }

    // enable/disable sending wxSTEditor events from children editors
    void SetSendSTEEvents(bool send);

    // Set the editor to use for the splitter, use STS_NO_EDITOR as option
    // and add one just after creation. Will delete old editor if necessary.
    // You must make this the parent of the editor.
    void Initialize(wxSTEditor* editor);

    // Get the editor that last had the focus or editor 1, always valid if initialized
    wxSTEditor *GetEditor();
    // Get a pointer to the first (left or top) editor, always valid if initialized
    wxSTEditor *GetEditor1() const { return m_editorOne; }
    // Get a pointer to the second (right or bottom) editor, NULL when unsplit
    wxSTEditor *GetEditor2() const { return m_editorTwo; }

    // Use these methods to control splitting/unsplitting NOT wxSplitterWindow's
    // They handle resplitting and switching orientation so you don't need to
    // unsplit before changing orientation.
    virtual bool SplitVertically(int pos = 0)   { return DoSplit(wxSPLIT_VERTICAL, pos); }
    virtual bool SplitHorizontally(int pos = 0) { return DoSplit(wxSPLIT_HORIZONTAL, pos); }
    virtual bool Unsplit() { return wxSplitterWindow::Unsplit(m_editorTwo); }

    // Update all the menu/tool items in the wxSTEditorOptions
    virtual void UpdateAllItems();
    // Update popupmenu, menubar, toolbar if any
    virtual void UpdateItems(wxMenu *menu=NULL, wxMenuBar *menuBar=NULL, wxToolBar *toolBar=NULL);

    // -----------------------------------------------------------------------
    // implementation
    virtual wxSTEditor *CreateEditor(wxWindowID id = wxID_ANY);

    virtual void OnUnsplit( wxWindow *removed ); // override wxSplitterWindow's func

    bool DoSplit(wxSplitMode mode, int sashPosition);

    void OnMenu(wxCommandEvent &event);
    virtual bool HandleMenuEvent(wxCommandEvent &event);

    void OnSTEFocus(wxSTEditorEvent &event);
    void OnSplitBegin(wxCommandEvent& event);
    void OnRightUp(wxMouseEvent &event);

    void OnFindDialog(wxFindDialogEvent &event);

    void OnPaint(wxPaintEvent& event);
    void DoPaint(wxDC& dc);
    void OnSize(wxSizeEvent& event);
    void DoSize();
    virtual void SizeWindows(); // override wxSplitterWindow's func

    void OnSplitButtonLeftDown(wxMouseEvent& event);
    void OnMouse(wxMouseEvent& event);
    void OnScroll(wxScrollEvent& event);
    virtual void SetUseSplitScrollbars(bool use_scrollbars);

protected:
    wxSTEditorOptions m_options;
    bool m_is_resplitting;
    bool m_focus_one;
    wxSTEditor *m_editorOne;
    wxSTEditor *m_editorTwo;

    wxScrollBar* m_vScrollBar;     // our scrollbars used to show split buttons
    wxScrollBar* m_hScrollBar;
    wxButton*    m_vSplitButton;
    wxButton*    m_hSplitButton;
    int          m_splitting_mode; // wxSPLIT_VERTICAL/HORIZONTAL
    wxPoint      m_lastSplittingPos;
    int          m_old_caret_period;

    wxSTERecursionGuardFlag m_rGuard_OnMenu;
    wxSTERecursionGuardFlag m_rGuard_HandleMenuEvent;
    wxSTERecursionGuardFlag m_rGuard_OnFindDialog;
    wxSTERecursionGuardFlag m_rGuard_OnScroll;

private:
    void Init();
    DECLARE_EVENT_TABLE()
    DECLARE_DYNAMIC_CLASS(wxSTEditorSplitter)
};

#endif  // _STESPLIT_H_

