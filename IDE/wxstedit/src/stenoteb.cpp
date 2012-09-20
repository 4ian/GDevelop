///////////////////////////////////////////////////////////////////////////////
// Name:        stenoteb.cpp
// Purpose:     wxSTEditorNotebook
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
#include "wx/stedit/stenoteb.h"
#include "wx/stedit/stedlgs.h"

#include "wx/config.h"    // wxConfigBase
#include "wx/filename.h"  // wxFileName
#include "wx/progdlg.h"   // wxProgressDialog

//-----------------------------------------------------------------------------
// sorting function for strings, after = is the page #, don't sort by that
//-----------------------------------------------------------------------------
int wxCMPFUNC_CONV STN_SortNameCompareFunction(const wxString& first, const wxString& second)
{
    int ret = wxStrcmp(first.BeforeLast(wxT('=')), second.BeforeLast(wxT('=')));
    if (ret == 0)
    {
        // same names, keep the same order
        long f = 0, s = 0;
        wxCHECK_MSG(first.AfterLast(wxT('=')).ToLong(&f), 0, wxT("Invalid first page name for sorting"));
        wxCHECK_MSG(second.AfterLast(wxT('=')).ToLong(&s), 0, wxT("Invalid second page name for sorting"));
        ret = f > s ? 1 : -1;
    }

    return ret;
}

//-----------------------------------------------------------------------------
// wxSTEditorNotebook
//-----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC_CLASS(wxSTEditorNotebook, wxNotebook)

BEGIN_EVENT_TABLE(wxSTEditorNotebook, wxNotebook)
    EVT_RIGHT_UP               (wxSTEditorNotebook::OnRightUp)
    EVT_MIDDLE_UP              (wxSTEditorNotebook::OnMiddleUp)
    EVT_MENU                   (wxID_ANY, wxSTEditorNotebook::OnMenu)
    EVT_STE_STATE_CHANGED      (wxID_ANY, wxSTEditorNotebook::OnSTEState)
    EVT_NOTEBOOK_PAGE_CHANGED  (wxID_ANY, wxSTEditorNotebook::OnPageChanged)

    EVT_FIND                   (wxID_ANY, wxSTEditorNotebook::OnFindDialog)
    EVT_FIND_NEXT              (wxID_ANY, wxSTEditorNotebook::OnFindDialog)
    EVT_FIND_REPLACE           (wxID_ANY, wxSTEditorNotebook::OnFindDialog)
    EVT_FIND_REPLACE_ALL       (wxID_ANY, wxSTEditorNotebook::OnFindDialog)
    EVT_FIND_CLOSE             (wxID_ANY, wxSTEditorNotebook::OnFindDialog)
END_EVENT_TABLE()

void wxSTEditorNotebook::Init()
{
    m_stn_page_count     = 0;
    m_stn_selection      = -1;
    m_stn_max_page_count = STN_NOTEBOOK_PAGES_DEFAULT_MAX;
}

bool wxSTEditorNotebook::Create( wxWindow *parent, wxWindowID id,
                                 const wxPoint& pos, const wxSize& size,
                                 long style, const wxString& name)
{
    if (!wxNotebook::Create(parent, id, pos, size, style, name))
        return false;

    wxCommandEvent event(wxEVT_STN_CREATED, GetId());
    event.SetEventObject(this);
    GetParent()->GetEventHandler()->ProcessEvent(event);
    return true;
}

wxSTEditorNotebook::~wxSTEditorNotebook()
{
    SetSendSTEEvents(false);
}

bool wxSTEditorNotebook::Destroy()
{
    SetSendSTEEvents(false);
    return wxNotebook::Destroy();
}
void wxSTEditorNotebook::SetSendSTEEvents(bool send)
{
    size_t n, count = GetPageCount();
    for (n = 0; n < count; n++)
    {
        wxSTEditorSplitter *splitter = GetEditorSplitter(n);
        if (splitter) splitter->SetSendSTEEvents(send);
    }
}

void wxSTEditorNotebook::CreateOptions(const wxSTEditorOptions& options)
{
    m_options = options;

    // create the popupmenu if desired
    wxSTEditorMenuManager *steMM = GetOptions().GetMenuManager();
    if (steMM && GetOptions().HasNotebookOption(STN_CREATE_POPUPMENU) &&
        !GetOptions().GetNotebookPopupMenu())
        GetOptions().SetNotebookPopupMenu(steMM->CreateNotebookPopupMenu(), false);
}

wxString wxSTEditorNotebook::FileNameToTabName(const wxString& fileName) const
{
    wxString name = wxFILE_SEP_PATH+fileName;
    return name.AfterLast(wxFILE_SEP_PATH);
}

void wxSTEditorNotebook::OnPageChanged(wxNotebookEvent &event)
{
    // this is our fake event to ensure selection is correct
    if (event.GetString() == wxT("wxSTEditorNotebook Page Change"))
    {
        SetSelection(event.GetExtraLong()); // FIXME no Clone in wxNotebookEvent
        return;
    }

    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    bool update_page_state = !guard.IsInside();

#ifdef __WXMSW__
    // let the msw notebook really change the page first
    //Florian Rival - 06/13/2011 : OnSelChange no more used
    event.Skip(false);
#else
    event.Skip();
#endif

    int sel = event.GetSelection();

    // NOTE: GTK selection can get out of sync, we "fix" it in GetEditorSplitter
    //if (sel >= wxNotebook::GetPageCount())
    //    sel = wxNotebook::GetPageCount()-1;

    // make sure the cursor is shown by setting the STC focus
    if ((sel >= 0) && GetEditor(sel))
    {
        GetEditor(sel)->SetSTCFocus(true);
        GetEditor(sel)->SetFocus();
    }

    if (update_page_state) UpdatePageState();
}

wxSTEditor *wxSTEditorNotebook::GetEditor( int page )
{
    wxSTEditorSplitter *splitter = GetEditorSplitter(page);
    if (splitter)
        return splitter->GetEditor();

    return NULL;
}

wxSTEditorSplitter *wxSTEditorNotebook::GetEditorSplitter( int page )
{
    int page_count = GetPageCount();
    if (page_count == 0)
        return NULL;

    if ((page < 0) || (page >= page_count))
        page = GetSelection();

    if (((page < 0) && (page_count > 0)) || (page >= page_count))
    {
        SetSelection(0); // GTK can get out of sync, force it
        page = GetSelection();
    }
    if (page < 0)
        return NULL;

    return wxDynamicCast(GetPage(page), wxSTEditorSplitter);
}

int wxSTEditorNotebook::FindEditorPage(wxSTEditor *editor)
{
    int sel = GetSelection();

    // assume that we want the selected editor so check it first
    if ((sel >= 0) && GetEditorSplitter(sel) &&
        ((GetEditorSplitter(sel)->GetEditor1() == editor) ||
         (GetEditorSplitter(sel)->GetEditor2() == editor)) )
    {
        return sel;
    }
    else
    {
        int n, n_pages = GetPageCount();
        for (n = 0; n < n_pages; n++)
        {
            if (n == sel) continue;

            if (GetEditorSplitter(n) &&
                ((GetEditorSplitter(n)->GetEditor1() == editor) ||
                 (GetEditorSplitter(n)->GetEditor2() == editor)) )
            {
                return n;
            }
        }
    }

    return wxNOT_FOUND;
}

int wxSTEditorNotebook::FindEditorPageByFileName(const wxString& filename)
{
    size_t n, count = GetPageCount();
    for (n = 0; n < count; n++)
    {
        wxSTEditor* editor = GetEditor(n);
        if (editor && (editor->GetFileName() == filename))
            return n;
    }
    return wxNOT_FOUND;
}

int wxSTEditorNotebook::FindEditorPageById(wxWindowID win_id)
{
    wxWindow *win = FindWindow(win_id);
    if (win && wxDynamicCast(win, wxSTEditor))
        return FindEditorPage((wxSTEditor*)win);

    return wxNOT_FOUND;
}

wxSTEditorSplitter *wxSTEditorNotebook::CreateSplitter(wxWindowID id)
{
    wxSTEditorSplitter *newSplitter = NULL;

    // Let someone create an editor and put it back into the event
    wxCommandEvent event(wxEVT_STN_CREATE_SPLITTER, GetId());
    event.SetEventObject(this);
    event.SetInt((int)id);
    GetEventHandler()->ProcessEvent(event);

    // did anyone get the event and set their own splitter window
    if ((event.GetEventObject() != NULL) &&
        (wxDynamicCast(event.GetEventObject(), wxSTEditorSplitter) != NULL))
    {
        newSplitter = wxDynamicCast(event.GetEventObject(), wxSTEditorSplitter);
        if (newSplitter->GetParent() != this)
        {
            wxFAIL_MSG(wxT("Incorrect parent for wxSTEditorSplitter, should be wxSTEditorNotebook"));
            return NULL;
        }
    }
    else
    {
        newSplitter = new wxSTEditorSplitter(this, id, wxDefaultPosition,
                                             wxDefaultSize, wxSP_3D);
        newSplitter->CreateOptions(GetOptions());
    }

    return newSplitter;
}

wxSTEditorSplitter* wxSTEditorNotebook::InsertEditorSplitter(int nPage, wxWindowID win_id,
                                                             const wxString& title, bool bSelect)
{
    if (GetPageCount() >= GetMaxPageCount())
    {
        wxMessageBox(_("Maximum number of notebook pages exceeded,\nplease close one first."),
                     _("Too many pages opened"), wxOK|wxICON_ERROR, this);

        return NULL;
    }

    wxSTEditorSplitter *splitter = CreateSplitter(win_id);
    wxCHECK_MSG(splitter, NULL, wxT("Invalid splitter"));
    splitter->GetEditor()->NewFile(title);
    if (InsertEditorSplitter(nPage, splitter, bSelect))
        return splitter;
    else
        delete splitter;

    return NULL;
}

bool wxSTEditorNotebook::InsertEditorSplitter(int nPage, wxSTEditorSplitter* splitter,
                                              bool bSelect)
{
    wxCHECK_MSG(splitter && (splitter->GetParent() == this), false,
                wxT("Invalid wxSTEditorSplitter or parent"));

    if (GetPageCount() >= GetMaxPageCount())
    {
        wxMessageBox(_("Maximum number of notebook pages exceeded,\nplease close one first."),
                     _("Too many pages opened"), wxOK|wxICON_ERROR, this);

        delete splitter;
        return false;
    }

    wxString title = FileNameToTabName(splitter->GetEditor()->GetFileName());
    size_t n_pages = GetPageCount();

    if (nPage < 0) // they want to insert it anywhere
    {
        // presort the insert page to reduce flicker
        if ((n_pages > 0) && GetOptions().HasNotebookOption(STN_ALPHABETICAL_TABS))
        {
            wxArrayString names;
            names.Add(title+wxT("=999999")); // insert after any other pages

            for (size_t n = 0; n < n_pages; n++)
            {
                wxString name(GetPageText(n));
                if ((name.Length() > 0) && (name[0u] == wxT('*')))
                    name = name.Mid(1);

                names.Add(name + wxString::Format(wxT("=%d"), n));
            }

            names.Sort(STN_SortNameCompareFunction);
            nPage = names.Index(title+wxT("=999999"));
        }
        else
            nPage = n_pages;
    }

    wxString modified = splitter->GetEditor() && splitter->GetEditor()->IsModified() ? wxT("*") : wxT("");
    if (n_pages < 1)
        bSelect = true;
    if (nPage < int(n_pages))
        return InsertPage(nPage, splitter, modified+title, bSelect);

    bool ret = AddPage(splitter, modified+title, bSelect);
    UpdateAllItems();
    return ret;
}

void wxSTEditorNotebook::SortTabs(int style)
{
    if ((int)GetPageCount() < 2)
        return;

    if (STE_HASBIT(style, STN_ALPHABETICAL_TABS))
    {
        int sel = GetSelection();
        int new_sel = sel;
        int page_count = GetPageCount();
        int n;

        if (page_count < 2)
            return;

        wxString curPageName;
        wxArrayString names;

        for (n = 0; n < page_count; n++)
        {
            wxString name(GetPageText(n));
            if ((name.Length() > 0) && (name[0u] == wxT('*')))
                name = name.Mid(1);

            names.Add(name + wxString::Format(wxT("=%d"), n));
        }

        names.Sort(STN_SortNameCompareFunction);

        bool sel_changed = false;

        for (n = 0; n < page_count; n++)
        {
            long old_page = 0;
            names[n].AfterLast(wxT('=')).ToLong(&old_page);

            if (old_page != long(n))
            {
                wxWindow *oldWin = GetPage(old_page);
                wxString oldName = GetPageText(old_page);

                if (oldWin && RemovePage(old_page))
                {
                    sel_changed = true;

                    if (old_page == sel)
                        new_sel = n;

                    if (n < page_count - 1)
                        InsertPage(n+1, oldWin, oldName, old_page == sel);
                    else
                        AddPage(oldWin, oldName, old_page == sel);
                }
            }
        }

        if (sel_changed)
        {
            wxNotebookEvent noteEvent(wxEVT_COMMAND_NOTEBOOK_PAGE_CHANGED, GetId(),
                                    new_sel, new_sel);
            noteEvent.SetString(wxT("wxSTEditorNotebook Page Change"));
            noteEvent.SetExtraLong(new_sel); // FIXME no Clone in wxNotebookEvent
            // NOTE: this may have to be AddPendingEvent for wx < 2.7 since gtk
            //       can become reentrant
            GetEventHandler()->AddPendingEvent(noteEvent);
        }

        // causes reentrant assert in gtk, even though it's necessary sometimes
        //SetSelection(new_sel); // force selection for GTK
    }
}

bool wxSTEditorNotebook::ClosePage(int n, bool query_save_if_modified)
{
    wxCHECK_MSG((n >= 0) && (n < (int)GetPageCount()), false, wxT("Invalid page"));
    wxSTEditor *editor = GetEditor(n);

    if (!editor)
        return false;

    int ret = wxID_NO;
    int sel = GetSelection();

    if (query_save_if_modified)
        ret = editor->QuerySaveIfModified(true);

    if (ret != wxCANCEL)
        ret = int(DeletePage(n));

    if ((GetPageCount() == 0) && !GetOptions().HasNotebookOption(STN_ALLOW_NO_PAGES))
        InsertEditorSplitter(-1, wxID_ANY, GetOptions().GetDefaultFileName(), true);

    // Force selection for GTK, else if try to close the "current page" without
    //  first clicking in it you delete some other page
    int page_count = GetPageCount();
    if ((sel >= page_count) && (page_count > 0))
        SetSelection(wxMax(0, wxMin(sel, page_count-1)));

    UpdateAllItems();

    return ret != 0;
}

bool wxSTEditorNotebook::CloseAllPages(bool query_save_if_modified)
{
    if (query_save_if_modified && !QuerySaveIfModified())
        return false;

    DeleteAllPages();

    if ((GetPageCount() == 0) && !GetOptions().HasNotebookOption(STN_ALLOW_NO_PAGES))
        InsertEditorSplitter(-1, wxID_ANY, GetOptions().GetDefaultFileName(), true);

    UpdateAllItems();
    return true;
}

bool wxSTEditorNotebook::QuerySaveIfModified(int style)
{
    int n_pages = GetPageCount();

    for (int n = 0; n < n_pages; n++)
    {
        wxSTEditor *editor = GetEditor(n);
        if (editor)
        {
            if (editor->QuerySaveIfModified(true, style) == wxCANCEL)
                return false;
        }
    }

    return true;
}

bool wxSTEditorNotebook::CanSaveAll()
{
    int n, n_pages = GetPageCount();
    wxSTEditor *editor = NULL;

    for (n = 0; n < n_pages; n++)
    {
        editor = GetEditor(n);

        if (editor && editor->CanSave())
            return true;
    }

    return false;
}

void wxSTEditorNotebook::OnRightUp(wxMouseEvent &event)
{
    wxMenu* popupMenu = GetOptions().GetNotebookPopupMenu();
    if (popupMenu)
    {
        UpdateItems(popupMenu);
        PopupMenu(popupMenu, event.GetPosition());
    }
    else
        event.Skip();
}

void wxSTEditorNotebook::OnMiddleUp(wxMouseEvent &event)
{
    wxPoint MClickPoint = event.GetPosition();
    int NotePage = HitTest(MClickPoint, NULL);
    if (NotePage != wxNOT_FOUND)
    {
        ClosePage(NotePage, true);
    }
    else
        event.Skip();
}

void wxSTEditorNotebook::OnMenu(wxCommandEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_OnMenu);
    if (guard.IsInside()) return;

    if (!HandleMenuEvent(event))
        event.Skip();
}

bool wxSTEditorNotebook::HandleMenuEvent(wxCommandEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_HandleMenuEvent);
    if (guard.IsInside()) return false;

    int n_page = GetPageCount();
    int win_id = event.GetId();

    if (win_id == wxID_NEW)
    {
        NewPage();
        return true;
    }
    else if (win_id == wxID_OPEN)
    {
        LoadFiles();
        return true;
    }
    else if (win_id == wxID_SAVEAS)
    {
        wxSTEditor *editor = GetEditor();
        if (editor)
        {
            if (!editor->GetFileModificationTime().IsValid())
            {
                editor->SaveFile(true);
            }
            else
            {
                wxSTEditorSplitter *splitter = CreateSplitter(wxID_ANY);
                wxCHECK_MSG(splitter, true, wxT("Invalid splitter"));
                wxSTEditor *newEditor = splitter->GetEditor();
                wxCHECK_MSG(newEditor, true, wxT("Invalid splitter editor"));

                // Make this new editor identical to the original one
                // these are probably not necessary
                //splitter->GetEditor()->SetOptions(editor->GetOptions());
                //splitter->GetEditor()->RegisterPrefs(editor->GetEditorPrefs());
                //splitter->GetEditor()->RegisterStyles(editor->GetEditorStyles());
                //splitter->GetEditor()->RegisterLangs(editor->GetEditorLangs());
                newEditor->SetLanguage(editor->GetLanguageId());
                newEditor->SetFileName(editor->GetFileName());
                newEditor->SetText(editor->GetText());
                newEditor->Colourise(0, -1);

                // if they really did save it and to a new file add it
                if (newEditor->SaveFile(true))
                {
                    // they saved it to the same filename so just update old editor
                    if (newEditor->GetFileName() == editor->GetFileName())
                    {
                        editor->SetFileModificationTime(newEditor->GetFileModificationTime());
                        delete splitter;
                    }
                    else if (!InsertEditorSplitter(-1, splitter, true))
                        delete splitter;
                }
            }
        }
        return true;
    }
    else if (win_id == ID_STN_SAVE_ALL)
    {
        SaveAllFiles();
        return true;
    }
    else if ((win_id >= ID_STN_GOTO_PAGE_START) && (win_id < ID_STN_GOTO_PAGE_START+n_page))
    {
        SetSelection(win_id - ID_STN_GOTO_PAGE_START);
        return true;
    }
    else if (win_id == ID_STN_CLOSE_PAGE)
    {
        if ((GetSelection() != -1) && GetEditor(GetSelection()))
            ClosePage(GetSelection(), true);

        return true;
    }
    else if (win_id == ID_STN_CLOSE_ALL)
    {
        int ret = wxMessageBox(_("Close all pages\?"), _("Confim closing"),
                               wxICON_QUESTION|wxOK|wxCANCEL, this);
        if (ret == wxOK)
            CloseAllPages(true);

        return true;
    }
    else if ((win_id >= ID_STN_CLOSE_PAGE_START) && (win_id < ID_STN_CLOSE_PAGE_START+n_page))
    {
        ClosePage(win_id - ID_STN_CLOSE_PAGE_START);
        return true;
    }
    else if (win_id == ID_STN_WIN_PREVIOUS)
    {
        if ((GetPageCount() > 0) && (GetSelection() - 1 >= 0))
            SetSelection(GetSelection() - 1);
        else if (GetPageCount() > 0)
            SetSelection(GetPageCount() - 1);

        return true;
    }
    else if (win_id == ID_STN_WIN_NEXT)
    {
        if ((GetPageCount() > 0) && (GetSelection() + 1 < (int)GetPageCount()))
            SetSelection(GetSelection() + 1);
        else if (GetPageCount() > 0)
            SetSelection(0);

        return true;
    }
    else if (win_id == ID_STN_WINDOWS)
    {
        wxSTEditorWindowsDialog(this);
        return true;
    }

    return false;
}

void wxSTEditorNotebook::OnSTEState(wxSTEditorEvent &event)
{
    event.Skip(true);
    wxSTEditor *editor = event.GetEditor();

    if ( event.HasStateChange(STE_FILENAME | STE_MODIFIED) )
    {
        if (GetOptions().HasNotebookOption(STN_UPDATE_TITLES))
        {
            int page = FindEditorPage(editor);
            if (page >= 0) // if < 0 then not in notebook (or at least yet)
            {
                wxString modified = editor->GetModify() ? wxT("*") : wxT("");
                SetPageText(page, modified+FileNameToTabName(event.GetString()));
                SortTabs(GetOptions().GetNotebookOptions());
            }
        }
    }

    if (event.HasStateChange(STE_FILENAME | STE_MODIFIED | STE_CANSAVE))
    {
        UpdateAllItems();
    }
}

bool wxSTEditorNotebook::NewPage( const wxString& title_ )
{
    wxString title(title_);

    if (title.IsEmpty())
    {
        title = GetOptions().GetDefaultFileName();
                //wxGetTextFromUser(_("New file name"), _("New file"),
                //                  GetOptions().GetDefaultFileName(), this);
    }

    if (!title.IsEmpty())
    {
        wxSTEditorSplitter *splitter = CreateSplitter(wxID_ANY);
        wxCHECK_MSG(splitter, true, wxT("Invalid splitter"));
        splitter->GetEditor()->NewFile(title);
        InsertEditorSplitter(-1, splitter, true);
        return true;
    }

    return false;
}

bool wxSTEditorNotebook::LoadFile( const wxString &fileName_, const wxString &extensions_)
{
    wxString fileName = fileName_;
    wxString extensions = !extensions_.IsEmpty() ? extensions_ : GetOptions().GetDefaultFileExtensions();

    if (fileName.IsEmpty())
    {
        wxFileDialog fileDialog( this, _("Open file into new notebook page"),
                                 GetOptions().GetDefaultFilePath(),
                                 wxEmptyString, extensions,
                                 wxFD_OPEN);

        if (fileDialog.ShowModal() == wxID_OK)
            fileName = fileDialog.GetPath();
        else
            return false;
    }

    bool ok = false;

    if (!wxFileExists(fileName))
    {
        wxSTEditorSplitter *splitter = CreateSplitter(wxID_ANY);
        wxCHECK_MSG(splitter, false, wxT("Invalid splitter"));
        splitter->GetEditor()->NewFile(fileName);
        ok = InsertEditorSplitter(-1, splitter, true);
    }
    else
    {
        // load the file from disk and only load it once
        wxFileName fName(fileName);
        GetOptions().SetDefaultFilePath(fName.GetPath(wxPATH_GET_VOLUME));

        int page = FindEditorPageByFileName(fileName);
        if (page != wxNOT_FOUND)
        {
            SetSelection(page);
        }
        else
        {
            wxSTEditorSplitter *splitter = CreateSplitter(wxID_ANY);
            wxCHECK_MSG(splitter, false, wxT("Invalid splitter"));
            splitter->GetEditor()->LoadFile(fileName);
            ok = InsertEditorSplitter(-1, splitter, true);
        }
    }

    return ok;
}

bool wxSTEditorNotebook::LoadFiles( wxArrayString *filePaths_,
                                    const wxString &extensions_)
{
    wxString extensions = !extensions_.IsEmpty() ? extensions_ : GetOptions().GetDefaultFileExtensions();
    wxArrayString filePaths;
    if (filePaths_)
        filePaths = *filePaths_;

    if (filePaths.GetCount() < 1u)
    {
        wxFileDialog fileDialog( this, _("Open file(s) into new notebook page"),
                                 GetOptions().GetDefaultFilePath(),
                                 wxEmptyString, extensions,
                                 wxFD_OPEN | wxFD_MULTIPLE );

        if (fileDialog.ShowModal() == wxID_OK)
            fileDialog.GetPaths(filePaths);
        else
            return false;
    }

    if (!filePaths.GetCount())
        return false;

    size_t n, len = 0, count = filePaths.GetCount();
    for (n = 0; n < count; n++) len = wxMax(len, filePaths[n].Length());

    wxProgressDialog progDlg(_("Loading files..."),
                             wxString(wxT('-'), len + 10),
                             filePaths.GetCount(), this,
                             wxPD_CAN_ABORT|wxPD_ELAPSED_TIME|wxPD_APP_MODAL|wxPD_AUTO_HIDE);

    // block updating the pages while loading them
    {
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);

    for (n = 0; n < count; n++)
    {
        wxString fileName = filePaths[n];
        if (!progDlg.Update(n, wxString::Format(wxT("%d/%d : "), n+1, count) + fileName))
            break;

        if (fileName.IsEmpty() || !wxFileExists(fileName))
        {
            // when selecting multiple files with file selector you can easily
            // select the dir "..", throw it away
            wxString theFileName = fileName.AfterLast(wxFILE_SEP_PATH);
            if ((theFileName != wxT("..")) && (theFileName != wxT(".")))
            {
                wxSTEditorSplitter *splitter = CreateSplitter(wxID_ANY);
                wxCHECK_MSG(splitter, false, wxT("invalid splitter"));
                splitter->GetEditor()->NewFile(fileName);
                if (!InsertEditorSplitter(-1, splitter)) break; // checks overflow
            }
        }
        else
        {
            if (!LoadFile(fileName)) break;
        }
    }
    }

    UpdatePageState();

    return true;
}

void wxSTEditorNotebook::SaveAllFiles()
{
    int n_page = GetPageCount();
    wxSTEditor *editor = NULL;

    for (int n = 0; n < n_page; n++)
    {
        editor = GetEditor(n);
        if (editor && editor->CanSave())
            editor->SaveFile(false);
    }
}

void wxSTEditorNotebook::UpdateGotoCloseMenu(wxMenu *menu, int startID)
{
    if (!menu) return;

    int n, page_count = GetPageCount();
    int item_count = menu->GetMenuItemCount();

// ========  Radio items have problems in gtk
/*
    // delete extra menu items (if any)
    if (page_count < item_count)
    {
        for (n=page_count; n < item_count; n++)
            menu->Delete(startID+n);

        item_count = page_count;
    }

    wxString label;

    // change labels of existing items
    for (n=0; n<item_count; n++)
    {
        label = wxString::Format(wxT("%2d : %s"), n+1, GetPageText(n).c_str());
        if (menu->GetLabel(startID+n) != label)
            menu->SetLabel(startID+n, label);
    }
    // append new pages
    for (n=item_count; n<page_count; n++)
        menu->AppendRadioItem(startID+n, wxString::Format(wxT("%2d : %s"), n+1, GetPageText(n).c_str()));
*/
/*
    // This just clears it and adds the items fresh
    for (n=0; n<item_count; n++)
        menu->Delete(startID+n);
    for (n=0; n<page_count; n++)
        menu->AppendRadioItem(startID+n, wxString::Format(wxT("%2d : %s"), n+1, GetPageText(n).c_str()));
*/

// ==== check items do not

    // delete extra menu items (if any)
    if (page_count < item_count)
    {
        for (n = page_count; n < item_count; n++)
            menu->Delete(startID+n);

        item_count = page_count;
    }

    wxString label;

    // change labels of existing items
    for (n = 0; n < item_count; n++)
    {
        label = wxString::Format(wxT("%2d : %s"), n+1, GetPageText(n).c_str());
        if (menu->GetLabel(startID+n) != label)
            menu->SetLabel(startID+n, label);

        menu->Check(startID+n, false);
    }
    // append new pages
    for (n = item_count; n < page_count; n++)
        menu->AppendCheckItem(startID+n, wxString::Format(wxT("%2d : %s"), n+1, GetPageText(n).c_str()));

/*
    // use check items
    for (n = 0; n < item_count; n++)
        menu->Delete(startID+n);
    for (n = 0; n < page_count; n++)
        menu->AppendCheckItem(startID+n, wxString::Format(wxT("%2d : %s"), n+1, GetPageText(n).c_str()));
*/

    // show what page we're on
    int sel = GetSelection();
    if ((sel >= 0) && (page_count >= 0))
        menu->Check(startID+sel, true);
}

void wxSTEditorNotebook::UpdateAllItems()
{
    UpdateItems(GetOptions().GetEditorPopupMenu(), GetOptions().GetMenuBar(),
                                                   GetOptions().GetToolBar());
    UpdateItems(GetOptions().GetNotebookPopupMenu());
    UpdateItems(GetOptions().GetSplitterPopupMenu());
}
void wxSTEditorNotebook::UpdateItems(wxMenu *menu, wxMenuBar *menuBar, wxToolBar *toolBar)
{
    if (!menu && !menuBar && !toolBar) return;

    bool has_pages    = GetPageCount() > 0;
    bool can_save_all = CanSaveAll();
    bool editor_page  = GetEditor() != NULL;

    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_SAVE_ALL, can_save_all);

    if (menu)
    {
        wxMenuItem *gotoMenuItem = menu->FindItem(ID_STN_MENU_GOTO);
        if (gotoMenuItem)
            UpdateGotoCloseMenu(gotoMenuItem->GetSubMenu(), ID_STN_GOTO_PAGE_START);

        wxMenuItem *closeMenuItem = menu->FindItem(ID_STN_MENU_CLOSE);
        if (closeMenuItem)
            UpdateGotoCloseMenu(closeMenuItem->GetSubMenu(), ID_STN_CLOSE_PAGE_START);
    }
    if (menuBar)
    {
        wxMenuItem *gotoMenuItem = menuBar->FindItem(ID_STN_MENU_GOTO);
        if (gotoMenuItem)
            UpdateGotoCloseMenu(gotoMenuItem->GetSubMenu(), ID_STN_GOTO_PAGE_START);

        wxMenuItem *closeMenuItem = menuBar->FindItem(ID_STN_MENU_CLOSE);
        if (closeMenuItem)
            UpdateGotoCloseMenu(closeMenuItem->GetSubMenu(), ID_STN_CLOSE_PAGE_START);
    }

    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_WIN_PREVIOUS, has_pages); // && (GetSelection() > 0));
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_WIN_NEXT,     has_pages); // && (GetSelection()+1 < (int)GetPageCount()));

    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_MENU_GOTO,  has_pages);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_CLOSE_PAGE, editor_page);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_CLOSE_ALL,  has_pages);
    STE_MM::DoEnableItem(menu, menuBar, toolBar, ID_STN_MENU_CLOSE, has_pages);
}

void wxSTEditorNotebook::UpdatePageState()
{
    int page_count = GetPageCount();
    int selection  = GetSelection();
    if (page_count < 1) selection = -1; // force for gtk

    if ((page_count == m_stn_page_count) && (selection == m_stn_selection))
        return;

    wxNotebookEvent stnEvent(wxEVT_STN_PAGE_CHANGED, GetId());
    stnEvent.SetEventObject(this);
    stnEvent.SetSelection(selection);
    stnEvent.SetOldSelection(m_stn_selection);

    m_stn_page_count = page_count;
    m_stn_selection  = selection;

    GetEventHandler()->ProcessEvent(stnEvent);

    UpdateAllItems();
}

bool wxSTEditorNotebook::AddPage(wxWindow *page, const wxString& text,
                                 bool bSelect, int imageId)
{
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    bool ret = wxNotebook::AddPage(page, text, bSelect, imageId);
    if (!guard.IsInside()) UpdatePageState();
    return ret;
}
bool wxSTEditorNotebook::InsertPage(int nPage, wxNotebookPage *pPage,
                            const wxString& strText, bool bSelect, int imageId)
{
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    bool ret = wxNotebook::InsertPage(nPage, pPage, strText, bSelect, imageId);
    if (!guard.IsInside()) UpdatePageState();
    return ret;
}
int wxSTEditorNotebook::GetSelection() const
{
    wxSTEditorNotebook* noteBook = (wxSTEditorNotebook*)this; // unconst this
    wxSTERecursionGuard guard(noteBook->m_rGuard_UpdatePageState);
    int  ret = wxNotebook::GetSelection();
    if (!guard.IsInside()) noteBook->UpdatePageState();
    return ret;
}
int wxSTEditorNotebook::SetSelection(int nPage)
{
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    int  ret = wxNotebook::SetSelection(nPage);
    if (!guard.IsInside()) UpdatePageState();
    return ret;
}
bool wxSTEditorNotebook::DeletePage(int nPage)
{
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    bool ret = wxNotebook::DeletePage(nPage);
    if (!guard.IsInside()) UpdatePageState();
    return ret;
}
bool wxSTEditorNotebook::RemovePage(int nPage)
{
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    bool ret = wxNotebook::RemovePage(nPage);
    if (!guard.IsInside()) UpdatePageState();
    return ret;
}
bool wxSTEditorNotebook::DeleteAllPages()
{
    wxSTERecursionGuard guard(m_rGuard_UpdatePageState);
    bool ret = wxNotebook::DeleteAllPages();
    if (!guard.IsInside()) UpdatePageState();
    return ret;
}

void wxSTEditorNotebook::OnFindDialog(wxFindDialogEvent &event)
{
    wxSTERecursionGuard guard(m_rGuard_OnFindDialog);
    if (guard.IsInside()) return;

    // currently opened page is where the search starts
    wxSTEditor *editor = GetEditor();

    if (!editor)
        return;

    // just search the given page by letting the editor handle it
    if (!STE_HASBIT(event.GetFlags(), STE_FR_ALLDOCS))
    {
        editor->HandleFindDialogEvent(event);
        return;
    }

    wxEventType eventType = event.GetEventType();
    wxString findString   = event.GetFindString();
    long flags            = event.GetFlags();

    editor->SetFindString(findString, true);
    editor->SetFindFlags(flags, true);

    int pos = editor->GetCurrentPos();
    if ((eventType == wxEVT_COMMAND_FIND) && STE_HASBIT(flags, STE_FR_WHOLEDOC))
        pos = -1;

    // we have to move cursor to start of word if last backwards search suceeded
    //   note cmp is ok since regexp doesn't handle searching backwards
    if ((eventType == wxEVT_COMMAND_FIND_NEXT) && !STE_HASBIT(flags, wxFR_DOWN))
    {
        if ((labs(editor->GetSelectionEnd() - editor->GetSelectionStart()) == long(findString.Length()))
            && (editor->GetFindReplaceData()->StringCmp(findString, editor->GetSelectedText(), flags)))
                pos -= findString.Length() + 1; // doesn't matter if it matches or not, skip it
    }

    if ((eventType == wxEVT_COMMAND_FIND) || (eventType == wxEVT_COMMAND_FIND_NEXT))
    {
        // ExtraLong is the line number pressed in the find all editor
        //  when -1 it means that we want a new find all search
        if (STE_HASBIT(flags, STE_FR_FINDALL) && (event.GetExtraLong() > -1))
        {
            wxString str = editor->GetFindReplaceData()->GetFindAllStrings()->Item(event.GetExtraLong());
            long editor_addr = 0;
            wxCHECK_RET(str.BeforeFirst(wxT('@')).ToLong(&editor_addr), wxT("Invalid editor in find all str"));

            wxSTEditor *e = (wxSTEditor*)editor_addr;
            int page = FindEditorPage(e);
            if (page != wxNOT_FOUND)
            {
                SetSelection(page);
                GetEditor(page)->HandleFindDialogEvent(event);
            }
        }
        else if (STE_HASBIT(flags, STE_FR_FINDALL|STE_FR_BOOKMARKALL))
        {
            // sum up all of the find strings in all editors
            size_t n, count = GetPageCount();

            for (n = 0; n < count; n++)
            {
                wxSTEditor* e = GetEditor(n);
                if (e)
                    e->HandleFindDialogEvent(event);
            }
        }
        else
        {
            if ((eventType == wxEVT_COMMAND_FIND) && STE_HASBIT(flags, STE_FR_WHOLEDOC))
                pos = 0;

            pos = FindString(findString, pos, flags, STE_FINDSTRING_SELECT|STE_FINDSTRING_GOTO);

            if (pos >= 0)
            {
                //editor->SetFocus();
            }
            else
            {
                wxBell();                 // bell ok to signify no more occurances?
            }
        }
    }
    else if (eventType == wxEVT_COMMAND_FIND_REPLACE)
    {
        if (!editor->GetFindReplaceData()->StringCmp(findString, editor->GetSelectedText(), flags))
        {
            wxBell();
            return;
        }

        int pos = editor->GetSelectionStart();
        wxString replaceString = event.GetReplaceString();
        editor->ReplaceSelection(replaceString);
        editor->EnsureCaretVisible();
        editor->SetSelection(pos, pos+replaceString.Length());
        editor->UpdateCanDo(true);
        //editor->SetFocus();
    }
    else if (eventType == wxEVT_COMMAND_FIND_REPLACE_ALL)
    {
        wxString replaceString = event.GetReplaceString();
        if (editor->GetFindReplaceData()->StringCmp(findString, replaceString, flags))
            return;

        wxBusyCursor busy;

        int pages = 0;
        int count = ReplaceAllStrings(findString, replaceString, flags, &pages);

        wxString msg = wxString::Format(_("Replaced %d occurances of\n'%s' with '%s'\nin %d documents."),
                       count, findString.c_str(), replaceString.c_str(), pages);

        wxMessageBox( msg, _("Finished replacing"),
                      wxOK|wxICON_INFORMATION|wxSTAY_ON_TOP,
                      wxGetTopLevelParent(this) ); // make it be on top in GTK
                      //wxDynamicCast(event.GetEventObject(), wxDialog));
    }
    else if (eventType == wxEVT_COMMAND_FIND_CLOSE)
    {
        //if (wxDynamicCast(event.GetEventObject(), wxDialog))
        //    ((wxDialog*)event.GetEventObject())->Destroy();
    }
}

int wxSTEditorNotebook::FindString(const wxString &str, int start_pos,
                                   int flags, int action)
{
    int n_pages = GetPageCount();
    int n_sel = GetSelection();
    int n = -1;
    int pos = start_pos;
    bool forward = STE_HASBIT(flags, wxFR_DOWN) != 0;
    int noteb_flags = flags & (~STE_FR_WRAPAROUND); // switch to new page

    wxSTEditor *editor = NULL;
    if (n_sel < 0) return wxNOT_FOUND; // oops

    // search this page and later or before to end
    for (n = n_sel;
         forward ? n < n_pages : n >= 0;
         n = forward ? n+1 : n-1)
    {
        editor = GetEditor(n);
        if (!editor)
            continue;

        if (n != n_sel)
            pos = forward ? 0 : editor->GetLength();

        pos = editor->FindString(str, pos, -1, noteb_flags, action);

        if (pos != wxNOT_FOUND)
        {
            SetSelection(n);
            editor->UpdateCanDo(true); // make sure CanFind is updated
            return pos;
        }
    }

    // search through remaining pages
    for (n = forward ? 0 : n_pages-1;
         forward ? n < n_sel : n > n_sel;
         n = forward ? n+1 : n-1)
    {
        editor = GetEditor(n);
        if (!editor)
            continue;

        pos = forward ? 0 : editor->GetLength();

        pos = editor->FindString(str, pos, -1, noteb_flags, action);

        if (pos != wxNOT_FOUND)
        {
            SetSelection(n);
            editor->UpdateCanDo(true); // make sure CanFind is updated
            return pos;
        }
    }

    // if we haven't found the string then try to wrap around on this doc.
    editor = GetEditor(n_sel);
    if ((editor != NULL) && STE_HASBIT(flags, STE_FR_WRAPAROUND))
    {
        pos = editor->FindString(str, start_pos, -1, flags, action);
        editor->UpdateCanDo(true); // make sure CanFind is updated
        return pos;
    }

    return wxNOT_FOUND;
}

int wxSTEditorNotebook::ReplaceAllStrings(const wxString &findString,
                                          const wxString &replaceString,
                                          int flags, int *pages_)
{
    flags &= (~STE_FR_WRAPAROUND); // switch to new page

    if (findString.IsEmpty() || (findString == replaceString))
    {
        if (pages_) *pages_ = 0;
        return 0;
    }

    int count = 0, pages = 0;
    int n_pages = GetPageCount();
    for (int n = 0; n < n_pages; n++)
    {
        wxSTEditor *editor = GetEditor(n);
        if (editor)
        {
            int c = editor->ReplaceAllStrings(findString, replaceString, flags);
            editor->UpdateCanDo(true);
            count += c;
            if (c > 0) pages++;
        }
    }

    if (pages_) *pages_ = pages;

    return count;
}

