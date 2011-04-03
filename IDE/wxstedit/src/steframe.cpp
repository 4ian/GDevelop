///////////////////////////////////////////////////////////////////////////////
// Name:        steframe.cpp
// Purpose:     wxSTEditorFrame
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
#include "wx/stedit/steframe.h"

#include "wx/file.h"
#include "wx/filename.h"  // wxFileName
#include "wx/tokenzr.h"
#include "wx/config.h"    // wxConfigBase
#include "wx/docview.h"   // wxFileHistory

#include "../art/pencil16.xpm"
#include "../art/pencil32.xpm"

//-----------------------------------------------------------------------------
// wxSTEditorFrame
//-----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditorFrame, wxFrame)

BEGIN_EVENT_TABLE(wxSTEditorFrame, wxFrame)
    EVT_MENU_OPEN             (wxSTEditorFrame::OnMenuOpen)
    EVT_MENU                  (wxID_ANY, wxSTEditorFrame::OnMenu)

    //EVT_STE_CREATED           (wxID_ANY, wxSTEditorFrame::OnSTECreatedEvent)
    EVT_STE_STATE_CHANGED     (wxID_ANY, wxSTEditorFrame::OnSTEState)
    EVT_STC_UPDATEUI          (wxID_ANY, wxSTEditorFrame::OnSTCUpdateUI)
    EVT_STE_POPUPMENU         (wxID_ANY, wxSTEditorFrame::OnSTEPopupMenu)

    EVT_STN_PAGE_CHANGED      (wxID_ANY, wxSTEditorFrame::OnNotebookPageChanged)
    EVT_TREE_ITEM_ACTIVATED   (ID_STF_FILE_TREECTRL, wxSTEditorFrame::OnFileTreeCtrl)

    EVT_CLOSE                 (wxSTEditorFrame::OnClose)
END_EVENT_TABLE()

void wxSTEditorFrame::Init()
{
    m_steNotebook      = NULL;
    m_steSplitter      = NULL;
    m_mainSplitter     = NULL;
    m_sideSplitter     = NULL;
    m_sideNotebook     = NULL;
    m_fileTreeCtrl     = NULL;
    m_sideSplitterWin1 = NULL;
    m_sideSplitterWin2 = NULL;
}

bool wxSTEditorFrame::Create(wxWindow *parent, wxWindowID id,
                             const wxString& title,
                             const wxPoint& pos, const wxSize& size,
                             long  style,
                             const wxString& name)
{
    m_titleBase = title;

    if (!wxFrame::Create(parent, id, title, pos, size, style, name))
        return false;

    // Set the frame's icons
    wxBitmap bmp(pencil16_xpm);
    wxIcon icon;
    icon.CopyFromBitmap(bmp);
    wxIconBundle iconBundle(icon);
    bmp = wxBitmap(pencil32_xpm);
    icon.CopyFromBitmap(bmp);
    iconBundle.AddIcon(icon);
    SetIcons(iconBundle);

    return true;
}

wxSTEditorFrame::~wxSTEditorFrame()
{
    SetSendSTEEvents(false);
    if (GetToolBar() && (GetToolBar() == GetOptions().GetToolBar())) // remove for safety
        GetOptions().SetToolBar(NULL);
    if (GetMenuBar() && (GetMenuBar() == GetOptions().GetMenuBar())) // remove for file history
        GetOptions().SetMenuBar(NULL);
    if (GetStatusBar() && (GetStatusBar() == GetOptions().GetStatusBar()))
        GetOptions().SetStatusBar(NULL);

    // This stuff always gets saved when the frame closes
    wxConfigBase *config = wxConfigBase::Get(false);
    if (config && GetOptions().HasConfigOption(STE_CONFIG_FILEHISTORY))
        GetOptions().SaveFileConfig(*config);

    if (config && GetOptions().HasConfigOption(STE_CONFIG_FINDREPLACE) &&
        GetOptions().GetFindReplaceData())
        GetOptions().GetFindReplaceData()->SaveConfig(*config,
                      GetOptions().GetConfigPath(STE_OPTION_CFGPATH_FINDREPLACE));
}
bool wxSTEditorFrame::Destroy()
{
    SetSendSTEEvents(false);
    if (GetToolBar() && (GetToolBar() == GetOptions().GetToolBar())) // remove for safety
        GetOptions().SetToolBar(NULL);
    if (GetMenuBar() && (GetMenuBar() == GetOptions().GetMenuBar())) // remove for file history
        GetOptions().SetMenuBar(NULL);
    if (GetStatusBar() && (GetStatusBar() == GetOptions().GetStatusBar()))
        GetOptions().SetStatusBar(NULL);

    return wxFrame::Destroy();
}
void wxSTEditorFrame::SetSendSTEEvents(bool send)
{
    if (GetEditorNotebook())
        GetEditorNotebook()->SetSendSTEEvents(send);
    else if (GetEditorSplitter())
        GetEditorSplitter()->SetSendSTEEvents(send);
    else if (GetEditor())
        GetEditor()->SetSendSTEEvents(send);
}

void wxSTEditorFrame::CreateOptions( const wxSTEditorOptions& options )
{
    m_options = options;
    wxConfigBase *config = wxConfigBase::Get(false);
    wxSTEditorMenuManager *steMM = GetOptions().GetMenuManager();

    if (steMM && GetOptions().HasFrameOption(STF_CREATE_MENUBAR))
    {
        wxMenuBar *menuBar = GetMenuBar() != NULL ? GetMenuBar() : new wxMenuBar(wxMB_DOCKABLE);
        steMM->CreateMenuBar(menuBar, true);

        if (menuBar)
        {
            SetMenuBar(menuBar);

            if (GetOptions().HasFrameOption(STF_CREATE_FILEHISTORY) && !GetOptions().GetFileHistory())
            {
                // if has file open then we can use wxFileHistory to save them
                wxMenu *menu = NULL;
                if (menuBar->FindItem(wxID_OPEN, &menu))
                {
                    GetOptions().SetFileHistory(new wxFileHistory(9), false);
                    GetOptions().GetFileHistory()->UseMenu(menu);
                    if (config)
                        GetOptions().LoadFileConfig(*config);
                }
            }

            GetOptions().SetMenuBar(menuBar);
        }
    }
    if (steMM && GetOptions().HasFrameOption(STF_CREATE_TOOLBAR))
    {
        wxToolBar* toolBar = (GetToolBar() != NULL) ? GetToolBar() : CreateToolBar();
        steMM->CreateToolBar(toolBar);
        GetOptions().SetToolBar(toolBar);
    }
    if ((GetStatusBar() == NULL) && GetOptions().HasFrameOption(STF_CREATE_STATUSBAR))
    {
        CreateStatusBar(1);
        GetOptions().SetStatusBar(GetStatusBar());
    }
    if (steMM)
    {
        if (GetOptions().HasEditorOption(STE_CREATE_POPUPMENU))
            GetOptions().SetEditorPopupMenu(steMM->CreateEditorPopupMenu(), false);
        if (GetOptions().HasSplitterOption(STS_CREATE_POPUPMENU))
            GetOptions().SetSplitterPopupMenu(steMM->CreateSplitterPopupMenu(), false);
        if (GetOptions().HasNotebookOption(STN_CREATE_POPUPMENU))
            GetOptions().SetNotebookPopupMenu(steMM->CreateNotebookPopupMenu(), false);
    }

    if (!m_sideSplitter && GetOptions().HasFrameOption(STF_CREATE_SIDEBAR))
    {
        m_sideSplitter = new wxSplitterWindow(this, ID_STF_SIDE_SPLITTER);
        m_sideSplitter->SetMinimumPaneSize(10);
        m_sideNotebook = new wxNotebook(m_sideSplitter, ID_STF_SIDE_NOTEBOOK);
        m_fileTreeCtrl = new wxTreeCtrl(m_sideNotebook, ID_STF_FILE_TREECTRL,
                                wxDefaultPosition, wxDefaultSize,
                                wxTR_SINGLE|wxTR_HAS_BUTTONS|wxTR_HIDE_ROOT|wxTR_LINES_AT_ROOT );
        m_fileTreeCtrl->SetIndent(6);
        m_fileTreeCtrl->AddRoot(_("Files"));
        m_sideNotebook->AddPage(m_fileTreeCtrl, _("Files"));
        m_sideSplitterWin1 = m_sideNotebook;
    }

    if (!m_steNotebook && GetOptions().HasFrameOption(STF_CREATE_NOTEBOOK))
    {
        m_mainSplitter = new wxSplitterWindow(m_sideSplitter ? (wxWindow*)m_sideSplitter : (wxWindow*)this, ID_STF_MAIN_SPLITTER);
        m_mainSplitter->SetMinimumPaneSize(10);

        m_steNotebook = new wxSTEditorNotebook(m_mainSplitter, wxID_ANY, wxDefaultPosition, wxDefaultSize,
                                               wxCLIP_CHILDREN);
        m_steNotebook->CreateOptions(m_options);
        (void)m_steNotebook->InsertEditorSplitter(-1, wxID_ANY, GetOptions().GetDefaultFileName(), true);
        // update after adding a single page
        m_steNotebook->UpdateAllItems();
        m_mainSplitter->Initialize(m_steNotebook);
        m_sideSplitterWin2 = m_mainSplitter;
    }
    else if (!m_steSplitter && GetOptions().HasFrameOption(STF_CREATE_SINGLEPAGE))
    {
        m_mainSplitter = new wxSplitterWindow(m_sideSplitter ? (wxWindow*)m_sideSplitter : (wxWindow*)this, ID_STF_MAIN_SPLITTER);
        m_mainSplitter->SetMinimumPaneSize(10);

        m_steSplitter = new wxSTEditorSplitter(m_mainSplitter, wxID_ANY, wxDefaultPosition, wxDefaultSize, 0);
        m_steSplitter->CreateOptions(m_options);
        m_mainSplitter->Initialize(m_steSplitter);
    }
    //else user will set up the rest

    if (GetOptions().HasFrameOption(STF_CREATE_SIDEBAR) && GetSideSplitter() && m_sideSplitterWin1 && m_sideSplitterWin2)
    {
        GetSideSplitter()->SplitVertically(m_sideSplitterWin1, m_sideSplitterWin2, 100);
    }

#if wxUSE_DRAG_AND_DROP
    SetDropTarget(new wxSTEditorFrameFileDropTarget(this));
#endif //wxUSE_DRAG_AND_DROP

    if (GetOptions().HasConfigOption(STE_CONFIG_FINDREPLACE) && config)
    {
        if (GetOptions().GetFindReplaceData() &&
            !GetOptions().GetFindReplaceData()->HasLoadedConfig())
            GetOptions().GetFindReplaceData()->LoadConfig(*config);
    }

    if (config)
        LoadConfig(*config);

    UpdateAllItems();

    // if we've got an editor let it update gui
    wxSTEditor *editor = GetEditor();
    if (editor)
        editor->UpdateAllItems();
}

wxSTEditor *wxSTEditorFrame::GetEditor(int page) const
{
    wxSTEditorSplitter *splitter = GetEditorSplitter(page);
    return splitter ? splitter->GetEditor() : (wxSTEditor*)NULL;
}

wxSTEditorSplitter *wxSTEditorFrame::GetEditorSplitter(int page) const
{
    return GetEditorNotebook() ? GetEditorNotebook()->GetEditorSplitter(page) : m_steSplitter;
}

void wxSTEditorFrame::ShowAboutDialog()
{
    wxString msg;
    msg.Printf( _T("Welcome to ") STE_VERSION_STRING _T(".\n")
                _T("Using the Scintilla editor, http://www.scintilla.org\n")
                _T("and the wxWidgets library, http://www.wxwidgets.org.\n")
                _T("Written by John Labenski, Otto Wyss.\n\n")
                _T("Compiled with %s."), wxVERSION_STRING);

    // FIXME - or test wxFileConfig doesn't have ClassInfo is this safe?
    //if ((wxFileConfig*)wxConfigBase::Get(false))
    //    msg += wxT("\nConfig file: ")+((wxFileConfig*)wxConfigBase::Get(false))->m_strLocalFile;

    wxMessageBox(msg, _("About editor"), wxOK|wxICON_INFORMATION, this);
}

void wxSTEditorFrame::UpdateAllItems()
{
    UpdateItems(GetOptions().GetEditorPopupMenu(), GetOptions().GetMenuBar(),
                                                   GetOptions().GetToolBar());
    UpdateItems(GetOptions().GetNotebookPopupMenu());
    UpdateItems(GetOptions().GetSplitterPopupMenu());
}
void wxSTEditorFrame::UpdateItems(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar)
{
    if (!menu && !menuBar && !toolBar) return;

    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STF_SHOW_SIDEBAR, GetSideSplitter() != NULL);
    STE_MM::DoCheckItem(menu, menuBar, toolBar, ID_STF_SHOW_SIDEBAR, (GetSideSplitter() != NULL) && GetSideSplitter()->IsSplit());
}

void wxSTEditorFrame::LoadConfig(wxConfigBase &config, const wxString &configPath_)
{
    wxString configPath = wxSTEditorOptions::FixConfigPath(configPath_, false);

    if (GetMenuBar() && GetMenuBar()->FindItem(ID_STF_SHOW_SIDEBAR))
    {
        long val = 0;
        if (config.Read(configPath + wxT("/ShowSidebar"), &val))
        {
            wxSTEditorMenuManager::DoCheckItem(NULL, GetMenuBar(), NULL,
                                               ID_STF_SHOW_SIDEBAR, val != 0);
            // send fake event to HandleEvent
            wxCommandEvent evt(wxEVT_COMMAND_MENU_SELECTED, ID_STF_SHOW_SIDEBAR);
            evt.SetInt(int(val));
            HandleMenuEvent(evt);
        }
    }

    wxString str;
    if (config.Read(configPath + wxT("/FrameSize"), &str))
    {
        wxRect rect = GetRect();
        long lrect[4] = { rect.x, rect.y, rect.width, rect.height };
        wxArrayString arrStr = wxStringTokenize(str, wxT(","));
        if (arrStr.GetCount() == 4u)
        {
            for (size_t n = 0; n < 4; n++)
                arrStr[n].ToLong(&lrect[n]);

            wxRect cfgRect((int)lrect[0], (int)lrect[1], (int)lrect[2], (int)lrect[3]);
            cfgRect = cfgRect.Intersect(wxGetClientDisplayRect());

            if ((cfgRect != rect) && (cfgRect.width>=100) && (cfgRect.height>=100))
                SetSize(cfgRect);
        }
    }
}
void wxSTEditorFrame::SaveConfig(wxConfigBase &config, const wxString &configPath_)
{
    wxString configPath = wxSTEditorOptions::FixConfigPath(configPath_, false);
    if (GetMenuBar() && GetMenuBar()->FindItem(ID_STF_SHOW_SIDEBAR))
    {
        wxString val = GetMenuBar()->IsChecked(ID_STF_SHOW_SIDEBAR) ? wxT("1") : wxT("0");
        config.Write(configPath + wxT("/ShowSidebar"), val);
    }

    wxRect rect = GetRect();
    if ((rect.x>=0) && (rect.y>=0) && (rect.width>=100) && (rect.height>=100))
       config.Write(configPath + wxT("/FrameSize"), wxString::Format(wxT("%d,%d,%d,%d"), rect.x, rect.y, rect.width, rect.height));
}

void wxSTEditorFrame::OnNotebookPageChanged(wxNotebookEvent &WXUNUSED(event))
{
    wxSTEditor *editor = GetEditor();
    wxString title = m_titleBase;
    wxSTEditorMenuManager *steMM = GetOptions().GetMenuManager();

    if (editor)
    {
        if ( steMM && !steMM->HasEnabledEditorItems())
            steMM->EnableEditorItems(true, NULL, GetMenuBar(), GetToolBar());

        wxString modified = editor->IsModified() ? wxT("*") : wxT("");
        title += wxT(" - ") + modified + editor->GetFileName();
    }
    else
    {
        if (steMM && steMM->HasEnabledEditorItems())
            steMM->EnableEditorItems(false, NULL, GetMenuBar(), GetToolBar());
    }

    UpdateFileTreeCtrl();
    SetTitle(title);
}

void wxSTEditorFrame::OnFileTreeCtrl(wxTreeEvent &event)
{
    if (GetEditorNotebook())
    {
        wxTreeItemId id = event.GetItem();
        wxSTETreeItemData* data = (wxSTETreeItemData*)m_fileTreeCtrl->GetItemData(id);
        if (data && (data->m_page_num >= 0))
            GetEditorNotebook()->SetSelection(data->m_page_num);
        else
            event.Skip();
    }
}

// can't use wxArray::Index since MSVC can't convert from wxTreeItemId to wxTreeItemIdBase
static int Find_wxArrayTreeItemId(const wxArrayTreeItemIds& arrayIds, const wxTreeItemId& id)
{
    size_t n, id_count = arrayIds.GetCount();
    for (n = 0; n < id_count; n++)
    {
        if (arrayIds[n] == id)
            return n;
    }
    return wxNOT_FOUND;
}

void wxSTEditorFrame::UpdateFileTreeCtrl()
{
    wxSTEditorNotebook *noteBook = GetEditorNotebook();
    wxTreeCtrl *treeCtrl = GetFileTreeCtrl();
    if (!treeCtrl || !noteBook)
        return;

    int n;
    int page_count = noteBook->GetPageCount();
    int note_sel   = noteBook->GetSelection();

    wxTreeItemId id, selId;
    wxSTETreeCtrlHelper treeHelper(treeCtrl);

    // Check for and add a root item to the treectrl
    wxTreeItemId rootId = treeCtrl->GetRootItem();
    if (!rootId)
        rootId = treeCtrl->AddRoot(_("Root"), -1, -1, NULL);

    // Check for and add a "Opened files" item to the treectrl
    wxArrayString openedfilesPath; openedfilesPath.Add(_("Opened files"));
    wxTreeItemId openedId = treeHelper.FindOrInsertItem(openedfilesPath, STE_TREECTRLHELPER_FIND_OR_INSERT);

    // Get all the current children of the "Opened files", should be notebook pages
    wxArrayTreeItemIds arrayIds;
    treeHelper.GetAllItemIds(openedId, arrayIds, STE_TREECTRLHELPER_GET_DATA);

    treeCtrl->Freeze();

    for (n = 0; n < page_count; n++)
    {
        // create new data to use or compare with existing
        wxSTETreeItemData steTreeData(n, noteBook->GetPage(n));
        wxSTEditor* editor = noteBook->GetEditor(n);
        wxWindow* notePage = noteBook->GetPage(n);

        // this is an editor, else some other unknown window type
        if (editor)
        {
            steTreeData.m_root = _("Opened files");
            steTreeData.m_fileName = editor->GetFileName();
            steTreeData.m_modified = editor->IsModified();
            wxFileName fn(steTreeData.m_fileName);
            fn.Normalize();

            steTreeData.m_treePath.Add(steTreeData.m_root);
            steTreeData.m_treePath.Add(fn.GetPath());
            steTreeData.m_treePath.Add(fn.GetFullName());
        }
        else
        {
            steTreeData.m_root = _("Others");
            steTreeData.m_fileName = noteBook->GetPageText(n);

            steTreeData.m_treePath.Add(steTreeData.m_root);
            steTreeData.m_treePath.Add(steTreeData.m_fileName);
        }

        wxTreeItemId id; // initially null

        if (editor && editor->GetTreeItemId())
        {
            // get and check the old tree item id, the filename/path could have changed
            id = editor->GetTreeItemId();
            wxSTETreeItemData* oldData = (wxSTETreeItemData*)treeCtrl->GetItemData(id);
            if (oldData && (oldData->m_window == notePage) &&
                (oldData->m_treePath != treeHelper.GetItemPath(id)))
            {
                treeHelper.DeleteItem(id, true, 2);

                int id_idx = Find_wxArrayTreeItemId(arrayIds, id);
                if (id_idx != wxNOT_FOUND)
                    arrayIds.RemoveAt(id_idx);

                id = wxTreeItemId(); // null it and add it correctly later
                editor->SetTreeItemId(id);
            }
        }

        if (!id)
        {
            // always insert a new editor since if we already did,
            //   it'd have a treeitem id, for other windows, who knows, you can
            //   only have one tree node per notebook page name
            if (editor)
            {
                id = treeHelper.FindOrInsertItem(steTreeData.m_treePath, STE_TREECTRLHELPER_INSERT);
                editor->SetTreeItemId(id);
            }
            else
                id = treeHelper.FindOrInsertItem(steTreeData.m_treePath, STE_TREECTRLHELPER_FIND_OR_INSERT);
        }

        // must set new data before deleting old in MSW since it checks old before setting new
        wxTreeItemData* oldData = treeCtrl->GetItemData(id);
        treeCtrl->SetItemData(id, new wxSTETreeItemData(steTreeData));
        if (oldData) delete oldData;

        int id_idx = Find_wxArrayTreeItemId(arrayIds, id);
        if (id_idx != wxNOT_FOUND)
            arrayIds.RemoveAt(id_idx);

        treeCtrl->SetItemTextColour(id, steTreeData.m_modified ? *wxRED : *wxBLACK);
        if (treeCtrl->IsBold(id))
            treeCtrl->SetItemBold(id, false);

        if (n == note_sel)
            selId = id;
    }

    // remove the orphaned items, but only if they have our data in them
    size_t i, id_count = arrayIds.GetCount();
    for (i = 0; i < id_count; i++)
    {
        wxSTETreeItemData* data = (wxSTETreeItemData*)treeCtrl->GetItemData(arrayIds[i]);
        if (data)
            treeHelper.DeleteItem(arrayIds[i], true, -1);
            //treeHelper.DeleteItem(data->m_treePath);
    }

    treeHelper.SortChildren(treeCtrl->GetRootItem());
    treeCtrl->Thaw();

    if (selId)
    {
        treeCtrl->SetItemBold(selId);
        treeCtrl->SelectItem(selId);
    }
}

void wxSTEditorFrame::OnSTECreated(wxCommandEvent &event)
{
    event.Skip();
    UpdateFileTreeCtrl();
}

void wxSTEditorFrame::OnSTEPopupMenu(wxSTEditorEvent &event)
{
    event.Skip();
    wxSTEditor *editor = event.GetEditor();
    UpdateItems(editor->GetOptions().GetEditorPopupMenu());
}

void wxSTEditorFrame::OnSTEState(wxSTEditorEvent &event)
{
    event.Skip();
    wxSTEditor *editor = event.GetEditor();

    if ( event.HasStateChange(STE_FILENAME | STE_MODIFIED) )
    {
        wxString modified = editor->IsModified() ? wxT("*") : wxT("");
        SetTitle(m_titleBase + wxT(" - ") + modified + event.GetString());

        UpdateFileTreeCtrl();
        if (event.HasStateChange(STE_FILENAME) && GetOptions().GetFileHistory())
        {
            if (wxFileExists(event.GetString()))
                GetOptions().GetFileHistory()->AddFileToHistory( event.GetString() );
        }
    }
}

void wxSTEditorFrame::OnSTCUpdateUI(wxStyledTextEvent &event)
{
    event.Skip();
    if (!GetStatusBar()) // nothing to do
        return;

    wxStyledTextCtrl* editor = (wxStyledTextCtrl*)event.GetEventObject();
    int pos   = editor->GetCurrentPos();
    int line  = editor->GetCurrentLine() + 1; // start at 1
    int lines = editor->GetLineCount();
    int col   = editor->GetColumn(pos) + 1;   // start at 1
    int chars = editor->GetLength();

    wxString txt = wxString::Format(wxT("Line %6d of %6d, Col %4d, Chars %6d  "), line, lines, col, chars);
    txt += editor->GetOvertype() ? wxT("[OVR]") : wxT("[INS]");

    if (txt != GetStatusBar()->GetStatusText()) // minor flicker reduction
        SetStatusText(txt, 0);
}

void wxSTEditorFrame::OnMenuOpen(wxMenuEvent &WXUNUSED(event))
{
    // might need to update the preferences, the rest should be ok though
    wxSTEditor* editor = NULL;
    wxWindow* win = wxWindow::FindFocus();

    // see if there's an editor that's a child of this and has the focus
    if (win != NULL)
    {
        editor = wxDynamicCast(win, wxSTEditor);
        if (editor)
        {
            wxWindow* parent = editor->GetParent();
            while (parent && (parent != this))
                parent = parent->GetParent();

            if (parent != this)
                editor = NULL;
        }
    }

    // just use the currently focused editor notebook
    if (editor == NULL)
        editor = GetEditor();

    if (editor && GetMenuBar())
        editor->UpdateItems(NULL, GetMenuBar());
}

void wxSTEditorFrame::OnMenu(wxCommandEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_OnMenu);
    if (guard.IsInside()) return;

    if (!HandleMenuEvent(event))
        event.Skip();
}

bool wxSTEditorFrame::HandleMenuEvent(wxCommandEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_HandleMenuEvent);
    if (guard.IsInside()) return false;

    int win_id  = event.GetId();
    wxSTEditor *editor = GetEditor();

    // menu items that the frame handles before children
    switch (win_id)
    {
        case ID_STE_SAVE_PREFERENCES :
        {
            // we save everything the children do and more
            wxConfigBase *config = wxConfigBase::Get(false);
            if (config)
            {
                SaveConfig(*config, GetOptions().GetConfigPath(STE_OPTION_CFGPATH_FRAME));
                GetOptions().SaveConfig(*config);
            }

            return true;
        }
    }

    // Try the children to see if they'll handle the event first
    if (GetEditorNotebook() && GetEditorNotebook()->HandleMenuEvent(event))
        return true;

    if (editor)
    {
        if (wxDynamicCast(editor->GetParent(), wxSTEditorSplitter) &&
            wxDynamicCast(editor->GetParent(), wxSTEditorSplitter)->HandleMenuEvent(event))
            return true;
        if (editor->HandleMenuEvent(event))
            return true;
    }

    if ((win_id >= wxID_FILE1) && (win_id <= wxID_FILE9))
    {
        if (GetOptions().GetFileHistory())
        {
            wxString fileName = GetOptions().GetFileHistory()->GetHistoryFile(win_id-wxID_FILE1);

            if (GetEditorNotebook())
                GetEditorNotebook()->LoadFile(fileName);
            else if (editor)
                editor->LoadFile(fileName);
        }

        return true;
    }

    switch (win_id)
    {
        case ID_STE_SHOW_FULLSCREEN :
        {
            long style = wxFULLSCREEN_NOBORDER|wxFULLSCREEN_NOCAPTION;
            ShowFullScreen(event.IsChecked(), style);
            return true;
        }
        case ID_STF_SHOW_SIDEBAR :
        {
            if (GetSideSplitter() && m_sideSplitterWin1 && m_sideSplitterWin2)
            {
                if (event.IsChecked())
                {
                    if (!GetSideSplitter()->IsSplit())
                    {
                        GetSideSplitter()->SplitVertically(m_sideSplitterWin1, m_sideSplitterWin2, 100);
                        GetSideNotebook()->Show(true);
                    }
                }
                else if (GetSideSplitter()->IsSplit())
                    GetSideSplitter()->Unsplit(m_sideSplitterWin1);
            }

            UpdateAllItems();
            return true;
        }
        case wxID_EXIT :
        {
            if (GetEditorNotebook())
            {
                if (!GetEditorNotebook()->QuerySaveIfModified())
                    return true;
            }
            else if (editor && (editor->QuerySaveIfModified(true) == wxCANCEL))
                return true;

            Destroy();
            return true;
        }
        case wxID_ABOUT :
        {
            ShowAboutDialog();
            return true;
        }
        default : break;
    }

    return false;
}

void wxSTEditorFrame::OnClose( wxCloseEvent &event )
{
    int style = event.CanVeto() ? wxYES_NO|wxCANCEL : wxYES_NO;

    if (GetEditorNotebook())
    {
        if (!GetEditorNotebook()->QuerySaveIfModified(style))
        {
            event.Veto(true);
            return;
        }
    }
    else if (GetEditor() && (GetEditor()->QuerySaveIfModified(true, style) == wxCANCEL))
    {
        event.Veto(true);
        return;
    }

    // **** Shutdown so that the focus event doesn't crash the editors ****
    SetSendSTEEvents(false);
    event.Skip();
}

//-----------------------------------------------------------------------------
// wxSTEditorFileDropTarget
//-----------------------------------------------------------------------------
#if wxUSE_DRAG_AND_DROP

bool wxSTEditorFrameFileDropTarget::OnDropFiles(wxCoord WXUNUSED(x), wxCoord WXUNUSED(y),
                                                const wxArrayString& filenames)
{
    wxCHECK_MSG(m_owner, false, wxT("Invalid drop target"));
    const size_t count = filenames.GetCount();
    if (count == 0)
        return false;

    // see if it has a notebook and use it to load the files
    if (m_owner->GetEditorNotebook())
    {
        wxArrayString files = filenames;
        m_owner->GetEditorNotebook()->LoadFiles(&files);
    }
    else if (m_owner->GetEditor())
        m_owner->GetEditor()->LoadFile(filenames[0]);

    return true;
}

#endif //wxUSE_DRAG_AND_DROP

//-----------------------------------------------------------------------------
// wxSTETreeCtrlHelper - wxTreeCtrl helper class
//-----------------------------------------------------------------------------

wxArrayString wxSTETreeCtrlHelper::GetItemPath(const wxTreeItemId& id_)
{
    wxArrayString pathArray;
    wxCHECK_MSG(m_treeCtrl, pathArray, wxT("Invalid wxTreeCtrl"));

    wxTreeItemId id = id_;
    wxTreeItemId rootId = m_treeCtrl->GetRootItem();

    while( id && (id != rootId))
    {
        pathArray.Insert(m_treeCtrl->GetItemText(id), 0);
        id = m_treeCtrl->GetItemParent(id);
    }

    return pathArray;
}

bool wxSTETreeCtrlHelper::DeleteItem(const wxArrayString& treePath, bool delete_empty)
{
    wxCHECK_MSG(m_treeCtrl, false, wxT("Invalid wxTreeCtrl"));

    wxTreeItemId id = FindOrInsertItem(treePath, STE_TREECTRLHELPER_FIND);

    return DeleteItem(id, delete_empty, -1) > 0;
}

int wxSTETreeCtrlHelper::DeleteItem(const wxTreeItemId& id_, bool delete_empty, int levels)
{
    wxCHECK_MSG(m_treeCtrl, 0, wxT("Invalid wxTreeCtrl"));

    int n = 0;
    wxTreeItemId id = id_;
    wxTreeItemId parentId;
    wxTreeItemId rootId = m_treeCtrl->GetRootItem();

    if (!id)
        return 0;
    else if (!delete_empty)
    {
        m_treeCtrl->Delete(id);
        n++;
    }
    else
    {
        // back up the tree and delete all parents that have no other children
        wxTreeItemId parentId = m_treeCtrl->GetItemParent(id);
        wxTreeItemId parentId_last;
        wxTreeItemId rootId = m_treeCtrl->GetRootItem();
        m_treeCtrl->Delete(id);
        n++;

        while (parentId && (parentId != rootId) && ((n <= levels) || (levels == -1)))
        {
            wxTreeItemIdValue tmpCookie;
            wxTreeItemId siblingId = m_treeCtrl->GetFirstChild(parentId, tmpCookie);

            if (!siblingId)
            {
                // no other children in this node, try next parent
                parentId_last = parentId;
                parentId = m_treeCtrl->GetItemParent(parentId);
                n++;
            }
            else
            {
                if (parentId_last)
                {
                    m_treeCtrl->Delete(parentId_last);
                }

                break;
            }
        }
    }

    return n;
}

wxTreeItemId wxSTETreeCtrlHelper::FindOrInsertItem(const wxArrayString& treePath, int find_type)
{
    wxCHECK_MSG(m_treeCtrl, wxTreeItemId(), wxT("Invalid wxTreeCtrl"));
    wxCHECK_MSG(treePath.GetCount() > 0, wxTreeItemId(), wxT("Nothing to insert"));

    int n = 0, count = treePath.GetCount();

    // check for and add "Root" if not only_find
    wxTreeItemId parentId = m_treeCtrl->GetRootItem();
    if (!parentId)
    {
        if (find_type == STE_TREECTRLHELPER_FIND)
            return wxTreeItemId();

        parentId = m_treeCtrl->AddRoot(_("Root"), -1, -1, NULL);
    }

    wxTreeItemIdValue rootCookie;
    wxTreeItemId id = m_treeCtrl->GetFirstChild(parentId, rootCookie);

    // check for and add first path if not only_find
    if (!id)
    {
        if (find_type == STE_TREECTRLHELPER_FIND)
            return wxTreeItemId();

        parentId = id = m_treeCtrl->AppendItem(parentId, treePath[n], -1, -1, NULL);
        n++;
    }

    // Iterate though the path list
    while (id && (n < count))
    {
        if (m_treeCtrl->GetItemText(id) == treePath[n])
        {
            if (n == count - 1)       // found the existing item w/ full path
            {
                if (find_type == STE_TREECTRLHELPER_INSERT)
                    return m_treeCtrl->AppendItem(parentId, treePath[n], -1, -1, NULL);
                else
                    return id;
            }

            parentId = id;
            id = m_treeCtrl->GetFirstChild(id, rootCookie); // next path part
            n++;
        }
        else
        {
            id = m_treeCtrl->GetNextSibling(id);         // find this path part
        }

        if (!id)
        {
            if (find_type == STE_TREECTRLHELPER_FIND)
                return wxTreeItemId();

            id = parentId;                              // use last good parent
            for (; n < count; n++)                      // append rest of path
            {
                id = m_treeCtrl->AppendItem(id, treePath[n], -1, -1, NULL);

                if (n == count - 1)
                    return id;
            }
        }

    }

    return wxTreeItemId();
}

size_t wxSTETreeCtrlHelper::GetAllItemIds(const wxTreeItemId& start_id, wxArrayTreeItemIds& arrayIds, int get_type)
{
    wxCHECK_MSG(m_treeCtrl, 0, wxT("Invalid wxTreeCtrl"));

    // MSW crashes on GetNextSibling on the root item
    if (start_id == m_treeCtrl->GetRootItem())
    {
        wxTreeItemIdValue cookie;
        wxTreeItemId id = m_treeCtrl->GetFirstChild(start_id, cookie);
        return DoGetAllItemIds(id, arrayIds, get_type);
    }

    return DoGetAllItemIds(start_id, arrayIds, get_type);
}

size_t wxSTETreeCtrlHelper::DoGetAllItemIds(const wxTreeItemId& start_id, wxArrayTreeItemIds& arrayIds, int get_type)
{
    size_t count = 0;
    wxTreeItemId id = start_id;

    while (id)
    {
        if (get_type == STE_TREECTRLHELPER_GET_ALL)
        {
            arrayIds.Add(id);
            count++;
        }
        else
        {
            wxTreeItemData* data = m_treeCtrl->GetItemData(id);
            if ((data && ((get_type & STE_TREECTRLHELPER_GET_DATA) != 0)) ||
                (!data && ((get_type & STE_TREECTRLHELPER_GET_NODATA) != 0)))
            {
                arrayIds.Add(id);
                count++;
            }
        }

        wxTreeItemIdValue childCookie;
        wxTreeItemId childId = m_treeCtrl->GetFirstChild(id, childCookie);
        if (childId)
            count += DoGetAllItemIds(childId, arrayIds, get_type);

        id = m_treeCtrl->GetNextSibling(id);
    }

    return count;
}

void wxSTETreeCtrlHelper::SortChildren(const wxTreeItemId& item_)
{
    wxCHECK_RET(m_treeCtrl && item_, wxT("Invalid wxTreeCtrl"));

    wxTreeItemIdValue cookie;
    wxTreeItemId childId = m_treeCtrl->GetFirstChild(item_, cookie);

    while (childId)
    {
        m_treeCtrl->SortChildren(childId);
        SortChildren(childId);
        childId = m_treeCtrl->GetNextChild(item_, cookie);
    }
}

